describe('Soccer game', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('soccer-game-tutorial-seen', '1')
      }
    })
  })

  it('opens soccer game on button click', () => {
    cy.get('button[aria-label="Play soccer juggling game"]').click()
    cy.get('.fixed.inset-0').should('exist')
  })

  it('closes soccer game via ESC button', () => {
    cy.get('button[aria-label="Play soccer juggling game"]').click()
    cy.get('.fixed.inset-0').should('exist')
    cy.get('button[aria-label="Close game"]').first().click()
    cy.get('.fixed.inset-0').should('not.exist')
  })

  it('closes soccer game via Escape key', () => {
    cy.get('button[aria-label="Play soccer juggling game"]').click()
    cy.get('.fixed.inset-0').should('exist')
    cy.get('body').type('{esc}')
    cy.get('.fixed.inset-0').should('not.exist')
  })

  it('shows tooltip on soccer button hover', () => {
    cy.get('button[aria-label="Play soccer juggling game"]').focus()
    cy.get('[role="tooltip"]', { timeout: 6000 }).should('contain.text', 'Juggle the soccer ball!')
  })
})
