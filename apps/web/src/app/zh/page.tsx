import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPageContent, getText, getImage } from '@/lib/content'
import { COPYRIGHT, PRIMARY_PHONE, BUSINESS_ADDRESS } from '@/lib/site'
import FooterSocial from '@/components/FooterSocial'
import ZhNav from '@/components/zh/ZhNav'

export const metadata: Metadata = {
  title: '天使窗簾 — 專業窗簾設計・訂製・安裝',
  description:
    '天使窗簾(Angel Drapery)自 1984 年起服務洛杉磯,聖蓋博谷自家工坊訂製窗簾、羅馬簾與智能電動窗簾。免費上門量尺,三年安裝保固。',
  alternates: {
    canonical: '/zh',
    languages: { en: '/', 'zh-Hant': '/zh' },
  },
}

// ISR — same cadence as the English homepage.
export const revalidate = 300

const ACCENT = '#4DB6E8'

// 三個賣點:懂華人家庭的窗簾需求
const SELLING_POINTS = [
  {
    title: '全遮光臥室',
    desc: '側軌遮光、無縫拼接,把臥室的漏光降到最低。倒班、淺眠或家中有長輩小孩,都能睡得安穩。',
  },
  {
    title: '朝向與採光',
    desc: '西曬客廳、朝北書房,每個朝向的光線都不同。我們上門實地查看後,再建議布料的透光度與層次搭配。',
  },
  {
    title: '隱私與格局考量',
    desc: '臨街窗、對窗鄰居、開門見窗——這些細節我們都會在量尺時一併考慮,兼顧隱私、通風與居家格局。',
  },
]

const PROCESS_STEPS = [
  { step: '01', title: '免費諮詢', desc: '電話或微信聯繫,聊聊您的窗型、預算與想要的風格,先給您一個大致方向。' },
  { step: '02', title: '上門量尺', desc: '我們親自到府精準測量每一扇窗,現場帶布料色板供您比對,量尺與報價均不收費。' },
  { step: '03', title: '專業安裝', desc: '自家工坊縫製完成後,由經驗豐富的安裝團隊到府安裝,安裝工程提供三年保固。' },
]

