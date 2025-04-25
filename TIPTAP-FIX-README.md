# TipTap PM Fix for Vite

This document explains the fix for the "@tiptap/pm Missing '.' specifier" error in Vite 5+ builds.

## The Problem

The TipTap editor uses ProseMirror (PM) packages through a special `@tiptap/pm` package. However, this package has an incorrect exports configuration in its package.json, causing Vite 5+ to fail with the error:

```
Failed to resolve entry for package "@tiptap/pm". The package may have incorrect main/module/exports 
specified in its package.json: Missing "." specifier in "@tiptap/pm" package
```

## The Solution

We've implemented a multi-pronged approach to fix this issue:

1. **Vite Alias** - A direct alias in vite.config.js to our proxy module
2. **Direct Package Fix** - A script that modifies the @tiptap/pm package.json and creates proper exports
3. **Proxy Module** - A file that correctly re-exports all submodules from specific paths

## How to Fix

### For Docker Builds

Run the `build-in-docker.sh` script:

```bash
./build-in-docker.sh
```

This script:
1. Copies the necessary fix scripts to the Docker container
2. Runs the `docker-build.sh` script inside the container, which:
   - Creates the tiptap-pm-proxy.js file if needed
   - Applies the package.json fix with fix-tiptap-docker.js
   - Runs the build

### For Local Development

1. Run the TipTap fix:

```bash
npm run fix-tiptap
```

2. Then run your development server or build:

```bash
npm run dev
# or
npm run build
```

## Understanding the Fix

Our fix works in three layers:

1. **Package.json Fix** - In `fix-tiptap-docker.js` we:
   - Add proper exports field with "." specifier
   - Create a correct index.js file with submodule exports

2. **Vite Config Fix** - In `vite.config.js` we:
   - Add a direct alias for `@tiptap/pm` to our proxy file
   - Add optimizeDeps configuration to force the package to be pre-bundled

3. **Proxy Module** - In `tiptap-pm-proxy.js` we:
   - Import from specific submodules (`@tiptap/pm/model`, etc.)
   - Re-export correctly for use in the application

## Files Involved

- `fix-tiptap-docker.js` - Main script that fixes the package.json
- `tiptap-pm-proxy.js` - Proxy module that re-exports from specific modules
- `vite.config.js` - Vite configuration with our fixes
- `docker-build.sh` - Script for building in Docker
- `build-in-docker.sh` - Convenient script for running Docker builds

## Troubleshooting

If you still encounter issues:

1. Make sure the fix script runs without errors
2. Check that tiptap-pm-proxy.js exists and is properly formatted
3. Verify that your imports from @tiptap/pm are correct
4. Delete node_modules and run npm install to get a fresh copy of dependencies 