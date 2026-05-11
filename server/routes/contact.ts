import { Router, Request, Response } from 'express';
import { sendEmail } from '../mailHelper.js';

const router = Router();
const TARGET_EMAIL = 'tvivl.tw@gmail.com';

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

    const mailSubject = `[諮詢申請] ${subject} - ${name}`;
    const mailText = `
姓名: ${name}
所屬組織: ${organization || '無'}
電子郵件: ${email}
諮詢項目: ${subject}
需求說明:
${message}
    `;
    const mailHtml = `
      <h2>新諮詢申請</h2>
      <p><strong>姓名:</strong> ${name}</p>
      <p><strong>所屬組織:</strong> ${organization || '無'}</p>
      <p><strong>電子郵件:</strong> ${email}</p>
      <p><strong>諮詢項目:</strong> ${subject}</p>
      <p><strong>需求說明:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
    `;

    const result = await sendEmail(TARGET_EMAIL, mailSubject, mailText, mailHtml);

    if (result.success) {
      console.log(`✅ New contact submission from: ${name} <${email}> sent to ${TARGET_EMAIL}`);
      res.status(201).json({
        success: true,
        message: '諮詢已成功提交！我們將在 24 小時內與您聯繫。',
      });
    } else {
      console.error('Email sending failed:', result.error);
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

// GET /api/contact — 獲取所有諮詢記錄（已改為不支援，因為不存資料庫）
router.get('/', async (_req: Request, res: Response) => {
  res.status(501).json({ success: false, error: '此功能已停用，請查看管理員信箱。' });
});

export default router;
