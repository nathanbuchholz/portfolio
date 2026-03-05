import { render, screen, act, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import CatsPage from '../../src/pages/CatsPage'

describe('CatsPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  it('renders heading', () => {
    render(
      <MemoryRouter>
        <CatsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Cats' })).toBeInTheDocument()
  })

  it('renders images', () => {
    render(
      <MemoryRouter>
        <CatsPage />
      </MemoryRouter>,
    )

    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('opens lightbox when a photo is clicked', () => {
    render(
      <MemoryRouter>
        <CatsPage />
      </MemoryRouter>,
    )

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('navigates to next photo in lightbox', () => {
    render(
      <MemoryRouter>
        <CatsPage />
      </MemoryRouter>,
    )

    // Open lightbox on first photo
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    act(() => {
      vi.advanceTimersByTime(50)
    })

    // Click next
    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }))

    // Second photo should now be displayed in lightbox
    const dialog = screen.getByRole('dialog')
    expect(dialog.querySelector('img')).toHaveAttribute('alt', 'Helping me code')
  })

  it('navigates to previous photo in lightbox', () => {
    render(
      <MemoryRouter>
        <CatsPage />
      </MemoryRouter>,
    )

    // Open lightbox on first photo
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    act(() => {
      vi.advanceTimersByTime(50)
    })

    // Click prev (wraps to last photo)
    fireEvent.click(screen.getByRole('button', { name: 'Previous photo' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog.querySelector('img')).toHaveAttribute('alt', 'All grown up')
  })
})
