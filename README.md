# tree-sitter-phh-actions

Tree-sitter grammar for the PHH action-notation micro-language, the small
actor/verb/argument grammar that lives inside each string of a PHH
`actions` array (`phh/registry/actions.json`; `phh-std/required.rst`
"Actions"). Injected into `tree-sitter-phh` documents via that grammar's
`queries/injections.scm`; see `tree-sitter-phh/grammar.js`'s file header for
why this is a separate grammar rather than part of the TOML-level one.

Part of Section 8 step 2.

## Status

Generates cleanly with `tree-sitter generate` (ABI 15). Parsed with zero
errors against:

- All **49 unique real action strings** extracted from the full valid
  corpus (`../phh/corpus/valid/*.phh`, `*.phhs`) by actually loading each
  file through vendored PokerKit and reading `HandHistory.actions`, not
  hand-copied from the spec.
- 6 hand-built edge cases the real corpus happens not to exercise: an empty
  no-op, a standalone `# commentary`-only action, a player action with an
  in-line commentary (`p1 f # out of position`, note this is the PHH
  commentary mechanism *inside* the quotes, distinct from an ordinary TOML
  comment outside them, which `tree-sitter-phh` already strips before this
  grammar ever sees the string), `sd` with no cards argument (standing pat),
  the `-` repeat marker in an `sm` action, and `??` unknown cards.

Covers every action code in the registry: dealer actions (`d db`, `d dh`),
and player actions (`pb`, `cbr <amount>`, `cc`, `f`, `sd [cards]`,
`sm [cards]`), plus the no-op/commentary-only case.

Deliberately **not** enforced here: card *legality*, e.g. short-deck
hold'em forbidding ranks 2 through 5 (`phh/registry/cards.json`). This
grammar accepts any standard52 rank/suit token regardless of which PHH
variant the hand is actually using, by design: that is an L1 registry/
semantic check (plan Section 4.6 leveling), not an L0 grammar concern, exactly
mirroring how `tree-sitter-phh` itself accepts any TOML-shaped document
regardless of which fields the variant in play actually requires. See
`../phh/corpus/invalid/short-deck-forbidden-rank.phh`, a file containing
the illegal card `2h` for its `NS` variant parses as syntactically valid at
this layer; it is PokerKit's replay, and eventually `phh-ls`'s own
validator, that reject it.

No extras-swallowing hazard analogous to `tree-sitter-phh`'s string bug
(see that package's README) exists here: the only extra is whitespace
(`/\s+/`), and cards are concatenated with zero characters between them by
construction, so there is never a position where whitespace could out-match
a card token, confirmed empirically rather than assumed, by testing
`cards` as a plain `repeat1` with no `token.immediate`.

## Queries (`queries/`)

`highlights.scm`, actor, verb, card, amount, and commentary highlighting
for the injected region. Validated with `tree-sitter query -p .` against
real and synthetic fixtures.
