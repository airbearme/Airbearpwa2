import "./env";
import { createClient } from '@supabase/supabase-js';
import { env } from 'process';

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or anonymous key');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
