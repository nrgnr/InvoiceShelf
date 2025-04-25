#!/usr/bin/env node

/**
 * This is a comprehensive fix for the TipTap PM build issue
 * It creates a proper ESM module that correctly imports from subpaths
 */

const fs = require('fs');
const path = require('path');

// Locations to check for modules
const possiblePaths = [
  './node_modules/@tiptap/pm',
  '/var/www/html/node_modules/@tiptap/pm',
  '/app/node_modules/@tiptap/pm'
];

let pmPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    pmPath = p;
    break;
  }
}

if (!pmPath) {
  console.error('ERROR: Cannot find @tiptap/pm in node_modules');
  process.exit(1);
}

console.log(`Found @tiptap/pm at ${pmPath}`);

// 1. Create a shim.js file in the @tiptap/pm directory
const shimPath = path.join(pmPath, 'shim.js');
console.log(`Creating shim file at ${shimPath}`);

const shimContent = `
// This is a compatibility shim for @tiptap/pm
// It correctly exports from submodules to fix Vite build issues

export * as model from './dist/model.js';
export * as state from './dist/state.js';
export * as view from './dist/view.js';
export * as transform from './dist/transform.js';
export * as commands from './dist/commands.js';
export * as keymap from './dist/keymap.js';
export * as schema_list from './dist/schema-list.js';
export * as schema_basic from './dist/schema-basic.js';

// Also export some common imports directly
export { Schema, DOMParser, DOMSerializer, Fragment, Node as ProseMirrorNode, Mark } from './dist/model.js';
export { Plugin, PluginKey, TextSelection, Selection, EditorState } from './dist/state.js';
export { EditorView, Decoration, DecorationSet } from './dist/view.js';
export { Transform, Step, StepResult, ReplaceStep } from './dist/transform.js';
export { keymap } from './dist/keymap.js';

// Default export for CommonJS compatibility
export default {
  model: require('./dist/model.js'),
  state: require('./dist/state.js'),
  view: require('./dist/view.js'),
  transform: require('./dist/transform.js'),
  commands: require('./dist/commands.js'),
  keymap: require('./dist/keymap.js'),
  schema_list: require('./dist/schema-list.js'),
  schema_basic: require('./dist/schema-basic.js')
};
`;

fs.writeFileSync(shimPath, shimContent);

// 2. Fix the package.json to use our shim
console.log(`Patching package.json in ${pmPath}`);
const packagePath = path.join(pmPath, 'package.json');

try {
  // Read the existing package.json
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Modify main, module and exports
  pkg.main = 'shim.js';
  pkg.module = 'shim.js';
  pkg.exports = {
    '.': {
      'import': './shim.js',
      'require': './shim.js'
    },
    './model': './dist/model.js',
    './state': './dist/state.js', 
    './view': './dist/view.js',
    './transform': './dist/transform.js',
    './commands': './dist/commands.js',
    './keymap': './dist/keymap.js',
    './schema-list': './dist/schema-list.js',
    './schema-basic': './dist/schema-basic.js',
    './package.json': './package.json'
  };
  
  // Write the patched package.json
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  console.log('Successfully patched @tiptap/pm package.json');
} catch (error) {
  console.error('Error patching package.json:', error);
  process.exit(1);
}

console.log('🎉 PATCH SUCCESSFUL - Build should now work!'); 