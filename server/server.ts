import express from 'express';
import cors from 'cors';
import path from 'path';

// 在 Node.js ESM (type: module) 環境下，本地模組的引用必須加上副檔名（通常是 .js）。
// 這是 Vercel 在部署 ESM 專案時最穩定的做法。

import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import proxyRoutes from './routes/proxy.js';

const app = express();
const PORT = parseInt(process.env.SERVER_PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/proxy', proxyRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HENGBO TREND API',
  });
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 在 Vercel 環境下不啟動 listen，只需導出 app
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
