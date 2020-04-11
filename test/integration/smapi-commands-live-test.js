const { expect } = require('chai');
const { ModelIntrospector } = require('ask-smapi-sdk');
const parallel = require('mocha.parallel');
require('module-alias/register');

const { CliCustomizationProcessor } = require('@src/commands/smapi/cli-customization-processor');
const { run, randomEmail } = require('./test-utils');
const skillManifest = require('./fixtures/skill-manifest.json');
const catalogUploadBody = require('./fixtures/catalog-upload.json');
const inSkillProductRequestBody = require('./fixtures/create-in-skill-product-request.json');
const accountLinkingRequest = require('./fixtures/account-linking-request.json');

const processor = new CliCustomizationProcessor();
const modelIntrospector = new ModelIntrospector();
const untestedCommands = new Set([...modelIntrospector.getOperations().keys()].map(processor.processOperationName));
const testedCommands = new Set();

const HOSTED_SKILL_ID = 'amzn1.ask.skill.e9ac9d7f-5c4f-4c3b-8e41-1b347f625d95';
const SKILL_ID = HOSTED_SKILL_ID;
const STAGE = 'development';
const CATALOG_ID = 'amzn1.ask-catalog.cat.c98f84ac-6730-4043-8fa7-19c93447f214';
const LOCALE = 'en-US';
const VENDOR_ID = 'M29RM8YM2GK1G6';

const skipCommands = [
    'request-feedback-from-testers',
    'send-reminder-to-testers',
    'get-certifications-list',
    'get-certification-review',
    'get-skill-enablement-status',
    'set-skill-enablement',
    'delete-skill-enablement',
    'delete-skill',
    'submit-skill-for-certification',
    'withdraw-skill-from-certification'
];

skipCommands.forEach(cmd => untestedCommands.delete(cmd));

const addCoveredCommand = (args) => {
    const cmd = args[1];
    if (testedCommands.has(cmd)) {
        console.warn(`${cmd} already has been covered!`);
    }
    testedCommands.add(cmd);
    untestedCommands.delete(cmd);
};

