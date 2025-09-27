import type { Config } from 'jest';

const config: Config = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    moduleNameMapper: {
        '^prisma/(.*)': '<rootDir>/prisma/$1',
        '^src/(.*)': '<rootDir>/src/$1',
        '^test/(.*)': '<rootDir>/test/$1',
    },
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.(t|j)s',
        '!src/**/*.module.ts',
        '!src/graphql-api/**/*.{js,ts}',
        '!src/infrastructure/**/*.{js,ts}',
        '!src/dictionary/generated/**/*.{js,ts}',
    ],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 60,
            lines: 60,
            statements: 60,
        },
    },
    coverageReporters: ['text-summary', 'lcov'],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    testTimeout: 5000,
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};

export default config;
