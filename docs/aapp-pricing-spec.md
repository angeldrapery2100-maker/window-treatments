# AAPP 定价引擎规格书（网站移植版）

> 目标：让网站开发者**不读 AAPP 源码**即可 1:1 复刻四类产品的定价。
> 依据代码版本：AAPP repo（/Volumes/SSD2T/Projects/AAPP）2026-07-05。
> 权威公式来源：`functions/index.js` 中的服务端 `_price*` 函数（与客户端逐字节校准，Phase C 校准政策）；客户端 file:line 一并给出。

---

## 0. 全局约定

### 0.1 单位
- 所有宽/高输入均为**英寸 (inch)**，允许小数（1/8" 精度）。
- 面料用量为**码 (yard)**（1 yd = 36 in）；卷帘面料按**平方米 (sqm)**；轨道按**英尺 (ft)**（1 ft = 12 in）与**米**（1 in = 0.0254 m）。

### 0.2 舍入规则（两级）
1. **中间金额** round2：`Math.round(x*100)/100`（保留 2 位）。哪些中间量做 round2 在各产品公式中逐条标注。
2. **行项目最终价** `_priceInt`：`Math.round(x)`（四舍五入到整数美元；非有限数→0）。
   - 服务端镜像：`_spPriceInt` — functions/index.js:2019。
   - 每个产品的 `subtotal` / `price` 都经过这一步。

### 0.3 纯产品价 vs 安装/上门费（网站必须排除的部分）
AAPP 中每个行项目的定价结果结构为：

```js
{ subtotal, price, installAmount, _subtotalExcludesInstall: true, ... }
```

- `subtotal`（= `price`）是**纯产品价**，`_subtotalExcludesInstall:true` 表示安装费**不含**在内（app-quotes-core.js:1658 依此聚合）。
- `installAmount` 是**每行项目的安装费**，由 `calcProductInstallAmount()`（app-quotes-catalog.js:256，服务端 `_spProductInstallAmount` functions/index.js:2024）按 `state.library.productInstallRules[variantKey]`（字段：`baseFee / widthThresholdIn / widthAddFee / widthAddPerStartedFt / widthMultiplier / heightThresholdIn / heightMultiplier`）计算。
- 报价单层面（app-quotes-core.js:173-206）：`installTotal = Σ installAmount`，`visitFee` 来自 `q.visitFeeSnapshot`（冻结值）或 `client.visitFee`（由 `library.visitFeeRules` 上门测量分区规则得出），`effectiveInstallFee = installTotal + visitFee`；之后是折扣/税/订金，全部为报价单级别概念。

> **网站移植规则**：只实现各产品的 `subtotal`（纯产品价）。以下各节公式中凡标注【安装费—排除】的项一律不进入网站价格。`visitFeeRules`、税、折扣、订金全部排除。
>
> ⚠️ 唯一例外提示：服务端 `_priceLumaShade`（functions/index.js:7913-7927）返回的 `subtotal` **包含** install（为 GPT 汇总语义），但其 `fabricAmount + hardwareAmount + controlAmount` 即纯产品价（= `productAmount`，7917 行）。客户端 `shadeCalcPrice`（app-quotes-shades.js:638）的 `subtotal` 不含 install。**网站取纯产品价 = fabric + hardware + control。**

### 0.4 数据来源两类
- **写死 in code**：如 SOMFY 轨道零售价表、缝纫间距常量、Luma 目录出厂默认值。
- **library 字段**（Firestore `library/main` + `library_pricing/main` 合并；本地 `state.library.*`）：管理员可改。规格中逐项写明字段路径。网站引擎应把这些做成可配置常量表，初始值用本文档给出的默认值。

---

## 1. 产品一：Luma 卷帘系列（roller / zebra / sheer / dual / modern roman）

**权威实现**：服务端 `_priceLumaShade` — functions/index.js:7848-7929；客户端 `shadeCalcPrice` — app-quotes-shades.js:638-774。
**variantKey**：`roller_shade`、`dual_roller_shade`、`zebra_shade`、`sheer_shade`、`dual_sheer_shade`、`modern_roman_shade`（AI_LUMA_VARIANTS，functions/index.js:7812）。

### 1.1 输入参数
| 参数 | 说明 |
|---|---|
| `widthIn`, `heightIn` | 成品宽高（英寸） |
| `fabricFullCode`（双层：`frontFabricFullCode`+`backFabricFullCode`） | 面料色号，如 `"EB12-005"`；取 `-` 前缀为**面料系列码**（family）查价 |
| `cassette` | 帘头盒 key（见 1.4） |
| `option` | 控制方式：`plastic_chain` / `stainless_chain` / `cordless` / `motorized` |
| `motorKey` 等 | 电机化时的电机/遥控/hub 选择 |

**inside/outside mount 尺寸修正**（客户端 `shadeQuoteDims` — app-quotes-shades.js:945-992）：
- 内框 (inner)：直接用窗户内框实测 `innerW × innerH`，**无任何加量**。
- 外框 (outer)：`widthIn = outerW + widthAdd`，`heightIn = outerH + heightAdd`；`widthAdd/heightAdd` 为**用户输入的覆盖加量**（`item.outerCoverage.widthAdd/heightAdd` 或编辑框 `quoteWidthAdd/quoteHeightAdd`），Luma 卷帘无固定默认加量（网站可让用户直接输入成品尺寸）。
- 上限校验：`maxWidth = 118`（`LUMA_MAX_WIDTH_IN`，app-catalog.js:575）、`maxHeight = 120`（library.shadeCatalog.variants[vk].maxWidth/maxHeight，超出→报错不可下单）。

