/**
 * Triathlon® Roller Shades — Product Layout Data
 * Source: Lutron product pages (Metal Fascia, Fabric-Wrapped Fascia, Exposed Headrail)
 * Images served from Lutron CDN via imageBase override
 */

import type { ProductLayout } from './types'

export const triathlonRollerShadesLayout: ProductLayout & { imageBase: string } = {
  slug: 'triathlon-roller-shades',
  name: 'Triathlon® Roller Shades',
  description: 'Professional-grade motorized roller shades featuring Intelligent Hembar Alignment technology, ultra-quiet operation below 38 dBA, and seamless integration with major smart home platforms.',

  imageBase: 'https://assets.lutron.com/a/pdp/triathlon',

  heroImage: 'triathlon-select-ph-an-4272-43e8.jpg',
  heroLabel: 'Triathlon® Roller Shades · Metal Fascia · 12V Wired',

  sections: [
    /* ===== SCENE SECTIONS ===== */
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'triathlon-select-pa-0742-4cc4.jpg',
          text: 'Triathlon roller shades deliver reliable motorized operation for windows from 19.5 to 144 inches wide and 24 to 144 inches high, with smooth, quiet motorization and precise positioning control.',
          label: 'Triathlon® Roller Shades · Metal Fascia',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          text: 'The architectural metal fascia creates a clean, contemporary aesthetic while concealing the roller mechanism and maintaining minimal light gaps as small as 9/16 inch for maximum window coverage.',
          label: 'Triathlon® Roller Shades · Clean Modern Design',
        },
        {
          image: 'triathlon-ph-b56e-443b.jpg',
          text: 'The fabric-wrapped fascia option coordinates with your shade fabric for a cohesive, traditional aesthetic. This design ensures the entire shade system blends seamlessly with interior décor.',
          label: 'Triathlon® Roller Shades · Fabric-Wrapped Fascia',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          text: 'For configurations where wider spans could cause fabric deflection, Width Integrated Deflection Reduction (WIDR) technology uses tubes with larger cross-sections to reduce sagging and rippling.',
          label: 'Triathlon® Roller Shades · WIDR Technology',
        },
        {
          image: 'triathlon-ph-an-f003-4d57.jpg',
          text: 'The exposed headrail option provides wire-free motorized operation, designed for concealment behind custom valances in retrofit installations with easy D-cell battery access.',
          label: 'Triathlon® Roller Shades · Exposed Headrail · Battery Powered',
        },
      ],
    },

    /* ===== BENEFITS ===== */
    {
      type: 'card-grid',
      title: 'Key Benefits',
      cols: 3,
      cards: [
        {
          image: 'triathlon-select-pa-5965-4491.jpg',
          title: 'Intelligent Hembar Alignment',
          desc: 'Patented IHA technology monitors shade speed hundreds of times per second to maintain alignment within 1/8 inch across all shades — ensuring perfect synchronization during motion and at all resting positions.',
        },
        {
          image: 'triathlon-select-ph-an-4272-43e8.jpg',
          title: 'Ultra-Quiet Operation',
          desc: 'Operates at less than 38 dBA measured 3 feet away, creating peaceful environments. Bottom bar speed of 3.6 in/sec delivers smooth, unobtrusive shade movement throughout the day.',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          title: 'Smart Home Integration',
          desc: 'ClearConnect RF technology enables native wireless control with RadioRA 3, HomeWorks, Caséta PRO, and RA2 Select systems. Compatible with Amazon Alexa, Google Assistant, and other major platforms.',
        },
      ],
    },

    /* ===== TOP TREATMENT OPTIONS ===== */
    {
      type: 'comparison-grid',
      title: 'Top Treatment Options',
      cols: 3,
      items: [
        {
          image: 'triathlon-select-ph-an-4272-43e8.jpg',
          label: 'Metal Fascia',
          sublabel: '3.37" w × 4.94" h · Clean, contemporary aesthetic · Finishes: White, Black, Bronze, Silver, custom',
        },
        {
          image: 'triathlon-ph-b56e-443b.jpg',
          label: 'Fabric-Wrapped Fascia',
          sublabel: '3.37" w × 4.94" h · Wrapped in matching shade fabric for a cohesive, traditional look',
        },
        {
          image: 'triathlon-ph-an-f003-4d57.jpg',
          label: 'Headrail without Fascia',
          sublabel: 'Slim-profile headrail designed for concealment behind custom valances',
        },
      ],
    },

    /* ===== POWER OPTIONS ===== */
    {
      type: 'comparison-grid',
      title: 'Power Options',
      cols: 3,
      items: [
        {
          image: 'triathlon-select-pa-0742-4cc4.jpg',
          label: '12V Low-Voltage Wiring',
          sublabel: 'Continuous power via plug-in or centralized power panel · No battery replacement needed',
        },
        {
          image: 'triathlon-ph-an-f003-4d57.jpg',
          label: 'Wire-Free Battery Powered',
          sublabel: 'D-cell batteries · 3–5 year life · Tool-free replacement · Battery Boost option for wider shades',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          label: 'Cordless Manual',
          sublabel: 'Manual operation option for installations where motorization is not required',
        },
      ],
    },

    /* ===== SPECIFICATIONS ===== */
    {
      type: 'card-grid',
      title: 'Specifications',
      cols: 2,
      cards: [
        {
          image: 'triathlon-wire-free-dm-si-2473-44fa.png',
          title: 'Dimensions & Performance',
          desc: 'Width: 19.5"–144" · Height: 24"–144" (varies by fabric) · Speed: 3.6 in/sec · Sound Level: < 38 dBA at 3 ft · Coupling: No · Light gap as small as 9/16"',
        },
        {
          image: 'triathlon-dm-fr-05a6-4469.png',
          title: 'Design Options',
          desc: 'Fabric Options: Sheer, Translucent, Blackout · Collections: Classico, Gallery, Atelier, Commercial · Mounting: Wall or Ceiling · Hembar: Designer, Sealed, Half-wrap Architectural',
        },
      ],
    },

    /* ===== SMART HOME ECOSYSTEM ===== */
    {
      type: 'card-grid',
      title: 'Smart Home Ecosystem',
      cols: 3,
      cards: [
        {
          image: 'triathlon-select-pa-5965-4491.jpg',
          title: 'Natural Light Optimization',
          desc: 'When paired with HomeWorks, RadioRA 3, or Athena systems, Triathlon shades track the sun\'s movement to automatically adjust positions, managing glare and heat gain while preserving views.',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          title: 'ClearConnect RF Technology',
          desc: 'Integrated wireless control with 30 ft range. Native compatibility with RadioRA 3, HomeWorks, Caséta PRO, and RA2 Select control systems.',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          title: 'Voice & App Control',
          desc: 'Works with Amazon Alexa, Google Assistant, and other major smart home platforms. Schedule shades, create scenes, and automate operation from anywhere.',
        },
      ],
    },
  ],

  /* ===== GALLERY ===== */
  gallery: [
    { image: 'triathlon-select-ph-an-4272-43e8.jpg', text: '', label: 'Metal Fascia · 12V Wired' },
    { image: 'triathlon-select-pa-0742-4cc4.jpg', text: '', label: 'Living Room Installation' },
    { image: 'triathlon-select-ap-df3a-4b18.jpg', text: '', label: 'Bedroom with Roller Shades' },
    { image: 'triathlon-ph-b56e-443b.jpg', text: '', label: 'Fabric-Wrapped Fascia' },
    { image: 'triathlon-select-ap-001e-4307.jpg', text: '', label: 'Office Installation' },
    { image: 'triathlon-select-pa-5965-4491.jpg', text: '', label: 'Kitchen with Sheer Fabric' },
    { image: 'triathlon-ph-an-f003-4d57.jpg', text: '', label: 'Exposed Headrail · Battery Powered' },
  ],

  /* ===== SWATCHES (placeholder — Lutron fabric data can be added later) ===== */
  swatchCollections: [],

  cellSize: null,
  hardwareColors: null,
  opacity: null,
  edgeBanding: null,
  liner: null,
  decorativeTapes: null,
}
