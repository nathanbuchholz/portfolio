describe('Page content', () => {
  it('Home page has profile content and contact links', () => {
    cy.visit('/')
    cy.contains('Nathan Buchholz')
    cy.contains('Software Engineer')
    cy.get('a[href*="github.com"]').should('exist')
    cy.get('a[href*="linkedin.com"]').should('exist')
    cy.contains('button', 'Contact').should('exist')
  })

  it('Experience page shows job entries', () => {
    cy.visit('/experience')
    cy.contains('h1', 'Experience')
    cy.contains('Comscore')
    cy.contains('Software Engineer II')
  })

  it('Projects page shows project cards', () => {
    cy.visit('/projects')
    cy.contains('h1', 'Projects')
    cy.contains('Soccer Management Sim')
    cy.contains('Portfolio Site')
  })

  it('Skills page shows skill categories', () => {
    cy.visit('/skills')
    cy.contains('h1', 'Skills')
    cy.contains('Languages')
    cy.contains('Python')
    cy.contains('Cloud / AWS')
  })

  it('Education page shows entries', () => {
    cy.visit('/education')
    cy.contains('h1', 'Education')
    cy.contains('Portland State University')
    cy.contains('University of Washington')
  })

  it('Cats page shows photo gallery', () => {
    cy.visit('/cats')
    cy.contains('h1', 'Cats')
    cy.get('img').should('have.length.at.least', 1)
  })

  it('Unknown route shows 404 page', () => {
    cy.visit('/nonexistent', { failOnStatusCode: false })
    cy.contains('h1', '404')
    cy.contains("This page doesn't exist.")
    cy.contains('a', 'Back to home').should('have.attr', 'href', '/')
  })
})
