/**
 * Nantucket™ Window Shadings - Product Layout Data
 * Rebuilt to strictly follow Silhouette layout structure
 */

import type { ProductLayout, SectionLayout, SwatchCollection } from './types'

export const nantucketLayout: ProductLayout = {
  slug: 'nantucket',
  name: 'Nantucket\u2122 Window Shadings',
  description: 'Nantucket Window Shadings feature on-trend colors and patterns that complement a variety of interior styles, with S-shaped vanes that provide UV protection and view-through while operating with innovative systems for smooth control.',

  // Hero - page 2 (2105x1505)
  heroImage: 'page002_img01_2105x1505.jpeg',
  heroLabel: 'Nantucket\u2122 Window Shadings',

  sections: [
    // ──── Scene Pairs: 6 scene images ────
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page006_img01_3905x1505.jpeg',
          text: 'Nantucket\u2122 shadings transform your space with on-trend fabrics and colors, offering a streamlined collection of beautiful and durable options.',
          label: 'Fabric Centre Park\u2122 Color Cambria | Operating System UltraGlide\u00ae',
        },
        {
          image: 'page009_img01_3905x1505.jpeg',
          text: 'Available in a range of fabric styles, Nantucket\u2122 shadings provide the perfect balance of light, privacy and outdoor views.',
          label: 'Fabric Brant Point\u2122 Color Reyes | Operating System LiteRise\u00ae/PowerView\u00ae Automation',
        },
        {
          image: 'page008_img01_3080x1505.jpeg',
          text: 'Nantucket\u2122 Window Shadings with UltraGlide\u00ae operate with a single retractable wand for enhanced child safety.',
          label: '',
        },
        {
          image: 'page011_img01_3080x1505.jpeg',
          text: 'Nantucket\u2122 shadings provide UV protection and view-through with special S-shaped vanes positioned between two fabric panels.',
          label: '',
        },
        {
          image: 'page012_img01_3079x1505.jpeg',
          text: 'Choose light-dimming Nantucket\u2122 fabric to create a comfortable, private retreat in any room of your home.',
          label: 'Fabric Misty Harbor\u2122 Color Beach Shore | Operating System SoftTouch\u00ae Motorization',
        },
        {
          image: 'page013_img01_3080x1505.jpeg',
          text: 'Effortlessly enjoy your perfect light and privacy with PowerView\u00ae Automation, which moves your shadings to the perfect position.',
          label: '',
        },
      ],
    },

    // ──── Benefits - page 15 (2×2 grid) ────
    {
      type: 'card-grid',
      title: 'Benefits',
      cols: 2,
      cards: [
        { image: 'page015_img02_755x455.jpeg', title: 'Concise Collection', desc: 'Easily find your perfect Nantucket\u2122 shading with a streamlined offering of beautiful and durable fabrics and colors.' },
        { image: 'page015_img03_755x455.jpeg', title: 'Customizable Light Control', desc: 'Fabric vanes tilt to achieve the preferred amount of illumination, whether it\\\'s a well-lit space or a room with a softer brilliance.' },
        { image: 'page015_img04_755x455.jpeg', title: 'Daytime Privacy', desc: 'During the day, the rear sheer deflects light to the outside and obscures views from the street into your home.' },
        { image: 'page015_img05_755x455.jpeg', title: 'UV Protection with View-Through', desc: 'Nantucket shadings provide outdoor views while protecting flooring, furniture and d\u00e9cor from the sun\\\'s harmful UV rays.' },
      ],
    },

    // ──── Light Control - page 16 (comparison-grid, 3 items) ────
    {
      type: 'comparison-grid',
      title: 'Light Control',
      cols: 3,
      items: [
        { image: 'page016_img02_755x455.jpeg', label: 'Translucent Fabrics', sublabel: 'Create a soft glow' },
        { image: 'page016_img03_755x455.jpeg', label: 'Light-Dimming Fabric', sublabel: 'Filters more light' },
        { image: 'page016_img04_755x455.jpeg', label: 'A Deux\u2122 Room-Darkening', sublabel: 'Blocks most incoming light' },
      ],
    },

    // ──── Design Options - page 19 (3×2 grid) ────
    {
      type: 'card-grid',
      title: 'Design Options',
      cols: 3,
      cards: [
        { image: 'page019_img02_755x455.jpeg', title: 'Palette\u00ae Fabric-Covered Headrail', desc: 'Upgrade to create a uniform look with a headrail wrapped in color-coordinated fabric.' },
        { image: 'page019_img03_755x455.jpeg', title: 'Two-On-One Headrail', desc: 'For larger windows, two independently operated shadings can share the same headrail. Available with EasyRise\u2122, LiteRise\u00ae and UltraGlide\u00ae operating systems.' },
        { image: 'page019_img04_755x455.jpeg', title: 'A Deux\u2122', desc: 'The dual roller system features a translucent shading in the front and a room-darkening panel in the back. Comes standard with Palette\u00ae Fabric-Covered Headrail.' },
        { image: 'page019_img05_755x455.jpeg', title: 'Specialty Shapes', desc: 'Nantucket\u2122 shadings can accommodate shapes such as arches and angles. All specialty shapes are non-operable.' },
        { image: 'page019_img06_755x455.jpeg', title: 'Tilt Only', desc: 'Best for French doors or narrow windows, this option keeps the Nantucket\u2122 shading lowered but allows vanes to tilt open and closed.' },
        { image: 'page019_img07_759x468.jpeg', title: 'Magnetic Hold-Down Brackets', desc: 'Secure Nantucket shadings on French doors or sidelight applications with magnetic hold-down brackets to prevent movement of the bottom rail.' },
      ],
    },

    // ──── Operating Systems - pages 17-18 (control-systems) ────
    {
      type: 'control-systems',
      sceneImage: 'page017_img01_1130x1505.jpeg',
      sceneLabel: '',
      panels: [
        {
          title: 'PowerView\u00ae Automation',
          image: 'page017_img04_355x608.jpeg',
          features: [
            { title: 'Convenience', desc: 'Achieve your perfect light automatically' },
            { title: 'Privacy', desc: 'Schedule shadings to close whenever you prefer' },
            { title: 'Energy Efficiency', desc: 'Program shadings to be in the best positions throughout the day' },
            { title: 'Security', desc: 'Remote control gives the illusion that you\\\'re always home' },
            { title: 'Child Friendly', desc: 'Simple, cord-free operation' },
          ],
        },
        {
          title: 'Operating Systems',
          items: [
            { image: 'page017_img02_448x467.jpeg', title: 'SoftTouch\u00ae Motorization', desc: 'A battery-operated, cordless system. Gently pull down on the wand to lower shadings, or lightly push up to raise them.' },
            { image: 'page017_img03_440x459.jpeg', title: 'UltraGlide\u00ae', desc: 'A single retractable wand for enhanced child safety. With one click, the fabric panel drops and the vanes open.' },
            { image: 'page017_img05_436x455.jpeg', title: 'LiteRise\u00ae', desc: 'Adjust shadings with a light touch on the handle. Pull down to lower; push up to raise.' },
            { image: 'page017_img06_446x464.jpeg', title: 'EasyRise\u2122', desc: 'A continuous cord loop system raises and lowers the shading by simply pulling on the cord.' },
          ],
        },
      ],
    },

    // ──── Mounting Profiles - page 20 (2 rows × 3 items) ────
    {
      type: 'mounting-grid',
      title: 'Mounting Profiles',
      rows: [
        {
          items: [
            { image: 'page020_img02_455x455.jpeg', label: 'Classic Headrail' },
            { image: 'page020_img03_455x455.jpeg', label: 'Partially Recessed' },
            { image: 'page020_img04_455x455.jpeg', label: 'Outside Mount' },
          ],
        },
        {
          items: [
            { image: 'page020_img05_455x455.jpeg', label: 'A Deux\u2122 Headrail' },
            { image: 'page020_img06_455x455.jpeg', label: 'Partially Recessed' },
            { image: 'page020_img07_455x455.jpeg', label: 'Outside Mount' },
          ],
        },
      ],
    },
  ],

  // ──── Gallery (scene images not used in scene-pair) ────
  gallery: [
    { image: 'page005_img01_1955x1505.jpeg', text: '', label: '' },
    { image: 'page007_img01_3080x1505.jpeg', text: '', label: '' },
    { image: 'page010_img01_3080x1505.jpeg', text: '', label: '' },
    { image: 'page014_img01_3080x1505.jpeg', text: '', label: '' },
    { image: 'page018_img01_3080x1505.jpeg', text: '', label: '' },
    { image: 'page021_img01_1953x1505.jpeg', text: '', label: '' },
    { image: 'page023_img01_3010x2428.jpeg', text: '', label: '' },
    { image: 'page024_img01_3010x3005.jpeg', text: '', label: '' },
  ],

  // ──── Hardware Colors - page 28 (22 items, 306x306) ────
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Nantucket\u2122\nWindow Shadings',
    items: [
      { image: 'page028_img01_306x306.jpeg', label: '133 Feather Fantasy' },
      { image: 'page028_img02_306x306.jpeg', label: '180 Dove Gray' },
      { image: 'page028_img03_306x306.jpeg', label: '276 Silverado' },
      { image: 'page028_img04_306x306.jpeg', label: '320 Rich Cream' },
      { image: 'page028_img05_306x306.jpeg', label: '329 Summer Linen' },
      { image: 'page028_img06_306x306.jpeg', label: '370 Slate' },
      { image: 'page028_img07_306x306.jpeg', label: '405 Gray Flannel' },
      { image: 'page028_img08_306x306.jpeg', label: '426 Squirrel Gray' },
      { image: 'page028_img09_306x306.jpeg', label: '450 Skyline' },
      { image: 'page028_img10_306x306.jpeg', label: '550 Ripe Pear' },
      { image: 'page028_img11_306x306.jpeg', label: '551 Worn Leather' },
      { image: 'page028_img12_306x306.jpeg', label: '609 Falcon Gray' },
      { image: 'page028_img13_306x306.jpeg', label: '651 Duchess Gray' },
      { image: 'page028_img14_306x306.jpeg', label: '656 Golden Straw' },
      { image: 'page028_img15_306x306.jpeg', label: '658 Tan Tango' },
      { image: 'page028_img16_306x306.jpeg', label: '661 White Tiara' },
      { image: 'page028_img17_306x306.jpeg', label: '669 Beijing Gray' },
      { image: 'page028_img18_306x306.jpeg', label: '689 Ash' },
      { image: 'page028_img19_306x306.jpeg', label: '785 Aspen White' },
      { image: 'page028_img20_306x306.jpeg', label: '862 Gardenia White' },
      { image: 'page028_img21_306x306.jpeg', label: '879 Pearl Gray' },
      { image: 'page028_img22_306x306.jpeg', label: '885 Flex White' },
    ],
  },

  // ──── Fabric Swatches (9 collections, tall images + chip) ────
  swatchCollections: [
    {
      name: 'Centre Park\u2122',
      swatches: [
        { image: 'page029_img01_631x1091.jpeg', chip: 'page029_img03_304x304.jpeg', colorName: 'ORION WHITE', specs: ['Translucent N83-1127'] },
        { image: 'page029_img02_631x1091.jpeg', chip: 'page029_img04_304x304.jpeg', colorName: 'GLACIER ICE', specs: ['Translucent N83-1125'] },
        { image: 'page030_img01_631x1091.jpeg', chip: 'page030_img03_304x304.jpeg', colorName: 'ILLUMINATION', specs: ['Translucent N83-1128'] },
        { image: 'page030_img02_631x1091.jpeg', chip: 'page030_img04_304x304.jpeg', colorName: 'HIMALAYAN', specs: ['Translucent N83-1126'] },
        { image: 'page031_img01_631x1091.jpeg', chip: 'page031_img03_304x304.jpeg', colorName: 'SIENNA SAND', specs: ['Translucent N83-1129'] },
        { image: 'page031_img02_631x1091.jpeg', chip: 'page031_img04_304x304.jpeg', colorName: 'WINDSOR GRAY', specs: ['Translucent N83-1130'] },
        { image: 'page032_img01_631x1091.jpeg', chip: 'page032_img03_304x304.jpeg', colorName: 'CAMBRIA', specs: ['Translucent N83-1131'] },
        { image: 'page032_img02_631x1091.jpeg', chip: 'page032_img04_304x304.jpeg', colorName: 'AMANTE', specs: ['Translucent N83-1132'] },
      ],
    },
    {
      name: 'Parksley\u2122',
      swatches: [
        { image: 'page033_img01_631x1091.jpeg', chip: 'page033_img03_304x304.jpeg', colorName: 'PILOT', specs: ['Translucent N82-1067'] },
        { image: 'page033_img02_631x1091.jpeg', chip: 'page033_img04_304x304.jpeg', colorName: 'BONAIRE', specs: ['Translucent N82-1068'] },
        { image: 'page034_img01_631x1091.jpeg', chip: 'page034_img03_304x304.jpeg', colorName: 'AMBER LIGHT', specs: ['Translucent N82-1069'] },
        { image: 'page034_img02_631x1091.jpeg', chip: 'page034_img04_304x304.jpeg', colorName: 'CARAWAY', specs: ['Translucent N82-1070'] },
        { image: 'page035_img01_631x1091.jpeg', chip: 'page035_img03_304x304.jpeg', colorName: 'PINEWOOD', specs: ['Translucent N82-1071'] },
        { image: 'page035_img02_631x1091.jpeg', chip: 'page035_img04_304x304.jpeg', colorName: 'ELEMENT', specs: ['Translucent N82-1072'] },
        { image: 'page036_img01_631x1091.jpeg', chip: 'page036_img03_304x304.jpeg', colorName: 'RIVER RIDGE', specs: ['Translucent N82-1073'] },
        { image: 'page036_img02_631x1091.jpeg', chip: 'page036_img04_304x304.jpeg', colorName: 'MASON', specs: ['Translucent N82-1074'] },
      ],
    },
    {
      name: 'Front Street\u2122',
      swatches: [
        { image: 'page037_img01_631x1091.jpeg', chip: 'page037_img03_304x304.jpeg', colorName: 'PICKET FENCE', specs: ['Translucent N21-201'] },
        { image: 'page037_img02_631x1091.jpeg', chip: 'page037_img04_304x304.jpeg', colorName: 'REGATTA WHITE', specs: ['Translucent N21-213'] },
        { image: 'page038_img01_631x1091.jpeg', chip: 'page038_img03_304x304.jpeg', colorName: 'SUMMER LINEN', specs: ['Translucent N21-204'] },
        { image: 'page038_img02_631x1091.jpeg', chip: 'page038_img04_304x304.jpeg', colorName: 'COTTAGE CREAM', specs: ['Translucent N21-205'] },
        { image: 'page039_img01_631x1091.jpeg', chip: 'page039_img03_304x304.jpeg', colorName: 'WICKER BASKET', specs: ['Translucent N21-203'] },
        { image: 'page039_img02_631x1091.jpeg', chip: 'page039_img04_304x304.jpeg', colorName: 'DECK CHAIR', specs: ['Translucent N21-226'] },
        { image: 'page040_img01_631x1091.jpeg', chip: 'page040_img03_304x304.jpeg', colorName: 'HIDDEN COVE', specs: ['Translucent N21-1030'] },
        { image: 'page040_img02_631x1091.jpeg', chip: 'page040_img04_304x304.jpeg', colorName: 'MOSS ROSE', specs: ['Translucent N21-1033'] },
        { image: 'page041_img01_631x1091.jpeg', chip: 'page041_img03_304x304.jpeg', colorName: 'RUSTIC OAK', specs: ['Translucent N21-1031'] },
        { image: 'page041_img02_631x1091.jpeg', chip: 'page041_img04_304x304.jpeg', colorName: 'ENCHANTED', specs: ['Translucent N21-1032'] },
        { image: 'page042_img01_631x1091.jpeg', chip: 'page042_img03_304x304.jpeg', colorName: 'BEACH SHORE', specs: ['Translucent N21-1054'] },
        { image: 'page042_img02_631x1091.jpeg', chip: 'page042_img04_304x304.jpeg', colorName: 'OYSTER', specs: ['Translucent N21-243'] },
      ],
    },
    {
      name: 'Misty Harbor\u2122',
      swatches: [
        { image: 'page043_img01_631x1091.jpeg', chip: 'page043_img03_304x304.jpeg', colorName: 'PICKET FENCE', specs: ['Light Dimming N23-201'] },
        { image: 'page043_img02_631x1091.jpeg', chip: 'page043_img04_304x304.jpeg', colorName: 'REGATTA WHITE', specs: ['Light Dimming N23-213'] },
        { image: 'page044_img01_631x1091.jpeg', chip: 'page044_img03_304x304.jpeg', colorName: 'SUMMER LINEN', specs: ['Light Dimming N23-204'] },
        { image: 'page044_img02_631x1091.jpeg', chip: 'page044_img04_304x304.jpeg', colorName: 'COTTAGE CREAM', specs: ['Light Dimming N23-205'] },
        { image: 'page045_img01_631x1091.jpeg', chip: 'page045_img03_304x304.jpeg', colorName: 'WICKER BASKET', specs: ['Light Dimming N23-203'] },
        { image: 'page045_img02_631x1091.jpeg', chip: 'page045_img04_304x304.jpeg', colorName: 'DECK CHAIR', specs: ['Light Dimming N23-226'] },
        { image: 'page046_img01_631x1091.jpeg', chip: 'page046_img03_304x304.jpeg', colorName: 'HIDDEN COVE', specs: ['Light Dimming N23-1030'] },
        { image: 'page046_img02_631x1091.jpeg', chip: 'page046_img04_304x304.jpeg', colorName: 'MOSS ROSE', specs: ['Light Dimming N23-1033'] },
        { image: 'page047_img01_631x1091.jpeg', chip: 'page047_img03_304x304.jpeg', colorName: 'RUSTIC OAK', specs: ['Light Dimming N23-1031'] },
        { image: 'page047_img02_631x1091.jpeg', chip: 'page047_img04_304x304.jpeg', colorName: 'ENCHANTED', specs: ['Light Dimming N23-1032'] },
        { image: 'page048_img01_631x1091.jpeg', chip: 'page048_img03_304x304.jpeg', colorName: 'BEACH SHORE', specs: ['Light Dimming N23-1054'] },
        { image: 'page048_img02_631x1091.jpeg', chip: 'page048_img04_304x304.jpeg', colorName: 'OYSTER', specs: ['Light Dimming N23-243'] },
      ],
    },
    {
      name: 'Brant Point\u2122',
      swatches: [
        { image: 'page049_img01_631x1091.jpeg', chip: 'page049_img03_304x304.jpeg', colorName: 'HATTERAS', specs: ['Translucent N37-331'] },
        { image: 'page049_img02_631x1091.jpeg', chip: 'page049_img04_304x304.jpeg', colorName: 'SAGINAW', specs: ['Translucent N37-332'] },
        { image: 'page050_img01_631x1091.jpeg', chip: 'page050_img03_304x304.jpeg', colorName: 'BRADDOCK', specs: ['Translucent N37-333'] },
        { image: 'page050_img02_631x1091.jpeg', chip: 'page050_img04_304x304.jpeg', colorName: 'EDDYSTONE', specs: ['Translucent N37-334'] },
        { image: 'page051_img01_631x1091.jpeg', chip: 'page051_img03_304x304.jpeg', colorName: 'EASTON', specs: ['Translucent N37-1034'] },
        { image: 'page051_img02_631x1091.jpeg', chip: 'page051_img04_304x304.jpeg', colorName: 'HYANNIS', specs: ['Translucent N37-337'] },
        { image: 'page052_img01_631x1091.jpeg', chip: 'page052_img03_304x304.jpeg', colorName: 'REYES', specs: ['Translucent N37-336'] },
        { image: 'page052_img02_631x1091.jpeg', chip: 'page052_img04_304x304.jpeg', colorName: 'HUDSON', specs: ['Translucent N37-1055'] },
      ],
    },
    {
      name: 'Sankaty\u2122',
      swatches: [
        { image: 'page053_img01_631x1091.jpeg', chip: 'page053_img03_304x304.jpeg', colorName: 'CALEDONIA', specs: ['Translucent N35-301'] },
        { image: 'page053_img02_631x1091.jpeg', chip: 'page053_img04_304x304.jpeg', colorName: 'BAYSIDE', specs: ['Translucent N35-302'] },
        { image: 'page054_img01_631x1091.jpeg', chip: 'page054_img03_304x304.jpeg', colorName: 'KIAWAH', specs: ['Translucent N35-303'] },
        { image: 'page054_img02_631x1091.jpeg', chip: 'page054_img04_304x304.jpeg', colorName: 'PRINCEVILLE', specs: ['Translucent N35-304'] },
        { image: 'page055_img01_631x1091.jpeg', chip: 'page055_img03_304x304.jpeg', colorName: 'BANDON', specs: ['Translucent N35-305'] },
        { image: 'page055_img02_631x1091.jpeg', chip: 'page055_img04_304x304.jpeg', colorName: 'SPYGLASS', specs: ['Translucent N35-306'] },
        { image: 'page056_img01_631x1091.jpeg', chip: 'page056_img03_304x304.jpeg', colorName: 'MERION', specs: ['Translucent N35-307'] },
        { image: 'page056_img02_631x1091.jpeg', chip: 'page056_img04_304x304.jpeg', colorName: 'PINEHURST', specs: ['Translucent N35-308'] },
      ],
    },
    {
      name: 'Boardwalk\u2122',
      swatches: [
        { image: 'page057_img01_631x1091.jpeg', chip: 'page057_img03_304x304.jpeg', colorName: 'PICKET FENCE', specs: ['Translucent N25-201'] },
        { image: 'page057_img02_631x1091.jpeg', chip: 'page057_img04_304x304.jpeg', colorName: 'REGATTA WHITE', specs: ['Translucent N25-213'] },
        { image: 'page058_img01_631x1091.jpeg', chip: 'page058_img03_304x304.jpeg', colorName: 'SUMMER LINEN', specs: ['Translucent N25-204'] },
        { image: 'page058_img02_631x1091.jpeg', chip: 'page058_img04_304x304.jpeg', colorName: 'DECK CHAIR', specs: ['Translucent N25-226'] },
        { image: 'page059_img01_631x1091.jpeg', chip: 'page059_img03_304x304.jpeg', colorName: 'WINTER ALMOND', specs: ['Translucent N25-1036'] },
        { image: 'page059_img02_631x1091.jpeg', chip: 'page059_img04_304x304.jpeg', colorName: 'SHUTTER GRAY', specs: ['Translucent N25-1035'] },
        { image: 'page060_img01_631x1091.jpeg', chip: 'page060_img03_304x304.jpeg', colorName: 'FOGGY MIST', specs: ['Translucent N25-234'] },
        { image: 'page060_img02_631x1091.jpeg', chip: 'page060_img04_304x304.jpeg', colorName: 'COASTAL NIGHT', specs: ['Translucent N25-1056'] },
      ],
    },
    {
      name: 'Sun Porch\u2122',
      swatches: [
        { image: 'page061_img01_631x1091.jpeg', chip: 'page061_img03_304x304.jpeg', colorName: 'PICKET FENCE', specs: ['Translucent N31-201'] },
        { image: 'page061_img02_631x1091.jpeg', chip: 'page061_img04_304x304.jpeg', colorName: 'REGATTA WHITE', specs: ['Translucent N31-213'] },
        { image: 'page062_img01_631x1091.jpeg', chip: 'page062_img03_304x304.jpeg', colorName: 'SUMMER LINEN', specs: ['Translucent N31-204'] },
        { image: 'page062_img02_631x1091.jpeg', chip: 'page062_img04_304x304.jpeg', colorName: 'WICKER BASKET', specs: ['Translucent N31-203'] },
        { image: 'page063_img01_631x1091.jpeg', chip: 'page063_img03_304x304.jpeg', colorName: 'DUSTY CEDAR', specs: ['Translucent N31-1038'] },
        { image: 'page063_img02_631x1091.jpeg', chip: 'page063_img04_304x304.jpeg', colorName: 'AUTUMN GRAY', specs: ['Translucent N31-1037'] },
        { image: 'page064_img01_631x1091.jpeg', chip: 'page064_img03_304x304.jpeg', colorName: 'RAINFALL', specs: ['Translucent N31-1039'] },
        { image: 'page064_img02_631x1091.jpeg', chip: 'page064_img04_304x304.jpeg', colorName: 'DARK HARBOR', specs: ['Translucent N31-1040'] },
      ],
    },
    {
      name: 'HDOrigins\u2122',
      swatches: [
        { image: 'page065_img01_631x1091.jpeg', chip: 'page065_img03_304x304.jpeg', colorName: 'ADDISON', specs: ['Translucent N84-1075'] },
        { image: 'page065_img02_631x1091.jpeg', chip: 'page065_img04_304x304.jpeg', colorName: 'PRESCOTT', specs: ['Translucent N84-1076'] },
        { image: 'page066_img01_631x1091.jpeg', chip: 'page066_img03_304x304.jpeg', colorName: 'CAPEHART', specs: ['Translucent N84-1077'] },
        { image: 'page066_img02_631x1091.jpeg', chip: 'page066_img04_304x304.jpeg', colorName: 'KELLER', specs: ['Translucent N84-1078'] },
        { image: 'page067_img01_631x1091.jpeg', chip: 'page067_img03_304x304.jpeg', colorName: 'BEAUFORT', specs: ['Translucent N84-1079'] },
        { image: 'page067_img02_631x1091.jpeg', chip: 'page067_img04_304x304.jpeg', colorName: 'WILLOW POINT', specs: ['Translucent N84-1080'] },
        { image: 'page068_img01_631x1091.jpeg', chip: 'page068_img03_304x304.jpeg', colorName: 'WESTMONT', specs: ['Translucent N84-1081'] },
        { image: 'page068_img02_631x1091.jpeg', chip: 'page068_img04_304x304.jpeg', colorName: 'TIDEWATER', specs: ['Translucent N84-1082'] },
        { image: 'page069_img01_631x1091.jpeg', chip: 'page069_img03_304x304.jpeg', colorName: 'ADDISON', specs: ['Light Dimming N85-1075'] },
        { image: 'page069_img02_631x1091.jpeg', chip: 'page069_img04_304x304.jpeg', colorName: 'PRESCOTT', specs: ['Light Dimming N85-1076'] },
        { image: 'page070_img01_631x1091.jpeg', chip: 'page070_img03_304x304.jpeg', colorName: 'CAPEHART', specs: ['Light Dimming N85-1077'] },
        { image: 'page070_img02_631x1091.jpeg', chip: 'page070_img04_304x304.jpeg', colorName: 'KELLER', specs: ['Light Dimming N85-1078'] },
        { image: 'page071_img01_631x1091.jpeg', chip: 'page071_img03_304x304.jpeg', colorName: 'BEAUFORT', specs: ['Light Dimming N85-1079'] },
        { image: 'page071_img02_631x1091.jpeg', chip: 'page071_img04_304x304.jpeg', colorName: 'WILLOW POINT', specs: ['Light Dimming N85-1080'] },
        { image: 'page072_img01_631x1091.jpeg', chip: 'page072_img03_304x304.jpeg', colorName: 'WESTMONT', specs: ['Light Dimming N85-1081'] },
        { image: 'page072_img02_631x1091.jpeg', chip: 'page072_img04_304x304.jpeg', colorName: 'TIDEWATER', specs: ['Light Dimming N85-1082'] },
      ],
    },
  ],

  cellSize: null,
  opacity: null,
  edgeBanding: null,
  liner: null,
}
