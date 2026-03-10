import type { SectionLayout, SwatchCollection } from './applause-layout'

type SourceProduct = {
  slug: string
  name: string
  description: string
  hardware_colors?: Array<{ page: number; images: Array<{ filename: string; width: number; height: number }> }>
  fabric_swatches?: Record<string, Array<{ image: string; color_name: string; specs: string[] }>>
}

export interface DuetteFieldMapItem {
  fieldId: string
  sectionNo: number
  sectionTitle: string
  sourceField: string
  page: number
  sectionType: string
  imageIds: string[]
}

export interface DuetteImageMapItem {
  imageId: string
  fieldId: string
  sectionNo: number
  sectionTitle: string
  sourceField: string
  page: number
  imageIndex: number
  filename: string
  width: number
  height: number
}

export interface DuetteLayout {
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
  fieldMap: DuetteFieldMapItem[]
  imageMap: DuetteImageMapItem[]
}

function parsePage(filename: string): number {
  const m = filename.match(/^page(\d+)_/)
  return m ? Number(m[1]) : 0
}

function parseSize(filename: string): { width: number; height: number } {
  const m = filename.match(/_(\d+)x(\d+)\.(?:jpe?g|png)$/i)
  return m ? { width: Number(m[1]), height: Number(m[2]) } : { width: 0, height: 0 }
}

function normalizeDuetteImage(filename: string): string | null {
  const replaced = filename.replace(/\.png$/i, '.jpeg')
  if (/^page039_img1[1-4]_306x306\.jpeg$/i.test(replaced)) return null
  return replaced
}

function extractHardwareColorLabels(sections: Array<{ text?: string }>): string[] {
  const labels: string[] = []
  const seen = new Set<string>()
  const lines = sections
    .flatMap((s) => String(s.text || '').split('\n'))
    .map((l) => l.trim())
    .filter(Boolean)

  const skipLine = (line: string) =>
    /Hardware Color Guide|Hardware Color Coordination|The actual colors|All trademarks|LightLock|TrackGlide|ClearView|Horizontal Hardware|Vertical Hardware|Offered for both/i.test(
      line,
    )

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (skipLine(line)) continue
    const m = line.match(/^(\d{3})\s+(.+)$/)
    if (!m) continue

    let name = m[2]
    const next = lines[i + 1]
    if (next && !/^\d{3}\s+/.test(next) && !skipLine(next) && next.length <= 24) {
      name = `${name} ${next}`.trim()
      i++
    }

    const label = `${m[1]} ${name}`.replace(/\s+/g, ' ').trim()
    if (!seen.has(label)) {
      seen.add(label)
      labels.push(label)
    }
  }

  return labels
}

const scenePairImages = [
  'page007_img01_2996x1505.jpeg',
  'page008_img01_3044x1505.jpeg',
  'page009_img01_3043x1505.jpeg',
  'page012_img01_3042x1505.jpeg',
  'page013_img01_2996x1505.jpeg',
]

const scenePairContent = [
  {
    image: 'page007_img01_2996x1505.jpeg',
    text: 'Duette® Architella® Honeycomb Shades are the industry\'s most energy-efficient window treatments. Crafted with insulating layers, these shades provide the perfect level of comfort throughout every season.',
    label: 'Fabric Architella® Thea™    Color Clover',
  },
  {
    image: 'page008_img01_3044x1505.jpeg',
    text: 'Duette® Duolite® with ClearView® Sheer combines superior view-through while filtering sunlight and protecting interiors from harsh UV rays.',
    label:
      'Sheer Fabric ClearView® Sheer    Color Black Magic\nFabric Architella® Alexa™    Color Modern Gray\nOperating System PowerView® Automation\nDesign Option Duolite® with ClearView Sheer',
  },
  {
    image: 'page009_img01_3043x1505.jpeg',
    text: 'Achieve unparalleled darkness with the Duette® LightLock® system, the only one of its kind to deliver true darkening effects.',
    label:
      'Fabric Architella® Alexa™    Color Modern Gray\nOperating System PowerView® Automation, LightLock®\nDesign Option Top-Down/Bottom-Up (Not available in Canada)',
  },
  {
    image: 'page012_img01_3042x1505.jpeg',
    text: 'Layer your Duette® shades with coordinating Design Studio™ drapery, available in an array of on-trend colors, patterns and exclusive designs.',
    label:
      'Fabric Architella® Batiste Bamboo    Color White Truffle\nDesign Studio™ Drapery Fabric Elys    Color Meditative\nOperating System UltraGlide®',
  },
  {
    image: 'page013_img01_2996x1505.jpeg',
    text: 'As part of The Whole House Solution™, Duette® shades can accommodate a variety of window shapes and sizes.',
    label:
      'Fabric Architella® Elan®    Color Cider\nOperating System PowerView® Automation,\nTrackGlide™, Vertiglide™ Left Stack',
  },
]

