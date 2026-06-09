# Angel Drapery 在线商店 — 上线切换清单(测试模式 → 正式模式)

> 用途:把网站从 Stripe **测试模式**切到**正式模式**、对真实客户开店。
> 原则:**一次性、按顺序、当天完成**。切之前商店保持 Coming Soon;全部验证通过后再打开开关。
> 当前状态(2026-06-08):全流程已在测试模式验证通过,商店关闭中。正式 Stripe 账号已激活。

---

## 切换前提(确认这些都已就绪)

- [ ] Stripe 正式账号企业资质审核已通过(可正式收款)
- [ ] angel-drapery.com 域名在 Resend 已验证(交易邮件发件人正常)
- [ ] 所有 P0/P1 代码已部署到生产(main 分支)
- [ ] 旧 admin 密码已轮换(已完成)

---

## 第 1 步:Stripe 密钥换成正式版(Vercel 环境变量)

在 Stripe 后台右上角**切到正式模式**,然后:

1. Developers → API keys,复制正式版密钥
2. Vercel → Settings → Environment Variables,替换为正式值:
   - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - [ ] `STRIPE_SECRET_KEY` → `sk_live_...`(用 Stripe 的"复制"按钮,避免漏字符——之前出过 `k_test_` 缺首字母的坑)

> ⚠️ 注意:`STRIPE_SECRET_KEY` 是 Sensitive,粘贴时确认无多余空格/引号(代码里已有 trim 兜底,但仍以干净值为准)。

## 第 2 步:在正式模式重建 Stripe Webhook

webhook 签名密钥(whsec_)**每个模式不同**,正式模式必须重建:

1. Stripe(正式模式)→ Developers → Webhooks → Add endpoint
2. URL:`https://angel-drapery.com/api/store/webhook`
3. 监听事件:至少勾选 `payment_intent.succeeded`
4. 创建后复制 **Signing secret**(`whsec_...`)
5. Vercel 环境变量:
   - [ ] `STRIPE_WEBHOOK_SECRET` → 正式模式的 `whsec_...`

## 第 3 步:在正式模式配置 Stripe Tax

测试模式的 Tax 配置**不会自动带到正式模式**:

1. Stripe(正式模式)→ Tax
2. [ ] 启用 Tax
3. [ ] 填**始发地/公司地址**:335 N Dodsworth Ave, Covina, CA 91724
4. [ ] Registrations → 添加 **California**(销售税),选"我自己报税"(不要买 $90/月 Taxually)
5. [ ] (可选)默认产品税类别设为实体商品 — 代码已对每个商品显式传 `txcd_99999999`,此项为双保险

> 提示:Stripe 后台部分配置支持"从测试模式复制到正式模式",能用就用。

## 第 4 步:Shippo Webhook(物流自动追踪)

1. [ ] Shippo → Settings → Webhooks → 添加 `https://angel-drapery.com/api/store/shippo-webhook?token=<自定义密钥>`,事件勾 **Track Updated**
2. [ ] Vercel 环境变量 `SHIPPO_WEBHOOK_SECRET` = 同一个密钥
3. [ ] 确认 `SHIPPO_API_KEY` 是正式版(若发货走真实面单)

## 第 5 步:重新部署

- [ ] 改完所有环境变量后,Vercel **Redeploy**(环境变量变更必须重新部署才生效)

## 第 6 步:真卡冒烟测试(最关键)

> 用一张**真实信用卡**、挑**最便宜的商品**下一单,验证真实链路。完成后立即退款。

1. [ ] 临时打开商店开关(后台 Dashboard → Online Store)
2. [ ] 真卡下单一笔小额订单
3. [ ] 验证:
   - [ ] 跳转到订单确认页,无报错
   - [ ] 后台只生成**一笔**订单(去重正常),金额/税额/运费正确,税来自 Stripe
   - [ ] **客户邮箱**收到确认邮件、**admin@** 收到新单通知
   - [ ] Stripe(正式模式)Webhooks → 事件交付显示 `payment_intent.succeeded` 返回 200
   - [ ] 用单号+邮箱在 /store/track 能查到
4. [ ] 后台把这笔真卡测试单 **Cancel & Refund**(整单退款),确认客户收到取消邮件
5. [ ] 关闭商店开关

## 第 7 步:正式开店

- [ ] 上述全部通过 → 打开商店开关(Online Store = ON)
- [ ] 在隐身窗口访问 /store,确认对访客正常显示、可下单
- [ ] 通知相关人员已上线

---

## 回滚预案

如果上线后发现严重问题:

1. **立即关闭商店开关**(后台 Dashboard,5 秒生效,变回 Coming Soon)——这会拦住 /store 列表页入口
2. 如需彻底拦截:在 Vercel 把 `online_store_enabled` 相关或回滚到上一个部署
3. 已产生的真实订单:后台 Cancel & Refund 逐笔退款
4. 排查日志:Vercel → Logs;Stripe → Developers → Logs / Events

---

## 已知事项 / 备注

- 本地州税率表(加州 8.82%)仅作 Stripe Tax 不可用时的**兜底**;实际 Covina 正确税率约 10.5%,正式模式以 Stripe 为准。
- 旧 admin 密码(12233445)仍残留在 git 历史中;密码已轮换,但若仓库曾公开过,考虑 rotate 数据库等其他凭据。
- Webhook 兜底建单:即使客户浏览器在支付后没跳转,Stripe webhook 也会用 pending_checkouts 重建订单(已验证)。
- 订单去重:`orders.payment_intent_id` 有唯一索引,浏览器与 webhook 不会重复建单(已验证)。
