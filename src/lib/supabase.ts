import { createClient } from '@supabase/supabase-js'

// La anon key es una clave pública por diseño en Supabase.
// La seguridad real la aplica Row Level Security en la base de datos.
const url     = import.meta.env.VITE_SUPABASE_URL     ?? 'https://tdfmfskbwsjdkyohgmtb.supabase.co'
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZm1mc2tid3NqZGt5b2hnbXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTk2MTcsImV4cCI6MjA5NTM3NTYxN30.F5UCBXGTiAIWqCs9_9wEj0gFg5cE5PF_wNgiaSjyaVc'

export const supabaseConfigurado = true

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession:   true,
    autoRefreshToken: true,
    storageKey:       'bloc-tematico-auth',
    detectSessionInUrl: true,
  },
})
