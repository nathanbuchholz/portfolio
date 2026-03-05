const pages = [
  { path: '/', name: 'Home' },
  { path: '/experience', name: 'Experience' },
  { path: '/projects', name: 'Projects' },
  { path: '/skills', name: 'Skills' },
  { path: '/education', name: 'Education' },
  { path: '/cats', name: 'Cats' },
]

describe('Accessibility', () => {
  for (const page of pages) {
    it(`${page.name} page has no a11y violations in light mode`, () => {
      cy.visit(page.path)
      cy.get('h1').should('be.visible')
      cy.injectAxe()
      cy.checkA11y()
    })

    it(`${page.name} page has no a11y violations in dark mode`, () => {
      cy.visit(page.path, {
        onBeforeLoad(win) {
          win.localStorage.setItem('theme', 'dark')
        },
      })
      cy.get('html').should('have.class', 'dark')
      cy.get('h1').should('be.visible')
      cy.injectAxe()
      cy.checkA11y()
    })
  }
})
