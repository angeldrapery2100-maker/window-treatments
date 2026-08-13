# OPUS 任务书 — 网站第二阶段:面料库 + Design Your Drapery 外壳(2026-08-11)

> 仓库:`/Volumes/SSD2T/Projects/window-treatments`(Next.js monorepo,改动集中在 `apps/web`)。
> 前置:第一阶段任务书(结构收敛+畅销款)T1–T5;总方向见 `docs/网站-AAPP对接总体蓝图-2026-08-11.md`。
> 数据源:`/Volumes/SSD2T/Projects/outputs/`(面料总目录+图片)、`/Volumes/SSD2T/Projects/AAPP/data/handcrafted_drapery_fabric_catalog.grouped.json`(价格)。
> 并行提醒:另有一个 Opus 正在跑「AAPP 面料库补齐」(抓官网价重建 grouped.json)。本任务的数据构建脚本要做到**重跑一次即可吃进新价格**,不要写死本次快照。

## 军规(与第一阶段一致,违反=返工)

1. 每个任务完成后:`cd apps/web && ../../node_modules/.bin/tsc --noEmit`(exit 0)+ `cd packages/shared && npx vitest run`(全绿)。
2. **禁改清单**:`packages/shared/src/pricing/**`、`lib/draperyFabricTiers.generated.ts`(可新增生成文件,不改既有)、`lib/aappIntake.ts`、计价 route 的逻辑、`api/store/assistant/knowledge/**`。
3. 客户可见文案一律英文。
4. `next build` 沙箱跑不了,以 tsc + vitest 为门槛。
5. recon 先行;与本任务书描述不符时停下上报,不自行扩大范围。
6. git 锁文件问题(挂载盘 rm 不掉 `.git/*.lock`):每次 git 操作前后把锁文件 `mv` 进 `_to_delete/`。

## 0. 一句话目标

网站长出**面料库**(可筛选布/纱、材质、颜色、花纹、风格、价格,可收藏)和 **/design 页外壳**(从收藏选布 → 输入尺寸 → 选款式与 hardware → 出估价;3D 视口本阶段放占位图)。handcrafted drapery 介绍页嵌入面料库预览。

**Eddie 已拍板(不要再改):**

1. Design 页是**一级独立页** `/design`,入口三个:HD 介绍页主 CTA、面料库每款布的 "Design with this fabric"、顶部导航。
2. 收藏不是前置条件:直接进 /design 的客户看到几款默认畅销布,可立刻开始。
3. Hardware 只有三种:**wood pole、aluminum track(wall/ceiling)、H-rail**。
4. 每款布是否显示零售单价 **Eddie 未定**:做成配置开关 `NEXT_PUBLIC_SHOW_FABRIC_PRICES`,默认 **off**(off 时估价功能照常,只是不单独标每码价)。
5. 3D 设计器由另一条线开发(见《OPUS-任务书-3D设计器》),本任务**只留坑位 + 按 §5 契约传参**,不自己写 3D。

## 1. 任务 A — 面料数据管线(脚本,先行)

新建 `apps/web/scripts/build-fabric-catalog.mjs`,可重复执行:

1. **输入**:`outputs/fabric_master_catalog_2026-08-01/三供应商_全站面料统一总目录_10845款.xlsx`(或其底层 `catalog_data.json`,以 json 为准)+ AAPP `grouped.json`(价格,按品牌+花型+颜色归一化匹配,口径见 `outputs/AAPP价格匹配报告_2026-08-11.xlsx`)。
2. **输出**:`apps/web/src/data/fabrics.generated.json`(或分片),每款:id(沿用 AAPP `color_id` 规则)、品牌、花型、颜色、幅宽、材质、repeat、纱/布、系列、产地、图片 key、`pricePerYard`(可空)、`priceStatus: 'ready'|'ask_in_store'`、分类标签(§任务 B)。
3. **图片**:从 outputs 的 images 目录生成两档 WebP(缩略 ~400px、详情 ~1600px),按现有 `upload-to-r2.sh` 的约定传 R2;脚本要支持增量(已传的跳过)。**10,845 张原图不进 git。**
4. 匹配不到价的款照常进库,`ask_in_store`;AAPP 补齐任务完成后重跑本脚本即可转正。

## 2. 任务 B — 分类打标(筛选的地基)

筛选维度与来源:

| 维度 | 来源 | 说明 |
|---|---|---|
| 布/纱 | 已有 `yarnFabric` 字段 | 直接用 |
| 材质 | material 成分解析 | 归并成 Linen / Cotton / Polyester / Velvet / Blend 等大类,保留原文 |
| 颜色 | 颜色名映射表 + 缩略图主色提取兜底 | 归并成 12–16 个色族(White/Cream/Grey/Blue/Green/…) |
| 花纹 | 花型名 + repeat + book 关键词规则 | Solid / Texture / Stripe / Geometric / Floral / Damask 等;repeat 为空且名称无关键词 → Solid/Texture |
| 风格 | 规则打标(关键词+系列) | Modern / Classic / Casual / Luxury 少数几个;打不准的留空,**不硬猜** |
| 价格 | pricePerYard 分档 | $ / $$ / $$$ / $$$$ 四档,分位数切 |

