const { babelify } = require('./babelify');
const { tscfy } = require('./tscfy');
const chalk = require('chalk');
const fs = require('fs-extra');
const log = require('npmlog');
const path = require('path');
const readPkgUp = require('read-pkg-up');
const shell = require('shelljs');

const distFolder = 'lib';

async function removeDist() {
    await fs.remove(distFolder);
}

async function cleanup() {
    // remove files after babel --copy-files output   
    if (await fs.pathExists(path.join(process.cwd(), distFolder))) {

        const filesToRemove = shell.find(distFolder).filter((filePath) => {


            // Remove all copied TS files (but not the .d.ts)
            if (/\.tsx?$/.test(filePath) && !/\.d\.ts$/.test(filePath)) {
                return true;
            }

            return false;
        });
        if (filesToRemove.length) {
            shell.rm('-f', ...filesToRemove);
        }
    }
}

function logError(type, packageJson, errorLogs) {
    log.error(`FAILED (${type}) : ${errorLogs}`);
    log.error(
      `FAILED to compile ${type}: ${chalk.bold(`${packageJson.name}@${packageJson.version}`)}`
    );
  }
  

async function build({ cwd, flags }) {
    const modules = true;
    const { packageJson } = await readPkgUp(cwd);
    const message = chalk.gray(`Built: ${chalk.bold(`${packageJson.name}@${packageJson.version}`)}`);
    console.time(message);
  
    if (flags.includes('--reset')) {
      await removeDist();
    }
  
    await Promise.all([
      babelify({
        modules,
        watch: flags.includes('--watch'),
        errorCallback: (errorLogs) => logError('js', packageJson, errorLogs),
      }),
      tscfy({
        watch: flags.includes('--watch'),
        errorCallback: (errorLogs) => logError('ts', packageJson, errorLogs),
      }),
    ]);
  
    await cleanup();
    console.timeEnd(message);
}

const flags = process.argv.slice(2);
const cwd = process.cwd();

build({ cwd, flags });