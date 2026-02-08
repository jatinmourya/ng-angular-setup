#!/usr/bin/env node

import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

/**
 * Resolve __dirname in ESM
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Detect mode from CLI
 */
const isWatch =
  process.argv.includes('--watch') ||
  process.argv.includes('-w');

const MODE = isWatch ? 'development' : 'production';
const isProd = MODE === 'production';

/**
 * Paths
 */
const SRC_ENTRY = join(__dirname, 'src/index.js');
const DIST_DIR = join(__dirname, 'dist');
const OUT_FILE = join(DIST_DIR, 'cli.js');

/**
 * Clean dist folder
 */
async function clean() {
  if (existsSync(DIST_DIR)) {
    await rm(DIST_DIR, { recursive: true, force: true });
  }

  await mkdir(DIST_DIR, { recursive: true });
}

/**
 * Base esbuild config
 */
function getConfig() {
  return {
    entryPoints: [SRC_ENTRY],

    bundle: true, // ✅ Required for CLI

    outfile: OUT_FILE,

    platform: 'node',

    target: 'node18',

    format: 'esm',

    /**
     * Make CLI executable
     */
    banner: {
      js: '#!/usr/bin/env node',
    },

    minify: isProd,

    sourcemap: isProd ? false : 'linked',

    keepNames: true,

    treeShaking: true,

    /**
     * Keep node_modules external
     */
    packages: 'external',

    define: {
      'process.env.NODE_ENV': JSON.stringify(MODE),
    },

    metafile: true,

    logLevel: 'info',
  };
}

/**
 * Build once
 */
async function build() {
  try {
    console.log('🚀 Building CLI...');
    console.log(`🔧 Mode: ${MODE.toUpperCase()}`);

    await clean();

    const result = await esbuild.build(getConfig());

    console.log('\n✅ Build successful');
    console.log('📦 Output: dist/cli.js');

    if (result.metafile) {
      const analysis = await esbuild.analyzeMetafile(result.metafile, {
        verbose: !isProd,
      });

      if (!isProd) {
        console.log('\n📊 Bundle analysis:\n');
        console.log(analysis);
      }
    }

  } catch (err) {
    console.error('\n❌ Build failed');
    console.error(err);
    process.exit(1);
  }
}

/**
 * Watch mode
 */
async function watch() {
  console.log('👀 Watch mode enabled');

  await clean();

  const ctx = await esbuild.context(getConfig());

  await ctx.watch();

  console.log('✅ Watching for changes...');
}

/**
 * Run
 */
if (isWatch) {
  watch();
} else {
  build();
}
