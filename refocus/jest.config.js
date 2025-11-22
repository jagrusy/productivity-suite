module.exports = {
    setupFilesAfterEnv: ['./jest.setup.js'],
    testEnvironment: 'jsdom',
    testMatch: ['**/tests/**/*.test.js'],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
};
