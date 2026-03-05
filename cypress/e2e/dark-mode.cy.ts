describe('Dark mode', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('toggles dark mode on and off', () => {
    cy.visit('/')
    cy.get('html').should('not.have.class', 'dark')

    cy.get('button[aria-label*="Switch to"]').click()
    cy.get('html').should('have.class', 'dark')

    cy.get('button[aria-label*="Switch to"]').click()
    cy.get('html').should('not.have.class', 'dark')
  })

  it('persists dark mode across page navigation', () => {
    cy.visit('/')
    cy.get('button[aria-label*="Switch to"]').click()
    cy.get('html').should('have.class', 'dark')

    cy.contains('a', 'Experience').click()
    cy.get('html').should('have.class', 'dark')

    cy.contains('a', 'Projects').click()
    cy.get('html').should('have.class', 'dark')
  })

  it('respects localStorage preference', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('theme', 'dark')
      },
    })
    cy.get('html').should('have.class', 'dark')
  })
})
