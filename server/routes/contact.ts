import { Router, Request, Response } from 'express';
import { sendContactForm } from '../formspreeHelper.js';

const router = Router();

// POST /api/contact — 提交諮詢表單
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, organization, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        error: '請填寫所有必填欄位（姓名、電子郵件、主題、訊息）',
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
    const result = await sendContactForm({
      name,
      organization,
      email,
      subject,
      message,
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: '諮詢已成功提交！我們將在 24 小時內與您聯繫。',
      });
    } else {
      res.status(500).json({
        success: false,
        error: '提交失敗，請稍後再試',
      });
    }
  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({
      success: false,
      error: '伺服器內部錯誤',
    });
  }
});

// GET /api/contact — 獲取所有諮詢記錄（已停用）
router.get('/', async (_req: Request, res: Response) => {
  res.status(501).json({ success: false, error: '此功能已停用，請查看 Formspree 後台。' });
});

export default router;
