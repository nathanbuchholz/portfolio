import { useEffect, useState, useCallback, useRef } from 'react'
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa'
import type { CatPhoto } from '../types'

interface LightboxProps {
  photos: CatPhoto[]
  currentIndex: number
  open: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function Lightbox({
  photos,
  currentIndex,
  open,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<Element | null>(null)

  // Derive state from open prop during render (React-supported pattern)
  if (open && !mounted) {
    setMounted(true)
  }
  if (!open && visible) {
    setVisible(false)
  }

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => setVisible(true), 20)
      return () => clearTimeout(id)
    } else {
      const id = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(id)
    }
  }, [open])

  // Focus management: save previous focus, focus first button, restore on unmount
  useEffect(() => {
    if (!mounted) return
    previouslyFocusedRef.current = document.activeElement
    const firstButton = containerRef.current?.querySelector('button')
    if (firstButton) firstButton.focus()
    return () => {
      const prev = previouslyFocusedRef.current
      if (prev instanceof HTMLElement) prev.focus()
    }
  }, [mounted])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
      else if (e.key === 'Tab') {
        const container = containerRef.current
        if (!container) return
        const focusable = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    },
    [onClose, onPrev, onNext],
  )

  useEffect(() => {
    if (!mounted) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mounted, handleKeyDown])

  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [mounted])

  if (!mounted) return null

  const photo = photos[currentIndex]

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.name}: ${photo.alt}`}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Content */}
      <div
        className={`relative max-h-[90vh] max-w-[90vw] rounded-lg border border-gray-200 bg-white shadow-xl transition-all duration-300 ease-out dark:border-gray-700 dark:bg-gray-800 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-all duration-300 hover:bg-black/70 active:scale-95"
        >
          <FaTimes />
        </button>

        {/* Image */}
        <img
          src={photo.src}
          alt={photo.alt}
          className="max-h-[75vh] rounded-t-lg object-contain"
        />

        {/* Caption + nav */}
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <button
            onClick={onPrev}
            aria-label="Previous photo"
            className="cursor-pointer rounded-full p-2 text-gray-600 transition-all duration-300 hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          >
            <FaChevronLeft />
          </button>

          <p className="text-center text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">{photo.name}</span>
            <span className="mx-1">-</span>
            {photo.alt}
          </p>

          <button
            onClick={onNext}
            aria-label="Next photo"
            className="cursor-pointer rounded-full p-2 text-gray-600 transition-all duration-300 hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}
