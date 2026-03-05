import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import SkillsPage from '../../src/pages/SkillsPage'
import { skills } from '../../src/data'

describe('SkillsPage', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <SkillsPage />
      </MemoryRouter>,
    )
  })

  it('renders heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: 'Skills' }),
    ).toBeInTheDocument()
  })

  it('renders all 8 category names', () => {
    expect(skills).toHaveLength(8)
    for (const category of skills) {
      expect(screen.getByText(category.name)).toBeInTheDocument()
    }
  })

  it('renders individual skills', () => {
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
  })
})
