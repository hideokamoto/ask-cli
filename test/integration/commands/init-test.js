
const { expect } = require('chai');
const parallel = require('mocha.parallel');
const { HOSTED_SKILL_ID } = require('@test/integration/test-constants');
const { run, resetTempDirectory, makeFolderInTempDirectory, getPathInTempDirectory } = require('@test/integration/test-utils');

parallel('init command test', () => {
    const cmd = 'ask';
    const subCmd = 'init';
    before(() => {
        resetTempDirectory();
    });

    it('| should init hosted skill', async () => {
        const folderName = 'hosted-skill';
        const args = [subCmd, '--hosted-skill-id', HOSTED_SKILL_ID];
        const inputs = [
            { match: '? Please type in your folder name', input: folderName }
        ];

        const result = await run(cmd, args, { inputs });

        expect(result).include('successfully initialized');
    });

    it('| should init new skill', async () => {
        const folderName = 'new-skill';
        makeFolderInTempDirectory(`${folderName}/skill-package`);
        makeFolderInTempDirectory(`${folderName}/lambda`);

        const cwd = getPathInTempDirectory(folderName);

        const args = [subCmd];
        const inputs = [
            { match: '? Skill Id' },
            { match: '? Skill package path' },
            { match: '? Lambda code path' },
            { match: '? Use AWS CloudFormation', input: 'n' },
            { match: '? Lambda runtime' },
            { match: '? Lambda handler' },
            { match: '? Does this look correct?' }
        ];

        const result = await run(cmd, args, { inputs, cwd });

        expect(result).include('succeeded');
    });
});
