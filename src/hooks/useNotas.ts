import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Nota {
  id: string
  tema_id: string
  titulo: string | null
  contenido: string
  puntuacion: number | null
  orden: number
  created_at: string
  updated_at: string
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return user.id
}

export function useNotas(temaId: string | null) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!temaId) {
      setNotas([])
      return
    }
    setCargando(true)

    supabase
      .from('notas')
      .select('*')
      .eq('tema_id', temaId)
      .order('orden')
      .order('created_at')
      .then(({ data }) => {
        if (data) setNotas(data as Nota[])
        setCargando(false)
      })

    const canal = supabase
      .channel(`notas-rt-${temaId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notas' }, (payload) => {
        const nueva = payload.new as Nota
        const vieja = payload.old as Partial<Nota>
        if (payload.eventType === 'INSERT' && nueva.tema_id === temaId) {
          setNotas((p) => [...p, nueva])
        } else if (payload.eventType === 'UPDATE' && nueva.tema_id === temaId) {
          setNotas((p) => p.map((n) => (n.id === nueva.id ? nueva : n)))
        } else if (payload.eventType === 'DELETE') {
          setNotas((p) => p.filter((n) => n.id !== vieja.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [temaId])

  const crear = useCallback(async (temaIdParam: string, orden: number) => {
    const user_id = await getUserId()
    const { data, error } = await supabase
      .from('notas')
      .insert({ tema_id: temaIdParam, contenido: '', orden, user_id })
      .select()
      .single()
    if (error) throw error
    return data as Nota
  }, [])

  const actualizar = useCallback(
    async (id: string, cambios: Partial<Pick<Nota, 'titulo' | 'contenido' | 'puntuacion'>>) => {
      const { error } = await supabase
        .from('notas')
        .update({ ...cambios, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    [],
  )

  const eliminar = useCallback(async (id: string) => {
    const { error } = await supabase.from('notas').delete().eq('id', id)
    if (error) throw error
  }, [])

  return { notas, cargando, crear, actualizar, eliminar }
}
