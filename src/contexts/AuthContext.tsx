import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  session: Session | null
  cargando: boolean
  cerrarSesion: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Timeout de seguridad: si getSession tarda más de 6s, muestra login igualmente
    const timer = setTimeout(() => setCargando(false), 6000)

    supabase.auth.getSession()
      .then(({ data }) => {
        clearTimeout(timer)
        setSession(data.session)
        setCargando(false)
      })
      .catch(() => {
        clearTimeout(timer)
        setCargando(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, ses) => {
      setSession(ses)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, cargando, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
