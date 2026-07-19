'use client'

// Interactive measurement wizard (Eddie 2026-07-19): a standalone, form-style
// alternative to the chat measurement flow. Drapery recommendations run
// CLIENT-SIDE through the same AAPP-parity engine the AI tools use
// (@window-treatments/shared/measure); shutter reference quotes go through
// /api/store/measure/shutter (server-side rates). Shades use the confirmed
// business rules (inside = exact opening, outside = +5"W/+6"H).

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { recommendDraperySize } from '@window-treatments/shared/measure'

type Product = 'drapery' | 'shades' | 'shutters'

const ACCENT = 'text-[#4DB6E8]'
const label = 'block text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2'
const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#12141C] outline-none transition-colors focus:border-[#12141C]'
const cardBtn = (active: boolean) =>
  `rounded-2xl border px-5 py-4 text-left text-sm transition-all ${
    active
      ? 'border-[#12141C] bg-[#12141C] text-white shadow-md'
      : 'border-gray-200 bg-white text-[#12141C] hover:border-gray-400'
  }`
const pillBtn = (active: boolean) =>
  `rounded-full border px-4 py-2 text-[13px] transition-all ${
    active
      ? 'border-[#12141C] bg-[#12141C] text-white'
      : 'border-gray-200 bg-white text-[#12141C] hover:border-gray-400'
  }`

function NumField({
  id,
  title,
  hint,
  value,
  onChange,
  required,
}: {
  id: string
  title: string
  hint?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className={label}>
        {title}
        {required ? ' *' : ''}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={0.125}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="inches"
        className={inputCls}
      />
      {hint && <p className="mt-1.5 text-[12px] leading-relaxed text-gray-400">{hint}</p>}
    </div>
  )
}

