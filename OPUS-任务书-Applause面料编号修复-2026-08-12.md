# OPUS 任务书 — Applause 产品页面料编号修复(2026-08-12)

## 背景与诊断(Fable 已核实,勿重查)

网站 `/products/applause` 页面显示的面料系列与编号是**编造的旧 Duette 式数据**(Classic/Linen Weave/Elan、A22/A23/A56/A57/A62 编号),与真源 PDF `hd-applause-digital-sample-book.pdf` 完全对不上。真实的 Applause 面料系列是 7 个:Crystalline™ Sheer(3 色)、Vintage™(12)、Amity™(6)、Legends™(12)、Sunterra™(24)、Kinship™(12)、HDOrigins® Esprit™(12),共 81 色,编号是 E 系(E20/E50/E51/E54/E55/E6/E5/E3/E40/E41/E26/E27/E28/E36/E37)。

- 唯一要改的文件:`apps/web/src/app/products/[slug]/applause-layout.ts`(页面经 `layoutFactory.ts` → `ApplauseDetailClient.tsx` 只读 `applauseLayout`,不用改任何组件)。
- `public/hunter-douglas/products/applause.json` 的 fabric_swatches 数据是对的(已与 PDF Color Chart 81 色逐行核对 100% 一致),**不要动它**;下面的替换块就是由它生成的。
- 图片文件名已与磁盘 `public/hunter-douglas/applause/` 逐一核对(81 张 475x825 swatch + 30 张 306x306 五金 chip 全部存在,全是 .jpeg);图与色名的对应关系已用 PDF 逐页像素比对验证(page039/page042/page033 抽查均命中)。
- 本任务书内的替换块**照贴即可,不要自己改写、不要去重新读 PDF**。

## 改动一:整段替换 swatchCollections(约 L304–412,文件末尾)

把 `// ──── Swatch Collections (pages 35-75) ────` 注释起、到文件结尾 `],` 止的整段 `swatchCollections: [...]`(当前含 Classic Light Filtering / Classic Room Darkening / Linen Weave ×2 / Elan® 五组)删掉,替换为:

