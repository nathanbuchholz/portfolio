import { projects } from '../data'
import Card from '../components/Card'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function ProjectsPage() {
  useDocumentTitle('Projects')

  return (
    <main>
      <h1 className="text-3xl font-bold">Projects</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <Card as="article" key={project.title}>
            <h2 className="text-lg font-semibold">{project.title}</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {t}
                </span>
              ))}
            </div>
            {(project.repoUrl || project.liveUrl) && (
              <div className="mt-4 flex gap-4">
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 transition-colors duration-200 hover:text-blue-800 hover:underline active:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 dark:active:text-blue-200"
                  >
                    Repository
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 transition-colors duration-200 hover:text-blue-800 hover:underline active:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 dark:active:text-blue-200"
                  >
                    {project.liveUrlName ?? 'Live Site'}
                  </a>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </main>
  )
}
