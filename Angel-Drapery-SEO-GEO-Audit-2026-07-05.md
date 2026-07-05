# Angel Drapery — SEO & GEO 体检报告

审计日期:2026-07-05 · 对象:angel-drapery.com · 范围:技术 SEO、本地 SEO、内容缺口、竞品对比、GEO(生成式引擎优化)

---

## 一、结论摘要

网站的技术底子相当扎实:干净的 robots.txt、正确的 canonical、sitewide 的 LocalBusiness 结构化数据、6 个高质量的本地服务区页面(Temple City/Pasadena/Arcadia/San Marino/San Gabriel/Alhambra),这些是大多数同行网站不会做到的水准。

但有一个**严重问题**和几个**中等问题**在拖累表现:

1. **严重**:Google 索引里还留着旧站(`www.angel-drapery.com/handcrafted-drapery` 等,标题带 "copy" 字样)的页面,这些 URL 现在访问是空/404。这会分流权重、制造重复内容信号,也可能让 AI 引擎抓取到一个已经打不开的旧链接,引用给用户后变成死链接,损害品牌可信度。
2. **中等**:6 个本地服务区页面内容很好,但**没有出现在主导航**里,只能通过 `/service-areas` 首页或直接链接访问,是"孤儿页"风险,内部链接权重不足。
3. **中等**:所有页面的 Open Graph / Twitter 卡片标题和描述都是完全相同的通用文案(尽管每页的 `<title>` 和 meta description 已经写得不错),分享到微信/Instagram/短信时,About、Gallery、Service Area 页面看起来都和首页一模一样。
4. **中等(GEO 关键)**:Yelp 上营业 40 年只有 **1 条评论**。这既拖累 Google 本地排名,也是 AI 答案引擎(ChatGPT/Perplexity/Google AI Overview)判断"这家店可信、值得推荐"的核心信号之一——评论数量和 recency 太薄。
5. 商店 `/store` 页面对爬虫呈现 "Loading..." 占位内容,配合商店尚未正式开门(Coming Soon),这个板块目前对 SEO/GEO 贡献接近零。

总体评估:**基础设施成熟,内容与信任信号是短板**——这与你们内部"网站成熟度评估"报告里"技术上接近成熟、商业上没开门"的结论完全一致,SEO/GEO 层面的表现也是同一个故事的延伸。

---

## 二、技术 SEO 检查

| 检查项 | 状态 | 说明 |
|---|---|---|
| HTTPS | ✅ Pass | 全站 HTTPS,无混合内容问题 |
| robots.txt | ✅ Pass | 允许全站抓取,正确排除 `/admin` `/api` `/store/cart` 等私有路径,声明了 sitemap;有一条专门为 Googlebot 渲染放行 `/api/site-settings` 的例外,说明工程上考虑很细 |
| XML Sitemap | ✅ Pass | `sitemap.xml` 存在且在 robots.txt 中声明 |
| Canonical 标签 | ✅ Pass(首页)/ ⚠️ Warning(旧路径) | 首页 `www` 正确 301/规范化到根域;但旧站遗留路径(见下方"严重问题")未被清理 |
| **重复/僵尸页面** | 🔴 **Critical** | Google 索引中仍有 `www.angel-drapery.com/handcrafted-drapery`、`/verticalblind`、`/add-semi`、`/roller-shade` 等旧版页面,标题含 "copy" 字样,访问返回空内容。需要 301 重定向到新站对应页面,或在 Search Console 提交移除 |
| LocalBusiness 结构化数据 | ✅ Pass | `layout.tsx` 中全站注入 `HomeAndConstructionBusiness` schema,含地址、服务城市、Offer 列表——这对本地 SEO 和 GEO 都是加分项 |
| Product JSON-LD | ✅ Pass | 产品页有独立 JSON-LD(`productJsonLd.ts`) |
| FAQPage 结构化数据 | ⚠️ Warning | 目前只有 `/smart-shades` 一个页面用了 FAQ schema,内容其实写得很好,应该扩展到 Contact、Products、Service Area 页面 |
| Open Graph / Twitter 卡片 | ⚠️ Warning | 全站 og:title / og:description / twitter 卡片文案完全相同,没有针对每个页面定制,分享任何内页看起来都像首页 |
| Meta description | ✅ Pass | 每个抽查页面都有独立、可读的描述(不是模板复制),这点比很多网站做得好 |
| Meta keywords | 🟡 Low | 全站使用同一组关键词标签,现代搜索引擎基本不参考此标签,不影响排名,可以不管 |
| llms.txt | 🟡 Low(机会) | 不存在。这是面向 AI 抓取/引用的新兴标准,添加成本很低 |
| 移动端适配 | ✅ Pass | viewport meta 正确配置 |
| 首页视频背景 | ⚠️ Warning | 首页仍是 `<video>` 背景(`/media/site/home/...mp4`),之前内部审查报告标注的 "无 poster 占位、首屏可能空白 6-9 秒" 问题看起来还在,影响 LCP(Core Web Vital) |
| 服务区页面导航可达性 | ⚠️ Warning | `/service-areas` 及 6 个城市页内容质量高,互相交叉链接也做了,但主导航(Home/About/Gallery/Products/Store/Contact)里完全没有入口,是孤儿页风险 |

