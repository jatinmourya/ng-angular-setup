import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join, relative } from 'path';
import { readdir, mkdir, copyFile, rm, stat } from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
// Detect mode from CLI flags
const isWatchMode =
    process.argv.includes('--watch') ||
    process.argv.includes('-w');

const MODE = isWatchMode ? 'development' : 'production';

// Configuration
const CONFIG = {
    srcDir: join(__dirname, 'src'),
    distDir: join(__dirname, 'dist'),
    nodeModulesDir: join(__dirname, 'node_modules'),

    mode: MODE,
    isDevelopment: MODE === 'development',
    isProduction: MODE === 'production'
};


/**
 * Recursively get all JavaScript files from a directory
 */
async function getAllJsFiles(dir) {
    const files = [];

    try {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);

            if (entry.isDirectory()) {
                // Skip test directories
                if (!entry.name.includes('test') && !entry.name.includes('__tests__')) {
                    files.push(...await getAllJsFiles(fullPath));
                }
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                // Skip test files
                if (!entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
                    files.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.warn(`⚠️  Warning: Could not read directory ${dir}:`, error.message);
    }

    return files;
}

/**
 * Copy non-JavaScript assets (templates, configs, etc.)
 */
async function copyAssets() {
    const assetPatterns = [
        '**/*.json',
        '**/*.txt',
        '**/*.md',
        '**/*.yml',
        '**/*.yaml',
        '**/templates/**/*',
    ];

    console.log('📋 Copying assets...');

    async function copyDir(src, dest) {
        try {
            const entries = await readdir(src, { withFileTypes: true });

            for (const entry of entries) {
                const srcPath = join(src, entry.name);
                const destPath = join(dest, entry.name);

                if (entry.isDirectory()) {
                    // Skip node_modules and test directories
                    if (!entry.name.includes('node_modules') &&
                        !entry.name.includes('test') &&
                        !entry.name.includes('__tests__')) {
                        await mkdir(destPath, { recursive: true });
                        await copyDir(srcPath, destPath);
                    }
                } else if (entry.isFile()) {
                    // Copy non-JS files or template files
                    if (!entry.name.endsWith('.js') || srcPath.includes('templates')) {
                        const destDir = dirname(destPath);
                        await mkdir(destDir, { recursive: true });

                        // For template files, preserve them as-is
                        if (srcPath.includes('templates') && entry.name.endsWith('.js')) {
                            await copyFile(srcPath, destPath);
                            console.log(`  ↳ Copied template: ${relative(CONFIG.srcDir, srcPath)}`);
                        } else if (!entry.name.endsWith('.js')) {
                            await copyFile(srcPath, destPath);
                            console.log(`  ↳ Copied asset: ${relative(CONFIG.srcDir, srcPath)}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn(`⚠️  Warning: Could not copy assets from ${src}:`, error.message);
        }
    }

    await copyDir(CONFIG.srcDir, CONFIG.distDir);
}

/**
 * Clean the dist directory before building
 */
async function cleanDist() {
    if (existsSync(CONFIG.distDir)) {
        console.log('🧹 Cleaning dist directory...');
        await rm(CONFIG.distDir, { recursive: true, force: true });
    }
    await mkdir(CONFIG.distDir, { recursive: true });
}

/**
 * Create package.json for the dist folder
 */
async function createDistPackageJson() {
    const packageJsonPath = join(__dirname, 'package.json');

    if (existsSync(packageJsonPath)) {
        const { default: pkg } = await import(packageJsonPath, {
            assert: { type: 'json' }
        });

        // Create a minimal package.json for dist
        const distPackage = {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description,
            type: 'module',
            bin: pkg.bin,
            engines: pkg.engines || { node: '>=18.0.0' },
            dependencies: pkg.dependencies || {},
            author: pkg.author,
            license: pkg.license
        };

        const distPackagePath = join(CONFIG.distDir, 'package.json');
        await import('fs/promises').then(fs =>
            fs.writeFile(distPackagePath, JSON.stringify(distPackage, null, 2))
        );

        console.log('📦 Created dist/package.json');
    }
}

/**
 * Main build function
 */
async function build() {
    const startTime = Date.now();

    try {
        console.log('🚀 Starting build process...');
        console.log(`📁 Source: ${CONFIG.srcDir}`);
        console.log(`📁 Output: ${CONFIG.distDir}`);
        console.log(`🔧 Mode: ${CONFIG.mode.toUpperCase()}`);
        console.log('');

        // Step 1: Clean dist directory
        await cleanDist();

        // Step 2: Get all JavaScript files
        const srcFiles = await getAllJsFiles(CONFIG.srcDir);

        if (srcFiles.length === 0) {
            throw new Error('No JavaScript files found in src directory');
        }

        console.log(`📝 Found ${srcFiles.length} JavaScript files to build`);

        // Step 3: Build configuration
        const buildConfig = {
            entryPoints: srcFiles,
            bundle: false, // Keep files separate as requested
            minify: CONFIG.isProduction, // Only minify in production
            target: 'node18', // Target Node.js 18+
            platform: 'node',
            format: 'esm', // Use ES modules
            outdir: CONFIG.distDir,
            outbase: CONFIG.srcDir,
            sourcemap: CONFIG.isDevelopment ? 'inline' : false, // Sourcemaps in dev
            keepNames: true, // Preserve function names for debugging
            treeShaking: CONFIG.isProduction, // Tree-shake in production
            legalComments: 'none',
            metafile: true, // Generate build metadata

            // Important for CLI apps
            external: [
                // External Node.js built-in modules
                'fs', 'path', 'url', 'util', 'os', 'crypto', 'child_process',
                'readline', 'stream', 'events', 'buffer', 'process', 'console',

                // Keep node_modules external (not bundled)
                './node_modules/*',
                '../node_modules/*',
                '../../node_modules/*',

                // Common CLI dependencies that should stay external
                'commander', 'yargs', 'inquirer', 'chalk', 'ora', 'execa',
            ],

            // Define environment variables
            define: {
                'process.env.NODE_ENV': JSON.stringify(CONFIG.mode),
                '__dirname': JSON.stringify(CONFIG.distDir),
            },

            // Logging
            logLevel: 'info',

            // Error handling
            logLimit: 10,
        };

        // Step 4: Run esbuild
        console.log('🔨 Building JavaScript files...');
        const result = await esbuild.build(buildConfig);

        // Step 5: Copy assets and templates
        await copyAssets();

        // Step 6: Create package.json in dist
        await createDistPackageJson();

        // Step 7: Display build results
        const endTime = Date.now();
        const buildTime = ((endTime - startTime) / 1000).toFixed(2);

        console.log('');
        console.log('✅ Build completed successfully!');
        console.log(`⏱️  Build time: ${buildTime}s`);
        console.log(`📦 Output directory: ${CONFIG.distDir}`);

        // Display build statistics if metafile is available
        if (result.metafile) {
            const outputs = Object.keys(result.metafile.outputs);
            console.log(`📊 Generated ${outputs.length} files`);

            // Calculate total size
            let totalSize = 0;
            for (const output of outputs) {
                totalSize += result.metafile.outputs[output].bytes;
            }

            console.log(`💾 Total size: ${(totalSize / 1024).toFixed(2)} KB`);
        }

        // Step 8: Additional recommendations
        console.log('');
        console.log('💡 Next steps:');
        console.log('  1. Test the built application: node dist/index.js');
        console.log('  2. Consider adding a shebang to index.js for CLI usage');
        console.log('  3. Update package.json bin field to point to dist/index.js');

    } catch (error) {
        console.error('');
        console.error('❌ Build failed:', error.message);

        if (error.errors && error.errors.length > 0) {
            console.error('');
            console.error('Build errors:');
            error.errors.forEach((err, index) => {
                console.error(`  ${index + 1}. ${err.text}`);
                if (err.location) {
                    console.error(`     at ${err.location.file}:${err.location.line}:${err.location.column}`);
                }
            });
        }

        process.exit(1);
    }
}

// Handle watch mode
async function watch() {
    console.log('👀 Starting watch mode...');

    const ctx = await esbuild.context({
        entryPoints: await getAllJsFiles(CONFIG.srcDir),
        bundle: false,
        minify: false,
        target: 'node18',
        platform: 'node',
        format: 'esm',
        outdir: CONFIG.distDir,
        outbase: CONFIG.srcDir,
        sourcemap: 'inline',
        keepNames: true,
        external: ['./node_modules/*', '../node_modules/*', '../../node_modules/*'],
    });

    await ctx.watch();
    console.log('👀 Watching for changes... (Press Ctrl+C to stop)');
}

// Run the appropriate build mode
if (process.argv.includes('--watch') || process.argv.includes('-w')) {
    watch();
} else {
    build();
}