### 1.2 完整公式（伪代码）
```
sqm  = widthIn * (heightIn + 12) / 1550          // shadeCalcSqm, app-quotes-catalog.js:7
bSqm = sqm <= 0 ? 0 : max(sqm, 1)                // 最低按 1 sqm 计费, app-quotes-catalog.js:11
widthMeters = widthIn * 0.0254                   // inchToMeter, app-quotes-catalog.js:16

// 面料（每个 slot 单独算再相加；dual 产品有 front/back 两个 slot）
family       = fabricFullCode.split('-')[0]      // "EB12-005" → "EB12"
pricePerSqm  = library.shadeCatalog.fabrics[table].find(f => f.code === family).pricePerSqm
fabricAmount = round2(bSqm * pricePerSqm)        // 每 slot round2 后相加

// 帘头盒五金（按宽度米数）
cassettePM     = variants[vk].cassettes.find(c => c.key === cfg.cassette).pricePerMeter
hardwareAmount = round2(widthMeters * cassettePM)

// 控制方式
if option == 'motorized':
    controlAmount = library.shadeMotorSystems.luma.motors[motorKey].netPrice   // 原价直加，无 markup
    // 遥控/hub/太阳能板：每件按 netPrice 直加（遥控只对"owner"窗计一次，可多窗共享）
else:
    controlAmount = library.shadeCatalog.options[option].surcharge

产品价 subtotal = _priceInt(fabricAmount(+backFabricAmount) + hardwareAmount + controlAmount)
【安装费—排除】installAmount = calcProductInstallAmount(vk, W, H, variants[vk].installFee)
```

### 1.3 常量与字段来源
| 常量 | 默认值 | 来源 |
|---|---|---|
| sqm 公式分母 1550、高度 +12" | 写死 | app-quotes-catalog.js:7（= functions/index.js:7861） |
| 最低 1 sqm | 写死 | app-quotes-catalog.js:11 |
| 面料单价 | 见 1.5 | `library.shadeCatalog.fabrics[table][].pricePerSqm`（默认表 `SHADE_CATALOG_DEFAULTS` app-catalog.js:1296-1422） |
| 帘头盒 $/m | roller: open_roll 0 / round_fabric 20 / square_fabric 28；zebra、sheer: round 16 / square 14；dual、roman: 5inch_square/square 14 | `library.shadeCatalog.variants[vk].cassettes[].pricePerMeter`（app-catalog.js:1298-1343） |
| option surcharge | plastic_chain 0 / stainless_chain 15 / cordless 50 /（motorized 500 仅遗留值，Luma 实际走电机库） | `library.shadeCatalog.options[key].surcharge`（app-catalog.js:1345-1350） |
| Luma 电机/配件 | 电机 `luma_rechargeable` netPrice 0（默认占位，**实际售价管理员在库里设**）；遥控 2ch $50 / 6ch $80 / 15ch $120；Matter Hub $150；Solar Panel $80 | `library.shadeMotorSystems.luma.{motors,remotes,hubs,accessories}[].netPrice`（默认 `SHADE_MOTOR_SYSTEMS_DEFAULTS` app-catalog.js:1745-1764） |
| installFee 基础 | roller 15 / dual_roller 20 / 其他 15 【排除】 | `library.shadeCatalog.variants[vk].installFee` |

### 1.4 slot 与面料表映射（AI_LUMA_SLOTS — functions/index.js:7816-7823）
| variant | slot → 面料表 |
|---|---|
| roller_shade | fabric → `roller` |
| zebra_shade | fabric → `zebra` |
| sheer_shade | fabric → `sheer` |
| modern_roman_shade | fabric → `roman` |
| dual_roller_shade | frontFabric → `roller`，backFabric → `roller` |
| dual_sheer_shade | frontFabric → `sheer`，backFabric → `roller` |

### 1.5 Luma 面料价格表结构与样例
结构：`library.shadeCatalog.fabrics = { roller:[], zebra:[], sheer:[], roman:[] }`，每行 `{ code, pricePerSqm }`，code 为**系列码**（不含色号）。查表规则：整码 `"MB2-103"` → 系列 `"MB2"` 精确匹配 `code`；查不到 → 报错（不能下单）。**无宽高阶梯**——Luma 是纯 $/sqm 单价表（PG 宽高价格矩阵是 Sundance 系列的机制，见 §5.2）。

样例（默认表，app-catalog.js:1352-1421）：
| table | code | pricePerSqm |
|---|---|---|
| roller | MB2 | 77.76 |
| roller | ME8 | 60.21 |
| zebra | DB8 | 139.20 |
| sheer | E8 | 123.03 |
| roman | PB3 | 120.64 |

---

## 2. 产品二：手工罗马帘（handcrafted_roman_shade）

