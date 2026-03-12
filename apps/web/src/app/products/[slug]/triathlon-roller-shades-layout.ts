/**
 * Triathlon® Roller Shades — Product Layout Data
 * Source: Lutron product pages + Sivoia QS Triathlon Shading Solutions brochure (PDF)
 * Images served from Lutron CDN via imageBase override
 */

import type { ProductLayout } from './types'

export const triathlonRollerShadesLayout: ProductLayout & { imageBase: string } = {
  slug: 'triathlon-roller-shades',
  name: 'Triathlon® Roller Shades',
  description: 'Professional-grade motorized roller shades powered by Sivoia QS Triathlon technology — featuring Intelligent Hembar Alignment, precision hybrid drive, ultra-quiet operation below 38 dBA, and seamless integration with Lutron smart home platforms including RadioRA 3, HomeWorks, and Caséta.',

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
          text: 'Sivoia QS Triathlon roller shades combine simple power, instant digital response, and a precision hybrid drive for synergistic performance — delivering reliable motorized operation for windows from 19.5 to 144 inches wide.',
          label: 'Triathlon® Roller Shades · Metal Fascia',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          text: 'The architectural metal fascia creates a clean, contemporary aesthetic while concealing the roller mechanism. With light gaps as small as 9/16 inch, the fascia ensures maximum window coverage and a polished, modern finish.',
          label: 'Triathlon® Roller Shades · Clean Modern Design',
        },
        {
          image: 'triathlon-ph-b56e-443b.jpg',
          text: 'The fabric-wrapped fascia option coordinates with your shade fabric for a cohesive, traditional aesthetic. Choose from Classico, Gallery, Atelier, or Commercial fabric collections in sheer, translucent, or blackout opacities.',
          label: 'Triathlon® Roller Shades · Fabric-Wrapped Fascia',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          text: 'Width Integrated Deflection Reduction (WIDR) technology uses tubes with larger cross-sections for wider spans, preventing fabric deflection, sagging, and rippling while maintaining smooth, consistent operation across the full shade width.',
          label: 'Triathlon® Roller Shades · WIDR Technology',
        },
        {
          image: 'triathlon-ph-an-f003-4d57.jpg',
          text: 'The exposed headrail option provides wire-free motorized operation with easy tool-free D-cell battery access. Designed for concealment behind custom valances, it is ideal for retrofit installations where wiring is impractical.',
          label: 'Triathlon® Roller Shades · Exposed Headrail · Battery Powered',
        },
      ],
    },

    /* ===== BENEFITS (enriched from PDF brochure) ===== */
    {
      type: 'card-grid',
      title: 'Why Triathlon®',
      cols: 2,
      cards: [
        {
          image: 'triathlon-select-pa-5965-4491.jpg',
          title: 'Create a Comfort Zone',
          desc: 'Manage natural light to reduce temperature swings, cut glare on screens, and block up to 99% of UV rays — protecting furnishings, artwork, and flooring from sun damage while maintaining views and natural daylight.',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          title: 'Enhance Your Décor',
          desc: 'Choose from hundreds of fabrics across Classico, Gallery, Atelier, and Commercial collections in sheer, translucent, or blackout opacities. Three fascia styles — metal, fabric-wrapped, and exposed headrail — complement any interior design.',
        },
        {
          image: 'triathlon-ph-an-f003-4d57.jpg',
          title: 'Add Peace of Mind',
          desc: 'Cordless motorized operation eliminates dangling cords for enhanced child and pet safety. Schedule shades to move automatically, giving an occupied appearance while you are away and securing your home.',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          title: 'Integrate Seamlessly',
          desc: 'Native compatibility with Lutron RadioRA 3, HomeWorks, Caséta PRO, and RA2 Select. Works with 20+ third-party platforms including Amazon Alexa, Google Assistant, Apple HomeKit, Sonos, and Control4.',
        },
      ],
    },

    /* ===== TRIATHLON TECHNOLOGY ===== */
    {
      type: 'card-grid',
      title: 'Triathlon® Technology',
      cols: 3,
      cards: [
        {
          image: 'triathlon-select-pa-5965-4491.jpg',
          title: 'Intelligent Hembar Alignment',
          desc: 'Patented IHA technology monitors shade speed hundreds of times per second, maintaining alignment within 1/8 inch across all shades — ensuring perfect synchronization during motion and at every resting position.',
        },
        {
          image: 'triathlon-select-ph-an-4272-43e8.jpg',
          title: 'Precision Hybrid Drive',
          desc: 'The Triathlon system combines simple power delivery, instant digital response, and a precision hybrid motor. This synergistic design delivers ultra-quiet operation below 38 dBA at a smooth 3.6 in/sec bottom bar speed.',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          title: 'ClearConnect RF Wireless',
          desc: 'Integrated ClearConnect RF technology provides reliable 30-foot wireless range with native control system compatibility. No Wi-Fi required — the dedicated RF protocol ensures consistent, interference-free shade operation.',
        },
      ],
    },

    /* ===== TOP TREATMENT OPTIONS ===== */
    {
      type: 'comparison-grid',
      title: 'Top Treatment Options',
      cols: 2,
      items: [
        {
          image: 'triathlon-select-ph-an-4272-43e8.jpg',
          label: 'Architectural Metal Fascia',
          sublabel: '3.37" w × 4.94" h · Clean, contemporary aesthetic · Finishes: White, Black, Bronze, Silver, custom paint match',
        },
        {
          image: 'triathlon-ph-b56e-443b.jpg',
          label: 'Fabric-Wrapped Fascia',
          sublabel: '3.37" w × 4.94" h · Wrapped in matching shade fabric for a cohesive, traditional look that blends with décor',
        },
        {
          image: 'triathlon-ph-an-f003-4d57.jpg',
          label: 'Exposed Headrail',
          sublabel: 'Slim-profile headrail designed for concealment behind custom valances · Innovative tool-free battery access door',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          label: 'Exposed Headrail with WIDR',
          sublabel: 'Width Integrated Deflection Reduction for wider shades · Larger tube cross-section prevents sagging and rippling',
        },
      ],
    },

    /* ===== FABRIC OPTIONS ===== */
    {
      type: 'card-grid',
      title: 'Fabric Collections',
      cols: 3,
      cards: [
        {
          image: 'triathlon-select-pa-0742-4cc4.jpg',
          title: 'Sheer Fabrics',
          desc: 'Gently diffuse natural light while maintaining exterior views. Ideal for living rooms, kitchens, and spaces where daylight and privacy balance is essential. Available across Classico and Gallery collections.',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          title: 'Translucent Fabrics',
          desc: 'Softly filter light while providing moderate privacy. A versatile option for offices, dining rooms, and multi-purpose spaces. Available in Classico, Gallery, Atelier, and Commercial collections.',
        },
        {
          image: 'triathlon-ph-b56e-443b.jpg',
          title: 'Blackout Fabrics',
          desc: 'Complete light blocking for bedrooms, media rooms, and conference spaces. Room-darkening performance with designer aesthetics. Hembar options: Designer, Sealed, or Half-wrap Architectural.',
        },
      ],
    },

    /* ===== POWER OPTIONS ===== */
    {
      type: 'comparison-grid',
      title: 'Power Options',
      cols: 2,
      items: [
        {
          image: 'triathlon-select-pa-0742-4cc4.jpg',
          label: 'Plug-In Power Supply',
          sublabel: '12V low-voltage wiring · Plugs into standard wall outlet · Ideal for single shades or small groups · No battery replacement needed',
        },
        {
          image: 'triathlon-select-pa-5965-4491.jpg',
          label: 'Centralized Power Panel',
          sublabel: '12V power panel · Powers multiple shades from one location · Clean installation with concealed wiring · Professional-grade reliability',
        },
        {
          image: 'triathlon-ph-an-f003-4d57.jpg',
          label: 'Wire-Free Battery Powered',
          sublabel: 'D-cell batteries · 3–5 year battery life · Tool-free replacement via access door · Battery Boost option for wider shades',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          label: 'Cordless Manual',
          sublabel: 'Non-motorized manual operation · Spring-assist mechanism · Child-safe cordless design · No power source required',
        },
      ],
    },

    /* ===== CONTROL SYSTEMS ===== */
    {
      type: 'card-grid',
      title: 'Control Options',
      cols: 3,
      cards: [
        {
          image: 'triathlon-select-pa-5965-4491.jpg',
          title: 'Pico® Wireless Remote',
          desc: 'Compact wireless remote with raise, lower, preset, and favorite buttons. Mount on a wall, place on a table, or carry room to room. No wiring required — communicates via ClearConnect RF.',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          title: 'Keypads & Touch Panels',
          desc: 'Wall-mounted seeTouch, GRAFIK T, and Palladiom keypads provide elegant, always-available shade control. Programmable scene buttons activate multiple shades, lights, and climate settings simultaneously.',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          title: 'App, Voice & Scheduling',
          desc: 'Control from anywhere via the Lutron mobile app. Schedule shades with astronomical timeclock based on sunrise and sunset. Voice control through Amazon Alexa, Google Assistant, Apple HomeKit, and Siri.',
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
          desc: 'Width: 19.5"–144" · Height: 24"–144" (varies by fabric) · Speed: 3.6 in/sec · Sound Level: < 38 dBA at 3 ft · Light gap: as small as 9/16" · Coupling: Not available',
        },
        {
          image: 'triathlon-dm-fr-05a6-4469.png',
          title: 'Design & Mounting',
          desc: 'Fabric Collections: Classico, Gallery, Atelier, Commercial · Opacities: Sheer, Translucent, Blackout · Mounting: Wall or Ceiling · Hembar: Designer, Sealed, Half-wrap Architectural',
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
          desc: 'When paired with HomeWorks, RadioRA 3, or Athena systems, Triathlon shades track the sun\'s movement to automatically adjust positions — managing glare and heat gain while preserving views throughout the day.',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          title: 'Whole-Home Scenes',
          desc: 'Create personalized scenes that coordinate shades, lighting, and climate. One button press sets your Morning, Movie, Entertain, or Goodnight scene — activating the perfect ambiance across every room.',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          title: '20+ Integrations',
          desc: 'Works natively with Amazon Alexa, Google Assistant, Apple HomeKit, Sonos, Control4, Crestron, Savant, and many more. Open API support enables custom automation and third-party system integration.',
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
