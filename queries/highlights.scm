; Highlighting for the injected action-notation region (tree-sitter-phh's
; queries/injections.scm wires this grammar into each `actions` string).

(dealer) @keyword
(player_ref) @variable.parameter

(bring_in) @function.builtin
(bet) @function.builtin
(check_or_call) @function.builtin
(fold) @function.builtin
(stand_pat_or_discard) @function.builtin
(show_or_muck) @function.builtin
"db" @function.builtin
"dh" @function.builtin

(card) @string.special
(repeat_marker) @string.special.symbol
(amount) @number
(commentary) @comment
