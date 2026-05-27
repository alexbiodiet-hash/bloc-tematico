import { useState, type FormEvent } from 'react'
import type { Alarma, Repeticion } from '../../hooks/useAlarmas'
import type { Tema } from '../../hooks/useTemas'

interface Props {
  inicial?: Alarma
  temas: Tema[]
  onGuardar: (datos: Omit<Alarma, 'id' | 'created_at'>) => Promise<void>
  onCerrar: () => void
}

function ahoraLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() + 10) // sugiere 10 min desde ahora
  return d.toISOString().slice(0, 16)
}

const REPETICIONES: { value: Repeticion; label: string }[] = [
  { value: 'ninguna',  label: 'Sin repetición' },
  { value: 'diaria',   label: 'Diaria' },
  { value: 'semanal',  label: 'Semanal' },
  { value: 'mensual',  label: 'Mensual' },
]

export default function ModalAlarma({ inicial, temas, onGuardar, onCerrar }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [mensaje, setMensaje] = useState(inicial?.mensaje ?? '')
  const [proximaVez, setProximaVez] = useState(
    inicial ? new Date(inicial.proxima_vez).toISOString().slice(0, 16) : ahoraLocal()
  )
  const [repeticion, setRepeticion] = useState<Repeticion>(inicial?.repeticion ?? 'ninguna')
  const [temaId, setTemaId] = useState<string>(inicial?.tema_id ?? '')
  const [activa] = useState(inicial?.activa ?? true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    setError(null)
    setGuardando(true)
    try {
      await onGuardar({
        titulo: titulo.trim(),
        mensaje: mensaje.trim() || null,
        proxima_vez: new Date(proximaVez).toISOString(),
        repeticion,
        activa,
        tema_id: temaId || null,
      })
      onCerrar()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : JSON.stringify(err)
      setError(msg)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="animate-modal-in w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">
          {inicial ? 'Editar alarma' : 'Nueva alarma'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Tomar medicación, Reunión…"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Mensaje <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Descripción adicional…"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              required
              value={proximaVez}
              onChange={(e) => setProximaVez(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Repetición
            </label>
            <div className="flex gap-2 flex-wrap">
              {REPETICIONES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRepeticion(r.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                    repeticion === r.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {temas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Temática asociada <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <select
                value={temaId}
                onChange={(e) => setTemaId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                <option value="">— Ninguna —</option>
                {temas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.emoji} {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !titulo.trim()}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
