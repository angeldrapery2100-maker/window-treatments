/**
 * Alustra® Woven Textures® - Product Layout Data
 * Manually curated from Hunter Douglas PDF content
 */

import type { ProductLayout, SectionLayout, SwatchCollection } from './types'

export const alustraWovenLayout: ProductLayout = {
  slug: 'alustra-woven-textures',
  name: 'Alustra® Woven Textures®',
  description: 'An exclusive, thoughtfully curated selection of globally sourced woven texture fabrics. Available as Roman Shades, Roller Shades and Skyline® Panels with PowerView® Automation capabilities.',

  heroImage: 'page002_img01_2028x1953.jpeg',
  heroLabel: 'Alustra® Woven Textures®',

  sections: [
    // ── Scene Gallery ──
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page005_img01_1800x1953.jpeg',
          text: 'Globally sourced woven textures bring warmth and sophisticated style to modern living spaces.',
          label: 'Fabric Retreat · Color Pure · Skyline® Panels',
        },
        {
          image: 'page010_img01_1778x1955.jpeg',
          text: 'Soft, filtered light transforms any room into an inviting retreat with the natural beauty of woven fabrics.',
          label: 'Fabric Highlands by Lori Weitzner · Color Parchment · Roman Shades',
        },
        {
          image: 'page014_img01_1794x1952.jpeg',
          text: 'The Roller Duolite® Shade provides dual layers of fabric for enhanced light control and privacy throughout the day.',
          label: 'Fabric Timberlake · Color Sun · Roller Duolite® Shade',
        },
        {
          image: 'page012_img01_1787x1956.jpeg',
          text: 'Create a cozy, serene bedroom with woven texture roller shades that gently diffuse natural light.',
          label: 'Fabric Ramble by Lori Weitzner · Color Silver · Roller Shades',
        },
        {
          image: 'page016_img01_1797x1953.jpeg',
          text: 'A refined palette of textures and colors seamlessly complements contemporary kitchen and living areas.',
          label: 'Fabric Plantation · Color Dynasty · Roller Shades',
        },
      ],
    },

    // ── Benefits ──
    {
      type: 'comparison-grid',
      title: 'Benefits',
      cols: 4,
      items: [
        {
          image: 'page018_img01_1056x681.jpeg',
          label: 'Innovative Fabric Collection',
          sublabel: 'A custom curated collection of globally sourced fabrics with sumptuous textures designed to filter light for the ultimate in style.',
        },
        {
          image: 'page018_img03_1052x675.jpeg',
          label: 'Three Product Styles',
          sublabel: 'Available as Roman Shades, Roller Shades and Skyline® Panels. Use together for a Whole House Solution or separately to finish any room.',
        },
        {
          image: 'page018_img02_1055x680.jpeg',
          label: 'Opacity & Light Control',
          sublabel: 'Varying levels of opacity from sheer to semi-opaque. The Roller Duolite® Shade, Dual Roller and Roman Shade with Independent Operable Liner enhance light control and privacy.',
        },
        {
          image: 'page018_img04_1055x680.jpeg',
          label: 'PowerView® Automation',
          sublabel: 'The ultimate in home automation — control every shade with the touch of a button.',
        },
      ],
    },

    // ── One Fabric Collection, Three Product Styles ──
    {
      type: 'comparison-grid',
      title: 'One Fabric Collection, Three Product Styles',
      cols: 3,
      items: [
        {
          image: 'page019_img02_757x626.jpeg',
          label: 'Roman Shades',
          sublabel: 'Soft, cascading folds create an elegant look with refined dimension and texture.',
        },
        {
          image: 'page019_img03_741x626.jpeg',
          label: 'Roller Shades',
          sublabel: 'The modern minimalistic style and simple lines create an understated yet sophisticated elegance.',
        },
        {
          image: 'page019_img04_675x636.jpeg',
          label: 'Skyline® Panels',
          sublabel: 'Cover both windows and doors with a sleek, contemporary design aesthetic for large expansive spaces.',
        },
      ],
    },

    // ── Roman Shades: Refined Dimension ──
    {
      type: 'split-scene',
      title: 'Roman Shades — Refined Dimension',
      sceneImage: 'page020_img02_1762x1536.jpeg',
      sceneLabel: 'Fabric Highlands by Lori Weitzner · Color Parchment',
      sceneSide: 'left',
      items: [
        {
          image: 'page020_img03_646x670.jpeg',
          label: 'Top-Down / Bottom-Up',
          sublabel: 'Open from the top or from the bottom, or find somewhere in between for the perfect balance of privacy and light.',
        },
        {
          image: 'page020_img04_647x671.jpeg',
          label: 'Independent Operable Liner',
          sublabel: 'From soft, filtered light to total light control and privacy, the independent liner provides complete versatility with the clean look of a single headrail.',
        },
      ],
    },

    // ── Roller Shades: Minimalistic Perspective ──
    {
      type: 'split-scene',
      title: 'Roller Shades — Minimalistic Perspective',
      sceneImage: 'page021_img02_1703x1537.jpeg',
      sceneLabel: 'Fabric Retreat · Color Pure',
      sceneSide: 'right',
      items: [
        {
          image: 'page021_img03_647x672.jpeg',
          label: 'Roller Duolite® Shade',
          sublabel: 'Combines a sheer or semi-sheer fabric with a room-darkening liner in a single shade for the best of both worlds.',
        },
        {
          image: 'page021_img04_646x671.jpeg',
          label: 'Dual Roller',
          sublabel: 'The shade and liner work independently of one another for optimal light control and privacy.',
        },
      ],
    },

    // ── Roller Duolite® Shade Detail ──
    {
      type: 'comparison-grid',
      title: 'Roller Duolite® Shade',
      cols: 3,
      items: [
        {
          image: 'page025_img02_479x622.jpeg',
          label: 'Front Fabric Lowered',
          sublabel: 'Back liner not lowered — decorative front fabric provides filtered light.',
        },
        {
          image: 'page025_img03_479x622.jpeg',
          label: 'Liner Partially Lowered',
          sublabel: 'Adjust the back liner as needed for your preferred level of privacy.',
        },
        {
          image: 'page025_img06_479x512.jpeg',
          label: 'Liner Fully Lowered',
          sublabel: 'Complete room darkening and maximum privacy.',
        },
      ],
    },

    // ── Dual Roller Detail ──
    {
      type: 'comparison-grid',
      title: 'Dual Roller',
      cols: 3,
      items: [
        {
          image: 'page026_img02_479x623.jpeg',
          label: 'Both Shades Lowered',
          sublabel: 'Front shade and back liner lowered for maximum privacy and light control.',
        },
        {
          image: 'page026_img03_479x623.jpeg',
          label: 'Back Liner Partially Raised',
          sublabel: 'Two shades combined with one Woven Textures® fabric positioned in front.',
        },
        {
          image: 'page026_img05_475x525.jpeg',
          label: 'Back Liner Fully Raised',
          sublabel: 'Front shade lowered for filtered light while the view remains unobstructed through the sheer fabric.',
        },
      ],
    },

    // ── Liner Options ──
    {
      type: 'comparison-grid',
      title: 'Liner Opacity Options',
      cols: 2,
      items: [
        {
          image: 'page026_img05_475x525.jpeg',
          label: 'Light-Filtering Liner',
          sublabel: 'Diffuses light for a soft glow while providing moderate privacy.',
        },
        {
          image: 'page026_img06_475x525.jpeg',
          label: 'Room-Darkening Liner',
          sublabel: 'Provides enhanced light control with maximum privacy.',
        },
      ],
    },

    // ── Operating Systems & Specialty Options ──
    {
      type: 'comparison-grid',
      title: 'Operating Systems & Specialty Options',
      cols: 4,
      items: [
        {
          image: 'page027_img03_216x458.jpeg',
          label: 'PowerView® Automation',
          sublabel: 'Smoothly integrates with other smart-home technologies for total automation. Schedule shadings for privacy and security.',
        },
        {
          image: 'page029_img03_471x341.jpeg',
          label: 'UltraGlide®',
          sublabel: 'The revolutionary retractable cord with constant cord length provides enhanced safety.',
        },
        {
          image: 'page029_img09_471x341.jpeg',
          label: 'EasyRise®',
          sublabel: 'Raise or lower the shade with a continuous cord loop. A universal cord tensioner attaches to the window frame for enhanced safety.',
        },
        {
          image: 'page029_img07_509x394.jpeg',
          label: 'LiteRise®',
          sublabel: 'The cordless system makes raising and lowering the shade easy. Simply push up to raise and pull down to lower.',
        },
        {
          image: 'page029_img04_469x555.jpeg',
          label: 'Independent Operable Liner',
          sublabel: 'Available in Duo Liner (color faces room, white faces street) and Mono Liner (single color, front and back). Light-Filtering and Room-Darkening options.',
        },
        {
          image: 'page029_img05_469x559.jpeg',
          label: 'Top-Down / Bottom-Up',
          sublabel: 'Open from the top or the bottom for the perfect balance of privacy and light. Available with PowerView®, UltraGlide® and EasyRise®.',
        },
        {
          image: 'page029_img08_471x398.jpeg',
          label: 'Two-On-One-Headrail',
          sublabel: 'The solution for extra wide or side-by-side windows. A single headrail provides a clean look while allowing independent operation.',
        },
      ],
    },

    // ── Top Treatments: Roman Shades ──
    {
      type: 'card-grid',
      title: 'Top & Bottom Treatments — Roman Shades',
      cols: 4,
      cards: [
        { image: 'page030_img01_471x570.jpeg', title: 'Headrail with Valance', desc: 'Available with UltraGlide®, LiteRise®, EasyRise®. Valance height options: 6½", 8", 12", 16".' },
        { image: 'page030_img02_471x570.jpeg', title: 'Headrail without Valance', desc: 'Fabric-covered headrail. Available with PowerView® Automation, UltraGlide®, LiteRise®, EasyRise®.' },
        { image: 'page030_img05_471x570.jpeg', title: 'Stand-Alone Valance', desc: 'Fabric-wrapped valance with a structured and tailored profile. Height options: 6½", 8".' },
        { image: 'page030_img03_472x571.jpeg', title: 'Fabric Wrapped Standard Bar', desc: 'Available with all operating systems.' },
        { image: 'page030_img04_472x571.jpeg', title: 'Fabric Wrapped Flat Bar', desc: 'Available with UltraGlide® and EasyRise® operating systems.' },
        { image: 'page030_img06_471x570.jpeg', title: 'Flat Metal Bar', desc: 'Available with UltraGlide® and EasyRise® operating systems.' },
        { image: 'page030_img07_471x570.jpeg', title: 'Sewn-in Hem', desc: 'Available with PowerView® Automation, UltraGlide® and EasyRise®.' },
      ],
    },

    // ── Top Treatments: Roller Shades ──
    {
      type: 'card-grid',
      title: 'Top & Bottom Treatments — Roller Shades',
      cols: 4,
      cards: [
        { image: 'page032_img01_472x319.jpeg', title: 'Small Square Cassette 2.0', desc: 'Conceals the fabric roll behind a modern, square fabric-wrapped cover. Available with PowerView®, Custom Clutch, SoftTouch.' },
        { image: 'page032_img02_470x319.jpeg', title: 'Large Square Cassette 2.0', desc: 'Larger version for wider shades. Available with PowerView®, Custom Clutch, UltraGlide®, LiteRise®, SoftTouch.' },
        { image: 'page032_img05_471x319.jpeg', title: '4" Fascia', desc: 'Exposed metal valance covers the fabric roll for a sleek contemporary look. Available in 10 Custom Hardware Colors and Anodized.' },
        { image: 'page032_img06_472x320.jpeg', title: '5¼" Pocket', desc: 'Fabric roll and operating system completely enclosed and recessed into the ceiling. Available in Anodized and White Tiara.' },
        { image: 'page032_img03_470x320.jpeg', title: 'Fabric-Wrapped Standard Bar', desc: 'Available with all operating systems.' },
        { image: 'page032_img04_468x317.jpeg', title: 'Fabric-Wrapped Flat Bar', desc: 'Available with PowerView®, Custom Clutch, UltraGlide®, SoftTouch.' },
        { image: 'page032_img09_472x319.jpeg', title: 'Stand-Alone Valance', desc: 'Fabric-wrapped valance with a structured and tailored profile. Length options: 6½", 8".' },
        { image: 'page032_img08_470x319.jpeg', title: 'Sewn-in Hem', desc: 'Available with Custom Clutch.' },
      ],
    },
  ],

  // ── Gallery ──
  gallery: [
    { image: 'page002_img01_2028x1953.jpeg', text: 'Alustra® Woven Textures®', label: '' },
    { image: 'page006_img01_2681x1953.jpeg', text: 'Fabric Timberlake · Color Sun', label: 'PowerView® Automation · Deck 1' },
    { image: 'page009_img03_1795x1732.jpeg', text: 'Imagine. Edit. Refine.', label: 'Fabric Ramble by Lori Weitzner · Color Silver' },
    { image: 'page013_img01_940x1956.jpeg', text: 'Roman Shades paired with Design Studio™', label: 'Fabric Coppice by Lori Weitzner · Color Sunrise' },
    { image: 'page017_img02_1795x1957.jpeg', text: 'Skyline® Panels', label: 'Fabric Rivulet by Lori Weitzner · Color Silt' },
    { image: 'page020_img02_1762x1536.jpeg', text: 'Refined Dimension', label: 'Fabric Highlands by Lori Weitzner · Color Parchment' },
    { image: 'page021_img02_1703x1537.jpeg', text: 'Minimalistic Perspective', label: 'Fabric Retreat · Color Pure' },
    { image: 'page027_img07_1269x1243.jpeg', text: 'PowerView® Automation', label: 'Fabric Plantation · Color Dynasty' },
  ],

  // ── Hardware Colors ──
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Alustra® Woven Textures®',
    items: [
      { image: 'page045_img01_306x306.jpeg', label: '048 Black' },
      { image: 'page045_img04_306x306.jpeg', label: '064 Bronze' },
      { image: 'page045_img05_306x306.jpeg', label: '235 Gold' },
      { image: 'page045_img06_306x306.jpeg', label: '316 Nickel' },
      { image: 'page045_img07_306x306.jpeg', label: '320 Rich Cream' },
      { image: 'page045_img08_306x306.jpeg', label: '651 Duchess Grey' },
      { image: 'page045_img09_306x306.jpeg', label: '879 Pearl Gray' },
    ],
  },

  // ── Swatch Collections ──
  swatchCollections: [
    {
      name: 'Ramble by Lori Weitzner',
      swatches: [
        { image: 'page046_img01_632x1050.jpeg', colorName: 'SNOW', specs: ['Sheer RMB-100'] },
        { image: 'page046_img02_632x1050.jpeg', colorName: 'SILVER', specs: ['Sheer RMB-300'] },
        { image: 'page047_img01_632x1050.jpeg', colorName: 'PEWTER', specs: ['Sheer RMB-800'] },
      ],
    },
    {
      name: 'Coppice by Lori Weitzner',
      swatches: [
        { image: 'page048_img01_632x1050.jpeg', colorName: 'WHISP', specs: ['Sheer COP-700'] },
        { image: 'page048_img02_632x1050.jpeg', colorName: 'FLINT', specs: ['Sheer COP-800'] },
        { image: 'page049_img01_632x1050.jpeg', colorName: 'SUNRISE', specs: ['Sheer COP-350'] },
      ],
    },
    {
      name: 'Arusha',
      swatches: [
        { image: 'page050_img01_632x1050.jpeg', colorName: 'JOURNEY', specs: ['Sheer ARU-300'] },
        { image: 'page050_img02_632x1050.jpeg', colorName: 'PLATEAU', specs: ['Sheer ARU-301'] },
        { image: 'page051_img01_632x1050.jpeg', colorName: 'PATH', specs: ['Sheer ARU-400'] },
        { image: 'page051_img02_632x1050.jpeg', colorName: 'BOUNDLESS', specs: ['Sheer ARU-800'] },
      ],
    },
    {
      name: 'Capri',
      swatches: [
        { image: 'page052_img01_632x1050.jpeg', colorName: 'WHITE SAIL', specs: ['Semi-Sheer CPR-100'] },
        { image: 'page052_img02_632x1050.jpeg', colorName: 'PARADISE', specs: ['Semi-Sheer CPR-200'] },
        { image: 'page053_img01_632x1050.jpeg', colorName: 'BREEZE', specs: ['Semi-Sheer CPR-800'] },
        { image: 'page053_img02_632x1050.jpeg', colorName: 'BUNGALOW', specs: ['Semi-Sheer CPR-801'] },
        { image: 'page054_img01_632x1050.jpeg', colorName: 'HAMMOCK', specs: ['Semi-Sheer CPR-400'] },
      ],
    },
    {
      name: 'Lyric',
      swatches: [
        { image: 'page055_img01_632x1050.jpeg', colorName: 'CAPELLA', specs: ['Semi-Sheer LYR-100'] },
        { image: 'page055_img02_632x1050.jpeg', colorName: 'HARMONY', specs: ['Semi-Sheer LYR-200'] },
        { image: 'page056_img01_632x1050.jpeg', colorName: 'CAPRICE', specs: ['Semi-Sheer LYR-800'] },
        { image: 'page056_img02_632x1050.jpeg', colorName: 'CANTATA', specs: ['Semi-Sheer LYR-700'] },
      ],
    },
    {
      name: 'Timberlake',
      swatches: [
        { image: 'page057_img01_632x1050.jpeg', colorName: 'PAPYRUS', specs: ['Semi-Sheer TBL-200'] },
        { image: 'page057_img02_632x1050.jpeg', colorName: 'SUN', specs: ['Semi-Sheer TBL-300'] },
        { image: 'page058_img01_632x1050.jpeg', colorName: 'HONEY', specs: ['Semi-Sheer TBL-402'] },
        { image: 'page058_img02_632x1050.jpeg', colorName: 'TOASTED PECAN', specs: ['Semi-Sheer TBL-401'] },
        { image: 'page059_img01_632x1050.jpeg', colorName: 'COCOA', specs: ['Semi-Sheer TBL-400'] },
      ],
    },
    {
      name: 'Rivulet by Lori Weitzner',
      swatches: [
        { image: 'page060_img01_632x1050.jpeg', colorName: 'SOAPSTONE', specs: ['Semi-Sheer RVL-300'] },
        { image: 'page060_img02_632x1050.jpeg', colorName: 'BUTTERSCOTCH', specs: ['Semi-Sheer RVL-400'] },
        { image: 'page061_img01_632x1050.jpeg', colorName: 'SILT', specs: ['Semi-Sheer RVL-700'] },
      ],
    },
    {
      name: 'Retreat',
      swatches: [
        { image: 'page062_img01_632x1050.jpeg', colorName: 'PURE', specs: ['Semi-Sheer RE-101'] },
        { image: 'page062_img02_632x1050.jpeg', colorName: 'COZY', specs: ['Semi-Sheer RE-300'] },
        { image: 'page063_img01_632x1050.jpeg', colorName: 'JOY', specs: ['Semi-Sheer RE-800'] },
        { image: 'page063_img02_632x1050.jpeg', colorName: 'CABANA', specs: ['Semi-Sheer RE-400'] },
      ],
    },
    {
      name: 'Folklore',
      swatches: [
        { image: 'page064_img01_632x1050.jpeg', colorName: 'GLASSINE', specs: ['Semi-Sheer FO-100'] },
        { image: 'page064_img02_632x1050.jpeg', colorName: 'ABALONE', specs: ['Semi-Sheer FO-822'] },
        { image: 'page065_img01_632x1050.jpeg', colorName: 'SHUTTER', specs: ['Semi-Sheer FO-800'] },
        { image: 'page065_img02_632x1050.jpeg', colorName: 'CAFE', specs: ['Semi-Sheer FO-329'] },
        { image: 'page066_img01_632x1050.jpeg', colorName: 'CAVIAR', specs: ['Semi-Sheer FO-900'] },
      ],
    },
    {
      name: 'Lace',
      swatches: [
        { image: 'page067_img01_632x1050.jpeg', colorName: 'TIN', specs: ['Semi-Sheer LC-307'] },
        { image: 'page067_img02_632x1050.jpeg', colorName: 'CHROME', specs: ['Semi-Sheer LC-805'] },
      ],
    },
    {
      name: 'Highlands by Lori Weitzner',
      swatches: [
        { image: 'page068_img01_632x1050.jpeg', colorName: 'PARCHMENT', specs: ['Semi-Opaque HLD-200'] },
        { image: 'page068_img02_632x1050.jpeg', colorName: 'LATTE', specs: ['Semi-Opaque HLD-300'] },
        { image: 'page069_img01_632x1050.jpeg', colorName: 'BROWN SUGAR', specs: ['Semi-Opaque HLD-400'] },
      ],
    },
    {
      name: 'Plantation',
      swatches: [
        { image: 'page070_img01_632x1050.jpeg', colorName: 'CHATEAU', specs: ['Semi-Opaque PLN-100'] },
        { image: 'page070_img02_632x1050.jpeg', colorName: 'NOBLE', specs: ['Semi-Opaque PLN-800'] },
        { image: 'page071_img01_632x1050.jpeg', colorName: 'DYNASTY', specs: ['Semi-Opaque PLN-801'] },
        { image: 'page071_img02_632x1050.jpeg', colorName: 'MONARCH', specs: ['Semi-Opaque PLN-300'] },
        { image: 'page072_img01_632x1050.jpeg', colorName: 'COFFEE', specs: ['Semi-Opaque PLN-400'] },
      ],
    },
    {
      name: 'Artisan',
      swatches: [
        { image: 'page073_img01_632x1050.jpeg', colorName: 'CANVAS', specs: ['Semi-Opaque ASN-300'] },
        { image: 'page073_img02_632x1050.jpeg', colorName: 'BATIK', specs: ['Semi-Opaque ASN-800'] },
        { image: 'page074_img01_632x1050.jpeg', colorName: 'SCULPT', specs: ['Semi-Opaque ASN-400'] },
        { image: 'page074_img02_632x1050.jpeg', colorName: 'CALLIGRAPHY', specs: ['Semi-Opaque ASN-900'] },
      ],
    },
    {
      name: 'Lisban',
      swatches: [
        { image: 'page075_img01_632x1050.jpeg', colorName: 'COBBLESTONE', specs: ['Semi-Opaque LSB-300'] },
        { image: 'page075_img02_632x1050.jpeg', colorName: 'COACH', specs: ['Semi-Opaque LSB-800'] },
        { image: 'page076_img01_632x1050.jpeg', colorName: 'SUNSET', specs: ['Semi-Opaque LSB-400'] },
        { image: 'page076_img02_632x1050.jpeg', colorName: 'CARRIAGE', specs: ['Semi-Opaque LSB-401'] },
        { image: 'page077_img01_632x1050.jpeg', colorName: 'HERITAGE', specs: ['Semi-Opaque LSB-900'] },
      ],
    },
    {
      name: 'Primitive',
      swatches: [
        { image: 'page078_img01_632x1050.jpeg', colorName: 'WHITEWASHED', specs: ['Semi-Opaque PM-206'] },
        { image: 'page078_img02_632x1050.jpeg', colorName: 'CONCRETE', specs: ['Semi-Opaque PM-205'] },
        { image: 'page079_img01_632x1050.jpeg', colorName: 'VINTAGE', specs: ['Semi-Opaque PM-300'] },
        { image: 'page079_img02_632x1050.jpeg', colorName: 'WEATHERVANE', specs: ['Semi-Opaque PM-404'] },
      ],
    },
    {
      name: 'Entwine',
      swatches: [
        { image: 'page080_img01_632x1050.jpeg', colorName: 'WHITE OAK', specs: ['Semi-Opaque EN-200'] },
        { image: 'page080_img02_632x1050.jpeg', colorName: 'BIRCH', specs: ['Semi-Opaque EN-802'] },
        { image: 'page081_img01_632x1050.jpeg', colorName: 'BRANCH', specs: ['Semi-Opaque EN-302'] },
        { image: 'page081_img02_632x1050.jpeg', colorName: 'TWIG', specs: ['Semi-Opaque EN-351'] },
      ],
    },
    {
      name: 'Onslow',
      swatches: [
        { image: 'page082_img01_632x1050.jpeg', colorName: 'RAFFIA', specs: ['Semi-Opaque ON-439'] },
        { image: 'page082_img02_632x1050.jpeg', colorName: 'PALM', specs: ['Semi-Opaque ON-701'] },
        { image: 'page083_img01_632x1050.jpeg', colorName: 'SIENNA', specs: ['Semi-Opaque ON-422'] },
        { image: 'page083_img02_632x1050.jpeg', colorName: 'RE-BARK', specs: ['Semi-Opaque ON-402'] },
        { image: 'page084_img01_632x1050.jpeg', colorName: 'SLATE', specs: ['Semi-Opaque ON-601'] },
      ],
    },
  ],

  cellSize: null,
  opacity: null,
  edgeBanding: null,
  liner: null,
}