```ts
  // ──── Swatch Collections (pages 35-75) — 2026-08-12 与 hd-applause-digital-sample-book.pdf Color Chart 逐行核对重建 ────
  swatchCollections: [
    {
      name: 'Crystalline™ Sheer',
      swatches: [
        { image: 'page035_img01_475x825.jpeg', colorName: 'Rock Crystal', specs: ['Sheer E20-513 (¾")'] },
        { image: 'page035_img02_475x825.jpeg', colorName: 'Rose Quartz', specs: ['Sheer E20-514 (¾")'] },
        { image: 'page036_img01_475x825.jpeg', colorName: 'Sheer Citrine', specs: ['Sheer E20-515 (¾")'] },
      ],
    },
    {
      name: 'Vintage™',
      swatches: [
        { image: 'page037_img01_475x825.jpeg', colorName: 'Igloo', specs: ['Light Filtering E50-1248 (¾")', 'Room Darkening E51-1248 (¾")'] },
        { image: 'page037_img02_475x825.jpeg', colorName: 'Retro White', specs: ['Light Filtering E50-300 (¾")', 'Room Darkening E51-300 (¾")'] },
        { image: 'page038_img01_475x825.jpeg', colorName: 'Tea Biscuit', specs: ['Light Filtering E50-303 (¾")', 'Room Darkening E51-303 (¾")'] },
        { image: 'page038_img02_475x825.jpeg', colorName: 'Potpourri', specs: ['Light Filtering E50-309 (¾")', 'Room Darkening E51-309 (¾")'] },
        { image: 'page039_img01_475x825.jpeg', colorName: 'Tintype', specs: ['Light Filtering E50-308 (¾")', 'Room Darkening E51-308 (¾")'] },
        { image: 'page039_img02_475x825.jpeg', colorName: 'Café Au Lait', specs: ['Light Filtering E50-327 (¾")', 'Room Darkening E51-327 (¾")'] },
        { image: 'page040_img01_475x825.jpeg', colorName: 'Cadium', specs: ['Light Filtering E50-1249 (¾")', 'Room Darkening E51-1249 (¾")'] },
        { image: 'page040_img02_475x825.jpeg', colorName: 'Pearl Gray', specs: ['Light Filtering E50-713 (¾")', 'Room Darkening E51-713 (¾")'] },
        { image: 'page041_img01_475x825.jpeg', colorName: 'Pencil Sketch', specs: ['Light Filtering E50-313 (¾")', 'Room Darkening E51-313 (¾")'] },
        { image: 'page041_img02_475x825.jpeg', colorName: 'Weathered Windmill', specs: ['Light Filtering E50-312 (¾")', 'Room Darkening E51-312 (¾")'] },
        { image: 'page042_img01_475x825.jpeg', colorName: 'Aged Onyx', specs: ['Light Filtering E50-311 (¾")', 'Room Darkening E51-311 (¾")'] },
        { image: 'page042_img02_475x825.jpeg', colorName: 'Sepia', specs: ['Light Filtering E50-310 (¾")', 'Room Darkening E51-310 (¾")'] },
      ],
    },
    {
      name: 'Amity™',
      swatches: [
        { image: 'page043_img01_475x825.jpeg', colorName: 'Bay Salt', specs: ['Light Filtering E54-1270 (¾")', 'Room Darkening E55-1270 (¾")'] },
        { image: 'page043_img02_475x825.jpeg', colorName: 'Soft Wool', specs: ['Light Filtering E54-1271 (¾")', 'Room Darkening E55-1271 (¾")'] },
        { image: 'page044_img01_475x825.jpeg', colorName: 'Grayscale', specs: ['Light Filtering E54-1272 (¾")', 'Room Darkening E55-1272 (¾")'] },
        { image: 'page044_img02_475x825.jpeg', colorName: 'Aiden', specs: ['Light Filtering E54-1273 (¾")', 'Room Darkening E55-1273 (¾")'] },
        { image: 'page045_img01_475x825.jpeg', colorName: 'Tash', specs: ['Light Filtering E54-1274 (¾")', 'Room Darkening E55-1274 (¾")'] },
        { image: 'page045_img02_475x825.jpeg', colorName: 'Young Cedar', specs: ['Light Filtering E54-1275 (¾")', 'Room Darkening E55-1275 (¾")'] },
      ],
    },
    {
      name: 'Legends™',
      swatches: [
        { image: 'page046_img01_475x825.jpeg', colorName: 'Porcelain', specs: ['Light Filtering E6/E5-401 (¾" & Double)', 'Room Darkening E3-401 (¾")'] },
        { image: 'page046_img02_475x825.jpeg', colorName: 'Pearl', specs: ['Light Filtering E6/E5-402 (¾" & Double)', 'Room Darkening E3-402 (¾")'] },
        { image: 'page047_img01_475x825.jpeg', colorName: 'Parchment', specs: ['Light Filtering E6/E5-403 (¾" & Double)', 'Room Darkening E3-403 (¾")'] },
        { image: 'page047_img02_475x825.jpeg', colorName: 'Buttercream', specs: ['Light Filtering E6/E5-442 (¾" & Double)', 'Room Darkening E3-442 (¾")'] },
        { image: 'page048_img01_475x825.jpeg', colorName: 'Sandcastle', specs: ['Light Filtering E6/E5-424 (¾" & Double)', 'Room Darkening E3-424 (¾")'] },
        { image: 'page048_img02_475x825.jpeg', colorName: 'Camel', specs: ['Light Filtering E6/E5-410 (¾" & Double)', 'Room Darkening E3-410 (¾")'] },
        { image: 'page049_img01_475x825.jpeg', colorName: 'Putty', specs: ['Light Filtering E6-408 (¾")', 'Room Darkening E3-408 (¾")'] },
        { image: 'page049_img02_475x825.jpeg', colorName: 'Gold Rush', specs: ['Light Filtering E6-1238 (¾")', 'Room Darkening E3-1238 (¾")'] },
        { image: 'page050_img01_475x825.jpeg', colorName: 'Wooded Mist', specs: ['Light Filtering E6-1239 (¾")', 'Room Darkening E3-1239 (¾")'] },
        { image: 'page050_img02_475x825.jpeg', colorName: 'Lakehouse', specs: ['Light Filtering E6-1240 (¾")', 'Room Darkening E3-1240 (¾")'] },
        { image: 'page051_img01_475x825.jpeg', colorName: 'Rolling Fog', specs: ['Light Filtering E6-411 (¾")', 'Room Darkening E3-411 (¾")'] },
        { image: 'page051_img02_475x825.jpeg', colorName: 'Espresso', specs: ['Light Filtering E6-460 (¾")', 'Room Darkening E3-460 (¾")'] },
      ],
    },
    {
      name: 'Sunterra™',
      swatches: [
        { image: 'page052_img01_475x825.jpeg', colorName: 'Frostline', specs: ['Light Filtering E40-599 (¾")', 'Room Darkening E41-599 (¾")'] },
        { image: 'page052_img02_475x825.jpeg', colorName: 'Cloud', specs: ['Light Filtering E40-657 (¾")', 'Room Darkening E41-657 (¾")'] },
        { image: 'page053_img01_475x825.jpeg', colorName: 'Sea Salt', specs: ['Light Filtering E40-658 (¾")', 'Room Darkening E41-658 (¾")'] },
        { image: 'page053_img02_475x825.jpeg', colorName: 'Sand Dune', specs: ['Light Filtering E40-659 (¾")', 'Room Darkening E41-659 (¾")'] },
        { image: 'page054_img01_475x825.jpeg', colorName: 'Mushroom', specs: ['Light Filtering E40-660 (¾")', 'Room Darkening E41-660 (¾")'] },
        { image: 'page054_img02_475x825.jpeg', colorName: 'Zirconia', specs: ['Light Filtering E40-1241 (¾")', 'Room Darkening E41-1241 (¾")'] },
        { image: 'page055_img01_475x825.jpeg', colorName: 'Moonlight', specs: ['Light Filtering E40-600 (¾")', 'Room Darkening E41-600 (¾")'] },
        { image: 'page055_img02_475x825.jpeg', colorName: 'Driftwood', specs: ['Light Filtering E40-635 (¾")', 'Room Darkening E41-635 (¾")'] },
        { image: 'page056_img01_475x825.jpeg', colorName: 'Silver Lining', specs: ['Light Filtering E40-689 (¾")', 'Room Darkening E41-689 (¾")'] },
        { image: 'page056_img02_475x825.jpeg', colorName: 'Honey Wheat', specs: ['Light Filtering E40-630 (¾")', 'Room Darkening E41-630 (¾")'] },
        { image: 'page057_img01_475x825.jpeg', colorName: 'Pinecone', specs: ['Light Filtering E40-661 (¾")', 'Room Darkening E41-661 (¾")'] },
        { image: 'page057_img02_475x825.jpeg', colorName: 'Chestnut', specs: ['Light Filtering E40-640 (¾")', 'Room Darkening E41-640 (¾")'] },
        { image: 'page058_img01_475x825.jpeg', colorName: 'Lavender Calm', specs: ['Light Filtering E40-1242 (¾")', 'Room Darkening E41-1242 (¾")'] },
        { image: 'page058_img02_475x825.jpeg', colorName: 'Kobi', specs: ['Light Filtering E40-1250 (¾")', 'Room Darkening E41-1250 (¾")'] },
        { image: 'page059_img01_475x825.jpeg', colorName: 'Creamy Oat', specs: ['Light Filtering E40-656 (¾")', 'Room Darkening E41-656 (¾")'] },
        { image: 'page059_img02_475x825.jpeg', colorName: 'Desert', specs: ['Light Filtering E40-669 (¾")', 'Room Darkening E41-669 (¾")'] },
        { image: 'page060_img01_475x825.jpeg', colorName: 'Cornucopia', specs: ['Light Filtering E40-1243 (¾")', 'Room Darkening E41-1243 (¾")'] },
        { image: 'page060_img02_475x825.jpeg', colorName: 'Cranberry', specs: ['Light Filtering E40-1244 (¾")', 'Room Darkening E41-1244 (¾")'] },
        { image: 'page061_img01_475x825.jpeg', colorName: 'Cielo', specs: ['Light Filtering E40-1245 (¾")', 'Room Darkening E41-1245 (¾")'] },
        { image: 'page061_img02_475x825.jpeg', colorName: 'Laurel', specs: ['Light Filtering E40-1246 (¾")', 'Room Darkening E41-1246 (¾")'] },
        { image: 'page062_img01_475x825.jpeg', colorName: 'Aqua Spray', specs: ['Light Filtering E40-652 (¾")', 'Room Darkening E41-652 (¾")'] },
        { image: 'page062_img02_475x825.jpeg', colorName: 'Reef', specs: ['Light Filtering E40-663 (¾")', 'Room Darkening E41-663 (¾")'] },
        { image: 'page063_img01_475x825.jpeg', colorName: 'Twilight Blue', specs: ['Light Filtering E40-653 (¾")', 'Room Darkening E41-653 (¾")'] },
        { image: 'page063_img02_475x825.jpeg', colorName: 'New Noir', specs: ['Light Filtering E40-1247 (¾")', 'Room Darkening E41-1247 (¾")'] },
      ],
    },
    {
      name: 'Kinship™',
      swatches: [
        { image: 'page064_img01_475x825.jpeg', colorName: 'Calm', specs: ['Light Filtering E26/E28-766 (¾" & Double)', 'Room Darkening E27-766 (¾")'] },
        { image: 'page064_img02_475x825.jpeg', colorName: 'Summer Wish', specs: ['Light Filtering E26/E28-767 (¾" & Double)', 'Room Darkening E27-767 (¾")'] },
        { image: 'page065_img01_475x825.jpeg', colorName: 'Gelato', specs: ['Light Filtering E26/E28-772 (¾" & Double)', 'Room Darkening E27-772 (¾")'] },
        { image: 'page065_img02_475x825.jpeg', colorName: 'Twilight', specs: ['Light Filtering E26/E28-753 (¾" & Double)', 'Room Darkening E27-753 (¾")'] },
        { image: 'page066_img01_475x825.jpeg', colorName: 'Canoe', specs: ['Light Filtering E26/E28-770 (¾" & Double)', 'Room Darkening E27-770 (¾")'] },
        { image: 'page066_img02_475x825.jpeg', colorName: 'Warm Stone', specs: ['Light Filtering E26/E28-754 (¾" & Double)', 'Room Darkening E27-754 (¾")'] },
        { image: 'page067_img01_475x825.jpeg', colorName: 'Mystic', specs: ['Light Filtering E26-1237 (¾")', 'Room Darkening E27-1237 (¾")'] },
        { image: 'page067_img02_475x825.jpeg', colorName: 'Sun Light', specs: ['Light Filtering E26-768 (¾")', 'Room Darkening E27-768 (¾")'] },
        { image: 'page068_img01_475x825.jpeg', colorName: 'Honeysuckle', specs: ['Light Filtering E26-769 (¾")', 'Room Darkening E27-769 (¾")'] },
        { image: 'page068_img02_475x825.jpeg', colorName: 'Sun Tea', specs: ['Light Filtering E26-776 (¾")', 'Room Darkening E27-776 (¾")'] },
        { image: 'page069_img01_475x825.jpeg', colorName: 'Beach Glass', specs: ['Light Filtering E26-756 (¾")', 'Room Darkening E27-756 (¾")'] },
        { image: 'page069_img02_475x825.jpeg', colorName: 'Ocean Dusk', specs: ['Light Filtering E26-755 (¾")', 'Room Darkening E27-755 (¾")'] },
      ],
    },
    {
      name: 'HDOrigins® Esprit™',
      swatches: [
        { image: 'page070_img01_475x825.jpeg', colorName: 'Free Spirit', specs: ['Light Filtering E36-326 (¾")', 'Room Darkening E37-326 (¾")'] },
        { image: 'page070_img02_475x825.jpeg', colorName: 'Whimsy', specs: ['Light Filtering E36-327 (¾")', 'Room Darkening E37-327 (¾")'] },
        { image: 'page071_img01_475x825.jpeg', colorName: 'Soul Shine', specs: ['Light Filtering E36-328 (¾")', 'Room Darkening E37-328 (¾")'] },
        { image: 'page071_img02_475x825.jpeg', colorName: 'Hidden Gem', specs: ['Light Filtering E36-329 (¾")', 'Room Darkening E37-329 (¾")'] },
        { image: 'page072_img01_475x825.jpeg', colorName: 'Barefoot Dreams', specs: ['Light Filtering E36-330 (¾")', 'Room Darkening E37-330 (¾")'] },
        { image: 'page072_img02_475x825.jpeg', colorName: 'Wild Oats', specs: ['Light Filtering E36-331 (¾")', 'Room Darkening E37-331 (¾")'] },
        { image: 'page073_img01_475x825.jpeg', colorName: 'Wildflower', specs: ['Light Filtering E36-332 (¾")', 'Room Darkening E37-332 (¾")'] },
        { image: 'page073_img02_475x825.jpeg', colorName: 'Wanderlust', specs: ['Light Filtering E36-333 (¾")', 'Room Darkening E37-333 (¾")'] },
        { image: 'page074_img01_475x825.jpeg', colorName: 'Imagine', specs: ['Light Filtering E36-334 (¾")', 'Room Darkening E37-334 (¾")'] },
        { image: 'page074_img02_475x825.jpeg', colorName: 'Adventurous', specs: ['Light Filtering E36-335 (¾")', 'Room Darkening E37-335 (¾")'] },
        { image: 'page075_img01_475x825.jpeg', colorName: 'Dreamcatcher', specs: ['Light Filtering E36-336 (¾")', 'Room Darkening E37-336 (¾")'] },
        { image: 'page075_img02_475x825.jpeg', colorName: 'Gypsy Love', specs: ['Light Filtering E36-337 (¾")', 'Room Darkening E37-337 (¾")'] },
      ],
    },
  ],
```

