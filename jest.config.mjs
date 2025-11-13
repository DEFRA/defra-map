export default {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  transform: {
    '\\.jsx?$': 'babel-jest',
    '\\.mjs$': 'babel-jest'
  },
  projects: [{
    displayName: 'unit-tests',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: ['<rootDir>/src/**/*.test.[jt]s?(x)'],
    transformIgnorePatterns: []
  }]
}