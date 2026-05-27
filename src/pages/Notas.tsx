import { useEffect, useState } from 'react'
import { useTemas } from '../hooks/useTemas'
import { useNotas } from '../hooks/useNotas'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import PanelTemas from '../components/notas/PanelTemas'
import TarjetaNota from '../components/notas/TarjetaNota'
import { SkeletonNota } from '../components/ui/Skeleton'

export default function Notas() {
  const [temaActualId, setTemaActualId] = useState<string | null>(null)
  const [nuevaNotaId,  setNuevaNotaId]  = useState<string | null>(null)
  const [notaCounts,   setNotaCounts]   = useState<Record<string, number>>({})

  const toast = useToast()
  const { temas, cargando: cargandoTemas, crear: crearTema, actualizar: actualizarTema, eliminar: eliminarTema } = useTemas()
  const { notas, cargando: cargandoNotas, crear: crearNota, actualizar: actualizarNota, eliminar: eliminarNota } = useNotas(temaActualId)

  const temaActual = temas.find((t) => t.id === temaActualId)

  // Carga los conteos de notas por temática al inicio
  useEffect(() => {
    if (temas.length === 0) return
    supabase
      .from('notas')
      .select('tema_id')
      .then(({ data }) => {
        const counts: Record<string, number> = {}
        data?.forEach((n: { tema_id: string }) => {
          counts[n.tema_id] = (counts[n.tema_id] || 0) + 1
        })
        setNotaCounts(counts)
      })
  }, [temas.length])

  async function handleCrearNota() {
    if (!temaActualId) return
    const nota = await crearNota(temaActualId, notas.length)
    if (nota) setNuevaNotaId(nota.id)
    setNotaCounts((prev) => ({ ...prev, [temaActualId]: (prev[temaActualId] || 0) + 1 }))
    toast.exito('Nota creada')
  }

  function handleSeleccionarTema(id: string) {
    setTemaActualId(id || null)
    setNuevaNotaId(null)
  }

  return (
    <div className="flex h-full -m-4">
      <PanelTemas
        temas={temas}
        temaActualId={temaActualId}
        cargando={cargandoTemas}
        notaCounts={notaCounts}
        onSeleccionar={handleSeleccionarTema}
        onCrear={crearTema}
        onActualizar={actualizarTema}
        onEliminar={eliminarTema}
      />

      <div className={`flex-1 flex-col overflow-hidden ${temaActualId ? 'flex' : 'hidden md:flex'}`}>
        {!temaActualId ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="max-w-xs">
              <div className="text-4xl mb-3">👈</div>
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Selecciona una temática
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                O crea una nueva con el botón de arriba a la izquierda.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSeleccionarTema('')}
                  className="md:hidden mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
                >←</button>
                <span className="text-xl">{temaActual?.emoji ?? '📁'}</span>
                <h2 className="font-semibold text-slate-900 dark:text-white">{temaActual?.nombre}</h2>
                <span className="text-xs text-slate-400">
                  {notas.length} {notas.length === 1 ? 'nota' : 'notas'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCrearNota}
                className="text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium"
              >
                ＋ Nueva nota
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cargandoNotas && (
                <div className="space-y-4">{[1, 2].map((i) => <SkeletonNota key={i} />)}</div>
              )}
              {!cargandoNotas && notas.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-3xl mb-2">📝</div>
                  <p className="text-sm">Sin notas aún. Pulsa «＋ Nueva nota» para empezar.</p>
                </div>
              )}
              {notas.map((nota, i) => (
                <TarjetaNota
                  key={nota.id}
                  nota={nota}
                  numero={i + 1}
                  autoFocus={nota.id === nuevaNotaId}
                  onActualizar={actualizarNota}
                  onEliminar={async (id) => {
                    await eliminarNota(id)
                    if (nuevaNotaId === id) setNuevaNotaId(null)
                    if (temaActualId) {
                      setNotaCounts((prev) => ({
                        ...prev,
                        [temaActualId]: Math.max(0, (prev[temaActualId] || 1) - 1),
                      }))
                    }
                    toast.exito('Nota eliminada')
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
