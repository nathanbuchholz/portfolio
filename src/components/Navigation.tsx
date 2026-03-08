import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { NavLink } from 'react-router'
import { FaBars, FaTimes } from 'react-icons/fa'
import { useTheme } from '../hooks/useTheme'
import Tooltip from './Tooltip'

const SoccerGame = lazy(() => import('./soccer-game'))


const links = [
  { to: '/', label: 'Home' },
  { to: '/experience', label: 'Experience' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/education', label: 'Education' },
  { to: '/cats', label: 'Cats' },
]

export default function Navigation() {
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [gameStart, setGameStart] = useState<{ x: number; y: number } | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const ballBtnRef = useRef<HTMLButtonElement>(null)

  function closeMenu() {
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return

    function handleMouseDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [menuOpen])

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Hamburger button - mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="cursor-pointer rounded-md p-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 active:scale-95 active:bg-gray-200 md:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Desktop links */}
        <ul className="hidden gap-1 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                viewTransition
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-gray-100 text-blue-600 active:bg-gray-200 dark:bg-gray-800 dark:text-blue-400 dark:active:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          {/* Soccer game toggle */}
          <Tooltip text="Juggle the soccer ball!">
            <button
              ref={ballBtnRef}
              onClick={() => {
                const rect = ballBtnRef.current?.getBoundingClientRect()
                if (rect) {
                  setGameStart({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
                }
              }}
              aria-label="Play soccer juggling game"
              className={iconBtnClass}
            >
              <img src="/soccer_ball.svg" alt="" className={`h-4 w-4${gameStart ? ' invisible' : ''}`} />
            </button>
          </Tooltip>

        {/* Theme toggle */}
          <Tooltip text="Toggle theme">
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className={iconBtnClass}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
          </Tooltip>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <ul className="border-t border-gray-200 md:hidden dark:border-gray-700">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                viewTransition
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-gray-50 text-blue-600 active:bg-gray-100 dark:bg-gray-800 dark:text-blue-400 dark:active:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
      {gameStart && (
        <Suspense fallback={null}>
          <SoccerGame
            startX={gameStart.x}
            startY={gameStart.y}
            onClose={() => setGameStart(null)}
          />
        </Suspense>
      )}
    </nav>
  )
}
