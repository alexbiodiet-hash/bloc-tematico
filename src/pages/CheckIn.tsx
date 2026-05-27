import { useState } from 'react'
import { useTemas } from '../hooks/useTemas'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import ModalFormulario from '../components/checkin/ModalFormulario'
import ModalEnviar from '../components/checkin/ModalEnviar'

async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return user.id
}

export default function CheckIn() {
  const [borrador,         setBorrador]         = useState('')
  const [modalFormulario,  setModalFormulario]  = useState(false)
  const [modalEnviar,      setModalEnviar]      = useState(false)

  const toast = useToast()
  const { temas, crear: crearTema } = useTemas()

  function handleFormularioCompletado(texto: string) {
    setBorrador((prev) => prev + texto)
    setModalFormulario(false)
  }

  async function handleEnviar(
    titulo: string,
    temaId: string | null,
    nuevoTema?: { nombre: string; emoji: string },
  ) {
    const user_id = await getUserId()

    let idFinal = temaId

    // Crear temática nueva si se pidió
    if (nuevoTema) {
      const tema = await crearTema(nuevoTema.nombre, nuevoTema.emoji)
      idFinal = tema.id
    }

    if (!idFinal) throw new Error('Selecciona una temática')

    // Crear la nota con el borrador como contenido
    const { error } = await supabase
      .from('notas')
      .insert({
        tema_id:   idFinal,
        titulo:    titulo,
        contenido: borrador.trim(),
        orden:     0,
        user_id,
      })

    if (error) throw error

    setBorrador('')
    setModalEnviar(false)
    toast.exito('Nota enviada a ' + (nuevoTema?.nombre ?? temas.find((t) => t.id === idFinal)?.nombre ?? 'tus notas'))
  }

  const hayContenido = borrador.trim().length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">💭 Check-in</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Escribe libremente o usa un formulario para guiarte. Cuando termines, envía la nota a tus blocs.
          </p>
        </div>
      </div>

      {/* Área de borrador */}
      <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 shadow-sm overflow-hidden">
        <textarea
          value={borrador}
          onChange={(e) => setBorrador(e.target.value)}
          placeholder={'Empieza a escribir…\n\nO usa el botón «＋ Formulario» de abajo para guiarte con preguntas.'}
          className="flex-1 w-full bg-transparent px-5 py-4 text-sm text-slate-800 dark:text-slate-200 outline-none resize-none leading-relaxed placeholder:text-slate-400 font-mono"
        />

        {/* Barra inferior */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalFormulario(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-indigo-400 transition"
            >
              <span>＋</span> Formulario
            </button>

            {hayContenido && (
              <button
                type="button"
                onClick={() => setBorrador('')}
                className="text-xs text-slate-400 hover:text-red-400 transition px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Limpiar
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setModalEnviar(true)}
            disabled={!hayContenido}
            className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
          >
            Enviar a notas →
          </button>
        </div>
      </div>

      {/* Estado vacío */}
      {!hayContenido && (
        <div className="mt-6 flex flex-col items-center gap-3 text-center text-slate-400">
          <div className="flex gap-3">
            {['🌡️', '🎯', '🌅', '🌙'].map((e) => (
              <span key={e} className="text-2xl opacity-40">{e}</span>
            ))}
          </div>
          <p className="text-xs max-w-xs">
            Usa un formulario de check-in o escribe directamente. Al terminar, la nota irá a cualquier bloc que elijas.
          </p>
        </div>
      )}

      {/* Modales */}
      {modalFormulario && (
        <ModalFormulario
          onCompletado={handleFormularioCompletado}
          onCerrar={() => setModalFormulario(false)}
        />
      )}
      {modalEnviar && (
        <ModalEnviar
          temas={temas}
          onEnviar={handleEnviar}
          onCerrar={() => setModalEnviar(false)}
        />
      )}
    </div>
  )
}
