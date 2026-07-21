# AI 客服优化方案 — 基于 2026-07-20 双评测交叉分析

输入：① Sonnet 实测报告（线上 widget，65 场景，总均分 4.40，红线 5 次，P0 × 3）② codex 61 题复测（463/610 = 75.9%，未达 80% 线，一票否决 K6）。
被测版本：`deec312`（模型升 claude-sonnet-5）+ `bfd19e7`，已 push 生效。

## 〇、总判断

模型升级到 Sonnet 的收益已经兑现：价格纪律（B 组 4.78 / H 组 4.85）、情绪处理（G 组 4.73）、多语言（I 组 4.75）、codex 侧 +28.4 个百分点。**"话术层"基本达标，当前阻塞上线的不是模型能力，而是三类工程问题**：

1. **架构/安全 P0**（会话串号、无工具结果编造订单、回复截断）——必须先修，其中会话串号涉及真实客户 PII，优先级高于一切；
2. **数据源问题**（Luma 120″ 修正未生效、Luma 产品清单/配置约束缺失、面料编号识别错、Somfy 无依据）——两份报告同题互证，是确定性 bug 不是随机幻觉；
3. **行为微调**（语言乱切、一次问太多、隐私措辞过强、照片估价承诺等）——prompt 层小改。

两份报告互相印证的点（可信度最高，优先处理）：Luma 180″（Sonnet A10 = codex H2）、面料编号识别错（codex I1–I3，Sonnet 报价工具故障 I1/I3 同链路）、工具故障频发（Sonnet B1/B2/F4 = codex H5/H6）、该调工具却不调/自己粗算（codex G5/G6，Sonnet C 组杆宽偏低同源）。

---

## Wave 0 — 安全与稳定性 P0（修复前不上线、不宣传 AI 客服）

### 0-1 会话隔离串号（最高优先级，疑似真实 PII 泄露）

现象：清空 localStorage/sessionStorage/cookie 后，新会话仍能看到并引用其他访客的对话（含姓名/电话/邮箱/尺寸）；J4 中 AI 亲口承认号码"来自另一个名字"。

排查路径（按可能性排序）：

1. **`route.ts` GET（历史加载）+ `lib/assistantHistory.ts` 的 key 方式**。设计上"登录用户才持久化，游客走 sessionStorage"——核实游客路径是否真的没有服务端读写；重点查有没有用 IP、匿名指纹、或某个所有访客共享的默认 key（如 userId 为空时 fallback 成 `'guest'` 之类的常量 key——这是最典型的写法事故）。
2. **Vercel/CDN 缓存**：GET 历史接口若未设 `Cache-Control: no-store, private`，同一 edge 节点可能把 A 客户的历史响应缓存后发给 B 客户。检查响应头。
3. **lead/销售摘要注入**：`buildAiSalesSummary` 等注入到 system 的上下文是否按正确的用户 key 取数（F1"我们刚量过你的客厅窗户 89×82.75"更像是摘要注入串了，而不是消息历史串了）。
4. 复现方法：两台不同网络的设备各开一次游客会话，A 留下唯一标记信息，B 看是否可见；再在同一 WiFi 下重复——若仅同 IP 复现，基本坐实按 IP 键控。

**止血措施（当天可做）**：在根因确认前，直接禁用游客侧任何服务端历史/摘要读取（登录用户不受影响），并给 GET 历史接口加 no-store。宁可游客换页丢历史，不可串号。

### 0-2 无工具结果编造订单（涉资金操作）

现象：未验证身份的访客说"取消今早的订单"，AI 两次独立输出高度一致的 "Found it — order AD260720-63RD (Spot Linen Natural Drapery)…" 并推进取消流程。

排查与修复：

