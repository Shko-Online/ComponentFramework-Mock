const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { run } = require('./run');

function getCommand(watch, dir) {
    const args = [
        './src',
        `--out-dir=${dir}`,
        `--config-file=${path.resolve(__dirname, '../ComponentFramework-Mock/.babelrc.js').replace(' ', '\\ ')}`,
        '--extensions=.js,.jsx,.ts,.tsx'
    ];

    if (watch) {
        args.push('-w');
    }
    console.log(`npx babel ${args.join(' ')}`);
    return `npx babel ${args.join(' ')}`;
}

async function babelify(options = {}) {
    const { watch = false, silent = true, errorCallback } = options;

    if (!(await fs.pathExists('src'))) {
        if (!silent) {
            console.warn(`No '${chalk.yellow('src')}' dir`);
        }
        return;
    }

    const runners = watch
        ?
        ['./lib/cjs', './lib/esm'].map((dir) => {
            const command = getCommand(watch, dir);
            return run({ watch, dir, silent, command, errorCallback });
        })
        : ['./lib/cjs', './lib/esm', './lib/modern'].map((dir) => {
            const command = getCommand(watch, dir);
            return run({ dir, silent, command, errorCallback });
        });

    await Promise.all(runners);
}

module.exports = {
    babelify,
};