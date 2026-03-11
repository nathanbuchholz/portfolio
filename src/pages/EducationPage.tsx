import { education } from '../data'
import Card from '../components/Card'
import TextLink from '../components/TextLink'
import SEO from '../components/SEO'

export default function EducationPage() {
  return (
    <main>
      <SEO
        title="Education"
        description="Educational background for Nathan Buchholz, including degrees and fields of study."
      />
      <h1 className="text-3xl font-bold">Education</h1>
      <div className="mt-8 space-y-6">
        {education.map((entry) => (
          <Card as="article" key={`${entry.institution}-${entry.field}`}>
            <h2 className="text-xl font-semibold">
              {entry.institutionUrl ? (
                <TextLink href={entry.institutionUrl}>
                  {entry.institution}
                </TextLink>
              ) : (
                entry.institution
              )}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {entry.degree},{' '}
              {entry.fieldUrl ? (
                <TextLink href={entry.fieldUrl} className="underline">
                  {entry.field}
                </TextLink>
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
