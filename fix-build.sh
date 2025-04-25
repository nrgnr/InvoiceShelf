#!/bin/bash

# This script fixes the TipTap PM issues in Docker and runs the build
# Run with: docker compose exec invoiceshelf-app bash /var/www/html/fix-build.sh

set -e # Exit on any error

echo "🔧 Fixing TipTap/PM build issues..."

# First, let's make sure we're in the correct directory
cd /var/www/html

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "⚠️ No node_modules found, installing dependencies first..."
  npm ci || npm install
fi

# Make sure @tiptap/pm exists
if [ ! -d "node_modules/@tiptap/pm" ]; then
  echo "⚠️ TipTap PM not found, installing..."
  npm install @tiptap/pm@2.0.0
fi

# Run our patching script
echo "📦 Patching @tiptap/pm package..."
node docker-patch-tiptap.js

# Fix any ESM/CommonJS import issues in shim.js
echo "✂️ Removing incompatible require() statements from shim.js..."
sed -i 's/require/\/\/require/g' node_modules/@tiptap/pm/shim.js

# Remove our old proxy that might conflict
echo "🧹 Cleaning up old files..."
rm -f tiptap-pm-proxy.js

# Completely replace index.js in @tiptap/pm
echo "📝 Creating direct replacement for @tiptap/pm/index.js..."
cat > node_modules/@tiptap/pm/dist/index.js << 'EOF'
/**
 * Fixed @tiptap/pm index file
 * This exports each module separately to avoid the "Missing '.' specifier" error
 */

export * as model from './model.js';
export * as state from './state.js';
export * as view from './view.js';
export * as transform from './transform.js';
export * as commands from './commands.js';
export * as keymap from './keymap.js';
export * as schema_list from './schema-list.js';
export * as schema_basic from './schema-basic.js';

// Also export common utilities directly
export { Schema, DOMParser, DOMSerializer, Fragment, Node as ProseMirrorNode, Mark } from './model.js';
export { Plugin, PluginKey, TextSelection, Selection, EditorState } from './state.js';
export { EditorView, Decoration, DecorationSet } from './view.js';
export { Transform, Step, StepResult, ReplaceStep } from './transform.js';
export { keymap } from './keymap.js';
EOF

echo "🚀 Running build..."
npm run build

echo "✅ Build completed! If there were any errors, please check the output above." 