## 改动二:整段替换 hardwareColors(约 L265–302)

当前 30 个 label 大半是编造的(064 Bronze、133 Metro Gray、483 Walnut、903 Desert Gold……PDF 里不存在)。整段替换为:

```ts
  // ──── Hardware Colors (page 33) — 2026-08-12 按 PDF Hardware Color Guide 阅读顺序重建 ────
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Applause® Honeycomb Shades',
    items: [
      { image: 'page033_img01_306x306.jpeg', label: '048 Black' },
      { image: 'page033_img02_306x306.jpeg', label: '135 Whispering Heather' },
      { image: 'page033_img03_306x306.jpeg', label: '180 Dove Gray' },
      { image: 'page033_img04_306x306.jpeg', label: '202 Paprika' },
      { image: 'page033_img05_306x306.jpeg', label: '205 Fawn' },
      { image: 'page033_img06_306x306.jpeg', label: '218 Peppercorn' },
      { image: 'page033_img07_306x306.jpeg', label: '221 Aspen Snow' },
      { image: 'page033_img08_306x306.jpeg', label: '276 Silverado' },
      { image: 'page033_img09_306x306.jpeg', label: '320 Rich Cream' },
      { image: 'page033_img10_306x306.jpeg', label: '323 Pumpkin' },
      { image: 'page033_img11_306x306.jpeg', label: '324 Stone' },
      { image: 'page033_img12_306x306.jpeg', label: '466 Honey Maple' },
      { image: 'page033_img13_306x306.jpeg', label: '556 Woven Basket' },
      { image: 'page033_img14_306x306.jpeg', label: '575 Gray Cloud' },
      { image: 'page033_img15_306x306.jpeg', label: '578 Mediterranean Breeze' },
      { image: 'page033_img16_306x306.jpeg', label: '580 Midnight Oil' },
      { image: 'page033_img17_306x306.jpeg', label: '609 Falcon Gray' },
      { image: 'page033_img18_306x306.jpeg', label: '661 White Tiara' },
      { image: 'page033_img19_306x306.jpeg', label: '669 Beijing Gray' },
      { image: 'page033_img20_306x306.jpeg', label: '683 Pearl Gray' },
      { image: 'page033_img21_306x306.jpeg', label: '685 Blue Sky' },
      { image: 'page033_img22_306x306.jpeg', label: '689 Ash' },
      { image: 'page033_img23_306x306.jpeg', label: '758 Shimmering Ocean' },
      { image: 'page033_img24_306x306.jpeg', label: '785 Aspen White' },
      { image: 'page033_img25_306x306.jpeg', label: '810 Mushroom' },
      { image: 'page033_img26_306x306.jpeg', label: '841 Dark Blonde' },
      { image: 'page033_img27_306x306.jpeg', label: '849 Mocha' },
      { image: 'page033_img28_306x306.jpeg', label: '862 Gardenia White' },
      { image: 'page033_img29_306x306.jpeg', label: '878 Frosted Ice' },
      { image: 'page033_img30_306x306.jpeg', label: '882 Honey Bisque' },
    ],
  },
```

