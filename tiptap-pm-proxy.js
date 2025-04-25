/**
 * This is a compatibility layer for @tiptap/pm imports
 * It reexports from specific submodules to avoid the Vite build issue
 */

// model
export { Schema, DOMParser, DOMSerializer, Fragment, Mark, Node, Slice } from '@tiptap/pm/model';

// state
export { Plugin, PluginKey, TextSelection, Selection, AllSelection, NodeSelection, EditorState } from '@tiptap/pm/state';

// view
export { EditorView, Decoration, DecorationSet } from '@tiptap/pm/view';

// transform
export { Transform, Step, StepResult, ReplaceStep, ReplaceAroundStep, AddMarkStep, RemoveMarkStep } from '@tiptap/pm/transform';

// commands
export { baseKeymap } from '@tiptap/pm/commands';

// keymap
export { keymap } from '@tiptap/pm/keymap';

// schema-list
export { addListNodes } from '@tiptap/pm/schema-list';

// schema-basic
export { schema as basicSchema } from '@tiptap/pm/schema-basic'; 