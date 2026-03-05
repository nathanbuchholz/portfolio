import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ProjectsPage from '../../src/pages/ProjectsPage'
import { projects } from '../../src/data'

describe('ProjectsPage', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>,
    )
  })

  it('renders heading', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeInTheDocument()
  })

  it('renders all project titles', () => {
    for (const project of projects) {
      expect(screen.getByText(project.title)).toBeInTheDocument()
    }
  })

  it('renders tech tags', () => {
    for (const project of projects) {
      for (const tech of project.tech) {
        expect(screen.getAllByText(tech).length).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('renders live site links when available', () => {
    const withLive = projects.filter((p) => p.liveUrl)
    for (const project of withLive) {
      const linkName = project.liveUrlName ?? 'Live Site'
      const links = screen.getAllByRole('link', { name: linkName })
      expect(
        links.some((link) => link.getAttribute('href') === project.liveUrl),
      ).toBe(true)
    }
  })

  it('renders repository links when available', () => {
    const withRepo = projects.filter((p) => p.repoUrl)
    for (const project of withRepo) {
      const links = screen.getAllByRole('link', { name: 'Repository' })
      expect(
        links.some((link) => link.getAttribute('href') === project.repoUrl),
      ).toBe(true)
    }
  })
})
