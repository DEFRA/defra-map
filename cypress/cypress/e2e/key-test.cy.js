   
  
  describe('FMC-185 As a user, I need to see a key of map features so that I quickly understand the map symbology.', () => {
    it('Scenario 1 - ky20 - Displayed as a ‘panel’ overlay. and ky30 - All features who’s corresponding ‘layer’ has been activated are shown.', () => {
      cy.visit('http://localhost:3000/planning.html')
      cy.wait(4500)
      cy.compareSnapshot(Cypress.env('tags') + 'ky20 and ky30 Key Evidence')
    })
    it('Scenario 2 - ky10 and ky60- Visible when activated by the corresponding ‘key button’.', () => {
        cy.visit('http://localhost:3000/planning.html')
        //click on X to close the key overlay panel
        cy.get('.fm-c-panel__header > .fm-c-btn').click()
        cy.wait(4500)
        cy.compareSnapshot(Cypress.env('tags') + 'ky10 and ky60 Key Evidence')
      })
      it('Scenario 3 - ky30,ky50,ky40, and ky70- All features who’s corresponding ‘layer’ has been activated are shown.', () => {
        cy.visit('http://localhost:3000/planning.html')
        //click on Dataset Show panel
        cy.get('#map-panel-legend > div.fm-c-panel__body > div.fm-c-segments > button > span.fm-c-details__toggle').click()
        cy.wait(4500)
        cy.compareSnapshot(Cypress.env('tags') + 'ky30 ky40, ky50 and ky70 Key Evidence')
      })
      it('Scenario 3a - ky30,ky50,and ky70 - All features who’s corresponding ‘layer’ has been activated are shown.', () => {
        cy.visit('http://localhost:3000/planning.html')
        cy.get('#map-panel-legend > div.fm-c-panel__body > div.fm-c-segments > button > span.fm-c-details__toggle').click()
        cy.wait(1000)
        cy.get(':nth-child(2) > .fm-c-segments__label').dblclick()
        cy.wait(4500)
        cy.compareSnapshot(Cypress.env('tags') + 'ky30a ky50 and ky70 Key Evidence')
      })
      it('Scenario 3b - ky30,ky50,and ky70  - All features who’s corresponding ‘layer’ has been activated are shown.', () => {
        cy.visit('http://localhost:3000/planning.html')
        cy.get('#map-panel-legend > div.fm-c-panel__body > div.fm-c-segments > button > span.fm-c-details__toggle').click()
        cy.wait(1000)
        cy.get(':nth-child(3) > .fm-c-segments__label').dblclick()
        cy.wait(4500)
        cy.compareSnapshot(Cypress.env('tags') + 'ky30b ky50 and ky70 Key Evidence')
      })
      it('Scenario 3c -ky30,ky50,and ky70  - All features who’s corresponding ‘layer’ has been activated are shown.', () => {
        cy.visit('http://localhost:3000/planning.html')
        cy.get('#map-panel-legend > div.fm-c-panel__body > div.fm-c-segments > button > span.fm-c-details__toggle').click()
        cy.wait(1000)
        cy.get(':nth-child(4) > .fm-c-segments__label').dblclick()
        cy.wait(4500)
        cy.compareSnapshot(Cypress.env('tags') + 'ky30c, ky50 and ky70 Key Evidence')
      })
      it('Scenario 3d - ky73 - No features show text.', () => {
        cy.visit('http://localhost:3000/planning.html')
        cy.get('#map-panel-legend > div.fm-c-panel__body > div.fm-c-segments > button > span.fm-c-details__toggle').click()
        cy.wait(1000)
        cy.get(':nth-child(5) > .fm-c-segments__label').dblclick()
        cy.wait(4500)
        cy.compareSnapshot(Cypress.env('tags') + 'ky73 Key Evidence')
      })

      it('Scenario 4 - ky45 - Features, who’s display cannot be toggled are shown.', () => {
        cy.visit('http://localhost:3000/planning.html')
        //click on feature show 
        // cy.get('.fm-c-layers__heading > .fm-c-details > .fm-c-details__toggle > .fm-c-details__toggle-focus').click()
        cy.get('#map-key > div > button > span.fm-c-details__toggle > span').click()
        cy.wait(2000)
        cy.get('#content-l0 > div:nth-child(1) > button > span').click()
        cy.wait(4500)
        cy.compareSnapshot(Cypress.env('tags') + 'ky45 Key Evidence')
      })

      it('Scenario 4a - ky45 - Features, who’s display cannot be toggled are shown.', () => {
        cy.visit('http://localhost:3000/planning.html')
        cy.get('#map-key > div > button > span.fm-c-details__toggle > span').click()
        cy.wait(1000)
        cy.get('#content-l0 > div:nth-child(2) > button > span').click()
        cy.wait(4500)
        cy.compareSnapshot(Cypress.env('tags') + 'ky45a Key Evidence')
      })
      it('Scenario 4b - ky70 and ky76 - ‘Icon’ and ‘fills’ correspond to the basemap type if variants are provided through [legend.key] configuration.', () => {
        cy.visit('http://localhost:3000/planning.html')
        cy.get('#map-key > div > button > span.fm-c-details__toggle > span').click()
        cy.wait(1000)
        cy.get('#content-l0 > div:nth-child(2) > button > span').click()
        cy.get('#content-l0 > div:nth-child(1) > button > span').click()
        cy.wait(4500)
        cy.compareSnapshot(Cypress.env('tags') + 'ky70 Key Evidence')
      })
})

