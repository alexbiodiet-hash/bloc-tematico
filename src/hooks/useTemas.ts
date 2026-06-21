import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Tema {
  id: string
  nombre: string
  emoji: string | null
  orden: number
  created_at: string
  updated_at: string
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return user.id
}

export function useTemas() {
  const [temas, setTemas] = useState<Tema[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Timeout: si tardan >6s, deja de cargar igualmente
    const timer = setTimeout(() => setCargando(false), 6000)

    supabase
      .from('temas')
      .select('*')
      .order('orden')
      .order('created_at')
      .then(({ data }) => {
        clearTimeout(timer)
        if (data) setTemas(data as Tema[])
        setCargando(false)
      })
      .catch(() => {
        clearTimeout(timer)
        setCargando(false)
      })

    const canal = supabase
      .channel('temas-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'temas' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTemas((p) => [...p, payload.new as Tema])
        } else if (payload.eventType === 'UPDATE') {
          setTemas((p) =>
            p.map((t) => (t.id === (payload.new as Tema).id ? (payload.new as Tema) : t)),
          )
        } else if (payload.eventType === 'DELETE') {
          setTemas((p) => p.filter((t) => t.id !== (payload.old as Partial<Tema>).id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  const crear = useCallback(async (nombre: string, emoji: string) => {
    const user_id = await getUserId()
    const { data, error } = await supabase
      .from('temas')
      .insert({ nombre, emoji, orden: 0, user_id })
      .select()
      .single()
    if (error) throw error
    return data as Tema
  }, [])

  const actualizar = useCallback(
    async (id: string, cambios: Partial<Pick<Tema, 'nombre' | 'emoji'>>) => {
      const { error } = await supabase
        .from('temas')
        .update({ ...cambios, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    [],
  )

  const eliminar = useCallback(async (id: string) => {
    const { error } = await supabase.from('temas').delete().eq('id', id)
    if (error) throw error
  }, [])

  return { temas, cargando, crear, actualizar, eliminar }
}
