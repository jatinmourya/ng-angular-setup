import semver from 'semver';
import chalk from 'chalk';

/**
 * Check if current Node version is compatible with Angular version
 */
export function checkNodeCompatibility(currentNodeVersion, requiredNodeVersion) {
    try {
        const isCompatible = semver.satisfies(currentNodeVersion, requiredNodeVersion);
        return {
            compatible: isCompatible,
            current: currentNodeVersion,
            required: requiredNodeVersion
        };
    } catch (error) {
        return {
            compatible: false,
            current: currentNodeVersion,
            required: requiredNodeVersion,
            error: error.message
        };
    }
}

/**
 * Display compatibility status
 */
export function displayCompatibilityStatus(compatibility) {
    console.log(chalk.bold.cyan('\n📋 Compatibility Check\n'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(chalk.white('Current Node.js:  ') + chalk.cyan(`v${compatibility.current}`));
    console.log(chalk.white('Required Node.js: ') + chalk.cyan(compatibility.required));
    
    if (compatibility.compatible) {
        console.log(chalk.white('Status:           ') + chalk.green('✓ Compatible'));
    } else {
        console.log(chalk.white('Status:           ') + chalk.red('✗ Incompatible'));
    }
    
    console.log(chalk.gray('━'.repeat(50)) + '\n');
    
    return compatibility.compatible;
}

/**
 * Find compatible Node versions from available versions
 */
export function findCompatibleVersions(availableVersions, requiredRange) {
    try {
        return availableVersions.filter(version => {
            try {
                return semver.satisfies(version, requiredRange);
            } catch {
                return false;
            }
        }).sort((a, b) => semver.rcompare(a, b)); // Sort descending (newest first)
    } catch (error) {
        return [];
    }
}

/**
 * Get recommended Node version from range
 */
export function getRecommendedNodeVersion(requiredRange) {
    // Parse the range to get recommended version
    try {
        const ranges = requiredRange.split('||').map(r => r.trim());
        
        // Try to extract version numbers
        for (const range of ranges) {
            const match = range.match(/(\d+)\./);
            if (match) {
                const major = parseInt(match[1]);
                // Recommend LTS versions
                if (major === 20) return '20.11.0';
                if (major === 18) return '18.19.0';
                if (major === 16) return '16.20.2';
                if (major === 14) return '14.21.3';
            }
        }
        
        return '18.19.0'; // Default to Node 18 LTS
    } catch (error) {
        return '18.19.0';
    }
}

/**
 * Angular version to Node.js compatibility matrix
 */
export const ANGULAR_NODE_COMPATIBILITY = {
    '18': '^18.19.1 || ^20.11.1 || ^22.0.0',
    '17': '^18.13.0 || ^20.9.0',
    '16': '^16.14.0 || ^18.10.0',
    '15': '^14.20.0 || ^16.13.0 || ^18.10.0',
    '14': '^14.15.0 || ^16.10.0',
    '13': '^12.20.0 || ^14.15.0 || ^16.10.0',
    '12': '^12.20.0 || ^14.15.0',
    '11': '^10.13.0 || ^12.11.0',
    '10': '^10.13.0 || ^12.11.0'
};

/**
 * Get Node requirement from compatibility matrix
 */
export function getNodeRequirementFromMatrix(angularVersion) {
    const majorVersion = angularVersion.split('.')[0];
    return ANGULAR_NODE_COMPATIBILITY[majorVersion] || '^18.13.0 || ^20.9.0';
}

/**
 * Validate Angular version format
 */
export function isValidAngularVersion(version) {
    return semver.valid(version) !== null;
}

/**
 * Check if Angular CLI is installed globally
 */
export function needsAngularCli(currentAngularCliVersion, targetAngularVersion) {
    if (!currentAngularCliVersion) {
        return {
            needed: true,
            reason: 'Angular CLI is not installed'
        };
    }

    const currentMajor = parseInt(currentAngularCliVersion.split('.')[0]);
    const targetMajor = parseInt(targetAngularVersion.split('.')[0]);

    if (currentMajor !== targetMajor) {
        return {
            needed: true,
            reason: `Angular CLI version mismatch (current: ${currentMajor}, target: ${targetMajor})`,
            suggestion: `Consider using npx @angular/cli@${targetAngularVersion} instead`
        };
    }

    return {
        needed: false,
        reason: 'Angular CLI version is compatible'
    };
}

/**
 * Library compatibility matrix for Angular versions
 * Maps popular libraries to compatible versions based on Angular major version
 */
export const LIBRARY_COMPATIBILITY_MATRIX = {
    '@angular/material': {
        '18': '^18.0.0',
        '17': '^17.0.0',
        '16': '^16.0.0',
        '15': '^15.0.0',
        '14': '^14.0.0',
        '13': '^13.0.0',
        '12': '^12.0.0'
    },
    '@angular/cdk': {
        '18': '^18.0.0',
        '17': '^17.0.0',
        '16': '^16.0.0',
        '15': '^15.0.0',
        '14': '^14.0.0',
        '13': '^13.0.0',
        '12': '^12.0.0'
    },
    '@ng-bootstrap/ng-bootstrap': {
        '18': '^17.0.0',
        '17': '^16.0.0',
        '16': '^14.0.0',
        '15': '^13.0.0',
        '14': '^12.0.0',
        '13': '^10.0.0',
        '12': '^10.0.0'
    },
    '@ngrx/store': {
        '18': '^18.0.0',
        '17': '^17.0.0',
        '16': '^16.0.0',
        '15': '^15.0.0',
        '14': '^14.0.0',
        '13': '^13.0.0',
        '12': '^12.0.0'
    },
    '@ngrx/effects': {
        '18': '^18.0.0',
        '17': '^17.0.0',
        '16': '^16.0.0',
        '15': '^15.0.0',
        '14': '^14.0.0',
        '13': '^13.0.0',
        '12': '^12.0.0'
    },
    '@ngrx/entity': {
        '18': '^18.0.0',
        '17': '^17.0.0',
        '16': '^16.0.0',
        '15': '^15.0.0',
        '14': '^14.0.0',
        '13': '^13.0.0',
        '12': '^12.0.0'
    },
    '@ngrx/store-devtools': {
        '18': '^18.0.0',
        '17': '^17.0.0',
        '16': '^16.0.0',
        '15': '^15.0.0',
        '14': '^14.0.0',
        '13': '^13.0.0',
        '12': '^12.0.0'
    },
    '@angular/pwa': {
        '18': '^18.0.0',
        '17': '^17.0.0',
        '16': '^16.0.0',
        '15': '^15.0.0',
        '14': '^14.0.0',
        '13': '^13.0.0',
        '12': '^12.0.0'
    },
    '@angular/service-worker': {
        '18': '^18.0.0',
        '17': '^17.0.0',
        '16': '^16.0.0',
        '15': '^15.0.0',
        '14': '^14.0.0',
        '13': '^13.0.0',
        '12': '^12.0.0'
    },
    '@angular/fire': {
        '18': '^18.0.0',
        '17': '^17.0.0',
        '16': '^7.6.0',
        '15': '^7.5.0',
        '14': '^7.4.0',
        '13': '^7.2.0',
        '12': '^7.0.0'
    }
};

/**
 * Get compatible version for a library based on Angular version
 */
export function getCompatibleLibraryVersion(libraryName, angularVersion) {
    const angularMajor = angularVersion.split('.')[0];
    
    // Check if library is in compatibility matrix
    if (LIBRARY_COMPATIBILITY_MATRIX[libraryName]) {
        const compatibleVersion = LIBRARY_COMPATIBILITY_MATRIX[libraryName][angularMajor];
        if (compatibleVersion) {
            return compatibleVersion;
        }
    }
    
    // For Angular-scoped packages not in matrix, try to match version
    if (libraryName.startsWith('@angular/')) {
        return `^${angularMajor}.0.0`;
    }
    
    // Default to latest for other packages
    return 'latest';
}

/**
 * Resolve library versions for compatibility with Angular
 */
export function resolveLibraryVersions(libraries, angularVersion) {
    return libraries.map(lib => {
        const requestedVersion = lib.version || 'latest';
        
        // If version is 'latest', try to find compatible version
        if (requestedVersion === 'latest') {
            const compatibleVersion = getCompatibleLibraryVersion(lib.name, angularVersion);
            return {
                ...lib,
                version: compatibleVersion,
                originalVersion: requestedVersion,
                adjusted: compatibleVersion !== 'latest'
            };
        }
        
        // If a specific version is requested, keep it but flag potential incompatibility
        return {
            ...lib,
            adjusted: false
        };
    });
}

/**
 * Check if a library version is compatible with Angular version using semver
 */
export function checkLibraryCompatibility(peerDependency, angularVersion) {
    if (!peerDependency || peerDependency === 'No Angular peer dependency') {
        return { compatible: true, reason: 'No Angular peer dependency specified' };
    }

    try {
        const angularMajor = angularVersion.split('.')[0];
        
        // Check if the peer dependency includes the Angular major version
        const patterns = [
            `^${angularMajor}.`,
            `~${angularMajor}.`,
            `>=${angularMajor}.`,
            `${angularMajor}.x`,
            `${angularMajor}.0.0`
        ];

        const isCompatible = patterns.some(pattern => peerDependency.includes(pattern));

        if (isCompatible) {
            return { 
                compatible: true, 
                reason: `Peer dependency '${peerDependency}' is compatible with Angular ${angularVersion}` 
            };
        } else {
            return { 
                compatible: false, 
                reason: `Peer dependency requires '${peerDependency}' but Angular ${angularVersion} is being used` 
            };
        }
    } catch (error) {
        return { 
            compatible: false, 
            reason: `Error checking compatibility: ${error.message}` 
        };
    }
}
