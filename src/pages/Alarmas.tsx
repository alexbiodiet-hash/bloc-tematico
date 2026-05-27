import { useState } from 'react'
import { useAlarmas, type Alarma } from '../hooks/useAlarmas'
import { useTemas } from '../hooks/useTemas'
import { useToast } from '../contexts/ToastContext'
import ModalAlarma from '../components/alarmas/ModalAlarma'
import { SkeletonAlarma } from '../components/ui/Skeleton'

const ETIQUETA_REP: Record<string, string> = {
  ninguna: 'Sin repetición', diaria: 'Diaria', semanal: 'Semanal', mensual: 'Mensual',
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function estadoAlarma(alarma: Alarma) {
  if (!alarma.activa) return { texto: 'Desactivada', color: 'text-slate-400' }
  const diff = new Date(alarma.proxima_vez).getTime() - Date.now()
  if (diff < 0) return { texto: 'Vencida', color: 'text-red-500' }
  if (diff < 60 * 60 * 1000) return { texto: 'En menos de 1 h', color: 'text-amber-500' }
  return { texto: 'Activa', color: 'text-emerald-500' }
}

export default function Alarmas() {
  const { alarmas, cargando, crear, actualizar, eliminar } = useAlarmas()
  const { temas } = useTemas()
  const toast = useToast()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Alarma | null>(null)

  const activas   = alarmas.filter((a) => a.activa)
  const inactivas = alarmas.filter((a) => !a.activa)

  function abrirNueva()            { setEditando(null); setModalAbierto(true) }
  function abrirEditar(a: Alarma)  { setEditando(a);    setModalAbierto(true) }

  async function toggleActiva(alarma: Alarma) {
    await actualizar(alarma.id, { activa: !alarma.activa })
    toast.info(alarma.activa ? 'Alarma desactivada' : 'Alarma activada')
  }

  async function handleEliminar(id: string) {
    await eliminar(id)
    toast.exito('Alarma eliminada')
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">⏰ Alarmas</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {activas.length} activa{activas.length !== 1 ? 's' : ''}
            {inactivas.length > 0 && ` · ${inactivas.length} desactivada${inactivas.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={abrirNueva}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium">
          ＋ Nueva alarma
        </button>
      </div>

      {'Notification' in window && Notification.permission === 'denied' && (
        <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-300">
          ⚠️ Las notificaciones están bloqueadas en este navegador.
        </div>
      )}

      {cargando && <div className="space-y-3">{[1,2,3].map(i => <SkeletonAlarma key={i} />)}</div>}

      {!cargando && alarmas.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">⏰</div>
          <p className="text-sm">Sin alarmas. Pulsa «＋ Nueva alarma» para crear la primera.</p>
        </div>
      )}

      {activas.length > 0 && (
        <div className="space-y-3 mb-6">
          {activas.map((a) => <TarjetaAlarma key={a.id} alarma={a} temas={temas} onEditar={abrirEditar} onToggle={toggleActiva} onEliminar={handleEliminar} />)}
        </div>
      )}

      {inactivas.length > 0 && (
        <>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Desactivadas</p>
          <div className="space-y-2">
            {inactivas.map((a) => <TarjetaAlarma key={a.id} alarma={a} temas={temas} onEditar={abrirEditar} onToggle={toggleActiva} onEliminar={handleEliminar} />)}
          </div>
        </>
      )}

      {modalAbierto && (
        <ModalAlarma
          inicial={editando ?? undefined}
          temas={temas}
          onGuardar={async (datos) => {
            if (editando) { await actualizar(editando.id, datos); toast.exito('Alarma actualizada') }
            else          { await crear(datos);                    toast.exito('Alarma creada') }
          }}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  )
}

function TarjetaAlarma({ alarma, temas, onEditar, onToggle, onEliminar }: {
  alarma: Alarma
  temas: ReturnType<typeof useTemas>['temas']
  onEditar: (a: Alarma) => void
  onToggle: (a: Alarma) => void
  onEliminar: (id: string) => void
}) {
  const [confirmando, setConfirmando] = useState(false)
  const estado = estadoAlarma(alarma)
  const tema   = temas.find((t) => t.id === alarma.tema_id)

  return (
    <div className={`animate-fade-in rounded-xl border bg-white dark:bg-slate-800 p-4 transition ${
      alarma.activa ? 'border-slate-200 dark:border-slate-700' : 'border-slate-100 dark:border-slate-800 opacity-60'
    }`}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={() => onToggle(alarma)}
          className={`mt-0.5 w-10 h-6 rounded-full transition-colors shrink-0 relative ${alarma.activa ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${alarma.activa ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 dark:text-white">{alarma.titulo}</span>
            <span className={`text-xs font-medium ${estado.color}`}>{estado.texto}</span>
            {alarma.repeticion !== 'ninguna' && (
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                🔁 {ETIQUETA_REP[alarma.repeticion]}
              </span>
            )}
          </div>
          {alarma.mensaje && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{alarma.mensaje}</p>}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
            <span>🕐 {formatFecha(alarma.proxima_vez)}</span>
            {tema && <span>{tema.emoji} {tema.nombre}</span>}
          </div>
        </div>

        <div className="flex gap-1 shrink-0 items-center">
          <button type="button" onClick={() => onEditar(alarma)}
            className="text-xs p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition">✏️</button>
          {confirmando ? (
            <div className="flex gap-1">
              <button type="button" onClick={() => onEliminar(alarma.id)}
                className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-medium">Sí</button>
              <button type="button" onClick={() => setConfirmando(false)}
                className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition">No</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmando(true)}
              className="text-xs p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition">🗑</button>
          )}
        </div>
      </div>
    </div>
  )
}
