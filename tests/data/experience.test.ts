import { experience } from '../../src/data'

describe('experience data', () => {
  it('has at least one entry', () => {
    expect(experience.length).toBeGreaterThan(0)
  })

  it('has required fields for every entry', () => {
    for (const job of experience) {
      expect(job.title).toBeTruthy()
      expect(job.company).toBeTruthy()
      expect(job.location).toBeTruthy()
      expect(job.startDate).toBeTruthy()
      expect(job.endDate).toBeTruthy()
    }
  })

  it('every entry has summary or projects', () => {
    for (const job of experience) {
      const hasSummary = !!job.summary
      const hasProjects = !!job.projects && job.projects.length > 0
      expect(hasSummary || hasProjects).toBe(true)
    }
  })

  it('is ordered with most recent first', () => {
    expect(experience[0].endDate).toBe('Present')
  })
})
