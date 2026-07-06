# 设计文档:购物车跨设备同步 + AI 售后/改单通道

写给:Opus(在新对话框实现)· 设计者:Claude(本对话)· 日期:2026-07-05
状态:**纯设计,未写任何实现代码**。里面有几处需要 Eddie 先拍板的产品决策,标了 🔶,建议 Opus 开工前先确认。

---

## 0. 现状盘点(这份设计建立在这些已有基础设施上,不是从零开始)

- `orders` 表已有 `user_id uuid`(登录下单会写入)、`payment_intent_id`、`created_at`、`shipping_address jsonb`、`customer_email`。
- 登录态:cookie `auth_token`(JWT),`lib/auth.ts` 有 `getUserFromRequest(request)`(普通用户)和 `requireAdmin(request)`(管理员)两套。
- **售后工单系统已经存在**,不用重建:`support_tickets` 表(`lib/supportTickets.ts`)+ 客户提交接口 `POST /api/store/support`(订单号+邮箱验证身份,防滥用限流)+ 管理端 `GET/PATCH /api/admin/support`(队列、状态机 open/in_progress/resolved/closed、回复邮件客户)。**这次设计是在这个系统上做扩展,不是平行造一个新的。**
- 管理端退款:`/admin/orders/[id]` 已支持部分退款(Stripe)。取消订单的自动退款应该复用这条已有逻辑,不新造一套。
- AI 客服现状:`/api/store/assistant` 是**无状态单轮转发**——每轮把完整对话历史转给 Anthropic Messages API,拿一段纯文本回复,**没有 tool use,不能查数据库,不能写任何东西**。这是本次要动的最大结构性改动。

---

## 一、购物车跨设备同步(登录用户)

### 1.1 数据模型(新表)

```sql
CREATE TABLE IF NOT EXISTS carts (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]',        -- 直接存 CartItem[]（结构复用 lib/cart.ts 的 CartItem）
  discount_code varchar(64) DEFAULT NULL,
  discount_type varchar(16) DEFAULT NULL,
  discount_value numeric(10,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
```

一个用户一行,`items` 直接存现有 `CartItem[]` 的 JSON(不用另建 cart_items 明细表——购物车这种量级用 jsonb 整存整取足够,和 `orders.items` 现有做法一致)。

### 1.2 API

- `GET /api/store/cart`(需登录):返回该用户的服务端购物车。没有行 → 返回空购物车。
- `PUT /api/store/cart`(需登录):整份覆盖式保存(body = 完整 Cart),`ON CONFLICT (user_id) DO UPDATE`。
- 不需要 DELETE 单独接口——清空购物车就是 PUT 一个空的。

### 1.3 客户端集成点(这是这个功能真正的难点,不在建表)

现在 `lib/cart.ts` 所有函数(`getCart/saveCart/addToCart/...`)都是同步的、纯 `localStorage` 读写。改造原则:**localStorage 继续作为即时本地缓存(手感不能变慢),服务端作为登录用户的"真相来源",登录时刻做一次合并。**

**具体时序:**

1. **登录成功那一刻**(登录表单提交成功的回调里):
   - 调 `GET /api/store/cart` 拿到服务端购物车 `serverCart`
   - 读本地 `localStorage` 里当前的 `localCart`
   - 合并策略 🔶(需要 Eddie 或 Opus 定一个,建议:**取并集,按 productId+options 去重,数量取较大值**;样品行 `isSwatch` 单独处理,别把两边的样品加起来超过 10 片上限——合并后如果样品超限,截断到 10 并提示)
   - 合并结果写回 `localStorage`(保证界面立即一致)**并** `PUT /api/store/cart`(保证服务端也更新)
2. **登录状态下,此后每次 `addToCart/updateCartItemQuantity/removeCartItem/applyDiscount` 等写操作**:除了照旧写 `localStorage`,**再额外异步 `PUT /api/store/cart`**(fire-and-forget,失败了不阻塞 UI,下次操作或下次登录再补)。
3. **未登录状态**:完全维持现状,只写 localStorage,不碰服务端表。
4. **换浏览器/设备,已登录**:打开购物车页面时,如果 `localStorage` 是空的(新设备/新浏览器必然是空的)、但用户已登录,就去 `GET /api/store/cart` 拿服务端数据填充本地——这就是"换浏览器还能看到购物车"的关键路径。
5. **退出登录** 🔶:localStorage 购物车要不要清空?建议**不清空**(避免"刚登出结果购物车东西没了"的糟糕体验,当作访客购物车继续存在),但这是产品决策,Opus 实现前请 Eddie 确认。

