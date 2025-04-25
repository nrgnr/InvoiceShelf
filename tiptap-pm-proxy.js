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
export { 
  Schema, DOMParser, DOMSerializer, Fragment, Mark, 
  Node, Slice, NodeType, MarkType, ResolvedPos
} from '@tiptap/pm/model';

// From state
export { 
  Plugin, PluginKey, TextSelection, Selection, AllSelection, 
  NodeSelection, EditorState, Transaction, StateField
} from '@tiptap/pm/state';

// From view
export { 
  EditorView, Decoration, DecorationSet, NodeView
} from '@tiptap/pm/view';

// From transform
export { 
  Transform, Step, StepResult, ReplaceStep, ReplaceAroundStep, 
  AddMarkStep, RemoveMarkStep, liftTarget, findWrapping
} from '@tiptap/pm/transform';

// From commands
export { 
  baseKeymap, toggleMark, setBlockType, wrapIn, lift
} from '@tiptap/pm/commands';

// From keymap
export { 
  keymap
} from '@tiptap/pm/keymap';

// From schema-list
export { 
  addListNodes, wrapInList, splitListItem, liftListItem, sinkListItem
} from '@tiptap/pm/schema-list';

// From schema-basic
export { 
  schema
} from '@tiptap/pm/schema-basic';

// Default export that includes everything
export default {
  model,
  state,
  view,
  transform,
  commands,
  keymap,
  schema_list,
  schema_basic
}; 