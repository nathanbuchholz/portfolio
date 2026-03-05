import { skills } from '../../src/data'

describe('skills data', () => {
  it('has at least one category', () => {
    expect(skills.length).toBeGreaterThan(0)
  })

  it('has a name and at least one skill per category', () => {
    for (const category of skills) {
      expect(category.name).toBeTruthy()
      expect(category.skills.length).toBeGreaterThan(0)
    }
  })

  it('has 8 categories', () => {
    expect(skills).toHaveLength(8)
  })
})
