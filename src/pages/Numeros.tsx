import { useState } from 'react'
import { useConceptos, type Concepto } from '../hooks/useConceptos'
import { useRegistros } from '../hooks/useRegistros'
import { useToast } from '../contexts/ToastContext'
import ModalConcepto from '../components/numeros/ModalConcepto'
import TablaRegistros from '../components/numeros/TablaRegistros'
import ResumenConcepto from '../components/numeros/ResumenConcepto'
import GraficaRegistros from '../components/numeros/GraficaRegistros'
import { SkeletonConcepto } from '../components/ui/Skeleton'

export default function Numeros() {
  const [conceptoActualId, setConceptoActualId] = useState<string | null>(null)
  const [modal, setModal] = useState<{ abierto: boolean; editando: Concepto | null }>({
    abierto: false,
    editando: null,
  })
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

  const toast = useToast()
  const { conceptos, cargando, crear, actualizar, eliminar } = useConceptos()
  const { registros, cargando: cargandoReg, crear: crearRegistro, eliminar: eliminarRegistro } =
    useRegistros(conceptoActualId)

  const conceptoActual = conceptos.find((c) => c.id === conceptoActualId)

  async function handleEliminarConcepto(id: string) {
    if (conceptoActualId === id) setConceptoActualId(null)
    await eliminar(id)
    setConfirmandoId(null)
    toast.exito('Concepto eliminado')
  }

  return (
    <div className="flex h-full -m-4">
      {/* ── Panel izquierdo ──────────────────────────────── */}
      <aside className={`shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 h-full overflow-y-auto ${conceptoActualId ? 'hidden md:flex md:w-56' : 'flex w-full md:w-56'}`}>
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setModal({ abierto: true, editando: null })}
            className="w-full text-sm py-2 px-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition font-medium"
          >
            ＋ Nuevo concepto
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {cargando && (
            <div className="space-y-1 px-1 pt-1">
              {[1, 2, 3].map((i) => <SkeletonConcepto key={i} />)}
            </div>
          )}
          {!cargando && conceptos.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 px-3 text-center">
              <span className="text-3xl">📊</span>
              <p className="text-xs text-slate-400 leading-snug">
                Aún no tienes conceptos.<br />Crea el primero con el botón de arriba.
              </p>
            </div>
          )}
          {conceptos.map((c) => {
            const activo = conceptoActualId === c.id
            const confirmando = confirmandoId === c.id
            return (
              <div key={c.id}>
                <div
                  onClick={() => { if (!confirmando) setConceptoActualId(c.id) }}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-all ${
                    activo
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-lg shrink-0">{c.emoji ?? '📊'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.nombre}</div>
                    {c.unidad && (
                      <div className={`text-xs truncate ${activo ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {c.unidad}
                      </div>
                    )}
                  </div>
                  {!confirmando && (
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setModal({ abierto: true, editando: c }) }}
                        title="Editar"
                        className={`text-xs p-1 rounded hover:bg-white/20 transition ${activo ? 'text-indigo-100' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                      >✏️</button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setConfirmandoId(c.id) }}
                        title="Eliminar"
                        className={`text-xs p-1 rounded hover:bg-red-500/20 transition ${activo ? 'text-indigo-100' : 'text-slate-400 hover:text-red-500'}`}
                      >🗑</button>
                    </div>
                  )}
                </div>

                {confirmando && (
                  <div className="mx-1 mb-1 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-3 py-2 flex items-center gap-2">
                    <span className="flex-1 text-xs text-red-600 dark:text-red-400">¿Eliminar con todos sus registros?</span>
                    <button type="button" onClick={() => handleEliminarConcepto(c.id)} className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition">Sí</button>
                    <button type="button" onClick={() => setConfirmandoId(null)} className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition">No</button>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* ── Panel derecho ────────────────────────────────── */}
      <div className={`flex-1 flex-col overflow-hidden ${conceptoActualId ? 'flex' : 'hidden md:flex'}`}>
        {!conceptoActualId ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="max-w-xs">
              <div className="text-4xl mb-3">👈</div>
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">Selecciona un concepto</h2>
              <p className="text-sm text-slate-400 mt-1">O crea uno nuevo con el botón de arriba.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConceptoActualId(null)}
                className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg transition"
              >←</button>
              <span className="text-3xl">{conceptoActual?.emoji ?? '📊'}</span>
              <div>
                <h2 className="font-bold text-xl text-slate-900 dark:text-white">{conceptoActual?.nombre}</h2>
                {conceptoActual?.unidad && <span className="text-sm text-slate-400">{conceptoActual.unidad}</span>}
              </div>
            </div>

            <ResumenConcepto registros={registros} unidad={conceptoActual?.unidad ?? null} />
            <GraficaRegistros registros={registros} unidad={conceptoActual?.unidad ?? null} />

            {cargandoReg ? (
              <p className="text-sm text-slate-400">Cargando registros…</p>
            ) : (
              <TablaRegistros
                key={conceptoActualId}
                registros={registros}
                unidad={conceptoActual?.unidad ?? null}
                conceptoId={conceptoActualId}
                notaDefecto={conceptoActual?.nota_defecto ?? null}
                onCrear={crearRegistro}
                onEliminar={eliminarRegistro}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal crear/editar concepto */}
      {modal.abierto && (
        <ModalConcepto
          inicial={
            modal.editando ? {
              nombre:      modal.editando.nombre,
              unidad:      modal.editando.unidad ?? '',
              emoji:       modal.editando.emoji  ?? '📊',
              notaDefecto: modal.editando.nota_defecto ?? '',
            } : undefined
          }
          onGuardar={async (nombre, unidad, emoji, notaDefecto) => {
            if (modal.editando) {
              await actualizar(modal.editando.id, { nombre, unidad: unidad || null, emoji: emoji || null, nota_defecto: notaDefecto || null })
              toast.exito('Concepto actualizado')
            } else {
              const nuevo = await crear(nombre, unidad, emoji)
              // Guardar también nota_defecto si se introdujo
              if (notaDefecto) {
                await actualizar(nuevo.id, { nota_defecto: notaDefecto })
              }
              setConceptoActualId(nuevo.id)
              toast.exito('Concepto creado')
            }
          }}
          onCerrar={() => setModal({ abierto: false, editando: null })}
        />
      )}
    </div>
  )
}
