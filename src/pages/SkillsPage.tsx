import { skills } from '../data'
import Card from '../components/Card'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function SkillsPage() {
  useDocumentTitle('Skills')
  return (
    <main>
      <h1 className="text-3xl font-bold">Skills</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {skills.map((category) => (
          <Card as="section" key={category.name}>
            <h2 className="text-lg font-semibold">{category.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
