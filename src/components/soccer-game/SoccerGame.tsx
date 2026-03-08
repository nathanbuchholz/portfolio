import { useEffect, useRef, useState, useCallback } from 'react'
import type {
  GameConfig,
  GameHandle,
  GameScore,
  HighScore,
  PresetName,
  SoccerGameProps,
  TutorialPhase,
  TutorialSteps,
} from './types'
import {
  DEFAULT_CONFIG,
  PRESETS,
  LS_PRESET_KEY,
  LS_CONFIG_KEY,
  LS_CUSTOM_CONFIGS_KEY,
  INITIAL_TUTORIAL_STEPS,
  CLICKABLE_PHASES,
  TUTORIAL_VISIBLE_PHASES,
  buildConfig,
  loadHighScore,
  formatTime,
} from './constants'
import { SettingsPanel } from './SettingsPanel'
import { createGameEngine } from './engine'

function PopCounter({
  value,
  className,
  prefix,
}: {
  value: number
  className?: string
  prefix?: string
}) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const prevRef = useRef(value)

  useEffect(() => {
    if (value !== prevRef.current) {
      prevRef.current = value
      const el = spanRef.current
      if (!el) return
      const currentColor = getComputedStyle(el).color
      const anim = el.animate(
        [
          { transform: 'scale(1)', color: '#22c55e' },
          { transform: 'scale(1.5)' },
          { transform: 'scale(1)', color: currentColor },
        ],
        { duration: 400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      )
      return () => anim.cancel()
    }
  }, [value])

  return (
    <span
      ref={spanRef}
      className={className ?? ''}
      style={{ display: 'inline-block' }}
    >
      {prefix}
      {value}
    </span>
  )
}

function TutorialCheckItem({
  checked,
  text,
  visible,
}: {
  checked: boolean
  text: string
  visible: boolean
}) {
  return (
    <div
      className="grid transition-[grid-template-rows,opacity] duration-500 ease-out"
      style={{
        gridTemplateRows: visible ? '1fr' : '0fr',
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="overflow-hidden">
        <div className="flex items-center gap-2 py-0.5">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="pointer-events-none h-3.5 w-3.5 shrink-0 accent-green-500"
          />
          <span
            className={`text-sm font-medium transition-all duration-300 ${
              checked
                ? 'text-gray-400 line-through dark:text-gray-500'
                : 'text-gray-800 dark:text-gray-200'
            }`}
          >
            {text}
          </span>
        </div>
      </div>
    </div>
  )
}

function ExitButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close game"
      className="cursor-pointer rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-95 sm:px-3 sm:py-1.5 sm:text-sm dark:bg-gray-800/90 dark:text-red-300 dark:hover:bg-gray-800"
    >
      <span className="sm:hidden">✕</span>
      <span className="hidden sm:inline">Exit</span>
    </button>
  )
}

