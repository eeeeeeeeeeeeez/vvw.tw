import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient';

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

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email)
      .single();

    if (existing) {
      if (existing.is_active) {
        res.status(200).json({
          success: true,
          message: '您已經訂閱過了！',
        });
        return;
      } else {
        // Re-activate
        await supabase
          .from('newsletter_subscribers')
          .update({ is_active: true })
          .eq('id', existing.id);

        res.status(200).json({
          success: true,
          message: '已重新啟用您的訂閱！',
        });
        return;
      }
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }]);

    if (error) {
      console.error('Supabase insert error:', error);
      res.status(500).json({
        success: false,
        error: '訂閱失敗，請稍後再試',
      });
      return;
    }

    console.log(`✅ New newsletter subscriber: ${email}`);

    res.status(201).json({
      success: true,
      message: '訂閱成功！感謝您的關注。',
    });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    res.status(500).json({
      success: false,
      error: '伺服器內部錯誤',
    });
  }
});

// GET /api/newsletter — 獲取所有訂閱者（管理後台用）
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      res.status(500).json({ success: false, error: '查詢失敗' });
      return;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Newsletter fetch error:', err);
    res.status(500).json({ success: false, error: '伺服器內部錯誤' });
  }
});

// DELETE /api/newsletter/:id — 刪除訂閱者（管理後台用）
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      res.status(500).json({ success: false, error: '刪除失敗' });
      return;
    }

    res.json({ success: true, message: '已刪除' });
  } catch (err) {
    console.error('Newsletter delete error:', err);
    res.status(500).json({ success: false, error: '伺服器內部錯誤' });
  }
});

export default router;
