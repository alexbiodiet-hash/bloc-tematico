import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type Repeticion = 'ninguna' | 'diaria' | 'semanal' | 'mensual'

export interface Alarma {
  id: string
  titulo: string
  mensaje: string | null
  proxima_vez: string
  repeticion: Repeticion
  activa: boolean
  tema_id: string | null
  created_at: string
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return user.id
}

export function useAlarmas() {
  const [alarmas, setAlarmas] = useState<Alarma[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase
      .from('alarmas')
      .select('*')
      .order('proxima_vez')
      .then(({ data }) => {
        if (data) setAlarmas(data as Alarma[])
        setCargando(false)
      })

    const canal = supabase
      .channel('alarmas-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alarmas' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAlarmas((p) => [...p, payload.new as Alarma].sort(
            (a, b) => new Date(a.proxima_vez).getTime() - new Date(b.proxima_vez).getTime()
          ))
        } else if (payload.eventType === 'UPDATE') {
          setAlarmas((p) => p.map((a) => a.id === (payload.new as Alarma).id ? payload.new as Alarma : a))
        } else if (payload.eventType === 'DELETE') {
          setAlarmas((p) => p.filter((a) => a.id !== (payload.old as Partial<Alarma>).id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [])

  const crear = useCallback(async (datos: Omit<Alarma, 'id' | 'created_at'>) => {
    const user_id = await getUserId()
    const { data, error } = await supabase
      .from('alarmas')
      .insert({ ...datos, user_id })
      .select()
      .single()
    if (error) throw error
    return data as Alarma
  }, [])

  const actualizar = useCallback(async (id: string, cambios: Partial<Omit<Alarma, 'id' | 'created_at'>>) => {
    const { error } = await supabase.from('alarmas').update(cambios).eq('id', id)
    if (error) throw error
  }, [])

  const eliminar = useCallback(async (id: string) => {
    const { error } = await supabase.from('alarmas').delete().eq('id', id)
    if (error) throw error
  }, [])

  return { alarmas, cargando, crear, actualizar, eliminar }
}