(顺序 = PDF Hardware Color Guide 阅读顺序,img01=048 Black 起逐格对应;已抽色验证 048 Black/202 Paprika/323 Pumpkin/578 Mediterranean Breeze/685 Blue Sky 等位置命中。)

## 改动三:hero / scene / gallery 标签逐条替换(字符串级小改)

以下每条给出「行号(约)| 现值 → 新值」。label 里的换行保持 `\n`、Fabric 与 Color 之间保持四个空格的既有格式。

1. **L76 `heroLabel`**
   现:`'Fabric Classic    Color Daisy White\nOperating System LiteRise®'`
   改:`'Fabric Sunterra™    Color New Noir\nOperating System PowerView® Automation'`

2. **scene page007(L84–87)**
   `text` 改:`'From the makers of Duette®, energy-efficient Applause® Honeycomb Shades are available in a selection of on-trend fabrics.'`
   `label` 改:`'Fabric Amity™    Color Grayscale'`

3. **scene page008(L88–92)**
   `text` 改:`'The Applause® Amity™ fabric collection features an innovative print providing the look of stunning texture.'`
   `label` 改:`'Fabric Amity™    Color Grayscale\nOperating System PowerView® Automation'`

4. **scene page009(L93–97)**
   `text` 改:`'With the Duolite® design option, two fabric opacities are combined in a single headrail for the ultimate in light control and privacy.'`
   `label` 改:`'Fabric Crystalline™ Sheer    Color Rock Crystal\nFabric Legends™    Color Lakehouse\nOperating System PowerView® Automation\nDesign Option Duolite®'`

