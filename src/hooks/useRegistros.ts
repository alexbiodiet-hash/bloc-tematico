import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Registro {
  id: string
  concepto_id: string
  valor: number
  nota: string | null
  fecha_hora: string
  created_at: string
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return user.id
}

export function useRegistros(conceptoId: string | null) {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!conceptoId) { setRegistros([]); return }
    setCargando(true)

    supabase
      .from('registros')
      .select('*')
      .eq('concepto_id', conceptoId)
      .order('fecha_hora', { ascending: false })
      .then(({ data }) => {
        if (data) setRegistros(data as Registro[])
        setCargando(false)
      })

    const canal = supabase
      .channel(`registros-rt-${conceptoId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registros' }, (payload) => {
        const nuevo = payload.new as Registro
        const viejo = payload.old as Partial<Registro>
        if (payload.eventType === 'INSERT' && nuevo.concepto_id === conceptoId) {
          setRegistros((p) => [nuevo, ...p])
        } else if (payload.eventType === 'UPDATE' && nuevo.concepto_id === conceptoId) {
          setRegistros((p) => p.map((r) => (r.id === nuevo.id ? nuevo : r)))
        } else if (payload.eventType === 'DELETE') {
          setRegistros((p) => p.filter((r) => r.id !== viejo.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [conceptoId])

  const crear = useCallback(
    async (conceptoIdParam: string, valor: number, nota: string, fecha_hora: string) => {
      const user_id = await getUserId()
      const { data, error } = await supabase
        .from('registros')
        .insert({ concepto_id: conceptoIdParam, valor, nota: nota || null, fecha_hora, user_id })
        .select()
        .single()
      if (error) throw error
      return data as Registro
    },
    [],
  )

  const eliminar = useCallback(async (id: string) => {
    const { error } = await supabase.from('registros').delete().eq('id', id)
    if (error) throw error
  }, [])

  return { registros, cargando, crear, eliminar }
}
