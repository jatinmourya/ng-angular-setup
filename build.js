import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

/**
 * Convert ES Module URL to file path
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Detect environment
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Main build function
 */
async function build() {
  try {
    console.log('🔨 Building project with esbuild...');
    console.log(`📍 Mode: ${isProduction ? 'production' : 'development'}`);

    const result = await esbuild.build({
      /**
       * Entry points of the application
       */
      entryPoints: [join(__dirname, 'src/index.js')],

      /**
       * Enable bundling
       */
      bundle: true, // Disable bundling for faster builds; set to true if you want to bundle dependencies

      /**
       * Output file (single entry = outfile, multiple = outdir)
       * WHY: CLI apps typically produce a single executable file
       */
      outfile: 'dist/cli.js',

      /**
       * Platform target
       */
      platform: 'node',

      /**
       * JavaScript target version
       */
      target: 'node18',

      /**
       * Module format
       */
      format: 'esm',

      /**
       * Add shebang and ESM compatibility banner
       * WHY:
       * - Shebang: Makes the file executable as a CLI command
       * - ESM Banner: Provides __dirname, __filename, require() polyfills
       */
      banner: {
        js: `#!/usr/bin/env node`,
      },

      /**
       * Minification
       */
      minify: isProduction,

      /**
       * Source maps
       * WHY: 'linked' creates separate .map file with reference in output
       */
      sourcemap: isProduction ? false : 'linked',

      /**
       * Preserve function/class names
       */
      keepNames: true,

      /**
       * Tree shaking
       */
      treeShaking: true,

      /**
       * Legal comments handling
       * WHY: 'external' puts them in separate file if needed
       */
      legalComments: isProduction ? 'none' : 'inline',

      /**
       * Define global constants
       */
      define: {
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? 'production' : 'development'
        ),
      },

      /**
       * Generate metadata file for bundle analysis
       */
      metafile: true,

      /**
       * Log level
       */
      logLevel: 'info',

      /**
       * Packages handling
       * WHY: 'bundle' = include node_modules in output (default for platform: node)
       * Alternative: 'external' to exclude all node_modules
       */
      packages: 'external',

      /**
       * Splitting (code splitting for multiple entry points)
       * WHY: Disabled for CLI - we want a single file
       * Note: Only works with outdir, not outfile
       */
      // splitting: false, // default

      /**
       * Charset for output
       * WHY: Ensures proper UTF-8 handling
       */
      charset: 'utf8',
    });

    // Generate bundle analysis
    if (result.metafile) {
      const analysis = await esbuild.analyzeMetafile(result.metafile, {
        verbose: !isProduction,
      });
      console.log('\n📊 Bundle Analysis:');
      console.log(analysis);

      // Save metafile for external tools
      if (!isProduction) {
        writeFileSync(
          'dist/meta.json',
          JSON.stringify(result.metafile, null, 2)
        );
      }
    }

    console.log('\n✅ Build completed successfully!');
    console.log('📦 Output: dist/cli.js');

    // Make file executable on Unix systems
    if (process.platform !== 'win32') {
      const { chmodSync } = await import('fs');
      chmodSync('dist/cli.js', '755');
      console.log('🔑 Made output executable (chmod 755)');
    }

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

/**
 * Watch mode for development
 */
async function watch() {
  console.log('👀 Starting watch mode...');

  const ctx = await esbuild.context({
    entryPoints: [join(__dirname, 'src/index.js')],
    bundle: false, // Disable bundling for faster rebuilds in watch mode
    outfile: 'dist/cli.js',
    platform: 'node',
    target: 'node18',
    format: 'esm',
    banner: {
      js: `#!/usr/bin/env node`,
    },
    sourcemap: 'linked',
    keepNames: true,
    logLevel: 'info',
    charset: 'utf8',
  });

  await ctx.watch();
  console.log('✅ Watching for changes...');
}

/**
 * Run appropriate mode
 */
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

if (isWatch) {
  watch();
} else {
  build();
}