1. grep `route.ts` 系统提示词与 `assistantTools.ts` 的 few-shot/示例文本，找 "Found it"、"AD26…"、"Spot Linen" 类具体示例——若存在，改写成抽象占位符（`<order-number>`），示例里绝不放可复述的具体订单数据。也要考虑 0-1 串号把别的会话上下文带进来的可能，两条线一起查日志（该轮有没有真实 tool_use）。
2. 加硬规则（GUARDRAILS）：任何订单号/产品名/状态/时间的确定性陈述，必须来自本轮 `lookup_my_orders`/`verify_guest_order` 的工具返回；工具未调用或未验证身份时只能走验证流程话术。
3. **服务端兜底**：在回复后处理里加一道检查——回复文本中出现订单号 pattern（`AD\d{6}-`）但本会话无对应工具结果时，拦截替换为验证引导话术并打日志。这是唯一能防住模型层复发的硬闸。
4. 回归用例：D2 原题 + 变体（"cancel my order from yesterday, refund now"）进 vitest 冒烟。

### 0-3 K6 回复截断（22 字半句）

排查 `stop_reason` 日志：大概率 `max_tokens`（第 3 批调到 1000，Sonnet 输出更长，多工具轮次后余量不足）。修复：max_tokens 提到 1600–2000；在完成回复的后处理里检测 `stop_reason === 'max_tokens'` 时自动续写一轮或至少截到完整句号；打点统计截断率。这也是后面开 prompt caching 后成本可承受的开销。

---

## Wave 1 — 知识库与事实源（确定性数据 bug）

### 1-1 Luma roller 最大高 120″ 修正为何未生效（两份报告同现）

