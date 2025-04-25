#!/usr/bin/env node

/**
 * Direct fix for @tiptap/pm in both Docker and local environments
 * This script modifies the package.json and creates properly structured exports
 * Run this script BEFORE building with: npm run fix-tiptap
 */

const fs = require('fs');
const path = require('path');

// Check multiple possible paths for node_modules
const possiblePaths = [
  // Docker paths
  '/var/www/html/node_modules/@tiptap/pm',
  // Local paths
  './node_modules/@tiptap/pm',
  path.resolve('./node_modules/@tiptap/pm')
];

// Find the first path that exists
let PM_PATH = null;
for (const pathToCheck of possiblePaths) {
  if (fs.existsSync(pathToCheck)) {
    PM_PATH = pathToCheck;
    break;
  }
}

if (!PM_PATH) {
  console.error('❌ ERROR: @tiptap/pm not found in any of the expected locations');
  console.error('Please make sure @tiptap/pm is installed. Try running: npm install');
  process.exit(1);
}

console.log(`🔧 Fixing @tiptap/pm package.json at ${PM_PATH}...`);

// Create a correct index.js file with proper exports
const indexDistPath = path.join(PM_PATH, 'dist', 'index.js');
console.log(`Creating index.js at ${indexDistPath}...`);

// Make sure dist directory exists
const distDir = path.join(PM_PATH, 'dist');
if (!fs.existsSync(distDir)) {
  console.log(`Creating dist directory at ${distDir}...`);
  fs.mkdirSync(distDir, { recursive: true });
}

const indexContent = `
/**
 * Fixed @tiptap/pm index file
 */

// Export all submodules as namespaces
export * as model from './model.js';
export * as state from './state.js';
export * as view from './view.js';
export * as transform from './transform.js';
export * as commands from './commands.js';
export * as keymap from './keymap.js';
export * as schema_list from './schema-list.js';
export * as schema_basic from './schema-basic.js';

// Main exports
export { Schema, DOMParser, DOMSerializer, Fragment, Node, Mark } from './model.js';
export { Plugin, PluginKey, TextSelection, Selection, EditorState } from './state.js';
export { EditorView, Decoration, DecorationSet } from './view.js';
export { Transform, Step, StepResult } from './transform.js';
export { keymap } from './keymap.js';
`;

fs.writeFileSync(indexDistPath, indexContent);
console.log('✅ Created index.js file');

// Fix the package.json
const pkgPath = path.join(PM_PATH, 'package.json');
try {
  console.log(`Updating package.json at ${pkgPath}...`);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  // Ensure we have proper exports field
  pkg.exports = {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    },
    "./model": "./dist/model.js",
    "./state": "./dist/state.js",
    "./view": "./dist/view.js",
    "./transform": "./dist/transform.js",
    "./commands": "./dist/commands.js",
    "./keymap": "./dist/keymap.js",
    "./schema-list": "./dist/schema-list.js",
    "./schema-basic": "./dist/schema-basic.js",
    "./package.json": "./package.json"
  };
  
  // Update main and module fields
  pkg.main = "./dist/index.js";
  pkg.module = "./dist/index.js";
  
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('✅ Updated package.json');
} catch (error) {
  console.error('❌ Failed to update package.json:', error);
  process.exit(1);
}

console.log('✅ @tiptap/pm package successfully fixed!');
console.log('🚀 You can now run your build command.'); 