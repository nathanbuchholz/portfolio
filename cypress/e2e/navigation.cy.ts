describe('Navigation', () => {
  it('navigates to all 6 pages', () => {
    cy.visit('/')
    cy.contains('Nathan Buchholz')

    cy.contains('a', 'Experience').click()
    cy.url().should('include', '/experience')
    cy.contains('h1', 'Experience')

    cy.contains('a', 'Projects').click()
    cy.url().should('include', '/projects')
    cy.contains('h1', 'Projects')

    cy.contains('a', 'Skills').click()
    cy.url().should('include', '/skills')
    cy.contains('h1', 'Skills')

    cy.contains('a', 'Education').click()
    cy.url().should('include', '/education')
    cy.contains('h1', 'Education')

    cy.contains('a', 'Cats').click()
    cy.url().should('include', '/cats')
    cy.contains('h1', 'Cats')

    cy.contains('a', 'Home').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.contains('Nathan Buchholz')
  })
})
