/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

const path = require('path');

/**  @type {import('ts-jest').JestConfigWithTsJest}  */
module.exports = {
    moduleNameMapper: {
        '@fluentui/react': '<rootDir>/node_modules/@fluentui/react',
        '@fluentui/date-time-utilities/(.*)': '<rootDir>/node_modules/@fluentui/date-time-utilities/$1',
    },
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        // transform files with ts-jest
        '^.+\\.(jsx?|tsx?)$': [
            'ts-jest',
            {
                tsconfig: {
                    // allow js in typescript
                    allowJs: true,
                },
            },
        ],
    },
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['<rootDir>/__tests__/**/*.[jt]s?(x)', '<rootDir>/?(*.)+(spec|test).[jt]s?(x)'],
    setupFiles: [path.resolve(path.join(__dirname, 'setup-tests.ts'))],
    coverageReporters: ['cobertura', 'lcov', 'text', 'html'],
};
