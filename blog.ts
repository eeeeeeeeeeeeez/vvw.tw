import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { blogDb, todayTaipei } from '../blogDb.js';
import { BLOG_POSTS } from '../../src/data/blogPosts.js';

const router = Router();

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 登入 12 小時
const STATIC_SLUGS = new Set(BLOG_POSTS.map((p) => p.slug));

// ---------------------------------------------------------------
// 管理員驗證：密碼放在環境變數 ADMIN_PASSWORD，登入後發一組有時效的簽章 token
// ---------------------------------------------------------------
const secret = () => process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || '';
const sign = (payload: string) =>
  crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

const safeEqual = (a: string, b: string) => {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const issueToken = () => {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
};

const verifyToken = (token: string) => {
  if (!secret()) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !verifyToken(token)) {
    res.status(401).json({ success: false, error: '登入已過期，請重新登入' });
    return;
  }
  next();
};

// 簡易防暴力破解（以 IP 計算，serverless 環境為盡力而為）
const attempts = new Map<string, { count: number; lockedUntil: number }>();
const clientIp = (req: Request) =>
  (String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.ip || 'unknown';

// ---------------------------------------------------------------
// 欄位轉換與驗證
// ---------------------------------------------------------------
type Row = Record<string, any>;

const toApi = (r: Row) => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  metaTitle: r.meta_title || '',
  metaDescription: r.meta_description || '',
  category: r.category,
  keywords: r.keywords || [],
  excerpt: r.excerpt || '',
  content: r.content,
  status: r.status,
  publishDate: r.publish_date || '',
  updatedDate: r.updated_date || '',
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const isDate = (s: unknown) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

class ValidationError extends Error {}

function parseInput(body: Row) {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const slug = str(body.slug).toLowerCase();
  const title = str(body.title);
  const category = str(body.category) || '廣告投放';
  const excerpt = str(body.excerpt);
  const content = typeof body.content === 'string' ? body.content : '';
  const metaTitle = str(body.metaTitle);
  const metaDescription = str(body.metaDescription);
  const status = body.status === 'published' ? 'published' : 'draft';
  const publishDate = body.publishDate ? String(body.publishDate) : null;

  let keywords: string[] = [];
  if (Array.isArray(body.keywords)) keywords = body.keywords.map(str);
  else if (typeof body.keywords === 'string') keywords = body.keywords.split(/[,，、\n]/).map(str);
  keywords = [...new Set(keywords.filter(Boolean))];

  if (!title) throw new ValidationError('請輸入標題');
  if (title.length > 120) throw new ValidationError('標題請在 120 字以內');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100)
    throw new ValidationError('網址代稱只能使用小寫英文、數字與連字號（例如 meta-ads-guide）');
  if (STATIC_SLUGS.has(slug)) throw new ValidationError('這個網址代稱已被內建文章使用，請換一個');
  if (category.length > 40) throw new ValidationError('分類請在 40 字以內');
  if (excerpt.length > 300) throw new ValidationError('摘要請在 300 字以內');
  if (metaTitle.length > 120) throw new ValidationError('SEO 標題請在 120 字以內');
  if (metaDescription.length > 300) throw new ValidationError('SEO 描述請在 300 字以內');
  if (content.length > 100000) throw new ValidationError('內文過長');
  if (keywords.length > 15 || keywords.some((k) => k.length > 40))
    throw new ValidationError('關鍵字最多 15 個，每個 40 字以內');
  if (publishDate && !isDate(publishDate)) throw new ValidationError('發布日期格式錯誤');
  if (status === 'published' && !content.trim()) throw new ValidationError('發布前請先填寫內文');

  return { slug, title, category, excerpt, content, metaTitle, metaDescription, keywords, status, publishDate };
}

const dbError = (res: Response, err: any) => {
  if (err?.message === 'MISSING_SUPABASE') {
    res.status(503).json({ success: false, error: '後端尚未設定 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }
  if (err?.code === '23505') {
    res.status(409).json({ success: false, error: '這個網址代稱已被使用，請換一個' });
    return;
  }
  if (err?.code === '42P01') {
    res.status(500).json({ success: false, error: '資料表 blog_posts 不存在，請先在 Supabase 執行 supabase_schema.sql' });
    return;
  }
  console.error('[blog] error:', err);
  res.status(500).json({ success: false, error: '伺服器發生錯誤，請稍後再試' });
};

const LIST_COLUMNS =
  'id,slug,title,meta_title,meta_description,category,keywords,excerpt,status,publish_date,updated_date,created_at,updated_at';

// ---------------------------------------------------------------
// 公開 API
// ---------------------------------------------------------------

// GET /api/blog — 已發布文章列表（不含內文）
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await blogDb()
      .from('blog_posts')
      .select(LIST_COLUMNS)
      .eq('status', 'published')
      .order('publish_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json({ success: true, posts: (data || []).map(toApi).map(({ content, ...rest }) => rest) });
  } catch (err: any) {
    // 公開頁面不因為資料庫問題而壞掉：回傳空清單，內建文章仍會顯示
    if (err?.message !== 'MISSING_SUPABASE') console.error('[blog] list error:', err);
    res.json({ success: true, posts: [] });
  }
});

// GET /api/blog/post/:slug — 單篇已發布文章（含內文）
router.get('/post/:slug', async (req: Request, res: Response) => {
  try {
    const { data, error } = await blogDb()
      .from('blog_posts')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ success: false, error: '找不到文章' });
      return;
    }
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.json({ success: true, post: toApi(data) });
  } catch (err) {
    dbError(res, err);
  }
});

