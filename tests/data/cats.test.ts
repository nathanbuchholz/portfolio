import { catPhotos } from '../../src/data'

describe('catPhotos data', () => {
  it('has at least one entry', () => {
    expect(catPhotos.length).toBeGreaterThan(0)
  })

  it('has required fields for every entry', () => {
    for (const photo of catPhotos) {
      expect(photo.src).toBeTruthy()
      expect(photo.alt).toBeTruthy()
      expect(photo.name).toBeTruthy()
    }
  })
})