### 1.4 需要改的文件(供 Opus 参考,不是最终清单)

- 新增:`apps/web/src/app/api/store/cart/route.ts`(GET/PUT,复用 `getUserFromRequest`)
- 改:`apps/web/src/lib/cart.ts`(加异步同步逻辑,注意别把这些同步函数原本"同步"的调用方式搞坏——可以加一批 `...AndSync` 包装函数,或者用一个模块级的 debounce 队列去做服务端写入,避免每次点击"+1"都发一次请求)
- 改:结账页/购物车页登录相关逻辑,补登录成功后的合并调用
- 数据库迁移:新增 `carts` 表(参考 `ensureOrdersTable`/`ensureSupportTable` 的 `CREATE TABLE IF NOT EXISTS` 模式,项目里没有独立的 migration 工具,都是懒加载建表)

---

## 二、AI 售后 / 订单变更 / 取消通道

### 2.1 身份识别设计

**已登录客户:**
- 助手对话开始时(或客户第一次提到"我的订单"),后端用 `getUserFromRequest` 拿到 `user_id`,查 `SELECT order_number, status, created_at, items FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,把订单列表喂给模型(不是让模型自己猜),模型直接问"是这几个订单里的哪一个?"不需要客户手动报订单号。

**未登录客户:** 🔶 这里和你要求的"订单号+地址"验证方式,有个安全权衡要跟你说清楚:
- 现有的 `/api/store/support` 走的是**订单号 + 邮箱精确匹配**,邮箱唯一性强,误伤率低。
- 你要的是**订单号 + 地址**。地址天然比邮箱模糊("Apt 4" vs "#4"、"St" vs "Street"、大小写、多写少写空格),精确字符串匹配很容易把真客户挡在外面。
- **建议方案**:订单号 + (邮编 zip **或** 门牌号+街道名做规范化模糊匹配,比如去空格、去标点、忽略大小写后比较)。邮编+门牌号组合冲突概率已经很低,比对全地址字符串宽容,又不需要客户逐字对上收货地址的每个词。
- 如果你坚持要用完整地址匹配,也可以,但建议做"规范化后包含匹配"(比如客户输入的地址关键词都出现在 `shipping_address` 里),而不是完全相等,减少误判。
- 这条最终怎么做,建议 Opus 开工前你确认一下,因为直接影响多少真实客户会被挡在售后门外。

### 2.2 数据模型扩展(复用 `support_tickets`,不新建平行系统)

```sql
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS source varchar(16) NOT NULL DEFAULT 'web_form';
  -- 'web_form' | 'ai_assistant'
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS ticket_type varchar(20) NOT NULL DEFAULT 'after_sales';
  -- 'after_sales' | 'order_change' | 'order_cancel'
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS requested_changes jsonb DEFAULT NULL;
  -- order_change 类型时存客户想改的字段（比如 { "width": 42, "color": "natural" }）
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS window_ok boolean DEFAULT NULL;
  -- 提交时是否还在 48 小时窗口内（服务端算好存一份，后台一眼能看到，不用每次现算）
```

选择"扩展现有表"而不是新建表的理由:后台队列、邮件通知、状态机这些已经全部做好了,新建平行表等于把这些再抄一遍。

### 2.3 AI 助手架构改动(这是核心工程量)

现在 `route.ts` 是"一问一答"转发,要支持"帮我查订单""帮我提交改单/取消申请",必须升级成 **Anthropic tool use 的多轮循环**。设计三个工具,每个工具背后都是**服务端强制校验业务规则,模型只能"请求"动作,不能绕过规则**:

```
工具 1: lookup_my_orders
  入参: 无（登录态从 session 拿 user_id；未登录则要求先给 order_number + zip）
  出参: 该客户名下订单列表（订单号、状态、下单时间、是否仍在 48 小时窗口内）