// ---------------------------------------------------------------
// 後台 API（需登入）
// ---------------------------------------------------------------

// POST /api/blog/login
router.post('/login', async (req: Request, res: Response) => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    res.status(503).json({ success: false, error: '後端尚未設定 ADMIN_PASSWORD' });
    return;
  }
  const ip = clientIp(req);
  const state = attempts.get(ip) || { count: 0, lockedUntil: 0 };
  if (state.lockedUntil > Date.now()) {
    res.status(429).json({ success: false, error: '嘗試次數過多，請 15 分鐘後再試' });
    return;
  }
  const input = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!input || !safeEqual(input, password)) {
    state.count += 1;
    if (state.count >= 5) {
      state.count = 0;
      state.lockedUntil = Date.now() + 15 * 60 * 1000;
    }
    attempts.set(ip, state);
    await new Promise((r) => setTimeout(r, 600));
    res.status(401).json({ success: false, error: '密碼錯誤' });
    return;
  }
  attempts.delete(ip);
  res.json({ success: true, token: issueToken() });
});

// GET /api/blog/admin/posts — 全部文章（含草稿，不含內文）
router.get('/admin/posts', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await blogDb()
      .from('blog_posts')
      .select(LIST_COLUMNS)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, posts: (data || []).map(toApi).map(({ content, ...rest }) => rest) });
  } catch (err) {
    dbError(res, err);
  }
});

// GET /api/blog/admin/posts/:id — 單篇（含內文，編輯用）
router.get('/admin/posts/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await blogDb().from('blog_posts').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ success: false, error: '找不到文章' });
      return;
    }
    res.json({ success: true, post: toApi(data) });
  } catch (err) {
    dbError(res, err);
  }
});

// POST /api/blog/admin/posts — 新增
router.post('/admin/posts', requireAdmin, async (req: Request, res: Response) => {
  try {
    const p = parseInput(req.body || {});
    const publishDate = p.status === 'published' ? p.publishDate || todayTaipei() : p.publishDate;
    const { data, error } = await blogDb()
      .from('blog_posts')
      .insert({
        slug: p.slug,
        title: p.title,
        meta_title: p.metaTitle || null,
        meta_description: p.metaDescription || null,
        category: p.category,
        keywords: p.keywords,
        excerpt: p.excerpt,
        content: p.content,
        status: p.status,
        publish_date: publishDate,
      })
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, post: toApi(data) });
  } catch (err) {
    dbError(res, err);
  }
});

// PUT /api/blog/admin/posts/:id — 修改
router.put('/admin/posts/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const p = parseInput(req.body || {});
    const { data: existing, error: findErr } = await blogDb()
      .from('blog_posts')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!existing) {
      res.status(404).json({ success: false, error: '找不到文章' });
      return;
    }

    const today = todayTaipei();
    const publishDate = p.publishDate || existing.publish_date || (p.status === 'published' ? today : null);

    // 已發布的文章內容有修改時，自動記錄「更新日期」
    let updatedDate: string | null = existing.updated_date;
    const contentChanged =
      existing.title !== p.title ||
      existing.content !== p.content ||
      existing.excerpt !== p.excerpt ||
      existing.category !== p.category;
    if (existing.status === 'published' && p.status === 'published' && contentChanged && publishDate !== today) {
      updatedDate = today;
    }

    const { data, error } = await blogDb()
      .from('blog_posts')
      .update({
        slug: p.slug,
        title: p.title,
        meta_title: p.metaTitle || null,
        meta_description: p.metaDescription || null,
        category: p.category,
        keywords: p.keywords,
        excerpt: p.excerpt,
        content: p.content,
        status: p.status,
        publish_date: publishDate,
        updated_date: updatedDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) throw error;
    res.json({ success: true, post: toApi(data) });
  } catch (err) {
    dbError(res, err);
  }
});

// DELETE /api/blog/admin/posts/:id — 刪除
router.delete('/admin/posts/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { error } = await blogDb().from('blog_posts').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    dbError(res, err);
  }
});

export default router;