5. **scene page012(L98–102)** — label 已正确,仅在末行补 Canada 备注:
   `...Design Option Top-Down/Bottom-Up` 改为 `...Design Option Top-Down/Bottom-Up (Not available in Canada)`

6. **scene page013(L103–107)**
   `text` 改:`'Applause® shades are offered as a Whole House Solution™ for vertical and horizontal applications.'`
   `label` 改:`'Fabric Kinship™    Color Mystic\nOperating System PowerView® Automation, Vertiglide™'`

7. **gallery page011_img01(L246)**
   `label` 改:`'Fabric Vintage™    Color Café Au Lait\nOpacity Light Filtering\nOperating System LiteRise®'`

8. **gallery page016_img01(L249)**
   `label` 改:`'Fabric Crystalline™ Sheer    Color Rock Crystal\nFabric Legends™    Color Pearl\nOperating System PowerView® Automation, Vertiglide™ Split Stack\nDesign Option Duolite®'`

9. **gallery page017_img01(L250)**
   `label` 改:`'Fabric Crystalline™ Sheer    Color Rock Crystal\nFabric Vintage™    Color Aged Onyx\nOperating System PowerView® Automation\nDesign Option Duolite®'`

10. **gallery page023_img01(L251)**
    `label` 改:`'Fabric Vintage™    Color Weathered Windmill\nOperating System PowerView® Automation\nDesign Option Top-Down/Bottom-Up'`