**权威实现**：服务端 `_priceHandcraftedRoman` — functions/index.js:3549-3691；客户端 `handcraftedRomanCalcPrice` — app-quotes-roman.js:158-330；尺寸解析 `handcraftedRomanQuoteDims` — app-quotes-roman.js:99-155。
**配置目录**：`library.handcraftedRomanCatalog`，默认 `_HCR_CATALOG_DEFAULTS`（functions/index.js:3500-3520）。

### 2.1 输入参数
| 参数 | 说明 |
|---|---|
| `mount` | `inner` / `outer` |
| `widthIn`, `heightIn`（cfg 原始值） | 原始测量宽高；未填时自动取窗户 inner/outer 实测（1/8" 取整） |
| `styleKey` | flat / slouch / soft / front_fold / reverse_fold / hobbled |
| `fabric.pricePerYard`, `fabric.widthNormalizedIn`（默认 54"）, `manualPriceOverride`, `manualWidthOverride`, `hasPattern`, `patternRepeatIn` | 面料快照（从手工面料目录选取时写入 item） |
| `lining.type` | NO / LF / BO；`lining.yardsOverride` 可覆盖用量 |
| `control` | 手动或 motorized（电机系统/遥控/hub/配件 key） |
| `valance.enabled` | 帷幔 |
| `extraOptionKeys[]` | 附加选项 |

**mount 尺寸修正**（app-quotes-roman.js:132-140）：
```
outer: W = rawW + coverageWidthAddIn (默认 +5"), H = rawH + coverageHeightAddIn (默认 +6")
inner: W = rawW, H = rawH（加量为 0）
```
默认加量来源：`library.handcraftedRomanCatalog.coverage.{outer:{widthAddIn:5,heightAddIn:6}, inner:{0,0}}`（app-catalog.js:1716-1717）。用户可逐单覆盖（`cfg.coverageWidthAddIn/coverageHeightAddIn`）。

### 2.2 完整公式
```
style        = catalog.styles[styleKey]          // 找不到→第一个 (flat)
laborPerSqFt = style.laborPerSqFt                // flat/slouch/soft 12.5, front/reverse_fold 13.5, hobbled 15.0
heightMult   = style.heightMult                  // hobbled 1.5, 其余 1.0

fabricPerYard = fabric.manualPriceOverride ?? fabric.pricePerYard
fabricWidthIn = fabric.manualWidthOverride ?? fabric.widthNormalizedIn ?? 54

// 幅数（横向拼幅）：fullnessAddIn 默认 6"
N = max(1, ceil((W + fullnessAddIn) / fabricWidthIn))
// 每幅裁剪长：hemAllowanceIn 默认 20"；有图案时加一个 repeat
cutPerPanelIn = H * heightMult + hemAllowanceIn + (hasPattern ? patternRepeatIn : 0)
fabricYds     = N * cutPerPanelIn / 36
fabricAmount  = round2(fabricYds * fabricPerYard)

// 衬布：用量默认与面料相同（可 yardsOverride）；单价查 NO/LF/BO
liningPerYard = library.draperyPricingCatalog.main.liningOptions[type].liningPricePerYard  // NO 0 / LF 6 / BO 8
liningYds     = lining.yardsOverride ?? fabricYds
liningAmount  = round2(liningYds * liningPerYard)

// 手工费：成品面积 × 净工费 × laborMarkup（默认 2.0）
sqFt        = (W/12) * (H/12)
laborAmount = round2(sqFt * laborPerSqFt * laborMarkup)

// 电机化（可选）：全部按 netPrice 原价直加（Luma 模式，无 markup）
accessoryAmount = motorNet + remoteNet(仅 owner 窗计一次) + hubNet + Σ accessoryNet
                  // 均来自 library.shadeMotorSystems[motorSystemKey]

// 帷幔（可选）：按英尺计，零头 > 0.1" 进位到下一整尺；单价默认 $10/ft
valFeet       = floor(W/12) + ((W - floor(W/12)*12) > 0.1+1e-6 ? 1 : 0)
valanceAmount = round2(valFeet * catalog.valance.pricePerFoot)

// 附加选项：netPrice × optionsMarkup（默认 1.5），逐项 round2
extraAmount = Σ round2(opt.netPrice * optionsMarkup)

subtotal = _priceInt(round2(fabricAmount + liningAmount + laborAmount
                            + valanceAmount + extraAmount + accessoryAmount))
【安装费—排除】installAmount = 0（罗马帘本身无独立安装费行；上门费在报价单级 visitFee）
```

### 2.3 常量与字段来源
| 常量 | 默认值 | 字段 |
|---|---|---|
| fullnessAddIn | 6 | `library.handcraftedRomanCatalog.fullnessAddIn` |
| hemAllowanceIn | 20 | 同上 `.hemAllowanceIn` |
| laborPerSqFt / heightMult | 12.5~15 / 1.0~1.5 | 同上 `.styles[].laborPerSqFt/.heightMult` |
| laborMarkup | 2.0 | 同上 `.laborMarkup` |
| optionsMarkup | 1.5 | 同上 `.optionsMarkup` |
| coverage 外框加量 | +5"/+6" | 同上 `.coverage.outer.widthAddIn/heightAddIn` |
| 帷幔 $/ft | 10 | 同上 `.valance.pricePerFoot` |
| 衬布 $/yd | NO 0 / LF 6 / BO 8 | `library.draperyPricingCatalog.main.liningOptions[].liningPricePerYard`（跨产品共用，app-catalog.js:1637-1641） |
| 面料 $/yd、幅宽 | 逐面料 | 手工面料目录 `data/handcrafted_drapery_fabric_catalog.grouped.json`（结构见 §5.3），选中时快照到 `cfg.fabric.pricePerYard/widthNormalizedIn` |

