'use client'
// 三个 Luma 产品页共用的保修模块。文案事实源见
// SONNET-任务书-Luma保修卖点-2026-08-29.md §1 —— 改年限只改这里。

import Link from 'next/link'
import { m as motion } from 'framer-motion'

export type LumaWarrantyProps = {
  /** 该页产品的保修年限：roller/sheer = 5，zebra = 3 */
  years: 3 | 5
  /** section 背景色调，用来和相邻 section 错开 */
  tone?: 'sand' | 'white'
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.25, 0.1, 0.25, 1] } },
}

/** 第 1 层：首屏下方极轻的信任条，不能抢 hero 风头。 */
export function LumaAssuranceBar({ years }: { years: 3 | 5 }) {
  const items = [
    'FAMILY-OWNED SINCE 1984',
    `${years}-YEAR PRODUCT WARRANTY`,
    '3-YEAR INSTALLATION WARRANTY',
  ]
  return (
    <div className="w-full bg-white border-y border-gray-100 py-4">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-center">
          {items.map((item, i) => (
            <span key={item} className="flex items-center gap-2 md:gap-3">
              {i > 0 && <span className="hidden md:inline text-gray-300">·</span>}
              <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.28em] uppercase text-gray-500">
                {item}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** 第 2 层：CTA 之前的完整保修卖点 section。 */
export default function LumaWarranty({ years, tone = 'white' }: LumaWarrantyProps) {
  const bg = tone === 'sand' ? 'bg-[#F7F6F3]' : 'bg-white'

  return (
    <section className={`w-full py-24 md:py-32 ${bg}`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <span className="text-[#4DB6E8] text-[11px] font-bold tracking-[0.3em] uppercase block mb-4">
            OWNERSHIP, COVERED
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-[#12141C]">
            Built to last.<br />
            <span className="font-semibold">Backed in writing.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: `${years}-Year Product Warranty`,
              body: 'Manufacturing or material defects — fabric, mechanism, motor, and hardware — repaired or replaced free of charge.',
            },
            {
              title: '3-Year Installation Warranty',
              body: 'Installed by our own crew, not a subcontractor. For three years, anything that needs adjusting we come back and fix at no charge.',
            },
            {
              title: 'Half-Price Replacement, After',
              body: 'Once the warranty ends, that same window can be re-shaded with any Luma product at 50% off. Same window, same size. Installation and tax not included.',
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              transition={{ delay: i * 0.08 } as any}
              className="rounded-3xl border border-gray-100 p-8 hover:shadow-md transition-shadow"
            >
              <h4 className="text-lg font-semibold text-[#12141C] mb-3">{card.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{card.body}</p>
              {i === 1 && years === 5 && (
                <p className="text-xs text-gray-400 italic mt-3 pt-3 border-t border-gray-100">
                  In years 4 and 5 the product itself is still covered — only the service visit and labor are billed.
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-sm text-gray-500 text-center">
          Angel Drapery has been in Los Angeles since 1984.{' '}
          <Link
            href="/warranty"
            className="text-[#12141C] font-medium underline underline-offset-4 hover:text-[#4DB6E8]"
          >
            Read the full warranty →
          </Link>
        </p>
      </div>
    </section>
  )
}
