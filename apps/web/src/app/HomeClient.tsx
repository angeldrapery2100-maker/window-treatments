'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SiteNav from '@/components/SiteNav'
import LumaShowcase, { type LumaCardData } from '@/components/LumaShowcase'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'

interface GalleryImage {
  id: number
  url: string
  alt: string
  width: number
  height: number
  fit: string
}

interface ImageData {
  url: string
  alt: string
  width: number
  height: number
  fit: string
}

interface Props {
  hero: { background: string; titleCn: string; titleEn?: string; subtitle: string; tagline: string }
  gallery: GalleryImage[]
  about: {
    title: string; highlight: string; subtitle: string; description: string
    image: ImageData | null
  }
  process: {
    title: string; subtitle: string
    steps: { title: string; desc: string; image: ImageData | null }[]
  }
  contact: {
    title: string; subtitle: string; address: string; email: string
    phones: string[]
    qrLine: ImageData | null; qrWechat: ImageData | null
  }
  footer: { copyright: string; youtube: string; etsy: string; tiktok: string; instagram: string }
  lumaCards?: LumaCardData[]
}

export default function HomeClient({ hero, gallery, about, process: processData, contact, footer, lumaCards }: Props) {
  const [lightboxImage, setLightboxImage] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // React 表单状态
  const [openPercentage, setOpenPercentage] = useState(75)
  const [shadePercentage, setShadePercentage] = useState(75)  // 卷帘/布帘延迟跟随
  const [shadeDuration, setShadeDuration] = useState(0)       // 按比例计算的动画时长
  const prevShadeRef = useRef(75)                              // 上一次 shadePercentage
  const [tappedLogos, setTappedLogos] = useState<Set<string>>(new Set())
  const sliderRef = useRef<SVGRectElement | HTMLDivElement>(null)
  const shadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 滑块停止后 300ms 延迟，卷帘/布帘才开始运动
  // 动画时长 = 8秒 × |变化量| / 100（全程8秒，按比例缩放）
  useEffect(() => {
    if (shadeTimerRef.current) clearTimeout(shadeTimerRef.current)
    shadeTimerRef.current = setTimeout(() => {
      const delta = Math.abs(openPercentage - prevShadeRef.current)
      const duration = Math.max(0.3, (8 * delta) / 100)  // 最短 0.3s 避免太突兀
      setShadeDuration(duration)
      setShadePercentage(openPercentage)
      prevShadeRef.current = openPercentage
    }, 300)
    return () => { if (shadeTimerRef.current) clearTimeout(shadeTimerRef.current) }
  }, [openPercentage])

  // Pointer-capture drag — works on PC + mobile without losing track
  const updatePercentage = useCallback((clientY: number) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    let y = clientY - rect.top
    y = Math.max(0, Math.min(y, rect.height))
    const percent = Math.round((1 - y / rect.height) * 100)
    setOpenPercentage(percent)
  }, [])

  // Toggle logo color on tap (mobile)
  const toggleLogo = useCallback((name: string) => {
    setTappedLogos(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  // Framer Motion 动画变体
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  }

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  }

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } }
  }

  const galleryItem = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', delay: i * 0.1 }
    })
  }

  const logoHover = {
    rest: {
      scale: 1,
      opacity: 0.35,
      filter: "grayscale(100%)",
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.05,
      opacity: 1,
      filter: "grayscale(0%)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tapped: {
      scale: 1.05,
      opacity: 1,
      filter: "grayscale(0%)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    reveal: { scale: 1, opacity: 1, filter: "grayscale(0%)" }
  }

  const hdVariants = {
    rest: {
      scale: 1,
      opacity: 0.45,
      filter: "grayscale(100%)",
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.05,
      opacity: 1,
      filter: "grayscale(0%)",
      transition: { duration: 0.4, ease: "easeOut" }
    },
    tapped: {
      scale: 1.05,
      opacity: 1,
      filter: "grayscale(0%)",
      transition: { duration: 0.4, ease: "easeOut" }
    },
    reveal: { scale: 1, opacity: 1, filter: "grayscale(0%)" }
  }

  // Helper: get animate state for logos (supports mobile tap-to-toggle)
  const getLogoAnimate = (name: string) => tappedLogos.has(name) ? "tapped" : "rest"

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -400 : 400,
        behavior: 'smooth',
      })
    }
  }

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    const form = e.currentTarget
    const fd = new FormData(form)

    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          phone: fd.get('phone'),
          email: fd.get('email'),
          notes: [fd.get('address') ? `Address: ${fd.get('address')}` : '', fd.get('message') || ''].filter(Boolean).join('\n') || null,
        }),
      })
      if (!res.ok) throw new Error()

      form.reset()
      setSubmitStatus({ type: 'success', message: "Message sent! We'll get back to you shortly." })
    } catch {
      setSubmitStatus({ type: 'error', message: 'Failed to send. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const lightboxItem = lightboxImage !== null ? gallery.find(g => g.id === lightboxImage) : null
  const heroTitleCn = hero.titleCn.trim() || '天使窗簾'
  const heroSubtitle = hero.subtitle.trim() || '专业窗簾設計、訂造、安裝'
  const heroTagline = hero.tagline.trim() || 'Since 1984 · 40 Years of Excellence'
  const mobileSmartPlatforms = ['Home Assistant', 'Matter', 'Apple HomeKit', 'Google Home']
  const mobilePartnerBrands = ['Somfy', 'ALTA', 'Rowley', 'Kirsch', 'Sundance', 'Forest', 'Norman', 'Kaslen']

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gray-800">
          {/\.(mp4|mov|webm)(\?|$)/i.test(hero.background) ? (
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src={hero.background} type="video/mp4" />
            </video>
          ) : (
            // Hero LCP image — use next/image with priority + fill so Next
            // emits a preload link, generates responsive srcset, and serves
            // WebP/AVIF when the browser supports it. Drops the source 4032x3024
            // originals (~8MB) down to ~100–200KB at the rendered viewport.
            <Image
              src={hero.background}
              alt={hero.titleEn ? `${hero.titleEn} window treatments showroom` : 'Window treatments showroom'}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/45 md:bg-black/40" />
        </div>

        <SiteNav activePage="Home" brandName={hero.titleEn} />

        <div className="absolute inset-0 flex items-center justify-center px-6 pt-20 md:px-0 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            className="z-10 max-w-[92vw] text-center md:max-w-4xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.18em] md:tracking-[0.3em] leading-tight text-white mb-4 md:mb-6 drop-shadow-2xl text-balance">
              {heroTitleCn}
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-white/90 tracking-[0.18em] md:tracking-wider mb-3 md:mb-4 drop-shadow-lg text-balance">
              {heroSubtitle}
            </p>
            <p className="mx-auto max-w-[26rem] text-[11px] sm:text-xs md:text-sm text-gray-300 tracking-[0.14em] md:tracking-wider drop-shadow-lg">
              {heroTagline}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden sm:block md:bottom-12"
        >
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white text-sm tracking-wider drop-shadow-lg">SCROLL</span>
            <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Brand Grid & Smart Ecosystem - Unified & Compact with Radar Sweep */}
      <section className="w-full bg-white py-16 md:py-24 border-y border-gray-100 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center relative">

          <div className="w-full md:hidden rounded-[2rem] border border-gray-100 bg-[#F8F8F6] px-5 py-8 shadow-sm">
            <div className="text-center">
              <p className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gray-500">Smart Ecosystem</p>
              <div className="mt-5 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.28em] text-gray-400">Powered by</span>
                <span className="ml-3 text-lg font-semibold tracking-tight text-[#12141C]">Hunter Douglas</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                Works with the platforms your clients already use, while keeping premium drapery and shade brands within reach.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {mobileSmartPlatforms.map((platform) => (
                <motion.div
                  key={platform}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl border border-[#5BC1F5]/15 bg-white px-3 py-3 text-center text-xs font-semibold tracking-[0.12em] text-[#12141C] shadow-sm"
                >
                  {platform}
                </motion.div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gray-500 text-center">Trusted Brands</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {mobilePartnerBrands.map((brand) => (
                  <span
                    key={brand}
                    className="rounded-full border border-gray-200 bg-white px-3 py-2 text-[11px] font-medium tracking-[0.14em] text-gray-700 shadow-sm"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {(() => {
            const renderLogoGrid = (isOverlay = false) => (
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-8 items-center justify-items-center relative">

            {/* 1. Somfy */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('somfy')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('somfy')} className="cursor-pointer w-28">
              <svg viewBox="0 0 652 652" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(0.000000, 9.000000)">
                  <g transform="translate(0.000000, 11.000000)">
                    {/* 第一个圆点 */}
                    <path fill="#F2AF35" d="M42.6,312c0.2,0,5,2.1,10,4.2l15.6,6.6c3.7,1.5,5.6,5.6,4.6,9.7c-1.3,5.1-7.2,10-19.9,8.3c-5-0.7-16.8-3.3-16.9-3.4l0.1,0c-0.3-0.1-7.3-2.8-11.7-0.3c-1.6,0.9-2.6,2.2-3,4.2c-1.7,6.9,5.1,9.3,5.2,9.3c2.4,0.9,5.1,1.5,7.3,2l1.8,0.5c0.1,0,15.5,3.8,27.7,3.7c8-0.1,27.5-2,35.1-16.6c1.1-2.1,2.7-9.7,1.9-14.4c-0.9-5.5-2.5-11-11.7-17.2c-2.3-1.5-9.5-4.1-15.9-6.3c-3.4-1.1-6.6-2.3-8.3-3c-11.2-4.7-13.2-9-13.4-11.2c-0.1-1.3,0.3-4.1,2.4-6.6c2.7-3,7.2-4.6,13.3-4.6c9.3,0,12.8,1.1,16.7,2.3c0.7,0.3,1.4,0.5,2.2,0.7c2.9,0.8,5.2,0.7,6.8-0.4c1.9-1.3,2.3-3.4,2.5-4.2c0.2-1.3,0.5-5.8-6.2-8.6c-0.6-0.2-14.3-5.8-36-2.7c-3,0.4-9,1.6-14.6,4.9c-8.2,4.7-12.5,12-12.3,21.2c0.1,6.6,3,12.4,8.5,16.9C38.4,310.5,42.4,312,42.6,312"/>
                  </g>
                  {/* 字母 o */}
                  <path fill="#F2AF35" d="M191.1,343.7c-13.3,0-24.2-10.8-24.2-24.2c0-13.4,10.9-24.2,24.2-24.2c13.3,0,24.2,10.8,24.2,24.2C215.3,332.8,204.4,343.7,191.1,343.7z M191.1,251.8c-37.4,0-67.7,30.3-67.7,67.7c0,37.4,30.3,67.7,67.7,67.7c37.4,0,67.7-30.3,67.7-67.7C258.8,282.1,228.5,251.8,191.1,251.8z"/>
                  {/* 字母 m */}
                  <path fill="#F2AF35" d="M277.1,287.9c0,0-0.5-10.4,11.1-10.4c6.7,0,10.9,5.8,18.7,5.8c10,0,12.7-5.8,26.2-5.8c15.5,0,16.4,5.8,26,5.8c10.1,0,11.9-5.8,29.8-5.8c9.5,0,19.9,5.3,19.9,16.7c0,15.5,0,56.6,0,56.8c0,5.8-5,10.7-11.1,10.7c-6.1,0-11.1-4.8-11.1-10.7c0,0,0-42.5,0-46.6c0-5.2,0.1-15.6-9.4-15.8c0,0-23.1-3.1-23.1,35.8c0,0.6,0,26.4,0,26.6c0,5.8-5,10.7-11.1,10.7c-6,0-10.9-4.6-11.1-10.3c0,0,0-37.1,0-46.9c0-3.4,0.6-15.8-9.6-15.8c-19.7,0-23,19.3-23,35.1v27.2c0,5.8-5,10.7-11.1,10.7c-6,0-10.9-4.6-11.1-10.3V287.9"/>
                  <g transform="translate(110.000000, 0.000000)">
                    {/* 字母 f */}
                    <path fill="#F2AF35" d="M360.3,312.1c0.2-5,4.2-8.9,9.3-8.9h0h0.2h-0.2c0,0,0.1,0,11.9,0c3.8,0,6.9-1.1,9.1-3.3c3.4-3.4,3.6-8.5,3.6-9.4c0-1.3-0.2-5.6-3.3-8.7c-2.1-2.2-5.2-3.3-9.1-3.3h-12c-8.2,0-8.2-1.9-8.2-6.8c0-0.1,0.3-10.1,8.3-13c2.5-0.9,5.4-1.4,8.4-1.4h14.5c5,0,9.6-3.4,11-8.2c0.3-1.1,0.5-2.2,0.5-3.3c0-6.3-5.2-11.4-11.5-11.4c-0.2,0-13.8,0-13.8,0c-1.9,0-4,0.1-6.1,0.3c-6.5,0.7-12.3,2.2-17.3,4.4c-21.2,9.4-22.2,28.5-22.2,28.8l0,0.3c-1.1,6.6-2.8,10.2-9.1,10.2c-3.1,0-5.6,1-7.5,3c-3.3,3.5-3.1,8.8-3.1,8.9v-0.1c0,10.9,10.3,12.9,10.4,12.9c4.9,0.4,8.5,4.3,8.5,9.1c0,0.3-0.1,24.7-0.1,37.7c0,4.6,1.2,8.1,3.6,10.5c3.1,3.1,7.2,3.2,7.3,3.2h5.5c0.3,0,3.4-0.1,6.2-2c2.3-1.6,5.1-4.9,5.1-11.5V312.1"/>
                    {/* 字母 y */}
                    <path fill="#F2AF35" d="M439.2,347.5c0.8,1.8,1.2,3.7,1.2,5.7c0,10.7-6,15.3-8.8,17.7c-7.3,6-17.6,5.6-17.7,5.6h-5.6c-3.5,0-7.5,2.9-7.5,7.1c0,4.5,3,7.2,8,7.2h5.1c0.3,0,7.5,0.3,15.2-2.2c7.8-2.5,18.6-8.3,26-22.1c1.8-3.3,17.1-37.8,28.3-63l8.5-19.1c0.5-1.2,0.6-2.3,0.2-3.4c-0.4-1.2-1.3-2.2-2.5-2.9c-2.2-1.2-5.3-1.2-8.3-0.3c-3.1,1-5.7,3.1-6.8,5.3c-0.1,0.3-12.7,27.7-13.7,29.5c-2.5,4.9-5.5,7.8-8.2,7.8c-3.2,0-5.2-0.4-9.8-8.3c-0.4-0.6-14.2-25-16.4-28.9c-1.2-2.4-4-4.5-7.2-5.5c-3.3-1-6.7-1-9,0.3c-1.4,0.7-2.4,1.8-2.8,3.1c-0.4,1.2-0.3,2.4,0.3,3.7C407.8,285.3,437.4,343.8,439.2,347.5"/>
                  </g>
                  {/* 注册商标符号 R */}
                  <path fill="#F2AF35" d="M607.1,348.1h-0.5v3.4h0.4c1.3,0,2.4-0.5,2.4-1.8C609.5,348.4,608.6,348.1,607.1,348.1z M610.2,358.7c-1.7-3.1-2.8-5-3.2-5h-0.3v5h-2.8v-12.8h4.3c2.8,0,4.4,1.5,4.4,3.5c0,2.1-1.8,3.1-2.9,3.5v0c0.6,0,2.4,3,3.9,5.8H610.2z M608.1,342.6c-5.5,0-9.4,4.3-9.4,9.9c0,5.5,3.9,9.8,9.4,9.8c5.4,0,9.4-4.3,9.4-9.8C617.5,346.9,613.5,342.6,608.1,342.6z M608.1,365.2c-7.6,0-12.7-5.5-12.7-12.8c0-7.3,5.2-12.8,12.8-12.8c7.3,0,12.8,5.5,12.8,12.8C621,359.8,615.4,365.2,608.1,365.2z"/>
                </g>
              </svg>
            </motion.div>

            {/* 2. ALTA */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('alta')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('alta')} className="cursor-pointer flex flex-col items-center text-[#2A3439]">
              <span className="font-sans font-medium text-3xl tracking-[0.25em] mb-1">ALTA</span>
              <span className="font-sans text-[0.5rem] tracking-[0.4em] uppercase">Window Fashions</span>
            </motion.div>

            {/* 3. Rowley */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('rowley')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('rowley')} className="cursor-pointer flex items-center gap-2">
              <svg viewBox="0 0 40 40" className="w-8 h-8">
                <rect x="0" y="5" width="20" height="30" rx="3" fill="#585A59"/>
                <path d="M12 12 Q24 12 24 20 Q24 24 18 26 L26 35 L18 35 L12 26 L12 35 L6 35 L6 12 Z" fill="#FFF"/>
              </svg>
              <span className="font-serif text-3xl text-[#D8903E] tracking-tight">Rowley</span>
            </motion.div>

            {/* 4. KIRSCH */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('kirsch')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('kirsch')} className="cursor-pointer flex items-center gap-2">
              <svg viewBox="0 0 30 40" className="w-6 h-8">
                <rect x="0" y="0" width="10" height="40" fill="#8763A5" />
                <polygon points="14,0 30,0 14,18" fill="#8E7E71" />
                <polygon points="14,22 30,40 14,40" fill="#CD1F7A" />
              </svg>
              <span className="font-sans font-light text-3xl tracking-widest text-[#666768]">KIRSCH</span>
            </motion.div>

            {/* 5. Sundance */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('sundance')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('sundance')} className="cursor-pointer flex flex-col items-center text-[#3A6A3B]">
              <span className="font-sans font-black text-3xl tracking-tighter">Sundance</span>
              <span className="font-sans font-bold text-[0.55rem] tracking-widest uppercase self-end mr-1">Window Coverings</span>
            </motion.div>

            {/* ================= 核心：Hunter Douglas + 智能生态系统两侧 ================= */}
            <div className="col-span-2 row-span-2 flex items-center justify-center gap-10 md:gap-16 relative z-10">

              {/* 左侧：Home Assistant + Matter */}
              <div className="flex flex-col items-center gap-5">
                <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('homeassistant')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('homeassistant')} className="cursor-pointer flex flex-col items-center gap-1.5 -mt-[70px]">
                  <svg viewBox="0 0 32 32" className="h-[108px] w-auto" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#3dbcf3" d="M5.114,27.944V18.427H2.66a.668.668,0,0,1-.47-1.134L15.41,3.748h0a.819.819,0,0,1,1.166-.008l.007.007,6.9,7.037v-1.3h0a.553.553,0,0,1,.55-.556h2.292a.553.553,0,0,1,.549.556v4.78L29.812,17.3h0a.671.671,0,0,1-.01.942.657.657,0,0,1-.462.19H26.876v9.517a.553.553,0,0,1-.549.556H5.664A.553.553,0,0,1,5.114,27.944Z" />
                    <path fill="#FFFFFF" d="M21.718,15.07a2.841,2.841,0,0,0-2.826,2.857,2.876,2.876,0,0,0,.224,1.116l-2.061,2.083V14.791a2.826,2.826,0,1,0-2.12,0v6.335l-2.061-2.083a2.876,2.876,0,0,0,.224-1.116,2.826,2.826,0,1,0-2.826,2.858,2.791,2.791,0,0,0,1.1-.227l3.559,3.6V28.5h2.12V24.157l3.56-3.6a2.782,2.782,0,0,0,1.1.227,2.858,2.858,0,0,0,0-5.715Z" />
                  </svg>
                  <span className="text-[9px] font-bold text-[#12141C] tracking-tight -mt-5">Home Assistant</span>
                </motion.div>
                <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('matter')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('matter')} className="cursor-pointer flex flex-col items-center gap-1.5 mt-[80px] ml-[40px]">
                  <svg viewBox="0 0 75 72" className="h-18 w-auto" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M65.715 32.905c-7.996 2.19-15.164 7.406-19.636 15.152s-5.407 16.568-3.306 24.587l7.835-4.526a23.9 23.9 0 0 1 1.105-11.836l18.309 10.569 4.303-2.487v-4.967L56.016 48.829a23.92 23.92 0 0 1 9.699-6.879zm-57.108 0v9.045a23.91 23.91 0 0 1 9.699 6.879L0 59.398v4.967l4.303 2.487 18.306-10.569c1.39 3.868 1.726 7.938 1.108 11.836l7.832 4.526c2.101-8.02 1.167-16.841-3.306-24.587A32.52 32.52 0 0 0 8.607 32.905zM37.161 0l-4.303 2.484v21.138c-4.046-.731-7.736-2.476-10.804-4.961l-7.838 4.522c5.895 5.83 14 9.429 22.946 9.429s17.051-3.599 22.946-9.429l-7.835-4.522a23.92 23.92 0 0 1-10.807 4.961V2.484z"/>
                  </svg>
                  <span className="text-[9px] font-bold text-[#12141C] tracking-widest uppercase">matter</span>
                </motion.div>
              </div>

              {/* 中央：Hunter Douglas */}
              <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('hd')} variants={hdVariants} onClick={() => !isOverlay && toggleLogo('hd')} className="cursor-pointer flex flex-col items-center justify-center">
                <svg viewBox="0 0 1518 1850" className="w-32 md:w-44 h-auto drop-shadow-sm transition-all duration-300" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <clipPath id="cp1"><path d="m-27.78 0h1605.52v1520.29h-1605.52z"/></clipPath>
                    <clipPath id="cp2"><path d="m774.98 767h802.76v753.29h-802.76z"/></clipPath>
                    <clipPath id="cp3"><path d="m-27.78 0h802.76v767h-802.76z"/></clipPath>
                  </defs>
                  <g id="layer1">
                    <g clipPath="url(#cp1)">
                      <path fill="#ffffff" d="m759 1520c-419.6 0-758.8-339.7-758.8-760 0-420.3 339.2-760 758.8-760 419.7 0 758.9 339.7 758.9 760 0 420.3-339.2 760-758.9 760z"/>
                      <path fill="#ef8200" d="m759 760.1v759.9c-419 0-758.6-340.1-758.6-759.9h758.6v-760.1c419.1 0 758.9 340.4 758.9 760.1z"/>
                    </g>
                    <g clipPath="url(#cp2)">
                      <path fill="#ef8200" d="m802.6 1518.9c384.3-22 692.2-330.1 713.8-715.1-388.2 72.3-641.6 326.1-713.8 715.1z"/>
                    </g>
                    <g clipPath="url(#cp3)">
                      <path fill="#ef8200" d="m715.4 1.4c-384.3 21.7-691.9 330.1-713.8 715.1 388.2-72.3 642-326.1 713.8-715.1z"/>
                    </g>
                  </g>
                  <text x="759" y="1800" fontFamily="sans-serif" fontSize="180" fontWeight="700" fill="#111827" textAnchor="middle" letterSpacing="-5">Hunter Douglas</text>
                </svg>
              </motion.div>

              {/* 右侧：Apple HomeKit + Google Home */}
              <div className="flex flex-col items-center gap-5">
                <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('homekit')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('homekit')} className="cursor-pointer flex flex-col items-center gap-0 -mt-[100px] -ml-[40px]">
                  <svg viewBox="0 0 1024 1024" className="h-40 w-auto" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FA9012" d="M883.2,413.1l-70.4-55.6V231.1c0-8.6-3.4-11-9.5-11h-64.4c-7,0-11.3,1.4-11.3,11v59.1l0,0C634.5,216.7,533.6,137,529.8,134c-7.6-6-12.3-7.6-17.8-7.6c-5.4,0-10.1,1.6-17.8,7.6c-7.6,6-343.2,271.1-353.4,279.1c-12.4,9.8-8.9,23.9,4.9,23.9h65.5v355.6c0,23,9.2,32.2,31.1,32.2h539.4c21.9,0,31.1-9.2,31.1-32.2V436.9h65.5C892.1,436.9,895.6,422.9,883.2,413.1z M757.6,742.6c0,15.9-8.2,26.9-24.8,26.9H291.1c-16.6,0-24.8-11-24.8-26.9V410.3c0-19.3,8.4-31.6,18.1-39.2l212.4-167.7c5.6-4.4,10.4-6.3,15.1-6.3s9.5,1.9,15.1,6.4l212.4,167.7c9.6,7.6,18.1,19.9,18.1,39.2V742.6z"/>
                    <path fill="#FFAB1F" d="M739.6,371.1L527.1,203.3c-5.6-4.4-10.6-6.3-15.1-6.3c-4.6,0-9.5,1.9-15.1,6.4L284.4,371.1c-9.6,7.6-18.1,19.9-18.1,39.2v332.3c0,15.9,8.2,26.9,24.8,26.9h441.7c16.6,0,24.8-11,24.8-26.9V410.3C757.6,391,749.2,378.7,739.6,371.1z M702.6,692.7c0,14.8-8.4,21.7-20.7,21.7H342.2c-12.3,0-20.7-6.9-20.7-21.7V433.2c0-14.4,3.4-22.6,13.6-30.7c5.8-4.6,160.3-126.6,164.4-129.8c4.1-3.3,8.5-4.9,12.5-4.9c4,0,8.4,1.7,12.5,4.9c4.1,3.3,158.6,125.3,164.4,129.8c10.2,8.1,13.6,16.4,13.6,30.7L702.6,692.7z"/>
                    <path fill="#FFBE41" d="M688.9,402.5c-5.8-4.5-160.3-126.6-164.4-129.8c-4.1-3.3-8.5-4.9-12.5-4.9c-4,0-8.4,1.7-12.5,4.9c-4.1,3.3-158.6,125.3-164.4,129.8c-10.2,8.1-13.6,16.4-13.6,30.7v259.5c0,14.8,8.4,21.7,20.7,21.7h339.7c12.3,0,20.7-6.9,20.7-21.7V433.2C702.5,418.9,699.1,410.6,688.9,402.5z M647.4,642.8c0,11.9-6.6,16.5-15.6,16.5H392.2c-9,0-15.6-4.6-15.6-16.5V456.2c0-8.3,0-14.9,9.1-22.2c6-4.8,113.2-89.4,116.4-91.9s6.4-3.8,9.9-3.8c3.6,0.1,7.1,1.5,9.9,3.8c3.2,2.5,110.4,87.1,116.4,91.9c9.1,7.3,9.1,13.9,9.1,22.2L647.4,642.8z"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#12141C] tracking-tight -mt-6">Apple Homekit</span>
                </motion.div>
                <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('googlehome')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('googlehome')} className="cursor-pointer flex flex-col items-center gap-1.5 mt-[80px] -ml-[50px]">
                  <svg width="128" height="128" viewBox="0 0 154 155" xmlns="http://www.w3.org/2000/svg" className="h-18 w-auto">
                    <defs>
                      <radialGradient id="a_gh" cx="-118.17" cy="280.42" r="1" gradientTransform="matrix(4.2185 35.138 43.765 -5.2543 -11436 6610)" gradientUnits="userSpaceOnUse"><stop stopColor="#facd0c" offset="0"/><stop stopColor="#facd0c" stopOpacity="0" offset="1"/></radialGradient>
                      <radialGradient id="b_gh" cx="-117.19" cy="278.63" r="1" gradientTransform="matrix(20.699 28.705 35.753 -25.781 -7188.5 11567)" gradientUnits="userSpaceOnUse"><stop stopColor="#a5ce3d" offset="0"/><stop stopColor="#a5ce3d" stopOpacity="0" offset="1"/></radialGradient>
                      <linearGradient id="i_gh" x1="118.38" x2="152.38" y1="151.08" y2="144.71" gradientTransform="matrix(.97602 .2177.2177 -.97602 266.35 1023.8)" gradientUnits="userSpaceOnUse"><stop stopColor="#d669a8" offset="0"/><stop stopColor="#577dbe" offset="1"/></linearGradient>
                      <linearGradient id="j_gh" x1="108.62" x2="108.62" y1="71.278" y2="32.087" gradientTransform="matrix(.98847 -.1514 -.1514 -.98847 359.52 1016.8)" gradientUnits="userSpaceOnUse"><stop stopColor="#547dbf" offset="0"/><stop stopColor="#18a1ce" offset="1"/></linearGradient>
                      <linearGradient id="c_gh" x1="21.62" x2="50.082" y1="38.375" y2="5.439" gradientTransform="matrix(1 0 0 -1 328.04 1024.1)" gradientUnits="userSpaceOnUse"><stop stopColor="#fcc010" offset="0"/><stop stopColor="#32b55e" offset="1"/></linearGradient>
                      <linearGradient id="d_gh" x1="62.695" x2="62.695" y1="154.54" y2="110.29" gradientTransform="matrix(.94765 .31932 .31932 -.94765 247.31 1054.1)" gradientUnits="userSpaceOnUse"><stop stopColor="#ef4b5a" offset="0"/><stop stopColor="#fabe0f" offset="1"/></linearGradient>
                      <linearGradient id="e_gh" x1="82.325" x2="66.325" y1="137.09" y2="136.59" gradientTransform="matrix(1 0 0 -1 328.04 1024.1)" gradientUnits="userSpaceOnUse"><stop stopColor="#d769a9" offset="0"/><stop stopColor="#ef4b5a" offset="1"/></linearGradient>
                      <linearGradient id="f_gh" x1="135.62" x2="137.12" y1="76.153" y2="65.153" gradientTransform="matrix(1 0 0 -1 328.04 1024.1)" gradientUnits="userSpaceOnUse"><stop stopColor="#537dbf" offset="0"/><stop stopColor="#18a1ce" offset="1"/></linearGradient>
                      <linearGradient id="g_gh" x1="136.14" x2="120.64" y1="39.516" y2="17.516" gradientTransform="matrix(1 0 0 -1 328.04 1024.1)" gradientUnits="userSpaceOnUse"><stop stopColor="#18a1ce" offset="0"/><stop stopColor="#32b55e" offset="1"/></linearGradient>
                      <linearGradient id="h_gh" x1="24.141" x2="45.641" y1="30.047" y2="13.547" gradientTransform="matrix(1 0 0 -1 328.04 1024.1)" gradientUnits="userSpaceOnUse"><stop stopColor="#fcc010" offset="0"/><stop stopColor="#32b55e" offset="1"/></linearGradient>
                    </defs>
                    <g transform="translate(-328 -868)">
                      <path d="m480.37 934.89-34.021 12.688 0.37696 0.36719v38.18h-4.2774l35.572 29.43c2.468-3.1985 3.9356-7.2083 3.9356-11.561v-60.949c0-2.8217-0.54965-5.5868-1.5859-8.1543z" fill="#18a1ce"/>
                      <path d="m363.28 962.93-35.23 2.0723v24.629l35.23-13.566z" fill="#fcc010"/>
                      <path d="m391.24 986.13-17.053 36.811h88.832c8.0041 0 14.848-4.9659 17.621-11.984l-37.238-24.826z" fill="#32b55e"/>
                      <path d="m388 874.01c-0.6081 0.50613-1.1995 1.0446-1.7695 1.6152l-46.359 46.441 33.438 15.912 25.751-25.572z" fill="#ef4b5a"/>
                      <path d="m454.22 906.61-22.916 26.285 15.42 15.055v2.4004l35.23-5.2207v-2.0801c0-5.84-2.3498-11.441-6.5098-15.541z" fill="#537dbf"/>
                      <path d="m363.27 986.13h27.961l-17.053 36.809h-27.198c-10.46 0-18.94-8.48-18.94-18.94v-14.368l35.23-13.566z" fill="url(#h_gh)"/>
                      <path d="m481.95 989.49v14.513c0 10.46-8.48 18.94-18.94 18.94h-2.661l-32.995-36.809h19.366v-11.116z" fill="url(#g_gh)"/>
                      <path d="m481.95 960.56h-35.23v-10.212l35.23-5.22z" fill="url(#f_gh)"/>
                      <path d="m405.16 868.07c-5.1332-0.13064-10.292 1.2738-14.75 4.1836-0.64321 0.49084-1.6472 1.1372-2.1699 1.5664-0.081 0.0659-0.15395 0.14591-0.23437 0.21289l9.1367 40.285h2e-3l7.5-7.4473 6.8378 6.6758 10.348-38.801c-4.736-4.3-10.682-6.5234-16.67-6.6758z" fill="url(#e_gh)"/>
                      <path d="m339.8 922.15-5.373 5.3809c-4.08 4.09-6.3809 9.6302-6.3809 15.41v21.947l35.23 11.871v-28.809l13.451-13.357z" fill="url(#d_gh)"/>
                      <path d="m363.28 973.86-35.213 30.984c3e-5 6e-4 -3e-5 0 0 0 0.44241 10.068 8.7453 18.096 18.922 18.096h27.443l34.553-36.811h-45.705z" fill="url(#c_gh)"/>
                      <path d="m474.93 927-42.93 6.5742 14.721 14.371-1e-5 23.023 35.23-5.3965 1e-5 -22.527c0-5.84-2.3498-11.441-6.5098-15.541z" fill="url(#j_gh)" fillOpacity=".5"/>
                      <path d="m418.96 872.49-8.8574 39.713 35.225 34.387 8.9121-39.957-31.639-31.154c-1.1407-1.1238-2.3608-2.12-3.6406-2.9883z" fill="url(#i_gh)"/>
                      <path d="m358.35 981.03a35.39 44.079 54.205 0 0-30.307 8.9375v14.029c0 10.46 8.4794 18.941 18.939 18.941h40.041a35.39 44.079 54.205 0 0-3.7754-29.174 35.39 44.079 54.205 0 0-8.1934-7.6367h-11.781l1e-5 -4.5078a35.39 44.079 54.205 0 0-4.9238-0.58985z" fill="url(#b_gh)"/>
                      <path d="m338.57 949.03a35.39 44.079 83.154 0 0-5.2891 0.37695 35.39 44.079 83.154 0 0-5.2324 0.88672v53.703c0 6.7628 3.5441 12.698 8.877 16.049a35.39 44.079 83.154 0 0 4.793-0.3633 35.39 44.079 83.154 0 0 39.543-33.555h-17.982v-31.414a35.39 44.079 83.154 0 0-24.709-5.6836z" fill="url(#a_gh)"/>
                    </g>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#12141C] tracking-tight">Google Home</span>
                </motion.div>
              </div>

            </div>

            {/* 6. Carole */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('carole')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('carole')} className="cursor-pointer text-[#484E52]">
              <span className="font-sans font-medium text-4xl tracking-tight">carole<span className="text-xs align-top">™</span></span>
            </motion.div>

            {/* 7. Forest */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('forest')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('forest')} className="cursor-pointer flex flex-col items-center text-[#562862]">
              <span className="font-serif font-bold text-4xl tracking-widest border-t border-current pt-1">FOREST</span>
              <span className="font-sans font-medium text-[0.45rem] tracking-[0.2em] mt-1 border-b border-[#B992C8] pb-1 w-full text-center">DRAPERY HARDWARE</span>
            </motion.div>

            {/* 8. R-TEC */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('rtec')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('rtec')} className="cursor-pointer w-24">
              <svg viewBox="0 0 120 40" className="w-full h-auto">
                <rect x="2" y="2" width="116" height="36" rx="6" fill="none" stroke="#525659" strokeWidth="2"/>
                <path d="M4 6 L 30 6 L 30 34 L 20 34 L 12 24 L 4 34 Z" fill="#525659" />
                <rect x="25" y="4" width="91" height="32" rx="4" fill="#E2943A"/>
                <circle cx="35" cy="20" r="3" fill="#FFF"/>
                <text x="45" y="28" fill="#FFF" fontFamily="sans-serif" fontSize="24" fontWeight="300" letterSpacing="2">TEC</text>
              </svg>
            </motion.div>

            {/* 9. Alendel */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('alendel')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('alendel')} className="cursor-pointer flex flex-col text-[#535353]">
              <span className="font-sans font-medium text-3xl tracking-wide mb-1">alendel</span>
              <div className="w-full h-[1px] bg-[#84B0CE] mb-1"></div>
              <span className="font-serif italic text-sm opacity-80 text-center">interior inspiration</span>
            </motion.div>

            {/* 10. Kaslen */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('kaslen')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('kaslen')} className="cursor-pointer text-[#1B1953]">
              <span className="font-sans font-semibold text-2xl tracking-widest">KASLEN<span className="text-sm tracking-[0.3em] font-medium ml-1">TEXTILES</span></span>
            </motion.div>

            {/* 11. NORMAN */}
            <motion.div initial={isOverlay ? "reveal" : "rest"} whileHover={!isOverlay ? "hover" : undefined} animate={isOverlay ? "reveal" : getLogoAnimate('norman')} variants={logoHover} onClick={() => !isOverlay && toggleLogo('norman')} className="cursor-pointer text-[#0F2F4A]">
              <span className="font-serif font-bold text-3xl tracking-widest">NORMAN<span className="text-sm align-top ml-1">®</span></span>
            </motion.div>

            </div>
            );
            return (
              <div className="relative hidden w-full md:block">
                {renderLogoGrid(false)}
                <div className="radar-sweep-overlay absolute inset-0 z-10" style={{pointerEvents:'none'}}>
                  {renderLogoGrid(true)}
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* About Section - Editorial Dark Slab */}
      <section className="w-full bg-[#8a8a8a] overflow-hidden px-6 md:px-12 py-12">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden bg-[#3d3d3d] shadow-[0_20px_60px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3)]">

          {/* Top: full-width title bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="border-b border-white/10 px-8 md:px-16 py-12"
          >
            <p className="text-white/40 text-[10px] tracking-[0.45em] uppercase mb-4">Our Craft</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-white tracking-tight leading-none">{about.title}</h2>
          </motion.div>

          {/* Bottom: image left + copy right */}
          <div className="grid md:grid-cols-5 items-stretch">

            {/* Image panel — 2/5 */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="md:col-span-2 overflow-hidden border-r border-white/10"
            >
              {about.image?.url ? (
                // About image — below the fold, so no priority. Uses width/height
                // from CMS data so Next can reserve layout space and emit srcset.
                <Image
                  src={about.image.url}
                  alt={about.image.alt}
                  width={about.image.width || 1600}
                  height={about.image.height || 900}
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="w-full aspect-video object-cover"
                  style={{ objectFit: about.image.fit as any }}
                />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Workshop Image</span>
                </div>
              )}
            </motion.div>

            {/* Copy panel — 3/5 */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="md:col-span-3 flex flex-col justify-center px-8 md:px-16 py-14"
            >
              <span className="self-start mb-6 px-4 py-1.5 rounded-full bg-white/10 text-white/70 text-xs tracking-widest uppercase">
                Handcrafted Since 1984
              </span>
              <p className="text-2xl md:text-3xl font-semibold text-white mb-6 leading-snug">{about.highlight}</p>
              <p className="text-white/65 text-base mb-4 leading-relaxed">{about.subtitle}</p>
              <p className="text-white/40 text-sm leading-relaxed mb-10">{about.description}</p>
              <Link href="/products/handcrafted-drapery">
                <button className="self-start px-8 py-3 rounded-full border border-white/25 text-white text-sm font-medium tracking-widest uppercase hover:bg-white hover:text-[#3d3d3d] transition-all duration-300">
                  HOW WE MAKE DRAPERY →
                </button>
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Projects Gallery Section */}
      <section className="w-full bg-white py-20 md:py-32">
        <div className="w-full px-0">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-light text-center mb-10 md:mb-16 tracking-wide px-4"
          >
            OUR PROJECTS
          </motion.h2>
          <div className="relative group">
            <button onClick={() => scroll('left')} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/55 p-2.5 text-white opacity-100 transition-opacity duration-300 md:left-4 md:p-3 md:opacity-0 md:group-hover:opacity-100 hover:bg-black/70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <motion.div
              ref={scrollContainerRef}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth px-4 md:px-8 items-stretch"
              style={{ height: 'clamp(280px, 62vw, 400px)' }}
            >
              {gallery.map((img, index) => (
                <motion.div
                  key={img.id}
                  custom={index}
                  variants={galleryItem}
                  onClick={() => setLightboxImage(img.id)}
                  className="relative h-full max-w-[78vw] flex-shrink-0 overflow-hidden rounded-lg shadow-2xl transition-transform duration-1000 hover:scale-105 md:max-w-none"
                >
                  {img.url ? (
                    // next/image routes through /_next/image, which downsamples
                    // the 3024×4032 iPhone originals (~8 MB each) to ~100 KB
                    // AVIF/WebP at the srcset width the browser actually uses.
                    // Before this, Googlebot timed out fetching the hero gallery
                    // (see Rich Results Test — "無法載入 7 項資源") and real
                    // users paid the full bytes too. width/height come from the
                    // CMS so aspect ratio is preserved and CLS stays at 0.
                    <Image
                      src={img.url}
                      alt={img.alt}
                      width={img.width}
                      height={img.height}
                      sizes="(max-width: 768px) 78vw, 400px"
                      className="h-full w-auto max-w-[78vw] object-contain md:max-w-none"
                      loading={index < 2 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="h-full w-[300px] bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">{img.alt}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="hidden text-sm text-white opacity-0 transition-opacity hover:opacity-100 md:block">Click to enlarge</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <button onClick={() => scroll('right')} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/55 p-2.5 text-white opacity-100 transition-opacity duration-300 md:right-4 md:p-3 md:opacity-0 md:group-hover:opacity-100 hover:bg-black/70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="relative max-w-5xl w-full aspect-[3/4] rounded-lg shadow-2xl overflow-hidden"
            >
              {lightboxItem.url ? (
                // Lightbox image: parent has explicit aspect-[3/4] max-w-5xl so
                // fill + sizes gives next/image enough to pick the right srcset
                // width (~1024px on desktop) instead of serving the 8 MB raw.
                <Image
                  src={lightboxItem.url}
                  alt={lightboxItem.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 1024px"
                  style={{ objectFit: lightboxItem.fit as any }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">{lightboxItem.alt}</span>
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); setLightboxImage(null) }} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* =========================================================================
          Smart Essentials Section - iPhone + Roller + Slider + 9-Pleat Drapery
          ========================================================================= */}
      {(() => {
        // 1. 卷帘参数
        const rollerMaxHeight = 285
        const rollerFabricHeight = (rollerMaxHeight * (100 - shadePercentage)) / 100
        const rollerBarY = 230 + rollerFabricHeight
        // 卷起部分高度：全开时卷管最粗，全关时最细
        const rollH = 28  // 固定高度，不随开合变化
        // 底杆 Y 坐标
        const sTop = 200; const sX = 383; const sW = 244
        const sHemY = sTop + rollH + rollerFabricHeight

        // 2. 9褶蛇形帘参数 (完全外装)
        const drapeMaxWidth = 178
        const drapeMinWidth = 40
        const currentDrapeW = drapeMinWidth + (drapeMaxWidth - drapeMinWidth) * ((100 - shadePercentage) / 100)
        const pleatW = currentDrapeW / 9
        // 2-Fold Pinch Pleat 参数
        const numGroups = 8
        const groupW = currentDrapeW / numGroups

        return (
          <section className="relative flex w-full justify-center overflow-hidden bg-[#3d3d3d] pt-12 pb-8 md:pb-6 text-white">
            {/* 背景光晕 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#5BC1F5] rounded-full mix-blend-overlay blur-[250px] opacity-15" />
            </div>

            <div className="relative z-10 w-full max-w-[1600px] px-4">

              <div className="mb-6 px-2 md:px-8">
                <span className="text-[#5BC1F5] text-[10px] font-bold tracking-[0.4em] uppercase block mb-4">Dual Ecosystem Integration</span>
                <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-white">
                  Seamless Vision. <span className="font-bold">Complete Control.</span>
                </h2>
              </div>

              <div className="md:hidden px-1 pb-4">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-sm">
                  <p className="text-sm leading-relaxed text-white/72">
                    Pair motorized shades and handcrafted drapery with voice control, mobile scenes, and automated routines without crowding the mobile experience.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {['Voice Control', 'Phone App', 'Automations', 'Premium Hardware'].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-white/80"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/45">Scene openness</span>
                      <span className="text-lg font-semibold text-[#5BC1F5]">{openPercentage}%</span>
                    </div>
                    <input
                      aria-label="Adjust shade openness"
                      type="range"
                      min="0"
                      max="100"
                      value={openPercentage}
                      onChange={(e) => setOpenPercentage(parseInt(e.target.value, 10))}
                      className="mt-4 w-full accent-[#5BC1F5]"
                    />
                    <div className="mt-2 flex justify-between text-xs text-white/55">
                      <span>Privacy</span>
                      <span>Balanced</span>
                      <span>Open View</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 核心巨型 SVG — iPhone + 卷帘 + 滑块 + 9褶帘 全在同一坐标系 */}
              <svg viewBox="0 0 1600 590" className="hidden w-full h-auto drop-shadow-2xl font-sans md:block">
                <defs>
                  {/* 面料渐变：浅蓝灰，参照真实卷帘面料色调 */}
                  <linearGradient id="shadeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#A8BECF" />
                    <stop offset="8%"   stopColor="#BDD0DE" />
                    <stop offset="50%"  stopColor="#C8D9E6" />
                    <stop offset="92%"  stopColor="#BDD0DE" />
                    <stop offset="100%" stopColor="#9EB4C6" />
                  </linearGradient>
                  {/* 面料右侧阴影（立体感） */}
                  <linearGradient id="shadeSideGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%"   stopColor="#000000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
                  </linearGradient>
                  {/* 卷管罩壳渐变（保留备用） */}
                  <linearGradient id="cassetteTopGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4A5568" />
                    <stop offset="100%" stopColor="#1A202C" />
                  </linearGradient>
                  {/* 布帘褶皱渐变：深-亮-深，模拟面向观众的折叠凸面 */}
                  <linearGradient id="pleatGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%"   stopColor="#0B1220" />
                    <stop offset="25%"  stopColor="#1E2D45" />
                    <stop offset="50%"  stopColor="#3B5070" />
                    <stop offset="75%"  stopColor="#1E2D45" />
                    <stop offset="100%" stopColor="#0B1220" />
                  </linearGradient>
                  {/* 布帘边缘褶皱（稍暗，模拟背光侧） */}
                  <linearGradient id="pleatEdgeGrad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%"   stopColor="#06090F" />
                    <stop offset="40%"  stopColor="#0F1A28" />
                    <stop offset="60%"  stopColor="#1A2A3F" />
                    <stop offset="100%" stopColor="#06090F" />
                  </linearGradient>
                  {/* 窗外天空渐变 */}
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#C8CBCA" />
                    <stop offset="40%"  stopColor="#D8DBDA" />
                    <stop offset="72%"  stopColor="#E6E8E6" />
                    <stop offset="100%" stopColor="#E2DED8" />
                  </linearGradient>
                  {/* 窗外景色裁剪区域 */}
                  <clipPath id="windowViewClip">
                    <rect x="383" y="199" width="244" height="322"/>
                  </clipPath>
                  {/* 灰白 Pinch Pleat 面料渐变 */}
                  <linearGradient id="pinchFaceL" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#BEBAB2" />
                    <stop offset="35%"  stopColor="#ECEAE3" />
                    <stop offset="65%"  stopColor="#D8D4CB" />
                    <stop offset="100%" stopColor="#C0BCB5" />
                  </linearGradient>
                  <linearGradient id="pinchFaceR" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#D8D4CB" />
                    <stop offset="50%"  stopColor="#C4C0B8" />
                    <stop offset="100%" stopColor="#A8A49C" />
                  </linearGradient>
                  {/* 推拉门景色裁剪 */}
                  <clipPath id="doorViewClip">
                    <rect x="1113" y="201" width="274" height="316"/>
                  </clipPath>
                  {/* Siri 彩球 */}
                  <radialGradient id="siriGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#5BC1F5" />
                    <stop offset="50%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#F472B6" />
                  </radialGradient>
                  {/* Apple Intelligence 彩虹边框渐变 */}
                  <linearGradient id="appleIntelBorder" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"   stopColor="#FF6B6B" />
                    <stop offset="16%"  stopColor="#FF9F43" />
                    <stop offset="33%"  stopColor="#FECA57" />
                    <stop offset="50%"  stopColor="#48DBFB" />
                    <stop offset="66%"  stopColor="#5F7FFF" />
                    <stop offset="83%"  stopColor="#C56CF0" />
                    <stop offset="100%" stopColor="#FF6B6B" />
                  </linearGradient>
                  {/* 玻璃窗光效 */}
                  <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {/* ════ Matter 连线 ════ */}
                <g stroke="#5BC1F5" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.45" fill="none">
                  {/* Matter → 卷帘顶部 */}
                  <line x1="800" y1="70" x2="505" y2="190" />
                  {/* Matter → 窗帘顶部 */}
                  <line x1="800" y1="70" x2="1250" y2="195" />
                  {/* iPhone 顶部中心 → Matter */}
                  <line x1="180" y1="130" x2="800" y2="70" />
                  {/* Voice → Matter */}
                  <line x1="365" y1="45" x2="800" y2="70" />
                  {/* 滑块顶部 → Matter */}
                  <line x1="800" y1="130" x2="800" y2="110" />
                  {/* Sensor → Matter */}
                  <line x1="1420" y1="50" x2="800" y2="70" />
                </g>

                {/* ════ 1. iPhone 16 Pro — Dynamic Island + Apple Intelligence Siri ════ */}
                <g transform="translate(80, 130)">
                  {/* 机身外壳 — 钛金属色 */}
                  <rect x="0" y="0" width="200" height="400" rx="38" fill="#1A1A1E" stroke="#3A3A3E" strokeWidth="3" />

                  {/* Apple Intelligence 彩虹发光边框 — 心跳脉动 */}
                  <motion.rect
                    x="3" y="3" width="194" height="394" rx="36"
                    fill="none" stroke="url(#appleIntelBorder)" strokeWidth="2.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.9, 0.3], strokeWidth: [2, 3.5, 2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  {/* 柔和外发光层 */}
                  <motion.rect
                    x="-2" y="-2" width="204" height="404" rx="40"
                    fill="none" stroke="url(#appleIntelBorder)" strokeWidth="1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ filter: 'blur(4px)' } as any}
                  />

                  {/* 屏幕（极窄边框）*/}
                  <rect x="6" y="6" width="188" height="388" rx="34" fill="#0F172A" />

                  {/* Dynamic Island 灵动岛 */}
                  <rect x="72" y="14" width="56" height="22" rx="11" fill="#000" />
                  {/* 摄像头 */}
                  <circle cx="110" cy="25" r="5" fill="#0A0A0A" stroke="#1A1A2E" strokeWidth="1" />
                  <circle cx="110" cy="25" r="2" fill="#111" />

                  {/* 屏幕内容 */}
                  <text x="100" y="75" textAnchor="middle" fill="#94A3B8" fontSize="10" letterSpacing="0.5">Hey Siri,</text>
                  <text x="100" y="100" textAnchor="middle" fill="#5BC1F5" fontSize="13" fontWeight="bold">&quot;Set shades to</text>
                  <text x="100" y="120" textAnchor="middle" fill="#5BC1F5" fontSize="13" fontWeight="bold">75%&quot;</text>

                  {/* Siri 光球按钮 — 点击设为 75%（滑块显示 100-25=75%）*/}
                  <g style={{ cursor: 'pointer' } as any} onClick={() => setOpenPercentage(25)}>
                    {/* 外圈呼吸光晕 */}
                    <motion.circle
                      cx="100" cy="230" r="42"
                      fill="url(#siriGlow)" opacity="0.15"
                      animate={{ r: [42, 50, 42] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* 主光球 */}
                    <circle cx="100" cy="230" r="35" fill="url(#siriGlow)" opacity="0.8" />
                    {/* 白色高光 */}
                    <circle cx="100" cy="230" r="14" fill="#fff" opacity="0.85" />
                    {/* 播放三角 */}
                    <polygon points="95,222 95,238 108,230" fill="url(#siriGlow)" />
                  </g>

                  {/* 按钮提示 */}
                  <text x="100" y="290" textAnchor="middle" fill="#94A3B8" fontSize="9" opacity="0.7">Tap to activate</text>

                  {/* Apple 智能状态栏 */}
                  <text x="100" y="330" textAnchor="middle" fill="#64748B" fontSize="8" letterSpacing="0.8">APPLE INTELLIGENCE</text>
                  <line x1="30" y1="340" x2="170" y2="340" stroke="#1E293B" strokeWidth="0.5" />

                  {/* HomeKit 图标行 */}
                  <text x="100" y="362" textAnchor="middle" fill="#475569" fontSize="9">🏠 Home · Shades · Living Room</text>

                  {/* 底部横条 — home indicator */}
                  <rect x="62" y="384" width="76" height="4" rx="2" fill="#334155" />
                </g>

                {/* ════ 2. 内装卷帘（建筑图纸风格）════ */}
                <g>


                  {/* 窗台（底部突出台沿）*/}
                  <rect x="365" y="521" width="280" height="13" fill="#C8C8C4" rx="2"/>
                  <rect x="365" y="532" width="280" height="3" fill="#B0B0AC" opacity="0.7" rx="2"/>

                  {/* 外框（灰色厚框）*/}
                  <rect x="374" y="190" width="262" height="331" fill="#D0D0CC" rx="3"/>

                  {/* ── 窗外景色 ── */}
                  <g clipPath="url(#windowViewClip)">
                    {/* 天空 */}
                    <rect x="383" y="199" width="244" height="322" fill="url(#skyGrad)"/>
                    {/* 太阳光晕 */}
                    <circle cx="603" cy="226" r="26" fill="#E8E4DC" opacity="0.35"/>
                    {/* 太阳 */}
                    <circle cx="603" cy="226" r="14" fill="#E0DCD4"/>
                    {/* 云朵 A */}
                    <ellipse cx="431" cy="250" rx="31" ry="11" fill="#FFFFFF" opacity="0.9"/>
                    <ellipse cx="415" cy="244" rx="18" ry="14" fill="#FFFFFF" opacity="0.9"/>
                    <ellipse cx="448" cy="245" rx="17" ry="12" fill="#FFFFFF" opacity="0.9"/>
                    {/* 云朵 B */}
                    <ellipse cx="568" cy="258" rx="22" ry="8" fill="#FFFFFF" opacity="0.78"/>
                    <ellipse cx="555" cy="253" rx="14" ry="11" fill="#FFFFFF" opacity="0.78"/>
                    {/* 远处山丘 */}
                    <ellipse cx="505" cy="462" rx="162" ry="54" fill="#B8BDB8"/>
                    <ellipse cx="415" cy="480" rx="104" ry="47" fill="#A4A9A3"/>
                    <ellipse cx="592" cy="488" rx="92" ry="41" fill="#96A097"/>
                    {/* 地面草地 */}
                    <rect x="383" y="492" width="244" height="29" fill="#ACBBA8"/>
                    {/* 树1 */}
                    <rect x="393" y="466" width="5" height="30" fill="#8A8480"/>
                    <circle cx="396" cy="457" r="19" fill="#7A8C7C"/>
                    {/* 树2 */}
                    <rect x="415" y="471" width="4" height="25" fill="#8A8480"/>
                    <circle cx="417" cy="463" r="14" fill="#8A9E8B"/>
                    {/* 树3 */}
                    <rect x="453" y="461" width="5" height="34" fill="#8A8480"/>
                    <circle cx="456" cy="452" r="22" fill="#7A8C7C"/>
                    {/* 树4 */}
                    <rect x="489" y="469" width="4" height="27" fill="#8A8480"/>
                    <circle cx="491" cy="461" r="16" fill="#6A7C6B"/>
                    {/* 树5 */}
                    <rect x="538" y="463" width="5" height="32" fill="#8A8480"/>
                    <circle cx="541" cy="456" r="20" fill="#8A9E8B"/>
                    {/* 树6 */}
                    <rect x="565" y="472" width="4" height="24" fill="#8A8480"/>
                    <circle cx="567" cy="464" r="14" fill="#7A8C7C"/>
                    {/* 树7 */}
                    <rect x="601" y="467" width="5" height="28" fill="#8A8480"/>
                    <circle cx="603" cy="459" r="17" fill="#6A7C6B"/>
                  </g>
                  {/* 玻璃轻微反光（左侧斜面）*/}
                  <rect x="383" y="199" width="55" height="322" fill="#FFFFFF" opacity="0.07"/>

                  {/* 中央竖分格线（双扇窗）*/}
                  <line x1="505" y1="199" x2="505" y2="521" stroke="#C0C0C0" strokeWidth="2.5" opacity="0.9"/>

                  {/* ── 卷帘（内装）── */}
                  <clipPath id="rollerClip">
                    <rect x="383" y="199" width="244" height="322"/>
                  </clipPath>
                  <g clipPath="url(#rollerClip)">
                    {/* 卷起的面料（顶部灰色横带，固定高度）*/}
                    <rect x={sX} y={sTop} width={sW} height={rollH} fill="#3A3A3A"/>
                    {/* 分隔线（卷轴底边）*/}
                    <motion.rect
                      x={sX} width={sW} height="3"
                      fill="#3A3A3A"
                      initial={false}
                      animate={{ y: sTop + rollH }}
                      transition={{ duration: shadeDuration, ease: 'easeInOut' }}
                    />
                    {/* 垂下的面料（深灰 30% 透明）*/}
                    <motion.rect
                      x={sX} width={sW}
                      fill="#3A3A3A" opacity="0.8"
                      initial={false}
                      animate={{ y: sTop + rollH + 3, height: Math.max(0, rollerFabricHeight - 3) }}
                      transition={{ duration: shadeDuration, ease: 'easeInOut' }}
                    />
                    {/* 底杆 hem bar */}
                    <motion.rect
                      x={sX} width={sW} height="8"
                      fill="#3A3A3A" rx="3.5"
                      initial={false}
                      animate={{ y: sHemY }}
                      transition={{ duration: shadeDuration, ease: 'easeInOut' }}
                    />
                  </g>

                </g>

                {/* ════ 3. 纯 SVG 滑块（兼容 iOS Safari）════ */}
                {(() => {
                  const slCx = 800, slTop = 155, slTextGap = 40
                  const slW = 56, slH = 160, slR = slW / 2
                  const slY = slTop + slTextGap + 45
                  const fillH = (slH * (100 - openPercentage)) / 100
                  const handleY = slY + fillH
                  // 心跳脉动：用 translate+scale+translate 实现中心缩放
                  const slMidX = slCx, slMidY = slY + slH / 2
                  return (
                    <g>
                      {/* 文字标签 */}
                      <text x={slCx} y={slTop} textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="700" letterSpacing="0.15em" style={{textTransform:'uppercase'} as any}>BLINDS STATUS</text>
                      <text x={slCx} y={slTop + 32} textAnchor="middle" fill="#5BC1F5" fontSize="30" fontWeight="700">{100 - openPercentage}%</text>

                      {/* 心跳脉动 — CSS animation 最可靠 */}
                      <g>
                        <style>{`
                          @keyframes sliderPulse {
                            0%, 100% { transform: translate(${slMidX}px, ${slMidY}px) scale(1) translate(-${slMidX}px, -${slMidY}px); }
                            50% { transform: translate(${slMidX}px, ${slMidY}px) scale(1.06) translate(-${slMidX}px, -${slMidY}px); }
                          }
                          .slider-heartbeat { animation: sliderPulse 1.8s ease-in-out infinite; }
                        `}</style>
                        <g className="slider-heartbeat">
                          {/* 胶囊背景 */}
                          <rect x={slCx - slW / 2} y={slY} width={slW} height={slH} rx={slR} fill="#2A2A2B" />

                          {/* 蓝色填充 — 从顶部向下 */}
                          <defs>
                            <clipPath id="sliderCapsuleClip">
                              <rect x={slCx - slW / 2} y={slY} width={slW} height={slH} rx={slR} />
                            </clipPath>
                          </defs>
                          <motion.rect
                            x={slCx - slW / 2} y={slY} width={slW}
                            fill="#5BC1F5"
                            clipPath="url(#sliderCapsuleClip)"
                            initial={false}
                            animate={{ height: fillH }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          />

                          {/* 拖动手柄纹路 */}
                          <motion.g
                            initial={false}
                            animate={{ translateY: handleY - slY }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                            <line x1={slCx - 12} y1={slY - 6} x2={slCx + 12} y2={slY - 6} stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                            <line x1={slCx - 12} y1={slY} x2={slCx + 12} y2={slY} stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                            <line x1={slCx - 12} y1={slY + 6} x2={slCx + 12} y2={slY + 6} stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
                          </motion.g>
                        </g>
                      </g>

                      {/* 透明交互热区（不参与缩放，保持坐标精准）*/}
                      <rect
                        ref={sliderRef as any}
                        x={slCx - slW / 2} y={slY} width={slW} height={slH}
                        fill="transparent" style={{ cursor: 'ns-resize', touchAction: 'none' } as any}
                        onPointerDown={(e: any) => {
                          ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
                          updatePercentage(e.clientY)
                        }}
                        onPointerMove={(e: any) => {
                          if (e.buttons === 1 || e.pressure > 0) updatePercentage(e.clientY)
                        }}
                      />
                    </g>
                  )
                })()}

                {/* ════ 4. 2-Fold Pinch Pleat Drapery ════ */}
                <g>


                  {/* ── 推拉门（7:8 比例 294×336）── */}
                  {/* 地面轨道 */}
                  <rect x="1096" y="527" width="308" height="8" fill="#C0C0BC" rx="2"/>
                  <rect x="1096" y="533" width="308" height="3" fill="#A0A09C" opacity="0.8" rx="2"/>
                  {/* 外框 */}
                  <rect x="1103" y="191" width="294" height="336" fill="#D0D0CC" rx="3"/>
                  {/* 玻璃白底 */}
                  <rect x="1113" y="201" width="274" height="316" fill="#FFFFFF"/>
                  {/* 门外景色 */}
                  <g clipPath="url(#doorViewClip)">
                    <rect x="1113" y="201" width="274" height="316" fill="url(#skyGrad)"/>
                    <circle cx="1358" cy="228" r="24" fill="#E8E4DC" opacity="0.35"/>
                    <circle cx="1358" cy="228" r="13" fill="#E0DCD4"/>
                    <ellipse cx="1168" cy="252" rx="28" ry="10" fill="#FFFFFF" opacity="0.88"/>
                    <ellipse cx="1154" cy="247" rx="17" ry="13" fill="#FFFFFF" opacity="0.88"/>
                    <ellipse cx="1185" cy="248" rx="16" ry="11" fill="#FFFFFF" opacity="0.88"/>
                    <ellipse cx="1308" cy="258" rx="21" ry="8" fill="#FFFFFF" opacity="0.75"/>
                    <ellipse cx="1295" cy="253" rx="13" ry="10" fill="#FFFFFF" opacity="0.75"/>
                    <ellipse cx="1250" cy="463" rx="178" ry="54" fill="#B8BDB8"/>
                    <ellipse cx="1148" cy="481" rx="112" ry="48" fill="#A4A9A3"/>
                    <ellipse cx="1342" cy="489" rx="96" ry="42" fill="#96A097"/>
                    <rect x="1113" y="492" width="274" height="25" fill="#ACBBA8"/>
                    <rect x="1120" y="463" width="5" height="32" fill="#8A8480"/><circle cx="1122" cy="454" r="18" fill="#7A8C7C"/>
                    <rect x="1146" y="469" width="4" height="26" fill="#8A8480"/><circle cx="1148" cy="461" r="14" fill="#8A9E8B"/>
                    <rect x="1178" y="461" width="5" height="34" fill="#8A8480"/><circle cx="1180" cy="452" r="22" fill="#7A8C7C"/>
                    <rect x="1214" y="467" width="4" height="28" fill="#8A8480"/><circle cx="1216" cy="460" r="16" fill="#6A7C6B"/>
                    <rect x="1258" y="464" width="5" height="31" fill="#8A8480"/><circle cx="1260" cy="456" r="20" fill="#8A9E8B"/>
                    <rect x="1295" y="470" width="4" height="25" fill="#8A8480"/><circle cx="1297" cy="463" r="14" fill="#7A8C7C"/>
                    <rect x="1324" y="465" width="5" height="30" fill="#8A8480"/><circle cx="1326" cy="457" r="18" fill="#6A7C6B"/>
                    <rect x="1357" y="467" width="4" height="27" fill="#8A8480"/><circle cx="1359" cy="460" r="15" fill="#8A9E8B"/>
                  </g>
                  {/* 玻璃轻微蓝色调 */}
                  <rect x="1116" y="204" width="127" height="310" fill="#C8E8F9" opacity="0.12"/>
                  <rect x="1254" y="204" width="127" height="310" fill="#C8E8F9" opacity="0.12"/>
                  {/* 中间立柱 */}
                  <rect x="1243" y="201" width="14" height="316" fill="#D0D0CC"/>
                  {/* 玻璃反光 */}
                  <rect x="1116" y="204" width="38" height="310" fill="#FFFFFF" opacity="0.09"/>
                  <rect x="1254" y="204" width="38" height="310" fill="#FFFFFF" opacity="0.09"/>
                  {/* 门把手（左扇）*/}
                  <rect x="1237" y="343" width="6" height="32" fill="#8A8A8A" rx="3"/>
                  <rect x="1237" y="341" width="6" height="4" fill="#6A6A6A" rx="2"/>
                  {/* 门把手（右扇）*/}
                  <rect x="1254" y="343" width="6" height="32" fill="#8A8A8A" rx="3"/>
                  <rect x="1254" y="341" width="6" height="4" fill="#6A6A6A" rx="2"/>

                  {/* ── 装饰圆杆 ── */}
                  <rect x="1058" y="157" width="384" height="14" fill="#1A1208" rx="7"/>
                  <rect x="1058" y="157" width="384" height="4" fill="#2E2418" opacity="0.8" rx="7"/>
                  {/* 左端球 */}
                  <circle cx="1051" cy="164" r="14" fill="#1A1208"/>
                  <circle cx="1047" cy="160" r="6" fill="#2E2418" opacity="0.6"/>
                  {/* 右端球 */}
                  <circle cx="1449" cy="164" r="14" fill="#1A1208"/>
                  <circle cx="1445" cy="160" r="6" fill="#2E2418" opacity="0.6"/>

                  {/* ── 挂环（左右帘各 numGroups 个）── */}
                  {Array.from({ length: numGroups }).map((_, i) => {
                    const lx = 1075 + (i + 0.5) * groupW
                    const rx = (1430 - currentDrapeW) + (i + 0.5) * groupW
                    return (
                      <g key={`rings-${i}`}>
                        <motion.circle cy="164" r="8" fill="#1A1208"
                          initial={false} animate={{ cx: lx }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                        <motion.circle cy="164" r="4.5" fill="none" stroke="#2E2418" strokeWidth="1.5"
                          initial={false} animate={{ cx: lx }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                        <motion.rect y="171" width="3" height="6" fill="#1A1208"
                          initial={false} animate={{ x: lx - 1.5 }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                        <motion.circle cy="164" r="8" fill="#1A1208"
                          initial={false} animate={{ cx: rx }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                        <motion.circle cy="164" r="4.5" fill="none" stroke="#2E2418" strokeWidth="1.5"
                          initial={false} animate={{ cx: rx }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                        <motion.rect y="171" width="3" height="6" fill="#1A1208"
                          initial={false} animate={{ x: rx - 1.5 }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                      </g>
                    )
                  })}

                  {/* ── 布料（clipPath 内）── */}
                  <clipPath id="drapeClip"><rect x="1070" y="177" width="360" height="368"/></clipPath>
                  <g clipPath="url(#drapeClip)">
                    {/* 左帘底色 */}
                    <motion.rect y="177" height="350" fill="#C8C4BC"
                      initial={false} animate={{ x: 1075, width: currentDrapeW }}
                      transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                    {/* 左帘 2-Fold Pinch Pleat */}
                    {Array.from({ length: numGroups }).map((_, i) => (
                      <g key={`lp-${i}`}>
                        <motion.rect y="177" height="350" fill="url(#pinchFaceL)"
                          initial={false}
                          animate={{ x: 1075 + i * groupW + groupW * 0.04, width: groupW * 0.36 }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                        <motion.rect y="177" height="350" fill="#8A8782"
                          initial={false}
                          animate={{ x: 1075 + i * groupW + groupW * 0.40, width: groupW * 0.07 }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                        <motion.rect y="177" height="350" fill="url(#pinchFaceR)"
                          initial={false}
                          animate={{ x: 1075 + i * groupW + groupW * 0.47, width: groupW * 0.32 }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                      </g>
                    ))}
                    {/* 左帘底边横杆 */}
                    <motion.rect y="527" height="9" fill="#4A4845" rx="3"
                      initial={false} animate={{ x: 1075, width: currentDrapeW }}
                      transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>

                    {/* 右帘底色 */}
                    <motion.rect y="177" height="350" fill="#C8C4BC"
                      initial={false} animate={{ x: 1430 - currentDrapeW, width: currentDrapeW }}
                      transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                    {/* 右帘 2-Fold Pinch Pleat */}
                    {Array.from({ length: numGroups }).map((_, i) => (
                      <g key={`rp-${i}`}>
                        <motion.rect y="177" height="350" fill="url(#pinchFaceL)"
                          initial={false}
                          animate={{ x: (1430 - currentDrapeW) + i * groupW + groupW * 0.04, width: groupW * 0.36 }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                        <motion.rect y="177" height="350" fill="#8A8782"
                          initial={false}
                          animate={{ x: (1430 - currentDrapeW) + i * groupW + groupW * 0.40, width: groupW * 0.07 }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                        <motion.rect y="177" height="350" fill="url(#pinchFaceR)"
                          initial={false}
                          animate={{ x: (1430 - currentDrapeW) + i * groupW + groupW * 0.47, width: groupW * 0.32 }}
                          transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                      </g>
                    ))}
                    {/* 右帘底边横杆 */}
                    <motion.rect y="527" height="9" fill="#4A4845" rx="3"
                      initial={false} animate={{ x: 1430 - currentDrapeW, width: currentDrapeW }}
                      transition={{ duration: shadeDuration, ease: 'easeInOut' }}/>
                  </g>
                </g>


                {/* ════ Smart Icons ════ */}

                {/* ── Matter 图标（滑块正上方，白色 2x）── */}
                <g>
                  <circle cx="800" cy="70" r="40" fill="rgba(13,24,37,0.85)" stroke="white" strokeWidth="1.5" opacity="0.92"/>
                  <circle cx="800" cy="54" r="6" fill="white"/>
                  <circle cx="816" cy="84" r="6" fill="white"/>
                  <circle cx="784" cy="84" r="6" fill="white"/>
                  <line x1="800" y1="54" x2="816" y2="84" stroke="white" strokeWidth="3.2"/>
                  <line x1="800" y1="54" x2="784" y2="84" stroke="white" strokeWidth="3.2"/>
                  <line x1="816" y1="84" x2="784" y2="84" stroke="white" strokeWidth="3.2"/>
                  <text x="800" y="122" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" letterSpacing="2" opacity="0.8">MATTER</text>
                </g>

                {/* ── Voice Command 图标（卷帘左上角，白色 2x）── */}
                <g>
                  <circle cx="365" cy="45" r="40" fill="rgba(13,24,37,0.85)" stroke="white" strokeWidth="1.5" opacity="0.92"/>
                  <rect x="356" y="25" width="18" height="26" rx="9" fill="white"/>
                  <path d="M349,47 Q349,67 365,67 Q381,67 381,47" fill="none" stroke="white" strokeWidth="3.6" strokeLinecap="round"/>
                  <line x1="365" y1="67" x2="365" y2="73" stroke="white" strokeWidth="3.6" strokeLinecap="round"/>
                  <line x1="357" y1="73" x2="373" y2="73" stroke="white" strokeWidth="3.6" strokeLinecap="round"/>
                  <text x="365" y="97" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" letterSpacing="1" opacity="0.8">VOICE</text>
                </g>

                {/* ── 人体感应器图标（窗帘右上角，白色 2x）── */}
                <g>
                  <circle cx="1420" cy="50" r="40" fill="rgba(13,24,37,0.85)" stroke="white" strokeWidth="1.5" opacity="0.92"/>
                  <circle cx="1410" cy="34" r="7" fill="white"/>
                  <path d="M1402,58 L1402,44 Q1410,36 1418,44 L1418,58 Z" fill="white"/>
                  <path d="M1426,30 Q1442,40 1442,50 Q1442,60 1426,70" fill="none" stroke="white" strokeWidth="3.4" strokeLinecap="round"/>
                  <path d="M1426,36 Q1438,42 1438,50 Q1438,58 1426,64" fill="none" stroke="white" strokeWidth="3.4" strokeLinecap="round" opacity="0.6"/>
                  <text x="1420" y="102" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" letterSpacing="0.5" opacity="0.8">SENSOR</text>
                </g>

                {/* ════ 跳动提醒文字 ════ */}
                <motion.g
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <text x="800" y="570" textAnchor="middle" fill="#5BC1F5" fontSize="13" fontWeight="600" opacity="0.9" letterSpacing="0.5">
                    👆 Try tapping the Siri button or dragging the slider
                  </text>
                </motion.g>

              </svg>
            </div>
          </section>
        )
      })()}

      {/* ══ LUMA SHOWCASE ══ */}
      <LumaShowcase cards={lumaCards} />

      {/* Process Section */}
      <section className="w-full bg-white pt-8 pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-light text-center mb-4 tracking-wide"
          >
            {processData.title}
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            className="text-center text-gray-500 mb-12 max-w-2xl mx-auto text-sm tracking-wide"
          >
            {processData.subtitle}
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {processData.steps.map((step, index) => (
              <motion.div
                key={index}
                variants={slideInLeft}
                className="bg-[#3d3d3d] rounded-2xl shadow-xl overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {step.image?.url ? (
                    // Process step image — below fold, use fill so the Image
                    // fits the aspect-ratio container exactly. `sizes` matches
                    // the 3-column grid at md+ / full width on mobile.
                    <Image
                      src={step.image.url}
                      alt={step.image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      style={{ objectFit: step.image.fit as any }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-500 flex items-center justify-center aspect-[4/3]">
                      <span className="text-white/40 text-sm tracking-widest uppercase">0{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase">Step 0{index + 1}</span>
                  <h3 className="text-base font-semibold text-white tracking-wide">{step.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      {/* Contact Section - Advanced SVG Interactions */}
      <section id="contact" className="w-full bg-white py-20 md:py-32 overflow-hidden border-t border-gray-100">
        <div className="max-w-6xl mx-auto mt-0 px-4 sm:px-6 lg:px-8 md:-mt-[100px]">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-light mb-4 tracking-wide">{contact.title}</h2>
            <p className="px-4 text-[11px] md:text-sm text-gray-500 tracking-[0.16em] md:tracking-wider uppercase">{contact.subtitle}</p>
          </motion.div>

          <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">

            {/* Left: Contact Info with SVG Animations */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center space-y-8 md:space-y-10"
            >
              <div className="space-y-8">
                {/* Radar ping location pin + address */}
                <div className="flex items-start gap-4 group">
                  <div className="relative flex items-center justify-center w-8 h-8 mt-1">
                    <motion.div
                      className="absolute w-8 h-8 bg-[#4A90E2] rounded-full"
                      animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    />
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-900 relative z-10 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <p className="pt-1 text-base leading-relaxed text-gray-700 md:text-lg">{contact.address}</p>
                </div>

                {/* Phone numbers with SMS icons */}
                <div className="space-y-4">
                  {contact.phones.map((phone, i) => {
                    const labels = ['Primary', 'Service', 'Office']
                    const cleanNum = phone.replace(/[^0-9]/g, '')
                    return (
                      <div key={i} className="group flex items-center gap-4 py-2 border-b border-transparent hover:border-gray-100 transition-all">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-gray-400">{labels[i] || `Line ${i + 1}`}</span>
                          <a href={`tel:${phone}`} className="text-lg md:text-xl font-medium text-[#12141C] hover:text-[#4DB6E8] transition-colors">
                            {phone}
                          </a>
                        </div>

                        {/* SMS dynamic SVG */}
                        <motion.a
                          href={`sms:+1${cleanNum}`}
                          whileHover={{ scale: 1.1 }}
                          className="relative p-2 rounded-full bg-gray-50 flex items-center justify-center group/sms"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 text-gray-400 group-hover/sms:text-[#4DB6E8] transition-colors fill-none stroke-current stroke-[1.5]"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            <motion.circle
                              cx="8" cy="10" r="1" fill="currentColor"
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                            />
                            <motion.circle
                              cx="12" cy="10" r="1" fill="currentColor"
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                            />
                            <motion.circle
                              cx="16" cy="10" r="1" fill="currentColor"
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                            />
                          </svg>

                          {/* Hover tooltip */}
                          <span className="absolute left-full ml-2 hidden rounded bg-[#12141C] px-2 py-1 text-[10px] uppercase tracking-wider text-white opacity-0 transition-opacity pointer-events-none whitespace-nowrap group-hover/sms:opacity-100 sm:block">
                            Text for Quote
                          </span>

                          {/* Breathing glow */}
                          <motion.div
                            className="absolute inset-0 rounded-full bg-[#4DB6E8]/10 -z-10"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </motion.a>
                      </div>
                    )
                  })}
                </div>

                {/* Email with draw-on-hover */}
                <motion.div className="flex items-center gap-4 group cursor-pointer" whileHover="hover">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-900 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <motion.path
                        d="M22 6l-10 7L2 6"
                        variants={{
                          hover: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.6, ease: "easeInOut" } }
                        }}
                      />
                    </svg>
                  </div>
                  <p className="text-base md:text-lg text-gray-700 group-hover:text-[#4A90E2] transition-colors break-all sm:break-normal">{contact.email}</p>
                </motion.div>
              </div>

              {/* QR Codes with laser scan effect */}
              <div className="flex flex-col items-center gap-6 border-t border-gray-100 pt-6 sm:flex-row sm:flex-wrap sm:items-start sm:gap-8">
                {/* LINE QR */}
                <div className="text-center group">
                  <motion.div
                    whileHover="hover"
                    className="relative w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-3 shadow-sm overflow-hidden border border-gray-200"
                  >
                    <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-gray-400"></div>
                    <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-gray-400"></div>
                    <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-gray-400"></div>
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-gray-400"></div>
                    <motion.div
                      variants={{ hover: { y: [-64, 64], opacity: [0, 1, 0], transition: { repeat: Infinity, duration: 1.5, ease: "linear" } } }}
                      className="absolute left-0 right-0 h-[2px] bg-[#06C755] shadow-[0_0_8px_#06C755] z-20 opacity-0"
                    />
                    {contact.qrLine?.url ? (
                      <Image src={contact.qrLine.url} alt="LINE QR" width={108} height={108} className="w-[85%] h-[85%] object-contain relative z-10" />
                    ) : (
                      <span className="text-xs text-gray-400">LINE QR</span>
                    )}
                  </motion.div>
                  <p className="text-xs tracking-wider text-gray-500 uppercase font-medium">Scan for LINE</p>
                </div>

                {/* WeChat QR */}
                <div className="text-center group">
                  <motion.div
                    whileHover="hover"
                    className="relative w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-3 shadow-sm overflow-hidden border border-gray-200"
                  >
                    <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-gray-400"></div>
                    <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-gray-400"></div>
                    <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-gray-400"></div>
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-gray-400"></div>
                    <motion.div
                      variants={{ hover: { y: [-64, 64], opacity: [0, 1, 0], transition: { repeat: Infinity, duration: 1.5, ease: "linear" } } }}
                      className="absolute left-0 right-0 h-[2px] bg-[#07C160] shadow-[0_0_8px_#07C160] z-20 opacity-0"
                    />
                    {contact.qrWechat?.url ? (
                      <Image src={contact.qrWechat.url} alt="WeChat QR" width={108} height={108} className="w-[85%] h-[85%] object-contain relative z-10" />
                    ) : (
                      <span className="text-xs text-gray-400">WeChat QR</span>
                    )}
                  </motion.div>
                  <p className="text-xs tracking-wider text-gray-500 uppercase font-medium">Scan for WeChat</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Smart Form with Paper Airplane Submit */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-xl shadow-gray-200/50 sm:p-8 md:p-10"
            >
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div className="space-y-5">
                  <div className="relative group">
                    <input name="name" type="text" required placeholder="Your Name *" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all" />
                  </div>
                  <div className="relative group">
                    <input name="email" type="email" required placeholder="Email Address *" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all" />
                  </div>
                  <div className="relative group">
                    <input name="phone" type="tel" required placeholder="Phone Number *" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all" />
                  </div>
                  <div className="relative group">
                    <input name="address" type="text" placeholder="Project Address (Optional)" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all" />
                  </div>
                  <div className="relative group">
                    <textarea name="message" rows={4} placeholder="Tell us about your window treatment project..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all resize-none" />
                  </div>
                </div>

                {/* Status message */}
                <AnimatePresence>
                  {submitStatus.type && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`text-sm text-center py-2 px-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                    >
                      {submitStatus.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Paper airplane submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus.type === 'success'}
                  className="group relative w-full flex items-center justify-center px-8 py-4 bg-[#12141C] text-white rounded-sm font-medium tracking-widest uppercase hover:bg-black transition-all disabled:opacity-80 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className={`transition-transform duration-300 ${isSubmitting ? '-translate-y-12' : 'translate-y-0'}`}>
                    {submitStatus.type === 'success' ? 'Message Sent' : 'Send Message'}
                  </span>
                  {/* Hover static plane */}
                  <svg viewBox="0 0 24 24" className={`absolute right-6 w-5 h-5 fill-none stroke-current stroke-2 transition-all duration-300 ${isSubmitting || submitStatus.type === 'success' ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-1'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  {/* Takeoff plane on submit */}
                  <AnimatePresence>
                    {isSubmitting && (
                      <motion.svg
                        initial={{ x: -40, y: 40, opacity: 0 }}
                        animate={{ x: [0, 100], y: [0, -100], opacity: [1, 0] }}
                        transition={{ duration: 1.5, ease: "easeIn" }}
                        viewBox="0 0 24 24"
                        className="absolute w-6 h-6 fill-none stroke-current stroke-2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="w-full bg-[#F8F8F6] relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gray-200" />
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3303.701551791684!2d-118.06089492346504!3d34.10985441611823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c3e8c3e8c3e8%3A0x3e8c3e8c3e8c3e8c!2s8831%20Las%20Tunas%20Dr%2C%20Temple%20City%2C%20CA%2091780!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus&style=feature:all|element:geometry|color:0xf5f5f5&style=feature:all|element:labels.text.fill|color:0x616161&style=feature:all|element:labels.text.stroke|color:0xf5f5f5&style=feature:water|element:geometry|color:0xc9c9c9&style=feature:road|element:geometry|color:0xffffff&style=feature:poi|visibility:off"
          width="100%" height="400" style={{ border: 0, filter: 'grayscale(100%) contrast(0.9) brightness(1.05)' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex gap-6">
              <a href={footer.youtube} className="text-red-600 hover:text-red-700 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href={footer.etsy} className="text-orange-500 hover:text-orange-600 transition-colors">
                <span className="text-xl font-bold">Etsy</span>
              </a>
              <a href={footer.tiktok} className="text-gray-900 hover:text-gray-700 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a href={footer.instagram} className="text-pink-500 hover:text-pink-600 transition-colors" target="_blank" rel="noopener noreferrer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
            </div>
            <div className="text-center text-sm text-gray-600">{footer.copyright}</div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .radar-sweep-overlay {
          -webkit-mask-image: linear-gradient(
            45deg,
            rgba(0,0,0,0) calc(50% - 150px),
            rgba(0,0,0,1) calc(50% - 76px),
            rgba(0,0,0,1) calc(50% + 76px),
            rgba(0,0,0,0) calc(50% + 150px)
          );
          -webkit-mask-size: 300% 300%;
          mask-image: linear-gradient(
            45deg,
            rgba(0,0,0,0) calc(50% - 150px),
            rgba(0,0,0,1) calc(50% - 76px),
            rgba(0,0,0,1) calc(50% + 76px),
            rgba(0,0,0,0) calc(50% + 150px)
          );
          mask-size: 300% 300%;
          animation: radar-sweep-anim 6s infinite ease-in-out alternate;
        }
        @keyframes radar-sweep-anim {
          0% { -webkit-mask-position: 100% -50%; mask-position: 100% -50%; }
          100% { -webkit-mask-position: -50% 100%; mask-position: -50% 100%; }
        }
      `}</style>
    </main>
  )
}
