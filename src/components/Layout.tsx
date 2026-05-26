import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { useAlarmDispatcher } from '../hooks/useAlarmDispatcher'

const secciones = [
  { ruta: '/notas', etiqueta: 'Notas', emoji: '📝' },
  { ruta: '/numeros', etiqueta: 'Números', emoji: '🔢' },
  { ruta: '/alarmas', etiqueta: 'Alarmas', emoji: '⏰' },
]

export default function Layout() {
  const { session, cerrarSesion } = useAuth()
  const { tema, alternar } = useTheme()
  useAlarmDispatcher()

  const enlaceClase = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700',
    ].join(' ')

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Navegación lateral (escritorio) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 px-2">
          <h1 className="text-lg font-semibold">Bloc Temático</h1>
          <p className="truncate text-xs text-slate-400">{session?.user.email}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {secciones.map((s) => (
            <NavLink key={s.ruta} to={s.ruta} className={enlaceClase}>
              <span aria-hidden>{s.emoji}</span>
              {s.etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 space-y-1">
          <button
            onClick={alternar}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {tema === 'oscuro' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
          </button>
          <button
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabecera móvil */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white p-3 md:hidden dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-base font-semibold">Bloc Temático</h1>
          <div className="flex gap-2">
            <button onClick={alternar} aria-label="Cambiar tema">
              {tema === 'oscuro' ? '☀️' : '🌙'}
            </button>
            <button onClick={cerrarSesion} aria-label="Cerrar sesión">
              🚪
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-4 pb-20 md:pb-4">
          <Outlet />
        </main>

        {/* Pestañas inferiores (móvil) */}
        <nav className="fixed inset-x-0 bottom-0 flex border-t border-slate-200 bg-white md:hidden dark:border-slate-700 dark:bg-slate-800">
          {secciones.map((s) => (
            <NavLink
              key={s.ruta}
              to={s.ruta}
              className={({ isActive }) =>
                [
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400',
                ].join(' ')
              }
            >
              <span aria-hidden className="text-lg">
                {s.emoji}
              </span>
              {s.etiqueta}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
