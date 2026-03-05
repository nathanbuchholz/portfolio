import { education } from '../data'
import Card from '../components/Card'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function EducationPage() {
  useDocumentTitle('Education')
  return (
    <main>
      <h1 className="text-3xl font-bold">Education</h1>
      <div className="mt-8 space-y-6">
        {education.map((entry) => (
          <Card as="article" key={`${entry.institution}-${entry.field}`}>
            <h2 className="text-xl font-semibold">
              {entry.institutionUrl ? (
                <a
                  href={entry.institutionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 transition-colors duration-200 hover:text-blue-800 hover:underline active:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 dark:active:text-blue-200"
                >
                  {entry.institution}
                </a>
              ) : (
                entry.institution
              )}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {entry.degree},{' '}
              {entry.fieldUrl ? (
                <a
                  href={entry.fieldUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline transition-colors duration-200 hover:text-blue-800 active:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 dark:active:text-blue-200"
                >
                  {entry.field}
                </a>
              ) : (
                entry.field
              )}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {entry.location} · {entry.graduationDate}
            </p>
          </Card>
        ))}
      </div>
    </main>
  )
}
