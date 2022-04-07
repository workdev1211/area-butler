module.exports = {
  setupFiles: [
    "<rootDir>/dotenv-config-e2e.js"
  ],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  moduleNameMapper: {
    "^@area-butler-types/(.*)$": "<rootDir>/../../shared/types/$1"
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
