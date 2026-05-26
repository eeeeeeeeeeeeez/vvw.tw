import dotenv from 'dotenv';
// 必須在所有路由載入前初始化環境變數
dotenv.config({ path: '.env.local' });

import express from 'express';
import cors from 'cors';
import path from 'path';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import aiRoutes from './routes/ai_v2.js';

const app = express();
const PORT = parseInt(process.env.SERVER_PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/ai', aiRoutes);

// AI 服務健康檢查
app.get('/api/ai/status', (_req, res) => {
  res.json({
    service: 'AI Agent',
    status: 'operational',
    features: {
      streaming: '✅ 已啟用',
      tool_calling: '✅ 已啟用',
      search: process.env.GOOGLE_SEARCH_API_KEY ? '✅ 已配置' : '❌ 未配置',
      env_loaded: !!process.env.GEMINI_API_KEY
    }
  });
});

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

// Start server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
  });
}

export default app;
