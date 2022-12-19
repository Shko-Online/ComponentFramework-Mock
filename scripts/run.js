const execa = require('execa');
const path = require('path');

function handleExit(code, stderr, errorCallback) {
    if (code !== 0) {
        if (errorCallback && typeof errorCallback === 'function') {
            errorCallback(stderr);
        }

        process.exit(code);
    }
}

async function run({ watch, dir, silent, command, errorCallback }) {
    return new Promise((resolve, reject) => {
        if (command !== '') {
            const child = execa.command(command, {
                ... {
                    buffer: false,
                }, ...(dir ? { env: { BABEL_MODE: path.basename(dir) } } : {})
            });

            let stderr = '';

            if (watch) {
                child.stdout.pipe(process.stdout);
                child.stderr.pipe(process.stderr);
            } else {
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
                child.stdout.on('data', (data) => {
                    stderr += data.toString();
                });
            }

            child.on('exit', (code) => {
                resolve();
                handleExit(code, stderr, errorCallback);
            });
        } else {
            resolve();
        }
    });
}

module.exports = {
    run,
};