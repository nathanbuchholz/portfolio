import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Lightbox from '../../src/components/Lightbox'
import type { CatPhoto } from '../../src/types'

const mockPhotos: CatPhoto[] = [
  { src: '/cats/cat1.jpg', alt: 'A fluffy cat', name: 'Fluffy' },
  { src: '/cats/cat2.jpg', alt: 'A sleepy cat', name: 'Sleepy' },
  { src: '/cats/cat3.jpg', alt: 'A playful cat', name: 'Playful' },
]

function renderLightbox(overrides = {}) {
  const defaultProps = {
    photos: mockPhotos,
    currentIndex: 0,
    open: true,
    onClose: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
    ...overrides,
  }
  render(
    <MemoryRouter>
      <Lightbox {...defaultProps} />
    </MemoryRouter>,
  )
  return defaultProps
}

describe('Lightbox', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ''
  })

  it('renders dialog when open', () => {
    renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderLightbox({ open: false })
    act(() => {
      vi.advanceTimersByTime(350)
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('displays the current photo', () => {
    renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })
    const img = screen.getByAltText('A fluffy cat')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/cats/cat1.jpg')
  })

  it('displays caption with name and alt', () => {
    renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(screen.getByText('Fluffy')).toBeInTheDocument()
    expect(screen.getByText('A fluffy cat')).toBeInTheDocument()
  })

  it('renders close, previous, and next buttons', () => {
    renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Previous photo' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Next photo' }),
    ).toBeInTheDocument()
  })

  it('has aria-modal attribute', () => {
    renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('calls onClose on Escape key', () => {
    const props = renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(props.onClose).toHaveBeenCalled()
  })

  it('calls onPrev on ArrowLeft key', () => {
    const props = renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })
    expect(props.onPrev).toHaveBeenCalled()
  })

  it('calls onNext on ArrowRight key', () => {
    const props = renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight' }),
      )
    })
    expect(props.onNext).toHaveBeenCalled()
  })

  it('sets body overflow to hidden when mounted', () => {
    renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('triggers close transition when open changes to false', () => {
    const props = {
      photos: mockPhotos,
      currentIndex: 0,
      open: true,
      onClose: vi.fn(),
      onPrev: vi.fn(),
      onNext: vi.fn(),
    }
    const { rerender } = render(
      <MemoryRouter>
        <Lightbox {...props} />
      </MemoryRouter>,
    )
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Re-render with open: false triggers close transition (line 31-32)
    rerender(
      <MemoryRouter>
        <Lightbox {...props} open={false} />
      </MemoryRouter>,
    )
    // Dialog still mounted during 300ms transition
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // After transition, unmounts
    act(() => {
      vi.advanceTimersByTime(350)
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('wraps focus from last to first element on Tab', () => {
    renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })

    const dialog = screen.getByRole('dialog')
    const buttons = dialog.querySelectorAll('button')
    const lastButton = buttons[buttons.length - 1]

    // Focus the last button
    act(() => {
      lastButton.focus()
    })
    expect(document.activeElement).toBe(lastButton)

    // Press Tab - should wrap to first
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
      )
    })
    expect(document.activeElement).toBe(buttons[0])
  })

  it('wraps focus from first to last element on Shift+Tab', () => {
    renderLightbox()
    act(() => {
      vi.advanceTimersByTime(50)
    })

    const dialog = screen.getByRole('dialog')
    const buttons = dialog.querySelectorAll('button')
    const firstButton = buttons[0]
    const lastButton = buttons[buttons.length - 1]

    // Focus the first button
    act(() => {
      firstButton.focus()
    })
    expect(document.activeElement).toBe(firstButton)

    // Press Shift+Tab - should wrap to last
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
        }),
      )
    })
    expect(document.activeElement).toBe(lastButton)
  })
})
