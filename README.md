# NirithyBlog

基于 **Cloudflare Workers + R2 存储** 的 Material Design 3 博客系统。零服务器、零数据库、全球 CDN 分发。

## 功能特性

- **Material Design 3 主题**：明暗切换、动态配色、涟漪效果、Snackbar、Modal Drawer
- **Markdown 博客**：在线编辑器 + 实时预览、标签 / 分类筛选
- **用户系统**：注册 / 登录（PBKDF2 密码哈希 + JWT）、首个注册用户自动成为管理员
- **签到系统**：每日签到、连续签到额外奖励
- **积分 & 等级**：10 级成长体系，签到 / 发帖 / 评论均可获取积分
- **评论系统**：文章详情页评论，作者可删除自己的评论，管理员可删除任意评论
- **用户个人主页**：头像、等级徽章、积分进度条、发帖 / 评论 / 积分记录
- **管理员后台**：统计面板、用户管理（提升 / 降级 / 封禁 / 解封）、文章管理、评论管理
- **国际化**：中 / 英双语，一键切换，`localStorage` 持久化
- **侧边栏导航**：MD3 Modal Navigation Drawer，根据登录状态动态显示菜单项

## 技术栈

| 层 | 技术 |
|---|---|
| 运行时 | Cloudflare Workers |
| 存储 | Cloudflare R2（对象存储） |
| 静态资源 | Workers Static Assets |
| 后端 | TypeScript |
| 前端 | 原生 HTML / CSS / JS（无框架） |
| Markdown 渲染 | marked.js（CDN） |
| 认证 | JWT（HS256，72h 过期） |
| 密码哈希 | PBKDF2（SHA-256，100k 轮） |

## 项目结构

```
NirithyBlog/
├── src/
│   └── index.ts              # Worker 后端：API 路由 + R2 存储逻辑
├── public/                   # 静态前端（Workers Static Assets 托管）
│   ├── index.html            # 首页（文章列表）
│   ├── post.html             # 文章详情页
│   ├── editor.html           # Markdown 编辑器
│   ├── profile.html          # 用户个人主页
│   ├── admin.html            # 管理员后台
│   ├── css/
│   │   └── md3.css           # Material Design 3 样式
│   └── js/
│       ├── i18n.js           # 国际化（en / zh-CN）
│       ├── auth.js           # 用户认证 / 登录弹窗 / 用户菜单
│       ├── md3.js            # MD3 通用组件（主题 / Snackbar / Dialog）
│       ├── nav-drawer.js     # 侧边栏导航抽屉
│       ├── app.js            # 首页逻辑
│       ├── post.js           # 文章详情页逻辑
│       ├── editor.js         # 编辑器逻辑
│       ├── profile.js        # 个人主页逻辑
│       └── admin.js          # 管理员后台逻辑
├── wrangler.toml             # Cloudflare Workers 配置
├── package.json              # 依赖与脚本
├── tsconfig.json             # TypeScript 配置
└── .gitignore
```

## 前置要求

- **Node.js** v18.0.0 或更高版本
- **npm** 或其他包管理器
- **Cloudflare 账号**（免费套餐即可，R2 免费额度：10GB 存储 + 100 万次 Class A 操作 / 月）

## 部署流程

### 第 1 步：克隆项目

```bash
git clone https://github.com/ZeroFxc/NirithyBlog.git
cd NirithyBlog
```

### 第 2 步：安装依赖

```bash
npm install
```

这会安装 `wrangler`（Cloudflare CLI 工具）、`typescript` 和 `@cloudflare/workers-types`。

### 第 3 步：登录 Cloudflare

```bash
npx wrangler login
```

执行后浏览器会自动打开 Cloudflare 授权页面，点击 **Allow** 即可。

> 如果你使用 API Token 方式，跳过此步，改用环境变量：
> ```bash
> export CLOUDFLARE_API_TOKEN="你的API Token"
> ```
> Token 需要的权限：Account > Workers Scripts > Edit，Account > Workers R2 Storage > Edit。

### 第 4 步：创建 R2 存储桶

```bash
npx wrangler r2 bucket create md3-blog-storage
```

存储桶名 `md3-blog-storage` 与 `wrangler.toml` 中的 `bucket_name` 保持一致。如果你改了名字，记得同步修改配置文件。

### 第 5 步：修改配置（可选）

打开 `wrangler.toml`，按需修改：

