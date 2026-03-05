import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import EducationPage from '../../src/pages/EducationPage'
import { education } from '../../src/data'

describe('EducationPage', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <EducationPage />
      </MemoryRouter>,
    )
  })

  it('renders heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: 'Education' }),
    ).toBeInTheDocument()
  })

  it('renders all institutions', () => {
    for (const entry of education) {
      expect(screen.getByText(entry.institution)).toBeInTheDocument()
    }
  })

  it('renders degree and field', () => {
    for (const entry of education) {
      expect(screen.getByText(new RegExp(entry.degree))).toBeInTheDocument()
      expect(screen.getByText(new RegExp(entry.field))).toBeInTheDocument()
    }
  })

  it('renders location and graduation date', () => {
    for (const entry of education) {
      expect(
        screen.getByText(
          new RegExp(`${entry.location}.*${entry.graduationDate}`),
        ),
      ).toBeInTheDocument()
    }
  })
})
