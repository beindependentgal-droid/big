import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase URL or key in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error, status } = await supabase.from('big_members').select('*').limit(1);
    console.log('HTTP status:', status);
    if (error) console.error('Supabase error:', error);
    console.log('Rows:', data);
  } catch (e) {
    console.error('Exception:', e);
  }
}

test();
