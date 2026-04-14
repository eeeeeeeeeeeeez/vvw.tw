import { createClient } from '@supabase/supabase-js';

/**
 * 根據 Vercel 上的環境變數名稱進行對齊：
 * 1. SUPABASE_URL (您在 Vercel 已設定)
 * 2. SUPABASE_ANON_KEY (您在 Vercel 已設定)
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in environment variables.');
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client initialized with Vercel environment variables.');
