'use client'

import { useState } from 'react'

// Traditional-Chinese consultation form. Posts to the same /api/consultation
// endpoint (and field names) as the English ContactClient form.
export default function ZhConsultationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = e.currentTarget
    const data = new FormData(form)
    const body = {
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      address: data.get('address'),
      message: data.get('message'),
    }
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus({ type: 'success', message: '已收到您的預約,我們會儘快與您聯繫!' })
      form.reset()
    } catch {
      setStatus({ type: 'error', message: '送出失敗,請直接致電 626-451-9841。' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input name="name" type="text" required placeholder="您的姓名 *" aria-label="您的姓名" className={inputClass} />
      <input name="email" type="email" required placeholder="電子郵箱 *" aria-label="電子郵箱" className={inputClass} />
      <input name="phone" type="tel" required placeholder="聯絡電話 *" aria-label="聯絡電話" className={inputClass} />
      <input name="address" type="text" placeholder="安裝地址(選填)" aria-label="安裝地址(選填)" className={inputClass} />
      <textarea
        name="message" rows={4} placeholder="簡單描述您的窗型與需求,例如:客廳兩扇大窗想做遮光簾……" aria-label="需求描述"
        className={`${inputClass} resize-none`}
      />

      {status.type && (
        <div
          className={`text-sm text-center py-2 px-4 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || status.type === 'success'}
        className="w-full py-4 bg-[#12141C] text-white rounded-sm font-medium tracking-[0.2em] hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '送出中…' : status.type === 'success' ? '已送出 ✓' : '送出預約'}
      </button>

      <p className="text-[11px] text-gray-400 text-center mt-2">
        或直接致電 <a href="tel:626-451-9841" className="underline hover:text-gray-700">626-451-9841</a>
      </p>
    </form>
  )
}