---

## 三、GEO(生成式引擎优化)体检

GEO 关注的是网站内容能否被 ChatGPT、Perplexity、Google AI Overview 这类生成式引擎理解、信任并引用。

**已具备的基础(比大部分同行好)**

- 全站 LocalBusiness schema,清楚定义了商家实体、地址、服务城市、服务列表——这是 AI 引擎做实体识别(entity recognition)的关键输入。
- Smart Shades 页面的 FAQ 内容(Q&A 格式,自然语言,直接回答"没有网络能用吗""断电怎么办")正是 AI 引擎最容易摘录、引用的内容形态。
- 城市服务页写得像真人写的本地内容(提到 craftsman bungalow、condo 玻璃窗等具体场景),而不是模板化的"我们服务 XX 市"套话,这类内容更容易被当作可信来源摘录。

**短板**

- **评论信号薄弱**:Yelp 只有 1 条评论。AI 引擎在回答"Temple City 有什么靠谱的窗帘店"这类问题时,会参考 Yelp/Google 评论密度和评分作为信任代理;评论太少会被判定为信号不足,即使实际口碑很好。
- **实体链接(sameAs)不完整**:LocalBusiness schema 里 `sameAs` 只填了 Instagram 一个链接。建议补上 Google Business Profile、Yelp、Facebook(如有),让 AI 和搜索引擎把这些信息源关联到同一个实体,强化知识图谱信号。
- **FAQ 覆盖面太窄**:只有 1 个页面有结构化 FAQ,而"如何测量窗户""定制窗帘大概多少钱""罗马帘和卷帘怎么选"这类问题式内容是 AI 引擎最常引用的类型,目前网站完全没有(内部评估报告也提到缺 How to Measure 指南和 FAQ 页)。
- **没有长尾/指南型内容**:没有博客或独立指南页面。AI 引擎回答"how to measure windows for curtains"这类信息型问题时,大概率会引用有独立指南页的网站,而不是电商产品页。
- **llms.txt 缺失**:低优先级但零成本的加分项。

---

## 四、关键词机会(15+ 项)

| 关键词 | 预估难度 | 机会分 | 当前排名信号 | 搜索意图 | 建议内容形式 |
|---|---|---|---|---|---|
| custom drapery Pasadena | 中 | 高 | 已有 `/service-areas/pasadena` 页面,但未被主导航收录、权重不足 | 交易型 | 优化现有页 + 加入主导航 |
| Hunter Douglas dealer Temple City | 低 | 高 | 本地对手 Golden Carpets 同城竞争,Angel Drapery 有主场优势 | 交易型 | 强化 Google Business Profile + 首页/关于页明确"Authorized Dealer"措辞 |
| roman shades San Gabriel Valley | 中 | 高 | 弱 | 交易型 | 现有 `/products/handcrafted-roman-shade` 页可加地域词 |
| motorized shades Apple HomeKit | 低 | 高 | `/smart-shades` 已覆盖较好 | 商业调研型 | 已有,建议加案例/视频 |
| how to measure windows for curtains | 低 | 高(长尾) | 无覆盖 | 信息型 | 新建指南页(快速见效) |
| custom shutters Arcadia | 中 | 中 | 无独立页面 | 交易型 | 城市页 + 产品页交叉链接 |
| blackout drapery Los Angeles | 高 | 中 | 弱 | 交易型 | Gallery 已有相关案例,可单独成页 |
| free window measurement consultation LA | 低 | 中 | Contact 页已部分覆盖 | 交易型 | 加入 CTA 优化 |
| Hunter Douglas PowerView near me | 中 | 中 | `/smart-shades` 部分覆盖 | 交易型 | 加本地案例视频 |
| San Gabriel Valley window treatments | 中 | 高 | `/service-areas` hub 已覆盖 | 交易型 | 提升导航可达性即可放大效果 |
| custom drapery vs ready made curtains | 低 | 中(长尾) | 无覆盖 | 信息型 | 对比型博客/指南页 |
| roman shade styles flat hobbled relaxed | 低 | 中(长尾) | 无覆盖 | 信息型 | 产品教育页,可直接用 AAPP 参数 |
| zebra shades vs roller shades | 低 | 中 | Luma Collection 页部分覆盖 | 商业调研型 | 对比内容 |
| smart shades power outage | 低 | 中(长尾) | `/smart-shades` FAQ 已覆盖 | 信息型 | 已覆盖,可独立成文放大长尾流量 |
| Title 24 energy efficient window coverings | 低 | 低-中 | `/smart-shades` 提到但未展开 | 信息型 | 独立页可吸引节能相关搜索 |
| custom window treatments Alhambra condo | 中 | 中 | `/service-areas/alhambra` 已覆盖 | 交易型 | 加入主导航提升权重 |
| pinch pleat drapery cost | 中 | 中(长尾) | 无覆盖 | 商业调研型 | 定价说明/FAQ |
| fabric swatch sample order | 低 | 高(转化) | 网站无此功能(内部报告已指出) | 交易型 | 产品功能 + 对应落地页 |

