import express from 'express';
import cors from 'cors';
import path from 'path';

// 在 Vercel 部署環境下，環境變數會直接由系統注入 process.env，
// 且 Vercel 支援原生 ESM 載入。這裡我們移除 dotenv 調用以減少干擾。

import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import proxyRoutes from './routes/proxy.js';

const app = express();
const PORT = parseInt(process.env.SERVER_PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (僅在非生產環境或偵錯時使用)
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

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

// 僅在非 Vercel 環境下啟動監聽 (Vercel 會自動處理導出)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
