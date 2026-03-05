import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import NotFoundPage from '../../src/pages/NotFoundPage'

describe('NotFoundPage', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )
  })

  it('renders 404 heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: '404' }),
    ).toBeInTheDocument()
  })

  it('renders message text', () => {
    expect(screen.getByText("This page doesn't exist.")).toBeInTheDocument()
  })

  it('renders back-to-home link', () => {
    const link = screen.getByRole('link', { name: 'Back to home' })
    expect(link).toHaveAttribute('href', '/')
  })
})
