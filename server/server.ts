import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

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
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🏗️  HENGBO TREND API SERVER            ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║   Port:    ${PORT}                          ║`);
  console.log(`║   Mode:    ${process.env.NODE_ENV || 'development'}                  ║`);
  console.log('║   Status:  OPERATIONAL ✅                ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log('API Endpoints:');
  console.log('  POST /api/contact              — Submit contact form');
  console.log('  GET  /api/contact              — List all contacts');
  console.log('  PATCH /api/contact/:id         — Update contact status');
  console.log('  DELETE /api/contact/:id        — Delete contact');
  console.log('  POST /api/newsletter/subscribe — Subscribe to newsletter');
  console.log('  GET  /api/newsletter           — List all subscribers');
  console.log('  DELETE /api/newsletter/:id     — Delete subscriber');
  console.log('  GET  /api/health               — Health check');
  console.log('');
});

export default app;
