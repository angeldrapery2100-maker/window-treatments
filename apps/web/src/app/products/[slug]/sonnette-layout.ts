/**
 * Sonnette\u00ae Cellular Roller Shades - Product Layout Data
 * Faithfully reproducing PDF pages 7, 8, 13, 14, 15 as scenes
 * and pages 17, 18, 19, 21, 22 as info sections.
 * Swatches organized by series in collapsible groups.
 */

import type { ProductLayout, SectionLayout, SwatchCollection } from './types'

export const sonnetteLayout: ProductLayout = {
  slug: 'sonnette',
  name: 'Sonnette\u00ae Cellular Roller Shades',
  description: 'Combining the minimalist design of a roller shade and the energy efficiency of a cellular shade, Sonnette\u00ae Cellular Roller Shades softly diffuse natural light to create a warm, comfortable glow.',

  heroImage: 'page007_img01_2994x1505.jpeg',
  heroLabel: 'Sonnette\u00ae Cellular Roller Shades',

  sections: [
    /* \u2550\u2550\u2550 Scene Pages (PDF pages 7, 8, 13, 14, 15) \u2550\u2550\u2550 */
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page007_img01_2994x1505.jpeg',
          text: 'Combining the minimalist design of a roller shade and the energy efficiency of a cellular shade, Sonnette\u00ae Cellular Roller Shades softly diffuse natural light to create a warm, comfortable glow.',
          label: 'Fabric Lenox\u2122    Color Cedarwood\nOperating System LiteRise\u00ae',
        },
        {
          image: 'page008_img01_2618x1505.jpeg',
          text: 'A fabric-covered headrail option gives Sonnette\u00ae shades an elegant and uniform appearance in the window.',
          label: 'Fabric Mackay\u2122    Color Pink Himalayan\nOperating System PowerView\u00ae Automation',
        },
        {
          image: 'page013_img01_2996x1505.jpeg',
          text: 'Layer your windows with Sonnette\u00ae shades and Design Studio\u2122 drapery to add depth and dimension, and to reflect your personal style.',
          label: 'Fabric Elan\u00ae    Color Daisy White\nOperating System LiteRise\u00ae\nDesign Studio\u2122 Drapery Fabric Diamond Geo    Color Ocean Blue',
        },
        {
          image: 'page014_img01_2427x1506.jpeg',
          text: '',
          label: 'Fabric Ainsley\u2122    Color Morocco\nOperating System Custom Clutch\nDesign Studio\u2122 Drapery Fabric Gentry    Color Wetstone',
        },
        {
          image: 'page015_img01_2995x1505.jpeg',
          text: 'With The Whole House Solution\u2122, superior color coordination between Sonnette\u00ae shades and Duette\u00ae Honeycomb Vertiglide\u2122 Shades lets you select horizontal and vertical window treatments for one space.',
          label: 'Fabric Elan\u00ae    Color Platinum\nSonnette\u00ae Operating System PowerView\u00ae Automation\nDuette\u00ae Operating System Vertiglide\u2122 with PowerView Automation',
        },
      ],
    },

    /* \u2550\u2550\u2550 Page 16: Benefits \u2550\u2550\u2550 */
    {
      type: 'card-grid',
      title: 'Benefits',
      cols: 4,
      cards: [
        {
          image: 'page016_img01_764x436.jpeg',
          title: 'Dimensional Beauty',
          desc: 'The soft curves of Sonnette\u00ae shades add visual interest and offer subtle movement in the window.',
        },
        {
          image: 'page016_img02_764x436.jpeg',
          title: 'Light Diffusion',
          desc: 'Sonnette fabrics capture natural light and diffuse it throughout the room to produce a soft, warm glow.',
        },
        {
          image: 'page016_img03_764x436.jpeg',
          title: 'Versatility',
          desc: 'The clean, simple design of Sonnette\u00ae shades allows you to customize them to fit your specific needs and style.',
        },
        {
          image: 'page016_img04_762x436.jpeg',
          title: 'Certified for Energy Efficiency',
          desc: 'Sonnette shades are rated by the Attachments Energy Rating Council (AERC) in the roller shade category for providing enhanced energy savings.',
        },
        {
          image: 'page016_img05_764x436.jpeg',
          title: 'The Whole House Solution\u2122',
          desc: 'Many Sonnette fabrics coordinate with Duette\u00ae Honeycomb Shades, so you can cover every window in your home.',
        },
        {
          image: 'page016_img06_764x436.jpeg',
          title: 'Increased Privacy',
          desc: 'When fully lowered, Sonnette shades with Kickback\u2122 retract toward the window for added privacy.',
        },
        {
          image: 'page016_img07_764x436.jpeg',
          title: 'Stylish Fabric Choices',
          desc: 'Sonnette shades are available in a wide fabric selection, in colors ranging from whites and neutrals to vibrant hues, to complement a variety of design tastes.',
        },
        {
          image: 'page016_img08_764x436.jpeg',
          title: 'Responsibly Designed',
          desc: 'Sonnette shades are GREENGUARD certified for low indoor chemical emissions.',
        },
      ],
    },

    /* \u2550\u2550\u2550 Page 17: Energy Efficiency (split-scene, scene left, 4 cards right) \u2550\u2550\u2550 */
    {
      type: 'split-scene',
      title: 'Energy Efficiency',
      sceneImage: 'page017_img01_1955x1505.jpeg',
      sceneLabel: 'Fabric Elan\u00ae    Color Mist\nOperating System PowerView\u00ae Automation',
      sceneSide: 'left',
      items: [
        {
          image: 'page017_img02_764x434.jpeg',
          label: 'Cost Savings',
          sublabel: 'Shades help control the indoor temperature, so you can spend less to heat and cool your home.',
        },
        {
          image: 'page017_img03_764x436.jpeg',
          label: 'Superior Insulation',
          sublabel: 'A proprietary insulating design features an extra layer that protects your home from harsh outdoor temperatures.',
        },
        {
          image: 'page017_img06_765x436.jpeg',
          label: 'Sustainability',
          sublabel: 'Shades may eliminate a need for artificial lighting by softly diffusing natural sunlight within a room.',
        },
        {
          image: 'page017_img07_764x436.jpeg',
          label: 'Automation Throughout the Year',
          sublabel: 'PowerView\u00ae Automation lets you schedule shades to open and close according to the sun\u2019s movements, so your home\u2019s temperature is regulated automatically.',
        },
      ],
    },

    /* \u2550\u2550\u2550 Page 18: Light Control and Privacy (comparison-grid, 2 cols) \u2550\u2550\u2550 */
    {
      type: 'comparison-grid',
      title: 'Light Control and Privacy',
      cols: 2,
      items: [
        {
          image: 'page018_img01_1619x1042.jpeg',
          label: 'Light Filtering',
          sublabel: 'Light-filtering fabrics gently diffuse light for a soft glow and provide privacy from the outside in.',
        },
        {
          image: 'page018_img02_1618x1042.jpeg',
          label: 'Room Darkening',
          sublabel: 'Room-darkening fabrics block the majority of incoming light and provide additional in-home privacy.',
        },
      ],
    },

    /* \u2550\u2550\u2550 Page 19: Operating Systems (4-column grid) \u2550\u2550\u2550 */
    {
      type: 'comparison-grid',
      title: 'Operating Systems',
      cols: 4,
      items: [
        {
          image: 'page019_img02_252x495.jpeg',
          label: 'PowerView\u00ae Automation',
          sublabel: 'Achieve your perfect light automatically. Schedule shades to close whenever you prefer. Program shades to be in the best positions throughout the day. Compatible with smart speakers and smart-home systems.',
        },
        {
          image: 'page019_img04_319x879.jpeg',
          label: 'LiteRise\u00ae',
          sublabel: 'Raise and lower the shade by simply pushing up or pulling down on the bottom rail or optional handle.',
        },
        {
          image: 'page019_img03_319x879.jpeg',
          label: 'SoftTouch\u00ae Motorization',
          sublabel: 'A battery-powered, cordless system. Gently pull down on the wand to lower shades, or lightly push up to raise them.',
        },
        {
          image: 'page019_img05_319x879.jpeg',
          label: 'Custom Clutch',
          sublabel: 'Operated on a continuous cord loop within a pulley system. Available in Standard Bracket, Designer Metal Bracket and Cassette options.',
        },
      ],
    },

    /* \u2550\u2550\u2550 Page 21: Design Options (split-scene, items left, scene right) \u2550\u2550\u2550 */
    {
      type: 'split-scene',
      title: 'Design Options',
      sceneImage: 'page021_img01_914x1505.jpeg',
      sceneLabel: 'Fabric Thatcher\u2122    Color Mountain Gray\nOperating System PowerView\u00ae Automation',
      sceneSide: 'right',
      items: [
        {
          image: 'page021_img02_764x455.jpeg',
          label: 'Front Roll with Kickback\u2122',
          sublabel: 'Sonnette\u00ae shades with Kickback retract into the window for enhanced privacy and a minimized light gap when fully lowered. Standard on SoftTouch\u00ae Motorization, PowerView\u00ae Automation and Custom Clutch.',
        },
        {
          image: 'page021_img03_763x454.jpeg',
          label: 'Textured Matte Finish Headrail',
          sublabel: 'Standard metal headrail offers a sleek, minimalist look.',
        },
        {
          image: 'page021_img04_764x454.jpeg',
          label: 'Front Roll Only',
          sublabel: 'Sonnette shades are available in a front roll only design without Kickback. Fabric will hang flush with the front of the headrail. Standard on LiteRise. Optional on SoftTouch Motorization, PowerView Automation and Custom Clutch.',
        },
        {
          image: 'page021_img05_764x454.jpeg',
          label: 'Fabric-Covered Headrail',
          sublabel: 'Upgrade to a color-coordinated fabric-wrapped headrail to create a finished look.',
        },
      ],
    },

    /* \u2550\u2550\u2550 Page 22: Mounting Profiles (split-scene, 6 items left, scene right) \u2550\u2550\u2550 */
    {
      type: 'split-scene',
      title: 'Mounting Profiles',
      sceneImage: 'page022_img01_1954x1504.jpeg',
      sceneLabel: 'Fabric Mackay\u2122    Color Iced\nOperating System PowerView\u00ae Automation',
      sceneSide: 'right',
      items: [
        {
          image: 'page022_img02_479x436.jpeg',
          label: 'Cassette Inside Mount',
          sublabel: 'Shown with Kickback\u2122',
        },
        {
          image: 'page022_img03_479x436.jpeg',
          label: 'Cassette Partial Mount',
          sublabel: 'Shown with Kickback',
        },
        {
          image: 'page022_img04_479x436.jpeg',
          label: 'Cassette Outside Mount',
          sublabel: 'Shown with Kickback',
        },
        {
          image: 'page022_img05_479x436.jpeg',
          label: 'Standard Bracket Inside Mount',
          sublabel: 'Optional only for Custom Clutch\nShown with Kickback and ceiling mount',
        },
        {
          image: 'page022_img06_479x436.jpeg',
          label: 'Standard Bracket Partial Mount',
          sublabel: 'Optional only for Custom Clutch\nShown with Kickback and ceiling mount',
        },
        {
          image: 'page022_img07_479x436.jpeg',
          label: 'Standard Bracket Outside Mount',
          sublabel: 'Optional only for Custom Clutch\nShown with Kickback and wall mount',
        },
      ],
    },
  ],

  gallery: [
    { image: 'page007_img01_2994x1505.jpeg', text: 'Combining the minimalist design of a roller shade and the energy efficiency of a cellular shade', label: 'Fabric Lenox\u2122    Color Cedarwood\nOperating System LiteRise\u00ae' },
    { image: 'page008_img01_2618x1505.jpeg', text: 'A fabric-covered headrail option gives Sonnette\u00ae shades an elegant and uniform appearance in the window.', label: 'Fabric Mackay\u2122    Color Pink Himalayan\nOperating System PowerView\u00ae Automation' },
    { image: 'page009_img01_3905x1505.jpeg', text: '', label: 'Fabric Elan\u00ae    Color Daisy White\nOperating System PowerView\u00ae Automation' },
    { image: 'page011_img01_3912x1508.jpeg', text: '', label: 'Fabric Heritage\u2122    Color Chester\nOperating System PowerView\u00ae Automation' },
    { image: 'page012_img01_2618x1506.jpeg', text: '', label: 'Fabric Lenox\u2122    Color Stone Partition\nOperating System PowerView\u00ae Automation' },
    { image: 'page013_img01_2996x1505.jpeg', text: 'Layer your windows with Sonnette\u00ae shades and Design Studio\u2122 drapery', label: 'Fabric Elan\u00ae    Color Daisy White\nOperating System LiteRise\u00ae' },
    { image: 'page014_img01_2427x1506.jpeg', text: '', label: 'Fabric Ainsley\u2122    Color Morocco\nOperating System Custom Clutch' },
    { image: 'page015_img01_2995x1505.jpeg', text: 'With The Whole House Solution\u2122, superior color coordination', label: 'Fabric Elan\u00ae    Color Platinum\nSonnette\u00ae Operating System PowerView\u00ae Automation' },
    { image: 'page017_img01_1955x1505.jpeg', text: 'Energy Efficiency', label: 'Fabric Elan\u00ae    Color Mist\nOperating System PowerView\u00ae Automation' },
    { image: 'page019_img01_1094x1505.jpeg', text: 'Operating Systems', label: 'Fabric Ainsley\u2122    Color Voyage\nOperating System PowerView\u00ae Automation' },
    { image: 'page021_img01_914x1505.jpeg', text: 'Design Options', label: 'Fabric Thatcher\u2122    Color Mountain Gray\nOperating System PowerView\u00ae Automation' },
    { image: 'page022_img01_1954x1504.jpeg', text: 'Mounting Profiles', label: 'Fabric Mackay\u2122    Color Iced\nOperating System PowerView\u00ae Automation' },
  ],

  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Colors',
    brandLabel: 'Sonnette\u00ae Cellular Roller Shades',
    items: [
      { image: 'page032_img01_147x147.jpeg', label: '082 Camel' },
      { image: 'page032_img04_147x147.jpeg', label: '180 Dove Gray' },
      { image: 'page032_img05_147x147.jpeg', label: '202 Paprika' },
      { image: 'page032_img06_147x147.jpeg', label: '220 Coconut Husk' },
      { image: 'page032_img07_147x147.jpeg', label: '226 Clove' },
      { image: 'page032_img08_147x147.jpeg', label: '241 Vine' },
      { image: 'page032_img09_147x147.jpeg', label: '324 Stone' },
      { image: 'page032_img12_147x147.jpeg', label: '372 Rose Water' },
      { image: 'page032_img13_147x147.jpeg', label: '373 Sycamore' },
      { image: 'page032_img14_147x147.jpeg', label: '374 Off Linen' },
      { image: 'page032_img15_147x147.jpeg', label: '375 Khaki' },
      { image: 'page032_img16_147x147.jpeg', label: '376 Mouse Gray' },
      { image: 'page032_img17_147x147.jpeg', label: '479 Wine' },
      { image: 'page032_img20_147x147.jpeg', label: '486 Noisette' },
      { image: 'page032_img21_147x147.jpeg', label: '496 Twilight' },
      { image: 'page032_img22_147x147.jpeg', label: '502 Glaze' },
      { image: 'page032_img23_147x147.jpeg', label: '551 Worn Leather' },
      { image: 'page032_img24_147x147.jpeg', label: '575 Gray Cloud' },
      { image: 'page032_img25_147x147.jpeg', label: '651 Duchess Gray' },
      { image: 'page032_img28_147x147.jpeg', label: '661 White Tiara' },
      { image: 'page032_img29_147x147.jpeg', label: '862 Gardenia' },
      { image: 'page032_img30_147x147.jpeg', label: '878 Frosted Ice' },
    ],
  },

  swatchCollections: [
    /* \u2550\u2550\u2550 Mackay\u2122 (SN17/SN18) - 5 colors \u2550\u2550\u2550 */
    {
      name: 'Mackay\u2122',
      swatches: [
        { image: 'page033_img01_705x1157.jpeg', colorName: 'Sheep\u2019s Wool', specs: ['Light Filtering SN17-1210', 'Room Darkening SN18-1210'] },
        { image: 'page033_img02_705x1157.jpeg', colorName: 'Pink Himalayan', specs: ['Light Filtering SN17-1211', 'Room Darkening SN18-1211'] },
        { image: 'page034_img01_705x1157.jpeg', colorName: 'Quicksand', specs: ['Light Filtering SN17-1212', 'Room Darkening SN18-1212'] },
        { image: 'page034_img02_705x1157.jpeg', colorName: 'Iced', specs: ['Light Filtering SN17-1213', 'Room Darkening SN18-1213'] },
        { image: 'page035_img01_705x1157.jpeg', colorName: 'Seal Gray', specs: ['Light Filtering SN17-1214', 'Room Darkening SN18-1214'] },
      ],
    },
    /* \u2550\u2550\u2550 Lenox\u2122 (SN19/SN20) - 7 colors \u2550\u2550\u2550 */
    {
      name: 'Lenox\u2122',
      swatches: [
        { image: 'page036_img01_705x1157.jpeg', colorName: 'Seashore', specs: ['Light Filtering SN19-1218', 'Room Darkening SN20-1218'] },
        { image: 'page036_img02_705x1157.jpeg', colorName: 'Creekbed', specs: ['Light Filtering SN19-1219', 'Room Darkening SN20-1219'] },
        { image: 'page037_img01_705x1157.jpeg', colorName: 'Manor Gray', specs: ['Light Filtering SN19-1220', 'Room Darkening SN20-1220'] },
        { image: 'page037_img02_705x1157.jpeg', colorName: 'Cedarwood', specs: ['Light Filtering SN19-1221', 'Room Darkening SN20-1221'] },
        { image: 'page038_img01_705x1157.jpeg', colorName: 'Stone Partition', specs: ['Light Filtering SN19-1223', 'Room Darkening SN20-1223'] },
        { image: 'page038_img02_705x1157.jpeg', colorName: 'Studio Clay', specs: ['Light Filtering SN19-1222', 'Room Darkening SN20-1222'] },
      ],
    },
    /* \u2550\u2550\u2550 Ainsley\u2122 (SN11/SN12) - 6 colors \u2550\u2550\u2550 */
    {
      name: 'Ainsley\u2122',
      swatches: [
        { image: 'page039_img01_705x1157.jpeg', colorName: 'Navajo White', specs: ['Light Filtering SN11-1022', 'Room Darkening SN12-1022'] },
        { image: 'page039_img02_705x1157.jpeg', colorName: 'Sage Green', specs: ['Light Filtering SN11-1021', 'Room Darkening SN12-1021'] },
        { image: 'page040_img01_705x1157.jpeg', colorName: 'Morocco', specs: ['Light Filtering SN11-1004', 'Room Darkening SN12-1004'] },
        { image: 'page040_img02_705x1157.jpeg', colorName: 'Red Rock', specs: ['Light Filtering SN11-1024', 'Room Darkening SN12-1024'] },
        { image: 'page041_img01_705x1157.jpeg', colorName: 'Grasslands', specs: ['Light Filtering SN11-1023', 'Room Darkening SN12-1023'] },
        { image: 'page041_img02_705x1157.jpeg', colorName: 'Voyage', specs: ['Light Filtering SN11-1001', 'Room Darkening SN12-1001'] },
      ],
    },
    /* \u2550\u2550\u2550 Heritage\u2122 (SN09/SN10) - 6 colors \u2550\u2550\u2550 */
    {
      name: 'Heritage\u2122',
      swatches: [
        { image: 'page042_img01_705x1157.jpeg', colorName: 'Colonial', specs: ['Light Filtering SN09-629', 'Room Darkening SN10-629'] },
        { image: 'page042_img02_705x1157.jpeg', colorName: 'Chester', specs: ['Light Filtering SN09-1002', 'Room Darkening SN10-1002'] },
        { image: 'page043_img01_705x1157.jpeg', colorName: 'Sparrow', specs: ['Light Filtering SN09-1009', 'Room Darkening SN10-1009'] },
        { image: 'page043_img02_705x1157.jpeg', colorName: 'Estate Tweed', specs: ['Light Filtering SN09-1013', 'Room Darkening SN10-1013'] },
        { image: 'page044_img01_705x1157.jpeg', colorName: 'Seaweed', specs: ['Light Filtering SN09-1025', 'Room Darkening SN10-1025'] },
        { image: 'page044_img02_705x1157.jpeg', colorName: 'Stonewash', specs: ['Light Filtering SN09-1010', 'Room Darkening SN10-1010'] },
      ],
    },
    /* \u2550\u2550\u2550 Thatcher\u2122 (SN13/SN14) - 6 colors \u2550\u2550\u2550 */
    {
      name: 'Thatcher\u2122',
      swatches: [
        { image: 'page045_img01_705x1157.jpeg', colorName: 'Stone Temple', specs: ['Light Filtering SN13-1014', 'Room Darkening SN14-1014'] },
        { image: 'page045_img02_705x1157.jpeg', colorName: 'Dove\u2019s Tail', specs: ['Light Filtering SN13-1015', 'Room Darkening SN14-1015'] },
        { image: 'page046_img01_705x1157.jpeg', colorName: 'Sedona', specs: ['Light Filtering SN13-160', 'Room Darkening SN14-160'] },
        { image: 'page046_img02_705x1157.jpeg', colorName: 'Everglades', specs: ['Light Filtering SN13-1017', 'Room Darkening SN14-1017'] },
        { image: 'page047_img01_705x1157.jpeg', colorName: 'Barque', specs: ['Light Filtering SN13-1016', 'Room Darkening SN14-1016'] },
        { image: 'page047_img02_705x1157.jpeg', colorName: 'Mountain Gray', specs: ['Light Filtering SN13-1018', 'Room Darkening SN14-1018'] },
      ],
    },
    /* \u2550\u2550\u2550 Elan\u00ae (SN01/SN02) - 30 colors \u2550\u2550\u2550 */
    {
      name: 'Elan\u00ae',
      swatches: [
        { image: 'page048_img01_705x1157.jpeg', colorName: 'Daisy White', specs: ['Light Filtering SN01-951', 'Room Darkening SN02-951'] },
        { image: 'page048_img02_705x1157.jpeg', colorName: 'First Snow', specs: ['Light Filtering SN01-121', 'Room Darkening SN02-121'] },
        { image: 'page049_img01_705x1157.jpeg', colorName: 'White Blush', specs: ['Light Filtering SN01-124', 'Room Darkening SN02-124'] },
        { image: 'page049_img02_705x1157.jpeg', colorName: 'Journal', specs: ['Light Filtering SN01-457', 'Room Darkening SN02-457'] },
        { image: 'page050_img01_705x1157.jpeg', colorName: 'Whipped Cream', specs: ['Light Filtering SN01-948', 'Room Darkening SN02-948'] },
        { image: 'page050_img02_705x1157.jpeg', colorName: 'Linen', specs: ['Light Filtering SN01-953', 'Room Darkening SN02-953'] },
        { image: 'page051_img01_705x1157.jpeg', colorName: 'Ivoire', specs: ['Light Filtering SN01-229', 'Room Darkening SN02-229'] },
        { image: 'page051_img02_705x1157.jpeg', colorName: 'Birch Bark', specs: ['Light Filtering SN01-985', 'Room Darkening SN02-985'] },
        { image: 'page052_img01_705x1157.jpeg', colorName: 'Desert Sands', specs: ['Light Filtering SN01-955', 'Room Darkening SN02-955'] },
        { image: 'page052_img02_705x1157.jpeg', colorName: 'Platinum', specs: ['Light Filtering SN01-682', 'Room Darkening SN02-682'] },
        { image: 'page053_img01_705x1157.jpeg', colorName: 'Bisque', specs: ['Light Filtering SN01-989', 'Room Darkening SN02-989'] },
        { image: 'page053_img02_705x1157.jpeg', colorName: 'Truffle', specs: ['Light Filtering SN01-686', 'Room Darkening SN02-686'] },
        { image: 'page054_img01_705x1157.jpeg', colorName: 'Mist', specs: ['Light Filtering SN01-664', 'Room Darkening SN02-664'] },
        { image: 'page054_img02_705x1157.jpeg', colorName: 'Cool Gray', specs: ['Light Filtering SN01-230', 'Room Darkening SN02-230'] },
        { image: 'page055_img01_705x1157.jpeg', colorName: 'Pearl Gray', specs: ['Light Filtering SN01-713', 'Room Darkening SN02-713'] },
        { image: 'page055_img02_705x1157.jpeg', colorName: 'Modern Gray', specs: ['Light Filtering SN01-994', 'Room Darkening SN02-994'] },
        { image: 'page056_img01_705x1157.jpeg', colorName: 'Graphite', specs: ['Light Filtering SN01-750', 'Room Darkening SN02-750'] },
        { image: 'page056_img02_705x1157.jpeg', colorName: 'Black Onyx', specs: ['Light Filtering SN01-749', 'Room Darkening SN02-749'] },
        { image: 'page057_img01_705x1157.jpeg', colorName: 'Arctic Ice', specs: ['Light Filtering SN01-242', 'Room Darkening SN02-242'] },
        { image: 'page057_img02_705x1157.jpeg', colorName: 'Fog', specs: ['Light Filtering SN01-477', 'Room Darkening SN02-477'] },
        { image: 'page058_img01_705x1157.jpeg', colorName: 'Still Creek', specs: ['Light Filtering SN01-585', 'Room Darkening SN02-585'] },
        { image: 'page058_img02_705x1157.jpeg', colorName: 'Heather Taupe', specs: ['Light Filtering SN01-150', 'Room Darkening SN02-150'] },
        { image: 'page059_img01_705x1157.jpeg', colorName: 'Weathered Navy', specs: ['Light Filtering SN01-594', 'Room Darkening SN02-594'] },
        { image: 'page059_img02_705x1157.jpeg', colorName: 'Spanish Moss', specs: ['Light Filtering SN01-708', 'Room Darkening SN02-708'] },
        { image: 'page060_img01_705x1157.jpeg', colorName: 'Salmon', specs: ['Light Filtering SN01-1007', 'Room Darkening SN02-1007'] },
        { image: 'page060_img02_705x1157.jpeg', colorName: 'Watercolor', specs: ['Light Filtering SN01-012', 'Room Darkening SN02-012'] },
        { image: 'page061_img01_705x1157.jpeg', colorName: 'Cider', specs: ['Light Filtering SN01-258', 'Room Darkening SN02-258'] },
        { image: 'page061_img02_705x1157.jpeg', colorName: 'Mahogany', specs: ['Light Filtering SN01-1207', 'Room Darkening SN02-1207'] },
        { image: 'page062_img01_705x1157.jpeg', colorName: 'Toasted Almond', specs: ['Light Filtering SN01-687', 'Room Darkening SN02-687'] },
        { image: 'page062_img02_705x1157.jpeg', colorName: 'Farmhouse Red', specs: ['Light Filtering SN01-726', 'Room Darkening SN02-726'] },
      ],
    },
    /* \u2550\u2550\u2550 Textura\u2122 (SN03/SN04) - 6 colors \u2550\u2550\u2550 */
    {
      name: 'Textura\u2122',
      swatches: [
        { image: 'page063_img01_705x1157.jpeg', colorName: 'Diamond', specs: ['Light Filtering SN03-616', 'Room Darkening SN04-616'] },
        { image: 'page063_img02_705x1157.jpeg', colorName: 'Silver Streak', specs: ['Light Filtering SN03-1012', 'Room Darkening SN04-1012'] },
        { image: 'page064_img01_705x1157.jpeg', colorName: 'Polished Pearl', specs: ['Light Filtering SN03-1005', 'Room Darkening SN04-1005'] },
        { image: 'page064_img02_705x1157.jpeg', colorName: 'Rose Gold', specs: ['Light Filtering SN03-088', 'Room Darkening SN04-088'] },
        { image: 'page065_img01_705x1157.jpeg', colorName: 'Frost', specs: ['Light Filtering SN03-600', 'Room Darkening SN04-600'] },
        { image: 'page065_img02_705x1157.jpeg', colorName: 'Reflection', specs: ['Light Filtering SN03-603', 'Room Darkening SN04-603'] },
      ],
    },
    /* \u2550\u2550\u2550 Highline\u00ae (SN07/SN08) - 6 colors \u2550\u2550\u2550 */
    {
      name: 'Highline\u00ae',
      swatches: [
        { image: 'page066_img01_705x1157.jpeg', colorName: 'Warm Taupe', specs: ['Light Filtering SN07-1208', 'Room Darkening SN08-1208'] },
        { image: 'page066_img02_705x1157.jpeg', colorName: 'Rock Cliff', specs: ['Light Filtering SN07-1209', 'Room Darkening SN08-1209'] },
        { image: 'page067_img01_705x1157.jpeg', colorName: 'French Beige', specs: ['Light Filtering SN07-326', 'Room Darkening SN08-326'] },
        { image: 'page067_img02_705x1157.jpeg', colorName: 'Stainless Steel', specs: ['Light Filtering SN07-329', 'Room Darkening SN08-329'] },
        { image: 'page068_img01_705x1157.jpeg', colorName: 'Caf\u00e9 au Lait', specs: ['Light Filtering SN07-327', 'Room Darkening SN08-327'] },
        { image: 'page068_img02_705x1157.jpeg', colorName: 'Limestone', specs: ['Light Filtering SN07-328', 'Room Darkening SN08-328'] },
      ],
    },
    /* \u2550\u2550\u2550 Mackay\u2122 + Textura\u2122 (SN05/SN06) - 6 colors \u2550\u2550\u2550 */
    {
      name: 'Mackay\u2122 + Textura\u2122',
      swatches: [
        { image: 'page069_img01_705x1157.jpeg', colorName: 'Daisy White', specs: ['Light Filtering SN05-951', 'Room Darkening SN06-951'] },
        { image: 'page069_img02_705x1157.jpeg', colorName: 'Journal', specs: ['Light Filtering SN05-457', 'Room Darkening SN06-457'] },
        { image: 'page070_img01_705x1157.jpeg', colorName: 'Desert Sands', specs: ['Light Filtering SN05-955', 'Room Darkening SN06-955'] },
        { image: 'page070_img02_705x1157.jpeg', colorName: 'Burlap', specs: ['Light Filtering SN05-241', 'Room Darkening SN06-241'] },
        { image: 'page071_img01_705x1157.jpeg', colorName: 'Pearl Gray', specs: ['Light Filtering SN05-713', 'Room Darkening SN06-713'] },
        { image: 'page071_img02_705x1157.jpeg', colorName: 'Creek Stone', specs: ['Light Filtering SN05-235', 'Room Darkening SN06-235'] },
      ],
    },
  ],

  cellSize: null,
  opacity: null,
  edgeBanding: null,
  liner: null,
}
