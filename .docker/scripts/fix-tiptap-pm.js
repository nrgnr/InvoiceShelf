#!/usr/bin/env node

/**
 * This script fixes the @tiptap/pm package.json by adding proper exports
 * Run this with: node .docker/scripts/fix-tiptap-pm.js
 */

const fs = require('fs');
const path = require('path');

// Path to the package.json in node_modules
const packagePath = path.resolve('./node_modules/@tiptap/pm/package.json');

console.log(`Patching @tiptap/pm package.json at ${packagePath}`);

// Check if the file exists
if (!fs.existsSync(packagePath)) {
  console.error('ERROR: Cannot find @tiptap/pm package.json');
  process.exit(1);
}

try {
  // Read the existing package.json
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add exports field to fix the "Missing "." specifier" error
  pkg.exports = {
    '.': {
      'import': './dist/index.js',
      'require': './dist/index.cjs'
    },
    './model': {
      'import': './dist/model.js',
      'require': './dist/model.cjs'
    },
    './state': {
      'import': './dist/state.js',
      'require': './dist/state.cjs'
    },
    './view': {
      'import': './dist/view.js',
      'require': './dist/view.cjs'
    },
    './transform': {
      'import': './dist/transform.js',
      'require': './dist/transform.cjs'
    },
    './commands': {
      'import': './dist/commands.js',
      'require': './dist/commands.cjs'
    },
    './keymap': {
      'import': './dist/keymap.js',
      'require': './dist/keymap.cjs'
    },
    './schema-list': {
      'import': './dist/schema-list.js',
      'require': './dist/schema-list.cjs'
    },
    './schema-basic': {
      'import': './dist/schema-basic.js',
      'require': './dist/schema-basic.cjs'
    },
    './package.json': './package.json'
  };
  
  // Write the patched package.json
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  console.log('Successfully patched @tiptap/pm package.json');
} catch (error) {
  console.error('Error patching package.json:', error);
  process.exit(1);
} 