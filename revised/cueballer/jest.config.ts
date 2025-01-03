/** @type {import('jest').Config} */
module.exports = {
    // ... other Jest config
    testEnvironment: 'jsdom', // If you're using React or any DOM-related tests
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    // moduleNameMapper: {
    //     "^(\\.{1,2}/.*)$": "<rootDir>/$1" // Important for relative imports
    // },
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'] // Important for treating files as modules
};