const getCompareSnapshotsPlugin = require("cypress-image-diff-js/dist/plugin");

module.exports = {
  e2e: {
    specPattern: 'cypress/e2e/*.cy.{js,ts,jsx,tsx}',

    env: {
      tags: 'test',
      CLIENT_ID: "your-client-id",
      CLIENT_SECRET: "your-client-secret"
    },

    watchForFileChanges: false,

    setupNodeEvents(on, config) {
      // cypress-image-diff plugin
      getCompareSnapshotsPlugin(on, config);

      // Custom tasks
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });

      return config; // Important to return config
    },
  },
};