规则表放独立文件 `fabric-taxonomy.rules.json` + 人工覆盖文件 `fabric-taxonomy.overrides.json`(Eddie 日后手工修正用,脚本合并时 overrides 优先)。打标准确率不追求完美,**验收线:抽 100 款人工看,颜色错 ≤10%,花纹错 ≤15%**。

## 3. 任务 C — 面料库页面 `/fabrics`

- 网格 + 左侧(移动端抽屉)筛选:上表六维,多选,组合筛选,URL query 同步(可分享链接)。
- 每卡:缩略图、花型名+颜色、品牌、纱/布角标、心形收藏;点开详情(drawer 或 `/fabrics/[id]`):大图、材质、幅宽、repeat(图案大小)、系列,CTA = "Design with this fabric" → `/design?fabric=<id>`。
- 价格显示遵守开关(§0.4)。
- 万款级性能:虚拟滚动或分页 + 筛选在客户端索引(预生成轻量索引 json),首屏 LCP 不劣化。
- 收藏:localStorage(键 `hd_fabric_favorites`,存 id 数组),导航处有 "My Fabrics (n)" 入口。
- **HD 介绍页嵌入**:`/products/handcrafted-drapery` 加一个 "Explore our fabric library" 区块:精选 8–12 款横向滑动 + "Browse all fabrics →";让客户在介绍页就能看图、材质、图案大小。

## 4. 任务 D — `/design` 页外壳

左右布局:左侧 70% 是 3D 视口**占位**(本阶段放一张现有 `drapery-3d-prototype-APPROVED.html` 截的静态效果图 + "Interactive 3D preview coming soon"),右侧参数面板:

1. **Fabric**:My Fabrics 收藏横排 + 默认畅销布若干;当前选中布显示缩略图与名称,可跳回面料库。
2. **Size**:成品宽/高,inch,带常见范围校验(宽 20–300,高 20–144,超出提示咨询)。
3. **Style**:帘头款式(pinch pleat 2/3 fold、wave、grommet 起步)+ 单开/对开。
4. **Hardware**:三选一 wood pole / aluminum track / H-rail;track 显示 wall/ceiling 子选项。**款式×hardware 合法矩阵**读 §5 契约同款配置文件:wave→仅 track/H-rail,grommet→仅 wood pole,pinch pleat→三种皆可(矩阵文件由 3D 线维护,本线只消费)。
5. **估价面板**:调用现有报价链路(`packages/shared` 引擎/现有 calculate route,禁改逻辑,只传参),布价取 `pricePerYard`;`ask_in_store` 的布显示 "Price on consultation" 并引导 /contact。估价措辞沿用第一阶段统一的免责文案。
6. 底部 CTA:"Request a consultation"(带上当前设计参数进 intake,走现有 `lib/aappIntake.ts` 链路,不改其逻辑,只填充)。

状态整页 URL query 可还原(分享/回访不丢)。

## 5. 3D 集成契约(与《3D设计器》任务书共同遵守,改动需两边同步)

```ts
// packages/shared/src/design/designParams.ts(新增,允许)
export type DesignParams = {
  fabric: { id: string; textureUrl: string; fabricWidthIn: number;
            repeatVIn?: number; repeatHIn?: number; sheer: boolean };
  window: { finishedWidthIn: number; finishedHeightIn: number };
  style:  { heading: 'pinch2'|'pinch3'|'wave'|'grommet'; split: boolean; fullness?: number };
  hardware: { type: 'wood_pole'|'alu_track'|'h_rail'; mount: 'wall'|'ceiling';
              options?: Record<string,string> };  // pole: diameter/finish/fluted/finial
};
```

3D 组件将来以 ES module 提供:`mount(el, params)` / `update(partial)` / `screenshot(): Promise<Blob>` / `destroy()`。本阶段 /design 把 `DesignParams` 组装好放 state,占位图区域留 `<div id="scene-root">`,将来一行换入。

## 6. 验收

1. tsc + vitest 全绿;`/fabrics` 万款可流畅筛选(手机实测);筛选组合 URL 可分享还原。
2. 收藏 → /design 选布 → 输尺寸 → 选款式/hardware → 出估价,全链路通;非法组合(如 grommet+track)在 UI 上选不出来。
3. 价格开关 on/off 两态都正确;`ask_in_store` 布走询价文案。
4. HD 介绍页面料预览区块上线,不劣化该页 LCP。
5. 数据脚本重跑幂等;AAPP 新 grouped.json 落地后重跑,价格覆盖率报告(能报价款数/总款数)打印在脚本输出里。
6. 回报格式:每任务一段(做了什么/改了哪些文件/验证结果/遗留),涉及 recon 的把现状写清。