工具 2: verify_guest_order
  入参: order_number, zip_or_address
  出参: 验证通过则返回该订单摘要；不通过返回明确的失败原因（不泄露"到底是订单号错还是地址错"，防止被用来枚举订单号）

工具 3: submit_service_request
  入参: order_id, ticket_type ('after_sales' | 'order_change' | 'order_cancel'),
        category（仅 after_sales 用现有 TICKET_CATEGORIES）,
        message, requested_changes（仅 order_change 用）
  服务端强制校验（模型不能绕过）:
    - order_change / order_cancel: 校验 now() - order.created_at <= 48小时，超过则拒绝并返回
      "已超过 48 小时修改窗口，已转人工处理"（同时仍然创建一条 after_sales 工单，只是标注超窗）
    - order_cancel: 🔶 是否自动触发 Stripe 退款，还是只创建工单等人工确认？
      见下面 2.4，这是本设计里最重要的一个待决策项。
    - 写入 support_tickets，source='ai_assistant'
    - 触发和现有 /api/store/support 一样的商家通知邮件
```

模型侧的行为规则（写进新的 system prompt 里）：
- 取消订单前，必须先复述"你确认要取消订单 XXX 吗？取消会退款但会扣除信用卡手续费"，拿到客户明确的"确认"之后才调用 `submit_service_request`（避免一句"帮我取消"就误触发）。
- 涉及金额的任何数字（退多少钱、扣多少手续费）模型只能引用服务端返回的数字，不能自己算——这条和现有"AI 从不自己报价"的规则是一致的原则。

### 2.4 🔶🔶 最重要的待决策项:取消订单是否自动退款？

两个选项，各有取舍，这个必须你来定，我不替你做这个决定：

- **方案 A(全自动)**：AI 确认取消后，服务端直接调用 Stripe Refund API（复用 `/admin/orders/[id]` 已有的退款逻辑），扣掉手续费后自动退款，工单标记 `resolved`。优点：客户体验最快；风险：如果 48 小时窗口判断/身份验证有 bug，钱可能退错人或不该退的时候退了，且没有人工兜底。
- **方案 B(人工确认，推荐先上这个)**：AI 收集好取消请求（已经验证身份、已经确认在 48 小时内），生成一条 `order_cancel` 工单丢进后台待办，**但不直接碰钱**，后台管理员看到后手动点"确认取消并退款"（复用现有部分退款 UI，改成走全额减手续费）。优点：钱的事有人把关；缺点：客户要等人工处理，不是即时的。

**建议**：先上方案 B，跑一段时间确认 AI 判断+身份验证足够稳定之后，再考虑要不要把"取消在窗口内的小额订单"逐步自动化。这也是"军规"里"改动保持小而聚焦"精神的自然延伸。

### 2.5 后台新区域:AI 请求待办

不新建页面路由，而是在**已有的 `/admin/support`** 基础上加一个视图切换，理由同样是复用已有的列表/筛选/状态机 UI：

- `GET /api/admin/support` 加 `source` 筛选参数（已有 `status` 筛选，加一个 `source=ai_assistant` 的组合）
- `/admin/support` 页面顶部加一个 Tab 或 Toggle:「全部」/「网站表单」/「AI 客服」
- AI 提交的工单在列表里用一个小标签区分（比如 🤖 图标 + `ticket_type` 显示为"改单申请"/"取消申请"/"售后"三种颜色）
- `order_change` / `order_cancel` 类型的工单卡片额外显示 `requested_changes` 内容和 `window_ok` 是否仍在窗口内,方便管理员一眼判断急不急
- 复用现有的商家通知邮件机制(已经有"新工单发邮件给 admin"的逻辑,`source='ai_assistant'` 的工单邮件标题加个前缀就行,比如"🤖 AI 客服提交 — 订单 XXX")

---

## 三、完整流程图

### 3.1 已登录客户 · 申请改尺寸

```
客户(已登录) → 打开 AI 客服 → "我想改一下订单的尺寸"
    ↓
