import { addCompareSnapshotCommand } from 'cypress-visual-regression/dist/command'

// Custom command to visit Storybook stories
Cypress.Commands.add('visitStory', (storyId) => {
    cy.visit(`/iframe.html?id=${storyId}`)
    // Wait for story to load
    cy.get('body').should('be.visible')
})

// compareSnapshots
addCompareSnapshotCommand()