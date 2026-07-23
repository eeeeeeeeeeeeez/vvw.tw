// 產生 sitemap.xml，包含靜態頁面與 src/data/blogPosts.ts 中所有文章
// 使用方式：新增/修改知識庫文章後，執行 `npm run sitemap`
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const SITE_URL = "https://grv.ccwu.cc";

const blogPostsSrc = fs.readFileSync(path.join(root, "src/data/blogPosts.ts"), "utf8");
const slugs = [...blogPostsSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const dates = [...blogPostsSrc.matchAll(/publishDate:\s*"([^"]+)"/g)].map((m) => m[1]);

const staticPages = [
  { path: "/", priority: "1.0" },
  { path: "/services", priority: "0.8" },
  { path: "/cases", priority: "0.8" },
  { path: "/blog", priority: "0.8" },
  { path: "/about", priority: "0.8" },
  { path: "/contact", priority: "0.8" },
];

const urls = staticPages.map(
  (p) =>
    `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
);

slugs.forEach((slug, i) => {
  urls.push(
    `  <url>\n    <loc>${SITE_URL}/blog/${slug}</loc>\n    <lastmod>${dates[i] || ""}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  );
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

fs.writeFileSync(path.join(root, "public/sitemap.xml"), xml);
console.log(`sitemap.xml 已更新，共 ${staticPages.length + slugs.length} 個網址。`);
