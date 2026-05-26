import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { Registro } from '../../hooks/useRegistros'

interface Props {
  registros: Registro[]
  unidad: string | null
}

export default function GraficaRegistros({ registros, unidad }: Props) {
  const datos = useMemo(() => {
    return [...registros]
      .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
      .map((r) => ({
        fecha: new Date(r.fecha_hora).toLocaleDateString('es-ES', {
          day: '2-digit', month: '2-digit',
        }),
        valor: r.valor,
        fechaCompleta: new Date(r.fecha_hora).toLocaleString('es-ES', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
      }))
  }, [registros])

  if (datos.length < 2) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center text-sm text-slate-400">
        Añade al menos 2 registros para ver la gráfica.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
        Evolución temporal
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={datos} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradValor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            unit={unidad ? ` ${unidad}` : ''}
            width={unidad ? 50 : 35}
          />
          <Tooltip
            formatter={(v) => [`${v}${unidad ? ` ${unidad}` : ''}`, 'Valor']}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fechaCompleta ?? ''}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#gradValor)"
            dot={{ r: 3, fill: '#6366f1' }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
