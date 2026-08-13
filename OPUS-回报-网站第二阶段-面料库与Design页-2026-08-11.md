# OPUS 回报 — 网站第二阶段:面料库 + Design 页(2026-08-11)

**门槛**:`tsc --noEmit` exit 0 · `packages/shared` vitest 92/92 全绿 · `apps/web` vitest 199/199 全绿(新增 24 个用例)。
**提交**:`7d2ab77` → `90a7398` → `5d901ab` → `290fe24`,四个独立 commit,**未 push**(推送是你的动作)。
**文档**:`docs/fabric-library-pipeline.md`(三步管线的完整操作手册)。

---

## recon(与任务书不符的三处,先说)

1. **第一阶段 T1–T5 在仓库里没有落地**。`git log` 无对应 commit,`lib/estimateCopy.ts` 不存在,`leadScoring.ts` 仍缺 `store_estimate` 权重,`/store` 也没有双轨定位条。按你的拍板,我**只**创建了 `lib/estimateCopy.ts`,内容与第一阶段任务书 T3 给的代码逐字一致(并行的 P1 session 之后落地时内容相同,不会打架)。T1/T2/T4/T5 我没碰。
2. **`outputs/` 与 `AAPP/` 当时不在会话可访问范围内**,我请求并获得了这两个目录的授权后才开工。
3. **蓝图 §五说 P3 面料库 MVP 是「精选 50–150 款」**,本任务书要求全量 10,845 款 + 客户端索引。按任务书做的(它更新、且是你 2026-08-11 拍板的),但两份文件现在不一致,建议你顺手把蓝图那行改掉。

---

## 任务 A — 面料数据管线

**做了什么**
`apps/web/scripts/build-fabric-catalog.mjs`,可重复执行。读三家供应商的 `catalog_data.json` + AAPP `grouped.json`,按**品牌 + 花型名 + 颜色归一化**匹配(与报价引擎同一把钥匙),输出 `apps/web/src/data/fabrics.generated.json`(10,845 款,6.0 MB,已提交)。

**价格覆盖率(每次跑都打印)**

| 档位 | 数量 | 占比 |
|---|---|---|
| A 颜色级匹配·有价 | 10,022 | 92.4% |
| B 面料级匹配·有价 | 49 | 0.5% |
| C 匹配到但 AAPP 缺价 | 336 | 3.1% |
| D 完全未匹配 | 438 | 4.0% |
| **能直接报价** | **10,071 / 10,845** | **92.9%** |

**与 `AAPP价格匹配报告_2026-08-11.xlsx` 逐格一致**(10022/49/336/438)——口径对上了,不是巧合。

**不写死本次快照**:AAPP 那条线补齐 `grouped.json` 之后,重跑这个脚本,C/D 两档自动转成有价,零代码改动。同日重跑产物 **md5 完全一致**(幂等已验证)。输入路径可用 `FABRIC_OUTPUTS_ROOT` / `AAPP_GROUPED_JSON` 覆盖。

**图片**:`apps/web/scripts/make-fabric-webp.py` 已在你机器上跑完 —— 10,844/10,845 张出了两档 WebP(400px 缩略 + 1600px 详情,不放大),共 **21,688 个文件 / 1.86 GB**,落在 `outputs/fabric_webp/{thumb,large}/`。增量:源文件没变就跳过。1 张读不出来(`FB001177_EMPIRE_VOILE_118_LINDEN_GREEN.webp`,文件本身坏了),记在 `unreadable.json`。**原图和 WebP 都不进 git。**

**改了哪些文件**:`apps/web/scripts/{build-fabric-catalog.mjs, make-fabric-webp.py, upload-fabric-images.mjs}`、`apps/web/src/data/{fabrics.generated.json, fabric-featured.json}`、`docs/fabric-library-pipeline.md`。

**遗留 → 你的动作**:R2 上传我跑不了(这台机器的 shell 没有网络,也没有 wrangler)。脚本已写好、已 `--dry-run` 验证:

```bash
cd apps/web && vercel env pull
set -a && . apps/web/.env.production.local && set +a
node apps/web/scripts/upload-fabric-images.mjs --dry-run   # 21688 objects · 1.86 GB
node apps/web/scripts/upload-fabric-images.mjs
```

