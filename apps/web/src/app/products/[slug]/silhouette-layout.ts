/**
 * Silhouette® Window Shadings - 手动配对的页面布局数据
 * 图片已按页面位置顺序编号 (re-extract)
 */

import type { SectionLayout, ApplauseLayout } from './applause-layout'

/* Silhouette 色卡结构: 每页4张图 (2大竖图 705x1157 + 2小圆片 256x256)
 * img01 = 左竖图 (左侧色卡)
 * img02 = 右竖图 (右侧色卡)  
 * img03 = 左小圆片
 * img04 = 右小圆片
 * 我们用 img01 做色卡展示图, img03 的 text_below 做颜色名
 */

export interface SilhouetteLayout {
  slug: string
  name: string
  description: string
  heroImage: string
  heroLabel: string
  sections: SectionLayout[]
  gallery: { image: string; text: string; label: string }[]
  vaneSize: SectionLayout | null
  hardwareColors: SectionLayout | null
  swatchCollections: {
    name: string
    swatches: { image: string; chip: string; colorName: string; specs: string[] }[]
  }[]
}

export const silhouetteLayout: SilhouetteLayout = {
  slug: 'silhouette',
  name: 'Silhouette® Window Shadings',
  description: 'Silhouette® Window Shadings feature the signature S-vane™ suspended between two sheers, beautifully diffusing natural light and providing UV protection with a view.',

  // Hero - page 14 宽幅 (3905x1505)
  heroImage: 'page014_img01_3905x1505.jpeg',
  heroLabel: '',

  sections: [
    // ──── Scene Pairs: 6个场景大图 ────
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page010_img01_3080x1505.jpeg',
          text: 'Silhouette® shadings beautifully transform harsh sunlight into soft, diffused light while maintaining your view to the outdoors.',
          label: '',
        },
        {
          image: 'page013_img01_3080x1505.jpeg',
          text: 'The innovative design provides UV protection, helping to safeguard furnishings from the sun\'s damaging rays.',
          label: '',
        },
        {
          image: 'page008_img01_3080x1505.jpeg',
          text: 'Enjoy a soft, warm ambiance with the signature S-vane™ that gently diffuses natural light throughout your room.',
          label: '',
        },
        {
          image: 'page011_img01_3081x1505.jpeg',
          text: 'With rotating vanes, create the precise amount of light and privacy you prefer at any time of day.',
          label: '',
        },
        {
          image: 'page015_img01_3078x1505.jpeg',
          text: 'An expansive selection of fabrics and colors allows Silhouette® shadings to complement any interior décor.',
          label: '',
        },
        {
          image: 'page016_img01_3080x1505.jpeg',
          text: 'ClearView® sheers provide improved views of the outside landscape while still offering UV protection.',
          label: '',
        },
      ],
    },

    // ──── Benefits - page 18 (3×2 grid) ────
    {
      type: 'card-grid',
      title: 'Benefits',
      cols: 3,
      cards: [
        { image: 'page018_img01_755x455.jpeg', title: 'Superior Light Diffusion', desc: 'Silhouette shadings diffuse natural light with S-shaped fabric vanes positioned between two sheers, creating a soft, warm ambiance throughout a room.' },
        { image: 'page018_img02_755x455.jpeg', title: 'Daytime Privacy and Light Control', desc: 'Create the precise amount of preferred light with rotating vanes. The white rear sheer reflects light back to the outside, obscuring views into your home.' },
        { image: 'page018_img03_755x455.jpeg', title: 'UV Protection with View-Through', desc: 'Silhouette shadings provide views outdoors while preventing UV rays from damaging furniture, flooring and artwork.' },
        { image: 'page018_img04_755x455.jpeg', title: 'Incredibly Clear Views', desc: 'With the choice of specially engineered front and back ClearView® sheers, enjoy improved views of the outside landscape.' },
        { image: 'page018_img05_755x455.jpeg', title: 'Expansive Fabric Selection', desc: 'A wide array of beautiful fabric and color options allow Silhouette® shadings to easily complement any interior décor style.' },
        { image: 'page018_img06_755x455.jpeg', title: 'The Whole House Solution™', desc: 'Silhouette shadings are intentionally designed to coordinate with vertical Luminette® Privacy Sheers, creating a uniform look throughout your home.' },
      ],
    },

    // ──── Silhouette Halo Benefits - page 19 (左侧场景+右侧卡片) ────
    // 注意: page19 有7张图，img03和img04是重复的，img06和img07也是重复的
    // img01=场景, img02=光控, img03=纹理(dup), img05=ClearView, img06=底轨(dup)
    {
      type: 'card-grid',
      title: 'Silhouette® Halo™ Benefits',
      cols: 2,
      cards: [
        { image: 'page019_img02_755x455.jpeg', title: 'Superior Light Deflection and Control', desc: 'Silhouette® Halo™ shadings allow you to create your ideal amount of light in a room as the sun moves from morning to night.' },
        { image: 'page019_img03_754x455.jpeg', title: 'Enhanced Color and Texture', desc: 'Designed to create a soft glow and eliminate harsh shadowing, unique dual-layer dimensional vanes enhance the Silhouette Halo shading color and texture.' },
        { image: 'page019_img05_755x455.jpeg', title: 'Clear Views with UV Protection', desc: 'Silhouette Halo shadings feature ClearView® sheers that offer visibility to the outdoors while protecting furniture, flooring and décor from UV rays.' },
        { image: 'page019_img06_755x455.jpeg', title: 'Innovative Bottom Rail Design', desc: 'Silhouette Halo shadings have a sleek bottom rail designed to rock on the window sill as the shading over-rotates, providing a clean, uniform look.' },
      ],
    },

    // ──── Light Control - page 20 (左侧场景+右侧2×2) ────
    {
      type: 'comparison-grid',
      title: 'Light Control',
      cols: 2,
      items: [
        { image: 'page020_img02_755x455.jpeg', label: 'Translucent Fabrics', sublabel: 'For softly diffused light' },
        { image: 'page020_img03_755x455.jpeg', label: 'Light-Dimming Fabric', sublabel: 'For reduced light' },
        { image: 'page020_img04_755x455.jpeg', label: 'Duolite® Room-Darkening', sublabel: 'Blocks majority of light with a translucent shading plus a room-darkening panel that operate sequentially' },
        { image: 'page020_img05_755x455.jpeg', label: 'A Deux™ Room-Darkening', sublabel: 'Blocks majority of light with a translucent shading and a room-darkening panel that operate independently' },
      ],
    },

    // ──── Design Options - page 23 (4×2) ────
    {
      type: 'card-grid',
      title: 'Design Options',
      cols: 4,
      cards: [
        { image: 'page023_img01_755x455.jpeg', title: 'Tilt Only', desc: 'Best for French doors or narrow windows, this option keeps the shading lowered but allows vanes to tilt open and closed.' },
        { image: 'page023_img02_759x461.jpeg', title: 'Magnetic Hold-Down Brackets', desc: 'Secure Silhouette shadings on French doors or sidelight applications with magnetic hold-down brackets to prevent movement of the bottom rail.' },
        { image: 'page023_img03_755x455.jpeg', title: 'Duolite®', desc: 'With just one operation, the shading and room-darkening panel fully lower to provide more options for light control and privacy.' },
        { image: 'page023_img04_755x455.jpeg', title: 'Silhouette® Halo™ Duolite', desc: 'Exclusive room-darkening option for Halo shadings. Vanes remain over-rotated when panel is down.' },
        { image: 'page023_img05_755x455.jpeg', title: 'Grandiose™', desc: 'Best for taller windows, this feature uses the Quartette® headrail with 3-inch vanes. Available with EasyRise™ and limited fabrics.' },
        { image: 'page023_img06_750x455.jpeg', title: 'Specialty Shapes', desc: 'From arches to angles, Silhouette shadings can cover an array of specialty shapes. All specialty shapes are non-operable.' },
        { image: 'page023_img07_755x455.jpeg', title: 'Two-On-One Headrail', desc: 'For larger windows, two independently operated shadings can share the same headrail. Available with EasyRise™, LiteRise® and UltraGlide®.' },
        { image: 'page023_img08_755x455.jpeg', title: 'A Deux™', desc: 'This dual roller system features a translucent shading in front of a room-darkening panel, which can be independently positioned.' },
      ],
    },

    // ──── Operating Systems - page 21 (混合布局) ────
    {
      type: 'control-systems',
      sceneImage: 'page021_img01_1136x1507.jpeg',
      sceneLabel: '',
      panels: [
        {
          title: 'PowerView® Automation',
          image: 'page021_img04_355x608.jpeg',
          features: [
            { title: 'Convenience', desc: 'Achieve your perfect light automatically' },
            { title: 'Privacy', desc: 'Schedule shadings to close whenever you prefer' },
            { title: 'Energy Efficiency', desc: 'Program shadings to be in the best positions throughout the day' },
            { title: 'Security', desc: 'Remote control gives the illusion that you\'re always home' },
            { title: 'Child Friendly', desc: 'Simple, cord-free operation' },
            { title: 'Battery Powered or Hardwired', desc: 'For seamless installation, operation and maintenance' },
            { title: 'Voice Control', desc: 'Compatible with smart speakers and smart-home systems' },
          ],
        },
        {
          title: 'Operating Systems',
          items: [
            { image: 'page021_img02_448x467.jpeg', title: 'SoftTouch® Motorization', desc: 'A battery-operated, cordless system. Gently pull down on the wand to lower shadings, or lightly push up to raise them.' },
            { image: 'page021_img03_440x459.jpeg', title: 'UltraGlide®', desc: 'A single retractable wand for enhanced child safety. With one click, the fabric panel drops for complete privacy.' },
            { image: 'page021_img05_436x455.jpeg', title: 'LiteRise®', desc: 'Adjust shadings with a light touch on the handle. Pull down to lower; push up to raise.' },
            { image: 'page021_img06_446x465.jpeg', title: 'EasyRise™', desc: 'A continuous cord loop system raises and lowers the shading by simply pulling on the cord.' },
          ],
        },
      ],
    },

    // ──── Mounting Profiles - page 24 (3×3 grid) ────
    {
      type: 'mounting-grid',
      title: 'Mounting Profiles',
      rows: [
        {
          items: [
            { image: 'page024_img02_493x324.jpeg', label: 'Classic Headrail' },
            { image: 'page024_img03_493x324.jpeg', label: 'Partially Recessed' },
            { image: 'page024_img04_492x324.jpeg', label: 'Outside Mount' },
          ],
        },
        {
          items: [
            { image: 'page024_img05_492x324.jpeg', label: 'Quartette® Headrail' },
            { image: 'page024_img06_492x324.jpeg', label: 'Partially Recessed' },
            { image: 'page024_img07_493x323.jpeg', label: 'Outside Mount' },
          ],
        },
        {
          items: [
            { image: 'page024_img08_492x324.jpeg', label: 'A Deux™ Headrail' },
            { image: 'page024_img09_493x324.jpeg', label: 'Partially Recessed' },
            { image: 'page024_img10_492x324.jpeg', label: 'Outside Mount' },
          ],
        },
      ],
    },
  ],

  // ──── Gallery (排除已用于 scene-pair 的图) ────
  gallery: [
    { image: 'page005_img01_1957x1513.jpeg', text: '\', label: \'' },
    { image: 'page006_img02_2672x1505.jpeg', text: '\', label: \'' },
    { image: 'page007_img01_3080x1505.jpeg', text: '\', label: \'' },
    { image: 'page009_img01_3080x1505.jpeg', text: '\', label: \'' },
    { image: 'page012_img01_3083x1518.jpeg', text: '\', label: \'' },
    { image: 'page017_img01_3077x1505.jpeg', text: '\', label: \'' },
    { image: 'page022_img01_3082x1516.jpeg', text: '\', label: \'' },
    { image: 'page025_img01_1955x1505.jpeg', text: '\', label: \'' },
  ],

  // ──── Vane Size - page 34 (2×2) ────
  vaneSize: {
    type: 'cell-size',
    title: 'Vane Size',
    brandLabel: 'Silhouette®\nWindow Shadings',
    items: [
      { image: 'page034_img01_577x576.jpeg', label: '2" Vane' },
      { image: 'page034_img02_577x576.jpeg', label: '3" Vane' },
      { image: 'page034_img03_579x579.jpeg', label: '4" Vane' },
      { image: 'page034_img04_577x560.jpeg', label: 'Halo™ 3" Vane' },
    ],
  },

  // ──── Hardware Colors - page 35 (30色, 147x147) ────
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Silhouette®\nWindow Shadings',
    items: [
      { image: 'page035_img01_147x147.jpeg', label: '048 Black' },
      { image: 'page035_img02_147x147.jpeg', label: '133 Feather Fantasy' },
      { image: 'page035_img03_147x147.jpeg', label: '180 Dove Gray' },
      { image: 'page035_img04_147x147.jpeg', label: '276 Silverado' },
      { image: 'page035_img05_147x147.jpeg', label: '319 Earthen Beige' },
      { image: 'page035_img06_147x147.jpeg', label: '320 Rich Cream' },
      { image: 'page035_img07_147x147.jpeg', label: '329 Summer Linen' },
      { image: 'page035_img08_147x147.jpeg', label: '370 Slate' },
      { image: 'page035_img09_147x147.jpeg', label: '401 Silver Sand' },
      { image: 'page035_img10_147x147.jpeg', label: '405 Gray Flannel' },
      { image: 'page035_img11_147x147.jpeg', label: '426 Squirrel Gray' },
      { image: 'page035_img12_147x147.jpeg', label: '450 Skyline' },
      { image: 'page035_img13_147x147.jpeg', label: '478 Winter Pear' },
      { image: 'page035_img14_147x147.jpeg', label: '550 Ripe Pear' },
      { image: 'page035_img15_147x147.jpeg', label: '551 Worn Leather' },
      { image: 'page035_img16_147x147.jpeg', label: '575 Gray Cloud' },
      { image: 'page035_img17_147x147.jpeg', label: '609 Falcon Gray' },
      { image: 'page035_img18_147x147.jpeg', label: '651 Duchess Gray' },
      { image: 'page035_img19_147x147.jpeg', label: '652 Maiden Blush' },
      { image: 'page035_img20_147x147.jpeg', label: '656 Golden Straw' },
      { image: 'page035_img21_147x147.jpeg', label: '661 White Tiara' },
      { image: 'page035_img22_147x147.jpeg', label: '669 Beijing Gray' },
      { image: 'page035_img23_147x147.jpeg', label: '689 Ash' },
      { image: 'page035_img24_147x147.jpeg', label: '785 Aspen White' },
      { image: 'page035_img25_147x147.jpeg', label: '810 Mushroom' },
      { image: 'page035_img26_147x147.jpeg', label: '849 Mocha' },
      { image: 'page035_img27_147x147.jpeg', label: '862 Gardenia White' },
      { image: 'page035_img28_147x147.jpeg', label: '879 Pearl Gray' },
      { image: 'page035_img29_147x147.jpeg', label: '885 Flex White' },
      { image: 'page035_img30_147x147.jpeg', label: '897 Heatherwood' },
    ],
  },

  // ──── Fabric Swatches (按系列, 每个色卡包含竖图+chip小方块) ────
  swatchCollections: [
    {
      name: 'Alustra® Duolite™ Originale',
      swatches: [
        { image: 'page036_img01_705x1157.jpeg', chip: 'page036_img03_256x256.jpeg', colorName: 'MARBLE', specs: ['Translucent A60-905 (3")', 'A70-905 (4")'] },
        { image: 'page036_img02_705x1157.jpeg', chip: 'page036_img04_256x256.jpeg', colorName: 'BLANC', specs: ['Translucent A60-901 (3")', 'A70-901 (4")'] },
        { image: 'page037_img01_705x1157.jpeg', chip: 'page037_img03_256x256.jpeg', colorName: 'TOSCANO', specs: ['Translucent A60-906 (3")', 'A70-906 (4")'] },
        { image: 'page037_img02_705x1157.jpeg', chip: 'page037_img04_256x256.jpeg', colorName: 'GIARDINO', specs: ['Translucent A60-1066 (3")', 'A70-1066 (4")'] },
        { image: 'page038_img01_705x1157.jpeg', chip: 'page038_img03_256x256.jpeg', colorName: 'SCULPTURE', specs: ['Translucent A60-908 (3")', 'A70-908 (4")'] },
        { image: 'page038_img02_705x1157.jpeg', chip: 'page038_img04_256x256.jpeg', colorName: 'MOSAIC', specs: ['Translucent A60-1064 (3")', 'A70-1064 (4")'] },
        { image: 'page039_img01_705x1157.jpeg', chip: 'page039_img03_256x256.jpeg', colorName: 'CATHEDRAL', specs: ['Translucent A60-907 (3")', 'A70-907 (4")'] },
        { image: 'page039_img02_705x1157.jpeg', chip: 'page039_img04_256x256.jpeg', colorName: 'PALAZZO', specs: ['Translucent A60-1065 (3")', 'A70-1065 (4")'] },
      ],
    },
    {
      name: 'Alustra® Duolite™ Originale Light Dimming',
      swatches: [
        { image: 'page040_img01_705x1157.jpeg', chip: 'page040_img03_256x256.jpeg', colorName: 'MARBLE', specs: ['Light Dimming A61-905 (3")', 'A71-905 (4")'] },
        { image: 'page040_img02_705x1157.jpeg', chip: 'page040_img04_256x256.jpeg', colorName: 'BLANC', specs: ['Light Dimming A61-901 (3")', 'A71-901 (4")'] },
        { image: 'page041_img01_705x1157.jpeg', chip: 'page041_img03_256x256.jpeg', colorName: 'TOSCANO', specs: ['Light Dimming A61-906 (3")', 'A71-906 (4")'] },
        { image: 'page041_img02_705x1157.jpeg', chip: 'page041_img04_256x256.jpeg', colorName: 'GIARDINO', specs: ['Light Dimming A61-1066 (3")', 'A71-1066 (4")'] },
        { image: 'page042_img01_705x1157.jpeg', chip: 'page042_img03_256x256.jpeg', colorName: 'SCULPTURE', specs: ['Light Dimming A61-908 (3")', 'A71-908 (4")'] },
        { image: 'page042_img02_705x1157.jpeg', chip: 'page042_img04_256x256.jpeg', colorName: 'MOSAIC', specs: ['Light Dimming A61-1064 (3")', 'A71-1064 (4")'] },
        { image: 'page043_img01_705x1157.jpeg', chip: 'page043_img03_256x256.jpeg', colorName: 'CATHEDRAL', specs: ['Light Dimming A61-907 (3")', 'A71-907 (4")'] },
        { image: 'page043_img02_705x1157.jpeg', chip: 'page043_img04_256x256.jpeg', colorName: 'PALAZZO', specs: ['Light Dimming A61-1065 (3")', 'A71-1065 (4")'] },
      ],
    },
    {
      name: 'Alustra® Serenity',
      swatches: [
        { image: 'page044_img01_705x1157.jpeg', chip: 'page044_img03_256x256.jpeg', colorName: 'WINTRY HILLS', specs: ['Translucent A92-1115 (3")', 'A93-1115 (4")'] },
        { image: 'page044_img02_705x1157.jpeg', chip: 'page044_img04_256x256.jpeg', colorName: 'QUIET', specs: ['Translucent A92-1093 (3")', 'A93-1093 (4")'] },
        { image: 'page045_img01_705x1157.jpeg', chip: 'page045_img03_256x256.jpeg', colorName: 'PRECIOUS', specs: ['Translucent A92-1097 (3")', 'A93-1097 (4")'] },
        { image: 'page045_img02_705x1157.jpeg', chip: 'page045_img04_256x256.jpeg', colorName: 'SILVER WING', specs: ['Translucent A92-1116 (3")', 'A93-1116 (4")'] },
      ],
    },
    {
      name: 'Alustra® Celestial',
      swatches: [
        { image: 'page046_img01_705x1157.jpeg', chip: 'page046_img03_256x256.jpeg', colorName: 'SUPERNOVA', specs: ['Translucent A94-1117 (3")', 'A95-1117 (4")'] },
        { image: 'page046_img02_705x1157.jpeg', chip: 'page046_img04_256x256.jpeg', colorName: 'SPARKLING ROSÉ', specs: ['Translucent A94-1101 (3")', 'A95-1101 (4")'] },
        { image: 'page047_img01_705x1157.jpeg', chip: 'page047_img03_256x256.jpeg', colorName: 'GLISTENING BEIGE', specs: ['Translucent A94-1100 (3")', 'A95-1100 (4")'] },
        { image: 'page047_img02_705x1157.jpeg', chip: 'page047_img04_256x256.jpeg', colorName: 'CELESTIAL GRAY', specs: ['Translucent A94-1102 (3")', 'A95-1102 (4")'] },
        { image: 'page048_img01_705x1157.jpeg', chip: 'page048_img03_256x256.jpeg', colorName: 'TWINKLING SKY', specs: ['Translucent A94-1103 (3")', 'A95-1103 (4")'] },
        { image: 'page048_img02_705x1157.jpeg', chip: 'page048_img04_256x256.jpeg', colorName: 'GILDED GOLD', specs: ['Translucent A94-1104 (3")', 'A95-1104 (4")'] },
      ],
    },
    {
      name: 'Halo™ Harmony',
      swatches: [
        { image: 'page049_img01_705x1157.jpeg', chip: 'page049_img03_256x256.jpeg', colorName: 'DAISY WHITE', specs: ['Translucent A80-951 (4")'] },
        { image: 'page049_img02_705x1157.jpeg', chip: 'page049_img04_256x256.jpeg', colorName: 'JOURNAL', specs: ['Translucent A80-457 (4")'] },
        { image: 'page050_img01_705x1157.jpeg', chip: 'page050_img03_256x256.jpeg', colorName: 'WHITE BLUSH', specs: ['Translucent A80-124 (4")'] },
        { image: 'page050_img02_705x1157.jpeg', chip: 'page050_img04_256x256.jpeg', colorName: 'ROSE WATER', specs: ['Translucent A80-372 (4")'] },
        { image: 'page051_img01_705x1157.jpeg', chip: 'page051_img03_256x256.jpeg', colorName: 'WHIPPED CREAM', specs: ['Translucent A80-948 (4")'] },
        { image: 'page051_img02_705x1157.jpeg', chip: 'page051_img04_256x256.jpeg', colorName: 'DESERT SANDS', specs: ['Translucent A80-955 (4")'] },
        { image: 'page052_img01_705x1157.jpeg', chip: 'page052_img03_256x256.jpeg', colorName: 'BIRCH BARK', specs: ['Translucent A80-985 (4")'] },
        { image: 'page052_img02_705x1157.jpeg', chip: 'page052_img04_256x256.jpeg', colorName: 'BURLAP', specs: ['Translucent A80-241 (4")'] },
        { image: 'page053_img01_705x1157.jpeg', chip: 'page053_img03_256x256.jpeg', colorName: 'MIST', specs: ['Translucent A80-664 (4")'] },
        { image: 'page053_img02_705x1157.jpeg', chip: 'page053_img04_256x256.jpeg', colorName: 'POLAR GRAY', specs: ['Translucent A80-986 (4")'] },
        { image: 'page054_img01_705x1157.jpeg', chip: 'page054_img03_256x256.jpeg', colorName: 'PEARL GRAY', specs: ['Translucent A80-713 (4")'] },
        { image: 'page054_img02_705x1157.jpeg', chip: 'page054_img04_256x256.jpeg', colorName: 'PLATINUM', specs: ['Translucent A80-682 (4")'] },
      ],
    },
    {
      name: 'Signature (3"/4")',
      swatches: [
        { image: 'page055_img01_705x1157.jpeg', chip: 'page055_img03_256x256.jpeg', colorName: 'RADIANT WHITE', specs: ['Translucent A68-125 (3")', 'A69-125 (4")'] },
        { image: 'page055_img02_705x1157.jpeg', chip: 'page055_img04_256x256.jpeg', colorName: 'WHITE SAND', specs: ['Translucent A68-140 (3")', 'A69-140 (4")'] },
        { image: 'page056_img01_705x1157.jpeg', chip: 'page056_img03_256x256.jpeg', colorName: 'WHITE DIAMOND', specs: ['Translucent A68-126 (3")', 'A69-126 (4")'] },
        { image: 'page056_img02_705x1157.jpeg', chip: 'page056_img04_256x256.jpeg', colorName: 'LINEN FLIRT', specs: ['Translucent A68-127 (3")', 'A69-127 (4")'] },
        { image: 'page057_img01_705x1157.jpeg', chip: 'page057_img03_256x256.jpeg', colorName: 'HONEY BEIGE', specs: ['Translucent A68-2107 (3")', 'A69-2107 (4")'] },
        { image: 'page057_img02_705x1157.jpeg', chip: 'page057_img04_256x256.jpeg', colorName: 'FEATHER FANTASY', specs: ['Translucent A68-133 (3")', 'A69-133 (4")'] },
        { image: 'page058_img01_705x1157.jpeg', chip: 'page058_img03_256x256.jpeg', colorName: 'AVIGNON', specs: ['Translucent A68-105 (3")', 'A69-105 (4")'] },
        { image: 'page058_img02_705x1157.jpeg', chip: 'page058_img04_256x256.jpeg', colorName: 'TURTLEDOVE', specs: ['Translucent A68-116 (3")', 'A69-116 (4")'] },
        { image: 'page059_img01_705x1157.jpeg', chip: 'page059_img03_256x256.jpeg', colorName: 'EVERLEIGH', specs: ['Translucent A68-1063 (3")', 'A69-1063 (4")'] },
        { image: 'page059_img02_705x1157.jpeg', chip: 'page059_img04_256x256.jpeg', colorName: 'CLOUD', specs: ['Translucent A68-104 (3")', 'A69-104 (4")'] },
        { image: 'page060_img01_705x1157.jpeg', chip: 'page060_img03_256x256.jpeg', colorName: 'PATINA GRAY', specs: ['Translucent A68-733 (3")', 'A69-733 (4")'] },
        { image: 'page060_img02_705x1157.jpeg', chip: 'page060_img04_256x256.jpeg', colorName: 'HICKORY ASH', specs: ['Translucent A68-1057 (3")', 'A69-1057 (4")'] },
      ],
    },
    {
      name: 'Noire',
      swatches: [
        { image: 'page061_img01_705x1157.jpeg', chip: 'page061_img03_256x256.jpeg', colorName: 'NOIRE HONEY BEIGE', specs: ['Translucent A68-107 (3")', 'A69-107 (4")'] },
        { image: 'page061_img02_705x1157.jpeg', chip: 'page061_img04_256x256.jpeg', colorName: 'NOIRE TRUFFLE', specs: ['Translucent A68-686 (3")', 'A69-686 (4")'] },
        { image: 'page062_img01_705x1157.jpeg', chip: 'page062_img03_256x256.jpeg', colorName: 'NOIRE GRAPHITE', specs: ['Translucent A68-750 (3")', 'A69-750 (4")'] },
        { image: 'page062_img02_705x1157.jpeg', chip: 'page062_img04_256x256.jpeg', colorName: 'NOIRE DOVE TAIL', specs: ['Translucent A68-1068 (3")', 'A69-1068 (4")'] },
      ],
    },
    {
      name: 'Duolite™ Mystic',
      swatches: [
        { image: 'page063_img01_705x1157.jpeg', chip: 'page063_img03_256x256.jpeg', colorName: 'WHITE RABBIT', specs: ['Translucent A90-620 (3")', 'A91-620 (4")'] },
        { image: 'page063_img02_705x1157.jpeg', chip: 'page063_img04_256x256.jpeg', colorName: 'MYSTIC VAPOR', specs: ['Translucent A90-621 (3")', 'A91-621 (4")'] },
        { image: 'page064_img01_705x1157.jpeg', chip: 'page064_img03_256x256.jpeg', colorName: 'POWDER PUFF', specs: ['Translucent A90-622 (3")', 'A91-622 (4")'] },
        { image: 'page064_img02_705x1157.jpeg', chip: 'page064_img04_256x256.jpeg', colorName: 'MAGICIAN\'S CLOTH', specs: ['Translucent A90-623 (3")', 'A91-623 (4")'] },
        { image: 'page065_img01_705x1157.jpeg', chip: 'page065_img03_256x256.jpeg', colorName: 'SMOKE AND MIRRORS', specs: ['Translucent A90-626 (3")', 'A91-626 (4")'] },
        { image: 'page065_img02_705x1157.jpeg', chip: 'page065_img04_256x256.jpeg', colorName: 'THUNDER CLOUD', specs: ['Translucent A90-627 (3")', 'A91-627 (4")'] },
        { image: 'page066_img01_705x1157.jpeg', chip: 'page066_img03_256x256.jpeg', colorName: 'WINTER WOOD', specs: ['Translucent A90-1061 (3")', 'A91-1061 (4")'] },
        { image: 'page066_img02_705x1157.jpeg', chip: 'page066_img04_256x256.jpeg', colorName: 'GALLOWAY', specs: ['Translucent A90-1058 (3")', 'A91-1058 (4")'] },
      ],
    },
    {
      name: 'Bon Soir™',
      swatches: [
        { image: 'page067_img01_705x1157.jpeg', chip: 'page067_img03_256x256.jpeg', colorName: 'POWDERED SUGAR', specs: ['Translucent A96-341 (3")', 'A97-341 (4")'] },
        { image: 'page067_img02_705x1157.jpeg', chip: 'page067_img04_256x256.jpeg', colorName: 'CANDIED COCONUT', specs: ['Translucent A96-342 (3")', 'A97-342 (4")'] },
        { image: 'page068_img01_705x1157.jpeg', chip: 'page068_img03_256x256.jpeg', colorName: 'ALMOND CREPE', specs: ['Translucent A96-348 (3")', 'A97-348 (4")'] },
        { image: 'page068_img02_705x1157.jpeg', chip: 'page068_img04_256x256.jpeg', colorName: 'VANILLA ÉCLAIR', specs: ['Translucent A96-346 (3")', 'A97-346 (4")'] },
      ],
    },
    {
      name: 'Signature (2"/3"/4")',
      swatches: [
        { image: 'page069_img01_705x1134.jpeg', chip: 'page069_img03_256x256.jpeg', colorName: 'RADIANT WHITE', specs: ['Translucent A1-125 (2")', 'A2-125 (3")', 'A24-125 (4")'] },
        { image: 'page069_img02_705x1133.jpeg', chip: 'page069_img04_256x256.jpeg', colorName: 'WHITE SAND', specs: ['Translucent A1-140 (2")', 'A2-140 (3")', 'A24-140 (4")'] },
        { image: 'page070_img01_705x1134.jpeg', chip: 'page070_img03_256x256.jpeg', colorName: 'WHITE DIAMOND', specs: ['Translucent A1-126 (2")', 'A2-126 (3")', 'A24-126 (4")'] },
        { image: 'page070_img02_705x1133.jpeg', chip: 'page070_img04_256x256.jpeg', colorName: 'LINEN FLIRT', specs: ['Translucent A1-127 (2")', 'A2-127 (3")', 'A24-127 (4")'] },
        { image: 'page071_img01_705x1134.jpeg', chip: 'page071_img03_256x256.jpeg', colorName: 'HONEY BEIGE', specs: ['Translucent A1-107 (2")', 'A2-107 (3")', 'A24-107 (4")'] },
        { image: 'page071_img02_705x1133.jpeg', chip: 'page071_img04_256x256.jpeg', colorName: 'FEATHER FANTASY', specs: ['Translucent A1-133 (2")', 'A2-133 (3")', 'A24-133 (4")'] },
        { image: 'page072_img01_705x1134.jpeg', chip: 'page072_img03_256x256.jpeg', colorName: 'AVIGNON', specs: ['Translucent A1-105 (2")', 'A2-105 (3")', 'A24-105 (4")'] },
        { image: 'page072_img02_705x1133.jpeg', chip: 'page072_img04_256x256.jpeg', colorName: 'TURTLEDOVE', specs: ['Translucent A1-116 (2")', 'A2-116 (3")', 'A24-116 (4")'] },
        { image: 'page073_img01_705x1134.jpeg', chip: 'page073_img03_256x256.jpeg', colorName: 'EVERLEIGH', specs: ['Translucent A1-1063 (2")', 'A2-1063 (3")', 'A24-1063 (4")'] },
        { image: 'page073_img02_705x1133.jpeg', chip: 'page073_img04_256x256.jpeg', colorName: 'CLOUD', specs: ['Translucent A1-104 (2")', 'A2-104 (3")', 'A24-104 (4")'] },
        { image: 'page074_img01_705x1134.jpeg', chip: 'page074_img03_256x256.jpeg', colorName: 'PATINA GRAY', specs: ['Translucent A1-733 (2")', 'A2-733 (3")', 'A24-733 (4")'] },
        { image: 'page074_img02_705x1133.jpeg', chip: 'page074_img04_256x256.jpeg', colorName: 'HICKORY ASH', specs: ['Translucent A1-1057 (2")', 'A2-1057 (3")', 'A24-1057 (4")'] },
      ],
    },
    {
      name: 'ClearView® Signature',
      swatches: [
        { image: 'page075_img01_705x1157.jpeg', chip: 'page075_img03_256x256.jpeg', colorName: 'SNOW', specs: ['Translucent A84-101 (3")', 'A85-101 (4")'] },
        { image: 'page075_img02_705x1157.jpeg', chip: 'page075_img04_256x256.jpeg', colorName: 'ANGEL WING', specs: ['Translucent A84-102 (3")', 'A85-102 (4")'] },
        { image: 'page076_img01_705x1157.jpeg', chip: 'page076_img03_256x256.jpeg', colorName: 'SUGARED ALMOND', specs: ['Translucent A84-114 (3")', 'A85-114 (4")'] },
        { image: 'page076_img02_705x1157.jpeg', chip: 'page076_img04_256x256.jpeg', colorName: 'FAWN', specs: ['Translucent A84-107 (3")', 'A85-107 (4")'] },
        { image: 'page077_img01_705x1157.jpeg', chip: 'page077_img03_256x256.jpeg', colorName: 'IVORY VEIL', specs: ['Translucent A84-104 (3")', 'A85-104 (4")'] },
        { image: 'page077_img02_705x1157.jpeg', chip: 'page077_img04_256x256.jpeg', colorName: 'SANDCASTLE', specs: ['Translucent A84-119 (3")', 'A85-119 (4")'] },
        { image: 'page078_img01_705x1157.jpeg', chip: 'page078_img03_256x256.jpeg', colorName: 'SHEER TAUPE', specs: ['Translucent A84-151 (3")', 'A85-151 (4")'] },
        { image: 'page078_img02_705x1157.jpeg', chip: 'page078_img04_256x256.jpeg', colorName: 'ANTIQUE MIRROR', specs: ['Translucent A84-1041 (3")', 'A85-1041 (4")'] },
        { image: 'page079_img01_705x1157.jpeg', chip: 'page079_img03_256x256.jpeg', colorName: 'OYSTERSHELL', specs: ['Translucent A84-154 (3")', 'A85-154 (4")'] },
        { image: 'page079_img02_705x1157.jpeg', chip: 'page079_img04_256x256.jpeg', colorName: 'BLUEBIRD DAY', specs: ['Translucent A84-1044 (3")', 'A85-1044 (4")'] },
        { image: 'page080_img01_705x1157.jpeg', chip: 'page080_img03_256x256.jpeg', colorName: 'FOREST MIST', specs: ['Translucent A84-1043 (3")', 'A85-1043 (4")'] },
        { image: 'page080_img02_705x1157.jpeg', chip: 'page080_img04_256x256.jpeg', colorName: 'BRONZE GLOW', specs: ['Translucent A84-1042 (3")', 'A85-1042 (4")'] },
      ],
    },
    {
      name: 'ClearView® Distinction',
      swatches: [
        { image: 'page081_img01_705x1157.jpeg', chip: 'page081_img03_256x256.jpeg', colorName: 'PORCELAIN WHITE', specs: ['Translucent A82-501 (3")', 'A83-501 (4")'] },
        { image: 'page081_img02_705x1157.jpeg', chip: 'page081_img04_256x256.jpeg', colorName: 'ALABASTER', specs: ['Translucent A82-502 (3")', 'A83-502 (4")'] },
        { image: 'page082_img01_705x1157.jpeg', chip: 'page082_img03_256x256.jpeg', colorName: 'HARMONY', specs: ['Translucent A82-506 (3")', 'A83-506 (4")'] },
        { image: 'page082_img02_705x1157.jpeg', chip: 'page082_img04_256x256.jpeg', colorName: 'ALMOND GLOW', specs: ['Translucent A82-507 (3")', 'A83-507 (4")'] },
        { image: 'page083_img01_705x1157.jpeg', chip: 'page083_img03_256x256.jpeg', colorName: 'SPUN SUGAR', specs: ['Translucent A82-509 (3")', 'A83-509 (4")'] },
        { image: 'page083_img02_705x1157.jpeg', chip: 'page083_img04_256x256.jpeg', colorName: 'SAND SHIMMER', specs: ['Translucent A82-572 (3")', 'A83-572 (4")'] },
        { image: 'page084_img01_705x1157.jpeg', chip: 'page084_img03_256x256.jpeg', colorName: 'FRESH TAUPE', specs: ['Translucent A82-575 (3")', 'A83-575 (4")'] },
        { image: 'page084_img02_705x1157.jpeg', chip: 'page084_img04_256x256.jpeg', colorName: 'MYSTIC BRONZE', specs: ['Translucent A82-576 (3")', 'A83-576 (4")'] },
        { image: 'page085_img01_705x1157.jpeg', chip: 'page085_img03_256x256.jpeg', colorName: 'PEACEFUL SAGE', specs: ['Translucent A82-1045 (3")', 'A83-1045 (4")'] },
        { image: 'page085_img02_705x1157.jpeg', chip: 'page085_img04_256x256.jpeg', colorName: 'PACIFICA BLUE', specs: ['Translucent A82-1046 (3")', 'A83-1046 (4")'] },
        { image: 'page086_img01_705x1157.jpeg', chip: 'page086_img03_256x256.jpeg', colorName: 'SILVER SHINE', specs: ['Translucent A82-573 (3")', 'A83-573 (4")'] },
        { image: 'page086_img02_705x1157.jpeg', chip: 'page086_img04_256x256.jpeg', colorName: 'BLACK ICE', specs: ['Translucent A82-1047 (3")', 'A83-1047 (4")'] },
      ],
    },
    {
      name: 'Signature Light Dimming (2"/3"/4")',
      swatches: [
        { image: 'page087_img01_705x1134.jpeg', chip: 'page087_img03_256x256.jpeg', colorName: 'SECLUSION WHITE', specs: ['Light Dimming A3-137 (2")', 'A6-137 (3")', 'A23-137 (4")'] },
        { image: 'page087_img02_705x1133.jpeg', chip: 'page087_img04_256x256.jpeg', colorName: 'WHITE SAND', specs: ['Light Dimming A3-140 (2")', 'A6-140 (3")', 'A23-140 (4")'] },
        { image: 'page088_img01_705x1134.jpeg', chip: 'page088_img03_256x256.jpeg', colorName: 'STAR DUST', specs: ['Light Dimming A3-195 (2")', 'A6-195 (3")', 'A23-195 (4")'] },
        { image: 'page088_img02_705x1133.jpeg', chip: 'page088_img04_256x256.jpeg', colorName: 'TWILIGHT', specs: ['Light Dimming A3-196 (2")', 'A6-196 (3")', 'A23-196 (4")'] },
        { image: 'page089_img01_705x1134.jpeg', chip: 'page089_img03_256x256.jpeg', colorName: 'HONEY BEIGE', specs: ['Light Dimming A3-107 (2")', 'A6-107 (3")', 'A23-107 (4")'] },
        { image: 'page089_img02_705x1133.jpeg', chip: 'page089_img04_256x256.jpeg', colorName: 'FEATHER FANTASY', specs: ['Light Dimming A3-133 (2")', 'A6-133 (3")', 'A23-133 (4")'] },
        { image: 'page090_img01_705x1134.jpeg', chip: 'page090_img03_256x256.jpeg', colorName: 'TURTLEDOVE', specs: ['Light Dimming A3-116 (2")', 'A6-116 (3")', 'A23-116 (4")'] },
        { image: 'page090_img02_705x1133.jpeg', chip: 'page090_img04_256x256.jpeg', colorName: 'CLOUD', specs: ['Light Dimming A3-104 (2")', 'A6-104 (3")', 'A23-104 (4")'] },
      ],
    },
    {
      name: 'Brio™ (2"/3"/4")',
      swatches: [
        { image: 'page091_img01_705x1134.jpeg', chip: 'page091_img03_256x256.jpeg', colorName: 'WHITE BRILLIANCE', specs: ['Translucent A16-301 (2")', 'A17-301 (3")', 'A30-301 (4")'] },
        { image: 'page091_img02_705x1133.jpeg', chip: 'page091_img04_256x256.jpeg', colorName: 'WHITE JEWEL', specs: ['Translucent A16-302 (2")', 'A17-302 (3")', 'A30-302 (4")'] },
        { image: 'page092_img01_705x1134.jpeg', chip: 'page092_img03_256x256.jpeg', colorName: 'CREAM PITCHER', specs: ['Translucent A16-303 (2")', 'A17-303 (3")', 'A30-303 (4")'] },
        { image: 'page092_img02_705x1133.jpeg', chip: 'page092_img04_256x256.jpeg', colorName: 'TABLE LINEN', specs: ['Translucent A16-306 (2")', 'A17-306 (3")', 'A30-306 (4")'] },
        { image: 'page093_img01_705x1134.jpeg', chip: 'page093_img03_256x256.jpeg', colorName: 'ÉCLAIR', specs: ['Translucent A16-313 (2")', 'A17-313 (3")', 'A30-313 (4")'] },
        { image: 'page093_img02_705x1133.jpeg', chip: 'page093_img04_256x256.jpeg', colorName: 'CELERY SEED', specs: ['Translucent A16-314 (2")', 'A17-314 (3")', 'A30-314 (4")'] },
        { image: 'page094_img01_705x1134.jpeg', chip: 'page094_img03_256x256.jpeg', colorName: 'CANNES', specs: ['Translucent A16-315 (2")', 'A17-315 (3")', 'A30-315 (4")'] },
        { image: 'page094_img02_705x1133.jpeg', chip: 'page094_img04_256x256.jpeg', colorName: 'HONEY', specs: ['Translucent A16-316 (2")', 'A17-316 (3")', 'A30-316 (4")'] },
      ],
    },
    {
      name: 'Bon Soir™ Halo™',
      swatches: [
        { image: 'page095_img01_705x1157.jpeg', chip: 'page095_img03_256x256.jpeg', colorName: 'APRIL SNOW', specs: ['Translucent A88-411 (3")', 'A89-411 (4")'] },
        { image: 'page095_img02_705x1157.jpeg', chip: 'page095_img04_256x256.jpeg', colorName: 'PERLA', specs: ['Translucent A88-1124 (3")', 'A89-1124 (4")'] },
        { image: 'page096_img01_705x1157.jpeg', chip: 'page096_img03_256x256.jpeg', colorName: 'SONGBIRD', specs: ['Translucent A88-1122 (3")', 'A89-1122 (4")'] },
        { image: 'page096_img02_705x1157.jpeg', chip: 'page096_img04_256x256.jpeg', colorName: 'ENDLESS GRAY', specs: ['Translucent A88-1123 (3")', 'A89-1123 (4")'] },
        { image: 'page097_img01_705x1157.jpeg', chip: 'page097_img03_256x256.jpeg', colorName: 'ETERNAL', specs: ['Translucent A88-416 (3")', 'A89-416 (4")'] },
        { image: 'page097_img02_705x1157.jpeg', chip: 'page097_img04_256x256.jpeg', colorName: 'NIGHTFALL', specs: ['Translucent A88-1121 (3")', 'A89-1121 (4")'] },
      ],
    },
    {
      name: 'Duolite™ Mystic Halo™',
      swatches: [
        { image: 'page098_img01_705x1157.jpeg', chip: 'page098_img03_256x256.jpeg', colorName: 'WHITE RABBIT', specs: ['Translucent A42-620 (3")', 'A43-620 (4")'] },
        { image: 'page098_img02_705x1157.jpeg', chip: 'page098_img04_256x256.jpeg', colorName: 'MYSTIC VAPOR', specs: ['Translucent A42-621 (3")', 'A43-621 (4")'] },
        { image: 'page099_img01_705x1157.jpeg', chip: 'page099_img03_256x256.jpeg', colorName: 'POWDER PUFF', specs: ['Translucent A42-622 (3")', 'A43-622 (4")'] },
        { image: 'page099_img02_705x1157.jpeg', chip: 'page099_img04_256x256.jpeg', colorName: 'MAGICIAN\'S CLOTH', specs: ['Translucent A42-623 (3")', 'A43-623 (4")'] },
        { image: 'page100_img01_705x1157.jpeg', chip: 'page100_img03_256x256.jpeg', colorName: 'SMOKE AND MIRRORS', specs: ['Translucent A42-626 (3")', 'A43-626 (4")'] },
        { image: 'page100_img02_705x1157.jpeg', chip: 'page100_img04_256x256.jpeg', colorName: 'THUNDER CLOUD', specs: ['Translucent A42-627 (3")', 'A43-627 (4")'] },
        { image: 'page101_img01_705x1157.jpeg', chip: 'page101_img03_256x256.jpeg', colorName: 'WINTER WOOD', specs: ['Translucent A42-1061 (3")', 'A43-1061 (4")'] },
        { image: 'page101_img02_705x1157.jpeg', chip: 'page101_img04_256x256.jpeg', colorName: 'GALLOWAY', specs: ['Translucent A42-1058 (3")', 'A43-1058 (4")'] },
      ],
    },
    {
      name: 'Bon Soir™ Halo™ (ClearView®)',
      swatches: [
        { image: 'page102_img01_705x1157.jpeg', chip: 'page102_img03_256x256.jpeg', colorName: 'POWDERED SUGAR', specs: ['Translucent A36-341 (3")', 'A37-341 (4")'] },
        { image: 'page102_img02_705x1157.jpeg', chip: 'page102_img04_256x256.jpeg', colorName: 'CANDIED COCONUT', specs: ['Translucent A36-342 (3")', 'A37-342 (4")'] },
        { image: 'page103_img01_705x1157.jpeg', chip: 'page103_img03_256x256.jpeg', colorName: 'ALMOND CREPE', specs: ['Translucent A36-348 (3")', 'A37-348 (4")'] },
        { image: 'page103_img02_705x1157.jpeg', chip: 'page103_img04_256x256.jpeg', colorName: 'VANILLA ÉCLAIR', specs: ['Translucent A36-346 (3")', 'A37-346 (4")'] },
      ],
    },
    {
      name: 'Jardin™ Halo™',
      swatches: [
        { image: 'page104_img01_705x1157.jpeg', chip: 'page104_img03_256x256.jpeg', colorName: 'MARBLE SLAB', specs: ['Translucent A46-407 (3")', 'A47-407 (4")'] },
        { image: 'page104_img02_705x1157.jpeg', chip: 'page104_img04_256x256.jpeg', colorName: 'SAGEBRUSH', specs: ['Translucent A46-401 (3")', 'A47-401 (4")'] },
        { image: 'page105_img01_705x1157.jpeg', chip: 'page105_img03_256x256.jpeg', colorName: 'WILD RICE', specs: ['Translucent A46-402 (3")', 'A47-402 (4")'] },
        { image: 'page105_img02_705x1157.jpeg', chip: 'page105_img04_256x256.jpeg', colorName: 'ROSEMARY MEMORY', specs: ['Translucent A46-404 (3")', 'A47-404 (4")'] },
        { image: 'page106_img01_705x1157.jpeg', chip: 'page106_img03_256x256.jpeg', colorName: 'ASPEN BARK', specs: ['Translucent A46-405 (3")', 'A47-405 (4")'] },
        { image: 'page106_img02_705x1157.jpeg', chip: 'page106_img04_256x256.jpeg', colorName: 'BLUE AGAVE', specs: ['Translucent A46-406 (3")', 'A47-406 (4")'] },
      ],
    },
    {
      name: 'Lunar™ Halo™',
      swatches: [
        { image: 'page107_img01_705x1157.jpeg', chip: 'page107_img03_256x256.jpeg', colorName: 'CIRRUS', specs: ['Translucent A86-331 (3")', 'A87-331 (4")'] },
        { image: 'page107_img02_705x1157.jpeg', chip: 'page107_img04_256x256.jpeg', colorName: 'MICROMOON', specs: ['Translucent A86-1049 (3")', 'A87-1049 (4")'] },
        { image: 'page108_img01_705x1157.jpeg', chip: 'page108_img03_256x256.jpeg', colorName: 'COSMIC DUST', specs: ['Translucent A86-1048 (3")', 'A87-1048 (4")'] },
        { image: 'page108_img02_705x1157.jpeg', chip: 'page108_img04_256x256.jpeg', colorName: 'RICH EARTH', specs: ['Translucent A86-1050 (3")', 'A87-1050 (4")'] },
        { image: 'page109_img01_705x1157.jpeg', chip: 'page109_img03_256x256.jpeg', colorName: 'THUNDERSHOWER', specs: ['Translucent A86-338 (3")', 'A87-338 (4")'] },
        { image: 'page109_img02_705x1157.jpeg', chip: 'page109_img04_256x256.jpeg', colorName: 'PERFECT STORM', specs: ['Translucent A86-339 (3")', 'A87-339 (4")'] },
      ],
    },
    {
      name: 'Originale (2"/3"/4")',
      swatches: [
        { image: 'page110_img01_705x1134.jpeg', chip: 'page110_img03_256x256.jpeg', colorName: 'POWDER WHITE', specs: ['Translucent A4-167 (2")', 'A7-167 (3")', 'A29-167 (4")'] },
        { image: 'page110_img02_705x1133.jpeg', chip: 'page110_img04_256x256.jpeg', colorName: 'SCENTED LINEN', specs: ['Translucent A4-168 (2")', 'A7-168 (3")', 'A29-168 (4")'] },
        { image: 'page111_img01_705x1134.jpeg', chip: 'page111_img03_256x256.jpeg', colorName: 'FRESH LOTUS', specs: ['Translucent A4-169 (2")', 'A7-169 (3")', 'A29-169 (4")'] },
        { image: 'page111_img02_705x1133.jpeg', chip: 'page111_img04_256x256.jpeg', colorName: 'VANILLA FRAGRANCE', specs: ['Translucent A4-170 (2")', 'A7-170 (3")', 'A29-170 (4")'] },
        { image: 'page112_img01_705x1134.jpeg', chip: 'page112_img03_256x256.jpeg', colorName: 'MYSTIC WHITE', specs: ['Translucent A4-183 (2")', 'A7-183 (3")', 'A29-183 (4")'] },
        { image: 'page112_img02_705x1133.jpeg', chip: 'page112_img04_256x256.jpeg', colorName: 'ALPACA', specs: ['Translucent A4-204 (2")', 'A7-204 (3")', 'A29-204 (4")'] },
        { image: 'page113_img01_705x1134.jpeg', chip: 'page113_img03_256x256.jpeg', colorName: 'REVERE', specs: ['Translucent A4-1059 (2")', 'A7-1059 (3")', 'A29-1059 (4")'] },
        { image: 'page113_img02_705x1133.jpeg', chip: 'page113_img04_256x256.jpeg', colorName: 'ALLURE', specs: ['Translucent A4-1060 (2")', 'A7-1060 (3")', 'A29-1060 (4")'] },
      ],
    },
  ],
}
