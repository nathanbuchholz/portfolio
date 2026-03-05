import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ExperiencePage from '../../src/pages/ExperiencePage'
import { experience } from '../../src/data'

describe('ExperiencePage', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <ExperiencePage />
      </MemoryRouter>,
    )
  })

  it('renders heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: 'Experience' }),
    ).toBeInTheDocument()
  })

  it('renders resume link', () => {
    const link = screen.getByRole('link', { name: /resume/i })
    expect(link).toHaveAttribute('href', '#resume')
  })

  it('renders all job titles', () => {
    for (const job of experience) {
      expect(screen.getByText(job.title)).toBeInTheDocument()
    }
  })

  it('renders company names and locations', () => {
    for (const job of experience) {
      const matches = screen.getAllByText(
        new RegExp(`${job.company}.*${job.location}`),
      )
      expect(matches.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('renders date ranges', () => {
    for (const job of experience) {
      expect(
        screen.getByText(new RegExp(`${job.startDate}.*${job.endDate}`)),
      ).toBeInTheDocument()
    }
  })

  it('renders summary when present', () => {
    for (const job of experience) {
      if (job.summary) {
        expect(screen.getByText(job.summary)).toBeInTheDocument()
      }
    }
  })

  it('renders projects link for independent entry', () => {
    const link = screen.getByRole('link', {
      name: /view my personal projects/i,
    })
    expect(link).toHaveAttribute('href', '/projects')
  })

  it('renders project subsections', () => {
    for (const job of experience) {
      if (job.projects) {
        for (const project of job.projects) {
          expect(
            screen.getAllByText(project.title).length,
          ).toBeGreaterThanOrEqual(1)
          expect(screen.getByText(project.description)).toBeInTheDocument()
        }
      }
    }
  })
})
