import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Nota } from '../../hooks/useNotas'
import { useDebounce } from '../../hooks/useDebounce'
import BarraEmojis from './BarraEmojis'

interface Props {
  nota: Nota
  onActualizar: (id: string, cambios: Partial<Pick<Nota, 'titulo' | 'contenido'>>) => Promise<void>
  onEliminar: (id: string) => Promise<void>
  autoFocus?: boolean
}

export default function TarjetaNota({ nota, onActualizar, onEliminar, autoFocus }: Props) {
  const [titulo, setTitulo] = useState(nota.titulo ?? '')
  const [contenido, setContenido] = useState(nota.contenido)
  const [modo, setModo] = useState<'editar' | 'preview'>(
    autoFocus || !nota.contenido ? 'editar' : 'preview',
  )
  const [guardando, setGuardando] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Ref estable de onActualizar para no recalcular el efecto
  const actualizarRef = useRef(onActualizar)
  useEffect(() => {
    actualizarRef.current = onActualizar
  }, [onActualizar])

  const tituloD = useDebounce(titulo, 1000)
  const contenidoD = useDebounce(contenido, 1000)

  // Referencia a lo último guardado para evitar saves redundantes
  const guardadoRef = useRef({ titulo: nota.titulo ?? '', contenido: nota.contenido })

  useEffect(() => {
    const sinCambios =
      tituloD === guardadoRef.current.titulo && contenidoD === guardadoRef.current.contenido
    if (sinCambios) return

    setGuardando(true)
    actualizarRef
      .current(nota.id, { titulo: tituloD || null, contenido: contenidoD })
      .then(() => {
        guardadoRef.current = { titulo: tituloD, contenido: contenidoD }
      })
      .catch(console.error)
      .finally(() => {
        // Mínimo 1.2 s visible para que el usuario lo vea
        setTimeout(() => setGuardando(false), 1200)
      })
  }, [tituloD, contenidoD, nota.id])

  // Actualizar desde Realtime solo cuando no está en modo editar
  useEffect(() => {
    if (modo === 'preview') {
      setTitulo(nota.titulo ?? '')
      setContenido(nota.contenido)
      guardadoRef.current = { titulo: nota.titulo ?? '', contenido: nota.contenido }
    }
  }, [nota.titulo, nota.contenido, modo])

  function insertarEmoji(emoji: string) {
    const el = textareaRef.current
    if (!el) {
      setContenido((c) => c + emoji)
      return
    }
    const ini = el.selectionStart
    const fin = el.selectionEnd
    const nuevo = contenido.slice(0, ini) + emoji + contenido.slice(fin)
    setContenido(nuevo)
    requestAnimationFrame(() => {
      el.setSelectionRange(ini + emoji.length, ini + emoji.length)
      el.focus()
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
      {/* Cabecera */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-700">
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Sin título"
          className="flex-1 bg-transparent font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm"
        />
        <div className="flex items-center gap-1 shrink-0">
          {guardando && (
            <span className="text-xs text-slate-400 dark:text-slate-500">Guardando…</span>
          )}
          <button
            type="button"
            onClick={() => setModo(modo === 'editar' ? 'preview' : 'editar')}
            className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            {modo === 'editar' ? '👁 Vista previa' : '✏️ Editar'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Eliminar esta nota?')) onEliminar(nota.id)
            }}
            className="text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-3 pb-3 pt-2">
        {modo === 'editar' ? (
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
            onClick={() => setModo('editar')}
          >
            {contenido ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{contenido}</ReactMarkdown>
            ) : (
              <p className="text-sm text-slate-400 italic">Nota vacía. Haz clic para editar.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
