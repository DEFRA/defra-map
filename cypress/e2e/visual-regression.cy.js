describe('Visual Regression Tests', () => {
  // beforeEach(() => {
  //   // Make sure Storybook is running on localhost:6006
  //   cy.visit('/')
  // })

  // it('should match Behaviour > buttonFirst story visually', () => {
  //   // Visit your specific story
  //   cy.visitStory('behaviour--default')
    
  //   // Wait for any animations or loading to complete
  //   cy.wait(2000)
    
  //   // Take a visual snapshot
  //   cy.compareSnapshot('behaviour--default')
  // })
  describe('Visual Regression Tests', () => {
    it('should visually match flagged stories', () => {
      cy.request('http://localhost:6006/index.json').then((response) => {
        const allStories = response.body.entries
        
        // Debug: log all stories first
        cy.log('Total stories found:', Object.keys(allStories).length)
        
        const visualTestStories = Object.values(allStories).filter((story) => {
          const hasVisualTestTag = story.tags && story.tags.includes('visual-test')
          cy.log(`Story ${story.id}: tags=${JSON.stringify(story.tags)}, hasVisualTestTag=${hasVisualTestTag}`)
          return hasVisualTestTag
        })
        
        cy.log('Visual test stories found:', visualTestStories.length)
        
        if (visualTestStories.length === 0) {
          throw new Error('No stories with visual-test tag found')
        }
        
        visualTestStories.forEach((story) => {
          cy.log(`Processing story: ${story.id}`)
          cy.visitStory(story.id)
          cy.wait(1000)
          cy.compareSnapshot(story.id)
        })
      })
    })
  })
})