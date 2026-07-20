# C4 设计:网店订单直通 AAPP(③)

> 2026-07-20 · 阶段0 设计文档,**评审通过再写代码**。触及真实付款订单 + AAPP ERP 工单,
> 必须先把架构、数据映射、分阶段、决策点定清楚。基于两边代码 recon。

## 1. 现状(recon 结论)

**网站侧(已有,不用重建):**
- 付款成功 → Stripe webhook → `createOrderForPaymentIntent`(`lib/createOrder.ts`)写 `orders` 表(去重按 payment_intent_id)。
- 紧接着 `autoCreateWorkOrder`(`lib/workOrders.ts`)把每个非布样 item 连同 AAPP 引擎的**完整生产明细**(片数、每片宽、裁切落差、码数、罩长…)快照进 `work_orders.items_snapshot`。**网站已经有一份production-grade 的工单快照,且不含金额**(有 money-key 过滤)。
- 网店是**结账即全额付清**(无定金/尾款概念)。

**AAPP 侧:**
- 订单存 Firestore `processingOrders`,正常由 app 从**报价单**转来(app-orders.js ~4831),文档含:`clientId` / `clientName` / `items`(带 productConfig)/ `workOrders`(逐件工单build sheet)/ `totalPrice` / `poNumber` / `ownerUid`(销售)/ 定金付款铁律字段 / `quoteSnapshot`。
- 有 `websiteInquiry`(线索intake CF,secret 保护)——但**没有 websiteOrder intake**。
- 无 `source:'web'` 标记,订单卡片也没 WEB 样式。
- 网店产品变体(Luma/布帘等)本来就是 AAPP 可计价的变体(网站引擎是 AAPP 移植)。

## 2. 架构(建议)

沿用 `websiteInquiry` 的成熟模式,加一个**新的只读-写-单intake**:

```
网店付款成功 (Stripe webhook, 已有)
  → createOrderForPaymentIntent 写 orders + autoCreateWorkOrder 写 work_orders (已有)
  → [新增] pushOrderToAapp(order)  —— best-effort,失败绝不影响已付款订单
       POST  AAPP  exports.websiteOrder  (新 CF, x-ad-key = webExport secret 复用)
         → 在 processingOrders 建文档:source:'web' + WEB 卡所需最小字段
         → 幂等:按 webOrderId (= 网站订单号 AD…) 去重,重复 POST 不重复建单
```

- **鉴权复用** webExport secret(和 measurement-sheet 反向接口同一把),零新密钥。
- **幂等**:webOrderId 唯一,重试/webhook 重放不重复建单。
- **best-effort**:push 失败只记 `orders.aapp_push_status='failed'` + 可后台重推,绝不 fail 已付款订单(和 autoCreateWorkOrder 同原则)。

## 3. 数据映射(网站 order → AAPP processingOrder)

| AAPP 字段 | 来源 | 备注 / 决策 |
|---|---|---|
| `source: 'web'` | 常量 | 触发 WEB 卡黑色极简样式(app-orders.js 渲染改动) |
| `webOrderId` | 网站订单号 AD… | 幂等键 + 双向关联 |
| `clientId` | **find-or-create**(见决策 D1) | 网店客户按 email/phone 查重,没有则建 client(参考 GPT create_client 的查重) |
| `clientName` / `sidemark` | 网站订单客户名 | |
| `items` | 网站 order items → AAPP item 形状 | productConfig 已是 AAPP 变体;需字段名对齐(见决策 D2) |
| `workOrders` | **决策 D3**:推网站快照 vs AAPP 重算 | 网站已有不含金额的生产快照 |
| `totalPrice` | 网站订单总额 | |
| 付款字段 | born **全额已付**(网店付清) | 映射到 AAPP 定金/尾款铁律:标记 paid-in-full |
| `ownerUid` | **决策 D4**:归给谁 | WEB 单无销售——归公共池 / 默认账号 / 特定人 |
| `poNumber` | 决策 D5 | 是否立即分配 PO / 走现有 generatePoNumber 规则 |
| 收货地址 / 联系方式 | 网站订单 | 存进 client + order |

## 4. 取消 / 同步流(按你 2026-07-05 已定决策)

- **网站(Stripe)= 真相源**。
- 客户网店取消(48h 内,已有的售后工单流)→ 触发同步:
  - AAPP 工单**已派工**(dispatched)→ 通知负责人(短信/邮件,复用 AAPP 现有 _smsNotify)。
  - **生产中**→ 需二次确认才取消。
  - AAPP 侧取消 → 同步回网站 + 生成**人工退款待办**(退款仍走人工,不自动 Stripe 退)。
- 具体触发点:网站取消 → 调 AAPP `websiteOrder` 的 cancel 分支(带 webOrderId)。

## 5. 分阶段建设(建议——每阶段可独立上线验证)

- **Phase 1 · 订单落地成 WEB 卡(只读)**:付款 → push → AAPP 建 processingOrders(source:web + 客户 + items + 总额 + 全额已付),app-orders.js 渲染黑色 WEB 卡。**先不自动生成 AAPP 工单**,让 Eddie 在 app 里像看普通单一样看到网店单。幂等 + best-effort + 后台重推。
- **Phase 2 · 工单生成**:决定 D3(推快照 vs 重算),让 WEB 单能出 AAPP 工单build sheet 进车间。
- **Phase 3 · 取消/同步双向**:接第 4 节的取消流 + 人工退款待办。

先做 Phase 1 落地看效果,再往下。

## 6. 需要你拍板(动代码前)

- **D1 客户**:网店客户在 AAPP 建成独立 client?按 email/phone 查重合并到已有 client?还是全部挂一个"网店客户"占位?
- **D2 item 字段**:我需要逐字段核对网站 order item 和 AAPP item 的形状差异(productConfig 键名、尺寸、选项)——这步我做,但可能发现个别变体要特殊处理。
- **D3 工单**:WEB 单的 AAPP 工单 = 推网站已有的生产快照,还是让 AAPP 用同引擎重算?(两边都是 AAPP 引擎,理论一致;推快照更快、重算更"AAPP 原生")
- **D4 归属**:WEB 单归哪个 ownerUid(公共池 / 你的账号 / 新建"网店"账号)?影响提成、通知、权限。
- **D5 PO**:WEB 单是否立即分配 PO 号?走现有月度 PO 规则还是单独段?
- **D6 范围**:先只做 Phase 1(订单落地看得见)还是一次做到工单?

## 7. 安全 / 风险

- 幂等键 webOrderId,防 webhook 重放/重试重复建单。
- push 全程 best-effort,失败不影响已付款订单,后台可重推。
- AAPP 侧新 CF 只按 secret 接单、只 upsert 自己 source:web 的单,不碰 app 建的单。
- 金额/生产参数继续走"网站已算好、不含金额进工单"的既有铁律。
- AAPP 改动(新 CF `websiteOrder` + app-orders.js WEB 卡渲染)会以 diff 给你审,审过再部署。

—— 请就第 6 节 D1-D6 拍板(尤其 D6 范围、D3 工单、D4 归属),我据此开写 Phase 1。
