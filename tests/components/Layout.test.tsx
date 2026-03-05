import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Layout from '../../src/components/Layout'

describe('Layout', () => {
  it('renders navigation', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders skip to content link with correct href', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    )

    const skipLink = screen.getByText('Skip to content')
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('has main-content id on content area', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    )

    expect(document.getElementById('main-content')).toBeInTheDocument()
  })
})
