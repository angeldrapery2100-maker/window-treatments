/**
 * Aria\u2122 Soft Blinds - Product Layout Data
 * Rebuilt from PDF pages 7-17, 19 with accurate content mapping
 */

import type { ProductLayout, SectionLayout, SwatchCollection } from './types'

export const ariaLayout: ProductLayout = {
  slug: 'aria',
  name: 'Aria\u2122 Soft Blinds',
  description: 'A first of its kind, Aria\u2122 Soft Blinds are crafted of elegantly textured fabric, giving you a variety of design options that transform natural light while creating beautiful interiors.',

  heroImage: 'page002_img01_2105x1505.jpeg',
  heroLabel: 'Aria\u2122 Soft Blinds',

  sections: [
    // ======== Pages 7-14: Scene Pairs (8 room scenes) ========
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page007_img02_3049x1505.jpeg',
          text: 'Our window treatments do more than look good. They transform natural light, creating beautiful interiors.',
          label: 'Fabric Elan\u00ae \u00a0 Color Pearl Gray\nControl Option LiteRise\u00ae with EasyTilt\u2122 control',
        },
        {
          image: 'page008_img01_3061x1505.jpeg',
          text: 'A first of its kind, Aria\u2122 Soft Blinds are crafted of elegantly textured fabric, giving you a variety of design options.',
          label: '',
        },
        {
          image: 'page009_img01_3042x1505.jpeg',
          text: 'The unique light dimming feature provides two opacities in one blind, for versatile light control.',
          label: '',
        },
        {
          image: 'page010_img01_3042x1505.jpeg',
          text: 'Aria\u2122 blinds are free of operating cords, making this blind a safer option for homes with children.',
          label: '',
        },
        {
          image: 'page011_img01_3905x1505.jpeg',
          text: '',
          label: 'Fabric Elan\u00ae \u00a0 Color Solitude\nControl Option LiteRise\u00ae with EasyTilt\u2122 control',
        },
        {
          image: 'page012_img01_3905x1505.jpeg',
          text: '',
          label: 'Fabric Elan\u00ae \u00a0 Color Aspen Snow\nControl Option LiteRise\u00ae with EasyTilt\u2122 control',
        },
        {
          image: 'page013_img01_3905x1505.jpeg',
          text: '',
          label: 'Fabric Highline\u00ae \u00a0 Color Desert Sands\nControl Option LiteRise\u00ae with EasyTilt\u2122 control',
        },
        {
          image: 'page014_img01_3040x1504.jpeg',
          text: 'Create a cohesive look in a room with The Whole House Solution\u2122, which pairs horizontal blinds with vertical solutions.',
          label: '',
        },
      ],
    },

    // ======== Page 15: Benefits (3 cols \u00d7 2 rows) ========
    {
      type: 'card-grid',
      title: 'Benefits',
      cols: 3,
      cards: [
        { image: 'page015_img02_774x453.jpeg', title: 'Soft, Natural Light', desc: 'Unique fabric slats create a soft, even glow\u2014unlike the slats of traditional blinds.' },
        { image: 'page015_img03_765x436.jpeg', title: 'Expansive View', desc: 'Streamlined design provides an optimal view, without lifting the blind.' },
        { image: 'page015_img04_762x436.jpeg', title: 'Easy Operation', desc: 'Adjust slats with an innovative, new tilt bar\u2014no twisting necessary.' },
        { image: 'page015_img05_1618x436.jpeg', title: 'Flexible Light Control', desc: 'Create just the right amount of light by tilting the fabric slats in either direction.' },
        { image: 'page015_img06_760x436.jpeg', title: 'Enhanced Privacy', desc: 'Enjoy enhanced privacy thanks to the routeless design combined with tight closing fabric slats.' },
        { image: 'page015_img07_765x436.jpeg', title: 'Fits Extra Large Windows', desc: 'The wider widths of Aria\u2122 blinds make them distinctly different\u2014and perfect for extra large windows.' },
      ],
    },

    // ======== Page 16 Left: Slat Tilt Positions (2 cols \u00d7 2 rows) ========
    {
      type: 'comparison-grid',
      title: 'Slat Tilt Positions',
      cols: 2,
      items: [
        { image: 'page016_img01_764x455.jpeg', label: 'Slats Tilted Open 50%', sublabel: '' },
        { image: 'page016_img02_764x455.jpeg', label: 'Slats Open, Tilted Down 25%', sublabel: '' },
        { image: 'page016_img05_764x455.jpeg', label: 'Slats Open, Tilted Down 75%', sublabel: '' },
        { image: 'page016_img06_764x455.jpeg', label: 'Slats Closed, Tilted Down 100%', sublabel: '' },
      ],
    },

    // ======== Page 16 Right: Shade Options (2 cols) ========
    {
      type: 'comparison-grid',
      title: 'Shade Options',
      cols: 2,
      items: [
        { image: 'page016_img03_573x1038.jpeg', label: 'Light Filtering Shade Option', sublabel: 'Soft fabric slats transform light into a gentle radiance.' },
        { image: 'page016_img04_953x1038.jpeg', label: 'Light Dimming Shade Option', sublabel: 'Two opacities in one: Tilt slats down for dimming and up for room darkening.' },
      ],
    },

    // ======== Page 17: Control Systems ========
    {
      type: 'control-systems',
      sceneImage: 'page017_img01_1092x1505.jpeg',
      sceneLabel: '',
      panels: [
        {
          title: 'PowerView\u00ae Automation',
          image: 'page017_img02_337x578.jpeg',
          features: [
            { title: 'Convenience', desc: 'Achieve your perfect light automatically' },
            { title: 'Privacy', desc: 'Schedule blinds to close whenever you prefer' },
            { title: 'Energy Efficiency', desc: 'Program blinds to be in the best positions throughout the day' },
            { title: 'Security', desc: 'Remote control gives the illusion that you\'re always home' },
            { title: 'Child Friendly', desc: 'Simple, cord-free operation' },
          ],
        },
        {
          title: 'Operating Systems',
          items: [
            { image: 'page017_img03_455x1038.jpeg', title: 'LiteRise\u00ae System', desc: 'Push up and pull down to raise and lower the blind.' },
            { image: 'page017_img04_455x1038.jpeg', title: 'EasyTilt\u2122 System', desc: 'Push or pull the tilt bar to tilt the slats.' },
          ],
        },
      ],
    },

    // ======== Page 19: Mounting Options ========
    {
      type: 'mounting-grid',
      title: 'Mounting Options',
      rows: [
        {
          items: [
            { image: 'page019_img02_764x464.jpeg', label: 'Inside Mount' },
            { image: 'page019_img03_764x464.jpeg', label: 'Partial Mount' },
            { image: 'page019_img04_764x464.jpeg', label: 'Outside Mount' },
          ],
        },
      ],
    },
  ],

  // ======== Gallery (8 images from non-section pages) ========
  gallery: [
    { image: 'page005_img01_1984x1546.jpeg', text: '', label: '' },
    { image: 'page006_img01_2181x1505.jpeg', text: '', label: '' },
    { image: 'page011_img01_3905x1505.jpeg', text: '', label: '' },
    { image: 'page012_img01_3905x1505.jpeg', text: '', label: '' },
    { image: 'page013_img01_3905x1505.jpeg', text: '', label: '' },
    { image: 'page015_img01_1755x1575.jpeg', text: '', label: '' },
    { image: 'page018_img01_3042x1505.jpeg', text: '', label: '' },
    { image: 'page020_img01_1973x1505.jpeg', text: '', label: '' },
  ],

  // ======== Hardware Colors (page 26, 8 unique chips) ========
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Aria\u2122 Soft Blinds',
    items: [
      { image: 'page026_img01_306x306.jpeg', label: '066 Almost White' },
      { image: 'page026_img02_306x306.jpeg', label: '180 Dove Gray' },
      { image: 'page026_img03_306x306.jpeg', label: '320 Rich Cream' },
      { image: 'page026_img04_306x306.jpeg', label: '375 Khaki' },
      { image: 'page026_img05_306x306.jpeg', label: '575 Gray Cloud' },
      { image: 'page026_img06_306x306.jpeg', label: '661 White Tiara' },
      { image: 'page026_img07_306x306.jpeg', label: '669 Beijing Gray' },
      { image: 'page026_img08_306x306.jpeg', label: '981 Platinum Gray' },
    ],
  },

  // ======== Swatch Collections (pages 27-38, 12 colors \u00d7 2 fabrics each) ========
  swatchCollections: [
    {
      name: 'Daisy White',
      swatches: [
        { image: 'page027_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-951', 'Light Dimming AR02-951'] },
        { image: 'page027_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-951', 'Light Dimming AR04-951'] },
      ],
    },
    {
      name: 'Aspen Snow',
      swatches: [
        { image: 'page028_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-922', 'Light Dimming AR02-922'] },
        { image: 'page028_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-922', 'Light Dimming AR04-922'] },
      ],
    },
    {
      name: 'Wind Chill',
      swatches: [
        { image: 'page029_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-1278', 'Light Dimming AR02-1278'] },
        { image: 'page029_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-1278', 'Light Dimming AR04-1278'] },
      ],
    },
    {
      name: 'Journal',
      swatches: [
        { image: 'page030_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-457', 'Light Dimming AR02-457'] },
        { image: 'page030_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-457', 'Light Dimming AR04-457'] },
      ],
    },
    {
      name: 'Linen',
      swatches: [
        { image: 'page031_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-953', 'Light Dimming AR02-953'] },
        { image: 'page031_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-953', 'Light Dimming AR04-953'] },
      ],
    },
    {
      name: 'Swan',
      swatches: [
        { image: 'page032_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-1226', 'Light Dimming AR02-1226'] },
        { image: 'page032_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-1226', 'Light Dimming AR04-1226'] },
      ],
    },
    {
      name: 'Birch Bark',
      swatches: [
        { image: 'page033_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-985', 'Light Dimming AR02-985'] },
        { image: 'page033_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-985', 'Light Dimming AR04-985'] },
      ],
    },
    {
      name: 'Desert Sands',
      swatches: [
        { image: 'page034_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-955', 'Light Dimming AR02-955'] },
        { image: 'page034_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-955', 'Light Dimming AR04-955'] },
      ],
    },
    {
      name: 'Platinum',
      swatches: [
        { image: 'page035_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-682', 'Light Dimming AR02-682'] },
        { image: 'page035_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-682', 'Light Dimming AR04-682'] },
      ],
    },
    {
      name: 'Solitude',
      swatches: [
        { image: 'page036_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-480', 'Light Dimming AR02-480'] },
        { image: 'page036_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-480', 'Light Dimming AR04-480'] },
      ],
    },
    {
      name: 'Calvary',
      swatches: [
        { image: 'page037_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-1279', 'Light Dimming AR02-1279'] },
        { image: 'page037_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-1279', 'Light Dimming AR04-1279'] },
      ],
    },
    {
      name: 'Pearl Gray',
      swatches: [
        { image: 'page038_img02_618x1028.jpeg', colorName: 'Highline\u00ae', specs: ['Light Filtering AR01-713', 'Light Dimming AR02-713'] },
        { image: 'page038_img01_618x1028.jpeg', colorName: 'Elan\u00ae', specs: ['Light Filtering AR03-713', 'Light Dimming AR04-713'] },
      ],
    },
  ],

  cellSize: null,
  opacity: null,
  edgeBanding: null,
  liner: null,
}
