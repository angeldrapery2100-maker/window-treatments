# 网站 AI 客服 vs 内部 GPT 助理 — 功能对比与移植建议

> 2026-07-19 调研。GPT 侧依据:`AAPP/ChatGPT Assistant/`(gpt-instructions.txt、chatgpt-action-openapi.yaml 17 个 action、知识文件)、`AI-CHATGPT-ASSISTANT-DESIGN.md`、`functions/index.js` chatgptAction 实现。网站侧依据:`/api/store/assistant` + `assistantTools.ts`(现有 15 个工具)+ knowledge 生成链。

---

## 0. 一句话定位

| | 内部 GPT("Angel Drapery 助理") | 网站 AI 客服 |
|---|---|---|
| 给谁用 | **Eddie / 员工**(内部工具) | **客户**(导购+客服) |
| 跑在哪 | ChatGPT Custom GPT + AAPP 云函数 Actions | 网站自己的服务端(Anthropic API,claude-haiku) |
| 权限哲学 | 深度读写 AAPP(CRM/报价/合同/工单),写前确认+审计 | 只读商店引擎 + 客户自己的数据,永不碰 AAPP 内部数据 |
| 语言 | 中文为主(对 Eddie) | 客户什么语言就回什么语言,界面英文 |

两者不是竞争关系:GPT 是"内部操作台",网站 AI 是"前台销售"。移植的方向是把 GPT 的**知识和只读能力**下放给网站,写操作类绝不下放。

---

## 一、逐项能力对照

### 1. 知识库
| 能力 | GPT | 网站 AI |
|---|---|---|
| HD 知识库 1-4(全系列规格) | ✅ 上传文件 | ✅ 同源文件,按关键词检索注入 |
| Sundance 知识库 | ✅ | ✅(+今天新增品牌背景段) |
| 业务事实单源 | ✅ 业务事实单源.md | ✅ business-facts.md(同步维护的姊妹版) |
| HD 电动/配件价目 | ✅ HD_Motorization_Accessory_Pricing.md | ⚠️ 间接(通过 hd_price_lookup 引擎),文件本身未入库 |
| **销售话术·品牌比价**(三档定位、12 窗实测、单窗例子) | ✅ 专用文件+纪律 | ❌ **没有** |
| AAPP 产品配置指南 / 员工使用手册(21 万字) | ✅ | ❌(内部内容,不该有) |
| 行业顾问(褶距/滑轮数/用料公式,展示计算过程) | ✅ 指令要求 | ⚠️ 部分(推荐尺寸引擎有,但不展示计算) |

### 2. 报价能力
| 能力 | GPT | 网站 AI |
|---|---|---|
| 在线商店产品精确报价 | ❌(不接网站引擎) | ✅ quote_store_product(与结账同引擎) |
| Luma/Sundance/JC/Cambridge/Somfy/布帘/罗马帘 **全目录服务端计价** | ✅ create_quote_draft 走 AAPP `_price*` 引擎 | ⚠️ 部分:Luma 系+布帘+罗马帘+五金(商店引擎)+ Cambridge shutter(今天上线);**Sundance/JC/Somfy 无** |
| HD 官方价查询 | ✅ hd_price_lookup(内部精确 list price) | ✅ get_hd_estimate(同一引擎,模糊成区间对客) |
| 面料代码识别(EB12-005 → 哪个产品) | ✅ resolve_product 跨目录 | ❌ 仅商店在售面料 |
| 产品库规格问答(某电机多少钱/轨道 return/最高帘高) | ✅ library_query 实时只读 | ❌ 只有静态知识 |
| 报价落地 | ✅ 生成 AAPP 报价草稿+合同签署链接 | ✅ 存 Home Project → 购物车结账(商店内);店外→导流预约 |

### 3. 客户资料 / CRM(GPT 独有域)
| 能力 | GPT | 网站 AI |
|---|---|---|
| 模糊搜客户/报价/订单/维修("五月份 Irvine 姓陈的") | ✅ search_records(+Google Drive 匹配) | ❌(客户只能查自己的订单) |
| 读完整档案 | ✅ get_record | ❌ |
| 建客户档案(截图 OCR 提取姓名地址) | ✅ create_client(查重) | ⚠️ 半个:submit_website_inquiry 建咨询线索 |
| 白名单字段更新/删除记录 | ✅ apply_update / delete_* | ❌ 永不 |
| 报价草稿增改/克隆改配置/HD 报价单导入 | ✅ 5 个 action | ❌ 永不 |
| 合同签署链接 | ✅ create_contract_link | ❌ |
| 改工单(luma/jc 系) | ✅ edit_work_order | ❌ |

### 4. 测量
| 能力 | GPT | 网站 AI |
|---|---|---|
| 保存测量记录(逐窗:位置/mount/内外框/净空/形状) | ✅ save_measurement 存进 AAPP 客户档案 | ✅ 今天上线:/measure-wizard 尺寸表 + list_measured_windows 读取 |
| 从测量 PDF/截图提取尺寸 | ✅(ChatGPT 视觉) | ⚠️ 有视觉(②图片上传)但提示词没教它"从照片提取尺寸并存表" |
| 推荐成品尺寸(AAPP 算法) | ⚠️ 靠知识文件里的公式,人肉算 | ✅ **引擎级**(recommend_drapery_size,AAPP 逐行移植) |
| 引导客户量窗(示意图/步骤) | ❌ | ✅ 聊天向导 + /measure-wizard 页 |

