import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Nota } from '../../hooks/useNotas'
import { useDebounce } from '../../hooks/useDebounce'
import BarraEmojis from './BarraEmojis'

interface Props {
  nota: Nota
  numero: number
  onActualizar: (id: string, cambios: Partial<Pick<Nota, 'titulo' | 'contenido' | 'puntuacion'>>) => Promise<void>
  onEliminar: (id: string) => Promise<void>
  autoFocus?: boolean
}

function colorScore(p: number | null): string {
  if (p === null) return 'text-slate-400 bg-slate-100 dark:bg-slate-700/80'
  if (p <= 3)     return 'text-red-600    bg-red-50    dark:bg-red-900/30    dark:text-red-400'
  if (p <= 6)     return 'text-amber-600  bg-amber-50  dark:bg-amber-900/30  dark:text-amber-400'
  return              'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
}

export default function TarjetaNota({ nota, numero, onActualizar, onEliminar, autoFocus }: Props) {
  const [titulo,     setTitulo]     = useState(nota.titulo ?? '')
  const [contenido,  setContenido]  = useState(nota.contenido)
  const [puntuacion, setPuntuacion] = useState<number | null>(nota.puntuacion ?? null)
  const [abierta,    setAbierta]    = useState(autoFocus || !nota.contenido)
  const [modoVista,  setModoVista]  = useState<'editar' | 'preview'>('editar')
  const [guardando,  setGuardando]  = useState(false)
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Ref estable para no re-crear efectos
  const actualizarRef = useRef(onActualizar)
  useEffect(() => { actualizarRef.current = onActualizar }, [onActualizar])

  // Auto-guardado de título + contenido (debounced)
  const tituloD   = useDebounce(titulo,   1000)
  const contenidoD = useDebounce(contenido, 1000)
  const guardadoRef = useRef({ titulo: nota.titulo ?? '', contenido: nota.contenido })

  useEffect(() => {
    const sinCambios =
      tituloD === guardadoRef.current.titulo &&
      contenidoD === guardadoRef.current.contenido
    if (sinCambios) return
    setGuardando(true)
    actualizarRef.current(nota.id, { titulo: tituloD || null, contenido: contenidoD })
      .then(() => { guardadoRef.current = { titulo: tituloD, contenido: contenidoD } })
      .catch(console.error)
      .finally(() => setTimeout(() => setGuardando(false), 1200))
  }, [tituloD, contenidoD, nota.id])

  // Sync desde Realtime cuando la tarjeta está cerrada
  useEffect(() => {
    if (!abierta) {
      setTitulo(nota.titulo ?? '')
      setContenido(nota.contenido)
      setPuntuacion(nota.puntuacion ?? null)
      guardadoRef.current = { titulo: nota.titulo ?? '', contenido: nota.contenido }
    }
  }, [nota.titulo, nota.contenido, nota.puntuacion, abierta])

  function insertarEmoji(emoji: string) {
    const el = textareaRef.current
    if (!el) { setContenido((c) => c + emoji); return }
    const ini = el.selectionStart
    const fin = el.selectionEnd
    const nuevo = contenido.slice(0, ini) + emoji + contenido.slice(fin)
    setContenido(nuevo)
    requestAnimationFrame(() => {
      el.setSelectionRange(ini + emoji.length, ini + emoji.length)
      el.focus()
    })
  }

  function handlePuntuacion(raw: string) {
    if (raw === '') {
      setPuntuacion(null)
      actualizarRef.current(nota.id, { puntuacion: null }).catch(console.error)
      return
    }
    const num = Math.max(0, Math.min(10, parseInt(raw, 10)))
    if (isNaN(num)) return
    setPuntuacion(num)
    actualizarRef.current(nota.id, { puntuacion: num }).catch(console.error)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in">

      {/* ── Cabecera (siempre visible) ───────────────────── */}
      <div className={`flex items-center gap-2 px-3 py-2.5 ${abierta ? 'border-b border-slate-100 dark:border-slate-700/60' : ''}`}>

        {/* Número de nota */}
        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 w-5 shrink-0 text-right select-none">
          {numero}
        </span>

        {/* Botón expandir/contraer */}
        <button
          type="button"
          onClick={() => setAbierta((a) => !a)}
          className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-300 transition text-[10px] shrink-0 w-4"
          title={abierta ? 'Cerrar nota' : 'Abrir nota'}
        >
          {abierta ? '▼' : '▶'}
        </button>

        {/* Título */}
        {abierta ? (
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Sin título"
            className="flex-1 bg-transparent font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm"
          />
        ) : (
          <span
            onClick={() => setAbierta(true)}
            className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            {titulo || <span className="text-slate-400 font-normal italic">Sin título</span>}
          </span>
        )}

        {/* ── Score 0-10 ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-slate-400 select-none">Score</span>
          <input
            type="number"
            min={0}
            max={10}
            value={puntuacion ?? ''}
            onChange={(e) => handlePuntuacion(e.target.value)}
            placeholder="—"
            title="Puntuación 0-10"
            className={`w-9 text-center text-xs font-bold rounded-lg py-1 border-0 outline-none ring-0 transition
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
              ${colorScore(puntuacion)}`}
          />
        </div>

        {/* Acciones (solo cuando abierta) */}
        {abierta && (
          <div className="flex items-center gap-1 shrink-0">
            {guardando && (
              <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Guardando
              </span>
            )}
            <button
              type="button"
              onClick={() => setModoVista(modoVista === 'editar' ? 'preview' : 'editar')}
              className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            >
              {modoVista === 'editar' ? '👁' : '✏️'}
            </button>
            {confirmandoBorrar ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">¿Eliminar?</span>
                <button
                  type="button"
                  onClick={() => onEliminar(nota.id)}
                  className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                >Sí</button>
                <button
                  type="button"
                  onClick={() => setConfirmandoBorrar(false)}
                  className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >No</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoBorrar(true)}
                className="text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition"
              >🗑</button>
            )}
          </div>
        )}
      </div>

      {/* ── Cuerpo (solo cuando abierta) ────────────────── */}
      {abierta && (
        <div className="px-3 pb-3 pt-2">
          {modoVista === 'editar' ? (
            <>
              <BarraEmojis onInsertar={insertarEmoji} />
              <textarea
                ref={textareaRef}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                autoFocus={autoFocus}
                rows={8}
                placeholder={'Escribe en Markdown…\n\n**negrita**, _cursiva_, # Título\n- lista, `código`'}
                className="w-full resize-y bg-transparent text-sm text-slate-800 dark:text-slate-200 outline-none font-mono leading-relaxed placeholder:text-slate-400"
              />
            </>
          ) : (
            <div
              className="md-preview cursor-pointer min-h-12"
              onClick={() => setModoVista('editar')}
            >
              {contenido
                ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{contenido}</ReactMarkdown>
                : <p className="text-sm text-slate-400 italic">Nota vacía. Haz clic para editar.</p>
              }
            </div>
          )}
        </div>
      )}
    </div>
  )
}
