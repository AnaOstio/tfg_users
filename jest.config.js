// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',

    // only look in __tests__ at the project root
    roots: ['<rootDir>/__tests__'],

    // match *.test.ts files anywhere under __tests__
    testMatch: ['**/*.test.ts'],

    moduleFileExtensions: ['ts', 'js', 'json'],

    // if you have path aliases
    moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/src/$1',
    },
};
