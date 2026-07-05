# Angel Drapery 网站 — 下一步执行计划（交接文档）

> 写给下一个执行的 AI 模型（或人）。日期 2026-07-05。
> 本文档假设读者没有之前的对话记忆。执行任何任务前先读完「背景」和「军规」。

---

## 背景：现状快照

- 站点：angel-drapery.com（Vercel 项目 `window-treatments-web`，团队 angeldrapery2100-makers-projects），推 GitHub main 即自动部署。
- Monorepo：`apps/web`（Next.js 15 App Router + Tailwind）、`apps/api`（次要）、`packages/shared`（定价引擎 + vitest 测试）。数据库 Neon Postgres，图片 Cloudflare R2，支付 Stripe（**目前仍是测试密钥**），运费 Shippo，邮件 Resend，AI 客服 Anthropic API（Vercel 已配 ANTHROPIC_API_KEY）。
- 商店 `/store` 仍处于 **Coming Soon**（后台开关控制），未正式开店。
- 已完成（勿重做）：AAPP 对齐定价引擎（packages/shared/src/pricing/aapp/，43 个测试）、免费样品加购（$2.99/$9.99 两档运费）、全站 AI 客服（HD/Sundance 知识库 + 检索）、全屋定制表单 /store/whole-home、订单/发货/售后/评价/2FA 全链路、首页 LCP 修复、统一页脚 SiteFooter、/how-to-measure 与 /faq 页面。

## 军规（执行任何任务前必读）

1. **验证命令**（每次改完必须跑，两个都过才算完）：
   ```bash
   cd apps/web && ../../node_modules/.bin/tsc --noEmit        # 必须 exit 0
   cd packages/shared && npx vitest run                        # 必须 43+ 全绿
   ```
2. **定价是命门**：`packages/shared/src/pricing/aapp/` 与内部软件 AAPP（/Volumes/SSD2T/Projects/AAPP）逐字节对齐，公式规格在 `docs/aapp-pricing-spec.md`，接线约定在 `docs/aapp-engine-wiring.md`。**AAPP 改价必须同步这里并跑测试；反之网站不得擅自改公式。** 测试期望值失配 = 两边不同步的警报，绝不允许改期望值来让测试通过。
3. **服务端核价双路径必须同步改**：`/api/store/pricing/calculate`（前台显示）和 `lib/productPricing.computeServerUnitPrice`（结算防篡改）是同一逻辑的两个入口，改一个必须改另一个。
4. **AI 客服知识库**：资料在 `apps/web/src/app/api/store/assistant/knowledge/*.md`。改完必须跑 `node apps/web/scripts/generate-assistant-knowledge.mjs` 重新生成 `knowledge.generated.ts` 并一起提交。**知识文件里绝不能出现价格数字、批发价、内部流程。**
5. **沙盒 git 怪癖**（Claude Cowork 环境）：`.git` 下的锁文件无法 unlink，报 "index.lock exists" 时用 `mv .git/index.lock .git/index.lock.stale` 绕开再重试；沙盒无法跑 `next build`（Linux/ARM 二进制下不了），以 tsc + vitest 为准，完整构建交给 Vercel。
6. **部署 = git push origin main**。沙盒无 GitHub 凭据，push 让 Eddie 在自己终端跑。Vercel 构建失败不影响线上（保持旧版）。
7. 改动保持小而聚焦，一个提交对应一件事。不要引入新框架/大重构。

---

## Phase A — 开店切换（最高优先级，Eddie 人工为主，约 1 天）

这些是 Stripe/Vercel 后台操作，AI 只能陪跑指导。完整步骤在 `docs/go-live-checklist.md`，要点：

