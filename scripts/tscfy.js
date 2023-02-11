const chalk = require('chalk');
const execa = require('execa');
const fs = require('fs-extra');
const { run } = require('./run');

function getCommand(watch) {
    const args = [
        '--project tsconfig.build.json',
        '--outDir ./lib/ts3.9',
        '--listEmittedFiles false',
        '--declaration true',
        '--noErrorTruncation',
        '--pretty',
        '--emitDeclarationOnly',
    ];

    if (watch) {
        args.push('-w', '--preserveWatchOutput');
    }

    return `npx tsc ${args.join(' ')}`;
}

async function tscfy(options = {}) {
    const { watch = false, silent = false, errorCallback } = options;
    const tsConfigFile = 'tsconfig.build.json';

    if (!(await fs.pathExists(tsConfigFile))) {
        if (!silent) {
            console.log(`No '${chalk.yellow(tsConfigFile)}'`);
        }
        return;
    }

    const tsConfig = await fs.readJSON(tsConfigFile);

    if (!(tsConfig && tsConfig.lerna && tsConfig.lerna.disabled === true)) {
        const command = getCommand(watch);
        await run({ watch, command, silent, errorCallback });
    }

    await execa.command('npx copyfiles -u 1 src/**/*.d.ts lib/ts3.9')

    if (!watch) {
        await execa.command('npx downlevel-dts lib/ts3.9 lib/ts3.4');
    }
}

module.exports = {
    tscfy,
};