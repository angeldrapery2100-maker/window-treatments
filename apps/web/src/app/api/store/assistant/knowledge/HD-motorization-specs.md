# Hunter Douglas 电动系统与配件知识(规格版,无价格)

> 网站 AI 使用说明:本文件只含规格与搭配知识,**不含任何价格**。任何 HD 价格一律通过
> get_hd_estimate 工具取参考区间;配件与电机的具体金额由设计师在免费上门测量后正式报价。
> 核心铁律:电动 ≠ 手动 —— 电动订单必须包含电机附加与所需配件(电源/充电器/遥控/Gateway),永远不要把手动价当电动价。
**来源 / Source:** `HD_PG_US_JUN2026_NEW_05112026.pdf`（196 页价格册，2026 JUN，含 04 MAR 2026 更新页）
**核对日期 / Verified:** 2026-07-07
**范围 / Scope:** 每一款产品的操作系统（电动/手动）附加费、PowerView 分档金额、设计选项、以及全线电动配件（充电器、电源、遥控、Gateway、电池）。**目标：任何一款产品的电动报价都不再缺失。**

> HD 原文反复声明：价格册的电动附加费网格是"分档"的，最精确的单尺寸价格以 **Mobile Selling App / Direct Connect** 为准。本表给出的是价格册公布的分档金额（HD 对外报价即用这些数字），可直接用于报价，末尾以 Direct Connect 校准。

---

## 0. 通用规则 / How motorization pricing works

### 0.1 PowerView® Gen 3 分档网格（尺寸决定档位）
多数遮阳帘/百叶的 PowerView Gen 3 附加费是一张按 宽×高 的网格，只有 **3 个金额**（小/中/大档）。报价引擎 `hd-pricing.js` 用的分档规则（与 HD 网格一致）：

| 档位 Tier | 判定 Rule |
|---|---|
| **小 small** | 宽 ≤ 48″ **且** 高 ≤ 60″ |
| **大 large** | 宽 ≥ 120″ **或** 高 ≥ 96″ |
| **中 medium** | 介于两者之间 |

### 0.2 电池/充电方式变体
同一款 PowerView Gen 3 常有多张网格，按供电方式选表：
- **标准 Hardwired / plug-in**：基础 PowerView Gen 3 网格
- **RBW（Rechargeable Battery Wand，外置可充电电池杖）/ IRB（Internal Rechargeable Battery，内置可充电电池）**：金额更高的 "…with Rechargeable Battery Wand or Internal Rechargeable Battery" 网格
- **PowerView+™ Gen 3**（有线智能供电，Designer Roller/Screen、Alustra Pirouette、Alustra Silhouette/Quartette 专属）
- **PowerView Gen 3 AC**（Designer Roller/Screen 专属，交流电机）

### 0.3 SoftTouch®（弹簧助力手动，非电动）

### 0.4 重要口径
- **电动 ≠ 手动**：电动价 = 手动基础价 + PowerView/SoftTouch 附加费 + 所需配件（电源/充电器/遥控/Gateway，见第 2 节）。**严禁把手动价当电动价报。**
- RBW/IRB 帘出厂含：电池杖、卫星支架、以及一根 6″/15″/4′/10′/20′ 线缆。其余充电/供电配件按第 2 节单独加。

---

## 1. 电动配件总表 / Master Motorized Accessory Pricing (PG-194 ~ 196)

> 全线通用。这些是"电机以外"的配件（遥控、Gateway、电源、充电器、电池），电动订单按需叠加。

### 1.1 PowerView® Gen 3 控制配件 / Control (PG-194)
- PowerView Gen 3 Remote with Pebble®（遥控+底座）
- PowerView Gen 3 Remote with Surface（遥控+壁挂）
- Additional PowerView Pebble（加购底座）
- Additional PowerView Surface（加购壁挂）
- PowerView Gen 3 Gateway
- PowerView Gen 3 Gateway Pro
- PowerView Gen 3 Gateway Mount（Gateway 支架）

