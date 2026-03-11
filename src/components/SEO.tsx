import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router'

const SITE_NAME = 'Nathan Buchholz'
const BASE_URL = 'https://nathanbuchholz.dev'
const DEFAULT_DESCRIPTION =
  'Nathan Buchholz - Software Engineer. Portfolio showcasing projects, experience, and skills.'
const OG_IMAGE = `${BASE_URL}/og-image.png`

interface SEOProps {
  title?: string
  description?: string
}

export default function SEO({ title, description }: SEOProps) {
  const { pathname } = useLocation()
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const desc = description || DEFAULT_DESCRIPTION
  const canonical = `${BASE_URL}${pathname}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  )
}
