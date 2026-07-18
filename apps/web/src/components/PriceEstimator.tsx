'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { m as motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] } },
}

// ── Config ────────────────────────────────────────────────────
const ESTIMATOR_CONFIG = {
  fabrics: {
    zebra:  [
      { key: 'rd', label: 'Room Darkening',  minPrice: 108, maxPrice: 150 },
      { key: 'lf', label: 'Light Filtering', minPrice: 80,  maxPrice: 108 },
    ],
    roller: [
      { key: 'lf',       label: 'Light Filtering', minPrice: 68, maxPrice: 90  },
      { key: 'blackout', label: 'Blackout',         minPrice: 80, maxPrice: 106 },
      { key: 'screen',   label: 'Screen Shade',     minPrice: 70, maxPrice: 106 },
    ],
    sheer: [
      { key: 'lf', label: 'Light Filtering', minPrice: 90,  maxPrice: 140 },
      { key: 'rd', label: 'Room Darkening',  minPrice: 105, maxPrice: 120 },
    ],
  } as Record<string, { key: string; label: string; minPrice: number; maxPrice: number }[]>,
  // v808: cassette $/m band per series (roller open/round/square 30-55;
  // zebra & sheer round/square 14-16). Billed at ≥1.2 m, ×1.2 past 95.7".
  cassetteBand: {
    zebra:  { min: 14, max: 16 },
    roller: { min: 30, max: 55 },
    sheer:  { min: 14, max: 16 },
  } as Record<string, { min: number; max: number }>,
  controlKeys: {
    zebra:  ['cordless', 'chain', 'motorized'],
    roller: ['cordless', 'chain', 'motorized'],
    sheer:  ['chain', 'motorized'],
  } as Record<string, string[]>,
  allControls: [
    { key: 'cordless',  label: 'Cordless',  addOn: 50  },
    { key: 'chain',     label: 'Chain',     addOn: 0   },
    { key: 'motorized', label: 'Motorized', addOn: 150 },
  ],
}

// v808 pricing math (2026-07 reprice) — mirrors the real engine:
// billable area ≥ 1.2 sqm; hardware billed at ≥ 1.2 m of width, ×1.2 past
// 95.7"; finished-product floor $100 (before motor add-on).
function calcEstimate(
  product: string,
  widthIn: number,
  heightIn: number,
  minFabricPrice: number,
  maxFabricPrice: number,
  controlKey: string,
  controlAddOn: number,
) {
  if (!widthIn || !heightIn || widthIn < 12 || widthIn > 118 || heightIn < 12 || heightIn > 120) return null
  const areaSqm = Math.max(1.2, (widthIn * (heightIn + 12)) / 1550)
  const hwMeters = Math.max(widthIn * 0.0254, 1.2) * (widthIn > 95.7 ? 1.2 : 1)
  const cas = ESTIMATOR_CONFIG.cassetteBand[product] ?? { min: 14, max: 16 }
  const nonMotorAddOn = controlKey === 'motorized' ? 0 : controlAddOn
  const motorAddOn = controlKey === 'motorized' ? controlAddOn : 0
  const minTotal = Math.max(Math.ceil(areaSqm * minFabricPrice + hwMeters * cas.min + nonMotorAddOn), 100) + motorAddOn
  const maxTotal = Math.max(Math.ceil(areaSqm * maxFabricPrice + hwMeters * cas.max + nonMotorAddOn), 100) + motorAddOn
  return { minTotal, maxTotal }
}

// ── Component ─────────────────────────────────────────────────
interface PriceEstimatorProps {
  defaultProduct?: 'zebra' | 'roller' | 'sheer'
}

