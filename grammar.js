/**
 * tree-sitter-phh-actions, grammar for the action-notation micro-language
 * that lives inside each string of a PHH `actions` array.
 *
 * This is a separate grammar from tree-sitter-phh on purpose: the contents
 * of an `actions` string are not TOML at all (phh-std/required.rst
 * "Actions"; phh-data/registry/actions.json). tree-sitter-phh injects it via
 * queries/injections.scm rather than parsing it inline.
 *
 * Grammar, per the spec: `[[Actor Action[ Arguments...]][ # Commentary]]`
 * (square brackets there mark optional parts, not literal characters).
 * Covers: dealer actions (`d db ...`, `d dh pN ...`), player actions
 * (`pN pb`, `pN cbr <amount>`, `pN cc`, `pN f`, `pN sd [cards]`,
 * `pN sm [cards]`), and the no-op case (empty, whitespace-only, or a
 * standalone `# commentary`).
 *
 * Card *legality* (e.g. short-deck forbidding ranks 2-5, phh-data/registry/
 * cards.json) is deliberately NOT enforced here, that is an L1 registry/
 * semantic check (the PHH editor-support plan Section 4.6 leveling), not a
 * grammar (L0) concern. This grammar accepts any standard52 rank/suit
 * token regardless of variant, the same way tree-sitter-phh accepts any
 * TOML-shaped document regardless of which PHH fields are actually required
 * for the variant in play.
 */

module.exports = grammar({
  name: "phh_actions",

  extras: ($) => [/\s+/],

  rules: {
    action_line: ($) =>
      optional(
        choice(
          seq($.dealer_action, optional($.commentary)),
          seq($.player_action, optional($.commentary)),
          $.commentary,
        ),
      ),

    dealer_action: ($) =>
      seq(field("actor", $.dealer), choice($.board_deal, $.hole_deal)),

    dealer: ($) => "d",

    board_deal: ($) => seq("db", field("cards", $.cards)),
    hole_deal: ($) =>
      seq("dh", field("player", $.player_ref), field("cards", $.cards)),

    player_action: ($) =>
      seq(
        field("actor", $.player_ref),
        choice(
          $.bring_in,
          $.bet,
          $.check_or_call,
          $.fold,
          $.stand_pat_or_discard,
          $.show_or_muck,
        ),
      ),

    // e.g. "p3", a 1-indexed player reference. Spelled out as its own rule
    // (rather than inlined as a bare regex at each use site) so hover/
    // go-to-definition in phh-ls has one node type to key off of.
    player_ref: ($) => /p[0-9]+/,

    bring_in: ($) => "pb",
    bet: ($) => seq("cbr", field("amount", $.amount)),
    check_or_call: ($) => "cc",
    fold: ($) => "f",
    stand_pat_or_discard: ($) => seq("sd", optional(field("cards", $.cards))),
    show_or_muck: ($) => seq("sm", optional(field("cards", $.cards))),

    // "Completing/Betting/Raising to a positive integral or real amount"
    // (phh-std/required.rst). PokerKit's own writer never emits a decimal
    // amount in the fixtures this grammar was checked against, but the spec
    // allows a float stack/bet value, so both forms are accepted.
    amount: ($) => /[0-9]+(\.[0-9]+)?/,

    // Multiple cards concatenated with no separator (phh-std/required.rst
    // "Card Notation"), e.g. "Ac2d" = two cards. No extras-boundary hazard
    // here unlike tree-sitter-phh's strings: there is no token that could
    // out-match a single card at a zero-whitespace position between two
    // adjacent cards, so a plain repeat1 is safe without token.immediate.
    cards: ($) => choice($.repeat_marker, repeat1($.card)),

    // One card: rank char + suit char, or the unknown marker '??'.
    card: ($) => /[23456789TJQKA?][cdhs?]/,

    // A single '-', valid only as the entire `cards` argument of a show/muck
    // (`sm`) action, meaning "the cards already given in this player's own
    // hole-dealing action" (phh-std/required.rst "Card Notation"). Whether
    // '-' is actually legal at a given call site (only `sm`, never `sd`) is
    // an L1 registry check, not enforced by this grammar.
    repeat_marker: ($) => "-",

    // The PHH *commentary* mechanism (not a TOML comment, tree-sitter-phh
    // already stripped those as an extra before this grammar ever sees the
    // string's content): "# " followed by free text to the end of the
    // string.
    commentary: ($) => /#[^\n]*/,
  },
});
