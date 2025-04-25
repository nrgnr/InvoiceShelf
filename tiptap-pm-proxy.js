/**
 * This is a compatibility layer for @tiptap/pm imports
 * It reexports from specific submodules to avoid the Vite build issue
 */

// Important: Export all submodules as named exports
import * as model from '@tiptap/pm/model';
import * as state from '@tiptap/pm/state';
import * as view from '@tiptap/pm/view';
import * as transform from '@tiptap/pm/transform';
import * as commands from '@tiptap/pm/commands';
import * as keymap from '@tiptap/pm/keymap';
import * as schema_list from '@tiptap/pm/schema-list';
import * as schema_basic from '@tiptap/pm/schema-basic';

// Re-export everything as named exports
export { model, state, view, transform, commands, keymap, schema_list, schema_basic };

// Also export individual components from each module
// model
export { 
  Schema, DOMParser, DOMSerializer, Fragment, Mark, Node, Slice,
  NodeType, MarkType, ResolvedPos
} from '@tiptap/pm/model';

// state
export { 
  Plugin, PluginKey, TextSelection, Selection, AllSelection, 
  NodeSelection, EditorState, Transaction, StateField
} from '@tiptap/pm/state';

// view
export { 
  EditorView, Decoration, DecorationSet, NodeView
} from '@tiptap/pm/view';

// transform
export { 
  Transform, Step, StepResult, ReplaceStep, ReplaceAroundStep, 
  AddMarkStep, RemoveMarkStep, liftTarget, findWrapping, canJoin, canSplit
} from '@tiptap/pm/transform';

// commands
export { 
  baseKeymap, toggleMark, setBlockType, wrapIn, lift
} from '@tiptap/pm/commands';

// keymap
export { 
  keymap, keydownHandler
} from '@tiptap/pm/keymap';

// schema-list
export { 
  addListNodes, wrapInList, splitListItem, liftListItem, sinkListItem
} from '@tiptap/pm/schema-list';

// schema-basic
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