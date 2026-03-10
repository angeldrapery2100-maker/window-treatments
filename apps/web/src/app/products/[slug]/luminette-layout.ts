/**
 * Luminette® Privacy Sheers - Layout data
 * Beautiful sheer draperies with modern-day privacy control
 * 71 pages, swatch pages 31-71 (10 fabric collections, 81 colors)
 */

import type { SectionLayout, CardItem, ImageLabel, SwatchCollection, ControlSystemPanel } from './applause-layout'

export interface LuminetteLayout {
  slug: string
  name: string
  description: string
  heroImage: string
  heroLabel: string
  sections: SectionLayout[]
  gallery: { image: string; text: string; label: string }[]
  vaneSize: SectionLayout | null
  hardwareColors: SectionLayout | null
  swatchCollections: SwatchCollection[]
}

export const luminetteLayout: LuminetteLayout = {
  slug: 'luminette',
  name: 'Luminette® Privacy Sheers',
  description: 'Beautiful sheer draperies with modern-day privacy control. Luminette® Privacy Sheers feature a sleek, modern design that perfectly fits wide expanses and floor-to-ceiling windows.',

  // Hero - page 5 wide scene
  heroImage: 'page008_img01_3080x1505.jpeg',
  heroLabel: '',

  sections: [
    // ──── Scene Pairs (pages 6-13) ────
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page006_img02_2589x1505.jpeg',
          text: '',
          label: '',
        },
        {
          image: 'page007_img01_3080x1505.jpeg',
          text: 'Luminette® Privacy Sheers feature a sleek, modern design that perfectly fits wide expanses and floor-to-ceiling windows.',
          label: 'Luminette® and Silhouette® Fabric Solar Screen™ · Color Micromoon\nOperating System PowerView® Automation',
        },

        {
          image: 'page009_img01_3080x1505.jpeg',
          text: 'Choose from an array of on-trend colors and textures that look gorgeous on large panes of glass.',
          label: 'Fabric Bristol™ · Color Tahitian Vanilla\nOperating System PowerView® Automation',
        },
        {
          image: 'page010_img01_2855x1505.jpeg',
          text: 'Available with every Luminette® fabric, a room-darkening option provides enhanced privacy when vanes are closed.',
          label: 'Fabric Terra™ · Color Wild Rice\nOperating System PowerView® Automation',
        },
        {
          image: 'page011_img01_3079x1505.jpeg',
          text: 'With The Whole House Solution™, superior color coordination between Luminette® fabrics and Silhouette® Window Shadings lets you easily select vertical and horizontal window treatments for one space.',
          label: 'Luminette® and Silhouette® Fabric Originale™ · Color White Diamond\nOperating System PowerView® Automation',
        },
      ],
    },

    // ──── Benefits - page 14 (6 cards, 3x2) ────
    {
      type: 'card-grid',
      title: 'Benefits',
      cols: 3,
      cards: [
        { image: 'page014_img02_755x455.jpeg', title: 'Innovative Vertical Design', desc: 'Luminette® sheers fuse the functionality of vertical blinds with the drama of drapery, providing stunning dimension and privacy.' },
        { image: 'page014_img01_755x455.jpeg', title: 'Superior Light Control', desc: 'Create the preferred amount of light in a room with rotating fabric vanes that offer 180 degrees of control.' },
        { image: 'page014_img04_755x455.jpeg', title: 'Beautiful Light Diffusion', desc: 'Luminette sheers diffuse light to create a soft glow, keeping rooms looking and feeling comfortable, welcoming and serene.' },
        { image: 'page014_img06_755x455.jpeg', title: 'The Whole House Solution™', desc: 'Luminette fabrics coordinate with horizontal Silhouette®, Pirouette® and Vignette® shades for a unified look throughout the home.' },
        { image: 'page014_img03_755x455.jpeg', title: 'UV Protection with View-Through', desc: 'Luminette sheers offer unobstructed outdoor views and protect interior furnishings from intense sunlight.' },
        { image: 'page014_img05_755x455.jpeg', title: 'Expansive Fabric Collection', desc: 'With a large selection of fabrics and colors, Luminette sheers easily complement every interior design style.' },
      ],
    },

    // ──── Light Control - page 15 (1 scene + 3 comparison) ────
    {
      type: 'comparison-grid',
      title: 'Light Control and Privacy',
      cols: 3,
      items: [
        { image: 'page015_img02_755x455.jpeg', label: 'Light-Filtering Vanes (Open)', sublabel: 'When open, light-filtering fabric vanes let in natural sunlight and maximize view-through.' },
        { image: 'page015_img03_755x455.jpeg', label: 'Light-Filtering Vanes (Closed)', sublabel: 'When closed, light-filtering fabric vanes offer soft light diffusion.' },
        { image: 'page015_img04_755x455.jpeg', label: 'Room-Darkening Vanes (Closed)', sublabel: 'When closed, room-darkening fabric vanes block most light and offer enhanced privacy.' },
      ],
    },

    // ──── PowerView + Operating Systems - pages 16-17 ────
    {
      type: 'control-systems',
      sceneImage: 'page017_img01_3077x1505.jpeg',
      sceneLabel: 'Fabric Bristol™ · Color Tahitian Vanilla\nOperating System PowerView® Automation',
      panels: [
        {
          title: 'PowerView® Automation',
          image: 'page016_img02_355x608.jpeg',
          features: [
            { title: 'Convenience', desc: 'Achieve your perfect light automatically — vanes close and fabric traverses' },
            { title: 'Privacy', desc: 'Schedule sheers to close whenever you prefer' },
            { title: 'Energy Efficiency', desc: 'Program sheers to be in the best positions throughout the day' },
            { title: 'Security', desc: 'Remote control gives the illusion that you\u2019re always home' },
            { title: 'Child Friendly', desc: 'Simple, cord-free operation' },
            { title: 'Hardwired', desc: 'For seamless installation, operation and maintenance' },
            { title: 'Voice Control', desc: 'Compatible with smart speakers and smart-home systems' },
          ],
          footnote: '*Some features require additional hardware and/or third-party equipment. Visit hunterdouglas.com for details.',
        },
        {
          title: 'Operating Systems',
          items: [
            { image: 'page016_img03_427x807.jpeg', title: 'Traveling Wand™', desc: 'Walk the wand to either side to open or close the sheer. Twist the wand to rotate vanes.' },
            { image: 'page016_img04_427x807.jpeg', title: 'Combination Wand/Cord', desc: 'Traverse the sheer and rotate vanes in a single, intuitive control. Redesigned for even easier, one-hand operation.' },
          ],
        },
      ],
    },

    // ──── Design Options - page 18 (4 cards) ────
    {
      type: 'card-grid',
      title: 'Design Options',
      cols: 4,
      cards: [
        { image: 'page018_img05_756x453.jpeg', title: 'Split Stack', desc: 'Sheers open from the center of the door or window and stack on both sides.' },
        { image: 'page018_img02_755x455.jpeg', title: 'Headrail Color', desc: 'Luminette® headrails are concealed by fabric, available in six colors.' },
        { image: 'page018_img03_752x455.jpeg', title: 'Accents by the Yard™', desc: 'Every Luminette fabric is offered as cut yardage, so you can create coordinating home accents like pillows and duvets.' },
        { image: 'page018_img04_755x451.jpeg', title: 'Side Stack', desc: 'Sheers open from the left or right side of the door or window and stack on one side.' },
      ],
    },

    // ──── Mounting Profiles - page 19 ────
    {
      type: 'mounting-grid',
      title: 'Mounting Profiles',
      rows: [
        {
          items: [
            { image: 'page019_img02_755x451.jpeg', label: 'Outside Mount' },
            { image: 'page019_img03_755x451.jpeg', label: 'Outside Mount Measured for Stackback (Open)' },
            { image: 'page019_img04_755x455.jpeg', label: 'Outside Mount Measured for Stackback (Stacked)' },
          ],
        },
        {
          items: [
            { image: 'page019_img06_753x453.jpeg', label: 'Wall-to-Wall / Floor-to-Ceiling Mount' },
            { image: 'page019_img05_755x454.jpeg', label: 'Inside Mount' },
          ],
        },
      ],
    },
  ],

  // ──── Gallery ────
  gallery: [
    { image: 'page005_img01_1955x1505.jpeg', text: '', label: '' },
    { image: 'page012_img01_3080x1505.jpeg', text: 'Pair Luminette® sheers with Pirouette® Window Shadings for a refined, sculptural aesthetic.', label: 'Luminette® and Pirouette® Fabric Stria™ · Color Sand Shimmer\nOperating System PowerView® Automation' },
    { image: 'page013_img01_2855x1505.jpeg', text: 'A sleekly engineered hardware system allows Luminette® sheers to open and close with ease.', label: 'Luminette® and Silhouette® Fabric Stria™ · Color Sand Shimmer\nOperating System PowerView® Automation' },
    { image: 'page017_img01_3077x1505.jpeg', text: '', label: 'Fabric Bristol™ · Color Tahitian Vanilla\nOperating System PowerView® Automation' },
    { image: 'page020_img01_1955x1505.jpeg', text: '', label: 'Fabric Originale™ · Color Radiant White\nOperating System PowerView® Automation' },
  ],

  // Vane Size removed per user request
  vaneSize: null,

  // ──── Hardware Colors - page 30 (6 colors) ────
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Luminette®\nPrivacy Sheers',
    items: [
      { image: 'page030_img01_306x306.jpeg', label: '126 White Diamond' },
      { image: 'page030_img02_306x306.jpeg', label: '437 Mushroom Sparkle' },
      { image: 'page030_img03_306x306.jpeg', label: '528 Bronze' },
      { image: 'page030_img04_306x306.jpeg', label: '530 Silver' },
      { image: 'page030_img05_306x306.jpeg', label: '534 Champagne' },
      { image: 'page030_img06_306x306.jpeg', label: '580 Graphite' },
    ],
  },

  // ──── Fabric Swatches (10 collections, 81 colors, NO chip overlays) ────
  swatchCollections: [
    // 1. Alustra® Calista™ (6 colors, pages 31-33)
    {
      name: 'Alustra® Calista™',
      swatches: [
        { image: 'page031_img01_1467x2405.jpeg', colorName: 'RADIANT QUARTZ', specs: ['Light Filtering K58-1105 (3½")', 'Room Darkening K59-1105 (3½")'] },
        { image: 'page031_img02_1467x2405.jpeg', colorName: 'SERENDIPITY', specs: ['Light Filtering K58-1110 (3½")', 'Room Darkening K59-1110 (3½")'] },
        { image: 'page032_img01_1467x2405.jpeg', colorName: 'SILVER WATERS', specs: ['Light Filtering K58-1109 (3½")', 'Room Darkening K59-1109 (3½")'] },
        { image: 'page032_img02_1467x2405.jpeg', colorName: 'MORNING SUN', specs: ['Light Filtering K58-1106 (3½")', 'Room Darkening K59-1106 (3½")'] },
        { image: 'page033_img01_1467x2405.jpeg', colorName: 'DANCING BLUSH', specs: ['Light Filtering K58-1108 (3½")', 'Room Darkening K59-1108 (3½")'] },
        { image: 'page033_img02_1467x2405.jpeg', colorName: 'PENNY PATH', specs: ['Light Filtering K58-1107 (3½")', 'Room Darkening K59-1107 (3½")'] },
      ],
    },
    // 2. Cambric Linen (6 colors, pages 34-36)
    {
      name: 'Cambric Linen',
      swatches: [
        { image: 'page034_img01_1467x2405.jpeg', colorName: 'LINDEN WHITE', specs: ['Light Filtering K38-1296 (3½")', 'Room Darkening K39-1296 (3½")'] },
        { image: 'page034_img02_1467x2405.jpeg', colorName: 'TRANQUIL WHITE', specs: ['Light Filtering K38-1297 (3½")', 'Room Darkening K39-1297 (3½")'] },
        { image: 'page035_img01_1467x2405.jpeg', colorName: 'COASTAL WAVE', specs: ['Light Filtering K38-1300 (3½")', 'Room Darkening K39-1300 (3½")'] },
        { image: 'page035_img02_1467x2405.jpeg', colorName: 'CORAL DUST', specs: ['Light Filtering K38-1298 (3½")', 'Room Darkening K39-1298 (3½")'] },
        { image: 'page036_img01_1467x2405.jpeg', colorName: 'CEDAR SAND', specs: ['Light Filtering K38-1299 (3½")', 'Room Darkening K39-1299 (3½")'] },
        { image: 'page036_img02_1467x2405.jpeg', colorName: 'COVE GRAY', specs: ['Light Filtering K38-1301 (3½")', 'Room Darkening K39-1301 (3½")'] },
      ],
    },
    // 3. Angelica™ (12 colors, pages 37-42)
    {
      name: 'Angelica™',
      swatches: [
        { image: 'page037_img01_1467x2405.jpeg', colorName: 'SNOW', specs: ['Light Filtering K1-101 (3½")', 'Room Darkening K6-101 (3½")'] },
        { image: 'page037_img02_1467x2405.jpeg', colorName: 'ANGEL WING', specs: ['Light Filtering K1-102 (3½")', 'Room Darkening K6-102 (3½")'] },
        { image: 'page038_img01_1467x2405.jpeg', colorName: 'SUGARED ALMOND', specs: ['Light Filtering K1-114 (3½")', 'Room Darkening K6-114 (3½")'] },
        { image: 'page038_img02_1467x2405.jpeg', colorName: 'FAWN', specs: ['Light Filtering K1-107 (3½")', 'Room Darkening K6-107 (3½")'] },
        { image: 'page039_img01_1467x2405.jpeg', colorName: 'IVORY VEIL', specs: ['Light Filtering K1-104 (3½")', 'Room Darkening K6-104 (3½")'] },
        { image: 'page039_img02_1467x2405.jpeg', colorName: 'SANDCASTLE', specs: ['Light Filtering K1-119 (3½")', 'Room Darkening K6-119 (3½")'] },
        { image: 'page040_img01_1467x2405.jpeg', colorName: 'OYSTERSHELL', specs: ['Light Filtering K1-154 (3½")', 'Room Darkening K6-154 (3½")'] },
        { image: 'page040_img02_1467x2405.jpeg', colorName: 'SHEER TAUPE', specs: ['Light Filtering K1-151 (3½")', 'Room Darkening K6-151 (3½")'] },
        { image: 'page041_img01_1467x2405.jpeg', colorName: 'ANTIQUE MIRROR', specs: ['Light Filtering K1-1041 (3½")', 'Room Darkening K6-1041 (3½")'] },
        { image: 'page041_img02_1467x2405.jpeg', colorName: 'BLUEBIRD DAY', specs: ['Light Filtering K1-1044 (3½")', 'Room Darkening K6-1044 (3½")'] },
        { image: 'page042_img01_1467x2405.jpeg', colorName: 'FOREST MIST', specs: ['Light Filtering K1-1043 (3½")', 'Room Darkening K6-1043 (3½")'] },
        { image: 'page042_img02_1467x2405.jpeg', colorName: 'BRONZE GLOW', specs: ['Light Filtering K1-1042 (3½")', 'Room Darkening K6-1042 (3½")'] },
      ],
    },
    // 4. Originale™ (12 colors, pages 43-48)
    {
      name: 'Originale™',
      swatches: [
        { image: 'page043_img01_1467x2405.jpeg', colorName: 'RADIANT WHITE', specs: ['Light Filtering K18-125 (3½")', 'Room Darkening K19-125 (3½")'] },
        // WHITE SAND (page043_img02) - image not in public folder, skipped
        { image: 'page044_img01_1467x2405.jpeg', colorName: 'WHITE DIAMOND', specs: ['Light Filtering K18-126 (3½")', 'Room Darkening K19-126 (3½")'] },
        { image: 'page044_img02_1467x2405.jpeg', colorName: 'LINEN FLIRT', specs: ['Light Filtering K18-127 (3½")', 'Room Darkening K19-127 (3½")'] },
        { image: 'page045_img01_1467x2405.jpeg', colorName: 'HONEY BEIGE', specs: ['Light Filtering K18-107 (3½")', 'Room Darkening K19-107 (3½")'] },
        { image: 'page045_img02_1467x2405.jpeg', colorName: 'FEATHER FANTASY', specs: ['Light Filtering K18-133 (3½")', 'Room Darkening K19-133 (3½")'] },
        { image: 'page046_img01_1467x2405.jpeg', colorName: 'AVIGNON', specs: ['Light Filtering K18-105 (3½")', 'Room Darkening K19-105 (3½")'] },
        { image: 'page046_img02_1467x2405.jpeg', colorName: 'TURTLEDOVE', specs: ['Light Filtering K18-116 (3½")', 'Room Darkening K19-116 (3½")'] },
        { image: 'page047_img01_1467x2405.jpeg', colorName: 'EVERLEIGH', specs: ['Light Filtering K18-1063 (3½")', 'Room Darkening K19-1063 (3½")'] },
        { image: 'page047_img02_1467x2405.jpeg', colorName: 'CLOUD', specs: ['Light Filtering K18-104 (3½")', 'Room Darkening K19-104 (3½")'] },
        { image: 'page048_img01_1467x2405.jpeg', colorName: 'PATINA GRAY', specs: ['Light Filtering K18-733 (3½")', 'Room Darkening K19-733 (3½")'] },
        { image: 'page048_img02_1467x2405.jpeg', colorName: 'HICKORY ASH', specs: ['Light Filtering K18-1057 (3½")', 'Room Darkening K19-1057 (3½")'] },
      ],
    },
    // 5. Stria™ (12 colors, pages 49-54) -- KEEP AS IS from original page mapping
    {
      name: 'Stria™',
      swatches: [
        { image: 'page049_img01_1467x2405.jpeg', colorName: 'PORCELAIN WHITE', specs: ['Light Filtering K5-501 (3½")', 'Room Darkening K8-501 (3½")'] },
        { image: 'page049_img02_1467x2405.jpeg', colorName: 'ALABASTER', specs: ['Light Filtering K5-502 (3½")', 'Room Darkening K8-502 (3½")'] },
        { image: 'page050_img01_1467x2405.jpeg', colorName: 'HARMONY', specs: ['Light Filtering K5-506 (3½")', 'Room Darkening K8-506 (3½")'] },
        { image: 'page050_img02_1467x2405.jpeg', colorName: 'ALMOND GLOW', specs: ['Light Filtering K5-507 (3½")', 'Room Darkening K8-507 (3½")'] },
        { image: 'page051_img01_1467x2405.jpeg', colorName: 'SPUN SUGAR', specs: ['Light Filtering K5-509 (3½")', 'Room Darkening K8-509 (3½")'] },
        { image: 'page051_img02_1467x2405.jpeg', colorName: 'SAND SHIMMER', specs: ['Light Filtering K5-572 (3½")', 'Room Darkening K8-572 (3½")'] },
        { image: 'page052_img01_1467x2405.jpeg', colorName: 'FRESH TAUPE', specs: ['Light Filtering K5-575 (3½")', 'Room Darkening K8-575 (3½")'] },
        { image: 'page052_img02_1467x2405.jpeg', colorName: 'MYSTIC BRONZE', specs: ['Light Filtering K5-576 (3½")', 'Room Darkening K8-576 (3½")'] },
        { image: 'page053_img01_1467x2405.jpeg', colorName: 'PEACEFUL SAGE', specs: ['Light Filtering K5-1045 (3½")', 'Room Darkening K8-1045 (3½")'] },
        { image: 'page053_img02_1467x2405.jpeg', colorName: 'PACIFICA BLUE', specs: ['Light Filtering K5-1046 (3½")', 'Room Darkening K8-1046 (3½")'] },
        { image: 'page054_img01_1467x2405.jpeg', colorName: 'SILVER SHINE', specs: ['Light Filtering K5-573 (3½")', 'Room Darkening K8-573 (3½")'] },
        { image: 'page054_img02_1467x2405.jpeg', colorName: 'BLACK ICE', specs: ['Light Filtering K5-1047 (3½")', 'Room Darkening K8-1047 (3½")'] },
      ],
    },
    // 6. Solar Screen™ (6 colors, pages 55-57)
    {
      name: 'Solar Screen™',
      swatches: [
        { image: 'page055_img01_1467x2405.jpeg', colorName: 'CIRRUS', specs: ['Light Filtering K30-331 (3½")', 'Room Darkening K31-331 (3½")'] },
        { image: 'page055_img02_1467x2405.jpeg', colorName: 'MICROMOON', specs: ['Light Filtering K30-1049 (3½")', 'Room Darkening K31-1049 (3½")'] },
        { image: 'page056_img01_1467x2405.jpeg', colorName: 'COSMIC DUST', specs: ['Light Filtering K30-1048 (3½")', 'Room Darkening K31-1048 (3½")'] },
        { image: 'page056_img02_1467x2405.jpeg', colorName: 'RICH EARTH', specs: ['Light Filtering K30-1050 (3½")', 'Room Darkening K31-1050 (3½")'] },
        { image: 'page057_img01_1467x2405.jpeg', colorName: 'THUNDERSHOWER', specs: ['Light Filtering K30-338 (3½")', 'Room Darkening K31-338 (3½")'] },
        { image: 'page057_img02_1467x2405.jpeg', colorName: 'PERFECT STORM', specs: ['Light Filtering K30-339 (3½")', 'Room Darkening K31-339 (3½")'] },
      ],
    },
    // 7. Terra™ (6 colors, pages 58-60)
    {
      name: 'Terra™',
      swatches: [
        { image: 'page058_img01_1467x2405.jpeg', colorName: 'MARBLE SLAB', specs: ['Light Filtering K40-407 (3½")', 'Room Darkening K41-407 (3½")'] },
        { image: 'page058_img02_1467x2405.jpeg', colorName: 'SAGEBRUSH', specs: ['Light Filtering K40-401 (3½")', 'Room Darkening K41-401 (3½")'] },
        { image: 'page059_img01_1467x2405.jpeg', colorName: 'WILD RICE', specs: ['Light Filtering K40-402 (3½")', 'Room Darkening K41-402 (3½")'] },
        { image: 'page059_img02_1467x2405.jpeg', colorName: 'ROSEMARY MEMORY', specs: ['Light Filtering K40-404 (3½")', 'Room Darkening K41-404 (3½")'] },
        { image: 'page060_img01_1467x2405.jpeg', colorName: 'ASPEN BARK', specs: ['Light Filtering K40-405 (3½")', 'Room Darkening K41-405 (3½")'] },
        { image: 'page060_img02_1467x2405.jpeg', colorName: 'BLUE AGAVE', specs: ['Light Filtering K40-406 (3½")', 'Room Darkening K41-406 (3½")'] },
      ],
    },
    // 8. Ella™ (6 colors, pages 61-63)
    {
      name: 'Ella™',
      swatches: [
        { image: 'page061_img01_1467x2405.jpeg', colorName: 'APRIL SNOW', specs: ['Light Filtering K43-411 (3½")', 'Room Darkening K44-411 (3½")'] },
        { image: 'page061_img02_1467x2405.jpeg', colorName: 'PERLA', specs: ['Light Filtering K43-1124 (3½")', 'Room Darkening K44-1124 (3½")'] },
        { image: 'page062_img01_1467x2405.jpeg', colorName: 'SONGBIRD', specs: ['Light Filtering K43-1122 (3½")', 'Room Darkening K44-1122 (3½")'] },
        { image: 'page062_img02_1467x2405.jpeg', colorName: 'ENDLESS GRAY', specs: ['Light Filtering K43-1123 (3½")', 'Room Darkening K44-1123 (3½")'] },
        { image: 'page063_img01_1467x2405.jpeg', colorName: 'ETERNAL', specs: ['Light Filtering K43-416 (3½")', 'Room Darkening K44-416 (3½")'] },
        { image: 'page063_img02_1467x2405.jpeg', colorName: 'NIGHTFALL', specs: ['Light Filtering K43-1121 (3½")', 'Room Darkening K44-1121 (3½")'] },
      ],
    },
    // 9. Bristol™ (9 colors, pages 64-68)
    {
      name: 'Bristol™',
      swatches: [
        { image: 'page064_img01_1467x2405.jpeg', colorName: 'OPTIMISTIC', specs: ['Light Filtering K32-1085 (3½")', 'Room Darkening K33-1085 (3½")'] },
        { image: 'page064_img02_1467x2405.jpeg', colorName: 'TAHITIAN VANILLA', specs: ['Light Filtering K32-1086 (3½")', 'Room Darkening K33-1086 (3½")'] },
        { image: 'page065_img01_1467x2405.jpeg', colorName: 'ENGLISH CHESTNUT', specs: ['Light Filtering K32-1087 (3½")', 'Room Darkening K33-1087 (3½")'] },
        { image: 'page065_img02_1467x2405.jpeg', colorName: 'IVYSTONE', specs: ['Light Filtering K32-1088 (3½")', 'Room Darkening K33-1088 (3½")'] },
        { image: 'page066_img01_1467x2405.jpeg', colorName: 'TEA KETTLE', specs: ['Light Filtering K32-1089 (3½")', 'Room Darkening K33-1089 (3½")'] },
        { image: 'page066_img02_1467x2405.jpeg', colorName: 'WOODBINE', specs: ['Light Filtering K32-1090 (3½")', 'Room Darkening K33-1090 (3½")'] },
        { image: 'page067_img01_1467x2405.jpeg', colorName: 'WOOL SWEATER', specs: ['Light Filtering K32-1091 (3½")', 'Room Darkening K33-1091 (3½")'] },
        { image: 'page067_img02_1467x2405.jpeg', colorName: 'DISCOVERY', specs: ['Light Filtering K32-1092 (3½")', 'Room Darkening K33-1092 (3½")'] },
        { image: 'page068_img01_1467x2405.jpeg', colorName: 'OTTER', specs: ['Light Filtering K32-1114 (3½")', 'Room Darkening K33-1114 (3½")'] },
      ],
    },
    // 10. Linéa™ (6 colors, pages 69-71)
    {
      name: 'Linéa™',
      swatches: [
        { image: 'page069_img01_1467x2405.jpeg', colorName: 'WINTER FROST', specs: ['Light Filtering K2-121 (3½")', 'Room Darkening K7-121 (3½")'] },
        { image: 'page069_img02_1467x2405.jpeg', colorName: 'WHISPER WHITE', specs: ['Light Filtering K2-122 (3½")', 'Room Darkening K7-122 (3½")'] },
        { image: 'page070_img01_1467x2405.jpeg', colorName: 'MARBLE', specs: ['Light Filtering K2-203 (3½")', 'Room Darkening K7-203 (3½")'] },
        { image: 'page070_img02_1467x2405.jpeg', colorName: 'ANTIQUE LINEN', specs: ['Light Filtering K2-130 (3½")', 'Room Darkening K7-130 (3½")'] },
        { image: 'page071_img01_1467x2405.jpeg', colorName: 'SILVER WASH', specs: ['Light Filtering K2-1053 (3½")', 'Room Darkening K7-1053 (3½")'] },
        { image: 'page071_img02_1467x2405.jpeg', colorName: 'TIMELESS TAUPE', specs: ['Light Filtering K2-1052 (3½")', 'Room Darkening K7-1052 (3½")'] },
      ],
    },
  ],
}