const num = (v: string): number | undefined => {
  const n = parseFloat(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export default function MeasureWizardClient() {
  const [product, setProduct] = useState<Product | null>(null)

  // ── Drapery state ──
  const [rodType, setRodType] = useState<'motorized_ceiling_track' | 'ceiling_track' | 'wall_rod'>('ceiling_track')
  const [operation, setOperation] = useState<'split' | 'single_left' | 'single_right'>('split')
  const [styleFamily, setStyleFamily] = useState<'pleated' | 'ripple'>('pleated')
  const [dW, setDW] = useState('')
  const [dH, setDH] = useState('')
  const [clearL, setClearL] = useState('')
  const [clearR, setClearR] = useState('')
  const [clearT, setClearT] = useState('')
  const [clearB, setClearB] = useState('')
  const [wallH, setWallH] = useState('')

  const draperyRec = useMemo(() => {
    const w = num(dW)
    const h = num(dH)
    if (!w || !h) return null
    return recommendDraperySize({
      windowWidthIn: w,
      windowHeightIn: h,
      clearLeftIn: num(clearL),
      clearRightIn: num(clearR),
      clearTopIn: num(clearT),
      clearBottomIn: num(clearB),
      wallHeightsIn: num(wallH) ? [num(wallH)!] : undefined,
      rodType,
      operation,
      styleFamily,
    })
  }, [dW, dH, clearL, clearR, clearT, clearB, wallH, rodType, operation, styleFamily])

  // ── Shades state ──
  const [mount, setMount] = useState<'inside' | 'outside'>('inside')
  const [sW, setSW] = useState('')
  const [sH, setSH] = useState('')

  // ── Shutter state ──
  const [material, setMaterial] = useState<'poly_vinyl' | 'hardwood' | 'paulownia' | 'basswood_paint' | 'basswood_stain'>('poly_vinyl')
  const [shW, setShW] = useState('')
  const [shH, setShH] = useState('')
  const [shQty, setShQty] = useState('1')
  const [shLoading, setShLoading] = useState(false)
  const [shError, setShError] = useState('')
  const [shResult, setShResult] = useState<{
    price: number
    install_fee: number
    billed_width_in: number
    billed_height_in: number
    quantity: number
  } | null>(null)

  const quoteShutter = async () => {
    const w = num(shW)
    const h = num(shH)
    if (!w || !h) {
      setShError('Please enter the window width and height first.')
      return
    }
    setShError('')
    setShLoading(true)
    setShResult(null)
    try {
      const res = await fetch('/api/store/measure/shutter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material: material.startsWith('basswood') ? 'basswood' : material,
          color_type: material === 'basswood_stain' ? 'stain' : 'paint',
          width_in: w,
          height_in: h,
          quantity: parseInt(shQty) || 1,
        }),
      })
      const json = await res.json().catch(() => null)
      if (json?.success && json.data) setShResult(json.data)
      else setShError(typeof json?.error === 'string' ? json.error : 'Something went wrong — please try again.')
    } catch {
      setShError('Connection problem — please try again.')
    } finally {
      setShLoading(false)
    }
  }

  const shadeW = num(sW)
  const shadeH = num(sH)

  return (
    <div className="mx-auto max-w-[880px] px-6 lg:px-0">
      {/* ── Step 1: product ── */}
      <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>Step 1</span>
      <h2 className="mb-6 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">
        What are you measuring for?
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <button className={cardBtn(product === 'drapery')} onClick={() => setProduct('drapery')}>
          <span className="mb-1 block text-base font-semibold tracking-tight">Custom Drapery</span>
          <span className={product === 'drapery' ? 'text-white/60' : 'text-gray-400'}>
            Get the exact finished size our designers would recommend.
          </span>
        </button>
        <button className={cardBtn(product === 'shades')} onClick={() => setProduct('shades')}>
          <span className="mb-1 block text-base font-semibold tracking-tight">Roman · Roller · Zebra · Sheer</span>
          <span className={product === 'shades' ? 'text-white/60' : 'text-gray-400'}>
            Turn your opening measurement into the right order size.
          </span>
        </button>
        <button className={cardBtn(product === 'shutters')} onClick={() => setProduct('shutters')}>
          <span className="mb-1 block text-base font-semibold tracking-tight">Plantation Shutters</span>
          <span className={product === 'shutters' ? 'text-white/60' : 'text-gray-400'}>
            Measure the opening and get an instant reference price.
          </span>
        </button>
      </div>

      {/* ── DRAPERY ── */}
      {product === 'drapery' && (
        <div className="mt-14">
          <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>Step 2</span>
          <h2 className="mb-6 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">
            How will it hang?
          </h2>
          <div className="space-y-5">
            <div>
              <span className={label}>Rod / track type</span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['ceiling_track', 'Ceiling track'],
                    ['motorized_ceiling_track', 'Motorized ceiling track'],
                    ['wall_rod', 'Wall-mounted rod'],
                  ] as const
                ).map(([v, t]) => (
                  <button key={v} className={pillBtn(rodType === v)} onClick={() => setRodType(v)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className={label}>Opening direction</span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['split', 'Center split (open from the middle)'],
                    ['single_left', 'One-way — stacks left'],
                    ['single_right', 'One-way — stacks right'],
                  ] as const
                ).map(([v, t]) => (
                  <button key={v} className={pillBtn(operation === v)} onClick={() => setOperation(v)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className={label}>Header style</span>
              <div className="flex flex-wrap gap-2">
                <button className={pillBtn(styleFamily === 'pleated')} onClick={() => setStyleFamily('pleated')}>
                  Pinch pleat
                </button>
                <button className={pillBtn(styleFamily === 'ripple')} onClick={() => setStyleFamily('ripple')}>
                  Ripplefold
                </button>
              </div>
            </div>
          </div>

          <span className={`${ACCENT} mb-3 mt-12 block text-[11px] font-bold uppercase tracking-[0.3em]`}>Step 3</span>
          <h2 className="mb-2 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">
            Measure your window.
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-400">
            Width and height are enough to start — the optional fields make the recommendation even more
            accurate. Measure in inches with a steel tape.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <NumField id="dw" title="Window width" required value={dW} onChange={setDW} hint="Outer frame, edge to edge." />
            <NumField id="dh" title="Window height" required value={dH} onChange={setDH} hint="Outer frame, top to bottom." />
            <NumField id="cl" title="Wall space — left" value={clearL} onChange={setClearL} hint="Usable wall beside the window (optional)." />
            <NumField id="cr" title="Wall space — right" value={clearR} onChange={setClearR} hint="Usable wall beside the window (optional)." />
            <NumField id="ct" title="Window top → ceiling" value={clearT} onChange={setClearT} hint="Gap above the window (optional)." />
            <NumField id="cb" title="Window bottom → floor" value={clearB} onChange={setClearB} hint="Distance below the window (optional)." />
            <NumField
              id="wh"
              title="Floor-to-ceiling height"
              value={wallH}
              onChange={setWallH}
              hint="Measure at left, center and right — enter the SMALLEST (optional but recommended)."
            />
          </div>

          <div className="mt-10 rounded-3xl bg-[#12141C] p-8 text-white md:p-10">
            <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>
              Our recommendation
            </span>
            {draperyRec?.recommendedFinishedWidthIn && draperyRec.recommendedFinishedHeightIn ? (
              <>
                <p className="text-3xl font-light tracking-tight md:text-4xl">
                  {draperyRec.recommendedFinishedWidthIn}″ W × {draperyRec.recommendedFinishedHeightIn}″ H
                </p>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                  Recommended finished size, using the same rules our designers use. The width includes
                  stacking room so the panels clear the glass when open
                  {rodType === 'wall_rod'
                    ? '; the height hangs the rod near the ceiling and keeps the hem just off the floor.'
                    : '; the height runs from the ceiling track down to just off the floor.'}
                  {!num(wallH) &&
                    ' For even better accuracy, measure your floor-to-ceiling height at 3 points and enter the smallest.'}
                </p>
              </>
            ) : (
              <p className="text-sm text-white/50">Enter the window width and height above to see your size.</p>
            )}
          </div>
        </div>
      )}

      {/* ── SHADES ── */}
      {product === 'shades' && (
        <div className="mt-14">
          <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>Step 2</span>
          <h2 className="mb-6 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">
            Inside or outside mount?
          </h2>
          <div className="mb-8 flex flex-wrap gap-2">
            <button className={pillBtn(mount === 'inside')} onClick={() => setMount('inside')}>
              Inside mount — sits in the frame
            </button>
            <button className={pillBtn(mount === 'outside')} onClick={() => setMount('outside')}>
              Outside mount — covers the frame
            </button>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <NumField
              id="sw"
              title="Opening width"
              required
              value={sW}
              onChange={setSW}
              hint={
                mount === 'inside'
                  ? 'Measure at top, middle and bottom — enter the SMALLEST.'
                  : 'The opening you want covered, edge to edge.'
              }
            />
            <NumField
              id="sh"
              title="Opening height"
              required
              value={sH}
              onChange={setSH}
              hint={
                mount === 'inside'
                  ? 'Measure at left, center and right — enter the SMALLEST.'
                  : 'The opening you want covered, top to bottom.'
              }
            />
          </div>
          <div className="mt-10 rounded-3xl bg-[#12141C] p-8 text-white md:p-10">
            <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>
              Your order size
            </span>
            {shadeW && shadeH ? (
              mount === 'inside' ? (
                <>
                  <p className="text-3xl font-light tracking-tight md:text-4xl">
                    {shadeW}″ W × {shadeH}″ H
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                    For inside mount, order your EXACT opening size — don&apos;t deduct anything. Our workshop
                    makes the factory deductions so the shade fits and operates cleanly. Most shades need
                    about 2–3″ of flat frame depth to sit flush.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-light tracking-tight md:text-4xl">
                    {Math.round((shadeW + 5) * 100) / 100}″ W × {Math.round((shadeH + 6) * 100) / 100}″ H
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                    Outside mount adds about +5″ width and +6″ height beyond the opening for good light
                    coverage. Single-panel width maxes out at 118″ for our Luma shades — wider windows split
                    into multiple panels.
                  </p>
                </>
              )
            ) : (
              <p className="text-sm text-white/50">Enter the opening width and height above to see your order size.</p>
            )}
          </div>
        </div>
      )}

      {/* ── SHUTTERS ── */}
      {product === 'shutters' && (
        <div className="mt-14">
          <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>Step 2</span>
          <h2 className="mb-2 text-2xl font-light tracking-tighter text-[#12141C] md:text-3xl">
            Measure the opening, pick a material.
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-400">
            Measure the window opening — we automatically add the standard frame allowance, the same way our
            in-store quoting works.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <NumField id="shw" title="Window width" required value={shW} onChange={setShW} hint="Opening width, edge to edge." />
            <NumField id="shh" title="Window height" required value={shH} onChange={setShH} hint="Opening height, top to bottom." />
            <div>
              <label htmlFor="mat" className={label}>
                Material *
              </label>
              <select id="mat" value={material} onChange={(e) => setMaterial(e.target.value as any)} className={inputCls}>
                <option value="poly_vinyl">Poly-Vinyl (aluminum reinforced)</option>
                <option value="hardwood">Hardwood</option>
                <option value="paulownia">Grained Paulownia</option>
                <option value="basswood_paint">Basswood — painted</option>
                <option value="basswood_stain">Basswood — stained</option>
              </select>
            </div>
            <NumField id="shq" title="How many windows" value={shQty} onChange={setShQty} hint="Identical size and material." />
          </div>
          <button
            onClick={() => void quoteShutter()}
            disabled={shLoading}
            className="mt-8 rounded-full bg-[#12141C] px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {shLoading ? 'Calculating…' : 'Get my reference price'}
          </button>
          {shError && <p className="mt-4 text-sm text-red-600">{shError}</p>}
          {shResult && (
            <div className="mt-8 rounded-3xl bg-[#12141C] p-8 text-white md:p-10">
              <span className={`${ACCENT} mb-3 block text-[11px] font-bold uppercase tracking-[0.3em]`}>
                Reference price
              </span>
              <p className="text-3xl font-light tracking-tight md:text-4xl">
                ${shResult.price.toLocaleString()}
                {shResult.quantity > 1 && (
                  <span className="ml-2 text-base text-white/50">for {shResult.quantity} shutters</span>
                )}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                Based on {shResult.billed_width_in}″ × {shResult.billed_height_in}″ finished size (your opening
                + standard frame allowance), standard style with hidden tilt rod. Installation adds $
                {shResult.install_fee.toLocaleString()}. Options like double-hung, bi-fold tracks, or custom
                finishes adjust the price. This is a reference price — your final quote is confirmed at the
                free in-home measurement.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── CTA footer ── */}
      {product && (
        <div className="mt-14 rounded-3xl bg-[#F7F5F2] p-8 md:p-10">
          <h3 className="mb-2 text-xl font-semibold tracking-tight text-[#12141C]">
            Never worry about getting it exactly right.
          </h3>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-500">
            Every Angel Drapery project includes a free professional in-home measurement — use this wizard to
            plan and budget, and we&apos;ll confirm every number before anything goes into production.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/store/whole-home"
              className="rounded-full bg-[#12141C] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Book a free in-home measure
            </Link>
            {product === 'drapery' && (
              <Link
                href="/products/handcrafted-drapery"
                className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-[#12141C] transition-colors hover:border-gray-500"
              >
                Shop custom drapery
              </Link>
            )}
            {product === 'shades' && (
              <Link
                href="/products"
                className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-[#12141C] transition-colors hover:border-gray-500"
              >
                Browse shades
              </Link>
            )}
            <a
              href="tel:+16264519841"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-[#12141C] transition-colors hover:border-gray-500"
            >
              Call 626-451-9841
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
