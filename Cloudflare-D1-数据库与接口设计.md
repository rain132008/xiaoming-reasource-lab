# Cloudflare D1 数据库与接口设计

## 1. 技术路线

第一版后端全部基于 Cloudflare：

- 前端部署：Cloudflare Pages
- API：Cloudflare Pages Functions
- 数据库：Cloudflare D1
- 验证码：Cloudflare Turnstile，先用于资源心愿单提交
- 数据统计：D1 自建日志表 + Cloudflare Web Analytics

第一版不做用户登录、上传、评论、收藏、支付和复杂后台。目标是先跑通：

```text
资源详情页访问 -> 点击免费获取资料 -> 记录行为数据 -> 判断资源需求
```

## 2. 表设计总览

第一版建议保留 4 张表：

| 表名 | 用途 |
| --- | --- |
| `resources` | 资源主表，存资源详情页内容和真实网盘链接 |
| `click_logs` | 访问和点击行为日志 |
| `search_logs` | 搜索关键词日志 |
| `resource_requests` | 用户资源心愿单 / 需求提交 |

暂时不拆 `categories`、`tags`、`resource_tags` 等表。分类、标签、适合人群、资料目录这类结构化字段先用 JSON 字符串存储，方便快速迭代。

## 3. resources 资源表

用于存放资源详情页展示内容。列表和详情接口不直接返回 `quark_url`，只有 access 接口返回真实网盘链接。

```sql
CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  content_summary TEXT,
  suitable_users TEXT,
  tags TEXT,
  file_type TEXT,
  file_size TEXT,
  author TEXT,
  cover_image TEXT,
  preview_images TEXT,
  related_slugs TEXT,
  quark_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  sort_order INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 自增 ID |
| `slug` | URL 标识，例如 `xiaohongshu-title-templates` |
| `title` | 资源标题 |
| `category` | 资源分类 |
| `description` | 一句话简介 |
| `content_summary` | 资料内容，JSON 字符串 |
| `suitable_users` | 适合人群，JSON 字符串 |
| `tags` | 标签，JSON 字符串 |
| `file_type` | 文件类型，例如 `PDF`、`DOCX`、`PPTX` |
| `file_size` | 文件大小展示文本 |
| `author` | 整理者 |
| `cover_image` | 图标或封面路径 |
| `preview_images` | 预览图，JSON 字符串 |
| `related_slugs` | 手工配置的相关资源 slug，JSON 字符串 |
| `quark_url` | 真实夸克分享链接，不在普通读接口暴露 |
| `status` | `published` / `hidden` |
| `sort_order` | 排序权重 |
| `view_count` | 详情页访问计数 |
| `click_count` | 免费获取资料点击计数 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |

建议索引：

```sql
CREATE INDEX idx_resources_status_sort ON resources (status, sort_order DESC, updated_at DESC);
CREATE INDEX idx_resources_category ON resources (category, status, updated_at DESC);
CREATE INDEX idx_resources_slug ON resources (slug);
```

## 4. click_logs 行为日志表

用于记录资源详情页访问和免费获取点击。

```sql
CREATE TABLE click_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_id INTEGER,
  resource_slug TEXT,
  action TEXT NOT NULL,
  ip_hash TEXT,
  user_agent_hash TEXT,
  referer TEXT,
  utm_source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `resource_id` | 资源 ID |
| `resource_slug` | 资源 slug，方便排查 |
| `action` | 行为类型，第一版用 `view` / `access` |
| `ip_hash` | IP 哈希，不存明文 IP |
| `user_agent_hash` | User-Agent 哈希 |
| `referer` | 来源页面 |
| `utm_source` | 外部分发来源，例如 `xiaohongshu`、`zhihu` |
| `created_at` | 记录时间 |

建议索引：

```sql
CREATE INDEX idx_click_logs_resource_action ON click_logs (resource_id, action, created_at DESC);
CREATE INDEX idx_click_logs_created_at ON click_logs (created_at DESC);
```

后续可扩展：

- 短时间内同 IP + 同资源重复点击，只记录日志但不增加 `click_count`
- 增加 `utm_campaign`、`utm_content`
- 增加轻量数据看板

## 5. search_logs 搜索日志表

用于记录用户搜索行为，判断缺什么资料。

