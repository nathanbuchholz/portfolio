import type { Experience } from '../types'

export const experience: Experience[] = [
  {
    title: 'Independent & Freelance Developer',
    company: 'Self-Employed',
    location: 'Portland, OR',
    startDate: '2025',
    endDate: 'Present',
    summary:
      'Building a soccer manager simulation game in Godot, modeling the complex world of soccer, including realistic flow of players and demographics, web development, and freelance work. Building personal projects to deepen expertise in systems design, UI architecture, and full stack development.',
    projectsLink: '/projects',
  },
  {
    title: 'Software Engineer II',
    company: 'Comscore',
    location: 'Portland, OR',
    startDate: '2021',
    endDate: '2024',
    projects: [
      {
        title: 'On-prem to AWS Migration',
        description:
          "Served on a dedicated team responsible for migrating the company's core data infrastructure from an on-prem Perl stack with custom distributed processing to a modern AWS environment using Java, Airflow, and Spark. Contributed to decisions on API design, testing standards, and service structure that guided how the new platform was built.",
      },
      {
        title: 'Django REST API',
        description:
          'Built a Python Django REST API from the ground up for complex query workflows in a modern AWS environment. Designed the service layer for testability with isolated services, deterministic test data, and automated unit and integration tests. Implemented a compatibility layer for a legacy Postgres 9.6/CentOS 6 system to bridge old and new infrastructure.',
      },
      {
        title: 'ClickHouse Analytics API',
        description:
          'Designed and tested a Python API over ClickHouse for large-scale aggregation and joins of TV event and demographic data. Used deterministic fixtures, query-level validation, and automated regression tests to ensure correctness at trillion-record scale. Partnered with Data Science teams to produce analytics-ready datasets from trillions of raw records.',
      },
      {
        title: 'Ad Data Nationalization',
        description:
          'Designed and implemented the nationalization logic for a TV schedule dataset using Java and Spark, solving the problem of creating a single national broadcast schedule from hundreds of market-level schedules with overlapping and conflicting data. Defined rules for when local market differences should override national defaults and handled edge cases where no clear precedent existed. The resulting dataset supported contracts with Amazon and was consumed by data science teams for extrapolation and projection models.',
      },
      {
        title: 'Data Pipelines & CI',
        description:
          'Authored and maintained Airflow DAGs to orchestrate data ingestion, transformation, and validation workflows. Built and owned a Jenkins-based CI pipeline using CloudFormation that enforced automated unit, integration, and regression test gates, deployed to isolated test environments, and surfaced failures early while controlling AWS costs. Optimized pipeline runtime from over one hour to 20 minutes by parallelizing tests and removing unnecessary Docker image rebuilds. Led the upgrade of a legacy Java 8 application to Java 17 with zero downtime.',
      },
      {
        title: 'Data Monitoring Platform',
        description:
          "Expanded the platform's user base to support new teams and use cases, optimized performance, and authored comprehensive documentation to lead the handoff to an overseas engineering team.",
      },
    ],
  },
  {
    title: 'Software Engineer I',
    company: 'Comscore',
    location: 'Portland, OR',
    startDate: '2019',
    endDate: '2021',
    projects: [
      {
        title: 'Data Analysis Platform',
        description:
          'Developed a new cloud-based Angular product supporting data analysis teams. Worked across the full stack to deliver features that helped analysts work more efficiently with large datasets.',
      },
      {
        title: 'BI Tools',
        description:
          'Continued development on a custom Redash instance, providing new features to a business intelligence platform. Created dashboards and alerts to serve internal teams and alert stakeholders to critical data issues. Provided documentation and support to train users on how to self serve and retrieve their own data.',
      },
      {
        title: 'TV Ratings Aggregation',
        description:
          "Maintained and improved a large-scale Perl ETL pipeline running on a custom distributed processing framework, an early predecessor to container orchestration systems like Kubernetes. The pipeline produced the company's main client-facing TV ratings reports by combining demographic, schedule, and advertising data. Participated in a 24/7 on-call rotation to debug and resolve production issues under tight SLAs.",
      },
      {
        title: 'Data Monitoring Platform',
        description:
          "Expanded the platform to approximately 50 analytical views with CRUD workflows for tracking and resolving data anomalies. Integrated additional internal and third-party data sources. Managed a 3-person team's kanban board, refined tickets, and served as liaison between stakeholders and engineers.",
      },
      {
        title: 'SQL and Python Training',
        description:
          'Organized and led a weekly lunch meeting to teach SQL and Python to data entry specialists and data analysts. The sessions focused on practical skills to help colleagues automate repetitive work and engage more directly with the data they handled every day.',
      },
    ],
  },
  {
    title: 'Data Analyst & Team Lead',
    company: 'Comscore',
    location: 'Portland, OR',
    startDate: '2014',
    endDate: '2018',
    projects: [
      {
        title: 'Data Monitoring Platform',
        description:
          'Created a web application using Angular, Flask, and PostgreSQL to monitor fluctuations in millions of data rows, saving a team of 15 over 40 hours per week each.',
      },
      {
        title: 'Workflow Tracking Tool',
        description:
          'Designed and built a tracking tool using VBA in Microsoft Access to provide workflow improvements for the team.',
      },
      {
        title: 'Team Leadership',
        description:
          'Led a team of 10-14 people, assigning tasks and managing workflows across client deliverables. Onboarded clients and served as a liaison between internal teams and client-facing staff. Also acted as QA for front-end developers, validating new features and debugging UI issues.',
      },
    ],
  },
]
