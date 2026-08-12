/**
 * Applause® Honeycomb Shades - 手动配对的页面布局数据
 * 图片已按页面位置顺序重新编号 (re-extract-applause.py)
 * img01 = 页面最左上, 从左到右从上到下递增
 *
 * Also exports shared type definitions used by all product layouts.
 */

export interface CardItem {
  image: string
  title: string
  desc: string
}

export interface ImageLabel {
  image: string
  label: string
  sublabel?: string
}

export interface SwatchItem {
  image: string
  chip?: string
  colorName: string
  specs: string[]
}

export interface SwatchCollection {
  name: string
  swatches: SwatchItem[]
}

export interface ControlFeature {
  title: string
  desc: string
}

export interface ControlSystemPanel {
  title: string
  image?: string
  features?: ControlFeature[]
  items?: { image: string; title: string; desc: string }[]
  footnote?: string
}

export type SectionLayout =
  | { type: 'hero'; image: string; label: string }
  | { type: 'scene-pair'; scenes: { image: string; text: string; label: string }[] }
  | { type: 'card-grid'; title: string; cols: number; cards: CardItem[] }
  | { type: 'comparison-grid'; title: string; subtitle?: string; cols: number; items: ImageLabel[] }
  | { type: 'image-label-grid'; title: string; cols: number; items: ImageLabel[] }
  | { type: 'mounting-grid'; title: string; rows: { items: ImageLabel[] }[] }
  | { type: 'cell-size'; title: string; brandLabel: string; items: ImageLabel[] }
  | { type: 'hardware-colors'; title: string; brandLabel: string; items: ImageLabel[] }
  | { type: 'control-systems'; panels: ControlSystemPanel[]; sceneImage: string; sceneLabel: string }

export interface ApplauseLayout {
  slug: string
  name: string
  description: string
  heroImage: string
  heroLabel: string
  sections: SectionLayout[]
  gallery: { image: string; text: string; label: string }[]
  cellSize: SectionLayout | null
  hardwareColors: SectionLayout | null
  swatchCollections: SwatchCollection[]
}

