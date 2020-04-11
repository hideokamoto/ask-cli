const { expect } = require('chai');
const parallel = require('mocha.parallel');

const { HOSTED_SKILL_ID, SKILL_ID, VENDOR_ID, STAGE, CATALOG_ID, LOCALE } = require('@test/integration/test-constants');
const { run, randomEmail } = require('@test/integration/test-utils');
const skillManifest = require('@test/integration/fixtures/skill-manifest.json');

describe.only('smapi command test', () => {
    const cmd = 'ask';
    const subCmd = 'smapi';
    const options = { parse: true };
    parallel('', () => {
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

        it('| should list skills for vendor', async () => {
            const args = [subCmd, 'list-skills-for-vendor', '--max-results', 1];
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should display catalog list', async () => {
            const args = [subCmd, 'list-catalogs-for-vendor'];
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should create catalog and get catalog information', async () => {
            // TODO remove vendor-id
            // create
            let args = [subCmd, 'create-catalog', '--title', 'test',
                '--type', 'AMAZON.BroadcastChannel',
                '--usage', 'AlexaMusic.Catalog.BroadcastChannel', '--vendor-id', VENDOR_ID];
            let result = await run(cmd, args, options);
            expect(result).be.an('object');

            // display
            args = [subCmd, 'get-catalog', '-c', result.id];
            result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should display catalog list for skill', async () => {
            const args = [subCmd, 'list-catalogs-for-skill', '-s', SKILL_ID, '--max-results', 1];
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should display alexa hosted skill metadata', async () => {
            const args = [subCmd, 'get-alexa-hosted-skill-metadata', '-s', HOSTED_SKILL_ID];
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should display utterance data', async () => {
            const args = [subCmd, 'get-utterance-data', '-s', SKILL_ID, '--locale', LOCALE, '-g', STAGE, '--sort-direction', 'asc'];
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });

        it('| should update beta test', async () => {
            const args = [subCmd, 'update-beta-test', '-s', SKILL_ID, '--feedback-email', 'test2@gmail.com'];
            const result = await run(cmd, args);
            expect(result).include('Command executed successfully!');
        });

        it('| should add and remove testers from beta test ', async () => {
            const testersEmails = `${randomEmail()},${randomEmail()}`;
            // add
            let args = [subCmd, 'add-testers-to-beta-test', '-s', SKILL_ID, '--testers-emails', testersEmails];
            let result = await run(cmd, args);
            expect(result).include('Command executed successfully!');

            // remove
            args = [subCmd, 'remove-testers-from-beta-test', '-s', SKILL_ID, '--testers-emails', testersEmails];
            result = await run(cmd, args);
            expect(result).include('Command executed successfully!');
        });
    });

    parallel('', () => {
        it('| should update interaction model catalog version and return version number', async () => {
            const args = [subCmd, 'update-interaction-model-catalog-version', '-c', CATALOG_ID, '--version', 1, '--description', 'test'];
            const result = await run(cmd, args);
            expect(result).match(/^[0-9]+\.[0-9]+\.[0-9]+/);
        });

        it('| should simulate skill', async () => {
            const args = [subCmd, 'simulate-skill', '-s', SKILL_ID, '--device-locale', LOCALE, '-g', STAGE, '--input-content', 'hello'];
            const result = await run(cmd, args, options);
            expect(result).be.an('object');
        });
    });
});
