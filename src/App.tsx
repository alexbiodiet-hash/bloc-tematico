import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Layout from './components/Layout'
import Notas from './pages/Notas'
import Numeros from './pages/Numeros'
import Alarmas from './pages/Alarmas'

function Rutas() {
  const { session, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        Cargando…
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/notas" replace />} />
        <Route path="/notas" element={<Notas />} />
        <Route
          path="/numeros"
          element={<Numeros />}
        />
        <Route
          path="/alarmas"
          element={<Alarmas />}
        />
        <Route path="*" element={<Navigate to="/notas" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Rutas />
      </HashRouter>
    </AuthProvider>
  )
}
