import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getAllJsFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function build() {
  try {
    console.log('🔨 Building project with esbuild...');
    
    // Get all JS files in src directory
    const srcFiles = await getAllJsFiles(join(__dirname, 'src'));
    
    // Build all files
    await esbuild.build({
      entryPoints: srcFiles,
      bundle: false, // Keep separate files for better debugging
      minify: true,
      target: 'node18',
      platform: 'node',
      format: 'esm',
      outdir: 'dist',
      outbase: 'src',
      sourcemap: false,
      keepNames: true, // Preserve function names for better stack traces
      treeShaking: true,
      legalComments: 'none',
    });
    
    console.log('✅ Build completed successfully!');
    console.log('📦 Minified files created in dist/');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
