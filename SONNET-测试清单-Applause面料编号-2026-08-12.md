# SONNET 测试清单 — Applause 面料编号修复(2026-08-12)

对象:`apps/web/src/app/products/[slug]/applause-layout.ts` 改动后的 `/products/applause` 页。

## Sonnet 可测(全部要过)

1. **编译**:`npx tsc --noEmit` 无错;dev server 启动无报错,打开 `/products/applause` 控制台无 error。
2. **残留检查**:`grep -nE "A2[23]-|A4[23]-|A5[67]-|A62-|Linen Weave|Classic Light Filtering|Classic Room Darkening|DIAMOND|SERENITY|MOONSTRUCK" apps/web/src/app/products/\[slug\]/applause-layout.ts` → 必须 0 命中。
3. **系列与数量**:页面 swatch 区显示 7 个系列,顺序与数量 = Crystalline™ Sheer 3、Vintage™ 12、Amity™ 6、Legends™ 12、Sunterra™ 24、Kinship™ 12、HDOrigins® Esprit™ 12;汇总文案 "81 colors across 7 collections"。
4. **抽查 8 条编号**(与页面显示逐字比对):
   - Rock Crystal → `Sheer E20-513 (¾")`
   - Igloo → `Light Filtering E50-1248 (¾")` + `Room Darkening E51-1248 (¾")`
   - Bay Salt → `Light Filtering E54-1270 (¾")` + `Room Darkening E55-1270 (¾")`
   - Porcelain → `Light Filtering E6/E5-401 (¾" & Double)` + `Room Darkening E3-401 (¾")`
   - Frostline → `Light Filtering E40-599 (¾")` + `Room Darkening E41-599 (¾")`
   - Calm → `Light Filtering E26/E28-766 (¾" & Double)` + `Room Darkening E27-766 (¾")`
   - Free Spirit → `Light Filtering E36-326 (¾")` + `Room Darkening E37-326 (¾")`
   - Aged Onyx → `Light Filtering E50-311 (¾")` + `Room Darkening E51-311 (¾")`
5. **无破图**:对页面上全部 81 张 swatch + 30 张 hardware 图发 HEAD/GET,全部 200(可脚本遍历 layout 里的 image 字段拼 `/hunter-douglas/applause/<name>`)。
6. **五金区**:30 个色块,首个 label `048 Black` 且色块为近黑;`202 Paprika` 色块偏红、`323 Pumpkin` 偏橙、`685 Blue Sky` 偏蓝(不符合立即回报 Opus,可能是图序映射错)。
7. **hero/scene/gallery 标签**:heroLabel 含 `Sunterra™`/`New Noir`;页面再无任何 `Fabric Classic` / `Daisy White` 字样(全文搜索)。

## Sonnet 不可测(标注给 Eddie 目检)

- swatch 图片与色名的观感一致性(如 Aged Onyx 应为灰调、Sepia 偏棕)——截图 Crystalline 与 Vintage 两个系列回传。
- cellSize 区两张图的新 label 观感(任务书第 11 条,低置信度项)。
- 五金 30 格与名称的整体观感(截图整区回传)。

## 失败回路

不过 → 直接回 Opus 修;修 3 轮仍不过 → 汇总现象 + 已试项回 Fable。