export default function PriceEstimator({ defaultProduct = 'zebra' }: PriceEstimatorProps) {
  const product = defaultProduct

  const [estWidth,   setEstWidth]   = useState('')
  const [estHeight,  setEstHeight]  = useState('')
  const [estFabric,  setEstFabric]  = useState(ESTIMATOR_CONFIG.fabrics[product][0].key)
  const [estControl, setEstControl] = useState(ESTIMATOR_CONFIG.controlKeys[product][0])

  // Live sell-price bands from the fabric library (follows AAPP pricing via
  // sync); the hardcoded numbers above stay as offline fallback.
  const [liveBands, setLiveBands] = useState<Record<string, Record<string, { min: number; max: number }>> | null>(null)
  useEffect(() => {
    fetch('/api/store/luma-bands')
      .then(r => r.json())
      .then(j => { if (j?.success && j.data?.bands) setLiveBands(j.data.bands) })
      .catch(() => {})
  }, [])

  const fabricOpts   = ESTIMATOR_CONFIG.fabrics[product].map(f => {
    const live = liveBands?.[product]?.[f.key]
    return live ? { ...f, minPrice: live.min, maxPrice: live.max } : f
  })
  const selectedFab  = fabricOpts.find(f => f.key === estFabric) ?? fabricOpts[0]
  const controlOpts  = ESTIMATOR_CONFIG.allControls.filter(c => ESTIMATOR_CONFIG.controlKeys[product].includes(c.key))
  const selectedCtrl = controlOpts.find(c => c.key === estControl) ?? controlOpts[0]
  const estimate     = calcEstimate(product, +estWidth, +estHeight, selectedFab.minPrice, selectedFab.maxPrice, selectedCtrl.key, selectedCtrl.addOn)

  return (
    <section className="w-full bg-white py-14 md:py-18 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 lg:px-16">

        {/* Header */}
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          className="mb-8"
        >
          <span className="text-[#4DB6E8] text-[10px] font-bold tracking-[0.4em] uppercase block mb-2">
            Instant Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-[#12141C] mb-2">
            Get an estimate.
          </h2>
          <p className="text-gray-500 text-sm">
            Enter your window size for a real-time reference price.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* ── Left: inputs ── */}
          <div className="space-y-5">

            {/* Width × Height */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Window Size (inches)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Width &nbsp;<span className="text-gray-300">12 – 96"</span>
                  </label>
                  <input
                    type="number" min="12" max="96" placeholder="e.g. 36"
                    value={estWidth} onChange={e => setEstWidth(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[#12141C] focus:border-[#12141C] focus:ring-1 focus:ring-[#12141C] outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Height &nbsp;<span className="text-gray-300">12 – 120"</span>
                  </label>
                  <input
                    type="number" min="12" max="120" placeholder="e.g. 60"
                    value={estHeight} onChange={e => setEstHeight(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[#12141C] focus:border-[#12141C] focus:ring-1 focus:ring-[#12141C] outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Fabric type – dropdown */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Fabric Type</p>
              <select
                value={estFabric}
                onChange={e => setEstFabric(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[#12141C] focus:border-[#12141C] focus:ring-1 focus:ring-[#12141C] outline-none transition-all text-sm bg-white appearance-none cursor-pointer"
              >
                {fabricOpts.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Control type – dropdown */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Control Type</p>
              <select
                value={estControl}
                onChange={e => setEstControl(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[#12141C] focus:border-[#12141C] focus:ring-1 focus:ring-[#12141C] outline-none transition-all text-sm bg-white appearance-none cursor-pointer"
              >
                {controlOpts.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Right: result card ── */}
          <div className="bg-[#F7F6F3] rounded-xl p-6 md:p-8 sticky top-8">
            <AnimatePresence mode="wait">
              {!estimate ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center py-8 space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-1">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-6-6h12" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Enter your window size above<br />to see an instant estimate.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Estimated Price
                  </p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-light tracking-tight text-[#12141C]">
                      ${estimate.minTotal.toLocaleString()}
                    </span>
                    <span className="text-xl font-light text-gray-400">
                      &nbsp;–&nbsp;${estimate.maxTotal.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-5">
                    per window · fabric + hardware + {selectedCtrl.label.toLowerCase()}
                  </p>

                  <p className="text-[11px] text-gray-400 leading-relaxed mb-5">
                    * Reference estimate only. Final pricing is confirmed by your sales consultant.
                    Installation fees and applicable taxes are not included.
                  </p>

                  <Link
                    href="/contact"
                    className="block w-full text-center py-3 bg-[#12141C] text-white text-sm font-medium tracking-widest uppercase rounded-sm hover:bg-black transition-colors"
                  >
                    Get an Exact Quote →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}
