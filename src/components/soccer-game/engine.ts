import type {
  Collectible,
  FloatingText,
  GameConfig,
  GameHandle,
  GameScore,
  HighScore,
  TutorialPhase,
  TutorialSteps,
  VisualEffect,
} from './types'
import { GamePerfMonitor } from './GamePerfMonitor'
import {
  drawGroundShadow,
  drawSoccerBall,
  drawKickZoneHighlight,
  randomVariance,
  rgba,
} from './rendering'
import {
  isMobile,
  GROWTH_DURATION,
  WALL_THICKNESS,
  COLLECTIBLE_BOUNCE_AMP,
  COLLECTIBLE_BOUNCE_SPEED,
  COLLECTIBLE_SPIN_SPEED,
  FLOATING_TEXT_FADE,
  TUTORIAL_GRAVITY,
  TUTORIAL_SLOW_RISE_GRAVITY,
  TUTORIAL_STEP5_GRAVITY,
  TUTORIAL_COYOTE_MS,
  TUTORIAL_START_Y_RATIO,
  TUTORIAL_BOUNCE_VEL,
  TUTORIAL_STEP4_GRAVITY,
  TUTORIAL_STEP4_BOUNCE_VEL,
  LS_TUTORIAL_KEY,
  isTutorialPhysicsPhase,
  saveHighScore,
  loadBallImage,
} from './constants'

export interface GameEngineParams {
  bgCanvas: HTMLCanvasElement
  ballCanvas: HTMLCanvasElement
  startX: number
  startY: number
  configRef: React.RefObject<GameConfig>
  highScoreRef: React.RefObject<HighScore>
  tutorialPhaseRef: React.MutableRefObject<TutorialPhase>
  tutorialStepsRef: React.MutableRefObject<TutorialSteps>
  settingsOpenRef: React.RefObject<boolean>
  pausedRef: React.RefObject<boolean>
  setLoading: (v: boolean) => void
  setScore: (s: GameScore) => void
  setMultiplier: (m: number) => void
  setElapsed: (e: number) => void
  setHighScore: (hs: HighScore) => void
  setTutorialPhase: (p: TutorialPhase) => void
  setTutorialSteps: (fn: (prev: TutorialSteps) => TutorialSteps) => void
}

const COMBO_COLORS = ['#fbbf24', '#f59e0b', '#ef4444', '#a855f7']

function setPhase(
  phase: TutorialPhase,
  ref: React.MutableRefObject<TutorialPhase>,
  setState: (p: TutorialPhase) => void,
) {
  ref.current = phase
  setState(phase)
}

