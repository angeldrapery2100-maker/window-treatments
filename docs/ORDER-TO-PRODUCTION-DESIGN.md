# 下单→生产 自动化设计（布帘/罗马帘/Luma 卷帘 + 窗帘配杆）

日期 2026-07-06。Eddie 的需求原话整理 + 技术设计。执行状态见文末。

## Eddie 想要的效果（理顺版）

1. **生产工单自动化**：客户支付成功后，布窗帘、手工罗马帘、Luma 卷帘的订单**自动生成生产工单**，格式参考 AAPP 内部工单——不只是罗列客户选的尺寸/选项，而是带**生产参数**（车间拿到就能开工）：
   - 布帘：成品宽高、片数（对开/单开）、褶型与褶数、褶距、每片幅数、裁剪长度、面料用料（码）、衬布类型与用料、蛇形帘的 carrier/纽扣数与绑带长度、banding 规格
   - 罗马帘：成品宽高（含外挂加量）、款式、幅数 N、每幅裁长、面料/衬布用料、帷幔尺寸、控制方式（cordless/电机型号）
   - Luma 卷帘：成品宽高、面料色号、帘头盒类型与长度（米）、控制方式/链条侧、电机及配件清单
2. **布帘商品页参考 AAPP 报价逻辑，可以选配 hardware**：客户配置窗帘时可勾选"加配套杆/轨"，杆长自动 = 成品宽度，价格并入（AAPP 引擎本就支持捆绑五金）。下单后工单上**窗帘和杆是绑定关系**——车间做杆的时候知道它配哪副窗帘（宽度、打褶方式决定环数/carrier）。
3. 整个链路自动：辅助下单 → 支付 → 自动工单（车间邮箱直达 + 后台可打印）→ 订单自动进入"生产中" → 一键买面单发货 → 物流自动追踪妥投 → 邀评。人工只剩"生产"和"点买面单"。

## 技术设计

### A. 生产参数从哪来 —— 引擎 breakdown（关键决策）
`packages/shared/src/pricing/aapp/` 的三个引擎算价时已产出全部生产中间值
（drapery: np/spacing/wps/PA/cutDrop/faceYds/liningYds/laborWps、ripple 的 N 和
perSide；roman: N/cutPerPanelIn/fabricYds/liningYds/valFeet；luma: sqm/bSqm/
widthMeters/各金额）。**订单创建时服务端对每个 aapp_engine 条目重跑
`calculateAapp` 并把 breakdown 快照进工单**——工单即生产单，与报价永远一致。

### B. 数据与流程
- `work_orders` 表加列：`items_snapshot jsonb`（条目 + 选项 + breakdown + 配杆关系）、`auto_generated boolean`。
- `lib/workOrders.ts`（新）：`buildWorkOrderSnapshot(items)`（重跑引擎、组装生产参数，非 aapp 条目降级为基础规格单）+ `autoCreateWorkOrder(orderId, items)`。
- `lib/createOrder.ts` 订单 INSERT 成功后（非 swatch-only 单）：建工单 → 状态 pending→in_production（order_history 记 by 'system'）→ 发三封邮件（客户确认已有、商家通知已有、**新增车间工单邮件** `WORKSHOP_EMAIL` env，默认同 admin）。任何失败 catch 住只告警，绝不影响订单。
- 工单打印页 `admin/orders/work-order/[id]` 改为优先渲染 items_snapshot 的生产参数区块（按品类分组，AAPP 工单版式：一窗一块，尺寸大字，参数表格）。
- swatch 条目不进工单；swatch-only 单跳过整个流程（留 pending 直接发货）。

### C. 布帘配杆（bundled hardware）
- 商品页（DraperyProduct）：加"Add matching rod/track"开关 → 显示杆型选择（来自商品 options 里 name=hardware_profile 的选项，值挂 hw_base_price/hw_add_per_foot/hw_min_width_in 数值参数，装饰头选项可选）→ 长度自动=成品宽，不让客户输入。
- 报价：adapter 的 drapery 分支把 hardware 映射进 `priceHandcraftedDrapery` 的
  `input.hardware`（引擎已支持，勿重写公式）。总价 = 窗帘+杆 一个条目。
- 购物车/订单条目 options 里保留 hardware_* 选择（displayLabel 'Rod/Track'），
  工单 breakdown 含 hardware 小节（billedFeet/杆型/finial），版式上printed as
  "PAIRED — 与本窗帘同做" 子块。
- 服务端两条核价路径复用同一 adapter（自动一致）。

### D. 验收
1. vitest：drapery+hardware 组合价 = 引擎手算（新增 adapter 测试）。
2. 测试卡下单 1 布帘(配杆)+1 罗马帘+1 卷帘 → 不碰后台：订单状态 in_production、
   work_orders 有快照、车间邮件含三块生产参数、打印页正确渲染。
3. swatch-only 单：无工单、状态 pending。

## 执行状态
- [x] 设计定稿（本文档）
- [ ] A/B/C 实现（进行中，见 git log）
- [ ] 上货时商品需按 wiring 文档配 aapp_engine，工单参数才有生产数据
