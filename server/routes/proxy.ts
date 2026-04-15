import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import Readability from '@mozilla/readability';

const router = Router();

// GET /api/proxy/fetch-url?url=... — 抓取網頁內容並解析為純文字
router.get('/fetch-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: '請提供有效的 URL' });
      return;
    }

    console.log(`[Proxy] Fetching content from: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000,
    });

    if (!response.ok) {
      res.status(response.status).json({ success: false, error: `抓取失敗: ${response.statusText}` });
      return;
    }

    const html = await response.text();

    /**
     * 關鍵修復：在 Vercel 的 ESM 運行環境中，直接 import { JSDOM } from 'jsdom' 
     * 有時會觸發 ERR_REQUIRE_ESM 錯誤。
     * 這裡改用動態 import() 來安全地加載 jsdom，避開編譯階段的靜態引用衝突。
     */
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM(html, { url });
    
    const reader = new Readability.default(dom.window.document);
    const article = reader.parse();

    if (!article) {
      res.status(500).json({ success: false, error: '無法解析網頁內容' });
      return;
    }

    res.json({
      success: true,
      title: article.title,
      textContent: article.textContent.trim().substring(0, 10000), // 限制長度避免過大
      siteName: article.siteName,
    });
  } catch (err: any) {
    console.error('Proxy fetch error:', err);
    res.status(500).json({ success: false, error: `伺服器內部錯誤: ${err.message}` });
  }
});

export default router;