```toml
name = "mysita"                    # Worker 名称，部署后访问地址为 mysita.<你的子域>.workers.dev
main = "src/index.ts"
compatibility_date = "2026-08-11"

[assets]
directory = "./public"
binding = "ASSETS"
run_worker_first = ["/api/*"]     # /api/* 路径先经过 Worker 处理，其余直接返回静态文件

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "md3-blog-storage"   # 与上一步创建的存储桶名一致

[vars]
BLOG_TITLE = "NirithyBlog"                              # 博客标题
BLOG_DESCRIPTION = "NirithyBlog on Cloudflare Workers + R2"
JWT_SECRET = "nirithy-blog-jwt-secret-2026-change-in-production"  # 生产环境务必修改！
```

**重要提醒**：

- `JWT_SECRET` 必须在生产环境修改为一个随机长字符串（建议 32 字符以上）。可用 `openssl rand -base64 32` 生成。
- `compatibility_date` 建议保持当前值或设为近期日期。
- Worker 名称 `mysita` 决定了你的博客地址：`https://mysita.<你的子域>.workers.dev`。

### 第 6 步：本地预览（可选但推荐）

```bash
npm run dev
```

启动后访问 `http://localhost:8787` 即可预览。本地环境使用 Miniflare 模拟 R2 存储，数据保存在 `.wrangler/state/` 目录。

> 首次注册的用户会自动成为管理员。本地测试时可清空 `.wrangler` 目录重置数据。

### 第 7 步：部署到 Cloudflare

```bash
npm run deploy
```

等价于 `npx wrangler deploy`。部署成功后会输出类似：

```
Published mysita (1.23 sec)
  https://mysita.<你的子域>.workers.dev
```

访问该 URL 即可看到你的博客。

### 第 8 步：验证部署

1. 打开博客地址，确认页面正常加载
2. 注册第一个账号（该账号自动成为管理员）
3. 用管理员账号发一篇文章
4. 注册第二个账号测试评论、签到、积分等功能
5. 访问 `/admin.html` 验证管理员后台

## 日常维护

### 查看实时日志

```bash
npm run tail
```

等价于 `npx wrangler tail`，实时查看 Worker 的 `console.log` 输出，用于调试线上问题。

### 预检部署（不实际推送）

```bash
npm run dry-run
```

检查构建是否通过、配置是否正确，但不会真正部署。

### TypeScript 类型检查

```bash
npm run build
```

执行 `tsc --noEmit`，仅做类型检查不生成产物。Cloudflare Workers Builds 在构建时会自动执行此命令。

### 更新代码后重新部署

```bash
git pull                          # 拉取最新代码（如果是团队协作）
npm run build && npm run deploy    # 类型检查 + 部署
```

## API 文档

所有 API 路径前缀为 `/api`。

### 公开接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/info` | 博客信息（标题、描述） |
| GET | `/api/tags` | 所有标签列表 |
| GET | `/api/categories` | 所有分类列表 |
| GET | `/api/posts` | 文章列表（支持 tag / category 筛选） |
| GET | `/api/posts/:slug` | 获取单篇文章详情 |
| GET | `/api/posts/:slug/comments` | 获取文章评论列表 |
| GET | `/api/users/:username` | 用户公开主页信息 |
| GET | `/api/users/:username/posts` | 用户的文章列表 |
| GET | `/api/users/:username/comments` | 用户的评论列表 |

### 认证接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/register` | 注册（body: `username`, `password`） |
| POST | `/api/auth/login` | 登录（body: `username`, `password`） |
| GET | `/api/auth/me` | 获取当前登录用户信息（需 Bearer Token） |

### 需登录接口

以下接口均需在 Header 中携带 `Authorization: Bearer <token>`。

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/checkin` | 每日签到 |
| GET | `/api/checkin/status` | 查询签到状态 |
| GET | `/api/points/log` | 积分变动记录 |
| POST | `/api/posts` | 发表文章（body: `title`, `content`, `tags`, `category`） |
| PUT | `/api/posts/:slug` | 编辑文章（仅作者或管理员） |
| DELETE | `/api/posts/:slug` | 删除文章（仅作者或管理员） |
| POST | `/api/posts/:slug/comments` | 发表评论（body: `content`） |
| DELETE | `/api/posts/:slug/comments/:commentId` | 删除评论（仅作者或管理员） |

### 管理员接口

以下接口需管理员 Bearer Token。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/admin/stats` | 全站统计（用户数 / 文章数 / 评论数 / 今日签到数） |
| GET | `/api/admin/users` | 所有用户列表 |
| PUT | `/api/admin/users/:userId` | 修改用户（body: `role` / `banned`） |
| DELETE | `/api/admin/posts/:slug` | 删除任意文章 |
| GET | `/api/admin/comments` | 所有评论列表 |
| DELETE | `/api/admin/comments/:postSlug/:commentId` | 删除任意评论 |

