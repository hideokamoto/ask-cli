
const { expect } = require('chai');
const { HOSTED_SKILL_ID } = require('@test/integration/test-constants');
const { run, resetTempDirectory, makeFolderInTempDirectory } = require('@test/integration/test-utils');

describe('init command test', () => {
    const cmd = 'ask';
    const subCmd = 'init';
    beforeEach(() => {
        resetTempDirectory();
    });

    it('| should init hosted skill', async () => {
        const args = [subCmd, '--hosted-skill-id', HOSTED_SKILL_ID];
        const inputs = [
            { match: '? Please type in your folder name' }
        ];

        const result = await run(cmd, args, { inputs });

        expect(result).include('successfully initialized');
    });

    it('| should init new skill', async () => {
        makeFolderInTempDirectory('skill-package');
        makeFolderInTempDirectory('lambda');

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

        const result = await run(cmd, args, { inputs });

        expect(result).include('succeeded');
    });
});