const section1Benefits = [
  {
    image: 'page015_img01_765x436.jpeg',
    title: 'Superior Energy Efficiency',
    desc: 'Designed with three insulating pockets, Duette® Architella® shades help save more energy at the window, no matter the outdoor climate.',
  },
  {
    image: 'page015_img02_772x449.jpeg',
    title: 'Extensive Offering',
    desc: 'Most pleat sizes and opacities are available in every fabric. Choose from a broad selection of beautiful colors, as well as operating systems and design options, to discover your perfect Duette shade.',
  },
  {
    image: 'page015_img05_764x427.jpeg',
    title: 'Coordinating Headrail Finishes',
    desc: 'Textured matte headrails are color coordinated to the fabric for a cohesive design.',
  },
  {
    image: 'page015_img06_764x427.jpeg',
    title: 'Sustainable Fabrics',
    desc: 'Duette Architella Alexa™ and Thea™ outer cell fabrics are innovatively crafted with 90% recycled materials.',
  },
  {
    image: 'page015_img04_762x436.jpeg',
    title: 'Noise Reduction',
    desc: 'Duette® shades absorb sound energy, helping to create a more tranquil room.',
  },
  {
    image: 'page015_img03_761x437.jpeg',
    title: 'Larger Sizes with Small Stack',
    desc: 'Duette shades are engineered to provide a low profile when fully raised on taller windows, allowing for unobstructed views.',
  },
  {
    image: 'page015_img07_764x427.jpeg',
    title: 'Easy Care and Cleaning',
    desc: 'To ensure lasting beauty, all Duette shades are anti-static, dust and soil resistant and easy to clean.',
  },
  {
    image: 'page015_img08_764x427.jpeg',
    title: 'Outstanding UV Protection',
    desc: 'Protect your furniture, flooring and artwork from harmful UV rays with Duette shades.',
  },
]

const section2Energy = [
  { image: 'page016_img02_764x434.jpeg', title: 'Cost Savings', desc: '' },
  { image: 'page016_img03_764x436.jpeg', title: 'Superior Insulation', desc: '' },
  { image: 'page016_img06_765x436.jpeg', title: 'Sustainability', desc: '' },
  { image: 'page016_img07_764x436.jpeg', title: 'Automation Throughout the Year', desc: '' },
]

const section3LightControl = [
  { image: 'page017_img02_764x455.jpeg', label: 'ClearView® Sheer', sublabel: '' },
  { image: 'page017_img03_765x455.jpeg', label: 'Semi-Sheer', sublabel: '' },
  { image: 'page017_img04_765x455.jpeg', label: 'Light Filtering', sublabel: '' },
  { image: 'page017_img05_765x455.jpeg', label: 'Room Darkening', sublabel: '' },
]

const section4Duolite = [
  { image: 'page018_img01_763x934.jpeg', label: 'Duolite® with ClearView® Sheer', sublabel: '' },
  { image: 'page018_img02_763x934.jpeg', label: 'Duolite with Whisper Sheer™', sublabel: '' },
  { image: 'page018_img03_762x932.jpeg', label: 'Duolite® with Semi-Sheer', sublabel: '' },
  { image: 'page018_img04_762x932.jpeg', label: 'Duolite with Light Filtering', sublabel: '' },
]

