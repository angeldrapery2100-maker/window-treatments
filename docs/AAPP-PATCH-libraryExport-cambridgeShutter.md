# AAPP 补丁待审批:libraryExport 增加 cambridgeShutter 导出

> 状态:**待 Eddie 批准,未应用**。批准后我来改 `functions/index.js`,你部署:
> `firebase deploy --only functions:libraryExport`
>
> 目的:③测量向导的 shutter 报价数据源走 AAPP library 同步(Eddie 2026-07-19 拍板)。
> 网站侧已按此字段接好:`aapp_library` 快照里有 `data.cambridgeShutter.pricingRates`
> 就用它,没有(或 CF 未部署)则回退到与 AAPP 内置一致的默认表——回退链和
> AAPP 自己的 `_csResolvePricing` 完全一致,所以部署前后价格都正确,除非你在
> AAPP Library 里改过 shutter 费率(改过的话,部署 CF 前网站用的是默认表)。

## 改动(唯一一处,`functions/index.js` libraryExport 的 res.json data 块)

```diff
         // Drapery fabric price overrides.
         draperyFabricCatalogOverrides: lib.draperyFabricCatalogOverrides || null,
+        // Cambridge shutter: admin-edited pricing rates + colors (null = 未
+        // 自定义,网站回退到与 AAPP 内置一致的默认表)。website ③测量向导
+        // quote_shutter_estimate 用(2026-07-19 Eddie 批准的数据源方案)。
+        cambridgeShutter: lib.cambridgeShutter
+          ? {
+              pricingRates: lib.cambridgeShutter.pricingRates || null,
+              colors:       lib.cambridgeShutter.colors       || null,
+            }
+          : null,
       },
```

只读导出,不改任何 AAPP 计算逻辑;feed 仍受 x-ad-key secret 保护。

## 部署后验证
1. `curl -H "x-ad-key: <secret>" <libraryExport URL> | jq '.data.cambridgeShutter'` — 出现该字段(可能全 null,正常)。
2. 网站 /admin/fabrics 点「同步AAPP价格」→ 快照更新;AI 聊天里问 shutter 报价,工具返回 `source: aapp_sync`(未部署时为 `defaults`)。
