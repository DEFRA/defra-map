const { defineConfig } = require('cypress')
const { configureVisualRegression } = require('cypress-visual-regression')
const webpack = require('@cypress/webpack-preprocessor')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      failSilently: false,
      type: 'actual',
      threshold: 0.01,
      thresholdType: 'percent',
      visualRegressionType: 'regression'
    },
    screenshotsFolder: './cypress/snapshots/actual',
    trashAssetsBeforeRuns: true,
    setupNodeEvents(on, config) {
      configureVisualRegression(on)
      
      // Add webpack preprocessor for e2e tests
      const options = {
        webpackOptions: require('./cypress/webpack.cypress.js'),
        watchOptions: {},
      }
      on('file:preprocessor', webpack(options))
    }
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: require('./cypress/webpack.cypress.js')
    },
    setupNodeEvents(on, config) {
      configureVisualRegression(on)
    },
    // Add component-specific visual regression settings if needed
    env: {
      failSilently: false,
      type: 'actual',
      threshold: 0.01,
      thresholdType: 'percent',
      visualRegressionType: 'regression'
    },
    screenshotsFolder: './cypress/snapshots/actual',
  }
})
