import { getPageContent, getText, getImage } from '@/lib/content'
import HomeClient from './HomeClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const data = await getPageContent('home')
  const globalData = await getPageContent('global')

  // Build serializable props for client component
  const hero = {
    background: data?.hero?.background?.image_url || data?.hero?.video?.image_url || '/videos/hero-background.mp4',
    titleCn: getText(data, 'hero', 'title_cn', '天使窗簾'),
    titleEn: getText(data, 'hero', 'title_en', 'ANGEL DRAPERY, INC'),
    subtitle: getText(data, 'hero', 'subtitle', '专业窗簾設計、訂造、安裝'),
    tagline: getText(data, 'hero', 'tagline', 'Since 1984 · 40 Years of Excellence'),
  }

  const galleryImages = Array.from({ length: 11 }, (_, i) => {
    const img = getImage(data, 'gallery', `project_${i + 1}`)
    return {
      id: i + 1,
      url: img?.url || '',
      alt: img?.alt || `Project ${i + 1}`,
      width: img?.width || 400,
      height: img?.height || 533,
      fit: img?.fit || 'cover',
    }
  })

  const about = {
    title: getText(data, 'about', 'title', 'We Make Handcrafted Drapery'),
    highlight: getText(data, 'about', 'highlight', '40 years experience'),
    subtitle: getText(data, 'about', 'subtitle', 'focus on handcrafted drapery'),
    description: getText(data, 'about', 'description', 'Designing, measuring, and installing custom window treatments has never been easier with our team of experienced professionals.'),
    image: getImage(data, 'about', 'image'),
  }

  const process = {
    title: getText(data, 'process', 'title', 'THE PROCESS'),
    subtitle: getText(data, 'process', 'subtitle', 'Designing, measuring, and installing custom window treatments has never been easier with our team of experienced professionals.'),
    steps: [1, 2, 3].map(i => ({
      title: getText(data, 'process', `step_${i}_title`, ['DESIGN CONSULTATION', 'IN-HOME MEASUREMENT', 'PROFESSIONAL INSTALLATION'][i - 1]),
      desc: getText(data, 'process', `step_${i}_desc`, ''),
      image: getImage(data, 'process', `step_${i}_image`),
    })),
  }

  const contact = {
    title: getText(data, 'contact', 'title', 'Contact'),
    subtitle: getText(data, 'contact', 'subtitle', 'Thank you for visiting our website. For more information and special requests, please contact us today.'),
    address: getText(data, 'contact', 'address', '8831 E Las Tunas Dr, Temple City, CA, 91780'),
    email: getText(data, 'contact', 'email', 'angeldrapery2100@yahoo.com'),
    phones: [
      getText(data, 'contact', 'phone_1', '626-451-9841'),
      getText(data, 'contact', 'phone_2', '626-451-9840'),
      getText(data, 'contact', 'phone_3', '626-703-2929'),
    ],
    qrLine: getImage(data, 'contact', 'qr_line'),
    qrWechat: getImage(data, 'contact', 'qr_wechat'),
  }

  const footer = {
    copyright: getText(globalData, 'footer', 'copyright', '©2025 by Angel Drapery'),
    youtube: getText(globalData, 'footer', 'youtube_url', '#'),
    etsy: getText(globalData, 'footer', 'etsy_url', '#'),
    tiktok: getText(globalData, 'footer', 'tiktok_url', '#'),
    instagram: getText(globalData, 'footer', 'instagram_url', 'https://instagram.com/angeldrapery?igshid=MjEwN2IyYWYwYw=='),
  }

  const LUMA_DEFAULTS = [
    { name: 'Zebra Shade', tag: 'Dual-Layer Light Control', desc: 'Alternate sheer and solid bands glide effortlessly to dial in exactly the right light and privacy.', image: '/luma-collection/lifestyle-dark-livingroom.png', href: '/products/luma-collection' },
    { name: 'Roller Shade', tag: 'Clean · Minimal · Versatile', desc: 'A single smooth fabric panel that rolls away completely, keeping your view unobstructed and your lines razor-clean.', image: '/roller-collection/lifestyle-minimalist.png', href: '/products/roller-collection' },
    { name: 'Sheer Shade', tag: 'Soft Light · Warm Ambiance', desc: 'Gossamer fabric diffuses sunlight into a gentle luminous glow — the effortless way to brighten any room without glare.', image: '/sheer-collection/lifestyle-sheer-sunlit.png', href: '/products/sheer-collection' },
  ]

  const lumaCards = [1, 2, 3].map(i => {
    const def = LUMA_DEFAULTS[i - 1]
    const img = getImage(data, 'luma', `card_${i}_image`)
    return {
      name: getText(data, 'luma', `card_${i}_name`, def.name),
      tag:  getText(data, 'luma', `card_${i}_tag`,  def.tag),
      desc: getText(data, 'luma', `card_${i}_desc`, def.desc),
      image: img?.url || def.image,
      href: def.href,
    }
  })

  return <HomeClient hero={hero} gallery={galleryImages} about={about} process={process} contact={contact} footer={footer} lumaCards={lumaCards} />
}
