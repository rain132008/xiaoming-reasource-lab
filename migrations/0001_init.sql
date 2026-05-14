CREATE TABLE IF NOT EXISTS resources (
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

CREATE INDEX IF NOT EXISTS idx_resources_status_sort ON resources (status, sort_order DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources (category, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources (slug);

CREATE TABLE IF NOT EXISTS click_logs (
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

CREATE INDEX IF NOT EXISTS idx_click_logs_resource_action ON click_logs (resource_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_logs_created_at ON click_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS search_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  ip_hash TEXT,
  user_agent_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_search_logs_keyword ON search_logs (keyword, created_at DESC);

CREATE TABLE IF NOT EXISTS resource_requests (
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

CREATE INDEX IF NOT EXISTS idx_resource_requests_status ON resource_requests (status, created_at DESC);
