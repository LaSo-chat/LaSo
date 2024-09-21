// src/auth/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Use your environment variables for the Supabase URL and Key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
