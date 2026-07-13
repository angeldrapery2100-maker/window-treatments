# AAPP 对齐报价引擎 — 产品接线指南

> 引擎代码：`packages/shared/src/pricing/aapp/`（公式规格见 `docs/aapp-pricing-spec.md`，43 个单元测试锁定与内部软件 1:1 一致）。
> 网站价格 = **纯产品价**：安装费、上门测量费、税、折扣全部排除。

## 工作原理

商品在后台的 `default_config.params` 里加 `aapp_engine` 字段即启用 AAPP 引擎；不加则完全走原有定价，**现有商品零影响**。两条链路都已接入同一个 adapter：

- 前台实时报价：`/api/store/pricing/calculate`
- 结算服务端核价：`lib/productPricing.computeServerUnitPrice`（防篡改，权威）

映射约定：**选项的 value 字符串就是 AAPP 的 key**；面料价格等数值挂在选项值的 params 上。

## 各产品配置方法

### 1. 卷帘 / 斑马帘 / 蜂巢式（Luma 系列）

```json
params: { "aapp_engine": "luma_shade", "aapp_variant": "roller_shade" }
```
`aapp_variant` 可选：`roller_shade` / `dual_roller_shade` / `zebra_shade` / `sheer_shade` / `dual_sheer_shade` / `modern_roman_shade`。

选项（option name → 允许的 value）：
- `fabric_code` → Luma 面料系列码（`ME8`、`MB2`、`DB8`…，双层用 `front_fabric_code`/`back_fabric_code`）
- `cassette` → `open_roll` / `round_fabric` / `square_fabric` / `round` / `square`
- `control` → `plastic_chain` / `stainless_chain` / `cordless` / `motorized`
- `motor` / `remote` / `hub` → 电机化时的 key（`luma_rechargeable`、`remote_2ch`…）

面料 $/sqm 表内置默认值（出厂 SHADE_CATALOG_DEFAULTS 全表）；改价用 `params.aapp_config = { "fabrics": { "roller": [{ "code": "ME8", "pricePerSqm": 65 }, …] } }`（数组整表替换）。

### 2. 手工罗马帘

```json
params: { "aapp_engine": "roman_shade" }
```
选项：
- `mount` → `inner` / `outer`（outer 自动 +5"/+6" 覆盖量）
- `style` → `flat` / `slouch` / `soft` / `front_fold` / `reverse_fold` / `hobbled`
- `lining` → `NO` / `LF` / `BO`
- `valance` → `yes` / `no`
- `control` → `manual` / `motorized`（+ `motor` 选项）

面料：`fabric` 选项的每个 value 挂数值 params：`fabric_price_per_yard`（必填）、`fabric_width_in`（默认 54）。

### 3. 手工布窗帘

```json
params: { "aapp_engine": "drapery" }
```
选项：
- `style` → 打褶 `2fold_pinch` / `2fold_tailored` / `3fold_pinch` / `3fold_tailored`
  （tailored 平尾褶与同折数 pinch 共用 fold2/fold3 褶距参数，价格相同 — 引擎 isFold3 已识别）；
  蛇形 `cn_6cm` / `cn_7cm` / `us_60` / `us_80` / `us_100` / `us_120`（cn_/us_ 前缀自动识别为 ripple）
- `operation` → `split`（对开）/ `single_left` / `single_right`
- `lining` → `NO` / `LF` / `BO`
- `composition` → `fabric_only` / `sheer_only` / `fabric_plus_sheer`（不设选项时默认 fabric_only）
- `banding` → `none` / `banding_std` / `banding_prem`

面料选项值挂 `fabric_price_per_yard`（必填）、`fabric_width_in`（默认 55；≥110 自动判横做）；纱层挂 `sheer_price_per_yard` / `sheer_width_in`。

宽高输入 = **成品尺寸**（配置器现有的 width/height 框）。

**后台编辑器（2026-07-11，2026-07-13 简化）**：管理后台「编辑产品 → 计算参数」对
drapery 类型提供 AAPP 专用编辑器（默认 ON；引擎开关卡片已移除，`aapp_engine=''`
的历史商品显示一条「切换到 AAPP 引擎」提示条）：

- 商品级默认价：`params.aapp_fabric_price_per_yard` / `aapp_fabric_width_in`；
  每色覆盖仍走面料选项值的 `fabric_price_per_yard` / `fabric_width_in`。
- 款式勾选（2fold_pinch / 3fold_pinch / cn_6cm / cn_7cm / us_60/80/100/120）
  自动同步商品的 `style` 选项；**衬布档勾选（2026-07-13 新增）**同步 `lining`
  选项的 value 集合（可只上部分档位；全不勾 = 前台无衬布选择，按 NO 计价）；
  `operation` 选项自动同步全部三个值。**编辑入口唯一在计算参数页签** ——
  选项配置页里 style/lining/operation 均为只读展示（消灭双入口）。
- **纱层与配套五金的编辑 UI 已移除（2026-07-13）**：drapery 商品只做单层、
  不带杆轨加购。引擎与结算链路仍完整支持 `aapp_composition='fabric_plus_sheer'`
  与 `params.aapp_hardware_products`（老数据不会静默改价 —— 编辑器检测到这些
  遗留参数时显示一键清除提示条）。sheer 商品的 sheer_only 迁移开关不受影响。
