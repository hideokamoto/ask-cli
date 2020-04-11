const { expect } = require('chai');
const { ModelIntrospector } = require('ask-smapi-sdk');
const parallel = require('mocha.parallel');
require('module-alias/register');

const { CliCustomizationProcessor } = require('@src/commands/smapi/cli-customization-processor');
const { run, startMockServer, randomEmail } = require('./test-utils');
const skillManifest = require('./fixtures/skill-manifest.json');
const catalogUploadBody = require('./fixtures/catalog-upload.json');
const inSkillProductRequestBody = require('./fixtures/create-in-skill-product-request.json');
const accountLinkingRequest = require('./fixtures/account-linking-request.json');

const processor = new CliCustomizationProcessor();
const modelIntrospector = new ModelIntrospector();
const untestedCommands = new Set([...modelIntrospector.getOperations().keys()].map(processor.processOperationName));
const testedCommands = new Set();


const addCoveredCommand = (args) => {
    const cmd = args[1];
    if (testedCommands.has(cmd)) {
        console.warn(`${cmd} already has been covered!`);
    }
    testedCommands.add(cmd);
    untestedCommands.delete(cmd);
};

parallel('smapi mocked command test', () => {
    const cmd = 'ask';
    const subCmd = 'smapi';
    let mockServer;
    const options = { parse: true, env: { ASK_SMAPI_SERVER_BASE_URL: 'http://127.0.0.1:4010' } };
    const catalogId = 'someCatalogId';
    const skillId = 'someSkillId';
    const productId = 'someProductId';
    const vendorId = 'someVendorId';
    const stage = 'development';
    const locale = 'en-US';
    const testersEmails = `${randomEmail()},${randomEmail()}`;

    before(async () => {
        mockServer = await startMockServer();
    });

    it('| should display vendor list', async () => {
        const args = [subCmd, 'get-vendor-list'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should list skills for vendor', async () => {
        const args = [subCmd, 'list-skills-for-vendor', '--max-results', 1];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should create skill for vendor', async () => {
        const args = [subCmd, 'create-skill-for-vendor', '--manifest', JSON.stringify(skillManifest)];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get skill status', async () => {
        const args = [subCmd, 'get-skill-status', '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should display catalog list', async () => {
        const args = [subCmd, 'list-catalogs-for-vendor'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should create catalog', async () => {
        // TODO remove vendor-id
        const args = [subCmd, 'create-catalog', '--title', 'test',
            '--type', 'AMAZON.BroadcastChannel',
            '--usage', 'AlexaMusic.Catalog.BroadcastChannel', '--vendor-id', vendorId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get catalog information', async () => {
        const args = [subCmd, 'get-catalog', '-c', 'someCatalogId'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    // invalid content type trips prism
    it.skip('| should associate skill with catalog', async () => {
        const args = [subCmd, 'associate-catalog-with-skill', '-c', catalogId, '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should create catalog upload', async () => {
        const args = [subCmd, 'create-catalog-upload', '-c', catalogId, '--catalog-upload-request-body', JSON.stringify(catalogUploadBody)];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });


    it('| should display catalog list for skill', async () => {
        const args = [subCmd, 'list-catalogs-for-skill', '-s', skillId, '--max-results', 1];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should display alexa hosted skill metadata', async () => {
        const args = [subCmd, 'get-alexa-hosted-skill-metadata', '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should display utterance data', async () => {
        const args = [subCmd, 'get-utterance-data', '-s', skillId, '--locale', locale, '-g', stage, '--sort-direction', 'asc'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should add testers to beta test', async () => {
        const args = [subCmd, 'add-testers-to-beta-test', '-s', skillId, '--testers-emails', testersEmails];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get list of testers', async () => {
        const args = [subCmd, 'get-list-of-testers', '-s', skillId, '--max-results', 1];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should request feedback from testers', async () => {
        const args = [subCmd, 'request-feedback-from-testers', '-s', skillId, '--testers-emails', testersEmails];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should send reminder to testers', async () => {
        const args = [subCmd, 'send-reminder-to-testers', '-s', skillId, '--testers-emails', testersEmails];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should remove testers from beta test', async () => {
        const args = [subCmd, 'remove-testers-from-beta-test', '-s', skillId, '--testers-emails', testersEmails];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should update interaction model catalog version and return version number', async () => {
        const args = [subCmd, 'update-interaction-model-catalog-version', '-c', catalogId, '--version', 1, '--description', 'test'];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).match(/^[0-9]+\.[0-9]+\.[0-9]+/);
    });

    it('| should simulate skill', async () => {
        const args = [subCmd, 'simulate-skill', '-s', skillId, '--device-locale', locale, '-g', stage, '--input-content', 'hello'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should create beta test', async () => {
        const args = [subCmd, 'create-beta-test', '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should update beta test', async () => {
        const args = [subCmd, 'update-beta-test', '-s', skillId, '--feedback-email', 'test2@gmail.com'];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should retrieve beta test', async () => {
        const args = [subCmd, 'get-beta-test', '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should list uploads for catalog', async () => {
        const args = [subCmd, 'list-uploads-for-catalog', '-c', catalogId, '--max-results', 1];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should list isp for vendor', async () => {
        const args = [subCmd, 'get-isp-list-for-vendor', '--max-results', 1];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should list isp for skill id ', async () => {
        const args = [subCmd, 'get-isp-list-for-skill-id', '-s', skillId, '-g', stage, '--max-results', 1];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should update account linking', async () => {
        const args = [subCmd, 'update-account-linking-info', '-s', skillId, '-g', stage,
            '--account-linking-request', JSON.stringify(accountLinkingRequest)];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should retrieve account linking', async () => {
        const args = [subCmd, 'get-account-linking-info', '-s', skillId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should delete account linking', async () => {
        const args = [subCmd, 'delete-account-linking-info', '-s', skillId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should create isp', async () => {
        const args = [subCmd, 'create-isp-for-vendor', '--create-in-skill-product-request', JSON.stringify(inSkillProductRequestBody)];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get isp definition', async () => {
        const args = [subCmd, 'get-isp-definition', '--product-id', productId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should reset entitlement for product', async () => {
        const args = [subCmd, 'reset-entitlement-for-product', '--product-id', productId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get isp associated skills', async () => {
        const args = [subCmd, 'get-isp-associated-skills', '--product-id', productId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should associate isp with skill', async () => {
        const args = [subCmd, 'associate-isp-with-skill', '--product-id', productId, '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should disassociate isp with skill', async () => {
        const args = [subCmd, 'disassociate-isp-with-skill', '--product-id', productId, '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should retrieve isp summary', async () => {
        const args = [subCmd, 'get-isp-summary', '--product-id', productId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should update isp for product', async () => {
        const args = [subCmd, 'update-isp-for-product', '--product-id', productId, '-g', stage,
            '--in-skill-product', JSON.stringify(inSkillProductRequestBody)];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should delete isp for product', async () => {
        const args = [subCmd, 'delete-isp-for-product', '--product-id', productId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should create content upload', async () => {
        const args = [subCmd, 'create-content-upload', '-c', catalogId, '--number-of-upload-parts', 1];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should generate credentials for alexa hosted skill', async () => {
        const args = [subCmd, 'generate-credentials-for-alexa-hosted-skill', '-s', skillId,
            '--repository-url', 'https://git-codecommit.us-east-1.amazonaws.com/v1/repos/e9ac9d7f-5c4f-4c3b-8e41-1b347f625d95',
            '--repository-type', 'GIT'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    after(() => {
        mockServer.kill();
        // display summary
        if (process.env.DEBUG) {
            console.log(`\tCovered ${testedCommands.size} commands:`);
            console.log(`\t${Array.from(testedCommands).join('\n\t')}`);
            console.log('\n');
            console.log(`\tNot Covered ${untestedCommands.size} commands:`);
            console.log(`\t${Array.from(untestedCommands).join('\n\t')}`);
        }
    });
});