```sql
CREATE TABLE search_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `keyword` | 搜索关键词 |
| `result_count` | 搜索结果数量 |
| `ip_hash` | IP 哈希 |
| `user_agent_hash` | User-Agent 哈希 |
| `created_at` | 搜索时间 |

建议索引：

```sql
CREATE INDEX idx_search_logs_keyword ON search_logs (keyword, created_at DESC);
```

## 6. resource_requests 资源心愿单表

用于收集用户没找到的资料需求。第一版不公开展示，站长通过 D1 控制台查看即可。

```sql
CREATE TABLE resource_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  expected_content TEXT,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  vote_count INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `title` | 用户想找什么资料 |
| `category` | 资料用途或分类 |
| `description` | 补充说明 |
| `expected_content` | 希望包含什么内容 |
| `contact` | 可选联系方式 |
| `status` | `pending` / `planned` / `published` / `rejected` |
| `vote_count` | 后续如果做公开心愿单，可用于投票 |
| `ip_hash` | IP 哈希 |
| `user_agent_hash` | User-Agent 哈希 |
| `created_at` | 提交时间 |
| `updated_at` | 更新时间 |

建议索引：

```sql
CREATE INDEX idx_resource_requests_status ON resource_requests (status, created_at DESC);
```

## 7. API 设计

### 7.1 获取资源列表

```text
GET /api/resources?page=1&pageSize=20&category=自媒体运营&sort=latest
```

说明：

- 返回 published 资源
- 支持分页
- 支持按分类筛选
- `sort=latest` 默认按排序权重和更新时间
- `sort=popular` 按点击和访问热度
- 不返回 `quark_url`

返回示例：

```json
{
  "list": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

### 7.2 获取资源详情

```text
GET /api/resources/:slug
```

说明：

- 返回资源详情
- 不返回 `quark_url`
- 记录一次 `view`
- `view_count + 1`
- 返回最多 3 条相关资源

相关资料逻辑：

```text
手工 related_slugs -> 同分类资源 -> 最新热门资源兜底
```

### 7.3 获取资料链接

```text
POST /api/resources/:slug/access
```

说明：

- 检查资源是否存在且已发布
- 记录 `access`
- `click_count + 1`
- 返回真实 `quark_url`

返回示例：

```json
{
  "url": "https://pan.quark.cn/s/xxxx",
  "message": "已为你打开资料链接"
}
```

### 7.4 搜索资源

```text
GET /api/search?q=AI&page=1&pageSize=20
```

说明：

- 第一版用 D1 `LIKE` 模糊匹配
- 搜索 `title`、`description`、`category`、`tags`
- 关键词长度限制 30
- `pageSize` 最大 20
- 写入 `search_logs`

### 7.5 提交资源心愿

```text
POST /api/requests
```

请求示例：

```json
{
  "title": "小红书宠物号选题库",
  "category": "自媒体运营",
  "description": "想找适合宠物号的选题和标题模板",
  "expected_content": "希望包含选题、标题、标签、案例",
  "contact": "",
  "turnstileToken": ""
}
```

说明：

- 校验字段长度
- 如果配置了 `TURNSTILE_SECRET_KEY`，则校验 Turnstile
- 写入 `resource_requests`
- 默认状态 `pending`

## 8. 安全与隐私

第一版原则：

- 不存明文 IP
- 不在普通读接口返回 `quark_url`
- 心愿单提交接 Turnstile
- 搜索关键词限制长度
- 列表接口限制 `pageSize`
- access 接口后续可加短时间去重

## 9. 后续可调整点

你可以重点调整这些地方：

1. 是否继续用 JSON 字符串存 `tags`、`content_summary`、`suitable_users`
2. 是否需要单独建 `categories` 表
3. `click_logs.action` 是否扩展 `copy`、`related_click`、`search_click`
4. `resource_requests` 是否需要公开展示和投票
5. `resources` 是否需要增加 `source_platform`、`risk_level`、`license_note`
6. 是否要做站长用的简单统计接口

## 10. 当前建议

先保持这套设计，尽快完成：

```text
D1 建库 -> 迁移执行 -> 资源接口联调 -> 前端切 API -> access 记录点击 -> 心愿单提交
```

等资源数量超过 50 条、分类和标签开始变复杂时，再考虑拆分 `categories`、`tags` 和管理后台。
