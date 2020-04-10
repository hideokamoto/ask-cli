const { expect } = require('chai');
const parallel = require('mocha.parallel');

const { run } = require('@test/integration/test-utils');
const skillManifest = require('@test/integration/fixtures/skill-manifest.json');

parallel('smapi command test', () => {
    const cmd = 'ask';
    const subCmd = 'smapi';
    const options = { parse: true };

    it('| should create skill for vendor', async () => {
        const args = [subCmd, 'create-skill-for-vendor', '--manifest', JSON.stringify(skillManifest)];
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should display vendor list', async () => {
        const args = [subCmd, 'get-vendor-list'];
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });
});
