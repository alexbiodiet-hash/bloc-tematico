import { useState } from 'react'

/* ── Tipos ──────────────────────────────────────────────────── */
type TipoCampo = 'opciones' | 'escala' | 'texto' | 'textarea'

interface Campo {
  id: string
  tipo: TipoCampo
  label: string
  placeholder?: string
  opciones?: string[]
  requerido?: boolean
}

interface Formulario {
  id: string
  emoji: string
  nombre: string
  descripcion: string
  campos: Campo[]
}

/* ── Definición de formularios ──────────────────────────────── */
const FORMULARIOS: Formulario[] = [
  {
    id: 'estado-general',
    emoji: '🌡️',
    nombre: 'Estado general',
    descripcion: 'Cómo estás ahora mismo',
    campos: [
      {
        id: 'estado',
        tipo: 'opciones',
        label: '¿Cómo te sientes?',
        requerido: true,
        opciones: ['😴 Agotado', '😟 Bajo', '😐 Normal', '🙂 Bien', '🚀 Cargado'],
      },
      {
        id: 'energia',
        tipo: 'escala',
        label: '¿Nivel de energía?',
        requerido: true,
      },
      {
        id: 'notas',
        tipo: 'textarea',
        label: 'Notas adicionales',
        placeholder: 'Algo que quieras añadir…',
      },
    ],
  },
  {
    id: 'checkin-tema',
    emoji: '🎯',
    nombre: 'Check-in sobre algo',
    descripcion: 'Cómo estás respecto a un tema concreto',
    campos: [
      {
        id: 'tema',
        tipo: 'texto',
        label: '¿Sobre qué es este check-in?',
        placeholder: 'Ej: El proyecto, la dieta, el estudio…',
        requerido: true,
      },
      {
        id: 'estado',
        tipo: 'opciones',
        label: '¿Cómo te sientes respecto a ello?',
        requerido: true,
        opciones: ['😟 Bloqueado', '😐 Incierto', '🙂 Avanzando', '💪 En flujo'],
      },
      {
        id: 'freno',
        tipo: 'textarea',
        label: '¿Qué te frena o preocupa?',
        placeholder: 'Opcional…',
      },
      {
        id: 'paso',
        tipo: 'texto',
        label: '¿Cuál es el siguiente paso concreto?',
        placeholder: 'Opcional…',
      },
    ],
  },
  {
    id: 'inicio-jornada',
    emoji: '🌅',
    nombre: 'Inicio de jornada',
    descripcion: 'Cómo arrancas el día',
    campos: [
      {
        id: 'llegada',
        tipo: 'opciones',
        label: '¿Cómo llegas hoy?',
        requerido: true,
        opciones: ['😴 Agotado', '😕 Con poco ánimo', '😐 Normal', '🙂 Bien', '🚀 Con energía'],
      },
      {
        id: 'intencion',
        tipo: 'texto',
        label: '¿Cuál es tu intención principal para hoy?',
        placeholder: 'Lo más importante que quieres lograr…',
        requerido: true,
      },
      {
        id: 'nota',
        tipo: 'textarea',
        label: 'Algo que quieras dejar anotado antes de empezar',
        placeholder: 'Opcional…',
      },
    ],
  },
  {
    id: 'reflexion',
    emoji: '🌙',
    nombre: 'Reflexión',
    descripcion: 'Cierre de jornada o momento de reflexión',
    campos: [
      {
        id: 'bien',
        tipo: 'textarea',
        label: '¿Qué salió bien?',
        placeholder: 'Al menos una cosa…',
        requerido: true,
      },
      {
        id: 'dificil',
        tipo: 'textarea',
        label: '¿Qué fue difícil?',
        placeholder: 'Opcional…',
      },
      {
        id: 'manana',
        tipo: 'texto',
        label: '¿Qué hago mañana o en la próxima sesión?',
        placeholder: 'Opcional…',
      },
    ],
  },
]

