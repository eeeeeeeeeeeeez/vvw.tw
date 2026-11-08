import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

let client: SupabaseClient | null = null;

/** 知識庫文章使用 service_role key（只在後端使用，不會送到瀏覽器）。 */
export function blogDb(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('MISSING_SUPABASE');
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

/** 今天的日期 YYYY-MM-DD（台灣時區） */
export function todayTaipei(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
