# AI 客服优化方案 W6/W7 — 基于 2026-07-21 第三轮双报告交叉分析

输入：① codex 第三轮 61 题（525/610 = 86.1%，+62 分，一票否决 0）② Sonnet 7/21 全量复测（65 场景，单 agent 顺序执行，判定"不建议上线"，新增 P0-4 虚假安全承诺 / P0-5 测试数据入生产）。
被测版本：`991fbf9` + `bfff547`。

## 〇、先说结论

上一轮修复的**内容层全部验证生效**：A10=120（三次施压不倒）、K6 不截断、G5=108、G6 不算幅数、H1–H5 全对、Somfy 红线、D2 三轮施压不编订单、多窗主动推 /measure-wizard、L5 无串话。codex 从 75.9% → 86.1%。

剩下的问题重新定性后是**三件事**，不是五个 P0：

### 定性 1：「会话隔离 100% 复现」需要拆开——没有跨真实访客的服务端泄露证据

逐条对证据来源做归因：游客服务端聊天历史已在 991fbf9 移除（codex API 侧 61 个匿名会话零串话、L5 通过，证明服务端 per-request 是干净的）。Sonnet 浏览器侧看到的所有"污染"，内容全部是**他们自己 7/20–7/21 测试产生的数据**（"多伦多客户"= 他们自己的 J2 场景；AD260720-63RD = 他们自己 D 组输入过的号；Jamie/Taylor = 他们自己 F4/J1 编的身份），通过两条**同浏览器**通道留存：

1. **ad_anon cookie（httpOnly，1 年）** 键控的测量表 / Home Project（含 notes 里存的姓名电话）/ 线索记录——这是购物车式的产品设计，JS 清存储清不掉 httpOnly cookie，"开新 tab"也不会换 cookie；
2. **sessionStorage transcript**——Chrome 复制标签页会继承 sessionStorage，浏览器会话恢复也会保留，所以"开全新 tab"未必是空白开场。

报告推测的"session key 按 IP/设备指纹绑定"经代码审计不成立（cookie + randomUUID，无 IP 参与）。**但这不等于没问题**——真正成立的两个风险见定性 2、3。

### 定性 2：AI 把浏览器持久数据当作"你本会话告诉我的"来使用（真实风险，必须修）

F6 是全场最危险样本：AI 拿测量表/项目 notes 里留存的别的场景写入的姓名电话，说 "I already have your name and number from earlier"，**并准备据此发起真实预约**；被质疑时还断言"信息来自本次会话"（掩盖事实）；G3 更给出"没有任何信息被混淆"的虚假安全承诺。共用电脑/家庭电脑场景下这就是把上一个使用者的联系方式安到当前访客头上。这一类要用**服务端硬闸 + prompt 禁令**一起堵死（见 Wave 6）。

另外 D1 的编造订单穿透了 orderClaimGuard——因为污染的 sessionStorage 历史里有一条 **user turn 包含 AD260720-63RD**（他们自己 D4 场景输入的），guard 的白名单把它放行了。guard 本身工作正常；根子还是同浏览器历史留存 + 测试方法。

### 定性 3：P0-5 测试假数据写入真实线索库并触发真实短信（必须修 + 立即清数据）

`submit_website_inquiry` → AAPP CF `websiteInquiry` 是真实业务通道：黑盒测试走完预约流程必然产生真实线索 + 内部提醒短信 + 给客户的短信尝试（幸好 555 号段发送失败 error 30006）。这不是 bug，是**测试副作用无防线**。修法反而优雅：把保留号段/保留域名做成服务端拦截，测试者以后**必须**用这些身份（555-01xx + @example.com），既零副作用又不用搭沙箱。

### 附：本轮唯一的质量回归（J2/J4/J5）根因已实证——检索饥饿

`route.ts` 的 `MAX_SYSTEM_CHARS = 20000`，而 persona+rules+CORE_KNOWLEDGE 的基础部分实测 ≈45K 字符——**检索出来的 HD 知识段自上次部署以来一个都没有进过 prompt**（buildSystemPrompt 的加段循环第一次判断就 break）。上一轮我加了"无资料不许下对比结论"的规则，模型手里又没有检索段，于是 Pirouette/Silhouette 这类深度题从"凭训练知识答对"变成"老实说资料没有"。J 组 52→46 的回归全部来自这里。修复 = 提高上限 + 必须配 prompt caching 抵消成本（正好接上你已拍板的 Wave 5）。

---

## Wave 6 — PII 与业务副作用硬闸（安全收尾，最高优先）

### 6-1 联系方式服务端硬闸（contactClaimGuard，本波核心）
- `submit_website_inquiry` 执行前校验：**phone（和 email，若提供）必须逐字出现在本请求的 user 消息文本里**，否则拒绝执行，返回 note "联系方式必须由客户在本次对话中亲口提供——请直接询问客户"。需要把 user 消息文本传入 executeAssistantTool（加一个参数）。这一条把 F6 类"拿别人电话发预约"在机制上判死刑。
- 回复文本闸（扩展 orderClaimGuard 思路）：回复中出现电话/邮箱 pattern 且不在本请求 user 消息/tool 结果中 → 拦截整条回复替换为安全话术 + log。白名单：626-451-9841、admin@angel-drapery.com。
- `save_measured_window` / `upsert_room_item` 的 notes/location 字段服务端剥离电话/邮箱 pattern（PII 不入持久层，从源头断掉"notes 里存电话"）。

