import { renderHook } from '@testing-library/react'
import { useDocumentTitle } from '../../src/hooks/useDocumentTitle'

describe('useDocumentTitle', () => {
  it('sets title with page suffix', () => {
    renderHook(() => useDocumentTitle('Experience'))
    expect(document.title).toBe('Experience | Nathan Buchholz')
  })

  it('sets base title when no page provided', () => {
    renderHook(() => useDocumentTitle())
    expect(document.title).toBe('Nathan Buchholz')
  })

  it('updates on page change', () => {
    const { rerender } = renderHook(({ page }) => useDocumentTitle(page), {
      initialProps: { page: 'Skills' as string | undefined },
    })

    expect(document.title).toBe('Skills | Nathan Buchholz')

    rerender({ page: 'Projects' })
    expect(document.title).toBe('Projects | Nathan Buchholz')

    rerender({ page: undefined })
    expect(document.title).toBe('Nathan Buchholz')
  })
})
