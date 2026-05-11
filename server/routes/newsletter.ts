import { Router, Request, Response } from 'express';
import { sendEmail } from '../mailHelper.js';

const router = Router();
const TARGET_EMAIL = 'tvivl.tw@gmail.com';

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

    const mailSubject = `[週報訂閱] 新訂閱者 - ${email}`;
    const mailText = `有一位新用戶訂閱了週報：${email}`;
    const mailHtml = `
      <h2>新週報訂閱</h2>
      <p>有一位新用戶訂閱了週報：<strong>${email}</strong></p>
    `;

    const result = await sendEmail(TARGET_EMAIL, mailSubject, mailText, mailHtml);

    if (result.success) {
      console.log(`✅ New newsletter subscriber: ${email} notified to ${TARGET_EMAIL}`);
      res.status(201).json({
        success: true,
        message: '訂閱成功！感謝您的關注。',
      });
    } else {
      console.error('Email sending failed:', result.error);
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

// GET /api/newsletter — 獲取所有訂閱者（已改為不支援）
router.get('/', async (_req: Request, res: Response) => {
  res.status(501).json({ success: false, error: '此功能已停用，請查看管理員信箱。' });
});

export default router;
