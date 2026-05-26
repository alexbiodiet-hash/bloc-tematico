import { useState } from 'react'
import { useConceptos, type Concepto } from '../hooks/useConceptos'
import { useRegistros } from '../hooks/useRegistros'
import ModalConcepto from '../components/numeros/ModalConcepto'
import TablaRegistros from '../components/numeros/TablaRegistros'
import ResumenConcepto from '../components/numeros/ResumenConcepto'
import GraficaRegistros from '../components/numeros/GraficaRegistros'

export default function Numeros() {
  const [conceptoActualId, setConceptoActualId] = useState<string | null>(null)
  const [modal, setModal] = useState<{ abierto: boolean; editando: Concepto | null }>({
    abierto: false,
    editando: null,
  })

  const { conceptos, cargando, crear, actualizar, eliminar } = useConceptos()
  const { registros, cargando: cargandoReg, crear: crearRegistro, eliminar: eliminarRegistro } =
    useRegistros(conceptoActualId)

  const conceptoActual = conceptos.find((c) => c.id === conceptoActualId)

  async function handleEliminarConcepto(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este concepto y todos sus registros?')) return
    if (conceptoActualId === id) setConceptoActualId(null)
    await eliminar(id)
  }

  return (
    <div className="flex h-full -m-4">
      {/* Panel izquierdo: lista de conceptos */}
      <aside className={`shrink-0 flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 h-full overflow-y-auto ${conceptoActualId ? 'hidden md:flex md:w-56' : 'flex w-full md:w-56'}`}>
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setModal({ abierto: true, editando: null })}
            className="w-full text-sm py-1.5 px-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium"
          >
            ＋ Nuevo concepto
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {cargando && <p className="text-xs text-slate-400 px-2 py-3">Cargando…</p>}
          {!cargando && conceptos.length === 0 && (
            <p className="text-xs text-slate-400 px-2 py-3">Sin conceptos. Crea el primero.</p>
          )}
          {conceptos.map((c) => (
            <div
              key={c.id}
              onClick={() => setConceptoActualId(c.id)}
              className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition ${
                conceptoActualId === c.id
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-lg shrink-0">{c.emoji ?? '📊'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{c.nombre}</div>
                {c.unidad && (
                  <div className={`text-xs truncate ${conceptoActualId === c.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {c.unidad}
                  </div>
                )}
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setModal({ abierto: true, editando: c }) }}
                  className="text-xs p-0.5 rounded hover:bg-white/20"
                >✏️</button>
                <button
                  type="button"
                  onClick={(e) => handleEliminarConcepto(c.id, e)}
                  className="text-xs p-0.5 rounded hover:bg-white/20"
                >🗑</button>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Panel derecho: detalle del concepto */}
      <div className={`flex-1 flex-col overflow-hidden ${conceptoActualId ? 'flex' : 'hidden md:flex'}`}>
        {!conceptoActualId ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="max-w-xs">
              <div className="text-4xl mb-3">👈</div>
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Selecciona un concepto
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                O crea uno nuevo con el botón de arriba.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Cabecera */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConceptoActualId(null)}
                className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                ←
              </button>
              <span className="text-3xl">{conceptoActual?.emoji ?? '📊'}</span>
              <div>
                <h2 className="font-bold text-xl text-slate-900 dark:text-white">
                  {conceptoActual?.nombre}
                </h2>
                {conceptoActual?.unidad && (
                  <span className="text-sm text-slate-400">{conceptoActual.unidad}</span>
                )}
              </div>
            </div>

            {/* Resumen */}
            <ResumenConcepto registros={registros} unidad={conceptoActual?.unidad ?? null} />

            {/* Gráfica */}
            <GraficaRegistros registros={registros} unidad={conceptoActual?.unidad ?? null} />

            {/* Tabla */}
            {cargandoReg ? (
              <p className="text-sm text-slate-400">Cargando registros…</p>
            ) : (
              <TablaRegistros
                registros={registros}
                unidad={conceptoActual?.unidad ?? null}
                conceptoId={conceptoActualId}
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
            modal.editando
              ? {
                  nombre: modal.editando.nombre,
                  unidad: modal.editando.unidad ?? '',
                  emoji: modal.editando.emoji ?? '📊',
                }
              : undefined
          }
          onGuardar={async (nombre, unidad, emoji) => {
            if (modal.editando) {
              await actualizar(modal.editando.id, { nombre, unidad: unidad || null, emoji: emoji || null })
            } else {
              const nuevo = await crear(nombre, unidad, emoji)
              setConceptoActualId(nuevo.id)
            }
          }}
          onCerrar={() => setModal({ abierto: false, editando: null })}
        />
      )}
    </div>
  )
}