助手调用 lookup_my_orders（后端用 session user_id，不用问订单号）
    ↓
后端返回该客户最近订单列表 + 是否在48小时窗口内
    ↓
助手："是这个 AD250705-XXXX 吗？现在还在可修改窗口内，你想改成多少？"
    ↓
客户给出新尺寸 → 助手复述确认 → 客户确认
    ↓
助手调用 submit_service_request(ticket_type='order_change', requested_changes={...})
    ↓
服务端校验48小时窗口 ✓ → 写入 support_tickets(source='ai_assistant') → 发邮件给管理员
    ↓
助手："已经帮你提交改单申请，我们会尽快处理并邮件通知你。"
    ↓
管理员在 /admin/support「AI 客服」Tab 看到待办 → 手动去 AAPP/后台改尺寸 → 标记 resolved → 系统发邮件通知客户
```

### 3.2 未登录客户 · 申请取消订单

```
客户(未登录) → 打开 AI 客服 → "我要取消订单"
    ↓
助手："请提供订单号和邮编（或收货地址）"
    ↓
客户提供 → 助手调用 verify_guest_order(order_number, zip)
    ↓
验证失败 → 助手："没有找到匹配的订单，请核对订单号和地址，或直接致电 626-451-9841"
验证成功 → 继续
    ↓
服务端检查 48 小时窗口：
  - 超窗 → 助手："已超过48小时修改窗口，已经帮你转人工，稍后有人联系你"
           （仍创建工单，标 window_ok=false，走人工兜底）
  - 未超窗 → 助手："确认要取消订单 XXX 吗？会全额退款，但会扣掉信用卡公司收取的手续费，
             你确认吗？"
    ↓
客户确认 → 助手调用 submit_service_request(ticket_type='order_cancel')
    ↓
【方案B：人工确认，见2.4】写入工单 → 管理员在后台点"确认取消并退款"（复用现有部分退款逻辑，
  改成全额减手续费）→ 触发 Stripe 退款 → 系统发邮件通知客户取消完成
```

### 3.3 购物车跨设备同步

```
客户在手机浏览器登录并加购物车 → addToCart() 写 localStorage(手机)
  同时异步 PUT /api/store/cart（服务端 carts 表更新）
    ↓
客户换到电脑浏览器打开网站并登录
    ↓
页面检测：已登录 + 本地 localStorage 购物车为空
    ↓
GET /api/store/cart → 拿到服务端购物车 → 写入本地 localStorage → 购物车图标显示件数
    ↓
（如果电脑这边本地也有东西，走"合并策略"而不是直接覆盖，见 1.3 第 1 步）
```

---

## 四、给 Opus 的建议实现顺序

1. **先做购物车同步**(风险低、隔离性好、不涉及金钱操作),建好 `carts` 表 + 两个 API + `cart.ts` 改造,测试:登录 A 设备加购物车 → 登录 B 设备能看到。
2. **再扩展 `support_tickets` 表结构**(加 `source/ticket_type/requested_changes/window_ok` 四个字段,纯 additive,不影响现有 web 表单工单)。
3. **改造 `/admin/support` 页面**加 Tab/筛选(这一步做完,哪怕 AI 那边还没接上,管理员至少能看到字段准备好了)。
4. **最后做 AI tool use 改造**(工程量最大、风险最高的一步,建议单独测试 `lookup_my_orders`/`verify_guest_order`/`submit_service_request` 三个工具,分别跑通,再接到真实对话流程里;取消订单的自动退款按 2.4 的方案 B 先做人工确认版)。

---

## 五、需要 Eddie 拍板的决策清单(汇总)

- 🔶 购物车合并策略:数量取较大值 vs 相加 vs 以哪端为准(建议:取较大值)
- 🔶 退出登录后本地购物车要不要清空(建议:不清空)
- 🔶 guest 验证用"邮编模糊匹配"还是"完整地址精确/包含匹配"(建议:订单号+邮编,或订单号+门牌号+邮编组合)
- 🔶🔶 **取消订单是否自动退款**(建议:先做方案 B 人工确认,跑稳了再考虑自动化)——这条最重要,直接涉及钱,务必先想清楚再让 Opus 动手。