export async function createGameEngine(
  params: GameEngineParams,
  cancelled: () => boolean,
): Promise<GameHandle | null> {
  const {
    bgCanvas,
    ballCanvas,
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
  } = params

  const _bgCtx = bgCanvas.getContext('2d')
  const _bcCtx = ballCanvas.getContext('2d')
  if (!_bgCtx || !_bcCtx) return null
  const bg: CanvasRenderingContext2D = _bgCtx
  const bc: CanvasRenderingContext2D = _bcCtx
  const w = window.innerWidth
  const h = window.innerHeight
  bgCanvas.width = w
  bgCanvas.height = h
  ballCanvas.width = w
  ballCanvas.height = h

  const initialCfg = configRef.current
  const bottomBuffer = initialCfg.bottomBuffer
  const groundH = h - bottomBuffer

  const ballImg = await loadBallImage()
  if (cancelled()) return null
  setLoading(false)

  // Growth animation + Matter.js import in parallel
  const matterPromise = import('matter-js')
  const iconRadius = 8

  await new Promise<void>((resolve) => {
    const growthStart = performance.now()
    function growLoop(time: number) {
      if (cancelled()) {
        resolve()
        return
      }
      const elapsed = time - growthStart
      const t = Math.min(elapsed / GROWTH_DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const radius = iconRadius + (initialCfg.ballSize - iconRadius) * eased
      bc.clearRect(0, 0, w, h)
      drawSoccerBall(bc, startX, startY, radius, 0, false, ballImg)
      if (t < 1) requestAnimationFrame(growLoop)
      else resolve()
    }
    requestAnimationFrame(growLoop)
  })

  const Matter = await matterPromise
  if (cancelled()) return null

  // Determine tutorial flow
  const tutorialSeen = localStorage.getItem(LS_TUTORIAL_KEY) === '1'
  const tutorialX = Math.min(
    Math.max(startX, initialCfg.ballSize + 20),
    w - initialCfg.ballSize - 20,
  )
  const tutorialY = groundH * TUTORIAL_START_Y_RATIO
  if (tutorialSeen) {
    setPhase('playing', tutorialPhaseRef, setTutorialPhase)
  } else {
    setPhase('step1', tutorialPhaseRef, setTutorialPhase)
  }

  const engine = Matter.Engine.create({
    gravity: { x: 0, y: initialCfg.gravity },
  })

  const ball = Matter.Bodies.circle(
    tutorialSeen ? startX : tutorialX,
    tutorialSeen ? startY : tutorialY,
    initialCfg.ballSize,
    {
      restitution: initialCfg.ballBounce,
      friction: initialCfg.friction,
      frictionAir: initialCfg.airResistance,
      density: initialCfg.ballDensity,
      isStatic: !tutorialSeen,
    },
  )

  const ground = Matter.Bodies.rectangle(
    w / 2,
    groundH + WALL_THICKNESS / 2,
    w * 3,
    WALL_THICKNESS,
    {
      isStatic: true,
      restitution: initialCfg.groundBounce,
      label: 'ground',
    },
  )
  const leftWall = Matter.Bodies.rectangle(
    -WALL_THICKNESS / 2,
    h / 2,
    WALL_THICKNESS,
    h * 3,
    {
      isStatic: true,
    },
  )
  const rightWall = Matter.Bodies.rectangle(
    w + WALL_THICKNESS / 2,
    h / 2,
    WALL_THICKNESS,
    h * 3,
    {
      isStatic: true,
    },
  )
  const ceiling = Matter.Bodies.rectangle(
    w / 2,
    -WALL_THICKNESS / 2,
    w * 3,
    WALL_THICKNESS,
    {
      isStatic: true,
      restitution: 0.2,
    },
  )

  Matter.Composite.add(engine.world, [
    ball,
    ground,
    leftWall,
    rightWall,
    ceiling,
  ])

  const gameScore: GameScore = {
    volleys: 0,
    drops: 0,
    points: 0,
    startTime: performance.now(),
  }
  const effects: VisualEffect[] = []
  const collectibles: Collectible[] = []
  const floatingTexts: FloatingText[] = []
  let lastClickTime = 0
  let kickCollectCount = 0
  let streakMultiplier = 1
  let lastSpawnTime = performance.now()
  let nextSpawnDelay = randomVariance(initialCfg.spawnRate * 1000, 0.4)
  const perf = new GamePerfMonitor()
  const tutorialTimers: ReturnType<typeof setTimeout>[] = []

  function checkAndSaveHighScore() {
    const elapsedTime = (performance.now() - gameScore.startTime) / 1000
    const hs = highScoreRef.current
    const newBestPoints =
      gameScore.points > hs.bestPoints ? gameScore.points : hs.bestPoints
    const newBestTime =
      gameScore.volleys > 0 && elapsedTime > hs.bestTime
        ? elapsedTime
        : hs.bestTime
    const ppm =
      gameScore.volleys > 0 ? (gameScore.points / elapsedTime) * 60 : 0
    const newBestPPM = ppm > hs.bestPPM ? ppm : hs.bestPPM
    if (
      newBestPoints > hs.bestPoints ||
      newBestTime > hs.bestTime ||
      newBestPPM > hs.bestPPM
    ) {
      const newHs: HighScore = {
        bestPoints: newBestPoints,
        bestTime: newBestTime,
        bestPPM: newBestPPM,
      }
      saveHighScore(newHs)
      setHighScore(newHs)
    }
  }

  function newGame(dropY?: number) {
    checkAndSaveHighScore()

    gameScore.volleys = 0
    gameScore.drops = 0
    gameScore.points = 0
    gameScore.startTime = performance.now()
    streakMultiplier = 1
    setScore({ ...gameScore })
    setMultiplier(1)
    setElapsed(0)
    if (pendingDropTimeout) {
      clearTimeout(pendingDropTimeout)
      pendingDropTimeout = null
    }
    effects.length = 0
    collectibles.length = 0
    floatingTexts.length = 0

    // Reset ball to center and pause for countdown
    const resetX = w / 2
    const resetY = dropY ?? groundH * TUTORIAL_START_Y_RATIO
    Matter.Body.setPosition(ball, { x: resetX, y: resetY })
    Matter.Body.setVelocity(ball, { x: 0, y: 0 })
    Matter.Body.setStatic(ball, true)
  }

  let lastGroundHitTime = 0
  let pendingDropTimeout: ReturnType<typeof setTimeout> | null = null
  Matter.Events.on(engine, 'collisionStart', (event) => {
    const now = performance.now()
    for (const pair of event.pairs) {
      const isGroundHit =
        (pair.bodyA === ball && pair.bodyB === ground) ||
        (pair.bodyA === ground && pair.bodyB === ball)
      if (isGroundHit) {
        const tPhase = tutorialPhaseRef.current
        // Tutorial ground bounces are handled in the render loop to bypass
        // Matter.js collision pair tracking (which can swallow rapid bounces).
        if (
          isTutorialPhysicsPhase(tPhase) ||
          tPhase === 'step1' ||
          tPhase === 'complete'
        )
          break
        if (now - lastGroundHitTime < 500) break
        lastGroundHitTime = now
        if (pendingDropTimeout) clearTimeout(pendingDropTimeout)
        effects.push({
          x: ball.position.x,
          y: groundH - 2,
          radius: configRef.current.ballSize * 1.0,
          opacity: 0.5,
          rgb: [255, 255, 255],
          squash: 0.35,
          vy: 1.5,
        })
        pendingDropTimeout = setTimeout(() => {
          pendingDropTimeout = null
          const penalty = configRef.current.dropPenalty
          gameScore.drops++
          if (penalty > 0) gameScore.points -= penalty
          streakMultiplier = 1
          if (penalty > 0) {
            floatingTexts.push({
              x: ball.position.x,
              y: groundH - 20,
              text: `-${penalty}`,
              opacity: 1,
              vy: 0.5,
              color: '#ef4444',
            })
          }
          setScore({ ...gameScore })
          setMultiplier(1)
        }, configRef.current.coyoteTimeMs)
        break
      }
    }
  })

  // Pre-render kick zone gradient to offscreen canvas
  const zoneCanvas = document.createElement('canvas')
  zoneCanvas.width = w
  zoneCanvas.height = h
  const zoneCtx = zoneCanvas.getContext('2d')
  if (!zoneCtx) return null
  const zoneY = groundH * initialCfg.clickZone
  const zoneGrad = zoneCtx.createLinearGradient(0, zoneY, 0, groundH)
  zoneGrad.addColorStop(0, 'rgba(34, 197, 94, 0)')
  zoneGrad.addColorStop(1, 'rgba(34, 197, 94, 0.12)')
  zoneCtx.fillStyle = zoneGrad
  zoneCtx.fillRect(0, zoneY, w, groundH - zoneY)

  function updateEffects(cfg: GameConfig) {
    for (let i = effects.length - 1; i >= 0; i--) {
      const eff = effects[i]
      eff.radius += eff.expandRate ?? cfg.ringExpand
      eff.opacity -= eff.fadeRate ?? cfg.ringFade
      if (eff.vy) eff.y += eff.vy
      if (eff.opacity <= 0) {
        effects.splice(i, 1)
        continue
      }
      bg.beginPath()
      const sy = eff.squash ?? 1
      bg.ellipse(eff.x, eff.y, eff.radius, eff.radius * sy, 0, 0, Math.PI * 2)
      bg.fillStyle = rgba(eff.rgb[0], eff.rgb[1], eff.rgb[2], eff.opacity)
      bg.fill()
    }
  }

  function spawnCollectibles(cfg: GameConfig, effectiveW: number, now: number) {
    if (now - lastSpawnTime < nextSpawnDelay) return
    const cX = cfg.ballSize + Math.random() * (effectiveW - cfg.ballSize * 2)
    const spawnZoneY = groundH * cfg.clickZone
    const r = Math.random()
    const zoneRatio = (spawnZoneY - cfg.ballSize) / (groundH - cfg.ballSize * 2)
    let cY: number
    if (r < zoneRatio) {
      const t = r / zoneRatio
      cY = cfg.ballSize + Math.sqrt(t) * (spawnZoneY - cfg.ballSize)
    } else {
      const t = (r - zoneRatio) / (1 - zoneRatio)
      cY = spawnZoneY + Math.pow(t, 2) * (groundH - cfg.ballSize - spawnZoneY)
    }
    collectibles.push({
      x: cX,
      y: cY,
      type: Math.random() < 0.7 ? 'coin' : 'star',
      spawnTime: now,
      lifetime: randomVariance(cfg.lifetime * 1000, 0.4),
      bounceOffset: Math.random() * Math.PI * 2,
      spinOffset: Math.random() * Math.PI * 2,
    })
    lastSpawnTime = now
    nextSpawnDelay = randomVariance(cfg.spawnRate * 1000, 0.4)
  }

  function checkCollisions(cfg: GameConfig, now: number) {
    const bx = ball.position.x
    const by = ball.position.y
    const hitRadius = cfg.ballSize + cfg.collectibleSize / 2
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const c = collectibles[i]
      const age = now - c.spawnTime
      const cBounceY =
        c.y +
        Math.sin(age * COLLECTIBLE_BOUNCE_SPEED + c.bounceOffset) *
          COLLECTIBLE_BOUNCE_AMP
      const cdx = bx - c.x
      const cdy = by - cBounceY
      if (cdx * cdx + cdy * cdy < hitRadius * hitRadius) {
        kickCollectCount++
        const basePoints = c.type === 'coin' ? 1 : 2
        const collectCombo = kickCollectCount
        const awarded = basePoints * collectCombo * streakMultiplier
        gameScore.points += awarded
        setScore({ ...gameScore })
        const colorIdx = Math.min(kickCollectCount - 1, COMBO_COLORS.length - 1)
        floatingTexts.push({
          x: c.x,
          y: c.y,
          text: `+${awarded}`,
          opacity: 1,
          vy: 0.5,
          color: COMBO_COLORS[colorIdx],
        })
        effects.push({
          x: c.x,
          y: c.y,
          radius: 8,
          opacity: 0.7,
          rgb: [255, 215, 0],
        })
        collectibles.splice(i, 1)
        if (
          tutorialPhaseRef.current === 'step5' &&
          !tutorialStepsRef.current.step5
        ) {
          tutorialStepsRef.current.step5 = true
          setTutorialSteps((prev) => ({ ...prev, step5: true }))
          tutorialTimers.push(
            setTimeout(() => {
              Matter.Body.setStatic(ball, true)
              Matter.Body.setVelocity(ball, { x: 0, y: 0 })
              setPhase('complete', tutorialPhaseRef, setTutorialPhase)
              localStorage.setItem(LS_TUTORIAL_KEY, '1')
            }, 800),
          )
        }
        continue
      }
      if (now - c.spawnTime > c.lifetime) {
        collectibles.splice(i, 1)
      }
    }
  }

  function drawCollectibles(cfg: GameConfig, now: number) {
    bc.font = `${cfg.collectibleSize}px serif`
    bc.textAlign = 'center'
    bc.textBaseline = 'middle'
    for (const c of collectibles) {
      const age = now - c.spawnTime
      const remaining = c.lifetime - age

      const fadeIn = Math.min(age / 500, 1)
      const fadeOut = remaining < 1500 ? remaining / 1500 : 1
      bc.globalAlpha = fadeIn * fadeOut

      const drawBounceY =
        Math.sin(age * COLLECTIBLE_BOUNCE_SPEED + c.bounceOffset) *
        COLLECTIBLE_BOUNCE_AMP
      const scaleX = Math.abs(
        Math.cos(age * COLLECTIBLE_SPIN_SPEED + c.spinOffset),
      )
      const clampedScaleX = 0.15 + scaleX * 0.85

      bc.save()
      bc.translate(c.x, c.y + drawBounceY)
      bc.scale(clampedScaleX, 1)
      bc.fillText(c.type === 'coin' ? '\u{1FA99}' : '\u2B50', 0, 0)
      bc.restore()
    }
    bc.globalAlpha = 1
  }

  function drawFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i]
      ft.y += ft.vy
      ft.opacity -= FLOATING_TEXT_FADE
      if (ft.opacity <= 0) {
        floatingTexts.splice(i, 1)
        continue
      }
      bc.globalAlpha = ft.opacity
      bc.font = 'bold 24px monospace'
      bc.fillStyle = ft.color
      bc.textAlign = 'center'
      bc.fillText(ft.text, ft.x, ft.y)
    }
    bc.globalAlpha = 1
  }

  function drawTutorialHints(
    phase: TutorialPhase,
    cfg: GameConfig,
    time: number,
  ) {
    if (phase === 'step1_pause' || phase === 'step2') {
      drawKickZoneHighlight(
        bc,
        ball.position.x,
        ball.position.y,
        cfg.ballSize,
        time,
      )
      const zoneLineY = groundH * cfg.clickZone
      bc.save()
      bc.setLineDash([8, 6])
      bc.strokeStyle = 'rgba(34, 197, 94, 0.6)'
      bc.lineWidth = 2
      bc.beginPath()
      bc.moveTo(0, zoneLineY)
      bc.lineTo(w, zoneLineY)
      bc.stroke()
      bc.setLineDash([])
      bc.font = '14px sans-serif'
      bc.fillStyle = 'rgba(34, 197, 94, 0.8)'
      bc.textAlign = 'right'
      bc.fillText('Kick Zone \u2193', w - 16, zoneLineY - 8)
      bc.restore()
    }
    if (phase === 'step3' || phase === 'step4' || phase === 'step5') {
      drawKickZoneHighlight(
        bc,
        ball.position.x,
        ball.position.y,
        cfg.ballSize,
        time,
      )
    }
  }

  let animId = 0
  let lastTime = performance.now()

  function loop(time: number) {
    if ((isMobile && settingsOpenRef.current) || pausedRef.current) {
      // Shift startTime forward so elapsed doesn't jump when unpaused
      const pausedDelta = time - lastTime
      if (pausedDelta > 0 && tutorialPhaseRef.current === 'playing') {
        gameScore.startTime += pausedDelta
      }
      lastTime = time
      animId = requestAnimationFrame(loop)
      return
    }

    const phase = tutorialPhaseRef.current
    const cfg = configRef.current

    if (phase === 'growth') {
      animId = requestAnimationFrame(loop)
      return
    }

    if (phase === 'complete') {
      bg.clearRect(0, 0, w, h)
      bg.drawImage(zoneCanvas, 0, 0)
      bc.clearRect(0, 0, w, h)
      drawGroundShadow(
        bc,
        ball.position.x,
        ball.position.y,
        groundH,
        cfg.ballSize,
      )
      drawSoccerBall(
        bc,
        ball.position.x,
        ball.position.y,
        cfg.ballSize,
        0,
        false,
        ballImg,
      )
      animId = requestAnimationFrame(loop)
      return
    }

    if (phase === 'countdown') {
      bg.clearRect(0, 0, w, h)
      bg.drawImage(zoneCanvas, 0, 0)
      bc.clearRect(0, 0, w, h)
      drawGroundShadow(
        bc,
        ball.position.x,
        ball.position.y,
        groundH,
        cfg.ballSize,
      )
      drawSoccerBall(
        bc,
        ball.position.x,
        ball.position.y,
        cfg.ballSize,
        0,
        false,
        ballImg,
      )
      animId = requestAnimationFrame(loop)
      return
    }

    if (phase === 'step1') {
      const bx = ball.position.x,
        by = ball.position.y
      const dx = tutorialX - bx,
        dy = tutorialY - by
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        Matter.Body.setPosition(ball, { x: bx + dx * 0.1, y: by + dy * 0.1 })
      }
      bg.clearRect(0, 0, w, h)
      bg.drawImage(zoneCanvas, 0, 0)
      bc.clearRect(0, 0, w, h)
      drawGroundShadow(
        bc,
        ball.position.x,
        ball.position.y,
        groundH,
        cfg.ballSize,
      )
      drawSoccerBall(
        bc,
        ball.position.x,
        ball.position.y,
        cfg.ballSize,
        0,
        false,
        ballImg,
      )
      drawKickZoneHighlight(
        bc,
        ball.position.x,
        ball.position.y,
        cfg.ballSize,
        time,
      )
      const bounceY = Math.sin(time * 0.004) * 8
      bc.font = `${isMobile ? 32 : 24}px serif`
      bc.textAlign = 'center'
      bc.fillText(
        '\u{1F446}',
        ball.position.x,
        ball.position.y + cfg.ballSize + 24 + bounceY,
      )
      animId = requestAnimationFrame(loop)
      return
    }

    // step1_pause: very low gravity for slow rise; step2-step5: tutorial gravity
    if (phase === 'step1_pause') {
      engine.gravity.y = TUTORIAL_SLOW_RISE_GRAVITY
    } else if (phase === 'step2' || phase === 'step3') {
      engine.gravity.y = TUTORIAL_GRAVITY
    } else if (phase === 'step4') {
      engine.gravity.y = TUTORIAL_STEP4_GRAVITY
    } else if (phase === 'step5') {
      engine.gravity.y = TUTORIAL_STEP5_GRAVITY
    }

    // First frame of playing: make ball dynamic and start timer
    if (phase === 'playing' && ball.isStatic) {
      Matter.Body.setStatic(ball, false)
      gameScore.startTime = performance.now()
    }

    perf.recordFrameStart()
    const delta = Math.min(time - lastTime, 16.667)
    lastTime = time

    if (cfg.showPerfHUD) perf.startConsoleLogging()
    else perf.stopConsoleLogging()

    // Timer
    if (phase === 'playing') {
      const elapsedSec = (time - gameScore.startTime) / 1000
      if (
        Math.floor(elapsedSec * 2) !==
        Math.floor((elapsedSec - delta / 1000) * 2)
      ) {
        setElapsed(elapsedSec)
      }
    }

    // Settings wall
    const settingsWallTarget =
      settingsOpenRef.current && !isMobile
        ? w - 304 + WALL_THICKNESS / 2
        : w + WALL_THICKNESS / 2
    const currentWallX = rightWall.position.x
    const wallDiff = settingsWallTarget - currentWallX
    const newWallX =
      Math.abs(wallDiff) < 1
        ? settingsWallTarget
        : currentWallX + wallDiff * 0.12
    Matter.Body.setPosition(rightWall, { x: newWallX, y: h / 2 })
    const effectiveW = newWallX - WALL_THICKNESS / 2
    if (wallDiff < -1) {
      if (ball.position.x > effectiveW - cfg.ballSize) {
        Matter.Body.setVelocity(ball, {
          x: Math.min(ball.velocity.x, -3),
          y: ball.velocity.y,
        })
      }
      for (const c of collectibles) {
        if (c.x > effectiveW - cfg.collectibleSize) {
          c.x = effectiveW - cfg.collectibleSize
        }
      }
    }

    if (!isTutorialPhysicsPhase(phase)) {
      engine.gravity.y = cfg.gravity
    }
    ball.restitution = cfg.ballBounce
    ball.friction = cfg.friction
    ball.frictionAir = cfg.airResistance
    ground.restitution = cfg.groundBounce
    if (Math.abs(ball.density - cfg.ballDensity) > 0.00001) {
      Matter.Body.setDensity(ball, cfg.ballDensity)
    }

    Matter.Engine.update(engine, delta)

    // Safety clamp: if the ball somehow tunnels past the ground, push it back.
    // This can happen at high velocities when Matter.js misses the collision.
    if (phase === 'playing') {
      const ballBottom = ball.position.y + cfg.ballSize
      if (ballBottom > groundH) {
        Matter.Body.setPosition(ball, {
          x: ball.position.x,
          y: groundH - cfg.ballSize,
        })
        if (ball.velocity.y > 0) {
          Matter.Body.setVelocity(ball, {
            x: ball.velocity.x,
            y: -ball.velocity.y * cfg.groundBounce,
          })
        }
      }

      // Safety clamps for side walls and ceiling
      if (ball.position.x < cfg.ballSize) {
        Matter.Body.setPosition(ball, {
          x: cfg.ballSize,
          y: ball.position.y,
        })
        if (ball.velocity.x < 0) {
          Matter.Body.setVelocity(ball, {
            x: -ball.velocity.x,
            y: ball.velocity.y,
          })
        }
      }
      if (ball.position.x > effectiveW - cfg.ballSize) {
        Matter.Body.setPosition(ball, {
          x: effectiveW - cfg.ballSize,
          y: ball.position.y,
        })
        if (ball.velocity.x > 0) {
          Matter.Body.setVelocity(ball, {
            x: -ball.velocity.x,
            y: ball.velocity.y,
          })
        }
      }
      if (ball.position.y < cfg.ballSize) {
        Matter.Body.setPosition(ball, {
          x: ball.position.x,
          y: cfg.ballSize,
        })
        if (ball.velocity.y < 0) {
          Matter.Body.setVelocity(ball, {
            x: ball.velocity.x,
            y: -ball.velocity.y,
          })
        }
      }
    }

    // Tutorial bounce: check ball position each frame instead of relying on
    // collisionStart, which Matter.js can skip when bounces are too rapid.
    if (isTutorialPhysicsPhase(phase)) {
      const ballBottom = ball.position.y + cfg.ballSize
      if (ballBottom >= groundH) {
        const aboveGround = groundH - cfg.ballSize - 1
        Matter.Body.setPosition(ball, { x: ball.position.x, y: aboveGround })
        if (phase === 'step2') {
          Matter.Body.setVelocity(ball, { x: 0, y: TUTORIAL_BOUNCE_VEL })
        } else if (phase === 'step5') {
          Matter.Body.setVelocity(ball, { x: 0, y: TUTORIAL_STEP4_BOUNCE_VEL })
          if (pendingDropTimeout) clearTimeout(pendingDropTimeout)
          pendingDropTimeout = setTimeout(() => {
            pendingDropTimeout = null
          }, TUTORIAL_COYOTE_MS)
        } else if (phase === 'step3') {
          Matter.Body.setVelocity(ball, { x: 0, y: TUTORIAL_BOUNCE_VEL })
          if (pendingDropTimeout) clearTimeout(pendingDropTimeout)
          pendingDropTimeout = setTimeout(() => {
            pendingDropTimeout = null
          }, TUTORIAL_COYOTE_MS)
        } else if (phase === 'step4') {
          Matter.Body.setVelocity(ball, { x: 0, y: TUTORIAL_STEP4_BOUNCE_VEL })
          if (pendingDropTimeout) clearTimeout(pendingDropTimeout)
          pendingDropTimeout = setTimeout(() => {
            pendingDropTimeout = null
          }, TUTORIAL_COYOTE_MS)
          effects.push({
            x: ball.position.x,
            y: groundH - 2,
            radius: cfg.ballSize * 0.5,
            opacity: 0.8,
            rgb: [34, 197, 94],
            squash: 0.3,
            expandRate: 3,
            fadeRate: 0.04,
          })
        }
      }
    }

    perf.recordEngineEnd()

    bg.clearRect(0, 0, w, h)
    // Detect apex during step1_pause
    if (phase === 'step1_pause' && !ball.isStatic && ball.velocity.y >= 0) {
      Matter.Body.setStatic(ball, true)
      Matter.Body.setVelocity(ball, { x: 0, y: 0 })
      tutorialTimers.push(
        setTimeout(() => {
          setPhase('step2', tutorialPhaseRef, setTutorialPhase)
          Matter.Body.setStatic(ball, false)
          engine.gravity.y = TUTORIAL_GRAVITY
        }, 500),
      )
    }

    if (phase === 'step1_pause' || phase === 'step2') {
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.003)
      bg.globalAlpha = 0.5 + pulse * 0.5
      bg.drawImage(zoneCanvas, 0, 0)
      bg.globalAlpha = 1
    } else {
      bg.drawImage(zoneCanvas, 0, 0)
    }

    // Draw bottom buffer zone (desktop only)
    if (bottomBuffer > 0) {
      const bufGrad = bg.createLinearGradient(0, groundH - 10, 0, groundH)
      bufGrad.addColorStop(0, 'transparent')
      bufGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)')
      bg.fillStyle = bufGrad
      bg.fillRect(0, groundH - 10, w, 10)
      bg.fillStyle = 'rgba(0, 0, 0, 0.3)'
      bg.fillRect(0, groundH, w, bottomBuffer)
    }

    updateEffects(cfg)

    const now = performance.now()
    if (!isTutorialPhysicsPhase(phase)) spawnCollectibles(cfg, effectiveW, now)
    checkCollisions(cfg, now)

    bc.clearRect(0, 0, w, h)
    drawCollectibles(cfg, now)
    drawFloatingTexts()
    drawGroundShadow(
      bc,
      ball.position.x,
      ball.position.y,
      groundH,
      cfg.ballSize,
    )
    const cooldownRemaining =
      cfg.clickCooldownMs - (performance.now() - lastClickTime)
    const onCooldown = cooldownRemaining > 0
    drawSoccerBall(
      bc,
      ball.position.x,
      ball.position.y,
      cfg.ballSize,
      ball.angle,
      onCooldown,
      ballImg,
    )
    drawTutorialHints(phase, cfg, time)

    perf.recordDrawEnd()
    perf.draw(bc, cfg.showPerfHUD)

    animId = requestAnimationFrame(loop)
  }

  animId = requestAnimationFrame(loop)

  function handleClick(x: number, y: number) {
    const cfg = configRef.current
    const now = performance.now()
    if (now - lastClickTime < cfg.clickCooldownMs) return

    const dx = x - ball.position.x
    const dy = y - ball.position.y

    if (dy < 0) return

    const normalizedY = ball.position.y / groundH
    if (normalizedY < cfg.clickZone) return

    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > cfg.ballSize * cfg.ballHitbox) return

    lastClickTime = now
    const isHalfVolley = pendingDropTimeout !== null
    if (pendingDropTimeout) {
      clearTimeout(pendingDropTimeout)
      pendingDropTimeout = null
    }
    kickCollectCount = 0
    const strength = Math.sqrt(
      (normalizedY - cfg.clickZone) / (1 - cfg.clickZone),
    )

    const upForce = -cfg.kickForce - cfg.heightBonus * strength

    const phase = tutorialPhaseRef.current

    // step1: gentle upward kick
    if (phase === 'step1') {
      Matter.Body.setStatic(ball, false)
      engine.gravity.y = TUTORIAL_SLOW_RISE_GRAVITY
      Matter.Body.setVelocity(ball, { x: 0, y: -3 })
      tutorialStepsRef.current.step1 = true
      setTutorialSteps((prev) => ({ ...prev, step1: true }))
      setPhase('step1_pause', tutorialPhaseRef, setTutorialPhase)
      effects.push({
        x: ball.position.x,
        y: ball.position.y + cfg.ballSize * 0.4,
        radius: cfg.ballSize * 1.2,
        opacity: 0.6,
        rgb: [34, 197, 94],
        squash: 0.35,
        vy: 1.5,
      })
      return
    }

    const isTutorialStep =
      phase === 'step2' ||
      phase === 'step3' ||
      phase === 'step4' ||
      phase === 'step5'
    const sideForce =
      phase === 'step2' || phase === 'step3' || phase === 'step4'
        ? 0
        : -(dx / cfg.ballSize) * cfg.sideForce

    if (isTutorialStep) {
      const tutorialKickY = isHalfVolley
        ? phase === 'step5'
          ? -16
          : -12
        : phase === 'step5'
          ? -5
          : -3
      Matter.Body.setVelocity(ball, { x: sideForce * 80, y: tutorialKickY })
    } else {
      const forceX = ball.position.x + (x - ball.position.x) * 0.3
      const forceY = ball.position.y + (y - ball.position.y) * 0.3
      Matter.Body.applyForce(
        ball,
        { x: forceX, y: forceY },
        { x: sideForce, y: upForce },
      )
    }

    const r = Math.round(59 + (34 - 59) * strength)
    const g = Math.round(130 + (197 - 130) * strength)
    const b = Math.round(246 + (94 - 246) * strength)

    effects.push({
      x: ball.position.x,
      y: ball.position.y + cfg.ballSize * 0.4,
      radius: cfg.ballSize * (1.0 + strength * 0.4),
      opacity: 0.6,
      rgb: [r, g, b],
      squash: 0.35,
      vy: 1.5,
    })

    gameScore.volleys++
    if (!isHalfVolley && gameScore.volleys > 1) streakMultiplier++
    setScore({ ...gameScore })
    setMultiplier(streakMultiplier)

    if (phase === 'step2' && !tutorialStepsRef.current.step2) {
      tutorialStepsRef.current.step2 = true
      setTutorialSteps((prev) => ({ ...prev, step2: true }))
      setPhase('step3', tutorialPhaseRef, setTutorialPhase)
    }

    if (phase === 'step3' && !isHalfVolley && !tutorialStepsRef.current.step3) {
      tutorialStepsRef.current.step3 = true
      setTutorialSteps((prev) => ({ ...prev, step3: true }))
      setPhase('step4', tutorialPhaseRef, setTutorialPhase)
    }

    if (phase === 'step4' && isHalfVolley && !tutorialStepsRef.current.step4) {
      tutorialStepsRef.current.step4 = true
      setTutorialSteps((prev) => ({ ...prev, step4: true }))
      const starX = Math.min(
        ball.position.x + cfg.ballSize * 3,
        w - cfg.collectibleSize,
      )
      collectibles.push({
        x: starX,
        y: Math.min(ball.position.y - 80, h * 0.4),
        type: 'star',
        spawnTime: performance.now(),
        lifetime: Infinity,
        bounceOffset: 0,
        spinOffset: 0,
      })
      setPhase('step5', tutorialPhaseRef, setTutorialPhase)
    }
  }

  return {
    handleClick,
    newGame,
    cleanup: () => {
      checkAndSaveHighScore()
      cancelAnimationFrame(animId)
      if (pendingDropTimeout) {
        clearTimeout(pendingDropTimeout)
      }
      tutorialTimers.forEach(clearTimeout)
      perf.cleanup()
      Matter.Engine.clear(engine)
    },
    resetForTutorial: () => {
      Matter.Body.setPosition(ball, { x: tutorialX, y: tutorialY })
      Matter.Body.setVelocity(ball, { x: 0, y: 0 })
      Matter.Body.setStatic(ball, true)
      collectibles.length = 0
      effects.length = 0
      floatingTexts.length = 0
    },
  }
}