const section5PowerViewAndOperating = [
  {
    image: 'page019_img01_1092x1505.jpeg',
    label: 'PowerView® Automation',
    sublabel: 'Achieve your perfect light automatically—morning, noon and night.',
  },
  {
    image: 'page019_img03_319x901.jpeg',
    label: 'LiteRise®',
    sublabel: 'This cordless system lifts and lowers shades with the touch of a finger.',
  },
  {
    image: 'page019_img04_319x903.jpeg',
    label: 'UltraGlide®',
    sublabel: 'Gently pull a single retractable wand to lift and lower shades.',
  },
]

const section6AdditionalOperating = [
  {
    image: 'page021_img05_365x461.jpeg',
    label: 'PowerView® Operable Specialty Shapes',
    sublabel: 'Automate high and hard-to-reach arched and angled windows.',
  },
  {
    image: 'page021_img01_765x462.jpeg',
    label: 'SkyLift™*',
    sublabel: 'This system covers large skylights. Available with manual or motorized operation in top stack only.',
  },
  {
    image: 'page021_img07_765x461.jpeg',
    label: 'Simplicity™**',
    sublabel: 'This manual system is designed for skylights and other hard-to-reach windows. Can be oriented for top, bottom or side stack.',
  },
  {
    image: 'page021_img02_480x1081.jpeg',
    label: 'Vertiglide™',
    sublabel: 'For vertical applications such as patio doors, this system provides side-to-side operation. Offered in four stacking configurations.',
  },
  {
    image: 'page021_img03_480x461.jpeg',
    label: 'Vertiglide Duolite®',
    sublabel: 'A center-opening design combines two opacities in one. Each fabric can span the full width of the opening.',
  },
  {
    image: 'page021_img04_480x461.jpeg',
    label: 'Vertiglide Traveling Center Stack',
    sublabel: 'Shades open from the sides and stack in the center.',
  },
  {
    image: 'page021_img08_480x461.jpeg',
    label: 'Vertiglide Split Stack',
    sublabel: 'Shades operate individually.',
  },
  {
    image: 'page021_img09_480x461.jpeg',
    label: 'Vertiglide Left Stack or Right Stack',
    sublabel: 'Left stack opens from right to left. Right stack opens from left to right.',
  },
  {
    image: 'page021_img06_365x461.jpeg',
    label: 'Simplicity™ (Specialty Shapes)',
    sublabel: 'Automate high and hard-to-reach arched and angled windows.',
  },
]

const section7DesignOptions = [
  { image: 'page022_img01_1099x627.jpeg', title: 'Pleat Size and Construction', desc: '' },
  { image: 'page022_img02_762x436.jpeg', title: 'LightLock® and LightLock Flex', desc: '' },
  { image: 'page022_img03_762x436.jpeg', title: 'Doors and Sidelights', desc: '' },
  { image: 'page022_img04_765x437.jpeg', title: 'Streetside Fabric', desc: '' },
  { image: 'page022_img05_764x436.jpeg', title: 'TrackGlide™ with LiteRise®', desc: '' },
  { image: 'page022_img06_764x437.jpeg', title: 'Two-On-One Headrail', desc: '' },
  { image: 'page022_img07_765x437.jpeg', title: 'Specialty Shapes', desc: '' },
  { image: 'page022_img08_764x436.jpeg', title: 'Top-Down/Bottom-Up', desc: '' },
]

