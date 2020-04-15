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
const interactionModel = require('./fixtures/interaction-model.json');

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
    const location = 'US';
    const uploadId = 'someUploadId';
    const subscriberId = 'someSubscriberId';
    const subscriptionId = 'someSubscriptionId';
    const updateRequestId = 'someUpdateRequestId';
    const version = '2.0.0';
    const simulationId = 'someSimulationId';
    const slotTypeId = 'someSlotTypeId';
    const slotType = JSON.stringify({
        slotType: {
            name: 'string',
            description: 'string'
        },
        vendorId: 'string'
    });
    const sslCertificatePayload = JSON.stringify({
        sslCertificate: 'string',
        regions: {
            additionalProp1: {
                sslCertificate: 'string'
            },
            additionalProp2: {
                sslCertificate: 'string'
            },
            additionalProp3: {
                sslCertificate: 'string'
            }
        }
    });
    const partETags = JSON.stringify([{ eTag: 'someEtag', partNumber: 1 }]);
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
        expect(result).include('Command executed successfully!');
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


    it('| should get content upload by id', async () => {
        const args = [subCmd, 'get-content-upload-by-id', '-c', catalogId, '--upload-id', uploadId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should complete catalog upload', async () => {
        const args = [subCmd, 'complete-catalog-upload', '-c', catalogId, '--upload-id', uploadId, '--part-e-tags', partETags];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should list subscribers for development events', async () => {
        const args = [subCmd, 'list-subscribers-for-development-events'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should create subscriber for development events', async () => {
        const args = [subCmd, 'create-subscriber-for-development-events'];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get subscriber for development events', async () => {
        const args = [subCmd, 'get-subscriber-for-development-events', '--subscriber-id', subscriberId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should set subscriber for development events', async () => {
        const args = [subCmd, 'set-subscriber-for-development-events', '--subscriber-id', subscriberId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should delete subscriber for development events', async () => {
        const args = [subCmd, 'delete-subscriber-for-development-events', '--subscriber-id', subscriberId];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should list subscriptions for development events', async () => {
        const args = [subCmd, 'list-subscriptions-for-development-events'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should create subscription for development events', async () => {
        const args = [subCmd, 'create-subscription-for-development-events'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get subscription for development events', async () => {
        const args = [subCmd, 'get-subscription-for-development-events', '--subscription-id', subscriptionId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should set subscription for development events', async () => {
        const args = [subCmd, 'set-subscription-for-development-events', '--subscription-id', subscriptionId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should delete subscription for development events', async () => {
        const args = [subCmd, 'delete-subscription-for-development-events', '--subscription-id', subscriptionId];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should generate catalog upload url', async () => {
        const args = [subCmd, 'generate-catalog-upload-url', '-c', catalogId, '--number-of-upload-parts', 1];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should associate isp with skill', async () => {
        const args = [subCmd, 'associate-isp-with-skill', '--product-id', productId, '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get alexa hosted skill user permissions', async () => {
        const args = [subCmd, 'get-alexa-hosted-skill-user-permissions', '--permission', 'somePermission'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should start beta test', async () => {
        const args = [subCmd, 'start-beta-test', '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should end beta test', async () => {
        const args = [subCmd, 'end-beta-test', '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get certifications list', async () => {
        const args = [subCmd, 'get-certifications-list', '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get certification review', async () => {
        const args = [subCmd, 'get-certification-review', '-s', skillId, '-c', catalogId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get skill enablement status', async () => {
        const args = [subCmd, 'get-skill-enablement-status', '-s', skillId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it.skip('| should set skill enablement', async () => {
        const args = [subCmd, 'set-skill-enablement', '-s', skillId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should delete skill enablement', async () => {
        const args = [subCmd, 'delete-skill-enablement', '-s', skillId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should profile nlu', async () => {
        const args = [subCmd, 'profile-nlu', '-u', 'test', '--multi-turn-token', 'someToken', '-s', skillId, '-g', stage, '-l', locale];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get interaction model', async () => {
        const args = [subCmd, 'get-interaction-model', '-s', skillId, '-g', stage, '-l', locale];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get interaction model metadata', async () => {
        const args = [subCmd, 'get-interaction-model-metadata', '-s', skillId, '-g', stage, '-l', locale];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should set interaction model', async () => {
        const args = [subCmd, 'set-interaction-model', '-s', skillId, '-g',
            stage, '-l', locale, '--interaction-model', JSON.stringify(interactionModel)];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should list interaction model catalogs', async () => {
        const args = [subCmd, 'list-interaction-model-catalogs'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should create interaction model catalog', async () => {
        const args = [subCmd, 'create-interaction-model-catalog', '--vendor-id', vendorId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get interaction model catalog definition', async () => {
        const args = [subCmd, 'get-interaction-model-catalog-definition', '-c', catalogId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should delete interaction model catalog', async () => {
        const args = [subCmd, 'delete-interaction-model-catalog', '-c', catalogId];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get interaction model catalog update status', async () => {
        const args = [subCmd, 'get-interaction-model-catalog-update-status', '-c', catalogId, '--update-request-id', updateRequestId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should update interaction model catalog', async () => {
        // TODO --slot-type-description should be mandatory
        const args = [subCmd, 'update-interaction-model-catalog', '-c', catalogId, '--slot-type-description', 'someDescription'];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should create interaction model catalog version', async () => {
        const args = [subCmd, 'create-interaction-model-catalog-version', '-c', catalogId, '--description', 'someDescription'];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get interaction model catalog version', async () => {
        const args = [subCmd, 'get-interaction-model-catalog-version', '-c', catalogId, '--version', version];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should delete interaction model catalog version', async () => {
        const args = [subCmd, 'delete-interaction-model-catalog-version', '-c', catalogId, '--version', version];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get interaction model catalog values', async () => {
        const args = [subCmd, 'get-interaction-model-catalog-values', '-c', catalogId, '--version', version];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get interaction model version', async () => {
        const args = [subCmd, 'get-interaction-model-version', '-s', skillId, '-g', stage, '-l', locale, '--version', version];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should list interaction model versions', async () => {
        const args = [subCmd, 'list-interaction-model-versions', '-s', skillId, '-g', stage, '-l', locale];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should list interaction model slot types', async () => {
        const args = [subCmd, 'list-interaction-model-slot-types'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should create interaction model slot type', async () => {
        const args = [subCmd, 'create-interaction-model-slot-type', '--slot-type', slotType];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get interaction model slot type definition', async () => {
        const args = [subCmd, 'get-interaction-model-slot-type-definition', '--slot-type-id', slotTypeId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should delete interaction model slot type', async () => {
        const args = [subCmd, 'delete-interaction-model-slot-type', '--slot-type-id', slotTypeId];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get interaction model slot type build status', async () => {
        const args = [subCmd, 'get-interaction-model-slot-type-build-status', '--slot-type-id', slotTypeId, '--update-request-id', updateRequestId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should update interaction model slot type', async () => {
        // TODO --slot-type-description needs to be required
        const args = [subCmd, 'update-interaction-model-slot-type', '--slot-type-id', slotTypeId, '--slot-type-description', 'someDescription'];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should list interaction model slot type versions', async () => {
        const args = [subCmd, 'list-interaction-model-slot-type-versions', '--slot-type-id', slotTypeId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should create interaction model slot type version', async () => {
        const args = [subCmd, 'create-interaction-model-slot-type-version', '--slot-type-id', slotTypeId, '--slot-type', slotType];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get interaction model slot type version', async () => {
        const args = [subCmd, 'get-interaction-model-slot-type-version', '--slot-type-id', slotTypeId, '--version', version];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should delete interaction model slot type version', async () => {
        const args = [subCmd, 'delete-interaction-model-slot-type-version', '--slot-type-id', slotTypeId, '--version', version];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should update interaction model slot type version', async () => {
        const args = [subCmd, 'update-interaction-model-slot-type-version', '--slot-type-id', slotTypeId, '--version', version,
            '--slot-type-description', 'someDescription'
        ];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get skill manifest', async () => {
        const args = [subCmd, 'get-skill-manifest', '-s', skillId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should update skill manifest', async () => {
        const args = [subCmd, 'update-skill-manifest', '-s', skillId, '-g', stage, '--manifest', JSON.stringify(skillManifest)];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    // TODO look into it - content type most likely
    it.skip('| should get skill metrics', async () => {
        const args = [subCmd, 'get-skill-metrics', '-s', skillId, '--start-time', ' 2017-07-21T17:32:28Z',
            '--end-time', ' 2017-07-21T17:32:28Z', '--period', 'P3', '--metric', 'someMetric', '-g', stage, '--skill-type', 'smartHome'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should set private distribution account id', async () => {
        const args = [subCmd, 'set-private-distribution-account-id', '-s', skillId, '-g', stage, '--id', 'someId'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should delete private distribution account id', async () => {
        const args = [subCmd, 'delete-private-distribution-account-id', '-s', skillId, '-g', stage, '--id', 'someId'];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should list private distribution accounts', async () => {
        const args = [subCmd, 'list-private-distribution-accounts', '-s', skillId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get skill simulation', async () => {
        const args = [subCmd, 'get-skill-simulation', '-s', skillId, '-g', stage, '-i', simulationId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should submit skill validation', async () => {
        const args = [subCmd, 'submit-skill-validation', '-l', locale, '-s', skillId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get skill validations', async () => {
        const args = [subCmd, 'get-skill-validations', '-s', skillId, '-i', simulationId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should delete skill', async () => {
        const args = [subCmd, 'delete-skill', '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get ssl certificates', async () => {
        const args = [subCmd, 'get-ssl-certificates', '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should set ssl certificates', async () => {
        const args = [subCmd, 'set-ssl-certificates', '-s', skillId, '--ssl-certificate-payload', sslCertificatePayload];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it.skip('| should submit skill for certification', async () => {
        const args = [subCmd, 'submit-skill-for-certification', '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should withdraw skill from certification', async () => {
        const args = [subCmd, 'withdraw-skill-from-certification', '-s', skillId, '--message', 'someMessage'];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it.skip('| should create export request for skill', async () => {
        const args = [subCmd, 'create-export-request-for-skill', '-s', skillId, '-g', stage];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should get status of export request', async () => {
        const args = [subCmd, 'get-status-of-export-request', '--export-id', 'someExportId'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should create skill package', async () => {
        const args = [subCmd, 'create-skill-package', '--vendor-id', vendorId, '--location', location];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should import skill package', async () => {
        const args = [subCmd, 'import-skill-package', '--location', location, '-s', skillId];
        addCoveredCommand(args);
        const result = await run(cmd, args, { ...options, parse: false });
        expect(result).include('Command executed successfully!');
    });

    it('| should get import status', async () => {
        const args = [subCmd, 'get-import-status', '--import-id', 'someImportId'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it.skip('| should create upload url', async () => {
        const args = [subCmd, 'create-upload-url'];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should query development audit logs', async () => {
        const args = [subCmd, 'query-development-audit-logs', '--vendor-id', vendorId];
        addCoveredCommand(args);
        const result = await run(cmd, args, options);
        expect(result).be.an('object');
    });

    it('| should invoke skill end point', async () => {
        const args = [subCmd, 'invoke-skill-end-point', '-s', skillId, '-g', stage,
            '--endpoint-region', 'someRegion', '--skill-request-body', JSON.stringify({})];
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
