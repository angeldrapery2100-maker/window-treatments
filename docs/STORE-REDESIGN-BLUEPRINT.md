# 商店体系重设计蓝图 — 五类商品的后台上架流程 + 前台商品页模板

日期 2026-07-11 · 目标：上架快且不出错（后台）、美观易懂有购买冲动（前台）、五类各有独特风格。
执行前必读 AGENTS.md + docs/aapp-engine-wiring.md。定价引擎已 1:1 对齐 AAPP，本蓝图只动"壳"。

---

## 一、五类商品本质分析（决定一切设计）

| 类别 | 定价本质 | 客户决策链 | 决策焦点 | 引擎 |
|---|---|---|---|---|
| ① Drapery 布帘 | 二维定制（宽×高→解褶算料） | 最长：尺寸→款式→衬布→开合→配杆 | 布的质感 + 遮光效果 | aapp `drapery` ✅已接 |
| ② Drapery 纱帘 | 同布帘引擎的纱层公式（sheer_only） | 短：尺寸→款式→开合 | 透光氛围 | ⚠️ 现用旧 3.5x 模型，**应迁移到 aapp `drapery` + `aapp_composition='sheer_only'`**（AAPP 里纱=drapery 纱层，spec §3.4） |
| ③ Hardware 杆/轨 | 一维（长度）：起步价+每尺；SOMFY 查表 | 中：杆型→finish→装饰头→长度 | 颜值（finish/finial）+ 电动 | aapp `drapery_hardware` / `somfy_track` ✅已接 |
| ④ Luma Shade | 查表类（$/sqm + 帘头盒$/m + 控制加价） | 中：颜色→尺寸→帘头盒→控制 | 颜色 + 智能控制 | aapp `luma_shade` ✅已接 |
| ⑤ 固定价配件 | 纯 SKU 固定价（遥控/hub/绑带/挂钩） | 最短：选变体→数量 | 即买即得 | **无引擎**——base_price 直接定价（现有 stock_qty 库存机制可用）；对应 AAPP netPrice 目录 |

关键结论：⑤ 是当前系统缺失的商品类型（需新增 product type `accessory`）；② 需要一次引擎迁移；①③④ 引擎已就绪，缺的是后台流程和前台呈现。

---

## 二、后台架构重设计

### 2.1 核心概念：类别蓝图（Category Blueprint）
一个注册表（代码内常量 `apps/web/src/lib/categoryBlueprints.ts`），每类定义：
`{ engine, 必填 params 清单, 选项 scaffold（自动生成、引擎 key 锁定）, 默认包裹规则, 前台模板 key, 试算验收样例 }`。
后台一切"自动生成/校验"都从蓝图读——今天 drapery 编辑器里手写的预设逻辑收敛到这里，五类共用一套机制。

### 2.2 上架流程：从"填表"改为"四步向导"
`admin/products/create` 重做为向导（编辑页保留现有 tab，但 tab 内容由蓝图驱动）：

- **Step 1 选类别**：五张大卡（布帘/纱帘/杆轨/Luma/配件，各配示例图）。选定即锁定 engine + scaffold。
- **Step 2 基础与图片**：名称、描述、主图/图集（沿用现有 ImageManager）、store 分类。
- **Step 3 类别专属配置**（差异核心，全部结构化输入，禁止裸 JSON）：
  - 布帘：面料默认价/幅宽 → 颜色列表（单输入，已做）→ 款式勾选（已做）→ 配杆商品多选（已做）→ 纱交叉销售自动（已做）。衬布/手工费提示"走全局参数"。
  - 纱帘：同布帘减去衬布/配杆；款式勾选限打褶+蛇形；composition 固定 sheer_only。
  - 杆轨：价格模型二选一（起步+每尺 / 纯每尺）→ finish 颜色列表（单输入+图）→ finial 列表（名称+价+图）→ 长度范围；SOMFY 型独立蓝图（track_type/motor 勾选，价表内置）。
  - Luma：variant 单选 → 面料系列码勾选（从内置 SHADE_CATALOG 表选，显示 $/sqm，可覆盖价）→ cassette 勾选 → 控制方式勾选（motorized 展开电机/遥控/hub 子选）→ 最大尺寸只读显示。
  - 配件：售价、划线价(可选)、库存 stock_qty、变体选项（颜色等，单输入 value=label）、"常配商品"引用（成套推荐）。
- **Step 4 试算与发布**：实时试算卡（已做，扩展到全类别）+ 蓝图内置验收样例一键跑（如布帘 100×96@$30 应=$660，不匹配红字警告）→ 保存为草稿 / 发布。
- 全程右侧固定"前台卡片实时预览"（名称+主图+from $ 起价）。

### 2.3 全局定价库（Pricing Library）
新后台页 `admin/pricing-library`，对应 AAPP 的 library 概念，把散落配置集中：
衬布/手工/镶边（已有 drapery_pricing 组，挪入此页）· Luma 面料 $/sqm 总表（当前内置常量，做成 site-settings 组可覆盖）· 电机/遥控/hub 价表 · SOMFY 系数。每项都注明"与 AAPP library.xxx 对应，两边同步"。