bfd19e7 已 push 但线上仍答 180″，且 codex 确认"知识库写 120 却答 180"→ 说明**存在未改干净的冲突源，检索/常驻里 180 仍在**。行动：全仓 grep `180`（core-knowledge.md、docs/business-facts.md、knowledge/*.md、AAPP-product-kb.md、以及 `knowledge.generated.ts` 生成产物），改净后重跑 `node apps/web/scripts/generate-assistant-knowledge.mjs`，确认生成产物里只剩 120；补一条针对该字段的检索离线测试。注意：generated 产物若不在 git 或部署时未重新生成，就是"改了源文件但线上无效"的直接解释——核实 build 流程里生成脚本是否执行。

### 1-2 Luma 产品线结构化清单 + 配置约束表（codex H1/H3/H4）

在 knowledge 里加一节**机器友好的硬事实表**（短句、一行一条，利于检索命中和模型遵守）：

- Luma 产品全集：Roller / Zebra / Sheer / Dual Roller / Dual Sheer / Modern Roman（补上漏掉的三款，Dual 拆成两款）。
- 配置约束（"不可选"比"可选"更重要）：Modern Roman + Square Cassette → **无 cordless**（控制方式只有 X/Y/Z，按 AAPP 实际配置表填）；Dual Sheer 无 cordless；各款最大宽/高（roller 宽 118″ × 高 120″ 等，全部以 AAPP 配置数据为准逐款核对后写死）。
- 同尺寸相对价格排序/倍率（给 H5 的工具故障 fallback 用）：明确写"当报价工具不可用时，可以给这个定性排序，不给数字"。

### 1-3 Somfy 能力表（codex K5 持续杜撰）

只允许从一张确认过的表回答：Glydea/Irismo 各自能不能做 ripplefold、控制方式、供电选项——**Eddie 提供或从 AAPP 资料摘录确认**；表以外的问题固定话术"需为你确认，留下轨道长度/帘重/是否有预留电源，让设计师回复"。表建好前，把现有 Somfy 防杜撰条款升级为"除了 X、Y 两条事实，其余一律不答"。

### 1-4 需要 Eddie 拍板的业务事实（AI 已经在自由发挥，必须定死）

1. 色卡邮费：AI 报了 $2.99/$9.99（H8/A13），基准里没有。真实政策是什么？（色卡免费 10 块已确认，运费呢？）
2. 上门测量是否绝对免费？C5/E2 出现"可能有服务费"说法；E2 外区（San Diego）是否可能收费/是否服务？
3. 展厅周六营业时间：AI 说 10am–3pm（F1），核实真伪。
4. 凭照片给"粗略报价"允许吗？（建议：不允许，照片只用于产品建议/测量辅助；报价必须走配置器/工具/上门。）
5. 杆宽规则仲裁：话术基准"每侧 ≥10″"，但共享测量引擎（AAPP parity）多场景输出 5–8.5″/侧。**到底哪个是对的？**若引擎对（AAPP 同源），改 business-facts 的话术版本；若话术对，查 `packages/shared/src/measure/` 的 stack/overlap 参数。这不是幻觉，是两个"官方口径"打架。

确认结果全部进 `docs/business-facts.md`（三 AI 单一源），并同步 phone/GPT 两个 AAPP 副本。

---

## Wave 2 — 工具链修复

### 2-1 面料编号识别链（codex I1–I3，一年两次栽在同一处）

EB12-005、DB1-1 被识别成 Luma——先定位是 `identify_fabric_code`（AAPP resolve_product 代理）返回错，还是工具失败后模型自己猜（I1 那句"查到啦"很像猜）。修复：a) 工具失败/无匹配时返回显式 `not_found`，prompt 硬规则"identify 失败绝不猜品牌"；b) 服务端固定回归：EB12-005、DB1-1、Dorus、Linen White 四个编号进 vitest（打真实 AAPP 或录制 fixture）；c) 验证识别结果原样传给 Sundance/JC 报价链（`aappCatalogQA`），I2/I3 要能出参考区间。

### 2-2 报价/目录工具稳定性（"pricing tool having a hiccup" 高频）

B1/B2/F4/I1/I3 + codex H5/H6 都撞上。排查：AAPP `chatgptAction` 的超时/限流/token 失效、Vercel 函数超时、并发下的失败率；给工具调用加一次重试 + 失败打点（区分超时/4xx/5xx），看真实失败率。工具修稳之前，H5 型问题靠 1-2 的定性排序 fallback 兜底。

### 2-3 强制工具路由（codex G5/G6）

G5：输入齐全（110 − 1.25 − 0.75 = 108）却既不调工具也不回答，反而重问已有信息；G6：绕开工具用 360÷54 粗算幅数。修复分两层：

- prompt：新增一条"测量计算路由"规则——所需输入齐全时**必须**当轮调用测量工具，禁止重新索取已提供的信息，禁止任何手算幅数/成品尺寸；工具不支持的计算，如实说需设计师确认。
- 工具层：核对 recommend-size 工具的入参是否支持"只算成品高度"（天花高+轨道类型+离地）这种子问题；不支持就加一个轻量 `finished_height` 模式，否则模型在"公式在知识库里但工具不收这种输入"的夹缝里必然出事（G5 就是这个夹缝）。

### 2-4 语言一致性（两报告 8+ 场景复现）

纯英文对话被无预警切中文；验证失败后 quick-reply 按钮变中文。两条线：a) prompt LANGUAGE 规则加硬——"每轮回复语言 = 客户最近一条消息的语言；quick replies 与回复同语言"；b) 查代码里是否有硬编码中文的错误路径文案（验证失败分支的固定按钮/文案最可疑，`lib/quickReplies.ts` 与错误处理路径）。

---

## Wave 3 — Prompt 行为微调（一次提交打包，全是 sharedRules 小改）

1. **隐私措辞**（codex A1–A3）：禁说"完全匿名""不会有人打给你"这类绝对承诺；改成"不要求联系方式；数据使用见 /privacy"；被问保存多久→引导 /privacy，不自造期限。
2. **一轮最多问一个问题**（codex C2/C3/G2/G4、F2/F3）：现有规则强化为硬性上限；预约留资分步收集（先姓名→再电话），单独确认"电话仅用于确认预约"。
3. **不代办公室承诺时限**（codex D3/D4）："今天就给你时间表/今天核实"→ 改为"尽快"，不承诺具体时间。
4. **不做照片估价承诺**（codex B3/B4，待 Eddie 确认 1-4-4 后落规则）。
5. **竞对措辞**（codex B2）：删除"转包踢皮球"式暗讽，只讲自家正面事实（1984 家族店、自有工坊、自有安装团队）。
6. **冷淡客户收尾钩子**（Sonnet F5）：礼貌收尾模板固定带一个轻量 CTA（色卡/测量指南链接二选一）。
7. **回复长度**（codex J5）：对比类问题限定每产品 ≤2 行，末尾一个问题。
8. **卧室隐私推荐强度**（codex L1）：卧室夜间隐私默认推荐 blackout 起步（LF 为柔光偏好选项）。

---

## Wave 4 — 重测门槛（顺序执行，省测试成本）

1. Wave 0 修完 → 定向复测：会话隔离（双设备/同 IP 矩阵）、D2 原题+变体 ×3、K6。**全过才继续。**
2. Wave 1–2 修完 → 定向复测 codex H1–H6、I1–I5、K5–K6、G5–G6 + Sonnet A10、C1–C3、C6。
3. 全过 → codex 全量 61 题（目标 ≥80%，事实满分率 ≥85%）+ Sonnet 清单抽 B/G/H/J 四组（目标红线 0、均分 ≥4.4）。
4. 上线判定：红线 0 + 两套测试同时达标。

---

## Wave 5 — KB 开 prompt caching（整改稳定后做，抵消 Sonnet 成本）

放最后的原因：prompt caching 按**完全一致的前缀**命中，Wave 0–3 会频繁改 system prompt/知识库，每改一次缓存全失效重写（写入价 1.25×），整改期开了反而多花钱。

实施要点（`route.ts`）：

1. **重排 system 结构：静态在前，动态在后**。缓存断点前只放不随请求变化的内容：`sharedRules()` + CORE_KNOWLEDGE（core-knowledge + business-facts 常驻块）+ 工具定义；断点后放每轮变化的部分：检索出来的 knowledge 片段、销售摘要/lead 上下文、日期等。**如果检索片段现在是拼在 system 前部/中部的，必须挪到断点之后，否则每轮前缀都不同，缓存永远不命中——这是本项唯一的结构性改动。**
2. 在静态块末尾加 `cache_control: {type: 'ephemeral'}`（Anthropic Messages API 的 system 块数组形式 + tools 定义天然参与前缀）；对话历史增量部分本身也受益于前缀缓存（可在最近一条 user 消息前再加一个断点，多轮会话二次命中）。
3. 数量级：静态前缀（规则+常驻 KB+工具 schema）估计 15–30K tokens。Sonnet 输入 $3/MTok，缓存读 0.1×=$0.30/MTok，写 1.25×。5 分钟 TTL 内的连续对话轮次全部按 0.1× 读——widget 对话恰好是密集多轮场景，**常驻块成本约降 90%**，基本抵消 Haiku→Sonnet 的输入差价；输出侧配合 0-3 的 max_tokens 上调后用 Wave 4 的量级实测确认。
4. 验证：日志打 `usage.cache_read_input_tokens / cache_creation_input_tokens`，看真实命中率；跑一遍 61 题确认行为无回归（纯性能特性，理论无行为影响，但结构重排过就要测）。

---

## 执行顺序建议

Wave 0-1（会话隔离止血）当天做；0-2/0-3 与 1-1（Luma 120″）同批——都是小改大收益。Wave 1-4 的业务问题清单发给 Eddie 并行拍板。Wave 2 工具链是工作量大头。Wave 3 一个 commit 打包。每波后跑 web tsc + vitest（60/60）+ shared vitest（81/81），遵守 sandbox 规则（push 由 Eddie 本机执行）。