---

## 3. 产品三：手工布窗帘（drapery / handcrafted drapery）

**权威实现**：服务端 `_priceHandcraftedDrapery` — functions/index.js:4196-4257 及子函数 3716-4192；客户端 `draperyCalcPrice` — app-quotes-drapery.js:1046-1077，主层 :888，纱层 :950，banding :993，用料 :711/:821，打褶求解器 :630。
**总价 = 主布层 + 纱层 + 捆绑五金 + banding** 四个子模块之和（启用哪个算哪个；主布与纱至少启用一个）。

### 3.1 输入参数
| 参数 | 说明 |
|---|---|
| `finalSize.finishedWidthIn / finishedHeightIn` | **成品宽/高**（英寸）。AAPP 内由推荐引擎从窗测算（见 3.2），用户可改；网站可直接让用户输入成品尺寸 |
| `composition` | fabric_only / sheer_only / fabric_plus_sheer |
| `styleFamily` | `pleated`（打褶）或 `ripple`（蛇形帘/ripplefold） |
| `styleKey` | pleated: `2fold_pinch` / `3fold_pinch`（含 tailored 变体）；ripple: `cn_6cm` / `cn_7cm` / `us_60` / `us_80` / `us_100` / `us_120` |
| `operation` | `split`（对开，2 片）/ `single_left` / `single_right`（单开，1 片）→ **panel 数决定规则**：`sides = split?2:1`，`panelW = split? W/2 : W` |
| `layers.main` | 主布层：`enabled, pricePerYard, widthNormalizedIn, manualPriceOverride, manualWidthOverride, hasPattern, patternRepeatIn, orientationMode(auto/railroaded/vertical), liningType(NO/LF/BO)` |
| `layers.sheer` | 纱层：同上（无 lining） |
| `hardware` | 捆绑五金（§4.1 的 drapery_hardware，长度自动 = finishedWidthIn） |
| `banding` | 镶边：`enabled, countPerPanel(1或2), styleKey/styleName, pricePerYardOverride` |
| `returnIn` | ripple 回墙深度（加进轨长） |

### 3.2 成品尺寸推荐（AAPP 内部逻辑，网站可选实现）
`draperyRecommendSize` — app-quotes-drapery.js:400-505。要点：宽度 = 窗宽 + 两侧堆叠量（打褶迭代求解、ripple 按载具节距），受墙面可用宽限制；高度按杆型：`motorized_ceiling_track: 天花高−1.25−离地间隙(默认0.5)`、`ceiling_track: −0.8`、墙装杆：`−4.0`（墙高未录且窗顶距天花 20~40" 时再 + 窗顶距/2），再减五金 `maxCurtainHeightOffsetIn`。宽取整英寸、高取 1/4"。**定价只吃 finalSize，推荐引擎与价格无耦合**。

### 3.3 主布层公式（`_dpcCalcFabricMath` functions/index.js:3888-3969 = 客户端 draperyWOCalcFabric :711）

**常量（`_DPC_DC`，functions/index.js:3716-3721；library 可覆盖：`library.draperyFormulaSettings.spacingFirst.{fabric|sheer}.{fold2|fold3}` 与 `.hemAllowanceIn`、`.rippleSystems`）**：
```
褶距 spacing:  min 4.0", target 4.375", max 4.75"
褶量 PA:      fold2 ∈ [5.0, 7.0]"   fold3 ∈ [6.25, 9.0]"
固定余量 fixed = 13"（写死）
下摆余量 hem  = 16" → cutDrop = H + 16
ripple 参数:  cn_6cm{pulley:2.3622, button:4.9213} cn_7cm{2.76, 5.7087}
              us_60{2.625,4.25} us_80{2.375,4.25} us_100{2.125,4.25} us_120{1.875,4.25}
              c = 3.0, baseAdd = 7（写死默认）
半码进位 ceilHalfYd(y) = ceil(y*2)/2
```

**方向判定（railroaded 横做 vs vertical 竖拼）**（functions/index.js:3834-3840）：
```
fw = 面料幅宽（manualWidthOverride ?? widthNormalizedIn ?? 55）
mode=railroaded: fw>=110 且 H<=fw-8  → 横做, 否则竖拼
mode=vertical:   竖拼
mode=auto:       fw>=110 且 H<=fw-16 → 横做, 否则竖拼
```

**A. 打褶 pleated —— spacing-first 求解器**（functions/index.js:3856-3879）：
```
step   = fw>=110 ? 0.25 : 0.5           // 幅数步进
npBase = max(1, round(panelW / 4.375))
候选 np 顺序: npBase, npBase-1, npBase+1, npBase-2, npBase+2, ... (±5)
对每个 np:
  spacing = panelW/(np+1); 需 ∈ [4.0, 4.75]
  psMin = panelW + np*PAmin + 13
  wps   = max(step, ceil(psMin / fw / step) * step)   // 每片幅数
  ps    = wps * fw                                     // 每片布料总宽
  PA    = (ps - panelW - 13) / np; 需 ∈ [PAmin, PAmax]
  命中即返回 {np, wps, PA, ps}
无解 → 报错 no_spacing_solution
竖拼: perSide = ps
横做: perSide = panelW + np*PA_mid + 13, PA_mid=(PAmin+PAmax)/2
```

