import { useState } from 'react'
import type { Tema } from '../../hooks/useTemas'
import ModalTema from './ModalTema'
import { SkeletonTema } from '../ui/Skeleton'

interface Props {
  temas: Tema[]
  temaActualId: string | null
  cargando: boolean
  notaCounts: Record<string, number>
  onSeleccionar: (id: string) => void
  onCrear: (nombre: string, emoji: string) => Promise<Tema>
  onActualizar: (id: string, cambios: Partial<Pick<Tema, 'nombre' | 'emoji'>>) => Promise<void>
  onEliminar: (id: string) => Promise<void>
}

export default function PanelTemas({
  temas,
  temaActualId,
  cargando,
  notaCounts,
  onSeleccionar,
  onCrear,
  onActualizar,
  onEliminar,
}: Props) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Tema | null>(null)
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

  function abrirEditar(tema: Tema, e: React.MouseEvent) {
    e.stopPropagation()
    setEditando(tema)
    setModalAbierto(true)
  }

  async function handleEliminar(id: string) {
    if (temaActualId === id) onSeleccionar('')
    await onEliminar(id)
    setConfirmandoId(null)
  }

  return (
    <>
      <aside className={`shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 h-full overflow-y-auto ${temaActualId ? 'hidden md:flex md:w-56' : 'flex w-full md:w-56'}`}>

        {/* Botón nueva temática */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setEditando(null)
              setModalAbierto(true)
            }}
            className="w-full text-sm py-2 px-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition font-medium"
          >
            ＋ Nueva temática
          </button>
        </div>

        {/* Lista */}
        <nav className="flex-1 p-2 space-y-0.5">
          {cargando && (
            <div className="space-y-1 px-1 pt-1">
              {[1, 2, 3].map((i) => <SkeletonTema key={i} />)}
            </div>
          )}

          {!cargando && temas.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 px-3 text-center">
              <span className="text-3xl">📂</span>
              <p className="text-xs text-slate-400 leading-snug">
                Aún no tienes temáticas.<br />Crea la primera con el botón de arriba.
              </p>
            </div>
          )}

          {temas.map((tema) => {
            const activo = temaActualId === tema.id
            const confirmando = confirmandoId === tema.id

            return (
              <div key={tema.id}>
                <div
                  onClick={() => { if (!confirmando) onSeleccionar(tema.id) }}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-all ${
                    activo
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-lg shrink-0">{tema.emoji ?? '📁'}</span>
                  <span className="flex-1 text-sm font-medium truncate">{tema.nombre}</span>
              {(notaCounts[tema.id] ?? 0) > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  activo
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {notaCounts[tema.id]}
                </span>
              )}

                  {/* Acciones inline */}
                  {!confirmando && (
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => abrirEditar(tema, e)}
                        title="Editar"
                        className={`text-xs p-1 rounded hover:bg-white/20 transition ${activo ? 'text-indigo-100' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setConfirmandoId(tema.id) }}
                        title="Eliminar"
                        className={`text-xs p-1 rounded hover:bg-red-500/20 transition ${activo ? 'text-indigo-100' : 'text-slate-400 hover:text-red-500'}`}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>

                {/* Confirmación de borrado inline */}
                {confirmando && (
                  <div className="mx-1 mb-1 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-3 py-2 flex items-center gap-2">
                    <span className="flex-1 text-xs text-red-600 dark:text-red-400">¿Eliminar con todas sus notas?</span>
                    <button
                      type="button"
                      onClick={() => handleEliminar(tema.id)}
                      className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoId(null)}
                      className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            )
          })}
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
