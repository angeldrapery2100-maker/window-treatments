'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import { ESTIMATE_DISCLAIMER_LONG } from '@/lib/estimateCopy'
import { BUSINESS_ADDRESS, PRIMARY_PHONE } from '@/lib/site'

interface SavedDesign {
  id: string
  label: string
  window_id: string | null
  config: Record<string, string | boolean>
  summary: Record<string, string | null>
  estimate: { total?: { low: number; high: number } | null } | null
  created_at: string
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`

/**
 * The visitor's whole drapery project on one page — and the same page is what
 * prints.
 *
 * There is no PDF library in this app and none can be added from here, so the
 * "PDF" is the browser's own Save-as-PDF over a print stylesheet. That is not
 * a compromise worth apologising for: it needs no server rendering, no fonts
 * shipped, and it always matches what the customer just looked at.
 */
export default function SavedDesignsClient() {
  const [designs, setDesigns] = useState<SavedDesign[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch('/api/store/design/saved')
      .then((r) => r.json())
      .then((j) => setDesigns(j?.success ? (j.data.designs as SavedDesign[]) : []))
      .catch(() => setDesigns([]))
  }, [])

  useEffect(load, [load])

  const remove = useCallback(async (id: string) => {
    setBusy(id)
    try {
      await fetch('/api/store/design/saved', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      load()
    } finally {
      setBusy(null)
    }
  }, [load])

  // Only designs we could actually price count toward a project total, and the
  // total says so rather than quietly leaving them out.
  const totals = useMemo(() => {
    if (!designs) return null
    const priced = designs.filter((d) => d.estimate?.total)
    if (!priced.length) return { low: 0, high: 0, priced: 0, unpriced: designs.length }
    return {
      low: priced.reduce((n, d) => n + (d.estimate!.total!.low || 0), 0),
      high: priced.reduce((n, d) => n + (d.estimate!.total!.high || 0), 0),
      priced: priced.length,
      unpriced: designs.length - priced.length,
    }
  }, [designs])

  const consultationHref = useMemo(() => {
    if (!designs?.length) return '/contact'
    const lines = designs.map((d, i) => {
      const s = d.summary || {}
      return [
        `${i + 1}. ${d.label}`,
        s.size ? `   Size: ${s.size}` : null,
        s.composition ? `   Layers: ${s.composition}` : null,
        s.fabric ? `   Fabric: ${s.fabric}` : null,
        s.sheer ? `   Sheer: ${s.sheer}` : null,
        s.heading ? `   Heading: ${s.heading} · ${s.panels}` : null,
        s.lining ? `   Lining: ${s.lining}` : null,
        s.hardware ? `   Hardware: ${s.hardware}${s.finish ? `, ${s.finish}` : ''}${s.finial ? `, ${s.finial}` : ''} (${s.mount} mount)` : null,
        d.estimate?.total ? `   Reference estimate: ${money(d.estimate.total.low)}–${money(d.estimate.total.high)}` : '   Reference estimate: on consultation',
        s.link ? `   Design: ${s.link}` : null,
      ].filter(Boolean).join('\n')
    })
    const total = totals && totals.priced
      ? `\nProject reference estimate (${totals.priced} window${totals.priced > 1 ? 's' : ''}): ${money(totals.low)}–${money(totals.high)}`
      : ''
    const msg = `I designed these on your site and would like a quote.\n\n${lines.join('\n\n')}${total}`
    return `/contact?message=${encodeURIComponent(msg)}`
  }, [designs, totals])

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <main className="min-h-screen bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .design-card { break-inside: avoid; page-break-inside: avoid; }
          main { background: #fff !important; }
          a { text-decoration: none !important; color: inherit !important; }
          @page { margin: 16mm 14mm; }
        }
        .print-only { display: none; }
      ` }} />

      <div className="no-print">
        <section className="relative w-full bg-[#12141C]">
          <SiteNav activePage="" />
          <div className="h-28 md:h-32" />
        </section>
      </div>

      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-10 md:py-14">
        {/* Letterhead — only on paper. */}
        <div className="print-only mb-8 border-b border-gray-300 pb-4">
          <p className="text-xl tracking-[0.2em] font-light">ANGEL DRAPERY, INC</p>
          <p className="mt-1 text-[11px] text-gray-600">
            {BUSINESS_ADDRESS} · {PRIMARY_PHONE} · angel-drapery.com
          </p>
          <p className="mt-3 text-[11px] text-gray-600">Drapery project · {today}</p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900">My Drapery Project</h1>
            <p className="mt-2 text-sm text-gray-500">
              Every window you have designed, with the reference estimate you were shown.
            </p>
          </div>
          <div className="no-print flex gap-3">
            <Link href="/design" className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 hover:border-gray-500">
              Design another window
            </Link>
            {!!designs?.length && (
              <button onClick={() => window.print()} className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 hover:border-gray-500">
                Print / Save as PDF
              </button>
            )}
          </div>
        </div>

        {designs === null && <p className="mt-10 text-sm text-gray-500">Loading your project…</p>}

        {designs?.length === 0 && (
          <div className="mt-10 rounded-xl bg-[#F7F6F3] px-6 py-10 text-center">
            <p className="text-gray-700">You haven&apos;t saved a design yet.</p>
            <Link href="/design" className="mt-4 inline-block rounded-full bg-[#12141C] px-6 py-3 text-sm font-medium text-white hover:bg-black">
              Start designing
            </Link>
          </div>
        )}

        {!!designs?.length && (
          <>
            <div className="mt-8 space-y-5">
              {designs.map((d, i) => (
                <article key={d.id} className="design-card rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        <span className="mr-2 text-gray-400">{i + 1}.</span>{d.label}
                      </h2>
                      <p className="text-xs text-gray-400">
                        Saved {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      {d.estimate?.total ? (
                        <p className="text-lg font-medium text-gray-900 tabular-nums">
                          {d.estimate.total.low === d.estimate.total.high
                            ? money(d.estimate.total.low)
                            : `${money(d.estimate.total.low)}–${money(d.estimate.total.high)}`}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">On consultation</p>
                      )}
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    {([
                      ['Size', d.summary?.size],
                      ['Layers', d.summary?.composition],
                      ['Fabric', d.summary?.fabric],
                      ['Sheer', d.summary?.sheer],
                      ['Heading', d.summary?.heading],
                      ['Panels', d.summary?.panels],
                      ['Lining', d.summary?.lining],
                      ['Hardware', d.summary?.hardware],
                      ['Finish', d.summary?.finish],
                      ['Finial', d.summary?.finial],
                      ['Mount', d.summary?.mount],
                    ] as Array<[string, string | null | undefined]>)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <dt className="shrink-0 text-gray-400">{k}</dt>
                          <dd className="text-gray-800">{v}</dd>
                        </div>
                      ))}
                  </dl>

                  <div className="no-print mt-4 flex gap-4 text-xs">
                    {d.summary?.link && (
                      <Link href={String(d.summary.link).replace(/^https?:\/\/[^/]+/, '')} className="underline underline-offset-4 text-gray-600 hover:text-black">
                        Open in the designer
                      </Link>
                    )}
                    <button
                      onClick={() => remove(d.id)}
                      disabled={busy === d.id}
                      className="underline underline-offset-4 text-gray-400 hover:text-[#B3451F] disabled:opacity-50"
                    >
                      {busy === d.id ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {totals && totals.priced > 0 && (
              <div className="mt-6 rounded-xl bg-[#F7F6F3] p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium text-gray-900">
                    Project reference estimate
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      {totals.priced} window{totals.priced > 1 ? 's' : ''}
                    </span>
                  </span>
                  <span className="text-xl font-medium text-gray-900 tabular-nums">
                    {totals.low === totals.high ? money(totals.low) : `${money(totals.low)}–${money(totals.high)}`}
                  </span>
                </div>
                {totals.unpriced > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {totals.unpriced} more window{totals.unpriced > 1 ? 's are' : ' is'} quoted by consultation and not counted above.
                  </p>
                )}
              </div>
            )}

            <p className="mt-6 text-[11px] leading-relaxed text-gray-400">{ESTIMATE_DISCLAIMER_LONG}</p>

            <Link
              href={consultationHref}
              className="no-print mt-8 block w-full rounded-full bg-[#12141C] py-3.5 text-center text-sm font-medium text-white hover:bg-black"
            >
              Send this project to a consultant
            </Link>
          </>
        )}
      </div>

      <div className="no-print">
        <SiteFooter dark />
      </div>
    </main>
  )
}
