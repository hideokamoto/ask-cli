
const { expect } = require('chai');
const { run, KeySymbol, resetTempDirectory, getPathInTempDirectory } = require('@test/integration/test-utils');

describe('new and deploy commands test', () => {
    const folderName = 'some-skill-folder';
    let cmd;

    beforeEach(() => {
        cmd = 'ask';
        resetTempDirectory();
    });

    it('| should set up and deploy hosted skill', async () => {
        // new
        let args = ['new'];
        const inputs = [
            { match: '? Choose the programming language' },
            { match: '? Choose a method to host your skill' },
            { match: '? Please type in your skill name' },
            { match: '? Please type in your folder name', input: folderName }
        ];

        let result = await run(cmd, args, { inputs });

        expect(result).include('Hosted skill provisioning finished');

        // deploy
        const cwd = getPathInTempDirectory(folderName);
        cmd = 'git';
        args = ['add', '.'];
        await run(cmd, args, { cwd });

        args = ['commit', '-m', '"test"'];
        await run(cmd, args, { cwd });

        args = ['push'];
        result = await run(cmd, args, { cwd });

        expect(result).include('After the code pushed, please check the deployment status');
    });

    it('| should set up and deploy skill with cloud formation deployer', async () => {
        // new
        let args = ['new'];
        const inputs = [
            { match: '? Choose the programming language' },
            { match: '? Choose a method to host your skill', input: KeySymbol.DOWN },
            { match: '? Choose a template to start with' },
            { match: '? Please type in your skill name' },
            { match: '? Please type in your folder name', input: folderName }
        ];

        let result = await run(cmd, args, { inputs });

        expect(result).include('Project initialized with deploy delegate "@ask-cli/cfn-deployer" successfully');

        // deploy
        const cwd = getPathInTempDirectory(folderName);
        args = ['deploy'];

        result = await run(cmd, args, { cwd });

        expect(result).include('Skill infrastructures deployed successfully through @ask-cli/cfn-deployer');
    });

    it('| should set up and deploy skill with lambda deployer', async () => {
        // new
        let args = ['new'];
        const inputs = [
            { match: '? Choose the programming language' },
            { match: '? Choose a method to host your skill', input: `${KeySymbol.DOWN}${KeySymbol.DOWN}` },
            { match: '? Choose a template to start with' },
            { match: '? Please type in your skill name' },
            { match: '? Please type in your folder name', input: folderName }
        ];

        let result = await run(cmd, args, { inputs });

        expect(result).include('Project initialized with deploy delegate "@ask-cli/lambda-deployer" successfully');

        // deploy
        const cwd = getPathInTempDirectory(folderName);
        args = ['deploy'];

        result = await run(cmd, args, { cwd });

        expect(result).include('Skill infrastructures deployed successfully through @ask-cli/lambda-deployer');
    });
});
