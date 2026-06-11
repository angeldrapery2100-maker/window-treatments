import type { Metadata } from 'next'
import CityPage from '../CityPage'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Custom Drapery & Window Treatments in Alhambra',
  description:
    'Light control and privacy window treatments for Alhambra townhomes and condos — layered shades, custom drapery, and smart motorization. Free in-home measurement.',
  alternates: { canonical: '/service-areas/alhambra' },
}

export default function AlhambraPage() {
  return (
    <CityPage
      slug="alhambra"
      heroTitle="Custom Drapery & Window Treatments in Alhambra"
      heroSub="Privacy and light control for townhomes and condos near busy streets — without giving up daylight or the view."
      introLabel="Serving Alhambra"
      introHeading="Privacy without the cave."
      introParagraphs={[
        'Plenty of Alhambra living happens in townhomes and condos near Main Street, Valley, and other lively corridors — which means street lights, headlights, and close neighbors. The challenge is filtering all of that out while keeping rooms bright during the day.',
        'Layering solves it: a sheer or light-filtering shade for daytime privacy, with a room-darkening drape or blackout roller behind it for night. We design both layers together so they work as one treatment.',
      ]}
      services={[
        {
          title: 'Layered Light Control',
          desc: 'Sheer-plus-blackout combinations designed as a single system — daytime privacy, nighttime darkness.',
          href: '/products/sheer-collection',
        },
        {
          title: 'Custom Drapery',
          desc: 'Sound-softening lined panels that also take the edge off street noise in front-facing rooms.',
          href: '/products/handcrafted-drapery',
        },
        {
          title: 'Smart Shades',
          desc: 'Automate the evening privacy routine — shades close on schedule whether you are home or not.',
          href: '/smart-shades',
        },
        {
          title: 'Hunter Douglas',
          desc: 'Silhouette and Pirouette shadings give adjustable privacy with the vanes, from an authorized dealer.',
          href: '/products',
        },
      ]}
      whyHeading="Small spaces, careful fits."
      facts={[
        {
          title: 'Established 1984',
          desc: 'A neighboring Temple City workroom that has fitted San Gabriel Valley condos and townhomes for forty years.',
        },
        {
          title: 'Free in-home measurement',
          desc: 'Condo windows often have shallow frames and HOA considerations — we measure and plan mounts in person, free.',
        },
        {
          title: '3-year installation warranty',
          desc: 'Workmanship on every mount and track is covered for three years after installation.',
        },
      ]}
      ctaHeading="Take back your evenings."
      ctaSub="A free in-home visit lets us see exactly where the light comes from — and show you the layering options that block it."
    />
  )
}
