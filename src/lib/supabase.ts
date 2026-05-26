import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Indica si las credenciales están configuradas en .env.
export const supabaseConfigurado = Boolean(url && anonKey)

if (!supabaseConfigurado) {
  console.warn(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env. ' +
      'Copia .env.example a .env y rellena tus credenciales de Supabase.',
  )
}

// Se crea siempre un cliente (con placeholders si falta config) para que la
// app no rompa al importar; la UI avisa cuando no está configurado.
export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key',
)
