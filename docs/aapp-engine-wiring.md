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
- `style` → 打褶 `2fold_pinch` / `3fold_pinch`；蛇形 `cn_6cm` / `cn_7cm` / `us_60` / `us_80` / `us_100` / `us_120`（cn_/us_ 前缀自动识别为 ripple）
- `operation` → `split`（对开）/ `single_left` / `single_right`
- `lining` → `NO` / `LF` / `BO`
- `composition` → `fabric_only` / `sheer_only` / `fabric_plus_sheer`（不设选项时默认 fabric_only）
- `banding` → `none` / `banding_std` / `banding_prem`

面料选项值挂 `fabric_price_per_yard`（必填）、`fabric_width_in`（默认 55；≥110 自动判横做）；纱层挂 `sheer_price_per_yard` / `sheer_width_in`。

宽高输入 = **成品尺寸**（配置器现有的 width/height 框）。

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
