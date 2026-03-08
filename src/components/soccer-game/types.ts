export interface Collectible {
  x: number
  y: number
  type: 'coin' | 'star'
  spawnTime: number
  lifetime: number
  bounceOffset: number
  spinOffset: number
}

export interface FloatingText {
  x: number
  y: number
  text: string
  opacity: number
  vy: number
  color: string
}

export interface GameConfig {
  gravity: number
  ballDensity: number
  ballBounce: number
  friction: number
  airResistance: number
  groundBounce: number
  kickForce: number
  heightBonus: number
  sideForce: number
  clickCooldownMs: number
  coyoteTimeMs: number
  ballHitbox: number
  ballSize: number
  ringExpand: number
  ringFade: number
  spawnRate: number
  lifetime: number
  collectibleSize: number
  clickZone: number
  dropPenalty: number
  bottomBuffer: number
  overlayColor: string
  showPerfHUD: boolean
}

export interface HighScore {
  bestPoints: number
  bestTime: number
  bestPPM: number
}

export type TutorialPhase =
  | 'growth'
  | 'step1'
  | 'step1_pause'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'complete'
  | 'countdown'
  | 'playing'

export type PresetName = 'easy' | 'normal' | 'hard'

export interface SoccerGameProps {
  onClose: () => void
  startX: number
  startY: number
}

export interface VisualEffect {
  x: number
  y: number
  radius: number
  opacity: number
  rgb: [number, number, number]
  fadeRate?: number
  expandRate?: number
  squash?: number
  vy?: number
}

export interface GameHandle {
  handleClick: (x: number, y: number) => void
  newGame: () => void
  cleanup: () => void
  resetForTutorial: () => void
}

export interface GameScore {
  volleys: number
  drops: number
  points: number
  startTime: number
}

export interface TutorialSteps {
  step1: boolean
  step2: boolean
  step3: boolean
  step4: boolean
  step5: boolean
}
