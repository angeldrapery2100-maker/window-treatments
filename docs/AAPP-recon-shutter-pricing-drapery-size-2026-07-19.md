# AAPP 调研:Shutter 报价 + 布帘推荐尺寸规则(为③测量向导)

> 2026-07-19,只读调研 `/Volumes/SSD2T/Projects/AAPP`(未改动 AAPP 任何文件)。
> 来源:`app-catalog.js`(CS_* 表 + `csCalcShutterPrice` L1026)、`app-quotes-blinds.js`(尺寸模式 L3760+)、
> `app-quotes-drapery.js`(`draperyRecommendSize` L400、`draperyResolveMeasurementContext` L355)、
> `app-quotes-catalog.js`(`calcProductInstallAmount` L356)、`functions/index.js`(服务端镜像 `_priceJcCambridgeShutter` L3678+,
> 校准记录 `PHASE-C-3-CAMBRIDGE-SHUTTER-CALIBRATION.md` 4/4 通过)、`drapery_calc_logic_zh.md`(v299,推荐尺寸章节与现行代码核对一致,现行代码多了五金 return/饰头扣减)。

---

## 一、Shutter(jc_cambridge_shutter)报价模型 — 完整

### 1. 计费尺寸
- 两种输入模式:`window_size`(量窗尺寸)和 `finished_size`(成品尺寸)。
- **window_size 模式:计费尺寸 = 窗宽 + frameAddW,窗高 + frameAddH,frameAdd 默认各 +3"**(报价单里可改)。
- French Door 款式强制 `net_frame_to_frame`(成品尺寸即面板尺寸,不加框)。
- 框型库 `CS_FRAME_DEFAULTS` 有 21 种框(L/Z/Décor,含 inside/outside 限制和各自的 pricing_add),但报价 UI 实际用的是统一的 frameAddW/H=3 默认值,框型选择只影响工单,不改计费尺寸。

### 2. 基础价(面积 × 材质费率)
```
area = (计费宽 × 计费高) / 144        // sqft
base = area × rate
```
材质费率($/sqft,内部口径 = 成本×2):

| materialId | 费率 | 说明 |
|---|---:|---|
| poly_vinyl | 20.50 | Poly-Vinyl 铝芯 |
| hardwood | 20.50 | |
| paulownia | 21.50 | 梧桐木纹 |
| basswood + 漆色(paint) | 21.90 | 椴木,按颜色类型分 |
| basswood + 染色(stain) | 25.50 | 14 个标准 stain 色全部只限 basswood |

- 颜色卡:18 标准漆色 + 14 标准染色(JC 色号);部分深漆色不适用 poly_vinyl;stain 全部只限 basswood。
- `defaultRate` 21.90;**`minAreaSqFt: 9.0` 有定义但客户端和服务端计算都没有引用(未生效)**——网站向导要不要强制 9 sqft 起价,需 Eddie 拍板。

### 3. 按面积加价(PSF,金额 = area × 费率)
| 项 | $/sqft | 触发 |
|---|---:|---|
| Liberty Arch / Raised Panel / Solid Panel | 1.00 / 2.00 / 2.00 | panelSpecialty |
| Hidden Tilt Rod | 0.50 | tiltControl(默认就是 hidden) |
| Invisible/Integrated Tilt | 2.00 | tiltControl |
| Double Hung | 2.50 | 开关或 style=double_hung(二选一,不叠加) |
| Corner Divider Rail | 0.50 | dividerRailEnabled |
| Buildout <1" / 1–3" | 1.00 / 2.00 | buildoutType |
| Bay Post / Corner Post / Sill Cap | 2.00 / 2.00 / 2.00 | 由款式自动带出 |
| Fixed Louvers / Hidden Hinge | 1.00 / 1.00 | (表中存在,报价 UI 未暴露) |
| Seamless Frame Corner | 5.00 | (同上) |

### 4. 按件加价(EA,固定金额)
| 项 | $ | 触发 |
|---|---:|---|
| Bi-Fold / By-Pass Track | 240 | 款式 bi_fold / by_pass_* 自动带出 |
| Specialty Shapes | 228 | 款式 specialty_shape 自动带出 |
| French Door Cut-Out | 192 | frenchCutOutEnabled |
| Custom Paint / Custom Stain | 228 / 252 | 每个颜色 |
| Custom Frame | 216 | (表中存在) |
| Rake | 192 | (表中存在) |
| Knob / Lock | 6 / 18 | 开关 |

### 5. 汇总与安装
```
subtotal = round( (base + Σpsf×area + Σea) × qty , 2位 )
安装费   = 每件固定 $20(2026-07-16 Eddie 把所有 shade/blind 安装费拍平为 $20,尺寸加价全部清零)
         // subtotal 不含安装(_subtotalExcludesInstall: true)
```
校准参照(服务端 4/4 零漂移):basswood_paint 36×60 standard = **$328.50**;basswood_stain 48×72 +knob+lock+custom_stain = **$888**;hardwood 60×84 double_hung+buildout_1_3+divider+raised_panel = **$962.50**;poly_vinyl 40×60 bay_window ×2 = **$750**。

