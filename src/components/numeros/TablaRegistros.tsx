import { useRef, useState } from 'react'
import type { Registro } from '../../hooks/useRegistros'

function fechaLocal(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ahoraISO() {
  return new Date().toISOString().slice(0, 16)
}

interface Props {
  registros: Registro[]
  unidad: string | null
  conceptoId: string
  notaDefecto: string | null
  onCrear: (conceptoId: string, valor: number, nota: string, fecha_hora: string) => Promise<unknown>
  onEliminar: (id: string) => Promise<void>
}

export default function TablaRegistros({ registros, unidad, conceptoId, notaDefecto, onCrear, onEliminar }: Props) {
  const [valor,        setValor]        = useState('')
  const [fecha,        setFecha]        = useState(ahoraISO())
  const [enviando,     setEnviando]     = useState(false)
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)
  const valorRef = useRef<HTMLInputElement>(null)

  // La nota por defecto del concepto (no editable aquí, se configura en el modal)
  const notaFija = notaDefecto ?? ''

  async function añadir() {
    const num = parseFloat(valor.replace(',', '.'))
    if (isNaN(num)) return
    setEnviando(true)
    try {
      await onCrear(conceptoId, num, notaFija, new Date(fecha).toISOString())
      setValor('')
      setFecha(ahoraISO())
      valorRef.current?.focus()
    } catch (err) {
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') añadir()
  }

  const etiquetaValor = unidad ? `Valor (${unidad})` : 'Valor'

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-left">
            <th className="px-3 py-2 font-medium">Nota</th>
            <th className="px-3 py-2 font-medium w-28">{etiquetaValor}</th>
            <th className="px-3 py-2 font-medium w-44">Fecha / hora</th>
            <th className="px-3 py-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {/* Fila de alta rápida */}
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-indigo-50/50 dark:bg-indigo-900/10">
            {/* Nota fija — solo lectura, indica que viene del concepto */}
            <td className="px-3 py-2">
              {notaFija ? (
                <span className="text-sm text-slate-600 dark:text-slate-300 italic">{notaFija}</span>
              ) : (
                <span className="text-xs text-slate-400">Sin nota fija — edita el concepto para añadirla</span>
              )}
            </td>
            <td className="px-2 py-1.5">
              <input
                ref={valorRef}
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="0"
                autoFocus
                className="w-full rounded-md border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 px-2 py-1 outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </td>
            <td className="px-2 py-1.5">
              <input
                type="datetime-local"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                onKeyDown={onKeyDown}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-xs"
              />
            </td>
            <td className="px-2 py-1.5">
              <button
                type="button"
                onClick={añadir}
                disabled={enviando || !valor}
                className="w-8 h-8 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition text-base flex items-center justify-center"
              >
                ＋
              </button>
            </td>
          </tr>

          {/* Registros */}
          {registros.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                Sin registros aún. Escribe un valor y pulsa Enter.
              </td>
            </tr>
          )}
          {registros.map((r) => (
            <tr
              key={r.id}
              className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
            >
              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.nota ?? ''}</td>
              <td className="px-3 py-2 font-mono font-medium text-slate-900 dark:text-white">
                {r.valor}{unidad ? <span className="ml-1 text-xs text-slate-400">{unidad}</span> : null}
              </td>
              <td className="px-3 py-2 text-slate-500 dark:text-slate-400 text-xs">
                {fechaLocal(r.fecha_hora)}
              </td>
              <td className="px-3 py-2">
                {confirmandoId === r.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => { onEliminar(r.id); setConfirmandoId(null) }}
                      className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white hover:bg-red-600 transition"
                    >Sí</button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoId(null)}
                      className="text-xs px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >No</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmandoId(r.id)}
                    className="text-slate-300 hover:text-red-400 transition"
                  >🗑</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
