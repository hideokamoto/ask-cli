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

const run = (cmd, args, options = {}) => {
    const inputs = options.inputs || [];
    const parse = options.parse || false;
    const cwd = options.cwd || tempDirectory;

    const childProcess = spawn(cmd, args, { cwd, stdio: [null, null, null, 'ipc'] });

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

module.exports = {
    KeySymbol,
    getPathInTempDirectory,
    makeFolderInTempDirectory,
    resetTempDirectory,
    run
};
