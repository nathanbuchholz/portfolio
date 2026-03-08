import type {
  GameConfig,
  HighScore,
  PresetName,
  TutorialPhase,
  TutorialSteps,
} from './types'

export const isMobile = window.innerWidth < 640

export const MOBILE_SPAWN_RATE_SCALE = 2.5

export const MOBILE_OVERRIDES: Partial<GameConfig> = {
  ballSize: 36,
  collectibleSize: 42,
  ballHitbox: 1.8,
  ballDensity: 0.00009, // (28/36)^2 x 0.00015 -- same effective mass as desktop
}

export const DEFAULT_CONFIG: GameConfig = {
  gravity: 0.8,
  ballDensity: 0.00015,
  ballBounce: 0.65,
  friction: 0.04,
  airResistance: 0.012,
  groundBounce: 0.5,
  kickForce: 0.025,
  heightBonus: 0.04,
  sideForce: 0.015,
  clickCooldownMs: 200,
  coyoteTimeMs: 200,
  ballHitbox: 1.4,
  ballSize: 28,
  ringExpand: 2.5,
  ringFade: 0.05,
  spawnRate: 2,
  lifetime: 10,
  collectibleSize: 30,
  clickZone: 0.67,
  dropPenalty: 1,
  bottomBuffer: isMobile ? 0 : 30,
  overlayColor: '#000000df',
  showPerfHUD: false,
}

export const PRESETS: Record<
  PresetName,
  { label: string; overrides: Partial<GameConfig> }
> = {
  easy: {
    label: 'Easy',
    overrides: {
      dropPenalty: 0,
      coyoteTimeMs: 350,
      ballHitbox: 1.8,
      clickZone: 0.55,
      spawnRate: 1,
      collectibleSize: 40,
    },
  },
  normal: {
    label: 'Normal (Default)',
    overrides: {},
  },
  hard: {
    label: 'Hard',
    overrides: {
      dropPenalty: 10,
      coyoteTimeMs: 100,
      ballHitbox: 1.2,
      clickZone: 0.75,
      spawnRate: 3,
      collectibleSize: 20,
    },
  },
}

export const CONFIG_FIELDS: {
  section: string
  key: keyof GameConfig
  label: string
  tooltip: string
  min: number
  max: number
  step: number
}[] = [
  {
    section: 'Physics',
    key: 'gravity',
    label: 'Gravity',
    tooltip: 'Downward acceleration. Higher = ball falls faster.',
    min: 0,
    max: 3,
    step: 0.05,
  },
  {
    section: 'Physics',
    key: 'ballDensity',
    label: 'Ball Density',
    tooltip: 'Mass per unit area. Heavier balls need more force to move.',
    min: 0.00001,
    max: 0.0002,
    step: 0.00001,
  },
  {
    section: 'Physics',
    key: 'ballBounce',
    label: 'Ball Bounce',
    tooltip: 'Bounciness on collision. 1 = perfectly elastic, 0 = no bounce.',
    min: 0,
    max: 1,
    step: 0.05,
  },
  {
    section: 'Physics',
    key: 'friction',
    label: 'Friction',
    tooltip: 'Surface friction on contact. Affects spin on wall/ground hits.',
    min: 0,
    max: 0.5,
    step: 0.01,
  },
  {
    section: 'Physics',
    key: 'airResistance',
    label: 'Air Resistance',
    tooltip: 'Drag while airborne. Higher = ball slows down faster in the air.',
    min: 0,
    max: 0.1,
    step: 0.001,
  },
  {
    section: 'Physics',
    key: 'groundBounce',
    label: 'Ground Bounce',
    tooltip: 'How much energy the ground returns on impact.',
    min: 0,
    max: 1,
    step: 0.05,
  },
  {
    section: 'Forces',
    key: 'kickForce',
    label: 'Kick Force',
    tooltip: 'Base upward impulse on every successful volley.',
    min: 0.002,
    max: 0.2,
    step: 0.001,
  },
  {
    section: 'Forces',
    key: 'heightBonus',
    label: 'Height Bonus',
    tooltip:
      'Extra upward force at ground level. Scales linearly: kicks near the ground are strongest.',
    min: 0,
    max: 0.12,
    step: 0.001,
  },
  {
    section: 'Forces',
    key: 'sideForce',
    label: 'Side Force',
    tooltip: 'Horizontal impulse based on click offset from ball center.',
    min: 0,
    max: 0.05,
    step: 0.001,
  },
  {
    section: 'Gameplay',
    key: 'clickCooldownMs',
    label: 'Click Cooldown (ms)',
    tooltip: 'Minimum time between volleys. Prevents spam clicking.',
    min: 0,
    max: 1000,
    step: 25,
  },
  {
    section: 'Gameplay',
    key: 'coyoteTimeMs',
    label: 'Coyote Time (ms)',
    tooltip:
      'Grace period after a ground bounce. Kicking within this window forgives the drop (half-volley).',
    min: 0,
    max: 500,
    step: 25,
  },
  {
    section: 'Gameplay',
    key: 'clickZone',
    label: 'Click Zone',
    tooltip:
      'Screen height % where clicking becomes possible. Higher = smaller clickable area.',
    min: 0.05,
    max: 0.95,
    step: 0.05,
  },
  {
    section: 'Gameplay',
    key: 'ballHitbox',
    label: 'Ball Hitbox',
    tooltip:
      'Multiplier on ball radius for click detection. Higher = more forgiving.',
    min: 1,
    max: 3,
    step: 0.1,
  },
  {
    section: 'Gameplay',
    key: 'ballSize',
    label: 'Ball Size',
    tooltip: 'Visual and physics radius of the ball in pixels.',
    min: 15,
    max: 50,
    step: 1,
  },
  {
    section: 'Effects',
    key: 'ringExpand',
    label: 'Ring Expand',
    tooltip: 'How fast the volley ring effect expands outward.',
    min: 0.5,
    max: 6,
    step: 0.25,
  },
  {
    section: 'Effects',
    key: 'ringFade',
    label: 'Ring Fade',
    tooltip: 'How fast the volley ring effect fades out.',
    min: 0.005,
    max: 0.08,
    step: 0.005,
  },
  {
    section: 'Collectibles',
    key: 'spawnRate',
    label: 'Spawn Rate (s)',
    tooltip:
      'Average seconds between collectible spawns. Lower = more frequent.',
    min: 0.5,
    max: 15,
    step: 0.5,
  },
  {
    section: 'Collectibles',
    key: 'lifetime',
    label: 'Lifetime (s)',
    tooltip: 'Average seconds a collectible stays on screen.',
    min: 3,
    max: 30,
    step: 0.5,
  },
  {
    section: 'Collectibles',
    key: 'collectibleSize',
    label: 'Size',
    tooltip:
      'Size of collectible icons in pixels. Also scales the pickup hitbox.',
    min: 16,
    max: 64,
    step: 2,
  },
]

