import { Suspense } from 'react'
import { Outlet } from 'react-router'
import Navigation from './Navigation'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navigation />
      <div
        id="main-content"
        className="mx-auto max-w-5xl px-4 py-8"
        style={{ viewTransitionName: 'page-content' }}
      >
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}
