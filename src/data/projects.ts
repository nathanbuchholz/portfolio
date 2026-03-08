import type { Project } from '../types'

export const projects: Project[] = [
  {
    title: 'Soccer Juggling Game',
    description:
      'A physics-based soccer juggling game built with React, TypeScript, Canvas 2D, and Matter.js. Features a guided tutorial, combo scoring, collectibles, configurable settings, and high score tracking. Click the soccer ball in the nav bar to play!',
    tech: ['React', 'TypeScript', 'Matter.js', 'Canvas'],
  },
  {
    title: 'Soccer Management Sim',
    description:
      'A UI-intensive soccer management game featuring a procedurally generated, realistic world, a headless and fully testable simulation core, modular domain APIs, complex table-driven management interfaces, and RPG-style player progression systems.',
    tech: ['Godot', 'C#', 'Game Design'],
  },
  {
    title: 'Summit (roguelite homage to Joust)',
    description:
      'Team capstone project for Game Design Certificate. A vertical-scrolling roguelite built in Unity with modular player and enemy control systems, weapon systems, in-game UI, and automated builds and testing for deployment on Itch.io.',
    tech: ['Unity', 'C#', 'Game Design'],
    liveUrl: 'https://thirdbreakfast.itch.io/summit-webgl',
    liveUrlName: 'Play on Itch.io',
  },
  {
    title: 'Farming Sim',
    description:
      'A Unity-based farming sim being built collaboratively with two teammates. Owning core systems including save/scene persistence, UI, localization, automated tests, inventory, time simulation, and service-location infrastructure.',
    tech: ['Unity', 'C#', 'Game Design'],
  },
  {
    title: 'Spritesheet Unpacker',
    description:
      'A cross-platform desktop app for slicing spritesheets and exporting selected slices. Supports auto-detection of irregular sprites via transparency and grid-based slicing with configurable cell dimensions and margins.',
    tech: ['C#', 'Avalonia', '.NET'],
    liveUrl: 'https://github.com/nathanbuchholz/spritesheet-unpacker',
    liveUrlName: 'Source Code',
  },
  {
    title: 'Blog & Photo Gallery',
    description:
      'A personal blog and photo gallery site for sharing travel photography and writing.',
    tech: ['Astro', 'React', 'TypeScript'],
    liveUrl: 'https://talonbuchholz.com',
  },
  {
    title: 'Portfolio Site',
    description:
      'This portfolio site, a React SPA with TypeScript, Tailwind CSS, Vitest, Cypress, and CI/CD via GitHub Actions. Deployed on Netlify.',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Vitest', 'Cypress'],
    liveUrl: 'https://github.com/nathanbuchholz/portfolio',
    liveUrlName: 'Source Code',
  },
]