24 并发,成功的 key 记在 `outputs/fabric_webp/.uploaded.json`,断了重跑接着传。**在你传完之前,`/fabrics` 的卡片会显示该布的主色块占位,不是空白**。

---

## 任务 B — 分类打标

**做了什么**
规则表 `apps/web/scripts/fabric-taxonomy.rules.json` + 人工覆盖 `fabric-taxonomy.overrides.json`(按 id,覆盖优先,重建不丢)。

| 维度 | 结果 |
|---|---|
| 布/纱 | 布 10,133 · 纱 712(源字段直接用) |
| 材质 | Polyester 5889 · Cotton 1989 · Blend 1728 · Performance 446 · Linen 431 · Viscose 201 · Silk 128 · Wool 24 · Velvet 9 |
| 颜色 | 16 色族;Grey 2043 · White 1777 · Beige 1216 · Taupe 1130 · Cream 1103 · Green 883 · Blue 624 · Brown 593 · Red 381 · Teal 306 · Black 250 · Yellow 247 · Pink 112 · Orange 110 · Purple 66 · Multi 4 |
| 花纹 | Solid 3979 · Print 3692 · Texture 2793 · Floral 191 · Geometric 155 · Stripe 17 · Damask 10 · Plaid 8 |
| 风格 | 留空 9029 · Casual 741 · Modern 576 · Luxury 323 · Classic 176 |
| 价格 | 四分位切档:$ ≤47.85 · $$ ≤63.69 · $$$ ≤80.20 · $$$$ |

**两个走了弯路才定下来的做法,值得记住:**

1. **颜色以「色卡照片」为准,不以厂商色名为准。** 我先按色名映射做了一版,抽 100 款人工看,**错了约 17%**——因为厂商色名是文学不是描述:`Meadow` 是鼠尾草绿、`Sky` 是绿、`Persimmon` 是白底灰纹章、`Night` 是纯黑、`Straw` 是金黄、`Berry` 是棕色。改成照片主色定色族之后,色名推出来的色族**保留为第二可搜色族**,所以搜 Orange 仍然能搜到 Persimmon。
2. **分类用 CIELCh 不用 HSL。** HSL 的饱和度在高明度处会爆掉,象牙白算出来 s≈0.5,被判成 Yellow。换成 Lab 的 L/C/h 之后这类错误消失。阈值全在 rules 文件里,能单独调。

**风格 67% 留空是刻意的**——任务书说「打不准的留空,不硬猜」。我一开始把材质也纳入关键词匹配,`linen` 一个词就把 2500 款打成 Casual,已经改成只看花型名 + 系列书。

**验证结果 / 遗留**:
- 自动化交叉验证:取 1,567 款**色名里含真正颜色词**的布(blue/red/green/ivory/charcoal…),照片判定与色名**同族 41.5%、相邻族 38.3%、相左 20.2%**。相左的大头是「Black Pearl 其实是浅珠光色」这类**色名本身骗人**的情况,以及 Cream/Beige/Taupe 这种人也会吵的相邻中性色。
- **人工抽检 100 款这一项我没能完成**:你桌面 App 的登录态在中途过期了,`device_stage_files` 一直 403,图我传不回聊天窗口给自己看。**对照图已经生成好在你机器上**,直接双击就能看:
  `/Volumes/SSD2T/Projects/outputs/fabric_webp/qa/FINAL-taxonomy-check-page1.png`(和 page2)
  每格标了「编号 · 主色族 +备用色族 / 花纹 / 厂商色名」。你重新登录之后跟我说一声,我把这 100 格逐格核一遍、超标的写进 overrides;或者你自己扫一眼,把错的编号告诉我。

---

## 任务 C — `/fabrics` 面料库页面

