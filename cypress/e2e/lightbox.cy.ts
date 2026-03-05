describe('Lightbox', () => {
  beforeEach(() => {
    cy.visit('/cats')
  })

  it('opens lightbox when clicking a photo', () => {
    cy.get('main button').first().click()
    cy.get('[role="dialog"]').should('exist')
    cy.get('[role="dialog"] img').should('be.visible')
  })

  it('navigates to next photo via button', () => {
    cy.get('main button').first().click()
    cy.get('[role="dialog"]').should('exist')

    cy.get('[role="dialog"] img')
      .invoke('attr', 'alt')
      .then((firstAlt) => {
        cy.get('button[aria-label="Next photo"]').click()
        cy.get('[role="dialog"] img')
          .invoke('attr', 'alt')
          .should('not.eq', firstAlt)
      })
  })

  it('navigates to previous photo via button', () => {
    cy.get('main button').first().click()
    cy.get('[role="dialog"]').should('exist')

    // Go next then back
    cy.get('button[aria-label="Next photo"]').click()
    cy.get('[role="dialog"] img')
      .invoke('attr', 'alt')
      .then((secondAlt) => {
        cy.get('button[aria-label="Previous photo"]').click()
        cy.get('[role="dialog"] img')
          .invoke('attr', 'alt')
          .should('not.eq', secondAlt)
      })
  })

  it('navigates via arrow keys', () => {
    cy.get('main button').first().click()
    cy.get('[role="dialog"]').should('exist')

    cy.get('[role="dialog"] img')
      .invoke('attr', 'alt')
      .then((firstAlt) => {
        cy.get('body').type('{rightArrow}')
        cy.get('[role="dialog"] img')
          .invoke('attr', 'alt')
          .should('not.eq', firstAlt)
      })
  })

  it('closes via close button', () => {
    cy.get('main button').first().click()
    cy.get('[role="dialog"]').should('exist')

    cy.get('button[aria-label="Close"]').click()
    // Wait for animation
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('closes via Escape key', () => {
    cy.get('main button').first().click()
    cy.get('[role="dialog"]').should('exist')

    cy.get('body').type('{esc}')
    cy.get('[role="dialog"]').should('not.exist')
  })
})