export default function SoccerGame({
  onClose,
  startX,
  startY,
}: SoccerGameProps) {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const ballCanvasRef = useRef<HTMLCanvasElement>(null)
  const scoreboardRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState<GameScore>(() => ({
    volleys: 0,
    drops: 0,
    points: 0,
    startTime: performance.now(),
  }))
  const [multiplier, setMultiplier] = useState(1)
  const [elapsed, setElapsed] = useState(0)
  const [highScore, setHighScore] = useState<HighScore>(loadHighScore)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsClosing, setSettingsClosing] = useState(false)
  const settingsOpenRef = useRef(false)
  const [customConfigs, setCustomConfigs] = useState<
    Record<string, Partial<GameConfig>>
  >(() => {
    try {
      const saved = localStorage.getItem(LS_CUSTOM_CONFIGS_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      /* ignore */
    }
    return {}
  })
  const [preset, setPreset] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LS_PRESET_KEY)
      if (saved) return saved
    } catch {
      /* ignore */
    }
    return 'normal'
  })
  const [config, setConfig] = useState<GameConfig>(() => {
    try {
      const savedPreset = localStorage.getItem(LS_PRESET_KEY)
      let presetOverrides: Partial<GameConfig> = {}
      if (savedPreset && savedPreset in PRESETS) {
        presetOverrides = PRESETS[savedPreset as PresetName].overrides
      } else if (savedPreset) {
        const customs = JSON.parse(
          localStorage.getItem(LS_CUSTOM_CONFIGS_KEY) || '{}',
        )
        if (savedPreset in customs) presetOverrides = customs[savedPreset]
      }
      const saved = localStorage.getItem(LS_CONFIG_KEY)
      if (saved) return buildConfig(presetOverrides, JSON.parse(saved))
      return buildConfig(presetOverrides)
    } catch {
      /* ignore */
    }
    return buildConfig()
  })
  const configRef = useRef<GameConfig>(DEFAULT_CONFIG)
  const gameRef = useRef<GameHandle | null>(null)
  const highScoreRef = useRef<HighScore>(loadHighScore())
  const [tutorialPhase, setTutorialPhase] = useState<TutorialPhase>('growth')
  const tutorialPhaseRef = useRef<TutorialPhase>('growth')
  const [tutorialSteps, setTutorialSteps] = useState<TutorialSteps>({
    ...INITIAL_TUTORIAL_STEPS,
  })
  const tutorialStepsRef = useRef<TutorialSteps>({ ...INITIAL_TUTORIAL_STEPS })
  const [countdownNumber, setCountdownNumber] = useState(3)
  const countdownTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    configRef.current = config
  }, [config])
  useEffect(() => {
    highScoreRef.current = highScore
  }, [highScore])
  useEffect(() => {
    tutorialStepsRef.current = tutorialSteps
  }, [tutorialSteps])

  function clearCountdownTimers() {
    countdownTimers.current.forEach(clearTimeout)
    countdownTimers.current = []
  }

  const startCountdown = useCallback(() => {
    clearCountdownTimers()
    setTutorialPhase('countdown')
    tutorialPhaseRef.current = 'countdown'
    setCountdownNumber(3)
    countdownTimers.current.push(
      setTimeout(() => setCountdownNumber(2), 700),
      setTimeout(() => setCountdownNumber(1), 1400),
      setTimeout(() => {
        setTutorialPhase('playing')
        tutorialPhaseRef.current = 'playing'
      }, 2100),
    )
  }, [])

  useEffect(() => {
    if (tutorialPhase === 'complete') {
      const timer = setTimeout(() => startCountdown(), 2000)
      return () => clearTimeout(timer)
    }
  }, [tutorialPhase, startCountdown])

  useEffect(() => clearCountdownTimers, [])

  useEffect(() => {
    let cancelled = false

    createGameEngine(
      {
        bgCanvas: bgCanvasRef.current!,
        ballCanvas: ballCanvasRef.current!,
        startX,
        startY,
        configRef,
        highScoreRef,
        tutorialPhaseRef,
        tutorialStepsRef,
        settingsOpenRef,
        pausedRef,
        setLoading,
        setScore,
        setMultiplier,
        setElapsed,
        setHighScore,
        setTutorialPhase,
        setTutorialSteps,
      },
      () => cancelled,
    ).then((handle) => {
      if (handle && !cancelled) gameRef.current = handle
    })

    return () => {
      cancelled = true
      gameRef.current?.cleanup()
    }
  }, [startX, startY])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (pausedRef.current) return
    if (!CLICKABLE_PHASES.has(tutorialPhaseRef.current)) return
    gameRef.current?.handleClick(e.clientX, e.clientY)
  }, [])

  function updateConfig(
    key: keyof GameConfig,
    value: number | string | boolean,
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  function getPresetOverrides(name: string): Partial<GameConfig> {
    if (name in PRESETS) return PRESETS[name as PresetName].overrides
    return customConfigs[name] ?? {}
  }

  function applyPreset(name: string) {
    setConfig(buildConfig(getPresetOverrides(name)))
    setPreset(name)
    localStorage.setItem(LS_PRESET_KEY, name)
    localStorage.removeItem(LS_CONFIG_KEY)
  }

  function saveAsConfig(name: string) {
    // Compute overrides: only store values that differ from DEFAULT_CONFIG
    const overrides: Partial<GameConfig> = {}
    for (const key of Object.keys(DEFAULT_CONFIG) as (keyof GameConfig)[]) {
      if (config[key] !== DEFAULT_CONFIG[key]) {
        ;(overrides as Record<string, unknown>)[key] = config[key]
      }
    }
    const updated = { ...customConfigs, [name]: overrides }
    setCustomConfigs(updated)
    localStorage.setItem(LS_CUSTOM_CONFIGS_KEY, JSON.stringify(updated))
    setPreset(name)
    localStorage.setItem(LS_PRESET_KEY, name)
    localStorage.removeItem(LS_CONFIG_KEY)
  }

  function deleteCustomConfig(name: string) {
    const updated = { ...customConfigs }
    delete updated[name]
    setCustomConfigs(updated)
    localStorage.setItem(LS_CUSTOM_CONFIGS_KEY, JSON.stringify(updated))
    applyPreset('normal')
  }

  return (
    <div className="fixed inset-0 z-[60]" onPointerDown={handlePointerDown}>
      <style>{`
        @keyframes soccer-fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes soccer-settings-slide {
          from { transform: translateX(100%); opacity: 0 }
          to { transform: translateX(0); opacity: 1 }
        }
        .soccer-settings-slide-in {
          animation: soccer-settings-slide 300ms ease-out;
        }
        @keyframes soccer-settings-slide-out {
          from { transform: translateX(0); opacity: 1 }
          to { transform: translateX(100%); opacity: 0 }
        }
        .soccer-settings-slide-out {
          animation: soccer-settings-slide-out 300ms ease-in forwards;
        }
      `}</style>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: config.overlayColor,
          animation: 'soccer-fadeIn 400ms ease-out',
        }}
      />

      <canvas ref={bgCanvasRef} className="absolute inset-0 z-10" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-medium text-gray-200">Loading...</span>
        </div>
      )}

      {!loading && tutorialPhase === 'playing' && (
        <>
          {/* Scoreboard */}
          <div
            ref={scoreboardRef}
            className="pointer-events-none absolute top-4 left-1/2 z-20 max-w-[calc(100vw-5rem)] -translate-x-1/2 rounded-xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm select-none sm:max-w-none sm:px-6 dark:bg-gray-800/90"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono sm:gap-x-6">
              <div className="text-center">
                <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Mult
                </div>
                <PopCounter
                  value={multiplier}
                  className="text-lg font-bold text-blue-500 sm:text-2xl"
                  prefix="x"
                />
              </div>
              <div className="hidden h-8 w-px bg-gray-300 sm:block dark:bg-gray-600" />
              <div className="text-center">
                <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Points
                </div>
                <PopCounter
                  value={score.points}
                  className="text-lg font-bold text-amber-500 sm:text-2xl"
                />
              </div>
              <div className="hidden h-8 w-px bg-gray-300 sm:block dark:bg-gray-600" />
              <div className="text-center">
                <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Points per minute
                </div>
                <div className="text-lg font-bold text-emerald-500 sm:text-2xl">
                  {elapsed > 0
                    ? ((score.points / elapsed) * 60).toFixed(1)
                    : '0.0'}
                </div>
              </div>
              <div className="hidden h-8 w-px bg-gray-300 sm:block dark:bg-gray-600" />
              <div className="text-center">
                <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Time
                </div>
                <div className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-gray-100">
                  {formatTime(elapsed)}
                </div>
              </div>
              <div className="hidden h-8 w-px bg-gray-300 sm:block dark:bg-gray-600" />
              <div className="text-center">
                <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Volleys
                </div>
                <div className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-gray-100">
                  {score.volleys}
                </div>
              </div>
              <div className="hidden h-8 w-px bg-gray-300 sm:block dark:bg-gray-600" />
              <div className="text-center">
                <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Drops
                </div>
                <div className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-gray-100">
                  {score.drops}
                </div>
              </div>
            </div>

            {(highScore.bestPoints > 0 ||
              highScore.bestTime > 0 ||
              highScore.bestPPM > 0) && (
              <div className="mt-2 border-t border-gray-200 pt-2 text-center text-[11px] text-gray-500 dark:border-gray-600 dark:text-gray-400">
                {highScore.bestPoints > 0 && (
                  <>Best points: {highScore.bestPoints}</>
                )}
                {highScore.bestPoints > 0 &&
                  (highScore.bestPPM > 0 || highScore.bestTime > 0) &&
                  ' · '}
                {highScore.bestPPM > 0 && (
                  <>
                    <span className="sm:hidden">PPM</span>
                    <span className="hidden sm:inline">
                      Points per minute
                    </span>: {highScore.bestPPM.toFixed(1)}
                  </>
                )}
                {highScore.bestPPM > 0 && highScore.bestTime > 0 && ' · '}
                {highScore.bestTime > 0 && (
                  <>Time: {formatTime(highScore.bestTime)}</>
                )}
              </div>
            )}
          </div>

          {/* Pause button - top-left */}
          <div className="absolute top-4 left-2 z-20 sm:left-4">
            <button
              onClick={() => {
                pausedRef.current = !pausedRef.current
                setPaused(pausedRef.current)
              }}
              aria-label={paused ? 'Resume game' : 'Pause game'}
              className="cursor-pointer rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-95 sm:px-3 sm:py-1.5 sm:text-sm dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <span className="sm:hidden">{paused ? '▶' : '⏸'}</span>
              <span className="hidden sm:inline">
                {paused ? 'Resume' : 'Pause'}
              </span>
            </button>
          </div>

          {/* Buttons */}
          <div className="absolute top-4 right-2 z-20 flex gap-1 sm:right-4 sm:gap-2">
            <button
              onClick={() => {
                pausedRef.current = false
                setPaused(false)
                const dropY =
                  scoreboardRef.current?.getBoundingClientRect().bottom ??
                  undefined
                gameRef.current?.newGame(dropY)
                startCountdown()
              }}
              aria-label="New game"
              className="cursor-pointer rounded-lg bg-blue-500/90 px-2 py-1 text-xs font-bold tracking-wider text-white uppercase shadow-md backdrop-blur-sm transition-all hover:bg-blue-500 active:scale-95 sm:px-3 sm:py-1.5 sm:text-sm"
            >
              <span className="sm:hidden">↻</span>
              <span className="hidden sm:inline">New Game</span>
            </button>
            <button
              onClick={() => {
                if (settingsOpen) {
                  settingsOpenRef.current = false
                  setSettingsClosing(true)
                  setTimeout(() => {
                    setSettingsClosing(false)
                    setSettingsOpen(false)
                  }, 300)
                } else {
                  settingsOpenRef.current = true
                  setSettingsOpen(true)
                }
              }}
              aria-label="Toggle game settings"
              className={`cursor-pointer rounded-lg px-2 py-1 text-xs font-medium shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-95 sm:w-[7.5rem] sm:px-3 sm:py-1.5 sm:text-sm dark:hover:bg-gray-800 ${settingsOpen ? 'bg-blue-500/90 text-white dark:bg-blue-500/90 dark:text-white' : 'bg-white/90 text-gray-700 dark:bg-gray-800/90 dark:text-gray-300'}`}
            >
              <span className="sm:hidden">⚙</span>
              <span className="hidden sm:inline">
                {settingsOpen ? 'Hide' : 'Game Settings'}
              </span>
            </button>
            <button
              onClick={() => {
                gameRef.current?.resetForTutorial()
                gameRef.current?.newGame()
                setTutorialSteps({ ...INITIAL_TUTORIAL_STEPS })
                tutorialStepsRef.current = { ...INITIAL_TUTORIAL_STEPS }
                setTutorialPhase('step1')
                tutorialPhaseRef.current = 'step1'
              }}
              aria-label="Show tutorial"
              className="cursor-pointer rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-gray-700 shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-95 sm:px-3 sm:py-1.5 sm:text-sm dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <span title="Tutorial">?</span>
            </button>
            <ExitButton onClick={onClose} />
          </div>

          {(settingsOpen || settingsClosing) && (
            <SettingsPanel
              config={config}
              baselineConfig={buildConfig(getPresetOverrides(preset))}
              onChange={updateConfig}
              preset={preset}
              onPresetChange={applyPreset}
              onSaveAs={saveAsConfig}
              onDeleteCustom={deleteCustomConfig}
              customConfigs={customConfigs}
              closing={settingsClosing}
            />
          )}
        </>
      )}

      {/* Exit button visible during tutorial phases */}
      {!loading && tutorialPhase !== 'playing' && (
        <div className="absolute top-4 right-2 z-50 sm:right-4">
          <ExitButton onClick={onClose} />
        </div>
      )}

      {/* Tutorial checklist */}
      {TUTORIAL_VISIBLE_PHASES.has(tutorialPhase) && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center pl-[12%]">
          <div className="w-[28rem] rounded-xl border border-gray-200 bg-white/90 px-5 py-4 shadow-lg backdrop-blur-sm dark:border-gray-600 dark:bg-gray-800/90">
            <h2 className="mb-1 text-base font-bold text-gray-800 dark:text-gray-200">
              Tutorial
            </h2>
            <TutorialCheckItem
              checked={tutorialSteps.step1}
              visible
              text="Click below the ball to kick it"
            />
            <TutorialCheckItem
              checked={tutorialSteps.step2}
              visible={tutorialSteps.step1}
              text="The ball is kickable below the green zone"
            />
            <TutorialCheckItem
              checked={tutorialSteps.step3}
              visible={tutorialSteps.step2}
              text="Click again to keep the ball in the air before it hits the ground"
            />
            <TutorialCheckItem
              checked={tutorialSteps.step4}
              visible={tutorialSteps.step3}
              text="Click the ball right after a ground bounce for a forceful half-volley"
            />
            <TutorialCheckItem
              checked={tutorialSteps.step5}
              visible={tutorialSteps.step4}
              text="Collect the star. Clicking on either side of the ball can redirect it"
            />
            <div
              className="grid transition-[grid-template-rows,opacity] duration-500 ease-out"
              style={{
                gridTemplateRows: tutorialPhase === 'complete' ? '1fr' : '0fr',
                opacity: tutorialPhase === 'complete' ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
                  <span className="text-base font-bold text-green-500">
                    Tutorial Complete!
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-white/80">
                  Have Fun!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Countdown */}
      {tutorialPhase === 'countdown' && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <span
            className="text-[120px] leading-none font-bold text-white/80 drop-shadow-lg"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {countdownNumber}
          </span>
        </div>
      )}

      <canvas
        ref={ballCanvasRef}
        className="pointer-events-none absolute inset-0 z-[45]"
      />
    </div>
  )
}
