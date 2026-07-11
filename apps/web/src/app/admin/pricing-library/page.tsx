'use client'

import { useState } from 'react'
import GlobalDraperyPricingCard from '@/components/admin/GlobalDraperyPricingCard'
import {
  LUMA_SHADE_DEFAULTS,
  SOMFY_TRACK_DEFAULTS,
} from '@window-treatments/shared/pricing/aapp'

// ─────────────────────────────────────────────────────────────────────────────
// Pricing Library / 定价库 (store redesign P4 — blueprint §2.3).
// The ONE admin page collecting global pricing knobs, mirroring AAPP's
// "library" concept:
//   §1 布帘/纱全局参数 — the EDITABLE drapery_pricing site-settings group
//      (same component as the product 计算参数 tab, one implementation).
//   §2 Luma 面料价目 — READ-ONLY view of the engine's built-in $/sqm tables.
//   §3 电机/遥控/hub + SOMFY 系数 — READ-ONLY view of the engine constants.
// Read-only sections show the values the engines actually price with; per-
// product overrides go through params.aapp_config (see notes inline).
// Making the Luma/motor tables globally editable needs a NEW settings→engine
// merge path — deliberately out of scope for P4（后续）.
// ─────────────────────────────────────────────────────────────────────────────

const SYNC_FOOTNOTE = '对应 AAPP library.* — 两边改价需同步。'

function SectionCard({ title, subtitle, aappRef, children }: {
  title: string
  subtitle: string
  /** Which AAPP library.* object this section mirrors. */
  aappRef: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-500 mt-1 mb-4">{subtitle}</p>
      {children}
      <p className="text-[11px] text-gray-400 mt-4 border-t border-gray-100 pt-3">
        {SYNC_FOOTNOTE} 本节对应 <span className="font-mono">{aappRef}</span>。
      </p>
    </section>
  )
}

const th = 'text-left py-1.5 px-2 font-medium text-gray-400'
const thR = 'text-right py-1.5 px-2 font-medium text-gray-400'
const td = 'py-1 px-2 text-gray-700'
const tdR = 'py-1 px-2 text-right font-mono text-gray-700'

