/** @type { import('@storybook/preact-webpack5').StorybookConfig } */

const webpack = require('webpack')
const path = require('path')

const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.scss$/, // Ensure Webpack handles .scss files
      use: ['style-loader', 'css-loader', 'sass-loader'],
    })
    return config
  },
  framework: {
    name: '@storybook/preact-webpack5',
    options: {},
  },
  staticDirs: [{ from: '../node_modules/govuk-frontend/dist/govuk/assets', to: '/assets' }]
};
export default config;
