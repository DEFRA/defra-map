describe('Visual Regression Tests', () => {
  beforeEach(() => {
    // Make sure Storybook is running on localhost:6006
    cy.visit('/')
  })

  it('should match Behaviour > buttonFirst story visually', () => {
    // Visit your specific story
    cy.visitStory('behaviour--default')
    
    // Wait for any animations or loading to complete
    cy.wait(2000)
    
    // Take a visual snapshot
    cy.compareSnapshot('behaviour--default')
  })
})