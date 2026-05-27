import { useState, type FormEvent } from 'react'
import type { Tema } from '../../hooks/useTemas'

interface Props {
  temas: Tema[]
  onEnviar: (titulo: string, temaId: string | null, nuevoTema?: { nombre: string; emoji: string }) => Promise<void>
  onCerrar: () => void
}

function tituloDefecto() {
  return `Check-in ${new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })} ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
}

export default function ModalEnviar({ temas, onEnviar, onCerrar }: Props) {
  const [titulo,        setTitulo]        = useState(tituloDefecto())
  const [temaId,        setTemaId]        = useState<string>(temas[0]?.id ?? '')
  const [nuevoTema,     setNuevoTema]     = useState(false)
  const [nuevoNombre,   setNuevoNombre]   = useState('')
  const [nuevoEmoji,    setNuevoEmoji]    = useState('📁')
  const [enviando,      setEnviando]      = useState(false)
  const [error,         setError]         = useState<string | null>(null)

  const puedeEnviar = titulo.trim() && (nuevoTema ? nuevoNombre.trim() : temaId)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!puedeEnviar) return
    setError(null)
    setEnviando(true)
    try {
      if (nuevoTema) {
        await onEnviar(titulo.trim(), null, { nombre: nuevoNombre.trim(), emoji: nuevoEmoji })
      } else {
        await onEnviar(titulo.trim(), temaId, undefined)
      }
      onCerrar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="animate-modal-in w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          Enviar a notas
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Título de la nota */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Título de la nota
            </label>
            <input
              type="text"
              required
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          {/* Selección de temática */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Enviar a…
            </label>

            {/* Temáticas existentes */}
            {temas.length > 0 && !nuevoTema && (
              <div className="space-y-1 mb-2">
                {temas.map((t) => (
                  <label
                    key={t.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition ${
                      temaId === t.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700'
                        : 'border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tema"
                      value={t.id}
                      checked={temaId === t.id}
                      onChange={() => setTemaId(t.id)}
                      className="accent-indigo-600"
                    />
                    <span className="text-base">{t.emoji ?? '📁'}</span>
                    <span className="text-sm text-slate-800 dark:text-slate-200">{t.nombre}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Nueva temática */}
            <button
              type="button"
              onClick={() => setNuevoTema((v) => !v)}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition ${
                nuevoTema
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              ＋ Nueva temática
            </button>

            {nuevoTema && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={nuevoEmoji}
                  onChange={(e) => setNuevoEmoji(e.target.value)}
                  maxLength={2}
                  className="w-12 text-center rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-2 text-sm outline-none focus:border-indigo-400"
                />
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Nombre de la temática…"
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
              </div>
            )}
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
              disabled={enviando || !puedeEnviar}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {enviando ? 'Enviando…' : 'Enviar ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