export default async function ZhHomePage() {
  const [data, globalData] = await Promise.all([
    getPageContent('home'),
    getPageContent('global'),
  ])

  // Same CMS hero background as the English homepage; graceful video fallback.
  const heroBackground =
    data?.hero?.background?.image_url ||
    data?.hero?.video?.image_url ||
    '/videos/hero-background.mp4'
  const heroIsVideo = /\.(mp4|mov|webm)(\?|$)/i.test(heroBackground)

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
      <section className="relative h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          {heroIsVideo ? (
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src={heroBackground} type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroBackground} alt="天使窗簾 訂製窗簾展示" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <ZhNav activeHref="/zh" enHref="/" />

        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-light tracking-[0.18em] text-white mb-6">
            天使窗簾
          </h1>
          <p className="text-lg md:text-2xl text-white/90 font-light tracking-[0.22em] mb-3">
            專業窗簾設計・訂製・安裝
          </p>
          <p className="text-sm md:text-base text-white/60 tracking-[0.3em] mb-10">
            服務洛杉磯40餘年
          </p>
          <Link
            href="/zh/contact"
            className="inline-block px-10 py-4 bg-white text-[#12141C] text-sm md:text-base tracking-[0.2em] rounded-sm hover:bg-gray-100 transition-colors"
          >
            預約免費上門量尺
          </Link>
        </div>
      </section>

      {/* ── 三個賣點:懂華人家庭需求 ── */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <span className="block text-[10px] font-bold tracking-[0.4em] uppercase mb-4" style={{ color: ACCENT }}>
            為什麼選擇我們
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">懂華人家庭的窗簾需求</h2>
          <p className="text-gray-500 leading-relaxed max-w-2xl mb-14">
            四十多年來,我們為聖蓋博谷與大洛杉磯地區的無數家庭訂製窗簾。從遮光到隱私,每個家庭在意的細節,我們都熟悉。
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {SELLING_POINTS.map(point => (
              <div
                key={point.title}
                className="border border-gray-100 rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
              >
                <div className="w-10 h-[2px] mb-6" style={{ backgroundColor: ACCENT }} />
                <h3 className="text-xl font-medium tracking-wide mb-3">{point.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 智能窗簾 ── */}
      <section className="bg-[#12141C] py-24 px-6 md:px-10 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="block text-[10px] font-bold tracking-[0.4em] uppercase mb-4" style={{ color: ACCENT }}>
              智能窗簾
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-6">
              一句話,窗簾自動升降
            </h2>
            <p className="text-white/70 leading-relaxed mb-6">
              我們的電動智能窗簾支援 Apple HomeKit、Google Home 與 Matter 標準,可用手機、語音或定時自動控制。
              清晨自動緩緩升起,傍晚自動放下——也可以與家中現有的智能場景聯動。
            </p>
            <ul className="space-y-3 text-white/80 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ACCENT }} />
                <span>支援 Apple HomeKit / Google Home / Matter,不換系統也能接入</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ACCENT }} />
                <span>充電式靜音馬達,免佈線,舊窗簾也可加裝電動軌道</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ACCENT }} />
                <span>安裝時由我們協助完成手機配對與場景設定,長輩也容易上手</span>
              </li>
            </ul>
          </div>
          <div className="border border-white/10 rounded-2xl p-10 bg-white/[0.03]">
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/40 mb-8">兼容平台</p>
            <div className="space-y-6">
              {['Apple HomeKit', 'Google Home', 'Matter'].map(name => (
                <div key={name} className="flex items-center justify-between border-b border-white/10 pb-5">
                  <span className="text-lg font-light tracking-wide">{name}</span>
                  <span className="text-xs tracking-widest" style={{ color: ACCENT }}>支援</span>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs leading-relaxed mt-8">
              歡迎預約到 Temple City 門市體驗實機操作(需預約)。
            </p>
          </div>
        </div>
      </section>

      {/* ── 服務流程 ── */}
      <section className="py-24 px-6 md:px-10 bg-[#F8F8F6]">
        <div className="max-w-6xl mx-auto">
          <span className="block text-[10px] font-bold tracking-[0.4em] uppercase mb-4" style={{ color: ACCENT }}>
            服務流程
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-14">三步完成,從量尺到安裝</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {PROCESS_STEPS.map(item => (
              <div key={item.step}>
                <p className="text-5xl font-extralight text-gray-300 mb-4">{item.step}</p>
                <h3 className="text-xl font-medium tracking-wide mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 聯繫區塊 ── */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="block text-[10px] font-bold tracking-[0.4em] uppercase mb-4" style={{ color: ACCENT }}>
            聯繫我們
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">預約免費上門量尺</h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            電話、簡訊或掃碼加好友都可以,我們會儘快回覆。<br className="hidden md:block" />
            門市地址:{BUSINESS_ADDRESS}(參觀需預約)
          </p>
          <a
            href={`tel:${PRIMARY_PHONE}`}
            className="inline-block text-3xl md:text-4xl font-light tracking-wider hover:text-[#4DB6E8] transition-colors mb-12"
          >
            {PRIMARY_PHONE}
          </a>

          {(qrWechat?.url || qrLine?.url) && (
            <div className="flex justify-center gap-12 mb-12">
              {qrWechat?.url && (
                <div className="text-center">
                  <div className="relative w-40 h-40 md:w-48 md:h-48 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden mb-3 mx-auto">
                    <Image src={qrWechat.url} alt="微信二維碼" fill sizes="192px" className="object-contain p-3" />
                  </div>
                  <p className="text-sm tracking-[0.3em] text-gray-600">微信</p>
                </div>
              )}
              {qrLine?.url && (
                <div className="text-center">
                  <div className="relative w-40 h-40 md:w-48 md:h-48 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden mb-3 mx-auto">
                    <Image src={qrLine.url} alt="LINE 二維碼" fill sizes="192px" className="object-contain p-3" />
                  </div>
                  <p className="text-sm tracking-[0.3em] text-gray-600">LINE</p>
                </div>
              )}
            </div>
          )}

          <Link
            href="/zh/contact"
            className="inline-block px-10 py-4 bg-[#12141C] text-white text-sm tracking-[0.2em] rounded-sm hover:bg-black transition-colors"
          >
            填寫預約表單
          </Link>
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