### 5. 订单与售后
| 能力 | GPT | 网站 AI |
|---|---|---|
| 查订单 | ✅ 任何客户(内部) | ✅ 只能本人(登录或订单号+ZIP 验证) |
| 改单/取消/售后工单 | ✅ 直接操作 AAPP | ✅ submit_service_request(48h 窗口,人工终审) |
| 预约(上门测量/到店) | ❌(Eddie 自己排) | ✅ submit_website_inquiry → 预约链接+短信 |

### 6. 交互与体验
| 能力 | GPT | 网站 AI |
|---|---|---|
| 图片输入 | ✅(ChatGPT 自带) | ✅ ②图片上传(压缩、仅当轮上传) |
| 语音 | ⚠️ 键盘听写(Voice Mode 不能调 Action) | ❌ |
| 会话记忆 | ✅ ChatGPT 线程天然持久 | ⚠️ sessionStorage(同标签页存活,换设备即失) |
| 快捷选项 chips | ❌ | ✅ 每轮 AI 生成 |
| 预约/产品链接按钮 | ⚠️ 文本链接 | ✅ 渲染成按钮/可点链接 |
| 主动营销(lead scoring、campaign 归因) | ❌ | ✅ 全套 |

### 7. 安全
| | GPT | 网站 AI |
|---|---|---|
| 写操作 | 二次确认 + CONFIRM 令牌 + aiAssistantAudit 审计 | 仅限客户自己数据;取消必须复述+确认;人工终审退款 |
| 价格纪律 | 不泄内部倍率/工厂价/client factor | 每个数字必须来自工具;HD 只报区间;Sundance 定性 |

---

## 二、GPT 有、网站没有 → 移植评估

**✔ 建议移植(P0,低成本高价值)**

1. **拍照提取尺寸并存入尺寸表**:视觉能力已有、尺寸表已有,只差提示词 + 一个 `save_measured_window` 工具(尺寸表目前 AI 只读)。客户拍手写测量单/窗户照片,AI 直接建卡。对应 GPT 的 save_measurement 流程,客户版。
2. **品牌比价话术知识库**:把《销售话术_品牌与产品比价》客户化后加入网站知识库——三档定位话术("Luma 性价比/Sundance 美国中档/HD 行业奔驰")、"单窗举例不报总价"、"不贬 HD 当锚点"这些纪律对网站 AI 同样适用。⚠️ 需你拍板:话术里的**单窗参考数字**(Luma $157 / Sundance ~$301 / HD $575-1012 @48×60)要不要对客户说?Sundance 数字与今天"只定性不报数"的决定冲突——可以只保留倍率关系("Sundance 大约是 Luma 的 1.6 倍")或完全定性。
3. **HD 电动/配件价目文件入库**:HD_Motorization_Accessory_Pricing.md 加进网站知识检索(报价仍走工具,但 AI 能答"PowerView 网关是什么/要几个"这类规格题)。

**✔ 建议移植(P1,需少量后端)**

4. **library_query 只读代理**:网站服务端转发到 AAPP chatgptAction(现成的 `AAPP_CHATGPT_ACTION_TOKEN` 就能用),让客户问"电动轨道最高能做多高/有哪些电机可选"时拿到**实时库数据**;网站侧必须过滤所有价格字段,只透规格。AAPP 零改动。
5. **resolve_product 代理**:客户报面料码(如 Sundance PG5 Dorus)直接识别是什么产品、引导到对应流程。同样走现有 token,零 AAPP 改动。
6. **会话持久化**:登录客户的聊天记录存服务端,跨设备继续聊(对应 GPT 线程记忆)。中等工作量。

**⚠ 待你拍板(P2)**

7. **Sundance / JC 参考报价**:AAPP CF 里现成有 Sundance roller/blinds、JC blinds/woven 的服务端计价(create_quote_draft 用的 `_price*` 系列)。技术上可以像 Cambridge shutter 一样做参考报价——但和今天"Sundance 只定性"的决定相反,你说了算。
8. **语音输入**:浏览器 Web Speech API,英文识别好、中文一般。锦上添花。

**✘ 不该移植(内部专属,列出来是划红线)**

- search_records/get_record(翻任意客户档案)、create_client/apply_update/delete_*(写 CRM)、报价草稿五件套、create_contract_link、edit_work_order——全部涉及他人数据或写 AAPP,客户侧永不开放。
- AAPP 员工使用手册、产品配置指南、内部成本口径(倍率/工厂价/client factor)——知识层面也不入网站库。

---

## 三、网站有、GPT 没有(反向参考)

商店精确报价、AAPP 同款推荐尺寸引擎、测量向导页+尺寸表、Home Project、lead scoring + campaign 归因、订单自助验证/售后、预约链接+短信、每轮快捷选项、多语言客户应答。其中**推荐尺寸引擎**和**尺寸表**反而值得让 GPT 也接上(给 chatgptAction 加个只读 action 读网站尺寸表,上门前 Eddie 先看客户自measure数据)——另一个方向的打通,需要时再说。

---

## 四、建议执行顺序

P0(1-3)一个下午能全落地,零 AAPP 改动;P1(4-5)各半天,零 AAPP 改动(复用 chatgptAction + 现有 token);P1(6)约一天;P2 等拍板。
