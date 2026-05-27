import { useState, type FormEvent } from 'react'

interface Props {
  inicial?: { nombre: string; unidad: string; emoji: string; notaDefecto: string }
  onGuardar: (nombre: string, unidad: string, emoji: string, notaDefecto: string) => Promise<void>
  onCerrar: () => void
}

const EMOJIS = ['📊', '💰', '⚖️', '🏃', '🍎', '💊', '📚', '⏱️', '🌡️', '💧', '🛒', '🎯']

export default function ModalConcepto({ inicial, onGuardar, onCerrar }: Props) {
  const [nombre,      setNombre]      = useState(inicial?.nombre      ?? '')
  const [unidad,      setUnidad]      = useState(inicial?.unidad      ?? '')
  const [emoji,       setEmoji]       = useState(inicial?.emoji       ?? '📊')
  const [notaDefecto, setNotaDefecto] = useState(inicial?.notaDefecto ?? '')
  const [guardando,   setGuardando]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    setError(null)
    setGuardando(true)
    try {
      await onGuardar(nombre.trim(), unidad.trim(), emoji, notaDefecto.trim())
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
      <div className="animate-modal-in w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          {inicial ? 'Editar concepto' : 'Nuevo concepto'}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Emoji */}
          <div>
            <div className="text-4xl text-center mb-2">{emoji}</div>
            <div className="flex flex-wrap gap-1 justify-center mb-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl w-9 h-9 rounded-lg transition ${
                    emoji === e
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={2}
              placeholder="O pega tu emoji"
              className="w-full text-center text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent px-3 py-1.5 outline-none focus:border-indigo-400"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Gasto comida, Horas estudio…"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          {/* Unidad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Unidad <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
              placeholder="€, h, km, veces…"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          {/* Nota fija */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nota fija{' '}
              <span className="font-normal text-slate-400">(se rellena sola en cada registro)</span>
            </label>
            <input
              type="text"
              value={notaDefecto}
              onChange={(e) => setNotaDefecto(e.target.value)}
              placeholder="Ej: El dinero que tengo materializado…"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !nombre.trim()}
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
