import semver from 'semver';
import chalk from 'chalk';
import axios from 'axios';

const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

// Cache for npm registry responses to avoid repeated requests
const packageCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
 * This is fetched dynamically but we keep a fallback for offline use
 */
export async function getAngularNodeCompatibility(angularVersion) {
    try {
        // Fetch from @angular/cli package to get accurate engine requirements
        const response = await axios.get(`${NPM_REGISTRY_URL}/@angular/cli/${angularVersion}`, {
            timeout: 5000
        });
        
        const engines = response.data.engines || {};
        return engines.node || null;
    } catch (error) {
        // Fallback to estimated requirements based on major version
        return null;
    }
}

// Fallback matrix only used when npm registry is unavailable
const ANGULAR_NODE_FALLBACK = {
    '19': '^18.19.1 || ^20.11.1 || ^22.0.0',
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

// Keep backward compatibility export
export const ANGULAR_NODE_COMPATIBILITY = ANGULAR_NODE_FALLBACK;

/**
 * Get Node requirement from compatibility matrix (with dynamic fetch)
 */
export async function getNodeRequirementFromMatrix(angularVersion) {
    // First try to fetch dynamically
    const dynamicRequirement = await getAngularNodeCompatibility(angularVersion);
    if (dynamicRequirement) {
        return dynamicRequirement;
    }
    
    // Fallback to static matrix
    const majorVersion = angularVersion.split('.')[0];
    return ANGULAR_NODE_FALLBACK[majorVersion] || '^18.13.0 || ^20.9.0';
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
 * Fetch package data from npm registry with caching
 */
async function fetchPackageData(packageName) {
    const cacheKey = packageName;
    const cached = packageCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    
    try {
        const response = await axios.get(`${NPM_REGISTRY_URL}/${encodeURIComponent(packageName)}`, {
            timeout: 10000
        });
        
        const data = response.data;
        packageCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.error(chalk.gray(`Could not fetch package data for ${packageName}: ${error.message}`));
        return null;
    }
}

/**
 * Fetch specific version data from npm registry
 */
async function fetchPackageVersionData(packageName, version) {
    try {
        const response = await axios.get(`${NPM_REGISTRY_URL}/${encodeURIComponent(packageName)}/${version}`, {
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        return null;
    }
}

/**
 * Get peer dependencies for a specific package version
 */
export async function getPackagePeerDependencies(packageName, version) {
    const versionData = await fetchPackageVersionData(packageName, version);
    return versionData?.peerDependencies || {};
}

/**
 * Check if a specific library version is compatible with Angular version
 */
export async function isVersionCompatibleWithAngular(packageName, version, angularVersion) {
    const peerDeps = await getPackagePeerDependencies(packageName, version);
    
    // Check for Angular peer dependencies
    const angularDep = peerDeps['@angular/core'] || peerDeps['@angular/common'];
    
    if (!angularDep) {
        // No Angular peer dependency - likely compatible
        return { compatible: true, reason: 'No Angular peer dependency' };
    }
    
    try {
        // Check if the Angular version satisfies the peer dependency
        const isCompatible = semver.satisfies(angularVersion, angularDep);
        return {
            compatible: isCompatible,
            peerDependency: angularDep,
            reason: isCompatible 
                ? `Angular ${angularVersion} satisfies ${angularDep}`
                : `Angular ${angularVersion} does not satisfy ${angularDep}`
        };
    } catch (error) {
        // If semver fails, try pattern matching as fallback
        const angularMajor = angularVersion.split('.')[0];
        const patterns = [`^${angularMajor}.`, `~${angularMajor}.`, `>=${angularMajor}.`, `${angularMajor}.`];
        const isCompatible = patterns.some(p => angularDep.includes(p));
        
        return {
            compatible: isCompatible,
            peerDependency: angularDep,
            reason: isCompatible 
                ? `Peer dependency appears compatible with Angular ${angularMajor}`
                : `Peer dependency ${angularDep} may not support Angular ${angularMajor}`
        };
    }
}

/**
 * Dynamically find a compatible version of a library for a given Angular version
 */
export async function findCompatibleLibraryVersion(packageName, angularVersion, preferLatest = true) {
    const packageData = await fetchPackageData(packageName);
    
    if (!packageData) {
        return { version: 'latest', source: 'fallback', reason: 'Could not fetch package data' };
    }
    
    const angularMajor = parseInt(angularVersion.split('.')[0]);
    const versions = Object.keys(packageData.versions || {})
        .filter(v => !v.includes('rc') && !v.includes('beta') && !v.includes('alpha') && !v.includes('next'))
        .sort((a, b) => semver.rcompare(a, b)); // Newest first
    
    // For Angular-scoped packages, try to match major version first
    if (packageName.startsWith('@angular/')) {
        const matchingVersions = versions.filter(v => {
            const vMajor = parseInt(v.split('.')[0]);
            return vMajor === angularMajor;
        });
        
        if (matchingVersions.length > 0) {
            return { 
                version: `^${matchingVersions[0]}`, 
                source: 'dynamic', 
                reason: `Matched Angular major version ${angularMajor}` 
            };
        }
    }
    
    // For other packages, check peer dependencies
    const compatibleVersions = [];
    
    // Check up to 20 versions to find compatible ones (for performance)
    const versionsToCheck = versions.slice(0, 20);
    
    for (const version of versionsToCheck) {
        const compatibility = await isVersionCompatibleWithAngular(packageName, version, angularVersion);
        
        if (compatibility.compatible) {
            compatibleVersions.push({
                version,
                peerDependency: compatibility.peerDependency
            });
            
            // If we found a compatible version and prefer latest, return immediately
            if (preferLatest) {
                return {
                    version: `^${version}`,
                    source: 'dynamic',
                    reason: compatibility.reason,
                    peerDependency: compatibility.peerDependency
                };
            }
        }
    }
    
    if (compatibleVersions.length > 0) {
        const selected = compatibleVersions[0];
        return {
            version: `^${selected.version}`,
            source: 'dynamic',
            reason: `Found ${compatibleVersions.length} compatible version(s)`,
            peerDependency: selected.peerDependency
        };
    }
    
    // No compatible version found, return latest with warning
    const latest = packageData['dist-tags']?.latest;
    return {
        version: latest ? `^${latest}` : 'latest',
        source: 'fallback',
        reason: 'No version with compatible Angular peer dependency found',
        warning: true
    };
}

/**
 * Get compatible version for a library based on Angular version (async version)
 */
export async function getCompatibleLibraryVersionAsync(libraryName, angularVersion) {
    const result = await findCompatibleLibraryVersion(libraryName, angularVersion);
    return result.version;
}

/**
 * Get compatible version for a library based on Angular version (sync fallback)
 * @deprecated Use getCompatibleLibraryVersionAsync for accurate results
 */
export function getCompatibleLibraryVersion(libraryName, angularVersion) {
    const angularMajor = angularVersion.split('.')[0];
    
    // For Angular-scoped packages, match the major version
    if (libraryName.startsWith('@angular/')) {
        return `^${angularMajor}.0.0`;
    }
    
    // For NgRx packages, they follow Angular versioning
    if (libraryName.startsWith('@ngrx/')) {
        return `^${angularMajor}.0.0`;
    }
    
    // Default to latest for other packages
    return 'latest';
}

/**
 * Resolve library versions for compatibility with Angular (async version)
 */
export async function resolveLibraryVersionsAsync(libraries, angularVersion) {
    const resolved = [];
    
    for (const lib of libraries) {
        const requestedVersion = lib.version || 'latest';
        
        if (requestedVersion === 'latest') {
            const result = await findCompatibleLibraryVersion(lib.name, angularVersion);
            
            resolved.push({
                ...lib,
                version: result.version,
                originalVersion: requestedVersion,
                adjusted: result.source === 'dynamic',
                source: result.source,
                reason: result.reason,
                warning: result.warning || false
            });
        } else {
            // Verify the specific version is compatible
            const compatibility = await isVersionCompatibleWithAngular(lib.name, requestedVersion.replace(/[\^~]/, ''), angularVersion);
            
            resolved.push({
                ...lib,
                adjusted: false,
                compatible: compatibility.compatible,
                reason: compatibility.reason,
                warning: !compatibility.compatible
            });
        }
    }
    
    return resolved;
}

/**
 * Resolve library versions for compatibility with Angular (sync fallback)
 */
export function resolveLibraryVersions(libraries, angularVersion) {
    return libraries.map(lib => {
        const requestedVersion = lib.version || 'latest';
        
        if (requestedVersion === 'latest') {
            const compatibleVersion = getCompatibleLibraryVersion(lib.name, angularVersion);
            return {
                ...lib,
                version: compatibleVersion,
                originalVersion: requestedVersion,
                adjusted: compatibleVersion !== 'latest'
            };
        }
        
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
        // Use semver to check if Angular version satisfies the peer dependency
        const isCompatible = semver.satisfies(angularVersion, peerDependency);
        
        if (isCompatible) {
            return { 
                compatible: true, 
                reason: `Angular ${angularVersion} satisfies peer dependency '${peerDependency}'` 
            };
        } else {
            return { 
                compatible: false, 
                reason: `Angular ${angularVersion} does not satisfy peer dependency '${peerDependency}'` 
            };
        }
    } catch (error) {
        // Fallback to pattern matching if semver fails (for complex ranges)
        const angularMajor = angularVersion.split('.')[0];
        const patterns = [
            `^${angularMajor}.`,
            `~${angularMajor}.`,
            `>=${angularMajor}.`,
            `${angularMajor}.x`,
            `${angularMajor}.0.0`,
            ` ${angularMajor}.`
        ];

        const isCompatible = patterns.some(pattern => peerDependency.includes(pattern));

        if (isCompatible) {
            return { 
                compatible: true, 
                reason: `Peer dependency '${peerDependency}' appears compatible with Angular ${angularMajor}` 
            };
        } else {
            return { 
                compatible: false, 
                reason: `Peer dependency '${peerDependency}' may not support Angular ${angularMajor}` 
            };
        }
    }
}

/**
 * Get all compatible versions of a package for a given Angular version
 */
export async function getAllCompatibleVersions(packageName, angularVersion, maxResults = 10) {
    const packageData = await fetchPackageData(packageName);
    
    if (!packageData) {
        return [];
    }
    
    const versions = Object.keys(packageData.versions || {})
        .filter(v => !v.includes('rc') && !v.includes('beta') && !v.includes('alpha') && !v.includes('next'))
        .sort((a, b) => semver.rcompare(a, b));
    
    const compatibleVersions = [];
    
    for (const version of versions) {
        if (compatibleVersions.length >= maxResults) break;
        
        const compatibility = await isVersionCompatibleWithAngular(packageName, version, angularVersion);
        
        if (compatibility.compatible) {
            compatibleVersions.push({
                version,
                peerDependency: compatibility.peerDependency,
                reason: compatibility.reason
            });
        }
    }
    
    return compatibleVersions;
}
