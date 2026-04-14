import express from 'express';
import cors from 'cors';
import path from 'path';

// Vercel 在編譯 TypeScript 時，對於 ESM 模組的引用有時會因為 .js 副檔名而失效。
// 這裡改為更具兼容性的引用方式。

import contactRoutes from './routes/contact';
import newsletterRoutes from './routes/newsletter';
import proxyRoutes from './routes/proxy';

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

// 重要：在 Vercel 部署環境下，不要啟動監聽 (listen)，只需導出 app。
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