### 1.2 PowerView® Gen 3 供电选项 / Power Options (PG-195)
- Rechargeable Battery Kit（电池杖+支架，改装现有帘 Retrofitting，含 6″/15″/4′/10′/20′ 线缆）
- Spare Rechargeable Battery Wand（备用电池杖）
- Satellite Battery Pack（卫星电池包，含 6″/15″/4′/10′/20′ 线缆）
- 18V DC Power Supply（含 15″/4′/10′/20′ 线缆）
- Daisy-Chain Power Cable（菊花链电源线，15″/4′/10′/20′；需配 18V DC 电源）
- 16 Shade DC Power Supply（16 帘直流电源）
- Screw to Terminal Barrel Connectors（螺接桶形接头，公头 10 个）
- Quick-Lever Barrel Connectors（快扳桶形接头，母头 8 个）

### 1.3 PowerView® Gen 3 充电选项 / Charging Options (PG-195)
- IRB Deluxe Swivel Charging Kit（单充电器 + 旋转充电适配器 + 伸缩充电线）
- IRB Swivel Charging Kit（单充电器 + 旋转充电适配器 + 3′/12′ 充电线）
- Swivel Charging Adapter（旋转充电适配器，仅卫星支架）
- Extension Pole Attachment for Swivel Charging Adapter（延长杆附件）
- Extension Pole With Attachment for Swivel Charging Adapter（延长杆+附件）
- Specialty Shapes Charging Clip（异形充电夹）
- Dual Charging Station（双充电座）
- Deluxe Wand Charger Kit（单充电器+伸缩线）
- Wand Charger Kit（单充电器+3′/12′ 线）
- Solar Charger Kit（太阳能充电套件）
- Solar Adapter Cable（Rolling IRB 用太阳能适配线）
- Additional Retractable Charging Cable（加购伸缩充电线）
- Additional 3′ or 12′ Charging Cable（加购 3′/12′ 充电线）

> 充电套件说明：内置可充电电池（IRB）帘必须有 单充电器 + 充电线 + 旋转充电适配器 才能充电，这些已含在 IRB 充电套件里。Solar Adapter Cable 仅限 Rolling IRB 产品（Alustra Architectural、AWT Roller、Designer Banded、Designer Roller & Screen）。

### 1.4 PowerView+™ Gen 3 配件 / (PG-196)
> 仅 Designer Roller & Screen、Alustra Pirouette、Alustra Silhouette/Quartette 可选。
- PowerView+™ Gen 3 Smart Power Supply（含 2 包 PowerView+ 公头插接头）
- PowerView+ Daisy-Chain Cable（菊花链线）
- PowerView+™ Male Plug-In Connector（公头插接，8 个）
- PowerView+™ Bulk Cable（散线 500′）

### 1.5 SoftTouch® 配件 / (PG-196)
> 与 PowerView Gen 3 供电/充电配件基本相同（电池杖、卫星电池、18V 电源、充电座、充电器套件、太阳能套件等），价格见 §1.2 / §1.3；核心项复列：
- Rechargeable Battery Kit（改装现有帘，含线缆）
- Spare Rechargeable Battery Wand
- Dual Charging Station
- Deluxe Wand Charger Kit
- Wand Charger Kit
- Solar Charger Kit
- Satellite Battery Pack
- 18V DC Power Supply

---

## 2. 各产品操作系统附加费 / Per-Product Operating-System Surcharges

> **约定：** PowerView Gen 3 三档记作 `小 / 中 / 大`（分档规则见 §0.1）。"RBW/IRB" 为可充电电池变体网格。所有金额 = 加到基础网格价（add to base price）。

### 卷帘 / 蜂窝卷帘系 (小/中/大 = 440/515/595；RBW = 510/600/690)

#### Alustra Architectural (PG-14)
- PowerView Gen 3：**440 / 515 / 595**
- PowerView Gen 3 + RBW/IRB：**510 / 600 / 690**

#### Alustra Woven Textures — Roller (PG-19~20)
- PowerView Gen 3：**440 / 515 / 595**；+RBW/IRB：**510 / 600 / 690**

#### Alustra Woven Textures — Roman (PG-25)
- PowerView Gen 3：**345 / 405 / 465**
- PVG3 + RBW：**415 / 490 / 565**
- PVG3 + IOL（独立可操作衬里）：**545 / 640 / 730**
- PVG3 + IOL + RBW：**610 / 720 / 825**
- 注：Two-On-One 不可与 LiteRise / PVG3 同用；TDBU 不可与 LiteRise 同用

