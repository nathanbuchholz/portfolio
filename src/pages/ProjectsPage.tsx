import { projects } from '../data'
import Card from '../components/Card'
import TextLink from '../components/TextLink'
import SEO from '../components/SEO'

export default function ProjectsPage() {
  return (
    <main>
      <SEO
        title="Projects"
        description="Portfolio projects showcasing expertise in data pipelines, APIs, and full-stack development."
      />
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
                  <TextLink href={project.repoUrl} className="text-sm">
                    Repository
                  </TextLink>
                )}
                {project.liveUrl && (
                  <TextLink href={project.liveUrl} className="text-sm">
                    {project.liveUrlName ?? 'Live Site'}
                  </TextLink>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </main>
  )
}