**B. 蛇形 ripple**：
```
N   = ceilToEven((panelW - 3.0) / pulley)     // 向上取偶数
spl = round2(N * button + 7 + returnIn)
perSide = spl
竖拼: wps = ceil(spl / fw / step) * step
```

**C. 面料/衬布/手工费用量**：
```
竖拼 faceYds = ceilHalfYd((wps * cutDrop / 36) * sides)
横做 faceYds = ceilHalfYd((perSide / 36) * sides)

有衬布(LF/BO)时（衬布恒竖拼、固定 55" 幅宽、0.5 步进）:
  liningWps = ceil(perSide / 55 / 0.5) * 0.5
  liningYds = ceilHalfYd((liningWps * cutDrop / 36) * sides)

手工计费幅数 laborWps:
  有衬布:  laborWps = liningWps * sides
  无衬布:  laborWps = ceil(perSide / 50 / 0.5) * 0.5 * sides   // 按 50"/幅折算
```

**D. 主层金额**（functions/index.js:4060-4075）：
```
fabricAmt = faceYds   * pricePerYard          // 无 round2，原始浮点
liningAmt = liningYds * liningPricePerYard    // NO 0 / LF 6 / BO 8
laborAmt  = laborWps  * laborPerPanel         // 按 lining 档: NO $30 / LF $36 / BO $38 每幅
mainTotal = fabricAmt + liningAmt + laborAmt
```
> 注：`library.draperyPricingCatalog.main.heightSurcharge / largePanelSurcharge` 字段存在于默认目录（app-catalog.js:1642-1650）但**当前定价代码未启用**，网站不要实现。

### 3.4 纱层公式（`_dpcCalcSheerMath` functions/index.js:3972-4027）
与主布层同一求解器（pleated 用 `spacingFirst.sheer` 参数组，默认与 fabric 相同；ripple 同公式），无衬布；
```
sheerFabricAmt = yds * pricePerYard
sheerLaborWps  = ceil(perSide / 50 / 0.5) * 0.5 * sides
sheerLaborAmt  = sheerLaborWps * sheerLaborPerPanel      // 默认 $26/幅, library.draperyPricingCatalog.sheer.laborPerPanel
sheerTotal     = sheerFabricAmt + sheerLaborAmt
```
高级模式（`advancedMode && composition=='fabric_plus_sheer'`）允许主层单独指定 style/尺寸（functions/index.js:4039-4050）。

### 3.5 Banding 镶边（functions/index.js:4118-4168 = 客户端 :993）
```
panelCount     = op=='split' ? 2 : 1
totalCount     = countPerPanel(1|2) * panelCount
lengthPerPiece = finishedHeightIn + 6            // 每条竖贯全高 +6" 余量
yardage        = lengthPerPiece * totalCount / 36
pricePerYard   = library.draperyPricingCatalog.banding.styles[styleKey].pricePerYard
                 （默认 banding_std $15 / banding_prem $25；pricePerYardOverride>0 时覆盖）
laborPerFoot   = library.draperyPricingCatalog.banding.laborPerFoot（默认 $10/ft）
fabricAmt = yardage * pricePerYard
laborAmt  = (finishedHeightIn / 12) * laborPerFoot * totalCount
bandingTotal = fabricAmt + laborAmt
```

### 3.6 捆绑五金
`hardware.enabled` 时以 `lengthIn = finishedWidthIn` 调 §4.1 的 drapery_hardware 定价（functions/index.js:4172-4192）。其 `subtotal` 计入窗帘总价；其 `installAmount`【排除】。

### 3.7 汇总
```
subtotal = _priceInt(mainTotal + sheerTotal + hardware.subtotal + bandingTotal)
【安装费—排除】installAmount = hardware.installAmount（仅捆绑五金产生）
```
面料单价来源：手工面料目录（§5.3）选中后快照到 `layers.*.pricePerYard`；手输面料用 `manualPriceOverride/manualWidthOverride`。

---

## 4. 产品四：轨道 / 窗帘杆五金（drapery_hardware + SOMFY 电动轨道）

### 4.1 普通杆/轨（variant `drapery_hardware`）
**权威实现**：服务端 `_priceDraperyHardware` — functions/index.js:3190-3275；客户端 `draperyHardwareCalcPrice` — app-quotes-catalog.js:1107。目录：`library.draperyHardwareCatalog`（默认骨架 app-catalog.js:1532-1596；**默认价格全为 0，实际单价由管理员在库中维护** —— 网站需同步该库的 `subtypes` 数据）。

**输入**：`profileKey`（杆/轨型号，如 `metal_rod_single_1_3_8_wall`）、`lengthIn`（杆长，一维产品，无高度）、`colorKey`、`leftFinialKey/rightFinialKey`（装饰头）、`accessorySelections[{key,count}]`。

