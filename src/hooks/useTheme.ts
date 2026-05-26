import { useEffect, useState } from 'react'

type Tema = 'claro' | 'oscuro'

function temaInicial(): Tema {
  const guardado = localStorage.getItem('tema') as Tema | null
  if (guardado) return guardado
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'oscuro'
    : 'claro'
}

export function useTheme() {
  const [tema, setTema] = useState<Tema>(temaInicial)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', tema === 'oscuro')
    localStorage.setItem('tema', tema)
  }, [tema])

  const alternar = () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro'))

  return { tema, alternar }
}
