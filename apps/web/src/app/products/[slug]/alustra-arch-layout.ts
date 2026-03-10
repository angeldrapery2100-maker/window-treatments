/**
 * Alustra\u00ae Architectural Roller Shades - Product Layout Data
 * Rebuilt to strictly follow Silhouette layout structure
 */

import type { ProductLayout, SectionLayout, SwatchCollection } from './types'

export const alustraArchLayout: ProductLayout = {
  slug: 'alustra-architectural',
  name: 'Alustra\u00ae Architectural Shades',
  description: 'Alustra Architectural Shades combine the beauty of a traditional Roman shade with the minimal aesthetic of a roller shade. The unique architectural construction of fabric-wrapped curved battens adds dimension and structure with a modern vibe.',

  // Hero - page 6 (2903x1956) - wide ocean-view living room
  heroImage: 'page006_img01_2903x1956.jpeg',
  heroLabel: 'Fabric Amelia Color Dawn Drizzle | Operating System PowerView\u00ae Automation Deck 1',

  sections: [
    // \u2500\u2500\u2500\u2500 Scene Pairs: 6 scene images \u2500\u2500\u2500\u2500
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page006_img01_2903x1956.jpeg',
          text: 'Alustra\u00ae Architectural Shades create a stunning focal point, combining sophisticated fabric design with innovative shade structure.',
          label: 'Fabric Amelia Color Dawn Drizzle | Operating System PowerView\u00ae Automation Deck 1',
        },
        {
          image: 'page009_img02_1788x1957.jpeg',
          text: 'The linear aesthetic of these unique shade forms adds drama and elegance to even the sheerest fabric.',
          label: 'Fabric Brielle Color Ascot | Operating System PowerView\u00ae Automation Deck 1',
        },
        {
          image: 'page010_img01_1783x1953.jpeg',
          text: 'Architectural construction with fabric-wrapped curved battens adds structural beauty that unifies and defines the space.',
          label: 'Fabric Leo Color Earthy Umber | Operating System PowerView\u00ae Automation Deck 2',
        },
        {
          image: 'page012_img01_1795x1955.jpeg',
          text: 'The minimalistic appeal of a modern roller shade combined with the structural dimension of a Roman shade for a style redefined.',
          label: 'Fabric Rumi Color Moroccan Sand | Operating System PowerView\u00ae Automation Deck 2',
        },
        {
          image: 'page014_img01_1796x1955.jpeg',
          text: 'This unique shade form adds drama to even the sheerest fabric, creating architectural interest in any room.',
          label: 'Fabric Brielle Color Ascot | Operating System PowerView\u00ae Automation Deck 1',
        },
        {
          image: 'page016_img02_1797x1953.jpeg',
          text: 'Pair Design Studio\u2122 Side Panels with the structural Architectural Shades for a sophisticated, layered look.',
          label: 'Fabric Clayton Color Sugared Birch | Operating System PowerView\u00ae Automation Deck 1',
        },
        {
          image: 'page025_img01_3010x2427.jpeg',
          text: 'Floor-to-ceiling coverage with coordinated architectural shades creates a grand, unified design statement for expansive windows.',
          label: 'Fabric Finley Color Sepia | Operating System PowerView\u00ae Automation Deck 1',
        },
      ],
    },

    // \u2500\u2500\u2500\u2500 Benefits - page 17 (2\u00d72 grid) \u2500\u2500\u2500\u2500
    {
      type: 'card-grid',
      title: 'Benefits',
      cols: 2,
      cards: [
        { image: 'page017_img01_1055x680.jpeg', title: 'Innovative Shade Structure', desc: 'Combine the beauty of a traditional Roman shade with the minimal aesthetic of a roller shade. The unique, architectural construction of a fabric-wrapped curved batten adds dimension and structure with a modern vibe.' },
        { image: 'page017_img02_1057x681.jpeg', title: 'Superior Functionality', desc: 'Style meets performance. The proprietary Custom Clutch is available with cassette or bracket only. Elevate the style with the Exclusive Alustra Metal Custom Clutch Bracket and metal bead chain option.' },
        { image: 'page017_img03_1053x679.jpeg', title: 'Versatile Fabric Opacity', desc: 'Exclusive textural fabrics in distinctive hues are available from sheer to semi-opaque, providing light control and privacy options.' },
        { image: 'page017_img04_1056x680.jpeg', title: 'PowerView\u00ae Automation', desc: 'PowerView\u00ae Automation provides the ultimate in home automation, allowing you to control every shade with the touch of a button.' },
      ],
    },

    // \u2500\u2500\u2500\u2500 Fabric Opacity - page 18 (comparison-grid, 3 items) \u2500\u2500\u2500\u2500
    {
      type: 'comparison-grid',
      title: 'Fabric Opacity',
      cols: 3,
      items: [
        { image: 'page018_img02_731x598.jpeg', label: 'Sheer', sublabel: 'Opacity Rating 1 \u2013 Most Light, Least Privacy' },
        { image: 'page018_img03_731x598.jpeg', label: 'Semi-Sheer', sublabel: 'Opacity Rating 2 \u2013 Moderate Light, Some Privacy' },
        { image: 'page018_img04_731x598.jpeg', label: 'Semi-Opaque', sublabel: 'Opacity Rating 3 \u2013 Some Light, More Privacy' },
      ],
    },

    // \u2500\u2500\u2500\u2500 Design Options - page 21 (card-grid, 2\u00d72) \u2500\u2500\u2500\u2500
    {
      type: 'card-grid',
      title: 'Design Options',
      cols: 2,
      cards: [
        { image: 'page021_img01_471x319.jpeg', title: 'Large Square Cassette 2.0', desc: 'Conceals the fabric roll behind a modern, square fabric-wrapped cover.' },
        { image: 'page021_img02_471x319.jpeg', title: 'Valance', desc: 'The fabric-wrapped valance provides a structured and tailored profile. Valance height options: 6\u00bd", 8".' },
        { image: 'page021_img06_471x320.jpeg', title: 'Custom Clutch', desc: 'Proprietary system provides functionality, shade-to-shade lift uniformity, precise operation and a minimum light gap. Available in 12 finishes including two exclusive metal finishes.' },
        { image: 'page021_img09_472x319.jpeg', title: 'Bottom Bar', desc: 'Unique fabric-covered bottom bar designed to complement the contoured battens.' },
      ],
    },

    // \u2500\u2500\u2500\u2500 Operating Systems - pages 19-20 (control-systems) \u2500\u2500\u2500\u2500
    {
      type: 'control-systems',
      sceneImage: null,
      sceneLabel: '',
      panels: [
        {
          title: 'PowerView\u00ae Automation',
          image: 'page019_img05_217x459.jpeg',
          features: [
            { title: 'Convenience', desc: 'Achieve your perfect light automatically' },
            { title: 'Privacy', desc: 'Schedule shadings to close whenever you prefer' },
            { title: 'Energy Efficiency', desc: 'Program shadings to be in the best positions throughout the day' },
            { title: 'Security', desc: 'Remote control gives the illusion that you\'re always home' },
            { title: 'Voice Control', desc: 'Compatible with smart speakers and smart-home systems' },
          ],
        },
        {
          title: 'Operating Systems',
          items: [
            { image: 'page019_img02_471x319.jpeg', title: 'PowerView\u00ae Automation', desc: 'The ultimate in automated shade control with scheduling, voice control and app integration.' },
            { image: 'page019_img03_471x319.jpeg', title: 'PowerView\u00ae+ Hardwired', desc: 'A member of the PowerView family that utilizes a wired connection for reliable, always-on performance.' },
            { image: 'page021_img07_560x347.jpeg', title: 'Custom Clutch with Bracket', desc: 'The minimal profile of Custom Clutch Bracket provides a clean, modern appearance.' },
            { image: 'page021_img10_559x347.jpeg', title: 'Valance Mount', desc: 'Outside Mount Valance over Inside Mount Shade for a tailored look.' },
          ],
        },
      ],
    },

    // \u2500\u2500\u2500\u2500 Reverse Roll & Recessed - page 22 (comparison-grid) \u2500\u2500\u2500\u2500
    {
      type: 'comparison-grid',
      title: 'Reverse Roll & Reverse Roll Recessed',
      cols: 2,
      items: [
        { image: 'page022_img01_678x1295.jpeg', label: 'Standard Roll', sublabel: 'Fabric rolls off the front of the tube' },
        { image: 'page022_img02_678x1295.jpeg', label: 'Reverse Roll', sublabel: 'Fabric rolls off the back of the tube for a clean look' },
        { image: 'page022_img03_690x618.jpeg', label: 'Inside Mount', sublabel: 'Standard installation within the window frame' },
        { image: 'page022_img04_691x618.jpeg', label: 'Outside Mount', sublabel: 'Mounted outside the window frame for full coverage' },
        { image: 'page022_img05_690x618.jpeg', label: 'Recessed Mount', sublabel: 'Installed into the ceiling for a seamless appearance' },
        { image: 'page022_img06_690x618.jpeg', label: 'Reverse Roll Recessed', sublabel: 'Combined reverse roll with recessed mount for the most minimal profile' },
      ],
    },
  ],

  // \u2500\u2500\u2500\u2500 Gallery (scene images not used in scene-pair) \u2500\u2500\u2500\u2500
  gallery: [
    { image: 'page005_img01_1781x1956.jpeg', text: '', label: '' },
    { image: 'page008_img01_1794x1956.jpeg', text: '', label: 'Fabric Finley Color Misty Harbor' },
    { image: 'page009_img01_1797x1957.jpeg', text: '', label: '' },
    { image: 'page011_img02_1795x1955.jpeg', text: '', label: 'Fabric Finley Color Misty Harbor' },
    { image: 'page013_img02_1796x1955.jpeg', text: '', label: 'Fabric Landen Color Piccolo' },
    { image: 'page015_img01_1797x1957.jpeg', text: '', label: 'Fabric Jayce Color Weathered Oak' },
    { image: 'page023_img01_1775x1955.jpeg', text: '', label: '' },
    { image: 'page025_img01_3010x2427.jpeg', text: '', label: '' },
  ],

  // \u2500\u2500\u2500\u2500 Hardware Colors - page 28 (10 items, 306x306) \u2500\u2500\u2500\u2500
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Alustra\u00ae\nArchitectural Shades',
    items: [
      { image: 'page028_img01_306x306.jpeg', label: '048 Black' },
      { image: 'page028_img02_306x306.jpeg', label: '064 Bronze' },
      { image: 'page028_img03_306x306.jpeg', label: '235 Gold' },
      { image: 'page028_img04_306x306.jpeg', label: '316 Nickel' },
      { image: 'page028_img05_306x306.jpeg', label: '320 Rich Cream' },
      { image: 'page028_img06_306x306.jpeg', label: '651 Duchess Grey' },
      { image: 'page028_img07_306x306.jpeg', label: '661 White Tiara' },
      { image: 'page028_img08_306x306.jpeg', label: '859 Desert Tan' },
      { image: 'page028_img09_306x306.jpeg', label: '879 Pearl Gray' },
      { image: 'page028_img10_306x306.jpeg', label: '903 Desert Gold' },
    ],
  },

  // \u2500\u2500\u2500\u2500 Fabric Swatches (8 collections by fabric type) \u2500\u2500\u2500\u2500
  swatchCollections: [
    {
      name: 'Jayce (Sheer)',
      swatches: [
        { image: 'page029_img01_752x1228.jpeg', colorName: 'CR\u00c8ME BR\u00dbL\u00c9E', specs: ['Sheer JAY-301'] },
        { image: 'page029_img02_752x1228.jpeg', colorName: 'WEATHERED OAK', specs: ['Sheer JAY-302'] },
        { image: 'page030_img01_752x1228.jpeg', colorName: 'HONEY GOLD', specs: ['Sheer JAY-351'] },
        { image: 'page030_img02_752x1228.jpeg', colorName: 'TIMBER RIDGE', specs: ['Sheer JAY-401'] },
      ],
    },
    {
      name: 'Hardwood (Sheer)',
      swatches: [
        { image: 'page031_img01_752x1228.jpeg', colorName: 'SNOWBIRD', specs: ['Sheer HWD-101'] },
        { image: 'page031_img02_752x1228.jpeg', colorName: 'LIMESTONE', specs: ['Sheer HWD-201'] },
        { image: 'page032_img01_752x1228.jpeg', colorName: 'OLDE PEWTER', specs: ['Sheer HWD-801'] },
        { image: 'page032_img02_752x1228.jpeg', colorName: 'SAND STORM', specs: ['Sheer HWD-303'] },
        { image: 'page033_img01_752x1228.jpeg', colorName: 'ATLAS', specs: ['Sheer HWD-601'] },
        { image: 'page033_img02_752x1228.jpeg', colorName: 'CEDAR CHEST', specs: ['Sheer HWD-401'] },
      ],
    },
    {
      name: 'Brielle (Semi-Sheer)',
      swatches: [
        { image: 'page034_img01_752x1228.jpeg', colorName: 'NORDIC', specs: ['Semi-Sheer BRL-803'] },
        { image: 'page034_img02_752x1228.jpeg', colorName: 'PALOMA', specs: ['Semi-Sheer BRL-304'] },
        { image: 'page035_img01_752x1228.jpeg', colorName: 'OXFORD', specs: ['Semi-Sheer BRL-802'] },
        { image: 'page035_img02_752x1228.jpeg', colorName: 'ASCOT', specs: ['Semi-Sheer BRL-402'] },
        { image: 'page036_img01_752x1228.jpeg', colorName: 'CALDER', specs: ['Semi-Sheer BRL-902'] },
      ],
    },
    {
      name: 'Clayton (Semi-Sheer)',
      swatches: [
        { image: 'page037_img01_752x1228.jpeg', colorName: 'LATTICE', specs: ['Semi-Sheer CLT-305'] },
        { image: 'page037_img02_752x1228.jpeg', colorName: 'TWEED COAT', specs: ['Semi-Sheer CLT-306'] },
        { image: 'page038_img01_752x1228.jpeg', colorName: 'SUGARED BIRCH', specs: ['Semi-Sheer CLT-352'] },
        { image: 'page038_img02_752x1228.jpeg', colorName: 'SILVER POINT', specs: ['Semi-Sheer CLT-804'] },
      ],
    },
    {
      name: 'Amelia (Semi-Sheer)',
      swatches: [
        { image: 'page039_img01_752x1228.jpeg', colorName: 'DAWN DRIZZLE', specs: ['Semi-Sheer AMI-307'] },
        { image: 'page039_img02_752x1228.jpeg', colorName: 'SILVER MIST', specs: ['Semi-Sheer AMI-806'] },
        { image: 'page040_img01_752x1228.jpeg', colorName: 'BEDFORD BROWN', specs: ['Semi-Sheer AMI-403'] },
        { image: 'page040_img02_752x1228.jpeg', colorName: 'FOSSIL', specs: ['Semi-Sheer AMI-807'] },
        { image: 'page041_img01_752x1228.jpeg', colorName: 'ABYSS', specs: ['Semi-Sheer AMI-904'] },
      ],
    },
    {
      name: 'Rumi (Semi-Opaque)',
      swatches: [
        { image: 'page042_img01_752x1228.jpeg', colorName: 'PEARL DUST', specs: ['Semi-Opaque RMI-808'] },
        { image: 'page042_img02_752x1228.jpeg', colorName: 'MOROCCAN SAND', specs: ['Semi-Opaque RMI-308'] },
        { image: 'page043_img01_752x1228.jpeg', colorName: 'SHADOW', specs: ['Semi-Opaque RMI-809'] },
        { image: 'page043_img02_752x1228.jpeg', colorName: 'MARINA', specs: ['Semi-Opaque RMI-602'] },
        { image: 'page044_img01_752x1228.jpeg', colorName: 'JAVA COAST', specs: ['Semi-Opaque RMI-701'] },
      ],
    },
    {
      name: 'Finley (Semi-Opaque)',
      swatches: [
        { image: 'page045_img01_752x1228.jpeg', colorName: 'ARCTIC WHITE', specs: ['Semi-Opaque FIN-103'] },
        { image: 'page045_img02_752x1228.jpeg', colorName: 'MISTY HARBOR', specs: ['Semi-Opaque FIN-810'] },
        { image: 'page046_img01_752x1228.jpeg', colorName: 'ARROWHEAD', specs: ['Semi-Opaque FIN-309'] },
        { image: 'page046_img02_752x1228.jpeg', colorName: 'ANCIENT BRONZE', specs: ['Semi-Opaque FIN-353'] },
        { image: 'page047_img01_752x1228.jpeg', colorName: 'PEBBLE', specs: ['Semi-Opaque FIN-811'] },
      ],
    },
    {
      name: 'Leo (Semi-Opaque)',
      swatches: [
        { image: 'page048_img01_752x1228.jpeg', colorName: 'WARM STERLING', specs: ['Semi-Opaque LEO-406'] },
        { image: 'page048_img02_752x1228.jpeg', colorName: 'EARTHY UMBER', specs: ['Semi-Opaque LEO-355'] },
        { image: 'page049_img01_752x1228.jpeg', colorName: 'CELESTIAL GREY', specs: ['Semi-Opaque LEO-812'] },
      ],
    },
    {
      name: 'Landen (Semi-Opaque)',
      swatches: [
        { image: 'page050_img01_752x1228.jpeg', colorName: 'EDGECOMB', specs: ['Semi-Opaque LAND-311'] },
        { image: 'page050_img02_752x1228.jpeg', colorName: 'PICCOLO', specs: ['Semi-Opaque LAND-407'] },
        { image: 'page051_img01_752x1228.jpeg', colorName: 'PEPPERCORN', specs: ['Semi-Opaque LAND-813'] },
        { image: 'page051_img02_752x1228.jpeg', colorName: 'INKWELL', specs: ['Semi-Opaque LAND-814'] },
      ],
    },
  ],

  cellSize: null,
  opacity: null,
  edgeBanding: null,
  liner: null,
}
