import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { useAlarmDispatcher } from '../hooks/useAlarmDispatcher'

const secciones = [
  { ruta: '/notas',   etiqueta: 'Notas',    emoji: '📝' },
  { ruta: '/numeros', etiqueta: 'Números',  emoji: '🔢' },
  { ruta: '/alarmas', etiqueta: 'Alarmas',  emoji: '⏰' },
  { ruta: '/checkin', etiqueta: 'Check-in', emoji: '💭' },
]

function iniciales(email?: string) {
  if (!email) return '?'
  const parte = email.split('@')[0]
  return parte.slice(0, 2).toUpperCase()
}

export default function Layout() {
  const { session, cerrarSesion } = useAuth()
  const { tema, alternar } = useTheme()
  useAlarmDispatcher()

  const email = session?.user.email

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">

      {/* ── Sidebar escritorio ──────────────────────────────── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-sm">
            BT
          </div>
          <span className="font-semibold text-slate-900 dark:text-white tracking-tight">
            Bloc Temático
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {secciones.map((s) => (
            <NavLink
              key={s.ruta}
              to={s.ruta}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'flex h-7 w-7 items-center justify-center rounded-md text-base transition-all',
                      isActive
                        ? 'bg-indigo-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800',
                    ].join(' ')}
                    aria-hidden
                  >
                    {s.emoji}
                  </span>
                  {s.etiqueta}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Fondo — usuario */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button
            onClick={alternar}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <span className="text-base">{tema === 'oscuro' ? '☀️' : '🌙'}</span>
            {tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
          </button>

          {/* Avatar + email + salir */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              {iniciales(email)}
            </div>
            <span className="flex-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {email}
            </span>
            <button
              onClick={cerrarSesion}
              title="Cerrar sesión"
              className="text-slate-400 hover:text-red-500 transition text-sm"
            >
              ⏏
            </button>
          </div>
        </div>
      </aside>

      {/* ── Contenido principal ─────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Cabecera móvil */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">
              BT
            </div>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              Bloc Temático
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <button onClick={alternar} aria-label="Cambiar tema" className="hover:text-slate-700 dark:hover:text-slate-200 transition">
              {tema === 'oscuro' ? '☀️' : '🌙'}
            </button>
            <button onClick={cerrarSesion} aria-label="Cerrar sesión" className="hover:text-red-500 transition">
              ⏏
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-4 pb-20 md:pb-4">
          <Outlet />
        </main>

        {/* Nav inferior móvil */}
        <nav className="fixed inset-x-0 bottom-0 flex border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:hidden">
          {secciones.map((s) => (
            <NavLink
              key={s.ruta}
              to={s.ruta}
              className={({ isActive }) =>
                [
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-500',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'flex h-7 w-10 items-center justify-center rounded-full text-lg transition-all',
                      isActive ? 'bg-indigo-100 dark:bg-indigo-900/50' : '',
                    ].join(' ')}
                    aria-hidden
                  >
                    {s.emoji}
                  </span>
                  {s.etiqueta}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
