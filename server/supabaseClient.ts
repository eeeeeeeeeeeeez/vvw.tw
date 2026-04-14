import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 嘗試加載 .env.local，但在 Vercel 部署環境下，環境變數會直接從 process.env 讀取
dotenv.config({ path: '.env.local' });

// 優先讀取後端專用的變數，若無則回退到帶有 VITE_ 前綴的前端變數
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

// 優先權：SERVICE_ROLE_KEY > ANON_KEY > VITE_ANON_KEY
// 注意：在 Vercel 部署環境中，請務必在專案設定中新增 SUPABASE_SERVICE_ROLE_KEY 以獲得寫入權限
const supabaseKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in environment variables.');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client initialized successfully.');
