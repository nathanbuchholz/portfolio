const viewports: Cypress.ViewportPreset[] = ['iphone-6', 'ipad-2', 'macbook-15']

const pages = [
  '/',
  '/experience',
  '/projects',
  '/skills',
  '/education',
  '/cats',
]

describe('Responsive rendering', () => {
  for (const viewport of viewports) {
    for (const page of pages) {
      it(`renders ${page} at ${viewport}`, () => {
        cy.viewport(viewport)
        cy.visit(page)
        cy.get('nav').should('be.visible')
        cy.get('h1').should('be.visible')
      })
    }
  }
})

describe('Mobile hamburger menu', () => {
  beforeEach(() => {
    cy.viewport('iphone-6')
    cy.visit('/')
  })

  it('shows hamburger button on mobile', () => {
    cy.get('button[aria-label="Open menu"]').should('be.visible')
  })

  it('opens menu and shows links when hamburger is clicked', () => {
    cy.get('button[aria-label="Open menu"]').click()
    cy.get('button[aria-label="Close menu"]').should('be.visible')
    // The mobile menu is the second ul inside nav (the visible one at mobile)
    cy.get('nav > ul').contains('a', 'Experience').should('be.visible')
    cy.get('nav > ul').contains('a', 'Skills').should('be.visible')
  })

  it('closes menu when a link is clicked', () => {
    cy.get('button[aria-label="Open menu"]').click()
    cy.get('nav > ul').contains('a', 'Experience').should('be.visible')
    cy.get('nav > ul').contains('a', 'Experience').click()
    cy.url().should('include', '/experience')
    // Menu should be closed - hamburger shows "Open menu" again
    cy.get('button[aria-label="Open menu"]').should('be.visible')
  })
})

describe('Desktop navigation', () => {
  it('shows links directly and hides hamburger on desktop', () => {
    cy.viewport('macbook-15')
    cy.visit('/')
    cy.get('button[aria-label="Open menu"]').should('not.be.visible')
    cy.contains('a', 'Experience').should('be.visible')
    cy.contains('a', 'Skills').should('be.visible')
  })
})
