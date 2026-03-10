/**
 * Pirouette® Window Shadings - 完整页面布局数据
 */

import type { SectionLayout, ControlSystemPanel, CardItem, ImageLabel, SwatchCollection } from './applause-layout'

export interface PirouetteLayout {
  slug: string
  name: string
  description: string
  heroImage: string
  heroLabel: string
  sections: SectionLayout[]
  gallery: { image: string; text: string; label: string }[]
  hardwareColors: SectionLayout | null
  swatchCollections: SwatchCollection[]
}

export const pirouetteLayout: PirouetteLayout = {
  slug: 'pirouette',
  name: 'Pirouette\u00AE Window Shadings',
  description: 'Pirouette\u00AE Window Shadings combine beautiful, contoured fabric vanes with a single back sheer, providing the versatility of privacy and unparalleled view-through.',

  heroImage: 'page012_img01_7805x3009.jpeg',
  heroLabel: 'Fabric ClearView\u00AE Satin Metallic\u2122 \u00B7 Color Lunar\nOperating System PowerView\u00AE Automation',

  sections: [
    /* ─── Scene Pairs ─── */
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page006_img01_4171x3009.jpeg',
          text: 'Our window treatments do more than look good. They transform natural light, creating beautiful spaces for comfortable, everyday living.',
          label: '',
        },
        {
          image: 'page007_img01_5991x3009.jpeg',
          text: '',
          label: 'Fabric Grant\u2122 \u00B7 Color Sahara\nControl Option PowerView\u00AE Automation',
        },
        {
          image: 'page008_img01_5991x3009.jpeg',
          text: 'Pirouette\u00AE Window Shadings combine beautiful, contoured fabric vanes with a single back sheer, providing the versatility of privacy and unparalleled view-through.',
          label: 'Fabric ClearView\u00AE Charmeuse \u00B7 Color Ash\nControl Option SoftTouch\u00AE Motorization',
        },
        {
          image: 'page009_img01_5986x3009.jpeg',
          text: 'The A Deux\u2122 design option adds a room-darkening back panel to the Pirouette\u00AE light-filtering shading, letting you create diffused light or a darker room.',
          label: 'Fabric ClearView\u00AE Batiste Bamboo \u00B7 Color Pesto\nControl Option PowerView\u00AE Automation',
        },
        {
          image: 'page010_img01_5800x2916.jpeg',
          text: 'A wide array of luxurious fabrics in exquisite colors and textures provides sculptural beauty that complements any design style.',
          label: 'Fabric Satin \u00B7 Color Amethyst\nControl Option PowerView\u00AE Automation',
        },
        {
          image: 'page013_img01_3909x3009.jpeg',
          text: 'Pirouette\u00AE shadings with a room-darkening fabric.',
          label: 'Fabric Thea\u2122 \u00B7 Color Hudson Gray\nControl Option UltraGlide\u00AE with Two-on-One Headrail',
        },
      ],
    },

    /* ─── Benefits ─── */
    {
      type: 'card-grid',
      title: 'Benefits',
      cols: 3,
      cards: [
        { image: 'page014_img01_1526x873.jpeg', title: 'Beautiful Light Control', desc: 'Soft, contoured fabric vanes, whether open, closed or anywhere in between, offer exquisite light control.' },
        { image: 'page014_img02_1522x873.jpeg', title: 'Expansive View', desc: 'Our exclusive back sheers and innovative Invisi-Lift\u2122 system provide unparalleled views.' },
        { image: 'page014_img03_1300x742.jpeg', title: 'Enhanced Privacy', desc: 'Partially or fully closed fabric vanes provide flexible levels of privacy.' },
        { image: 'page014_img04_1525x873.jpeg', title: 'UV Protection', desc: 'With fabric vanes open or closed, Pirouette\u00AE shadings block the sun\u2019s harmful rays to protect furniture, artwork and flooring from fading.' },
        { image: 'page014_img05_1523x872.jpeg', title: 'Gorgeous Fabric Options', desc: 'Vibrant, fresh fabrics create a robust collection, rich in color and texture.' },
      ],
    },

    /* ─── Light Control and Privacy ─── */
    {
      type: 'comparison-grid',
      title: 'Light Control and Privacy',
      cols: 3,
      items: [
        { image: 'page015_img02_959x1914.jpeg', label: 'Fully Open', sublabel: 'For maximum view-through' },
        { image: 'page015_img03_959x1914.jpeg', label: 'Partially Open', sublabel: 'For a combination of natural light and privacy' },
        { image: 'page015_img04_959x1915.jpeg', label: 'Closed', sublabel: 'For complete privacy and light control' },
      ],
    },

    /* ─── Sheer Options ─── */
    {
      type: 'comparison-grid',
      title: 'Sheer Options',
      cols: 2,
      items: [
        { image: 'page016_img02_1510x1913.jpeg', label: 'Pirouette\u00AE Classic Sheer', sublabel: 'For Maximum Light Filtering \u2014 The preferred choice for filtering harsh incoming light and UV protection.' },
        { image: 'page016_img03_1509x1913.jpeg', label: 'ClearView\u00AE Sheer', sublabel: 'For Superior View-Through \u2014 The preferred choice for crisp, clean view-through, light control and UV protection.' },
      ],
    },

    /* ─── Opacity Options ─── */

    /* ─── Control Systems (PowerView + Operating Systems) ─── */
    {
      type: 'control-systems',
      sceneImage: 'page018_img01_2096x3009.jpeg',
      sceneLabel: 'Fabric ClearView\u00AE Satin \u00B7 Color Black Onyx\nControl Option PowerView\u00AE Automation',
      panels: [
        {
          title: 'PowerView\u00AE Automation',
          image: 'page018_img02_674x1156.jpeg',
          features: [
            { title: 'Convenience', desc: 'Achieve your perfect light automatically' },
            { title: 'Privacy', desc: 'Schedule shadings to move automatically, when you\u2019re home or away' },
            { title: 'Energy Efficiency', desc: 'Program shadings to be in the best positions to heat and cool your home' },
            { title: 'Security', desc: 'Remote control gives the illusion that you\u2019re always home' },
            { title: 'Child Friendly', desc: 'Simple, cord-free operation' },
            { title: 'Battery Powered or Hardwired', desc: 'For seamless installation, operation and maintenance' },
            { title: 'Voice Control', desc: 'Compatible with smart speakers and smart-home systems' },
          ],
          footnote: '*Some features require additional hardware and/or third-party equipment. Visit hunterdouglas.com for details.',
        },
        {
          title: 'Operating Systems',
          items: [
            { image: 'page018_img03_836x1808.jpeg', title: 'SoftTouch\u00AE Motorization', desc: 'A battery-operated, cordless system. Gently pull down on the wand to lower shadings, or lightly push up to raise them.' },
            { image: 'page018_img04_645x1380.jpeg', title: 'UltraGlide\u00AE', desc: 'A single retractable wand for enhanced child safety. With one click, the fabric panel drops for complete privacy.' },
            { image: 'page018_img05_647x1393.jpeg', title: 'EasyRise\u2122', desc: 'A continuous cordless loop system. Simply pull on the cord to raise or lower the shade.' },
          ],
        },
      ],
    },

    /* ─── Design & Mounting Options ─── */
    {
      type: 'card-grid',
      title: 'Design & Mounting Options',
      cols: 4,
      cards: [
        { image: 'page020_img02_1528x834.jpeg', title: 'Fabric-Covered Headrail', desc: 'Headrail fabric beautifully matches the shading to create a streamlined look.' },
        { image: 'page020_img07_1529x835.jpeg', title: 'Fabric-Covered Bottom Rail', desc: 'A coordinating fabric on the bottom rail adds the perfect finishing touch.' },
        { image: 'page020_img06_1528x834.jpeg', title: 'Two-On-One Headrail', desc: 'Shadings operate independently on the same headrail\u2014an ideal solution for wide windows and sliding glass doors.' },
        { image: 'page020_img01_1521x835.jpeg', title: 'Specialty Shapes', desc: 'These window shadings are non-operable in the vanes contoured closed position.' },
      ],
    },

    /* ─── Mounting Profiles ─── */
    {
      type: 'mounting-grid',
      title: 'Mounting Profiles',
      rows: [
        {
          items: [
            { image: 'page020_img03_962x834.jpeg', label: 'Classic Headrail' },
            { image: 'page020_img04_962x834.jpeg', label: 'Inside Mount' },
            { image: 'page020_img05_962x834.jpeg', label: 'Outside Mount' },
          ],
        },
        {
          items: [
            { image: 'page020_img08_962x834.jpeg', label: 'A Deux\u2122 Headrail' },
            { image: 'page020_img09_962x834.jpeg', label: 'Inside Mount' },
            { image: 'page020_img10_962x834.jpeg', label: 'Outside Mount' },
          ],
        },
      ],
    },

    /* ─── Bottom Fabric Panel Variance ─── */
    {
      type: 'comparison-grid',
      title: 'Bottom Fabric Panel Variance',
      cols: 3,
      items: [
        { image: 'page021_img01_738x1471.jpeg', label: 'Small Bottom Fabric Panel', sublabel: '' },
        { image: 'page021_img02_739x1470.jpeg', label: 'Large Bottom Fabric Panel', sublabel: '' },
        { image: 'page021_img03_738x1471.jpeg', label: 'Zero Bottom Panel', sublabel: 'This optional feature for outside mount only, transforms the bottom panel into a functioning vane.' },
      ],
    },
  ],

  /* ─── Gallery ─── */
  gallery: [
    { image: 'page002_img01_4209x3009.jpeg', text: '\', label: \'' },
    { image: 'page005_img01_3936x3044.jpeg', text: '\', label: \'' },
    { image: 'page011_img01_3909x3009.jpeg', text: '\', label: \'Fabric Alustra\u00AE Oakley\u2122 \u00B7 Color Sand Jasper\nControl Option PowerView\u00AE Automation' },
    { image: 'page015_img01_3910x3009.jpeg', text: '\', label: \'Fabric Thea\u2122 \u00B7 Color Cypher\nControl Option PowerView\u00AE Automation' },
    { image: 'page016_img01_3907x3009.jpeg', text: '\', label: \'Fabric ClearView\u00AE Satin \u00B7 Color Luxe\nControl Option PowerView\u00AE Automation' },
    { image: 'page022_img01_3909x3010.jpeg', text: '\', label: \'Fabric ClearView\u00AE Batiste Bamboo \u00B7 Color Pesto\nControl Option PowerView\u00AE Automation' },
    { image: 'page024_img01_3009x2427.jpeg', text: '\', label: \'' },
  ],

  hardwareColors: null,

  /* ─── Swatch Collections (92 colors across 12 collections) ─── */
  swatchCollections: [
    {
      name: 'Alustra\u00AE Oakley\u2122',
      swatches: [
        { image: 'page032_img01_1467x2410.jpeg', chip: 'page032_img03_304x304.jpeg', colorName: 'CHALCEDONY', specs: ['Light Filtering PR82-1302 (5")', 'Room Darkening PR84-1302 (5")'] },
        { image: 'page032_img02_1467x2410.jpeg', chip: 'page032_img04_304x304.jpeg', colorName: 'ROCK SALT', specs: ['Light Filtering PR82-1304 (5")', 'Room Darkening PR84-1304 (5")'] },
        { image: 'page033_img01_1467x2410.jpeg', chip: 'page033_img03_304x304.jpeg', colorName: 'LENA', specs: ['Light Filtering PR82-1306 (5")', 'Room Darkening PR84-1306 (5")'] },
        { image: 'page033_img02_1467x2410.jpeg', chip: 'page033_img04_304x304.jpeg', colorName: 'SAND JASPER', specs: ['Light Filtering PR82-1303 (5")', 'Room Darkening PR84-1303 (5")'] },
        { image: 'page034_img01_1467x2410.jpeg', chip: 'page034_img03_304x304.jpeg', colorName: 'BEDROCK', specs: ['Light Filtering PR82-1305 (5")', 'Room Darkening PR84-1305 (5")'] },
        { image: 'page034_img02_1467x2410.jpeg', chip: 'page034_img04_304x304.jpeg', colorName: 'QUARRY', specs: ['Light Filtering PR82-1307 (5")', 'Room Darkening PR84-1307 (5")'] },
      ],
    },
    {
      name: 'Alustra\u00AE ClearView\u00AE Apollo\u2122',
      swatches: [
        { image: 'page035_img01_1467x2410.jpeg', chip: 'page035_img03_304x304.jpeg', colorName: 'LYRICAL', specs: ['Light Filtering PR70-011 (5")', 'Room Darkening PR72-011 (5")'] },
        { image: 'page035_img02_1467x2410.jpeg', chip: 'page035_img04_304x304.jpeg', colorName: 'TRUTH', specs: ['Light Filtering PR70-103 (5")', 'Room Darkening PR72-103 (5")'] },
        { image: 'page036_img01_1467x2410.jpeg', chip: 'page036_img03_304x304.jpeg', colorName: 'RENEW', specs: ['Light Filtering PR70-104 (5")', 'Room Darkening PR72-104 (5")'] },
        { image: 'page036_img02_1467x2410.jpeg', chip: 'page036_img04_304x304.jpeg', colorName: 'REFLECTION', specs: ['Light Filtering PR70-603 (5")', 'Room Darkening PR72-603 (5")'] },
      ],
    },
    {
      name: 'ClearView\u00AE Wren\u2122',
      swatches: [
        { image: 'page037_img01_1467x2410.jpeg', chip: 'page037_img03_304x304.jpeg', colorName: 'BUNTING', specs: ['Light Filtering PR78-1287 (5")', 'Room Darkening PR80-1287 (5")'] },
        { image: 'page037_img02_1467x2410.jpeg', chip: 'page037_img04_304x304.jpeg', colorName: 'LARKSPUR', specs: ['Light Filtering PR78-1288 (5")', 'Room Darkening PR80-1288 (5")'] },
        { image: 'page038_img01_1467x2410.jpeg', chip: 'page038_img03_304x304.jpeg', colorName: 'GOLDFINCH', specs: ['Light Filtering PR78-1290 (5")', 'Room Darkening PR80-1290 (5")'] },
        { image: 'page038_img02_1467x2410.jpeg', chip: 'page038_img04_304x304.jpeg', colorName: 'VIREO', specs: ['Light Filtering PR78-1289 (5")', 'Room Darkening PR80-1289 (5")'] },
        { image: 'page039_img01_1467x2410.jpeg', chip: 'page039_img03_304x304.jpeg', colorName: 'GRAY GOOSE', specs: ['Light Filtering PR78-1291 (5")', 'Room Darkening PR80-1291 (5")'] },
        { image: 'page039_img02_1467x2410.jpeg', chip: 'page039_img04_304x304.jpeg', colorName: 'STARLING', specs: ['Light Filtering PR78-1292 (5")', 'Room Darkening PR80-1292 (5")'] },
      ],
    },
    {
      name: 'ClearView\u00AE Batiste Bamboo\u2122',
      swatches: [
        { image: 'page040_img01_1467x2410.jpeg', chip: 'page040_img03_304x304.jpeg', colorName: 'DAISY WHITE', specs: ['Light Filtering PR74-951 (5")', 'Room Darkening PR76-951 (5")'] },
        { image: 'page040_img02_1467x2410.jpeg', chip: 'page040_img04_304x304.jpeg', colorName: 'POLAR GRAY', specs: ['Light Filtering PR74-986 (5")', 'Room Darkening PR76-986 (5")'] },
        { image: 'page041_img01_1467x2410.jpeg', chip: 'page041_img03_304x304.jpeg', colorName: 'PESTO', specs: ['Light Filtering PR74-624 (5")', 'Room Darkening PR76-624 (5")'] },
        { image: 'page041_img02_1467x2410.jpeg', chip: 'page041_img04_304x304.jpeg', colorName: 'JOURNAL', specs: ['Light Filtering PR74-457 (5")', 'Room Darkening PR76-457 (5")'] },
        { image: 'page042_img01_1467x2410.jpeg', chip: 'page042_img03_304x304.jpeg', colorName: 'PLATINUM', specs: ['Light Filtering PR74-682 (5")', 'Room Darkening PR76-682 (5")'] },
        { image: 'page042_img02_1467x2410.jpeg', chip: 'page042_img04_304x304.jpeg', colorName: 'PEARL GRAY', specs: ['Light Filtering PR74-713 (5")', 'Room Darkening PR76-713 (5")'] },
      ],
    },
    {
      name: 'ClearView\u00AE Charmeuse\u2122',
      swatches: [
        { image: 'page043_img01_1467x2410.jpeg', chip: 'page043_img03_304x304.jpeg', colorName: 'DEW', specs: ['Light Filtering PR90-297 (5")', 'Room Darkening PR92-297 (5")'] },
        { image: 'page043_img02_1467x2410.jpeg', chip: 'page043_img04_304x304.jpeg', colorName: 'BISQUE', specs: ['Light Filtering PR90-525 (5")', 'Room Darkening PR92-525 (5")'] },
        { image: 'page044_img01_1467x2410.jpeg', chip: 'page044_img03_304x304.jpeg', colorName: 'PEBBLE', specs: ['Light Filtering PR90-937 (5")', 'Room Darkening PR92-937 (5")'] },
        { image: 'page044_img02_1467x2410.jpeg', chip: 'page044_img04_304x304.jpeg', colorName: 'ASH', specs: ['Light Filtering PR90-486 (5")', 'Room Darkening PR92-486 (5")'] },
        { image: 'page045_img01_1467x2410.jpeg', chip: 'page045_img03_304x304.jpeg', colorName: 'PEWTER', specs: ['Light Filtering PR90-336 (5")', 'Room Darkening PR92-336 (5")'] },
        { image: 'page045_img02_1467x2410.jpeg', chip: 'page045_img04_304x304.jpeg', colorName: 'STORM', specs: ['Light Filtering PR90-725 (5")', 'Room Darkening PR92-725 (5")'] },
      ],
    },
    {
      name: 'Satin / ClearView\u00AE Satin',
      swatches: [
        { image: 'page046_img01_1467x2410.jpeg', chip: 'page046_img03_304x304.jpeg', colorName: 'MAGNOLIA', specs: ['Light Filtering PR10/PR60-951 (5")', 'Room Darkening PR12/PR62-951 (5")'] },
        { image: 'page046_img02_1467x2410.jpeg', chip: 'page046_img04_304x304.jpeg', colorName: 'BIRCH', specs: ['Light Filtering PR10/PR60-953 (5")', 'Room Darkening PR12/PR62-953 (5")'] },
        { image: 'page047_img01_1467x2410.jpeg', chip: 'page047_img03_304x304.jpeg', colorName: 'WOOL', specs: ['Light Filtering PR10/PR60-907 (5")', 'Room Darkening PR12/PR62-907 (5")'] },
        { image: 'page047_img02_1467x2410.jpeg', chip: 'page047_img04_304x304.jpeg', colorName: 'CHAMOMILE', specs: ['Light Filtering PR10/PR60-949 (5")', 'Room Darkening PR12/PR62-949 (5")'] },
        { image: 'page048_img01_1467x2410.jpeg', chip: 'page048_img03_304x304.jpeg', colorName: 'NATURAL CHALK', specs: ['Light Filtering PR10/PR60-948 (5")', 'Room Darkening PR12/PR62-948 (5")'] },
        { image: 'page048_img02_1467x2410.jpeg', chip: 'page048_img04_304x304.jpeg', colorName: 'CHAMPAGNE', specs: ['Light Filtering PR10/PR60-989 (5")', 'Room Darkening PR12/PR62-989 (5")'] },
        { image: 'page049_img01_1467x2410.jpeg', chip: 'page049_img03_304x304.jpeg', colorName: 'MUSE GRAY', specs: ['Light Filtering PR10/PR60-1280 (5")', 'Room Darkening PR12/PR62-1280 (5")'] },
        { image: 'page049_img02_1467x2410.jpeg', chip: 'page049_img04_304x304.jpeg', colorName: 'PARK AVE', specs: ['Light Filtering PR10/PR60-851 (5")', 'Room Darkening PR12/PR62-851 (5")'] },
        { image: 'page050_img01_1467x2410.jpeg', chip: 'page050_img03_304x304.jpeg', colorName: 'STAINLESS', specs: ['Light Filtering PR10/PR60-416 (5")', 'Room Darkening PR12/PR62-416 (5")'] },
        { image: 'page050_img02_1467x2410.jpeg', chip: 'page050_img04_304x304.jpeg', colorName: 'SWAN', specs: ['Light Filtering PR10/PR60-1226 (5")', 'Room Darkening PR12/PR62-1226 (5")'] },
        { image: 'page051_img01_1467x2410.jpeg', chip: 'page051_img03_304x304.jpeg', colorName: 'SANCTUARY', specs: ['Light Filtering PR10/PR60-858 (5")', 'Room Darkening PR12/PR62-858 (5")'] },
        { image: 'page051_img02_1467x2410.jpeg', chip: 'page051_img04_304x304.jpeg', colorName: 'PESTO', specs: ['Light Filtering PR10/PR60-624 (5")', 'Room Darkening PR12/PR62-624 (5")'] },
        { image: 'page052_img01_1467x2410.jpeg', chip: 'page052_img03_304x304.jpeg', colorName: 'JULEP', specs: ['Light Filtering PR10/PR60-481 (5")', 'Room Darkening PR12/PR62-481 (5")'] },
        { image: 'page052_img02_1467x2410.jpeg', chip: 'page052_img04_304x304.jpeg', colorName: 'BLUEPRINT', specs: ['Light Filtering PR10/PR60-286 (5")', 'Room Darkening PR12/PR62-286 (5")'] },
        { image: 'page053_img01_1467x2410.jpeg', chip: 'page053_img03_304x304.jpeg', colorName: 'LUXE', specs: ['Light Filtering PR10/PR60-834 (5")', 'Room Darkening PR12/PR62-834 (5")'] },
        { image: 'page053_img02_1467x2410.jpeg', chip: 'page053_img04_304x304.jpeg', colorName: 'DOLPHIN', specs: ['Light Filtering PR10/PR60-393 (5")', 'Room Darkening PR12/PR62-393 (5")'] },
        { image: 'page054_img01_1467x2410.jpeg', chip: 'page054_img03_304x304.jpeg', colorName: 'BOX OFFICE', specs: ['Light Filtering PR10/PR60-287 (5")', 'Room Darkening PR12/PR62-287 (5")'] },
        { image: 'page054_img02_1467x2410.jpeg', chip: 'page054_img04_304x304.jpeg', colorName: 'BLACK ONYX', specs: ['Light Filtering PR10/PR60-749 (5")', 'Room Darkening PR12/PR62-749 (5")'] },
        { image: 'page055_img01_1467x2410.jpeg', chip: 'page055_img03_304x304.jpeg', colorName: 'CHARMING', specs: ['Light Filtering PR10/PR60-1281 (5")', 'Room Darkening PR12/PR62-1281 (5")'] },
        { image: 'page055_img02_1467x2410.jpeg', chip: 'page055_img04_304x304.jpeg', colorName: 'GRACE', specs: ['Light Filtering PR10/PR60-1282 (5")', 'Room Darkening PR12/PR62-1282 (5")'] },
        { image: 'page056_img01_1467x2410.jpeg', chip: 'page056_img03_304x304.jpeg', colorName: 'AMETHYST', specs: ['Light Filtering PR10/PR60-417 (5")', 'Room Darkening PR12/PR62-417 (5")'] },
        { image: 'page056_img02_1467x2410.jpeg', chip: 'page056_img04_304x304.jpeg', colorName: 'DUNE', specs: ['Light Filtering PR10/PR60-324 (5")', 'Room Darkening PR12/PR62-324 (5")'] },
        { image: 'page057_img01_1467x2410.jpeg', chip: 'page057_img03_304x304.jpeg', colorName: 'RIVER ROCK', specs: ['Light Filtering PR10/PR60-411 (5")', 'Room Darkening PR12/PR62-411 (5")'] },
        { image: 'page057_img02_1467x2410.jpeg', chip: 'page057_img04_304x304.jpeg', colorName: 'DARK CHOCOLATE', specs: ['Light Filtering PR10/PR60-496 (5")', 'Room Darkening PR12/PR62-496 (5")'] },
      ],
    },
    {
      name: 'ClearView\u00AE Satin Metallic\u2122',
      swatches: [
        { image: 'page058_img01_1467x2410.jpeg', chip: 'page058_img03_304x304.jpeg', colorName: 'DIAMOND', specs: ['Light Filtering PR14/PR64-616 (5")', 'Room Darkening PR16/PR66-616 (5")'] },
        { image: 'page058_img02_1467x2410.jpeg', chip: 'page058_img04_304x304.jpeg', colorName: 'SERENITY', specs: ['Light Filtering PR14/PR64-087 (5")', 'Room Darkening PR16/PR66-087 (5")'] },
        { image: 'page059_img01_1467x2410.jpeg', chip: 'page059_img03_304x304.jpeg', colorName: 'LUNAR', specs: ['Light Filtering PR14/PR64-085 (5")', 'Room Darkening PR16/PR66-085 (5")'] },
        { image: 'page059_img02_1467x2410.jpeg', chip: 'page059_img04_304x304.jpeg', colorName: 'WISH', specs: ['Light Filtering PR14/PR64-086 (5")', 'Room Darkening PR16/PR66-086 (5")'] },
        { image: 'page060_img01_1467x2410.jpeg', chip: 'page060_img03_304x304.jpeg', colorName: 'FROST', specs: ['Light Filtering PR14/PR64-600 (5")', 'Room Darkening PR16/PR66-600 (5")'] },
        { image: 'page060_img02_1467x2410.jpeg', chip: 'page060_img04_304x304.jpeg', colorName: 'STARLIGHT', specs: ['Light Filtering PR14/PR64-605 (5")', 'Room Darkening PR16/PR66-605 (5")'] },
        { image: 'page061_img01_1467x2410.jpeg', chip: 'page061_img03_304x304.jpeg', colorName: 'AKOYA', specs: ['Light Filtering PR14/PR64-1283 (5")', 'Room Darkening PR16/PR66-1283 (5")'] },
        { image: 'page061_img02_1467x2410.jpeg', chip: 'page061_img04_304x304.jpeg', colorName: 'AURELIA', specs: ['Light Filtering PR14/PR64-1284 (5")', 'Room Darkening PR16/PR66-1284 (5")'] },
        { image: 'page062_img01_1467x2410.jpeg', chip: 'page062_img03_304x304.jpeg', colorName: 'COPPER', specs: ['Light Filtering PR14/PR64-614 (5")', 'Room Darkening PR16/PR66-614 (5")'] },
        { image: 'page062_img02_1467x2410.jpeg', chip: 'page062_img04_304x304.jpeg', colorName: 'GEODE', specs: ['Light Filtering PR14/PR64-1285 (5")', 'Room Darkening PR16/PR66-1285 (5")'] },
        { image: 'page063_img01_1467x2410.jpeg', chip: 'page063_img03_304x304.jpeg', colorName: 'LIGHTNING', specs: ['Light Filtering PR14/PR64-604 (5")', 'Room Darkening PR16/PR66-604 (5")'] },
        { image: 'page063_img02_1467x2410.jpeg', chip: 'page063_img04_304x304.jpeg', colorName: 'BRONZE STAR', specs: ['Light Filtering PR14/PR64-1286 (5")', 'Room Darkening PR16/PR66-1286 (5")'] },
      ],
    },
    {
      name: 'Thea\u2122',
      swatches: [
        { image: 'page064_img01_1467x2410.jpeg', chip: 'page064_img03_304x304.jpeg', colorName: 'IVORY PEARL', specs: ['Light Filtering PR94-1260 (5")', 'Room Darkening PR96-1260 (5")'] },
        { image: 'page064_img02_1467x2410.jpeg', chip: 'page064_img04_304x304.jpeg', colorName: 'HUDSON GRAY', specs: ['Light Filtering PR94-1262 (5")', 'Room Darkening PR96-1262 (5")'] },
        { image: 'page065_img01_1467x2410.jpeg', chip: 'page065_img03_304x304.jpeg', colorName: 'CERISE', specs: ['Light Filtering PR94-1263 (5")', 'Room Darkening PR96-1263 (5")'] },
        { image: 'page065_img02_1467x2410.jpeg', chip: 'page065_img04_304x304.jpeg', colorName: 'MOREL', specs: ['Light Filtering PR94-1308 (5")', 'Room Darkening PR96-1308 (5")'] },
        { image: 'page066_img01_1467x2410.jpeg', chip: 'page066_img03_304x304.jpeg', colorName: 'CYPHER', specs: ['Light Filtering PR94-1265 (5")', 'Room Darkening PR96-1265 (5")'] },
        { image: 'page066_img02_1467x2410.jpeg', chip: 'page066_img04_304x304.jpeg', colorName: 'OLIVIA', specs: ['Light Filtering PR94-1309 (5")', 'Room Darkening PR96-1309 (5")'] },
      ],
    },
    {
      name: 'Avant\u2122',
      swatches: [
        { image: 'page067_img01_1467x2410.jpeg', chip: 'page067_img03_304x304.jpeg', colorName: 'SNOWDROP', specs: ['Light Filtering PR86-1296 (5")', 'Room Darkening PR88-1296 (5")'] },
        { image: 'page067_img02_1467x2410.jpeg', chip: 'page067_img04_304x304.jpeg', colorName: 'FRENCH PORCELAIN', specs: ['Light Filtering PR86-1297 (5")', 'Room Darkening PR88-1297 (5")'] },
        { image: 'page068_img01_1467x2410.jpeg', chip: 'page068_img03_304x304.jpeg', colorName: 'MIEL', specs: ['Light Filtering PR86-1298 (5")', 'Room Darkening PR88-1298 (5")'] },
        { image: 'page068_img02_1467x2410.jpeg', chip: 'page068_img04_304x304.jpeg', colorName: 'MIST VEIL', specs: ['Light Filtering PR86-1299 (5")', 'Room Darkening PR88-1299 (5")'] },
        { image: 'page069_img01_1467x2410.jpeg', chip: 'page069_img03_304x304.jpeg', colorName: 'BERYL', specs: ['Light Filtering PR86-1301 (5")', 'Room Darkening PR88-1301 (5")'] },
        { image: 'page069_img02_1467x2410.jpeg', chip: 'page069_img04_304x304.jpeg', colorName: 'SEA FOG', specs: ['Light Filtering PR86-1300 (5")', 'Room Darkening PR88-1300 (5")'] },
      ],
    },
    {
      name: 'Grant\u2122',
      swatches: [
        { image: 'page070_img01_1467x2410.jpeg', chip: 'page070_img03_304x304.jpeg', colorName: 'BUFF', specs: ['Light Filtering PR50-774 (5")', 'Room Darkening PR52-774 (5")'] },
        { image: 'page070_img02_1467x2410.jpeg', chip: 'page070_img04_304x304.jpeg', colorName: 'SAHARA', specs: ['Light Filtering PR50-126 (5")', 'Room Darkening PR52-126 (5")'] },
        { image: 'page071_img01_1467x2410.jpeg', chip: 'page071_img03_236x236.jpeg', colorName: 'BRINDLE', specs: ['Light Filtering PR50-1294 (5")', 'Room Darkening PR52-1294 (5")'] },
        { image: 'page071_img02_1467x2410.jpeg', chip: 'page071_img04_236x236.jpeg', colorName: 'THRIVE', specs: ['Light Filtering PR50-1295 (5")', 'Room Darkening PR52-1295 (5")'] },
        { image: 'page072_img01_1467x2410.jpeg', chip: 'page072_img03_236x236.jpeg', colorName: 'LABRADORITE', specs: ['Light Filtering PR50-1293 (5")', 'Room Darkening PR52-1293 (5")'] },
        { image: 'page072_img02_1467x2410.jpeg', chip: 'page072_img04_304x304.jpeg', colorName: 'PITCH', specs: ['Light Filtering PR50-855 (5")', 'Room Darkening PR52-855 (5")'] },
      ],
    },
    {
      name: 'Victoria\u2122',
      swatches: [
        { image: 'page073_img01_1467x2410.jpeg', chip: 'page073_img03_304x304.jpeg', colorName: 'PORCELAIN', specs: ['Light Filtering PR22-501 (5")', 'Room Darkening PR24-501 (5")'] },
        { image: 'page073_img02_1467x2410.jpeg', chip: 'page073_img04_304x304.jpeg', colorName: 'BLADE', specs: ['Light Filtering PR22-284 (5")', 'Room Darkening PR24-284 (5")'] },
        { image: 'page074_img01_1467x2410.jpeg', chip: 'page074_img03_304x304.jpeg', colorName: 'WHITE JADE', specs: ['Light Filtering PR22-502 (5")', 'Room Darkening PR24-502 (5")'] },
        { image: 'page074_img02_1467x2410.jpeg', chip: 'page074_img04_304x304.jpeg', colorName: 'PALOMINO', specs: ['Light Filtering PR22-524 (5")', 'Room Darkening PR24-524 (5")'] },
      ],
    },
    {
      name: 'Satin Classic',
      swatches: [
        { image: 'page075_img01_1467x2410.jpeg', chip: 'page075_img03_304x304.jpeg', colorName: 'MAGNOLIA', specs: ['Light Filtering PR6-951 (5")', 'Room Darkening PR8-951 (5")'] },
        { image: 'page075_img02_1467x2410.jpeg', chip: 'page075_img04_304x304.jpeg', colorName: 'CHAMOMILE', specs: ['Light Filtering PR6-949 (5")', 'Room Darkening PR8-949 (5")'] },
        { image: 'page076_img01_1467x2410.jpeg', chip: 'page076_img03_304x304.jpeg', colorName: 'OATMEAL', specs: ['Light Filtering PR6-905 (5")', 'Room Darkening PR8-905 (5")'] },
        { image: 'page076_img02_1467x2410.jpeg', chip: 'page076_img04_304x304.jpeg', colorName: 'STONE', specs: ['Light Filtering PR6-331 (5")', 'Room Darkening PR8-331 (5")'] },
        { image: 'page077_img01_1467x2410.jpeg', chip: 'page077_img03_304x304.jpeg', colorName: 'THISTLE', specs: ['Light Filtering PR6-403 (5")', 'Room Darkening PR8-403 (5")'] },
        { image: 'page077_img02_1467x2410.jpeg', chip: 'page077_img04_304x304.jpeg', colorName: 'UMBER', specs: ['Light Filtering PR6-124 (5")', 'Room Darkening PR8-124 (5")'] },
      ],
    },
  ],
}