**公式**：
```
// 计费英尺：至少 1 ft；0.1" 容差防浮点
billedFeet = ceil(max(lengthIn - 0.1, 0) / 12)        // functions/index.js:3184-3188

sub = catalog.subtypes[profileKey]
if sub.basePriceAtMinWidth>0 或 sub.addPricePerFoot>0:   // 新价格模型（起步价+超长每尺）
    minFt   = sub.minBillableWidthIn/12（默认 4 ft）
    baseAmt = sub.basePriceAtMinWidth + max(0, billedFeet - minFt) * sub.addPricePerFoot
else:                                                    // 旧模型（纯每尺）
    baseAmt = billedFeet * profile.pricePerFoot

finialAmt    = 左finial.price + 右finial.price           // catalog finials[].price（默认 0）
accessoryAmt = Σ accessory.price * count
subtotal = _priceInt(baseAmt + finialAmt + accessoryAmt)

【安装费—排除】installAmount = round2(sub.installMinFee
                 + max(0, (lengthIn - sub.installOverWidthIn(默认120")))/12 * sub.installPerFoot)
                 // 仅当 requiresInstallation != false
```
字段名：`library.draperyHardwareCatalog.subtypes[profileKey].{basePriceAtMinWidth, addPricePerFoot, minBillableWidthIn, pricePerFoot(旧), installMinFee, installOverWidthIn, installPerFoot, requiresInstallation}`；装饰头 `products[familyKey].finials[].price` 或全局 `finials[].price`。

### 4.2 SOMFY 电动轨道（variant `somfy_motorized_track`）
**权威实现**：服务端 `_priceSomfyMotorizedTrack` — functions/index.js:3006-3061；零售价表 `_SOMFY_PINCH_PLEAT` :2869-2887、`_SOMFY_RIPPLEFOLD` :2889-2923、配件净价 `_SOMFY_ACCESSORIES_NET` :2925-2948（客户端 `somfyCalcPrice` app-catalog.js:894，表 :954-1037，**写死 in code**）。

**输入**：`trackType`（`pinch_pleat` / `ripplefold`）、`widthIn`（轨长）、`openType`（`split` 对开 / `side` 单侧）、`fullness`（ripplefold 用：`'80'|'100'|'120'`）、`motorId`、`doubleLayer`（双层轨 ×2）、`accessories[{id,qty}]`。一维产品（高度不参与）。

**公式**：
```
// 1) 查零售价：取第一行 w >= widthIn（超出最大 432" 用最后一行）
pinch_pleat: retail = row[openType=='side' ? 'side' : 'split']
ripplefold:  retail = row[(openType=='side'?'o':'s') + fullness]   // 如 s100 / o120

// 2) 轨道售价：零售 × trackFactor × trackMarkup
trackSell = round2(retail * 0.29 * 2.2)
    // library.somfyTrack.trackFactor(默认0.29), .trackMarkup(默认2.2)

// 3) 电机售价（已是卖价，不再乘系数）
motorSell = library.somfyTrack.motors[motorId].sellPrice
    // 默认: glydea35 $1640 / glydea60 $1920 / irismo45 $1670 / irismo35 $1640

unitPrice       = motorSell + trackSell
trackMotorTotal = doubleLayer ? unitPrice*2 : unitPrice

// 4) 配件：净价 × accessoryMarkup(默认1.5)
sellEach = round2(net * 1.5);  lineAmt = round2(sellEach * qty);  accTotal = Σ lineAmt

subtotal = round2(trackMotorTotal + accTotal)     // 注意：此产品保留 2 位小数，不做 _priceInt 取整
installAmount = 0                                  // SOMFY 轨道无独立安装费行
```

**零售价表样例**（写死；宽度阶梯 48→432" 步进 12"）：
| w(≤) | pinch split | pinch side | ripple s100 | ripple o120 |
|---|---|---|---|---|
| 48 | 604 | 564 | 688 | 676 |
| 108 | 896 | 852 | 1088 | 1100 |
| 156 | 1188 | 1148 | 1472 | 1504 |
| 240 | 1744 | 1704 | 2176 | 2256 |
| 432 | 2688 | 2652 | 3476 | 3640 |

**配件净价样例**（×1.5 = 售价）：situo1_rts $56 / situo5_rts $73 / smoove1_rts $75 / tahoma_hub $185 / charger_45 $283。

---

## 5. 价格表结构汇总

### 5.1 Luma 面料表 —— 见 §1.5（纯 $/sqm，无宽高阶梯）。

### 5.2 Sundance PG 宽高价格矩阵（参考：卷帘同类产品的查表机制）
文件 `data/sundance_pricing_tables.js`（library 覆盖字段 `library.sundancePricingCatalog`）：
```
roller: {
  widthHeaders:  [24,30,36,42,48,54,60,66,72,78,84,90,96,102,108,114,118],   // 17 列
  heightHeaders: [36,42,48,54,60,66,72,78,84,90,96,102,108,114,120],          // 15 行
  baseTables: { PG1: 15×17 矩阵, PG2: ..., ..., PG10: ... }
}
factors: { roller: 0.18, horizontal: 0.13, vertical: 0.21, cellular: 0.16 }
```
**查表规则**（`_spLookupMatrix` functions/index.js:1993-2008）：列 = 第一个 `widthIn <= widthHeaders[i]` 的 i；行 = 第一个 `heightIn <= heightHeaders[j]` 的 j；`retail = matrix[行][列]`；**任一维超表 → 返回 null → 报错"Size out of range"（不可外推）**。
最终价 = `round(retail × factors.roller × 2 + 净价选项×1.5 + 电机配件净价)`（`_priceSundanceRoller` functions/index.js:2090-2192）。
样例（PG1）：W≤24,H≤36 → $220；W≤60,H≤72 → $474；W≤118,H≤120 → $1284。

