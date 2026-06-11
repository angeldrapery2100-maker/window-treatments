import type { Metadata } from 'next'
import Image from 'next/image'
import { getPageContent, getText, getImage } from '@/lib/content'
import { COPYRIGHT, MAPS_EMBED_URL } from '@/lib/site'
import FooterSocial from '@/components/FooterSocial'
import ZhNav from '@/components/zh/ZhNav'
import ZhConsultationForm from '@/components/zh/ZhConsultationForm'

export const metadata: Metadata = {
  title: '聯繫我們 — 天使窗簾',
  description:
    '聯繫天使窗簾,預約免費上門量尺與設計諮詢。門市位於 Temple City(8831 E Las Tunas Dr),電話 626-451-9841,參觀需預約。',
  alternates: {
    canonical: '/zh/contact',
    languages: { en: '/contact', 'zh-Hant': '/zh/contact' },
  },
}

export const revalidate = 300

const ACCENT = '#4DB6E8'

export default async function ZhContactPage() {
  const [data, globalData] = await Promise.all([
    getPageContent('home'),
    getPageContent('global'),
  ])

  const address = getText(data, 'contact', 'address', '8831 E Las Tunas Dr, Temple City, CA 91780')
  const email = getText(data, 'contact', 'email', 'admin@angel-drapery.com')
  const phone = getText(data, 'contact', 'phone_1', '626-451-9841')
  const qrWechat = getImage(data, 'contact', 'qr_wechat')
  const qrLine = getImage(data, 'contact', 'qr_line')

  const footer = {
    youtube: getText(globalData, 'footer', 'youtube_url', '#'),
    etsy: getText(globalData, 'footer', 'etsy_url', '#'),
    tiktok: getText(globalData, 'footer', 'tiktok_url', '#'),
    instagram: getText(globalData, 'footer', 'instagram_url', ''),
  }

  return (
    <main className="min-h-screen bg-white text-[#12141C]">

      {/* ── Hero ── */}
      <section className="relative h-[55vh] overflow-hidden flex items-end bg-[#12141C]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/roman-shade/IMG_0298_Original.JPG"
          alt="天使窗簾 門市"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

        <ZhNav activeHref="/zh/contact" enHref="/contact" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-16 w-full">
          <span className="block text-[10px] font-bold tracking-[0.4em] uppercase mb-4" style={{ color: ACCENT }}>
            Temple City, CA · 1984 年至今
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white leading-tight">
            聯繫我們
          </h1>
        </div>
      </section>

      {/* ── 主內容 ── */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* 左:聯絡資訊 */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-3">預約免費上門量尺</h2>
              <p className="text-gray-500 leading-relaxed">
                量尺與設計諮詢均不收費,安裝工程提供三年保固。歡迎電話、簡訊或掃碼聯繫。
              </p>
            </div>

            {/* 電話 */}
            <div className="py-2 border-b border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">電話 / 簡訊</p>
              <a href={`tel:${phone}`} className="text-2xl md:text-3xl font-medium hover:text-[#4DB6E8] transition-colors">
                {phone}
              </a>
            </div>

            {/* 地址 */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">門市地址</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-gray-800 text-lg leading-relaxed hover:text-[#4DB6E8] transition-colors"
              >
                {address}
              </a>
              <span className="block mt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-semibold tracking-widest text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  參觀門市需預約
                </span>
              </span>
            </div>

            {/* 營業時間 */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">營業時間</p>
              <ul className="text-gray-700 leading-relaxed">
                <li>週一至週五&nbsp;&nbsp;9:00 – 17:00</li>
                <li>週六&nbsp;&nbsp;10:00 – 15:00</li>
                <li className="text-gray-400 text-sm mt-1">週日休息 · 到店請先預約</li>
              </ul>
            </div>

            {/* Email */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">電子郵箱</p>
              <a href={`mailto:${email}`} className="text-lg text-gray-700 hover:text-[#4DB6E8] transition-colors">
                {email}
              </a>
            </div>

            {/* QR Codes */}
            {(qrWechat?.url || qrLine?.url) && (
              <div className="flex gap-8 pt-6 border-t border-gray-100">
                {qrWechat?.url && (
                  <div className="text-center">
                    <div className="relative w-32 h-32 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-2">
                      <Image src={qrWechat.url} alt="微信二維碼" fill sizes="128px" className="object-contain p-2" />
                    </div>
                    <p className="text-xs tracking-[0.3em] text-gray-500">微信</p>
                  </div>
                )}
                {qrLine?.url && (
                  <div className="text-center">
                    <div className="relative w-32 h-32 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-2">
                      <Image src={qrLine.url} alt="LINE 二維碼" fill sizes="128px" className="object-contain p-2" />
                    </div>
                    <p className="text-xs tracking-[0.3em] text-gray-500">LINE</p>
                  </div>
                )}
              </div>
            )}

            {/* 地圖 */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md h-48">
              <iframe
                title="天使窗簾 門市位置"
                width="100%"
                height="100%"
                loading="lazy"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
                src={MAPS_EMBED_URL}
              />
            </div>
          </div>

          {/* 右:預約表單 */}
          <div className="bg-gray-50 p-8 md:p-10 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
            <h3 className="text-2xl font-light tracking-tight mb-2">預約表單</h3>
            <p className="text-gray-500 text-sm mb-8">免費上門量尺與設計諮詢,無任何購買義務。</p>
            <ZhConsultationForm />
          </div>
        </div>
      </section>

      {/* ── 保固與服務 ── */}
      <section className="w-full border-t border-gray-100 bg-[#F8F8F6] py-14 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gray-500 mb-6">保固與服務</p>
          <div className="grid gap-8 md:grid-cols-2 text-sm leading-relaxed text-gray-600">
            <div>
              <h3 className="text-base font-medium text-[#12141C] mb-2">三年安裝保固</h3>
              <p>所有安裝工程提供三年保固——我們安裝的任何部分若需要調整,免費上門處理。</p>
            </div>
            <div>
              <h3 className="text-base font-medium text-[#12141C] mb-2">免費上門量尺</h3>
              <p>服務範圍內的諮詢與量尺一律免費——每一扇窗都由我們親自測量後,才進入縫製。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0d0f17] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-5">
          <FooterSocial youtube={footer.youtube} etsy={footer.etsy} tiktok={footer.tiktok} instagram={footer.instagram} />
          <p className="text-white/30 text-sm">{COPYRIGHT}</p>
        </div>
      </footer>
    </main>
  )
}
