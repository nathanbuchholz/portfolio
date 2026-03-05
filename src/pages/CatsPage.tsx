import { useState, useCallback } from 'react'
import { catPhotos } from '../data'
import Lightbox from '../components/Lightbox'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function CatsPage() {
  useDocumentTitle('Cats')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  const closeLightbox = () => setLightboxOpen(false)

  const goPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + catPhotos.length) % catPhotos.length,
    )
  }, [])

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % catPhotos.length))
  }, [])

  return (
    <main>
      <h1 className="text-3xl font-bold">Cats</h1>
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
        If you made it this far, you deserve some pictures of my three adorable
        cats.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catPhotos.map((photo, index) => (
          <button
            key={`${photo.name}-${index}`}
            onClick={() => openLightbox(index)}
            className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition-all duration-200 hover:scale-[1.015] hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
            <p className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {photo.name}
            </p>
          </button>
        ))}
      </div>

      <Lightbox
        photos={catPhotos}
        currentIndex={lightboxIndex ?? 0}
        open={lightboxOpen}
        onClose={closeLightbox}
        onPrev={goPrev}
        onNext={goNext}
      />
    </main>
  )
}
