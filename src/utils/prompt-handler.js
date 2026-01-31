import inquirer from 'inquirer';
import inquirerAutocomplete from 'inquirer-autocomplete-prompt';
import chalk from 'chalk';
import { searchNpmPackages, getEnhancedPackageInfo, formatDownloads, getPackageVersions, getMajorVersions, getMinorVersionsForMajor, getPatchVersionsForMinor, getPackagePeerDependencies, findCompatiblePackageVersions } from './npm-search.js';
import { checkLibraryCompatibility, isVersionCompatibleWithAngular, getAllCompatibleVersions } from './compatibility.js';

// Register autocomplete prompt
inquirer.registerPrompt('autocomplete', inquirerAutocomplete);

/**
 * Interactive library search with autocomplete
 */
export async function interactiveLibrarySearch(angularVersion = null) {
    const selectedLibraries = [];
    let continueSearching = true;

    console.log(chalk.bold.cyan('\n📦 Interactive Library Search\n'));
    if (angularVersion) {
        console.log(chalk.gray(`Angular version: ${angularVersion} (compatibility will be checked)\n`));
    }
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

                    // Ask for version selection method
                    const versionMethodAnswer = await inquirer.prompt([
                        {
                            type: 'list',
                            name: 'method',
                            message: 'How would you like to select the version?',
                            choices: [
                                { name: `Use latest (${info.latestVersion})`, value: 'latest' },
                                { name: 'Choose specific version (major.minor.patch)', value: 'specific' },
                                { name: 'Enter version manually', value: 'manual' }
                            ],
                            default: 'latest'
                        }
                    ]);

                    let version = info.latestVersion;
                    
                    if (versionMethodAnswer.method === 'specific') {
                        // Fetch all versions for the package
                        console.log(chalk.cyan(`\n📦 Fetching versions for ${info.name}...\n`));
                        const packageVersions = await getPackageVersions(info.name);

                        if (packageVersions.versions.length === 0) {
                            console.log(chalk.yellow('Could not fetch versions. Using latest version.'));
                            version = info.latestVersion;
                        } else {
                            // Step 1: Select Major Version
                            const majorVersions = getMajorVersions(packageVersions.versions);
                            const majorChoices = majorVersions.map(major => {
                                const label = `${info.name} ${major}`;
                                const isLatest = packageVersions.latest && packageVersions.latest.startsWith(`${major}.`);
                                return { 
                                    name: isLatest ? `${label} (latest)` : label, 
                                    value: major 
                                };
                            });

                            const majorAnswer = await inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'major',
                                    message: `Select ${info.name} major version:`,
                                    choices: majorChoices,
                                    pageSize: 15
                                }
                            ]);

                            // Step 2: Select Minor Version
                            const minorVersions = getMinorVersionsForMajor(packageVersions.versions, majorAnswer.major);
                            const minorChoices = minorVersions.map(minor => ({
                                name: `v${minor}.x`,
                                value: minor
                            }));

                            const minorAnswer = await inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'minor',
                                    message: `Select ${info.name} ${majorAnswer.major} minor version:`,
                                    choices: minorChoices,
                                    pageSize: 15
                                }
                            ]);

                            // Step 3: Select Patch Version
                            const patchVersions = getPatchVersionsForMinor(packageVersions.versions, minorAnswer.minor);
                            const patchChoices = patchVersions.map(patch => {
                                let label = `v${patch}`;
                                if (patch === packageVersions.latest) label += ' (latest)';
                                if (patch === packageVersions.lts) label += ' (LTS)';
                                return { name: label, value: patch };
                            });

                            const patchAnswer = await inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'patch',
                                    message: `Select ${info.name} ${minorAnswer.minor} patch version:`,
                                    choices: patchChoices,
                                    pageSize: 15
                                }
                            ]);

                            version = patchAnswer.patch;
                        }
                    } else if (versionMethodAnswer.method === 'manual') {
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

                    // Check compatibility with Angular version if provided
                    if (angularVersion && version !== 'latest') {
                        console.log(chalk.cyan(`\n🔍 Checking compatibility with Angular ${angularVersion}...\n`));
                        
                        // Use dynamic compatibility check
                        const compatibility = await isVersionCompatibleWithAngular(info.name, version, angularVersion);
                        
                        if (compatibility.compatible) {
                            console.log(chalk.green(`✓ ${info.name}@${version} is compatible with Angular ${angularVersion}`));
                            if (compatibility.peerDependency) {
                                console.log(chalk.gray(`  Peer dependency: ${compatibility.peerDependency}\n`));
                            }
                        } else {
                            console.log(chalk.red(`✗ ${info.name}@${version} may not be compatible with Angular ${angularVersion}`));
                            console.log(chalk.gray(`  ${compatibility.reason}\n`));
                            
                            // Suggest compatible versions
                            const suggestAnswer = await inquirer.prompt([
                                {
                                    type: 'confirm',
                                    name: 'suggest',
                                    message: 'Would you like to see compatible versions?',
                                    default: true
                                }
                            ]);

                            if (suggestAnswer.suggest) {
                                console.log(chalk.cyan(`\n🔍 Dynamically searching for compatible versions...\n`));
                                // Use dynamic compatibility search
                                const compatibleVersions = await getAllCompatibleVersions(info.name, angularVersion, 10);
                                
                                if (compatibleVersions.length > 0) {
                                    const versionChoices = compatibleVersions.map(cv => ({
                                        name: `${cv.version}${cv.peerDependency ? ` (peer: ${cv.peerDependency})` : ''}`,
                                        value: cv.version
                                    }));
                                    
                                    versionChoices.push({ name: 'Keep selected version anyway', value: version });

                                    const compatibleAnswer = await inquirer.prompt([
                                        {
                                            type: 'list',
                                            name: 'version',
                                            message: 'Select a compatible version:',
                                            choices: versionChoices,
                                            pageSize: 12
                                        }
                                    ]);

                                    version = compatibleAnswer.version;
                                } else {
                                    console.log(chalk.yellow('No compatible versions found automatically.'));
                                    const keepAnswer = await inquirer.prompt([
                                        {
                                            type: 'confirm',
                                            name: 'keep',
                                            message: 'Continue with the selected version anyway?',
                                            default: false
                                        }
                                    ]);

                                    if (!keepAnswer.keep) {
                                        console.log(chalk.yellow('Skipping this library.\n'));
                                        const continueAnswer = await inquirer.prompt([
                                            {
                                                type: 'confirm',
                                                name: 'continue',
                                                message: 'Add another library?',
                                                default: true
                                            }
                                        ]);

                                        continueSearching = continueAnswer.continue;
                                        continue;
                                    }
                                }
                            }
                        }
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
export async function simpleLibraryInput(angularVersion = null) {
    const libraries = [];
    let continueAdding = true;

    console.log(chalk.bold.cyan('\n📦 Add Libraries\n'));
    if (angularVersion) {
        console.log(chalk.gray(`Angular version: ${angularVersion} (compatibility will be checked)\n`));
    }

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

        const version = versionAnswer.version;

        // Check compatibility with Angular version if provided
        if (angularVersion && version !== 'latest') {
            console.log(chalk.cyan(`\n🔍 Checking compatibility with Angular ${angularVersion}...\n`));
            
            // Use dynamic compatibility check
            const compatibility = await isVersionCompatibleWithAngular(answer.library, version, angularVersion);
            
            if (compatibility.compatible) {
                console.log(chalk.green(`✓ ${answer.library}@${version} is compatible with Angular ${angularVersion}`));
                if (compatibility.peerDependency) {
                    console.log(chalk.gray(`  Peer dependency: ${compatibility.peerDependency}\n`));
                }
            } else {
                console.log(chalk.red(`✗ ${answer.library}@${version} may not be compatible with Angular ${angularVersion}`));
                console.log(chalk.gray(`  ${compatibility.reason}\n`));
                console.log(chalk.yellow('⚠️  This may cause installation issues. Consider using a different version.\n'));
            }
        }

        libraries.push({
            name: answer.library,
            version: version
        });

        console.log(chalk.green(`✓ Added ${answer.library}@${version}\n`));

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