function FabricFamilyTable({ family, rows }: { family: string; rows: { code: string; pricePerSqm: number }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700"
      >
        <span className="font-medium">{family} <span className="text-gray-400 font-normal">· {rows.length} 个系列码</span></span>
        <span className="text-gray-400">{open ? '▾ 收起' : '▸ 展开'}</span>
      </button>
      {open && (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className={th}>系列码 Code</th>
              <th className={thR}>$/sqm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(f => (
              <tr key={f.code}>
                <td className={`${td} font-mono`}>{f.code}</td>
                <td className={tdR}>${f.pricePerSqm.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function PricingLibraryPage() {
  const fabrics = LUMA_SHADE_DEFAULTS.fabrics
  const motorSystem = LUMA_SHADE_DEFAULTS.motorSystem
  const controlOptions = LUMA_SHADE_DEFAULTS.options

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Library <span className="text-gray-400 font-normal">/ 定价库</span></h1>
          <p className="text-sm text-gray-500 mt-1">
            全局定价参数集中页 — 对应 AAPP 内部软件的 library 概念。改价前先在 AAPP 里确认，两边必须同步。
          </p>
        </div>

        {/* ── §1 布帘/纱全局参数（可编辑，site-settings drapery_pricing 组）── */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-base font-semibold text-gray-900">1 · 布帘/纱全局参数 <span className="text-gray-400 font-normal">/ Drapery &amp; Sheer Globals</span></h2>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            所有 drapery / sheer（AAPP 引擎）商品共用的衬布、手工、镶边价格。与商品编辑页「计算参数」标签里的卡片是同一个编辑器 — 任意一处保存即全局生效。
          </p>
          <GlobalDraperyPricingCard />
        </section>

        {/* ── §2 Luma 面料价目（只读，引擎内置默认表）── */}
        <SectionCard
          title="2 · Luma 面料价目（$/sqm）"
          subtitle="引擎内置默认价目（只读）。按商品覆盖：在该商品「计算参数」的 params.aapp_config.fabrics 里嵌入覆盖表。做成全局可编辑需要新的 settings→engine 合并链路 — 本期不做（后续）。"
          aappRef="AAPP library SHADE_CATALOG_DEFAULTS（app-catalog.js）"
        >
          <div className="space-y-2">
            <FabricFamilyTable family="Roller（卷帘 MB/ME/MF/MS）" rows={fabrics.roller} />
            <FabricFamilyTable family="Zebra（斑马帘 DB/DE/DF）" rows={fabrics.zebra} />
            <FabricFamilyTable family="Sheer Shade（柔纱帘 E/EB/N/NB）" rows={fabrics.sheer} />
            <FabricFamilyTable family="Modern Roman（现代罗马帘 PE/PB）" rows={fabrics.roman} />
          </div>
        </SectionCard>

        {/* ── §3 电机/遥控/hub 价目 + SOMFY 系数（只读）── */}
        <SectionCard
          title="3 · 电机 / 遥控 / Hub 价目 + SOMFY 系数"
          subtitle="引擎内置默认值（只读）。按商品覆盖：params.aapp_config.motorSystem（Luma）/ params.aapp_config（SOMFY 轨道）。"
          aappRef="AAPP library SHADE_MOTOR_SYSTEMS_DEFAULTS + _SOMFY_DEFAULTS（functions/index.js）"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-gray-800 mb-2">Luma 电机系统 / Motor System</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className={th}>项目</th>
                    <th className={thR}>价格</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {motorSystem.motors.map(m => (
                    <tr key={m.key}>
                      <td className={td}>{m.label} <span className="text-gray-400">(motor)</span></td>
                      <td className={tdR}>{m.netPrice > 0 ? `$${m.netPrice}` : '$0 · 出厂占位，按商品覆盖'}</td>
                    </tr>
                  ))}
                  {motorSystem.remotes.map(r => (
                    <tr key={r.key}>
                      <td className={td}>{r.label} <span className="text-gray-400">(remote)</span></td>
                      <td className={tdR}>${r.netPrice}</td>
                    </tr>
                  ))}
                  {motorSystem.hubs.map(h => (
                    <tr key={h.key}>
                      <td className={td}>{h.label} <span className="text-gray-400">(hub)</span></td>
                      <td className={tdR}>${h.netPrice}</td>
                    </tr>
                  ))}
                  {motorSystem.accessories.map(a => (
                    <tr key={a.key}>
                      <td className={td}>{a.label} <span className="text-gray-400">(accessory)</span></td>
                      <td className={tdR}>${a.netPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-gray-800 mb-2">Luma 控制方式加价 / Control Options</h3>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-50">
                    {Object.entries(controlOptions).map(([k, v]) => (
                      <tr key={k}>
                        <td className={`${td} font-mono`}>{k}</td>
                        <td className={tdR}>
                          {k === 'motorized' ? `$${v} · 旧占位，实际走电机系统` : `+$${v}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-gray-800 mb-2">SOMFY 系数 / Coefficients</h3>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className={td}>轨道出厂系数 trackFactor</td>
                      <td className={tdR}>{SOMFY_TRACK_DEFAULTS.trackFactor}</td>
                    </tr>
                    <tr>
                      <td className={td}>轨道加价倍率 trackMarkup</td>
                      <td className={tdR}>×{SOMFY_TRACK_DEFAULTS.trackMarkup}</td>
                    </tr>
                    <tr>
                      <td className={td}>配件加价倍率 accessoryMarkup</td>
                      <td className={tdR}>×{SOMFY_TRACK_DEFAULTS.accessoryMarkup}</td>
                    </tr>
                    {SOMFY_TRACK_DEFAULTS.motors.map(m => (
                      <tr key={m.id}>
                        <td className={td}>{m.name}</td>
                        <td className={tdR}>${m.sellPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[11px] text-gray-400 mt-2">
                  价表主体（pinch pleat / ripplefold 宽度档 + 配件 net 价）内置于引擎常量
                  （packages/shared/src/pricing/aapp/constants.ts），与 AAPP functions/index.js 的
                  _SOMFY_* 表逐行一致。
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
