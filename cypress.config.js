const { defineConfig } = require('cypress')
const { configureVisualRegression } = require('cypress-visual-regression')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:6006',
    env: {
      failSilently: false,
      type: 'actual',
      threshold: 0.01,
      thresholdType: 'percent',
      visualRegressionType: 'regression',
      UPDATE_SNAPSHOTS: 'true'
    },
    screenshotsFolder: './cypress/snapshots/actual',
    // trashAssetsBeforeRuns: true,
    setupNodeEvents(on, config) {
      configureVisualRegression(on)
    }
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: require('./cypress/webpack.cypress.js')
    },
  },
})
