module.exports = {
  rootDir: './',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node'
};
