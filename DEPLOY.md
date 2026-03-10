# 上线部署指南
> 技术栈：GitHub · Neon PostgreSQL · Cloudflare R2 · Vercel
> 预计费用：**$0/月**（均在免费套餐范围内）

---

## 第一步：安装新依赖（在本地项目里）

```bash
cd apps/web
npm install @aws-sdk/client-s3
```

---

## 第二步：Neon 数据库

1. 打开 [neon.tech](https://neon.tech) → 用 GitHub 登录 → 创建项目
2. 选 Region：**US East (Virginia)**（离 Vercel 默认机房近，延迟低）
3. 创建完成后，点 **Dashboard → Connection string**，复制这条字符串：
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. 把现有数据库的数据导出并导入 Neon（如果本地有数据需要迁移）：
   ```bash
   # 导出本地数据
   pg_dump postgresql://localhost/your_local_db > backup.sql
   # 导入到 Neon
   psql "your_neon_connection_string" < backup.sql
   ```

---

## 第三步：Cloudflare R2（图片存储）

1. 打开 [cloudflare.com](https://cloudflare.com) → 注册/登录 → 左侧菜单 **R2**
2. 点 **Create bucket** → 名称填 `window-treatments`（或你喜欢的名字）
3. 创建完成后，进入 bucket → **Settings → Public access** → 开启 **Allow Public Access**
   - 记录显示的公开访问地址，格式类似：`https://pub-xxxxxx.r2.dev`
4. 回到 R2 主页 → **Manage R2 API tokens** → 创建 token
   - 权限选 **Object Read & Write**
   - 记录 **Access Key ID** 和 **Secret Access Key**（只显示一次）
5. 在 R2 主页左上角找到 **Account ID**（右边侧栏）

此时你有了 4 个值：
```
CLOUDFLARE_ACCOUNT_ID = xxxxxxxx
R2_ACCESS_KEY_ID      = xxxxxxxx
R2_SECRET_ACCESS_KEY  = xxxxxxxx
R2_BUCKET_NAME        = window-treatments
R2_PUBLIC_URL         = https://pub-xxxxxx.r2.dev
```

**迁移现有图片**（如果后台已经上传过产品图）：
```bash
# 用 rclone 批量上传 public/uploads/ 目录到 R2
# 安装 rclone: https://rclone.org/install/
rclone copy apps/web/public/uploads r2:window-treatments --progress
```
上传完成后，需要把数据库里旧的图片 URL（`/uploads/...`）更新为 R2 公开 URL。如果图片不多，直接在后台重新上传更省事。

---

## 第四步：GitHub 仓库

```bash
# 在项目根目录
git init
git add .
git commit -m "Initial commit"

# 在 github.com 创建一个新的私有仓库，然后：
git remote add origin https://github.com/你的用户名/window-treatments.git
git branch -M main
git push -u origin main
```

⚠️ 确保 `.gitignore` 里有 `.env.local`，不要把密钥提交到 GitHub：
```
.env.local
.env*.local
```

---

## 第五步：Vercel 部署

1. 打开 [vercel.com](https://vercel.com) → 用 GitHub 登录
2. **New Project** → 选刚才创建的仓库 → **Import**
3. 设置：
   - Framework Preset: **Next.js**（自动检测）
   - Root Directory: `apps/web`
4. 点开 **Environment Variables**，逐条添加：

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | Neon 连接字符串 |
| `JWT_SECRET` | 一个随机长字符串（32位以上） |
| `STRIPE_SECRET_KEY` | Stripe 后台的 Secret Key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 的 Publishable Key |
| `SHIPPO_API_KEY` | Shippo API Key |
| `STATE_TAX_RATES` | （如有需要） |
| `CLOUDFLARE_ACCOUNT_ID` | 第三步的值 |
| `R2_ACCESS_KEY_ID` | 第三步的值 |
| `R2_SECRET_ACCESS_KEY` | 第三步的值 |
| `R2_BUCKET_NAME` | `window-treatments` |
| `R2_PUBLIC_URL` | `https://pub-xxxxxx.r2.dev` |

5. 点 **Deploy** → 等待 2-3 分钟，完成。

Vercel 会给一个临时域名，如 `window-treatments-xxx.vercel.app`，可以先测试。

---

## 第六步：绑定自定义域名

1. Vercel 项目页 → **Settings → Domains** → 添加你的域名，如 `www.yourdomain.com`
2. Vercel 会显示一条 DNS 记录，类似：
   ```
   类型: CNAME
   名称: www
   值:   cname.vercel-dns.com
   ```
3. 在你的域名注册商（GoDaddy / Namecheap / 阿里云 / 腾讯云等）后台，添加这条 CNAME 记录
4. 等待 DNS 生效（通常 5-15 分钟，最长 24 小时）
5. Vercel 自动签发 SSL 证书，全程免费

---

## 第七步：后续更新

只需要：
```bash
git add .
git commit -m "更新描述"
git push
```
Vercel 自动检测到 push，1-2 分钟内自动重新部署，零停机。

---

## 费用汇总

| 服务 | 免费额度 | 你的预计用量 |
|------|---------|------------|
| Vercel | 100GB 流量/月，无限部署 | ✅ 足够 |
| Neon | 0.5GB 存储，无限查询 | ✅ 足够（订单数据很小） |
| Cloudflare R2 | 10GB 存储，100万次请求/月 | ✅ 足够 |
| GitHub | 无限私有仓库 | ✅ 免费 |

**合计：$0/月**，直到流量非常大时才需要升级。
