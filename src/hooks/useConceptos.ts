import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Concepto {
  id: string
  nombre: string
  unidad: string | null
  emoji: string | null
  nota_defecto: string | null
  created_at: string
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return user.id
}

export function useConceptos() {
  const [conceptos, setConceptos] = useState<Concepto[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setCargando(false), 6000)
    supabase
      .from('conceptos')
      .select('*')
      .order('created_at')
      .then(({ data }) => {
        clearTimeout(timer)
        if (data) setConceptos(data as Concepto[])
        setCargando(false)
      })
      .catch(() => {
        clearTimeout(timer)
        setCargando(false)
      })

    const canal = supabase
      .channel('conceptos-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conceptos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setConceptos((p) => [...p, payload.new as Concepto])
        } else if (payload.eventType === 'UPDATE') {
          setConceptos((p) =>
            p.map((c) => (c.id === (payload.new as Concepto).id ? (payload.new as Concepto) : c)),
          )
        } else if (payload.eventType === 'DELETE') {
          setConceptos((p) => p.filter((c) => c.id !== (payload.old as Partial<Concepto>).id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [])

  const crear = useCallback(
    async (nombre: string, unidad: string, emoji: string) => {
      const user_id = await getUserId()
      const { data, error } = await supabase
        .from('conceptos')
        .insert({ nombre, unidad: unidad || null, emoji: emoji || null, user_id })
        .select()
        .single()
      if (error) throw error
      return data as Concepto
    },
    [],
  )

  const actualizar = useCallback(
    async (id: string, cambios: Partial<Pick<Concepto, 'nombre' | 'unidad' | 'emoji' | 'nota_defecto'>>) => {
      const { error } = await supabase.from('conceptos').update(cambios).eq('id', id)
      if (error) throw error
    },
    [],
  )

  const eliminar = useCallback(async (id: string) => {
    const { error } = await supabase.from('conceptos').delete().eq('id', id)
    if (error) throw error
  }, [])

  return { conceptos, cargando, crear, actualizar, eliminar }
}
