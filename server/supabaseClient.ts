import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 嘗試載入 .env.local，在 Vercel 環境中環境變數會自動由系統注入 process.env
dotenv.config({ path: '.env.local' });

/**
 * 根據 Vercel 上的環境變數名稱進行對齊：
 * 1. SUPABASE_URL (您在 Vercel 已設定)
 * 2. SUPABASE_ANON_KEY (您在 Vercel 已設定)
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// 備援：若未來您新增了 SUPABASE_SERVICE_ROLE_KEY，程式碼也會自動優先使用它以獲得更高權限
const finalKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !finalKey) {
  console.error('❌ Missing Supabase configuration in environment variables.');
  console.error('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in Vercel.');
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, finalKey);

console.log('✅ Supabase client initialized with Vercel environment variables.');