export const applauseLayout: ApplauseLayout = {
  slug: 'applause',
  name: 'Applause® Honeycomb Shades',
  description: 'Applause® Honeycomb Shades offer a simplified selection of beautiful fabrics and colors with the energy-efficient honeycomb construction.',

  heroImage: 'page006_img01_2930x1506.jpeg',
  heroLabel: 'Fabric Sunterra™    Color New Noir\nOperating System PowerView® Automation',

  sections: [
    // ──── Scene Pairs (pages 7-13) — text/label from PDF ────
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page007_img01_3043x1505.jpeg',
          text: 'From the makers of Duette®, energy-efficient Applause® Honeycomb Shades are available in a selection of on-trend fabrics.',
          label: 'Fabric Amity™    Color Grayscale',
        },
        {
          image: 'page008_img01_3045x1505.jpeg',
          text: 'The Applause® Amity™ fabric collection features an innovative print providing the look of stunning texture.',
          label: 'Fabric Amity™    Color Grayscale\nOperating System PowerView® Automation',
        },
        {
          image: 'page009_img01_3905x1505.jpeg',
          text: 'With the Duolite® design option, two fabric opacities are combined in a single headrail for the ultimate in light control and privacy.',
          label: 'Fabric Crystalline™ Sheer    Color Rock Crystal\nFabric Legends™    Color Lakehouse\nOperating System PowerView® Automation\nDesign Option Duolite®',
        },
        {
          image: 'page012_img01_3042x1505.jpeg',
          text: 'Combine your Applause® shades with coordinating Design Studio™ drapery or side panels for added energy efficiency and a layered look at the window.',
          label: 'Fabric Sunterra™    Color Cornucopia\nDesign Studio™ Drapery Fabric Esmery    Color Cottage\nOperating System PowerView® Automation\nDesign Option Top-Down/Bottom-Up (Not available in Canada)',
        },
        {
          image: 'page013_img01_3047x1507.jpeg',
          text: 'Applause® shades are offered as a Whole House Solution™ for vertical and horizontal applications.',
          label: 'Fabric Kinship™    Color Mystic\nOperating System PowerView® Automation, Vertiglide™',
        },
      ],
    },

    // ──── Benefits - page 14 (8 cards, 4×2) ────
    {
      type: 'card-grid',
      title: 'Benefits',
      cols: 4,
      cards: [
        { image: 'page014_img01_765x436.jpeg', title: 'Stylish Fabrics', desc: 'Choose from an on-trend collection of fabrics in a contemporary color palette.' },
        { image: 'page014_img02_763x436.jpeg', title: 'Simplified Offering', desc: 'Easily find your perfect Applause® shade with a streamlined selection of pleat sizes, opacities and operating systems.' },
        { image: 'page014_img03_765x436.jpeg', title: 'Noise Reduction', desc: 'Applause® shades absorb sound energy, helping to create a more tranquil room.' },
        { image: 'page014_img04_764x436.jpeg', title: 'Care and Cleaning', desc: 'To ensure lasting beauty, all Applause shades are anti-static, dust and soil resistant, and easy to clean.' },
        { image: 'page014_img05_764x436.jpeg', title: 'Durable Headrail Finishes', desc: 'Textured matte headrails are color coordinated to the fabric for a cohesive design.' },
        { image: 'page014_img06_764x437.jpeg', title: 'Expansive Sizes, Small Stack', desc: 'Applause shades are engineered to fit expansive windows with minimal stack, allowing for unobstructed views.' },
        { image: 'page014_img07_764x433.jpeg', title: 'Specialty Shapes', desc: 'From arches to angles to trapezoids, Applause shades can cover a wide variety of window shapes and sizes.' },
        { image: 'page014_img08_764x436.jpeg', title: 'Sustainability', desc: 'The Applause Vintage™ fabric collection is innovatively crafted with 40% recycled materials.' },
      ],
    },

    // ──── Light Control - page 16 (4 comparison) ────
    {
      type: 'comparison-grid',
      title: 'Light Control',
      cols: 4,
      items: [
        { image: 'page016_img02_764x455.jpeg', label: 'Sheer' },
        { image: 'page016_img03_764x455.jpeg', label: 'Semi-Sheer' },
        { image: 'page016_img04_762x455.jpeg', label: 'Light Filtering' },
        { image: 'page016_img05_764x455.jpeg', label: 'Room Darkening' },
      ],
    },

    // ──── Duolite® - page 17 ────
    {
      type: 'comparison-grid',
      title: 'Duolite® Dual Opacity Option',
      cols: 2,
      items: [
        { image: 'page017_img02_765x1015.jpeg', label: 'Duolite® Light Filtering', sublabel: 'Two opacities on a single headrail for complete light control.' },
        { image: 'page017_img03_765x1017.jpeg', label: 'Duolite® Room Darkening', sublabel: 'Pair a light-filtering front with a room-darkening back.' },
      ],
    },

    // ──── PowerView + Operating Systems - page 18 ────
    {
      type: 'control-systems',
      panels: [
        {
          title: 'PowerView® Automation',
          image: 'page018_img02_484x829.jpeg',
          features: [
            { title: 'Convenience', desc: 'Achieve your perfect light automatically.' },
            { title: 'Privacy', desc: 'Schedule shadings to close whenever you prefer.' },
            { title: 'Energy Efficiency', desc: 'Program shadings to be in the best positions throughout the day.' },
            { title: 'Security', desc: 'Remote control gives the illusion that you\'re always home.' },
            { title: 'Child Friendly', desc: 'Simple, cord-free operation.' },
            { title: 'Battery Powered or Hardwired', desc: 'For seamless installation, operation and maintenance.' },
            { title: 'Voice Control', desc: 'Compatible with smart speakers and smart-home systems.' },
          ],
          footnote: 'For more details on PowerView, visit hunterdouglas.com/powerview-design-options',
        },
        {
          title: 'Operating Systems',
          items: [
            { image: 'page018_img03_319x900.jpeg', title: 'LiteRise®', desc: 'This cordless system lifts and lowers shades with the touch of a finger.' },
            { image: 'page018_img04_319x903.jpeg', title: 'UltraGlide®', desc: 'Gently pull a single retractable wand to lift and lower shades.' },
          ],
        },
      ],
      sceneImage: 'page018_img01_1094x1505.jpeg',
      sceneLabel: '',
    },


    // ──── Design Options - page 20 (8 cards, 4×2) ────
    {
      type: 'card-grid',
      title: 'Design Options',
      cols: 4,
      cards: [
        { image: 'page020_img01_764x436.jpeg', title: 'Two-On-One Headrail', desc: 'Two individually operated shades on a single headrail for a clean appearance on wide or adjacent windows.' },
        { image: 'page020_img02_761x436.jpeg', title: 'Top-Down/Bottom-Up', desc: 'Raise from the bottom or lower from the top for a greater range of light control and privacy.' },
        { image: 'page020_img03_765x437.jpeg', title: 'Specialty Shapes', desc: 'From arches to angles, Applause® shades can cover many specialty window shapes.' },
        { image: 'page020_img04_765x436.jpeg', title: 'Doors and Sidelights', desc: 'Applause shades can be installed on French doors and sidelights for a uniform look.' },
        { image: 'page020_img05_764x436.jpeg', title: 'TrackGlide™', desc: 'TrackGlide™ system keeps shades secure during tilt-turn window operation. Available with LiteRise®.' },
        { image: 'page020_img06_764x437.jpeg', title: 'SkyLift™', desc: 'Motorized operation specifically designed for skylights and other hard-to-reach windows.' },
        { image: 'page020_img07_765x436.jpeg', title: 'Simplicity™', desc: 'A manual skylight system with a telescoping pole for raising and lowering shades in hard-to-reach windows.' },
        { image: 'page020_img08_766x439.jpeg', title: 'Vertiglide™', desc: 'Side-to-side operation for sliding glass doors, patio doors, and other vertical applications.' },
      ],
    },

    // ──── Mounting - page 21 ────
    {
      type: 'mounting-grid',
      title: 'Mounting Profiles',
      rows: [
        {
          items: [
            { image: 'page021_img01_764x436.jpeg', label: 'Inside Mount ¾"' },
            { image: 'page021_img02_764x436.jpeg', label: 'Outside Mount ¾"' },
            { image: 'page021_img03_764x436.jpeg', label: 'Partial Mount ¾"' },
          ],
        },
        {
          items: [
            { image: 'page021_img04_764x436.jpeg', label: 'Inside Mount 1¼"' },
            { image: 'page021_img05_765x436.jpeg', label: 'Outside Mount 1¼"' },
            { image: 'page021_img06_764x436.jpeg', label: 'Partial Mount 1¼"' },
            { image: 'page021_img07_764x436.jpeg', label: 'Vertiglide™ Mount' },
          ],
        },
      ],
    },

    // ──── Additional Details - page 22 ────
    {
      type: 'comparison-grid',
      title: 'Additional Details',
      cols: 3,
      items: [
        { image: 'page022_img01_764x453.jpeg', label: 'Valance Options' },
        { image: 'page022_img02_765x455.jpeg', label: 'Bottom Rail Options' },
        { image: 'page022_img03_764x455.jpeg', label: 'Fabric Wrapped Bottom Rail' },
        { image: 'page022_img04_764x455.jpeg', label: 'Standard Bottom Rail' },
        { image: 'page022_img05_764x454.jpeg', label: 'Front Valance' },
        { image: 'page022_img06_764x454.jpeg', label: 'Contoured Valance' },
      ],
    },
  ],

  // ──── Gallery (scene/lifestyle images with PDF labels) ────
  gallery: [
    { image: 'page002_img01_2105x1505.jpeg', text: '', label: 'Applause® Honeycomb Shades' },
    { image: 'page005_img01_1955x1506.jpeg', text: '', label: '' },
    { image: 'page005_img02_978x1505.jpeg', text: '', label: '' },
    { image: 'page010_img01_2618x1505.jpeg', text: '', label: '' },
    { image: 'page010_img02_764x1013.jpeg', text: '', label: '' },
    { image: 'page011_img01_1955x1505.jpeg', text: '', label: 'Fabric Vintage™    Color Café Au Lait\nOpacity Light Filtering\nOperating System LiteRise®' },
    { image: 'page011_img02_1236x836.jpeg', text: '', label: '' },
    { image: 'page015_img01_1953x1504.jpeg', text: 'Year-Round Comfort', label: 'Fabric Kinship™    Color Beach Glass\nOperating System LiteRise®' },
    { image: 'page016_img01_1952x1503.jpeg', text: 'Light Control and Privacy', label: 'Fabric Crystalline™ Sheer    Color Rock Crystal\nFabric Legends™    Color Pearl\nOperating System PowerView® Automation, Vertiglide™ Split Stack\nDesign Option Duolite®' },
    { image: 'page017_img01_1951x1505.jpeg', text: 'Duolite® Dual Opacity Option', label: 'Fabric Crystalline™ Sheer    Color Rock Crystal\nFabric Vintage™    Color Aged Onyx\nOperating System PowerView® Automation\nDesign Option Duolite®' },
    { image: 'page023_img01_1953x1505.jpeg', text: '', label: 'Fabric Vintage™    Color Weathered Windmill\nOperating System PowerView® Automation\nDesign Option Top-Down/Bottom-Up' },
  ],

  // ──── Cell Size ────
  cellSize: {
    type: 'cell-size',
    title: 'Cell Size and Opacity',
    brandLabel: 'Applause® Honeycomb Shades',
    items: [
      { image: 'page025_img01_3009x2428.jpeg', label: '' },
      { image: 'page026_img01_3009x3010.jpeg', label: '¾" & Double Cell' },
    ],
  },

  // ──── Hardware Colors (page 33) — 2026-08-12 按 PDF Hardware Color Guide 阅读顺序重建 ────
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Applause® Honeycomb Shades',
    items: [
      { image: 'page033_img01_306x306.jpeg', label: '048 Black' },
      { image: 'page033_img02_306x306.jpeg', label: '135 Whispering Heather' },
      { image: 'page033_img03_306x306.jpeg', label: '180 Dove Gray' },
      { image: 'page033_img04_306x306.jpeg', label: '202 Paprika' },
      { image: 'page033_img05_306x306.jpeg', label: '205 Fawn' },
      { image: 'page033_img06_306x306.jpeg', label: '218 Peppercorn' },
      { image: 'page033_img07_306x306.jpeg', label: '221 Aspen Snow' },
      { image: 'page033_img08_306x306.jpeg', label: '276 Silverado' },
      { image: 'page033_img09_306x306.jpeg', label: '320 Rich Cream' },
      { image: 'page033_img10_306x306.jpeg', label: '323 Pumpkin' },
      { image: 'page033_img11_306x306.jpeg', label: '324 Stone' },
      { image: 'page033_img12_306x306.jpeg', label: '466 Honey Maple' },
      { image: 'page033_img13_306x306.jpeg', label: '556 Woven Basket' },
      { image: 'page033_img14_306x306.jpeg', label: '575 Gray Cloud' },
      { image: 'page033_img15_306x306.jpeg', label: '578 Mediterranean Breeze' },
      { image: 'page033_img16_306x306.jpeg', label: '580 Midnight Oil' },
      { image: 'page033_img17_306x306.jpeg', label: '609 Falcon Gray' },
      { image: 'page033_img18_306x306.jpeg', label: '661 White Tiara' },
      { image: 'page033_img19_306x306.jpeg', label: '669 Beijing Gray' },
      { image: 'page033_img20_306x306.jpeg', label: '683 Pearl Gray' },
      { image: 'page033_img21_306x306.jpeg', label: '685 Blue Sky' },
      { image: 'page033_img22_306x306.jpeg', label: '689 Ash' },
      { image: 'page033_img23_306x306.jpeg', label: '758 Shimmering Ocean' },
      { image: 'page033_img24_306x306.jpeg', label: '785 Aspen White' },
      { image: 'page033_img25_306x306.jpeg', label: '810 Mushroom' },
      { image: 'page033_img26_306x306.jpeg', label: '841 Dark Blonde' },
      { image: 'page033_img27_306x306.jpeg', label: '849 Mocha' },
      { image: 'page033_img28_306x306.jpeg', label: '862 Gardenia White' },
      { image: 'page033_img29_306x306.jpeg', label: '878 Frosted Ice' },
      { image: 'page033_img30_306x306.jpeg', label: '882 Honey Bisque' },
    ],
  },

  // ──── Swatch Collections (pages 35-75) — 2026-08-12 与 hd-applause-digital-sample-book.pdf Color Chart 逐行核对重建 ────
  swatchCollections: [
    {
      name: 'Crystalline™ Sheer',
      swatches: [
        { image: 'page035_img01_475x825.jpeg', colorName: 'Rock Crystal', specs: ['Sheer E20-513 (¾")'] },
        { image: 'page035_img02_475x825.jpeg', colorName: 'Rose Quartz', specs: ['Sheer E20-514 (¾")'] },
        { image: 'page036_img01_475x825.jpeg', colorName: 'Sheer Citrine', specs: ['Sheer E20-515 (¾")'] },
      ],
    },
    {
      name: 'Vintage™',
      swatches: [
        { image: 'page037_img01_475x825.jpeg', colorName: 'Igloo', specs: ['Light Filtering E50-1248 (¾")', 'Room Darkening E51-1248 (¾")'] },
        { image: 'page037_img02_475x825.jpeg', colorName: 'Retro White', specs: ['Light Filtering E50-300 (¾")', 'Room Darkening E51-300 (¾")'] },
        { image: 'page038_img01_475x825.jpeg', colorName: 'Tea Biscuit', specs: ['Light Filtering E50-303 (¾")', 'Room Darkening E51-303 (¾")'] },
        { image: 'page038_img02_475x825.jpeg', colorName: 'Potpourri', specs: ['Light Filtering E50-309 (¾")', 'Room Darkening E51-309 (¾")'] },
        { image: 'page039_img01_475x825.jpeg', colorName: 'Tintype', specs: ['Light Filtering E50-308 (¾")', 'Room Darkening E51-308 (¾")'] },
        { image: 'page039_img02_475x825.jpeg', colorName: 'Café Au Lait', specs: ['Light Filtering E50-327 (¾")', 'Room Darkening E51-327 (¾")'] },
        { image: 'page040_img01_475x825.jpeg', colorName: 'Cadium', specs: ['Light Filtering E50-1249 (¾")', 'Room Darkening E51-1249 (¾")'] },
        { image: 'page040_img02_475x825.jpeg', colorName: 'Pearl Gray', specs: ['Light Filtering E50-713 (¾")', 'Room Darkening E51-713 (¾")'] },
        { image: 'page041_img01_475x825.jpeg', colorName: 'Pencil Sketch', specs: ['Light Filtering E50-313 (¾")', 'Room Darkening E51-313 (¾")'] },
        { image: 'page041_img02_475x825.jpeg', colorName: 'Weathered Windmill', specs: ['Light Filtering E50-312 (¾")', 'Room Darkening E51-312 (¾")'] },
        { image: 'page042_img01_475x825.jpeg', colorName: 'Aged Onyx', specs: ['Light Filtering E50-311 (¾")', 'Room Darkening E51-311 (¾")'] },
        { image: 'page042_img02_475x825.jpeg', colorName: 'Sepia', specs: ['Light Filtering E50-310 (¾")', 'Room Darkening E51-310 (¾")'] },
      ],
    },
    {
      name: 'Amity™',
      swatches: [
        { image: 'page043_img01_475x825.jpeg', colorName: 'Bay Salt', specs: ['Light Filtering E54-1270 (¾")', 'Room Darkening E55-1270 (¾")'] },
        { image: 'page043_img02_475x825.jpeg', colorName: 'Soft Wool', specs: ['Light Filtering E54-1271 (¾")', 'Room Darkening E55-1271 (¾")'] },
        { image: 'page044_img01_475x825.jpeg', colorName: 'Grayscale', specs: ['Light Filtering E54-1272 (¾")', 'Room Darkening E55-1272 (¾")'] },
        { image: 'page044_img02_475x825.jpeg', colorName: 'Aiden', specs: ['Light Filtering E54-1273 (¾")', 'Room Darkening E55-1273 (¾")'] },
        { image: 'page045_img01_475x825.jpeg', colorName: 'Tash', specs: ['Light Filtering E54-1274 (¾")', 'Room Darkening E55-1274 (¾")'] },
        { image: 'page045_img02_475x825.jpeg', colorName: 'Young Cedar', specs: ['Light Filtering E54-1275 (¾")', 'Room Darkening E55-1275 (¾")'] },
      ],
    },
    {
      name: 'Legends™',
      swatches: [
        { image: 'page046_img01_475x825.jpeg', colorName: 'Porcelain', specs: ['Light Filtering E6/E5-401 (¾" & Double)', 'Room Darkening E3-401 (¾")'] },
        { image: 'page046_img02_475x825.jpeg', colorName: 'Pearl', specs: ['Light Filtering E6/E5-402 (¾" & Double)', 'Room Darkening E3-402 (¾")'] },
        { image: 'page047_img01_475x825.jpeg', colorName: 'Parchment', specs: ['Light Filtering E6/E5-403 (¾" & Double)', 'Room Darkening E3-403 (¾")'] },
        { image: 'page047_img02_475x825.jpeg', colorName: 'Buttercream', specs: ['Light Filtering E6/E5-442 (¾" & Double)', 'Room Darkening E3-442 (¾")'] },
        { image: 'page048_img01_475x825.jpeg', colorName: 'Sandcastle', specs: ['Light Filtering E6/E5-424 (¾" & Double)', 'Room Darkening E3-424 (¾")'] },
        { image: 'page048_img02_475x825.jpeg', colorName: 'Camel', specs: ['Light Filtering E6/E5-410 (¾" & Double)', 'Room Darkening E3-410 (¾")'] },
        { image: 'page049_img01_475x825.jpeg', colorName: 'Putty', specs: ['Light Filtering E6-408 (¾")', 'Room Darkening E3-408 (¾")'] },
        { image: 'page049_img02_475x825.jpeg', colorName: 'Gold Rush', specs: ['Light Filtering E6-1238 (¾")', 'Room Darkening E3-1238 (¾")'] },
        { image: 'page050_img01_475x825.jpeg', colorName: 'Wooded Mist', specs: ['Light Filtering E6-1239 (¾")', 'Room Darkening E3-1239 (¾")'] },
        { image: 'page050_img02_475x825.jpeg', colorName: 'Lakehouse', specs: ['Light Filtering E6-1240 (¾")', 'Room Darkening E3-1240 (¾")'] },
        { image: 'page051_img01_475x825.jpeg', colorName: 'Rolling Fog', specs: ['Light Filtering E6-411 (¾")', 'Room Darkening E3-411 (¾")'] },
        { image: 'page051_img02_475x825.jpeg', colorName: 'Espresso', specs: ['Light Filtering E6-460 (¾")', 'Room Darkening E3-460 (¾")'] },
      ],
    },
    {
      name: 'Sunterra™',
      swatches: [
        { image: 'page052_img01_475x825.jpeg', colorName: 'Frostline', specs: ['Light Filtering E40-599 (¾")', 'Room Darkening E41-599 (¾")'] },
        { image: 'page052_img02_475x825.jpeg', colorName: 'Cloud', specs: ['Light Filtering E40-657 (¾")', 'Room Darkening E41-657 (¾")'] },
        { image: 'page053_img01_475x825.jpeg', colorName: 'Sea Salt', specs: ['Light Filtering E40-658 (¾")', 'Room Darkening E41-658 (¾")'] },
        { image: 'page053_img02_475x825.jpeg', colorName: 'Sand Dune', specs: ['Light Filtering E40-659 (¾")', 'Room Darkening E41-659 (¾")'] },
        { image: 'page054_img01_475x825.jpeg', colorName: 'Mushroom', specs: ['Light Filtering E40-660 (¾")', 'Room Darkening E41-660 (¾")'] },
        { image: 'page054_img02_475x825.jpeg', colorName: 'Zirconia', specs: ['Light Filtering E40-1241 (¾")', 'Room Darkening E41-1241 (¾")'] },
        { image: 'page055_img01_475x825.jpeg', colorName: 'Moonlight', specs: ['Light Filtering E40-600 (¾")', 'Room Darkening E41-600 (¾")'] },
        { image: 'page055_img02_475x825.jpeg', colorName: 'Driftwood', specs: ['Light Filtering E40-635 (¾")', 'Room Darkening E41-635 (¾")'] },
        { image: 'page056_img01_475x825.jpeg', colorName: 'Silver Lining', specs: ['Light Filtering E40-689 (¾")', 'Room Darkening E41-689 (¾")'] },
        { image: 'page056_img02_475x825.jpeg', colorName: 'Honey Wheat', specs: ['Light Filtering E40-630 (¾")', 'Room Darkening E41-630 (¾")'] },
        { image: 'page057_img01_475x825.jpeg', colorName: 'Pinecone', specs: ['Light Filtering E40-661 (¾")', 'Room Darkening E41-661 (¾")'] },
        { image: 'page057_img02_475x825.jpeg', colorName: 'Chestnut', specs: ['Light Filtering E40-640 (¾")', 'Room Darkening E41-640 (¾")'] },
        { image: 'page058_img01_475x825.jpeg', colorName: 'Lavender Calm', specs: ['Light Filtering E40-1242 (¾")', 'Room Darkening E41-1242 (¾")'] },
        { image: 'page058_img02_475x825.jpeg', colorName: 'Kobi', specs: ['Light Filtering E40-1250 (¾")', 'Room Darkening E41-1250 (¾")'] },
        { image: 'page059_img01_475x825.jpeg', colorName: 'Creamy Oat', specs: ['Light Filtering E40-656 (¾")', 'Room Darkening E41-656 (¾")'] },
        { image: 'page059_img02_475x825.jpeg', colorName: 'Desert', specs: ['Light Filtering E40-669 (¾")', 'Room Darkening E41-669 (¾")'] },
        { image: 'page060_img01_475x825.jpeg', colorName: 'Cornucopia', specs: ['Light Filtering E40-1243 (¾")', 'Room Darkening E41-1243 (¾")'] },
        { image: 'page060_img02_475x825.jpeg', colorName: 'Cranberry', specs: ['Light Filtering E40-1244 (¾")', 'Room Darkening E41-1244 (¾")'] },
        { image: 'page061_img01_475x825.jpeg', colorName: 'Cielo', specs: ['Light Filtering E40-1245 (¾")', 'Room Darkening E41-1245 (¾")'] },
        { image: 'page061_img02_475x825.jpeg', colorName: 'Laurel', specs: ['Light Filtering E40-1246 (¾")', 'Room Darkening E41-1246 (¾")'] },
        { image: 'page062_img01_475x825.jpeg', colorName: 'Aqua Spray', specs: ['Light Filtering E40-652 (¾")', 'Room Darkening E41-652 (¾")'] },
        { image: 'page062_img02_475x825.jpeg', colorName: 'Reef', specs: ['Light Filtering E40-663 (¾")', 'Room Darkening E41-663 (¾")'] },
        { image: 'page063_img01_475x825.jpeg', colorName: 'Twilight Blue', specs: ['Light Filtering E40-653 (¾")', 'Room Darkening E41-653 (¾")'] },
        { image: 'page063_img02_475x825.jpeg', colorName: 'New Noir', specs: ['Light Filtering E40-1247 (¾")', 'Room Darkening E41-1247 (¾")'] },
      ],
    },
    {
      name: 'Kinship™',
      swatches: [
        { image: 'page064_img01_475x825.jpeg', colorName: 'Calm', specs: ['Light Filtering E26/E28-766 (¾" & Double)', 'Room Darkening E27-766 (¾")'] },
        { image: 'page064_img02_475x825.jpeg', colorName: 'Summer Wish', specs: ['Light Filtering E26/E28-767 (¾" & Double)', 'Room Darkening E27-767 (¾")'] },
        { image: 'page065_img01_475x825.jpeg', colorName: 'Gelato', specs: ['Light Filtering E26/E28-772 (¾" & Double)', 'Room Darkening E27-772 (¾")'] },
        { image: 'page065_img02_475x825.jpeg', colorName: 'Twilight', specs: ['Light Filtering E26/E28-753 (¾" & Double)', 'Room Darkening E27-753 (¾")'] },
        { image: 'page066_img01_475x825.jpeg', colorName: 'Canoe', specs: ['Light Filtering E26/E28-770 (¾" & Double)', 'Room Darkening E27-770 (¾")'] },
        { image: 'page066_img02_475x825.jpeg', colorName: 'Warm Stone', specs: ['Light Filtering E26/E28-754 (¾" & Double)', 'Room Darkening E27-754 (¾")'] },
        { image: 'page067_img01_475x825.jpeg', colorName: 'Mystic', specs: ['Light Filtering E26-1237 (¾")', 'Room Darkening E27-1237 (¾")'] },
        { image: 'page067_img02_475x825.jpeg', colorName: 'Sun Light', specs: ['Light Filtering E26-768 (¾")', 'Room Darkening E27-768 (¾")'] },
        { image: 'page068_img01_475x825.jpeg', colorName: 'Honeysuckle', specs: ['Light Filtering E26-769 (¾")', 'Room Darkening E27-769 (¾")'] },
        { image: 'page068_img02_475x825.jpeg', colorName: 'Sun Tea', specs: ['Light Filtering E26-776 (¾")', 'Room Darkening E27-776 (¾")'] },
        { image: 'page069_img01_475x825.jpeg', colorName: 'Beach Glass', specs: ['Light Filtering E26-756 (¾")', 'Room Darkening E27-756 (¾")'] },
        { image: 'page069_img02_475x825.jpeg', colorName: 'Ocean Dusk', specs: ['Light Filtering E26-755 (¾")', 'Room Darkening E27-755 (¾")'] },
      ],
    },
    {
      name: 'HDOrigins® Esprit™',
      swatches: [
        { image: 'page070_img01_475x825.jpeg', colorName: 'Free Spirit', specs: ['Light Filtering E36-326 (¾")', 'Room Darkening E37-326 (¾")'] },
        { image: 'page070_img02_475x825.jpeg', colorName: 'Whimsy', specs: ['Light Filtering E36-327 (¾")', 'Room Darkening E37-327 (¾")'] },
        { image: 'page071_img01_475x825.jpeg', colorName: 'Soul Shine', specs: ['Light Filtering E36-328 (¾")', 'Room Darkening E37-328 (¾")'] },
        { image: 'page071_img02_475x825.jpeg', colorName: 'Hidden Gem', specs: ['Light Filtering E36-329 (¾")', 'Room Darkening E37-329 (¾")'] },
        { image: 'page072_img01_475x825.jpeg', colorName: 'Barefoot Dreams', specs: ['Light Filtering E36-330 (¾")', 'Room Darkening E37-330 (¾")'] },
        { image: 'page072_img02_475x825.jpeg', colorName: 'Wild Oats', specs: ['Light Filtering E36-331 (¾")', 'Room Darkening E37-331 (¾")'] },
        { image: 'page073_img01_475x825.jpeg', colorName: 'Wildflower', specs: ['Light Filtering E36-332 (¾")', 'Room Darkening E37-332 (¾")'] },
        { image: 'page073_img02_475x825.jpeg', colorName: 'Wanderlust', specs: ['Light Filtering E36-333 (¾")', 'Room Darkening E37-333 (¾")'] },
        { image: 'page074_img01_475x825.jpeg', colorName: 'Imagine', specs: ['Light Filtering E36-334 (¾")', 'Room Darkening E37-334 (¾")'] },
        { image: 'page074_img02_475x825.jpeg', colorName: 'Adventurous', specs: ['Light Filtering E36-335 (¾")', 'Room Darkening E37-335 (¾")'] },
        { image: 'page075_img01_475x825.jpeg', colorName: 'Dreamcatcher', specs: ['Light Filtering E36-336 (¾")', 'Room Darkening E37-336 (¾")'] },
        { image: 'page075_img02_475x825.jpeg', colorName: 'Gypsy Love', specs: ['Light Filtering E36-337 (¾")', 'Room Darkening E37-337 (¾")'] },
      ],
    },
  ],
}
