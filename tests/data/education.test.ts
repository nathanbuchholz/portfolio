import { education } from '../../src/data'

describe('education data', () => {
  it('has at least one entry', () => {
    expect(education.length).toBeGreaterThan(0)
  })

  it('has required fields for every entry', () => {
    for (const entry of education) {
      expect(entry.institution).toBeTruthy()
      expect(entry.degree).toBeTruthy()
      expect(entry.field).toBeTruthy()
      expect(entry.graduationDate).toBeTruthy()
      expect(entry.location).toBeTruthy()
    }
  })
})
