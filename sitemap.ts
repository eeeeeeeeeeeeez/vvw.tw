import { Request, Response } from 'express';
import { blogDb } from '../blogDb.js';
import { BLOG_POSTS } from '../../src/data/blogPosts.js';

const SITE_URL = process.env.SITE_URL || 'https://hengbo.co';

const STATIC_PAGES = [
  { path: '/', priority: '1.0' },
  { path: '/services', priority: '0.8' },
  { path: '/cases', priority: '0.8' },
  { path: '/blog', priority: '0.8' },
  { path: '/about', priority: '0.8' },
  { path: '/contact', priority: '0.8' },
];

/** 動態 sitemap：靜態頁面 + 內建文章 + 後台發布的文章 */
export async function sitemapHandler(_req: Request, res: Response) {
  const urls: string[] = STATIC_PAGES.map(
    (p) =>
      `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
  );

  const postUrl = (slug: string, lastmod: string) =>
    `  <url>\n    <loc>${SITE_URL}/blog/${slug}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;

  BLOG_POSTS.forEach((p) => urls.push(postUrl(p.slug, p.updatedDate || p.publishDate)));

  try {
    const { data } = await blogDb()
      .from('blog_posts')
      .select('slug,publish_date,updated_date')
      .eq('status', 'published')
      .order('publish_date', { ascending: false });
    (data || []).forEach((r) => urls.push(postUrl(r.slug, r.updated_date || r.publish_date || '')));
  } catch {
    // 資料庫未設定或暫時無法連線時，仍輸出靜態部分
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.send(xml);
}