- [ ] A1. Stripe 切正式模式：替换 Vercel 环境变量 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`（pk_live）、`STRIPE_SECRET_KEY`（sk_live）
- [ ] A2. 正式模式重建 webhook（https://angel-drapery.com/api/store/webhook，监听 payment_intent.succeeded），更新 `STRIPE_WEBHOOK_SECRET`
- [ ] A3. 正式模式启用 Stripe Tax + 加州注册（代码已就绪）
- [ ] A4. Resend 验证 angel-drapery.com 域名（交易邮件发件人）
- [ ] A5. 后台 admin → site-content 先点一次 Seed（让新的 hero poster 字段出现）→ 上传 hero 视频首帧图（解决首屏加载感知）
- [ ] A6. 用正式卡小额真实下单一次样品单验证全链路，然后 admin 打开商店开关

## Phase B — 商品上架 + 报价对齐落地（AI 协助 + Eddie 配合，1-2 周）

- [ ] B1. **首批热门布料商品上架**：Eddie 在后台挑热门面料建商品。AI 任务：按 `docs/aapp-engine-wiring.md` 给每个商品的 `default_config.params` 配 `aapp_engine` 及选项结构（选项 value = AAPP key；面料选项值挂 fabric_price_per_yard / fabric_width_in 数值参数）。
- [ ] B2. **对价验收**（每个商品必做）：同一组宽高+选项，在网站配置器和 AAPP 里各报一次价，2-3 组尺寸完全一致才算过。不一致 → 检查选项映射，再不一致 → 对照 aapp-pricing-spec.md 排查，禁止手动改价凑数。
- [ ] B3. 检查每个上架商品的面料选项 name 含 "fabric"（SwatchCard 靠这个识别，否则样品卡片不显示对应面料名）。
- [ ] B4. SOMFY 电动轨道 / 窗帘杆商品建档（engine 已支持 drapery_hardware / somfy_track，见 wiring 文档 §4/§5）。

**给下个模型的现成提示词（B1/B2）：**
```
你在 /Volumes/SSD2T/Projects/window-treatments 工作。读 docs/aapp-engine-wiring.md 和
docs/aapp-pricing-spec.md。任务：为商品「<名称>」（product id <id>）配置 AAPP 对齐定价：
1. 给出 default_config.params 和 options 的完整 JSON（aapp_engine=<engine>，选项 value 用 AAPP key）
2. 用规格书公式手算 3 组测试尺寸的期望价，列出中间步骤
3. 告诉我在后台哪里粘贴、如何用 /api/store/pricing/calculate 验证
约束：不改引擎代码；价格与 AAPP 一切以软件为准。
```

## Phase C — 上线后第一周：验证与监控

- [ ] C1. 全流程真实测试清单：普通定制单（Shippo 运费+Stripe Tax）、纯样品单（$2.99/$9.99 两档）、混合单、折扣码、部分退款、游客查单 /store/track、售后工单、whole-home 表单邮件、AI 客服中英双语 + 拒绝报价。
- [ ] C2. 确认所有交易邮件进收件箱不进垃圾箱（Resend 域名 SPF/DKIM）。
- [ ] C3. Shippo tracking webhook：发货后确认妥投自动推进订单状态。
- [ ] C4. CSP 目前是 Report-Only（next.config.ts）：观察一周浏览器控制台无违规后，把 header key 从 `Content-Security-Policy-Report-Only` 改成 `Content-Security-Policy` 正式启用。
- [ ] C5. AI 客服用量监控（console.anthropic.com）；如被滥用，收紧 route.ts 里的 rateLimit 参数。

## Phase D — 增长期改进（按转化数据排优先级）

- [ ] D1. **Affirm/Klarna 分期**：Stripe 后台开通即可（代码已用 automatic_payment_methods），大额定制单转化利器。
- [ ] D2. 登录用户购物车服务端同步（新 carts 表，登录时合并 localStorage）——定制配置耗时长，丢车伤害大。
- [ ] D3. 商品草稿/预览状态 + pricing_configs 版本化回滚（后台改价安全网）。
- [ ] D4. 邀评邮件：订单完成 30 天后自动发（评价系统已有，只差触发器；可用 Vercel cron）。
- [ ] D5. /how-to-measure 和 /faq 内容充实（页面骨架已建）：从 AI 客服知识库 core-knowledge.md 取材，配图解；这也是 SEO 长尾入口。
- [ ] D6. AI 客服迭代：收集真实对话中答不上的问题 → 补知识文件 → 跑 generate 脚本 → 部署。考虑加"转人工时自动带上聊天记录提交 whole-home 表单"。
- [ ] D7. 订单时间线 UI、运费成本对账（shipments 表加 label_cost）。
- [ ] D8. 把「AAPP↔网站定价同步」规则写进 AAPP 的 CLAUDE.md（AAPP 侧改价提醒同步网站）。

## 明确不做（保持简单，此前已论证）

库存管理（按单生产无意义）、自助 RMA 退货、多币种、营销自动化全家桶、UI 框架重构。

---

## 关键文件地图（给下个模型）

| 关注点 | 位置 |
|---|---|
| AAPP 对齐定价引擎 + 测试 | `packages/shared/src/pricing/aapp/`，`packages/shared/src/pricing/__tests__/aapp*.test.ts` |
| 定价公式规格（权威） | `docs/aapp-pricing-spec.md` |
| 商品接线指南（后台配置方法） | `docs/aapp-engine-wiring.md` |
| 前台报价 API / 服务端核价 | `apps/web/src/app/api/store/pricing/calculate/route.ts`，`apps/web/src/lib/productPricing.ts` |
| 订单创建/核价/邮件 | `apps/web/src/lib/createOrder.ts`，`orderPricing.ts`，`orderEmails.ts` |
| 样品功能 | `apps/web/src/lib/cart.ts`（isSwatch/限5），`store/[id]/components/shared/SwatchCard.tsx`，运费档 `lib/site.ts` SWATCH_SHIPPING_RATES |
| AI 客服 | API `apps/web/src/app/api/store/assistant/route.ts`（system prompt + 检索），组件 `components/StoreAssistant.tsx`，知识 `.../assistant/knowledge/`，生成脚本 `apps/web/scripts/generate-assistant-knowledge.mjs` |
| 全屋定制 | `apps/web/src/app/store/whole-home/`，`api/store/whole-home/route.ts` |
| 结算页（样品运费两档逻辑） | `apps/web/src/app/store/checkout/page.tsx`（swatchOnly 分支） |
| 统一页脚 | `apps/web/src/components/SiteFooter.tsx` |
| 开店切换清单 | `docs/go-live-checklist.md` |
| 差距分析（历史，大部分已完成） | `docs/store-gap-analysis.md` |
| 环境变量 | Vercel：Stripe×3、DATABASE_URL、R2×5、SHIPPO、RESEND_API_KEY、ANTHROPIC_API_KEY、ASSISTANT_MODEL(可选)、NEXT_PUBLIC_CDN_URL |
