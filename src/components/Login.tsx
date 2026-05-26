import { useState, type FormEvent } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [modo, setModo] = useState<'login' | 'registro'>('login')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setEnviando(true)

    try {
      if (modo === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo(
          'Cuenta creada. Si tu proyecto exige confirmación por email, revisa tu correo antes de entrar.',
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800">
        <h1 className="mb-1 text-2xl font-semibold text-slate-900 dark:text-white">
          Bloc Temático
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {modo === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
        </p>

        {!supabaseConfigurado && (
          <div className="mb-4 rounded-lg bg-amber-100 p-3 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            ⚠️ Falta configurar Supabase. Copia <code>.env.example</code> a{' '}
            <code>.env</code> y añade tu URL y anon key.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {info && (
            <p className="text-sm text-green-600 dark:text-green-400">{info}</p>
          )}

          <button
            type="submit"
            disabled={enviando || !supabaseConfigurado}
            className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando
              ? 'Procesando…'
              : modo === 'login'
                ? 'Entrar'
                : 'Registrarme'}
          </button>
        </form>

        <button
          onClick={() => {
            setModo(modo === 'login' ? 'registro' : 'login')
            setError(null)
            setInfo(null)
          }}
          className="mt-4 w-full text-center text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {modo === 'login'
            ? '¿No tienes cuenta? Regístrate'
            : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  )
}
