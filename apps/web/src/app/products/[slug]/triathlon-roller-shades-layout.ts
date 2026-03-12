/**
 * Triathlon® Roller Shades — Product Layout Data
 * Source: Lutron product pages (3 SKUs) + Sivoia QS Triathlon Shading Solutions brochure (PDF)
 * Images served from Lutron CDN via imageBase override
 *
 * IMAGE–SKU MAPPING (verified against Lutron CDN):
 *  Metal Fascia (select- prefix):
 *    triathlon-select-ph-an-4272-43e8.jpg  — hero room scene, metal fascia
 *    triathlon-select-pa-0742-4cc4.jpg     — living room, metal fascia
 *    triathlon-select-ap-df3a-4b18.jpg     — bedroom / modern room
 *    triathlon-select-ap-001e-4307.jpg     — office / workspace
 *    triathlon-select-pa-5965-4491.jpg     — kitchen / dining area
 *  Fabric-Wrapped Fascia:
 *    triathlon-ph-b56e-443b.jpg            — hero, fabric-wrapped room scene
 *    triathlon-ap-964c-42ae.jpg            — fabric-wrapped detail room 1
 *    triathlon-ap-a669-4147.jpg            — fabric-wrapped detail room 2
 *    triathlon-ap-df68-48dc.jpg            — fabric-wrapped detail room 3
 *    triathlon-ap-64eb-40b3.jpg            — fabric-wrapped detail room 4
 *  Exposed Headrail:
 *    triathlon-ph-an-f003-4d57.jpg         — hero, exposed headrail close-up
 *    triathlon-pa-40f4-423a.jpg            — headrail room scene 1
 *    triathlon-pa-3745-43b9.jpg            — headrail room scene 2
 *    triathlon-ap-6047-4cdb.jpg            — headrail detail
 *  Dimension diagrams:
 *    triathlon-wire-free-dm-si-2473-44fa.png — wire-free side dimensions
 *    triathlon-dm-fr-05a6-4469.png           — wired front dimensions
 *    triathlon-wire-free-dm-fr-2995-4bfc.png — wire-free front dimensions
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
    /* ═══════════════════════════════════════════════════════════════
       OVERVIEW — from Lutron product page
       ═══════════════════════════════════════════════════════════════ */
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'triathlon-select-pa-0742-4cc4.jpg',
          text: 'Triathlon roller shades with metal fascia deliver reliable motorized operation for windows from 19.5 to 144 inches wide and 24 to 144 inches high, with smooth, quiet motorization and precise positioning control. The 12V low-voltage system provides continuous power while ClearConnect RF technology enables native wireless control.',
          label: 'Metal Fascia · 12V Wired · Living Room',
        },
        {
          image: 'triathlon-ph-b56e-443b.jpg',
          text: 'The fabric-wrapped fascia option coordinates with your shade fabric for a cohesive, traditional aesthetic. At 3.37" w × 4.94" h, the fascia conceals the roller mechanism while maintaining minimal light gaps for maximum window coverage.',
          label: 'Fabric-Wrapped Fascia · Coordinated Aesthetic',
        },
        {
          image: 'triathlon-ph-an-f003-4d57.jpg',
          text: 'Battery-powered roller shades with exposed headrail provide wire-free motorized operation, with a slim-profile headrail designed for concealment behind custom valances. The innovative headrail design makes D-cell batteries easy to access and replace without disturbing custom millwork.',
          label: 'Exposed Headrail · Battery Powered · Wire-Free',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          text: 'The architectural metal fascia creates a clean, contemporary aesthetic while concealing the roller mechanism. With light gaps as small as 9/16 inch, the fascia ensures maximum window coverage and a polished, modern finish for any room.',
          label: 'Metal Fascia · Bedroom Installation',
        },
        {
          image: 'triathlon-ap-964c-42ae.jpg',
          text: 'Choose from hundreds of fabric options across Classico, Gallery, Atelier, and Commercial collections in sheer, translucent, or blackout opacities. The fabric-wrapped fascia wraps in matching shade fabric for a seamless, cohesive interior design.',
          label: 'Fabric-Wrapped Fascia · Design Detail',
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════
       HIGHLIGHTS — from Lutron product page "Highlights" section
       ═══════════════════════════════════════════════════════════════ */
    {
      type: 'card-grid',
      title: 'Highlights',
      cols: 3,
      cards: [
        {
          image: 'triathlon-select-pa-5965-4491.jpg',
          title: 'Versatile Window Coverage',
          desc: 'Accommodates windows from 19.5 to 144 inches wide and 24 to 144 inches high for versatile installations, with precise sizing dependent on fabric choice and mounting requirements.',
        },
        {
          image: 'triathlon-select-ph-an-4272-43e8.jpg',
          title: 'Intelligent Hembar Alignment',
          desc: 'Patented IHA technology monitors shade speed hundreds of times per second to maintain alignment within 1/8 inch across all shades, ensuring perfect synchronization during motion and at every resting position.',
        },
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          title: 'Ultra-Quiet Operation',
          desc: 'Operates below 38 dBA measured 3 feet away, creating peaceful environments. Bottom bar speed of 3.6 in/sec delivers smooth, unobtrusive shade movement throughout the day.',
        },
        {
          image: 'triathlon-pa-40f4-423a.jpg',
          title: 'Flexible Power Options',
          desc: '12V low-voltage wiring provides continuous power without battery replacement. Wire-free D-cell batteries offer 3–5 years of operation with tool-free replacement and optional Battery Boost for wider shades.',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          title: 'Smart Home Ready',
          desc: 'ClearConnect RF technology enables native wireless control with RadioRA 3, HomeWorks, Caséta PRO, and RA2 Select systems. Compatible with Amazon Alexa, Google Assistant, Apple HomeKit, and other major platforms.',
        },
        {
          image: 'triathlon-ap-a669-4147.jpg',
          title: 'Hundreds of Fabrics',
          desc: 'Choose from varied colors, textures, and openness factors across Classico, Gallery, Atelier, and Commercial collections. Available in sheer, translucent, and blackout opacities for complete customization.',
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════
       WIRED vs WIRE-FREE — connectivity / power comparison
       ═══════════════════════════════════════════════════════════════ */
    {
      type: 'comparison-grid',
      title: 'Wired vs Wire-Free',
      cols: 2,
      items: [
        {
          image: 'triathlon-select-pa-0742-4cc4.jpg',
          label: '12V Low-Voltage Wired',
          sublabel: 'Continuous power via plug-in power supply or centralized power panel · No battery replacement · Consistent performance · Regular roll only · Metal or Fabric-Wrapped Fascia · Ideal for new construction and renovations',
        },
        {
          image: 'triathlon-ph-an-f003-4d57.jpg',
          label: 'Wire-Free Battery Powered',
          sublabel: 'D-cell batteries with 3–5 year life · Tool-free battery access door · Battery Boost option for wider shades · Regular or reverse roll · All fascia options including exposed headrail · Ideal for retrofit installations',
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════
       SMART CONTROL — from PDF page 7 (Sivoia QS Triathlon shade
       control options)
       ═══════════════════════════════════════════════════════════════ */
    {
      type: 'card-grid',
      title: 'Smart Control',
      cols: 3,
      cards: [
        {
          image: 'triathlon-select-pa-5965-4491.jpg',
          title: 'Keypads & Scene Control',
          desc: 'Wall-mounted Pico scene keypads, seeTouch keypads (RadioRA 2 / HomeWorks QS), GRAFIK T keypads, and Palladiom keypads. One button press activates scenes that dim lights, adjust temperature, and position shades simultaneously.',
        },
        {
          image: 'triathlon-ap-df68-48dc.jpg',
          title: 'Mobile App & Timeclock',
          desc: 'Control shades from your mobile device with the Lutron app (Android & iOS) — even when away from home. Astronomical timeclock integration automatically raises and lowers shades based on sunrise and sunset schedules.',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          title: 'Third-Party Integration',
          desc: 'Integrates with 20+ platforms: Amazon Alexa, Apple HomeKit, Google Assistant, Control4, Crestron, Savant, Sonos, Ring, SmartThings, Honeywell, ELAN, JOSH, and more — for audio/visual and whole-home automation.',
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════
       WHOLE-HOME vs SHADE-ONLY — from PDF page 7
       ═══════════════════════════════════════════════════════════════ */
    {
      type: 'comparison-grid',
      title: 'Control Systems',
      cols: 2,
      items: [
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          label: 'Whole-Home Solutions',
          sublabel: 'Integrates with Lutron Caséta, RA2 Select, RadioRA 2, and HomeWorks QS lighting systems · Control shades from keypads, mobile, timeclock, or third-party platforms · Dim lights, adjust temperature, and position shades with one button',
        },
        {
          image: 'triathlon-pa-3745-43b9.jpg',
          label: 'Shade-Only Solution',
          sublabel: 'Pico wireless controls — flexible, battery-operated remotes that mount on a wall, sit on a tabletop pedestal, or carry room-to-room · No cutting holes or running wire required · Works with any residential system',
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════
       TOP TREATMENT OPTIONS
       ═══════════════════════════════════════════════════════════════ */
    {
      type: 'comparison-grid',
      title: 'Top Treatment Options',
      cols: 2,
      items: [
        {
          image: 'triathlon-select-ph-an-4272-43e8.jpg',
          label: 'Architectural Metal Fascia',
          sublabel: '3.37" w × 4.94" h · Clean, contemporary aesthetic · Finishes: White, Black, Bronze, Silver, custom paint match · Light gap as small as 9/16"',
        },
        {
          image: 'triathlon-ph-b56e-443b.jpg',
          label: 'Fabric-Wrapped Fascia',
          sublabel: '3.37" w × 4.94" h · Wrapped in matching shade fabric for a cohesive, traditional look · Conceals roller mechanism · Blends with interior décor',
        },
        {
          image: 'triathlon-ph-an-f003-4d57.jpg',
          label: 'Exposed Headrail',
          sublabel: 'Slim-profile headrail designed for concealment behind custom valances · Innovative tool-free battery access door · Light gap as small as 7/16"',
        },
        {
          image: 'triathlon-ap-6047-4cdb.jpg',
          label: 'Exposed Headrail with WIDR',
          sublabel: 'Width Integrated Deflection Reduction for wider shades · Larger, stronger tube cross-section prevents fabric sagging and rippling · Single-panel coverage for select sizes',
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════
       FABRIC COLLECTIONS
       ═══════════════════════════════════════════════════════════════ */
    {
      type: 'card-grid',
      title: 'Fabric Collections',
      cols: 3,
      cards: [
        {
          image: 'triathlon-ap-64eb-40b3.jpg',
          title: 'Sheer Fabrics',
          desc: 'Gently diffuse natural light while maintaining exterior views. Ideal for living rooms, kitchens, and spaces where daylight and privacy balance is essential. Available across Classico and Gallery collections.',
        },
        {
          image: 'triathlon-ap-a669-4147.jpg',
          title: 'Translucent Fabrics',
          desc: 'Softly filter light while providing moderate privacy. A versatile option for offices, dining rooms, and multi-purpose spaces. Available in Classico, Gallery, Atelier, and Commercial collections.',
        },
        {
          image: 'triathlon-ap-df68-48dc.jpg',
          title: 'Blackout Fabrics',
          desc: 'Complete light blocking for bedrooms, media rooms, and conference spaces. Room-darkening performance with designer aesthetics. Hembar options: Designer, Sealed, or Half-wrap Architectural.',
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════
       POWER OPTIONS — expanded from PDF
       ═══════════════════════════════════════════════════════════════ */
    {
      type: 'comparison-grid',
      title: 'Power Options',
      cols: 2,
      items: [
        {
          image: 'triathlon-select-pa-0742-4cc4.jpg',
          label: 'Plug-In Power Supply',
          sublabel: '12V low-voltage · Plugs into standard wall outlet · Ideal for single shades or small groups · No battery replacement · Continuous, reliable power',
        },
        {
          image: 'triathlon-select-pa-5965-4491.jpg',
          label: 'Centralized Power Panel',
          sublabel: '10-output power supply · Powers multiple shades from one location · Clean installation with concealed wiring · Professional-grade reliability for larger installations',
        },
        {
          image: 'triathlon-pa-40f4-423a.jpg',
          label: 'Wire-Free D-Cell Battery',
          sublabel: 'Up to 8 D-cell alkaline batteries · 3–5 year typical life · Tool-free replacement via access door · Battery Boost option (8 additional cells) for shades wider than 37.5"',
        },
        {
          image: 'triathlon-pa-3745-43b9.jpg',
          label: 'Cordless Manual',
          sublabel: 'Non-motorized spring-assist mechanism · Child-safe cordless design · No power source or batteries required · Smooth, quiet manual operation',
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════
       SPECIFICATIONS
       ═══════════════════════════════════════════════════════════════ */
    {
      type: 'card-grid',
      title: 'Specifications',
      cols: 2,
      cards: [
        {
          image: 'triathlon-wire-free-dm-si-2473-44fa.png',
          title: 'Dimensions & Performance',
          desc: 'Width: 19.5"–144" · Height: 24"–144" (varies by fabric) · Speed: 3.6 in/sec · Sound Level: < 38 dBA at 3 ft · Light gap: 9/16" (metal fascia) / 7/16" (headrail) · Coupling: Not available',
        },
        {
          image: 'triathlon-dm-fr-05a6-4469.png',
          title: 'Design & Certifications',
          desc: 'Mounting: Wall or Ceiling · Hembar: Designer, Sealed, Half-wrap Architectural · Fabric Certifications: PVC Free, Fire Rated, GREENGUARD, RoHS, Cradle to Cradle, Lead Free · 8-Year Limited Warranty',
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════
       NATURAL LIGHT OPTIMIZATION & ECOSYSTEM
       ═══════════════════════════════════════════════════════════════ */
    {
      type: 'card-grid',
      title: 'Smart Home Ecosystem',
      cols: 3,
      cards: [
        {
          image: 'triathlon-select-ap-df3a-4b18.jpg',
          title: 'Natural Light Optimization',
          desc: 'When paired with HomeWorks, RadioRA 3, or Athena Shade Automation Software, Triathlon shades track the sun\'s movement to automatically adjust positions — managing glare and heat gain while preserving views and daylight.',
        },
        {
          image: 'triathlon-ap-964c-42ae.jpg',
          title: 'Whole-Home Scenes',
          desc: 'Create personalized scenes that coordinate shades, lighting, and climate. One button press sets your Morning, Movie, Entertain, or Goodnight scene — activating the perfect ambiance across every room.',
        },
        {
          image: 'triathlon-select-ap-001e-4307.jpg',
          title: 'Environmental Standards',
          desc: 'Lutron shading solutions contribute to LEED, WELL, and BREEAM certifications. Regulatory approvals include cULus, FCC, IC, CE Mark, UKCA, and more for global installation confidence.',
        },
      ],
    },
  ],

  /* ═══════════════════════════════════════════════════════════════
     GALLERY — images from all 3 SKU pages
     ═══════════════════════════════════════════════════════════════ */
  gallery: [
    { image: 'triathlon-select-ph-an-4272-43e8.jpg', text: '', label: 'Metal Fascia · 12V Wired' },
    { image: 'triathlon-select-pa-0742-4cc4.jpg', text: '', label: 'Living Room · Metal Fascia' },
    { image: 'triathlon-ph-b56e-443b.jpg', text: '', label: 'Fabric-Wrapped Fascia' },
    { image: 'triathlon-ph-an-f003-4d57.jpg', text: '', label: 'Exposed Headrail · Battery Powered' },
    { image: 'triathlon-select-ap-df3a-4b18.jpg', text: '', label: 'Bedroom · Metal Fascia' },
    { image: 'triathlon-ap-964c-42ae.jpg', text: '', label: 'Fabric-Wrapped Detail' },
    { image: 'triathlon-pa-40f4-423a.jpg', text: '', label: 'Headrail Room Scene' },
    { image: 'triathlon-select-ap-001e-4307.jpg', text: '', label: 'Office Installation' },
    { image: 'triathlon-ap-a669-4147.jpg', text: '', label: 'Fabric-Wrapped Room' },
    { image: 'triathlon-select-pa-5965-4491.jpg', text: '', label: 'Kitchen · Metal Fascia' },
    { image: 'triathlon-pa-3745-43b9.jpg', text: '', label: 'Headrail Room Scene 2' },
    { image: 'triathlon-ap-64eb-40b3.jpg', text: '', label: 'Fabric-Wrapped Room 2' },
  ],

  /* ═══════════════════════════════════════════════════════════════
     SWATCHES (placeholder — Lutron fabric swatch data to be added)
     ═══════════════════════════════════════════════════════════════ */
  swatchCollections: [],

  cellSize: null,
  hardwareColors: null,
  opacity: null,
  edgeBanding: null,
  liner: null,
  decorativeTapes: null,
}
