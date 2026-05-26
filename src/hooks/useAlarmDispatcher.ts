import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Repeticion } from './useAlarmas'

function proximaVez(actual: string, repeticion: Repeticion): string {
  const d = new Date(actual)
  switch (repeticion) {
    case 'diaria':  d.setDate(d.getDate() + 1); break
    case 'semanal': d.setDate(d.getDate() + 7); break
    case 'mensual': d.setMonth(d.getMonth() + 1); break
  }
  return d.toISOString()
}

async function dispararAlarmas() {
  const ahora = new Date().toISOString()

  const { data: alarmas } = await supabase
    .from('alarmas')
    .select('id, titulo, mensaje, proxima_vez, repeticion, activa')
    .eq('activa', true)
    .lte('proxima_vez', ahora)

  if (!alarmas || alarmas.length === 0) return

  for (const alarma of alarmas) {
    // Notificación nativa del navegador
    if (Notification.permission === 'granted') {
      new Notification(`⏰ ${alarma.titulo}`, {
        body: alarma.mensaje ?? undefined,
        icon: '/favicon.ico',
        tag: alarma.id,          // evita duplicados si se dispara dos veces
      })
    }

    // Actualizar la alarma en Supabase
    if (alarma.repeticion === 'ninguna') {
      await supabase.from('alarmas').update({ activa: false }).eq('id', alarma.id)
    } else {
      await supabase
        .from('alarmas')
        .update({ proxima_vez: proximaVez(alarma.proxima_vez, alarma.repeticion as Repeticion) })
        .eq('id', alarma.id)
    }
  }
}

export function useAlarmDispatcher() {
  const permisoPedidoRef = useRef(false)

  useEffect(() => {
    // Pedir permiso de notificaciones una sola vez
    if (!permisoPedidoRef.current && 'Notification' in window && Notification.permission === 'default') {
      permisoPedidoRef.current = true
      Notification.requestPermission()
    }

    // Primera comprobación inmediata
    dispararAlarmas()

    // Intervalo cada 30 s
    const intervalo = setInterval(dispararAlarmas, 30_000)
    return () => clearInterval(intervalo)
  }, [])
}
