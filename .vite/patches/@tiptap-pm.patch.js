// This is a patch file for Vite to handle @tiptap/pm correctly
// It manually resolves the module to our proxy implementation

import { resolve } from 'path';

export default function tiptapPmPatch() {
  return {
    name: 'vite-plugin-tiptap-pm-patch',
    
    // This gets called when a module is being resolved
    resolveId(source) {
      // Intercept @tiptap/pm module resolution
      if (source === '@tiptap/pm') {
        console.log('Patching @tiptap/pm import to use proxy');
        return resolve(process.cwd(), './tiptap-pm-proxy.js');
      }
      
      // Handle submodule imports as well
      if (source.startsWith('@tiptap/pm/')) {
        const submodule = source.split('/')[2];
        return resolve(process.cwd(), `node_modules/@tiptap/pm/dist/${submodule}.js`);
      }
      
      return null;
    },
    
    // Transform import statements in code
    transform(code, id) {
      // Replace direct imports from @tiptap/pm with our proxy
      if (code.includes('from \'@tiptap/pm\'') || code.includes('from "@tiptap/pm"')) {
        return code.replace(/from ['"]@tiptap\/pm['"]/g, 'from \'/tiptap-pm-proxy.js\'');
      }
      
      return null;
    }
  };
} 