---

## 五、竞品对比

| 维度 | Angel Drapery | Golden Carpets(同城) | Calico Corners(Pasadena) | The Jacoby Company |
|---|---|---|---|---|
| 本地服务页 | 6 个城市页,内容优质但未入导航 | 未见独立城市页 | 门店页为主 | 门店页为主 |
| 结构化数据 | LocalBusiness + Product JSON-LD,较完整 | 未知,大概率无 | 未知 | 未知 |
| 评论数量 | Yelp 仅 1 条 | 未知,需查证 | 连锁品牌,通常评论较多 | 40+ 年历史,通常评论较多 |
| 智能家居定位 | HomeKit/Google Home/Matter,内容详细 | 未见同等深度 | 未见 | 未见 |
| 电商/在线购买 | 有(未开门) | 未见 | 有官网商城 | 未见 |
| 内容深度(指南类) | 缺 FAQ/测量指南 | 未知 | 未知 | 未知 |

结论:Angel Drapery 在"智能家居集成"和"结构化数据/技术 SEO"上明显领先本地对手,这是差异化优势,值得在营销文案里放大。短板集中在信任信号(评论)和内容广度(指南类),这两块投入产出比最高。

---

## 六、优先行动计划

**本周就能做(Quick Wins)**

- 清理/301 重定向旧站 `www.angel-drapery.com/*` 遗留页面,或在 Search Console 提交移除请求 — 影响:高,工作量:低
- 把 `/service-areas` 加入主导航(哪怕是二级菜单)— 影响:高,工作量:低
- 引导现有客户在 Yelp/Google 留评论(哪怕只做一轮邮件/短信邀请)— 影响:高,工作量:低
- 补充 LocalBusiness schema 的 `sameAs`(Google Business Profile、Yelp 链接)— 影响:中,工作量:低
- 首页视频加 `poster` 占位图 — 影响:中(Core Web Vitals),工作量:低
- 新增 `llms.txt` — 影响:低,工作量:极低

**本季度规划(Strategic Investments)**

- 新建 "How to Measure" 测量指南页(inside/outside mount 图解)+ FAQ 页,补 FAQPage schema — 影响:高,工作量:中
- 各产品页/城市页补充 FAQ 结构化数据(目前只有 smart-shades 一页有)— 影响:中,工作量:中
- 为每个页面定制独立的 Open Graph / Twitter 卡片文案和图片 — 影响:中,工作量:中
- 上线免费样品(swatch)订购功能 + 对应落地页(内部报告已指出这是转化杠杆)— 影响:高,工作量:中-高
- 围绕关键词机会表里的长尾词做 3-5 篇指南型内容(测量、罗马帘选型、智能家居等)— 影响:高,工作量:中

---

## 后续可做

需要的话我可以接着:

- 把测量指南 / FAQ 页的内容大纲和文案写出来
- 针对首页、Gallery、Products 等页面生成定制化的 title/meta description/OG 文案
- 起草一份"邀请评论"的邮件/短信模板
- 针对某一个具体竞品(比如 Golden Carpets)做更深入的一对一对比
