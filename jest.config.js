const path = require('path')

module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  globals: {
    'ts-jest': {
      tsconfig: path.join(__dirname, 'test/tsconfig.json'),
    },
  },
  testEnvironment: 'jsdom',
  setupFiles: [
    './test/setup.ts',
  ],
  collectCoverageFrom: [
    './src/**/*',
  ],
  coverageProvider: 'v8',
}
