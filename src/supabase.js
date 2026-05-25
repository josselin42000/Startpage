import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && key && url !== 'https://xxxx.supabase.co')
  ? createClient(url, key)
  : null

export const hasSupabase = !!supabase
