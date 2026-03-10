/**
 * Vertical Blinds Collection - Product Layout Data
 * Rebuilt with proper sections for pages 26-29 and swatches by series
 */

import type { ProductLayout, SectionLayout, SwatchCollection } from './types'

export const verticalBlindsLayout: ProductLayout = {
  slug: 'verticals',
  name: 'Vertical Blinds Collection',
  description: 'Hunter Douglas features the most diverse Vertical Blinds product offering, providing functionality and style with bold fabrics that make a fashion statement.',

  heroImage: 'page011_img01_2688x1505.jpeg',
  heroLabel: 'Vertical Blinds Collection',

  sections: [
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page008_img01_2684x1505.jpeg',
          text: 'Bold fabrics make a fashion statement in the Somner® Collection.',
          label: 'Product Somner®    Fabric Urban Loft    Color Blue Denim',
        },
        {
          image: 'page010_img01_2684x1505.jpeg',
          text: 'The modern vinyl styles in the Somner® Collection allow for limitless possibilities.',
          label: '',
        },
        {
          image: 'page011_img01_2688x1505.jpeg',
          text: 'Cadence® Motif™',
          label: 'Product Cadence® Motif™    Fabric Regal    Color Lily\\nOperating System Cord & Wand',
        },
        {
          image: 'page013_img01_2681x1505.jpeg',
          text: 'Stylish Somner® Perforated Aluminum accents the light by offering a screen-like view-through.',
          label: '',
        },
        {
          image: 'page016_img01_2684x1505.jpeg',
          text: 'The neutral palette and simplified textures of Vertical Solutions® create a contemporary look.',
          label: '',
        },
      ],
    },
    {
      type: 'comparison-grid',
      title: 'Benefits',
      cols: 3,
      items: [
        { image: 'page019_img01_692x1139.jpeg', label: 'Modern Aesthetic', sublabel: 'The clean lines of Vertical Blinds provide a modern aesthetic covering expansive windows using a single headrail.' },
        { image: 'page019_img02_699x483.jpeg', label: 'Three Product Collections', sublabel: 'Hunter Douglas Vertical Blinds feature three distinct collections: Cadence®, Somner®, and Vertical Solutions®.' },
        { image: 'page019_img03_700x483.jpeg', label: 'Superior Functionality', sublabel: 'Three proprietary operating systems provide smooth functionality guaranteed to last a lifetime.' },
        { image: 'page019_img05_700x483.jpeg', label: 'Control the Light', sublabel: 'Vertical Blinds provide minimal stack when open, with vane tilt options to customize the light in any room while maximizing the view.' },
        { image: 'page019_img06_697x483.jpeg', label: 'Contemporary Style', sublabel: 'Fashion-forward styles featuring on-trend hues, rich textures, and patterns.' },
      ],
    },
    {
      type: 'card-grid',
      title: 'Direct the Light with Cadence®',
      cols: 4,
      cards: [
        { image: 'page021_img01_699x438.jpeg', title: 'Left Stack', desc: 'Left or right control options available.' },
        { image: 'page021_img02_699x438.jpeg', title: 'Right Stack', desc: 'Left or right control options available.' },
        { image: 'page021_img03_473x437.jpeg', title: 'Left Facing: Closed', desc: '' },
        { image: 'page021_img04_473x437.jpeg', title: 'Left Facing: Partially Open', desc: 'The louvers tilt open from left to right allowing light to filter into the room.' },
        { image: 'page021_img05_473x437.jpeg', title: 'Left Facing: Open', desc: '' },
        { image: 'page021_img06_699x438.jpeg', title: 'Split Stack', desc: 'Left or right control options available.' },
        { image: 'page021_img07_699x437.jpeg', title: 'Center Stack', desc: 'Left or right control options available.' },
        { image: 'page021_img08_473x437.jpeg', title: 'Right Facing: Closed', desc: '' },
        { image: 'page021_img09_473x437.jpeg', title: 'Right Facing: Partially Open', desc: 'The louvers tilt open from right to left allowing light to filter into the room.' },
        { image: 'page021_img10_473x437.jpeg', title: 'Right Facing: Open', desc: '' },
      ],
    },
    {
      type: 'comparison-grid',
      title: 'Cadence® Soft Vertical Blinds',
      cols: 3,
      items: [
        { image: 'page023_img01_966x1505.jpeg', label: 'Cadence® Motif™', sublabel: 'The soft texture of the fabric louver creates a drapery look and feel. Louvers are the same color interior and street side.' },
        { image: 'page023_img02_656x437.jpeg', label: 'Cadence® Motif™', sublabel: 'The soft texture of the fabric louver creates a drapery look and feel.' },
        { image: 'page023_img03_656x438.jpeg', label: 'Cadence® Impressions™', sublabel: 'Richly textured vinyl evokes the feeling of draped fabric. Louvers feature either a coordinating or neutral street side color.' },
        { image: 'page023_img04_656x437.jpeg', label: 'Patented Curved Profile', sublabel: 'The unique curved louver of Cadence adds dimension at the window providing the look of drapery.' },
        { image: 'page023_img05_656x437.jpeg', label: 'Cadence® Valance', sublabel: 'The modern profile adds a tailored look to the blind.' },
      ],
    },
    {
      type: 'comparison-grid',
      title: 'Somner® Custom Vertical Blinds',
      cols: 3,
      items: [
        { image: 'page024_img02_655x438.jpeg', label: 'Fabric', sublabel: 'Fashion fabrics in rich textures and on-trend colors.' },
        { image: 'page024_img03_656x437.jpeg', label: 'Vinyl', sublabel: 'Distinctive patterns and colors from subtle to bold designed to make a statement.' },
        { image: 'page024_img05_653x437.jpeg', label: 'Aluminum', sublabel: 'Designed to coordinate with the decorative metals and appliances in your home. The unique perforated options add subtle view-through.' },
        { image: 'page024_img06_321x437.jpeg', label: 'Dust Cover Valances', sublabel: 'Valances add light control and are available as inside or outside mount. Compatible with fabric, vinyl, and aluminum inserts.' },
      ],
    },
    {
      type: 'comparison-grid',
      title: 'Vertical Solutions®',
      cols: 3,
      items: [
        { image: 'page025_img01_992x1505.jpeg', label: 'Vertical Solutions®', sublabel: 'This fundamental collection provides both vinyl and fabric options.' },
        { image: 'page025_img02_656x438.jpeg', label: 'Fabric', sublabel: 'Classic fabrics feature soft textures and neutral colors.' },
        { image: 'page025_img03_653x437.jpeg', label: 'Vinyl', sublabel: 'Vinyl styles provide a classic look and years of durability.' },
        { image: 'page025_img04_656x437.jpeg', label: 'Dust Cover Valances', sublabel: 'Dust Cover Valances add light control and are compatible with both fabric and vinyl inserts. Inside and outside mount available.' },
      ],
    },
    {
      type: 'split-scene',
      title: 'Specialty Blinds for Somner® & Vertical Solutions®',
      sceneImage: 'page026_img01_1470x1507.jpeg',
      sceneSide: 'left',
      items: [
        { image: 'page026_img02_645x417.jpeg', label: 'Curved or Straight Track', sublabel: 'Available Operating Systems include Cord & Chain or Tilt and Traverse Motorization with SmartCARD® control.' },
        { image: 'page026_img03_630x408.jpeg', label: 'Slope', sublabel: 'Available with Cord & Chain Operating System.' },
        { image: 'page026_img04_640x368.jpeg', label: 'Skylight \u2013 Top & Bottom Track', sublabel: 'Available with vinyl styles only. Available with Cord & Chain Operating System.' },
        { image: 'page026_img05_618x421.jpeg', label: 'Arch', sublabel: 'Available with Cord & Chain Operating System.' },
      ],
    },
    {
      type: 'comparison-grid',
      title: 'Operating Systems \u2013 Paramount\u00ae Contoured Headrail',
      subtitle: 'Cadence\u00ae & Somner\u00ae',
      cols: 6,
      items: [
        { image: 'page027_img01_307x961.jpeg', label: 'Cadence\u00ae\nCord & Wand', sublabel: 'The wand tilts the vanes while the cord traverses the blind.' },
        { image: 'page027_img02_307x963.jpeg', label: 'Cadence\u00ae\nPermAssure\u00ae Safety Wand', sublabel: 'The traveling wand tilts the vanes and traverses the blind.' },
        { image: 'page027_img03_307x961.jpeg', label: 'Cadence\u00ae\nCord & Chain', sublabel: 'The chain tilts the vanes while the cord traverses the blind.' },
        { image: 'page027_img04_309x962.jpeg', label: 'Somner\u00ae\nCord & Wand', sublabel: 'The wand tilts the vanes while the cord traverses the blind.' },
        { image: 'page027_img05_307x958.jpeg', label: 'Somner\u00ae\nPermAssure\u00ae Safety Wand', sublabel: 'The traveling wand tilts the vanes and traverses the blind.' },
        { image: 'page027_img06_307x963.jpeg', label: 'Somner\u00ae\nCord & Chain', sublabel: 'The chain tilts the vanes while the cord traverses the blind.' },
      ],
    },
    {
      type: 'comparison-grid',
      title: 'Operating Systems \u2013 PermaTrak\u00ae Headrail',
      subtitle: 'Vertical Solutions\u00ae & Enhanced Safety',
      cols: 5,
      items: [
        { image: 'page028_img01_309x963.jpeg', label: 'Vertical Solutions\u00ae\nCord & Wand', sublabel: 'The wand tilts the vanes while the cord traverses the blind.' },
        { image: 'page028_img02_307x962.jpeg', label: 'Vertical Solutions\u00ae\nPermAssure\u00ae Safety Wand', sublabel: 'The traveling wand tilts the vanes and traverses the blind.' },
        { image: 'page028_img03_307x962.jpeg', label: 'Vertical Solutions\u00ae\nCord & Chain', sublabel: 'The chain tilts the vanes while the cord traverses the blind.' },
        { image: 'page028_img04_429x962.jpeg', label: 'Enhanced Safety\nUniversal Cord Tensioner', sublabel: 'Cords are held in place for maximum functionality and enhanced safety. Custom colors available on Cadence\u00ae and Somner\u00ae only.' },
        { image: 'page028_img05_185x958.jpeg', label: 'Enhanced Safety\nThe Wand', sublabel: 'The wand enhances safety and provides ease of operation. Custom colors available on Cadence\u00ae and Somner\u00ae only.' },
      ],
    },
    {
      type: 'mounting-grid',
      title: 'Mounting Options',
      rows: [
        {
          label: 'Inside Mount',
          items: [
            { image: 'page029_img01_450x279.jpeg', label: 'Cadence® Valance\nInside Mount Valance\nNo returns available' },
            { image: 'page029_img02_450x279.jpeg', label: 'Cadence®\nParamount® Contoured Headrail\nInside Mount' },
            { image: 'page029_img03_450x279.jpeg', label: 'Somner®\nParamount Contoured Headrail\nInside Mount' },
            { image: 'page029_img04_450x279.jpeg', label: 'Vertical Solutions®\nPermaTrak® Headrail\nInside Mount\nNo returns available' },
            { image: 'page029_img05_450x279.jpeg', label: 'Somner & Vertical Solutions\nDust Cover Valances\nInside Mount\nNo returns available' },
          ],
        },
        {
          label: 'Partial / Outside Mount',
          items: [
            { image: 'page029_img06_450x279.jpeg', label: 'Outside Mount Valance\nShown with 2" returns' },
            { image: 'page029_img07_450x279.jpeg', label: 'Partial Mount' },
            { image: 'page029_img08_450x279.jpeg', label: 'Partial Mount' },
            { image: 'page029_img09_450x279.jpeg', label: 'Outside Mount\nClosed Corner with returns' },
            { image: 'page029_img10_450x279.jpeg', label: 'Outside Mount\nClosed Corner with returns' },
          ],
        },
        {
          label: 'Outside Mount',
          items: [
            { image: 'page029_img11_450x279.jpeg', label: 'Outside Mount Valance\nShown with 5" returns' },
            { image: 'page029_img12_450x279.jpeg', label: 'Outside Mount' },
            { image: 'page029_img13_450x279.jpeg', label: 'Outside Mount' },
            { image: 'page029_img14_450x279.jpeg', label: 'Outside Mount\nRounded Corner with returns' },
            { image: 'page029_img15_450x279.jpeg', label: 'Outside Mount\nRounded Corner with returns' },
          ],
        },
      ],
    },
  ],

  gallery: [
    { image: 'page002_img01_1935x1505.jpeg', text: '', label: '' },
    { image: 'page006_img01_2592x1505.jpeg', text: '', label: 'Product Somner®    Vinyl Bondi    Color Sandhills' },
    { image: 'page008_img01_2684x1505.jpeg', text: '', label: 'Product Somner®    Fabric Urban Loft    Color Blue Denim' },
    { image: 'page009_img01_3436x1504.jpeg', text: '', label: 'Product Cadence® Motif™    Fabric Bailey    Color Lattice' },
    { image: 'page010_img01_2684x1505.jpeg', text: '', label: '' },
    { image: 'page011_img01_2688x1505.jpeg', text: '', label: 'Product Cadence® Motif™    Fabric Regal    Color Lily' },
    { image: 'page012_img01_3436x1505.jpeg', text: '', label: 'Product Somner®    Vinyl Everly    Color Raven' },
    { image: 'page013_img01_2681x1505.jpeg', text: '', label: '' },
    { image: 'page014_img01_2695x1505.jpeg', text: '', label: 'Product Cadence® Impressions™    Vinyl Astor    Color Silver Dew' },
    { image: 'page015_img01_3437x1507.jpeg', text: '', label: 'Product Somner®    Vinyl Hampshire    Color Gray Garden' },
    { image: 'page016_img01_2684x1505.jpeg', text: '', label: '' },
  ],

  hardwareColors: null,

  swatchCollections: [
    {
      name: 'S-Curve II Vinyl — Opaque',
      swatches: [
        { image: 'page040_img01_1472x2405.jpeg', colorName: 'GREY', specs: ['Opaque', 'VSCRII-1643902'] },
        { image: 'page040_img02_1472x2405.jpeg', colorName: 'SNOW WHITE', specs: ['Opaque', 'VSCRII-7701930'] },
        { image: 'page041_img01_1472x2405.jpeg', colorName: 'WHITE', specs: ['Opaque', 'VSCRII-1643903'] },
        { image: 'page041_img02_1472x2405.jpeg', colorName: 'OFF WHITE', specs: ['Opaque', 'VSCRII-1643901'] },
        { image: 'page042_img01_1472x2405.jpeg', colorName: 'IVORY', specs: ['Opaque', 'VSCRII-1643900'] },
        { image: 'page042_img02_1472x2405.jpeg', colorName: 'TAN', specs: ['Opaque', 'VSCRII-1643904'] },
      ],
    },
    {
      name: 'Flat Vinyl — Opaque',
      swatches: [
        { image: 'page043_img01_1472x2405.jpeg', colorName: 'GREY', specs: ['Opaque', 'VSFL-1642901'] },
        { image: 'page043_img02_1472x2405.jpeg', colorName: 'WHITE', specs: ['Opaque', 'VSFL-1642902'] },
        { image: 'page044_img01_1472x2405.jpeg', colorName: 'OFF WHITE', specs: ['Opaque', 'VSFL-1642903'] },
        { image: 'page044_img02_1472x2405.jpeg', colorName: 'IVORY', specs: ['Opaque', 'VSFL-1642900'] },
      ],
    },
    {
      name: 'Carnegie — Opaque',
      swatches: [
        { image: 'page045_img01_1472x2405.jpeg', colorName: 'FEMATA', specs: ['Opaque', 'CARNEGIE-7712689'] },
        { image: 'page045_img02_1472x2405.jpeg', colorName: 'MEZZO', specs: ['Opaque', 'CARNEGIE-7712687'] },
        { image: 'page046_img01_1472x2405.jpeg', colorName: 'TEMPO', specs: ['Opaque', 'CARNEGIE-7716700'] },
      ],
    },
    {
      name: 'Mansfield — Opaque',
      swatches: [
        { image: 'page047_img01_1472x2405.jpeg', colorName: 'CHINA WHITE', specs: ['Opaque', 'MANS-7716810'] },
        { image: 'page047_img02_1472x2405.jpeg', colorName: 'BUFF NATURAL', specs: ['Opaque', 'MANS-7716812'] },
        { image: 'page048_img01_1472x2405.jpeg', colorName: 'STORM CLOUD', specs: ['Opaque', 'MANS-1026809'] },
      ],
    },
    {
      name: 'Piper — Opaque',
      swatches: [
        { image: 'page049_img01_1472x2405.jpeg', colorName: 'SANDY DUNES', specs: ['Opaque', 'PIPER-7716763'] },
        { image: 'page049_img02_1472x2405.jpeg', colorName: 'VINTAGE WHITE', specs: ['Opaque', 'PIPER-7716760'] },
        { image: 'page050_img01_1472x2405.jpeg', colorName: 'BEIGE LINEN', specs: ['Opaque', 'PIPER-7716761'] },
        { image: 'page050_img02_1472x2405.jpeg', colorName: 'WASHED GREY', specs: ['Opaque', 'PIPER-1026720'] },
      ],
    },
    {
      name: 'Ithaca — Opaque',
      swatches: [
        { image: 'page051_img01_1472x2405.jpeg', colorName: 'WICKER', specs: ['Opaque', 'ITH-7711727'] },
        { image: 'page051_img02_1472x2405.jpeg', colorName: 'PALMS', specs: ['Opaque', 'ITH-7711725'] },
        { image: 'page052_img01_1472x2405.jpeg', colorName: 'SMOKE', specs: ['Opaque', 'ITH-1026679'] },
      ],
    },
    {
      name: 'Darby — Opaque',
      swatches: [
        { image: 'page053_img01_1472x2405.jpeg', colorName: 'FERN', specs: ['Opaque', 'DARBY-7716716'] },
        { image: 'page053_img02_1472x2405.jpeg', colorName: 'SEA SALT', specs: ['Opaque', 'DARBY-7712712'] },
        { image: 'page054_img01_1472x2405.jpeg', colorName: 'NATURAL', specs: ['Opaque', 'DARBY-7712711'] },
        { image: 'page054_img02_1472x2405.jpeg', colorName: 'ALABASTER', specs: ['Opaque', 'DARBY-1026678'] },
      ],
    },
    {
      name: 'Thatcher — Opaque',
      swatches: [
        { image: 'page055_img01_1472x2405.jpeg', colorName: 'HONEY', specs: ['Opaque', 'THAT-7716831'] },
        { image: 'page055_img02_1472x2405.jpeg', colorName: 'MILK', specs: ['Opaque', 'THAT-7716830'] },
        { image: 'page056_img01_1472x2405.jpeg', colorName: 'TRUFFLE', specs: ['Opaque', 'THAT-7716834'] },
      ],
    },
    {
      name: 'Everly — Opaque',
      swatches: [
        { image: 'page057_img01_1472x2405.jpeg', colorName: 'PEARLY', specs: ['Opaque', 'EVERL-1026796'] },
        { image: 'page057_img02_1472x2405.jpeg', colorName: 'GLACIER', specs: ['Opaque', 'EVERL-1026793'] },
        { image: 'page058_img01_1472x2405.jpeg', colorName: 'JEWEL', specs: ['Opaque', 'EVERL-1026794'] },
        { image: 'page058_img02_1472x2405.jpeg', colorName: 'NEUTRAL', specs: ['Opaque', 'EVERL-1026795'] },
        { image: 'page059_img01_1472x2405.jpeg', colorName: 'RAVEN', specs: ['Opaque', 'EVERL-1026797'] },
      ],
    },
    {
      name: 'Brittany — Opaque',
      swatches: [
        { image: 'page060_img01_1472x2405.jpeg', colorName: 'UNION SQUARE', specs: ['Opaque', 'BRITT-7716355'] },
        { image: 'page060_img02_1472x2405.jpeg', colorName: 'MODERN WHITE', specs: ['Opaque', 'BRITT-7716350'] },
        { image: 'page061_img01_1472x2405.jpeg', colorName: 'STAINLESS STEEL', specs: ['Opaque', 'BRITT-7716351'] },
        { image: 'page061_img02_1472x2405.jpeg', colorName: 'RESTORATION', specs: ['Opaque', 'BRITT-7716353'] },
        { image: 'page062_img01_1472x2405.jpeg', colorName: 'TRENDY TAN', specs: ['Opaque', 'BRITT-1026790'] },
      ],
    },
    {
      name: 'Adorn — Opaque',
      swatches: [
        { image: 'page063_img01_1472x2405.jpeg', colorName: 'MYSTIC GRAY', specs: ['Opaque', 'ADORN-7716618'] },
        { image: 'page063_img02_1472x2405.jpeg', colorName: 'WHITE ICE', specs: ['Opaque', 'ADORN-7712610'] },
        { image: 'page064_img01_1472x2405.jpeg', colorName: 'LIGHT BLUE', specs: ['Opaque', 'ADORN-7712613'] },
        { image: 'page064_img02_1472x2405.jpeg', colorName: 'STEEL GREY', specs: ['Opaque', 'ADORN-1026776'] },
      ],
    },
    {
      name: 'Hampshire — Opaque',
      swatches: [
        { image: 'page065_img01_1472x2405.jpeg', colorName: 'GRAY GARDEN', specs: ['Opaque', 'HAM-7716727'] },
        { image: 'page065_img02_1472x2405.jpeg', colorName: 'FROST', specs: ['Opaque', 'HAM-7716725'] },
        { image: 'page066_img01_1472x2405.jpeg', colorName: 'SEA SALT', specs: ['Opaque', 'HAM-7716726'] },
      ],
    },
    {
      name: 'Timberline — Opaque',
      swatches: [
        { image: 'page067_img01_1472x2405.jpeg', colorName: 'MAGNOLIA', specs: ['Opaque', 'TIMB-1026811'] },
        { image: 'page067_img02_1472x2405.jpeg', colorName: 'BRADFORD', specs: ['Opaque', 'TIMB-1026810'] },
        { image: 'page068_img01_1472x2405.jpeg', colorName: 'WILLOW', specs: ['Opaque', 'TIMB-1026812'] },
      ],
    },
    {
      name: 'Beachcomber — Opaque',
      swatches: [
        { image: 'page069_img01_1472x2405.jpeg', colorName: 'IRONSTONE WHITE', specs: ['Opaque', 'BEACH-7716880'] },
        { image: 'page069_img02_1472x2405.jpeg', colorName: 'SANDY BEACH', specs: ['Opaque', 'BEACH-1026677'] },
        { image: 'page070_img01_1472x2405.jpeg', colorName: 'BLUE SKY', specs: ['Opaque', 'BEACH-1026676'] },
      ],
    },
    {
      name: 'Bondi — Opaque',
      swatches: [
        { image: 'page071_img01_1472x2405.jpeg', colorName: 'SANDHILLS', specs: ['Opaque', 'BOND-1026784'] },
        { image: 'page071_img02_1472x2405.jpeg', colorName: 'COCONUT', specs: ['Opaque', 'BOND-1026782'] },
        { image: 'page072_img01_1472x2405.jpeg', colorName: 'SHORELINE', specs: ['Opaque', 'BOND-1026785'] },
        { image: 'page072_img02_1472x2405.jpeg', colorName: 'DUSK', specs: ['Opaque', 'BOND-1026783'] },
      ],
    },
    {
      name: 'Hudson — Opaque',
      swatches: [
        { image: 'page073_img01_1472x2405.jpeg', colorName: 'WYTHE', specs: ['Opaque', 'HUDS-1026801'] },
        { image: 'page073_img02_1472x2405.jpeg', colorName: 'ELLIS', specs: ['Opaque', 'HUDS-1026798'] },
        { image: 'page074_img01_1472x2405.jpeg', colorName: 'PARK', specs: ['Opaque', 'HUDS-1026799'] },
        { image: 'page074_img02_1472x2405.jpeg', colorName: 'WAVERLY', specs: ['Opaque', 'HUDS-1026800'] },
      ],
    },
    {
      name: 'Camden — Opaque',
      swatches: [
        { image: 'page075_img01_1472x2405.jpeg', colorName: 'GRAY PENNANT', specs: ['Opaque', 'CAME-7716678'] },
        { image: 'page075_img02_1472x2405.jpeg', colorName: 'TUSCAN BEIGE', specs: ['Opaque', 'CAME-7716679'] },
        { image: 'page076_img01_1472x2405.jpeg', colorName: 'TRUE TAUPE', specs: ['Opaque', 'CAME-1026792'] },
        { image: 'page076_img02_1472x2405.jpeg', colorName: 'GRAY STAR', specs: ['Opaque', 'CAME-1026791'] },
      ],
    },
    {
      name: 'Accord — Opaque',
      swatches: [
        { image: 'page077_img01_1472x2405.jpeg', colorName: 'CLOUD', specs: ['Opaque', 'ACCRD-7708701'] },
        { image: 'page077_img02_1472x2405.jpeg', colorName: 'OPAL', specs: ['Opaque', 'ACCRD-1026775'] },
        { image: 'page078_img01_1472x2405.jpeg', colorName: 'BEIGE', specs: ['Opaque', 'ACCRD-1026774'] },
      ],
    },
    {
      name: 'Perforated Vinyl — Sheer',
      swatches: [
        { image: 'page079_img01_1472x2405.jpeg', colorName: 'WHITE', specs: ['Sheer', 'VPERF-7705742'] },
        { image: 'page079_img02_1472x2405.jpeg', colorName: 'IVORY', specs: ['Sheer', 'VPERF-7705741'] },
        { image: 'page080_img01_1472x2405.jpeg', colorName: 'GREY', specs: ['Sheer', 'VPERF-7705740'] },
        { image: 'page080_img02_1472x2405.jpeg', colorName: 'LIGHT GREY', specs: ['Sheer', 'VPERF-1026802'] },
        { image: 'page081_img01_1472x2405.jpeg', colorName: 'OFF WHITE', specs: ['Sheer', 'VPERF-1026803'] },
      ],
    },
    {
      name: 'Bridgeport — Opaque',
      swatches: [
        { image: 'page082_img01_1472x2405.jpeg', colorName: 'DIAMOND', specs: ['Opaque', 'BRID-1026787'] },
        { image: 'page082_img02_1472x2405.jpeg', colorName: 'GOLD', specs: ['Opaque', 'BRID-1026788'] },
        { image: 'page083_img01_1472x2405.jpeg', colorName: 'SILVER', specs: ['Opaque', 'BRID-1026789'] },
        { image: 'page083_img02_1472x2405.jpeg', colorName: 'CARBON', specs: ['Opaque', 'BRID-1026786'] },
      ],
    },
    {
      name: 'Aluminum — Opaque',
      swatches: [
        { image: 'page084_img01_1472x2405.jpeg', colorName: 'ONYX', specs: ['Opaque', 'ALUM-7716286'] },
        { image: 'page084_img02_1472x2405.jpeg', colorName: 'OFF WHITE', specs: ['Opaque', 'ALUM-7716285'] },
        { image: 'page085_img01_1472x2405.jpeg', colorName: 'ZINC', specs: ['Opaque', 'ALUM-7716280'] },
        { image: 'page085_img02_1472x2405.jpeg', colorName: 'ZINC PERFORATED', specs: ['Sheer', 'ALUM-7716281'] },
        { image: 'page086_img01_1472x2405.jpeg', colorName: 'WHITE PERFORATED', specs: ['Sheer', 'ALUM-1026741'] },
        { image: 'page086_img02_1472x2405.jpeg', colorName: 'CHARCOAL PERFORATED', specs: ['Sheer', 'ALUM-1026740'] },
        { image: 'page087_img01_1472x2405.jpeg', colorName: 'BLACK PERFORATED', specs: ['Sheer', 'ALUM-1026739'] },
      ],
    },
    {
      name: 'Woodlands — Opaque',
      swatches: [
        { image: 'page088_img01_1472x2405.jpeg', colorName: 'WHITE WOOD', specs: ['Opaque', 'WDLN-1026808'] },
        { image: 'page088_img02_1472x2405.jpeg', colorName: 'HONEY WOOD', specs: ['Opaque', 'WDLN-1026807'] },
        { image: 'page089_img01_1472x2405.jpeg', colorName: 'CHERRY WOOD', specs: ['Opaque', 'WDLN-1026804'] },
        { image: 'page089_img02_1472x2405.jpeg', colorName: 'DRIFTWOOD', specs: ['Opaque', 'WDLN-1026805'] },
        { image: 'page090_img01_1472x2405.jpeg', colorName: 'GREY WOOD', specs: ['Opaque', 'WDLN-1026806'] },
      ],
    },
    {
      name: 'Jupiter — Opaque',
      swatches: [
        { image: 'page091_img01_1472x2405.jpeg', colorName: 'GELATO', specs: ['Opaque', 'JUPI-1026985'] },
        { image: 'page091_img02_1472x2405.jpeg', colorName: 'TAFFY', specs: ['Opaque', 'JUPI-1026984'] },
        { image: 'page092_img01_1472x2405.jpeg', colorName: 'BOARDWALK', specs: ['Opaque', 'JUPI-1026986'] },
        { image: 'page092_img02_1472x2405.jpeg', colorName: 'JET', specs: ['Opaque', 'JUPI-1026987'] },
      ],
    },
    {
      name: 'Silas — Semi-Opaque',
      swatches: [
        { image: 'page093_img01_1472x2405.jpeg', colorName: 'WINTERMINT', specs: ['Semi-Opaque', 'SILAS-7712147'] },
        { image: 'page093_img02_1472x2405.jpeg', colorName: 'TOASTY VANILLA', specs: ['Semi-Opaque', 'SILAS-7712148'] },
        { image: 'page094_img01_1472x2405.jpeg', colorName: 'CINZA', specs: ['Semi-Opaque', 'SILAS-7716356'] },
      ],
    },
    {
      name: 'Graham — Opaque',
      swatches: [
        { image: 'page095_img01_1472x2405.jpeg', colorName: 'WHITE', specs: ['Opaque', 'GRAH-1026773'] },
        { image: 'page095_img02_1472x2405.jpeg', colorName: 'IVORY', specs: ['Opaque', 'GRAH-1026772'] },
        { image: 'page096_img01_1472x2405.jpeg', colorName: 'GREY', specs: ['Opaque', 'GRAH-1026771'] },
        { image: 'page096_img02_1472x2405.jpeg', colorName: 'BLACK', specs: ['Opaque', 'GRAH-1026770'] },
      ],
    },
    {
      name: 'Urban Loft — Semi-Opaque',
      swatches: [
        { image: 'page097_img01_1472x2405.jpeg', colorName: 'ORGANIC COTTON', specs: ['Semi-Opaque', 'UBL-7712173'] },
        { image: 'page097_img02_1472x2405.jpeg', colorName: 'BLUE DENIM', specs: ['Semi-Opaque', 'UBL-1026742'] },
        { image: 'page098_img01_1472x2405.jpeg', colorName: 'TAVERN TAUPE', specs: ['Semi-Opaque', 'UBL-1026744'] },
        { image: 'page098_img02_1472x2405.jpeg', colorName: 'SLATE GREY', specs: ['Semi-Opaque', 'UBL-1026743'] },
      ],
    },
    {
      name: 'Makena — Semi-Sheer',
      swatches: [
        { image: 'page099_img01_1472x2405.jpeg', colorName: 'BAMBOO', specs: ['Semi-Sheer', 'MAKENA-7716114'] },
        { image: 'page099_img02_1472x2405.jpeg', colorName: 'CHESTNUT', specs: ['Semi-Sheer', 'MAKENA-7704109'] },
        { image: 'page100_img01_1472x2405.jpeg', colorName: 'POPLAR', specs: ['Semi-Sheer', 'MAKENA-1026761'] },
        { image: 'page100_img02_1472x2405.jpeg', colorName: 'CINDER', specs: ['Semi-Sheer', 'MAKENA-1026760'] },
        { image: 'page101_img01_1472x2405.jpeg', colorName: 'TRAIL', specs: ['Semi-Sheer', 'MAKENA-1026762'] },
      ],
    },
    {
      name: 'Belmont — Semi-Sheer',
      swatches: [
        { image: 'page102_img01_1472x2405.jpeg', colorName: 'STOWE', specs: ['Semi-Sheer', 'BLMT-1026752'] },
        { image: 'page102_img02_1472x2405.jpeg', colorName: 'CRAMER', specs: ['Semi-Sheer', 'BLMT-1026750'] },
        { image: 'page103_img01_1472x2405.jpeg', colorName: 'WYLIE', specs: ['Semi-Sheer', 'BLMT-1026753'] },
        { image: 'page103_img02_1472x2405.jpeg', colorName: 'GLENWAY', specs: ['Semi-Sheer', 'BLMT-1026751'] },
      ],
    },
    {
      name: 'Amelia — Semi-Opaque',
      swatches: [
        { image: 'page104_img01_1472x2405.jpeg', colorName: 'CREAM', specs: ['Semi-Opaque', 'AMEL-1026747'] },
        { image: 'page104_img02_1472x2405.jpeg', colorName: 'WHITE CLOUD', specs: ['Semi-Opaque', 'AMEL-1026749'] },
        { image: 'page105_img01_1472x2405.jpeg', colorName: 'CASTLE', specs: ['Semi-Opaque', 'AMEL-1026745'] },
        { image: 'page105_img02_1472x2405.jpeg', colorName: 'CHATEAU', specs: ['Semi-Opaque', 'AMEL-1026746'] },
        { image: 'page106_img01_1472x2405.jpeg', colorName: 'TOWER', specs: ['Semi-Opaque', 'AMEL-1026748'] },
      ],
    },
    {
      name: 'Dawson — Sheer',
      swatches: [
        { image: 'page107_img01_1472x2405.jpeg', colorName: 'SPANISH MOSS', specs: ['Sheer', 'DAWSON-7712075'] },
        { image: 'page107_img02_1472x2405.jpeg', colorName: 'WHITE MAGNOLIA', specs: ['Sheer', 'DAWSON-7712073'] },
        { image: 'page108_img01_1472x2405.jpeg', colorName: 'WISTERIA', specs: ['Sheer', 'DAWSON-7712074'] },
        { image: 'page108_img02_1472x2405.jpeg', colorName: 'GREY IVY', specs: ['Sheer', 'DAWSON-1026758'] },
      ],
    },
    {
      name: 'Anson — Opaque',
      swatches: [
        { image: 'page109_img01_1472x2405.jpeg', colorName: 'PUTTY', specs: ['Opaque', 'ANS-7716561'] },
        { image: 'page109_img02_1472x2405.jpeg', colorName: 'CONCRETE', specs: ['Opaque', 'ANS-7716562'] },
        { image: 'page110_img01_1472x2405.jpeg', colorName: 'DOVE', specs: ['Opaque', 'ANS-7716563'] },
        { image: 'page110_img02_1472x2405.jpeg', colorName: 'PYRITE', specs: ['Opaque', 'ANS-7716564'] },
      ],
    },
    {
      name: 'Pastoral — Semi-Sheer',
      swatches: [
        { image: 'page111_img01_1472x2405.jpeg', colorName: 'FLAX', specs: ['Semi-Sheer', 'PAST-14101'] },
        { image: 'page111_img02_1472x2405.jpeg', colorName: 'MIST', specs: ['Semi-Sheer', 'PAST-1026763'] },
        { image: 'page112_img01_1472x2405.jpeg', colorName: 'WAVES', specs: ['Semi-Sheer', 'PAST-1026765'] },
        { image: 'page112_img02_1472x2405.jpeg', colorName: 'SHORE', specs: ['Semi-Sheer', 'PAST-1026764'] },
        { image: 'page113_img01_1472x2405.jpeg', colorName: 'WOOD', specs: ['Semi-Sheer', 'PAST-1026766'] },
      ],
    },
    {
      name: 'Cecily — Semi-Sheer',
      swatches: [
        { image: 'page114_img01_1472x2405.jpeg', colorName: 'WHITE WILLOW', specs: ['Semi-Sheer', 'CECI-1026756'] },
        { image: 'page114_img02_1472x2405.jpeg', colorName: 'IVORY ROSE', specs: ['Semi-Sheer', 'CECI-1026754'] },
        { image: 'page115_img01_1472x2405.jpeg', colorName: 'IVY', specs: ['Semi-Sheer', 'CECI-1026755'] },
        { image: 'page115_img02_1472x2405.jpeg', colorName: 'WOOD PATH', specs: ['Semi-Sheer', 'CECI-1026757'] },
      ],
    },
    {
      name: 'Trenton — Opaque',
      swatches: [
        { image: 'page116_img01_1472x2405.jpeg', colorName: 'ANTIQUE PARCHMENT', specs: ['Opaque', 'TRENT-7716242'] },
        { image: 'page116_img02_1472x2405.jpeg', colorName: 'DEEP SHALE', specs: ['Opaque', 'TRENT-7716240'] },
        { image: 'page117_img01_1472x2405.jpeg', colorName: 'FALLING SNOW', specs: ['Opaque', 'TRENT-1026767'] },
        { image: 'page117_img02_1472x2405.jpeg', colorName: 'SOFT TAN', specs: ['Opaque', 'TRENT-1026769'] },
        { image: 'page118_img01_1472x2405.jpeg', colorName: 'GREY MIST', specs: ['Opaque', 'TRENT-1026768'] },
      ],
    },
    {
      name: 'Easton — Opaque',
      swatches: [
        { image: 'page119_img01_1472x2405.jpeg', colorName: 'BIRCH', specs: ['Opaque', 'EAST-7716301'] },
        { image: 'page119_img02_1472x2405.jpeg', colorName: 'STRATUS', specs: ['Opaque', 'EAST-7716300'] },
        { image: 'page120_img01_1472x2405.jpeg', colorName: 'SMOKE', specs: ['Opaque', 'EAST-7716302'] },
        { image: 'page120_img02_1472x2405.jpeg', colorName: 'PATINA', specs: ['Opaque', 'EAST-1026759'] },
      ],
    },
    {
      name: 'Trem II — Semi-Sheer',
      swatches: [
        { image: 'page121_img01_1472x2405.jpeg', colorName: 'METAL', specs: ['Semi-Sheer', 'TREMII-7716807'] },
        { image: 'page121_img02_1472x2405.jpeg', colorName: 'WHITE', specs: ['Semi-Sheer', 'TREMII-93483'] },
        { image: 'page122_img01_1472x2405.jpeg', colorName: 'NATURAL', specs: ['Semi-Sheer', 'TREMII-93485'] },
        { image: 'page122_img02_1472x2405.jpeg', colorName: 'COCOA', specs: ['Semi-Sheer', 'TREMII-7716805'] },
      ],
    },
    {
      name: 'Collins — Opaque',
      swatches: [
        { image: 'page123_img01_1472x2405.jpeg', colorName: 'WHITE', specs: ['Opaque', 'COLINS-7705718'] },
        { image: 'page123_img02_1472x2405.jpeg', colorName: 'OFF WHITE', specs: ['Opaque', 'COLINS-7705719'] },
        { image: 'page124_img01_1472x2405.jpeg', colorName: 'ALMOND', specs: ['Opaque', 'COLINS-7705720'] },
        { image: 'page124_img02_1472x2405.jpeg', colorName: 'GRAPHITE', specs: ['Opaque', 'COLINS-1026816'] },
      ],
    },
    {
      name: 'Wesley — Opaque',
      swatches: [
        { image: 'page125_img01_1472x2405.jpeg', colorName: 'WHITE', specs: ['Opaque', 'WESL-7716400'] },
        { image: 'page125_img02_1472x2405.jpeg', colorName: 'CREAM', specs: ['Opaque', 'WESL-7716402'] },
        { image: 'page126_img01_1472x2405.jpeg', colorName: 'OFF WHITE', specs: ['Opaque', 'WESL-7716401'] },
        { image: 'page126_img02_1472x2405.jpeg', colorName: 'LIGHT GRAY', specs: ['Opaque', 'WESL-7716404'] },
      ],
    },
    {
      name: 'Fashion Vinyl — Opaque',
      swatches: [
        { image: 'page127_img01_1472x2405.jpeg', colorName: 'WHITE', specs: ['Opaque', 'FASH-7799660'] },
        { image: 'page127_img02_1472x2405.jpeg', colorName: 'OFF WHITE', specs: ['Opaque', 'FASH-7799661'] },
        { image: 'page128_img01_1472x2405.jpeg', colorName: 'LIGHT GRAY', specs: ['Opaque', 'FASH-7799664'] },
        { image: 'page128_img02_1472x2405.jpeg', colorName: 'TAN', specs: ['Opaque', 'FASH-7799663'] },
      ],
    },
    {
      name: 'Colonnade — Opaque',
      swatches: [
        { image: 'page129_img01_1472x2405.jpeg', colorName: 'NUTMEG', specs: ['Opaque', 'COLNADE-7712705'] },
        { image: 'page129_img02_1472x2405.jpeg', colorName: 'FENCE POST', specs: ['Opaque', 'COLNADE-7712704'] },
        { image: 'page130_img01_1472x2405.jpeg', colorName: 'SHADOW', specs: ['Opaque', 'COLNADE-7712706'] },
      ],
    },
    {
      name: 'Afton — Opaque',
      swatches: [
        { image: 'page131_img01_1472x2405.jpeg', colorName: 'WHITE', specs: ['Opaque', 'AFTON-7799640'] },
        { image: 'page131_img02_1472x2405.jpeg', colorName: 'OFF WHITE', specs: ['Opaque', 'AFTON-7799641'] },
        { image: 'page132_img01_1472x2405.jpeg', colorName: 'TAN', specs: ['Opaque', 'AFTON-7799645'] },
        { image: 'page132_img02_1472x2405.jpeg', colorName: 'GRAY', specs: ['Opaque', 'AFTON-7716647'] },
      ],
    },
    {
      name: 'Montauk — Opaque',
      swatches: [
        { image: 'page133_img01_1472x2405.jpeg', colorName: 'WHITE WASH', specs: ['Opaque', 'MONT-1026818'] },
        { image: 'page133_img02_1472x2405.jpeg', colorName: 'SANDSTONE', specs: ['Opaque', 'MONT-1026817'] },
      ],
    },
    {
      name: 'Midwest — Opaque',
      swatches: [
        { image: 'page134_img01_1472x2405.jpeg', colorName: 'BONE', specs: ['Opaque', 'MIDW-1026814'] },
        { image: 'page134_img02_1472x2405.jpeg', colorName: 'FROST', specs: ['Opaque', 'MIDW-1026815'] },
      ],
    },
    {
      name: 'Lily — Opaque',
      swatches: [
        { image: 'page135_img01_1472x2405.jpeg', colorName: 'PORCELAIN', specs: ['Opaque', 'LILY-1026989'] },
        { image: 'page135_img02_1472x2405.jpeg', colorName: 'CHAMPAGNE', specs: ['Opaque', 'LILY-1026988'] },
      ],
    },
    {
      name: 'Gilmore — Opaque',
      swatches: [
        { image: 'page136_img01_1472x2405.jpeg', colorName: 'WHITE', specs: ['Opaque', 'GILMO-7716775'] },
        { image: 'page136_img02_1472x2405.jpeg', colorName: 'OFF WHITE', specs: ['Opaque', 'GILMO-7716776'] },
        { image: 'page137_img01_1472x2405.jpeg', colorName: 'PEWTER', specs: ['Opaque', 'GILMO-7716777'] },
      ],
    },
    {
      name: 'Baskin — Opaque',
      swatches: [
        { image: 'page138_img01_1472x2405.jpeg', colorName: 'CHALK', specs: ['Opaque', 'BASK-1026778'] },
        { image: 'page138_img02_1472x2405.jpeg', colorName: 'NATURAL', specs: ['Opaque', 'BASK-1026780'] },
        { image: 'page139_img01_1472x2405.jpeg', colorName: 'ASH', specs: ['Opaque', 'BASK-1026777'] },
        { image: 'page139_img02_1472x2405.jpeg', colorName: 'STUCCO', specs: ['Opaque', 'BASK-1026781'] },
        { image: 'page140_img01_1472x2405.jpeg', colorName: 'CONCRETE', specs: ['Opaque', 'BASK-1026779'] },
      ],
    },
    {
      name: 'Lineage — Semi-Opaque',
      swatches: [
        { image: 'page141_img01_1472x2405.jpeg', colorName: 'SNOW', specs: ['Semi-Opaque', 'LINE-1026821'] },
        { image: 'page141_img02_1472x2405.jpeg', colorName: 'SAND', specs: ['Semi-Opaque', 'LINE-1026820'] },
        { image: 'page142_img01_1472x2405.jpeg', colorName: 'STORM', specs: ['Semi-Opaque', 'LINE-1026822'] },
      ],
    },
    {
      name: 'Layla — Semi-Sheer',
      swatches: [
        { image: 'page143_img01_1472x2405.jpeg', colorName: 'IVORY', specs: ['Semi-Sheer', 'LAYLA-7712112'] },
        { image: 'page143_img02_1472x2405.jpeg', colorName: 'WHITE', specs: ['Semi-Sheer', 'LAYLA-7712116'] },
        { image: 'page144_img01_1472x2405.jpeg', colorName: 'PLATINUM', specs: ['Semi-Sheer', 'LAYLA-1026819'] },
      ],
    },
  ],

  cellSize: null,
  opacity: null,
  edgeBanding: null,
  liner: null,
}
