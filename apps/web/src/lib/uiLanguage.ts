'use client'

// Shared EN / 中文 toggle for the standalone referral pages.
//
// Same tr(language, english, chinese) shape the measurement wizard already
// uses; the choice is remembered per browser under `ad_lang` so a visitor who
// switched to Chinese on the landing page stays in Chinese on /rewards.
// Reading localStorage happens after mount on purpose — rendering the stored
// language during SSR would produce a hydration mismatch.

import { useCallback, useEffect, useState } from 'react'

export type UiLanguage = 'en' | 'zh'

export const LANG_STORAGE_KEY = 'ad_lang'

export const tr = (language: UiLanguage, english: string, chinese: string) =>
  language === 'zh' ? chinese : english

export function useUiLanguage(initial: UiLanguage = 'en'): [UiLanguage, (next: UiLanguage) => void] {
  const [language, setLanguage] = useState<UiLanguage>(initial)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY)
      if (stored === 'zh' || stored === 'en') setLanguage(stored)
    } catch {
      /* private mode / storage disabled — keep the server-rendered default */
    }
  }, [])

  const choose = useCallback((next: UiLanguage) => {
    setLanguage(next)
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  return [language, choose]
}
