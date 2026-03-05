import { Link } from 'react-router'
import { experience } from '../data'
import Card from '../components/Card'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const driveFileId = import.meta.env.VITE_RESUME_DRIVE_ID

export default function ExperiencePage() {
  useDocumentTitle('Experience')
  return (
    <main>
      <h1 className="text-3xl font-bold">Experience</h1>

      <div className="mt-4">
        <p className="max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Backend-focused full stack developer with 10+ years of experience
          spanning data engineering, infrastructure, and application
          development. Strong background in building scalable systems,
          streamlining workflows, and integrating large datasets to support
          data-driven decision making. Adept at collaborating across
          engineering, data science, and product teams.
        </p>
        <a
          href="#resume"
          className="mt-3 inline-block text-sm text-blue-600 transition-colors duration-200 hover:text-blue-800 hover:underline active:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 dark:active:text-blue-200"
        >
          View Resume (PDF) ↓
        </a>
      </div>

      <div className="mt-8 space-y-6">
        {experience.map((job) => (
          <Card as="article" key={`${job.company}-${job.title}`}>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {job.startDate} - {job.endDate}
              </span>
            </div>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {job.company} · {job.location}
            </p>
            {job.summary && (
              <p className="mt-3 text-gray-700 dark:text-gray-300">
                {job.summary}
              </p>
            )}
            {job.projectsLink && (
              <Link
                to={job.projectsLink}
                className="mt-3 inline-block text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800 hover:underline active:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 dark:active:text-blue-200"
              >
                View my personal projects →
              </Link>
            )}
            {job.projects && (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-gray-500 italic dark:text-gray-400">
                  Highlighted projects
                </p>
                {job.projects.map((project) => (
                  <div key={project.title}>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-gray-700 dark:text-gray-300">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <section id="resume" className="mt-12 mb-8 scroll-mt-20">
        <div className="flex items-baseline gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Resume
          </h2>
          <a
            href={`https://drive.google.com/uc?export=download&id=${driveFileId}`}
            className="text-sm text-blue-600 transition-colors duration-200 hover:text-blue-800 hover:underline active:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 dark:active:text-blue-200"
          >
            Download PDF
          </a>
        </div>
        <div className="mt-4 max-w-3xl rounded-lg border border-gray-200 bg-gray-100 py-4 dark:border-gray-700 dark:bg-gray-900">
          <iframe
            src={`https://drive.google.com/file/d/${driveFileId}/preview`}
            title="Resume"
            className="aspect-[8.5/11] w-full"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </section>
    </main>
  )
}
