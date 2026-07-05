# Hunter Douglas 卷一:蜂巢帘 Honeycomb (Duette / Applause / Sonnette) + 柔纱帘 Sheer Shadings (Silhouette / Nantucket) + 软纱帘 Pirouette

> Hunter Douglas 知识库合并卷 · 内容完整保留自原分册 · 检索关键词见下方目录

## 本卷包含 / Contents
- 01_Duette_蜂巢帘
- 02_Applause_Sonnette_蜂巢帘
- 03_Silhouette_Nantucket_柔纱帘
- 04_Pirouette_软纱帘

═══════════════════════════════════════════════
# 【分册】01_Duette_蜂巢帘
═══════════════════════════════════════════════

# Duette® Honeycomb Shades（蜂巢帘）产品知识库

> 来源：Hunter Douglas US《Duette® Honeycomb Shades Product Specifications Guide》，生效日期 2026年1月20日（DU_PS_US_JAN2026），共184页（DU-2 至 DU-184）。本知识库所有尺寸数字均逐页核实自该文件原文，未核实清楚或原文本身存在栏位歧义之处已标注"⚠️待核对"。价格信息已从本指南中移除，价格另见 Hunter Douglas US Price Guide（本文件不含价格数字）。

---

## 1. 产品概述

### 1.1 产品定位

Duette® Honeycomb Shades 是 Hunter Douglas 的蜂巢帘产品线，定位为"Ultimate Personalization"（终极个性化），提供最广泛的构造、遮光度、颜色和材质选择。原文强调：

- Architella® 构造提供 Hunter Douglas 所有产品中最高的能效（"the highest energy efficiency of any Hunter Douglas product"）。
- 提供 Architella（双蜂巢）和 single honeycomb（单蜂巢）两种构造。
- 提供 Sheer（透光）、semi-sheer（半透光）、light-filtering（透光遮光）、room-darkening（全遮光）多种遮光度面料。
- 提供优雅的织纹和纹理面料。
- 具备增强型儿童安全操作系统（原文 Introduction 段落提到"enhanced child safety"，具体见第8节）。

### 1.2 Core Line 与 Alustra® Duette® 的区别

原文明确两条产品线：

- **Core Line**：主力产品线，面料系列包括 Architella Alexa、Architella Batiste、Architella Batiste Bamboo、Architella Classic、Architella Elan（含 Elan Metallic）、Architella India Silk、Architella Reception、Architella Thea、Classic、ClearView Sheer、Commercial、Reception、Whisper Sheer 等。
- **Alustra® Duette®**："combines energy efficiency and design-inspired fabrics, textures and colors for incomparable beauty"。Alustra 专属面料系列为 **Architella Leela™、Architella Macon™、Architella Solasta™** 三个系列（原文称为"the exclusive Architella Leela, Architella Macon and Architella Solasta fabric collections"）。

两条产品线在功能/操作系统兼容性上遵循同一套规则，主要差异体现在可选面料系列不同、以及部分尺寸上限不同（Alustra 与 Core Line 在同一操作系统下的 Size Standards 表是分别列出的两套数字，二者并不通用，必须依据具体面料系列所属产品线查表）。

### 1.3 蜂巢褶宽（Pleat Size）

原文中出现过的褶宽包括：

- **3⁄4"（3/4英寸）**：单蜂巢（single cell）和双蜂巢（Architella）均有此褶宽的产品。
- **1 1⁄4"（1又1/4英寸）**：单蜂巢和双蜂巢均有此褶宽的产品。
- **3⁄8"（3/8英寸）**：⚠️**已于 2026年1月1日起停产（discontinued）**。原文 Revision History（第5页）明确记载："1/1/26　3⁄8" pleat size discontinued.　Various" 以及 Fabric Discontinuation History 中列出 "Classic 3⁄8" Light Filtering D1" 和 "Classic 3⁄8" Room Darkening H7" 于 2026/1/1 停产。也就是说，本指南生效时（2026年1月20日）3/8"褶宽已经不再销售，仅在 fabrics.json 结构化数据中的 "Architella Classic (3⁄8", 3/4" single, 3/4")" 集合里能看到历史遗留的褶宽标注（含"3/8" double"这一表示法），实际下单应确认该褶宽是否仍可购买——按最新规格书应视为已停产。

Alustra Architella Leela/Macon/Solasta：原文明确"Core line available in 3⁄4 and 11⁄4 pleat sizes"、"Alustra available in 3⁄4 and 11⁄4 pleat sizes"，即 Alustra 三个系列均提供 3/4" 与 1 1/4" 两种褶宽。

### 1.4 Single Cell（单蜂巢）vs Architella®（双蜂巢）构造

- **Single cell（单蜂巢）**：代表面料如 Classic、ClearView Sheer、Commercial、Reception、Whisper Sheer。
- **Architella®（双蜂巢/双层蜂巢）**：代表面料如 Architella Alexa、Architella Batiste、Architella Batiste Bamboo、Architella Classic、Architella Elan、Architella India Silk、Architella Leela、Architella Macon、Architella Reception、Architella Solasta、Architella Thea。原文明确"Architella® construction provides the highest energy efficiency of any Hunter Douglas product"，即双蜂巢构造相较单蜂巢有更高的隔热节能效果（原文未给出具体 R 值或百分比数字，因此不做具体节能数值的编造）。

在 Duolite 规则中也能看出双蜂巢与单蜂巢的构造差异会限制搭配：多处 Duolite Exclusions 明确写有"**Architella top panel with single cell bottom panel**"（Architella面料作为上层面板、单蜂巢面料作为下层面板的组合被排除），说明二者构造不同、不能任意混搭。

---

## 2. 面料系列一览表

以下表格汇总自 `fabrics.json` 的 `collections` 字段（顶层分类）与 ALL_SPEC.txt 中各操作系统 Size Standards 章节出现的面料标题行核实交叉确认。

**关于颜色总数：** 原任务背景资料称"130种颜色"，但经过对 fabrics.json 原始数据逐项核实（`collections` 字段中16个系列的颜色列表逐一计数，并与顶层 `fabrics` 数组中 `color_number` 字段计数比对，两者均为150），**实际总颜色数应为150色，而非130色**。⚠️待核对：该数字来自结构化 JSON 文件本身而非 ALL_SPEC.txt 原文（PDF说明书正文一般不会逐色罗列总数），且 JSON 内同一颜色名+编号（如"951 DAISY WHITE"、"457 JOURNAL"等）会在多个系列中重复出现（因为同一染色批次的色卡可能被用于多个面料结构/系列），所以"150"是"系列×颜色组合数"，并非150种互不重复的染色配方。请在客户沟通中以此为参考基准，若需要精确的"独立色号"总数建议进一步与最新色卡核实。

| 系列名 (Collection) | 颜色数 | pleat 可选（据fabrics.json） | opacity（据面料代码推断/原文标注） | Duolite 可用性 |
|---|---|---|---|---|
| Alustra Architella Solasta™ | 4 | 3/4", 1 1/4" | Light Filtering（部分同名亦有 Room Darkening版本，见ALL_SPEC分号U28/U48=LF，U29/U49=RD） | 资料未按颜色系列列出，需按具体订单核实（见第6节Duolite通用规则） |
| Alustra Architella Leela™ | 4 | 3/4", 1 1/4" | Light Filtering / Room Darkening（U24/U44=LF，U25/U45=RD） | 同上 |
| Alustra Architella Macon™ | 4 | 3/4", 1 1/4" | Light Filtering / Room Darkening（U26/U46=LF，U27/U47=RD） | 同上 |
| ClearView® Sheer | 4 | 3/4"(V01), 1 1/4"(V02) | Sheer | 同上；ClearView Sheer常作为Duolite的sheer层（见各系统Duolite规则） |
| Whisper™ Sheer | 12 | 3/4"(D8/D9), 1 1/4"(D40/D49) | Sheer | 同上；Whisper Sheer常作为Duolite的sheer层 |
| Architella India Silk™ | 8 | 3/4"(U22), 1 1/4"(U42) | Light Filtering（U22/U42=LF），另有Room Darkening（U23/U43） | 同上 |
| Architella Thea™ | 8 | 3/4"(C58), 1 1/4"(C60) | Light Filtering，另有Room Darkening（C59/C61） | 同上 |
| Architella Alexa™ | 8 | 3/4"(C93), 1 1/4"(C88) | Light Filtering，另有Room Darkening（C94/C89） | 同上 |
| Architella Batiste™ | 8 | 3/4"(Y10), 1 1/4"(Y09) | Semi-Sheer | 同上 |
| Architella Batiste Bamboo™ | 8 | 3/4"(C95), 1 1/4"(C97) | Light Filtering，另有Room Darkening（C96/C98） | 同上 |
| Architella Elan® (含 Elan Metallic) | 44 | 3/4"(C22), 1 1/4"(C42) | Light Filtering，另有Room Darkening（C23/C43） | 同上 |
| Architella Classic™ | 6 | 3/4" | Light Filtering(C50)，另有Room Darkening(C51) | 同上 |
| Architella Reception | 12 | 3/4"(C56) | Light Filtering，另有Room Darkening(C57) | 同上 |
| Architella Elan® Streetside | 8 | 3/4" | 资料未列出该子系列独立opacity/尺寸表，需按具体订单核实 | 同上 |
| Commercial with MicroShield® | 6 | 3/4"(D22 LF, D23 RD) | Light Filtering / Room Darkening | 同上；Commercial面料在多系统有专门排除规则（见各系统章节） |
| Architella Classic（3⁄8", 3/4" single, 3/4"双蜂巢混合标注） | 6 | 原标注含"3/8\" double"/"3/4\" single"/"3/4\"" 三种规格，但3/8"褶宽已停产（见1.3节） | Light Filtering (D1，已停产) / Room Darkening (H7，已停产) | 同上 |

**关于"独立单蜂巢"面料（非Architella前缀）**：Classic™、ClearView® Sheer、Commercial、Reception、Whisper™ Sheer 均为single cell单蜂巢构造（无"Architella"前缀），在各操作系统Size Standards表中通常尺寸上限更大（如Classic/Whisper/ClearView在多个系统下可达174"宽/144"高，属于面料系列中尺寸限制最宽松的一档）。

---

## 3. 操作系统详解

> 说明：以下每个系统的 Mounting Requirements 与 Size Standards 数字均逐字核对自 ALL_SPEC.txt 原文对应章节（"Operating System Specifications"及"Size Standards"小节）。因面料种类繁多，Size Standards 部分仅摘录代表性面料（如 Architella Leela、Architella Elan、Classic 等）作示例，完整逐面料数字请查阅第4、5节的汇总表或原文对应页码。

### EasyRise™（第12–26页）

**简介**：Standard (bottom-up)、Top-Down/Bottom-Up (TDBU) 及 Duolite®（有外露中间轨道 exposed middle rail）、Two-On-One Headrail。原文特别说明：对于TDBU与Duolite，右侧拉绳环控制中间轨道，左侧拉绳环控制底部轨道（除非订单指定反向控制）；操作时须先降下底部轨道再降中间轨道，先升起中间轨道再升底部轨道，以获得最佳操作效果。

**Applications**：
- Standard (bottom-up)
- Top-Down/Bottom-Up and Duolite®（有外露中间轨道）
- Two-On-One Headrail

**Exclusions（完整原文）**：
- End (EB) mount shades over 72" wide
- Two-On-One Headrail with Top-Down/Bottom-Up or Duolite
- Top-Down
- Two-On-One Headrail as end (EB) mount
- LightLock®
- LightLock Flex
- TrackGlide™
- Batiste Semi-Sheer as bottom panel

**Duolite Exclusions（原文）**：
- Commercial fabrics
- Cannot combine two different pleat sizes
- Architella top panel with single cell bottom panel
- Room-darkening fabric as top panel
- Sheer or Semi-Sheer as a bottom panel
- Light-filtering fabric for both top and bottom panel

**重要安全提示（原文 Important 段落）**：根据修订版美国国家标准 Safety of Corded Window Covering Products，EasyRise™ 窗帘要求正确安装 cord tensioner（拉绳张力器）才能正常工作，该张力器不得以任何方式改装。

**Mounting Requirements（原文数字）**：

| 项目 | 3/4" Pleat | 1 1/4" Pleat |
|---|---|---|
| Inside Mount (IB) 最小凹槽深度 | 1/2" | 1/2" |
| End Mount (EB) 最小凹槽深度 | 1 1/4" | 1 1/4" |
| Inside Mount 完全嵌入(fully recessed)深度 | 2 1/4" | 3 1/8" |
| End Mount 完全嵌入深度 | 2 3/8" | 3 1/8"（原文仅给出Inside Mount的fully recessed数字为3 1/8"，未单独列End Mount的1 1/4"栏；⚠️待核对：1 1/4"栏原文合并列出"Minimum casement depth, fully recessed"为3 1/8"，未区分Inside/End两行，可能两者共用同一数值） |
| Outside Mount (OB) 最小安装面高度 | 1 1/4" | 1 1/4" |

**Size Standards（部分示例，Alustra，单位 in）**：
- Min. Width: 16"（Standard）/ 24"或26"（TDBU，108"以下用24"，108"及以上用26"）/ 16"每panel（Two-On-One）
- Min. Height: 24"（三栏均为24"）
- Architella Leela 3/4" Light Filtering U24：Max Width 96/174（Standard/TDBU）或174（Two-On-One）；Max Height 91；Max Area 59/46 sq ft（Standard/TDBU）或46/panel
- （注：两个宽度数字表示两档区间——较大面积对应较窄宽度区间，较小面积对应较宽宽度区间上限）

**EasyRise 端点(EB)限制**：EasyRise end (EB) mount shades 最大宽度为72"。

**可选功能（Optional Features，原文）**：
- No Charge: Cord loop drops、End mount (EB) brackets、Extension brackets、Magnetic hold-down brackets（黑/黄铜Brass/古铜Bronze/白蜡Pewter/白色White可选）、Reverse controls、Spacer blocks
- Surcharge（需加价）: Cut-outs (standard only)、Duolite、Top-Down/Bottom-Up

**硬件**：包含 Installation brackets、Cord tensioner mounting kit。颜色：轨道和端帽与面料颜色协调，可免费覆盖硬件颜色（Hardware color override不适用于拉绳环和张力器，须单独选择UCT颜色：048 Black、320 Rich Cream、661 White Tiara、689 Ash、903 Desert Gold）。

---

### LiteRise®（第27–35页）

**Applications**：
- Standard (bottom-up)
- Top-Down/Bottom-Up
- Duolite®（有外露中间轨道）
- TrackGlide™ 设计选项可用于standard、TDBU、Duolite
- LightLock® 设计选项可用于standard、TDBU、Duolite
- LightLock Flex 设计选项可用于standard、TDBU

**Exclusions（原文完整）**：
- Cut-outs
- End mount (EB) shades over 72" wide
- Top-Down
- Two-On-One Headrail shades
- Shades with both TrackGlide™ and LightLock or LightLock Flex

**Duolite Exclusions（原文）**：
- LiteRise® and TrackGlide Duolite Top Panel must be Whisper™ sheer or ClearView® sheer fabric with light-filtering or room-darkening fabric as the bottom panel only
- Fabric combinations with different pleat sizes
- Commercial fabrics must have D22 as the top panel and D23 as the bottom panel
- TrackGlide and Duolite shades: 1 1/4" pleat and Commercial fabrics
- LightLock Duolite shades: Top Panel must be ClearView® Sheer fabric with room-darkening fabric as the bottom panel only；Fabric combinations with different pleat sizes；1 1/4" pleat and Commercial fabrics

**Mounting Requirements（原文数字）**：

| 项目 | 3/4" Pleat | 1 1/4" Pleat |
|---|---|---|
| Inside Mount 最小凹槽深度 | 1/2" | 1/2" |
| End Mount 最小凹槽深度 | 1 1/4" | 1 1/4" |
| Inside Mount 完全嵌入深度 | 2 1/4" | 3 1/8" |
| End Mount 完全嵌入深度 | 2 3/8" | （同EasyRise，1 1/4"栏未单独区分Inside/End，⚠️待核对） |
| Outside Mount 最小安装面高度 | 1 1/4" | 1 1/4" |

**Size Standards（示例，Core Line，单位in）**：
- Min. Width: 18"（Standard）/ 20"（TDBU、Duolite）
- Min. Height: 6"（三栏均为6"）
- Architella Alexa 3/4" Light Filtering C93：Max Width 90"（Standard）/ 90"（TDBU）/ 78"（Duolite）；Max Height 84（三栏一致）；Max Area 53/53/46 sq ft
- LiteRise end mount (EB) shades 最大宽度72"

**可选功能**：
- No Charge: End mount (EB) brackets、Extension brackets、Magnetic hold-down brackets（黑/黄铜/古铜/白蜡/白色）、Spacer blocks
- Surcharge: Duolite、Extension pole、Extension pole attachment only、LightLock、LightLock Flex、Top-Down/Bottom-Up、TrackGlide、TrackGlide Duolite

**硬件**：包含Installation brackets。轨道、端帽及把手(handle)与面料颜色协调，可免费覆盖硬件颜色。

**Extension Pole（伸缩杆）**：从29"延伸至51"。

---

### PowerView® Gen 3 Automation（第36–52页）

**Applications**：
- 适用矩形窗口开口：Standard (bottom-up)、Top-Down、Top-Down/Bottom-Up、Duolite®（有外露中间轨道）、TrackGlide™及TrackGlide Duolite
- LightLock® 设计选项可用于standard、Top-Down、TDBU、Duolite
- LightLock Flex 设计选项可用于standard、Top-Down、TDBU
- 遥控电池供电操作为标准配置
- **仅右侧电机和控制按钮**（Right-side motor and control button only）

**Exclusions（原文完整）**：
- Two-On-One Headrail
- Left-side motor and control button
- End mount (EB) shades over 72" wide

**Duolite Exclusions（原文）**：
- Commercial fabrics must have D22 as the top panel and D23 as the bottom panel
- Cannot combine two different pleat sizes
- Architella top panel with single cell bottom panel
- Room-darkening fabric as top panel
- Sheer or Semi-Sheer as a bottom panel
- Light-filtering fabric for both top and bottom panel
- Shades with both TrackGlide™ and LightLock or LightLock Flex
- TrackGlide Duolite shades：Duolite Top Panel must be Whisper™ sheer or ClearView® sheer fabric with light-filtering or room-darkening fabric as the bottom panel only；Fabric combinations with different pleat sizes；1 1/4" pleat and Commercial fabrics
- LightLock Duolite shades：Top Panel must be ClearView® Sheer fabric with room-darkening fabric as the bottom panel only；Fabric combinations with different pleat sizes；1 1/4" pleat and Commercial fabrics

**Mounting Requirements（原文数字，按电源类型和褶宽区分）**：

| 项目 | 3/4" Pleat | 1 1/4" Pleat |
|---|---|---|
| High Mount Bracket (Standard) — Inside Mount 最小凹槽深度 | 1" | 1" |
| High Mount Bracket — End Mount 最小凹槽深度 | 1 3/4" | 1 3/4" |
| High Mount Bracket — Fully Recessed深度 | 2 3/4" | 3 1/2" |
| Headrail-Mounted Rechargeable Battery Wand — Inside Mount 最小凹槽深度 | 1 1/4" | 1 1/4" |
| Headrail-Mounted Rechargeable Battery Wand — End Mount 最小凹槽深度 | 2" | 2" |
| Headrail-Mounted Rechargeable Battery Wand — Fully Recessed深度 | 3 1/8" | 4" |
| Internal Rechargeable Battery(IRB)/Satellite Battery Pack/C-Size/DC电源 — Inside Mount 最小凹槽深度 | 1/2" | 1/2" |
| Internal Rechargeable Battery等 — End Mount 最小凹槽深度 | 1 1/4" | 1 1/4" |
| Internal Rechargeable Battery等 — Fully Recessed深度 | 2 1/4" | 3 1/8" |
| Outside Mount 最小安装面高度（所有情况） | 1 1/4" | 1 1/4" |

**Size Standards（示例，Core Line，单位in）**：因电源类型不同，最小宽度分为4档：
- Min. Width SMBW（卫星电池棒或DC电源）：Standard 17 1/2"；Top-Down 17 1/2"；TDBU 22"/25"（108"以上高度用25"）
- Min. Width IRB（内置可充电电池）：Standard 23"/24"（108"以上高度用24"）；Top-Down 24"/25"；TDBU 29"/32"
- Min. Width HMRBW（轨道装可充电电池棒）：Standard 18 1/2"/21"（EB端装用21"）；Top-Down同；TDBU 22"/25"
- Min. Width HMBW（轨道装电池棒）：Standard 19 1/2"/22"；Top-Down同；TDBU 22"/25"
- Min. Height: 6"（Standard/Top-Down）；12"（TDBU）
- Architella Alexa 3/4" Light Filtering C93：Max Width 96/144（三栏一致）；Max Height 119；Max Area 73/63（三栏一致）
- PowerView Gen 3 end mount (EB) shades 最大宽度72"

**可选功能**：
- No Charge: Additional spacer blocks、Battery wand mounting bracket (high mount)、Extension brackets spacer、End mount (EB) brackets、Magnetic hold-down brackets
- Surcharge: Applicable design option surcharges、Cut-Outs (Standard only)、LightLock、LightLock Flex、PowerView Gen 3 accessories、TrackGlide、TrackGlide Duolite

**电源选项**：Battery Wand（预装碱性电池棒，标配）、Satellite Battery Pack（卫星电池包，线长可选15"/4'/10'/20'）、C-Size Satellite Battery Wand（线长可选同上，电池寿命约3年）、18V DC Power Supply、Daisy-Chain Cable（菊花链，最多3个窗帘共用一个18V电源，总线长不超过50'）、16 Shade DC Power Supply（可为最多16个窗帘供电）、Internal Rechargeable Battery (IRB，内置不可拆卸、需原位充电）。

---

### Sidelights（第53–59页）

**Applications**：适用矩形窗口开口；非操作型(Non-operable)或无绳操作型(Cordless Operable)，操作型选项包括：Standard (bottom-up)、Top-Down、Top-Down/Bottom-Up。

**Exclusions（原文）**：
- Duolite®

**Mounting Requirements（原文数字）**：

| 项目 | 3/4" Pleat | 1 1/4" Pleat |
|---|---|---|
| Inside Mount 最小凹槽深度 | 1/2" | 1/2" |
| Inside Mount 完全嵌入深度 | 2 3/8" | 3" |
| Outside Mount 最小安装面高度 | 5/8" | 5/8" |

**Size Standards（示例，单位in）**：
- Min. Width: 4"（Non-Operable）/ 6"（Cordless Operable）
- Min. Height: 6"（两栏一致）
- Architella Leela 3/4" Light Filtering U24：Max Width 25"（两栏一致）；Max Height 90（Non-Operable）/ 84（Cordless Operable）；Max Area — （不适用，Sidelights不列面积上限）
- 备注：Simplicity™ system: with side stack shades, use maximum width for maximum height and maximum height for maximum width（此备注出现在Sidelights/Simplicity共用的Size Standards页脚，适用于Simplicity的side stack配置换算）

**可选功能**：No Charge: Extension brackets、Spacer blocks；Surcharge: Top-Down、Top-Down/Bottom-Up。

**硬件**：Specialty shapes installation brackets（专用安装支架）。Sidelight top and bottom rails are mounted and stationary（顶部和底部轨道固定不动）。

---

### Simplicity™（第60–66页）

**Applications**：
- 适用矩形窗口开口
- 手动操作（带手柄），可在任意坡度或朝向操作；适合天窗（121"延长杆可选）
- Headrail、moving rail、anchor rail两端由side tracks（侧轨）封闭
- 可订制为顶部堆叠、底部堆叠或任一侧堆叠

**Exclusions（原文）**：
- 1 1/4" pleat fabrics
- Alustra Architella® Leela™ light filtering and room darkening fabric

**附加信息（原文）**：
- Support cord（支撑绳）在斜面或天窗应用中，帘宽超过36"时为必需项
- Rail stiffener（轨道加强件）在帘宽超过42"时为必需项
- Weatherstrip（密封条）不包含在内

**Mounting Requirements（原文数字，仅3/4" Pleat可用）**：

| 项目 | 数值 |
|---|---|
| Inside Mount 最小凹槽深度 | 1 1/4" |
| Inside Mount 完全嵌入深度 | 2 1/2" |
| Outside Mount 最小安装面高度 | 1" |

**Size Standards（示例，Core Line，单位in）**：
- Min. Width: 18"；Min. Height: 6"
- Architella Alexa 3/4" Light Filtering C93：Max Width 60；Max Height 72；Max Area 25 sq ft
- Alustra Architella Macon/Solasta 3/4"：Max Width 60；Max Height 72；Max Area 20 sq ft（注：Alustra Leela在Simplicity完全不可用，Max列均为"—"，与Exclusions"Alustra Architella Leela light filtering and room darkening fabric"一致）
- Classic/Commercial/Reception 3/4"：Max Width 60；Max Height 72；Max Area 25 sq ft
- 备注：side stack shades应将Max Width数值用作Max Height、Max Height数值用作Max Width（因side stack时帘体是横向展开的）

**可选功能**：Surcharge: Extension pole（延长杆，从61"延伸至121"）。

**硬件**：Installation bracket。颜色仅提供785 Aspen White（轨道、侧轨和手柄）。

---

### SkyLift™（第67–76页）

**Applications**：
- 适用矩形窗口开口：Manual、PowerView® Gen 3 Automation、Duolite®（Duolite底部轨道固定不动）
- 适合天窗（skylight windows）；安装时窗帘最小倾角需距水平面10°
- 仅提供顶部堆叠（top stack only）

**Exclusions（原文完整）**：
- 1 1/4" pleat fabrics
- Arches over SkyLift
- Marine use（船用）
- End mount (EB)
- Bottom stack or side-to-side orientation（窗帘安装时控制按钮必须保持在底部）
- C-size satellite battery wand
- Daisy-chain option
- Rechargeable battery wand mounted behind shade
- Internal rechargeable battery wand

**Duolite Exclusions（原文）**：
- Bottom panel must be Whisper™ Sheer or ClearView® Sheer fabric with semi-sheer, light-filtering or room-darkening fabric as the top panel only
- Fabric combinations with different pleat sizes
- 1 1/4" pleat and Commercial fabrics

**Mounting Requirements（原文数字）**：

| 项目 | 数值 |
|---|---|
| Inside Mount — Manual shades 最小凹槽深度 | 2 1/2" |
| Inside Mount — PowerView Gen 3 shades ≥38"宽 最小凹槽深度 | 2 1/2" |
| Inside Mount — PowerView Gen 3 shades <38"宽 最小凹槽深度 | 4 1/2"（若电池包安装在底部轨道后方） |
| Outside Mount 最小安装面高度 | 1 1/4" |
| Outside Mount 每侧建议重叠宽度 | 2" |

**SkyLift "Width To" 分段最大高度查询表（原文核实，单位in，选取代表性面料示例）**：

| Width To → | 42" | 48" | 54" | 60" | 66" | 72" | 84" | 96" |
|---|---|---|---|---|---|---|---|---|
| Architella Leela 3/4" LF U24（Manual和PowerView Gen 3数值一致） | 91 | 91 | 91 | 91 | 84 | 72 | 54 | 42 |
| Architella Leela 3/4" RD U25 | 88 | 88 | 88 | 78 | 66 | 60 | 42 | 30 |
| Architella Macon 3/4" LF U26 | 128 | 128 | 128 | 108 | 90 | 78 | 60 | 42 |
| Architella Macon 3/4" RD U27 | 118 | 118 | 102 | 90 | 78 | 66 | 48 | 36 |
| Architella Solasta 3/4" LF U28 | 124 | 124 | 124 | 108 | 90 | 78 | 60 | 48 |
| Architella Solasta 3/4" RD U29 | 118 | 118 | 108 | 96 | 84 | 72 | 54 | 36 |
| Architella Alexa 3/4" LF C93 | 119 | 119 | 114 | 96 | 84 | 72 | 54 | 42 |
| Architella Alexa 3/4" RD C94 | 108 | 108 | 108 | 90 | 78 | 72 | 48 | 36 |
| Architella Classic 3/4" LF C50 | 144 | 144 | 144 | 144 | 120 | 108 | 84 | 78 |
| Architella Classic 3/4" RD C51 | 144 | 144 | 144 | 138 | 120 | 108 | 78 | 60 |
| Classic 3/4" LF D2 | 144 | 144 | 144 | 144 | 144 | 144 | 120 | 102 |
| Classic 3/4" RD D7 | 144 | 144 | 144 | 144 | 144 | 144 | 120 | 120（Manual）/90（PowerView，⚠️待核对：Manual与PowerView Gen3两行在原文第69页显示不完全一致，Manual栏为120，紧邻的PowerView Gen3独立表格片段显示96"宽处为120、96宽处PowerView为90，具体请以原文page_069/071对照复核） |
| ClearView 3/4" Sheer V01 | 144 | 144 | 120 | 120 | 120 | 120 | 120 | 120 |
| Commercial 3/4" LF D22 | 144 | 144 | 120 | 120 | 120 | 120 | 96（Manual）/78（PV Gen3） | 78（Manual）/54（PV Gen3） |
| Commercial 3/4" RD D23 | 144 | 120 | 120 | 120 | 120 | 120（Manual）/96（PV Gen3） | 96（Manual）/78（PV Gen3） | 78（Manual）/54（PV Gen3） |
| Reception 3/4" LF D56 | 144 | 144 | 144 | 132 | 114 | 96 | 72 | 54 |
| Reception 3/4" RD D57 | 132 | 132 | 132 | 120 | 102 | 90 | 66 | 48 |
| Whisper 3/4" Sheer D8/D9 | 144 | 144 | 120 | 120 | 120 | 120 | 120 | 120 |

（说明：Manual与PowerView Gen 3两行数值在绝大多数面料上完全一致，仅在个别宽度点上原文出现细微差异，已在表中括注标明并提示待核对。1 1/4"褶宽在SkyLift不可用。Commercial面料及1 1/4"褶宽同样不可用于SkyLift Duolite。）

**Min. Width/Height**：Manual: 12"；PowerView® Gen 3: 17"；Min. Height均为12"（两种操作模式一致）。

**Standard Tension Cable Chart（张力缆绳数量对照，原文）**：
- 2根缆绳：宽度12"–35"
- 3根缆绳：宽度35 1/8"–66"
- 4根缆绳：宽度66 1/8"–96"

**Alternate Tension Cable Chart — Heavy and Alustra Fabrics (C93, C94, C95, C96, Y10)**：
- 2根：12"–26"；3根：26 1/8"–50"；4根：50 1/8"–74"；5根：74 1/8"–96"

**可选功能**：Surcharge: Crank handle（曲柄手柄）、Extension pole（从51"延伸至111"）、Duolite、PowerView Gen 3 system and accessories。

**硬件颜色**：785 Aspen White、862 Gardenia White、064 Bronze。

---

### 非操作型 Specialty Shapes（Angles / Arches and Circles / Hexagon-Octagon-Trapezoid）

#### Specialty Shapes – Non-Operable Angles（斜角，第77–83页）

**Applications**：适用斜面（顶部或底部倾斜）窗口开口；所有斜角均不可操作；其中一角必须为90°；多数面料可与EasyRise、LiteRise、UltraGlide或PowerView Gen 3 Automation矩形窗帘共用同一headrail（Stand-Alone为inside mount only；Angle Over Standard Shade为end mount only）。

**Exclusions（原文）**：
- Classic™ room-darkening fabric on Angle 45°至60°坡度
- Whisper™ 1 1/4" sheer fabric
- Stand-Alone Angles作为outside mount (OB)和end mount
- Angle Over Standard Shade作为inside mount和outside mount

**Mounting Requirements（原文）**：Inside Mount Stand-Alone Angles：3/4" Pleat最小凹槽深度1 1/4"，完全嵌入2 3/8"；1 1/4" Pleat最小凹槽深度1 1/2"，完全嵌入3"。Angle Over Rectangular Shade需参照EasyRise/LiteRise/PowerView Gen 3/UltraGlide对应尺寸标准。

**Size Standards（示例）**：Angles 0°–30°坡度 / 30°–45°坡度 / 45°–60°坡度三档，Min. Width均12"，Min. Height均6"。Architella Leela 3/4" LF U24：Max Width 72/60/42（三档坡度）；Max Height均84；Max Area 42/35/24 sq ft。

**面积计算公式（原文）**：W × H（斜角高）× 1/2 ÷ 144 = 面积(sq ft)。

**弧形/斜角通用备注**：Extended Arch的直边高度不应超过宽度的一半；订购宽度加直边高度不能超过最大帘宽；所有arches、circles、angles和specialty shapes均为非操作型（non-operable）。

#### Specialty Shapes – Non-Operable Arches and Circles（弧形/圆形，第84–90页）

**Applications**：适用arch、extended arch、quarter circle、circle形窗口开口；"perfect"弧形（宽为高的两倍）与"imperfect"弧形均可提供；多数面料可与EasyRise/LiteRise/UltraGlide/PowerView Gen 3共用headrail；均为非操作型。

**Exclusions（原文）**：
- ClearView® Sheer fabrics
- Whisper™ 1 1/4" sheer fabric和Whisper 3/4" sheer fabric用于arches和extended arches
- Whisper 1 1/4" sheer fabric用于circles和quarter circles
- Perfect Arch中订购高度不等于订购宽度一半的情况
- Imperfect Arch中订购高度小于订购宽度30%或超过70%的情况
- Extended arches中直边高度超过宽度一半的情况
- Extended arches中订购宽度加直边高度超过最大帘宽的情况

**Mounting Requirements（原文）**：Arches/Extended Arches/Quarter Circles Inside Mount：3/4" Pleat最小凹槽深度1 1/4"，完全嵌入2 3/8"；1 1/4" Pleat最小凹槽深度1 1/2"，完全嵌入3"。Circles Inside Mount最小凹槽深度1"；完全嵌入深度：3/4" Pleat为2 3/8"，1 1/4" Pleat为3"。

**Size Standards（Alustra示例，单位in）**：Arch/Extended Arch/Circle/Quarter Circle四类，Min. Width 18"/18"/12"/12"，Min. Height 9"/9"/12"/12"。Architella Leela 3/4" LF U24：Max Width 50/50/30/60；Max Height：Arch为"1/2 width"（即高度等于宽度一半），Extended Arch为"See Note"，Circle为30，Quarter Circle为60。

**Arches专属注（原文脚注1）**：Height of a perfect arch may not exceed one-half the ordered width；Height of an imperfect arch may not be less than 30% of the ordered width；Height of an imperfect arch may not exceed 70% of the ordered width。

#### Specialty Shapes – Non-Operable（六边形/八边形/梯形，第91–97页）

**Applications**：适用六边形(Hexagon)、八边形(Octagon)、梯形(Trapezoid)窗口开口；所有款式均非操作型；**仅限Inside Mount (IB)**。

**Exclusions（原文）**：
- Outside mount (OB)和end mount (EB)
- 1 1/4" pleat fabrics
- ClearView® sheer fabrics

**附加信息（原文）**：梯形（trapezoids）的较短轨道最大宽度缩减量为每侧9"（"the maximum width reduction of the shorter rail is 9" per side"）。

**Mounting Requirements（原文，All Shapes — Inside Mount Stand，仅3/4" Pleat可用）**：最小凹槽深度1 1/4"；完全嵌入深度2 3/8"。

**Size Standards（Core Line示例，单位in）**：Hexagon/Octagon/Trapezoid三类，Min. Width均8"，Min. Height均8"。Architella Alexa 3/4" LF C93：Max Width 30/30/72；Max Height 30/30/96；Max Area（Trapezoid栏，Hexagon/Octagon无面积上限列）—/—/40（Room Darkening版本C94示例）。

---

### 可操作 PowerView® Gen 3 Automation 斜角/弧形 Specialty Shapes

#### Specialty Shapes – Operable PowerView® Gen 3 Automation Angles（第99–107页）

**Applications**：适用斜面窗口开口；其中一角必须为90°；仅限Inside Mount (IB)。

**Exclusions（原文）**：
- ClearView® Sheer和Whisper Sheer fabrics
- Classic™ room-darkening fabric on Angle 45°至60°坡度
- Stand-Alone Angles作为outside mount (OB)和end mount
- Angle Over Standard Shade作为outside mount

**特殊操作说明（原文）**：由于独特的拉绳走线设计，斜角的矩形部分以正常PowerView窗帘一半的速度运行；一旦矩形部分完全关闭，斜角部分将以全速运行；此速度差不可调节。

**Mounting Requirements（原文，按电源类型和褶宽区分，节选）**：Headrail-Mounted Rechargeable Battery Wand：Inside Mount最小凹槽深度1 1/4"（两种褶宽一致），完全嵌入深度3/4"褶宽为3 1/8"、1 1/4"褶宽为4"。Internal Rechargeable Battery/Satellite Battery Pack/C-Size/DC电源：Inside Mount最小凹槽深度1/2"（两种褶宽一致），完全嵌入深度3/4"褶宽为2 1/4"、1 1/4"褶宽为3 1/8"。

**Size Standards（该系列所有列出面料统一为最大72"×72"）**：所有Extended Angles/Standalone Angles（Left/Right，10°-30°/30°-45°/45°-60°三档坡度）在Alustra和Core Line下，各类面料的Max Width和Max Height均统一为**72"×72"**（原文表格逐面料重复此数值，未见例外，含Whisper Sheer/ClearView Sheer此两种被排除的面料显示为"—"）。Min. Width因mount类型和IRB电源而异，范围在18 1/2"至28"之间（详见原文Min. Width/Min. Width IRB/Min. Top Rail Width各行，因组合较多不逐一列出，核心结论是：**Operable PowerView Gen 3 Angles的尺寸上限固定为72"×72"，与具体面料系列无关（Whisper/ClearView两种排除面料除外）**）。

#### Specialty Shapes – Operable PowerView® Gen 3 Automation Arches（第108–115页）

**Applications**：适用arch和extended arch形窗口开口；"perfect"弧形（宽为高两倍）与"imperfect"弧形均可提供。

**Exclusions（原文）**：
- ClearView® Sheer和Whisper™ Sheer fabrics
- Perfect Arch中订购高度不等于订购宽度一半的情况
- Extended arches中直边高度超过订购高度90%的情况
- Extended arches中直边高度小于（订购高度减去宽度一半）的情况
- Outside mounts

**Mounting Requirements（原文，与Operable Angles相同结构）**：Headrail-Mounted Rechargeable Battery Wand：Inside Mount最小凹槽深度1 1/4"，完全嵌入深度3/4"褶宽3 1/8"、1 1/4"褶宽4"。其他电源：Inside Mount最小凹槽深度1/2"，完全嵌入深度3/4"褶宽2 1/4"、1 1/4"褶宽3 1/8"。

**Size Standards**：所有列出面料的Arch/Extended Arch两栏均统一为**Max Width 72"**；Arch的Max Height为"1/2 width"（高度=宽度一半），Extended Arch的Max Height为72"。Min. Width 18 1/2"（非IRB）/21 1/2"（IRB），Min. Height 9 1/4"。

**弧形注（原文脚注）**：Arches：Height of a perfect arch may not exceed one-half the ordered width。Extended Arch：直边高度必须≥（订购高度－宽度一半）；直边高度不得超过订购高度的90%。

**硬件**：Arch trim颜色661 White Tiara或048 Black。

---

### UltraGlide®（第116–129页）

**Applications**：
- Standard (bottom-up)
- Top-Down
- Top-Down/Bottom-Up
- Duolite®（有外露中间轨道）
- Two-On-One Headrail（仅限standard操作）
- 对于TDBU和Duolite，右侧拉杆(wand)控制中间轨道，左侧拉杆控制底部轨道（除非指定反向控制）

**Exclusions（原文完整）**：
- Two-On-One Headrail as end mount (EB)
- Top-Down/Bottom-Up or Top-Down with Two-On-One Headrail shades
- TrackGlide™
- LightLock®
- LightLock Flex
- End mount (EB) shades over 72" wide

**Duolite Exclusions（原文）**：
- Commercial fabric with D22 as bottom panel and D23 as top panel
- Cannot combine two different pleat sizes
- Architella top panel with single cell bottom panel
- Room-darkening fabric as top panel
- Sheer or Semi-Sheer as a bottom panel
- Light Filtering fabric for both top and bottom panel
- Two-On-One Headrail shades

**Mounting Requirements（原文数字）**：

| 项目 | 3/4" Pleat | 1 1/4" Pleat |
|---|---|---|
| Inside Mount 最小凹槽深度 | 1/2" | 1/2" |
| End Mount 最小凹槽深度 | 1 1/4" | 1 1/4" |
| Inside Mount 完全嵌入深度 | 2 1/4" | 3 1/8" |
| End Mount 完全嵌入深度 | 2 3/8" | （同前，1 1/4"栏未单独区分Inside/End数字） |
| Outside Mount 最小安装面高度 | 1 1/4" | 1 1/4" |

备注（原文）：完全嵌入时，控制侧端帽（control-side end cap）会突出9/16"。

**Size Standards（示例，Core Line）**：
- Min. Width: 12"（Standard/Top-Down）/ 18"（TDBU）/ 12"每panel（Two-On-One）
- Min. Height: 6"（三栏一致）
- Architella Alexa 3/4" LF C93：Max Width 96/144（Standard/TD）、96/144（TDBU）、144（Two-On-One）；Max Height 119；Max Area 73/63（Standard/TD和TDBU）、63/panel
- UltraGlide end mount (EB) shades最大宽度72"；TDBU：24"及以下宽度的最大高度为108"

**可选功能**：No Charge: End mount brackets、Extension brackets、Magnetic hold-down brackets、Reverse controls、Spacer blocks；Surcharge: Cut-outs (standard only)、Duolite、Top-Down、Top-Down/Bottom-Up。

**Wand（拉杆）**：长度12"到84"，以6"为增量可选；推荐长度为headrail到使用者肩膀的距离，四舍五入至最接近的6"增量。

---

### Vertiglide™（第130–143页）

**简介与操作方式**：Vertiglide是一款**侧向（左右）拉动**的蜂巢帘系统，不同于其他系统的上下升降方式。原文描述："Opens and closes from side to side; ideal for sliding glass doors, wide windows, French doors and room dividers"（适合推拉门、宽窗、法式门和房间隔断）。

**堆叠形式（Manual操作提供4种，PowerView Gen 3提供3种）**：
- Manual：1) Left stack（左堆叠）；2) Right stack（右堆叠）；3) Split stack (center opening)（中分对开堆叠）；4) Traveling center stack（移动式中央堆叠）
- PowerView Gen 3 Automation：仅提供 1) Left stack；2) Right stack；3) Split stack（**不提供** Traveling center stack和Duolite）

**Duolite（仅Manual提供）**：中分对开设计，两侧各自可采用不同面料，每侧均可覆盖整个开口宽度。

**Manual Exclusions（原文）**：
- Commercial fabrics
- End mounts (EB)
- Valance returns for Inside Mount (IB) shades

**PowerView Gen 3 Exclusions（原文）**：
- Traveling center stack and Duolite® configurations
- Commercial fabrics
- End mounts (EB)
- Headrail-mounted rechargeable battery wand
- Valance returns for inside mount (IB) shades

**Mounting Requirements — Manual（原文数字）**：

| 项目 | 数值 |
|---|---|
| Inside Mount 最小凹槽深度（所有面料） | 1/2" |
| Inside Mount 完全嵌入深度 — Sydney III valance 3/4" pleat | 3 7/8" |
| Inside Mount 完全嵌入深度 — Sydney III valance 1 1/4" pleat | 4 5/8" |
| Inside Mount 完全嵌入深度 — EverWood® Grandover™ valance 3/4" pleat | 4 1/4" |
| Inside Mount 完全嵌入深度 — EverWood Grandover valance 1 1/4" pleat | 5" |
| Outside Mount 最小安装面高度 | 5/8" |
| 总垂直净空要求 | 1 1/4" |

**Mounting Requirements — PowerView Gen 3（原文数字）**：

| 项目 | 数值 |
|---|---|
| Inside Mount 最小凹槽深度（所有面料） | 1/2" |
| Inside Mount 完全嵌入深度 — Sydney III valance 3/4" pleat | 4" |
| Inside Mount 完全嵌入深度 — Sydney III valance 1 1/4" pleat | 4 3/4" |
| Inside Mount 完全嵌入深度 — EverWood Grandover valance 3/4" pleat | 4 3/8" |
| Inside Mount 完全嵌入深度 — EverWood Grandover valance 1 1/4" pleat | 5 1/8" |
| Outside Mount 最小安装面高度 | 5/8" |
| 总垂直净空要求 | 1 1/4" |

**Size Standards（Alustra示例，单位in）**：
- Min. Width: 12"（Side Stack/Traveling Center/Duolite）/ 32"每panel（Split Stack）/ 32"（PV Gen3 Side Stack）
- Min. Height: 24"（三栏一致）
- Architella Leela 3/4" LF U24：Max Width 72（Side Stack）/144（Split Stack，即2×72）/72（PV Side Stack）；Max Height 120（三栏一致）；Max Area 60/60/panel/60
- Vertiglide Duolite规格按每panel计算；Duolite使用两种面料中较小的最大宽度值

**Split Stack规则（原文）**：宽度可不等分订购，但单个panel宽度不能超过该面料的最大单panel宽度。手动Split Stack设计中，宽度超过168"的窗帘headrail和valance将被拼接（spliced），安装后操作如同单个整体窗帘。PowerView Gen 3 Split Stack设计中，窗帘将配备独立的左右headrail；valance可分开订购或拼接：Aluminum Sydney Valance在split stack总宽超过180"时拼接为两段；Grandover Valance在standalone和split stack总宽超过106"时均拼接为两段。

**堆叠尺寸（原文，见Stacking Heights章节）**：
- Right or left stack (manual)：6 1/2"
- Right or left stack (PowerView Gen 3)：8"
- Split stack, center opening, or Duolite（每侧）：6 1/2"
- Traveling center stack (manual only)：13"

**Valance（帘头）**：Sydney III valance（铝制）高度3 1/8"；EverWood Grandover valance（仿木）高度3 1/4"。Standard Return Lengths：3/4" Sydney III valance 3 1/4"；3/4" EverWood Grandover valance 3 3/8"；1 1/4" Sydney III valance 4"；1 1/4" EverWood Grandover valance 4 1/8"。

**可选功能**：
- Manual Surcharge: Cut-outs（Vertiglide cut-outs仅限固定轨或活动轨，1"进深、最高6"高度）、Duolite、Room divider kit（房间隔断套件，仅IB完全嵌入可用）、Split stack、Traveling center stack
- PowerView Gen 3 Surcharge: Cut-outs、PowerView Gen 3 accessories、Room divider kit、Split stack

---

### Cut-Outs（切角，第144页，属于设计选项而非独立操作系统）

**Applications**：切角用于避开障碍物周边留出净空；切角仅限窗帘底部，可在左侧、右侧或两侧同时开设。

**可用系统（原文完整）**：
- EasyRise™
- PowerView® Gen 3 Automation Standard shades
- UltraGlide® Standard shades
- Vertiglide™ shades

**Exclusions（原文完整，即不可用的场景）**：
- Angles
- Arches
- Duolite® option（除Vertiglide shades外）
- LightLock®
- LightLock Flex
- LiteRise® system
- Sidelights
- Simplicity™
- SkyLift™
- Specialty shapes
- Top-Down
- Top-Down/Bottom-Up
- TrackGlide™
- Two-on-One headrail
- Vertiglide shades less than 60" in height

**Cut-Out Specifications（原文数字）**：
- UltraGlide和PowerView Gen 3：最大宽度3"；最大高度要求"Top of cut-out must be at least 12" away from the top rail"（切角顶部距顶轨至少12"）
- Vertiglide：宽度（必需值）1"（Vertiglide切角唯一可选宽度为1"）；最大高度6"（该高度从地板量至所需切角位置顶部）

---

## 4. 各设计选项（LightLock / LightLock Flex / TrackGlide）详解

> 说明：以下三个设计选项均只是"叠加在 LiteRise® 或 PowerView® Gen 3 Automation 之上的附加功能"，不是独立可单独选购的操作系统本身。

### LightLock®（第145–157页）

**Applications**：可用于LiteRise®或PowerView® Gen 3 Inside Mount窗帘：Duolite®、Standard (bottom-up)、Top-Down (仅PowerView Gen 3)、Top-Down/Bottom-Up。

**Exclusions（原文完整）**：
- 1 1/4" pleat fabrics
- All light-filtering, sheer and semi-sheer fabrics（即**仅room-darkening全遮光面料**可搭配LightLock）
- Outside mount (OB) and end mount (EB)（**仅限Inside Mount**）
- Cut-outs
- EasyRise™
- Vertiglide™
- Two-On-One Headrail shades
- Magnetic hold-down brackets
- Slanted window orientation（倾斜窗户朝向）
- TrackGlide™

**Duolite Exclusions（原文）**：
- Bottom Panel must be room-darkening fabric only
- Fabric combinations with different pleat sizes
- Top panel must be ClearView® Sheer
- 1 1/4" pleat and Commercial fabrics

**Mounting Requirements（原文数字，重点数据——LightLock安装深度）**：

| 电源/系统 | 最小凹槽深度 | 完全嵌入深度 |
|---|---|---|
| LiteRise | 1/2" | 2 1/2" |
| PowerView Gen 3 — High Mount Battery Wand | 1" | 2 7/8" |
| PowerView Gen 3 — Rechargeable Battery Wand | 1 1/4" | 3 1/4" |
| PowerView Gen 3 — Internal Rechargeable Battery | 1/2" | 2 1/2" |

**重要提示（原文）**：为达到最佳遮光效果，安装必须为fully recessed（完全嵌入）。

**颜色（原文）**：侧面导轨(side channels)、底部导轨、顶部/底部端帽提供785 Aspen White、862 Gardenia White、064 Bronze三色（仅外侧部分为指定颜色，内侧始终为黑色）。

**Size Standards（LiteRise + LightLock示例，单位in）**：
- Min. Width: 20"（Standard）/ 22"（TDBU、Duolite）
- Min. Height: 6"（三栏一致）
- 大多数Light Filtering面料在此表中显示为"—"（不可用，因LightLock排除所有非room-darkening面料）
- Architella Alexa 3/4" Room Darkening C94（Core Line示例）：Max Width 90/90/78（Standard/TDBU/Duolite）；Max Height 84；Max Area 53/53/46

**Size Standards（PowerView Gen 3 + LightLock示例，单位in）**：
- Min. Width依电源类型分为SMBW 19"/19"/23 1/2"或26 1/2"（Standard/Top-Down/TDBU或Duolite）；IRB 24 1/2"或25 1/2"/25 1/2"或26 1/2"/30 1/2"或33 1/2"；HMRBW 22"/22"/23 1/2"或26 1/2"；HMBW 23"/23"/23 1/2"或26 1/2"
- Min. Height：6"（Standard/Top-Down）；12"（TDBU/Duolite）
- 备注（原文）：Larger shades may require an additional motor（更大尺寸的窗帘可能需要额外电机，此情况下会自动免费包含额外碱性电池棒或卫星电池包）

---

### LightLock® Flex（第158–170页）

**Applications**：可用于LiteRise®或PowerView® Gen 3 Inside Mount窗帘：Standard (bottom-up)、Top-Down (仅PowerView Gen 3)、Top-Down/Bottom-Up。**可作为改装(retrofit)选项单独订购**。

**Exclusions（原文完整）**：
- 1 1/4" pleat fabrics
- All light-filtering, sheer and semi-sheer fabrics
- Outside mount (OB) and end mount (EB)
- Cut-outs
- EasyRise™
- UltraGlide®
- Vertiglide™
- **Duolite®**（注意：LightLock Flex**不支持**Duolite，这与LightLock可支持Duolite不同）
- Two-On-One Headrail shades
- Magnetic hold-down brackets
- Slanted window orientation
- TrackGlide™

**Mounting Requirements（原文数字）**：

| 电源/系统 | 最小凹槽深度 | 完全嵌入深度 |
|---|---|---|
| LiteRise | 3/4" | 2 1/2" |
| PowerView Gen 3 — High Mount Battery Wand | 1 1/4" | 2 7/8" |
| PowerView Gen 3 — Rechargeable Battery Wand | 1 1/2" | 3 1/4" |
| PowerView Gen 3 — Internal Rechargeable Battery | 3/4" | 2 1/2" |

**Retrofit（改装）说明（原文）**：LightLock Flex改装最小凹槽深度为3/4"，但可能因原操作系统要求而更大（例如PowerView Gen 3 IRB保持在1/2"，但LiteRise需提升到3/4"；此凹槽深度要求对新装和改装LightLock Flex均适用）。改装LightLock Flex的宽度要求：窗帘两侧各需2枚镍币宽度（约1/8"缝隙），从底部轨道量至墙面，此为最小间隙且须在整个窗帘行程范围内验证。

**颜色（原文）**：侧面导轨和底部导轨提供048 Black、064 Bronze、221 Aspen Snow、320 Rich Cream、661 White Tiara、785 Aspen White六色。建议定制颜色时订购661 White Tiara并对外侧导轨喷漆。

**Size Standards结构与LightLock类似**（Duolite栏因不支持而完全没有此列）。

---

### TrackGlide™（第171–184页）

**Applications**：适合可倾斜或旋转打开的法式门(French doors)和矩形窗户（倾斜角度不超过15°）；可用于LiteRise®或PowerView® Gen 3 Automation窗帘：Standard (bottom-up)、Top-Down (仅PowerView Gen 3)、Top-Down/Bottom-Up、Duolite®；轨道必须平行；仅支持所有3/4"褶宽面料。

**Exclusions（原文完整）**：
- All 1 1/4" pleat fabrics
- All operating systems except for LiteRise and PowerView Gen 3
- Two-On-One Headrail
- Cut-outs
- Magnetic hold-down brackets
- Skylight window application with tilt exceeding 15° from vertical
- LightLock® and LightLock Flex

**Duolite Exclusions（原文）**：
- TrackGlide Duolite Top Panel must be Whisper™ Sheer or ClearView® Sheer fabric with light-filtering or room-darkening fabric as the bottom panel only
- Fabric combinations with different pleat sizes
- 1 1/4" pleat and Commercial fabrics

**Mounting Requirements（原文数字）**：

| 项目 | 数值 |
|---|---|
| Inside Mount 最小凹槽深度 | 0" |
| Inside Mount 完全嵌入深度 — Standard Track | 2 1/2" |
| Inside Mount 完全嵌入深度 — Extended Track | 3 1/8" |
| Inside Mount 最小安装面宽度 | 1/2" |
| Outside Mount 最小安装面高度 | 18"（因轨道贯穿窗帘全部订购高度） |
| Track Spacing 最小距离（内边缘到内边缘） | 7" |
| Track Spacing 最大距离 | 窗帘宽度 + 1" |

**Extended Track说明（原文）**：LiteRise和PowerView Gen 3 IRB窗帘默认为Standard Track；若需要避开法式门大型装饰边框的净空，可选择"extended track"；对于使用IRB以外电源的PowerView Gen 3窗帘，因headrail后方安装电池棒，则extended track为必需项（非可选）。

**Size Standards（LiteRise + TrackGlide示例，单位in）**：
- Min. Width: 18"/20"（Standard，TDBU分别为18"/20"，脚注说明TrackGlide+LiteRise standard最小宽度18"，TDBU最小宽度20"）/20"（Duolite）
- Min. Height: 18"（两栏一致，注意TrackGlide最小高度比LiteRise单独使用时的6"更高）
- Architella Leela 3/4" LF U24：Max Width 60（两栏一致）；Max Height 84；Max Area 35 sq ft（两栏一致）— **注意TrackGlide大幅限缩最大宽度（普通LiteRise可达90-120"+，TrackGlide限制在60"）**

**Size Standards（PowerView Gen 3 + TrackGlide示例，单位in）**：
- Min. Height均为18"（Standard/Top-Down/TDBU/Duolite四栏一致）
- Max Width 普遍限制在60"（各面料一致）

**硬件**：包含Bracket kits、Rail clips/track clips、Track end caps、两条带胶侧轨(side tracks with adhesive)。颜色：轨道/端帽/手柄与面料协调；侧轨、rail clips、track clips提供5色：Black、Brass、Bronze、Pewter、White。

---

## 5. Mounting Requirements 总表（跨系统快速对比）

> 客服常见问题"我的窗框只有X寸深能不能装"——以下汇总各系统在Inside Mount (IB)下的最小凹槽深度（Minimum casement depth）与完全嵌入(fully recessed)深度要求。单位均为英寸(in)。

| 操作系统 | 3/4" Pleat 最小IB深度 | 3/4" Pleat 完全嵌入深度 | 1 1/4" Pleat 最小IB深度 | 1 1/4" Pleat 完全嵌入深度 | Outside Mount 最小安装面高度 |
|---|---|---|---|---|---|
| EasyRise™ | 1/2" | 2 1/4" | 1/2" | 3 1/8" | 1 1/4" |
| LiteRise® | 1/2" | 2 1/4" | 1/2" | 3 1/8" | 1 1/4" |
| PowerView Gen 3（High Mount Battery Wand标配电源） | 1" | 2 3/4" | 1" | 3 1/2" | 1 1/4" |
| PowerView Gen 3（Headrail-Mounted Rechargeable Battery Wand） | 1 1/4" | 3 1/8" | 1 1/4" | 4" | 1 1/4" |
| PowerView Gen 3（IRB/卫星电池/DC电源） | 1/2" | 2 1/4" | 1/2" | 3 1/8" | 1 1/4" |
| Sidelights | 1/2" | 2 3/8" | 1/2" | 3" | 5/8" |
| Simplicity™（仅3/4"可用） | 1 1/4" | 2 1/2" | 不适用 | 不适用 | 1" |
| SkyLift™（仅3/4"可用，Manual与PV Gen3≥38"宽） | 2 1/2" | ⚠️待核对（原文未单列fully recessed数字，仅给出Minimum casement depth） | 不适用 | 不适用 | 1 1/4" |
| SkyLift™（PV Gen3 <38"宽） | 4 1/2"（若电池包装于底部轨道后方） | 同上 | 不适用 | 不适用 | 1 1/4" |
| UltraGlide® | 1/2" | 2 1/4" | 1/2" | 3 1/8" | 1 1/4" |
| Vertiglide™（Manual，Sydney III valance） | 1/2" | 3 7/8" | 1/2" | 4 5/8" | 5/8" |
| Vertiglide™（Manual，EverWood Grandover valance） | 1/2" | 4 1/4" | 1/2" | 5" | 5/8" |
| Vertiglide™（PowerView Gen 3，Sydney III valance） | 1/2" | 4" | 1/2" | 4 3/4" | 5/8" |
| Vertiglide™（PowerView Gen 3，EverWood Grandover valance） | 1/2" | 4 3/8" | 1/2" | 5 1/8" | 5/8" |
| Specialty Shapes – Non-Op Angles（Stand-Alone） | 1 1/4" | 2 3/8" | 1 1/2" | 3" | 不适用（OB排除） |
| Specialty Shapes – Non-Op Arches/Ext.Arches/Qtr Circles | 1 1/4" | 2 3/8" | 1 1/2" | 3" | 不适用 |
| Specialty Shapes – Non-Op Circles | 1"（两褶宽一致） | 2 3/8"（3/4"）/3"（1 1/4"） | 见前列 | 见前列 | 不适用 |
| Specialty Shapes – Non-Op Hexagon/Octagon/Trapezoid（仅3/4"可用） | 1 1/4" | 2 3/8" | 不适用（排除） | 不适用 | 不适用（OB排除） |
| Specialty Shapes – Operable PV Gen3 Angles（Headrail电池棒） | 1 1/4" | 3 1/8"（3/4"）/4"（1 1/4"） | 见前列 | 见前列 | 不适用 |
| Specialty Shapes – Operable PV Gen3 Angles（IRB/卫星/DC电源） | 1/2" | 2 1/4"（3/4"）/3 1/8"（1 1/4"） | 见前列 | 见前列 | 不适用 |
| Specialty Shapes – Operable PV Gen3 Arches（同Angles结构） | 同上 | 同上 | 同上 | 同上 | 不适用（OB排除） |
| TrackGlide™（叠加于LiteRise/PowerView Gen3之上，仅3/4"可用） | 0" | 2 1/2"（Standard Track）/3 1/8"（Extended Track） | 不适用（排除） | 不适用 | 18"（因轨道贯穿全高） |
| LightLock®（叠加于LiteRise/PowerView Gen3之上，仅Inside Mount） | LiteRise: 1/2"；PV Gen3 High Mount: 1"；PV Gen3 Rechargeable Wand: 1 1/4"；PV Gen3 IRB: 1/2" | LiteRise: 2 1/2"；PV High Mount: 2 7/8"；PV Rechargeable Wand: 3 1/4"；PV IRB: 2 1/2" | 不适用（排除1 1/4"pleat） | 不适用 | 不适用（OB排除） |
| LightLock® Flex（同上结构） | LiteRise: 3/4"；PV High Mount: 1 1/4"；PV Rechargeable Wand: 1 1/2"；PV IRB: 3/4" | LiteRise: 2 1/2"；PV High Mount: 2 7/8"；PV Rechargeable Wand: 3 1/4"；PV IRB: 2 1/2" | 不适用 | 不适用 | 不适用（OB排除） |

**End Mount (EB)专项数据（原文，仅部分系统支持）**：

| 系统 | 3/4" Pleat 最小EB深度 | 1 1/4" Pleat 最小EB深度 | 3/4" Pleat EB完全嵌入深度 |
|---|---|---|---|
| EasyRise™ | 1 1/4" | 1 1/4" | 2 3/8" |
| LiteRise® | 1 1/4" | 1 1/4" | 2 3/8" |
| UltraGlide® | 1 1/4" | 1 1/4" | 2 3/8" |
| PowerView Gen 3（High Mount标配电源） | 1 3/4"（两褶宽一致） | 1 3/4" | 未单独列出，参考Fully Recessed(B)行 |
| PowerView Gen 3（Headrail-Mounted Rechargeable Battery Wand） | 2" | 2" | 同上 |

注：所有系统End Mount (EB)均限最大宽度72"（Bottom-Up标准操作，见各系统章节）。

---

## 6. Size Standards 总表/索引与超宽替代方案

由于面料系列数量众多（150种色号 × 多个opacity × 多个褶宽的组合），本节仅提供最常用系列在各系统下的关键数值索引，完整数字请查阅第3节各系统小节或ALL_SPEC.txt原文对应页码。

### 常用系列关键尺寸索引（Standard/Bottom-Up栏，单位in，⚠️Two-On-One Headrail等分栏请见第3节详表）

| 系列 | EasyRise Max W/H/Area | LiteRise Max W/H/Area | PowerView Gen3 Max W/H/Area | UltraGlide Max W/H/Area |
|---|---|---|---|---|
| Architella Leela 3/4" LF U24 | 96/174 · 91 · 59/46 | 96 · 84 · 56 | 96/144 · 91 · 59/51 | 96/144 · 91 · 59/51 |
| Architella Leela 1 1/4" LF U44 | 72/174 · 144 · 72/42 | 102 · 84 · 60 | 72/144 · 144 · 72/52 | 72/144 · 144 · 72/52 |
| Architella Elan 3/4" LF C22 | 108/174 · 144 · 104/85 | 120 · 84 · 70 | 108/144 · 144 · 104/94 | 108/144 · 144 · 104/94 |
| Architella Elan 1 1/4" LF C42 | 108/174 · 144 · 108/78 | 120 · 84 · 70 | 108/144 · 144 · 108/91 | 108/144 · 144 · 108/91 |
| Classic 3/4" LF D2 | 174 · 144 · 174 | 120 · 84 · 70 | 144 · 144 · 144 | 144 · 144 · 144 |
| Whisper 3/4" Sheer D8/D9 | 174 · 144 · 174 | 120 · 84 · 70 | 144 · 144 · 144 | 144 · 144 · 144 |
| ClearView 3/4" Sheer V01 | 174 · 144 · 174 | 120 · 84 · 70 | 144 · 144 · 144 | 144 · 144 · 144 |

（说明：EasyRise和UltraGlide最大宽度普遍可达174"，是因为可利用Two-On-One Headrail双帘拼接方式；LiteRise和PowerView Gen 3的单帘宽度上限一般在90"-144"之间，具体取决于面料。）

### 超宽窗户替代方案（原文明确提及的机制）

1. **Two-On-One Headrail（双帘共轨）**：EasyRise和UltraGlide支持在同一headrail上安装两片独立窗帘，每片按"每panel"计算宽度上限（如Architella Leela 3/4" LF在Two-On-One Headrail下每panel最大174"，即两片可达348"总宽度，但仅EasyRise/UltraGlide支持，且**不支持TDBU或Duolite**，也**不能作为End Mount**）。
2. **Vertiglide™ Split Stack（中分对开）**：单个系统最大可订购至336"宽（Alustra Classic等面料每panel最大168"×2），超过168"会被制作成两个独立窗帘拼接，安装后操作如同单个整体窗帘。
3. **Vertiglide™ PowerView Gen 3 Split Stack**：会配备独立左右headrail；帘头(valance)超过180"（Aluminum Sydney）或106"（Grandover）会拼接为两段。
4. **SkyLift™ Width To 分段表**：随着宽度增加，最大允许高度会相应降低（见第3节SkyLift表），这不是"替代方案"而是同一系统内的宽高反比约束，客户需按目标宽度先查对应最大高度上限。

---

## 7. 设计选项：Top-Down/Bottom-Up、Duolite、Specialty Shapes、Cut-Outs 汇总

### 7.1 Top-Down/Bottom-Up (TDBU)

支持TDBU的系统：EasyRise™、LiteRise®、PowerView® Gen 3 Automation、UltraGlide®（原文product overview表格中"Top-Down/Bottom-Up"一行标注这四个系统为"•"，Simplicity/SkyLift/Vertiglide为"–"）。

支持纯"Top-Down"（非TDBU，仅顶降）的系统：仅**PowerView® Gen 3 Automation**（原文Applications表格"Top-Down"行仅PowerView Gen 3标注"•"）。Sidelights的Operable Option中也包含"Top-Down*"选项（*需加价）。

### 7.2 Duolite®（双层面料）

**定义**：Duolite是在同一窗帘内叠加两层不同面料（通常上层为sheer/semi-sheer透光面料，下层为light-filtering/room-darkening面料），中间有一条可见的middle rail（中间轨道），可分别独立升降控制两层面料，实现"日夜双重效果"。

**支持Duolite的系统**：EasyRise™、LiteRise®、PowerView® Gen 3 Automation、SkyLift™、UltraGlide®、Vertiglide™（仅Manual，PowerView Gen 3 Vertiglide不支持）。**不支持Duolite的系统**：Sidelights、Simplicity™（原文Applications总表中这两个系统的Duolite一栏为"–"）。TrackGlide和LightLock均可搭配Duolite（"TrackGlide and LightLock are available with Duolite shades"，原文脚注1）；LightLock Flex**不支持**Duolite。

**通用排除规则（各系统略有差异，但核心规则重复出现）**：
- Fabric combinations with different pleat sizes（顶底面料褶宽必须一致）
- Architella top panel with single cell bottom panel（Architella面料不可作上层、单蜂巢面料作下层的组合，此规则出现在EasyRise/PowerView Gen 3/UltraGlide中；LiteRise相关表述略有不同）
- Room-darkening fabric as top panel（room-darkening面料不可作上层）
- Sheer or Semi-Sheer as a bottom panel（sheer或semi-sheer面料不可作下层）
- Light-filtering fabric for both top and bottom panel（顶底不可同为light-filtering）
- Commercial fabrics专项规则：EasyRise/PowerView Gen 3/UltraGlide要求Commercial面料必须"D22作为上层、D23作为下层"
- LiteRise/TrackGlide Duolite专项规则：上层必须为Whisper™ Sheer或ClearView® Sheer面料，下层为light-filtering或room-darkening面料
- SkyLift Duolite专项规则（与其他系统相反——**下层**必须为Whisper™ Sheer或ClearView® Sheer面料，配**上层**为semi-sheer、light-filtering或room-darkening面料
- LightLock Duolite专项规则：上层必须为ClearView® Sheer面料，下层必须为room-darkening面料

**尺寸计算规则（原文各章节反复出现）**：Duolite最大尺寸取顶层和底层两种面料各自最大尺寸的交集（"Duolite maximum size is the intersection of the desired top and bottom panel fabrics"）；LiteRise/UltraGlide的Duolite使用底层面料的面积作为最大尺寸规格依据（"use the area of the bottom panel for the maximum size specifications"）；Vertiglide Duolite使用两种面料中较小的最大宽度值。

**Duolite硬件颜色规则（原文，见Ordering Notes通用章节）**：Duolite硬件默认与下层(bottom panel)面料颜色协调（"Duolite Hardware coordinated to bottom panel fabric"）。

### 7.3 Specialty Shapes 汇总

| 类型 | 是否可操作 | 支持系统 | 关键限制 |
|---|---|---|---|
| Non-Operable Angles（斜角） | 否 | 可与EasyRise/LiteRise/UltraGlide/PowerView Gen3共用headrail（Angle Over Standard Shade） | 一角必须90°；Classic RD不可用于45°-60°坡度；Whisper 1 1/4" Sheer排除 |
| Non-Operable Arches and Circles（弧形/圆形） | 否 | 同上 | ClearView Sheer排除；Whisper 1 1/4" Sheer多数场景排除；perfect弧形高度必须=宽度一半 |
| Non-Operable Hexagon/Octagon/Trapezoid | 否 | 独立系统，仅Inside Mount | 仅3/4"pleat；ClearView Sheer排除；梯形短轨最大缩减9"/侧 |
| Operable PowerView Gen 3 Angles | 是（PowerView Gen 3自动化） | 独立/或Extended（与矩形帘共headrail的斜角段） | ClearView/Whisper Sheer排除；斜角段与矩形段速度不同步（各自固定半速/全速） |
| Operable PowerView Gen 3 Arches | 是 | 同上 | ClearView/Whisper Sheer排除；仅Inside Mount（排除Outside Mount） |

**天窗（Skylight）相关**：SkyLift™系统本身即为天窗设计的专用系统（最小倾角需距水平10°）；Simplicity™也可用于天窗，宽度超36"需support cord，超42"需rail stiffener；Non-Operable Arches不可安装在SkyLift之上（"Arches over SkyLift"被列为SkyLift的Exclusions之一）。

### 7.4 Cut-Outs 汇总

见第3节"Cut-Outs"小节完整内容。核心结论：仅EasyRise、PowerView Gen 3 Standard、UltraGlide Standard、Vertiglide四个系统/配置支持Cut-Outs；且均只能用于Standard (Bottom-Up)配置，不可与TDBU、Duolite（Vertiglide除外）、Two-On-One Headrail、LightLock/LightLock Flex/TrackGlide等选项同时使用。

---

## 8. 硬件颜色与面料协调规则

⚠️**重要说明**：本节数据来自独立提供的 `hardware_colors.json` 结构化文件，注明来源页码为"第38、39、40页"。但经与ALL_SPEC.txt原文逐页核对，**ALL_SPEC.txt文件的第38-40页（page_038.txt至page_040.txt）实际内容是"PowerView® Gen 3 Automation Size Standards"章节（Core Line面料尺寸表），并非硬件颜色页**。因此可以判断：hardware_colors.json所引用的"第38/39/40页"来自**另一份独立的通用《Hardware Color Guide》文档**（该文档在ALL_SPEC.txt全文中被反复以"Refer to the Hardware Color Guide for coordinating hardware colors"的措辞引用，但其具体内容和页码编排**不在本184页Duette规格书文件内**）。因此，第40页"硬件颜色与面料协调 coordination chart"的具体规则文字**无法从ALL_SPEC.txt中找到并核实**，本节颜色列表数据来自hardware_colors.json，规则性文字（如"协调表"的具体对应逻辑）暂缺，标记为资料未提及（需以官方独立Hardware Color Guide文档为准）。

### 8.1 主色板（34色，据hardware_colors.json标注为"第38页"）

V = 标注为"Horizontal and Vertical"通用（即可同时用于横向和纵向产品线的硬件）

| 色号 | 颜色名 | V(横竖通用) |
|---|---|---|
| 048 | Black | V |
| 082 | Camel | V |
| 135 | Whispering Heather | — |
| 180 | Dove Gray | V |
| 202 | Paprika | — |
| 205 | Fawn | — |
| 218 | Peppercorn | — |
| 219 | Eiffel Tower | — |
| 221 | Aspen Snow | — |
| 222 | Bliss | — |
| 276 | Silverado | V |
| 320 | Rich Cream | V |
| 323 | Pumpkin | V |
| 324 | Stone | V |
| 405 | Gray Flannel | — |
| 478 | Winter Pear | — |
| 496 | Twilight | V |
| 502 | Glaze | — |
| 575 | Gray Cloud | — |
| 580 | Midnight Oil | V |
| 609 | Falcon Gray | — |
| 661 | White Tiara | V |
| 669 | Beijing Gray | — |
| 683 | Pearl | — |
| 685 | Blue Sky | V |
| 689 | Ash | — |
| 758 | Shimmering Ocean | V |
| 785 | Aspen White | V |
| 810 | Mushroom | V |
| 841 | Dark Blonde | V |
| 849 | Mocha | — |
| 862 | Gardenia White | V |
| 878 | Frosted Ice | V |
| 882 | Honey Bisque | V |

### 8.2 系统专属色（4色，据hardware_colors.json标注为"第39页"）

| 色号 | 颜色名 | 专属系统 |
|---|---|---|
| 064 | Bronze | TrackGlide / LightLock |
| 520 | Brass | LightLock Flex |
| 528 | Bronze | LightLock Flex |
| 534 | Pewter | LightLock Flex |

### 8.3 系统兼容硬件颜色白名单（据hardware_colors.json，并与ALL_SPEC.txt原文各系统Ordering Notes章节交叉核实一致）

- **LightLock®**：785 Aspen White、862 Gardenia White、064 Bronze（此白名单已在ALL_SPEC.txt第34页/49页/156页的LiteRise/PowerView Gen 3 Ordering Notes中逐字核实一致："Side channels, bottom channel, top and bottom end caps are available in 785 Aspen White, 862 Gardenia White and 064 Bronze"）
- **LightLock® Flex**：048 Black、064 Bronze、221 Aspen Snow、320 Rich Cream、661 White Tiara、785 Aspen White（同样在ALL_SPEC.txt第34页/49页原文核实一致；hardware_colors.json列出"785 White"，与ALL_SPEC原文"785 Aspen White"应为同一色号简称，⚠️待核对：hardware_colors.json中LightLock Flex白名单少了"221 Aspen Snow, 320 Rich Cream, 661 White Tiara"具体是否遗漏，请以ALL_SPEC.txt原文六色列表为准）
- **TrackGlide™**：064 Bronze、785 Aspen White、862 Gardenia White（原文ALL_SPEC.txt第34页/49页/182页对TrackGlide硬件颜色的描述为"Side tracks, rail clips and track clips are available in five colors: Black, Brass, Bronze, Pewter or White"，即TrackGlide的**侧轨/rail clips/track clips**实际是5色可选（Black/Brass/Bronze/Pewter/White），与hardware_colors.json列出的"TrackGlide白名单3色（064 Bronze/785 Aspen White/862 Gardenia White）"**不完全一致**——⚠️待核对：ALL_SPEC.txt原文182页明确写"available in five colors: Black, Brass, Bronze, Pewter or White"，而hardware_colors.json的白名单可能针对的是"轨道主体color"而非"side tracks/rail clips/track clips"这类配件色，两者可能是TrackGlide不同硬件部件对应不同色卡范围，需要向硬件颜色指南原始文档确认）

### 8.4 各系统硬件颜色小结（从ALL_SPEC.txt原文逐条核实）

| 系统/选项 | 颜色范围（原文原话） |
|---|---|
| EasyRise/LiteRise/PowerView Gen3/UltraGlide 标准硬件 | 轨道和端帽默认与面料颜色协调；可免费Hardware color override |
| Magnetic Hold-Down Brackets | Black、Brass、Bronze、Pewter、White（5色） |
| EasyRise Universal Cord Tensioner | 048 Black、320 Rich Cream、661 White Tiara、689 Ash、903 Desert Gold（对应Dark Blonde 841） |
| Simplicity™ | 仅785 Aspen White（轨道、侧轨和手柄） |
| SkyLift™ | 785 Aspen White、862 Gardenia White、064 Bronze |
| Vertiglide™ EverWood Grandover valance | 标准色975 Winter White；另可选Distinctions™和TruGrain®系列色 |
| Specialty Shapes Operable Arches | Arch trim颜色661 White Tiara或048 Black |

---

## 9. Child Safety（儿童安全）相关信息

原文Introduction段落提到"Duette® Honeycomb Shades offer the finest in operating ease and **enhanced child safety**"（增强型儿童安全），但ALL_SPEC.txt全文中与"child safety"直接相关的具体规则文字，仅在**EasyRise™**章节找到明确表述：

> "In accordance with the revised American National Standard for Safety of Corded Window Covering Products, EasyRise™ shades require proper mounting of the **cord tensioner** for the product to function properly. The cord tensioner should not be modified in any way."
>（根据修订版美国国家《有绳窗帘产品安全标准》，EasyRise™窗帘要求正确安装拉绳张力器(cord tensioner)才能正常工作。该张力器不得以任何方式改装。）

- **Cord Tensioner（拉绳张力器）**：仅在EasyRise系统的Ordering Notes中提到需要选择"Universal Cord Tensioner Color"（048 Black、320 Rich Cream、661 White Tiara、689 Ash、903 Desert Gold五色可选），并配有"Cord tensioner mounting kit"作为标配硬件。
- **无绳设计（Cordless）**：LiteRise®、PowerView® Gen 3 Automation（遥控/自动化）、UltraGlide®（拉杆式wand而非拉绳）、Sidelights的"Cordless Operable"选项、Simplicity™（手柄操作）、SkyLift™（曲柄/自动化）、Vertiglide™（手柄操作）等系统均**非拉绳操作**，天然规避了传统拉绳缠绕风险，但ALL_SPEC.txt原文并未对这些系统使用"child safety"字样明确背书，仅EasyRise章节有此专门的安全合规提示文字。
- 资料未提及：ALL_SPEC.txt全文未出现"cord tensioner"以外的其他儿童安全专项条款（如CPSC认证编号、具体安全测试标准细则等），如需更完整的儿童安全认证信息，建议查阅Hunter Douglas官方Child Safety相关的独立文档。

---

## 10. 关于 SoftTouch 与 3/8" Pleat 的专项核实说明

### 10.1 SoftTouch

已对ALL_SPEC.txt全文（24392行/184页）进行完整关键词检索，**"SoftTouch"一词未在本文件中出现任何一次**。因此可以明确结论：**本184页Duette Honeycomb Shades Product Specifications Guide（DU_PS_US_JAN2026）中不包含SoftTouch相关内容，资料未提及**。若客户询问SoftTouch功能是否适用于Duette产品线，应告知目前官方Duette规格书未收录该功能名称，建议进一步向产品团队或最新版资料确认（SoftTouch常见于Hunter Douglas其他产品线如卷帘/百叶帘的操作机制命名，但未在本Duette蜂巢帘184页规格书中出现）。

### 10.2 3/8" Pleat（3/8英寸褶宽）

已确认3/8"褶宽**曾经存在**于Duette产品线（体现在fabrics.json的"Architella Classic (3⁄8\", 3/4\" single, 3/4\")"集合命名和历史色卡数据中），但ALL_SPEC.txt原文第5页Revision History明确记载：

> "1/1/26　3⁄8" pleat size discontinued.　Various"

以及Fabric Discontinuation History：

> "1/1/26　Classic 3⁄8" Light Filtering D1　Various"
> "1/1/26　Classic 3⁄8" Room Darkening H7　Various"

**结论**：截至本规格书生效日期（2026年1月20日），**3/8"褶宽已经停产**，包括其对应的Classic 3⁄8" Light Filtering (D1)和Classic 3⁄8" Room Darkening (H7)两款面料。因此本知识库第2节"面料系列一览表"中列出的"Architella Classic (3⁄8\", 3/4\" single, 3/4\")"系列，其3/8"部分应视为历史遗留/已停产状态，实际销售中不应再向客户推荐3/8"褶宽产品。全文档搜索也确认，除该停产说明和历史面料集合命名外，**正文所有Size Standards、Mounting Requirements等技术规格表格中均未出现任何3/8"褶宽的独立尺寸限值数据**（所有Size Standards表格仅呈现3/4"和1 1/4"两种褶宽）。

---

## 价格表

价格表见本文件末尾附录（附录内容将程序化拼接）。


---

# 附录:官方价格表(程序化提取,数字以此为准)

> 来源:Hunter Douglas US Price Guide (JAN 2026)。表格为 USD 标价(list price),实际零售价以经销商折扣为准。


<!-- pricing: duette -->
# duette — 官方价格数据
来源: HD_PG_US_JAN2026_01212026.pdf 页码: 34-43
Duette Honeycomb Shades pricing data extracted from HD_PG_US_JAN2026 pages 34-43.

### 价格表 DU-LF1
- 适用面料: Reception 3⁄4"  (代码: D56)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 243 | 273 | 311 | 383 | 456 | 524 | 603 | 673 | 745 | 821 | 889 | 959 | 1031 | 1136 | 1158 |
| **48** | 276 | 317 | 362 | 453 | 544 | 630 | 721 | 880 | 895 | 1070 | 1075 | 1247 | 1253 | 1383 | 1412 |
| **60** | 315 | 364 | 421 | 522 | 630 | 743 | 852 | 1045 | 1070 | 1277 | 1283 | 1491 | 1498 | 1655 | 1688 |
| **72** | 349 | 412 | 473 | 592 | 711 | 857 | 980 | 1200 | 1233 | 1471 | 1481 | 1718 | 1726 | 1911 | 1949 |
| **84** | 386 | 456 | 524 | 671 | 806 | 967 | 1110 | 1365 | 1407 | 1682 | 1691 | 1974 | 1983 | 2198 | 2242 |
| **96** | 424 | 503 | 585 | 745 | 905 | 1078 | 1243 | 1534 | 1574 | 1892 | 1913 | 2227 | 2241 | 2482 | 2533 |
| **108** | 462 | 550 | 635 | 820 | 1000 | 1179 | 1362 | 1681 | 1727 | 2076 | 2098 | 2446 | 2460 | 2730 | 2785 |
| **120** | 499 | 594 | 692 | 899 | 1098 | 1294 | 1504 | 1855 | 1902 | 2308 | 2318 | 2709 | 2719 | 3021 | 3082 |
| **132** | 537 | 684 | 805 | 1049 | 1285 | 1529 | 1768 | 2024 | 2239 | 2519 | 2729 | 3003 | 3209 | 3551 | 3568 |
| **144** | 570 | 685 | 806 | 1052 | 1290 | 1534 | 1774 | 2191 | 2248 | 2722 | 2737 | 3203 | 3220 | 3567 | 3573 |

### 价格表 DU-LF2
- 适用面料: Architella® Reception 3⁄4", Classic 3⁄4", Commercial 3⁄4"  (代码: C56, D2, D22)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 316 | 360 | 407 | 512 | 604 | 701 | 797 | 894 | 992 | 1099 | 1197 | 1300 | 1403 | 1547 | 1579 |
| **48** | 363 | 417 | 474 | 600 | 717 | 838 | 961 | 1179 | 1197 | 1437 | 1446 | 1689 | 1698 | 1880 | 1918 |
| **60** | 412 | 473 | 547 | 686 | 826 | 974 | 1116 | 1381 | 1401 | 1685 | 1696 | 1991 | 2002 | 2211 | 2255 |
| **72** | 459 | 529 | 611 | 779 | 939 | 1110 | 1276 | 1573 | 1607 | 1933 | 1949 | 2288 | 2297 | 2545 | 2595 |
| **84** | 497 | 585 | 683 | 867 | 1049 | 1238 | 1428 | 1762 | 1800 | 2162 | 2185 | 2563 | 2579 | 2862 | 2919 |
| **96** | 533 | 637 | 740 | 952 | 1157 | 1370 | 1578 | 1951 | 1994 | 2394 | 2424 | 2841 | 2864 | 3177 | 3240 |
| **108** | 582 | 690 | 804 | 1037 | 1267 | 1494 | 1724 | 2134 | 2187 | 2629 | 2664 | 3119 | 3147 | 3504 | 3574 |
| **120** | 622 | 744 | 870 | 1119 | 1373 | 1623 | 1878 | 2325 | 2380 | 2877 | 2906 | 3419 | 3432 | 3823 | 3898 |
| **132** | 662 | 848 | 997 | 1290 | 1581 | 1880 | 2178 | 2513 | 2756 | 3112 | 3364 | 3736 | 3988 | 4412 | 4431 |
| **144** | 703 | 849 | 998 | 1294 | 1587 | 1885 | 2183 | 2701 | 2764 | 3342 | 3374 | 3978 | 3998 | 4431 | 4438 |

### 价格表 DU-LF3
- 适用面料: Architella® Classic™ 3⁄4", Architella Elan® 3⁄4", Architella Elan 11⁄4", Architella Elan® Metallic 3⁄4", Architella Elan Metallic 11⁄4", Whisper™ Sheer 3⁄4", Whisper Sheer 11⁄4"  (代码: C50, C22, C42, C22, C42)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 375 | 423 | 482 | 601 | 706 | 820 | 936 | 1049 | 1172 | 1278 | 1391 | 1503 | 1615 | 1777 | 1812 |
| **48** | 425 | 492 | 567 | 707 | 851 | 990 | 1127 | 1385 | 1424 | 1689 | 1699 | 1974 | 1985 | 2184 | 2227 |
| **60** | 484 | 564 | 655 | 823 | 983 | 1155 | 1320 | 1620 | 1668 | 1987 | 1998 | 2332 | 2344 | 2593 | 2644 |
| **72** | 541 | 630 | 731 | 924 | 1112 | 1316 | 1513 | 1855 | 1903 | 2289 | 2309 | 2708 | 2721 | 3000 | 3060 |
| **84** | 604 | 706 | 826 | 1042 | 1258 | 1485 | 1703 | 2110 | 2168 | 2595 | 2652 | 3109 | 3123 | 3434 | 3502 |
| **96** | 663 | 783 | 913 | 1172 | 1425 | 1662 | 1907 | 2361 | 2430 | 2913 | 2981 | 3474 | 3502 | 3863 | 3940 |
| **108** | 704 | 845 | 992 | 1279 | 1564 | 1833 | 2113 | 2617 | 2685 | 3233 | 3263 | 3813 | 3833 | 4257 | 4342 |
| **120** | 763 | 915 | 1077 | 1396 | 1704 | 2000 | 2309 | 2860 | 2964 | 3602 | 3616 | 4238 | 4254 | 4728 | 4823 |
| **132** | 827 | 1056 | 1247 | 1627 | 1994 | 2356 | 2743 | 3136 | 3489 | 3911 | 4274 | 4645 | 4965 | 5475 | 5499 |
| **144** | 888 | 1057 | 1249 | 1634 | 2002 | 2364 | 2751 | 3397 | 3502 | 4233 | 4288 | 4955 | 4980 | 5498 | 5507 |

### 价格表 DU-LF4
- 适用面料: Architella® Alexa™ 3⁄4", Architella Alexa 11⁄4", Architella Batiste Bamboo 3⁄4", Architella Batiste Bamboo 11⁄4", Architella Batiste Semi-Sheer 3⁄4", Architella Batiste Semi-Sheer 11⁄4", Architella Thea™ 3⁄4", Architella Thea 11⁄4"  (代码: C93, C88, C95, C97, Y10, Y09, C58, C60)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 415 | 472 | 535 | 656 | 783 | 909 | 1034 | 1164 | 1297 | 1434 | 1566 | 1690 | 1823 | 2019 | 2060 |
| **48** | 488 | 561 | 647 | 805 | 962 | 1129 | 1299 | 1601 | 1633 | 1963 | 1977 | 2289 | 2301 | 2567 | 2618 |
| **60** | 559 | 640 | 735 | 932 | 1118 | 1315 | 1517 | 1870 | 1918 | 2316 | 2330 | 2719 | 2732 | 3041 | 3102 |
| **72** | 629 | 717 | 835 | 1062 | 1288 | 1520 | 1747 | 2170 | 2234 | 2698 | 2721 | 3187 | 3201 | 3553 | 3624 |
| **84** | 698 | 800 | 937 | 1205 | 1456 | 1729 | 1992 | 2478 | 2550 | 3077 | 3107 | 3640 | 3660 | 4074 | 4155 |
| **96** | 762 | 888 | 1037 | 1339 | 1625 | 1933 | 2239 | 2785 | 2868 | 3463 | 3508 | 4104 | 4141 | 4578 | 4668 |
| **108** | 827 | 966 | 1136 | 1476 | 1797 | 2137 | 2482 | 3094 | 3194 | 3835 | 3890 | 4550 | 4598 | 5088 | 5189 |
| **120** | 884 | 1047 | 1230 | 1616 | 1958 | 2335 | 2709 | 3366 | 3471 | 4204 | 4243 | 4974 | 4993 | 5537 | 5648 |
| **132** | 962 | 1216 | 1443 | 1918 | 2323 | 2755 | 3208 | 3676 | 4098 | 4588 | 4982 | 5462 | 5856 | 6479 | 6508 |
| **144** | 1022 | 1218 | 1446 | 1925 | 2330 | 2762 | 3218 | 3976 | 4112 | 4962 | 4998 | 5844 | 5873 | 6507 | 6518 |

### 价格表 DU-LF5
- 适用面料: Architella® India Silk™ 3⁄4", Architella India Silk 11⁄4", ClearView® 3⁄4" Sheer, ClearView 11⁄4" Sheer  (代码: U22, U42, V01, V02)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 454 | 529 | 602 | 727 | 872 | 1012 | 1155 | 1298 | 1455 | 1606 | 1743 | 1885 | 2032 | 2248 | 2292 |
| **48** | 532 | 626 | 717 | 880 | 1064 | 1241 | 1434 | 1762 | 1808 | 2174 | 2198 | 2548 | 2563 | 2860 | 2918 |
| **60** | 615 | 717 | 825 | 1038 | 1254 | 1474 | 1695 | 2087 | 2143 | 2579 | 2592 | 3027 | 3041 | 3382 | 3449 |
| **72** | 698 | 802 | 932 | 1186 | 1437 | 1694 | 1952 | 2417 | 2473 | 2992 | 3029 | 3544 | 3560 | 3952 | 4031 |
| **84** | 777 | 900 | 1052 | 1337 | 1625 | 1932 | 2239 | 2774 | 2839 | 3424 | 3461 | 4049 | 4070 | 4535 | 4626 |
| **96** | 847 | 986 | 1154 | 1484 | 1813 | 2154 | 2492 | 3085 | 3194 | 3850 | 3899 | 4564 | 4606 | 5091 | 5193 |
| **108** | 918 | 1076 | 1263 | 1639 | 2002 | 2382 | 2753 | 3406 | 3514 | 4264 | 4322 | 5060 | 5113 | 5662 | 5776 |
| **120** | 986 | 1169 | 1380 | 1798 | 2197 | 2619 | 3045 | 3772 | 3864 | 4676 | 4750 | 5534 | 5555 | 6161 | 6285 |
| **132** | 1070 | 1348 | 1598 | 2107 | 2571 | 3068 | 3552 | 4085 | 4618 | 5101 | 5570 | 6075 | 6387 | 7174 | 7210 |
| **144** | 1081 | 1351 | 1600 | 2114 | 2579 | 3078 | 3561 | 4358 | 4637 | 5498 | 5589 | 6375 | 6403 | 7209 | 7222 |

### 价格表 DU-LF6
- 适用面料: Architella® Leela™ 3⁄4", Architella Leela 11⁄4", Architella Macon™ 3⁄4", Architella Macon 11⁄4", Architella Solasta™ 3⁄4", Architella Solasta 11⁄4"  (代码: U24, U44, U26, U46, U28, U48)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 486 | 567 | 647 | 782 | 937 | 1089 | 1241 | 1396 | 1561 | 1728 | 1874 | 2026 | 2186 | 2419 | 2467 |
| **48** | 572 | 672 | 770 | 946 | 1145 | 1335 | 1541 | 1893 | 1944 | 2338 | 2364 | 2739 | 2755 | 3074 | 3136 |
| **60** | 662 | 770 | 884 | 1116 | 1350 | 1585 | 1821 | 2241 | 2301 | 2770 | 2784 | 3256 | 3271 | 3639 | 3711 |
| **72** | 749 | 863 | 1001 | 1276 | 1546 | 1820 | 2096 | 2597 | 2657 | 3215 | 3256 | 3808 | 3827 | 4248 | 4333 |
| **84** | 835 | 967 | 1129 | 1436 | 1746 | 2080 | 2409 | 2981 | 3052 | 3682 | 3720 | 4351 | 4373 | 4876 | 4972 |
| **96** | 911 | 1060 | 1240 | 1597 | 1950 | 2317 | 2677 | 3315 | 3434 | 4136 | 4191 | 4905 | 4948 | 5474 | 5584 |
| **108** | 986 | 1156 | 1360 | 1761 | 2151 | 2563 | 2960 | 3663 | 3778 | 4582 | 4643 | 5438 | 5496 | 6085 | 6206 |
| **120** | 1060 | 1254 | 1484 | 1931 | 2363 | 2816 | 3275 | 4054 | 4153 | 5025 | 5106 | 5950 | 5973 | 6622 | 6755 |
| **132** | 1151 | 1453 | 1717 | 2264 | 2761 | 3301 | 3817 | 4391 | 4964 | 5486 | 5989 | 6531 | 6866 | 7715 | 7753 |
| **144** | 1160 | 1455 | 1719 | 2272 | 2771 | 3309 | 3828 | 4686 | 4986 | 5913 | 6008 | 6853 | 6884 | 7751 | 7765 |

### 价格表 DU-RD1
- 适用面料: Reception 3⁄4"  (代码: D57)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 313 | 353 | 405 | 497 | 592 | 683 | 782 | 876 | 970 | 1068 | 1155 | 1247 | 1339 | 1475 | 1504 |
| **48** | 358 | 411 | 470 | 588 | 705 | 817 | 936 | 1142 | 1162 | 1388 | 1396 | 1622 | 1628 | 1799 | 1834 |
| **60** | 409 | 472 | 547 | 676 | 817 | 968 | 1108 | 1357 | 1390 | 1660 | 1668 | 1936 | 1945 | 2150 | 2192 |
| **72** | 453 | 535 | 616 | 770 | 926 | 1113 | 1274 | 1560 | 1601 | 1911 | 1925 | 2233 | 2243 | 2484 | 2535 |
| **84** | 502 | 592 | 681 | 871 | 1047 | 1253 | 1441 | 1775 | 1826 | 2188 | 2198 | 2565 | 2575 | 2857 | 2915 |
| **96** | 551 | 654 | 762 | 970 | 1176 | 1402 | 1615 | 1991 | 2046 | 2458 | 2486 | 2892 | 2911 | 3226 | 3290 |
| **108** | 601 | 715 | 825 | 1066 | 1299 | 1532 | 1770 | 2185 | 2244 | 2698 | 2725 | 3178 | 3199 | 3549 | 3620 |
| **120** | 649 | 772 | 900 | 1168 | 1426 | 1681 | 1954 | 2411 | 2471 | 3000 | 3013 | 3520 | 3533 | 3926 | 4004 |
| **132** | 698 | 889 | 1046 | 1361 | 1669 | 1987 | 2298 | 2632 | 2910 | 3277 | 3548 | 3903 | 4173 | 4616 | 4637 |
| **144** | 739 | 890 | 1047 | 1366 | 1675 | 1992 | 2305 | 2847 | 2920 | 3540 | 3558 | 4165 | 4184 | 4637 | 4645 |

### 价格表 DU-RD2
- 适用面料: Architella® Reception 3⁄4", Classic 3⁄4", Commercial 3⁄4"  (代码: C57, D7, D23)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 412 | 470 | 527 | 662 | 783 | 910 | 1035 | 1160 | 1290 | 1428 | 1556 | 1690 | 1821 | 2011 | 2051 |
| **48** | 472 | 541 | 615 | 777 | 931 | 1088 | 1245 | 1531 | 1556 | 1870 | 1880 | 2195 | 2206 | 2445 | 2494 |
| **60** | 532 | 613 | 709 | 890 | 1071 | 1267 | 1453 | 1793 | 1819 | 2190 | 2204 | 2588 | 2600 | 2873 | 2930 |
| **72** | 596 | 688 | 795 | 1012 | 1221 | 1441 | 1657 | 2048 | 2090 | 2513 | 2534 | 2973 | 2987 | 3308 | 3373 |
| **84** | 647 | 762 | 885 | 1124 | 1363 | 1606 | 1856 | 2289 | 2338 | 2810 | 2840 | 3331 | 3351 | 3722 | 3795 |
| **96** | 692 | 828 | 964 | 1238 | 1503 | 1780 | 2050 | 2537 | 2594 | 3112 | 3149 | 3694 | 3724 | 4130 | 4212 |
| **108** | 754 | 896 | 1045 | 1348 | 1645 | 1940 | 2238 | 2773 | 2842 | 3415 | 3461 | 4053 | 4091 | 4556 | 4647 |
| **120** | 806 | 966 | 1129 | 1457 | 1784 | 2109 | 2440 | 3022 | 3095 | 3739 | 3777 | 4442 | 4459 | 4968 | 5068 |
| **132** | 861 | 1103 | 1295 | 1676 | 2054 | 2444 | 2830 | 3266 | 3584 | 4045 | 4375 | 4856 | 5184 | 5735 | 5760 |
| **144** | 912 | 1103 | 1296 | 1681 | 2061 | 2451 | 2838 | 3510 | 3594 | 4346 | 4387 | 5174 | 5198 | 5759 | 5767 |

### 价格表 DU-RD3
- 适用面料: Architella® Classic™ 3⁄4", Architella Elan® 3⁄4", Architella Elan 11⁄4", Architella Elan® Metallic 3⁄4", Architella Elan Metallic 11⁄4"  (代码: C51, C23, C43, C23, C43)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 486 | 550 | 625 | 779 | 918 | 1064 | 1215 | 1363 | 1523 | 1661 | 1807 | 1954 | 2096 | 2308 | 2354 |
| **48** | 553 | 640 | 738 | 919 | 1107 | 1288 | 1463 | 1797 | 1847 | 2195 | 2207 | 2567 | 2580 | 2838 | 2894 |
| **60** | 628 | 732 | 848 | 1067 | 1278 | 1501 | 1715 | 2103 | 2169 | 2582 | 2596 | 3031 | 3046 | 3368 | 3436 |
| **72** | 702 | 820 | 948 | 1198 | 1442 | 1709 | 1963 | 2410 | 2471 | 2977 | 3001 | 3520 | 3536 | 3899 | 3976 |
| **84** | 783 | 918 | 1071 | 1353 | 1636 | 1929 | 2213 | 2744 | 2816 | 3373 | 3446 | 4041 | 4059 | 4463 | 4552 |
| **96** | 863 | 1015 | 1186 | 1523 | 1851 | 2162 | 2478 | 3067 | 3162 | 3785 | 3873 | 4517 | 4551 | 5019 | 5120 |
| **108** | 914 | 1098 | 1291 | 1662 | 2033 | 2380 | 2745 | 3401 | 3491 | 4203 | 4244 | 4957 | 4983 | 5534 | 5644 |
| **120** | 990 | 1190 | 1402 | 1813 | 2214 | 2598 | 3001 | 3718 | 3853 | 4681 | 4700 | 5507 | 5529 | 6145 | 6266 |
| **132** | 1074 | 1372 | 1621 | 2116 | 2592 | 3062 | 3565 | 4075 | 4538 | 5082 | 5554 | 6038 | 6452 | 7117 | 7148 |
| **144** | 1153 | 1374 | 1623 | 2124 | 2600 | 3072 | 3576 | 4413 | 4554 | 5498 | 5571 | 6440 | 6471 | 7147 | 7158 |

### 价格表 DU-RD4
- 适用面料: Architella® Alexa™ 3⁄4", Architella Alexa 11⁄4", Architella Batiste Bamboo 3⁄4", Architella Batiste Bamboo 11⁄4", Architella Thea™ 3⁄4", Architella Thea 11⁄4"  (代码: C94, C89, C96, C98, C59, C61)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 537 | 611 | 696 | 849 | 1015 | 1179 | 1343 | 1515 | 1685 | 1863 | 2037 | 2196 | 2370 | 2621 | 2675 |
| **48** | 635 | 728 | 839 | 1048 | 1247 | 1466 | 1689 | 2082 | 2123 | 2553 | 2569 | 2974 | 2991 | 3337 | 3403 |
| **60** | 725 | 829 | 955 | 1210 | 1456 | 1708 | 1970 | 2430 | 2491 | 3008 | 3027 | 3532 | 3549 | 3954 | 4033 |
| **72** | 819 | 932 | 1086 | 1379 | 1672 | 1975 | 2272 | 2821 | 2902 | 3505 | 3536 | 4141 | 4162 | 4619 | 4711 |
| **84** | 908 | 1038 | 1217 | 1563 | 1888 | 2246 | 2591 | 3223 | 3312 | 3998 | 4039 | 4729 | 4757 | 5294 | 5400 |
| **96** | 987 | 1154 | 1348 | 1740 | 2113 | 2513 | 2912 | 3621 | 3726 | 4500 | 4560 | 5336 | 5385 | 5951 | 6068 |
| **108** | 1073 | 1252 | 1476 | 1919 | 2334 | 2780 | 3228 | 4019 | 4152 | 4986 | 5057 | 5915 | 5977 | 6615 | 6748 |
| **120** | 1150 | 1357 | 1599 | 2100 | 2544 | 3034 | 3519 | 4373 | 4511 | 5462 | 5512 | 6464 | 6489 | 7197 | 7341 |
| **132** | 1247 | 1581 | 1876 | 2491 | 3017 | 3583 | 4170 | 4779 | 5327 | 5965 | 6476 | 7099 | 7612 | 8419 | 8459 |
| **144** | 1328 | 1584 | 1879 | 2500 | 3027 | 3592 | 4181 | 5169 | 5347 | 6450 | 6495 | 7596 | 7634 | 8458 | 8472 |

### 价格表 DU-RD5
- 适用面料: Architella® India Silk™ 3⁄4", Architella India Silk 11⁄4"  (代码: U23, U43)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 586 | 687 | 780 | 942 | 1133 | 1316 | 1499 | 1686 | 1886 | 2089 | 2267 | 2451 | 2642 | 2923 | 2981 |
| **48** | 690 | 812 | 930 | 1144 | 1381 | 1614 | 1863 | 2289 | 2351 | 2828 | 2858 | 3310 | 3330 | 3718 | 3792 |
| **60** | 800 | 930 | 1070 | 1348 | 1629 | 1917 | 2203 | 2711 | 2783 | 3350 | 3367 | 3935 | 3954 | 4397 | 4485 |
| **72** | 908 | 1043 | 1210 | 1541 | 1868 | 2199 | 2536 | 3141 | 3214 | 3889 | 3938 | 4605 | 4628 | 5136 | 5239 |
| **84** | 1008 | 1169 | 1366 | 1737 | 2113 | 2510 | 2912 | 3606 | 3687 | 4453 | 4497 | 5262 | 5290 | 5894 | 6012 |
| **96** | 1101 | 1283 | 1498 | 1928 | 2357 | 2803 | 3237 | 4008 | 4152 | 5002 | 5067 | 5931 | 5985 | 6617 | 6750 |
| **108** | 1192 | 1397 | 1643 | 2126 | 2601 | 3098 | 3577 | 4425 | 4567 | 5542 | 5617 | 6576 | 6645 | 7360 | 7506 |
| **120** | 1283 | 1517 | 1796 | 2335 | 2857 | 3405 | 3958 | 4903 | 5021 | 6075 | 6171 | 7192 | 7220 | 8008 | 8168 |
| **132** | 1390 | 1751 | 2076 | 2736 | 3341 | 3989 | 4618 | 5311 | 6004 | 6629 | 7241 | 7897 | 8304 | 9326 | 9372 |
| **144** | 1405 | 1753 | 2080 | 2747 | 3351 | 3999 | 4630 | 5666 | 6027 | 7147 | 7264 | 8288 | 8325 | 9371 | 9387 |

### 价格表 DU-RD6
- 适用面料: Architella® Leela™ 3⁄4", Architella Leela 11⁄4", Architella Macon™ 3⁄4", Architella Macon 11⁄4", Architella Solasta™ 3⁄4", Architella Solasta 11⁄4"  (代码: U25, U45, U27, U47, U29, U49)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 630 | 738 | 839 | 1014 | 1217 | 1415 | 1612 | 1813 | 2027 | 2244 | 2436 | 2635 | 2840 | 3141 | 3203 |
| **48** | 740 | 873 | 998 | 1229 | 1486 | 1736 | 2003 | 2458 | 2525 | 3036 | 3072 | 3558 | 3580 | 3996 | 4076 |
| **60** | 860 | 998 | 1150 | 1453 | 1750 | 2058 | 2367 | 2916 | 2991 | 3600 | 3619 | 4231 | 4250 | 4729 | 4825 |
| **72** | 972 | 1119 | 1299 | 1657 | 2009 | 2366 | 2724 | 3378 | 3453 | 4180 | 4232 | 4951 | 4974 | 5522 | 5633 |
| **84** | 1086 | 1254 | 1466 | 1867 | 2271 | 2700 | 3130 | 3872 | 3966 | 4786 | 4835 | 5654 | 5682 | 6335 | 6461 |
| **96** | 1184 | 1378 | 1608 | 2073 | 2534 | 3011 | 3479 | 4310 | 4463 | 5375 | 5446 | 6375 | 6433 | 7116 | 7258 |
| **108** | 1283 | 1500 | 1767 | 2289 | 2795 | 3330 | 3847 | 4761 | 4911 | 5956 | 6039 | 7070 | 7142 | 7912 | 8071 |
| **120** | 1378 | 1629 | 1928 | 2509 | 3071 | 3660 | 4254 | 5269 | 5396 | 6531 | 6638 | 7730 | 7761 | 8605 | 8777 |
| **132** | 1493 | 1884 | 2231 | 2943 | 3590 | 4289 | 4964 | 5710 | 6452 | 7130 | 7784 | 8487 | 8925 | 10027 | 10076 |
| **144** | 1507 | 1886 | 2234 | 2953 | 3603 | 4302 | 4978 | 6090 | 6481 | 7685 | 7808 | 8908 | 8948 | 10075 | 10092 |

### fabric_to_chart (面料→价格表 映射)
- U22 → DU-LF5
- U42 → DU-LF5
- U23 → DU-RD5
- U43 → DU-RD5
- V01 → DU-LF5
- V02 → DU-LF5
- U24 → DU-LF6
- U44 → DU-LF6
- U25 → DU-RD6
- U45 → DU-RD6
- U26 → DU-LF6
- U46 → DU-LF6
- U27 → DU-RD6
- U47 → DU-RD6
- U28 → DU-LF6
- U48 → DU-LF6
- U29 → DU-RD6
- U49 → DU-RD6
- D8 → DU-LF1
- D40 → DU-LF1
- D9 → DU-LF1
- D49 → DU-LF1
- C22 → DU-LF2
- C42 → DU-LF2
- C23 → DU-RD2
- C43 → DU-RD2
- C58 → DU-LF3
- C60 → DU-LF3
- C59 → DU-RD3
- C61 → DU-RD3
- C93 → DU-LF3
- C88 → DU-LF3
- C94 → DU-RD3
- C89 → DU-RD3
- Y10 → DU-LF1
- Y09 → DU-LF1
- C95 → DU-LF4
- C97 → DU-LF4
- C96 → DU-RD4
- C98 → DU-RD4
- D2 → DU-LF1
- C50 → DU-LF1
- D7 → DU-RD1
- C51 → DU-RD1
- D1 → DU-LF1
- H7 → DU-RD1
- D56 → DU-LF2
- C56 → DU-LF2
- D57 → DU-RD2
- C57 → DU-RD2
- D22 → DU-LF1
- D23 → DU-RD1

### operating_system_surcharges
- **EasyRise**: {"type": "flat", "amount": 0}
- **LiteRise**: {"type": "flat", "amount": 0}
- **Simplicity**: {"type": "flat", "amount": 0}
- **UltraGlide**: {"type": "flat", "amount": 130}
- **SkyLift**: {"type": "see_separate_table"}
- **PowerView_Gen3**: {"type": "tiered_grid", "grids": {"standard": {"small": {"description": "Width ≤ 48\" AND Height ≤ 60\"", "amount": 345}, "medium": {"description": "everything between small and large", "amount": 405}, "large": {"description": "Width ≥ 120\" OR Height ≥ 96\"", "amount": 465}}, "rbw_or_irb": {"small": {"description": "Width ≤ 48\" AND Height ≤ 60\"", "amount": 415}, "medium": {"description": "everything between small and large", "amount": 490}, "large": {"description": "Width ≥ 120\" OR Height ≥ 96\"", "amount": 565}}}}
- **Vertiglide**: {"type": "see_separate_table"}
- **Sidelights_Cordless**: {"type": "flat_add_to_24in_column", "amount": 50}
- **Sidelights_NonOperable**: {"type": "percentage_of_24in_column", "modifier": 0.5}
- **Angles_NonOperable**: {"type": "flat_add_to_overall", "amount": 285}
- **Angles_Operable**: {"type": "flat_add_to_overall_with_pv", "amount": 285, "plus": "PowerView_Gen3 surcharge"}

### design_option_surcharges
- **cut_outs**: {"type": "per_unit", "rate": 120, "unit": "cut-out"}
- **lightlock_side**: {"type": "per_foot_pair", "rate": 50, "unit": "ft", "applies_to": ["LiteRise", "PowerView_Gen3"]}
- **lightlock_flex_side**: {"type": "per_foot_pair", "rate": 35, "unit": "ft", "applies_to": ["LiteRise", "PowerView_Gen3"]}
- **lightlock_bottom**: {"type": "per_foot", "rate": 20, "unit": "ft", "applies_to": ["LiteRise", "PowerView_Gen3"]}
- **top_down**: {"type": "flat", "amount": 130}
- **top_down_bottom_up**: {"type": "flat", "amount": 160}
- **trackglide_literise**: {"type": "flat", "amount": 190}
- **trackglide_powerview**: {"type": "flat", "amount": 600, "note": "includes PowerView Gen 3 surcharge"}
- **trackglide_powerview_rbw**: {"type": "flat", "amount": 670, "note": "includes PowerView Gen 3 RBW surcharge"}
- **two_on_one_headrail**: {"type": "formula", "spec": "Price as two separate shades and add together"}

### accessories
- **literise_extension_pole**: {"amount": 85}
- **literise_extension_pole_attachment**: {"amount": 45}
- **simplicity_extension_pole**: {"amount": 120}
- **skylift_extension_pole**: {"amount": 135}
- **skylift_crank_handle**: {"amount": 20}

═══════════════════════════════════════════════
# 【分册】02_Applause_Sonnette_蜂巢帘
═══════════════════════════════════════════════

# 蜂巢帘类产品深度知识库:Applause® Honeycomb Shades 与 Sonnette® Cellular Roller Shades

> 数据来源说明(供 AI 助手核对溯源用):
> - Applause® Honeycomb Shades:官方 Product Specifications Guide,Effective 1/20/26,源文件 `_organized/applause/ALL_SPEC.txt`,全文 67 页(AP-2 ~ AP-67,page_001~page_067),已逐页读完。
> - Sonnette® Cellular Roller Shades:官方 Product Specifications Guide,Effective 20 JAN 2026,源文件 `_organized/sonnette/ALL_SPEC.txt`,全文 32 页(SO-1 ~ SO-32,page_001~page_032),已逐页读完。
> - 两份源文件均已在 1/20/26 版本中把"定价"从规格书中移出,统一并入单独的 Hunter Douglas US Price Guide;本文件的规格内容不含具体美元价格,价格表见本文件末尾附录说明。
> - 所有数字均逐字来自源文件对应页码,未提及内容一律标注「资料未提及」。因源文件为跨页表格、OCR 提取,个别数值无法 100% 确认时标注 ⚠️待核对。
> - 尺寸单位均为英寸("),源文件为平方英尺(sq ft)的面积单位原样保留。

---

## Applause 与 Duette 的定位区别(开篇必读)

Hunter Douglas 蜂巢帘产品线中,**Applause® Honeycomb Shades** 与 **Duette® Honeycomb Shades** 是两条并行但定位不同的产品线(⚠️待核对:此定位对比为常识性行业背景说明,并非直接引自 Applause 或 Sonnette 这两份源文件本身——两份源文件均未包含对方产品线的正式对比说明文字,以下summary仅供检索参考,具体定位文案请以 Duette 官方资料为准):

- **Applause® Honeycomb Shades** 是 Hunter Douglas 蜂巢帘中的**入门/精简款(Streamlined Selection)**产品线。本文档 Applause 源文件第 AP-5 页明确将自身定位描述为"Streamlined Selection"(精简化选择),仅提供 **3⁄4" 单层蜂巢褶皱(3/4" pleat)** 与 **Double Honeycomb(双层蜂巢)** 两种褶型结构,面料分为 Sheer(纱)、Light Filtering(光过滤)、Room Darkening(遮光)三档,且原本存在的 **3⁄8" 褶型已于 1/1/26 起停产**(源文件 AP-4)。
- **Duette® Honeycomb Shades** 定位为蜂巢帘的**旗舰/全谱系**产品线(⚠️待核对,依据行业惯例及本系列知识库其他文件的交叉引用,Duette 通常提供更丰富的褶皱尺寸档位如 3/8"、9/16"、3/4"、1"、多种双层/三层蜂巢结构及更广泛的功能选项),不在本文件覆盖范围内,如需 Duette 的精确规格数字请查阅 Duette 专属知识库文件。
- 因此本文件中出现的"3⁄4" pleat"" "Double Honeycomb"等均专指 **Applause** 线,不可与 Duette 的褶型体系混淆。
- **Sonnette® Cellular Roller Shades** 则是完全不同的产品形态——它不是传统意义上升降折叠的蜂巢帘,而是"蜂巢面料 + 卷帘(roller)升降机构"的混合产品:面料仍为蜂巢结构(cell,弧形/curved cellular construction),但操作方式是像卷帘一样围绕滚筒(roller tube/headrail)卷收,而非蜂巢帘的折叠堆叠(源文件 SO-4)。Sonnette 与 Applause/Duette 的核心区别在于**堆叠外观**:蜂巢帘堆叠后仍有褶皱轮廓,Sonnette 卷收后呈现卷帘式的圆柱收纳,且据源文件自述其颜色"包含 Duette® Honeycomb Shades Elan® 系列的畅销色" (SO-4),说明 Sonnette 在面料花色上与 Duette 存在关联但产品机构完全独立。

---

# 第一章 Applause® Honeycomb Shades(入门蜂巢帘)

## 1.1 产品概述与 Pleat/Cell 结构

Applause 源文件本身没有单独的营销性"产品定义"段落,而是以"Streamlined Selection(精简化选择)"作为总纲(page AP-5),给出以下面料/褶型选择范围:

- 3⁄4" sheer fabric(3/4" 纱面料)
- 3⁄4" light-filtering fabrics(3/4" 光过滤面料)
- 3⁄4" room-darkening fabrics(3/4" 遮光面料)
- Double honeycomb fabrics(双层蜂巢面料)

**修订记录(Revision History,page AP-4)**:1/1/26 起,**3⁄8" pleat size(3/8" 褶型)已停产**,涉及页面为"Various"。同时停产的面料:Sunterra™ 3⁄8"(E42)、Sunterra 3⁄8"(E43)、Legends™ 3⁄8"(E1)、Legends 3⁄8"(E4)。

因此,截至本文档 Effective 日期(1/20/26),Applause 在售的褶型/结构只有两种:
1. **3⁄4" 单层蜂巢褶(3/4" pleat,single cell)**
2. **Double Honeycomb(双层蜂巢,double cell)**——源文件中仅有两款具体面料属于此结构:Kinship™ Double Honeycomb(E28)与 Legends™ Double Honeycomb(E5),且均归类在 Light Filtering 计价类别下(资料未提及是否存在 Sheer 或 Room Darkening 的双层蜂巢面料——源文件中未列出)。

**可选操作系统总览(page AP-5)**:
- Applause EasyRise™ —— Standard(bottom-up 提拉式)、Top-Down/Bottom-Up、Duolite®、Two-On-One Headrail(双帘共用一根 headrail)
- Applause EasyView® Arch —— Manual(手动)
- Applause LiteRise® —— Standard、Top-Down/Bottom-Up、Duolite、LightLock® Flex
- Applause PowerView® Gen 3 Automation —— Standard、Top-Down、Top-Down/Bottom-Up、Duolite、LightLock Flex
- Applause Simplicity™
- Applause SkyLift™ —— Manual、PowerView Gen 3、Duolite
- Specialty(特殊造型)—— Sidelights(操作/非操作)、Arches and Circles(拱形与圆形)、Angles(斜角)、Non-Operable Specialty Shapes(非操作特殊形状)、Cut-Outs(开孔)
- Applause UltraGlide® —— Standard、Top-Down、Top-Down/Bottom-Up、Duolite、Two-On-One Headrail
- Applause Vertiglide™ —— Standard、Duolite

## 1.2 面料系列与 Opacity(遮光度)分类

下表汇总 Size Standards 各表中反复出现的全部 Applause 面料(3/4" pleat 除非标注 Double Honeycomb):

| 面料系列 | 面料代码 | 结构 | Opacity(遮光度) | 价格图表编号(仅供检索,无具体价格) |
|---|---|---|---|---|
| Amity™ | E54 | 3/4" | Light Filtering | AP-LF4 |
| Amity | E55 | 3/4" | Room Darkening | AP-LF4 |
| Crystalline™ | E20 | 3/4" | Sheer | AP-LF4 |
| Esprit™(HDOrigins® Collection) | E36 | 3/4" | Light Filtering | AP-LF1 |
| Esprit(HDOrigins Collection) | E37 | 3/4" | Room Darkening | AP-RD1 |
| Kinship™ | E26 | 3/4" | Light Filtering | AP-LF2 |
| Kinship | E27 | 3/4" | Room Darkening | AP-RD2 |
| Kinship | E28 | **Double Honeycomb** | (计入 Light Filtering 类计价) | AP-LF2 |
| Legends™ | E6 | 3/4" | Light Filtering | AP-LF4 |
| Legends | E3 | 3/4" | Room Darkening | AP-RD4 |
| Legends | E5 | **Double Honeycomb** | (计入 Light Filtering 类计价) | AP-LF4 |
| Sunterra™ | E40 | 3/4" | Light Filtering | AP-LF3 |
| Sunterra | E41 | 3/4" | Room Darkening | AP-RD3 |
| Vintage™ | E50 | 3/4" | Light Filtering | AP-LF4 |
| Vintage | E51 | 3/4" | Room Darkening | AP-RD4 |

**已停产(1/1/26 起,不再在售)**:Sunterra 3/8"(E42)、Sunterra 3/8"(E43)、Legends 3/8"(E1)、Legends 3/8"(E4)。

⚠️待核对:双层蜂巢(Double Honeycomb)面料在源文件中没有独立的系列命名(不像 Duette 那样有专属双层蜂巢系列名称),只是 Kinship 和 Legends 两个系列下的一个结构变体(E28、E5),且仅在部分操作系统可用(见下文各系统"排除项")。

## 1.3 各操作系统 Min/Max 宽高、Max 面积、排除项

> 通用规则(源文件每章重复一次,原文大意):帘的实际尺寸必须**小于等于**最大宽高、**大于等于**最小宽高才符合规格。部分系统的 Max Width/Max Area 按"宽度区间"分两档(表中以"数值1/数值2"形式呈现,前者对应较窄宽度区间的较大允许值,后者对应较宽区间的较小允许值)。

### EasyRise™(标准/TDBU/Two-On-One,page AP-6~AP-7)

| 配置 | Min Width | Min Height | Max Width | Max Height | Max Area(sq ft,举例) |
|---|---|---|---|---|---|
| Standard(bottom-up) | 16" | 24" | 174"(典型) | 144" | 因面料而异,见下 |
| Top-Down/Bottom-Up | 24"(高度<108")/26"(高度≥108") | 24" | 174"(典型) | 144" | 因面料而异 |
| Two-On-One Headrail | 16"/单幅 | 24" | 174"(典型) | 144" | 132~158/单幅,因面料而异 |

Max Area 按面料举例(sq ft,两档数值为"较窄宽度区间/较宽区间"):
- Amity LF(E54):174(标准/TDBU);158/单幅(Two-On-One)
- Amity RD(E55):151/143
- Crystalline Sheer(E20):174/174;158/单幅(Two-On-One)
- Esprit LF(E36):174
- Esprit RD(E37):148/139
- Kinship LF(E26):174
- Kinship RD(E27):149/140
- Kinship Double Honeycomb(E28):150/140
- Legends LF(E6):163
- Legends RD(E3):151/143
- Legends Double Honeycomb(E5):156/148
- Sunterra LF(E40):174
- Sunterra RD(E41):144/133
- Vintage LF(E50):174
- Vintage RD(E51):141/128

**排除项**:EasyRise 端装(End Mount, EB)最大宽度仅 **72"**;EasyRise **不提供 Top-Down(仅有 TDBU/Duolite/Standard/Two-On-One)**;**LightLock Flex 不适用于 EasyRise**(见 AP-50 Operating System Specifications 章节)。

### EasyRise® with Duolite®(page AP-8,仅 3/4" pleat)

- Min Width:24"(高度<108")/26"(高度≥108");Min Height:24";Max Width:96"/120"
- 尺寸表为**上层面料 × 下层面料矩阵**(列:E54、E20、E36、E26、E6、E40、E50),Max Height/Max Area 取决于上下面料组合交叉值。例如上层为 Amity RD(E55)时,Max Area 依下层面料不同分别为:92/86(配 E20)、110(配 E36)、99(配 E26,列头空白"—")、92/86、96/91、96/95。
- **Duolite 面料排除项**:双层蜂巢面料一律不可用于 Duolite;Room-Darkening 面料不可作上层(top panel);Sheer 面料不可作下层(bottom panel);上下两层均为 Light-Filtering 面料的组合不可用。

### EasyView® Arch(page AP-9~AP-10)

| 配置 | Min Width | Min Height | Max Width | Max Height | Max Area |
|---|---|---|---|---|---|
| Standard | 14" | 7" | 60"(多数面料) | 30"(多数面料) | "—"(不适用,源文件未给出面积数值) |
| 端装(EB) | 18" | — | 36" | — | — |

**排除项**:Crystalline Sheer(E20)、Kinship Double Honeycomb(E28)、Legends Double Honeycomb(E5)在此系统中均显示"—"(不可用);Outside Mount(外装)不可用;不可与标准帘共用 headrail。

### LiteRise®(page AP-11~AP-12)

| 配置 | Min Width | Min Height | Max Width | Max Height | Max Area |
|---|---|---|---|---|---|
| Standard | 18" | 6" | 120" | 84" | 70 sq ft |
| Top-Down/Bottom-Up | 20" | 6" | 120" | 84" | 70 sq ft |
| Duolite | 20" | 6" | 120" | 84"(≤24"宽时Duolite最大高度为108") | 70 sq ft |
| LightLock Flex Standard | 18" | 6" | 120" | 84" | 70 sq ft |
| LightLock Flex TDBU | 20" | 6" | 120" | 84" | 70 sq ft |

**排除项**:LiteRise **不提供双层蜂巢面料**(Kinship Double Honeycomb E28、Legends Double Honeycomb E5 在 LiteRise 全部显示"—",完全不可用);LightLock Flex 列中 Crystalline Sheer 及所有 Light Filtering 面料(Amity LF、Esprit LF、Kinship LF、Legends LF、Sunterra LF、Vintage LF)均显示"—"(LightLock Flex 不兼容纱/光过滤面料);Two-On-One Headrail 不可用;Top-Down(单独,非 TDBU)不可用;Cut-Outs 不可用;端装(EB)最大宽度 72"。
**Duolite 排除项(LiteRise 专属规则)**:LiteRise Duolite 的上层面料必须是 Crystalline™ Sheer,下层只能是 Light Filtering 或 Room Darkening 面料;不允许混合褶型;不可用双层蜂巢面料。

### PowerView® Gen 3 Automation(page AP-13~AP-14)

最小宽度因供电方式而异(源文件表格,¹=高度>108"时右侧为最小订购宽度;²=端装 EB 时右侧为最小订购宽度):

| 供电方式 | Standard Min Width | Top-Down Min Width | TDBU Min Width |
|---|---|---|---|
| SMBW(卫星式电池杆/DC供电) | 17½" | 17½" | 22"/25"¹ |
| IRB(内置可充电电池) | 23"/24"¹ | 24"/25"¹ | 29"/32"¹ |
| HMRBW(headrail装可充电电池杆) | 18½"/21"² | 18½"/21"² | 22"/25"¹ |
| HMBW(headrail装电池杆) | 19½"/22"² | 19½"/22"² | 22"/25"¹ |

LightLock Flex 最小宽度(HMRBW):Standard 21"、Top-Down 21"、TDBU 22"/25"¹;(HMBW):Standard 22"、Top-Down 22"、TDBU 22"/25"¹。

| 配置 | Min Height | Max Width | Max Height | Max Area |
|---|---|---|---|---|
| Standard / Top-Down | 6" | 144" | 144" | 144 sq ft |
| TDBU | 12" | 144" | 144" | 144 sq ft |
| LightLock Flex Standard/Top-Down | 6" | 144" | 144" | 144 sq ft |
| LightLock Flex TDBU | 12" | 144" | 144" | 144 sq ft |

**排除项**:LightLock Flex 列中 Amity LF、Crystalline Sheer、Esprit LF、Kinship LF、Kinship Double Honeycomb、Legends LF、Sunterra LF、Vintage LF 均显示"—"(不可用,仅遮光类面料可配 LightLock Flex);Vintage RD(E51)Max Area 为 141(非 144)sq ft;端装(EB)最大宽度 72";**不提供 Two-On-One Headrail**;左侧电机/控制按钮不可选(仅右侧)。

### PowerView® Gen 3 Automation with Duolite®(page AP-15,仅 3/4" pleat)

- Min Width:22"/25"¹;IRB 供电:29"/32"¹;Min Height:12";Max Width:96"/120"
- 上下层面料矩阵结构与 EasyRise Duolite 相同,排除项相同(双层蜂巢不可用;Room Darkening 不可作上层;Sheer 不可作下层;LF/LF 组合不可用)。

### Sidelights(侧翼帘,page AP-16)

| 配置 | Min Width | Min Height | Max Width | Max Height | Max Area |
|---|---|---|---|---|---|
| Non-Operable(非操作) | 4" | 6" | 25" | 120" | "—" |
| Cordless Operable(无绳可操作) | 6" | 6" | 25" | 84" | "—" |

**排除项**:Sidelights **不提供 Duolite**。

### Simplicity™(page AP-17)

| Min Width | Min Height | Max Width | Max Height | Max Area |
|---|---|---|---|---|
| 18" | 6" | 60" | 72" | 25 sq ft(几乎所有面料一致) |

备注(原文):"with side stack shades, use maximum width for maximum height and maximum height for maximum width"(侧堆叠帘应将最大宽度值用作最大高度、最大高度值用作最大宽度)。

### SkyLift™ Manual 与 PowerView® Gen 3(page AP-18)

| 配置 | Min Width | Min Height |
|---|---|---|
| Manual | 12" | 12" |
| PowerView Gen 3 | 17" | 12" |

Max Height 随"Width To"分段变化(按宽度分段:42"、48"、54"、60"、66"、72"、84"、96",Manual 与 PowerView Gen 3 数值相同,举例):
- Amity LF(E54):42"~72"宽处 Max Height 均为 144";84"宽处降至 120";96"宽处降至 90"。
- Sunterra RD(E41):144, 144, 144, 144, 144, 132, 102, 78(对应上述宽度分段)。

**Standard Tension Cable(张力钢缆)数量表**:宽度 12"–35" 用 2 根钢缆;35⅛"–66" 用 3 根;66⅛"–96" 用 4 根(page AP-58附近)。
**排除项**:不可用于拱形(arch)之上;不可用于船舶/marine场景;不可端装(EB);不可底部堆叠或左右横向朝向;不可用 C 型卫星电池杆;不可菊花链;可充电电池杆不可安装在帘背后。

### SkyLift™ Duolite®(page AP-19)

- Min Width/Min Height 结构与标准 SkyLift 相同(Manual 12"、PowerView 17",Min Height 均 12")
- Max Height 同样按宽度分段变化,不同面料数值略有差异,整体模式与标准 SkyLift 表一致。
- **排除项**:不可用双层蜂巢面料;**SkyLift Duolite 下层必须为 Crystalline Sheer 面料,上层只能是 Light Filtering 或 Room Darkening**(与 LiteRise Duolite 的上下层规则相反)。

### Specialty Shapes — Non-Operable Angles / Arches & Circles(page AP-20~AP-21)

分类:Arch(拱形)、Extended Arch(延伸拱形)、Circle(圆形)、Quarter Circle(四分之一圆)、Angles 0°–30° Slope、Angles 30°–45° Slope、Angles 45°–60° Slope、Hexagon(六边形)、Octagon(八边形)、Trapezoid(梯形)。

| 形状 | Min Width | Min Height |
|---|---|---|
| Arch / Extended Arch | 12" | 4" |
| Circle / Quarter Circle | 12" | 12" |
| Angles(全部坡度) | 12" | 6" |
| Hexagon / Octagon / Trapezoid | 8" | 8" |

Max 值举例(以 Amity LF E54 为例):
- Arch:Max Width 84"(Max Height = ½ 宽度)
- Extended Arch:Max Width 84"(Max Height = ½ 宽度)
- Circle:Max Width 48",Max Height 48"
- Quarter Circle:Max Width 96",Max Height 96"
- Angle 0–30°:Max Width 48",Max Height 84",Max Area 28 sq ft
- Angle 30–45°:Max Width 48",Max Height 84",Max Area 28 sq ft
- Angle 45–60°:Max Width 38",Max Height 72",Max Area 19 sq ft
- Hexagon:Max Width 30",Max Height 30"
- Octagon:Max Width 30",Max Height 30"
- Trapezoid:Max Width 72",Max Height 96",Max Area 48 sq ft

(Crystalline Sheer E20 数值不同:无 Arch/Extended Arch 数据"—";Circle Max Width 48;Quarter Circle Max Width 96;Angle 0-30° Max Width 72,30-45° Max Width 60,45-60° Max Width 42。)

**footnote/规则**:完美拱形(perfect arch)高度不得超过订购宽度的 ½;非完美拱形高度不得小于宽度 30% 或大于 70%。Arch 允许双层蜂巢面料**仅限完美拱形**。Extended Arch:直边高度 ≤ 宽度一半;订购宽度+直边高度不可超过最大帘宽。双层蜂巢面料**不可用作 Angle Bottom shades**。

### UltraGlide®(page AP-22~AP-23)

| 配置 | Min Width | Min Height | Max Width | Max Height | Max Area |
|---|---|---|---|---|---|
| Standard / Top-Down | 12" | 6" | 144" | 144" | 144 sq ft |
| Top-Down/Bottom-Up | 18" | 6" | 144" | 144" | 144 sq ft |
| Two-On-One Headrail | 12"/单幅 | 6" | 144" | 144" | 132/单幅 sq ft |

**排除项**:端装(EB)最大宽度 72";TDBU 帘宽 ≤24" 时最大高度可达 108";Two-On-One Headrail **不可端装**,也**不可与 TDBU/Top-Down/Duolite 组合**;**LightLock Flex 不适用于 UltraGlide**。

### UltraGlide® with Duolite®(page AP-24,仅 3/4" pleat)

- Min Width 18",Min Height 6",Max Width 96"/120"
- 上下层面料矩阵结构与 EasyRise/PowerView Duolite 相同。
- **排除项**:UltraGlide Duolite 帘宽 ≤24" 时最大高度 108";同样排除双层蜂巢、Room Darkening 上层、Sheer 下层、LF/LF 组合。

### Vertiglide™ Manual(page AP-25~AP-26)

| 配置 | Min Width | Min Height |
|---|---|---|
| Side Stack / Traveling Center Stack / Duolite(每幅) | 18" | 24" |
| Split Stack | 24" | 24" |

Max 值举例:
- Amity LF(E54):Max Width 140"(侧堆叠)/280"(分体堆叠);Max Height 120"(两者相同);Max Area 116 sq ft/单幅
- 多数其他面料(Esprit、Kinship、Legends RD、Sunterra、Vintage):Max Width 168"/336",Max Height 120",Max Area 140/140 每幅

**排除项**:**Kinship Double Honeycomb(E28)与 Legends Double Honeycomb(E5)在 Vertiglide 中全部显示"—"(完全不可用)**;内装(IB)帘不提供 Valance 回边(returns)。
**Duolite 规则**:Vertiglide Duolite 规格按单幅计算,取两种面料中**较小**的最大宽度值。
**Split Stack 规则**:允许不等宽面板,单幅不可超过单幅最大宽度;总宽超过 168" 时会拼接成两幅独立帘共用一根拼接式 headrail/valance(外观一体化,操作顺畅);Aluminum Sydney Valance 在分体堆叠总订购宽度超过 180" 时拆分拼接;Grandover Valance 在总订购宽度超过 106" 时拆分拼接(独立及分体堆叠均适用)。

## 1.4 Headrail/Cassette 尺寸与 Mounting 深度精确数字

⚠️重要说明:源文件对 EasyRise、LiteRise、PowerView Gen 3、UltraGlide、Vertiglide、Simplicity 的 headrail 本身没有给出独立的高度/深度数值表(文档多处提示"参见 General Information 章节的 Mounting Chart",但该章节不在本次提供的源文件范围内,故以下仅列出源文件实际给出的数字)。

**产品视图(Product Views)章节中出现的具体尺寸(page AP-37~AP-49)**:
- **EasyView® Arch**:Arch Trim 相关尺寸 2 5/16"、7/16"(具体对应部位源文件图注未逐一标示)。
- **LightLock® Flex**:槽道尺寸 2 4/5"、1"、1 3/20"、2 1/10"(上下槽道宽度),侧槽道尺寸 2/5"。
- **SkyLift™**(page AP-43,Duolite 版本同,page AP-44):Rail Dimensions 给出 2 3/16"、2 3/16"、2 3/8"、1 7/8"、2 1/4"、1 1/4"、1 1/2"(源文件图示未逐一标注各尺寸对应 Top Rail 或 Bottom Rail 的具体位置,⚠️待核对);另有"3/4" Top Rail"及电池杆附近标注"2 1/4""(适用于 38" 以上宽度的帘)。
- **Simplicity™**(page AP-57):Side Track 尺寸 11/16"、3/4"、2 1/2"、1/2"、1 7/8"。

### Mounting 深度表(Inside Mount 最小/fully recessed、Outside Mount)

| 操作系统 | Inside Mount 最小深度 | Inside Mount Fully Recessed | End Mount 最小深度 | End Mount Fully Recessed | Outside Mount 最小安装面高度 |
|---|---|---|---|---|---|
| EasyRise™(page AP-50) | 1/2" | 2 1/4" | 1 1/4" | 2 3/8" | 1 1/4" |
| EasyView® Arch(page AP-52,3/4"pleat) | — | 2 3/8"(安装支架);端装支架 2" | — | — | — |
| LiteRise®(page AP-53) | 1/2" | 2 1/4" | 1 1/4" | 2 3/8" | 1 1/4" |
| Sidelights(page AP-56,3/4"pleat/双层蜂巢) | 1/2" | 2 3/8" | — | — | 5/8" |
| Simplicity™(page AP-57) | 1 1/4" | 2 1/2" | — | — | 1" |
| SkyLift™(page AP-58) | Manual:2 1/2";PowerView Gen 3 ≥38"宽:2 1/2";PowerView Gen 3 <38"宽(电池包装在底管后):4 1/2" | — | — | — | 1 1/4"(推荐每侧重叠宽度 2") |
| UltraGlide®(page AP-62) | 1/2" | 2 1/4" | 1 1/4" | 2 3/8" | 1 1/4"(完全内嵌时控制端端盖凸出 9/16") |

**PowerView® Gen 3 Automation 按供电方式分列(page AP-55)**:

| 供电方式 | Min Casement Depth, IB(内装) | Min Casement Depth, End Mount(端装) | Fully Recessed(内装) | Min Mounting Surface Height, OB(外装) |
|---|---|---|---|---|
| High Mount Bracket(标准) | 1" | 1 3/4" | 2 3/4" | 1 1/4" |
| Headrail-Mounted Rechargeable Battery Wand | 1 1/4" | 2" | 4" | 1 1/4" |
| Internal Rechargeable Battery(IRB)/ Satellite Battery Pack / C-Size / DC Power Supply | 1/2" | 1 1/4" | 2 1/4" | 1 1/4" |

**Specialty Shapes 系列 Mounting 深度(均为 Inside Mount,Stand-Alone,3/4"pleat/双层蜂巢)**:

| 形状类别 | 最小深度 | Fully Recessed |
|---|---|---|
| Non-Operable Angles(page AP-59~60) | 1 1/4" | 2 3/8" |
| Arches / Extended Arches / Quarter Circles(page AP-60) | 1 1/4" | 2 3/8" |
| Circles(page AP-60) | 1" | 2 3/8"(3/4"pleat) |
| Hexagon / Octagon / Trapezoid(page AP-61) | 1 1/4" | 2 3/8"(Outside Mount 与 End Mount 均不适用于此三种形状) |

**Vertiglide™ Manual(page AP-63~64)**:
- Inside Mount:所有面料最小深度 1/2";Fully Recessed —— Sydney III valance:3/4"pleat 3 7/8"(1 1/4"pleat 4 5/8",⚠️此为已停产褶型的历史数值,源文件仍保留);EverWood Grandover valance:3/4"pleat 4 1/4"(1 1/4"pleat 5")
- Outside Mount:最小安装面高度 5/8";总垂直净空需求 1 1/4"

**LightLock® Flex(page AP-65,依附主系统而异)**:

| 依附系统 | 最小深度 | Fully Recessed |
|---|---|---|
| LiteRise | 3/4" | 2 1/2" |
| PowerView Gen 3 — High Mount Battery Wand | 1 1/4" | 2 7/8" |
| PowerView Gen 3 — Rechargeable Battery Wand | 1 1/2" | 3 1/4" |
| PowerView Gen 3 — Internal Rechargeable Battery | 3/4" | 2 1/2" |

改装(Retrofit)备注:LightLock Flex 改装的最小机箱深度一般为 3/4",但"可能因原有操作系统要求而更大"(举例:PowerView Gen 3 IRB 保持 1/2",而 LiteRise 改装后提高到 3/4")。

## 1.5 Size Standards 与超宽选项

- **Two-On-One Headrail**(EasyRise 与 UltraGlide 专有):尺寸按"每幅(per panel)"计算,例如 EasyRise 最小宽度 16"/幅;UltraGlide 最大面积 132/幅 或 158/幅 sq ft。**仅提供 Standard(Bottom-Up)配置**,不可端装,不可与 TDBU 或 Duolite 组合。
- **Duolite(所有系统)**:最大尺寸由"期望的上层面料与下层面料的交叉值"决定,以矩阵表(而非单一数值)呈现。
- **Vertiglide Split Stack**:总宽最高达 336";超过 168" 时制成两幅独立帘,外观呈现为一根拼接headrail/valance;允许不等宽面板(各幅不超过单幅最大宽度)。

**Stacking Heights(堆叠高度,page AP-66)**——按帘高(48"、72"、84"、144")列出各面料的堆叠高度:

| 面料 | 48"处 | 72"处 | 84"处 | 144"处 |
|---|---|---|---|---|
| Amity 3/4" LF(E54) | 1/2" | 7/8" | 1" | 1 11/16" |
| Crystalline 3/4" Sheer(E20) | 1 1/4" | 1 3/4" | 2" | 3 1/4" |
| Esprit LF(E36) | 3/4" | 1" | 1 1/8" | 2" |
| Esprit RD(E37) | 3/4" | 1" | 1 1/4" | 2" |
| Kinship LF(E26) | 1 1/16" | 1" | 1 1/8" | 2" |
| Kinship RD(E27) | 3/4" | 1" | 1 3/16" | 1 15/16" |
| Kinship Double Honeycomb(E28) | 5/8" | 1" | 1 1/8" | 2" |
| Legends LF(E6) | 1/2" | 7/8" | 1" | 1 11/16" |
| Legends RD(E3) | 1/2" | 3/4" | 7/8" | 1 7/16" |
| Legends Double Honeycomb(E5) | 5/8" | 1" | 1 1/8" | 2" |
| Sunterra LF(E40) | 5/8" | 1" | 1 1/8" | 2" |
| Sunterra RD(E41) | 13/16" | 1 1/8" | 1 3/8" | 2 1/16" |
| Vintage LF(E50) | 1/2" | 5/8" | 3/4" | 1 1/4" |
| Vintage RD(E51) | 1/2" | 5/8" | 3/4" | 1 3/8" |

**Rail 本身叠加高度**(加在上表面料堆叠高度之上):
- EasyRise、LiteRise、PowerView Gen 3、UltraGlide Standard 帘(3/4"pleat 及双层蜂巢):**1 7/8"**
- EasyRise、LiteRise、PowerView Gen 3、UltraGlide TDBU 及 Duolite(3/4"pleat 及双层蜂巢):**2 3/8"**
- 备注:堆叠高度数据**不适用于 Top-Down 帘**。

**Vertiglide 堆叠尺寸**:左/右堆叠 6 1/2";分体堆叠/中央开合或 Duolite(每侧)6 1/2";行进式中央堆叠(Traveling Center Stack)13"。

## 1.6 设计选项

**Top-Down/Bottom-Up(TDBU)**:适用于 EasyRise、LiteRise、PowerView Gen 3 Automation、UltraGlide、Sidelights(可操作款)。中间设有外露中横梁(middle rail)。默认右侧拉绳环/摇杆操作中横梁,左侧操作底部横梁(可反转控制,但 Two-On-One headrail 不可反转)。

**Duolite®(双层昼夜帘)**:适用于 EasyRise、LiteRise、PowerView Gen 3、SkyLift、UltraGlide、Vertiglide。**通用排除规则**(多数系统一致):双层蜂巢面料不可用;Room-Darkening 面料不可作上层;Sheer 面料不可作下层;上下层均为 Light-Filtering 的组合不可用。**例外**:LiteRise Duolite 与 SkyLift Duolite 的上下层规则相反且都强制要求 Crystalline Sheer 出现在其中一层——"LiteRise Duolite 上层必须为 Crystalline™ Sheer 面料,下层只能是 Light Filtering 或 Room Darkening";"SkyLift Duolite 下层必须为 Crystalline™ Sheer 面料,上层只能是 Light Filtering 或 Room Darkening"。Vertiglide Duolite:取两种面料中较小的最大宽度值;规格按单幅计算。

**Two-On-One Headrail**:仅 EasyRise 与 UltraGlide,仅 Standard(Bottom-Up),不可与 TDBU/Duolite 组合,不可端装。

**Top-Down(独立款,非 TDBU)**:仅 PowerView Gen 3 Automation 与 UltraGlide 提供(Sidelights 也提供可操作的 Top-Down 选项)。**EasyRise 与 LiteRise 均不提供**独立 Top-Down。

**LightLock® Flex**:仅适用于 LiteRise 或 PowerView Gen 3 的 Inside Mount 帘——Standard(bottom-up)、Top-Down(仅 PowerView Gen 3)、Top-Down/Bottom-Up。**排除**:所有 Light-Filtering、Sheer、Semi-Sheer 面料(即只有 Room-Darkening/Blackout 类面料适用);Outside Mount(OB)与 End Mount(EB);Cut-Outs;EasyRise;Vertiglide;UltraGlide;Duolite;Two-On-One Headrail;磁性扣件(magnetic hold-down brackets);倾斜窗型。可作为改装(retrofit)选项单独订购。侧/底槽道颜色:048 Black、064 Bronze、221 Aspen Snow、320 Rich Cream、661 White Tiara、785 Aspen White(仅槽道外侧为该颜色,槽道内侧恒为黑色)。

**Cut-Outs(开孔)**:仅适用于 EasyRise、PowerView Gen 3 Automation Standard(bottom-up)、UltraGlide Standard(bottom-up)、Vertiglide。**排除**:双层蜂巢面料;Top-Down;TDBU;Duolite(Vertiglide 除外);Vertiglide 帘高 <60" 时不可开孔;LiteRise;Simplicity;SkyLift;Arches;Angles;特殊造型;Sidelights;Two-on-One headrail;LightLock Flex。开孔规格:PowerView Gen 3 与 UltraGlide —— 最大宽度 3",开孔顶部须距 headrail 顶部 ≥12"。Vertiglide —— 宽度固定为 1"(唯一选项),最大高度 6"(从地面量至开孔顶部位置);headrail 专属开孔可在两侧各留 1" 内、6" 高范围内开孔(需加收费用)。

**Specialty Shapes — Non-Operable(非操作特殊形状)**(Angles、Arches/Circles、Hexagon/Octagon/Trapezoid):均为非操作款。Angles:必须有一角为 90°;可独立安装(仅 IB)或安装在矩形帘之上共用 headrail(与 EasyRise/LiteRise/UltraGlide/PowerView Gen 3 组合时须为端装/EB)。排除:斜角坡度 >45° 时不可用 Room-Darkening 及双层蜂巢面料;双层蜂巢不可用作 Angle Bottom shades;独立安装的 Angles 不可外装(OB)或端装(EB);叠加在标准帘上的 Angles 不可用 IB 或 OB。Arches/Circles:完美拱形定义为宽度是高度的两倍;可与矩形帘(EasyRise/LiteRise/UltraGlide/PowerView Gen 3)共用 headrail。排除:圆形/四分之一圆不可用双层蜂巢;拱形/延伸拱形不可用 Crystalline Sheer;完美拱形高度必须恰为宽度一半(非近似值);非完美拱形高度不可小于宽度 30% 或大于 70%;延伸拱形若宽度+直边高度超过最大帘宽或直边高度大于宽度一半则不可用。Hexagon/Octagon/Trapezoid:**仅提供内装(IB)**,外装(OB)与端装(EB)均排除;梯形较短一侧的最大宽度缩减量为每侧 9"。

## 1.7 Exclusions(排除项总汇)

- **3/8" pleat**:1/1/26 起全面停产。
- **EasyRise**:端装(EB)帘宽 >72" 排除;Two-On-One Headrail 不可与 TDBU/Duolite 组合或端装;不提供独立 Top-Down;不提供 LightLock Flex。
- **EasyView Arch**:排除 Crystalline Sheer(E20)、Kinship Double Honeycomb(E28)、Legends Double Honeycomb(E5);排除外装;不可与标准帘共用 headrail。
- **LiteRise**:排除双层蜂巢面料;排除 Two-On-One Headrail;排除独立 Top-Down;排除 Cut-Outs;端装(EB)帘宽 >72" 排除。
- **PowerView Gen 3 Automation**:端装(EB)帘宽 >72" 排除;排除左侧电机/控制按钮(仅右侧);排除 Two-On-One Headrail。
- **Sidelights**:排除 Duolite。
- **SkyLift**:排除安装在拱形之上;排除船舶/marine 用途;排除端装;排除底部堆叠或左右横向朝向;排除 C 型卫星电池杆;排除菊花链;排除可充电电池杆装在帘背后。
- **UltraGlide**:排除 Two-On-One Headrail 端装;排除 Two-On-One Headrail 与 TDBU/Top-Down/Duolite 组合;端装(EB)帘宽 >72" 排除;排除 LightLock Flex。
- **Vertiglide**:完全排除双层蜂巢面料;内装(IB)帘排除 valance 回边。
- **Cut-Outs**:排除于 LiteRise、Simplicity、SkyLift、Arches、Angles、特殊造型、Sidelights、Two-on-One headrail、LightLock Flex、双层蜂巢面料、Top-Down、TDBU、Duolite(Vertiglide 除外)。
- **LightLock Flex**:排除所有 Light-Filtering/Sheer/Semi-Sheer 面料、外装/端装、Cut-Outs、EasyRise、Vertiglide、UltraGlide、Duolite、Two-On-One Headrail、磁性扣件、倾斜窗型。

## 1.8 Child Safety(儿童安全)

源文件中仅有**一处**明确的安全标准条款,出现在 EasyRise 章节(page AP-50):

> "In accordance with the revised American National Standard for Safety of Corded Window Covering Products, EasyRise™ shades require proper mounting of the cord tensioner for the product to function properly. The cord tensioner should not be modified in any way."
> (依据修订版美国国家有绳窗饰产品安全标准,EasyRise™ 帘需正确安装绳张力器方能正常工作,绳张力器不得以任何方式改装。)

**资料未提及**:文档中**没有独立的"Child Safety"专章标题**,也没有在其他操作系统章节重复出现类似条款。Sidelights 被描述为"Non-Operable or cordless operable"(非操作或无绳可操作),Simplicity 描述为手动(带拉杆)操作——暗示这些系统本身即为无绳设计,但源文件未将此明确表述为"儿童安全特性"。

**PowerView 电池/线缆相关信息(与儿童安全/无绳语境相关)**:
- Battery Wand(电池杆):预装碱性电池杆为标准配置,安装于 headrail 背后,不额外收费。
- Rechargeable Battery Wand(可充电电池杆):装入可充电电池支架,卡装于 headrail 背后(Headrail Mount)或墙面/窗框安装(Satellite Mount,延长线缆可选 15"、4'、10'、20'）。
- Internal Rechargeable Battery(IRB,内置可充电电池):内置于 headrail 内部,不可拆卸,须用充电套件原地充电;"无需额外安装深度,窗口外观也看不到电源"。
- C-Size Satellite Battery Wand:电池寿命约 3 年(视使用情况而定);尺寸 21 1/4" 长 x 1 1/4" 直径。
- SkyLift Battery Pack:电池寿命约 1~2 年;推荐使用 Energizer Ultimate Lithium AA 电池。
- 18V DC Power Supply(18V直流电源):插入家用标准插座,免除电池。
- Daisy-Chain Cable(菊花链线缆):一台 18V DC 电源最多驱动 3 台窗饰;菊花链线缆总长上限 50 英尺。
- 16 Shade DC Power Supply(16路直流电源):可通过低压布线驱动多达 16 个窗饰单元;使用此电源时不可再菊花链。
- Solar Charger Kit(太阳能充电套件):通过太阳能延长电池寿命;安装于窗玻璃或窗框;每台可充电电池供电的帘配一个太阳能充电器;颜色 Black 或 White。

## 1.9 硬件颜色规则

**Universal Cord Tensioner(UCT,通用绳张力器)颜色**(EasyRise,page AP-28)可选:
- 048 Black、320 Rich Cream、661 White Tiara、689 Ash、903 Desert Gold(¹对应色号参考见 Honeycomb Hardware Color Guide 中的 Dark Blonde 841)

**各系统硬件配色规则(原文摘录/大意)**:
- **EasyRise**:Rails 与 end caps 默认配色跟随面料。可免费申请硬件配色覆盖(hardware color override),但**覆盖不适用于 cord loop 与 cord tensioner——UCT 颜色须客户单独选择**。
- **LiteRise**:Rails、end caps 与拉杆(handle)默认配色跟随面料,可免费申请覆盖。
- **PowerView Gen 3 Automation**:Rails 与 end caps 配色跟随面料,可免费申请覆盖。
- **Sidelights**:Rails、end caps、拉杆默认配色跟随面料,可免费申请覆盖。
- **Simplicity**:固定仅提供 **785 Aspen White**(无配色跟随/覆盖机制)。
- **SkyLift**:硬件可选 **785 Aspen White、862 Gardenia White、064 Bronze**。
- **Specialty Shapes – Angles**:Rails 与 end caps 配色跟随面料。
- **Specialty Shapes – Arches and Circles**:Rails、end caps、拱形圆盘盖(disc arch cover)配色跟随面料。
- **Specialty Shape – Non-Operable(Hexagon/Octagon/Trapezoid)**:Rails 与 end caps 配色跟随面料。
- **UltraGlide**:Rails、end caps、拉杆配色跟随面料,可免费申请覆盖。
- **Vertiglide**:硬件与 Sydney III valance 提供 **16 种颜色**;EverWood Grandover valance 标准色为 **975 Winter White**(另可选 Distinctions™/TruGrain® 系列色)。"硬件、valance 与 rail 颜色将与面料选择相配。" 备注:同时订购 Vertiglide 与横向产品时,两类产品的配色协调可能不一致,横向产品可能需要申请硬件颜色覆盖(免费)。
- **EasyView Arch**:Rail 与 arch trim 颜色仅 **320 Rich Cream 与 661 White Tiara** 两色可选,且 **Rail 与 arch trim 颜色必须一致,不可混搭**。
- **LightLock Flex**:侧槽道与底槽道颜色可选 048 Black、064 Bronze、221 Aspen Snow、320 Rich Cream、661 White Tiara、785 Aspen White;headrail、底部横梁、拉杆默认跟随面料,可免费覆盖。备注:槽道仅外侧呈现指定颜色,内侧恒为黑色;如需定制色槽道,建议订购 661 White Tiara 再自行喷涂外侧槽道。

**磁性扣件(Magnetic Hold-Down Brackets)**(EasyRise、LiteRise、PowerView Gen 3、UltraGlide 提供,免费可选功能):颜色可选 Black、Brass、Bronze、Pewter、White。**仅限外装(OB)**使用。

**硬件颜色覆盖订购规则(All Operating Systems,page AP-27)**:可选 All(全部)、No(不覆盖)或 Individual(单独指定)。
- All:为整帘硬件指定单一颜色号与颜色名。
- Individual:为 headrail 与底部横梁分别指定颜色号与颜色名。
- 备注:"Duolite 硬件配色默认跟随下层(bottom panel)面料"——即 Duolite 帘的默认硬件颜色跟随下层面料,而非上层。

**Swivel Brackets(旋转支架,EasyView Arch)**:颜色可选 silver 或 white;仅限内装(IB)。

---

# 第二章 Sonnette® Cellular Roller Shades(蜂巢卷帘)

## 2.1 产品概述与结构

源文件"Introduction"(page SO-4)原文大意:

> "Sonnette® Cellular Roller Shades provide a fresh take on roller shades by offering an innovative cellular design that gently diffuses light to create a subtle glow throughout a room."
> (Sonnette® 蜂巢卷帘以创新的蜂巢结构为卷帘产品带来全新演绎,柔和地漫射光线,在室内营造出淡淡的光晕。)

> "Purposefully engineered, our curved cellular construction provides an energy efficient layer for your home, insulating in the winter and cooling in the summer."
> (弧形蜂巢结构专为节能设计,冬季保温、夏季隔热。)

**核心结构特性**:
- **Cell Size and Shape(蜂巢尺寸与形状,page SO-27)**:"The cell size on all Sonnette® fabrics is 2" from top to bottom (with the exception of the bottom cell, which is 3/8" shorter than the other cells)."(所有 Sonnette 面料的蜂巢尺寸均为纵向 2",但最底部一个蜂巢比其余蜂巢短 3/8"。)蜂巢形状会因面料厚度与遮光度不同而略有差异。
- **Kickback™**(关键设计特性):"positions the fabric closer to the window when the shade is fully closed"(帘完全放下时使面料更贴近窗户),优点包括"更佳私密性、更少漏光缝隙""无论安装深度如何均可覆盖更多窗户"。**Kickback 为 Custom Clutch、SoftTouch® Motorization、PowerView® Gen 3 Automation 三种操作系统的标配**。
- **Front Roll Only(无 Kickback,前卷)**:"Available upon request with Custom Clutch, SoftTouch Motorization, and PowerView Gen 3 Automation operating systems. Standard with LiteRise® operating system."(可在 Custom Clutch、SoftTouch、PowerView Gen 3 上按需选配;**LiteRise® 系统标配即为 Front Roll,无 Kickback 选项**。)适合避让把手与曲柄窗把。
- **Headrail 选项**:可选与面料同色的 Fabric-Covered Headrail(面料包覆顶盒),或哑光纹理质感的配色 headrail + 底部横梁。

## 2.2 面料系列与 Opacity 分类

⚠️与 Applause 不同,Sonnette 源文件**没有列出具体的面料系列专有名称**(无类似 Amity、Kinship 这样的命名表),仅给出汇总描述:

- "Available in nine fabric collections in 77 trend setting colors"(共 **9 个面料系列、77 种颜色**)。
- "Every style is available in both light-filtering and room-darkening fabrics."(每个款式均提供 Light Filtering 与 Room Darkening 两种遮光度。)
- "Includes top selling colors from Duette® Honeycomb Shades Elan® collection and interior design trends."(包含来自 Duette® Honeycomb Shades Elan® 系列的畅销色。)

**Opacity(遮光度)仅两档**(源文件未提及 Sheer 或 Blackout 类):
- **Light Filtering(光过滤)**:"diffuses light for a soft glow and moderate privacy from the outside in."(柔和漫射光线,提供适度的由外向内私密性。)
- **Room Darkening(遮光)**:"blocks the majority of incoming light and provides additional privacy. Some shadowing or light bleed may be visible in high sunlit areas."(阻挡大部分光线,提供更强私密性;强光环境下可能有轻微透光或阴影。)

资料未提及:具体面料专名清单、价格图表编号(源文件价格图表信息已移至独立 Price Guide,规格书中仅以"chart number next to the fabric style"方式引用,未展开列出)。

## 2.3 各操作系统 Min/Max 宽高、Max 面积、排除项

Sonnette 的 Size Standards 表格结构统一为"ALL FABRICS"单档(不像 Applause 按面料逐一区分数值):

| 操作系统 | Min Width | Max Width | Min Height | Max Height |
|---|---|---|---|---|
| Custom Clutch(page SO-6) | 15" | 96" | 12" | 96" |
| LiteRise®(page SO-11) | 20" | 84" | 12" | 84" |
| PowerView® Gen 3 Automation(page SO-15) | 15" | 96" | 12" | 96" |
| SoftTouch® Motorization(page SO-21) | 15" | 96" | 12" | 96" |

**通用规则原文(每个操作系统章节重复)**:"shade dimensions must be equal to or less than the maximum dimensions (width and height) and equal to or greater than the minimum dimensions (width and height) to be within specification guidelines."(帘的实际尺寸须小于等于最大宽高,且大于等于最小宽高。)

**各系统备注与排除项**:

### Custom Clutch(page SO-6~SO-9)
- 应用场景:"Fits windows up to 96" x 96"."仅提供 **M 号离合器(M Size Clutch)**;顶部处理两种:Cassette(卡匣式)或 Bracket(支架式,开放卷式 waterfall 设计)。
- **超尺寸(Oversize XL)触发条件**:前卷(无 Kickback)帘 —— 宽 >84" 和/或 长 >76" 时改用 Oversize(XL)安装支架;Kickback 帘 —— 宽 >84" 和/或 长 >70" 时改用 Oversize(XL)安装支架。
- 资料未提及此系统的独立"排除项(Exclusions)"小节标题(源文件 Custom Clutch 章节内未见排除项列表)。

### LiteRise®(page SO-11~SO-13)
- 应用场景:"Fits windows up to 84" x 84". Shades raise from the bottom up."
- **排除项(page SO-12)**:**Kickback™ 不可用于 LiteRise**(LiteRise 固定为 Front Roll)。
- 超尺寸触发:宽 >84" 和/或 长 >76" 时改用 Oversize(XL)安装支架。
- LiteRise 拉杆(handle)须随帘下单,**不可事后改装**;须配拉杆方能使用延长杆(Extension Pole,29"~51" 可伸缩)操作。

### PowerView® Gen 3 Automation(page SO-15~SO-19)
- 应用场景:"Fits windows up to 96" x 96". Automated system with wireless control."
- **排除项(page SO-16)**:**左侧电机与控制按钮不可选**(电机恒定右侧);**磁性扣件不可用**。
- Headrail-mounted(或 headrail mount)可充电电池杆**不适用于宽度小于 22" 的帘**;宽度 <22" 的帘若使用可充电电池杆,只能采用 Satellite Mount(卫星式安装)。
- 电池杆电压:宽度 >17" 一律用 18V 电池杆;宽度 15"~17" 默认标配 12V 电池杆(除非另行指定)。
- **菊花链面积限制**:"cables should not exceed 50 feet in total length and shades cannot exceed a combined total of 100 sq. ft."(菊花链线缆总长不超过 50 英尺,且多台帘合计面积不超过 **100 平方英尺**——此为多台帘合并的系统级限制,非单幅帘的最大面积。)
- 超尺寸触发:前卷帘宽 >84" 和/或长 >76";Kickback 帘宽 >84" 和/或长 >70"。

### SoftTouch® Motorization(page SO-21~SO-25)
- 应用场景:"Fits windows up to 96" x 96". Motorized system with wand control."
- **排除项(page SO-22)**:**磁性扣件不可用**。
- 与 PowerView Gen 3 相同的电池杆电压规则(17" 分界)、<22" 宽度仅限卫星式安装规则、菊花链 50 英尺/100平方英尺 规则、超尺寸触发条件(前卷 >84"/76";Kickback >84"/70")。
- 备注:"It is not recommended to abutt shades control side to control side because the magnets in the wands will pull toward each other."(不建议将两幅帘的控制侧对控制侧并排安装,因电池杆内磁铁会相互吸引。)

**资料未提及**:文档全文没有 TDBU(Top-Down-Bottom-Up)选项、没有 Duolite/Day-Night 双层帘选项、没有 Sidelights、没有拱形/异形选项——这些设计在 Sonnette 源文件中完全不存在,不可套用 Applause 的对应功能。

## 2.4 Headrail/卷筒/Cassette 尺寸与 Mounting 深度

**Cutover Chart(标准 vs. 超尺寸 XL 切换表,page SO-28~SO-29)**——给出各操作系统在何种宽高组合下从 Standard 硬件切换为 Oversize(XL)硬件:

| 操作系统(Kickback 状态) | Headrail:Standard 上限 | Headrail → Oversize(XL) | Standard Bracket M 1½":上限 | → Oversize |
|---|---|---|---|---|
| Custom Clutch(Kickback™) | 84" x 70" | 96" x 96" | 96" x 78" | 96" x 96" |
| Custom Clutch(无 Kickback) | 84" x 76" | 96" x 96" | 96" x 96" | — |
| LiteRise®(无 Kickback) | 84" x 76" | 84" x 84" | — | — |
| PowerView® Gen 3(Kickback) | 84" x 70" | 96" x 96" | — | — |
| PowerView Gen 3(无 Kickback) | 84" x 76" | 96" x 96" | — | — |
| SoftTouch®(Kickback) | 84" x 70" | 96" x 96" | — | — |
| SoftTouch(无 Kickback) | 84" x 76" | 96" x 96" | — | — |

⚠️待核对:上表脚注原文"Widths and Heights over this cutover, use the Oversize Headrail"及"...use the M Clutch 2" Bracket"确认无误,但该图表旁的具体支架/卷筒**深度投影数字**因源文件 OCR 提取存在分数编码断裂,以下数值**低置信度**,如需精确施工数字请务必核对官方 PDF 原版:

- Oversize(XL)帘 Bracket 深度:约 3¾"、2⅝"(具体对应项目源文件未清楚区分)
- Oversize(XL),无 Kickback,后方面料净空:Custom Clutch Cassette 2¼"、LiteRise 2⅞"、PowerView Gen 3 2¼"、SoftTouch 2¼"
- Oversize(XL),Kickback:Custom Clutch、PowerView Gen 3、SoftTouch 均有对应数值,但 OCR 字符串破碎(如"17/ "、"13/ "),⚠️待核对,无法确认准确分数值
- Standard 帘 Bracket 深度:约 2⅝"
- Standard,Kickback:Custom Clutch Cassette 约 ⅞",SoftTouch 约 1 5/16",PowerView Gen 3 约 1 5/16"
- Standard,无 Kickback:LiteRise 约 1 7/16",SoftTouch 约 2",PowerView Gen 3 约 2"

**Custom Clutch Outside/Inside Mount 支架深度(page SO-29,同样存在 OCR 分数断裂,⚠️待核对)**:
- Custom Clutch,外装,M 2" Bracket:Kickback 约 1 13/16",无 Kickback 约 2⅞"
- Custom Clutch,内装,M 2" Bracket:约 2"~2½";Kickback 约 1⅛",无 Kickback 约 2 3/16"
- Custom Clutch,外装,M 1½" Bracket:Kickback 约 ⅝",无 Kickback 约 1 11/16"

### Mounting 深度精确数字表(Inside Mount 最小/Fully Recessed,Outside Mount)

**Custom Clutch — Bracket(page SO-8)**:

| 安装方式 | 数值 |
|---|---|
| Inside Mount 最小机箱深度 | 2" |
| Inside Mount Fully Recessed | 2" |
| Outside Mount 最小安装面高度 | 2⅛" |
| Outside Mount Projection(M 1½" Bracket) | 2½" |
| Outside Mount Projection(M 2" Bracket) | 3¼" |

**Custom Clutch — Cassette(page SO-8)**:

| 安装方式 | Standard | XL 帘 |
|---|---|---|
| Inside Mount 最小机箱深度 | 1" | 1" |
| Inside Mount Fully Recessed | 3 3/16" | 资料未提及(源文件此格为空) |
| Outside Mount 最小安装面高度 | 1" | 1" |
| Outside Mount 推荐每侧回边重叠 | 3" | 资料未提及 |

**LiteRise®(page SO-12)**:

| 安装方式 | Standard | XL 帘 |
|---|---|---|
| Inside Mount 最小机箱深度 | 1" | 1" |
| Inside Mount Fully Recessed | 3 3/16" | 3¾" |
| Inside Mount 最小后方面料净空 | 1⅞" | 1⅞" |
| Outside Mount 最小安装面高度 | 1" | 1" |
| Outside Mount 推荐每侧回边重叠 | 3" | 3" |
| Outside Mount 最小后方面料净空 | 1⅞" | 1⅞" |

**PowerView® Gen 3 Automation(page SO-16)**:

| 安装方式 | Standard | XL 帘 |
|---|---|---|
| Inside Mount 最小机箱深度(标准电池杆) | 1" | 1" |
| Inside Mount Fully Recessed(标准电池杆) | 3 3/16" | 3¾" |
| Inside Mount 最小机箱深度(Headrail 装可充电电池杆) | 1¼" | 1½" |
| Inside Mount Fully Recessed(Headrail 装可充电电池杆) | 4" | 4¼" |
| Outside Mount 最小安装面高度 | 1" | 1" |
| Outside Mount 推荐每侧回边重叠 | 3" | 3" |

备注:外装 + Headrail 装可充电电池杆,标准帘需 ¼" 垫块配 XL 支架;XL 帘需 ½" 垫块配 XL 支架。

**SoftTouch® Motorization(page SO-22)**——数值与 PowerView Gen 3 **完全一致**:

| 安装方式 | Standard | XL 帘 |
|---|---|---|
| Inside Mount 最小机箱深度(标准电池杆) | 1" | 1" |
| Inside Mount Fully Recessed(标准电池杆) | 3 3/16" | 3¾" |
| Inside Mount 最小机箱深度(Headrail 装可充电电池杆) | 1¼" | 1½" |
| Inside Mount Fully Recessed(Headrail 装可充电电池杆) | 4" | 4¼" |
| Outside Mount 最小安装面高度 | 1" | 1" |
| Outside Mount 推荐每侧回边重叠 | 3" | 3" |

**汇总 Mounting Requirements 表(PowerView Gen 3 与 SoftTouch 共用,page SO-30)**:

| | Battery Wand(普通电池杆) | Rechargeable Battery Wand(可充电电池杆) |
|---|---|---|
| Standard 帘 — Inside Mount | 1" | 1¼" |
| Standard 帘 — Fully Recessed | 3 3/16" | 4" |
| Oversized 帘 — Inside Mount | 1" | 1½" |
| Oversized 帘 — Fully Recessed | 3¾" | 4¼" |

配套垫块(Spacer Blocks):½" 垫块 与 ¼" 垫块。

## 2.5 Size Standards 详情(超宽/超高选项)

**资料未提及**:Sonnette 源文件全文**没有"2-on-1"或多幅共用 headrail 的选项**,也**没有 stack width/stacking height(堆叠宽高)表**——因 Sonnette 是卷帘式产品(卷筒收纳),不是横向牵引/多幅堆叠系统,源文件未包含此类表格。

Sonnette 唯一的"超尺寸"概念是 **Standard vs. Oversize(XL)硬件切换**,完全由第 2.4 节的 Cutover Chart 触发规则决定(不是独立的多幅面板项目)。

**Edge Gaps(帘边与窗洞间隙)表**(LiteRise page SO-12、PowerView page SO-17、SoftTouch page SO-23,结构一致):
- Inside Mount(内装),从窗洞边缘到面料边缘:控制侧 3/8",非控制侧 3/8"(LiteRise 因无控制侧区分,统一表述为"两侧均 3/8"")
- Abutted Shades(并排安装):非控制侧对非控制侧 5/8";非控制侧对控制侧 5/8";控制侧对控制侧 5/8"(LiteRise 版本:"两侧并排均 5/8"")

**Finished Dimensions(成品尺寸公差)表**:

Custom Clutch(page SO-8):
- Inside Mount:Headrail 单元宽度 = 订购宽度 – ¼";帘高 = ±⅛";面料宽度:Cassette = –1⅛",Standard Bracket = –1",Designer Metal Bracket = –15/16"
- Outside Mount:Headrail 单元宽度 = 订购宽度;帘高 = ±⅛";面料宽度:Cassette = –13/16",Standard Bracket = –1",Designer Metal Bracket = –13/16"
- 备注原文:"All allowances are taken from ordered dimensions and width may vary +0/–1/8"."

LiteRise(page SO-12):
- Inside Mount:Headrail 单元宽度 = –¼";帘高 = +⅛";面料宽度 = –¾"
- Outside Mount:Headrail 单元宽度 = 订购宽度;帘高 = +⅛";面料宽度 = –7/16"

PowerView Gen 3(page SO-17)与 SoftTouch(page SO-23)——完全一致:
- Inside Mount:Headrail 单元宽度 = –¼";帘高:Kickback™ = +0 至 –¼",无 Kickback = ±⅛";面料宽度 = –¾"
- Outside Mount:Headrail 单元宽度 = 订购宽度;帘高:Kickback = +0 至 –¼",无 Kickback = ±⅛";面料宽度 = –7/16"

**SoftTouch 拉杆(Wand)长度标准表(page SO-23)**:

| 帘高范围 | 拉杆长度 |
|---|---|
| 12"–26" | 12" |
| 26⅛"–36" | 18" |
| 36⅛"–48" | 24" |
| 48⅛"–60" | 30" |
| 60⅛"–72" | 36" |
| 72⅛"–84" | 42" |
| 84⅛"–96" | 48" |

备注:"标准拉杆长度约为帘高的 50%",可在 12"~48" 范围内以 6" 为增量自定义覆盖。

## 2.6 设计选项

- **TDBU(Top-Down-Bottom-Up)**:**资料未提及**——文档全文未出现此选项,Sonnette 明确为"Control System Style: Bottom-Up (Standard)"(page SO-5),各操作系统 Applications 说明均写"Shades raise from the bottom up."(仅从底部向上提升)。
- **Duolite/Day-Night 双层帘**:**资料未提及**——文档全文未出现此选项。
- **特殊造型(拱形、Sidelights 等)**:**资料未提及**——文档全文未出现。

**实际提供的设计选项**(源文件 Introduction 及 Design Option Specifications 章节,page SO-4、SO-27~SO-32):
- **Kickback™** vs. **Front Roll Only / 无 Kickback**(见 2.1 节)
- **Fabric-Covered Headrail(面料包覆顶盒)**:加价项,各操作系统均可选,相对于标准配色 headrail/底部横梁("哑光纹理质感")。
- **Cassette vs. Bracket 顶部处理**(仅 Custom Clutch):Cassette 采用"现行 Sonnette headrail";Bracket 为"开放卷式 waterfall 设计",可配 Designer Metal Bracket 与金属珠链。
- **Standard Bracket vs. Designer Metal Bracket**(Custom Clutch):Designer Metal Bracket 提供两种饰面 —— **Pearl Chrome** 或 **Burnished Chestnut**,金属链为标配。
- **支架朝向**:吊顶安装(Ceiling mount)或墙面安装(Wall mount),内装/外装均可选择。
- **底部横梁配重调整**:安装时用于校正倾斜的调整流程(属安装/调试功能,非面向客户的设计选项)。

## 2.7 Exclusions(排除项)

Sonnette **没有统一的"总排除项"章节**,排除项分散在各操作系统内:

- **LiteRise®**(page SO-12)排除项:**Kickback™**(LiteRise 不兼容 Kickback)。
- **PowerView® Gen 3 Automation**(page SO-16)排除项:**左侧电机与控制按钮**(电机/控制按钮恒定位于 headrail 右侧);**磁性扣件**。
- **SoftTouch® Motorization**(page SO-22)排除项:**磁性扣件**。
- **Custom Clutch**:源文件 page SO-6~SO-10 范围内**没有出现独立的"Exclusions"小节标题**,资料未提及具体排除项列表。

## 2.8 Child Safety(儿童安全)

源文件**没有独立标题为"Child Safety"的章节**。以下为相关安全内容原文摘录:

- **无绳系统说明**(Introduction,page SO-4):"LiteRise — cordless operation offers enhanced child and pet safety."(LiteRise 无绳操作,为儿童与宠物提供更高安全性。)"SoftTouch Motorization — cordless motorized system operated with a wand."(SoftTouch 为无绳电动系统,用拉杆操作。)
- **有绳产品警示**(Custom Clutch,page SO-7):"IMPORTANT — In accordance with the revised American National Standard for Safety of Corded Window Covering Products, shades with cord loops require proper mounting of the cord tensioner for the product to function properly. The cord tensioner should not be modified in any way."(重要——依据修订版美国国家有绳窗饰产品安全标准,带绳环的帘须正确安装绳张力器方能正常工作,绳张力器不得以任何方式改装。)⚠️源文件未给出该 ANSI/WCMA 标准的具体编号,仅有此段泛称表述。
- **PowerView® Gen 3 电池/供电信息**:无绳——无线/电池/交流供电系统。供电选项:预装碱性电池杆(标配,免费)、Rechargeable Battery Wand(Headrail Mount 或 Satellite Mount)、Satellite Battery Pack、C-Size Satellite Battery Wand(电池寿命约 3 年)、18V DC Power Supply、Daisy-Chain Cable(总长上限 50 英尺,合计面积上限 100 平方英尺)、16 Shade DC Power Supply(可驱动多达 16 个窗饰单元,"使用 16 路直流电源时不可菊花链")。
- **SoftTouch 供电选项**:与 PowerView Gen 3 相同的电池/电源产品线(page SO-24~SO-25)。
- **Custom Clutch**:使用"连续珠链(continuous bead chain)"——为有绳系统,珠链颜色可选 **064 Bronze** 或 **731 Stainless Steel**,或标准塑料链。

## 2.9 硬件颜色规则

- **Headrail 颜色覆盖**(page SO-5,All Operating Systems Ordering Notes):可选 Yes 或 No;若选 Yes,需指定颜色号与颜色名。"覆盖 headrail 颜色同时会替换 SoftTouch® Motorization 帘的驱动臂(activation arm)与拉杆(wand)颜色。"
- **底部横梁颜色覆盖**:可选 Yes 或 No(独立于 headrail 覆盖);若选 Yes,需指定颜色号与颜色名。
- **Fabric-Covered Headrail 颜色覆盖**:可选 Yes 或 No;若覆盖,需填写颜色号与颜色名。
- **硬件配色总原则**(page SO-27,"Hardware Colors"):"To simplify the design process, hardware colors are pre-selected to best coordinate with each fabric. Or choose your own for a custom look with the hardware color override option, free of charge."(为简化设计流程,硬件颜色默认与面料预先配对;也可选择硬件颜色覆盖选项自定义配色,**免费**。)——该"免费覆盖"规则在 Custom Clutch(page SO-7)、LiteRise(page SO-12)、PowerView Gen 3(page SO-16)、SoftTouch(page SO-22)的"Optional Features — No Charge"栏目中均有重复列出。
- **Standard Bracket 支架罩**:"可选 26 种硬件颜色"(Custom Clutch,page SO-7)。支架罩在外装(OB)为标配,内装(IB)为选配。
- **Designer Metal Bracket**:仅两种饰面 —— **Pearl Chrome** 或 **Burnished Chestnut**(加价升级项,不在 26 种标准硬件色范围内)。
- **金属珠链颜色**:**064 Bronze** 或 **731 Stainless Steel**(Custom Clutch 订购备注,page SO-9)。
- **PowerView Gen 3 遥控器颜色**:Black 或 White。**PowerView Pebble® 颜色**:Black、Citron、Clear Frost、Cobalt、Ecru、Mist、Oyster、Pewter Frost、Poppy、White。**PowerView Surface 颜色**:Black、Nickel、White。**Solar Charger Kit 颜色**:Black 或 White。
- **与面料颜色的绑定关系**:源文件未提及任何"因面料颜色而强制/禁止某硬件颜色"的规则——默认配对逻辑之外,覆盖选项对所有系统均无条件免费。
- **与操作系统的绑定关系**:SoftTouch 覆盖 headrail 颜色时会连带更换驱动臂与拉杆颜色(明确说明);PowerView Gen 3 与 Custom Clutch 的覆盖说明中未给出同等的联动条款。

---

# 附录:价格表见本文件末尾附录

> Applause® Honeycomb Shades 与 Sonnette® Cellular Roller Shades 的详细价目表(按面料分组代码 × 宽度 × 高度的美元标价矩阵)已在官方 Hunter Douglas Price Guide(HD Price Guide,统一生效日 1/20/26)中单独发布,不在本规格知识库文件范围内。
> - Applause:价格图表编号 AP-LF1~AP-LF4、AP-RD1~AP-RD4 等(源文件仅引用图表编号,具体价格数字见 Price Guide 对应页)。
> - Sonnette:价格图表编号未在规格书中展开(源文件仅以"chart number next to the fabric style"方式引用)。
> 本文件不重复抄录具体价格数字,如需报价请查阅 Hunter Douglas Price Guide 原文或对应的 PRICING.md / lookup_price 工具。

---

# 全文待核对事项汇总(⚠️待核对)

1. **Applause — Headrail 自身高度/深度数值缺失**:EasyRise、LiteRise、PowerView Gen 3、UltraGlide、Vertiglide、Simplicity 的 headrail 本体尺寸(非 mounting 深度)在本源文件中没有独立数值表,文档多次指向"General Information 章节 Mounting Chart",但该章节未包含在本次提供的源文件范围内。如需精确 headrail 外形尺寸,须调取该 Mounting Chart 原文。
2. **Applause — SkyLift Rail Dimensions 对应关系不明**:page AP-43/44 给出 7 个尺寸数字(2 3/16"、2 3/16"、2 3/8"、1 7/8"、2 1/4"、1 1/4"、1 1/2"),但源文件图注未清楚标示每个数字对应 Top Rail 还是 Bottom Rail 的具体部位,已按原样罗列,具体对应关系待核对官方图纸。
3. **Applause — Child Safety 无独立章节**:全文仅 EasyRise 一处提及 ANSI 有绳产品安全标准,未见涵盖全系统的儿童安全专章或 WCMA 认证编号,资料未提及。
4. **Applause — Duolite 上下层规则的"例外"需重点提示**:多数系统 Duolite 规则为"Room Darkening 不可作上层、Sheer 不可作下层",但 LiteRise 与 SkyLift 的 Duolite 规则与此相反且指定 Crystalline Sheer 必须出现在特定层(LiteRise 要求 Sheer 在上层,SkyLift 要求 Sheer 在下层),两者互为镜像,容易混淆,已在正文中分别注明。
5. **Sonnette — Cutover Chart 深度投影数字 OCR 断裂**:page SO-28~SO-29 关于 Oversize(XL)/Standard 各配置的具体深度投影分数值(如"17/ "、"13/ "等)在源文件文本提取中出现分数断裂,无法 100% 确认准确读数,已在正文标注为低置信度 ⚠️待核对,建议核对官方 PDF 原始排版图。
6. **Sonnette — Custom Clutch 无独立 Exclusions 小节**:与 LiteRise/PowerView Gen 3/SoftTouch 均有明确的 Exclusions 列表不同,Custom Clutch 章节内未见对应小节标题,不确定是该系统本身无排除项,还是排除项未被本次抽取的页面范围覆盖,资料未提及。
7. **Sonnette — 面料专有名称缺失**:源文件全文没有给出任何具体面料系列专有名称(如 Applause 的 Amity、Kinship 等),仅有"9 个系列、77 种颜色"的汇总描述,无法进一步拆分成面料清单表。
8. **Sonnette — Custom Clutch Cassette Fully Recessed(XL 帘)数值缺失**:page SO-8 表格中 "XL Shades" 列在 Inside Mount Fully Recessed 一行未给出具体数字(源文件此格为空/仅标题),资料未提及。
9. **Applause 与 Duette 定位对比**:本文开篇的"Applause 与 Duette 定位区别"说明基于两份源文件的自我定位描述(Applause 自称 Streamlined Selection;Sonnette 提及 Duette Elan 系列)及行业常识性背景补充,**并非直接摘录自 Duette 官方规格书**(该文件不在本次任务范围内),如需精确对比数字请查阅 Duette 专属知识库文件。

以上待核对项建议在实际业务场景中,涉及具体报价、施工图纸或客户承诺前,回溯核对 Hunter Douglas 官方最新版 PDF 原文或联系官方技术支持确认。


---

# 附录:官方价格表(程序化提取,数字以此为准)

> 来源:Hunter Douglas US Price Guide (JAN 2026)。表格为 USD 标价(list price),实际零售价以经销商折扣为准。


<!-- pricing: applause -->
# applause — 官方价格数据
来源: HD_PG_US_JAN2026_01212026.pdf 页码: 26-33

### 价格表 AP-LF1
- 适用面料: HDOrigins® Collection — Esprit™ 3⁄4" (E36)  (代码: E36)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **191** | 218 | 247 | 304 | 362 | 414 | 475 | 535 | 590 | 653 | 705 | 762 | 818 | 897 | 907 |
| **48** | 220 | 252 | 290 | 363 | 432 | 505 | 574 | 709 | 719 | 858 | 863 | 1000 | 1006 | 1096 | 1109 |
| **60** | 249 | 293 | 334 | 414 | 498 | 590 | 666 | 828 | 847 | 1006 | 1010 | 1180 | 1187 | 1305 | 1318 |
| **72** | 281 | 325 | 375 | 469 | 569 | 679 | 771 | 949 | 972 | 1167 | 1173 | 1378 | 1384 | 1523 | 1538 |
| **84** | 309 | 362 | 417 | 533 | 648 | 765 | 879 | 1090 | 1113 | 1334 | 1343 | 1576 | 1583 | 1739 | 1757 |
| **96** | 339 | 402 | 460 | 597 | 722 | 861 | 989 | 1228 | 1253 | 1498 | 1516 | 1765 | 1776 | 1964 | 1984 |
| **108** | 364 | 434 | 505 | 651 | 796 | 933 | 1081 | 1336 | 1367 | 1642 | 1656 | 1938 | 1950 | 2164 | 2184 |
| **120** | 397 | 473 | 548 | 710 | 870 | 1024 | 1194 | 1474 | 1507 | 1831 | 1838 | 2151 | 2159 | 2399 | 2422 |
| **132** | 421 | 542 | 638 | 835 | 1017 | 1213 | 1405 | 1610 | 1777 | 1996 | 2157 | 2376 | 2539 | 2823 | 2835 |
| **144** | 454 | 543 | 639 | 838 | 1021 | 1216 | 1408 | 1736 | 1783 | 2152 | 2164 | 2534 | 2545 | 2834 | 2840 |

### 价格表 AP-LF2
- 适用面料: Kinship™ 3⁄4" (E26), Kinship Double Honeycomb (E28)  (代码: E26, E28)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 200 | 225 | 259 | 318 | 378 | 432 | 495 | 559 | 617 | 680 | 734 | 794 | 855 | 934 | 943 |
| **48** | 227 | 265 | 303 | 380 | 453 | 524 | 599 | 740 | 750 | 895 | 900 | 1045 | 1050 | 1143 | 1155 |
| **60** | 263 | 307 | 348 | 432 | 521 | 619 | 697 | 864 | 885 | 1051 | 1058 | 1235 | 1241 | 1362 | 1375 |
| **72** | 291 | 339 | 389 | 490 | 594 | 707 | 802 | 994 | 1014 | 1218 | 1225 | 1441 | 1448 | 1589 | 1604 |
| **84** | 322 | 378 | 435 | 556 | 674 | 800 | 919 | 1137 | 1163 | 1393 | 1400 | 1644 | 1652 | 1816 | 1833 |
| **96** | 356 | 420 | 483 | 626 | 753 | 898 | 1035 | 1281 | 1307 | 1564 | 1583 | 1841 | 1855 | 2050 | 2070 |
| **108** | 381 | 455 | 524 | 679 | 827 | 974 | 1128 | 1393 | 1426 | 1713 | 1727 | 2023 | 2035 | 2258 | 2279 |
| **120** | 415 | 493 | 574 | 744 | 910 | 1065 | 1247 | 1536 | 1574 | 1910 | 1920 | 2246 | 2254 | 2505 | 2531 |
| **132** | 440 | 564 | 666 | 868 | 1059 | 1264 | 1466 | 1681 | 1853 | 2085 | 2250 | 2481 | 2651 | 2947 | 2960 |
| **144** | 474 | 566 | 667 | 871 | 1062 | 1268 | 1469 | 1810 | 1858 | 2246 | 2258 | 2645 | 2657 | 2960 | 2965 |

### 价格表 AP-LF3
- 适用面料: Sunterra™ 3⁄4" (E40)  (代码: E40)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 259 | 296 | 337 | 410 | 488 | 560 | 643 | 724 | 801 | 882 | 957 | 1033 | 1109 | 1209 | 1221 |
| **48** | 298 | 342 | 395 | 489 | 585 | 682 | 775 | 960 | 972 | 1163 | 1168 | 1355 | 1361 | 1485 | 1498 |
| **60** | 338 | 396 | 452 | 560 | 674 | 804 | 904 | 1120 | 1146 | 1364 | 1371 | 1600 | 1608 | 1770 | 1788 |
| **72** | 375 | 441 | 506 | 637 | 771 | 914 | 1044 | 1289 | 1320 | 1577 | 1590 | 1865 | 1874 | 2062 | 2082 |
| **84** | 418 | 488 | 567 | 722 | 873 | 1036 | 1192 | 1477 | 1509 | 1810 | 1819 | 2132 | 2143 | 2355 | 2377 |
| **96** | 460 | 543 | 629 | 809 | 974 | 1165 | 1339 | 1654 | 1697 | 2031 | 2053 | 2387 | 2404 | 2660 | 2687 |
| **108** | 496 | 591 | 682 | 881 | 1075 | 1264 | 1465 | 1805 | 1848 | 2222 | 2242 | 2626 | 2639 | 2932 | 2961 |
| **120** | 536 | 638 | 740 | 965 | 1179 | 1382 | 1614 | 1996 | 2043 | 2476 | 2488 | 2912 | 2923 | 3248 | 3282 |
| **132** | 571 | 732 | 865 | 1126 | 1374 | 1641 | 1901 | 2181 | 2401 | 2699 | 2922 | 3216 | 3437 | 3826 | 3843 |
| **144** | 612 | 733 | 866 | 1129 | 1377 | 1647 | 1906 | 2347 | 2409 | 2916 | 2932 | 3430 | 3447 | 3843 | 3849 |

### 价格表 AP-LF4
- 适用面料: Amity™ 3⁄4" (E54), Crystalline™ 3⁄4" (E20), Legends Double Honeycomb (E5), Legends 3⁄4" (E6), Vintage™ 3⁄4" (E50)  (代码: E54, E20, E5, E6, E50)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 295 | 335 | 378 | 468 | 553 | 635 | 724 | 817 | 906 | 995 | 1081 | 1167 | 1255 | 1374 | 1388 |
| **48** | 338 | 387 | 442 | 547 | 658 | 768 | 872 | 1078 | 1098 | 1317 | 1325 | 1528 | 1535 | 1681 | 1698 |
| **60** | 382 | 447 | 509 | 635 | 766 | 904 | 1023 | 1269 | 1298 | 1549 | 1558 | 1812 | 1822 | 2003 | 2023 |
| **72** | 425 | 496 | 570 | 716 | 863 | 1025 | 1180 | 1455 | 1492 | 1789 | 1796 | 2104 | 2114 | 2331 | 2355 |
| **84** | 476 | 553 | 645 | 813 | 990 | 1173 | 1346 | 1671 | 1707 | 2046 | 2058 | 2415 | 2425 | 2662 | 2688 |
| **96** | 523 | 613 | 708 | 913 | 1109 | 1317 | 1513 | 1871 | 1920 | 2295 | 2325 | 2698 | 2718 | 3009 | 3039 |
| **108** | 559 | 664 | 772 | 994 | 1216 | 1432 | 1652 | 2046 | 2094 | 2518 | 2544 | 2973 | 2990 | 3318 | 3352 |
| **120** | 607 | 722 | 842 | 1095 | 1333 | 1568 | 1832 | 2254 | 2310 | 2803 | 2818 | 3297 | 3312 | 3682 | 3719 |
| **132** | 649 | 831 | 977 | 1270 | 1560 | 1859 | 2153 | 2469 | 2719 | 3057 | 3309 | 3646 | 3897 | 4329 | 4351 |
| **144** | 692 | 832 | 978 | 1276 | 1564 | 1864 | 2159 | 2659 | 2728 | 3302 | 3318 | 3889 | 3909 | 4349 | 4356 |

### 价格表 AP-RD1
- 适用面料: HDOrigins® Collection — Esprit™ 3⁄4" (E37)  (代码: E37)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 247 | 282 | 322 | 396 | 469 | 539 | 617 | 696 | 766 | 846 | 917 | 992 | 1064 | 1164 | 1176 |
| **48** | 286 | 329 | 377 | 472 | 561 | 656 | 746 | 920 | 933 | 1114 | 1119 | 1300 | 1307 | 1425 | 1440 |
| **60** | 325 | 379 | 432 | 539 | 649 | 766 | 865 | 1077 | 1103 | 1305 | 1313 | 1536 | 1543 | 1694 | 1712 |
| **72** | 364 | 420 | 487 | 609 | 740 | 880 | 1000 | 1234 | 1263 | 1517 | 1527 | 1791 | 1799 | 1981 | 2000 |
| **84** | 403 | 469 | 542 | 693 | 840 | 994 | 1142 | 1416 | 1444 | 1735 | 1744 | 2049 | 2058 | 2261 | 2282 |
| **96** | 439 | 520 | 598 | 777 | 938 | 1116 | 1287 | 1596 | 1627 | 1949 | 1972 | 2294 | 2310 | 2556 | 2581 |
| **108** | 473 | 563 | 656 | 845 | 1032 | 1214 | 1405 | 1736 | 1774 | 2131 | 2151 | 2519 | 2533 | 2810 | 2839 |
| **120** | 513 | 612 | 710 | 923 | 1130 | 1330 | 1552 | 1914 | 1959 | 2378 | 2390 | 2795 | 2806 | 3118 | 3149 |
| **132** | 548 | 704 | 828 | 1083 | 1322 | 1574 | 1824 | 2091 | 2309 | 2594 | 2802 | 3088 | 3301 | 3669 | 3687 |
| **144** | 588 | 705 | 830 | 1086 | 1325 | 1578 | 1829 | 2254 | 2315 | 2795 | 2810 | 3293 | 3310 | 3687 | 3693 |

### 价格表 AP-RD2
- 适用面料: Kinship™ 3⁄4" (E27)  (代码: E27)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 262 | 291 | 334 | 411 | 493 | 562 | 640 | 725 | 801 | 884 | 953 | 1035 | 1110 | 1212 | 1224 |
| **48** | 296 | 343 | 391 | 494 | 586 | 681 | 778 | 962 | 975 | 1163 | 1169 | 1358 | 1365 | 1483 | 1498 |
| **60** | 340 | 396 | 452 | 562 | 677 | 803 | 906 | 1125 | 1149 | 1369 | 1376 | 1603 | 1611 | 1771 | 1789 |
| **72** | 380 | 439 | 506 | 633 | 774 | 917 | 1043 | 1290 | 1318 | 1584 | 1593 | 1870 | 1880 | 2065 | 2087 |
| **84** | 422 | 493 | 564 | 723 | 875 | 1041 | 1195 | 1475 | 1511 | 1810 | 1819 | 2138 | 2148 | 2359 | 2382 |
| **96** | 461 | 545 | 628 | 812 | 978 | 1165 | 1342 | 1664 | 1697 | 2033 | 2057 | 2392 | 2409 | 2664 | 2692 |
| **108** | 495 | 590 | 681 | 883 | 1075 | 1264 | 1466 | 1808 | 1855 | 2223 | 2245 | 2631 | 2646 | 2934 | 2964 |
| **120** | 537 | 634 | 745 | 966 | 1181 | 1387 | 1620 | 1995 | 2043 | 2481 | 2492 | 2920 | 2931 | 3256 | 3287 |
| **132** | 572 | 733 | 866 | 1130 | 1377 | 1643 | 1905 | 2181 | 2407 | 2705 | 2925 | 3224 | 3442 | 3829 | 3849 |
| **144** | 615 | 734 | 867 | 1134 | 1382 | 1649 | 1909 | 2354 | 2414 | 2920 | 2934 | 3435 | 3452 | 3849 | 3854 |

### 价格表 AP-RD3
- 适用面料: Sunterra™ 3⁄4" (E41)  (代码: E41)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 336 | 382 | 437 | 533 | 635 | 730 | 835 | 943 | 1039 | 1145 | 1244 | 1342 | 1438 | 1571 | 1588 |
| **48** | 388 | 443 | 512 | 637 | 758 | 883 | 1007 | 1245 | 1263 | 1510 | 1518 | 1759 | 1769 | 1929 | 1949 |
| **60** | 440 | 513 | 590 | 730 | 877 | 1045 | 1173 | 1455 | 1489 | 1773 | 1783 | 2078 | 2090 | 2300 | 2324 |
| **72** | 486 | 568 | 652 | 829 | 1003 | 1188 | 1355 | 1674 | 1710 | 2051 | 2068 | 2425 | 2436 | 2680 | 2707 |
| **84** | 542 | 635 | 738 | 940 | 1133 | 1347 | 1547 | 1917 | 1959 | 2349 | 2360 | 2771 | 2783 | 3059 | 3089 |
| **96** | 599 | 703 | 815 | 1049 | 1266 | 1513 | 1742 | 2153 | 2205 | 2637 | 2667 | 3101 | 3124 | 3456 | 3491 |
| **108** | 643 | 764 | 883 | 1143 | 1397 | 1642 | 1903 | 2350 | 2403 | 2887 | 2913 | 3410 | 3430 | 3809 | 3848 |
| **120** | 694 | 830 | 961 | 1254 | 1531 | 1795 | 2097 | 2591 | 2655 | 3216 | 3232 | 3787 | 3801 | 4224 | 4266 |
| **132** | 745 | 952 | 1125 | 1465 | 1783 | 2134 | 2469 | 2833 | 3122 | 3507 | 3798 | 4179 | 4466 | 4970 | 4994 |
| **144** | 794 | 953 | 1126 | 1469 | 1790 | 2139 | 2476 | 3051 | 3132 | 3790 | 3809 | 4456 | 4478 | 4993 | 5002 |

### 价格表 AP-RD4
- 适用面料: Amity™ 3⁄4" (E55), Legends™ 3⁄4" (E3), Vintage™ 3⁄4" (E51)  (代码: E55, E3, E51)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 | 132 | 144 | 156 | 168 | 174 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 381 | 433 | 488 | 608 | 718 | 826 | 943 | 1063 | 1176 | 1290 | 1405 | 1516 | 1629 | 1788 | 1804 |
| **48** | 440 | 502 | 570 | 709 | 853 | 998 | 1130 | 1399 | 1427 | 1709 | 1719 | 1985 | 1995 | 2186 | 2207 |
| **60** | 496 | 579 | 662 | 826 | 995 | 1173 | 1328 | 1649 | 1687 | 2012 | 2024 | 2353 | 2364 | 2603 | 2629 |
| **72** | 551 | 643 | 744 | 930 | 1120 | 1330 | 1533 | 1892 | 1939 | 2324 | 2335 | 2731 | 2746 | 3032 | 3061 |
| **84** | 615 | 718 | 839 | 1056 | 1284 | 1521 | 1750 | 2167 | 2217 | 2659 | 2676 | 3137 | 3151 | 3457 | 3491 |
| **96** | 679 | 795 | 920 | 1186 | 1438 | 1707 | 1966 | 2429 | 2496 | 2981 | 3017 | 3507 | 3533 | 3912 | 3950 |
| **108** | 724 | 860 | 1004 | 1288 | 1582 | 1860 | 2147 | 2658 | 2721 | 3272 | 3305 | 3863 | 3884 | 4316 | 4358 |
| **120** | 787 | 940 | 1095 | 1422 | 1731 | 2036 | 2377 | 2928 | 3002 | 3644 | 3662 | 4286 | 4304 | 4787 | 4833 |
| **132** | 843 | 1078 | 1270 | 1651 | 2026 | 2416 | 2798 | 3204 | 3536 | 3973 | 4304 | 4739 | 5064 | 5628 | 5655 |
| **144** | 896 | 1079 | 1274 | 1657 | 2032 | 2424 | 2805 | 3457 | 3548 | 4291 | 4316 | 5053 | 5079 | 5653 | 5664 |

### fabric_to_chart (面料→价格表 映射)
- E36 → AP-LF1
- E26 → AP-LF2
- E28 → AP-LF2
- E40 → AP-LF3
- E54 → AP-LF4
- E20 → AP-LF4
- E5 → AP-LF4
- E6 → AP-LF4
- E50 → AP-LF4
- E37 → AP-RD1
- E27 → AP-RD2
- E41 → AP-RD3
- E55 → AP-RD4
- E3 → AP-RD4
- E51 → AP-RD4

### fabric_names_to_chart (面料→价格表 映射)
- HDOrigins® Collection — Esprit™ 3⁄4" → AP-RD1
- Kinship™ 3⁄4" → AP-RD2
- Kinship Double Honeycomb → AP-LF2
- Sunterra™ 3⁄4" → AP-RD3
- Amity™ 3⁄4" → AP-RD4
- Crystalline™ 3⁄4" → AP-LF4
- Legends Double Honeycomb → AP-LF4
- Legends 3⁄4" → AP-LF4
- Vintage™ 3⁄4" → AP-RD4
- Legends™ 3⁄4" → AP-RD4

### operating_system_surcharges
- **EasyRise**: {"type": "flat", "amount": 0}
- **LiteRise**: {"type": "flat", "amount": 0}
- **PowerView® Gen 3**: {"type": "tiered_grid", "tiers": {"small": {"amount": 50}, "medium": {"amount": 130}, "large": {"amount": 345}}}
- **Sidelights, Cordless Operable**: {"type": "flat", "amount": 50}
- **UltraGlide**: {"type": "flat", "amount": 130}

### design_option_surcharges
- **Cut-Outs**: {"type": "per_unit", "amount": 120}
- **(Left and Right Pair)3**: {"type": "flat", "amount": 35}


<!-- pricing: sonnette -->
# sonnette — 官方价格数据
来源: HD_PG_US_JAN2026_01212026.pdf 页码: 47-49

### 价格表 SON-LF1
- 适用面料: Highline™ Light Filtering (SN05)  (代码: SN05)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 |
|---|---|---|---|---|---|---|---|---|
| **36** | 412 | 445 | 500 | 622 | 746 | 860 | 970 | 1101 |
| **48** | 448 | 494 | 542 | 668 | 791 | 912 | 1023 | 1165 |
| **60** | 491 | 545 | 609 | 719 | 838 | 963 | 1081 | 1227 |
| **72** | 531 | 599 | 666 | 796 | 927 | 1087 | 1222 | 1389 |
| **84** | 572 | 646 | 721 | 882 | 1031 | 1205 | 1363 | 1547 |
| **96** | 611 | 703 | 786 | 981 | 1133 | 1323 | 1504 | 1708 |

### 价格表 SON-LF2
- 适用面料: Lenox™ Light Filtering (SN19), Textura™ Light Filtering (SN07)  (代码: SN19, SN07)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 |
|---|---|---|---|---|---|---|---|---|
| **36** | 457 | 494 | 556 | 692 | 829 | 955 | 1077 | 1225 |
| **48** | 498 | 549 | 602 | 745 | 878 | 1013 | 1140 | 1292 |
| **60** | 545 | 605 | 678 | 798 | 930 | 1067 | 1199 | 1364 |
| **72** | 591 | 666 | 742 | 885 | 1031 | 1207 | 1359 | 1543 |
| **84** | 637 | 720 | 801 | 980 | 1144 | 1336 | 1512 | 1719 |
| **96** | 678 | 780 | 873 | 1095 | 1259 | 1470 | 1673 | 1898 |

### 价格表 SON-LF3
- 适用面料: Ainsley™ Light Filtering (SN11), Elan® Light Filtering (SN01), Elan Metallic Light Filtering (SN03), Heritage™ Light Filtering (SN09), Mackay™ Light Filtering (SN17), Thatcher™ Light Filtering (SN13)  (代码: SN11, SN01, SN03, SN09, SN17, SN13)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 |
|---|---|---|---|---|---|---|---|---|
| **36** | 487 | 524 | 593 | 735 | 878 | 1016 | 1144 | 1302 |
| **48** | 528 | 580 | 641 | 791 | 932 | 1075 | 1209 | 1373 |
| **60** | 578 | 644 | 719 | 847 | 989 | 1134 | 1275 | 1451 |
| **72** | 623 | 707 | 788 | 941 | 1097 | 1280 | 1446 | 1635 |
| **84** | 676 | 765 | 851 | 1043 | 1216 | 1420 | 1610 | 1826 |
| **96** | 719 | 831 | 926 | 1160 | 1336 | 1563 | 1780 | 2019 |

### 价格表 SON-RD1
- 适用面料: Highline Room Darkening (SN06)  (代码: SN06)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 |
|---|---|---|---|---|---|---|---|---|
| **36** | 494 | 533 | 600 | 749 | 892 | 1031 | 1165 | 1320 |
| **48** | 536 | 594 | 648 | 801 | 949 | 1092 | 1228 | 1395 |
| **60** | 590 | 656 | 729 | 863 | 1002 | 1151 | 1298 | 1472 |
| **72** | 637 | 717 | 797 | 955 | 1111 | 1304 | 1466 | 1663 |
| **84** | 686 | 775 | 867 | 1060 | 1233 | 1446 | 1633 | 1855 |
| **96** | 729 | 842 | 941 | 1179 | 1357 | 1586 | 1805 | 2050 |

### 价格表 SON-RD2
- 适用面料: Lenox Room Darkening (SN20), Textura Room Darkening (SN08)  (代码: SN20, SN08)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 |
|---|---|---|---|---|---|---|---|---|
| **36** | 549 | 593 | 667 | 832 | 992 | 1145 | 1290 | 1466 |
| **48** | 597 | 656 | 723 | 892 | 1054 | 1215 | 1367 | 1547 |
| **60** | 654 | 727 | 810 | 957 | 1116 | 1281 | 1442 | 1634 |
| **72** | 706 | 796 | 886 | 1062 | 1235 | 1448 | 1629 | 1850 |
| **84** | 763 | 864 | 962 | 1178 | 1372 | 1605 | 1816 | 2061 |
| **96** | 809 | 935 | 1045 | 1311 | 1507 | 1764 | 2009 | 2279 |

### 价格表 SON-RD3
- 适用面料: Ainsley Room Darkening (SN12), Elan Room Darkening (SN02), Elan Metallic Room Darkening (SN04), Heritage Room Darkening (SN10), Mackay Room Darkening (SN18), Thatcher Room Darkening (SN14)  (代码: SN12, SN02, SN04, SN10, SN18, SN14)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 |
|---|---|---|---|---|---|---|---|---|
| **36** | 580 | 630 | 709 | 881 | 1053 | 1217 | 1372 | 1557 |
| **48** | 636 | 698 | 767 | 948 | 1121 | 1287 | 1452 | 1645 |
| **60** | 696 | 772 | 861 | 1018 | 1185 | 1361 | 1530 | 1737 |
| **72** | 749 | 845 | 942 | 1128 | 1315 | 1539 | 1731 | 1964 |
| **84** | 809 | 918 | 1020 | 1252 | 1457 | 1704 | 1931 | 2192 |
| **96** | 860 | 994 | 1109 | 1394 | 1602 | 1877 | 2134 | 2422 |

### fabric_to_chart (面料→价格表 映射)
- SN05 → SON-LF1
- SN19 → SON-LF2
- SN07 → SON-LF2
- SN11 → SON-LF3
- SN01 → SON-LF3
- SN03 → SON-LF3
- SN09 → SON-LF3
- SN17 → SON-LF3
- SN13 → SON-LF3
- SN06 → SON-RD1
- SN20 → SON-RD2
- SN08 → SON-RD2
- SN12 → SON-RD3
- SN02 → SON-RD3
- SN04 → SON-RD3
- SN10 → SON-RD3
- SN18 → SON-RD3
- SN14 → SON-RD3

### fabric_names_to_chart (面料→价格表 映射)
- Highline™ Light Filtering → SON-LF1
- Lenox™ Light Filtering → SON-LF2
- Textura™ Light Filtering → SON-LF2
- Ainsley™ Light Filtering → SON-LF3
- Elan® Light Filtering → SON-LF3
- Elan Metallic Light Filtering → SON-LF3
- Heritage™ Light Filtering → SON-LF3
- Mackay™ Light Filtering → SON-LF3
- Thatcher™ Light Filtering → SON-LF3
- Highline Room Darkening → SON-RD1
- Lenox Room Darkening → SON-RD2
- Textura Room Darkening → SON-RD2
- Ainsley Room Darkening → SON-RD3
- Elan Room Darkening → SON-RD3
- Elan Metallic Room Darkening → SON-RD3
- Heritage Room Darkening → SON-RD3
- Mackay Room Darkening → SON-RD3
- Thatcher Room Darkening → SON-RD3

### operating_system_surcharges
- **Custom Clutch**: {"type": "flat", "amount": 0}
- **LiteRise**: {"type": "flat", "amount": 0}
- **SoftTouch Motorization (any width)**: {"type": "flat_per_shading", "amount": 200}
- **SoftTouch with Rechargeable Battery Wand 2**: {"type": "flat_per_shading", "amount": 270}
- **PowerView® Gen 3 1**: {"type": "tiered_grid", "tiers": {"small": {"amount": 200}, "medium": {"amount": 270}, "large": {"amount": 345}}}

### design_option_surcharges
- **Custom Clutch Designer Metal Bracket**: {"type": "flat_per_shading", "amount": 130, "unit_label": "per shade"}
- **Fabric-Covered Headrail**: {"type": "flat_per_shading", "amount": 65, "unit_label": "per shade\nSonnette"}

═══════════════════════════════════════════════
# 【分册】03_Silhouette_Nantucket_柔纱帘
═══════════════════════════════════════════════

# Hunter Douglas Silhouette® / Nantucket™ Window Shadings 深度产品知识库

> 数据来源:
> - `/Volumes/SSD2T/Projects/Hunter Douglas/_organized/silhouette/ALL_SPEC.txt`(Hunter Douglas US 官方 Product Specifications,Rev. 20 JAN 2026,页码 SI-2 ~ SI-94)
> - `/Volumes/SSD2T/Projects/Hunter Douglas/_organized/nantucket/ALL_SPEC.txt`(同上,页码 NT-1 ~ NT-55)
>
> 本文件所有尺寸数字均为**源文件原文照抄**,未做任何推算或编造。凡源文件未明确给出的数值,标注为「资料未提及」;凡因 OCR/表格错位导致读取把握不足的数字,标注 **⚠️待核对**。价格/surcharge 具体金额不在本文件范围内(见文末附录说明)。

---

## 0. Silhouette® 与 Nantucket™ 的关系与区别

- **Nantucket™ Window Shadings** 官方定义(源文件 NT-5 原文):"Nantucket™ Window Shadings, a collection of Silhouette® Window Shadings, combine innovative design with style and feature S-shaped vanes."
  - 即 **Nantucket 是 Silhouette 产品家族下的一个子系列(collection)**,共享同一套操作系统平台(EasyRise™、LiteRise®、PowerView® Gen 3、SoftTouch®、UltraGlide®)、同一套 Headrail 硬件体系(Classic Headrail、A Deux Headrail)、同一套五金配色规则与安装深度标准。
  - **核心区别在叶片(vane)形态**:Silhouette 标准叶片为平面/常规形态,提供 2"、3"、Quartette® 4" 三种叶片宽度、十余种面料系列(含 Alustra® 高端系列、ClearView® 透光系列、Halo™ 系列等);Nantucket 叶片为 **S 形(S-shaped vanes)**,只提供统一的叶片开度与开合规格(见第2章「Vane Operation」),面料系列自成一套(Boardwalk™、Brant Point™、Centre Park™ 等,前缀编号以 N2x/N3x/N8x 开头)。
  - Nantucket **没有** Silhouette 核心线中的 Quartette 4"、A Deux 与 Duolite 的部分面料适配、PowerView+™ Gen 3、Duolite®、Tilt-Only Low-Profile Headrail、Silhouette Halo™ 等分支(详见下方"产品矩阵对照表")。
  - Nantucket 的 Headrail Specifications 页(NT-54)明确写道各操作系统尺寸标准页与 Silhouette 相同结构;A Deux Headrail 图纸数字与 Silhouette A Deux Headrail **完全一致**(1" Minimum I.B. Depth、4" Fully Recessed、1" Minimum O.B. Flat Surface、3⁷⁄₈"、5³⁄₈")。

### 产品矩阵对照表(操作系统 × 设计选项)

| 操作系统 / 设计选项 | Silhouette® | Nantucket™ |
|---|---|---|
| Bottom-up(标准提升) | ✓ | ✓ |
| EasyRise™ | ✓ | ✓ |
| LiteRise® | ✓ | ✓ |
| PowerView® Gen 3 Automation | ✓ | ✓ |
| PowerView+™ Gen 3 Automation | ✓ | 资料未提及(Nantucket 目录未列出此系统) |
| SoftTouch® Motorization | ✓ | ✓ |
| UltraGlide® | ✓ | ✓ |
| Two-On-One Headrail(仅 UltraGlide,部分含 EasyRise/LiteRise) | ✓ | ✓(UltraGlide;EasyRise/LiteRise 也有 Two-On-One 尺寸表,但 A Deux 与 Tilt-Only 均排除) |
| A Deux™ | ✓(EasyRise/LiteRise/PowerView Gen 3) | ✓(EasyRise/LiteRise/PowerView Gen 3) |
| Duolite®(双帘,后置遮光卷帘,顺序联动) | ✓(PowerView Gen 3、UltraGlide) | 资料未提及(Nantucket 目录未列出 Duolite) |
| Specialty Shapes, Non-Operable(异形,不可操作) | ✓(Angle/Arch/Imperfect Arch/Circle/Extended Arch/Hexagon/Octagon/Oval/Quarter Circle/Trapezoid) | ✓(仅 Angle / Arch and Imperfect Arch / Extended Arch,含 Open 与 Privacy 两态) |
| Tilt-Only Standard Headrail | ✓ | ✓ |
| Tilt-Only Low-Profile Headrail | ✓ | 资料未提及(Nantucket 目录未列出 Low-Profile Headrail) |
| Silhouette® Halo™(叶片可过度旋转/over-rotate 重新导光) | ✓(独立子章节,含 EasyRise/PowerView Gen 3/SoftTouch/UltraGlide/Duolite) | 不适用(Halo 是 Silhouette 专属分支,Nantucket 无) |
| Grandiose™(3" 叶片装在 Quartette 4" Headrail 上,加长垂降) | ✓(仅 EasyRise) | 资料未提及 |

---

## 1. Silhouette® Window Shadings

### 1.1 概述

Silhouette® Window Shadings 是 Hunter Douglas 的软百叶帘(sheer shading)产品线,叶片(vane)悬浮于前后两层透光面料(sheer facing)之间。分为 **Core Line(核心线)** 与 **Alustra®(高端线,含 Aria®、Brio™、Mila™ 三个面料系列)** 两大产品线,二者提供的操作系统种类相同,但 Alustra 的具体尺寸上限(Max. Width / Max. Height)常与 Core Line 不同(详见各操作系统表)。

设计选项(Design Options):A Deux™、Duolite®。
特殊分支:Silhouette® Halo™(叶片可过度旋转以重新导光,详见第1.10节)。

### 1.2 叶片(Vane)尺寸

Silhouette 提供三种叶片宽度(源文件 SI-8,"Vane Openings"图示):
- **2" Vane Size**
- **3" Vane Size**
- **Quartette® 4" Vane Size**

叶片尺寸与面料对应关系(SI-7 Fabric Overview,原文数据):

| 提供 2"/3"/Quartette 4" 全部尺寸 | 仅提供 3" 与 Quartette 4" |
|---|---|
| Bon Jour®、Bon Soir™、Originale™、Toujours™ | Alustra® Aria®、Alustra Brio™、Alustra Mila™、Angelica™、ClearView® Mystere™、ClearView Nouveau™、ClearView Originale™、Ella™、Mystere™、Nouveau™、Solar Screen™、Stria™、Terra™ |

Halo™ ClearView® Elan® 为 Halo 专属面料,仅提供 **4"(Quartette)** 一种叶片尺寸,与核心 Silhouette 分属不同产品分支。

**叶片闭合(Vane Closure)测量规则(SI-8 原文)**:
- 测量方法:"the distance between the front and rear fabric facings 6" up from the lowest point of the bottom rail, with the shading fully lowered and the vanes closed."
- 除 Bon Soir 外的所有 2" 面料:高度 <60" 时闭合缝隙 **⅝"**;高度 >60" 时 **⅞"**。
- Bon Soir 2" 面料:恒为 **⅝"**,不论高度。
- 所有 3" 与 Quartette 4" 面料:恒为 **1"**,不论高度。
- Halo™ 4" 面料:恒为 **1"**(测量基准点为"最低叶片"而非"底梁最低点",与标准 Silhouette 略有区别)。
- 提示:为保证叶片充分闭合,底梁在闭合时可能比订购长度高出最多 **1"**(自窗台起算)。

**并排安装叶片对齐容差**:同批订购、同面料/颜色/叶片尺寸/高度/操作系统/设计选项,且下单时勾选"side-by-side"选项,可保证对齐容差在 **¼"** 以内。

### 1.3 面料系列总览(Fabric Overview,源文件 SI-7)

| 面料 Fabric | 叶片尺寸 | 可选颜色数 | 叶片描述 Vane Description | Headrail 配色规则 |
|---|---|---|---|---|
| Alustra Aria® | 3", Quartette 4" | 6 | White(白色系,Sheer) | Solid Color(纯色) |
| Alustra Brio™ | 3", Quartette 4" | 8 | White/Colored | Solid Color |
| Alustra Mila™ | 3", Quartette 4" | 4 | White/Colored | Solid Color |
| Angelica™ | 3", Quartette 4" | 12 | White | Solid Color |
| Bon Jour® | 2", 3", Quartette 4" | 8 | Raw silk texture(生丝质感) | Coordinates w/vane(随叶片配色) |
| Bon Soir™ | 2", 3", Quartette 4" | 8 | Light dimming(**遮光/光感面料**) | Coordinates w/vane |
| ClearView® Mystere™ | 3", Quartette 4" | 8 | Horizontal texture(**ClearView 透视系列**) | Coordinates w/vane |
| ClearView Nouveau™ | 3", Quartette 4" | 4 | Nature-inspired texture(**ClearView**) | Coordinates w/vane |
| ClearView Originale™ | 3", Quartette 4" | 16 | Classic texture(**ClearView**) | Coordinates w/vane |
| Ella™ | 3", Quartette 4" | 6 | White | Solid Color |
| Halo™ ClearView® Elan® | 4"(Halo 专属,Quartette only) | 12 | Natural texture | Solid Color |
| Mystere™ | 3", Quartette 4" | 8 | Horizontal texture | Coordinates w/vane |
| Nouveau™ | 3", Quartette 4" | 4 | Nature-inspired texture | Coordinates w/vane |
| Originale™ | 2", 3", Quartette 4" | 12 | Classic texture | Coordinates w/vane |
| Solar Screen™ | 3", Quartette 4" | 6 | White | Solid Color |
| Stria™ | 3", Quartette 4" | 12 | White/Colored | Solid Color |
| Terra™ | 3", Quartette 4" | 6 | White | Solid Color |
| Toujours™ | 2", 3", Quartette 4" | 8 | Linen texture | Coordinates w/vane |

**关键分类说明**:
- **ClearView® 系列**(ClearView Mystere™、ClearView Nouveau™、ClearView Originale™,以及 Halo 专属的 Halo ClearView Elan®):源文件将其单独标注"ClearView",指其叶片带有透视/半透明设计,便于对比查看时区分于普通 Textured/White 面料。
- **A Deux™ 双层面料**:A Deux 本身不是独立面料,而是"前层 Silhouette 面料帘 + 后层白色遮光卷帘"的双帘设计选项(见1.9节);A Deux 的 Headrail 采用"纯色配套面料罩(fabric-covered headrail in solid matching fabric only)"。
- **Bon Soir™ = 光感/遮光(Light dimming)面料**,注意其叶片闭合规则与其他 2" 面料略有不同(恒为⅝",见1.2节)。
- Alustra 系列(Aria/Brio/Mila)与 UltraGlide® 搭配为标准(源文件 SI-6:"UltraGlide® comes standard with Alustra")。

Note(SI-7 原文):"Silhouette participates in Hunter Douglas' Whole House Solution™.";"A Deux shadings come with fabric-covered headrail in solid matching fabric only."

### 1.4 操作系统总览:Max Size & Fabric At a Glance(SI-7)

| 操作系统 | Core Line Max Width | Core Line Max Height | Alustra Max Width | Alustra Max Height |
|---|---|---|---|---|
| EasyRise™ | 144" | 136" | 144" | 126" |
| LiteRise® | 144" | 84" | 144" | 96" |
| PowerView® Gen 3 | 120" | 126" | 115" | 126" |
| PowerView+™ Gen 3 | 120" | 126" | 115" | 126" |
| SoftTouch® | 96" | 96" | 96" | 96" |
| UltraGlide® | 144" | 126" | 144" | 126" |

| 设计选项 | Core Line Max W | Core Line Max H | Alustra Max W | Alustra Max H |
|---|---|---|---|---|
| A Deux™ | 96" | 102" | 96" | 102" |
| Duolite® | 84" | 84" | 84" | 84" |
| Tilt-Only Standard | 30" | 120" | 30" | 120" |
| Tilt-Only Low-Profile | 30" | 96" | 30" | 96" |

原文脚注:"Specialty Shapes (Non-operable) max size offerings vary by shape. For details, see Size Standards."/"Minimum and maximum size standards vary by fabric and design option. For details, see size standards charts."

> ⚠️ 待核对:上表为源文件 SI-7 的汇总总览数字,与各操作系统章节(1.5~1.10节)的逐面料明细表在个别面料上会有出入(总览表通常取该操作系统"全部面料中的最大值",不代表每个面料都能做到此尺寸,请以各章节逐面料表为准)。

### 1.5 EasyRise™(SI-12 ~ SI-17)

**说明**:提拉绳环操作(cord loop),从下往上开启。符合美国 ANSI 绳类窗帘安全标准,需正确安装 cord tensioner(见第4章 Child Safety)。

**Min/Max(Alustra,标准 vs. Two-On-One Headrail)**

| 面料(Alustra) | Min W / Min H(标准) | Max W / Max H(标准) | Min W / Min H(2-on-1) | Max W / Max H(2-on-1) |
|---|---|---|---|---|
| Aria™ 3", A94 | 12" / 16" | 96" / 96" | 24" / 16" | 144" / 96" |
| Aria Quartette® 4", A95 | 12" / 16" | 96" / 96" | 24" / 16" | 144" / 96" |
| Brio™ 3", A60 | 12" / 16" | 110" / 126" | 24" / 16" | 144" / 126" |
| Brio Quartette™ 4", A70 | 12" / 16" | 110" / 126" | 24" / 16" | 144" / 126" |
| Brio 3" Bon Soir™, A61 | 12" / 16" | 110" / 112" | 24" / 16" | 144" / 112" |
| Brio Bon Soir Quartette 4", A71 | 12" / 16" | 110" / 106" | 24" / 16" | 144" / 106"⚠️待核对 |
| Mila™ 3", A92 | 12" / 16" | 115" / 112" | 24" / 16" | 144" / 112" |
| Mila Quartette 4", A93 | 12" / 16" | 115" / 112" | 24" / 16" | 144" / 112" |

**Min/Max(Core Line,标准 / Grandiose™ / Two-On-One Headrail)** —— Min W 12" / Min H 16"(标准),Min W 24" / Min H 16"(Two-On-One)

| 面料(Core Line) | Max W / Max H(标准) | Grandiose™ Max W/H(仅部分面料) | Max W / Max H(2-on-1) |
|---|---|---|---|
| Angelica 3"/4", A84/A85 | 120" / 126"(Quartette 同) | 144" / 126" | 144" / 126" |
| Bon Jour® 2", A16 | 120" / 90" | — | 144" / 90" |
| Bon Jour 3", A17 | 120" / 90" | 120" / 110"⚠️待核对 | 144" / 90" |
| Bon Jour Quartette 4", A30 | 120" / 96" | — | 144" / 96" |
| Bon Soir™ 2", A3 | 120" / 102" | — | 144" / 102" |
| Bon Soir 3", A6 | 120" / 112" | — | 144" / 112" |
| Bon Soir Quartette 4", A23 | 120" / 120" | 114" / 136"⚠️待核对 | 144" / 120" |
| ClearView® Mystere™ 3"/4", A90/A91 | 114" / 120" | — | 144" / 120" |
| ClearView Nouveau™ 3", A96 | 114" / 90" | 114" / 110"⚠️待核对 | 144" / 90" |
| ClearView Nouveau Quartette 4", A97 | 114" / 102" | — | 144" / 102" |
| ClearView® Originale™ 3"/4", A68/A69 | 114" / 126" | 114" / 136"⚠️待核对 | 144" / 126" |
| Ella™ 3"/4", A88/A89 | 115" / 96" | — | 144" / 96" |
| Mystere™ 3", A42 | 120" / 120" | 120" / 136" | 144" / 120" |
| Mystere Quartette 4", A43 | 120" / 120" | — | 144" / 120" |
| Nouveau™ 3", A36 | 120" / 90" | 120" / 110"⚠️待核对 | 144" / 90" |
| Nouveau Quartette® 4", A37 | 120" / 102" | — | 144" / 102" |
| Originale™ 2", A1 | 120" / 120" | 120" / 136" | 144" / 120" |
| Originale 3", A2 | 120" / 126" | 120" / 126"⚠️待核对 | 144" / 126" |
| Originale Quartette® 4", A24 | 120" / 120" | 120" / 136" | 144" / 120" |
| Solar Screen™ 3", A86 | 120" / 106" | 120" / 126"⚠️待核对 | 144" / 106" |
| Solar Screen Quartette 4", A87 | 120" / 106" | — | 144" / 106" |
| Stria™ 3", A82 | 110" / 126" | 110" / 136" | 144" / 126" |
| Stria Quartette 4", A83 | 109" / 106"⚠️待核对 | — | 144" / 106" |
| Terra™ 3", A46 | 109" / 106"⚠️待核对 | 109" / 126"⚠️待核对 | 144" / 106" |
| Terra Quartette 4", A47 | 120" / 106" | — | 144" / 106" |
| Toujours™ 2", A4 | — | — | — |
| Toujours 3", A7 | — | — | — |
| Toujours Quartette 4", A29 | — | — | — |

> ⚠️ 上表 Core Line 部分行(标注⚠️)因源文件为纯文本表格、行列对齐存在错位风险,已由两名独立子代理反复核对但仍存残余不确定性,**实际报价/生产订单前请以 Hunter Douglas 官方 DirectConnect 系统或最新 PDF 版 Size Standards 表格复核**。Toujours 三种叶片行在提取中未能可靠对齐,标注为不确定,已如实呈现而非编造。

**通用规则(Grandiose™,SI-13 原文脚注)**:"Grandiose™ shading, see Design Option Surcharges."(3" 叶片装配 Quartette 4" Headrail,以获得更长垂降;仅 EasyRise 提供)

**Two-On-One Headrail 规则**:
- "Maximum single panel width for EasyRise™ with/for Two-On-One Headrail is 108"."
- "Two-On-One Headrail unequal panels: The smaller panel must be at least one-third the width of the larger panel."
- "Maximum ordered width for end mount (EB) shadings is 48" (end mount not available with Two-On-One Headrail)."

**安装深度(Operating System Specifications,SI-15)**:
- Inside Mount (IB) minimum casement depth:**1"**
- Fully recessed:**3⁵⁄₁₆"**(Classic Headrail,2"/3" 叶片)
- Outside Mount (OB):minimum flat vertical surface **1"**,recommended width overlap per side **3"**
- Minimum rear fabric clearance:**⅛"**
- 若使用可选 Back Cover,IB 最小深度 **+¼"**

**成品尺寸公差(Finished Dimensions,SI-15/16)**:
- IB:Headrail unit width **–1⁄4"**;Shading height **+0" to –1⁄4"**;Fabric width **–1¹⁄₈"**
- OB:Headrail unit width = ordered width;Shading height **+0"/–¼"**;Fabric width **–⅞"**
- EB:Headrail unit width **–1¹⁄₁₆"**;Shading height **+0"/–¼"**;Fabric width **–1⁹⁄₁₆"**
- Two-On-One:Fabric width IB **–1³⁄₈"**,OB **–1¹⁄₈"**,两幅间缝隙 **⅜"**
- Edge Gaps:IB 控制侧 **1¹⁄₁₆"**、非控制侧 **⁷⁄₁₆"**;EB 控制侧 **²⁹⁄₃₂"**、非控制侧 **²¹⁄₃₂"**

**Cord Loop Drop 对照表(SI-16)**

| 帘高 Shading Height | Cord Loop Drop |
|---|---|
| 16"–26⅞" | 1' |
| 27"–39⅞" | 2' |
| 40"–59⅞" | 3' |
| 60"–83⅞" | 4' |
| 84"–107⅞" | 5' |
| 108"及以上 | 6' |

Cord Tensioner 颜色:048 Black、320 Rich Cream、661 White Tiara、689 Ash(绳子颜色随 Tensioner 配色)。

**排除项**:Grandiose 排除全部 2"/4" 叶片面料及 Bon Soir;Two-On-One Headrail 不可做端装(EB);Two-On-One Headrail 与 Grandiose 不可同时使用。

### 1.6 LiteRise®(SI-18 ~ SI-22)

**说明**:手柄操作(cordless,无绳),从下往上开启。

**Min/Max**:标准 Min W **18"**,Min H **12"**;Two-On-One Min W **36"**,Min H **12"**。

**关键规则(高度上限随宽度分段,适用几乎所有面料)**:
- 宽度 18"–22":Max Height **60"**
- 宽度 22⅛"–24":Max Height **72"**
- 宽度大于 24":Max Height **84"**(Core Line 与 Alustra 绝大多数面料均在此封顶,个别 Quartette 4" 面料在极窄宽度下读取到 74"/76"/78" 等中间值 ⚠️待核对)

| 面料(Alustra) | Max Width(标准) | Max Height | Max Width(2-on-1) | Max Height(2-on-1) |
|---|---|---|---|---|
| Aria™ 3"/4" | 96" | 84" | 144" | 84" |
| Brio™ 3"/4" | 110" | 84" | 144" | 84" |
| Brio 3" Bon Soir™ / Quartette | 110" | 84" | 144" | 84" |
| Mila™ 3"/4" | 115" | 84" | 144" | 84" |

Core Line 各面料在超过 24" 宽度时,Max Height 统一为 **84"**(标准与 Two-On-One 相同上限),部分面料(如 Bon Soir Quartette 4"、Toujours Quartette 4")在中间宽度段读取到较低数值(74"/76"/78" 等)——⚠️待核对,请以官方 PDF 复核逐面料明细。

**Two-On-One Headrail 规则**:"Maximum overall width is 144" and minimum overall width is 36" (18" per panel)." "Maximum single panel width is 108"." 不等宽面板:小面板须≥大面板宽度的三分之一。"Maximum height corresponds to the single panel maximum heights shown above. With unequal panels, the smaller height applies." "Maximum ordered width for end (EB) mount shadings is 48"." "No size waivers outside of listed specifications."

**安装深度**:与 EasyRise 相同 Classic Headrail 规格 —— IB 最小深度 **1"**,Fully Recessed **3⁵⁄₁₆"**;OB 最小平面 **1"**,推荐重叠宽度 **3"**每侧。

**成品尺寸公差**:IB Fabric width **–⅞"**;OB Fabric width **–⅝"**;EB Headrail unit width **–1¹⁄₁₆"**、Fabric width **–1⁵⁄₁₆"**;Two-On-One Fabric width IB **–⅞"**、OB **–⅝"**,面板间缝隙 **⅜"**。

**排除项**:Two-On-One Headrail 不可做端装(EB)。

### 1.7 PowerView® Gen 3 Automation(SI-23 ~ SI-29)

**说明**:全自动无线控制系统。Min Width:**13"(配 Satellite Mounted Battery Wand, SMBW)/ 21"(配 Headrail Mounted Battery Wand, HMBW)**;Min Height **12"**。适配所有叶片尺寸(2"/3"/Quartette 4")。

| 面料(Alustra) | Max Width | Max Height |
|---|---|---|
| Aria™ 3"/4" | 96" | 96" |
| Brio™ 3"/4" | 110" | 126" |
| Brio Bon Soir 3"/4" | 110" | 112" |
| Mila™ 3"/4" | 115" | 112" |

Core Line(代表性数值,SI-23/24 原文):Angelica 120"×126";Bon Jour 2"/3"/Quartette 4" 120"×90";Bon Soir 2" 120"×102",3" 120"×112",Quartette 4" 120"×120";ClearView Mystere 114"×120";ClearView Nouveau 114"×90";ClearView Originale 114"×126";Ella 115"×96";Mystere 120"×120";Originale 2"/3" 120"×126"、Quartette 4" 120"×120";Solar Screen 3" 120"×120"、Quartette 4" 120"×106";Stria 3" 120"×106"、Quartette 4" 110"×126";Terra 3" 110"×126"、Quartette 4" 109"×106"⚠️待核对;Toujours 2" 109"×106"、3" 120"×106"(Quartette 4" 行 ⚠️待核对,未能可靠确认)。

**安装深度(Classic Headrail / Quartette 4" Headrail 双轨制,依电源方式区分)**:

| 配置 | IB 最小深度 | IB Fully Recessed | 备注 |
|---|---|---|---|
| Headrail Mount Battery Wand(标准) | **2"** | Classic 4¹⁄₁₆" / Quartette 4⁹⁄₁₆" | 标准配置 |
| Headrail Mount **Rechargeable** Battery Wand(可选) | **2¼"** | Classic 4⁵⁄₁₆" / Quartette 4¹³⁄₁₆" | 可选 |
| Other Power Options(可选,如硬接线) | **1¼"** | Classic 3½" / Quartette 4" | 可选 |

- Outside Mount (OB):minimum mounting surface height **2"**⚠️(此数值在 SI-25 排版中位置存在歧义,亦见其他行显示"1"";Nantucket 对应页明确写"1""——建议以 **1"** 为准,Silhouette 页面因排版分离读取存疑,标注⚠️待核对);Recommended width overlap per side **3"**;Minimum rear fabric clearance **⅛"**。
- End Mount (EB) minimum mounting surface depth:Built-in battery wand **2¹⁄₈"**;Satellite battery pack **1½"**;Rechargeable battery wand **2⅜"**。

**成品尺寸公差**:IB Fabric width **–1"**;OB Fabric width **–¾"**;EB Headrail unit width **–1¹¹⁄₁₆"**⚠️(源文件显示 "–1⁷⁄₁₆"",按 Nantucket 对应页确认为 **–1⁷⁄₁₆"**,此处以此为准)、Fabric width **–1⁷⁄₁₆"**。IB/OB/EB Shading height 均为 **+0" to –¼"**。所有允差基准为订购尺寸,宽度可能有 **+0/–⅛"** 浮动;最大帘高公差 **–¼"**。

**排除项**:back cover with rechargeable battery wand;left-side motor and control button(马达/控制按钮恒定在右侧,除非另有说明);Two-On-One Headrail(不提供)。

**电源选项**:C-size satellite battery wand(线长 15"、4'、10'、20'),18V DC Power Supply,daisy-chain cable(单链最长 50'),16-shade DC Power Supply(最多带 16 个窗帘,不可与 daisy-chain 混用),headrail-mounted rechargeable battery wand。配件包括 PowerView Gen 3 Remote、Pebble®、Surface、Gateway、Gateway Pro、Gateway Mount、Solar Charger Kit 等。

### 1.8 PowerView+™ Gen 3 Automation(SI-30 ~ SI-34)

**关键限制**:**仅提供 Quartette 4" 面料**,所有 2"/3" 叶片面料均显示"–"(不提供)。Min Width **13"**,Min Height **12"**。

| 面料(Alustra,Quartette 4") | Max Width | Max Height |
|---|---|---|
| Aria Quartette 4" | 96" | 96" |
| Brio Quartette 4" | 110" | 126" |
| Brio Bon Soir Quartette 4" | 110" | 106" |
| Mila Quartette 4" | 115" | 112" |

Core Line(Quartette 4"):Angelica 120"×126";Bon Jour 120"×90";Bon Soir 120"×120";ClearView Mystere 114"×120";ClearView Nouveau 114"×90";ClearView Originale 114"×126";Ella 115"×96";Mystere 系列在 Quartette 4" 下显示不提供("–")⚠️;其余面料(Nouveau、Originale、Solar Screen、Stria、Terra、Toujours Quartette 4")读取把握不足 ⚠️待核对,一般遵循与 PowerView Gen 3 同面料相近的数值模式。

**必须硬接线("Must be hardwired")** —— 无电池供电选项,使用专属 "PowerView+ Gen 3 Smart Power Supply" 与 "PowerView+ Daisy-Chain Cable"(每路最多串联三个窗帘)。

**排除项**:2"/3" 叶片面料;A Deux;Duolite;左侧马达/控制按钮;Two-On-One Headrail。马达与控制按钮恒定在右侧。

**安装深度**:IB 最小深度 **1¼"**,Fully Recessed **4"**;OB 最小平面 **1"**;EB 最小深度 **1½"**。

### 1.9 SoftTouch® Motorization(SI-35 ~ SI-40)

**说明**:马达+摇杆(wand)控制。Min Width **18"**,Min Height **12"**(标准与 Alustra 均同)。

- **Alustra**:Aria、Brio、Brio Bon Soir、Mila 全部为 **96"×96"**。
- **Core Line**:绝大多数面料 **96"×96"**;**Bon Jour(2"/3"/Quartette 4")上限为 96"×90"**(唯一例外)。

**安装深度**(与 PowerView Gen 3 相同结构):
- Headrail Mount Battery Wand(标准):IB 最小深度 **2"**,Fully Recessed Classic **4¹⁄₁₆"**
- Headrail Mount Rechargeable Battery Wand(可选):IB 最小深度 **2¼"**,Fully Recessed Classic **4⁵⁄₁₆"**
- Other Power Options(可选):IB 最小深度 **1¼"**,Fully Recessed Classic **3½"**
- OB:最小平面 **1"**,重叠 **3"**,后部面料间隙 **⅛"**
- EB:Headrail Mount battery wand **2¹⁄₈"**;Satellite battery pack **1½"**;Rechargeable battery wand **2⅜"**

**Wand Length 标准(按帘高分段,SI-38/39)**:

| 帘高 Height | 标准摇杆长 Wand Length |
|---|---|
| 12"–26" | 12" |
| 26⅛"–36" | 18" |
| 36⅛"–48" | 24" |
| 48⅛"–60" | 30" |
| 60⅛"–72" | 36" |
| 72⅛"–84" | 42" |
| 84⅛"–96" | 48" |

自定义摇杆长度:默认帘高的 50%,可在 12"–48" 之间以 6" 为增量覆盖。

**排除项**:A Deux;Duolite;back cover with rechargeable battery wand;Two-On-One Headrail。若使用 daisy-chain 电缆,总长不超过 **50 英尺**,组合总面积不超过 **100 平方英尺**。

### 1.10 UltraGlide®(SI-41 ~ SI-47)

**说明**:摇杆(wand)操作,"一键落帘开启叶片,泵动摇杆闭合叶片或升帘"。标准 Min W **12"**,Min H **12"**;Two-On-One Min W **24"**,Min H **12"**。**UltraGlide® 是 Alustra 系列的标配操作系统**(SI-6 原文:"UltraGlide® comes standard with Alustra")。

| 面料(Alustra) | Max Width(标准) | Max Height | Max Width(2-on-1) | Max Height(2-on-1) |
|---|---|---|---|---|
| Aria™ 3"/4" | 96" | 96" | 144" | 96" |
| Brio™ 3"/4" | 110" | 126" | 144" | 126" |
| Brio Bon Soir 3"/4" | 110" | 112" | 144" | 112" |
| Mila™ 3"/4" | 115" | 112" | 144" | 112" |

**Core Line 高度上限按宽度分段("waterfall"表)**:17½" 宽以下 vs. 24"–36" 宽及以上分别取不同 Max Height(与 Nantucket 规则相同结构:"UltraGlide maximum heights apply to shadings over 17½" wide")。

| 面料 | Max H @窄幅(约12"–17½") | Max H @≥24"宽 |
|---|---|---|
| Angelica | 106" | 126" |
| Bon Jour 2"/3" | 90" | 90" |
| Bon Jour Quartette 4" | 96" | 96" |
| Bon Soir 2" | 102" | 102" |
| Bon Soir 3" | 106" | 112" |
| Bon Soir Quartette 4" | 106" | 120" |
| ClearView Mystere | 106" | 120" |
| ClearView Originale | 106" | 126" |
| ClearView Nouveau 3" | 90" | 90" |
| ClearView Nouveau Quartette 4" | 96" | 96" |
| Ella | 96" | 96" |
| Mystere | 106" | 120" |
| Nouveau 3" | 90" | 90" |
| Nouveau Quartette 4" | 96" | 96" |
| Originale 2" | 106" | 120" |
| Originale 3"/Quartette 4" | 106" | 126" |
| Solar Screen | 106" | 120" |
| Stria | 102" | 102" |
| Terra | 106" | 126" |
| Toujours(全部叶片) | 106" | 106" |

> ⚠️ 42"–108" 中间宽度段个别单元格因文本表格错位,读取把握不足,标注 ⚠️待核对,请以官方最新 Size Standards 复核。

**Two-On-One Headrail 规则**:总宽最大 **144"**,最小 **36"**(每片 18");单片最大宽度 **108"**;不等宽面板小片须≥大片三分之一;摇杆位置:左片摇杆在左侧、右片摇杆在右侧;不可做端装(EB);**不可与 A Deux 同时使用**。

**安装深度**:与 EasyRise/LiteRise 相同 Classic Headrail 规格 —— IB 最小深度 **1"**,Fully Recessed **3⁵⁄₁₆"**;OB 最小平面 **1"**,重叠 **3"**。

**成品尺寸公差**:IB Fabric width **–1¹⁄₈"**;OB Fabric width **–⅞"**;EB Headrail unit width **–1¹⁄₁₆"**、Fabric width **–1⁹⁄₁₆"**;Two-On-One IB **–1⅜"**,OB **–1⅛"**,面板间缝隙 **⅜"**。

**排除项**:Two-On-One Headrail 不可做端装(EB);**A Deux 不适用于 UltraGlide**(A Deux 仅支持 EasyRise/LiteRise/PowerView Gen 3)。

### 1.11 Specialty Shapes, Non-Operable(异形,不可操作,SI-48 ~ SI-53)

仅支持 **Inside Mount (IB)**,不支持 Outside Mount。

| 形状 Shape | Min Width | Max Width | Min Height | Max Height |
|---|---|---|---|---|
| Angle(2"/3"/Quartette 4") | 12" | 84" | 12" | 84" |
| Arch, Imperfect Arch¹ | 12" | 84" | 8" | 42" |
| Circle | 12" | 72" | 12" | 72" |
| Extended Arch¹ | 12" | 84" | 12" | 84" |
| Hexagon, Octagon, Trapezoid | 12" | 72" | 12" | 72" |
| Oval | 12" | 72" | 12" | 72" |
| Quarter Circle | 12" | 42" | 8" | 42" |

¹ 含 privacy arch/angle 应用。"Perfect arch" 定义为宽度恰好等于高度的 2 倍;"Imperfect arch" 为宽度大于高度 2 倍。Extended Arch 要求"拱顶与直边之间至少 8"距离"。

**开合形态**:所有 Open 特殊形状叶片固定在打开位置;所有 Privacy Closed arch/angle 形状叶片固定并向上倾斜以获得隐私。

**安装深度(casement depth)**:privacy angle **1⅝"**;privacy arch **1"**;其余特殊形状按叶片宽度:2" 面料 **2"**,3" 面料 **3"**,Quartette 4" 面料 **4"**。

**公差**:宽度 **+0/–⅛"**;高度 **±⅛" 最高至 +¼"**;异形整体扣除量(specialty shape deduction)**¼" 四周均扣**。

**排除项**:Outside Mount (OB);side-by-side vane alignment(不支持并排对齐保证);**Brio 面料不可用于任何 Arch 形状**。

### 1.12 A Deux™(SI-54 ~ SI-61)

**设计**:前层 Silhouette 面料帘 + 后层白色遮光卷帘(room-darkening roller shade),两者**独立操作**。仅支持 **EasyRise™、LiteRise®、PowerView® Gen 3 Automation** 三种操作系统。

Min Width:EasyRise/LiteRise **18"**,PowerView Gen 3 **21"**(个别面料随宽度分段取 18"/21"/22");Min Height **22"**(EasyRise/LiteRise)。

| 面料线 | EasyRise Max W/H | LiteRise Max W/H | PowerView Gen 3 Max W/H |
|---|---|---|---|
| Alustra Aria | 不提供("–") | 96"/96" | 96"/84" |
| Alustra Brio | 96"/102" | 96"/84" | 96"/96" |
| Alustra Mila | 同 Brio 模式 | 同上 | 同上 |
| Core Line(多数,如 Angelica/ClearView Mystere/Nouveau/Originale/Solar Screen/Stria/Terra/Toujours) | 约 96"/102" | 约 96"/84" | 约 96"/96" |
| Bon Jour | 96"/90" | 96"/84" | 96"/90" |

**确认排除**:**Quartette 4" 与 Bon Soir 面料不适用于 A Deux**(全部显示"–")。

**关键规则**:
- "A Deux shadings come with fabric-covered headrail in solid matching fabric only."(纯色配套面料罩)
- "PowerView Gen 3 shadings up to 42" wide will have one battery wand/rechargeable battery wand. Shadings over 42" wide will have two. One 18V DC Power Supply will operate both panels."
- "EasyRise front panel control available on left or right side – back panel control will be on the opposite side."
- "PowerView Gen 3 motor and control button always located on the right side."

**安装深度(A Deux Headrail,专属)**:
- IB 基础最小深度 **1"**;配 PowerView Gen 3 headrail-mounted battery wand **1⅝"**;配 rechargeable battery wand **1⅞"**
- Fully Recessed:基础 **4"**;配 battery wand **4¾"**;配 rechargeable battery wand **5"**
- OB 最小平面 **1"**

**排除项**:back cover;back cover with rechargeable battery wand;End Mount;hardware color substitution(不可更换五金颜色);左侧 PowerView Gen 3 马达/控制按钮;magnetic hold-down brackets;Quartette 4" 与 Bon Soir 面料;spacer blocks(除 OB PowerView Gen 3 配电池摇杆外);Two-On-One Headrail;Halo ClearView Elan 面料。

**Child Safety(A Deux 专属提示,原文)**:"EasyRise shadings require a mounted cord tensioner on each side."

### 1.13 Duolite®(SI-62 ~ SI-68)

**设计**:前层 Silhouette 面料帘 + 后层白色遮光卷帘,集成于同一卷轴,**单次提升按顺序联动操作**(面料帘须完全放下且叶片打开后,遮光卷帘才能放下)。仅支持 **PowerView® Gen 3 Automation** 与 **UltraGlide®**。**仅提供 Quartette 4" Palette 面料罩 Headrail**。

Min Width **21"**,Min Height **12"**(两系统相同)。

| 面料线 | PowerView Gen 3 / UltraGlide Max W×H |
|---|---|
| Alustra(Aria、Brio、Mila) | 84"×84" |
| Alustra Brio Bon Soir | 不提供("–") |
| Core Line(Angelica、ClearView Mystere、ClearView Originale、Mystere、Originale、Solar Screen、Stria) | 84"×84" |
| Core Line(Bon Jour、ClearView Nouveau、Ella、Nouveau、Terra、Toujours) | 84"×60" |
| Bon Soir | 不提供("–") |

**关键规则**:"The Silhouette Duolite room-darkening back panel will be ⅛" narrower on each side than the front shading fabric." "Each Duolite shading is shipped with a skew kit."

**排除项**:back cover with rechargeable battery wand;Bon Soir 面料;End Mount;magnetic hold-down brackets;Two-On-One Headrail(**不可用**)。

### 1.14 Tilt-Only Standard Headrail & Tilt-Only Low-Profile Headrail(SI-69 ~ SI-74)

Min Width **6"**(两者相同);Min Height:Standard **16"**,Low-Profile **12"**。

| 面料线 | Standard Max W×H | Low-Profile Max W×H |
|---|---|---|
| Alustra Aria | 30"×96" | 30"×96" |
| Alustra Brio / Brio Bon Soir / Mila | 30"×120" | 30"×96" |
| Core Line(全部 2"/3" 叶片面料) | 30"×120" | 30"×96" |

**确认排除**:**Quartette 4" 与 Halo ClearView Elan 4" 面料均不提供**(Tilt-Only 不适用于 4" 叶片)。

Tilt-Only 用于门边窗/窄侧窗,不可从完全放下位置提升;磁性压条(magnetic hold-down brackets)用于固定底梁;叶片仍可通过 EasyRise cord loop 操作开合。

**Tilt-Only Low-Profile Headrail 安装深度**:IB 最小深度 **1"**,Fully Recessed **3¹⁄₁₆"**;OB 最小安装面高度 **¾"**,推荐重叠宽度每侧 **3"**。Wand 颜色:**868 Gardenia**。

### 1.15 Silhouette® Halo™(SI-77 ~ SI-94)

**核心特征**:Halo™ 叶片可**过度旋转(over-rotate)**以重新导光,区别于标准 Silhouette 叶片(SI-9 原文对比图)。**仅一种面料**:Halo™ ClearView® Elan® 4"(型号 A80),固定使用 **Quartette 4" Headrail**。也提供 Duolite 组合(见下)。

| Halo 操作系统 | Min Width | Min Height | Max Width | Max Height |
|---|---|---|---|---|
| Halo EasyRise | 12" | 16" | 108" | 120" |
| Halo PowerView Gen 3 | 13"(SMBW)/21"(HMBW) | 12" | 108" | 120" |
| Halo SoftTouch | 18" | 12" | 96" | 96" |
| Halo UltraGlide | 12" | 16" | 108"(24"+宽时) | 106"(@17½"宽)/120"(@24"+宽) |
| Halo Duolite – PowerView Gen 3 | 21" | 12" | 84" | 84" |
| Halo Duolite – UltraGlide | 21" | 12" | 84" | 84" |

交叉核对(SI-94,Ordering Overview):"Fabric: Halo ClearView Elan 4", A80 / Headrail Size: Quartette 4" / Max. Width and Height: 108" x 120"."

**Halo 通用排除项(每个 Halo 操作系统页均列出)**:A Deux 与 Duolite(个别系统内互斥);End Mount;hardware color substitution(**Halo 不支持五金颜色更换**);magnetic hold-down brackets;**Two-On-One Headrail(Halo 全系统均不提供)**;PowerView 系统另排除 back cover with rechargeable battery wand 与左侧马达/控制按钮。

---

## 2. Nantucket™ Window Shadings

### 2.1 概述与叶片(Vane)特征

Nantucket™ 是 Silhouette 家族子系列,标志性特征是 **S 形叶片(S-shaped vanes)**(源文件 NT-5 原文):"With vanes open, the sheer facings soften outside views, filter the incoming sunlight, and help block harmful UV rays. With vanes closed, enjoy privacy without complete darkness — and additional UV protection."

**Vane Operation(NT-11,统一规格,不分面料)**:
- **Vane Opening(叶片打开时的通透视野宽度)**:统一为 **1½"**("The vane opening for all Nantucket™ fabrics is 1½"")
- **Vane Closure(叶片闭合缝隙)**:统一为 **1"**("The vane closure for all Nantucket™ fabrics is 1"."),测量方法与 Silhouette 相同(距底梁最低点 6" 处测量前后面料间距)
- 并排对齐容差:同批订购、同款式/面料/颜色/叶片尺寸/安装方式/高度,且勾选 side-by-side 选项,可保证 **¼"** 以内。
- 提示:闭合时底梁可能高出订购长度(未在 Nantucket 页明确给出具体英寸数,与 Silhouette 一致的"up to 1"提升"未见 Nantucket 逐字复述,资料未提及具体数值,仅描述"slight over-rotation can occur")。

Nantucket 操作系统总览(NT-5):

| 操作系统 | Bottom-up | A Deux™ | Two-on-One Headrail |
|---|---|---|---|
| EasyRise™ | ✓ | ✓ | ✓ |
| LiteRise® | ✓ | ✓ | ✓ |
| PowerView® Gen 3 Automation | ✓ | ✓ | — |
| SoftTouch® Motorization | ✓ | — | — |
| UltraGlide® | ✓ | — | ✓ |

另有 Specialty:Tilt-Only Standard;Specialty Shapes, Non-Operable。

### 2.2 面料系列与硬件配色(Nantucket™ Fabric Overview,NT-6)

| 面料 Fabric | 前缀 Prefix | 可选颜色数 | 叶片描述 | 分类(White/Colored) | 经销商限制 |
|---|---|---|---|---|---|
| Boardwalk™ | N25 | 8 | Nature-inspired | White | 无 |
| Brant Point™ | N37 | 8 | Horizontal texture | Colored | 无 |
| Centre Park™ | N83 | 8 | Classic linen | Colored | 无 |
| Front Street™ | N21 | 12 | Solid color | White | 无 |
| Misty Harbor™ | N23 | 12 | Solid color | White | 无 |
| Parksley™ | N82 | 8 | Distressed texture | White | 无 |
| Sankaty™ | N35 | 8 | Soft texture | White | 无 |
| Sun Porch™ | N31 | 8 | Subtle linen texture | White | 无 |
| HD Origins™ Collection – Amara™ | N84 | 8 | Boucle texture | White | **仅 Centurion™ Dealers 可订(Available to Centurion™ Dealers only)** |
| HD Origins™ Collection – Amara™, Light Dimming | N85 | 8 | Boucle texture(**遮光**) | White | **仅 Centurion™ Dealers 可订** |

订购须知:下单时字母数字前缀(N21/N23/N25/N31/N35/N37/N82/N83/N84/N85)必须写在面料色号前面。

**硬件配色规则(Hardware Color-Coordination,NT-7/NT-8)**:每个面料色号都有对应的**默认底梁/五金颜色(Hardware Color)**,以及可选的 **Palette® Fabric-Covered Headrail(面料罩 Headrail)配色**(NT-9/NT-10)。举例(完整表详见源文件 NT-7~NT-10,共十个面料系列 × 8~12 色号的完整映射,数据量大不在此逐一复制,以下为结构示例):

- Boardwalk™ N25-201 Picket Fence → 默认硬件色 **661 White Tiara**;Palette 面料罩色 → **125 Radiant White**
- Boardwalk™ N25-1056 Coastal Night → 默认硬件色 **609 Falcon Gray**;Palette 面料罩色 → **234 Foggy Mist**
- Sankaty™ N35-303 Kiawah → 默认硬件色与 Palette 面料罩色**相同**,均为 **320/303 Kiawah**(源文件显示为同名对应)

完整的十系列 × 全色号硬件对照表(共约90组色号映射)请查阅源文件 NT-7~NT-10;因数据量巨大且高度结构化(每行为"面料色号 → 五金色号"简单映射,无额外业务逻辑),本知识库不逐条复制,建议按需查询源文件对应面料段落。

**通用规则**:
- "Palette® Fabric-Covered Headrail: coordinating fabric that covers the headrail for a soft look is available at a surcharge (**except automatic with no surcharge on A Deux™ Shadings**)."
- "Nantucket™ Palette® Fabric-Covered Headrails coordinate with Nantucket™ fabrics using Silhouette® Originale™ fabric."(即 Nantucket 的面料罩 Headrail 实际使用 Silhouette Originale™ 面料制作,以求配色协调)
- "Headrails on shadings ordered specifically without the Palette Fabric-Covered Headrail are only available in **661 White Tiara**."

### 2.3 EasyRise™(NT-14 ~ NT-18)

| | Standard | Two-On-One Headrail |
|---|---|---|
| Min. Width | 12" | 24" |
| Min. Height | 16" | 16" |

| 面料 | Max Width(标准/2-on-1) | Max Height(标准=2-on-1) |
|---|---|---|
| Boardwalk™, N25 | 120" / 144" | 90" |
| Brant Point™, N37 | 120" / 144" | 90" |
| Centre Park™, N83 | 120" / 144" | 126" |
| Front Street™, N21 | 120" / 144" | 120" |
| Misty Harbor™, N23 | 120" / 144" | 112" |
| Parksley™, N82 | 120" / 144" | 120" |
| Sankaty™, N35 | 120" / 144" | 126" |
| Sun Porch™, N31 | 120" / 144" | 126" |
| HD Origins Amara™, N84 | 120" / 144" | 120" |
| HD Origins Amara™ Light-Dimming, N85 | 120" / 144" | 112" |

Notes:"Maximum ordered width for end mount (EB) shadings is 48"." Two-On-One:"Maximum single panel width is 108". With unequal panels, the smaller panel must be at least one-third the width of the larger."

**排除项**:Two-On-One Headrail as end mount。

**安装深度(Classic Headrail)**:IB 最小深度 **1"**,Fully Recessed **3⁵⁄₁₆"**;OB 最小平面 **1"**,重叠 **3"**;EB 最小深度 **1¼"**;后部面料间隙 **⅛"**。若用 Back Cover,IB 加 **¼"**。

**成品尺寸公差**:IB Fabric width **–1⅛"**;OB Fabric width **–⅞"**;EB Headrail width **–1¹⁄₁₆"**、Fabric width **–1⁹⁄₁₆"**;Two-On-One IB **–1⅜"**、OB **–1⅛"**,面板间隙 **⅜"**。Edge Gaps:IB 控制侧 **1¹⁄₁₆"**、非控制侧 **⁷⁄₁₆"**;EB 控制侧 **²⁹⁄₃₂"**、非控制侧 **²¹⁄₃₂"**。

**Cord Loop Drop 表**(与 Silhouette 相同分段):16"–26⅞"→1';27"–39⅞"→2';40"–59⅞"→3';60"–83⅞"→4';84"–107⅞"→5';108"–126"→6'。

Cord Tensioner 颜色:048 Black、320 Rich Cream、661 White Tiara、689 Ash。

**Tilt-Only Standard(Nantucket 内嵌于 EasyRise 页说明)**:"Fits sidelights or other narrow rectangular windows. Shadings are tilt-only and cannot be raised from the fully lowered position. Magnetic hold-down brackets are used to anchor the bottom rail. Vanes are fully operable using the EasyRise cord loop."

### 2.4 LiteRise®(NT-19 ~ NT-22)

Min Width:**18"(标准)/ 36"(2-on-1)**;Min Height **12"**。

| 面料 | Max Width(标准/2-on-1) | Max Height(标准¹/2-on-1) |
|---|---|---|
| 全部十个面料系列 | 120" / 144" | **84"¹** / 84" |

¹ "LiteRise's 84" maximum height applies to shadings over 24" wide. Maximum height for shadings 18" to 22" wide is 60"; maximum height for shadings 22⅛" to 24" wide is 72"."(与 Silhouette LiteRise 完全一致的宽度分段规则)

Two-On-One:"Maximum single panel width is 108". With unequal panels, the smaller panel must be at least one-third the width of the larger. Maximum height limitations apply to each individual panel."

**排除项**:Two-On-One Headrail as end mount。

**安装深度**:IB 最小深度 **1"**,Fully Recessed **3⁵⁄₁₆"**;OB 最小平面 **1"**,重叠 **3"**;EB 最小深度 **1¼"**。

**成品公差**:IB Fabric width **–⅞"**;OB Fabric width **–⅝"**;EB Headrail width **–1¹⁄₁₆"**、Fabric width **–1⁵⁄₁₆"**;Two-On-One IB **–⅞"**、OB **–⅝"**,面板间隙 **⅜"**。Edge Gaps IB 两侧均 **⁷⁄₁₆"**;EB 两侧均 **²¹⁄₃₂"**。

### 2.5 PowerView® Gen 3 Automation(NT-23 ~ NT-28)

Min Width:**13"(SMBW)/ 21"(HMBW)**;Min Height **12"**。

| 面料 | Max Width | Max Height |
|---|---|---|
| Boardwalk™, N25 | 120" | 90" |
| Brant Point™, N37 | 120" | 90" |
| Centre Park™, N83 | 120" | 126" |
| Front Street™, N21 | 120" | 120" |
| Misty Harbor™, N23 | 120" | 112" |
| Parksley™, N82 | 120" | 120" |
| Sankaty™, N35 | 120" | 126" |
| Sun Porch™, N31 | 120" | 126" |
| HD Origins Amara™, N84 | 120" | 120" |
| HD Origins Amara™ Light-Dimming, N85 | 120" | 112" |

Note:"PowerView® Gen 3 shadings (including A Deux™ design option) less than 23" in width with rechargeable battery wand are only available with satellite mount."

**排除项**:back cover with rechargeable battery wand;left-side motor and control button;Two-On-One Headrail(**PowerView Gen 3 不提供 Two-On-One**)。

**安装深度**:
- IB Headrail-Mounted Battery Wand(标准):最小深度 **2"**,Fully Recessed **4¹⁄₁₆"**
- IB Headrail-Mounted Rechargeable Battery Wand(可选):最小深度 **2¼"**,Fully Recessed **4⁵⁄₁₆"**
- IB Other Power Options(可选):最小深度 **1¼"**,Fully Recessed **3½"**
- OB 最小平面 **1"**,重叠 **3"**
- EB:Built-in battery wand **2¹⁄₈"**;Satellite battery pack **1½"**;Rechargeable battery wand **2⅜"**

**成品公差**:IB Fabric width **–1"**;OB Fabric width **–¾"**;EB Headrail width **–1¹⁄₁₆"**、Fabric width **–1⁷⁄₁₆"**。IB Edge Gap 两侧 **½"**。

### 2.6 SoftTouch® Motorization(NT-29 ~ NT-34)

Min Width **18"**,Min Height **12"**。

| 面料 | Max Width | Max Height |
|---|---|---|
| Boardwalk™, N25 | 96" | 90" |
| Brant Point™, N37 | 96" | 90" |
| Centre Park™, N83 | 96" | 96" |
| Front Street™, N21 | 96" | 96" |
| Misty Harbor™, N23 | 96" | 96" |
| Parksley™, N82 | 96" | 96" |
| Sankaty™, N35 | 96" | 96" |
| Sun Porch™, N31 | 96" | 96" |
| HD Origins Amara™, N84 | 96" | 96" |
| HD Origins Amara™ Light-Dimming, N85 | 96" | 96" |

Note:"SoftTouch® Shadings less than 23" in width with rechargeable battery wand are only available with satellite mount."

**排除项**:**A Deux(不可用);** back cover with rechargeable battery wand;**Two-On-One Headrail(不可用)**。若用 daisy-chain 电缆,总长不超过 **50 英尺**,总面积不超过 **100 平方英尺**。

**安装深度**(与 PowerView Gen 3 相同结构):Headrail Mount Battery Wand 标准 IB 深度 **2"**/Fully Recessed **4¹⁄₁₆"**;Rechargeable 版 IB **2¼"**/Fully Recessed **4⁵⁄₁₆"**;Other Power IB **1¼"**/Fully Recessed **3½"**;OB 最小平面 **1"**,重叠 **3"**,后部间隙 **⅛"**;EB Built-in **2¹⁄₈"**、Satellite **1½"**、Rechargeable **2⅜"**。

### 2.7 UltraGlide®(NT-35 ~ NT-39)

Min Width:**12"(标准)/ 24"(2-on-1)**;Min Height **12"**。

| 面料 | Max Width(标准/2-on-1) | Max Height¹(标准=2-on-1,宽>17½"时) |
|---|---|---|
| Boardwalk™, N25 | 120" / 144" | 90" |
| Brant Point™, N37 | 120" / 144" | 90" |
| Centre Park™, N83 | 120" / 144" | 126" |
| Front Street™, N21 | 120" / 144" | 120" |
| Misty Harbor™, N23 | 120" / 144" | 112" |
| Parksley™, N82 | 120" / 144" | 120" |
| Sankaty™, N35 | 120" / 144" | 126" |
| Sun Porch™, N31 | 120" / 144" | 126" |
| HD Origins Amara™, N84 | 120" / 144" | 120" |
| HD Origins Amara™ Light-Dimming, N85 | 120" / 144" | 112" |

¹ "UltraGlide® maximum heights apply to shadings over 17½" wide. Maximum height for shadings 12" to 17½" wide is **106"** (except for Boardwalk™ and Brant Point™, which remain **90"**)."

Note:"Maximum ordered width for end mount (EB) shadings is 48"." Two-On-One:"Maximum single panel width is 108". With unequal panels, the smaller panel must be at least one-third the width of the larger. Maximum height limitations apply to each individual panel."

**排除项**:**A Deux(不可用)**;Two-On-One Headrail as end mount (EB)。

**摇杆(Wand)长度**:12"–84",6" 为增量;推荐摇杆手柄高度与使用者肩高一致。

**安装深度**:IB 最小深度 **1"**,Fully Recessed **3⁵⁄₁₆"**;OB 最小平面 **1"**,重叠 **3"**;EB 最小深度 **1¼"**。

**成品公差**:IB Fabric width **–1⅛"**;OB Fabric width **–⅞"**;EB Headrail width **–1¹⁄₁₆"**、Fabric width **–1⁹⁄₁₆"**;Two-On-One IB **–1⅜"**、OB **–1⅛"**,面板间隙 **⅜"**。Edge Gaps IB 控制侧 **1¹⁄₁₆"**、非控制侧 **⁷⁄₁₆"**;EB 控制侧 **²⁹⁄₃₂"**、非控制侧 **²¹⁄₃₂"**。

### 2.8 Specialty Shapes, Non-Operable(NT-40 ~ NT-45)

仅 **Inside Mount (IB)**,三种形状:**Angle、Arch and Imperfect Arch、Extended Arch**(相比 Silhouette 少了 Circle/Hexagon/Octagon/Oval/Quarter Circle/Trapezoid)。

| 形状 | Min Width | Max Width | Min Height | Max Height |
|---|---|---|---|---|
| Angle¹ | 12" | 84" | 12" | 84" |
| Arch and Imperfect Arch¹ | 12" | 84" | 8" | 42" |
| Extended Arch¹ | 12" | 84" | 12" | 84" |

¹ 含 privacy arch/angle 应用,十个面料系列上限统一相同。

**安装深度**:Casement depth, open vanes **3"**;casement depth, privacy arch **1"**;casement depth, privacy angle **1⅝"**。异形扣除量 **¼"** 四周。Extended Arch 要求拱顶与直边间至少 **8"**。宽度公差 **+0/–⅛"**,高度公差 **±⅛" 最高至 +¼"**。

**排除项**:Outside mounts (OB);side-by-side vane alignment。

### 2.9 A Deux™(NT-46 ~ NT-52)

仅支持 **EasyRise™、LiteRise®、PowerView® Gen 3 Automation**。

Min Width:EasyRise **18"**,LiteRise **18"**,PowerView Gen 3 **21"**;Min Height:EasyRise **12"**,LiteRise/PowerView Gen 3 **22"**。

| 面料 | EasyRise Max W/H | LiteRise Max W/H | PowerView Gen 3 Max W/H |
|---|---|---|---|
| Boardwalk™, N25 | 90"/90" | 90"/84"¹ | 90"/90" |
| Brant Point™, N37 | 90"/90" | 90"/84"¹ | 90"/90" |
| Centre Park™, N83 | 90"/102" | 90"/84"¹ | 90"/96" |
| Front Street™, N21 | 90"/102" | 90"/84"¹ | 90"/96" |
| **Misty Harbor™, N23** | **— (不提供)** | **— (不提供)** | **— (不提供)** |
| Parksley™, N82 | 90"/102" | 90"/84"¹ | 90"/96" |
| Sankaty™, N35 | 90"/102" | 90"/84"¹ | 90"/96" |
| Sun Porch™, N31 | 90"/102" | 90"/84"¹ | 90"/96" |
| HD Origins Amara™, N84 | 90"/102" | 90"/84"¹ | 90"/96" |
| **HD Origins Amara™ Light-Dimming, N85** | **— (不提供)** | **— (不提供)** | **— (不提供)** |

¹ LiteRise 84" 上限适用于宽度大于 24" 的窗帘;18"–22" 宽上限 60";22⅛"–24" 宽上限 72"。

**确认排除面料**:**Misty Harbor™ 与 HD Origins Amara™ Light-Dimming 完全不支持 A Deux**(源文件显示"—")。

**关键规则**:
- "Front Nantucket™ shading with back room-darkening roller shading: Provides increased privacy and light control. Shading and roller shade operate independently. Back panel roller shade is always white."
- "PowerView® Gen 3 shadings up to 42" wide will have one battery wand/rechargeable battery wand. Shadings over 42" wide will have two."
- "One 18V DC Power Supply will operate both panels of PowerView® Gen 3 shadings."
- "Palette fabric-covered headrail is automatically included with A Deux™ (available in solid matching fabric only)."
- "The PowerView® Gen 3 motor and control button are always located on the right side of the headrail."
- "EasyRise front panel control available on the left or right side."

**排除项**:Back cover;End Mount (EB);Hardware color substitution;HD Origins Amara™ Light Dimming 与 Misty Harbor™ 面料;左侧 PowerView Gen 3 马达/控制按钮;Magnetic hold-down brackets;Spacer blocks(除 OB PowerView Gen 3 配电池摇杆外);Two-On-One Headrail。

**安装深度(A Deux Headrail,专属,与 Silhouette A Deux 完全一致)**:
- IB 基础最小深度 **1"**;配 PowerView Gen 3 headrail-mounted battery wand **1⅝"**;配 rechargeable battery wand **1⅞"**
- Fully Recessed:基础 **4"**;配 battery wand **4¾"**;配 rechargeable battery wand **5"**
- OB 最小平面 **1"**,重叠 **3"**

**成品公差**:IB Fabric width:EasyRise **–1⅜"**、LiteRise **–15⁄16"**、PowerView Gen 3 **–1"**;OB Fabric width:EasyRise **–1¹⁄₁₆"**、LiteRise **–⁹⁄₁₆"**、PowerView Gen 3 **–¾"**。IB Edge Gap:EasyRise **1¹⁄₁₆"**,LiteRise **⁷⁄₁₆"**,PowerView Gen 3 **½"**。

**Cord Loop Drop(A Deux EasyRise,NT-48)**:16"–26⅞"→1';27"–39⅞"→2';40"–59⅞"→3';60"–83⅞"→4';84"–102"→5'(注意:A Deux 版上限止于 5'/102",Silhouette 标准 EasyRise 表还有 6' 档,A Deux 未列出 6' 档——与其 Max Height 90"/102" 上限吻合)。附加提示:"There will be approximately a 3" difference in drop between cord loops on EasyRise shadings due to the placement of the roller tubes within the headrail. The room-darkening panel tube is located above the Nantucket roller tube."

### 2.10 Tilt-Only Standard(NT-53)

Min Width **6"**,Min Height **16"**;Max Width **30"**(全部面料统一)。

| 面料 | Max Height |
|---|---|
| Boardwalk™, N25 | 90" |
| Brant Point™, N37 | 90" |
| Centre Park™, N83 | 126" |
| Front Street™, N21 | 120" |
| Misty Harbor™, N23 | 112" |
| Parksley™, N82 | 120" |
| Sankaty™, N35 | 126" |
| Sun Porch™, N31 | 126" |
| HD Origins Amara™, N84 | 120" |
| HD Origins Amara™ Light-Dimming, N85 | 112" |

### 2.11 Headrail 规格与安装深度总表(Nantucket,NT-54/55)

| Headrail 类型 | 使用场景 | IB 最小深度 | IB Fully Recessed | OB 最小平面/高度 | OB 投射 Projection |
|---|---|---|---|---|---|
| **Classic Headrail** | 除 A Deux 外的全部 Nantucket 操作系统(EasyRise/LiteRise/UltraGlide 基础值) | **1"** | **3⁵⁄₁₆"** | **1"** | **4"**(基础 Silhouette Classic Headrail 投射值,详见1.15) |
| Classic Headrail + PowerView Gen 3/SoftTouch,Headrail Mount Battery Wand | 电动款标准配置 | **2"** | **4¹⁄₁₆"** | **1"** | 资料未提及具体投射值 |
| Classic Headrail + PowerView Gen 3/SoftTouch,Rechargeable Battery Wand | 电动款可选配置 | **2¼"** | **4⁵⁄₁₆"** | 同上 | 同上 |
| Classic Headrail + Other Power Options | 电动款硬接线等 | **1¼"** | **3½"** | 同上 | 同上 |
| **A Deux Headrail** | 仅 A Deux 设计选项 | **1"**(基础)/ **1⅝"**(PV battery wand)/ **1⅞"**(PV rechargeable) | **4"**(基础)/ **4¾"**(battery wand)/ **5"**(rechargeable) | **1"** | **4"**(NT-54/55 图示投射值);另有图示局部数字 **3⁷⁄₈"**、**5³⁄₈"** ⚠️待核对(NT-12/NT-54 图示中出现但未与文字标签一一对应,可能为示意图的其他标注尺寸段) |

通用规则(NT-54):"Palette® Fabric-Covered Headrail is standard on all Silhouette® shadings... Headrails on shadings ordered specifically without the Palette Fabric-Covered Headrail are only available in 661 White Tiara."

> ⚠️ 待核对:NT-12 与 NT-54/55 页面图示中出现的 **"3¼""** 与 **"3¹⁄₁₆""** 两个数字,在源文件纯文本抽取中无法与具体文字说明段落对应(疑似图示上的其他标注线,例如可能是 headrail 宽度或另一角度深度),不确定其准确含义,已如实标注为待核对,不做主观归类。

### 2.12 排除项汇总(Nantucket,按操作系统/设计选项)

- **Magnetic Hold-Down Bracket**:不适用于 A Deux™
- **EasyRise**:Two-On-One Headrail 不可做端装(EB)
- **LiteRise**:Two-On-One Headrail 不可做端装(EB)
- **PowerView Gen 3**:排除 back cover 配 rechargeable battery wand;左侧马达/控制按钮;Two-On-One Headrail(整体不提供)
- **SoftTouch**:排除 A Deux;back cover 配 rechargeable battery wand;Two-On-One Headrail(整体不提供)
- **UltraGlide**:排除 A Deux;Two-On-One Headrail 不可做端装(EB)
- **Specialty Shapes**:排除 outside mounts (OB);side-by-side vane alignment
- **A Deux**:排除 back cover;End Mount;hardware color substitution;Amara Light Dimming 与 Misty Harbor 面料;左侧 PowerView 马达/控制按钮;magnetic hold-down brackets;spacer blocks(除 OB PowerView 配电池摇杆外);Two-On-One Headrail
- **End Mount(通用)**:不可用于 Two-On-One Headrail 窗帘
- **Palette Fabric-Covered Headrail**:不适用于 Specialty Shapes
- **A Deux Headrail**:不支持 hardware color substitution
- **16 Shade DC Power Supply**:使用该电源时不可 daisy-chain

### 2.13 Child Safety(儿童安全)

原文(NT-15、NT-47 等多处重复出现):
> "In accordance with the revised American National Standard for Safety of Corded Window Covering Products, EasyRise™ shadings require proper mounting of the cord tensioner for the product to function properly. The cord tensioner should not be modified in any way."

Nantucket 源文件中**没有出现 "WCMA"、"cordless certification"、"child safety certification"** 等术语;LiteRise®、PowerView® Gen 3、SoftTouch®、UltraGlide® 均为无绳(cordless)操作系统,但源文件本身未使用"cordless"一词描述它们——资料未提及。

### 2.14 硬件颜色规则(Nantucket 通用)

- 非面料罩 Headrail(即未选配 Palette Fabric-Covered Headrail 时)默认且**仅提供 661 White Tiara** 一种颜色。
- Palette® Fabric-Covered Headrail 需额外 surcharge,**唯一例外是 A Deux™ 自动标配且不收 surcharge**。
- Universal Cord Tensioner 颜色可选:**048 Black、320 Rich Cream、661 White Tiara、689 Ash**(绳子颜色随 Tensioner 配色)。
- A Deux Headrail **不支持 hardware color substitution**。
- Nantucket Palette 面料罩 Headrail 实际使用 **Silhouette® Originale™** 面料制作以配色协调(而非 Nantucket 自身面料)。

---

## 3. 通用规则速查(两产品线共有)

### 3.1 Abutted Shadings(并排安装)面料间隙表

| 操作系统 | 非控制侧对非控制侧 | 非控制侧对控制侧 | 控制侧对控制侧 |
|---|---|---|---|
| EasyRise™ | ⅞" | 1⅛" | 1⅜" |
| LiteRise® | ⅞"(所有组合) | ⅞" | ⅞" |
| PowerView® Gen 3 Automation | 1"(所有组合) | 1" | 1" |
| SoftTouch® Motorization(仅 Silhouette 含此行;Nantucket 也列出相同值) | 1"(所有组合) | 1" | 1" |
| UltraGlide® | ⅞" | 1⅛" | 1⅜" |
| A Deux™ + EasyRise | 1⅛"(所有组合) | — | — |
| A Deux™ + LiteRise | ⅞"(所有组合) | — | — |
| A Deux™ + PowerView Gen 3 | 1"(所有组合) | — | — |
| Duolite® + PowerView Gen 3(仅 Silhouette) | ⅞"(非控制侧对控制侧) | — | — |
| Duolite® + UltraGlide(仅 Silhouette) | 非控制侧对非控制侧 1"; 非控制侧对控制侧 1⅜"; 控制侧对控制侧 1¾" | — | — |

Notes:"Outside mount (OB) shadings are not recommended for bay windows or abut-and-pass applications."

### 3.2 Spacer Blocks(垫块)

"Spacer blocks are available in sizes ¼" to 1½". The maximum amount of spacer blocks allowed per bracket is 1½"."(Nantucket NT-17 原文,Silhouette 章节未见逐字复述此具体尺寸范围表述,但两者均提供 spacer block 选项——⚠️ Silhouette 侧具体 ¼"–1½" 数值仅在 Nantucket 页确认到,Silhouette 页仅提及"Spacer Blocks: Select Yes or No",未复述尺寸范围,标注为资料在 Silhouette 章节未明确提及具体尺寸区间。)

### 3.3 Back Cover / Dust Cover

- **Back Cover**(仅 IB、EB 可选):遮盖 Headrail 后开口,"The back cover and its brackets add ¼" to minimum inside mounting depths."
- **Top Dust Cover**(仅 OB 可选):遮盖 Headrail 顶部开口,防尘防污,保护面料与内部机构。

### 3.4 End Mount (EB) 通用限制

"End Mount (EB) Only available with Bottom-up shades up to 48". Not available with Two-On-One headrail shadings."(两产品线通用)

### 3.5 通用尺寸公差原则

"All allowances are taken from ordered dimensions and width may vary +0/–⅛"." "Maximum shading height tolerance is –¼"."(两产品线所有操作系统通用)

---

## 4. 存疑点清单(Open Issues,供后续核对)

1. **Silhouette EasyRise Core Line 表格中标注 ⚠️ 的若干单元格**(Bon Jour 3" Grandiose 行、Bon Soir Quartette 4" Grandiose 行、ClearView Nouveau/Originale Grandiose 行、Solar Screen Grandiose 行、Stria/Terra Quartette 4" 标准行、Toujours 三种叶片整行):源文件为纯文本导出的表格,数字与行标签在跨页/跨列时发生错位风险,已用两轮独立提取交叉验证,但仍不能 100% 排除误差,建议对照官方 PDF 版复核后再用于报价。
2. **Silhouette LiteRise 与 UltraGlide 的 Core Line "瀑布式"中间宽度区间单元格**(42"–108" 区间,个别面料在窄宽段出现 74"/76"/78" 等低于 84" 的中间值):已确认存在此类分段现象(与官方对 LiteRise/UltraGlide "宽度越窄、高度上限越低"的整体规则一致),但具体对应到哪个面料在哪个宽度段的数字,存在残余不确定性,已标注⚠️待核对。
3. **Silhouette PowerView Gen 3 Outside Mount (OB) minimum mounting surface height** 数值:源文件 SI-25 排版中该数字位置和"2""字符出现歧义,而 Nantucket 对应页(NT-24)明确写"1""。已采用"以 Nantucket 类比 + 标注⚠️"的方式处理,未擅自断定,建议核对 Silhouette 官方 PDF 原图。
4. **Silhouette PowerView Gen 3 End Mount Headrail unit width 公差**:源文件片段显示 "–1⁷⁄₁₆"" 与另一处 "–1¹¹⁄₁₆"" 疑似冲突读数,已采用与 Nantucket 对应页(确认为 –1⁷⁄₁₆")一致的数值,已在正文标注。
5. **Nantucket NT-12/NT-54/NT-55 页面 headrail 示意图中的 "3¼"" 与 "3¹⁄₁₆"" 两个数字**:无法与任何文字标签建立可靠对应关系,不确定是否为独立于已列出深度数字之外的另一测量维度,已如实标注为待核对,未擅自归类。
6. **Silhouette Halo 系列 Duolite 的 Headrail 深度细分数值**(标准 wand/satellite wand/rechargeable wand 三种情形的 Fully Recessed 具体数字:4⁹⁄₁₆"/4"/4¹³⁄₁₆")来自子代理提取,未在本次人工复核抽样中直接验证源页码,建议在实际使用前核对 SI-90 原文。
7. **Silhouette Core Line EasyRise 表中 "Bon Jour 3" Grandiose = 120"×110"" 一类数值**是否真实存在 Grandiose 选项(Grandiose 官方仅明确适用于 EasyRise,且脚注写"Grandiose™ shading, see Design Option Surcharges",但并未明确排除掉 Bon Jour——需与官方最新 Size Standards 图表核实 Bon Jour 是否确实提供 Grandiose)。
8. Nantucket 面料的完整"硬件颜色-面料色号"映射表(约90组)与"Palette 面料罩色号"映射表未在本文逐条复制(因数据量过大且为简单一对一映射,无额外业务规则),如需完整清单请直接查阅源文件 NT-7~NT-10。

---

## 附录

**价格表见本文件末尾附录。**

（源文件明确说明:"This document provides detailed product specifications only. Pricing information is now published separately in the Hunter Douglas Price Guide." 即两份源规格文件均不含具体价格/surcharge 金额,所有标记"surcharge"的选项——如 Hardware Color Substitution、Palette® Fabric-Covered Headrail、Grandiose™ Shading、Design Option Surcharges、PowerView®/SoftTouch® Accessories 等——具体金额请查阅《Hunter Douglas US Price Guide》。本知识库仅覆盖产品规格,不含价格数据。）


---

# 附录:官方价格表(程序化提取,数字以此为准)

> 来源:Hunter Douglas US Price Guide (JAN 2026)。表格为 USD 标价(list price),实际零售价以经销商折扣为准。


<!-- pricing: silhouette -->
# silhouette — 官方价格数据
来源: HD_PG_US_JAN2026_01212026.pdf 页码: 115-118
Silhouette pricing extracted from HD_PG_US_JAN2026 pages 115-118.

### 价格表 SIL-1
- 适用面料: Bon Jour® 2", Bon Jour 3", Bon Jour Quartette® 4", Solar Screen™, Solar Screen Quartette® 4"  (代码: A16, A17, A30, A86, A87)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 582 | 644 | 717 | 854 | 991 | 1203 | 1339 | 1472 | 1652 | 1817 |
| **48** | 642 | 723 | 804 | 962 | 1132 | 1363 | 1653 | 1679 | 1896 | 2068 |
| **60** | 691 | 797 | 887 | 1070 | 1270 | 1511 | 1859 | 1905 | 2181 | 2397 |
| **72** | 758 | 866 | 969 | 1192 | 1426 | 1701 | 2080 | 2139 | 2434 | 2732 |
| **84** | 810 | 936 | 1047 | 1304 | 1569 | 1869 | 2331 | 2392 | 2699 | 3030 |
| **96** | 869 | 1004 | 1136 | 1426 | 1717 | 2048 | 2515 | 2630 | 2965 | 3342 |
| **108** | 949 | 1123 | 1262 | 1586 | 1908 | 2276 | 2795 | 2923 | 3295 | 3714 |
| **120** | 1074 | 1232 | 1404 | 1764 | 2123 | 2532 | 3108 | 3251 | 3664 | 4131 |
| **132** | 1224 | 1402 | 1598 | 2005 | 2414 | 2880 | 3541 | 3697 | 4165 | 4701 |
| **136** | 1225 | 1403 | 1600 | 2008 | 2417 | 2884 | 3546 | 3703 | 4175 | 4706 |

### 价格表 SIL-2
- 适用面料: Originale™ 2", Originale 3", Originale Quartette® 4", ClearView® Originale 3", ClearView Originale Quartette® 4", Angelica™ 3", Angelica Quartette® 4"  (代码: A1, A2, A24, A68, A69, A84, A85)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 643 | 713 | 800 | 948 | 1096 | 1336 | 1489 | 1636 | 1834 | 2019 |
| **48** | 711 | 803 | 893 | 1069 | 1258 | 1513 | 1834 | 1864 | 2106 | 2299 |
| **60** | 767 | 885 | 986 | 1189 | 1411 | 1677 | 2065 | 2115 | 2421 | 2660 |
| **72** | 839 | 960 | 1080 | 1321 | 1583 | 1888 | 2308 | 2376 | 2703 | 3032 |
| **84** | 899 | 1033 | 1163 | 1447 | 1743 | 2074 | 2587 | 2656 | 2997 | 3368 |
| **96** | 962 | 1116 | 1262 | 1583 | 1908 | 2275 | 2795 | 2920 | 3295 | 3715 |
| **108** | 1071 | 1244 | 1406 | 1762 | 2125 | 2532 | 3111 | 3251 | 3669 | 4134 |
| **120** | 1193 | 1385 | 1566 | 1963 | 2364 | 2818 | 3463 | 3617 | 4082 | 4602 |
| **132** | 1359 | 1577 | 1782 | 2232 | 2691 | 3205 | 3944 | 4113 | 4638 | 5236 |
| **136** | 1360 | 1579 | 1783 | 2235 | 2695 | 3210 | 3948 | 4120 | 4648 | 5242 |

### 价格表 SIL-3
- 适用面料: Halo Clearview Elan 4"  (代码: A80)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 |
|---|---|---|---|---|---|---|---|---|---|
| **36** | 685 | 759 | 851 | 1008 | 1167 | 1419 | 1584 | 1739 | 1948 |
| **48** | 757 | 854 | 949 | 1135 | 1337 | 1607 | 1949 | 1982 | 2239 |
| **60** | 815 | 941 | 1048 | 1262 | 1500 | 1783 | 2196 | 2248 | 2575 |
| **72** | 893 | 1020 | 1147 | 1405 | 1681 | 2006 | 2453 | 2525 | 2874 |
| **84** | 956 | 1099 | 1234 | 1538 | 1851 | 2205 | 2749 | 2821 | 3186 |
| **96** | 1023 | 1187 | 1341 | 1681 | 2026 | 2417 | 2970 | 3102 | 3503 |
| **108** | 1138 | 1320 | 1495 | 1873 | 2257 | 2690 | 3304 | 3455 | 3900 |
| **120** | 1268 | 1472 | 1664 | 2086 | 2513 | 2994 | 3680 | 3845 | 4341 |

### 价格表 SIL-4
- 适用面料: ClearView® Mystere 3", ClearView Mystere Quartette® 4", ClearView Nouveau 3", ClearView Nouveau Quartette 4", Mystere™ 3", Mystere Quartette® 4", Nouveau™ 3", Nouveau™ Quartette® 4", Terra™ 3", Terra Quartette® 4", Toujours™ 2", Toujours™ 3", Toujours™ Quartette® 4"  (代码: A90, A91, A96, A97, A42, A43, A36, A37, A46, A47, A4, A7, A29)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 724 | 808 | 900 | 1069 | 1240 | 1506 | 1684 | 1849 | 2073 | 2311 |
| **48** | 794 | 900 | 1002 | 1206 | 1417 | 1704 | 2075 | 2100 | 2382 | 2626 |
| **60** | 868 | 990 | 1111 | 1337 | 1597 | 1897 | 2333 | 2396 | 2738 | 3047 |
| **72** | 946 | 1082 | 1217 | 1493 | 1789 | 2130 | 2616 | 2678 | 3057 | 3470 |
| **84** | 1013 | 1169 | 1309 | 1633 | 1968 | 2347 | 2919 | 3006 | 3383 | 3849 |
| **96** | 1088 | 1254 | 1419 | 1789 | 2148 | 2565 | 3163 | 3304 | 3722 | 4248 |
| **108** | 1212 | 1396 | 1579 | 1991 | 2392 | 2854 | 3526 | 3678 | 4144 | 4729 |
| **120** | 1351 | 1556 | 1758 | 2216 | 2661 | 3177 | 3923 | 4095 | 4614 | 5265 |
| **132** | 1538 | 1772 | 2002 | 2522 | 3028 | 3612 | 4466 | 4655 | 5244 | 5988 |
| **136** | 1539 | 1773 | 2003 | 2526 | 3032 | 3617 | 4471 | 4663 | 5254 | 5995 |

### 价格表 SIL-5
- 适用面料: Bon Soir™ 2", Bon Soir™ 3", Bon Soir Quartette® 4", Ella™ 3", Ella Quartette® 4", Stria™ 3", Stria Quartette® 4"  (代码: A3, A6, A23, A88, A89, A82, A83)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 774 | 863 | 964 | 1145 | 1326 | 1621 | 1812 | 1990 | 2231 | 2487 |
| **48** | 851 | 965 | 1075 | 1296 | 1520 | 1834 | 2233 | 2265 | 2566 | 2827 |
| **60** | 927 | 1063 | 1190 | 1438 | 1717 | 2042 | 2507 | 2576 | 2946 | 3281 |
| **72** | 1015 | 1159 | 1310 | 1605 | 1927 | 2298 | 2812 | 2886 | 3294 | 3736 |
| **84** | 1108 | 1261 | 1433 | 1764 | 2116 | 2535 | 3161 | 3242 | 3656 | 4163 |
| **96** | 1233 | 1405 | 1597 | 1964 | 2357 | 2821 | 3521 | 3609 | 4072 | 4633 |
| **108** | 1375 | 1565 | 1780 | 2186 | 2625 | 3142 | 3920 | 4021 | 4535 | 5157 |
| **120** | 1529 | 1742 | 1982 | 2433 | 2923 | 3497 | 4362 | 4475 | 5047 | 5742 |
| **126** | 1613 | 1838 | 2091 | 2569 | 3081 | 3690 | 4601 | 4720 | 5326 | 6057 |

### 价格表 SIL-6
- 适用面料: Alustra Aria™ 3", Alustra Aria™ Quartette® 4", Alustra Brio™ 3", Alustra Brio Quartette® 4", Alustra Mila™ 3", Alustra Mila™ Quartette® 4"  (代码: A94, A95, A60, A70, A92, A93)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 115 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 832 | 929 | 1035 | 1230 | 1426 | 1733 | 1937 | 2128 | 2385 | 2515 |
| **48** | 913 | 1035 | 1154 | 1387 | 1630 | 1960 | 2388 | 2416 | 2739 | 2860 |
| **60** | 997 | 1138 | 1278 | 1538 | 1838 | 2182 | 2683 | 2756 | 3148 | 3304 |
| **72** | 1088 | 1244 | 1401 | 1718 | 2057 | 2449 | 3009 | 3080 | 3516 | 3749 |
| **84** | 1167 | 1344 | 1505 | 1879 | 2264 | 2699 | 3357 | 3457 | 3889 | 4150 |
| **96** | 1251 | 1443 | 1632 | 2057 | 2470 | 2950 | 3639 | 3799 | 4281 | 4571 |
| **108** | 1394 | 1606 | 1815 | 2291 | 2753 | 3282 | 4053 | 4229 | 4766 | 5087 |
| **120** | 1554 | 1790 | 2022 | 2550 | 3060 | 3653 | 4511 | 4709 | 5307 | 5662 |
| **126** | 1638 | 1887 | 2136 | 2689 | 3232 | 3855 | 4758 | 4968 | 5600 | 5975 |

### 价格表 SIL-7
- 适用面料: Alustra Brio Bon Soir™ 3", Alustra Brio Bon Soir Quartette 4"  (代码: A61, A71)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 110 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 916 | 1023 | 1139 | 1354 | 1570 | 1906 | 2131 | 2341 | 2624 | 2627 |
| **48** | 1003 | 1139 | 1270 | 1526 | 1793 | 2156 | 2627 | 2658 | 3010 | 3013 |
| **60** | 1097 | 1252 | 1406 | 1692 | 2022 | 2400 | 2952 | 3031 | 3462 | 3465 |
| **72** | 1196 | 1370 | 1542 | 1890 | 2264 | 2695 | 3311 | 3389 | 3865 | 3869 |
| **84** | 1283 | 1479 | 1656 | 2067 | 2491 | 2969 | 3694 | 3804 | 4278 | 4281 |
| **96** | 1378 | 1588 | 1796 | 2264 | 2718 | 3244 | 4003 | 4179 | 4707 | 4711 |
| **108** | 1534 | 1769 | 1997 | 2521 | 3028 | 3610 | 4459 | 4653 | 5241 | 5245 |
| **112** | 1620 | 1966 | 2108 | 2658 | 3192 | 3809 | 4459 | 4909 | 5535 | 5641 |
| **120** | 1710 | 1969 |

### fabric_to_chart (面料→价格表 映射)
- A16 → SIL-1
- A17 → SIL-1
- A30 → SIL-1
- A86 → SIL-1
- A87 → SIL-1
- A1 → SIL-2
- A2 → SIL-2
- A24 → SIL-2
- A68 → SIL-2
- A69 → SIL-2
- A84 → SIL-2
- A85 → SIL-2
- A90 → SIL-4
- A91 → SIL-4
- A96 → SIL-4
- A97 → SIL-4
- A42 → SIL-4
- A43 → SIL-4
- A36 → SIL-4
- A37 → SIL-4
- A46 → SIL-4
- A47 → SIL-4
- A4 → SIL-4
- A7 → SIL-4
- A29 → SIL-4
- A3 → SIL-5
- A6 → SIL-5
- A23 → SIL-5
- A88 → SIL-5
- A89 → SIL-5
- A82 → SIL-5
- A83 → SIL-5
- A94 → SIL-6
- A95 → SIL-6
- A60 → SIL-6
- A70 → SIL-6
- A92 → SIL-6
- A93 → SIL-6
- A61 → SIL-7
- A71 → SIL-7
- A80 → SIL-3

### operating_system_surcharges
- **EasyRise**: {"type": "flat", "amount": 0}
- **LiteRise**: {"type": "flat_per_shading", "amount": 80}
- **UltraGlide**: {"type": "flat_per_shading", "amount": 80}
- **SoftTouch**: {"type": "flat_per_shading", "amount": 200}
- **SoftTouch_RBW**: {"type": "flat_per_shading", "amount": 270}
- **SpecialtyShapes_NonOperable**: {"type": "flat_per_shading", "amount": 205}
- **PowerView_Gen3**: {"type": "tiered_grid", "tiers": {"small": {"amount": 440, "rule": "width <= 48 AND height <= 60"}, "medium": {"amount": 515, "rule": "default middle range"}, "large": {"amount": 595, "rule": "width >= 120 OR height >= 96"}}}
- **PowerView_Gen3_RBW**: {"type": "tiered_grid", "tiers": {"small": {"amount": 510}, "medium": {"amount": 600}, "large": {"amount": 690}}}
- **PowerView_Plus_Gen3**: {"type": "tiered_grid", "tiers": {"small": {"amount": 505}, "medium": {"amount": 595}, "large": {"amount": 680}}}

### design_option_surcharges
- **a_deux**: {"type": "flat_per_shading_plus_double_os", "amount": 320, "note": "Add operating system surcharge TWICE; available with EasyRise/LiteRise/PV"}
- **duolite**: {"type": "flat_per_shading", "amount": 320, "note": "Available with PowerView Gen 3 or UltraGlide only"}
- **grandiose_shadings**: {"type": "flat_per_shading", "amount": 255}
- **hardware_color_substitution**: {"type": "flat_per_shading", "amount": 65}
- **two_on_one_headrail**: {"type": "formula", "spec": "Price as two individual shadings + add together; add OS surcharge TWICE; add hardware color substitution ONCE"}


<!-- pricing: nantucket -->
# nantucket — 官方价格数据
来源: HD_PG_US_JAN2026_01212026.pdf 页码: 106-108

### 价格表 NAN-1
- 适用面料: HD Origins™ Collection1 – Amara™ Translucent (N84)  (代码: N84)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 469 | 523 | 582 | 691 | 808 | 1008 | 1128 | 1239 | 1388 | 1479 |
| **48** | 519 | 585 | 648 | 784 | 927 | 1144 | 1281 | 1418 | 1582 | 1688 |
| **60** | 564 | 644 | 721 | 877 | 1045 | 1274 | 1440 | 1615 | 1828 | 1942 |
| **72** | 612 | 703 | 790 | 976 | 1175 | 1418 | 1618 | 1813 | 2068 | 2199 |
| **84** | 653 | 758 | 854 | 1072 | 1297 | 1563 | 1784 | 2005 | 2296 | 2441 |
| **96** | 711 | 816 | 929 | 1175 | 1422 | 1708 | 1959 | 2204 | 2523 | 2686 |
| **108** | 793 | 919 | 1044 | 1300 | 1580 | 1863 | 2110 | 2353 | 2658 | 3002 |
| **120** | 904 | 1040 | 1187 | 1478 | 1792 | 2115 | 2396 | 2672 | 3017 | 3209 |

### 价格表 NAN-2
- 适用面料: HD Origins™ Collection1 – Amara™ Light Dimming (N85)  (代码: N85)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 527 | 590 | 658 | 782 | 914 | 1136 | 1273 | 1397 | 1569 | 1668 |
| **48** | 586 | 660 | 732 | 882 | 1045 | 1289 | 1442 | 1597 | 1785 | 1899 |
| **60** | 634 | 725 | 811 | 991 | 1177 | 1434 | 1624 | 1820 | 2057 | 2193 |
| **72** | 691 | 791 | 889 | 1100 | 1327 | 1597 | 1822 | 2048 | 2334 | 2481 |
| **84** | 739 | 855 | 962 | 1208 | 1464 | 1758 | 2014 | 2260 | 2590 | 2749 |
| **96** | 799 | 922 | 1049 | 1327 | 1601 | 1927 | 2207 | 2486 | 2844 | 3026 |
| **108** | 943 | 1089 | 1240 | 1546 | 1880 | 2213 | 2510 | 2802 | 3161 | 3568 |
| **112** | 944 | 1092 | 1241 | 1549 | 1887 | 2217 | 2514 | 2808 | 3165 | 3574 |

### 价格表 NAN-3
- 适用面料: Front Street™ (N21), Parksley™ (N82)  (代码: N21, N82)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 550 | 616 | 684 | 811 | 948 | 1183 | 1327 | 1457 | 1634 | 1739 |
| **48** | 608 | 686 | 762 | 920 | 1087 | 1342 | 1503 | 1666 | 1864 | 1984 |
| **60** | 665 | 757 | 849 | 1028 | 1228 | 1495 | 1697 | 1898 | 2147 | 2286 |
| **72** | 721 | 828 | 930 | 1150 | 1382 | 1666 | 1900 | 2133 | 2434 | 2590 |
| **84** | 768 | 888 | 1003 | 1262 | 1524 | 1834 | 2099 | 2353 | 2700 | 2872 |
| **96** | 834 | 961 | 1093 | 1382 | 1669 | 2009 | 2304 | 2593 | 2965 | 3159 |
| **108** | 933 | 1080 | 1224 | 1526 | 1860 | 2188 | 2480 | 2769 | 3131 | 3442 |
| **120** | 1064 | 1221 | 1395 | 1737 | 2110 | 2481 | 2819 | 3143 | 3549 | 3776 |

### 价格表 NAN-4
- 适用面料: Boardwalk™ (N25), Sun Porch™ (N31), Sankaty™ (N35), Brant Point™ (N37), Centre Park™ (N83)  (代码: N25, N31, N35, N37, N83)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 608 | 680 | 758 | 903 | 1053 | 1313 | 1473 | 1620 | 1818 | 1928 |
| **48** | 675 | 761 | 849 | 1020 | 1208 | 1493 | 1670 | 1851 | 2068 | 2199 |
| **60** | 733 | 840 | 939 | 1142 | 1363 | 1662 | 1884 | 2107 | 2385 | 2541 |
| **72** | 799 | 918 | 1033 | 1276 | 1534 | 1851 | 2110 | 2367 | 2702 | 2876 |
| **84** | 852 | 989 | 1116 | 1400 | 1695 | 2034 | 2332 | 2617 | 2999 | 3188 |
| **96** | 923 | 1065 | 1212 | 1534 | 1853 | 2229 | 2558 | 2881 | 3291 | 3506 |
| **108** | 1073 | 1239 | 1412 | 1755 | 2139 | 2513 | 2852 | 3183 | 3594 | 3831 |
| **120** | 1179 | 1356 | 1552 | 1928 | 2342 | 2755 | 3132 | 3491 | 3943 | 4194 |
| **126** | 1265 | 1440 | 1654 | 2050 | 2495 | 2939 | 3341 | 3724 | 4204 | 4463 |

### 价格表 NAN-5
- 适用面料: Misty Harbor™ (N23)  (代码: N23)
- 查表方式: code
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 671 | 749 | 834 | 992 | 1157 | 1443 | 1620 | 1781 | 1997 | 2123 |
| **48** | 745 | 838 | 931 | 1122 | 1333 | 1643 | 1838 | 2032 | 2277 | 2422 |
| **60** | 805 | 922 | 1033 | 1257 | 1500 | 1830 | 2070 | 2317 | 2623 | 2792 |
| **72** | 879 | 1009 | 1139 | 1402 | 1689 | 2032 | 2319 | 2603 | 2973 | 3163 |
| **84** | 936 | 1086 | 1224 | 1541 | 1864 | 2238 | 2566 | 2880 | 3296 | 3507 |
| **96** | 1018 | 1169 | 1335 | 1689 | 2036 | 2451 | 2816 | 3166 | 3632 | 3858 |
| **108** | 1179 | 1363 | 1550 | 1932 | 2349 | 2764 | 3137 | 3502 | 3952 | 4210 |
| **112** | 1206 | 1397 | 1589 | 1987 | 2413 | 2841 | 3210 | 3583 | 4052 | 4312 |

### fabric_to_chart (面料→价格表 映射)
- N84 → NAN-1
- N85 → NAN-2
- N21 → NAN-3
- N82 → NAN-3
- N25 → NAN-4
- N31 → NAN-4
- N35 → NAN-4
- N37 → NAN-4
- N83 → NAN-4
- N23 → NAN-5

### fabric_names_to_chart (面料→价格表 映射)
- HD Origins™ Collection1 – Amara™ Translucent → NAN-1
- HD Origins™ Collection1 – Amara™ Light Dimming → NAN-2
- Front Street™ → NAN-3
- Parksley™ → NAN-3
- Boardwalk™ → NAN-4
- Sun Porch™ → NAN-4
- Sankaty™ → NAN-4
- Brant Point™ → NAN-4
- Centre Park™ → NAN-4
- Misty Harbor™ → NAN-5

### operating_system_surcharges
- **EasyRise**: {"type": "flat", "amount": 0}
- **LiteRise**: {"type": "flat_per_shading", "amount": 80}
- **SoftTouch® (any width)**: {"type": "flat_per_shading", "amount": 200}
- **SoftTouch w/Rechargeable Battery Wand 2**: {"type": "flat_per_shading", "amount": 270}
- **Specialty Shapes, Non-Operable 3**: {"type": "flat_per_shading", "amount": 205}
- **UltraGlide**: {"type": "flat_per_shading", "amount": 80}
- **PowerView® Gen 3**: {"type": "tiered_grid", "tiers": {"small": {"amount": 200}, "medium": {"amount": 270}, "large": {"amount": 205}}}
- **PowerView® Gen 3 w/Rechargeable Battery Wand 2**: {"type": "tiered_grid", "tiers": {"small": {"amount": 200}, "medium": {"amount": 270}, "large": {"amount": 205}}}

### design_option_surcharges
- **A Deux**: {"type": "flat_per_shading", "amount": 320, "unit_label": "per shading"}

═══════════════════════════════════════════════
# 【分册】04_Pirouette_软纱帘
═══════════════════════════════════════════════

# Pirouette® Window Shadings（Pirouette® 软纱帘）产品知识库

> 来源文件：Hunter Douglas《PIROUETTE® WINDOW SHADINGS Product Specifications Guide》，版本日期 20 JAN 2026（美国 Hunter Douglas®）。
> 本知识库严格依据该规格文件整理，所有数字均为文件原文数值。若文件未提及，标注"资料未提及"；若存在歧义或需要人工核实，标注"⚠️待核对"。

---

## 文档说明 (Document Use)

该文档仅提供产品规格信息。价格信息现已单独发布于 Hunter Douglas Price Guide（该指南此前称为 Reference Guide，曾同时包含规格与价格）。

文档目录结构（原文 Table of Contents）包括：Reference Guide Revision & Discontinuation History、Introduction、Pirouette® Vane Alignment & Fabric Panel Options、Pirouette® Vane Operation、Pirouette® Ordering Notes，随后按操作系统分别列出 EasyRise™、PowerView® Gen 3 Automation、PowerView+™ Gen 3 Automation、SoftTouch® Motorization、UltraGlide®（各自含 Size Standards / Operating System Specifications / Ordering Notes / Product View），再是 Specialty Shapes, Non-Operable，最后是 A Deux™。

### 修订与停产历史 (Revision & Discontinuation History)

| 日期 | 修订说明 | 影响页面 |
|---|---|---|
| 1/20/2026 | 定价信息迁移至 Hunter Douglas US Price Guide | 多处 (Various) |

面料停产历史 (Fabric Discontinuation History) 与颜色停产历史 (Color Discontinuation History)：文件中对应表格无具体条目内容，资料未提及具体停产面料/颜色。

---

## 概述 (Introduction / Overview)

Pirouette® Window Shadings（软纱帘）由以下部分构成：
- **前部不透光/半透光面料 (front fabric)**：可为 light-filtering（柔光）或 room-darkening（遮光）。
- **后部纱幔面料 (sheer rear fabric)**：位于后方。

当窗帘完全放下时，前部面料可以开启形成叶片 (vane)，允许透过后部纱幔面料看到外部景观（view through）。

底部有一段**底部面料裁片 (Bottom Fabric Panel)**，用于调节窗帘高度，该裁片高度会随叶片尺寸 (vane size) 与订购高度而变化，属于产品正常固有特性，不视为缺陷。

窗帘升起时，收纳于**面料包覆的顶盒 (fabric-covered headrail)** 内。

### 叶片尺寸 (Vane Size)

文件中反复出现并明确写明的叶片尺寸为 **5" Vane（5 英寸叶片）**。全篇所有面料系列（Alustra Oakley、Alustra ClearView Apollo、Avant、ClearView Batiste Bamboo、ClearView Charmeuse、ClearView Satin、ClearView Satin Metallic、ClearView Wren、Grant、Linen、Satin、Satin Metallic、Shantung、Thea 等）均标注为"5""规格。

⚠️待核对：文件全篇未出现 3" 或 4.5" 等其他叶片尺寸的表述；经逐页核对（第 1–39 页），未发现除 5" 之外的其他叶片尺寸数据，故本知识库仅记录 5" 一种叶片尺寸。若存在其他尺寸，资料未提及。

### 五种操作系统 (Five Operating Systems)

原文（第 7 页）："There are five operating systems to choose from"：
- EasyRise™
- PowerView® Gen 3 Automation
- PowerView+™ Gen 3 Automation
- SoftTouch® Motorization
- UltraGlide®

（注：A Deux™ 属于设计选项 Design Option，而非独立操作系统，仅可与 PowerView® Gen 3 Automation 搭配使用；Specialty Shapes, Non-Operable 为非操作型/固定造型产品线。）

### Pirouette® 应用总表 (Pirouette® Applications)

下表来自第 5 页，展示各操作系统支持的设计选项：

| 操作系统 (Operating System) | Bottom-up (标准提升) | A Deux™ | Two-On-One Headrail (两联一顶盒) |
|---|---|---|---|
| EasyRise™ | ✓ | | ✓ |
| PowerView® Gen 3 Automation | ✓ | ✓ | |
| PowerView+™ Gen 3 Automation | ✓ | | |
| SoftTouch® Motorization | ✓ | | |
| UltraGlide® | ✓ | | ✓ |

补充说明（原文）：
- Specialty Shapes – Non-Operable（异形窗，非操作型）：始终呈闭合、贴合造型的位置 (closed, contoured position)；支持所有面料与颜色。
- Design Options（设计选项）：A Deux™（仅限 PowerView Gen 3）。

### Alustra® Pirouette® 的差异化设计 (THE ALUSTRA® PIROUETTE® DIFFERENCE)

第 5 页原文对 Alustra® Pirouette® 系列独家面料 ClearView® Apollo™ 与 Oakley 的说明：

- ClearView® Apollo™：共 **4 种颜色 (four colors)**。
- Oakley：共 **6 种颜色 (six colors)**。
- 两种面料均采用 **5" 叶片尺寸 (5" vane size)**。
- 两种面料均提供 **light-filtering（柔光）与 room-darkening（遮光）两种遮光度**。
- ClearView Apollo 的设计灵感来自现代设计运动，带有细微光泽感，配合 ClearView 纱幔面料提供增强的透视效果 (enhanced view-through)。
- Oakley 是一款剪裁考究的面料，可提升房间格调 (elevates any room)。

---

## Pirouette® 叶片对齐与底部面料裁片选项 (Vane Alignment & Fabric Panel Options)（第6页）

### Zero Bottom Fabric Panel Option（零底部面料裁片选项）

- 仅适用于**外装 (Outside Mount, OB)**。
- 仅适用于 **bottom-up（标准）** 窗帘。
- 取消窗帘底部的平整面料裁片 (flat fabric panel)。
- 变为可操作的底部叶片 (operable bottom vane)。
- 会使窗帘**加长最多 5"**；窗帘的最终长度取决于使最后一片叶片可操作所需的面料量。
- 按正常方式提交高度尺寸，工厂将相应调整高度。
- 下单时无法预测窗帘的确切下垂长度 (exact drop)。
- 零底部面料裁片选项**不收取附加费**。

### 叶片对齐 (Vane Alignment)

- 底部面料裁片会根据窗帘高度调整，以实现从上到下的叶片对齐 (top to bottom vane alignment)。
  - 同一高度安装的不同窗帘之间，叶片对齐应在 **1/4" 以内**。
  - Two-On-One Headrail（两联一顶盒）窗帘的裁片之间，叶片对齐应在 **1/8" 以内**。
- 根据窗帘高度和叶片尺寸不同，底部面料裁片尺寸变化**最多可达 5"**。
- 为确保窗帘制作出相同高度的底部面料裁片，必须同时订购：相同面料、相同高度尺寸、相同操作系统、相同安装方式。
- 对于内嵌安装 (Inside Mount, IB)：若两幅窗帘订购长度相差在 **1/4" 以内**，应使用两者中**较长**的高度尺寸统一下单。
- 相同面料款式、颜色、叶片尺寸、遮光度、高度和安装方式的窗帘，并排叶片对齐 (side-by-side vane alignment) 为标准配置。

中文说明：由于面料裁剪工艺的固有特性，底部裁片高度会有正常的尺寸差异（最多 5"），这不是产品缺陷，而是为保证叶片顶到底对齐所做的正常调整。

---

## Pirouette® 叶片运作 (Vane Operation)（第7页）

### 基本设计 (Basic Design)

Pirouette® 软纱帘由 light-filtering（柔光）或 room-darkening（遮光）的前部面料，和一层纱幔后部面料 (sheer rear fabric) 组成。窗帘完全放下时，前部面料可开启形成叶片，透过后部纱幔面料实现视觉穿透。

底部面料裁片会根据窗帘高度调整；该裁片高度随叶片尺寸和订购高度变化，属正常固有特性。

窗帘升起时收纳于面料包覆的顶盒 (fabric-covered headrail) 内。

### 组件示意图说明

原文列出的产品组件包括：Cord Tensioner（绳索张紧器）、Bottom Fabric Panel（底部面料裁片）、End Cap（端盖）、Headrail（顶盒）、Bottom Rail Weight（底轨配重）、Sheer Fabric (Rear)（纱幔面料/后层）、Bottom Rail（底轨）、Headrail Fabric (Front)（顶盒面料/前层）、EasyRise Cord Loop（EasyRise 绳环）、UltraGlide Wand（UltraGlide 操作杆）、Magnetic Hold-Down Brackets (Optional)（磁性固定卡扣，可选）、Extension Bracket (Optional)（延伸支架，可选）、Installation Bracket（安装支架）、Spacer Block (Optional)（垫块，可选）。示意图展示了 EasyRise 与 UltraGlide 两种操作系统的组件构造。

### 窗帘调节性 (Shading Adjustability)

窗帘卷绕应均匀，不应偏向一侧。若出现偏斜：
- 确保顶盒安装水平；必要时加垫片。
- 将底轨中的配重朝面料聚拢的一侧，每次调整 **1"**。

### 重要操作说明 (Important Operating Note)

若窗帘长时间处于完全放下且叶片打开的状态，叶片可能会"定型" (set)，不易闭合或恢复平整，这是面料产品的正常特性。若发生此情况，可拨动绳索使叶片尽量闭合，必要时轻轻下拉底部叶片，也可用手轻轻梳理叶片使其闭合，然后缓慢卷起窗帘使叶片恢复平整，让面料在顶盒内保持**最多 24 小时**。为防止叶片定型，应定期"锻炼"窗帘（升降并开合叶片）。

### 补充信息

- 关于 PowerView Gen 3 设计与操作的更多信息，参见 Reference Guide 的 PowerView 章节。
- 与所有纺织品一样，Pirouette 面料会有一定变化；轻微皱褶、起皱或轻微弯曲属于纺织产品固有特性，属正常可接受质量。
- 当 SoftTouch 窗帘完全内嵌收纳 (fully recessed) 时，操作杆 (wand) 会**凸出 3/8"**。
- 对于 SoftTouch 电机化窗帘和 PowerView Gen 3 自动化窗帘，需在安装深度上**增加 1/2"**，以容纳顶盒安装的可充电电池杆 (headrail-mounted rechargeable battery wand)。

### 安装尺寸 (Mounting Dimensions) —— 5" Vane

第 7 页图示给出以下尺寸标注（均标注于"5" Vane"示意图上）：

| 标注尺寸 | 数值 |
|---|---|
| 尺寸标注一 | 3 3/4" |
| 尺寸标注二 | 3 7/8" |
| 尺寸标注三 | 1 1/4" |

⚠️待核对：原文该图仅给出三个数字（3 3/4"、3 7/8"、1 1/4"），未标注各数字具体对应顶盒的哪个方向/部位（如宽度、深度或投影），示意图本身无法在文本中还原，故此处只能原样列出数值，无法确认具体对应关系。

---

## Pirouette® 订购须知 (Ordering Notes)（第8页）

### 底部面料裁片注意事项 (Bottom Fabric Panel Considerations)

- 根据窗帘高度，底部面料裁片高度会有变化，最多可达 **5" 叶片尺寸**（原文表述为"vary in size up to 5" vane size"）。这是正常且固有的产品特性，不视为缺陷。
- 为确保窗帘制作出相同高度的底部面料裁片，必须同时下单，使用相同的面料款式、颜色、操作系统、安装方式和遮光度，且高度尺寸完全相同。对于内嵌安装 (IB)，若订购长度相差在 **1/4" 以内**，应使用两者中较长的高度尺寸统一下单。

详细的 Zero Bottom Fabric Panel 选项信息见前文"Zero Bottom Fabric Panel Option"章节。

### Two-On-One Headrail 面板分割 (Two-On-One Headrail Panel Split)

- 两面板之间的间隙最多为 **5/8"**。
- 除非另有说明，Two-On-One Headrail 窗帘的两个面板宽度将相等。
- 如需不等宽面板，需在订单上注明。

**不等宽面板测量方法 (Measuring for Unequal Panel Widths)：**
1. 测量整体宽度 (overall width)。
   - 内嵌安装 (IB)：使用最窄处的宽度测量值。
   - 外装安装 (OB)：建议每侧留 **1/4" 重叠**。
2. 不移动卷尺，测量所需分割位置（通常为竖向窗框中梃）。
3. 在订单表上填写：高度、整体宽度、左面板宽度、右面板宽度。
4. 两个面板宽度之和必须等于整体宽度。

小贴士：为使外装 (OB) 窗帘的面料与窗框造型对齐，需考虑该操作系统"Product Specifications"页面上标注的面料宽度扣减量 (fabric width deduction)。

### 所有操作系统通用 (All Operating Systems)

通过 Direct Connect 成功下单，所有订单必须包含"All Operating Systems"部分信息及所需操作系统的订购须知部分信息。

### 订单终局条款 (All Orders Are Final)

所有 Hunter Douglas 窗饰产品均为定制加工，不可更改或取消。与所有纺织产品一样，不同染色批次的面料颜色可能略有差异，此类差异属于行业公认标准范围内。

### 附加费 (Surcharges)

标有星号 (*) 的项目均需额外附加费，详见 Price Guide 中的 Surcharges & Accessories 部分。

### 数量与设计选项 (Quantity and Design Options)

| 字段 | 说明 |
|---|---|
| Quantity（数量） | 每种相同配置的窗帘填写一行订单项 |
| Collection（系列） | 选择所需面料系列 |
| Design Option（设计选项） | 选择 Bottom-Up 或 A Deux（A Deux 仅限 PowerView Gen 3 Automation） |

### 面料与颜色选项 (Fabric and Color Options)

| 字段 | 说明 |
|---|---|
| Fabric Type（面料类型） | 面料编号 (Fabric #) 与面料名称 (Fabric Name) 均为必填 |
| Fabric Color（面料颜色） | 颜色编号 (Color #) 与颜色名称 (Color Name) 均为必填 |

### 尺寸与安装选项 (Size and Mounting Options)

| 字段 | 说明 |
|---|---|
| Ordered Size（订购尺寸） | 提供宽度和高度measurements |
| Mount Type（安装类型） | 选择：IB、OB 或 EB |
| Inside Mount (IB) 内嵌安装 | 内嵌安装应用会自动从订购宽度中扣减 |
| Outside Mount (OB) 外装安装 | 外装安装应用中，所提供的测量值即为宽度和高度 |
| End Mount (EB) 端装安装 | 仅适用于 Bottom-Up（标准）窗帘，最大宽度 **48"** |

### 五金选项 (Hardware Options)

| 字段 | 说明 |
|---|---|
| Extension Brackets（延伸支架） | 选择：是/否 |
| Spacer Block(s)（垫块） | 选择：是/否；若选是，需选垫块数量 |
| Back Cover（背板/背盖） | 选择：是/否；仅适用于 Bottom-up（标准）窗帘的内嵌安装 (IB) 和端装安装 (EB) |
| Dust Cover（防尘罩） | 选择：是/否；仅适用于外装安装 (OB) 窗帘 |
| Zero Bottom Fabric Panel（零底部面料裁片） | 选择：是/否；仅适用于外装安装 (OB) 窗帘；可能使窗帘加长最多 **5"**；仅适用于 Bottom-up（标准）窗帘 |
| Special Instructions（特殊说明） | Direct Connect 中的自由文本字段，用于添加订单相关额外备注 |

---

## EasyRise™（第9–12页）

EasyRise™ 是一种绳环 (Cord Loop) 提升系统。

### Size Standards（尺寸标准）

| 项目 | Standard（标准） | Two-On-One Headrail |
|---|---|---|
| Min. Width（最小宽度） | 12" | 12"/panel（每面板） |
| Min. Height（最小高度） | 15" | 15" |

**各面料系列 Max. Width / Max. Height（均为 5" 叶片）：**

| 面料系列 | Standard Max. Width | Two-On-One Max. Width | Standard Max. Height | Two-On-One Max. Height |
|---|---|---|---|---|
| Alustra Oakley 5" (PR82 & PR84) | 96" | 144" | 96" | 96" |
| Alustra ClearView® Apollo™ 5" (PR70 & PR72) | 96" | 144" | 96" | 96" |
| Avant 5" (PR86 & PR88) | 120" | 144" | 120" | 120" |
| ClearView Batiste Bamboo 5" (PR74 & PR76) | 96" | 144" | 96" | 96" |
| ClearView Charmeuse 5" (PR90 & PR92) | 96" | 144" | 96" | 96" |
| ClearView® Satin 5" (PR60 & PR62) | 120" | 144" | 144" | 144" |
| ClearView Satin Metallic™ 5" (PR64 & PR66) | 120" | 144" | 144" | 144" |
| ClearView Wren 5" (PR78 & PR80) | 96" | 144" | 96" | 96" |
| Grant™ 5" (PR50 & PR52) | 96" | 144" | 96" | 96" |
| Linen 5" (PR6 & PR8) | 120" | 144" | 120" | 120" |
| Satin 5" (PR10 & PR12) | 120" | 144" | 144" | 144" |
| Satin Metallic 5" (PR14 & PR16) | 120" | 144" | 144" | 144" |
| Shantung 5" (PR22 & PR24) | 96" | 144" | 96" | 96" |
| Thea 5" (PR94 & PR96) | 96" | 144" | 96" | 96" |

**备注 (Notes)：**
- Two-On-One Headrail：单面板最大宽度为 **72"**。
- 端装安装 (EB) 最大订购宽度为 **48"**。
- Two-On-One Headrail 不适用于端装安装 (EB)。
- 为获得最大遮光效果，建议外装安装 (OB) 的 room-darkening（遮光）窗帘每侧（包括长度方向）预留 **3" 宽度重叠**（如可能）。
- 零底部面料裁片选项详情见前述章节。

### Operating System Specifications（操作系统规格）

**应用范围 (Applications)：**
- EasyRise™：适用于最大 **120" x 144"** 的矩形窗户。
- EasyRise Two-On-One Headrail：适用于最大 **144" x 144"** 的矩形窗户（单面板最大宽度 **72"**）；两个面板通过两个独立的 EasyRise 绳环操作；面板宽度可等宽或不等宽。
- 窗帘从下往上升起 (raise from the bottom up)。
- 底部面料裁片会根据窗帘高度调整：
  - 相同面料款式、颜色、叶片尺寸、遮光度和高度的窗帘之间，叶片对齐应在 **1/4"** 以内。
  - Two-On-One Headrail 窗帘的面板之间，叶片对齐应在 **1/8"** 以内。

**排除项 (Exclusions)：**
- Two-On-One Headrail 作为端装安装 (EB)。

**重要提示：** 根据修订版《美国国家有绳窗饰产品安全标准》(American National Standard for Safety of Corded Window Covering Products)，EasyRise 窗帘需正确安装绳索张紧器 (cord tensioner) 才能正常运作。绳索张紧器不得以任何方式改装。

**补充信息：**
- 相同面料款式、颜色、叶片尺寸、遮光度、高度和安装方式的窗帘，并排叶片对齐为标准配置。
- 所有内嵌安装 (IB) 顶盒均标配挡光条 (Light block strip)。

**可选功能 (Optional Features) — 免费 (No Charge)：**
- Back cover（背板，仅限内嵌和端装安装）
- Extension brackets（延伸支架，端装安装必需）
- Headrail dust cover（顶盒防尘罩，仅限外装安装）
- Magnetic hold-down brackets（磁性固定卡扣）
- Optional cord drops（可选绳长）
- Spacer blocks（垫块）
- Two-On-One Headrail
- Zero Bottom Fabric Panel（仅限 OB）

**标配五金 (Hardware Included)：** Installation brackets（安装支架）

**安装要求 (Mounting Requirements)：**

| 安装方式 | 项目 | 数值 |
|---|---|---|
| Inside Mount (IB) 内嵌安装 | 最小安装深度 (Minimum mounting depth) | 1" |
| Inside Mount (IB) 内嵌安装 | 最小安装深度，完全内嵌 (fully recessed) | 3 3/4" |
| Outside Mount (OB) 外装安装 | 最小平整垂直表面 (Minimum flat vertical surface) | 1" |
| Outside Mount (OB) 外装安装 | 推荐每侧宽度重叠 (Recommended width overlap, per side) | 3" |
| End Mount (EB) 端装安装 | 最小安装表面深度 (Minimum mounting surface depth) | 1 1/2" |

**成品尺寸 (Finished Dimensions)：**

| 安装方式 | 项目 | 扣减/数值 |
|---|---|---|
| Inside Mount (IB) | Headrail unit width（顶盒宽度） | –1/4" |
| Inside Mount (IB) | Shading height（窗帘高度） | –1/8" up to +1/4" |
| Inside Mount (IB) | Fabric width（面料宽度） | –1 1/8" |
| Outside Mount (OB) | Headrail unit width | 订购宽度 (ordered width) |
| Outside Mount (OB) | Shading height, Standard | –1/8" up to +1/4" |
| Outside Mount (OB) | Zero Bottom Fabric Panel | 订购高度 + 最多 5" (ordered height + up to 5") |
| Outside Mount (OB) | Fabric width | –13/16" |
| End Mount (EB) | Headrail unit width | –5/8" |
| End Mount (EB) | Shading height | –1/8" up to +1/4" |
| End Mount (EB) | Fabric width | –1 1/2" |
| End Mount (EB) | Gap between fabric panels（面板间隙） | up to 5/8" |

备注：所有扣减均以订购尺寸为基准，宽度可能有 **+0/–1/8"** 的变化。

**绳环 (Cord Loop) — 标准绳长 (颜色配套) (Standard Cord Drops, Color Coordinated)：**

| 窗帘高度 (Shading height) | 绳长 |
|---|---|
| 15" 到 26 7/8" | 1' |
| 27" 到 39 7/8" | 2' |
| 40" 到 59 7/8" | 3' |
| 60" 到 83 7/8" | 4' |
| 84" 到 107 7/8" | 5' |

**标准绳长（仅白色）(Standard Cord Drops, White Only)：**

| 窗帘高度 | 绳长 |
|---|---|
| 108" 到 119 7/8" | 6' |
| 120" 到 131 7/8" | 7' |
| 132" 到 144" | 8' |

**可选绳长（仅白色）(Optional Cord Drops, White Only)：** 18" 至 12'，以 6" 递增；13' 至 16'，以 12" 递增。

备注：
- 超过 108" 的窗帘需核实所需绳长；所有可选绳环下垂长度必须在订单表上注明。
- 绳环长度可能有 **+/- 1/2"** 的变化。
- 绳环长度仅指绳环本身的测量长度，不包括离合器 (clutch) 或万能张紧器 (universal tensioner) 的尺寸。

**边缘间隙 (Edge Gaps)：**

| 安装方式 | 位置 | 数值 |
|---|---|---|
| Inside Mount (IB)（窗洞边缘到面料） | Control side（操控侧） | 11/16" |
| Inside Mount (IB) | Free side（自由侧） | 7/16" |
| Abutted Shadings（相邻窗帘） | Free side against free side | 3/4" |
| Abutted Shadings | Free side against control side | 1" |
| Abutted Shadings | Control side against control side | 1 1/4" |

### Ordering Notes（订购须知）

- 另见 Zero Bottom Fabric Panel Option。
- **Shadings on Headrail**：选择 1 或 2*。
- **Cord Position**（绳索位置）：选择左或右；标准 (Bottom-Up) 窗帘需指定左或右；Two-On-One headrail 时，绳索位置将位于左侧窗帘的左侧和右侧窗帘的右侧。
- **Magnetic Hold-Down Brackets**：选择是/否；仅适用于单面板窗帘。
- **Cord Length Override**（绳长覆盖）：选择是/否；若选是，需提供新绳长；绳环长度可能有 +/- 1/2" 变化。
- **Cord Tensioner Color**（绳索张紧器颜色）：可选颜色（绳索颜色将与张紧器颜色配套）：
  - 048 Black
  - 320 Rich Cream
  - 661 White Tiara
  - 689 Ash
  - 903 Desert Gold

### Product View（产品视图）

示意图展示了 EasyRise™ 的组件：Installation Brackets（安装支架）、Fabric-Covered Headrail（面料包覆顶盒）、Cord Tensioner and Bracket（绳索张紧器及支架）、Magnetic Hold-Down Brackets (Optional)（磁性固定卡扣，可选）、Optional Dust Cover (For Outside Mount)（可选防尘罩，用于外装安装）、Bottom Rail（底轨）、Optional Back Cover (For Inside and End Mount)（可选背板，用于内嵌和端装安装）。未展示 Two-On-One Headrail Shadings（两联一顶盒窗帘）。

---

## PowerView® Gen 3 Automation（第13–17页）

### Size Standards（尺寸标准）

| 项目 | Standard |
|---|---|
| Min. Width（最小宽度） | 13"¹ |
| Min. Height（最小高度） | 15" |

**各面料系列 Max. Width / Max. Height（均为 5" 叶片）：**

| 面料系列 | Max. Width | Max. Height |
|---|---|---|
| Alustra Oakley 5" Light Filtering (PR82 & PR84) | 96" | 96" |
| Alustra ClearView® Apollo™ 5" Light Filtering (PR70 & PR72) | 96" | 96" |
| Avant 5" (PR86 & PR88) | 96" | 96" |
| ClearView Batiste Bamboo 5" (PR74 & PR76) | 96" | 96" |
| ClearView Charmeuse 5" (PR90 & PR92) | 96" | 96" |
| ClearView® Satin 5" (PR60 & PR62) | 120" | 120" |
| ClearView Satin Metallic™ 5" (PR64 & PR66) | 120" | 120" |
| ClearView Wren 5" (PR78 & PR80) | 96" | 96" |
| Grant™ 5" (PR50 & PR52) | 96" | 96" |
| Linen 5" (PR6 & PR8) | 96" | 96" |
| Satin 5" (PR10 & PR12) | 120" | 120" |
| Satin Metallic 5" (PR14 & PR16) | 120" | 120" |
| Shantung 5" (PR22 & PR24) | 96" | 96" |
| Thea 5" (PR94 & PR96) | 96" | 96" |

¹ 注：PowerView® Gen 3 窗帘宽度小于 **18"** 时，需使用卫星电池包 (satellite battery pack)、C 号卫星电池杆 (C-size satellite battery wand) 或 18V DC 电源供应器 (18V DC Power Supply)。PowerView Gen 3 窗帘宽度小于 **22"** 且使用可充电电池杆时，仅支持卫星安装 (satellite mount)。

**备注：**
- 端装安装 (EB) 最大订购宽度为 **48"**。
- 为获得最大遮光效果，建议外装安装 (OB) 的 room-darkening 窗帘每侧（含长度方向）预留 **3"** 宽度重叠。
- 零底部面料裁片选项详情见前述章节。

### Operating System Specifications（操作系统规格）

**应用范围：**
- 适用于最大 **120" x 120"** 的矩形窗户。
- 无线控制的自动化系统 (Automated system with wireless control)。
- 窗帘从下往上升起。
- 底部面料裁片根据窗帘高度调整；相同面料款式、颜色、遮光度和高度的窗帘之间，叶片对齐应在 **1/4"** 以内。

**排除项 (Exclusions)：**
- 左侧电机与控制按钮 (Left-side motor and control button)
- 磁性固定卡扣 (Magnetic hold-down brackets)
- Two-On-One Headrail
- 可充电电池杆的背板 (Back cover with rechargeable battery wand)

**补充信息：**
- 仅提供右侧电机与控制按钮 (Right-side motor and control button only)。
- 使用菊链线缆 (daisy-chain cables) 时，总长度不应超过 **50 英尺**，且窗帘总面积不能超过合计 **100 平方英尺**。
- 相同面料款式、颜色、叶片尺寸、遮光度、高度和安装方式的窗帘，并排叶片对齐为标准配置。
- 所有内嵌安装 (IB) 顶盒均标配挡光条。
- 可充电电池杆 (Rechargeable Battery Wand) 和电池杆 (Battery Wand) 的电源供应选项依订购宽度而异，详见 PowerView® Gen 3 Power Supplies 订购须知。

**可选功能 — 免费：**
- Back cover（仅限内嵌和端装安装）
- Extension brackets（端装安装必需）
- Headrail dust cover（仅限外装安装）
- Spacer blocks
- Zero Bottom Fabric Panel（仅限 OB）

**附加费 (Surcharge)：** PowerView® Gen 3 Automation accessories（配件另需附加费，详见 Price Guide）

**标配五金：** Installation brackets；预装电池包 (Pre-loaded battery pack)（除非另订其他电源供应选项）

**安装要求：**

| 安装方式 | 项目 | 数值 |
|---|---|---|
| Inside Mount (IB) | 最小安装深度 | 1"¹ |
| Inside Mount (IB) | 最小安装深度，完全内嵌 | 3 3/4"¹ |
| Outside Mount (OB) | 最小平整垂直表面 | 1" |
| Outside Mount (OB) | 推荐每侧宽度重叠 | 3" |
| End Mount (EB) | 最小安装表面深度 | 1 1/2" |

¹ 需增加 **1/2"** 以容纳顶盒安装的可充电电池杆 (headrail-mounted rechargeable battery wand)。

备注：
- 使用顶盒安装可充电电池杆的外装安装，每个安装支架需增加 **1/2" 垫块**，以获得挂载和电池杆所需的额外净空。
- 若计划安装太阳能充电器 (Solar Charger)，需考虑尺寸、位置和安装要求；相关尺寸和线缆长度参见 Reference Guide 的 PowerView 章节；安装要求参见 Solar Charger Installation Guide。

**成品尺寸：**

| 安装方式 | 项目 | 扣减/数值 |
|---|---|---|
| Inside Mount (IB) | Headrail unit width | –1/4" |
| Inside Mount (IB) | Shading height | –1/8" up to +1/4" |
| Inside Mount (IB) | Fabric width | –3/4" |
| Outside Mount (OB) | Headrail unit width | 订购宽度 |
| Outside Mount (OB) | Shading height, Standard | –1/8" up to +1/4" |
| Outside Mount (OB) | Zero Bottom Fabric Panel | 订购高度 + 最多 5" |
| Outside Mount (OB) | Fabric width | –7/16" |
| End Mount (EB) | Headrail unit width | –5/8" |
| End Mount (EB) | Shading height | –1/8" up to +1/4" |
| End Mount (EB) | Fabric width | –1 1/8" |

备注：所有扣减以订购尺寸为基准，宽度可能有 +0/–1/8" 变化。

**边缘间隙：**

| 位置 | 数值 |
|---|---|
| Inside Mount (IB) Control side | 3/8" |
| Inside Mount (IB) Free side | 3/8" |
| Abutted Shadings: Free side against control side | 1/2" |

### Ordering Notes（订购须知）—— PowerView® Gen 3 Power Supplies（电源供应）

需为标准 PowerView® Gen 3 窗帘选择电源供应选项。可用选项包括：

- **Rechargeable Battery Wand（可充电电池杆）**：装配于对应的可充电电池座 (rechargeable battery mount)，可夹装于顶盒背面 (headrail mount) 或卫星安装 (satellite mount)。
  - Headrail Mount：可充电电池将通过随附卡扣夹装于顶盒背面。
  - Satellite Mount：可充电电池将通过随附支架和螺丝安装于墙面或窗框上；可选延长线长度：**15"、4'、10'、20'**。
  - 充电方式：双充电站 (dual charging station) 或单充电器 (single charger)（配件单独出售）。
- **Battery Wand（电池杆）**：预装碱性电池杆，标配随产品提供，安装于顶盒背后，无额外费用。
- **Satellite Battery Pack（卫星电池包）**：可选线长 **15"、4'、10'、20'**；连接于顶盒右侧（编程按钮所在处）；适合窗户位置较高难以触及电池杆，或安装深度不足的场景。
- **C-Size Satellite Battery Wand（C 号卫星电池杆）**：可选线长 **15"、4'、10'、20'**；电池寿命约为 **三年**（因窗饰类型、尺寸和使用频率而异）。
- **18V DC Power Supply（18V 直流电源供应器）**：插入标准家用插座，无需使用电池；可选线长 **15"、4'、10'、20'**。
- **Daisy-Chain Cable（菊链线缆）**：可选线长 **15"、4'、10'、20'**；配合 Y 型适配器 (Y Adapter) 组成菊链电缆；"菊链"指用单个 18V DC 电源供应器为最多 **三个**窗饰供电的方式（需另购电源）；每个菊链窗饰可独立操作；菊链总线长不能超过 **50 英尺**。
- **16 Shade DC Power Supply（16 路窗饰直流电源供应器）**：可为最多 **16 个**窗饰供电（低压布线）；下单时仅需一个电源供应器为最多 16 个窗饰供电，其余窗饰的电源类型应填写为 "No Power Source"；使用此电源时不可菊链连接窗饰。

**PowerView® Gen 3 Accessories（配件）：**

- **PowerView® Gen 3 Remote**：可选数量 (1-9)，颜色：Black 或 White；须与 PowerView Pebble® 或 Surface 配套订购。
- **PowerView® Pebble®**：可选数量 (1-9)，颜色：Black、Citron、Clear Frost、Cobalt、Ecru、Mist、Oyster、Pewter Frost、Poppy、White；遥控模块另售。
- **PowerView® Surface**：可选数量 (1-9)，颜色：Black、Nickel、White；壁挂式外壳。
- **PowerView® Gen 3 Gateway**：可选数量 (1-9)；用于大型 PowerView® Gen 3 系统以确保最佳性能，也可用于与第三方控制系统集成；为入门级网关型号；随附电源线。
- **PowerView® Gen 3 Gateway Pro**：可选数量 (1-9)；提供更高级功能与多样性，适合各种安装和定制方案；随附电源线和以太网线。
- **PowerView® Gen 3 Gateway Mount**：可选数量 (1-9)；用于将 Gen 3 Gateway 或 Gateway Pro 固定于多种安装表面（含天花板和墙面）。
- **Spare Rechargeable Battery Wand（备用可充电电池杆）**：提供数量 (1-9)；电池杆充电需 **2 到 3 小时**，充电期间窗饰不可操作；双充电站最长充电时间 **3 小时**，单充电器最长充电时间 **2 小时**。
- **Dual Charging Station（双充电站）**：可同时为最多 **两个**可充电电池杆充电，最长充电时间 **3 小时**；只能使用 Hunter Douglas 单充电器或双充电站充电。
- **Wand Charger Kit（电池杆充电套件）**：含单充电器和可选充电线缆；单充电器可在 **2 小时以内**为一个可充电电池杆充电；可选线缆长度：伸缩式 (retractable) **13'**、**3'**、**12'**。
- **Extra Retractable Charging Cable（额外伸缩式充电线缆）**：伸缩式充电线缆长度为 **13'**；最多可混用 **两条**充电线缆以到达窗饰并原地充电。
- **Extra 3' or 12' Charging Cable（额外 3' 或 12' 充电线缆）**：最多可混用两条充电线缆。
- **Solar Charger Kit（太阳能充电器套件）**：可选数量和颜色 (Black/White)；作为附加电源供应，通过在窗户处捕获太阳能延长可充电电池窗饰的续航；可直接安装于窗玻璃或窗框；套件含安装配件和用于可充电电池杆的太阳能充电线缆；每个太阳能充电器可为一个可充电电池窗饰充电。
- **Quick-Lever Barrel Connectors – Female（快接式母端接头）**：提供数量 (1-9)，每包 **8 件**；用于制作向 PowerView Gen 3 电机供电的定制线缆；每个 16 Shade DC Power Supply 随附 **4 包**（共 **32 个**）。
- **Screw to Barrel Connectors – Male（螺丝转接头，公端）**：提供数量 (1-9)，每包 **10 件**。

### Product View

示意图展示了 PowerView® Gen 3 Automation 的组件：Installation Brackets、Fabric-covered Headrail、Fabric、Headrail End Cap、Control Button（控制按钮）、Battery Wand、Bottom Rail、Optional Dust Cover (For Outside Mount)、Optional Back Cover (For Inside and End Mount)。

---

## PowerView+™ Gen 3 Automation（第18–21页）

### Size Standards（尺寸标准）

| 项目 | Standard |
|---|---|
| Min. Width（最小宽度） | 13" |
| Min. Height（最小高度） | 15" |

**各面料系列 Max. Width / Max. Height（均为 5" 叶片）：**

| 面料系列 | Max. Width | Max. Height |
|---|---|---|
| Alustra Oakley 5" Light Filtering (PR82 & PR84) | 96" | 96" |
| Alustra ClearView® Apollo™ 5" Light Filtering (PR70 & PR72) | 96" | 96" |
| Avant 5" (PR86 & PR88) | 96" | 96" |
| ClearView Batiste Bamboo 5" (PR74 & PR76) | 96" | 96" |
| ClearView Charmeuse 5" (PR90 & PR92) | 96" | 96" |
| ClearView® Satin 5" (PR60 & PR62) | 120" | 120" |
| ClearView Satin Metallic™ 5" (PR64 & PR66) | 120" | 120" |
| ClearView Wren 5" (PR78 & PR80) | 96" | 96" |
| Grant™ 5" (PR50 & PR52) | 96" | 96" |
| Linen 5" (PR6 & PR8) | 96" | 96" |
| Satin 5" (PR10 & PR12) | 120" | 120" |
| Satin Metallic 5" (PR14 & PR16) | 120" | 120" |
| Shantung 5" (PR22 & PR24) | 96" | 96" |
| Thea 5" (PR94 & PR96) | 96" | 96" |

**备注：**
- 端装安装 (EB) 最大订购宽度为 **48"**。
- 建议外装安装 (OB) room-darkening 窗帘每侧（含长度方向）预留 **3"** 重叠。
- 零底部面料裁片选项详情见前述章节。

⚠️待核对：PowerView+™ Gen 3 的 Size Standards 表中未见类似 PowerView® Gen 3 的脚注¹（关于宽度小于18"/22"需卫星电源），资料未提及该限制是否也适用于 PowerView+。

### Operating System Specifications（操作系统规格）

**应用范围：**
- 适用于最大 **120" x 120"** 的矩形窗户。
- 有线与无线控制的自动化系统 (Automated system with wired and wireless control)。
- 窗帘从下往上升起。
- 底部面料裁片根据窗帘高度调整；相同面料款式、颜色、遮光度和高度的窗帘间，叶片对齐应在 **1/4"** 以内。

**排除项：**
- Two-On-One Headrail
- 左侧电机与控制按钮
- 连接接口 (Connection interface)

**补充信息：**
- 相同面料款式、颜色、叶片尺寸、遮光度、高度和安装方式的窗帘，并排叶片对齐为标准配置。
- 所有内嵌安装 (IB) 顶盒均标配挡光条。
- 仅提供右侧电机与控制按钮。
- 更多 PowerView+ Gen 3 设计与操作信息，参见 Reference Guide 的 PowerView 章节。

**可选功能 — 免费：**
- Back cover（仅限内嵌和端装安装）
- Extension brackets（端装安装必需）
- Headrail dust cover（仅限外装安装）
- Spacer blocks
- Zero Bottom Fabric Panel（仅限 OB）

**附加费：** PowerView+™ Gen 3 accessories

**标配五金：** Installation brackets

**安装要求：**

| 安装方式 | 项目 | 数值 |
|---|---|---|
| Inside Mount (IB) | 最小安装深度 | 1" |
| Inside Mount (IB) | 最小安装深度，完全内嵌 | 3 3/4" |
| Outside Mount (OB) | 最小平整垂直表面 | 1" |
| Outside Mount (OB) | 推荐每侧宽度重叠 | 3" |
| End Mount (EB) | 最小安装表面深度 | 1 1/2" |

**成品尺寸：**

| 安装方式 | 项目 | 扣减/数值 |
|---|---|---|
| Inside Mount (IB) | Headrail unit width | –1/4" |
| Inside Mount (IB) | Shading height | –1/8" up to +1/4" |
| Inside Mount (IB) | Fabric width | –3/4" |
| Outside Mount (OB) | Headrail unit width | 订购宽度 |
| Outside Mount (OB) | Shading height, Standard | –1/8" up to +1/4" |
| Outside Mount (OB) | Zero Bottom Fabric Panel | 订购高度 + 最多 5" |
| Outside Mount (OB) | Fabric width | –7/16" |
| End Mount (EB) | Headrail unit width | –5/8" |
| End Mount (EB) | Shading height | –1/8" up to +1/4" |
| End Mount (EB) | Fabric width | –1 1/8" |

备注：所有扣减以订购尺寸为基准，宽度可能有 +0/–1/8" 变化。

**边缘间隙：**

| 位置 | 数值 |
|---|---|
| Inside Mount (IB) Control side | 3/8" |
| Inside Mount (IB) Free side | 3/8" |
| Abutted Shadings: Free side against control side | 1/2" |

### Ordering Notes（订购须知）—— PowerView+ Gen 3 Power Supplies

- 标准 PowerView+ Gen 3 窗饰**不可**在窗饰配置中选择电源供应选项。
- PowerView+ 系统必须硬接线 (hardwired)，且住宅须预先布线；建议在订购窗饰之前，先将电源供应器和低压布线作为配件下单。
- **PowerView+™ Gen 3 Smart Power Supply（智能电源供应器）**（*需附加费）：为 PowerView+ Gen 3 窗饰提供电力与通信，专用于 PowerView+ Gen 3 系统。
- **PowerView+ Daisy-Chain Cable（菊链线缆）**（*需附加费）：可选数量 (1-9)；最多 **三个** PowerView+ 窗饰可通过智能电源供应器的单个输出以菊链方式供电；若系统中有两个窗饰，需订购一根菊链线缆；若有三个窗饰，需订购两根线缆。
- **PowerView+ Plug-in Connectors – Male（插入式接头，公端）**（*需附加费）：可选数量 (1-9)，每包 **8 件**；用于制作向 PowerView+ Gen 3 电机供电及通信的定制线缆；每个智能电源供应器随附 **2 包**（共 **16 个**）。
- **PowerView+ Bulk Cable, 500ft（散装线缆，500 英尺）**（*需附加费）：可选数量 (1-9)；用于在智能电源供应器与 PowerView+ 窗饰之间制作定制线缆；四芯、非阻燃级低压线缆，卷装于 500 英尺拉线盒；四根导线包括 22-2 AWG 绞合裸铜屏蔽双绞线，以及 18-2 AWG 绞合裸铜非屏蔽线。

PowerView+™ Gen 3 Accessories（配件）：与 PowerView® Gen 3 Automation 相同，包括 PowerView® Gen 3 Remote、Pebble®、Surface、Gateway、Gateway Pro、Gateway Mount（数量、颜色选项与前述 PowerView® Gen 3 章节一致）。

### Product View

示意图展示了 PowerView+™ Gen 3 Automation 的组件：Installation Brackets、Fabric-covered Headrail、Fabric、Headrail End Cap、Control Button、Battery Wand、Bottom Rail、Optional Dust Cover (For Outside Mount)、Optional Back Cover (For Inside and End Mount)。

---

## SoftTouch® Motorization（第22–26页）

### Size Standards（尺寸标准）

| 项目 | Standard |
|---|---|
| Min. Width（最小宽度） | 15"¹ |
| Min. Height（最小高度） | 15" |

**各面料系列 Max. Width / Max. Height（均为 5" 叶片）：**

| 面料系列 | Max. Width | Max. Height |
|---|---|---|
| Alustra Oakley 5" Light Filtering (PR82 & PR84) | 96" | 96" |
| Alustra ClearView® Apollo™ 5" Light Filtering (PR70 & PR72) | 96" | 96" |
| Avant 5" (PR86 & PR88) | 96" | 96" |
| ClearView Batiste Bamboo 5" (PR74 & PR76) | 96" | 96" |
| ClearView Charmeuse 5" (PR90 & PR92) | 96" | 96" |
| ClearView® Satin 5" (PR60 & PR62) | 120" | 120" |
| ClearView Satin Metallic™ 5" (PR64 & PR66) | 120" | 120" |
| ClearView Wren 5" (PR78 & PR80) | 96" | 96" |
| Grant™ 5" (PR50 & PR52) | 96" | 96" |
| Linen 5" (PR6 & PR8) | 96" | 96" |
| Satin 5" (PR10 & PR12) | 120" | 120" |
| Satin Metallic 5" (PR14 & PR16) | 120" | 120" |
| Shantung 5" (PR22 & PR24) | 96" | 96" |
| Thea 5" (PR94 & PR96) | 96" | 96" |

¹ 注：SoftTouch® 窗帘宽度小于 **18"** 时，需使用卫星电池包、C 号卫星电池杆或 18V DC 电源供应器。SoftTouch 窗帘宽度小于 **22"** 且使用可充电电池杆时，仅支持卫星安装。

**备注：**
- 端装安装 (EB) 最大订购宽度为 **48"**。
- 建议外装安装 (OB) room-darkening 窗帘每侧（含长度方向）预留 **3"** 重叠。
- 零底部面料裁片选项详情见前述章节。

### Operating System Specifications（操作系统规格）

**应用范围：**
- 适用于最大 **120" x 120"** 的矩形窗户。
- 操作杆控制的电机化系统 (Motorized system with wand control)。
- 窗帘从下往上升起。
- 底部面料裁片根据窗帘高度调整；相同面料款式、颜色、遮光度和高度的窗帘间，叶片对齐应在 **1/4"** 以内。

**排除项：**
- 磁性固定卡扣 (Magnetic hold-down brackets)
- Two-On-One Headrail
- 可充电电池杆的背板 (Back cover with rechargeable battery wand)

**补充信息：**
- 使用菊链线缆时，总长度不应超过 **50 英尺**，窗帘总面积不能超过合计 **100 平方英尺**。
- 相同面料款式、颜色、遮光度、高度和安装方式的窗帘，并排叶片对齐为标准配置。
- 所有内嵌安装 (IB) 顶盒均标配挡光条。
- 可充电电池杆和电池杆的电源供应选项依订购宽度而异，详见 Ordering Notes。

**可选功能 — 免费：**
- Back cover（仅限内嵌和端装安装）
- Extension brackets（端装安装必需）
- Headrail dust cover（仅限外装安装）
- Spacer blocks
- Zero Bottom Fabric Panel（仅限 OB）

**附加费：** SoftTouch accessories

**标配五金：** Installation brackets；配色操作杆 (Color-coordinated wand)；预装电池包（除非另订电源供应选项）

**安装要求：**

| 安装方式 | 项目 | 数值 |
|---|---|---|
| Inside Mount (IB) | 最小安装深度 | 1"¹ |
| Inside Mount (IB) | 最小安装深度，完全内嵌 | 3 3/4"¹ |
| Outside Mount (OB) | 最小平整垂直表面 | 1" |
| Outside Mount (OB) | 推荐每侧宽度重叠 | 3" |
| End Mount (EB) | 最小安装表面深度 | 1 1/2" |

¹ 需增加 **1/2"** 以容纳顶盒安装的可充电电池杆。

备注：
- 当 SoftTouch® 窗帘完全内嵌收纳时，操作杆将凸出 **3/8"**。
- 使用顶盒安装可充电电池杆的外装安装，每个安装支架需增加 **1/2" 垫块**。
- 若计划安装太阳能充电器，需考虑尺寸、位置和安装要求（详见 Reference Guide 的 PowerView 章节及 Solar Charger Installation Guide）。

**成品尺寸：**

| 安装方式 | 项目 | 扣减/数值 |
|---|---|---|
| Inside Mount (IB) | Headrail unit width | –1/4" |
| Inside Mount (IB) | Shading height | –1/8" up to +1/4" |
| Inside Mount (IB) | Fabric width | –3/4" |
| Outside Mount (OB) | Headrail unit width | 订购宽度 |
| Outside Mount (OB) | Shading height, Standard | –1/8" up to +1/4" |
| Outside Mount (OB) | Zero Bottom Fabric Panel | 订购高度 + 最多 5" |
| Outside Mount (OB) | Fabric width | –7/16" |
| End Mount (EB) | Headrail unit width | –5/8" |
| End Mount (EB) | Shading height | –1/8" up to +1/4" |
| End Mount (EB) | Fabric width | –1 1/8" |

备注：所有扣减以订购尺寸为基准，宽度可能有 +0/–1/8" 变化。

**边缘间隙：**

| 位置 | 数值 |
|---|---|
| Inside Mount (IB) Control side | 3/8" |
| Inside Mount (IB) Free side | 3/8" |
| Abutted Shadings: Free side against free side | 1/2" |
| Abutted Shadings: Free side against control side | 1/2" |
| Abutted Shadings: Control side against control side | 1/2" |

### Ordering Notes（订购须知）

- 另见 Zero Bottom Fabric Panel Option。
- **Hardware Options：**
  - **Motor Side/Wand Side（电机侧/操作杆侧）**：选择左或右。
  - **Custom Wand Length（自定义操作杆长度）**：可指定非标准操作杆长度，以 **6" 递增**，范围 **12" 至 48"**；标准操作杆长度约为窗帘高度的 **50%**。

**SoftTouch® Power Supplies（电源供应）：**（与 PowerView Gen 3 电源供应结构类似）
- **Rechargeable Battery Wand**：可选 Headrail Mount 或 Satellite Mount；Satellite Mount 可选延长线长度 **15"、4'、10'、20'**。
- **Battery Wand***：预装碱性电池杆，标配，无额外费用。
- **Satellite Battery Pack***：可选线长 **15"、4'、10'、20'**；通过随附壁挂支架、盖板和螺丝安装于墙面或窗框；适合窗户位置较高或安装深度不足场景。
- **C-Size Satellite Battery Wand***：可选线长 **15"、4'、10'、20'**；电池寿命约 **三年**。
- **18V DC Power Supply***：可选线长 **15"、4'、10'、20'**。
- **Daisy-Chain Cable***：可选线长 **15"、4'、10'、20'**；最多为 **三个**窗饰供电；总线长不超过 **50'**。
- **16 Shade DC Power Supply**：可为最多 **16 个**窗饰供电；其余窗饰电源类型填写 "No Power Source"；使用此电源不可菊链连接。

**SoftTouch Accessories（配件）：**
- **Spare Rechargeable Battery Wand***：提供数量 (1-9)；充电需 **2 到 3 小时**；双充电站最长 **3 小时**，单充电器最长 **2 小时**。
- **Dual Charging Station***：同时为最多 **两个**电池杆充电，最长 **3 小时**。
- **Wand Charger Kit***：单充电器 **2 小时以内**充满；可选充电线缆：伸缩式 **13'**、**3'**、**12'**。
- **Extra Retractable Charging Cable**：长度 **13'**；最多混用 **两条**。
- **Extra 3' or 12' Charging Cable**：最多混用两条。
- **Solar Charger Kit**：可选数量和颜色 (Black/White)；每个可为一个窗饰充电。
- **Quick-Lever Barrel Connectors – Female**：数量 (1-9)，每包 **8 件**；每个 16 Shade DC Power Supply 随附 **4 包**（共 **32 个**）。
- **Screw to Barrel Connectors – Male**：数量 (1-9)，每包 **10 件**。

### Product View

示意图展示了 SoftTouch® Motorization 的组件：Installation Brackets、Headrail End Cap、Bottom Rail、Activation Arm（激活臂）、Battery Wand、Fabric-Covered Headrail、Wand、Fabric；未展示：Rechargeable Battery Wand、Satellite Battery Pack、C-Size Satellite Battery Wand、18V DC Power Supply；Optional Dust Cover (For Outside Mount)、Optional Back Cover (For Inside and End Mount)。

---

## UltraGlide®（第27–30页）

### Size Standards（尺寸标准）

| 项目 | Standard | Two-On-One Headrail |
|---|---|---|
| Min. Width（最小宽度） | 12" | 12"/panel |
| Min. Height（最小高度） | 15" | 15" |

**各面料系列 Max. Width / Max. Height（均为 5" 叶片）：**

| 面料系列 | Standard Max. Width | Two-On-One Max. Width | Standard Max. Height | Two-On-One Max. Height |
|---|---|---|---|---|
| Alustra Oakley 5" Light Filtering (PR82 & PR84) | 96" | 144" | 96" | 96" |
| Alustra ClearView® Apollo™ 5" Light Filtering (PR70 & PR72) | 96" | 144" | 96" | 96" |
| Avant 5" (PR86 & PR88) | 96" | 144" | 96" | 96" |
| ClearView Batiste Bamboo 5" (PR74 & PR76) | 96" | 144" | 96" | 96" |
| ClearView Charmeuse 5" (PR90 & PR92) | 96" | 144" | 96" | 96" |
| ClearView® Satin 5" (PR60 & PR62) | 120" | 144" | 120" | 96" |
| ClearView Satin Metallic™ 5" (PR64 & PR66) | 120" | 144" | 120" | 96" |
| ClearView Wren 5" (PR78 & PR80) | 96" | 144" | 96" | 96" |
| Grant™ 5" (PR50 & PR52) | 96" | 144" | 96" | 96" |
| Linen 5" (PR6 & PR8) | 96" | 144" | 96" | 96" |
| Satin 5" (PR10 & PR12) | 120" | 144" | 120" | 96" |
| Satin Metallic 5" (PR14 & PR16) | 120" | 144" | 120" | 96" |
| Shantung 5" (PR22 & PR24) | 96" | 144" | 96" | 96" |
| Thea 5" (PR94 & PR96) | 96" | 144" | 96" | 96" |

**备注：**
- Two-On-One Headrail：单面板最大宽度 **72"**。
- 端装安装 (EB) 最大订购宽度 **48"**。
- Two-On-One Headrail 不适用于端装安装 (EB)。
- 建议外装安装 (OB) room-darkening 窗帘每侧（含长度方向）预留 **3"** 重叠。
- 零底部面料裁片选项详情见前述章节。

### Operating System Specifications（操作系统规格）

**应用范围：**
- **UltraGlide®**：适用于最大 **120" x 120"** 的矩形窗户；使用 UltraGlide 操作杆；一键操作即可使面料裁片下降以获得完全私密性；泵动操作杆可打开叶片或升起窗帘。
- **UltraGlide Two-On-One Headrail**：适用于最大 **144" x 96"** 的矩形窗户（单面板最大宽度 **72"**）；两面板通过两根独立的 UltraGlide 操作杆操作；面板宽度可等宽或不等宽。
- 窗帘从下往上升起。
- 底部面料裁片根据窗帘高度调整：
  - 相同面料款式、颜色、遮光度和高度的窗帘间，叶片对齐应在 **1/4"** 以内。
  - Two-On-One Headrail 窗帘面板间，叶片对齐应在 **1/8"** 以内。

**排除项：**
- Two-On-One Headrail 作为端装安装 (EB)。

**补充信息：**
- 相同面料款式、颜色、遮光度、高度和安装方式的窗帘，并排叶片对齐为标准配置。
- 所有内嵌安装 (IB) 顶盒均标配挡光条。

**可选功能 — 免费：**
- Back cover（仅限内嵌和端装安装）
- Extension brackets（端装安装必需）
- Headrail dust cover（仅限外装安装）
- Magnetic hold-down brackets
- Spacer blocks
- Two-On-One Headrail
- Non-standard wand lengths（非标准操作杆长度）
- Zero Bottom Fabric Panel（仅限 OB）

**标配五金：** Installation brackets；配色操作杆 (Color-coordinated wand)

**操作杆长度 (Wand Length)：** 下单时必须指定，参见 Wand Measuring Guidelines。

**安装要求：**

| 安装方式 | 项目 | 数值 |
|---|---|---|
| Inside Mount (IB) | 最小安装深度 | 1" |
| Inside Mount (IB) | 最小安装深度，完全内嵌 | 3 3/4" |
| Outside Mount (OB) | 最小平整垂直表面 | 1" |
| Outside Mount (OB) | 推荐每侧宽度重叠 | 3" |
| End Mount (EB) | 最小安装表面深度 | 1 1/2" |

**成品尺寸：**

| 安装方式 | 项目 | 扣减/数值 |
|---|---|---|
| Inside Mount (IB) | Headrail unit width | –1/4" |
| Inside Mount (IB) | Shade height | –1/8" up to +1/4" |
| Inside Mount (IB) | Fabric width | –1 1/8" |
| Outside Mount (OB) | Headrail unit width | 订购宽度 |
| Outside Mount (OB) | Shade height, Standard | –1/8" up to +1/4" |
| Outside Mount (OB) | Zero Bottom Fabric Panel | 订购高度 + 最多 5" |
| Outside Mount (OB) | Fabric width | –13/16" |
| End Mount (EB) | Headrail unit width | –5/8" |
| End Mount (EB) | Shade height | –1/8" up to +1/4" |
| End Mount (EB) | Fabric width | –1 1/2" |
| Two-On-One Headrail | Gap between fabric panels | up to 5/8" |

备注：所有扣减以订购尺寸为基准，宽度可能有 +0/–1/8" 变化。

**边缘间隙：**

| 位置 | 数值 |
|---|---|
| Inside Mount (IB) Control side（窗洞边缘到面料） | 11/16" |
| Inside Mount (IB) Non-control side | 7/16" |
| Abutted Shades: Non-control side against non-control side | 3/4" |
| Abutted Shades: Non-control side against control side | 1" |
| Abutted Shades: Control side against control side | 1 1/4" |

### UltraGlide® Wand Operation（操作杆操作方式）

**重要提示：** Pirouette® 软纱帘的 UltraGlide® 操作方式与其他 UltraGlide 产品不同：操作杆是垂直向下拉出，而非以一定角度横向拉动，这是为了保护叶片不被操作杆损坏。

- **降下窗帘**：以大于 **25°** 的角度将操作杆从面料中垂直拉出；离合器会发出咔哒声，面料随即受控下降；若要在任意位置停止窗帘，直接将操作杆垂直向下拉。
- **打开叶片**：窗帘完全降下后，继续以大于 **25°** 的角度拉动操作杆，直到叶片完全打开。
- **升起窗帘**：将操作杆贴近面料并垂直向下拉；用短行程泵动操作杆逐渐升起窗帘。

**注意事项：** 为避免损坏窗帘或造成人身伤害，操作杆完全收回前不要松手；为避免损坏操作杆内部绳索，不要使用超过 **42"** 的长行程，也不要对操作杆施加过大力量。

### Ordering Notes（订购须知）

- 另见 Zero Bottom Fabric Panel Option。
- **Shadings on Headrail**：选择 1 或 2*。
- **Ordered Size**：提供标准 (Bottom-Up) 窗帘的宽度和高度；Two-On-One headrail 窗帘还需额外提供左宽度和右宽度；宽度公差为 **+0/-1/8"**，高度公差为 **±1/8" up to +1/4"**。
- **Wand Position**：选择左或右；标准窗帘需指定；Two-On-One headrail 时操作杆位置为左侧窗帘左侧、右侧窗帘右侧。
- **Wand Length**：以 **6" 递增**指定，范围 **12" 至 84"**；推荐操作杆长度使流苏 (tassel) 处于用户肩部高度；建议测量参见 Reference Guide 中的 Measuring Guidelines。
- **Magnetic Hold-Down Brackets**：选择是/否；仅适用于单面板窗帘。

**Wand Measuring Guidelines（操作杆测量指南）：** UltraGlide 窗帘的控制杆最佳长度约等于从顶盒到用户肩部的距离；按最近的 **6"** 递增取整选择操作杆长度（范围 **12" 至 84"**）；根据用户情况调整长度，操作杆应落在使用者肩部高度之间。

### Product View

示意图展示了 UltraGlide® 的组件：Installation Brackets、Fabric-Covered Headrail、Magnetic Hold-Down Brackets (Optional)、Optional Dust Cover (For Outside Mount)、Wand、Bottom Rail；未展示 Two-On-One Headrail Shadings；Optional Back Cover (For Inside and End Mount)。

---

## Specialty Shapes, Non-Operable（异形窗，非操作型）（第31–35页）

### Size Standards（尺寸标准）

| 项目 | Arch, Imperfect Arch | Extended Arch | Quarter Circle | Circle | Oval | Angle | Hexagon, Octagon, Trapezoid |
|---|---|---|---|---|---|---|---|
| Min. Width | 12" | 12" | 12" | 12" | 12" | 12" | 12" |
| Max. Width | 72" | 72" | 72" | 72" | 60" | 72" | 72" |
| Min. Height | 15" | 15" | 15" | 15" | 15" | 15" | 15" |
| Max. Height | 48" | 84" | 72" | 72" | 72" | 72" | 72" |

（原表标注：所有形状均可用所有面料 "ALL FABRICS"；各列均带星号 "*" 标注 "No template required for ordering"（无需模板即可下单），细节见下方"备注"）

**备注：**
- Angle（角形）：角顶最小坡度为 **15°**；最大坡度为 **45°**。
- 角形和大多数带直边底部的拱形均配有底轨 (bottom rail)；其他所有带直边底部的异形窗则配备透明塑料底部条 (clear plastic bottom strip) 及安装夹。
- 所有异形窗均为固定造型，叶片保持闭合、贴合造型的位置。
- 四分之一圆、圆形、椭圆形、六边形、八边形、梯形以及任何无平直底边的形状将**没有底轨**。

### Operating System Specifications（操作系统规格）

**适用异形窗类型：** Angle（角形，含 angle top 和 right triangle）、Arch（拱形，perfect¹ 和 imperfect²）、Circle（圆形）、Extended arch（延伸拱形，perfect 和 imperfect）、Hexagon（六边形）、Octagon（八边形）、Oval（椭圆形）、Quarter circle（四分之一圆，perfect 和 imperfect）、Trapezoid（梯形）。

¹ Perfect arch（标准拱形）：宽度恰好为高度的两倍。
² Imperfect arch（非标准拱形）：宽度大于高度的两倍；若宽度至少为高度的两倍，可使用免模板下单 (Template-free ordering)。

- 仅限内嵌安装 (Inside mount, IB only)。
- 所有异形窗均为固定造型，叶片处于闭合、贴合造型位置。
- **最小窗框深度 (Minimum casement depth)：1 3/4"**。
- **最小窗框深度，完全内嵌 (fully recessed)：2 7/8"**。

**排除项：**
- 外装安装 (Outside mount, OB)
- 并排叶片对齐 (Side-by-side vane alignment)（并排安装时叶片不会对齐）

**补充信息：**
- 在最窄处测量 (Take measurements at the narrowest point)。
- 部分异形窗支持免模板下单；免模板订单按提供尺寸裁剪为理论形状；不建议对石膏板包边/装饰完成的窗户使用免模板下单。
- 所有异形窗的整个周长均扣减 **1/4"**。
- 并排的异形窗（即使在同一窗户中）不提供叶片对齐。
- 更多信息请联系 Hunter Douglas 制造商。

**五金系统 (Hardware Systems)：**
- 由于没有顶盒，柔性安装夹 (flexible mounting clips) 支撑面料，安装于窗框内。
- 底轨搁置于窗台上，或位于标准矩形窗帘上方的 Pirouette® 顶盒上。
- 角形和大多数带直边底部的拱形配有底轨；其他所有异形窗配备透明塑料底部条及安装夹。
- 四分之一圆、圆形、椭圆形、六边形、八边形、梯形以及任何无平直底边的形状将没有底轨。

备注：六边形和八边形 — 若需免模板下单，每条边必须相等；若尺寸不完全相同，则需要模板。延伸拱形的侧边高度 (side height) 必须**大于等于 6"**。

示意图说明：文档展示了 Inverted Trapezoid（倒梯形）、Trapezoid（梯形）、Oval（椭圆形）、Right/Left Quarter Circle（左右四分之一圆）、Perfect and Imperfect Extended Arch（标准/非标准延伸拱形）、Left/Right Angle（左右角形）、Circle（圆形）、Perfect and Imperfect Arch（标准/非标准拱形）、Hexagon（六边形）、Octagon（八边形）的测量点示意（宽度、高度、各边 Reductions 等标注位置）。

### Ordering Notes（订购须知）

- **Quantity**：每种相同配置窗帘填写一行订单项。
- **Control System Style**：选择以下之一：Arch*、Circle*、Extended Arch*、Hexagon*、Inverted Trapezoid*、Left Angle*、Left Quarter Circle*、Octagon*、Oval*、Right Angle*、Right Quarter Circle*、Trapezoid*。四分之一圆、圆形、椭圆形、六边形、八边形和梯形将没有底轨。
- **Template Required**：注明是否需要模板；六边形和八边形若各边不相等则需要模板。
- **免模板下单要求 (Requirements for Template-Free Ordering)：**
  - 在最宽处测量 (widest point)。
  - 较高的一侧决定左角还是右角 (left or right angle)。
  - 六边形和八边形需要模板。
  - 免模板下单时，订单表上不要勾选 "Template Required"。
  - 异形窗扣减量为**所有边 1/4"**。
  - 拱形 — 若宽度至少为高度的两倍，可免模板下单。
  - 六边形和八边形 — 若各边相等，可免模板下单。
- **Ordered Size**：提供宽度和高度；宽度公差 **+0/–1/8"**；高度公差 **±1/8" up to +1/4"**；参见 Worksheet 完成所有测量。
- **Mount Type**：选择 IB；内嵌安装自动从订购宽度中扣减（参见标准扣减）。
- **Bottom Rail Option**：选择是/否。

### Worksheet（测量工作表）

工作表列出以下形状及所需测量项：Perfect and Imperfect Arch（宽度、高度）、Right/Left Quarter Circle（宽度、高度）、Circle（宽度、高度）、Oval（宽度、高度）、Right/Left Angle（宽度、左/右侧边）、Trapezoid（右侧缩减、左侧缩减、高度、底部宽度、顶轨宽度）、Inverted Trapezoid（右侧缩减、左侧缩减、高度、顶轨宽度、底部宽度）、Hexagon*（宽度、左/右侧边1、高度、左/右侧边2、左/右侧边3；*若各边不相等需要模板，需 **8 个测量值**）、Octagon**（宽度、左/右侧边1-4、高度；**若各边不相等需要模板，需 **10 个测量值**）、Perfect and Imperfect Extended Arch（宽度、高度、左/右侧边；侧边高度须 **≥ 6"**）、Rectangular Triangle（宽度、高度、左/右侧边）。

### Product Views

示意图展示了各异形窗（拱形/角形/圆形窗帘）的组件：Installation Bracket（安装支架）、Arrow Pin（箭头销）、Fabric U-Clip（面料U形夹）、Plastic Support（塑料支撑件）、Slot（槽口）、Face Fabric（正面面料）、Bottom Rail（底轨）、Magnetic Hold-Down Brackets（磁性固定卡扣）、Weight Lock（配重锁）、Magnetic Hold-Down Weight（磁性固定配重）、Bottom Rail Weight（底轨配重）。文中特别标注 Angle shading（角形窗帘）"(Not available in Canada)"（不适用于加拿大）。

---

## A Deux™（设计选项）（第36–39页）

A Deux™ 是仅限 PowerView® Gen 3 Automation 的设计选项 (Design Option)，由前部 light-filtering（柔光）Pirouette® 窗帘和后部 room-darkening（遮光）卷帘 (roller shade) 组成。

### Size Standards（尺寸标准）

| 项目 | Standard |
|---|---|
| Min. Width（最小宽度） | 16" |
| Min. Height（最小高度） | 18" |

**各面料系列 Max. Width / Max. Height（均为 5" 叶片）：**

| 面料系列 | Max. Width | Max. Height |
|---|---|---|
| Alustra Oakley 5" (PR82) | 96" | 96" |
| Alustra ClearView Apollo 5" (PR70) | 96" | 96" |
| Avant 5" (PR86) | 96" | 96" |
| ClearView Batiste Bamboo 5" (PR74) | 96" | 96" |
| ClearView Charmeuse 5" (PR90) | 96" | 96" |
| ClearView® Satin 5" (PR60) | 96" | 120" |
| ClearView Satin Metallic™ 5" (PR64) | 96" | 120" |
| ClearView Wren 5" (PR78) | 96" | 96" |
| Grant™ 5" (PR50) | 96" | 96" |
| Linen 5" (PR6) | 96" | 96" |
| Satin 5" (PR10) | 96" | 120" |
| Satin Metallic 5" (PR14) | 96" | 120" |
| Shantung 5" (PR22) | 96" | 96" |
| Thea 5" (PR94) | 96" | 96" |

¹ 注：PowerView® Gen 3 窗帘宽度小于 **23"** 时，需使用卫星电池包、C 号卫星电池杆或 18V DC 电源供应器。PowerView Gen 3 窗帘宽度小于 **22"** 且使用可充电电池杆时，仅支持卫星安装。

**备注：**
- 建议外装安装 (OB) room-darkening 窗帘每侧（含长度方向）预留 **3"** 重叠。
- 详见 Price Guide 中 Design Option Surcharges 部分的附加定价信息。

⚠️待核对：A Deux 的宽度限制脚注中数值为 **23"**（而非其他章节 PowerView Gen 3 的 **18"**），两处数字不同，均为原文照录，未做统一或修改。

### Design Option Specifications（设计选项规格）

**应用范围：**
- 前部 light-filtering Pirouette® 窗帘 + 后部 room-darkening 卷帘：
  - 提供更强的隐私性和光线控制。
  - 窗帘与卷帘独立操作 (operate independently)。
  - 后部卷帘面板 (back panel roller shade) 始终为白色 (always white)。
- 仅在 PowerView® Gen 3 Automation 中提供。

**排除项：**
- Back cover（背板）
- 带可充电电池杆的背板 (Back cover with rechargeable battery wand)
- End Mount (EB)（端装安装）
- 五金颜色替换 (Hardware color substitution)
- 左侧 PowerView Gen 3 电机与控制按钮
- 磁性固定卡扣
- Two-On-One Headrail
- 零底部裁片 Zero Bottom Panel（仅限外装安装）

**重要提示：** 根据修订版《美国国家有绳窗饰产品安全标准》，带绳环的窗饰需正确安装绳索张紧器才能正常运作，绳索张紧器不得以任何方式改装。

**补充信息：**
- PowerView Gen 3 窗饰宽度不超过 **48"** 时配一个电池杆/可充电电池杆；超过 **48"** 时配两个。
- 一个 18V DC 电源供应器可同时操作 PowerView Gen 3 窗饰的两个面板。
- PowerView Gen 3 电机和控制按钮始终位于顶盒右侧。

**可选功能 — 免费：** Extension brackets（延伸支架）

**附加费：** 详见 Price Guide 中 Design Option Surcharges；PowerView Gen 3 Automation 及配件另见 Price Guide。

**标配五金：** Installation brackets；垫块（仅限带顶盒安装电池杆的外装安装）

**安装要求：**

| 安装方式 | 项目 | 数值 |
|---|---|---|
| Inside Mount (IB) | 最小窗框深度 (Minimum casement depth) | 1" |
| Inside Mount (IB) | PowerView Gen 3 带顶盒安装电池杆 | 1 1/2" |
| Inside Mount (IB) | PowerView Gen 3 带顶盒安装可充电电池杆 | 1 7/8" |
| Inside Mount (IB) | 最小窗框深度，完全内嵌 | 4 1/4" |
| Inside Mount (IB) | PowerView Gen 3 带顶盒安装电池杆，完全内嵌 | 4 3/4" |
| Inside Mount (IB) | PowerView Gen 3 带顶盒安装可充电电池杆，完全内嵌 | 5 1/8" |
| Outside Mount (OB) | 最小安装表面深度 | 1" |
| Outside Mount (OB) | 推荐每侧宽度重叠 | 3" |

备注：
- 外装窗饰使用顶盒安装标准电池杆时，每个安装支架需 **3/4" 垫块**。
- 外装窗饰使用顶盒安装可充电电池杆时，每个安装支架需 **1" 垫块**。
- 若计划安装太阳能充电器，需考虑尺寸、位置和安装要求。

**成品尺寸：**

| 安装方式 | 项目 | 扣减/数值 |
|---|---|---|
| Inside Mount (IB) | Headrail unit width | –1/4" |
| Inside Mount (IB) | Shading height | –1/8" to +1/4" |
| Inside Mount (IB) | Fabric width | –3/4" |
| Outside Mount (OB) | Headrail unit width | 订购宽度 |
| Outside Mount (OB) | Shading height | –1/8" to +1/4" |
| Outside Mount (OB) | Fabric width | –7/16" |

备注：所有扣减以订购尺寸为基准，宽度可能有 +0/–1/8" 变化。

**内嵌安装边缘间隙 (Inside Mount Edge Gaps)（窗洞边缘到面料）：**

| 项目 | 数值 |
|---|---|
| PowerView® Gen 3，两侧 (Both sides) | 3/8" |

### Ordering Notes（订购须知）

另见 All Operating Systems 部分完成订单。

| 字段 | 说明 |
|---|---|
| Control System（控制系统） | 选择：PowerView® Gen 3 Automation |
| Control System Style（控制系统样式） | A Deux Dual Roller Same Lift |
| Fabric Type（面料类型） | 为 Pirouette 前面板选择任意 light-filtering 面料 |

### Product View – PowerView® Gen 3 Automation

示意图展示了 A Deux™（配 PowerView® Gen 3 Automation）的组件：Installation Bracket（前后各一）、Headrail（前后各一）、Headrail End Cap、Front Shading（前部窗帘）、Back Shading（后部卷帘）、Bottom Rail（前部底轨）、Bottom Rail End Cap（前部底轨端盖）、Back Bottom Rail End Cap（后部底轨端盖）。

---

## 五金颜色规则 (Hardware Colors)

⚠️待核对：文档全篇未见独立的 "Hardware Colors" 或类似标题章节，未提供顶盒/支架颜色与面料颜色匹配规则的说明。仅在以下两处与颜色相关：
1. EasyRise™ 的 **Cord Tensioner Color（绳索张紧器颜色）** 可选：048 Black、320 Rich Cream、661 White Tiara、689 Ash、903 Desert Gold（绳索将与张紧器颜色配套）。
2. A Deux™ 排除项中提到"五金颜色替换 (Hardware color substitution)"被排除，说明 A Deux 不支持五金颜色替换，但未说明标准情况下五金颜色如何确定或是否与面料颜色挂钩。
3. PowerView® Gen 3 Remote、Pebble®、Surface 等配件有各自可选颜色列表（见对应章节）。

除以上内容外，关于"顶盒颜色是否与面料颜色匹配"等一般性五金颜色规则，资料未提及。

---

## 儿童安全 (Child Safety) 相关内容

⚠️待核对：全文搜索未见独立标题为"Child Safety"的章节。与安全相关的内容仅见于以下两处，均涉及绳索张紧器 (cord tensioner)：

1. **EasyRise™ Operating System Specifications（第10页）：** "In accordance with the revised American National Standard for Safety of Corded Window Covering Products, EasyRise shades require proper mounting of the cord tensioner for the product to function properly. The cord tensioner should not be modified in any way."（根据修订版《美国国家有绳窗饰产品安全标准》，EasyRise 窗帘需正确安装绳索张紧器才能正常运作，绳索张紧器不得以任何方式改装。）

2. **A Deux™ Design Option Specifications（第37页）：** 相同表述，适用于带绳环的 A Deux 窗饰："shades with cord loops require proper mounting of the cord tensioner for the product to function properly. The cord tensioner should not be modified in any way."

除上述两处 Cord Tensioner（绳索张紧器）安全提示外，未发现其他关于"tensioner requirements"、"child safety features"等专门表述或强制性安全条款细节。

---

## 排除区 (Exclusions) 汇总

以下为文档中各章节列出的排除项/尺寸排除说明汇总：

| 操作系统/选项 | 排除项 |
|---|---|
| EasyRise™ | Two-On-One Headrail 作为端装安装 (EB) |
| PowerView® Gen 3 Automation | 左侧电机与控制按钮；磁性固定卡扣；Two-On-One Headrail；可充电电池杆的背板 |
| PowerView+™ Gen 3 Automation | Two-On-One Headrail；左侧电机与控制按钮；连接接口 |
| SoftTouch® Motorization | 磁性固定卡扣；Two-On-One Headrail；可充电电池杆的背板 |
| UltraGlide® | Two-On-One Headrail 作为端装安装 (EB) |
| Specialty Shapes, Non-Operable | 外装安装 (OB)；并排叶片对齐 |
| A Deux™ | 背板；带可充电电池杆的背板；端装安装 (EB)；五金颜色替换；左侧 PowerView Gen 3 电机与控制按钮；磁性固定卡扣；Two-On-One Headrail；零底部裁片（仅限外装安装） |

⚠️待核对：任务要求中提到"exclusions"可能包含"diagonal/rectangular exclusion zones with specific width x height combinations"（对角线/矩形排除尺寸区域，特定宽 x 高组合）。经逐页通读全文（第1–39页），未发现任何以"宽度 x 高度组合"形式给出的图形化尺寸排除区（例如某宽度范围内限制某高度范围的表格或图表）。文档中的尺寸限制均以 Min./Max. Width 和 Min./Max. Height 数值形式给出，未见交叉排除区域的具体数值。故此项资料未提及。

---

## 安装深度汇总表 (Mounting Depth 汇总)

下表整合全文出现的所有安装深度/安装要求数值，按操作系统与叶片尺寸（均为 5" Vane）分类：

| 操作系统 | Inside Mount 最小安装深度 | Inside Mount 完全内嵌 (Fully Recessed) | Outside Mount 最小平整垂直表面 | End Mount 最小安装表面深度 |
|---|---|---|---|---|
| EasyRise™ | 1" | 3 3/4" | 1" | 1 1/2" |
| PowerView® Gen 3 Automation | 1"（带顶盒可充电电池杆需 +1/2"） | 3 3/4"（带顶盒可充电电池杆需 +1/2"） | 1" | 1 1/2" |
| PowerView+™ Gen 3 Automation | 1" | 3 3/4" | 1" | 1 1/2" |
| SoftTouch® Motorization | 1"（带顶盒可充电电池杆需 +1/2"） | 3 3/4"（带顶盒可充电电池杆需 +1/2"） | 1" | 1 1/2" |
| UltraGlide® | 1" | 3 3/4" | 1" | 1 1/2" |
| Specialty Shapes, Non-Operable | 1 3/4"（最小窗框深度，无外装安装） | 2 7/8" | 资料未提及（不支持外装安装） | 不适用（仅限内嵌安装） |
| A Deux™（PowerView Gen 3） | 1"（标准）；1 1/2"（顶盒电池杆）；1 7/8"（顶盒可充电电池杆） | 4 1/4"（标准）；4 3/4"（顶盒电池杆）；5 1/8"（顶盒可充电电池杆） | 1" | 不适用（排除端装安装） |

补充说明：
- PowerView Gen 3 Automation 与 SoftTouch® Motorization 均需在标准安装深度基础上增加 **1/2"**，以容纳顶盒安装的可充电电池杆 (headrail-mounted rechargeable battery wand)。
- 所有 Outside Mount 均推荐每侧宽度重叠 **3"**（Specialty Shapes 除外，因其不支持外装安装）。
- SoftTouch® 完全内嵌收纳时，操作杆凸出 **3/8"**。

---

## 综合尺寸标准汇总 (Size Standards 综合对比)

下表汇总各操作系统的最小宽度/高度及适用矩形窗户最大尺寸（Applications 中提及的整体最大规格）：

| 操作系统 | Min. Width | Min. Height | Applications 中提及的最大矩形窗尺寸 |
|---|---|---|---|
| EasyRise™（标准） | 12" | 15" | 120" x 144" |
| EasyRise™ Two-On-One Headrail | 12"/panel | 15" | 144" x 144"（单面板最大宽度 72"） |
| PowerView® Gen 3 Automation | 13"¹ | 15" | 120" x 120" |
| PowerView+™ Gen 3 Automation | 13" | 15" | 120" x 120" |
| SoftTouch® Motorization | 15"¹ | 15" | 120" x 120" |
| UltraGlide®（标准） | 12" | 15" | 120" x 120" |
| UltraGlide® Two-On-One Headrail | 12"/panel | 15" | 144" x 96"（单面板最大宽度 72"） |
| Specialty Shapes, Non-Operable | 12"（各形状，Oval 除外见下） | 15" | 因形状而异，见前表 |
| A Deux™（PowerView Gen 3） | 16" | 18" | 资料未提及整体矩形窗最大尺寸（仅给出各面料 Max. Width/Height） |

¹ 见各章节脚注关于卫星电源/可充电电池杆宽度限制的说明。

各面料系列的具体 Max. Width / Max. Height 请参见前文各操作系统章节内的详细表格（因不同面料系列的最大宽高不同，无法用单一数值概括）。

---

## 术语对照小结 (Terminology Reference)

| 中文 | English |
|---|---|
| 内嵌安装 | Inside Mount (IB) |
| 外装安装 | Outside Mount (OB) |
| 端装安装 | End Mount (EB) |
| 完全内嵌 | Fully Recessed |
| 叶片 | Vane |
| 顶盒 | Headrail |
| 遮光度 | Opacity |
| 柔光 | Light-Filtering |
| 遮光 | Room-Darkening |
| 两联一顶盒 | Two-On-One Headrail |
| 零底部面料裁片 | Zero Bottom Fabric Panel |
| 儿童安全 | Child Safety |
| 绳索张紧器 | Cord Tensioner |

---

「价格表见本文件末尾附录」


---

# 附录:官方价格表(程序化提取,数字以此为准)

> 来源:Hunter Douglas US Price Guide (JAN 2026)。表格为 USD 标价(list price),实际零售价以经销商折扣为准。


<!-- pricing: pirouette -->
# pirouette — 官方价格数据
来源: HD_PG_US_JAN2026_01212026.pdf 页码: 109-114
Pirouette pricing extracted from HD_PG_US_JAN2026 pages 109-114.

### 价格表 PIR-LF1
- 适用面料: Avant 5"  (代码: PR86)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 546 | 615 | 684 | 820 | 951 | 1185 | 1329 | 1470 | 1653 | 1831 |
| **48** | 615 | 684 | 763 | 923 | 1096 | 1329 | 1620 | 1675 | 1881 | 2087 |
| **60** | 659 | 758 | 848 | 1030 | 1236 | 1470 | 1809 | 1871 | 2162 | 2397 |
| **72** | 718 | 833 | 934 | 1157 | 1391 | 1614 | 1988 | 2052 | 2430 | 2630 |
| **84** | 769 | 893 | 1003 | 1266 | 1527 | 1762 | 2171 | 2241 | 2642 | 2865 |
| **96** | 838 | 963 | 1100 | 1391 | 1648 | 1899 | 2351 | 2430 | 2846 | 3092 |
| **108** | 929 | 1076 | 1220 | 1487 | 1772 | 2047 | 2531 | 2619 | 3058 | 3322 |
| **120** | 987 | 1140 | 1299 | 1614 | 1964 | 2305 | 2855 | 2922 | 3297 | 3692 |

### 价格表 PIR-LF2
- 适用面料: ClearView Satin 5", ClearView Satin Metallic™ 5", Satin 5", Satin Metallic 5"  (代码: PR60, PR64, PR10, PR14)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 649 | 730 | 813 | 973 | 1128 | 1406 | 1577 | 1745 | 1961 | 2173 |
| **48** | 730 | 813 | 905 | 1096 | 1300 | 1577 | 1923 | 1989 | 2233 | 2477 |
| **60** | 783 | 900 | 1007 | 1222 | 1467 | 1745 | 2147 | 2220 | 2567 | 2843 |
| **72** | 852 | 989 | 1108 | 1373 | 1651 | 1915 | 2359 | 2436 | 2884 | 3121 |
| **84** | 913 | 1060 | 1191 | 1502 | 1813 | 2090 | 2576 | 2660 | 3135 | 3400 |
| **96** | 995 | 1143 | 1306 | 1651 | 1955 | 2254 | 2790 | 2884 | 3378 | 3669 |
| **108** | 1103 | 1277 | 1448 | 1766 | 2104 | 2429 | 3003 | 3108 | 3629 | 3941 |
| **120** | 1172 | 1353 | 1542 | 1915 | 2330 | 2734 | 3388 | 3467 | 3912 | 4382 |
| **132** | 1306 | 1502 | 1727 | 2152 | 2620 | 3053 | 3786 | 3900 | 4415 | 4896 |
| **144** | 1413 | 1651 | 1889 | 2364 | 2910 | 3359 | 4171 | 4287 | 4849 | 5443 |

### 价格表 PIR-LF3
- 适用面料: ClearView Batiste Bamboo 5", Linen 5", Thea 5"  (代码: PR74, PR6, PR94)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 747 | 840 | 934 | 1122 | 1301 | 1621 | 1816 | 2012 | 2261 | 2503 |
| **48** | 840 | 934 | 1045 | 1262 | 1498 | 1816 | 2218 | 2294 | 2573 | 2856 |
| **60** | 903 | 1035 | 1160 | 1411 | 1692 | 2012 | 2475 | 2558 | 2956 | 3278 |
| **72** | 980 | 1137 | 1278 | 1582 | 1903 | 2209 | 2723 | 2809 | 3325 | 3597 |
| **84** | 1050 | 1222 | 1373 | 1730 | 2089 | 2411 | 2969 | 3066 | 3613 | 3918 |
| **96** | 1146 | 1317 | 1505 | 1903 | 2255 | 2598 | 3214 | 3325 | 3896 | 4233 |
| **108** | 1271 | 1472 | 1668 | 2035 | 2425 | 2800 | 3463 | 3582 | 4185 | 4543 |
| **120** | 1347 | 1559 | 1778 | 2209 | 2685 | 3153 | 3905 | 3996 | 4512 | 5051 |

### 价格表 PIR-LF4
- 适用面料: ClearView Charmeuse 5", ClearView Wren 5", Grant™ 5", Shantung 5"  (代码: PR90, PR78, PR50, PR22)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 |
|---|---|---|---|---|---|---|---|---|
| **36** | 822 | 924 | 1027 | 1236 | 1432 | 1784 | 1998 | 2215 |
| **48** | 924 | 1027 | 1149 | 1389 | 1647 | 1998 | 2439 | 2524 |
| **60** | 995 | 1138 | 1277 | 1550 | 1860 | 2215 | 2723 | 2815 |
| **72** | 1079 | 1250 | 1405 | 1741 | 2093 | 2427 | 2995 | 3090 |
| **84** | 1156 | 1345 | 1510 | 1906 | 2300 | 2652 | 3264 | 3374 |
| **96** | 1260 | 1448 | 1656 | 2093 | 2480 | 2858 | 3538 | 3658 |

### 价格表 PIR-LF5
- 适用面料: Alustra1 ClearView® Apollo™ 5", Alustra1 Oakley 5"  (代码: PR70, PR82)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 |
|---|---|---|---|---|---|---|---|---|
| **36** | 903 | 1016 | 1129 | 1357 | 1574 | 1960 | 2196 | 2434 |
| **48** | 1016 | 1129 | 1263 | 1526 | 1810 | 2196 | 2680 | 2774 |
| **60** | 1093 | 1251 | 1403 | 1703 | 2044 | 2434 | 2991 | 3091 |
| **72** | 1184 | 1374 | 1544 | 1913 | 2300 | 2667 | 3291 | 3396 |
| **84** | 1270 | 1478 | 1659 | 2093 | 2528 | 2913 | 3586 | 3707 |
| **96** | 1384 | 1592 | 1820 | 2300 | 2725 | 3140 | 3887 | 4019 |

### 价格表 PIR-RD1
- 适用面料: Avant 5"  (代码: PR88)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 602 | 677 | 754 | 903 | 1048 | 1305 | 1464 | 1623 | 1821 | 2016 |
| **48** | 677 | 754 | 841 | 1017 | 1206 | 1464 | 1786 | 1847 | 2074 | 2300 |
| **60** | 728 | 835 | 934 | 1136 | 1362 | 1623 | 1991 | 2061 | 2382 | 2640 |
| **72** | 791 | 916 | 1029 | 1275 | 1532 | 1778 | 2192 | 2262 | 2677 | 2896 |
| **84** | 846 | 986 | 1105 | 1394 | 1683 | 1939 | 2389 | 2469 | 2910 | 3156 |
| **96** | 923 | 1061 | 1212 | 1532 | 1815 | 2090 | 2590 | 2677 | 3135 | 3408 |
| **108** | 1023 | 1186 | 1344 | 1639 | 1954 | 2256 | 2787 | 2885 | 3369 | 3658 |
| **120** | 1085 | 1256 | 1431 | 1778 | 2162 | 2539 | 3144 | 3219 | 3633 | 4067 |

### 价格表 PIR-RD2
- 适用面料: ClearView Satin 5", ClearView Satin Metallic™ 5", Satin 5", Satin Metallic 5"  (代码: PR62, PR66, PR12, PR16)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 715 | 804 | 895 | 1072 | 1243 | 1549 | 1738 | 1926 | 2161 | 2393 |
| **48** | 804 | 895 | 998 | 1208 | 1432 | 1738 | 2120 | 2193 | 2462 | 2730 |
| **60** | 864 | 991 | 1108 | 1348 | 1616 | 1926 | 2364 | 2445 | 2826 | 3133 |
| **72** | 939 | 1087 | 1221 | 1513 | 1818 | 2109 | 2600 | 2685 | 3177 | 3437 |
| **84** | 1005 | 1171 | 1311 | 1655 | 1997 | 2302 | 2836 | 2930 | 3454 | 3745 |
| **96** | 1096 | 1259 | 1439 | 1818 | 2154 | 2481 | 3073 | 3177 | 3720 | 4044 |
| **108** | 1214 | 1407 | 1595 | 1946 | 2319 | 2677 | 3308 | 3424 | 3997 | 4342 |
| **120** | 1288 | 1491 | 1700 | 2109 | 2567 | 3013 | 3731 | 3820 | 4311 | 4826 |
| **132** | 1439 | 1655 | 1899 | 2371 | 2885 | 3364 | 4170 | 4297 | 4863 | 5392 |
| **144** | 1557 | 1818 | 2080 | 2600 | 3210 | 3701 | 4592 | 4721 | 5342 | 5999 |

### 价格表 PIR-RD3
- 适用面料: ClearView Batiste Bamboo 5", Linen 5", Thea 5"  (代码: PR76, PR8, PR96)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 | 108 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|
| **36** | 822 | 924 | 1027 | 1236 | 1432 | 1784 | 1998 | 2215 | 2488 | 2753 |
| **48** | 924 | 1027 | 1149 | 1389 | 1647 | 1998 | 2439 | 2524 | 2834 | 3142 |
| **60** | 995 | 1138 | 1277 | 1550 | 1860 | 2215 | 2723 | 2815 | 3254 | 3606 |
| **72** | 1079 | 1250 | 1405 | 1741 | 2093 | 2427 | 2995 | 3090 | 3658 | 3956 |
| **84** | 1156 | 1345 | 1510 | 1906 | 2300 | 2652 | 3264 | 3374 | 3975 | 4312 |
| **96** | 1260 | 1448 | 1656 | 2093 | 2480 | 2858 | 3538 | 3658 | 4285 | 4656 |
| **108** | 1398 | 1620 | 1837 | 2237 | 2669 | 3080 | 3809 | 3941 | 4605 | 4999 |
| **120** | 1483 | 1715 | 1956 | 2427 | 2951 | 3468 | 4296 | 4398 | 4964 | 5554 |

### 价格表 PIR-RD4
- 适用面料: ClearView Charmeuse 5", ClearView Wren 5", Grant™ 5", Shantung 5"  (代码: PR92, PR80, PR52, PR24)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 |
|---|---|---|---|---|---|---|---|---|
| **36** | 904 | 1017 | 1131 | 1357 | 1575 | 1961 | 2198 | 2435 |
| **48** | 1017 | 1131 | 1263 | 1530 | 1813 | 2198 | 2686 | 2776 |
| **60** | 1092 | 1251 | 1404 | 1706 | 2046 | 2435 | 2995 | 3097 |
| **72** | 1190 | 1376 | 1545 | 1915 | 2304 | 2672 | 3293 | 3401 |
| **84** | 1273 | 1479 | 1661 | 2096 | 2529 | 2919 | 3590 | 3710 |
| **96** | 1386 | 1592 | 1820 | 2304 | 2728 | 3143 | 3894 | 4023 |

### 价格表 PIR-RD5
- 适用面料: Alustra1 ClearView® Apollo™ 5", Alustra1 Oakley 5"  (代码: PR72, PR84)
- 行=高度(英寸), 列=宽度(英寸), 单位=USD 标价

| 高\宽 | 24 | 30 | 36 | 48 | 60 | 72 | 84 | 96 |
|---|---|---|---|---|---|---|---|---|
| **36** | 991 | 1115 | 1240 | 1487 | 1726 | 2149 | 2409 | 2667 |
| **48** | 1115 | 1240 | 1384 | 1676 | 1987 | 2409 | 2944 | 3042 |
| **60** | 1198 | 1371 | 1538 | 1869 | 2242 | 2667 | 3281 | 3392 |
| **72** | 1304 | 1508 | 1693 | 2099 | 2524 | 2929 | 3609 | 3726 |
| **84** | 1395 | 1620 | 1819 | 2297 | 2770 | 3198 | 3933 | 4065 |
| **96** | 1519 | 1745 | 1994 | 2524 | 2989 | 3443 | 4266 | 4408 |

### fabric_to_chart (面料→价格表 映射)
- PR86 → PIR-LF1
- PR60 → PIR-LF2
- PR64 → PIR-LF2
- PR10 → PIR-LF2
- PR14 → PIR-LF2
- PR74 → PIR-LF3
- PR6 → PIR-LF3
- PR94 → PIR-LF3
- PR90 → PIR-LF4
- PR78 → PIR-LF4
- PR50 → PIR-LF4
- PR22 → PIR-LF4
- PR70 → PIR-LF5
- PR82 → PIR-LF5
- PR88 → PIR-RD1
- PR62 → PIR-RD2
- PR66 → PIR-RD2
- PR12 → PIR-RD2
- PR16 → PIR-RD2
- PR76 → PIR-RD3
- PR8 → PIR-RD3
- PR96 → PIR-RD3
- PR92 → PIR-RD4
- PR80 → PIR-RD4
- PR52 → PIR-RD4
- PR24 → PIR-RD4
- PR72 → PIR-RD5
- PR84 → PIR-RD5

### operating_system_surcharges
- **EasyRise**: {"type": "flat", "amount": 0}
- **UltraGlide**: {"type": "flat_per_shading", "amount": 80}
- **SoftTouch**: {"type": "flat_per_shading", "amount": 200}
- **SoftTouch_RBW**: {"type": "flat_per_shading", "amount": 270}
- **SpecialtyShapes_NonOperable**: {"type": "flat_per_shading", "amount": 200}
- **PowerView_Gen3**: {"type": "tiered_grid", "tiers": {"small": {"amount": 440}, "medium": {"amount": 515}, "large": {"amount": 595}}}
- **PowerView_Gen3_RBW**: {"type": "tiered_grid", "tiers": {"small": {"amount": 510}, "medium": {"amount": 600}, "large": {"amount": 690}}}
- **PowerView_Plus_Gen3**: {"type": "tiered_grid", "tiers": {"small": {"amount": 505}, "medium": {"amount": 595}, "large": {"amount": 680}}}

### design_option_surcharges
- **two_on_one_headrail**: {"type": "formula", "spec": "Price as two individual + add together"}

