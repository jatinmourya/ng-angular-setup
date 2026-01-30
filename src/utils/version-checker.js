import { execa } from 'execa';
import chalk from 'chalk';
import semver from 'semver';

/**
 * Get the current Node.js version
 */
export async function getNodeVersion() {
    try {
        const { stdout } = await execa('node', ['--version']);
        return stdout.trim().replace('v', '');
    } catch (error) {
        return null;
    }
}

/**
 * Get the current npm version
 */
export async function getNpmVersion() {
    try {
        const { stdout } = await execa('npm', ['--version']);
        return stdout.trim();
    } catch (error) {
        return null;
    }
}

/**
 * Get the current nvm version
 */
export async function getNvmVersion() {
    try {
        const { stdout } = await execa('nvm', ['--version'], { shell: true });
        return stdout.trim();
    } catch (error) {
        return null;
    }
}

/**
 * Check if nvm is installed
 */
export async function isNvmInstalled() {
    const version = await getNvmVersion();
    return version !== null;
}

/**
 * Get the current Angular CLI version
 */
export async function getAngularCliVersion() {
    try {
        const { stdout } = await execa('ng', ['version'], { shell: true });
        const match = stdout.match(/Angular CLI: (\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

/**
 * Display all system versions
 */
export async function displaySystemVersions() {
    console.log(chalk.bold.cyan('\n🔍 System Environment Check\n'));
    console.log(chalk.gray('━'.repeat(50)));

    const nodeVersion = await getNodeVersion();
    const npmVersion = await getNpmVersion();
    const nvmVersion = await getNvmVersion();
    const ngVersion = await getAngularCliVersion();

    console.log(chalk.white('Node.js:      ') + (nodeVersion ? chalk.green(`v${nodeVersion}`) : chalk.red('Not installed')));
    console.log(chalk.white('npm:          ') + (npmVersion ? chalk.green(`v${npmVersion}`) : chalk.red('Not installed')));
    console.log(chalk.white('nvm:          ') + (nvmVersion ? chalk.green(`v${nvmVersion}`) : chalk.yellow('Not installed')));
    console.log(chalk.white('Angular CLI:  ') + (ngVersion ? chalk.green(`v${ngVersion}`) : chalk.yellow('Not installed')));
    
    console.log(chalk.gray('━'.repeat(50)) + '\n');

    return {
        node: nodeVersion,
        npm: npmVersion,
        nvm: nvmVersion,
        angularCli: ngVersion
    };
}

/**
 * Get available Node versions from nvm
 */
export async function getAvailableNodeVersions() {
    try {
        const { stdout } = await execa('nvm', ['list', 'available'], { shell: true });
        const versions = [];
        const lines = stdout.split('\n');
        
        for (const line of lines) {
            const match = line.match(/(\d+\.\d+\.\d+)/);
            if (match) {
                versions.push(match[1]);
            }
        }
        
        return versions;
    } catch (error) {
        return [];
    }
}

/**
 * Get installed Node versions from nvm
 */
export async function getInstalledNodeVersions() {
    try {
        const { stdout } = await execa('nvm', ['list'], { shell: true });
        const versions = [];
        const lines = stdout.split('\n');
        
        for (const line of lines) {
            const match = line.match(/(\d+\.\d+\.\d+)/);
            if (match) {
                versions.push(match[1]);
            }
        }
        
        return versions;
    } catch (error) {
        return [];
    }
}

/**
 * Switch Node version using nvm
 */
export async function switchNodeVersion(version) {
    try {
        await execa('nvm', ['use', version], { shell: true, stdio: 'inherit' });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Install Node version using nvm
 */
export async function installNodeVersion(version) {
    try {
        await execa('nvm', ['install', version], { shell: true, stdio: 'inherit' });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Compare two semantic versions
 */
export function compareVersions(v1, v2) {
    return semver.compare(v1, v2);
}

/**
 * Check if version satisfies range
 */
export function satisfiesVersion(version, range) {
    return semver.satisfies(version, range);
}