- **/admin/pricing-library 页面已删除（2026-07-13）**：全局定价参数卡片
  （drapery_pricing 组）唯一入口 = 计算参数页签，保存即全局生效。

**配套五金（按商品引用，2026-07-11）**：drapery 商品的
`params.aapp_hardware_products: string[]` 存商店真实 Hardware 商品的 id。
前台把它们渲染成加购卡片，选择存为选项 `hardware_product = <商品 id>`
（`'none'` = 不配）。两个定价入口（calculate 路由 & 结算核价）共用
`lib/productPricing.applyHardwareProductSelection`：读取该五金商品的
`default_config` 推导 hw_* 价格参数（优先 `aapp_hw_*`/`hw_*` params；否则映射
旧模型 rod 第一个值的 `fixed_price`/`price_per_foot` + `params.base_length` →
`hw_base_price`/`hw_add_per_foot`/`hw_min_width_in`；finial 不自动计入），
合并进 optionParams 并置 `options.hardware='yes'`，由 adapter 现有捆绑五金
路径按杆长 = 成品宽计价。引用商品无价格模型时报错（fail-closed）。

**全局定价参数（公用系统，2026-07-11）**：site-settings 组 `drapery_pricing`
（`lib/settingGroups.ts`）存所有 drapery 商品共用的衬布/手工/镶边价：

- `lining_no_price_per_yard` (0) / `lining_no_labor_per_panel` (30)
- `lining_lf_price_per_yard` (6) / `lining_lf_labor_per_panel` (36)
- `lining_bo_price_per_yard` (8) / `lining_bo_labor_per_panel` (38)
- `sheer_labor_per_panel` (26)
- `banding_std_price_per_yard` (15) / `banding_prem_price_per_yard` (25)
- `banding_labor_per_foot` (10)
- **手工费倍数因子（2026-07-13，AAPP v782 报价同步）**：
  `height_surcharge_start_height_in` (120) /
  `height_surcharge_base_multiplier` (1.5) /
  `height_surcharge_increment_per_12in` (0.1) /
  `large_panel_threshold_panels` (5) / `large_panel_multiplier` (1.5)
  — 成品高超过起算高度、或单侧计费幅数达到起算幅数时，**只把手工费**
  乘上对应倍数（主布层与纱层都生效；面料/衬布不乘）。与 AAPP 报价引擎
  （v782 起）及工厂制作单 buildLabor 同一公式，对应 AAPP
  `library.draperyPricingCatalog.main.heightSurcharge / largePanelSurcharge`。

括号内为默认值 = AAPP 出厂值（constants.ts DRAPERY_DEFAULTS），未设置时
定价与从前完全一致。`lib/productPricing.getGlobalDraperyConfig()`（60 秒
内存缓存）把它们组装成 DeepPartial\<DraperyConfig\>；两个定价入口
（calculate 路由 & 结算核价 runAappForItem）共用
`withGlobalDraperyConfig()` 做深合并，**优先级：引擎出厂默认 < 全局
drapery_pricing 设置 < 商品级 params.aapp_config（商品级最优先）**。
后台编辑入口：编辑任意 drapery 商品 → 计算参数 → 衬布卡片 →「编辑全局
参数」。与 AAPP 内部软件的 library.draperyPricingCatalog 对应 —
两边改价需同步。（历史注：2026-07-13 前这里写的是「不提供高度加价系数」，
因为当时 AAPP 报价代码未使用 heightSurcharge——AAPP v782 已把倍数接进
报价引擎，网站同步实现。）

### 4. 窗帘杆 / 轨道

```json
params: { "aapp_engine": "drapery_hardware" }
```
杆型选项（如 `rod`）的每个 value 挂数值 params：
- 新模型：`hw_base_price`（起步价）、`hw_add_per_foot`（超出每尺）、`hw_min_width_in`（起步宽度，默认 48"）
- 或旧模型：`hw_price_per_foot`（纯每尺）

装饰头选项值挂 `finial_price`（或分左右 `finial_price_left`/`finial_price_right`）。
计费规则：`ceil((长度−0.1)/12)` 英尺，最低 1 尺。宽度输入框 = 杆长。

### 5. SOMFY 电动轨道

```json
params: { "aapp_engine": "somfy_track" }
```
选项：`track_type` → `pinch_pleat`/`ripplefold`；`open_type` → `split`/`side`；`fullness` → `80`/`100`/`120`；`motor` → `glydea35`/`glydea60`/`irismo45`/`irismo35`；`double_layer` → `yes`/`no`。
零售价表与 0.29×2.2 系数内置（与内部软件一致）；改电机售价用 `aapp_config.motors`。

## 与 AAPP 侧保持同步（重要）

AAPP 的 CLAUDE.md 已有规则：前端改价必须同步 functions/index.js。现在网站是第三份拷贝——**AAPP 里任何 `_price*` 公式或价格表变更，必须同步更新 `packages/shared/src/pricing/aapp/` 并跑 `npx vitest run`**。10 个对标用例（spec §7）就是安全网：AAPP 改了公式而网站没同步时，手算期望值会失配。

## 迁移步骤（每个商品）

1. 后台商品编辑 → params 加 `aapp_engine`（+ 上述选项结构）。
2. 商品页试算 2-3 组尺寸，与 AAPP 里同参数报价核对一致。
3. 试下一单（测试模式），确认结算核价不报错、金额一致。
