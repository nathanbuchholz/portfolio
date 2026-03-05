import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Navigation from '../../src/components/Navigation'

describe('Navigation', () => {
  it('renders all nav links', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Experience' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skills' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Education' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cats' })).toBeInTheDocument()
  })

  it('renders the theme toggle button', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('button', { name: /switch to .* mode/i }),
    ).toBeInTheDocument()
  })

  it('renders the hamburger menu button', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('button', { name: 'Open menu' }),
    ).toBeInTheDocument()
  })

  it('closes mobile menu when a nav link is clicked', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    )

    // Open the menu
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(
      screen.getByRole('button', { name: 'Close menu' }),
    ).toBeInTheDocument()

    // Click a mobile nav link - menu should close
    const mobileLinks = screen
      .getAllByRole('link', { name: 'Experience' })
    fireEvent.click(mobileLinks[mobileLinks.length - 1])
    expect(
      screen.getByRole('button', { name: 'Open menu' }),
    ).toBeInTheDocument()
  })

  it('closes mobile menu when clicking outside', () => {
    render(
      <MemoryRouter>
        <div>
          <Navigation />
          <div data-testid="outside">outside content</div>
        </div>
      </MemoryRouter>,
    )

    // Open the menu
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(
      screen.getByRole('button', { name: 'Close menu' }),
    ).toBeInTheDocument()

    // Click outside the nav
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(
      screen.getByRole('button', { name: 'Open menu' }),
    ).toBeInTheDocument()
  })
})
