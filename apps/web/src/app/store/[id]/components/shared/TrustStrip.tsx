// Quiet single-line trust strip under Add to Cart (store redesign P2 —
// docs/STORE-REDESIGN-BLUEPRINT.md §3.1 信任条). English only, no icons —
// deliberately understated so it reassures without shouting.

const ITEMS = ['Made in our LA workroom', 'Ships in ~2 weeks', 'Secure checkout']

export default function TrustStrip() {
  return (
    <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400">
      {ITEMS.map((t, i) => (
        <span key={t} className="flex items-center gap-x-2">
          {i > 0 && <span aria-hidden="true" className="text-gray-300">·</span>}
          {t}
        </span>
      ))}
    </p>
  )
}
