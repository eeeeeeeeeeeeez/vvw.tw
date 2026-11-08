import { Router, Request, Response } from 'express';
import { sendNewsletterForm } from '../formspreeHelper.js';

const router = Router();

// POST /api/newsletter/subscribe — 訂閱電子報
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: '請輸入電子郵件地址',
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: '請輸入有效的電子郵件地址',
      });
      return;
    }

    // Submit to Formspree
    const result = await sendNewsletterForm(email);

    if (result.success) {
      res.status(201).json({
        success: true,
        message: '訂閱成功！感謝您的關注。',
      });
    } else {
      res.status(500).json({
        success: false,
        error: '訂閱失敗，請稍後再試',
      });
    }
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    res.status(500).json({
      success: false,
      error: '伺服器內部錯誤',
    });
  }
});

// GET /api/newsletter — 獲取所有訂閱者（已停用）
router.get('/', async (_req: Request, res: Response) => {
  res.status(501).json({ success: false, error: '此功能已停用，請查看 Formspree 後台。' });
});

export default router;