### 5.3 手工面料目录（drapery/roman 共用）
文件 `data/handcrafted_drapery_fabric_catalog.grouped.json`（4.7MB，懒加载；2579 个面料）：
```json
{ "fabrics": [ {
    "fabric_id": "kaslen::acclaim", "brand": "Kaslen", "fabric_name": "Acclaim",
    "default_price_per_yard": null, "default_width_in": 57.0,
    "colors": [ { "color_code": "linen", "color_name": "Linen",
                  "price_per_yard": null, "width_normalized_in": 57.0 } ]
} ] }
```
选中色号时把 `price_per_yard`（无则 `default_price_per_yard`）与 `width_normalized_in` 快照进 `cfg.fabric/layers.*` 的 `pricePerYard/widthNormalizedIn`。`missing_price` 的面料必须人工填 `manualPriceOverride` 才能出价。

---

## 6. 网站定价必须排除的组件（清单）

| 组件 | 出现位置 / 字段 | 处理 |
|---|---|---|
| 上门测量费 visitFee | 报价单级：`q.visitFeeSnapshot` / `client.visitFee`，规则 `library.visitFeeRules[]`（分区/距离/最低价），聚合于 app-quotes-core.js:173-206 | **排除** |
| 每行安装费 installAmount | Luma/Sundance：`calcProductInstallAmount` + `library.productInstallRules[vk]`（installRules 服务端同义）；drapery hardware：`sub.installMinFee/installPerFoot/installOverWidthIn`；Cambridge：同前 | **排除**（AAPP 中它本来就在 subtotal 之外，`_subtotalExcludesInstall:true`） |
| 税 tax / 免税 | `computeQuoteTotals`（app-quotes-core.js:2032+）报价单级 | 排除（网站结算另行处理） |
| 折扣 4 模式 / 订金 / 尾款 | `_resolveDiscount`（app-quotes-core.js） | 排除 |
| 服务端 Luma `subtotal` 含 install 的差异 | functions/index.js:7913-7927 | 网站取 `fabric+hardware+control`（§0.3） |

---

## 7. 对标单元测试用例（10 条，均为纯产品价，已排除安装/上门费）

> 除特别注明外均使用本文默认常量。期望值按公式手算，逐步中间值给出，可直接做断言。

### L1 — Luma 卷帘（roller_shade）
输入：W=60, H=72；面料 `ME8-任意色`（roller 表 $60.21/sqm）；cassette `round_fabric`（$20/m）；option `plastic_chain`。
```
sqm  = 60×84/1550 = 3.2516129   bSqm = 3.2516129
fabricAmount   = round2(3.2516129×60.21) = 195.78
hardwareAmount = round2(60×0.0254×20) = round2(1.524×20) = 30.48
controlAmount  = 0
subtotal = _priceInt(226.26) = **226**        （install $15 已排除）
```

### L2 — Luma 卷帘最低 1 sqm
输入：W=24, H=36；`MB2`（$77.76）；`open_roll`（$0/m）；`stainless_chain`（+$15）。
```
sqm = 24×48/1550 = 0.7432 < 1 → bSqm = 1
fabric = 77.76; hardware = 0; control = 15
subtotal = _priceInt(92.76) = **93**
```

### L3 — Luma 斑马帘（zebra_shade）
输入：W=80, H=90；`DB8`（$139.20）；cassette `square`（$14/m）；`cordless`（+$50）。
```
sqm = 80×102/1550 = 5.2645161
fabric   = round2(5.2645161×139.20) = 732.82
hardware = round2(2.032×14) = 28.45
control  = 50
subtotal = _priceInt(811.27) = **811**
```

### R1 — 手工罗马帘 flat / 内框
输入：mount=inner，raw 36×48（W=36,H=48 无加量）；面料 $40/yd、幅宽 54"；lining=BO（$8/yd）；无电机/帷幔/附加。
```
N = ceil((36+6)/54) = 1
cutPerPanel = 48×1.0 + 20 = 68     fabricYds = 68/36 = 1.8889
fabricAmount = round2(1.8889×40) = 75.56
liningAmount = round2(1.8889×8)  = 15.11
sqFt = 3×4 = 12    laborAmount = round2(12×12.5×2.0) = 300.00
subtotal = _priceInt(390.67) = **391**
```

### R2 — 手工罗马帘 hobbled / 外框 / 帷幔
输入：mount=outer，raw 44×60 → W=44+5=49, H=60+6=66；面料 $55/yd、54"；lining=LF（$6）；valance 开。
```
N = ceil((49+6)/54) = 2
cutPerPanel = 66×1.5 + 20 = 119    fabricYds = 2×119/36 = 6.6111
fabricAmount = round2(6.6111×55) = 363.61
liningAmount = round2(6.6111×6)  = 39.67
sqFt = (49/12)(66/12) = 22.4583   laborAmount = round2(22.4583×15×2.0) = 673.75
valance: floor(49/12)=4, 零头1">0.1 → 5 ft × $10 = 50.00
subtotal = _priceInt(363.61+39.67+673.75+50) = _priceInt(1127.03) = **1127**
```

