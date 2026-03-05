import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../../src/hooks/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to light when no preference is set', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('toggles between light and dark', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    const newTheme = result.current.theme
    expect(['light', 'dark']).toContain(newTheme)

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).not.toBe(newTheme)
  })

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(localStorage.getItem('theme')).toBe(result.current.theme)
  })

  it('reads stored theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('uses document.startViewTransition when available', () => {
    const mockStartViewTransition = vi.fn((cb: () => void) => cb())
    document.startViewTransition =
      mockStartViewTransition as unknown as typeof document.startViewTransition

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(mockStartViewTransition).toHaveBeenCalledOnce()

    // Clean up
    delete (document as unknown as Record<string, unknown>).startViewTransition
  })
})