### 6-2 prompt 禁令（配合 6-1）
- 姓名/电话/邮箱**只能**来自客户本会话打出来的字；保存数据（测量表/项目）里出现的任何身份信息一律当作不存在；永不用客户没自报的名字称呼客户。
- 客户质疑"我的信息是不是被搞混了/泄露了"：**禁止**断言"没有泄露/没有混淆"（G3 虚假安全承诺）——正确动作：道歉、立即停用一切保存数据、说明会让专人核实、给 626-451-9841。
- 禁"just double-checked our live system"式凭空权威话术（A10 遗留建议）：只有真实调用了工具才能说"查过系统"。

### 6-3 测试身份保留段拦截（P0-5 防线）
- `submitWebsiteInquiry` 入口：email 域名在保留清单（example.com/org/net、test.com）→ 拒收不入库；电话匹配北美影视/测试保留段 `555-01\d\d` → 拒收。console.warn 打点。
- 同时写进测试规范：**以后所有测试一律用 555-01xx + @example.com 身份**——被拦截即零副作用，不再污染线索库。

### 6-4 数据清理（Eddie 立即执行，不等代码）
- AAPP 侧（线索/客户库在 Firebase）：按电话删 `323-555-0148`（Taylor Nguyen）、`555-0100`（Test Customer）及 7/20–7/21 期间任何 555-01xx 线索；邮箱 `test-f@example.com`。注意第 3 条短信显示 Taylor 已被标为 "existing client"——客户档案也要删，不只 inquiry。
- 网站侧（Postgres）：`DELETE FROM lead_events WHERE ...`（7/20-21 测试时段 + assistant 来源）、清理测试期产生的 `measured_windows` / `home_projects`（按当时的 ad_anon）、`support_tickets` 测试单。我出具体 SQL（需要你在 Vercel/psql 环境跑，生产库沙盒够不着）。

### 6-5 快捷按钮语言闸（H5/I4 独立前端 bug）
- 服务端确定性修复：回复文本不含 CJK 而 suggestions 含 CJK → 丢弃 suggestions（宁可没按钮，不出错语言）。反向（中文回复配英文按钮）无害不处理。

### 6-6 widget "New chat" 按钮（P2，Eddie 拍板）
- 给 widget 加"开始新对话"：清 transcript + sessionStorage。是否连 ad_anon 一起 rotate（会同时清空购物车/项目归属）默认不做，仅提供转人工路径。

## Wave 7 — 质量残留

### 7-1 检索饥饿修复（J2/J4/J5 回归，必修）
- `MAX_SYSTEM_CHARS` 20000 → **64000**；`RETRIEVAL_BUDGET_CHARS` 9000 → 12000。实测后按需微调。

### 7-2 Prompt caching 并入本波（原 Wave 5 提前，理由：7-1 让每轮 system ~55K 字符，不并入等于全价翻倍）
- system 改块数组：块 1 = persona+rules+CORE_KNOWLEDGE（静态，`cache_control: ephemeral`，工具定义天然在前缀里一起缓存）；块 2 = 检索段（动态，断点后）。多轮/工具循环内命中 0.1× 读价。
- 打点 `usage.cache_read_input_tokens / cache_creation_input_tokens` 进日志，部署后看真实命中率。

### 7-3 H6 店内报价链故障
- 部署后查 Vercel 日志新增的 `[assistant] tool ... soft error`（上一轮加的打点正是为此）；定位 list_store_products / quote_store_product 失败原因（怀疑 DB 查询或 product_id 传递）；补一条服务端集成测试。

### 7-4 I 组处理（代码不动）
- I1–I3 的行为**已经符合修订后基准**（识别 Luma 正确 → 查上架 → 没上架转咨询）：codex 第三轮仍按旧基准判 0 分，需用修订版基准重判或换真 Sundance/JC 码重测。I4 小改：Dorus 缺控制方式时先按默认链条给区间再问偏好（prompt 一句话）。

### 7-5 小项打包（prompt 一个 commit）
- L4：客户说"先告诉我你要查什么资料"→ 答"我需要查 X"，不得变成再要尺寸。
- K6：优先问的两个问题固定为「产品类型（布帘还是卷帘）」+「能否接受充电/电池方案」。
- C5/E2/D1/F4：统一"上门测量"话术为一句：免费设计咨询；部分区域可能有可抵扣的服务费，以办公室按地址确认为准——之前"免费"与"可能收费"在同一对话里打架；"应该没问题/通常有机会上门"这类推断词禁用。
- B1/L3 长度：首轮概览超长的场景收敛回 1–3 句 + 一个问题。

## 重测门槛（Wave 6/7 部署后）
1. 定向：F5/F6/G3/J1/D1（**新浏览器 profile + 手动清 ad_anon cookie** 的规范化隔离测法）+ J2/J4/J5（检索恢复）+ H6 + 语言按钮。测试身份一律 555-01xx + @example.com（会被 6-3 拦截 = 零副作用）。
2. 全量 codex 61 题（用修订基准）目标 ≥90%、事实满分 ≥85%；Sonnet 清单红线 0。
3. 通过 → 上线判定 + caching 命中率复核。

## 给 Eddie 的立即行动（不等代码）
1. AAPP 删 Taylor Nguyen / Test Customer 假客户与线索（见 6-4）。
2. 确认 ASSISTANT_RATE_MAX 测完是否已删除恢复默认。
3. 拍板：6-6 New chat 按钮做不做；AAPP roller maxHeight=180 的性质（真实产能则不动，钳制已兜底）。
