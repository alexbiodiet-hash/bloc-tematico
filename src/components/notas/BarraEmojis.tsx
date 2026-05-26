import { useRef, useState } from 'react'
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react'
import { useTheme } from '../../hooks/useTheme'

const RAPIDOS = ['➡️', '⭐', '✅', '⚠️', '📌', '🔥', '❓', '💡']

interface Props {
  onInsertar: (emoji: string) => void
}

export default function BarraEmojis({ onInsertar }: Props) {
  const [mostrarPicker, setMostrarPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const { tema } = useTheme()

  function onEmojiClick(data: EmojiClickData) {
    onInsertar(data.emoji)
    setMostrarPicker(false)
  }

  return (
    <div className="relative mb-1">
      <div className="flex items-center gap-0.5 flex-wrap border-b border-slate-200 dark:border-slate-700 pb-1">
        {RAPIDOS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onInsertar(e)}
            className="text-base w-7 h-7 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {e}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMostrarPicker((v) => !v)}
          className="ml-1 text-xs px-2 h-7 rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
        >
          + Más
        </button>
      </div>

      {mostrarPicker && (
        <>
          {/* Capa para cerrar al hacer clic fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMostrarPicker(false)}
          />
          <div ref={pickerRef} className="absolute z-50 top-9 left-0">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme={tema === 'oscuro' ? Theme.DARK : Theme.LIGHT}
              searchPlaceholder="Buscar emoji…"
              width={300}
              height={360}
            />
          </div>
        </>
      )}
    </div>
  )
}