/* ── Generador de Markdown ──────────────────────────────────── */
function generarMarkdown(form: Formulario, respuestas: Record<string, string>): string {
  const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const temaExtra = form.id === 'checkin-tema' && respuestas['tema']
    ? `: ${respuestas['tema']}`
    : ''
  let md = `## ${form.emoji} ${form.nombre}${temaExtra} — ${hora}\n\n`

  for (const campo of form.campos) {
    if (campo.id === 'tema') continue // ya en el título
    const val = respuestas[campo.id]?.trim()
    if (!val) continue
    md += `**${campo.label}** ${val}\n\n`
  }

  return md.trimEnd() + '\n\n'
}

/* ── Componente ─────────────────────────────────────────────── */
interface Props {
  onCompletado: (texto: string) => void
  onCerrar: () => void
}

export default function ModalFormulario({ onCompletado, onCerrar }: Props) {
  const [seleccionado, setSeleccionado] = useState<Formulario | null>(null)
  const [respuestas,   setRespuestas]   = useState<Record<string, string>>({})

  function setRespuesta(id: string, val: string) {
    setRespuestas((prev) => ({ ...prev, [id]: val }))
  }

  function handleEnviar() {
    if (!seleccionado) return
    const texto = generarMarkdown(seleccionado, respuestas)
    onCompletado(texto)
  }

  const puedeEnviar = seleccionado
    ? seleccionado.campos
        .filter((c) => c.requerido)
        .every((c) => respuestas[c.id]?.trim())
    : false

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className="animate-modal-in w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-xl overflow-y-auto max-h-[90vh]">

        {!seleccionado ? (
          /* ── Fase 1: Picker ─────────────────────────── */
          <div className="p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
              ¿Qué tipo de check-in?
            </h2>
            <p className="text-sm text-slate-400 mb-5">Elige uno para guiarte, o cierra para escribir libremente.</p>

            <div className="space-y-2">
              {FORMULARIOS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setSeleccionado(f); setRespuestas({}) }}
                  className="w-full flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-left hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
                >
                  <span className="text-2xl shrink-0">{f.emoji}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{f.nombre}</div>
                    <div className="text-xs text-slate-400">{f.descripcion}</div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onCerrar}
              className="mt-4 w-full text-center text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              Cancelar
            </button>
          </div>
        ) : (
          /* ── Fase 2: Formulario ─────────────────────── */
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <button
                type="button"
                onClick={() => setSeleccionado(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition text-sm"
              >←</button>
              <span className="text-xl">{seleccionado.emoji}</span>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {seleccionado.nombre}
              </h2>
            </div>

            <div className="space-y-4">
              {seleccionado.campos.map((campo) => (
                <div key={campo.id}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {campo.label}
                    {campo.requerido && <span className="ml-1 text-red-400">*</span>}
                  </label>

                  {campo.tipo === 'opciones' && (
                    <div className="flex flex-wrap gap-2">
                      {campo.opciones?.map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setRespuesta(campo.id, op)}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                            respuestas[campo.id] === op
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  )}

                  {campo.tipo === 'escala' && (
                    <div className="flex gap-1 flex-wrap">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRespuesta(campo.id, `${n}/10`)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium border transition ${
                            respuestas[campo.id] === `${n}/10`
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}

                  {campo.tipo === 'texto' && (
                    <input
                      type="text"
                      value={respuestas[campo.id] ?? ''}
                      onChange={(e) => setRespuesta(campo.id, e.target.value)}
                      placeholder={campo.placeholder}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                  )}

                  {campo.tipo === 'textarea' && (
                    <textarea
                      value={respuestas[campo.id] ?? ''}
                      onChange={(e) => setRespuesta(campo.id, e.target.value)}
                      placeholder={campo.placeholder}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-5">
              <button
                type="button"
                onClick={onCerrar}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEnviar}
                disabled={!puedeEnviar}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                Añadir al borrador
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
