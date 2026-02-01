import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { execa } from 'execa';
import ora from 'ora';

/**
 * Initialize Git repository
 */
export async function initGitRepo(projectPath) {
    const spinner = ora('Initializing Git repository...').start();
    
    try {
        await execa('git', ['init'], { cwd: projectPath });
        spinner.succeed('Git repository initialized');
        return true;
    } catch (error) {
        spinner.fail('Failed to initialize Git repository');
        console.error(chalk.red(error.message));
        return false;
    }
}

/**
 * Create .gitignore file
 */
export async function createGitignore(projectPath, content) {
    try {
        const gitignorePath = path.join(projectPath, '.gitignore');
        await fs.writeFile(gitignorePath, content, 'utf-8');
        console.log(chalk.green('✓ Created .gitignore'));
        return true;
    } catch (error) {
        console.error(chalk.red('Failed to create .gitignore:'), error.message);
        return false;
    }
}

/**
 * Create initial commit
 */
export async function createInitialCommit(projectPath, message) {
    const spinner = ora('Creating initial commit...').start();
    
    try {
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', message], { cwd: projectPath });
        spinner.succeed('Initial commit created');
        return true;
    } catch (error) {
        spinner.fail('Failed to create initial commit');
        console.error(chalk.red(error.message));
        return false;
    }
}

/**
 * Create project folders
 */
export async function createProjectFolders(projectPath, folders) {
    const spinner = ora('Creating project structure...').start();
    
    try {
        for (const folder of folders) {
            const folderPath = path.join(projectPath, folder);
            await fs.mkdir(folderPath, { recursive: true });
        }
        spinner.succeed('Project structure created');
        return true;
    } catch (error) {
        spinner.fail('Failed to create project structure');
        console.error(chalk.red(error.message));
        return false;
    }
}

/**
 * Create project files
 */
export async function createProjectFiles(projectPath, files) {
    try {
        for (const [filePath, content] of Object.entries(files)) {
            const fullPath = path.join(projectPath, filePath);
            const dir = path.dirname(fullPath);
            
            // Ensure directory exists
            await fs.mkdir(dir, { recursive: true });
            
            // Write file
            const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
            await fs.writeFile(fullPath, fileContent, 'utf-8');
        }
        console.log(chalk.green(`✓ Created ${Object.keys(files).length} file(s)`));
        return true;
    } catch (error) {
        console.error(chalk.red('Failed to create project files:'), error.message);
        return false;
    }
}

/**
 * Create README.md
 */
export async function createReadme(projectPath, content) {
    try {
        const readmePath = path.join(projectPath, 'README.md');
        await fs.writeFile(readmePath, content, 'utf-8');
        console.log(chalk.green('✓ Created README.md'));
        return true;
    } catch (error) {
        console.error(chalk.red('Failed to create README.md:'), error.message);
        return false;
    }
}

/**
 * Create CHANGELOG.md
 */
export async function createChangelog(projectPath, content) {
    try {
        const changelogPath = path.join(projectPath, 'CHANGELOG.md');
        await fs.writeFile(changelogPath, content, 'utf-8');
        console.log(chalk.green('✓ Created CHANGELOG.md'));
        return true;
    } catch (error) {
        console.error(chalk.red('Failed to create CHANGELOG.md:'), error.message);
        return false;
    }
}

/**
 * Check if directory exists and is empty
 */
export async function isDirectoryEmpty(dirPath) {
    try {
        const files = await fs.readdir(dirPath);
        return files.length === 0;
    } catch (error) {
        // Directory doesn't exist
        return true;
    }
}

/**
 * Create directory if it doesn't exist
 */
export async function ensureDirectory(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        return true;
    } catch (error) {
        console.error(chalk.red('Failed to create directory:'), error.message);
        return false;
    }
}

/**
 * Validate directory name
 */
export function validateDirectoryName(name) {
    // Check for invalid characters
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(name)) {
        return 'Directory name contains invalid characters';
    }

    // Check for reserved names (Windows)
    const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    if (reserved.includes(name.toUpperCase())) {
        return 'Directory name is reserved';
    }

    // Check for valid length
    if (name.length === 0) {
        return 'Directory name cannot be empty';
    }

    if (name.length > 255) {
        return 'Directory name is too long';
    }

    // Check for trailing spaces or periods (Windows restriction)
    if (name.endsWith(' ') || name.endsWith('.')) {
        return 'Directory name cannot end with a space or period';
    }

    return true;
}

/**
 * Update package.json scripts
 */
export async function updatePackageJsonScripts(projectPath, scripts) {
    try {
        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        
        packageJson.scripts = {
            ...packageJson.scripts,
            ...scripts
        };
        
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
        console.log(chalk.green('✓ Updated package.json scripts'));
        return true;
    } catch (error) {
        console.error(chalk.red('Failed to update package.json:'), error.message);
        return false;
    }
}

/**
 * Read package.json
 */
export async function readPackageJson(projectPath) {
    try {
        const packageJsonPath = path.join(projectPath, 'package.json');
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

/**
 * Write package.json
 */
export async function writePackageJson(projectPath, content) {
    try {
        const packageJsonPath = path.join(projectPath, 'package.json');
        await fs.writeFile(packageJsonPath, JSON.stringify(content, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error(chalk.red('Failed to write package.json:'), error.message);
        return false;
    }
}
