import type { ProductLayout, SectionLayout, SwatchCollection } from './types'

export const provenanceLayout: ProductLayout = {
  slug: 'provenance',
  name: 'Provenance® Woven Wood Shades',
  description: 'Bring an organic style to your home. The handcrafted natural materials of Provenance® Woven Wood Shades are artistically woven to create a design story of light, texture and color.',

  heroImage: 'page007_img02_3095x1729.jpeg',
  heroLabel: 'Fabric Name    Color Name\nOperating System Name    Deck X',

  sections: [
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page007_img02_3095x1729.jpeg',
          text: 'Bring an organic style to your home. The handcrafted natural materials of Provenance® Woven Wood Shades are artistically woven to create a design story of light, texture and color in your home.',
          label: 'Fabric Name    Color Name\nOperating System Name    Deck X',
        },
        {
          image: 'page010_img01_2684x1730.jpeg',
          text: 'Add texture and dimension with Design Studio™ decorative side panels.',
          label: 'Fabric Millhouse    Color Burlap Sack\nOperating System PowerView® Automation    Deck 29',
        },
        {
          image: 'page011_img01_3078x1730.jpeg',
          text: 'Coordinate windows and doors beautifully.',
          label: 'Fabric Soho    Color Concrete\nOperating System Vertical Drapery: Wand, Shade: LiteRise®    Deck 6',
        },
        {
          image: 'page012_img01_2717x1730.jpeg',
          text: 'Natural materials curated and crafted into custom weaves.',
          label: 'Fabric Mallorca with Independent Operable Liner    Color Olive Tree\nOperating System PowerView® Automation    Deck Fine Weave 3',
        },
        {
          image: 'page013_img01_3099x1730.jpeg',
          text: 'Cordless operating systems for enhanced safety.',
          label: 'Fabric Glace with Attached Liner    Color First Frost\nOperating System LiteRise®    Deck 12',
        },
        {
          image: 'page014_img01_2768x1728.jpeg',
          text: 'Define the space with depth and dimension.',
          label: 'Fabric Antigua with Attached Liner    Color Stingray\nOperating System PowerView® Automation    Deck 8',
        },
      ],
    },
    // Page 17: Light Control and Privacy
    {
      type: 'split-scene',
      title: 'Light Control and Privacy',
      sceneImage: 'page017_img01_1167x1730.jpeg',
      sceneLabel: 'Fabric Antigua with Attached Liner    Color Stingray\nOperating System PowerView® Automation    Deck 8',
      sceneSide: 'left',
      items: [
        { image: 'page017_img02_818x539.jpeg', label: 'Sheer', desc: 'Opacity Rating 1\nMost Light – Least Privacy' },
        { image: 'page017_img03_818x539.jpeg', label: 'Semi-Sheer', desc: 'Opacity Rating 2\nModerate Light – Some Privacy' },
        { image: 'page017_img04_818x539.jpeg', label: 'Semi-Opaque', desc: 'Opacity Rating 3\nSome Light – More Privacy' },
        { image: 'page017_img05_818x539.jpeg', label: 'Opaque', desc: 'Opacity Rating 4\nLeast Light – Most Privacy' },
      ],
    },
    // Page 18: Independent Operable Liner & Attached Liner
    // Page 20: Fabric Styles
    {
      type: 'split-scene',
      title: 'Fabric Styles',
      sceneImage: 'page020_img01_2086x1730.jpeg',
      sceneLabel: 'Fabric Positano with Independent Operable Liner    Color Pebbled Beach\nOperating System PowerView® Automation    Deck Fine Weave 4',
      sceneSide: 'left',
      items: [
        { image: 'page020_img02_300x385.jpeg', label: 'Antigua', desc: 'Deck 8    Semi-Sheer' },
        { image: 'page020_img03_300x385.jpeg', label: 'Arosa', desc: 'Deck Fine Weave 2    Semi-Opaque' },
        { image: 'page020_img04_300x384.jpeg', label: 'Auckland', desc: 'Deck 24    Semi-Opaque' },
        { image: 'page020_img05_300x385.jpeg', label: 'Bamboo Forest', desc: 'Deck 9    Semi-Sheer' },
        { image: 'page020_img06_300x385.jpeg', label: 'Calabash', desc: 'Deck 10    Semi-Sheer' },
        { image: 'page020_img07_300x384.jpeg', label: 'Calliope', desc: 'Deck 25    Semi-Opaque' },
      ],
    },
    // Page 24: Shade Styles
    {
      type: 'shade-styles',
      title: 'Shade Styles',
      topImages: [
        {
          image: 'page024_img01_1229x1730.jpeg',
          label: 'Fabric Mallorca with Independent Operable Liner    Color Olive Tree',
          desc: 'Operating System PowerView® Automation    Deck Fine Weave 3',
        },
      ],
      lineDrawings: [
        {
          image: 'page024_img02_417x539.jpeg',
          label: 'Recessed Roman',
          desc: 'Shade hangs flat in fully-lowered position and creates even, overlapping folds when raised. Comes standard with Modern Valance (2½" height).',
        },
        {
          image: 'page024_img03_417x539.jpeg',
          label: 'Roman Waterfall Roman',
          desc: 'For a tailored look, the fabric cascades from the front of the headrail. No valance option available.',
        },
      ],
    },
    // Page 25: Vertical Drapery
    {
      type: 'split-scene',
      title: 'Vertical Drapery',
      sceneImage: 'page025_img01_1233x1730.jpeg',
      sceneLabel: 'Fabric Soho    Color Concrete\nOperating System Vertical Drapery    Deck 6',
      sceneSide: 'left',
      items: [
        { image: 'page025_img04_526x570.jpeg', label: 'Closed Side Stack', desc: 'Gentle fabric folds bring added dimension to a room.' },
        { image: 'page025_img02_525x570.jpeg', label: 'Split Stack Center', desc: 'The ideal solution for wide windows and doors.' },
        { image: 'page025_img03_525x571.jpeg', label: 'Split Stack Off-Center', desc: 'Vertical Drapery comes standard with a valance.' },
        { image: 'page025_img02_525x570.jpeg', label: 'One-Way Stack', desc: 'A classic draw for a clean, simple look.' },
      ],
    },
    // Pages 26+28: PowerView & Operating Systems
    {
      type: 'control-systems',
      sceneImage: null,
      sceneLabel: 'PowerView® Automation',
      panels: [
        {
          title: 'PowerView® Automation',
          features: [
            { title: 'Convenience', desc: 'Achieve your perfect light automatically' },
            { title: 'Privacy', desc: 'Schedule shadings to close whenever you prefer' },
            { title: 'Energy Efficiency', desc: 'Program shadings to be in the best positions throughout the day' },
            { title: 'Security', desc: 'Remote control gives the illusion that you are always home' },
            { title: 'Child Friendly', desc: 'Simple, cord-free operation' },
            { title: 'Battery Powered or Hardwired', desc: 'For seamless installation, operation and maintenance' },
            { title: 'Voice Control', desc: 'Compatible with smart speakers and smart-home systems' },
          ],
        },
        {
          title: 'Operating Systems — Shades',
          items: [
            { image: 'page028_img02_554x489.jpeg', title: 'LiteRise®', desc: 'Cordless system makes raising and lowering shades easier. Simply push up to raise or pull down to lower.' },
            { image: 'page028_img03_553x489.jpeg', title: 'UltraGlide®', desc: 'Exclusive to Hunter Douglas, the revolutionary retractable system provides enhanced safety.' },
          ],
        },
        {
          title: 'Operating Systems — Vertical Drapery',
          items: [
            { image: 'page028_img09_553x489.jpeg', title: 'Wand Control', desc: 'The optional wand control color is pre-selected to best coordinate with each fabric.' },
          ],
        },
      ],
    },
    // Valances
    {
      type: 'comparison-grid',
      title: 'Valances',
      cols: 3,
      items: [
        { image: 'page028_img04_490x1057.jpeg', label: 'Roman Valance', desc: 'Standard: Vertical Drapery. Optional: Roman and Recessed Roman Shade. The relaxed profile gently moves forward to allow for shade stack when raised.' },
        { image: 'page028_img05_491x1057.jpeg', label: 'Modern Valance', desc: 'Standard: Roman Shade and Recessed Roman Shade. The sleek, modern 2½" profile provides a minimal design aesthetic.' },
        { image: 'page028_img06_491x1056.jpeg', label: 'Cornice Valance', desc: 'Optional: Roman, Recessed and Waterfall Roman Shade. Outside mount only. The fabric wrapped cornice provides a structured and tailored profile.' },
      ],
    },
    // Page 28: Decorative Edge Banding
    {
      type: 'edge-banding',
      title: 'Decorative Edge Banding',
      widths: [
        { image: 'page028_img07_361x522.jpeg', label: 'Narrow', desc: '5/8"' },
        { image: 'page028_img08_361x521.jpeg', label: 'Wide', desc: '1½"' },
      ],
      colors: [
        { image: 'page040_img01_306x306.jpeg', label: '102 Snow' },
        { image: 'page040_img02_306x306.jpeg', label: '351 Eggshell' },
        { image: 'page040_img03_306x306.jpeg', label: '355 Taupe' },
        { image: 'page040_img04_306x306.jpeg', label: '367 Biscotti' },
        { image: 'page040_img05_306x306.jpeg', label: '408 Chiffon' },
        { image: 'page040_img06_306x306.jpeg', label: '461 Tawny' },
        { image: 'page040_img07_306x306.jpeg', label: '816 Steel' },
        { image: 'page040_img08_306x306.jpeg', label: '901 Charcoal' },
      ],
    },
    // Page 29: Mounting Profiles
    {
      type: 'mounting-grid',
      title: 'Mounting Profiles',
      rows: [
        {
          label: 'Shades',
          items: [
            { image: 'page029_img01_536x342.jpeg', label: 'Standard/Recessed Roman Inside Mount' },
            { image: 'page029_img05_536x342.jpeg', label: 'Standard/Recessed Roman Partial Mount' },
            { image: 'page029_img08_536x342.jpeg', label: 'Standard/Recessed Roman Outside Mount' },
            { image: 'page029_img03_536x342.jpeg', label: 'Standard/Recessed Roman with Valance Inside Mount' },
            { image: 'page029_img07_536x342.jpeg', label: 'Standard/Recessed Roman with Valance Partial Mount' },
            { image: 'page029_img10_536x342.jpeg', label: 'Standard/Recessed Roman with Valance Outside Mount' },
            { image: 'page029_img02_536x342.jpeg', label: 'Waterfall Roman Inside Mount' },
            { image: 'page029_img06_536x342.jpeg', label: 'Waterfall Roman Partial Mount' },
            { image: 'page029_img09_536x342.jpeg', label: 'Waterfall Roman Outside Mount' },
          ],
        },
        {
          label: 'Vertical Drapery',
          items: [
            { image: 'page029_img04_536x342.jpeg', label: 'Vertical Drapery Inside Mount' },
            { image: 'page029_img11_536x342.jpeg', label: 'Vertical Drapery Outside Mount' },
            { image: 'page029_img12_536x342.jpeg', label: 'Vertical Drapery Partial Mount' },
          ],
        },
      ],
    },
  ],

  gallery: [
    {
      image: 'page007_img01_1055x1730.jpeg',
      text: '',
      label: 'Provenance® Woven Wood Shades',
    },
    {
      image: 'page010_img02_793x1055.jpeg',
      text: 'Add texture and dimension with Design Studio™ decorative side panels.',
      label: 'Fabric Millhouse    Color Burlap Sack',
    },
    {
      image: 'page012_img02_792x1055.jpeg',
      text: 'Natural materials curated and crafted into custom weaves.',
      label: 'Fabric Mallorca    Color Olive Tree',
    },
    {
      image: 'page014_img02_790x1055.jpeg',
      text: 'Define the space with depth and dimension.',
      label: 'Fabric Antigua    Color Stingray',
    },
  ],

  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'The actual colors of the fabric may vary slightly from the samples in this book.',
    items: [
      { image: 'page039_flat01_306x306.jpeg', label: '064 Bronze' },
      { image: 'page039_flat02_306x306.jpeg', label: '320 Rich Cream' },
      { image: 'page039_flat03_306x306.jpeg', label: '661 White Tiara' },
      { image: 'page039_flat04_306x306.jpeg', label: '689 Ash' },
      { image: 'page039_flat05_306x306.jpeg', label: '765 Silver Maple' },
      { image: 'page039_flat06_306x306.jpeg', label: '859 Desert Tan' },
      { image: 'page039_flat07_306x306.jpeg', label: '903 Desert Gold' },
    ],
  },

  liner: {
    type: 'liner',
    title: 'Liner Colors',
    groups: [
      {
        heading: 'Independent Operable Liner',
        subgroups: [
          {
            title: 'Duo Liner Colors',
            desc: 'Choose between light-filtering or room-darkening opacities. Liner features color on room side with neutral backing for street side uniformity.',
            colors: [
              { image: 'page041_flat01_306x306.jpeg', label: 'Frostline' },
              { image: 'page041_flat02_306x306.jpeg', label: 'Cloud' },
              { image: 'page041_flat03_305x306.jpeg', label: 'Mushroom' },
              { image: 'page041_flat04_306x306.jpeg', label: 'Chestnut' },
              { image: 'page041_flat05_306x306.jpeg', label: 'Raincloud' },
            ],
          },
          {
            title: 'Mono Liner Colors',
            desc: 'This room-darkening liner features same color on both sides for color consistency on room facing and street side.',
            colors: [
              { image: 'page041_flat06_305x306.jpeg', label: 'Mushroom' },
              { image: 'page041_flat07_306x306.jpeg', label: 'Chestnut' },
              { image: 'page041_flat08_306x306.jpeg', label: 'Raincloud' },
            ],
          },
        ],
      },
      {
        heading: 'Attached Liner',
        subgroups: [
          {
            title: 'Duo Liner Colors',
            desc: 'Choose between light-filtering or room-darkening opacities. Liner features color on room side with neutral backing for street side uniformity.',
            colors: [
              { image: 'page041_flat09_306x306.jpeg', label: 'White' },
              { image: 'page041_flat10_306x306.jpeg', label: 'Cream' },
              { image: 'page041_flat11_305x306.jpeg', label: 'Hazelnut' },
              { image: 'page041_flat12_306x306.jpeg', label: 'Gray' },
              { image: 'page041_flat13_306x306.jpeg', label: 'Chocolate' },
            ],
          },
          {
            title: 'Mono Liner Colors',
            desc: 'This room-darkening liner features same color on both sides for color consistency on room facing and street side.',
            colors: [
              { image: 'page041_flat14_306x306.jpeg', label: 'Sand' },
              { image: 'page041_flat15_306x306.jpeg', label: 'Clay' },
              { image: 'page041_flat16_306x306.jpeg', label: 'Steel' },
            ],
          },
        ],
      },
    ],
  },

  edgeBanding: null,
  opacity: null,
  decorativeTapes: null,
  cellSize: null,

  swatchCollections: [
    {
      name: 'Cambria — Sheer',
      swatches: [
        { image: 'page042_img01_736x1206.jpeg', colorName: 'TRELLIS', specs: ['Sheer', 'CAM-300'] },
        { image: 'page042_img02_736x1206.jpeg', colorName: 'GARDEN PATH', specs: ['Sheer', 'CAM-350'] },
      ],
    },
    {
      name: 'Coastal — Sheer',
      swatches: [
        { image: 'page043_img01_736x1206.jpeg', colorName: 'TERRACE WHITE', specs: ['Sheer', 'COA-100'] },
        { image: 'page043_img02_736x1206.jpeg', colorName: 'EGRET', specs: ['Sheer', 'COA-109'] },
      ],
    },
    {
      name: 'Hacienda — Sheer',
      swatches: [
        { image: 'page044_img01_776x1268.jpeg', colorName: 'MAGNOLIA', specs: ['Sheer', 'HCN-101'] },
        { image: 'page044_img02_736x1206.jpeg', colorName: 'SAFFLOWER', specs: ['Sheer', 'HCN-201'] },
      ],
    },
    {
      name: 'Maldives — Sheer',
      swatches: [
        { image: 'page045_img01_736x1205.jpeg', colorName: 'VOLCANIC', specs: ['Sheer', 'MV-450'] },
      ],
    },
    {
      name: 'Rustica — Sheer',
      swatches: [
        { image: 'page046_img01_736x1206.jpeg', colorName: 'TIN ROOF', specs: ['Sheer', 'RUS-807'] },
        { image: 'page046_img02_736x1206.jpeg', colorName: 'WEATHERED TIMBER', specs: ['Sheer', 'RUS-472'] },
      ],
    },
    {
      name: 'Soho — Sheer',
      swatches: [
        { image: 'page047_img01_736x1206.jpeg', colorName: 'HUDSON', specs: ['Sheer', 'SOH-301'] },
        { image: 'page047_img02_736x1206.jpeg', colorName: 'CONCRETE', specs: ['Sheer', 'SOH-802'] },
        { image: 'page048_img01_736x1206.jpeg', colorName: 'CAST IRON', specs: ['Sheer', 'SOH-801'] },
      ],
    },
    {
      name: 'Tahiti — Sheer',
      swatches: [
        { image: 'page049_img01_736x1206.jpeg', colorName: 'COCONUT', specs: ['Sheer', 'TAH-445'] },
        { image: 'page049_img02_736x1206.jpeg', colorName: 'GINGER', specs: ['Sheer', 'TAH-401'] },
      ],
    },
    {
      name: 'Antigua — Semi-Sheer',
      swatches: [
        { image: 'page050_img01_736x1206.jpeg', colorName: 'MOON BAY', specs: ['Semi-Sheer', 'ATG-101'] },
        { image: 'page050_img02_736x1206.jpeg', colorName: 'STINGRAY', specs: ['Semi-Sheer', 'ATG-901'] },
      ],
    },
    {
      name: 'Bamboo Forest — Semi-Sheer',
      swatches: [
        { image: 'page051_img01_736x1206.jpeg', colorName: 'CANE', specs: ['Semi-Sheer', 'BBF-401'] },
        { image: 'page051_img02_736x1206.jpeg', colorName: 'RATTAN', specs: ['Semi-Sheer', 'BBF-201'] },
      ],
    },
    {
      name: 'Calabash — Semi-Sheer',
      swatches: [
        { image: 'page052_img01_736x1206.jpeg', colorName: 'WILLOW', specs: ['Semi-Sheer', 'CLB-401'] },
        { image: 'page052_img02_736x1206.jpeg', colorName: 'SHORES', specs: ['Semi-Sheer', 'CLB-201'] },
        { image: 'page053_img01_736x1206.jpeg', colorName: 'PEARL', specs: ['Semi-Sheer', 'CLB-101'] },
      ],
    },
    {
      name: 'Charleston — Semi-Sheer',
      swatches: [
        { image: 'page054_img01_736x1206.jpeg', colorName: 'HEIRLOOM COTTON', specs: ['Semi-Sheer', 'CHL-147'] },
        { image: 'page054_img02_736x1206.jpeg', colorName: 'LANTERN GLOW', specs: ['Semi-Sheer', 'CHL-300'] },
      ],
    },
    {
      name: 'Glace — Semi-Sheer',
      swatches: [
        { image: 'page055_img01_736x1206.jpeg', colorName: 'FIRST FROST', specs: ['Semi-Sheer', 'GLE-100'] },
        { image: 'page055_img02_736x1206.jpeg', colorName: 'CARAMEL', specs: ['Semi-Sheer', 'GLE-401'] },
      ],
    },
    {
      name: 'Jute Forest — Semi-Sheer',
      swatches: [
        { image: 'page056_img01_736x1206.jpeg', colorName: 'SYCAMORE', specs: ['Semi-Sheer', 'JUT-408'] },
        { image: 'page056_img02_736x1206.jpeg', colorName: 'WHITE BIRCH', specs: ['Semi-Sheer', 'JUT-808'] },
        { image: 'page057_img01_736x1206.jpeg', colorName: 'POPLAR', specs: ['Semi-Sheer', 'JUT-101'] },
      ],
    },
    {
      name: 'Madagascar — Semi-Sheer',
      swatches: [
        { image: 'page058_img01_736x1206.jpeg', colorName: 'VANILLA', specs: ['Semi-Sheer', 'MADG-101'] },
        { image: 'page058_img02_736x1206.jpeg', colorName: 'GRASSLANDS', specs: ['Semi-Sheer', 'MADG-401'] },
      ],
    },
    {
      name: 'Maritime — Semi-Sheer',
      swatches: [
        { image: 'page059_img01_736x1206.jpeg', colorName: 'ALABASTER', specs: ['Semi-Sheer', 'MRT-102'] },
        { image: 'page059_img02_736x1206.jpeg', colorName: 'MORNING FOG', specs: ['Semi-Sheer', 'MRT-801'] },
        { image: 'page060_img01_736x1206.jpeg', colorName: 'OYSTER SHELL', specs: ['Semi-Sheer', 'MRT-802'] },
      ],
    },
    {
      name: 'Mindanao — Semi-Sheer',
      swatches: [
        { image: 'page061_img01_736x1206.jpeg', colorName: 'BARLEY', specs: ['Semi-Sheer', 'MIN-420'] },
        { image: 'page061_img02_736x1206.jpeg', colorName: 'WOODGRAIN', specs: ['Semi-Sheer', 'MIN-400'] },
        { image: 'page062_img01_736x1206.jpeg', colorName: 'GRAPHITE', specs: ['Semi-Sheer', 'MIN-852'] },
        { image: 'page062_img02_736x1206.jpeg', colorName: 'MARAGUSAN', specs: ['Semi-Sheer', 'MIN-811'] },
      ],
    },
    {
      name: 'Minerals — Semi-Sheer',
      swatches: [
        { image: 'page063_img01_736x1206.jpeg', colorName: 'CRYSTALLINE', specs: ['Semi-Sheer', 'MLS-100'] },
        { image: 'page063_img02_736x1206.jpeg', colorName: 'AMBER', specs: ['Semi-Sheer', 'MLS-401'] },
      ],
    },
    {
      name: 'Nottingham — Semi-Sheer',
      swatches: [
        { image: 'page064_img01_736x1206.jpeg', colorName: 'ASHBY QUILT', specs: ['Semi-Sheer', 'NOT-350'] },
        { image: 'page064_img02_736x1206.jpeg', colorName: 'FOREST', specs: ['Semi-Sheer', 'NOT-801'] },
      ],
    },
    {
      name: 'Palisade — Semi-Sheer',
      swatches: [
        { image: 'page065_img01_736x1206.jpeg', colorName: 'HOWLITE', specs: ['Semi-Sheer', 'PAL-105'] },
        { image: 'page065_img02_736x1206.jpeg', colorName: 'WHITE WASHED', specs: ['Semi-Sheer', 'PAL-100'] },
      ],
    },
    {
      name: 'Solta — Semi-Sheer',
      swatches: [
        { image: 'page066_img01_736x1206.jpeg', colorName: 'WHITE WICKER', specs: ['Semi-Sheer', 'SOL-101'] },
        { image: 'page066_img02_736x1206.jpeg', colorName: 'STERLING', specs: ['Semi-Sheer', 'SOL-901'] },
      ],
    },
    {
      name: 'Thailand — Semi-Sheer',
      swatches: [
        { image: 'page067_img01_736x1206.jpeg', colorName: 'RICE PADDY', specs: ['Semi-Sheer', 'THA-100'] },
        { image: 'page067_img02_736x1206.jpeg', colorName: 'BANYAN', specs: ['Semi-Sheer', 'THA-401'] },
      ],
    },
    {
      name: 'West Palm — Semi-Sheer',
      swatches: [
        { image: 'page068_img01_736x1206.jpeg', colorName: 'BOARDWALK', specs: ['Semi-Sheer', 'WP-406'] },
        { image: 'page068_img02_736x1206.jpeg', colorName: 'HARBOR', specs: ['Semi-Sheer', 'WP-801'] },
      ],
    },
    {
      name: 'Aruba — Semi-Opaque',
      swatches: [
        { image: 'page069_img01_736x1206.jpeg', colorName: 'WHITE SAILS', specs: ['Semi-Opaque', 'ARB-101'] },
        { image: 'page069_img02_736x1206.jpeg', colorName: 'CACTI', specs: ['Semi-Opaque', 'ARB-401'] },
      ],
    },
    {
      name: 'Auckland — Semi-Opaque',
      swatches: [
        { image: 'page070_img01_736x1206.jpeg', colorName: 'HARBOR MIST', specs: ['Semi-Opaque', 'AK-790'] },
        { image: 'page070_img02_736x1206.jpeg', colorName: 'KIWI', specs: ['Semi-Opaque', 'AK-401'] },
      ],
    },
    {
      name: 'Calliope — Semi-Opaque',
      swatches: [
        { image: 'page071_img01_736x1206.jpeg', colorName: 'SANTORINI', specs: ['Semi-Opaque', 'CLP-103'] },
        { image: 'page071_img02_736x1206.jpeg', colorName: 'MILOS', specs: ['Semi-Opaque', 'CLP-803'] },
      ],
    },
    {
      name: 'Chile — Semi-Opaque',
      swatches: [
        { image: 'page072_img01_736x1206.jpeg', colorName: 'FLAX', specs: ['Semi-Opaque', 'CHLE-401'] },
        { image: 'page072_img02_736x1206.jpeg', colorName: 'TEAK', specs: ['Semi-Opaque', 'CHLE-201'] },
      ],
    },
    {
      name: 'Fairy Glen — Semi-Opaque',
      swatches: [
        { image: 'page073_img01_736x1206.jpeg', colorName: 'PURE WHITE', specs: ['Semi-Opaque', 'FRGL-101'] },
        { image: 'page073_img02_736x1206.jpeg', colorName: 'CHARCOAL', specs: ['Semi-Opaque', 'FRGL-901'] },
      ],
    },
    {
      name: 'Kiawah — Semi-Opaque',
      swatches: [
        { image: 'page074_img01_736x1206.jpeg', colorName: 'WHITE CAPS', specs: ['Semi-Opaque', 'KIA-110'] },
        { image: 'page074_img02_736x1206.jpeg', colorName: 'WHITE SANDS', specs: ['Semi-Opaque', 'KIA-174'] },
        { image: 'page075_img01_736x1206.jpeg', colorName: 'DUNE GRASS', specs: ['Semi-Opaque', 'KIA-801'] },
        { image: 'page075_img02_736x1206.jpeg', colorName: 'BLACK SANDS', specs: ['Semi-Opaque', 'KIA-901'] },
      ],
    },
    {
      name: 'Millhouse — Semi-Opaque',
      swatches: [
        { image: 'page076_img01_736x1206.jpeg', colorName: 'FRESH POWDER', specs: ['Semi-Opaque', 'MIL-101'] },
        { image: 'page076_img02_736x1206.jpeg', colorName: 'BURLAP SACK', specs: ['Semi-Opaque', 'MIL-300'] },
      ],
    },
    {
      name: 'Montauk — Semi-Opaque',
      swatches: [
        { image: 'page077_img01_736x1206.jpeg', colorName: 'RAW COTTON', specs: ['Semi-Opaque', 'MNTK-300'] },
        { image: 'page077_img02_736x1206.jpeg', colorName: 'JITNEY', specs: ['Semi-Opaque', 'MNTK-400'] },
        { image: 'page078_img01_736x1206.jpeg', colorName: 'CHARRED WOOD', specs: ['Semi-Opaque', 'MNTK-900'] },
      ],
    },
    {
      name: 'Panama — Semi-Opaque',
      swatches: [
        { image: 'page079_img01_736x1206.jpeg', colorName: 'CASSAVA', specs: ['Semi-Opaque', 'PNM-201'] },
        { image: 'page079_img02_736x1206.jpeg', colorName: 'CATALINA', specs: ['Semi-Opaque', 'PNM-301'] },
        { image: 'page080_img01_736x1206.jpeg', colorName: 'SANTIAGO', specs: ['Semi-Opaque', 'PNM-401'] },
      ],
    },
    {
      name: 'Santa Barbara — Semi-Opaque',
      swatches: [
        { image: 'page081_img01_736x1206.jpeg', colorName: 'RIVIERA', specs: ['Semi-Opaque', 'SNTB-101'] },
        { image: 'page081_img02_736x1206.jpeg', colorName: 'SUMMER', specs: ['Semi-Opaque', 'SNTB-201'] },
        { image: 'page082_img01_736x1206.jpeg', colorName: 'STUCCO', specs: ['Semi-Opaque', 'SNTB-401'] },
      ],
    },
    {
      name: 'Santa Rosa — Semi-Opaque',
      swatches: [
        { image: 'page083_img01_736x1206.jpeg', colorName: 'SUNRISE', specs: ['Semi-Opaque', 'SAN-250'] },
        { image: 'page083_img02_736x1206.jpeg', colorName: 'SUNSET', specs: ['Semi-Opaque', 'SAN-854'] },
        { image: 'page084_img01_736x1206.jpeg', colorName: 'CLOUDY', specs: ['Semi-Opaque', 'SAN-201'] },
      ],
    },
    {
      name: 'Sierra — Semi-Opaque',
      swatches: [
        { image: 'page086_img01_736x1206.jpeg', colorName: 'SNOWCAP', specs: ['Semi-Opaque', 'SIE-100'] },
      ],
    },
    {
      name: 'Tamarindo — Semi-Opaque',
      swatches: [
        { image: 'page087_img01_736x1206.jpeg', colorName: 'PLAYA GRANDE', specs: ['Semi-Opaque', 'TM-210'] },
      ],
    },
    {
      name: 'Veranda — Semi-Opaque',
      swatches: [
        { image: 'page088_img01_736x1206.jpeg', colorName: 'WICKER ROCKER', specs: ['Semi-Opaque', 'VER-465'] },
      ],
    },
    {
      name: 'Kathay — Opaque',
      swatches: [
        { image: 'page089_img01_736x1206.jpeg', colorName: 'BEIJING PECAN', specs: ['Opaque', 'KAT-448'] },
      ],
    },
    {
      name: 'Cabo–Fine Weave — Semi-Sheer',
      swatches: [
        { image: 'page090_img01_1472x2409.jpeg', colorName: 'DUSK', specs: ['Semi-Sheer', 'CBO-901'] },
        { image: 'page090_img02_1472x2409.jpeg', colorName: 'EL ARCO', specs: ['Semi-Sheer', 'CBO-301'] },
        { image: 'page091_img01_1472x2409.jpeg', colorName: 'GARDENIAS', specs: ['Semi-Sheer', 'CBO-201'] },
      ],
    },
    {
      name: 'Arosa–Fine Weave — Semi-Opaque',
      swatches: [
        { image: 'page092_img01_1472x2409.jpeg', colorName: 'SNOW', specs: ['Semi-Opaque', 'ARS-101'] },
        { image: 'page092_img02_1472x2409.jpeg', colorName: 'GLACIER', specs: ['Semi-Opaque', 'ARS-801'] },
      ],
    },
    {
      name: 'Mallorca–Fine Weave — Semi-Opaque',
      swatches: [
        { image: 'page093_img01_1472x2409.jpeg', colorName: 'CALLA LILY', specs: ['Semi-Opaque', 'MLRC-201'] },
        { image: 'page093_img02_1472x2409.jpeg', colorName: 'OLIVE TREE', specs: ['Semi-Opaque', 'MLRC-301'] },
        { image: 'page094_img01_1472x2409.jpeg', colorName: 'PALMA', specs: ['Semi-Opaque', 'MLRC-302'] },
      ],
    },
    {
      name: 'Positano–Fine Weave — Semi-Opaque',
      swatches: [
        { image: 'page095_img01_1472x2409.jpeg', colorName: 'PEBBLED BEACH', specs: ['Semi-Opaque', 'POS-801'] },
        { image: 'page095_img02_1472x2409.jpeg', colorName: 'WHITE GROTTO', specs: ['Semi-Opaque', 'POS-101'] },
        { image: 'page096_img01_1472x2409.jpeg', colorName: 'POMPEII', specs: ['Semi-Opaque', 'POS-401'] },
      ],
    },
  ],
}