11. **cellSize(L255–263)** — 低置信度项:page025 实为客厅场景图、page026 为蜂巢特写,现 label『¾"/1¼" Double Cell』与新版产品线(¾" 与 Double,无 1¼")不符。改为:page025 label `''`,page026 label `'¾" & Double Cell'`。此项渲染效果需 Eddie 目检,不满意再调。

## 禁改清单

- `public/hunter-douglas/products/applause.json`、`products-index.json`、所有图片文件——只读。
- `ApplauseDetailClient.tsx` / `layoutFactory.ts` / `types.ts` 及其它 *-layout.ts——不动。
- 替换块内的编号、色名、图名——照贴,发现"看起来不对"也不要擅自改(数据已三方核对),改前先记下来汇报。

## 验收标准

1. `npx tsc --noEmit`(或项目现有 lint/build)通过。
2. 页面显示 7 个系列,数量为 Crystalline™ Sheer 3 / Vintage™ 12 / Amity™ 6 / Legends™ 12 / Sunterra™ 24 / Kinship™ 12 / HDOrigins® Esprit™ 12,合计 81 色。
3. `grep -nE "A2[23]-|A4[23]-|A5[67]-|A62-|Linen Weave|Classic Light|Classic Room" applause-layout.ts` 零命中。
4. 交给 Sonnet 按《SONNET-测试清单-Applause面料编号-2026-08-12.md》跑完。

## 完成后

改完自测通过即可 commit(单独一个 commit,message 注明 "fix(applause): rebuild fabric swatches/hardware/captions from HD sample book"),不 push。
