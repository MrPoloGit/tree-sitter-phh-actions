# tree-sitter-phh-actions

Tree-sitter grammar for the PHH action-notation micro-language, the small
actor/verb/argument grammar that lives inside each string of a PHH
`actions` array (`phh-data/registry/actions.json`; `phh-std/required.rst`
"Actions"). Injected into `tree-sitter-phh` documents via that grammar's
`queries/injections.scm`; see `tree-sitter-phh/grammar.js`'s file header for
why this is a separate grammar rather than part of the TOML-level one.