**做了什么**
- 六维筛选(布/纱、颜色、花纹、材质、风格、价格档)全部多选、可组合,**外加一个按名称/色名搜索的输入框**(任务书没要求,但一万款不给搜索不合理——如果你不要,删掉 `FilterRail` 里那个 `input` 即可)。
- **筛选状态全部同步进 URL**,`?c=Cream,Taupe&p=Solid&type=sheer` 这样的链接发给别人打开是同一屏。前进/后退也对。有 7 个用例专门守这条(`fabricFilters.test.ts`)。
- **facet 计数会「抬起自己那一维」再算**——勾了 Cream 之后,Taupe 旁边显示的是「再勾上会多出多少」,而不是恒为 0。
- **万款级性能**:6 MB 的库**不进浏览器**。`/api/fabrics` 发的是字典编码后的紧凑索引(重复字符串全部换成下标,每行是纯数组),**1.5 MB 未压缩**,CDN gzip 后约 250 KB,边缘缓存一天。网格用 IntersectionObserver 每次渲染 48 张,不是一次糊一万个 DOM 节点。
- 卡片:缩略图(未上传 R2 时退化成该布主色块)、花型名 + 色名 + 品牌、纱角标、心形收藏。点开抽屉:大图、成分、幅宽、图案循环(V/H 分开)、系列、CTA `Design with this fabric` → `/design?fabric=<id>`。另有 `/fabrics/[id]` 独立页(可分享、带 canonical 和 metadata)。
- 收藏:`localStorage` 键 `hd_fabric_favorites`,跨标签页同步;筛选栏有 `My Fabrics (n)` 开关。
- **价格开关**:`NEXT_PUBLIC_SHOW_FABRIC_PRICES` 默认 off。off 时**每码价根本不出服务器**(不是前端藏起来),但**价格档位照常下发**,否则 $/$$/$$$ 筛选就没法工作了。

**改了哪些文件**:新增 `lib/draperyFabricLibrary.ts`、`lib/fabricFavorites.ts`、`lib/estimateCopy.ts`、`app/api/fabrics/{route,[id]/route,lookup/route,featured/route}.ts`、`app/fabrics/{page.tsx,FabricLibraryClient.tsx,[id]/page.tsx,[id]/FabricFavoriteButton.tsx}`。

**遗留**:图片 URL 前缀特意用了 `fabric-swatches/` 而不是 `fabrics/`——本地不设 `NEXT_PUBLIC_CDN_URL` 时图片是同源路径,`fabrics/...` 会和 `/fabrics` 这个路由撞车。上传脚本的前缀已同步。

---

## 任务 D — `/design` 页外壳

**做了什么**
左 70% 是 `<div id="scene-root">`,里面先放一张现有的手工窗帘实景图 + `Interactive 3D preview coming soon` 角标(说明见「遗留」)。右侧面板:面料 → 成品尺寸 → 款式/开合/里布 → hardware → 估价 → `Request a consultation`。**整页状态可从 URL 还原**,刷新和转发都不丢。

- **面料**:有收藏就显示收藏(一次请求 `/api/fabrics/lookup` 取回),没有就显示 8 款默认畅销布(`src/data/fabric-featured.json`,规则挑的:有价 + 有图 + 有幅宽 + 素色/织纹 + 中档价 + 跨色族跨品牌不重花型;**这个文件只播种一次,以后重建永不覆盖,你随便改 id**)。
- **尺寸**:宽 20–300、高 20–144,超出给的是「我们照做,只是要走咨询」而不是硬报错。
- **款式**:2 褶/3 褶/wave/grommet + 单开对开 + **里布(不加/半遮光/全遮光)**。里布是我加的——`draperyEstimate` 没有 lining 会直接返回「先问客户」而不出价,不给这个选项就出不了估价。默认半遮光。
- **Hardware**:wood pole / aluminum track / H-rail,track 和 H-rail 再选 wall/ceiling。**合法矩阵**在 `packages/shared/src/design/hardwareMatrix.ts`——wave 只能 track/H-rail,grommet 只能 wood pole,pinch 三种皆可。非法组合**在 UI 上是灰的点不动**,而且**从一条手改过的旧链接进来也会被就地纠正**(7 个用例守着,含 `?heading=grommet&hw=alu_track` → 自动回落 wood pole)。
- **估价**:新建 `app/api/store/design/estimate/route.ts`。这条路由**一分钱都不算**——它只做校验、**用 id 在服务端查出该布的 $/yd**(不接受前端传价,否则谁都能伪造一个估价),然后把参数交给现成的两条 AAPP 链路:`draperyEstimate`(`catalog_price_estimate`)和 `hardwareEstimate`(`drapery_hardware`)。窗帘和 hardware 分行显示再合计。附带一个每 IP 每分钟 30 次的软限流。
- **CTA**:`Request a consultation` 带着整套设计参数(面料/尺寸/款式/里布/hardware/看到的估价数字/设计链接)跳 `/contact`,走现成的 `/api/consultation` → `aappIntake` 链路。`aappIntake.ts` **一行没动**,只在 `ContactClient` 加了从 `?message=` 预填输入框。

