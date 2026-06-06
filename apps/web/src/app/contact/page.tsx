import type { Metadata } from 'next'
import { getPageContent, getText, getImage } from '@/lib/content'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Angel Drapery for a free in-home consultation. Located in Temple City, CA. Serving the greater Los Angeles area since 1984.',
  alternates: { canonical: '/contact' },
}

// ISR: regenerate at most every 5 min instead of per-request (was force-dynamic).
export const revalidate = 300

export default async function ContactPage() {
  const [data, globalData] = await Promise.all([
    getPageContent('home'),
    getPageContent('global'),
  ])

  const contact = {
    title: getText(data, 'contact', 'title', 'Contact Us'),
    subtitle: getText(data, 'contact', 'subtitle', 'Schedule a free in-home consultation. Our experts come to you.'),
    address: getText(data, 'contact', 'address', '8831 E Las Tunas Dr, Temple City, CA 91780'),
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

  return <ContactClient contact={contact} footer={footer} />
}
