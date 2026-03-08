import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

// Duration for the tooltip to fade into view
const FADE_IN_MS = 250
// Duration for the tooltip to fade out on mouse leave
const FADE_OUT_MS = 200
// Duration for the background fill to scale from center to full
const FILL_MS = 250
// Fade-out takes this many times longer after the fill completes (locked state)
const LOCKED_FADE_MULTIPLIER = 2
// Duration for the inset ring to appear once the fill locks in
const LOCKED_BORDER_FADE_MS = 100
// Hover delay before showing the tooltip (matches browser native ~500ms)
const HOVER_DELAY_MS = 500
// Space between the trigger element and the tooltip
const TOOLTIP_GAP = 4
// Minimum distance from the viewport edge before repositioning
const VIEWPORT_PAD = 8

type Phase = 'hidden' | 'fading-in' | 'filling' | 'locked' | 'fading-out'

export default function Tooltip({
  text,
  children,
}: {
  text: string
  children: ReactNode
}) {
  const [phase, setPhase] = useState<Phase>('hidden')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const lockedBeforeLeave = useRef(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const [position, setPosition] = useState<{
    x: number
    y: number
    above: boolean
  }>({ x: 0, y: 0, above: true })

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const clearLeave = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }

  useEffect(() => () => { clear(); clearLeave() }, [])

  const updatePosition = useCallback(() => {
    const wrapper = wrapperRef.current
    const tooltip = tooltipRef.current
    if (!wrapper || !tooltip) return

    const wRect = wrapper.getBoundingClientRect()
    const tRect = tooltip.getBoundingClientRect()

    // Vertical: prefer above, fall back to below
    const above = wRect.top >= tRect.height + TOOLTIP_GAP + VIEWPORT_PAD
    const y = above
      ? wRect.top - TOOLTIP_GAP - tRect.height
      : wRect.bottom + TOOLTIP_GAP

    // Horizontal: center, then clamp to viewport
    let x = wRect.left + wRect.width / 2 - tRect.width / 2
    x = Math.max(VIEWPORT_PAD, Math.min(x, window.innerWidth - tRect.width - VIEWPORT_PAD))

    setPosition({ x, y, above })
  }, [])

  useLayoutEffect(() => {
    if (phase !== 'hidden') updatePosition()
  }, [phase, updatePosition])

  useEffect(() => {
    if (phase === 'hidden') return
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [phase, updatePosition])

  const handleEnter = useCallback(() => {
    // If we have a pending leave (mouse crossing from trigger to portal), cancel it
    if (leaveTimerRef.current) {
      clearLeave()
      return
    }
    clear()
    lockedBeforeLeave.current = false
    timerRef.current = setTimeout(() => {
      setPhase('fading-in')
      timerRef.current = setTimeout(() => {
        setPhase('filling')
        timerRef.current = setTimeout(() => {
          setPhase('locked')
          lockedBeforeLeave.current = true
        }, FILL_MS)
      }, FADE_IN_MS)
    }, HOVER_DELAY_MS)
  }, [])

  const handleLeave = useCallback(() => {
    clearLeave()
    // Defer the actual leave to allow re-entry into the portal or trigger
    leaveTimerRef.current = setTimeout(() => {
      leaveTimerRef.current = null
      const wasLocked = lockedBeforeLeave.current
      clear()
      setPhase('fading-out')
      timerRef.current = setTimeout(
        () => setPhase('hidden'),
        wasLocked ? FADE_OUT_MS * LOCKED_FADE_MULTIPLIER : FADE_OUT_MS,
      )
    }, 30)
  }, [])

  const fadingIn = phase === 'fading-in'
  const filling = phase === 'filling'
  const locked = phase === 'locked'
  const fadingOut = phase === 'fading-out'
  const fadeOutDuration = lockedBeforeLeave.current ? FADE_OUT_MS * LOCKED_FADE_MULTIPLIER : FADE_OUT_MS

  return (
    <>
      <span
        ref={wrapperRef}
        className="inline-flex items-center"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
      >
        {children}
      </span>
      {phase !== 'hidden' &&
        createPortal(
          <div
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: position.above
                ? `${position.y}px`
                : `${position.y}px`,
              zIndex: 9999,
              pointerEvents: 'auto',
              // Add padding on the side facing the trigger to create a hover bridge
              paddingBottom: position.above ? `${TOOLTIP_GAP}px` : undefined,
              paddingTop: position.above ? undefined : `${TOOLTIP_GAP}px`,
            }}
          >
            <span
              ref={tooltipRef}
              role="tooltip"
              className="relative overflow-hidden whitespace-nowrap rounded-md border border-gray-200 px-3 py-1.5 text-sm shadow-sm select-none dark:border-gray-700"
              style={{
                display: 'block',
                opacity: fadingOut ? 0 : 1,
                transition: `opacity ${fadingOut ? fadeOutDuration : FADE_IN_MS}ms ease`,
                ...(fadingIn && {
                  animation: `tooltip-fade-in ${FADE_IN_MS}ms ease forwards`,
                }),
              }}
            >
              {/* Base background */}
              <span className="absolute inset-0 rounded-md bg-gray-50 dark:bg-gray-900" />
              {/* Animated fill layer */}
              <span
                className="absolute inset-0 rounded-md bg-gray-100 dark:bg-gray-800"
                style={{
                  transformOrigin: 'center',
                  transform:
                    filling || locked || fadingOut ? 'scale(1)' : 'scale(0)',
                  transition:
                    filling || locked || fadingOut
                      ? `transform ${FILL_MS}ms ease-out`
                      : 'none',
                }}
              />
              {/* Locked border */}
              <span
                className="absolute inset-0 rounded-md ring-2 ring-inset ring-gray-300/40 dark:ring-gray-600/40"
                style={{
                  opacity: locked || fadingOut ? 1 : 0,
                  transition: `opacity ${LOCKED_BORDER_FADE_MS}ms ease`,
                }}
              />
              {/* Text */}
              <span className="relative z-10 text-gray-700 dark:text-gray-200">
                {text}
              </span>
            </span>
          </div>,
          document.body,
        )}
    </>
  )
}
