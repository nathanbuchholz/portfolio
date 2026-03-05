import type { SkillCategory } from '../types'

export const skills: SkillCategory[] = [
  {
    name: 'Languages',
    skills: ['Python', 'SQL', 'C#', 'Java', 'Groovy', 'TypeScript', 'Perl', 'Bash', 'GDScript'],
  },
  {
    name: 'Frontend',
    skills: ['React', 'Angular', 'Astro', 'Node', 'Tailwind CSS', 'Cypress', 'Selenium'],
  },
  {
    name: 'Backend',
    skills: ['Django', 'Flask', 'FastAPI', '.NET', 'REST APIs', 'GraphQL', 'pytest'],
  },
  {
    name: 'Cloud / AWS',
    skills: ['S3', 'EC2', 'ECS', 'RDS', 'CloudFormation', 'Athena', 'Glue'],
  },
  {
    name: 'IaC / DevOps',
    skills: ['Terraform', 'Docker', 'Jenkins', 'GitHub Actions', 'Git', 'Linux', 'CI/CD', 'GitHub', 'Agile', 'Microservices'],
  },
  {
    name: 'Data',
    skills: [
      'Spark',
      'Airflow',
      'Databricks',
      'dbt',
      'Hadoop',
      'Presto',
      'Trino',
      'ETL',
    ],
  },
  {
    name: 'Databases',
    skills: [
      'PostgreSQL',
      'ClickHouse',
      'Snowflake',
      'Redshift',
      'SQL Server',
      'Neo4j',
    ],
  },
  {
    name: 'Game Dev',
    skills: ['Godot', 'Unity', 'C#', 'GDScript', 'Game Design'],
  },
]
