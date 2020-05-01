module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.spec?\\.ts$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node']
}