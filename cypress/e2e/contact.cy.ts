describe('Contact Modal', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('opens modal when Contact button is clicked', () => {
    cy.contains('button', 'Contact').click()
    cy.get('dialog').should('exist')
    cy.contains('h2', 'Contact').should('be.visible')
  })

  it('fills form and submits successfully', () => {
    cy.contains('button', 'Contact').click()

    cy.get('#contact-name').type('Test User')
    cy.get('#contact-email').type('test@example.com')
    cy.get('#contact-message').type('Hello from Cypress')

    cy.intercept('POST', '/', { statusCode: 200 }).as('formSubmit')
    cy.get('button[type="submit"]').click()
    cy.wait('@formSubmit')

    cy.contains('Message sent').should('be.visible')
  })

  it('shows error on failed submission', () => {
    cy.contains('button', 'Contact').click()

    cy.get('#contact-name').type('Test User')
    cy.get('#contact-email').type('test@example.com')
    cy.get('#contact-message').type('Hello from Cypress')

    cy.intercept('POST', '/', { forceNetworkError: true }).as('formSubmit')
    cy.get('button[type="submit"]').click()

    cy.contains('Something went wrong').should('be.visible')
  })

  it('closes modal with close button', () => {
    cy.contains('button', 'Contact').click()
    cy.contains('h2', 'Contact').should('be.visible')

    cy.get('button[aria-label="Close"]').click()
    cy.get('dialog').should('not.exist')
  })
})
