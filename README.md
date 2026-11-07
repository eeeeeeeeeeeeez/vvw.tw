<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1692d145-45ee-4f58-80ab-dbcbc2a91141

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 知識庫發文後台

1. 在 Supabase SQL Editor 執行 `supabase_schema.sql`（會建立 `blog_posts` 資料表）。
2. 設定環境變數（本機放 `.env.local`，Vercel 放 Project Settings → Environment Variables）：
   `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`ADMIN_PASSWORD`。
3. 開啟 `https://你的網域/admin/blog`，用 `ADMIN_PASSWORD` 登入後即可新增、編輯、發布、下架、刪除文章。
   - 內文使用 Markdown；發布後文章會自動出現在知識庫、SEO meta 與 `/sitemap.xml`。
   - 內建的 5 篇文章仍放在 `src/data/blogPosts.ts`，不會出現在後台列表。
