import { projects } from '../../src/data'

describe('projects data', () => {
  it('has at least one entry', () => {
    expect(projects.length).toBeGreaterThan(0)
  })

  it('has required fields for every entry', () => {
    for (const project of projects) {
      expect(project.title).toBeTruthy()
      expect(project.description).toBeTruthy()
      expect(project.tech.length).toBeGreaterThan(0)
    }
  })
})