const section8Mounting = [
  { image: 'page023_img01_479x511.jpeg', label: 'Inside Mount 3/4"', sublabel: '' },
  { image: 'page023_img02_479x511.jpeg', label: 'Outside Mount 3/4"', sublabel: '' },
  { image: 'page023_img03_479x511.jpeg', label: 'Partial Mount 3/4"', sublabel: '' },
  { image: 'page023_img04_480x512.jpeg', label: 'Vertiglide® Inside Mount 3/4" and 1 1/4"', sublabel: '' },
  { image: 'page023_img05_480x512.jpeg', label: 'Vertiglide® Outside Mount 3/4" and 1 1/4"', sublabel: '' },
  { image: 'page023_img06_479x511.jpeg', label: 'Inside Mount 1 1/4"', sublabel: '' },
  { image: 'page023_img07_479x511.jpeg', label: 'Outside Mount 1 1/4"', sublabel: '' },
  { image: 'page023_img08_479x511.jpeg', label: 'Partial Mount 1 1/4"', sublabel: '' },
  { image: 'page023_img09_1048x221.jpeg', label: 'Vertiglide Grandover™ Valance', sublabel: '' },
  { image: 'page023_img10_1050x221.jpeg', label: 'Vertiglide Sydney Valance Standard Option', sublabel: '' },
]

const galleryImages = [
  'page007_img01_2996x1505.jpeg',
  'page008_img01_3044x1505.jpeg',
  'page009_img01_3043x1505.jpeg',
  'page010_img01_2617x1505.jpeg',
  'page010_img02_764x1013.jpeg',
  'page012_img01_3042x1505.jpeg',
  'page013_img01_2996x1505.jpeg',
  'page014_img01_3043x1505.jpeg',
  'page016_img01_1955x1505.jpeg',
  'page017_img01_1954x1505.jpeg',
  'page019_img01_1092x1505.jpeg',
]

function buildMaps(layout: DuetteLayout): { fieldMap: DuetteFieldMapItem[]; imageMap: DuetteImageMapItem[] } {
  const fieldMap: DuetteFieldMapItem[] = []
  const imageMap: DuetteImageMapItem[] = []
  let fieldNo = 1
  let imageNo = 1

  const addField = (sectionNo: number, sectionTitle: string, sourceField: string, sectionType: string, files: string[]) => {
    const fieldId = `F${String(fieldNo++).padStart(3, '0')}`
    const page = files.length > 0 ? parsePage(files[0]) : 0
    const imageIds: string[] = []

    files.forEach((filename, idx) => {
      const imageId = `I${String(imageNo++).padStart(4, '0')}`
      const { width, height } = parseSize(filename)
      imageIds.push(imageId)
      imageMap.push({
        imageId,
        fieldId,
        sectionNo,
        sectionTitle,
        sourceField,
        page: parsePage(filename),
        imageIndex: idx + 1,
        filename,
        width,
        height,
      })
    })

    fieldMap.push({
      fieldId,
      sectionNo,
      sectionTitle,
      sourceField,
      page,
      sectionType,
      imageIds,
    })
  }

  addField(0, 'Hero', 'heroImage', 'hero', [layout.heroImage])
  addField(0, 'Scene Pairs', 'scenePair', 'scene-pair', scenePairImages)
  addField(1, 'Benefits', 'sections[0]', 'card-grid', section1Benefits.map((x) => x.image))
  addField(2, 'Energy Efficiency', 'sections[1]', 'card-grid', section2Energy.map((x) => x.image))
  addField(3, 'Light Control', 'sections[2]', 'comparison-grid', section3LightControl.map((x) => x.image))
  addField(4, 'Duolite', 'sections[3]', 'comparison-grid', section4Duolite.map((x) => x.image))
  addField(5, 'PowerView and Operating Systems', 'sections[4]', 'comparison-grid', section5PowerViewAndOperating.map((x) => x.image))
  addField(6, 'Additional Operating Options', 'sections[5]', 'comparison-grid', section6AdditionalOperating.map((x) => x.image))
  addField(7, 'Design Options', 'sections[6]', 'card-grid', section7DesignOptions.map((x) => x.image))
  addField(8, 'Mounting Profiles', 'sections[7]', 'mounting-grid', section8Mounting.map((x) => x.image))
  addField(10, 'Gallery', 'gallery', 'gallery', galleryImages)

  if (layout.hardwareColors && 'items' in layout.hardwareColors) {
    addField(11, 'Hardware Colors', 'hardwareColors', 'hardware-colors', layout.hardwareColors.items.map((x) => x.image))
  }

  layout.swatchCollections.forEach((col, idx) => {
    addField(100 + idx + 1, col.name, `swatchCollections[${idx}]`, 'swatch-collection', col.swatches.map((s) => s.image))
  })

  return { fieldMap, imageMap }
}