#### Designer Banded (PG-29)
- PowerView Gen 3：**440 / 515 / 595**；+RBW/IRB：**510 / 600 / 690**

#### Designer Roller & Screen (PG-94~96)
- PowerView Gen 3：**440 / 515 / 595**；+RBW/IRB：**510 / 600 / 690**
- PowerView+™ Gen 3：**520 / 610 / 700**
- PowerView Gen 3 AC：**880 / 1035 / 1190**
- 宽度加价（Fascia/Pocket，见 PG-94，按宽度网格另计）

#### Everwood（仿木百叶）(PG-64)
- PowerView Gen 3：**440 / 515 / 595**；+RBW/IRB：**510 / 600 / 690**
- 注：LiteRise 不可与切口/装饰带/多帘共轨/PVG3 同用

#### Modern Precious Metals（金属百叶）(PG-66)
- SimpleLift + PowerView Gen 3 Tilt-Only：**440 / 515 / 595**；+RBW/IRB：**510 / 600 / 690**
- 注：无独立"起降"电动（金属百叶仅翻转），LiteRise 不可与切口/装饰带/多帘/PVG3 同用

#### Parkland（木百叶）(PG-72)
- SimpleLift + PowerView Gen 3 Tilt-Only：**440 / 515 / 595**；+RBW/IRB：**510 / 600 / 690**

#### Parkland Wood Cornices（木檐口）(PG-74) — 无电动

---

### 蜂窝 / 罗马 / 竖幅 系 (小/中/大 = 345/405/465；RBW = 415/490/565)

#### Applause Honeycomb (PG-35~38)
- PowerView Gen 3：**345 / 405 / 465**；+RBW/IRB：**415 / 490 / 565**
- Arches & Circles / SkyLift & Simplicity：按宽度网格（PG-36/37）

#### Duette Honeycomb (PG-45~50)
- PowerView Gen 3：**345 / 405 / 465**（小=宽≤48&高≤60；大=宽≥120 或 高≥96）
- PVG3 + RBW/IRB：**415 / 490 / 565**
- Arches & Circles / SkyLift & Simplicity：宽度网格（PG-47）

#### Sonnette Cellular Roller (PG-54)
- PowerView Gen 3：**345 / 405 / 465**；+RBW/IRB：**415 / 490 / 565**

#### Vignette Rolling (PG-101)
- PowerView Gen 3：**345 / 405 / 465**；+RBW/IRB：**415 / 490 / 565**

#### Vignette Stacking (PG-105)
- PowerView Gen 3：**345 / 405 / 465**；+RBW/IRB：**415 / 490 / 565**

#### Provenance Woven Wood (PG-185~188)
- PowerView Gen 3：**345 / 405 / 465**
- PVG3 + RBW：**415 / 490 / 565**
- PVG3 + IOL（独立可操作衬里）：**545 / 640 / 730**
- PVG3 + IOL + RBW：**610 / 720 / 825**
- 衬里/包边：Attached Mono Liner、Attached Duo Liner、Light-Filtering IOL、Room-Darkening IOL、Edge Banding 均为宽×高网格（PG-186~188）

---

### 薄纱横向 / 遮光横向 (小/中/大 = 440/515/595；RBW = 510/600/690)

#### Nantucket Window Shadings (PG-109)
- PowerView Gen 3：**440 / 515 / 595**；+RBW/IRB：**510 / 600 / 690**

#### Pirouette Window Shadings (PG-115)
- PowerView Gen 3：**440 / 515 / 595**
- PVG3 + RBW：**510 / 600 / 690**
- PowerView+™ Gen 3：**505 / 595 / 680**

#### Silhouette Window Shadings (PG-119)
- PowerView Gen 3：**440 / 515 / 595**
- PVG3 + RBW：**510 / 600 / 690**
- PowerView+™ Gen 3：**505 / 595 / 680**

---

### 竖向 帘/板/纱 (两档 = 535 / 625)

#### Luminette Privacy Sheers (PG-152)

