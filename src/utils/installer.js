import { execa } from 'execa';
import ora from 'ora';
import chalk from 'chalk';
import { platform } from 'os';

/**
 * Install Node.js using winget (Windows)
 */
export async function installNodeWithWinget(version = 'LTS') {
    const spinner = ora('Installing Node.js with winget...').start();
    
    try {
        const packageId = version === 'LTS' ? 'OpenJS.NodeJS.LTS' : 'OpenJS.NodeJS';
        await execa('winget', ['install', packageId], { stdio: 'inherit' });
        
        spinner.succeed('Node.js installed successfully');
        return true;
    } catch (error) {
        spinner.fail('Failed to install Node.js');
        console.error(chalk.red(error.message));
        return false;
    }
}

/**
 * Get nvm installation instructions based on OS
 */
export function getNvmInstallInstructions() {
    const os = platform();
    
    if (os === 'win32') {
        return {
            os: 'Windows',
            method: 'Download and install',
            url: 'https://github.com/coreybutler/nvm-windows/releases',
            command: null,
            description: 'Download the nvm-setup.zip file from the releases page and run the installer.'
        };
    } else if (os === 'darwin') {
        return {
            os: 'macOS',
            method: 'Using curl',
            url: 'https://github.com/nvm-sh/nvm',
            command: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash',
            description: 'Run the curl command in your terminal to install nvm.'
        };
    } else {
        return {
            os: 'Linux',
            method: 'Using curl or wget',
            url: 'https://github.com/nvm-sh/nvm',
            command: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash',
            alternativeCommand: 'wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash',
            description: 'Run either the curl or wget command in your terminal to install nvm.'
        };
    }
}

/**
 * Display nvm installation guide
 */
export function displayNvmInstallGuide() {
    const instructions = getNvmInstallInstructions();
    
    console.log(chalk.bold.yellow('\n📚 nvm Installation Guide\n'));
    console.log(chalk.gray('━'.repeat(50)));
    console.log(chalk.white('Operating System: ') + chalk.cyan(instructions.os));
    console.log(chalk.white('Method:           ') + chalk.cyan(instructions.method));
    console.log(chalk.white('URL:              ') + chalk.blue(instructions.url));
    
    if (instructions.command) {
        console.log(chalk.white('\nCommand:'));
        console.log(chalk.green(`  ${instructions.command}`));
        
        if (instructions.alternativeCommand) {
            console.log(chalk.white('\nAlternative:'));
            console.log(chalk.green(`  ${instructions.alternativeCommand}`));
        }
    }
    
    console.log(chalk.white('\nDescription:'));
    console.log(chalk.gray(`  ${instructions.description}`));
    console.log(chalk.gray('━'.repeat(50)) + '\n');
    
    console.log(chalk.yellow('💡 Benefits of using nvm:'));
    console.log(chalk.gray('  • Manage multiple Node.js versions'));
    console.log(chalk.gray('  • Switch between versions easily'));
    console.log(chalk.gray('  • No admin/sudo required for installations'));
    console.log(chalk.gray('  • Project-specific Node versions\n'));
}

/**
 * Install npm package globally
 */
export async function installGlobalPackage(packageName, version = 'latest') {
    const spinner = ora(`Installing ${packageName}@${version}...`).start();
    
    try {
        const packageSpec = version === 'latest' ? packageName : `${packageName}@${version}`;
        await execa('npm', ['install', '-g', packageSpec], { stdio: 'inherit' });
        
        spinner.succeed(`${packageName} installed successfully`);
        return true;
    } catch (error) {
        spinner.fail(`Failed to install ${packageName}`);
        console.error(chalk.red(error.message));
        return false;
    }
}

/**
 * Install npm packages in project
 */
export async function installPackages(packages, projectPath, dev = false) {
    const spinner = ora(`Installing ${packages.length} package(s)...`).start();
    
    try {
        const args = ['install'];
        if (dev) args.push('--save-dev');
        args.push(...packages);
        
        await execa('npm', args, { 
            cwd: projectPath,
            stdio: 'inherit'
        });
        
        spinner.succeed('Packages installed successfully');
        return true;
    } catch (error) {
        spinner.fail('Failed to install packages');
        console.error(chalk.red(error.message));
        return false;
    }
}

/**
 * Initialize npm project
 */
export async function initNpmProject(projectPath) {
    try {
        await execa('npm', ['init', '-y'], { 
            cwd: projectPath,
            stdio: 'inherit'
        });
        return true;
    } catch (error) {
        console.error(chalk.red('Failed to initialize npm project'));
        return false;
    }
}

/**
 * Run npm install in project
 */
export async function runNpmInstall(projectPath) {
    const spinner = ora('Installing dependencies...').start();
    
    try {
        await execa('npm', ['install'], { 
            cwd: projectPath,
            stdio: 'inherit'
        });
        
        spinner.succeed('Dependencies installed successfully');
        return true;
    } catch (error) {
        spinner.fail('Failed to install dependencies');
        console.error(chalk.red(error.message));
        return false;
    }
}

/**
 * Install Angular CLI globally
 */
export async function installAngularCli(version = 'latest') {
    return installGlobalPackage('@angular/cli', version);
}

/**
 * Create Angular project using CLI
 */
export async function createAngularProject(projectName, angularVersion, options = {}) {
    const spinner = ora(`Creating Angular project: ${projectName}...`).start();
    
    try {
        const args = ['new', projectName];
        
        // Add options
        if (options.skipInstall) args.push('--skip-install');
        if (options.routing !== undefined) args.push(`--routing=${options.routing}`);
        if (options.style) args.push(`--style=${options.style}`);
        if (options.strict !== undefined) args.push(`--strict=${options.strict}`);
        if (options.standalone !== undefined) args.push(`--standalone=${options.standalone}`);
        
        const cliCommand = angularVersion ? `@angular/cli@${angularVersion}` : '@angular/cli';
        
        await execa('npx', [cliCommand, ...args], { 
            stdio: 'inherit'
        });
        
        spinner.succeed(`Angular project ${projectName} created successfully`);
        return true;
    } catch (error) {
        spinner.fail('Failed to create Angular project');
        console.error(chalk.red(error.message));
        return false;
    }
}