### D1 — 手工布帘 打褶 2fold / 对开 / 无衬布
输入：finishedW=100, finishedH=96；styleFamily=pleated, styleKey=2fold_pinch, op=split；主布 $30/yd、幅宽 55"（<110 → 竖拼）；无纱/五金/banding。
```
panelW = 50, sides = 2, cutDrop = 96+16 = 112
求解: npBase = round(50/4.375) = 11
  np=11: spacing = 50/12 = 4.167 ∈[4,4.75] ✓
  psMin = 50+11×5+13 = 118;  wps = ceil(118/55/0.5)×0.5 = 2.5;  ps = 137.5
  PA = (137.5−50−13)/11 = 6.773 ∈[5,7] ✓
faceYds  = ceilHalfYd(2.5×112/36 × 2) = ceilHalfYd(15.556) = 16.0
fabricAmt = 16×30 = 480
laborWps = ceil(137.5/50/0.5)×0.5 × 2 = 3.0×2 = 6    laborAmt = 6×30(NO) = 180
subtotal = _priceInt(660) = **660**
```

### D2 — 手工布帘 ripple cn_6cm / 对开 / BO 衬布 / 宽幅横做
输入：finishedW=120, finishedH=100；ripple `cn_6cm`, op=split, returnIn=0；主布 $45/yd、幅宽 118"（auto：118≥110 且 100≤102 → 横做）。
```
panelW = 60, sides = 2, cutDrop = 116
N = ceilToEven((60−3)/2.3622) = ceilToEven(24.13) = 26
perSide = round2(26×4.9213 + 7) = 134.95
faceYds  = ceilHalfYd(134.95/36 × 2) = ceilHalfYd(7.497) = 7.5
fabricAmt = 7.5×45 = 337.50
liningWps = ceil(134.95/55/0.5)×0.5 = 2.5
liningYds = ceilHalfYd(2.5×116/36 × 2) = ceilHalfYd(16.111) = 16.5
liningAmt = 16.5×8 = 132.00
laborWps  = 2.5×2 = 5     laborAmt = 5×38(BO) = 190.00
subtotal = _priceInt(337.5+132+190) = _priceInt(659.5) = **660**
```

### D3 — D1 + banding（每片 1 条，banding_std $15/yd）
```
panelCount = 2, totalCount = 1×2 = 2, lengthPerPiece = 96+6 = 102
yardage = 102×2/36 = 5.6667     fabricAmt = 5.6667×15 = 85.00
laborAmt = (96/12)×10×2 = 160.00       bandingTotal = 245.00
subtotal = _priceInt(660 + 245) = **905**
```

### H1 — 窗帘杆 drapery_hardware（新价格模型）
输入：lengthIn=100"；库中该 subtype：`basePriceAtMinWidth=120, addPricePerFoot=18, minBillableWidthIn=48`；装饰头 price=0；无配件。（注意：出厂默认价格为 0，此处为示例库值。）
```
billedFeet = ceil((100−0.1)/12) = ceil(8.325) = 9
minFt = 48/12 = 4
baseAmt = 120 + (9−4)×18 = 210
subtotal = _priceInt(210) = **210**     （install: minFee+超120"部分 — 已排除）
```

### H2 — SOMFY 电动轨道 pinch pleat / 对开
输入：trackType=pinch_pleat, widthIn=100, openType=split；电机 `glydea60`（$1920）；配件 1× `situo1_rts`（net $56）；单层。
```
查表: 第一行 w≥100 → w=108 行, split = 896
trackSell = round2(896×0.29×2.2) = round2(571.648) = 571.65
unitPrice = 1920 + 571.65 = 2491.65
配件: sellEach = round2(56×1.5) = 84.00
subtotal = round2(2491.65 + 84) = **2575.65**    （此产品保留 2 位小数）
```

### 汇总表
| # | 产品 | 关键输入 | 期望纯产品价 |
|---|---|---|---|
| L1 | Luma 卷帘 | 60×72, ME8, round_fabric, 塑料链 | $226 |
| L2 | Luma 卷帘 | 24×36, MB2, 不锈钢链（最低1sqm） | $93 |
| L3 | Luma 斑马帘 | 80×90, DB8, square, cordless | $811 |
| R1 | 罗马帘 flat | 内框 36×48, $40/yd, BO 衬 | $391 |
| R2 | 罗马帘 hobbled | 外框 44×60(+5/+6), $55/yd, LF, 帷幔 | $1,127 |
| D1 | 布帘打褶 | 100×96 对开, $30/yd 55", 无衬 | $660 |
| D2 | 布帘 ripple | 120×100 对开, $45/yd 118" 横做, BO | $660 |
| D3 | 布帘+镶边 | D1 + banding_std ×1/片 | $905 |
| H1 | 窗帘杆 | 100", 起步$120@4ft +$18/ft | $210 |
| H2 | SOMFY 轨道 | pinch 100" split + glydea60 + situo1 | $2,575.65 |

