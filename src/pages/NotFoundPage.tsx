import { useEffect } from 'react'
import TextLink from '../components/TextLink'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found | Nathan Buchholz'
  }, [])

  return (
    <main className="py-12 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
        This page doesn't exist.
      </p>
      <TextLink to="/" className="mt-8 inline-block">
        Back to home
      </TextLink>
    </main>
  )
}