### 2.4 商品状态
利用现有 is_active 之上加 `status: draft/active`（原差距分析 P1 项）：向导保存默认 draft，发布才 active；编辑页加"以客户视角预览"链接（预览路由带 ?preview=token 可看 draft）。

---

## 三、前台商品页模板体系

### 3.1 机制
products 表加 `template_key`（建品时由蓝图默认，可覆盖）。`store/[id]` 按 template_key 分发到五个模板。共同骨架（抽成 shared 组件）：图区+配置区两栏 → 移动端图上配置下 + **底部 sticky 价格条**（当前价 + Add to Cart，始终可见——移动端转化关键）→ 信任条（Ships in ~2 weeks · LA workroom · secure checkout）→ 样品卡（面料类）→ How-to-measure 折叠指南 → 评价区 → RelatedProducts。

### 3.2 五套模板风格（各自独特）

**① DraperyTemplate —「面料剧场」**（转化优先级最高）
暖白底 + serif 标题。图区：大图轮播 = lifestyle 图 + 布纹理特写 + 褶型细节。配置区改可视化：颜色=**色卡图网格**（选项值图片，选中描边放大）；款式=**SVG 示意图卡**（2褶/3褶/蛇形的简笔褶型侧视图，一眼看懂）；衬布=三张小图标卡（透光/柔光/全遮 + 一句话）；配杆卡片（已有）；纱交叉销售（已有）。底部 "See this fabric in a real home" 链接 gallery 对应视频。

**② SheerTemplate —「光」**
最浅最透的视觉：大量留白、细字重。首图用**白天/傍晚透光对比**（左右滑块或双图并列）。决策链短→配置区一屏完成。文案强调氛围（"soft daylight, gentle privacy"）。交叉销售反向：Pair with drapery。

**③ HardwareTemplate —「五金精品」**
深色底（呼应品牌深空灰）金属质感。finish=**金属色圆形色板**为主选择器（选中后主图切换对应 finish 产品图）；finial=大图横向对比条；长度=输入框+常见预设快捷键（48/72/96/120/144"）；"Pairs with pinch pleat & ripplefold drapery" 示意。SOMFY 电动款：嵌入演示视频 + track_type/fullness 图示。

**④ LumaTemplate —「智能简洁」**
纯白科技风。颜色色卡置顶（首要决策）；cassette/控制方式=**图标卡**（open roll/round/square 剖面小图；链条/无绳/电动图标，cordless 带 "child-safe" 徽章）；电动选中时展开电机/遥控/hub 子卡 + 一段演示视频位；双层帘（dual）加前后层小动画/双图切换。尺寸区显著标注 max 118"。

**⑤ AccessoryTemplate —「标准电商」**
最简：图 + 价 + 变体色板 + 数量 + Add to Cart 一屏完成；下方 "Works with" 成套推荐（引用常配商品）；支持划线价促销位。列表页配件走小卡密排网格。

### 3.3 商店列表页配合
分类 tab（Drapery / Sheer / Hardware / Luma Shades / Accessories）+ 每卡"from $xxx" 起价角标（starting-prices API 已有）+ 类别色微标识与模板呼应。

---

## 四、实施路线（分四期，每期独立可上线）

- **P1 基建**（约 3-5 天）：categoryBlueprints.ts + accessory 商品类型（DB product_types 插行 + 定价走 base_price + AccessoryTemplate + 结算/工单跳过引擎）+ 建品向导骨架 + template_key 分发机制 + 商品 draft/active。
- **P2 转化大头**（约 1 周）：DraperyTemplate 可视化选择器（色卡图/款式 SVG/衬布图标卡）+ 移动端 sticky 价格条（全模板共用）+ 商店分类 tab + 起价角标。
- **P3 补全**（约 1 周）：LumaTemplate + HardwareTemplate + SOMFY 演示位；**sheer 引擎迁移**（aapp sheer_only，迁移前用 AAPP 对 3 组价，老商品切换需人工确认）。
- **P4 打磨**：SheerTemplate 光主题、Pricing Library 后台页、向导 Step4 验收样例自动比对、预览 token。

每期军规不变：tsc + vitest 全绿；定价公式零改动；两条核价链路同步；商品页零中文。

## 五、给下个执行模型的注意事项

- 现有 DraperyProduct/SheerProduct/ShadeProduct/HardwareProduct 是模板的演进起点，不要从零重写——先抽 shared 骨架再分化风格。
- accessory 是唯一需要动 calcServerTotals 认知的类别：它走 basePrice>0 的既有路径（min-floor + 5x cap），天然安全，别给它接引擎。
- sheer 迁移是本蓝图唯一"改价"动作：迁移那天必须和 Eddie 在 AAPP 里对价确认后才切，且逐商品切换（aapp_engine 开关已支持灰度）。
- 款式 SVG 示意图：手绘简笔即可（几条褶线），不要用照片占位。
- 色卡图片来源：选项值已支持 image_url（OptionsManager 有图片字段基础），缺的只是前台渲染。
