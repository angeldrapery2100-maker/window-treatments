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
  heroLabel: 'Fabric Classic    Color Daisy White\nOperating System LiteRise®',

  sections: [
    // ──── Scene Pairs (pages 7-13) — text/label from PDF ────
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page007_img01_3043x1505.jpeg',
          text: 'Applause® Honeycomb Shades offer a simplified selection of pleat sizes, opacities and operating systems in beautiful fabrics and an extensive palette of colors.',
          label: 'Fabric Classic    Color Daisy White\nOperating System LiteRise®',
        },
        {
          image: 'page008_img01_3045x1505.jpeg',
          text: 'With the Duolite® design option, two fabric opacities are combined in a single headrail for the ultimate in light control and privacy.',
          label: 'Fabric Classic    Color Daisy White\nOperating System PowerView® Automation\nDesign Option Duolite®',
        },
        {
          image: 'page009_img01_3905x1505.jpeg',
          text: 'As part of The Whole House Solution™, Applause® fabrics can be coordinated with Duette® Honeycomb Shades across rooms for a harmonious look throughout the home.',
          label: 'Fabric Classic    Color Daisy White\nOperating System LiteRise®',
        },
        {
          image: 'page012_img01_3042x1505.jpeg',
          text: 'Combine your Applause® shades with coordinating Design Studio™ drapery or side panels for added energy efficiency and a layered look at the window.',
          label: 'Fabric Sunterra™    Color Cornucopia\nDesign Studio™ Drapery Fabric Esmery    Color Cottage\nOperating System PowerView® Automation\nDesign Option Top-Down/Bottom-Up',
        },
        {
          image: 'page013_img01_3047x1507.jpeg',
          text: 'Applause® Honeycomb Shades bring elegant style and energy efficiency to every room.',
          label: 'Fabric Kinship™    Color Beach Glass\nOperating System LiteRise®',
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
    { image: 'page011_img01_1955x1505.jpeg', text: '', label: 'Fabric Classic    Color Daisy White\nOperating System LiteRise®' },
    { image: 'page011_img02_1236x836.jpeg', text: '', label: '' },
    { image: 'page015_img01_1953x1504.jpeg', text: 'Year-Round Comfort', label: 'Fabric Kinship™    Color Beach Glass\nOperating System LiteRise®' },
    { image: 'page016_img01_1952x1503.jpeg', text: 'Light Control and Privacy', label: 'Fabric Classic    Color Daisy White\nOperating System PowerView® Automation' },
    { image: 'page017_img01_1951x1505.jpeg', text: 'Duolite® Dual Opacity Option', label: 'Fabric Classic    Color Daisy White\nOperating System PowerView® Automation\nDesign Option Duolite®' },
    { image: 'page023_img01_1953x1505.jpeg', text: '', label: 'Fabric Classic    Color Frost\nOperating System LiteRise®' },
  ],

  // ──── Cell Size ────
  cellSize: {
    type: 'cell-size',
    title: 'Cell Size and Opacity',
    brandLabel: 'Applause® Honeycomb Shades',
    items: [
      { image: 'page025_img01_3009x2428.jpeg', label: '¾" Double Cell' },
      { image: 'page026_img01_3009x3010.jpeg', label: '1¼" Double Cell' },
    ],
  },

  // ──── Hardware Colors (page 33) ────
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Applause® Honeycomb Shades',
    items: [
      { image: 'page033_img01_306x306.jpeg', label: '048 Black' },
      { image: 'page033_img02_306x306.jpeg', label: '064 Bronze' },
      { image: 'page033_img03_306x306.jpeg', label: '133 Metro Gray' },
      { image: 'page033_img04_306x306.jpeg', label: '134 Pewter' },
      { image: 'page033_img05_306x306.jpeg', label: '223 Fog' },
      { image: 'page033_img06_306x306.jpeg', label: '231 Stardust' },
      { image: 'page033_img07_306x306.jpeg', label: '320 Rich Cream' },
      { image: 'page033_img08_306x306.jpeg', label: '437 Champagne' },
      { image: 'page033_img09_306x306.jpeg', label: '482 Ash' },
      { image: 'page033_img10_306x306.jpeg', label: '483 Walnut' },
      { image: 'page033_img11_306x306.jpeg', label: '502 Storm' },
      { image: 'page033_img12_306x306.jpeg', label: '506 Pebble' },
      { image: 'page033_img13_306x306.jpeg', label: '520 Charcoal' },
      { image: 'page033_img14_306x306.jpeg', label: '651 Duchess Grey' },
      { image: 'page033_img15_306x306.jpeg', label: '661 White Tiara' },
      { image: 'page033_img16_306x306.jpeg', label: '785 Aspen White' },
      { image: 'page033_img17_306x306.jpeg', label: '859 Desert Tan' },
      { image: 'page033_img18_306x306.jpeg', label: '879 Pearl Gray' },
      { image: 'page033_img19_306x306.jpeg', label: '903 Desert Gold' },
      { image: 'page033_img20_306x306.jpeg', label: '904 Coffee Bean' },
      { image: 'page033_img21_306x306.jpeg', label: '905 Chestnut' },
      { image: 'page033_img22_306x306.jpeg', label: '906 Cocoa' },
      { image: 'page033_img23_306x306.jpeg', label: '907 Dove' },
      { image: 'page033_img24_306x306.jpeg', label: '908 Fawn' },
      { image: 'page033_img25_306x306.jpeg', label: '909 Bark' },
      { image: 'page033_img26_306x306.jpeg', label: '910 Latte' },
      { image: 'page033_img27_306x306.jpeg', label: '911 Mushroom' },
      { image: 'page033_img28_306x306.jpeg', label: '912 Truffle' },
      { image: 'page033_img29_306x306.jpeg', label: '913 Taupe' },
      { image: 'page033_img30_306x306.jpeg', label: '914 Driftwood' },
    ],
  },

  // ──── Swatch Collections (pages 35-75) ────
  swatchCollections: [
    {
      name: 'Classic Light Filtering',
      swatches: [
        { image: 'page035_img01_475x825.jpeg', colorName: 'DIAMOND', specs: ['Light Filtering A22-616 (¾")', 'Light Filtering A42-616 (1¼")'] },
        { image: 'page035_img02_475x825.jpeg', colorName: 'SERENITY', specs: ['Light Filtering A22-617 (¾")', 'Light Filtering A42-617 (1¼")'] },
        { image: 'page036_img01_475x825.jpeg', colorName: 'FROST', specs: ['Light Filtering A22-600 (¾")', 'Light Filtering A42-600 (1¼")'] },
        { image: 'page037_img01_475x825.jpeg', colorName: 'DAISY WHITE', specs: ['Light Filtering A22-951 (¾")', 'Light Filtering A42-951 (1¼")'] },
        { image: 'page037_img02_475x825.jpeg', colorName: 'ASPEN SNOW', specs: ['Light Filtering A22-221 (¾")', 'Light Filtering A42-221 (1¼")'] },
        { image: 'page038_img01_475x825.jpeg', colorName: 'JOURNAL', specs: ['Light Filtering A22-457 (¾")', 'Light Filtering A42-457 (1¼")'] },
        { image: 'page038_img02_475x825.jpeg', colorName: 'LINEN', specs: ['Light Filtering A22-953 (¾")', 'Light Filtering A42-953 (1¼")'] },
        { image: 'page039_img01_475x825.jpeg', colorName: 'SWAN', specs: ['Light Filtering A22-1226 (¾")', 'Light Filtering A42-1226 (1¼")'] },
        { image: 'page039_img02_475x825.jpeg', colorName: 'MOONSTRUCK', specs: ['Light Filtering A22-1227 (¾")', 'Light Filtering A42-1227 (1¼")'] },
        { image: 'page040_img01_475x825.jpeg', colorName: 'POLAR GRAY', specs: ['Light Filtering A22-986 (¾")', 'Light Filtering A42-986 (1¼")'] },
        { image: 'page040_img02_475x825.jpeg', colorName: 'SOLITUDE', specs: ['Light Filtering A22-987 (¾")', 'Light Filtering A42-987 (1¼")'] },
        { image: 'page041_img01_475x825.jpeg', colorName: 'PEARL GRAY', specs: ['Light Filtering A22-713 (¾")', 'Light Filtering A42-713 (1¼")'] },
        { image: 'page041_img02_475x825.jpeg', colorName: 'MODERN GRAY', specs: ['Light Filtering A22-994 (¾")', 'Light Filtering A42-994 (1¼")'] },
        { image: 'page042_img01_475x825.jpeg', colorName: 'GRAPHITE', specs: ['Light Filtering A22-750 (¾")', 'Light Filtering A42-750 (1¼")'] },
        { image: 'page042_img02_475x825.jpeg', colorName: 'BLACK ONYX', specs: ['Light Filtering A22-748 (¾")', 'Light Filtering A42-748 (1¼")'] },
        { image: 'page043_img01_475x825.jpeg', colorName: 'BIRCH BARK', specs: ['Light Filtering A22-985 (¾")', 'Light Filtering A42-985 (1¼")'] },
        { image: 'page043_img02_475x825.jpeg', colorName: 'DESERT SANDS', specs: ['Light Filtering A22-955 (¾")', 'Light Filtering A42-955 (1¼")'] },
        { image: 'page044_img01_475x825.jpeg', colorName: 'GINGERSNAP', specs: ['Light Filtering A22-916 (¾")', 'Light Filtering A42-916 (1¼")'] },
        { image: 'page044_img02_475x825.jpeg', colorName: 'PLATINUM', specs: ['Light Filtering A22-682 (¾")', 'Light Filtering A42-682 (1¼")'] },
        { image: 'page045_img01_475x825.jpeg', colorName: 'STONE HEARTH', specs: ['Light Filtering A22-737 (¾")', 'Light Filtering A42-737 (1¼")'] },
        { image: 'page045_img02_475x825.jpeg', colorName: 'VOLCANIC ASH', specs: ['Light Filtering A22-738 (¾")', 'Light Filtering A42-738 (1¼")'] },
        { image: 'page046_img01_475x825.jpeg', colorName: 'WHIPPED CREAM', specs: ['Light Filtering A22-948 (¾")', 'Light Filtering A42-948 (1¼")'] },
        { image: 'page046_img02_475x825.jpeg', colorName: 'DANDELION', specs: ['Light Filtering A22-949 (¾")', 'Light Filtering A42-949 (1¼")'] },
        { image: 'page047_img01_475x825.jpeg', colorName: 'BISQUE', specs: ['Light Filtering A22-989 (¾")', 'Light Filtering A42-989 (1¼")'] },
        { image: 'page047_img02_475x825.jpeg', colorName: 'BISCOTTI', specs: ['Light Filtering A22-956 (¾")', 'Light Filtering A42-956 (1¼")'] },
        { image: 'page048_img01_475x825.jpeg', colorName: 'BARLEY', specs: ['Light Filtering A22-752 (¾")', 'Light Filtering A42-752 (1¼")'] },
        { image: 'page048_img02_475x825.jpeg', colorName: 'TOASTED ALMOND', specs: ['Light Filtering A22-753 (¾")', 'Light Filtering A42-753 (1¼")'] },
      ],
    },
    {
      name: 'Classic Room Darkening',
      swatches: [
        { image: 'page049_img01_475x825.jpeg', colorName: 'DIAMOND', specs: ['Room Darkening A23-616 (¾")', 'Room Darkening A43-616 (1¼")'] },
        { image: 'page049_img02_475x825.jpeg', colorName: 'SERENITY', specs: ['Room Darkening A23-617 (¾")', 'Room Darkening A43-617 (1¼")'] },
        { image: 'page050_img01_475x825.jpeg', colorName: 'FROST', specs: ['Room Darkening A23-600 (¾")', 'Room Darkening A43-600 (1¼")'] },
        { image: 'page050_img02_475x825.jpeg', colorName: 'MICA', specs: ['Room Darkening A23-601 (¾")', 'Room Darkening A43-601 (1¼")'] },
        { image: 'page051_img01_475x825.jpeg', colorName: 'DAISY WHITE', specs: ['Room Darkening A23-951 (¾")', 'Room Darkening A43-951 (1¼")'] },
        { image: 'page051_img02_475x825.jpeg', colorName: 'ASPEN SNOW', specs: ['Room Darkening A23-221 (¾")', 'Room Darkening A43-221 (1¼")'] },
        { image: 'page052_img01_475x825.jpeg', colorName: 'JOURNAL', specs: ['Room Darkening A23-457 (¾")', 'Room Darkening A43-457 (1¼")'] },
        { image: 'page052_img02_475x825.jpeg', colorName: 'LINEN', specs: ['Room Darkening A23-953 (¾")', 'Room Darkening A43-953 (1¼")'] },
        { image: 'page053_img01_475x825.jpeg', colorName: 'SWAN', specs: ['Room Darkening A23-1226 (¾")', 'Room Darkening A43-1226 (1¼")'] },
        { image: 'page053_img02_475x825.jpeg', colorName: 'MOONSTRUCK', specs: ['Room Darkening A23-1227 (¾")', 'Room Darkening A43-1227 (1¼")'] },
        { image: 'page054_img01_475x825.jpeg', colorName: 'POLAR GRAY', specs: ['Room Darkening A23-986 (¾")', 'Room Darkening A43-986 (1¼")'] },
        { image: 'page054_img02_475x825.jpeg', colorName: 'SOLITUDE', specs: ['Room Darkening A23-987 (¾")', 'Room Darkening A43-987 (1¼")'] },
        { image: 'page055_img01_475x825.jpeg', colorName: 'PEARL GRAY', specs: ['Room Darkening A23-713 (¾")', 'Room Darkening A43-713 (1¼")'] },
        { image: 'page055_img02_475x825.jpeg', colorName: 'MODERN GRAY', specs: ['Room Darkening A23-994 (¾")', 'Room Darkening A43-994 (1¼")'] },
        { image: 'page056_img01_475x825.jpeg', colorName: 'GRAPHITE', specs: ['Room Darkening A23-750 (¾")', 'Room Darkening A43-750 (1¼")'] },
        { image: 'page056_img02_475x825.jpeg', colorName: 'BLACK ONYX', specs: ['Room Darkening A23-748 (¾")', 'Room Darkening A43-748 (1¼")'] },
        { image: 'page057_img01_475x825.jpeg', colorName: 'BIRCH BARK', specs: ['Room Darkening A23-985 (¾")', 'Room Darkening A43-985 (1¼")'] },
        { image: 'page057_img02_475x825.jpeg', colorName: 'DESERT SANDS', specs: ['Room Darkening A23-955 (¾")', 'Room Darkening A43-955 (1¼")'] },
        { image: 'page058_img01_475x825.jpeg', colorName: 'GINGERSNAP', specs: ['Room Darkening A23-916 (¾")', 'Room Darkening A43-916 (1¼")'] },
        { image: 'page058_img02_475x825.jpeg', colorName: 'PLATINUM', specs: ['Room Darkening A23-682 (¾")', 'Room Darkening A43-682 (1¼")'] },
        { image: 'page059_img01_475x825.jpeg', colorName: 'STONE HEARTH', specs: ['Room Darkening A23-737 (¾")', 'Room Darkening A43-737 (1¼")'] },
        { image: 'page059_img02_475x825.jpeg', colorName: 'VOLCANIC ASH', specs: ['Room Darkening A23-738 (¾")', 'Room Darkening A43-738 (1¼")'] },
        { image: 'page060_img01_475x825.jpeg', colorName: 'WHIPPED CREAM', specs: ['Room Darkening A23-948 (¾")', 'Room Darkening A43-948 (1¼")'] },
        { image: 'page060_img02_475x825.jpeg', colorName: 'DANDELION', specs: ['Room Darkening A23-949 (¾")', 'Room Darkening A43-949 (1¼")'] },
        { image: 'page061_img01_475x825.jpeg', colorName: 'BISQUE', specs: ['Room Darkening A23-989 (¾")', 'Room Darkening A43-989 (1¼")'] },
        { image: 'page061_img02_475x825.jpeg', colorName: 'BISCOTTI', specs: ['Room Darkening A23-956 (¾")', 'Room Darkening A43-956 (1¼")'] },
        { image: 'page062_img01_475x825.jpeg', colorName: 'BARLEY', specs: ['Room Darkening A23-752 (¾")', 'Room Darkening A43-752 (1¼")'] },
        { image: 'page062_img02_475x825.jpeg', colorName: 'TOASTED ALMOND', specs: ['Room Darkening A23-753 (¾")', 'Room Darkening A43-753 (1¼")'] },
      ],
    },
    {
      name: 'Linen Weave Light Filtering',
      swatches: [
        { image: 'page063_img01_475x825.jpeg', colorName: 'OXFORD', specs: ['Light Filtering A56-938 (¾")'] },
        { image: 'page063_img02_475x825.jpeg', colorName: 'POWDER', specs: ['Light Filtering A56-939 (¾")'] },
        { image: 'page064_img01_475x825.jpeg', colorName: 'CAPRI', specs: ['Light Filtering A56-940 (¾")'] },
        { image: 'page064_img02_475x825.jpeg', colorName: 'FLAX', specs: ['Light Filtering A56-941 (¾")'] },
        { image: 'page065_img01_475x825.jpeg', colorName: 'BARELY THERE', specs: ['Light Filtering A56-1236 (¾")'] },
        { image: 'page065_img02_475x825.jpeg', colorName: 'HARBOR', specs: ['Light Filtering A56-1237 (¾")'] },
        { image: 'page066_img01_475x825.jpeg', colorName: 'BRIAR', specs: ['Light Filtering A56-943 (¾")'] },
        { image: 'page066_img02_475x825.jpeg', colorName: 'STERLING', specs: ['Light Filtering A56-944 (¾")'] },
        { image: 'page067_img01_475x825.jpeg', colorName: 'MODERN GRAY', specs: ['Light Filtering A56-994 (¾")'] },
        { image: 'page067_img02_475x825.jpeg', colorName: 'PEARL GRAY', specs: ['Light Filtering A56-713 (¾")'] },
        { image: 'page068_img01_475x825.jpeg', colorName: 'STONE HEARTH', specs: ['Light Filtering A56-737 (¾")'] },
        { image: 'page068_img02_475x825.jpeg', colorName: 'LUMBER', specs: ['Light Filtering A56-738 (¾")'] },
      ],
    },
    {
      name: 'Linen Weave Room Darkening',
      swatches: [
        { image: 'page069_img01_475x825.jpeg', colorName: 'OXFORD', specs: ['Room Darkening A57-938 (¾")'] },
        { image: 'page069_img02_475x825.jpeg', colorName: 'POWDER', specs: ['Room Darkening A57-939 (¾")'] },
        { image: 'page070_img01_475x825.jpeg', colorName: 'CAPRI', specs: ['Room Darkening A57-940 (¾")'] },
        { image: 'page070_img02_475x825.jpeg', colorName: 'FLAX', specs: ['Room Darkening A57-941 (¾")'] },
        { image: 'page071_img01_475x825.jpeg', colorName: 'BARELY THERE', specs: ['Room Darkening A57-1236 (¾")'] },
        { image: 'page071_img02_475x825.jpeg', colorName: 'HARBOR', specs: ['Room Darkening A57-1237 (¾")'] },
        { image: 'page072_img01_475x825.jpeg', colorName: 'BRIAR', specs: ['Room Darkening A57-943 (¾")'] },
        { image: 'page072_img02_475x825.jpeg', colorName: 'STERLING', specs: ['Room Darkening A57-944 (¾")'] },
        { image: 'page073_img01_475x825.jpeg', colorName: 'MODERN GRAY', specs: ['Room Darkening A57-994 (¾")'] },
        { image: 'page073_img02_475x825.jpeg', colorName: 'PEARL GRAY', specs: ['Room Darkening A57-713 (¾")'] },
        { image: 'page074_img01_475x825.jpeg', colorName: 'STONE HEARTH', specs: ['Room Darkening A57-737 (¾")'] },
        { image: 'page074_img02_475x825.jpeg', colorName: 'LUMBER', specs: ['Room Darkening A57-738 (¾")'] },
      ],
    },
    {
      name: 'Elan®',
      swatches: [
        { image: 'page075_img01_475x825.jpeg', colorName: 'DAISY WHITE', specs: ['Light Filtering A62-951 (¾")'] },
        { image: 'page075_img02_475x825.jpeg', colorName: 'JOURNAL', specs: ['Light Filtering A62-457 (¾")'] },
      ],
    },
  ],
}
