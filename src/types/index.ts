export interface ExperienceProject {
  title: string
  description: string
}

export interface Experience {
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  summary?: string
  projectsLink?: string
  projects?: ExperienceProject[]
}

export interface Project {
  title: string
  description: string
  tech: string[]
  repoUrl?: string
  liveUrl?: string
  liveUrlName?: string
}

export interface SkillCategory {
  name: string
  skills: string[]
}

export interface Education {
  institution: string
  institutionUrl?: string
  degree: string
  field: string
  fieldUrl?: string
  graduationDate: string
  location: string
}

export interface CatPhoto {
  src: string
  alt: string
  name: string
}
