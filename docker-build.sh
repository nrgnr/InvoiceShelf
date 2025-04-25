#!/bin/bash

# docker-build.sh
# Unified script to build the project in Docker environment
# This script provides multiple fix strategies for @tiptap/pm

set -e # Exit on any error

echo "🔧 Building InvoiceShelf in Docker..."

# Ensure we're in the correct directory
cd /var/www/html

# Make sure node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing Node.js dependencies..."
  npm ci || npm install
fi

# Make sure our proxy file is available in Docker
if [ ! -f "tiptap-pm-proxy.js" ]; then
  echo "⚠️ TipTap proxy file not found, creating it..."
  cat > tiptap-pm-proxy.js << 'EOF'
/**
 * TipTap PM Proxy Module for Vite 5+
 * 
 * This file solves the "Missing '.' specifier in '@tiptap/pm'" error in Vite builds
 * by directly importing from specific submodules and re-exporting them.
 */

// Import all submodules from their specific paths
import * as model from '@tiptap/pm/model';
import * as state from '@tiptap/pm/state';
import * as view from '@tiptap/pm/view';
import * as transform from '@tiptap/pm/transform';
import * as commands from '@tiptap/pm/commands';
import * as keymap from '@tiptap/pm/keymap';
import * as schema_list from '@tiptap/pm/schema-list';
import * as schema_basic from '@tiptap/pm/schema-basic';

// Re-export all submodules as namespaces
export { model, state, view, transform, commands, keymap, schema_list, schema_basic };

// Export all individual components that are commonly used
// From model
export { Schema, DOMParser, DOMSerializer, Fragment, Mark, Node, Slice, NodeType, MarkType, ResolvedPos } from '@tiptap/pm/model';
// From state
export { Plugin, PluginKey, TextSelection, Selection, AllSelection, NodeSelection, EditorState, Transaction, StateField } from '@tiptap/pm/state';
// From view
export { EditorView, Decoration, DecorationSet, NodeView } from '@tiptap/pm/view';
// From transform
export { Transform, Step, StepResult, ReplaceStep, ReplaceAroundStep, AddMarkStep, RemoveMarkStep, liftTarget, findWrapping } from '@tiptap/pm/transform';
// From commands
export { baseKeymap, toggleMark, setBlockType, wrapIn, lift } from '@tiptap/pm/commands';
// From keymap
export { keymap } from '@tiptap/pm/keymap';
// From schema-list
export { addListNodes, wrapInList, splitListItem, liftListItem, sinkListItem } from '@tiptap/pm/schema-list';
// From schema-basic
export { schema } from '@tiptap/pm/schema-basic';

// Default export that includes everything
export default { model, state, view, transform, commands, keymap, schema_list, schema_basic };
EOF
fi

# Apply direct fix to @tiptap/pm
echo "🔧 Applying TipTap PM fix in package.json..."
if [ -f "fix-tiptap-docker.js" ]; then
  node fix-tiptap-docker.js
else
  # If script not available, apply fix directly
  PACKAGE_PATH="/var/www/html/node_modules/@tiptap/pm/package.json"
  if [ -f "$PACKAGE_PATH" ]; then
    echo "Manually patching $PACKAGE_PATH"
    cat > "$PACKAGE_PATH" << 'EOF'
{
  "name": "@tiptap/pm",
  "version": "2.0.0-beta.220",
  "description": "ProseMirror packages for tiptap",
  "homepage": "https://tiptap.dev",
  "license": "MIT",
  "funding": {
    "type": "github",
    "url": "https://github.com/sponsors/ueberdosis"
  },
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "exports": {
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
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/ueberdosis/tiptap",
    "directory": "packages/pm"
  }
}
EOF
  fi
  
  # Create index.js with proper exports
  INDEX_PATH="/var/www/html/node_modules/@tiptap/pm/dist/index.js"
  echo "Creating index.js with proper exports at $INDEX_PATH"
  mkdir -p "/var/www/html/node_modules/@tiptap/pm/dist"
  cat > "$INDEX_PATH" << 'EOF'
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
EOF
fi

# Attempt build
echo "🚀 Starting build process..."
NODE_ENV=production npm run build

echo "✅ Build completed!" 