### 6. 配置约束(向导可直接复用)
- 面板数:每片 8" ≤ W/N < 36",N ∈ 1–6(`validPanelCounts`)。
- 叶片:2.5" / 3.5" / 4.5";basswood/paulownia 有 flat+elliptical,hardwood 只有 elliptical,poly_vinyl 无叶片样式选择。
- 库覆盖:`library.cambridgeShutter.pricingRates/colors` 管理员可改,改后以库为准(网站接的话要走 AAPP 数据源同步,同面料库模式)。

---

## 二、布帘推荐尺寸规则(draperyRecommendSize)— 完整

### 0. 测量上下文
- 尺寸源优先级:外框(outer)> 内框(inner)> French Door 成品尺寸(不加净空)。
- 四向净空 clearL/R/T/B;**左右净空填 0 视为"没量",按无限处理**(推荐宽不设上限)。
- 楼板到天花 H_fc = min(墙高 L/C/R 三点);没量墙高则 = clearB + 窗高 + clearT。
- 离地净空 floor 默认 **0.5"**。
- 五金占位:装了杆件配置时,左右各扣 return + 饰头长度(T_avail = 总可用宽 − 左右五金占位)。

### 1. 推荐宽(打褶 pleated · 对开 split)
迭代收敛(≤15 轮),堆叠宽是成品宽的函数:
```
F₀ = W(窗宽)
每轮: bcT = 二舍三入(F × 3 / 55)      // 布卷宽数估算,小数 <0.3 舍去否则进位
      bcS = bcT / 2                    // 单侧
      plts = floor(bcS)×5 + (bcS 小数 ≥0.4 ? 2 : 0)   // 单侧褶数
      Sn = plts × 0.7                  // 单侧堆叠宽(每褶 0.7")
      Fn = W + 2×Sn
收敛后 F 即推荐成品宽;若单侧堆叠超净空或 F 超 T_avail → 退化为 T_avail − 1
```

### 2. 推荐宽(打褶 · 单开)
```
base = W + min(24, 净空侧)            // 目标单侧堆叠 24"
同样迭代(≤10 轮),堆叠全部算一侧,受实际净空钳制;超 T_avail−1 则取 T_avail−1
```

### 3. 推荐宽(波浪 ripple)
```
参数(styleKey): cn_6cm pulley 2.3622 / cn_7cm 2.76 / us_60 2.625 / us_80 2.375 / us_100 2.125 / us_120 1.875
K=0.66, C=3.0
对开: N = 向上取偶(W / (2×(P−K)));堆叠 S=N×K+C;推荐宽 = 2×(N×P+C),超限退 T_avail−1
单开: base = W+24,净空 <24 时 = min(W+净空, T_avail−1)
```

### 4. 推荐高
```
motorized_ceiling_track : recH = H_fc − 1.25 − floor − 五金高度偏移
ceiling_track           : recH = H_fc − 0.80 − floor − 五金高度偏移
墙装/落地杆              : base = H_fc − 4.00 − floor − 五金高度偏移
    若未量墙高 且 20 ≤ 窗顶到天花 ≤ 40:recH = base + 窗顶到天花/2(杆装中点)
    否则 recH = base
最终宽取整英寸,高取到 1/4"
```

### 5. 与网站现有口径的对照(需留意)
- 网站 AI 话术"墙装杆 ≈ 天花高 − 4.5″":与 AAPP `−4.0 − floor(0.5)` 数值吻合 ✓。
- 网站话术"窗顶到天花 >30″ 才中点装杆" vs AAPP"20–40″ 且未量墙高时 +gap/2"——**区间和条件不同**,向导应以 AAPP 为准(问 Eddie 确认)。
- 网站话术"每侧 +10″ 堆叠"是粗略经验值;AAPP 是精确迭代算法。向导用 AAPP 算法,聊天话术保持粗略即可。

---

## 三、给③测量向导的落地建议(待 Eddie 确认后动工)

1. **布帘推荐尺寸**:把 `draperyRecommendSize` 按上面规则移植到 `packages/shared`(纯函数 + 冻结用例,和 pricing 引擎同待遇——AAPP 是唯一真源,网站照抄);向导输入 = 窗宽/高、四向净空(可选)、墙高(可选)、杆型、开合方式、打褶/波浪。
2. **Shutter 报价**:公式简单可完整复刻(材质费率 + PSF/EA 表 + qty + $20 安装),但表值属于内部售价口径(成本×2),放到面向客户的网站前需 Eddie 确认:(a) 是否公开 shutter 在线报价,还是像 HD 一样只给参考区间;(b) minAreaSqFt 9.0 未生效是否本意;(c) 费率来源走 AAPP library 同步还是静态快照。
3. 向导交互建议:聊天里由 AI 收集测量值(配合②的照片),算完直接写入 Home Project(upsert_room_item 已有);shutter 若不上线报价,则给区间+导流免费上门。

—— 调研完毕,AAPP 零改动。
