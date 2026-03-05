import { useState, useLayoutEffect } from 'react'
import { flushSync } from 'react-dom'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    const update = () =>
      flushSync(() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')))
    if (document.startViewTransition) {
      document.startViewTransition(update)
    } else {
      update()
    }
  }

  return { theme, toggleTheme }
}
