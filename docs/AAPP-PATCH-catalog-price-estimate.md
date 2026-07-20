# AAPP 补丁待审:chatgptAction 增加只读 `catalog_price_estimate` action

> 状态:**待 Eddie 审阅,未应用**(你说"先看 diff 再动")。审过说"批准"我再应用到
> `functions/index.js`,你部署 `firebase deploy --only functions:chatgptAction`。
>
> 目的:B — 让网站 AI 给 Sundance / JC 参考报价(2026-07-19 你决定放开)。
> 网站侧已接好(`lib/sundanceJcPricing.ts` + 工具 `get_sundance_jc_estimate`),
> 部署这个 action 前它返回 not_configured、AI 自动降级到定性+导流咨询。

## 为什么很小、很安全
- **纯只读**:复用 AAPP 已有的 `_aiPriceCatalogItem`(create_quote_draft 用的同一个 pricer)
  + `_aiLoadPricingContext`(已有的库加载器),**不写任何数据、不建报价、无审计需要**。
- 不改任何现有计价逻辑,只是把内部单件计价包一层暴露成只读估价。
- 网站拿到的是软件售价,会在网站侧模糊成 $50 粒度的参考区间(精确数字永不到达模型),
  对客一律"参考价、最终以免费上门测量为准"——和 HD 同口径。

## 改动一:新增函数(插在 `_aiHdPriceLookup` 之后)

```js
// ── catalog_price_estimate (read-only Sundance/JC/catalog estimate) ──────────
// Wraps the existing _aiPriceCatalogItem (same pricer create_quote_draft uses).
// No writes. Website blurs the returned sell price into a reference RANGE.
async function _aiCatalogPriceEstimate(data) {
  const p = data || {};
  const variant = _aiCleanString(p.productVariant || p.variant || '', 60);
  if (!variant) throw new HttpsError('invalid-argument', 'productVariant is required.');
  const cfg = (p.productConfig && typeof p.productConfig === 'object') ? p.productConfig : {};
  const widthIn = Number(p.widthIn != null ? p.widthIn : p.width_in) || 0;
  const heightIn = Number(p.heightIn != null ? p.heightIn : p.height_in) || 0;
  let ctx;
  try { ctx = await _aiLoadPricingContext(); }
  catch (e) { throw new HttpsError('unavailable', 'pricing library unavailable'); }
  const out = _aiPriceCatalogItem(variant, cfg, widthIn, heightIn, ctx);
  if (!out || out.unsupported) return { ok: false, error: 'unsupported_variant' };
  if (out.unconfigured) return { ok: false, unconfigured: true, missing: out.missing || null };
  if (out.error) return { ok: false, error: out.error };
  const pr = out.pricing || {};
  const price = (pr.subtotal != null) ? pr.subtotal : pr.price;
  return {
    ok: true,
    variant,
    listPrice: price,
    disclaimer: 'Software sell price for this config. Website presents a reference RANGE only; final price from the designer after the free in-home measure.'
  };
}
```

## 改动二:分发器加一行(在 `hd_price_lookup` 分支旁)

```diff
       else if (action === 'hd_price_lookup') out = _aiHdPriceLookup(body);
+      else if (action === 'catalog_price_estimate') out = await _aiCatalogPriceEstimate(body);
       else if (action === 'recommend_drapery_size') out = _aiRecommendDraperySize(body);
```

## 改动三(可选,给 GPT 也能用):OpenAPI + 指令
如果你也想让内部 GPT 用这个只读估价(不必每次建草稿就能看价),我再给
`ChatGPT Assistant/chatgpt-action-openapi.yaml` 加一个 `/catalog_price_estimate` op。
纯网站用的话这步可跳过——网站是用 Bearer token 直接调,不经过 GPT builder。

## 部署 + 验证
1. 应用改动一、二 → `firebase deploy --only functions:chatgptAction`。
2. 网站聊天里问 Sundance 卷帘报价(先让它 identify_fabric_code 认产品),应给出参考区间。
3. 配置不全时 action 返回 `unconfigured` + `missing`,AI 会追问或导流咨询。