export function buildDuetteLayout(product: SourceProduct): DuetteLayout {
  const hardwareImages = (product.hardware_colors || [])
    .flatMap((s) => s.images || [])
    .map((img) => ({ ...img, filename: normalizeDuetteImage(img.filename) }))
    .filter((img): img is { filename: string; width: number; height: number } => Boolean(img.filename))
  const hardwareLabels = extractHardwareColorLabels(product.hardware_colors || [])
  const hardwareColors: SectionLayout | null = hardwareImages.length
    ? {
        type: 'hardware-colors',
        title: 'Hardware Color Guide',
        brandLabel: 'Duette®',
        items: hardwareImages.map((img, i) => ({
          image: img.filename,
          label: hardwareLabels[i] || `Color ${String(i + 1).padStart(2, '0')}`,
        })),
      }
    : null

  const swatchCollections: SwatchCollection[] = Object.entries(product.fabric_swatches || {}).map(([name, swatches]) => ({
    name,
    swatches: swatches
      .map((sw) => ({ ...sw, image: normalizeDuetteImage(sw.image) }))
      .filter((sw): sw is { image: string; color_name: string; specs: string[] } => Boolean(sw.image))
      .map((sw) => ({ image: sw.image, colorName: sw.color_name, specs: sw.specs || [] })),
  }))

  const layout: DuetteLayout = {
    slug: 'duette',
    name: product.name || 'Duette® Honeycomb Shades',
    description:
      product.description ||
      'Duette® Honeycomb Shades set the standard for energy-efficient window fashions with their patented honeycomb construction that traps air to insulate your home.',
    heroImage: 'page006_img01_2930x1505.jpeg',
    heroLabel: '',
    sections: [
      {
        type: 'scene-pair',
        scenes: scenePairContent,
      },
      {
        type: 'card-grid',
        title: 'Benefits',
        cols: 2,
        cards: section1Benefits,
      },
      {
        type: 'card-grid',
        title: 'Energy Efficiency',
        cols: 4,
        cards: section2Energy,
      },
      {
        type: 'comparison-grid',
        title: 'Light Control',
        cols: 2,
        items: section3LightControl,
      },
      {
        type: 'comparison-grid',
        title: 'Duolite®',
        cols: 2,
        items: section4Duolite,
      },
      {
        type: 'comparison-grid',
        title: 'PowerView and Operating Systems',
        cols: 3,
        items: section5PowerViewAndOperating,
      },
      {
        type: 'comparison-grid',
        title: 'Additional Operating Options',
        cols: 3,
        items: section6AdditionalOperating,
      },
      {
        type: 'card-grid',
        title: 'Design Options',
        cols: 4,
        cards: section7DesignOptions,
      },
      {
        type: 'mounting-grid',
        title: 'Mounting Profiles',
        rows: [
          { items: section8Mounting.slice(0, 5).map((x) => ({ image: x.image, label: x.label })) },
          { items: section8Mounting.slice(5, 10).map((x) => ({ image: x.image, label: x.label })) },
        ],
      },
    ],
    gallery: galleryImages.map((image) => ({ image, text: '\', label: \'' })),
    cellSize: null,
    hardwareColors,
    swatchCollections,
    fieldMap: [],
    imageMap: [],
  }

  const maps = buildMaps(layout)
  layout.fieldMap = maps.fieldMap
  layout.imageMap = maps.imageMap

  return layout
}
