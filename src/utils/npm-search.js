import axios from 'axios';
import debounce from 'lodash.debounce';

const NPM_REGISTRY_URL = 'https://registry.npmjs.org';
const NPM_SEARCH_URL = 'https://registry.npmjs.org/-/v1/search';
const NPM_DOWNLOADS_URL = 'https://api.npmjs.org/downloads/point/last-week';

/**
 * Search npm packages
 */
export async function searchNpmPackages(query, size = 10) {
    try {
        const response = await axios.get(NPM_SEARCH_URL, {
            params: {
                text: query,
                size: size
            },
            timeout: 5000
        });

        return response.data.objects.map(obj => ({
            name: obj.package.name,
            version: obj.package.version,
            description: obj.package.description || 'No description',
            author: obj.package.publisher?.username || 'Unknown',
            date: obj.package.date,
            verified: obj.package.publisher?.verified || false
        }));
    } catch (error) {
        console.error('Error searching npm packages:', error.message);
        return [];
    }
}

/**
 * Get package details from npm registry
 */
export async function getPackageDetails(packageName) {
    try {
        const response = await axios.get(`${NPM_REGISTRY_URL}/${packageName}`, {
            timeout: 5000
        });

        const latestVersion = response.data['dist-tags']?.latest;
        const versions = Object.keys(response.data.versions || {});

        return {
            name: response.data.name,
            description: response.data.description || 'No description',
            latestVersion: latestVersion,
            versions: versions,
            homepage: response.data.homepage,
            repository: response.data.repository,
            license: response.data.license,
            keywords: response.data.keywords || []
        };
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
}

/**
 * Get package download statistics
 */
export async function getPackageDownloads(packageName) {
    try {
        const response = await axios.get(`${NPM_DOWNLOADS_URL}/${packageName}`, {
            timeout: 5000
        });

        return response.data.downloads;
    } catch (error) {
        return 0;
    }
}

/**
 * Validate if a package exists on npm
 */
export async function validatePackage(packageName) {
    const details = await getPackageDetails(packageName);
    return details !== null;
}

/**
 * Get enhanced package info (details + downloads)
 */
export async function getEnhancedPackageInfo(packageName) {
    try {
        const [details, downloads] = await Promise.all([
            getPackageDetails(packageName),
            getPackageDownloads(packageName)
        ]);

        if (!details) {
            return null;
        }

        return {
            ...details,
            weeklyDownloads: downloads
        };
    } catch (error) {
        console.error(`Error getting package info for ${packageName}:`, error.message);
        return null;
    }
}

/**
 * Format download count for display
 */
export function formatDownloads(downloads) {
    if (downloads >= 1000000) {
        return `${(downloads / 1000000).toFixed(1)}M`;
    } else if (downloads >= 1000) {
        return `${(downloads / 1000).toFixed(1)}K`;
    }
    return downloads.toString();
}

/**
 * Debounced search function for autocomplete
 */
export const debouncedSearch = debounce(async (query, callback) => {
    if (!query || query.length < 2) {
        callback([]);
        return;
    }

    const results = await searchNpmPackages(query, 10);
    callback(results);
}, 300);

/**
 * Get all versions of Angular CLI
 */
export async function getAngularVersions() {
    try {
        const response = await axios.get(`${NPM_REGISTRY_URL}/@angular/cli`, {
            timeout: 10000
        });

        const versions = Object.keys(response.data.versions || {})
            .filter(v => !v.includes('rc') && !v.includes('beta') && !v.includes('next'))
            .sort((a, b) => {
                // Sort in descending order (newest first)
                const aParts = a.split('.').map(Number);
                const bParts = b.split('.').map(Number);
                
                for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                    const aVal = aParts[i] || 0;
                    const bVal = bParts[i] || 0;
                    if (aVal !== bVal) return bVal - aVal;
                }
                return 0;
            });

        const distTags = response.data['dist-tags'] || {};
        
        return {
            versions: versions,
            latest: distTags.latest,
            lts: distTags.lts
        };
    } catch (error) {
        console.error('Error fetching Angular versions:', error.message);
        return { versions: [], latest: null, lts: null };
    }
}

/**
 * Get Node.js version requirements for Angular version
 */
export async function getNodeRequirementsForAngular(angularVersion) {
    try {
        const response = await axios.get(`${NPM_REGISTRY_URL}/@angular/cli/${angularVersion}`, {
            timeout: 5000
        });

        const engines = response.data.engines || {};
        const nodeRequirement = engines.node || '^18.13.0 || ^20.9.0';
        
        return nodeRequirement;
    } catch (error) {
        // Default Node requirements if we can't fetch
        const majorVersion = parseInt(angularVersion.split('.')[0]);
        
        if (majorVersion >= 17) return '^18.13.0 || ^20.9.0';
        if (majorVersion >= 16) return '^16.14.0 || ^18.10.0';
        if (majorVersion >= 15) return '^14.20.0 || ^16.13.0 || ^18.10.0';
        if (majorVersion >= 14) return '^14.15.0 || ^16.10.0';
        
        return '^14.0.0 || ^16.0.0 || ^18.0.0';
    }
}
