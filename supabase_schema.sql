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
