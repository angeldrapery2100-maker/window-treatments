'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MeasureWizardClient, { type WizardLanguage } from './MeasureWizardClient'

const LANGUAGE_KEY = 'measure_wizard_language'

export default function MeasureWizardPageClient() {
  const [language, setLanguage] = useState<WizardLanguage>('en')

  useEffect(() => {
    try {
      if (localStorage.getItem(LANGUAGE_KEY) === 'zh') setLanguage('zh')
    } catch {
      // Some privacy modes block storage; the switch still works for the visit.
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    return () => {
      document.documentElement.lang = 'en'
    }
  }, [language])

  const changeLanguage = (next: WizardLanguage) => {
    setLanguage(next)
    try {
      localStorage.setItem(LANGUAGE_KEY, next)
    } catch {
      // Keep the in-memory language even when persistence is unavailable.
    }
  }

  const zh = language === 'zh'

  return (
    <>
      <section className="relative w-full bg-[#12141C]">
        <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-40 md:pb-20 md:pt-48 lg:px-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="block text-[11px] font-bold uppercase tracking-[0.3em] text-[#4DB6E8]">
              {zh ? '窗户测量向导' : 'Measurement Wizard'}
            </span>
            <div className="flex rounded-full border border-white/20 bg-white/5 p-1 text-xs text-white" aria-label="Language / 语言">
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                aria-pressed={!zh}
                className={`rounded-full px-3 py-1.5 transition-colors ${!zh ? 'bg-white text-[#12141C]' : 'text-white/70 hover:text-white'}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('zh')}
                aria-pressed={zh}
                className={`rounded-full px-3 py-1.5 transition-colors ${zh ? 'bg-white text-[#12141C]' : 'text-white/70 hover:text-white'}`}
              >
                中文
              </button>
            </div>
          </div>
          <h1 className="max-w-3xl text-4xl font-light leading-[1.08] tracking-tighter text-white md:text-6xl">
            {zh ? '您负责测量，我们帮您计算。' : "Measure once. We'll do the math."}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">
            {zh ? (
              <>回答几个简单问题，就能得到我们设计师建议的尺寸。第一次测量？可以先阅读{' '}
                <Link href="/how-to-measure" className="underline underline-offset-2 hover:text-white">测量指南</Link>。</>
            ) : (
              <>Answer a few questions and get the size our designers would recommend — the same rules our
                workroom uses every day. New to measuring? Read the{' '}
                <Link href="/how-to-measure" className="underline underline-offset-2 hover:text-white">measuring guide</Link>{' '}
                first.</>
            )}
          </p>
        </div>
      </section>

      <section className="w-full bg-white py-16 md:py-24">
        <MeasureWizardClient language={language} onLanguageChange={changeLanguage} />
      </section>
    </>
  )
}
