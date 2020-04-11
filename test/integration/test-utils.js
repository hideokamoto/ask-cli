const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const KeySymbol = {
    DOWN: '\x1B\x5B\x42',
    UP: '\x1B\x5B\x41',
    ENTER: '\x0D',
    SPACE: '\x20'
};
const tempDirectory = path.join(process.cwd(), 'test/integration/temp');

const resetTempDirectory = () => {
    fs.ensureDirSync(tempDirectory);
    fs.emptyDirSync(tempDirectory);
};

const getPathInTempDirectory = (folderPath) => path.join(tempDirectory, folderPath);

const makeFolderInTempDirectory = (folderPath) => {
    fs.ensureDirSync(getPathInTempDirectory(folderPath));
};

const randomEmail = () => `${Math.random().toString(36).substring(2, 15)}-test@gmail.com`;

const run = (cmd, args, options = {}) => {
    const inputs = options.inputs || [];
    const parse = options.parse || false;
    const returnProcessHandle = options.returnProcessHandle || false;
    const cwd = options.cwd || tempDirectory;
    const env = { ...process.env, ...options.env };

    fs.ensureDirSync(cwd);

    const childProcess = spawn(cmd, args, { cwd, env, stdio: [null, null, null, 'ipc'] });

    return new Promise((resolve, reject) => {
        let output = '';
        let errorMessage = '';
        const processData = (data) => {
            const dataStr = data.toString();
            output += dataStr;
            if (process.env.DEBUG) {
                console.log(dataStr);
            }
            return dataStr;
        };
        childProcess.stdout.on('data', (data) => {
            const dataStr = processData(data);

            const index = inputs.findIndex(i => dataStr.includes(i.match));
            if (index > -1) {
                const { input } = inputs[index];
                inputs.splice(index, 1);
                const value = input ? `${input}${KeySymbol.ENTER}` : KeySymbol.ENTER;
                childProcess.stdin.write(value);
            }
            if (returnProcessHandle && inputs.length === 0) {
                resolve(childProcess);
            }
        });

        childProcess.stderr.on('data', (data) => {
            errorMessage = processData(data);
        });

        childProcess.on('close', (code) => {
            if (code) {
                reject(errorMessage);
            } else {
                output = parse ? JSON.parse(output) : output;
                resolve(output);
            }
        });
    });
};

const startMockServer = async () => {
    const inputs = [
        { match: 'Prism is listening on' }
    ];
    const args = ['run', 'prism', '--', 'mock', 'node_modules/ask-smapi-model/spec.json'];
    const options = { returnProcessHandle: true, inputs, cwd: process.cwd() };
    return run('npm', args, options);
};

module.exports = {
    KeySymbol,
    getPathInTempDirectory,
    makeFolderInTempDirectory,
    resetTempDirectory,
    randomEmail,
    run,
    startMockServer
};
