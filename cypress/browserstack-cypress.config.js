const { defineConfig } = require('cypress')
const browserstack = require('browserstack-local')
module.exports = {
    e2e: {
      env: {
        tags: 'test',
        CLIENT_ID: "your-client-id",
        CLIENT_SECRET: "your-client-secret"
      },
      watchForFileChanges: false, // This won't run automatically when there's a change
      setupNodeEvents(on, config) {
        // implement node event listeners here
        const getCompareSnapshotsPlugin = require("cypress-image-diff-js/dist/plugin");
        getCompareSnapshotsPlugin(on, config);
      },
    },
  };
// Initialize the BrowserStack Local client
// const bsLocal = new browserstack.Local();
// module.exports = (on, config) => {
// on('after:run', () => {
// const bsLocalArgs = { key: 'pnoAaMxp4GVeCNZwFbB5', verbose: true, onlyAutomate: true, forceLocal: true,force: true}; // Replace with your BrowserStack access key
// bsLocal = new BrowserStackLocal(bsLocalArgs);
// Configuration options for BrowserStack Local
const bsLocalArgs = {
  key: 'wKiQKQMXy6v3q33hz82T', // Replace with your BrowserStack access key pnoAaMxp4GVeCNZwFbB5
  verbose: true,
  onlyAutomate: true,
  forceLocal: true,
  force: true
}
const bsLocal = new browserstack.Local(bsLocalArgs)
// Instantiate BrowserStack Local with the provided configuration options
// const bsLocal = new browserstack.Local(bsLocalArgs);
// Code to execute after all tests have finished running
// Ensure you have access to the bsLocal variable here if it's defined outside this scope
//   if (typeof bsLocal !== 'undefined') {
//     bsLocal.start(() => {
//             console.log('BrowserStack Local stopped');
//                 });
//   }
// // });
// };
// const bsLocal = new browserstack.Local();
bsLocal.start(bsLocalArgs, (error) => {
  if (error) {
    console.error('Error starting BrowserStack Local:', error)
    return
  }
  console.log('BrowserStack Local started successfully')
  // Run your Cypress tests here
})
// bsLocal.stop(function(error) {
//   if (error) {
//       console.error('Error stopping BrowserStack Local:', error);
//       return;
//   }
//   console.log('BrowserStack Local stopped successfully');
// });
// // Start BrowserStack Local
// bsLocal.start(function(error) {
//   if (error) {
//     console.error('Error starting BrowserStack Local:', error);
//   } else {
//     console.log('BrowserStack Local is running');
//     // Perform any actions that require BrowserStack Local here
//   }
// });
// module.exports = (on, config) => {
// on('before:run', () => {
//   // Code to execute before Cypress starts running tests
//   // Ensure you have access to the bsLocal variable here if it's defined outside this scope
//   if (typeof bsLocal !== 'undefined') {
//     bsLocal.start(() => {
//       console.log('BrowserStack Local started');
//     });
//   }
// });
// };