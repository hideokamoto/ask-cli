require('module-alias/register');

[
    '@test/integration/commands/init-test.js',
    '@test/integration/commands/new-and-deploy-test.js',
    '@test/integration/commands/smapi-test.js',
// eslint-disable-next-line global-require
].forEach((testFile) => require(testFile));