describe('smapi live command test', () => {
    const cmd = 'ask';
    const subCmd = 'smapi';
    const options = { parse: true };
    const createSkill = () => {
        const args = [subCmd, 'create-skill-for-vendor', '--manifest', JSON.stringify(skillManifest)];
        addCoveredCommand(args);
        return run(cmd, args, options);
    };
    parallel('', () => {
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

        it('| should get skill status', async () => {
            const args = [subCmd, 'get-skill-status', '-s', SKILL_ID];
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

        it('| should create catalog, get catalog information, create skill, '
        + 'associate skill with catalog, create catalog upload', async () => {
            // TODO remove vendor-id
            // create
            let args = [subCmd, 'create-catalog', '--title', 'test',
                '--type', 'AMAZON.BroadcastChannel',
                '--usage', 'AlexaMusic.Catalog.BroadcastChannel', '--vendor-id', VENDOR_ID];
            addCoveredCommand(args);
            let result = await run(cmd, args, options);
            expect(result).be.an('object');

            const catalogId = result.id;

            // display
            args = [subCmd, 'get-catalog', '-c', catalogId];
            addCoveredCommand(args);
            result = await run(cmd, args, options);
            expect(result).be.an('object');

            // create skill
            result = await createSkill();
            expect(result).be.an('object');

            const { skillId } = result;

            // associate skill with catalog
            args = [subCmd, 'associate-catalog-with-skill', '-c', catalogId, '-s', skillId];
            addCoveredCommand(args);
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');

            // create catalog upload
            args = [subCmd, 'create-catalog-upload', '-c', catalogId, '--catalog-upload-request-body', JSON.stringify(catalogUploadBody)];
            addCoveredCommand(args);
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');
        });

        it('| should display catalog list for skill', async () => {
            const args = [subCmd, 'list-catalogs-for-skill', '-s', SKILL_ID, '--max-results', 1];
            addCoveredCommand(args);
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should display alexa hosted skill metadata', async () => {
            const args = [subCmd, 'get-alexa-hosted-skill-metadata', '-s', HOSTED_SKILL_ID];
            addCoveredCommand(args);
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should display utterance data', async () => {
            const args = [subCmd, 'get-utterance-data', '-s', SKILL_ID, '--locale', LOCALE, '-g', STAGE, '--sort-direction', 'asc'];
            addCoveredCommand(args);
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should add, list and remove testers from beta test ', async () => {
            const testersEmails = `${randomEmail()},${randomEmail()}`;
            // add
            let args = [subCmd, 'add-testers-to-beta-test', '-s', SKILL_ID, '--testers-emails', testersEmails];
            addCoveredCommand(args);
            let result = await run(cmd, args);
            expect(result).include('Command executed successfully!');

            // list
            args = [subCmd, 'get-list-of-testers', '-s', SKILL_ID, '--max-results', 1];
            addCoveredCommand(args);
            result = await run(cmd, args, options);
            expect(result).be.an('object');

            // remove
            args = [subCmd, 'remove-testers-from-beta-test', '-s', SKILL_ID, '--testers-emails', testersEmails];
            addCoveredCommand(args);
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');
        });
    });

    parallel('', () => {
        it('| should update interaction model catalog version and return version number', async () => {
            const args = [subCmd, 'update-interaction-model-catalog-version', '-c', CATALOG_ID, '--version', 1, '--description', 'test'];
            addCoveredCommand(args);
            const result = await run(cmd, args);
            expect(result).match(/^[0-9]+\.[0-9]+\.[0-9]+/);
        });

        it('| should simulate skill', async () => {
            const args = [subCmd, 'simulate-skill', '-s', SKILL_ID, '--device-locale', LOCALE, '-g', STAGE, '--input-content', 'hello'];
            addCoveredCommand(args);
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should create, update, retrieve beta test', async () => {
            const skill = await createSkill();

            const { skillId } = skill;
            // create
            let args = [subCmd, 'create-beta-test', '-s', skillId];
            addCoveredCommand(args);
            let result = await run(cmd, args);
            expect(result).include('Command executed successfully!');

            // update
            args = [subCmd, 'update-beta-test', '-s', skillId, '--feedback-email', 'test2@gmail.com'];
            addCoveredCommand(args);
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');

            // retrieve
            args = [subCmd, 'get-beta-test', '-s', skillId];
            addCoveredCommand(args);
            result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should list uploads for catalog', async () => {
            const args = [subCmd, 'list-uploads-for-catalog', '-c', CATALOG_ID, '--max-results', 1];
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
            const args = [subCmd, 'get-isp-list-for-skill-id', '-s', SKILL_ID, '-g', STAGE, '--max-results', 1];
            addCoveredCommand(args);
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should create, retrieve and delete account linking info', async () => {
            let args = [subCmd, 'update-account-linking-info', '-s', SKILL_ID, '-g', STAGE,
                '--account-linking-request', JSON.stringify(accountLinkingRequest)];
            addCoveredCommand(args);
            let result = await run(cmd, args);
            expect(result).include('Command executed successfully!');

            args = [subCmd, 'get-account-linking-info', '-s', SKILL_ID, '-g', STAGE];
            addCoveredCommand(args);
            result = await run(cmd, args, options);
            expect(result).be.an('object');

            args = [subCmd, 'delete-account-linking-info', '-s', SKILL_ID, '-g', STAGE];
            addCoveredCommand(args);
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');
        });

        it('| should create, retrieve, reset entitlement, show summary, get associated skill, '
            + 'associate & disassociate skill, update, delete isp for vendor', async () => {
            // create
            let args = [subCmd, 'create-isp-for-vendor', '--create-in-skill-product-request', JSON.stringify(inSkillProductRequestBody)];
            addCoveredCommand(args);
            let result = await run(cmd, args, options);
            expect(result).be.an('object');

            const { productId } = result;
            // retrieve
            args = [subCmd, 'get-isp-definition', '--product-id', productId, '-g', STAGE];
            addCoveredCommand(args);
            result = await run(cmd, args, options);
            expect(result).be.an('object');

            // reset entitlement
            args = [subCmd, 'reset-entitlement-for-product', '--product-id', productId, '-g', STAGE];
            addCoveredCommand(args);
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');

            // get associated skills
            args = [subCmd, 'get-isp-associated-skills', '--product-id', productId, '-g', STAGE];
            addCoveredCommand(args);
            result = await run(cmd, args, options);
            expect(result).be.an('object');

            // associate isp with skill
            args = [subCmd, 'associate-isp-with-skill', '--product-id', productId, '-s', SKILL_ID];
            addCoveredCommand(args);
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');

            // disassociate isp with skill
            args = [subCmd, 'disassociate-isp-with-skill', '--product-id', productId, '-s', SKILL_ID];
            addCoveredCommand(args);
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');

            // summary
            args = [subCmd, 'get-isp-summary', '--product-id', productId, '-g', STAGE];
            addCoveredCommand(args);
            result = await run(cmd, args, options);
            expect(result).be.an('object');

            // update
            args = [subCmd, 'update-isp-for-product', '--product-id', productId, '-g', STAGE,
                '--in-skill-product', JSON.stringify(inSkillProductRequestBody)];
            addCoveredCommand(args);
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');

            // delete
            args = [subCmd, 'delete-isp-for-product', '--product-id', productId, '-g', STAGE];
            addCoveredCommand(args);
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');
        });
    });

    after('display summary', () => {
        console.log(`\tCovered ${testedCommands.size} commands:`);
        console.log(`\t${Array.from(testedCommands).join('\n\t')}`);
        console.log('\n');
        console.log(`\tNot Covered ${untestedCommands.size} commands:`);
        console.log(`\t${Array.from(untestedCommands).join('\n\t')}`);
    });
});
