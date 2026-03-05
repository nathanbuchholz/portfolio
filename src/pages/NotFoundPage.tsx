import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found')
  return (
    <main className="py-12 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
        This page doesn't exist.
      </p>
      <Link
        to="/"
        viewTransition
        className="mt-8 inline-block text-blue-600 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Back to home
      </Link>
    </main>
  )
}
