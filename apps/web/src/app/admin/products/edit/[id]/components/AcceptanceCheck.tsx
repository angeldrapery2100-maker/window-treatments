'use client'

import { useState } from 'react'
import { CATEGORY_BLUEPRINTS, type CategoryKey, type AcceptanceSample, type CategoryBlueprint } from '@/lib/categoryBlueprints'

// ─────────────────────────────────────────────────────────────────────────────
// 一键验收 / Acceptance check (store redesign P4 — blueprint §2.2 Step 4).
//
// Runs the category blueprint's known-good pricing samples
// (docs/aapp-pricing-spec.md §7: drapery D1 $660 · sheer S1 $306 · hardware
// H1 $210 · luma L1 $226) through the REAL /api/store/pricing/calculate
// route and compares against the locked expected totals.
//
// IMPORTANT: each sample carries its OWN fabric/hardware prices
// (sample.sampleParams) — the product's configured prices are deliberately
// NOT used. A ✓ therefore validates the ENGINE + route wiring (adapter,
// global drapery settings, rounding), not this product's price list.
// ─────────────────────────────────────────────────────────────────────────────

interface SampleResult {
  label: string
  status: 'pass' | 'fail' | 'error'
  got?: number
  expected: number
  error?: string
}

/** Build the calculate-route request for one blueprint sample. Sample params
 *  prefixed `aapp_` are product-level constants (→ baseParams); the rest are
 *  per-value option params (hw_base_price…) injected via a synthetic option —
 *  the same channel a real product's option values use. */
function buildRequest(bp: CategoryBlueprint, sample: AcceptanceSample) {
  const baseParams: Record<string, any> = { ...bp.defaultParams }
  const optionNums: Record<string, number> = {}
  for (const [k, v] of Object.entries(sample.sampleParams)) {
    if (k.startsWith('aapp_')) baseParams[k] = v
    else optionNums[k] = v
  }
  const options: Record<string, string> = { ...sample.options }
  const optionValues: Record<string, Record<string, Record<string, number>>> = {}
  if (Object.keys(optionNums).length > 0) {
    options.__sample = 'sample'
    optionValues.__sample = { sample: optionNums }
  }
  const productType =
    bp.productTypeSlug === 'shade' ? 'shade'
    : bp.productTypeSlug === 'sheer' ? 'sheer'
    : 'drapery' // hardware samples also ride the aapp branch (triggers on baseParams.aapp_engine)
  return {
    productType,
    input: { width: sample.width, height: sample.height ?? 0 },
    baseParams,
    options,
    optionValues,
  }
}

export default function AcceptanceCheck({ blueprintKey }: { blueprintKey: CategoryKey }) {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<SampleResult[] | null>(null)

  const blueprint = CATEGORY_BLUEPRINTS[blueprintKey]
  const samples = blueprint?.acceptanceSamples || []
  if (samples.length === 0) return null

  const run = async () => {
    setRunning(true)
    const out: SampleResult[] = []
    for (const sample of samples) {
      try {
        const res = await fetch('/api/store/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildRequest(blueprint, sample)),
        })
        const data = await res.json()
        const total = data?.ok ? Number(data?.result?.total) : NaN
        if (data?.ok && Number.isFinite(total)) {
          const got = Math.round(total)
          out.push({
            label: sample.label,
            status: got === sample.expectedTotal ? 'pass' : 'fail',
            got,
            expected: sample.expectedTotal,
          })
        } else {
          out.push({
            label: sample.label,
            status: 'error',
            expected: sample.expectedTotal,
            error: String(data?.error || 'Calculation failed'),
          })
        }
      } catch (e: any) {
        out.push({ label: sample.label, status: 'error', expected: sample.expectedTotal, error: e?.message || 'Network error' })
      }
    }
    setResults(out)
    setRunning(false)
  }

  const allPass = results !== null && results.every(r => r.status === 'pass')

  return (
    <div className="mt-4 rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">一键验收 <span className="font-normal text-gray-400">/ Run acceptance check</span></h4>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            验证引擎与 AAPP 一致（使用样例价格，非本商品价格）— 跑蓝图内置的已知正确样例
            （docs/aapp-pricing-spec.md §7），只检验引擎与核价路由接线，不检验本商品自身配置。
          </p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="shrink-0 px-3 py-1.5 text-xs bg-[#3d3d3d] text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {running ? '验收中…' : '▶ 一键验收'}
        </button>
      </div>

      {results && (
        <div className="mt-3 space-y-1.5">
          {results.map(r => (
            <div
              key={r.label}
              className={`flex items-start justify-between gap-3 rounded border px-3 py-2 text-xs ${
                r.status === 'pass'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              <span className="min-w-0">
                <span className="font-medium">{r.status === 'pass' ? '✓' : '✗'} {r.label}</span>
                {r.status === 'error' && <span className="block mt-0.5 text-red-500">引擎报错：{r.error}</span>}
              </span>
              <span className="shrink-0 font-mono">
                {r.status === 'pass'
                  ? `$${r.got}`
                  : r.status === 'fail'
                    ? `got $${r.got} · expected $${r.expected}`
                    : `expected $${r.expected}`}
              </span>
            </div>
          ))}
          <p className="text-[11px] text-gray-400 pt-0.5">
            {allPass
              ? '✅ 全部通过 — 引擎与核价路由和 AAPP 内部软件一致。'
              : '⚠️ 有样例不匹配 — 通常是全局定价参数被改过（衬布/手工/镶边）或引擎接线回归，先别改测试期望，去和 AAPP 对价。'}
          </p>
        </div>
      )}
    </div>
  )
}
