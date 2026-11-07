-- ============================================
-- HENGBO TREND | 亨波趨勢 — Supabase Schema
-- 請在 Supabase SQL Editor 中執行此腳本
-- ============================================

-- 1. 諮詢表單提交記錄
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization TEXT,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 首頁 CTA Email 訂閱
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 3. 啟用 Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — 允許匿名用戶 INSERT（前端提交）
CREATE POLICY "Allow anonymous insert contact"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous insert newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. RLS Policies — 允許 service_role 全部操作（後端管理）
CREATE POLICY "Allow service role full access contact"
  ON contact_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access newsletter"
  ON newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. RLS Policies — 允許匿名用戶 SELECT（管理頁面使用 anon key 讀取）
CREATE POLICY "Allow anonymous select contact"
  ON contact_submissions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous select newsletter"
  ON newsletter_subscribers
  FOR SELECT
  TO anon
  USING (true);

-- 7. 索引加速查詢
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);

-- ============================================
-- 8. 知識庫文章（後台發文頁 /admin/blog 使用）
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  category TEXT NOT NULL DEFAULT '廣告投放',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  publish_date DATE,
  updated_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 匿名只能讀取已發布文章；新增/修改/刪除一律由後端 service_role 處理
CREATE POLICY "Allow anonymous read published blog"
  ON blog_posts
  FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Allow service role full access blog"
  ON blog_posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_blog_status_date ON blog_posts (status, publish_date DESC);
