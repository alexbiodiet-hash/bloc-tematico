import { useState } from 'react'
import type { Tema } from '../../hooks/useTemas'
import ModalTema from './ModalTema'

interface Props {
  temas: Tema[]
  temaActualId: string | null
  cargando: boolean
  onSeleccionar: (id: string) => void
  onCrear: (nombre: string, emoji: string) => Promise<Tema>
  onActualizar: (id: string, cambios: Partial<Pick<Tema, 'nombre' | 'emoji'>>) => Promise<void>
  onEliminar: (id: string) => Promise<void>
}

export default function PanelTemas({
  temas,
  temaActualId,
  cargando,
  onSeleccionar,
  onCrear,
  onActualizar,
  onEliminar,
}: Props) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Tema | null>(null)

  function abrirEditar(tema: Tema, e: React.MouseEvent) {
    e.stopPropagation()
    setEditando(tema)
    setModalAbierto(true)
  }

  async function handleEliminar(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar esta temática y todas sus notas?')) return
    if (temaActualId === id) onSeleccionar('')
    await onEliminar(id)
  }

  return (
    <>
      <aside className={`shrink-0 flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 h-full overflow-y-auto ${temaActualId ? 'hidden md:flex md:w-56' : 'flex w-full md:w-56'}`}>
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setEditando(null)
              setModalAbierto(true)
            }}
            className="w-full text-sm py-1.5 px-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium"
          >
            ＋ Nueva temática
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {cargando && (
            <p className="text-xs text-slate-400 px-2 py-3">Cargando…</p>
          )}
          {!cargando && temas.length === 0 && (
            <p className="text-xs text-slate-400 px-2 py-3">
              Sin temáticas. Crea la primera.
            </p>
          )}
          {temas.map((tema) => (
            <div
              key={tema.id}
              onClick={() => onSeleccionar(tema.id)}
              className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition ${
                temaActualId === tema.id
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-lg shrink-0">{tema.emoji ?? '📁'}</span>
              <span className="flex-1 text-sm font-medium truncate">{tema.nombre}</span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={(e) => abrirEditar(tema, e)}
                  className={`text-xs p-0.5 rounded hover:bg-white/20 ${temaActualId === tema.id ? 'text-white' : 'text-slate-400'}`}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={(e) => handleEliminar(tema.id, e)}
                  className={`text-xs p-0.5 rounded hover:bg-white/20 ${temaActualId === tema.id ? 'text-white' : 'text-slate-400'}`}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {modalAbierto && (
        <ModalTema
          inicial={editando ? { nombre: editando.nombre, emoji: editando.emoji ?? '📁' } : undefined}
          onGuardar={async (nombre, emoji) => {
            if (editando) {
              await onActualizar(editando.id, { nombre, emoji })
            } else {
              await onCrear(nombre, emoji)
            }
          }}
          onCerrar={() => {
            setModalAbierto(false)
            setEditando(null)
          }}
        />
      )}
    </>
  )
}
