// tiptap-pm-fix.js
// This file provides replacement exports for @tiptap/pm
import * as model from './node_modules/@tiptap/pm/dist/model.js';
import * as transform from './node_modules/@tiptap/pm/dist/transform.js';
import * as state from './node_modules/@tiptap/pm/dist/state.js';
import * as view from './node_modules/@tiptap/pm/dist/view.js';
import * as commands from './node_modules/@tiptap/pm/dist/commands.js';
import * as keymap from './node_modules/@tiptap/pm/dist/keymap.js';
import * as schemaList from './node_modules/@tiptap/pm/dist/schema-list.js';
import * as schemaBasic from './node_modules/@tiptap/pm/dist/schema-basic.js';

// Remap with correct names for both named and default exports
export const schema_list = schemaList;
export const schema_basic = schemaBasic;

export {
  model,
  transform,
  state,
  view,
  commands,
  keymap
};

// Also provide default export for modules that use it
export default {
  model,
  transform,
  state,
  view,
  commands,
  keymap,
  schema_list: schemaList,
  schema_basic: schemaBasic
}; 