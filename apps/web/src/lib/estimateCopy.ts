// Single source of truth for estimate disclaimers (Eddie 2026-08-11):
// every surface that shows a reference price must render one of these
// verbatim — final quote / shipping / installation / fabric availability
// are confirmed by a sales consultant, never by the website.

/** Short form — under a price figure. */
export const ESTIMATE_DISCLAIMER_SHORT =
  '* Reference estimate only. Final pricing is confirmed by your sales consultant. ' +
  'Installation fees and applicable taxes are not included.'

/** Long form — fabric library / request-a-quote surfaces. */
export const ESTIMATE_DISCLAIMER_LONG =
  '* This is a reference estimate, not a quote. Final pricing, shipping, ' +
  'installation, and fabric availability are confirmed by your sales consultant.'