## R2 存储结构

数据以 JSON 对象存储在 R2 中，按前缀分区：

| 前缀 | 内容 | 示例 Key |
|---|---|---|
| `posts/` | 文章数据 | `posts/my-first-post` |
| `users/` | 用户数据（含密码哈希） | `users/msqhztivc0be2flj` |
| `usernames/` | 用户名 -> 用户 ID 索引 | `usernames/adminuser` |
| `comments/` | 文章评论 | `comments/my-first-post/msqi2dj8qwzzw0pe` |
| `checkin/` | 签到记录 | `checkin/msqhztivc0be2flj` |
| `points/` | 积分日志 | `points/msqhztivc0be2flj/msqi2dj8qwzzw0pe` |

## 等级体系

| 等级 | 称号 | 所需积分 |
|---|---|---|
| Lv1 | Newbie / 新手 | 0 |
| Lv2 | Novice / 初学者 | 50 |
| Lv3 | Apprentice / 学徒 | 150 |
| Lv4 | Adept / 熟手 | 350 |
| Lv5 | Expert / 专家 | 700 |
| Lv6 | Master / 大师 | 1200 |
| Lv7 | Grandmaster / 宗师 | 2000 |
| Lv8 | Legend / 传奇 | 3000 |
| Lv9 | Mythic / 神话 | 4500 |
| Lv10 | Transcendent / 超越 | 6500 |

积分获取方式：签到 +5（连续签到额外奖励，封顶 +20）、发帖 +10、评论 +2。

## 自定义域名（可选）

在 Cloudflare Dashboard 中绑定自定义域名：

1. 进入 **Workers & Pages** > 选择你的 Worker（`mysita`）
2. 点击 **Settings** > **Domains & Routes**
3. 点击 **Add** > **Custom Domain**
4. 输入你的域名（需已在 Cloudflare DNS 托管）
5. Cloudflare 会自动添加 CNAME 记录并签发 SSL 证书

绑定后通过自定义域名访问，原 `*.workers.dev` 地址仍然有效。

## 常见问题

### 部署时报 `Missing script: "build"`

`package.json` 中必须有 `"build": "tsc --noEmit"` 脚本。Cloudflare Workers Builds 默认执行 `npm run build`，缺少该脚本会导致构建失败。

### R2 绑定报错 `binding BUCKET not found`

检查 `wrangler.toml` 中 `[[r2_buckets]]` 的 `binding` 值是否为 `BUCKET`，且 `bucket_name` 与实际创建的存储桶名称一致。

### `compatibility_date` 相关警告

将 `compatibility_date` 设为近期日期即可。不能晚于当前 workerd 最高支持日期。

### 本地开发数据残留

本地 R2 数据存储在 `.wrangler/state/v3/r2/` 中。需要清空数据时：

```bash
# 停止 wrangler dev
# 删除整个 .wrangler 目录
rm -rf .wrangler
```

然后重新启动 `npm run dev` 即可获得干净环境。

### 忘记管理员密码

本地环境：删除 `.wrangler` 目录重置全部数据。

生产环境：R2 中没有直接修改用户数据的 UI。可通过 `wrangler` CLI 操作：

```bash
# 列出 users 前缀下的对象
npx wrangler r2 object list md3-blog-storage --prefix "users/" --remote

# 下载某个用户对象查看
npx wrangler r2 object get md3-blog-storage/users/<userId> --remote

# 修改后重新上传（需手动构造 JSON）
npx wrangler r2 object put md3-blog-storage/users/<userId> --file modified-user.json --remote
```

> 建议部署后立即注册账号并妥善保管密码，因为首个注册用户自动成为管理员。

### 前端页面空白 / JS 未加载

检查浏览器控制台是否有 404 错误。确保 `wrangler.toml` 中 `[assets]` 的 `directory` 指向 `./public`，且 `run_worker_first` 包含 `/api/*`。

## 成本估算

| 资源 | 免费额度 | 本项目典型用量 |
|---|---|---|
| Workers 请求 | 10 万次 / 天 | 低（博客流量通常远低于此） |
| R2 存储 | 10 GB / 月 | 极低（文章为 JSON 文本，每篇几 KB） |
| R2 Class A 操作 | 100 万次 / 月 | 低（读写操作按实际访问量） |
| R2 Class B 操作 | 1000 万次 / 月 | 低 |
| Workers Static Assets | 随 Workers 套餐 | 前端静态文件无额外费用 |

**个人博客场景下基本零成本。**

## License

MIT
