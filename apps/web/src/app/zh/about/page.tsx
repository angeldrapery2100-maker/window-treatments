import type { Metadata } from 'next'
import Link from 'next/link'
import { getPageContent, getText } from '@/lib/content'
import { COPYRIGHT } from '@/lib/site'
import FooterSocial from '@/components/FooterSocial'
import ZhNav from '@/components/zh/ZhNav'

export const metadata: Metadata = {
  title: '關於我們 — 天使窗簾',
  description:
    '天使窗簾 1984 年創立於聖蓋博谷,自家工坊手工縫製訂製窗簾四十餘年。2022 年新一代接手,延續手藝並引入智能窗簾,服務大洛杉磯地區。',
  alternates: {
    canonical: '/zh/about',
    languages: { en: '/about', 'zh-Hant': '/zh/about' },
  },
}

export const revalidate = 300

const ACCENT = '#4DB6E8'

// Traditional-Chinese rendition of the three "Our Story" paragraphs
// (see app/about/page.tsx for the English originals).
const STORY_PARAGRAPHS = [
  '天使窗簾 1984 年創立於聖蓋博谷。四十年來,我們的工坊為大洛杉磯地區數以千計的家庭手工縫製訂製窗簾——走過一個又一個風格年代,一扇窗、一扇窗地做下來。',
  '2022 年,生意交到了新一代手中,帶著一個簡單的承諾:把天使窗簾四十年來最受信賴的東西全部留下——自家工坊、一絲不苟的手藝、貼心的服務——並讓它走進現代家庭。此後,我們開設了新門市,建立了兼容 Apple HomeKit、Google Home 與 Matter 的智能窗簾體系,也讓從設計到安裝的流程更快、更透明。',
  '有些事始終沒有變:每一扇窗依然由我們親自測量,每一幅窗簾依然在自家工坊縫製,每一次安裝我們都負責到底。',
]

const VALUES = [
  { title: '紮實手藝', desc: '自家工坊縫製,細節經得起近看,也經得起多年使用。' },
  { title: '客戶優先', desc: '從量尺到售後,都由熟悉您家情況的同一個團隊負責。' },
  { title: '深耕本地', desc: '1984 年起立足聖蓋博谷,服務大洛杉磯地區至今。' },
  { title: '用料講究', desc: '與 Hunter Douglas 等品牌長期合作,布料與五金均經挑選。' },
]

export default async function ZhAboutPage() {
  const globalData = await getPageContent('global')

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
          alt="天使窗簾 工坊與作品"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

        <ZhNav activeHref="/zh/about" enHref="/about" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-16 w-full">
          <span className="block text-[10px] font-bold tracking-[0.4em] uppercase mb-4" style={{ color: ACCENT }}>
            Temple City, CA · 1984 年至今
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white leading-tight">
            關於我們
          </h1>
        </div>
      </section>

      {/* ── 我們的故事 ── */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <span className="block text-[10px] font-bold tracking-[0.4em] uppercase mb-4" style={{ color: ACCENT }}>
            我們的故事
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-10">
            四十年,一扇窗一扇窗做下來
          </h2>
          <div className="space-y-6 text-gray-600 leading-loose text-[15px] md:text-base">
            {STORY_PARAGRAPHS.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── 我們的堅持 ── */}
      <section className="py-24 px-6 md:px-10 bg-[#F8F8F6]">
        <div className="max-w-6xl mx-auto">
          <span className="block text-[10px] font-bold tracking-[0.4em] uppercase mb-4" style={{ color: ACCENT }}>
            我們的堅持
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-14">不變的四件事</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white border border-gray-100 rounded-2xl p-8">
                <div className="w-10 h-[2px] mb-6" style={{ backgroundColor: ACCENT }} />
                <h3 className="text-lg font-medium tracking-wide mb-3">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 深色 CTA ── */}
      <section className="bg-[#12141C] py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <span className="block text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: ACCENT }}>
            開始您的窗簾計劃
          </span>
          <p className="text-white/80 text-lg font-light leading-relaxed">
            免費上門量尺與設計諮詢,安裝工程三年保固。
          </p>
          <Link
            href="/zh/contact"
            className="inline-block bg-white px-8 py-3 text-[#12141C] text-sm tracking-[0.2em] rounded-sm hover:bg-gray-100 transition-colors"
          >
            預約免費上門量尺
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
