import { useState } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import ContactModal from '../components/ContactModal'
import SEO from '../components/SEO'

const socialLinkClass =
  'inline-flex items-center gap-2 text-gray-700 transition-all duration-200 hover:text-blue-600 active:scale-95 active:text-blue-800 dark:text-gray-300 dark:hover:text-blue-400 dark:active:text-blue-300'

export default function HomePage() {
  const [showContact, setShowContact] = useState(false)

  return (
    <main>
      <SEO description="Backend-focused software engineer with 10+ years of experience in data engineering, infrastructure, and application development." />
      <section className="py-12">
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
          <div className="w-32">
            <img
              src="/nathan-profile.jpg"
              alt="Nathan Buchholz"
              className="h-32 w-32 rounded-lg border-2 border-gray-200 object-cover dark:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Completing the Civilization V Chichén Itzá wonder IRL
            </p>
          </div>
          <div>
            <h1 className="text-4xl font-bold">Nathan Buchholz</h1>
            <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
              Software Engineer
            </p>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Backend-focused software engineer with 10+ years of experience in data
          engineering, infrastructure, and application development. Background
          in building data pipelines, REST APIs, and analytics platforms at
          scale. Hobbyist game developer.
        </p>
        <div className="mt-8 flex items-center gap-6">
          <a
            href="https://github.com/nathanbuchholz"
            target="_blank"
            rel="noopener noreferrer"
            className={socialLinkClass}
          >
            <FaGithub className="h-6 w-6" aria-hidden="true" />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/nathan-buchholz1/"
            target="_blank"
            rel="noopener noreferrer"
            className={socialLinkClass}
          >
            <FaLinkedin className="h-6 w-6" aria-hidden="true" />
            LinkedIn
          </a>
          <button
            onClick={() => setShowContact(true)}
            className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 active:scale-95 active:bg-blue-800"
          >
            Contact
          </button>
        </div>
      </section>
      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
    </main>
  )
}