**§5 契约**:`packages/shared/src/design/designParams.ts` 按任务书原文落地,并加了 `DraperyScene` 接口(`mount/update/screenshot/destroy`)。页面已经把 `DesignParams` 组装好放在 state 里(含面料贴图 URL、幅宽、V/H 循环、是否纱),3D 模块到位时是**换一行**的事。`packages/shared` 新增 `./design` 子路径导出。

**改了哪些文件**:新增 `packages/shared/src/design/{designParams,hardwareMatrix,index}.ts` + 其测试、`app/design/{page.tsx,DesignClient.tsx}`、`app/api/store/design/estimate/route.ts`;改 `packages/shared/package.json`(加导出)、`lib/hardwarePricing.ts`(见下)、`app/contact/ContactClient.tsx`(预填)。

**三处必须你拍板/AAPP 侧补的缺口**:

1. **Grommet 报不出价。** AAPP 的窗帘引擎里根本没有 grommet 这个 styleKey(只有 2/3 褶 pinch/tailored 和六档 ripplefold)。按报价红线我**没有拿褶帘的价去近似**——UI 里 grommet 照常能选(3D 契约需要它),但估价面板直接显示「由顾问报价」并引导 /contact。要让它出价,得 AAPP 侧加 style。
2. **wave 我固定按 `us_100`(100% ripplefold 满度)报**,并在结果里以 `Assumed:` 明说。AAPP 有六档(cn_6cm/cn_7cm/us_60/80/100/120),要不要让客户选、默认哪一档,你定。
3. **`hardwarePricing.ts` 加了一个可选 `family` 过滤**(不传 = 行为与之前完全一致,已加 4 个用例)。原因:聊天流程里客户没点名具体家族,所以跨 pole/track 全家族报区间;但在 /design 客户已经**点名**要木杆还是 H-rail,再把金属杆的价掺进去就是错的。这个文件不在禁改清单上,改动是纯增量。

---

## 验收对照

| # | 验收项 | 状态 |
|---|---|---|
| 1 | tsc + vitest 全绿 | ✅ tsc 0 · shared 92/92 · web 199/199 |
| 1 | 万款可流畅筛选 | ✅ 索引 1.5 MB、每次渲染 48 张;**手机实测待你/Sonnet 做** |
| 1 | 筛选组合 URL 可分享还原 | ✅ 7 个用例 |
| 2 | 收藏 → /design → 尺寸 → 款式/hardware → 出估价 全链路 | ⚠️ 代码通、类型通、参数装配有用例;**真实出价必须在 Vercel preview 上验**——这台机器没有网络,AAPP 调不通 |
| 2 | 非法组合选不出来 | ✅ UI 置灰 + 旧链接就地纠正,7 个用例 |
| 3 | 价格开关 on/off 两态 | ✅ off 时 $/yd 不出服务器、档位仍下发(用例守着) |
| 3 | ask_in_store 走询价文案 | ✅ 卡片、抽屉、详情页、估价面板四处 |
| 4 | HD 介绍页面料预览区块 | ✅ 挂在现有 Fabric & Hardware 段之后;**挂载后才 fetch**,数据到位前不渲染,动不了 LCP |
| 5 | 脚本幂等 + 覆盖率报告 | ✅ 同日重跑 md5 一致;覆盖率每次打印 |

---

## 给 Sonnet 的测试入口

```bash
# 起服务(需要 .env.local 里有 AAPP token,否则估价会返回 not_configured)
cd apps/web && npm run dev

# 价格开关两态
NEXT_PUBLIC_SHOW_FABRIC_PRICES=true npm run dev
```

- 面料库:`/fabrics`,试 `?type=sheer&c=Blue&p=Stripe&b=$$`
- 收藏:心形 → `/fabrics?fav=1` → `/design` 左侧应出现收藏
- 非法组合:`/design?heading=grommet&hw=alu_track` 应自动回落成 wood pole
- ask_in_store 的布:任取一款 `priceStatus=ask_in_store`(`fabrics.generated.json` 里搜),估价应只出 hardware 一行 + 询价文案
- 尺寸越界:宽填 400 → 应出「超出范围请咨询」而不是报错

失败回路照旧:测出问题直接回我。
