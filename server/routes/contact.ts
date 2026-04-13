import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient.js';

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

    // Insert into Supabase
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name,
          organization: organization || null,
          email,
          subject,
          message,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error, null, 2));
      res.status(500).json({
        success: false,
        error: `提交失敗: ${error.message || '請稍後再試'}`,
      });
      return;
    }

    console.log(`✅ New contact submission from: ${name} <${email}>`);

    res.status(201).json({
      success: true,
      message: '諮詢已成功提交！我們將在 24 小時內與您聯繫。',
      data,
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({
      success: false,
      error: '伺服器內部錯誤',
    });
  }
});

// GET /api/contact — 獲取所有諮詢記錄（管理後台用）
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      res.status(500).json({ success: false, error: '查詢失敗' });
      return;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Contact fetch error:', err);
    res.status(500).json({ success: false, error: '伺服器內部錯誤' });
  }
});

// PATCH /api/contact/:id — 更新諮詢狀態（管理後台用）
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'completed', 'archived'].includes(status)) {
      res.status(400).json({
        success: false,
        error: '無效的狀態值',
      });
      return;
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      res.status(500).json({ success: false, error: '更新失敗' });
      return;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Contact update error:', err);
    res.status(500).json({ success: false, error: '伺服器內部錯誤' });
  }
});

// DELETE /api/contact/:id — 刪除諮詢記錄（管理後台用）
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      res.status(500).json({ success: false, error: '刪除失敗' });
      return;
    }

    res.json({ success: true, message: '已刪除' });
  } catch (err) {
    console.error('Contact delete error:', err);
    res.status(500).json({ success: false, error: '伺服器內部錯誤' });
  }
});

export default router;
