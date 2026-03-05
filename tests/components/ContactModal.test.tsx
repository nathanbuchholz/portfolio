import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import ContactModal from '../../src/components/ContactModal'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderModal(open = true) {
  const onClose = vi.fn()
  render(
    <MemoryRouter>
      <ContactModal open={open} onClose={onClose} />
    </MemoryRouter>,
  )
  return { onClose }
}

describe('ContactModal', () => {
  it('renders dialog when open', () => {
    renderModal(true)
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderModal(false)
    expect(screen.queryByText('Contact')).not.toBeInTheDocument()
  })

  it('renders form fields', () => {
    renderModal()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
  })

  it('renders honeypot field (hidden)', () => {
    renderModal()
    const honeypot = document.querySelector('input[name="bot-field"]')
    expect(honeypot).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderModal()
    expect(
      screen.getByRole('button', { name: 'Send Message' }),
    ).toBeInTheDocument()
  })

  it('submits form successfully with mock fetch', async () => {
    const user = userEvent.setup()
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })

    renderModal()

    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Message'), 'Hello there')
    await user.click(screen.getByRole('button', { name: 'Send Message' }))

    expect(globalThis.fetch).toHaveBeenCalledOnce()
    expect(await screen.findByText(/message sent/i)).toBeInTheDocument()
  })

  it('shows error on network failure', async () => {
    const user = userEvent.setup()
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    renderModal()

    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Message'), 'Hello there')
    await user.click(screen.getByRole('button', { name: 'Send Message' }))

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('shows error on non-ok response', async () => {
    const user = userEvent.setup()
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

    renderModal()

    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Message'), 'Hello there')
    await user.click(screen.getByRole('button', { name: 'Send Message' }))

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking the dialog backdrop', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()

    const dialog = screen.getByRole('dialog')
    // Simulate clicking the dialog element itself (backdrop), not inner content
    await user.click(dialog)

    expect(onClose).toHaveBeenCalled()
  })
})
