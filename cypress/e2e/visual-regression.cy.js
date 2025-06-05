describe('Visual Regression Tests: Zoom', () => {
  beforeEach(() => {
    // Make sure Storybook is running on localhost:6006
    cy.visit('/')
  })

  it('should hide zoom buttons on mobile', () => {
    // Set viewport to mobile
    cy.viewport('iphone-6')
    cy.visitStory('zoom--index')
    cy.wait(2000)
    cy.compareSnapshot('iphone-6-zoom--index')
  })

  it('should disable zoom in button', () => {
    cy.visitStory('zoom--index')
    cy.wait(2000)
    // Requires two clicks with in test scenario
    cy.get('.fm-c-btn--zoom-in').click()
    cy.wait(500)
    cy.get('.fm-c-btn--zoom-in').click()
    cy.wait(500)
    cy.compareSnapshot('zoom--max-zoom')
  })
})