export const LS_PRESET_KEY = 'soccer-game-preset'
export const LS_HIGH_SCORE_KEY = 'soccer-game-high-score'
export const LS_TUTORIAL_KEY = 'soccer-game-tutorial-seen'
export const LS_CONFIG_KEY = 'soccer-game-config'
export const LS_CUSTOM_CONFIGS_KEY = 'soccer-game-custom-configs'

export const INITIAL_TUTORIAL_STEPS: TutorialSteps = {
  step1: false,
  step2: false,
  step3: false,
  step4: false,
  step5: false,
}

// Engine magic numbers
export const GROWTH_DURATION = 400
export const WALL_THICKNESS = 50
export const COLLECTIBLE_BOUNCE_AMP = 6
export const COLLECTIBLE_BOUNCE_SPEED = 0.003
export const COLLECTIBLE_SPIN_SPEED = 0.004
export const FLOATING_TEXT_FADE = 0.015
export const TUTORIAL_GRAVITY = 0.05
export const TUTORIAL_SLOW_RISE_GRAVITY = 0.06
export const TUTORIAL_STEP5_GRAVITY = 0.18
export const TUTORIAL_COYOTE_MS = 500
export const TUTORIAL_BOUNCE_VEL = -1
export const TUTORIAL_STEP4_GRAVITY = 0.12
export const TUTORIAL_STEP4_BOUNCE_VEL = -2
export const TUTORIAL_START_Y_RATIO = 0.72

// Tutorial phase helpers
const TUTORIAL_PHYSICS_PHASES: ReadonlySet<TutorialPhase> = new Set([
  'step1_pause',
  'step2',
  'step3',
  'step4',
  'step5',
])

export const CLICKABLE_PHASES: ReadonlySet<TutorialPhase> = new Set([
  'playing',
  'step1',
  'step2',
  'step3',
  'step4',
  'step5',
])

export const TUTORIAL_VISIBLE_PHASES: ReadonlySet<TutorialPhase> = new Set([
  'step1',
  'step1_pause',
  'step2',
  'step3',
  'step4',
  'step5',
  'complete',
])

export function isTutorialPhysicsPhase(phase: TutorialPhase): boolean {
  return TUTORIAL_PHYSICS_PHASES.has(phase)
}

export function buildConfig(...overrides: Partial<GameConfig>[]): GameConfig {
  const cfg = Object.assign(
    {},
    DEFAULT_CONFIG,
    isMobile ? MOBILE_OVERRIDES : {},
    ...overrides,
  )
  if (isMobile) cfg.spawnRate *= MOBILE_SPAWN_RATE_SCALE
  return cfg
}

export function loadHighScore(): HighScore {
  const defaults: HighScore = { bestPoints: 0, bestTime: 0, bestPPM: 0 }
  try {
    const saved = localStorage.getItem(LS_HIGH_SCORE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        bestPoints: parsed.bestPoints ?? 0,
        bestTime: parsed.bestTime ?? 0,
        bestPPM: parsed.bestPPM ?? 0,
      }
    }
  } catch {
    /* ignore */
  }
  return defaults
}

export function saveHighScore(hs: HighScore) {
  localStorage.setItem(LS_HIGH_SCORE_KEY, JSON.stringify(hs))
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function loadBallImage(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = '/soccer_ball.svg'
  })
}