#### Skyline Gliding Window Panels (PG-160~161)
- 顶部处理（PG-161）：Box Valance、Sleek Metal Valance 按宽度网格

#### Provenance Vertical Drapery (PG-192)
- 衬里：Attached Mono Liner、Attached Duo Liner 按宽×高网格

#### Vertical Solutions（竖百叶）(PG-167~175)
- Dust Cover Valance、PermaTrak 轨道、Paramount 轨道升级：按宽度网格（PG-175）

---

### 横向软百叶

#### Aria Soft Blinds (PG-57)
> Aria 的 PowerView **仅** 与 RBW/IRB 供电搭配（价格册两张表都是 "with Rechargeable Battery Wand or Internal Rechargeable Battery"）。
- LiteRise + PowerView Gen 3 **Tilt-Only**（RBW/IRB）：**240 / 300 / 360**
- PowerView Gen 3 **Lift & Tilt**（RBW/IRB）：**345 / 405 / 465**
- 注：Solar Charger 仅兼容 Aria + 卫星 RBW，不兼容 Aria + IRB

---

### 百叶窗/木窗（Shutters，电动/非电动）

#### Palm Beach Polysatin Shutters (PG-145~146)
- 轨道系统（宽度网格 PG-145）：Bi-Fold / Bypass / Bypass Open Louver / Bypass Triple Track
- Decorative Sill Cover：宽度网格
- Frame Only（斜接+铰接）从框价 −75%

#### Heritance Hardwood Shutters (PG-127~128) — 无电动
- 轨道系统（宽度网格）：Bi-Fold / Bypass / Bypass Open Louver / Bypass Triple Track
- Arch Top / Angle Top 面板系统：宽度网格
- Decorative Window Fashion Support（Paint / Stain）：宽度网格
- Domestic Direct（美国本土制造，短交期）+40%
- Frame Only −75%

#### NewStyle Hybrid Shutters (PG-136~137) — 无电动
- 轨道系统 / Arch Top / Angle Top：宽度网格
- Frame Only −75%

#### Polyresin Shutters — 价格不在本册；请走 Direct Connect 询价

---

### 照明帘

#### Aura Illuminated Shades (PG-75~80)
- **仅** PowerView+™ Gen 3 一种操作系统，**基础网格价已含该电动系统**，无单独操作系统附加费。
- 配件走 §1.4 PowerView+ 配件表。

---

## 3. 本次修正 / Data fixes applied (`functions/hd_pricing_data.json`)

- **luminette**
| **skyline_panels** | 完全缺 PowerView | 补 535 / 625 / 625（含 18V DC 电源） |
| **alustra_woven_textures** | PVG3 档位 = 200/270/130（乱） | 440/515/595；+RBW 510/600/690 |
| **applause** | PVG3 档位 = 50/130/345（乱） | 345/405/465；+RBW 415/490/565 |
| **aria** | 混入表头数字，档位乱 | Tilt-Only 240/300/360；Lift&Tilt 345/405/465 |
- **everwood**
| **modern_precious_metals** | 混入表头数字 | SimpleLift+PVG3 440/515/595；+RBW 510/600/690 |
| **parkland_blinds** | 混入表头数字 | SimpleLift+PVG3 440/515/595；+RBW 510/600/690 |
| **nantucket** | PVG3 档位 = 200/270/205（乱） | 440/515/595；+RBW 510/600/690 |
| **sonnette** | PVG3 档位 = 200/270/345（乱） | 345/405/465；+RBW 415/490/565 |

> 已正确、未改动：alustra_architectural、designer_banded、designer_roller、designer_screen、duette、palm_beach、pirouette、silhouette。

**待办 / 需你确认：** 引擎 `_pvTier` 的档位边界是近似（小=W≤48&H≤60，大=W≥120 或 H≥96）。HD 网格的精确边界略有产品差异；单尺寸精确电动价仍以 **Direct Connect / Mobile Selling App** 为准。若要"逐尺寸精确"，需把每张 PVG3 网格的单元边界完整入库（另一项工程）。GPT 服务端 (`functions/index.js` `_ai*` / `_priceLumaShade`) 若也报这些电动产品，需同步这些数值以保持一致。
