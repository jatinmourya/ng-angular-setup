import inquirer from 'inquirer';
import inquirerAutocomplete from 'inquirer-autocomplete-prompt';
import chalk from 'chalk';
import { searchNpmPackages, getEnhancedPackageInfo, formatDownloads } from './npm-search.js';

// Register autocomplete prompt
inquirer.registerPrompt('autocomplete', inquirerAutocomplete);

/**
 * Interactive library search with autocomplete
 */
export async function interactiveLibrarySearch() {
    const selectedLibraries = [];
    let continueSearching = true;

    console.log(chalk.bold.cyan('\n📦 Interactive Library Search\n'));
    console.log(chalk.gray('Type to search npm packages. Press Enter to select.\n'));

    while (continueSearching) {
        try {
            const answer = await inquirer.prompt([
                {
                    type: 'autocomplete',
                    name: 'package',
                    message: 'Search for a library:',
                    source: async (answersSoFar, input) => {
                        if (!input || input.length < 2) {
                            return [];
                        }

                        const results = await searchNpmPackages(input, 15);
                        
                        return results.map(pkg => ({
                            name: formatPackageChoice(pkg),
                            value: pkg.name,
                            short: pkg.name
                        }));
                    },
                    pageSize: 10
                }
            ]);

            if (answer.package) {
                // Get detailed info
                const info = await getEnhancedPackageInfo(answer.package);
                
                if (info) {
                    console.log(chalk.green(`\n✓ Selected: ${info.name}`));
                    console.log(chalk.gray(`  Description: ${info.description}`));
                    console.log(chalk.gray(`  Latest version: ${info.latestVersion}`));
                    console.log(chalk.gray(`  Weekly downloads: ${formatDownloads(info.weeklyDownloads)}`));

                    // Ask for specific version
                    const versionAnswer = await inquirer.prompt([
                        {
                            type: 'list',
                            name: 'version',
                            message: 'Select version:',
                            choices: [
                                { name: `Latest (${info.latestVersion})`, value: 'latest' },
                                { name: 'Specify version manually', value: 'manual' }
                            ],
                            default: 'latest'
                        }
                    ]);

                    let version = info.latestVersion;
                    
                    if (versionAnswer.version === 'manual') {
                        const manualVersion = await inquirer.prompt([
                            {
                                type: 'input',
                                name: 'version',
                                message: 'Enter version:',
                                default: info.latestVersion,
                                validate: (input) => {
                                    return input ? true : 'Version is required';
                                }
                            }
                        ]);
                        version = manualVersion.version;
                    }

                    selectedLibraries.push({
                        name: info.name,
                        version: version,
                        description: info.description
                    });

                    console.log(chalk.green(`✓ Added ${info.name}@${version} to installation queue\n`));
                }
            }

            // Ask if user wants to add more
            const continueAnswer = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'continue',
                    message: 'Add another library?',
                    default: false
                }
            ]);

            continueSearching = continueAnswer.continue;

        } catch (error) {
            console.error(chalk.red('Error during library search:', error.message));
            continueSearching = false;
        }
    }

    return selectedLibraries;
}

/**
 * Format package choice for display
 */
function formatPackageChoice(pkg) {
    const downloads = formatDownloads(pkg.weeklyDownloads || 0);
    const verified = pkg.verified ? ' ✓' : '';
    const desc = pkg.description.substring(0, 50) + (pkg.description.length > 50 ? '...' : '');
    
    return `${pkg.name}${verified} - ${desc} (v${pkg.version}, ⬇ ${downloads}/week)`;
}

/**
 * Simple library input (no autocomplete)
 */
export async function simpleLibraryInput() {
    const libraries = [];
    let continueAdding = true;

    console.log(chalk.bold.cyan('\n📦 Add Libraries\n'));

    while (continueAdding) {
        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'library',
                message: 'Enter library name (or press Enter to skip):',
                validate: async (input) => {
                    if (!input) return true;
                    
                    // Basic validation
                    if (!input.match(/^[@a-z0-9-~][a-z0-9-._~]*$/)) {
                        return 'Invalid package name format';
                    }
                    
                    return true;
                }
            }
        ]);

        if (!answer.library) {
            break;
        }

        const versionAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'version',
                message: `Enter version for ${answer.library} (or 'latest'):`,
                default: 'latest'
            }
        ]);

        libraries.push({
            name: answer.library,
            version: versionAnswer.version
        });

        console.log(chalk.green(`✓ Added ${answer.library}@${versionAnswer.version}\n`));

        const continueAnswer = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'continue',
                message: 'Add another library?',
                default: false
            }
        ]);

        continueAdding = continueAnswer.continue;
    }

    return libraries;
}

/**
 * Ask user for library search preference
 */
export async function askLibrarySearchPreference() {
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'method',
            message: 'How would you like to add libraries?',
            choices: [
                { name: 'Interactive search with autocomplete (Recommended)', value: 'interactive' },
                { name: 'Manual entry', value: 'manual' },
                { name: 'Choose from popular bundles', value: 'bundles' },
                { name: 'Skip for now', value: 'skip' }
            ],
            default: 'interactive'
        }
    ]);

    return answer.method;
}
