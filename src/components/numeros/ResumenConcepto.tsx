import { useMemo, useState } from 'react'
import type { Registro } from '../../hooks/useRegistros'

type Periodo = 'todo' | 'dia' | 'semana' | 'mes'

function inicioDeRango(periodo: Periodo): Date | null {
  if (periodo === 'todo') return null
  const d = new Date()
  if (periodo === 'dia') { d.setHours(0, 0, 0, 0); return d }
  if (periodo === 'semana') {
    const dia = d.getDay()
    d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1))
    d.setHours(0, 0, 0, 0)
    return d
  }
  d.setDate(1); d.setHours(0, 0, 0, 0); return d
}

interface Props {
  registros: Registro[]
  unidad: string | null
}

export default function ResumenConcepto({ registros, unidad }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('todo')

  const filtrados = useMemo(() => {
    const inicio = inicioDeRango(periodo)
    if (!inicio) return registros
    return registros.filter((r) => new Date(r.fecha_hora) >= inicio)
  }, [registros, periodo])

  // Ordenados por fecha para sacar el último
  const ordenados = useMemo(
    () => [...filtrados].sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()),
    [filtrados],
  )

  const count   = filtrados.length
  const ultimo  = ordenados[0]?.valor ?? null
  const maximo  = count ? Math.max(...filtrados.map((r) => r.valor)) : null

  function fmt(n: number) {
    return Number.isInteger(n) ? n.toString() : n.toFixed(2)
  }

  const u = unidad ? ` ${unidad}` : ''

  const periodos: { key: Periodo; label: string }[] = [
    { key: 'todo',   label: 'Todo' },
    { key: 'dia',    label: 'Hoy' },
    { key: 'semana', label: 'Esta semana' },
    { key: 'mes',    label: 'Este mes' },
  ]

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      {/* Selector de período */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {periodos.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriodo(p.key)}
            className={`px-3 py-1 text-xs rounded-full transition ${
              periodo === p.key
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-3 gap-3">
        {/* Registros (conteo) */}
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/20 p-3 text-center">
          <div className="text-xs text-indigo-500 dark:text-indigo-400 mb-1 font-medium tracking-wide">
            REGISTROS
          </div>
          <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {count}
          </div>
        </div>

        {/* Último valor */}
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
          <div className="text-xs text-emerald-500 dark:text-emerald-400 mb-1 font-medium tracking-wide">
            ÚLTIMO
          </div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {ultimo !== null ? `${fmt(ultimo)}${u}` : '—'}
          </div>
        </div>

        {/* Máximo */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-center">
          <div className="text-xs text-amber-500 dark:text-amber-400 mb-1 font-medium tracking-wide">
            MÁXIMO
          </div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
            {maximo !== null ? `${fmt(maximo)}${u}` : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
