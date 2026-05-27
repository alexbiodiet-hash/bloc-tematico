import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'

type Tipo = 'exito' | 'error' | 'info'

interface Toast { id: number; mensaje: string; tipo: Tipo }

interface ToastCtx {
  exito: (msg: string) => void
  error: (msg: string) => void
  info:  (msg: string) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const mostrar = useCallback((mensaje: string, tipo: Tipo) => {
    const id = ++nextId.current
    setToasts(p => [...p, { id, mensaje, tipo }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200)
  }, [])

  const exito = useCallback((m: string) => mostrar(m, 'exito'), [mostrar])
  const error = useCallback((m: string) => mostrar(m, 'error'), [mostrar])
  const info  = useCallback((m: string) => mostrar(m, 'info'),  [mostrar])

  const bg: Record<Tipo, string> = {
    exito: 'bg-emerald-500',
    error: 'bg-red-500',
    info:  'bg-slate-700 dark:bg-slate-600',
  }
  const icono: Record<Tipo, string> = { exito: '✓', error: '✕', info: 'ℹ' }

  return (
    <Ctx.Provider value={{ exito, error, info }}>
      {children}
      {/* Contenedor de toasts — encima de la barra móvil */}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none w-max max-w-[90vw]"
           style={{ transform: 'translateX(-50%)' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className={`animate-toast-in px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium text-white flex items-center gap-2 ${bg[t.tipo]}`}
          >
            <span className="font-bold">{icono[t.tipo]}</span>
            {t.mensaje}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast necesita ToastProvider')
  return ctx
}
