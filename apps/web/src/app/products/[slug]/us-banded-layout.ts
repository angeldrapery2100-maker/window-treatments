/**
 * Design Studio\u2122 Banded Shades - Product Layout Data
 * Faithfully reproducing PDF pages 7, 8, 10, 12, 15 as scenes
 * and pages 20, 21, 22, 23, 25, 26 as info sections.
 * Swatches organized by series in collapsible groups.
 */

import type { ProductLayout, SectionLayout, SwatchCollection } from './types'

export const usBandedLayout: ProductLayout = {
  slug: 'us-banded',
  name: 'Design Studio\u2122 Banded Shades',
  description: 'Designer Banded Shades combine sheer and solid alternating fabric bands, available in light-filtering and light-dimming styles for easy selection of the opacity that fits your light control needs.',

  heroImage: 'page015_img01_2636x1692.jpeg',
  heroLabel: 'Designer Banded Shades',

  sections: [
    /* ═══ Scene Pages (PDF pages 7, 8, 10, 12, 15) ═══ */
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page007_img01_2632x1694.jpeg',
          text: 'Designer Banded Shades combine sheer and solid alternating fabric bands into a single shade. This unique design allows the shade to transition from open to closed seamlessly, providing a modern solution for view-through, light control and privacy.',
          label: 'Fabric Sienna    Color Latte\nOperating System PowerView\u00ae Automation    Deck 14',
        },
        {
          image: 'page008_img01_3620x1691.jpeg',
          text: '',
          label: 'Fabric Torrance    Color Ultra White\nOperating System SoftTouch\u00ae Motorization    Deck 24',
        },
        {
          image: 'page010_img01_2637x1691.jpeg',
          text: '',
          label: 'Fabric Blakeney    Color Oyster\nOperating System SoftTouch\u00ae Motorization    Deck 3',
        },
        {
          image: 'page012_img01_2638x1693.jpeg',
          text: '',
          label: 'Fabric Beckett    Color Satin Taupe\nOperating System PowerView\u00ae Automation    Deck 2',
        },
        {
          image: 'page015_img01_2636x1692.jpeg',
          text: '',
          label: 'Fabric Sienna    Color Latte\nOperating System PowerView\u00ae Automation    Deck 14',
        },
      ],
    },

    /* ═══ Page 21: Light Control Options ═══ */
    {
      type: 'comparison-grid',
      title: 'Light Control Options',
      cols: 2,
      items: [
        {
          image: 'page021_img01_1486x1111.jpeg',
          label: 'Light-Filtering Fabric Bands',
          sublabel: 'This option gently filters outside light to create a soft, warm glow within a room.',
        },
        {
          image: 'page021_img02_1486x1111.jpeg',
          label: 'Light-Dimming Fabric Bands',
          sublabel: 'This option provides increased light control by blocking most incoming light. Ideal for rooms where more light control is desired.',
        },
      ],
    },

    /* ═══ Page 22: Shade Functionality ═══ */
    {
      type: 'card-grid',
      title: 'Shade Functionality',
      cols: 3,
      cards: [
        {
          image: 'page022_img01_707x580.jpeg',
          title: 'Lowered, bands open',
          desc: 'Left Shade: Lowered, bands open\nRight Shade: Partially raised, bands open',
        },
        {
          image: 'page022_img02_707x580.jpeg',
          title: 'Lowered, bands closed',
          desc: 'Left Shade: Lowered, bands open\nRight Shade: Lowered, bands closed',
        },
        {
          image: 'page022_img03_707x580.jpeg',
          title: 'Partially raised, bands open',
          desc: 'Left Shade: Lowered, bands closed\nRight Shade: Partially raised, bands open',
        },
        {
          image: 'page022_img04_707x580.jpeg',
          title: 'Lowered, bands open',
          desc: 'Left Shade: Lowered, bands open\nRight Shade: Lowered, bands open',
        },
        {
          image: 'page022_img05_707x580.jpeg',
          title: 'Partially raised, bands closed',
          desc: 'Left Shade: Partially raised, bands closed\nRight Shade: Partially raised, bands open',
        },
        {
          image: 'page022_img06_707x580.jpeg',
          title: 'Partially raised, bands open',
          desc: 'Left Shade: Lowered, bands closed\nRight Shade: Partially raised, bands open',
        },
      ],
    },

    /* ═══ Page 23: Operating Systems (left: PowerView, right: other systems) ═══ */
    {
      type: 'control-systems',
      sceneLabel: 'Operating Systems',
      sceneImage: null,
      panels: [
        {
          title: 'PowerView\u00ae Automation',
          image: 'page023_img02_267x498.jpeg',
          features: [
            { title: 'Incredible Convenience', desc: 'Achieve your perfect light automatically\u2014morning, noon and night.' },
            { title: 'Effortless Control', desc: 'Compatible with voice assistants and many home automation systems.*' },
            { title: 'Privacy and Security', desc: 'Schedule shades to move automatically, when you\u2019re home or away.' },
            { title: 'Energy Efficiency', desc: 'Program shades to be in the best positions to heat and cool your home.' },
            { title: 'Child and Pet Safety', desc: 'Simple, cord-free operation.' },
          ],
        },
        {
          title: 'SoftTouch\u00ae Motorization',
          items: [
            { image: 'page023_img03_470x511.jpeg', title: 'SoftTouch\u00ae Motorization', desc: 'Easily raise or lower your shades using a simple and intuitive motorized wand.' },
            { image: 'page023_img04_469x511.jpeg', title: 'UltraGlide\u00ae', desc: 'Gently pull a single retractable wand to lift and lower shades.' },
            { image: 'page023_img05_470x511.jpeg', title: 'LiteRise\u00ae', desc: 'Simply push or pull on the bottom bar to align bands at any desired height.' },
            { image: 'page023_img06_470x512.jpeg', title: 'Custom Clutch', desc: 'Lift and lower shades with a continuous bead chain.' },
          ],
        },
      ],
    },

    /* ═══ Page 25: Top Treatments & Bottom Bar Position ═══ */
    {
      type: 'card-grid',
      title: 'Top Treatments & Bottom Treatments',
      cols: 3,
      cards: [
        {
          image: 'page025_img01_690x511.jpeg',
          title: 'Cassette',
          desc: 'Conceal the fabric roll with a contemporary aesthetic. Available in 9 custom hardware colors.',
        },
        {
          image: 'page025_img02_691x511.jpeg',
          title: 'Bracket Profile',
          desc: 'Minimal yet modern design showcases the fabric roll and clean lines. Available in White Tiara and Black.',
        },
        {
          image: 'page025_img03_690x511.jpeg',
          title: 'Banded Bottom Bar',
          desc: 'The innovative bottom bar allows the shade to taper and narrow from top to bottom, so the shade maintains band alignment and uniformity. Available fabric wrapped or unwrapped in 9 custom hardware colors.',
        },
        {
          image: 'page025_img04_690x511.jpeg',
          title: 'Banded Metal Bottom Bar',
          desc: 'The sleek metal bottom bar comes standard with LiteRise\u00ae and is optional with all other operating systems.',
        },
        {
          image: 'page025_img05_403x511.jpeg',
          title: 'Bands Open',
          desc: 'When the fabric and sheer bands are aligned and the shade is in the lowered position, the bottom bar will naturally rest above the window sill.',
        },
        {
          image: 'page025_img06_403x511.jpeg',
          title: 'Bands Closed',
          desc: 'When fabric bands align with sheer bands and the shade is in the lowered position, the bottom bar will rest closer to the window sill.',
        },
      ],
    },

    /* ═══ Page 26: Mounting Profiles ═══ */
    {
      type: 'split-scene',
      title: 'Mounting Profiles',
      sceneImage: 'page026_img01_863x1693.jpeg',
      sceneLabel: 'Fabric Everly    Color Tuscany\nOperating System PowerView\u00ae Automation    Deck 6',
      sceneSide: 'right',
      items: [
        { image: 'page026_img02_689x530.jpeg', label: 'Cassette \u2013 Inside Mount' },
        { image: 'page026_img03_689x530.jpeg', label: 'Cassette \u2013 Partial', sublabel: 'For shallow mounting depths' },
        { image: 'page026_img04_689x530.jpeg', label: 'Cassette \u2013 Outside Mount' },
        { image: 'page026_img05_689x530.jpeg', label: 'Bracket \u2013 Inside Mount' },
        { image: 'page026_img06_689x530.jpeg', label: 'Bracket \u2013 Partial', sublabel: 'For shallow mounting depths' },
        { image: 'page026_img07_689x530.jpeg', label: 'Bracket \u2013 Outside Mount' },
      ],
    },
  ],

  gallery: [
    { image: 'page002_img01_2059x1715.jpeg', text: '', label: '' },
    { image: 'page007_img01_2632x1694.jpeg', text: 'Designer Banded Shades combine sheer and solid alternating fabric bands into a single shade.', label: 'Fabric Sienna    Color Latte\nOperating System PowerView\u00ae Automation    Deck 14' },
    { image: 'page008_img01_3620x1691.jpeg', text: '', label: 'Fabric Torrance    Color Ultra White\nOperating System SoftTouch\u00ae Motorization    Deck 24' },
    { image: 'page009_img01_2633x1691.jpeg', text: '', label: 'Fabric Reed    Color Night Sky\nOperating System LiteRise\u00ae    Deck 13' },
    { image: 'page010_img01_2637x1691.jpeg', text: '', label: 'Fabric Blakeney    Color Oyster\nOperating System SoftTouch\u00ae Motorization    Deck 3' },
    { image: 'page011_img01_3641x1691.jpeg', text: '', label: 'Fabric Buckingham    Color Organza\nOperating System PowerView\u00ae Automation    Deck 4' },
    { image: 'page012_img01_2638x1693.jpeg', text: '', label: 'Fabric Beckett    Color Satin Taupe\nOperating System PowerView\u00ae Automation    Deck 2' },
    { image: 'page013_img01_2634x1692.jpeg', text: '', label: 'Fabric Cypress    Color Alpine White\nOperating System PowerView\u00ae Automation    Deck 28' },
    { image: 'page014_img01_3639x1691.jpeg', text: '', label: 'Fabric Fairy Glen    Color Harbor Gray\nOperating System PowerView\u00ae Automation    Deck 18' },
    { image: 'page015_img01_2636x1692.jpeg', text: '', label: 'Fabric Sienna    Color Latte\nOperating System PowerView\u00ae Automation    Deck 14' },
    { image: 'page016_img01_2633x1691.jpeg', text: '', label: 'Fabric Everly    Color Tuscany\nOperating System PowerView\u00ae Automation    Deck 6' },
    { image: 'page018_img01_2636x1691.jpeg', text: '', label: 'Fabric South Beach    Color Platinum\nOperating System PowerView\u00ae Automation    Deck 15' },
  ],

  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Design Studio\u2122 Banded Shades',
    items: [
      { image: 'page035_img01_306x306.jpeg', label: '048 Black' },
      { image: 'page035_img02_306x306.jpeg', label: '064 Bronze' },
      { image: 'page035_img03_306x306.jpeg', label: '316 Nickel' },
      { image: 'page035_img04_306x306.jpeg', label: '320 Rich Cream' },
      { image: 'page035_img05_306x306.jpeg', label: '651 Duchess Grey' },
      { image: 'page035_img06_306x306.jpeg', label: '661 White Tiara' },
      { image: 'page035_img07_306x306.jpeg', label: '859 Desert Tan' },
      { image: 'page035_img08_306x306.jpeg', label: '879 Pearl Gray' },
      { image: 'page035_img09_306x306.jpeg', label: '903 Desert Gold' },
    ],
  },

  swatchCollections: [
    /* ═══ Light Filtering ═══ */
    {
      name: 'Annandale \u2014 Light Filtering',
      swatches: [
        { image: 'page036_img01_631x1089.jpeg', colorName: 'QUARTZ', specs: ['Light Filtering', 'ANDL-201'] },
        { image: 'page036_img02_631x1089.jpeg', colorName: 'TEXAS ROSE', specs: ['Light Filtering', 'ANDL-550'] },
        { image: 'page037_img01_631x1089.jpeg', colorName: 'MORNING DEW', specs: ['Light Filtering', 'ANDL-801'] },
      ],
    },
    {
      name: 'Beckett \u2014 Light Filtering',
      swatches: [
        { image: 'page038_img01_631x1089.jpeg', colorName: 'PEARL CANDY', specs: ['Light Filtering', 'BCKT-101'] },
        { image: 'page038_img02_631x1089.jpeg', colorName: 'SATIN TAUPE', specs: ['Light Filtering', 'BCKT-301'] },
        { image: 'page039_img01_631x1089.jpeg', colorName: 'SILVER STRAND', specs: ['Light Filtering', 'BCKT-801'] },
      ],
    },
    {
      name: 'Blakeney \u2014 Light Filtering',
      swatches: [
        { image: 'page040_img01_631x1089.jpeg', colorName: 'OYSTER', specs: ['Light Filtering', 'BLKN-101'] },
        { image: 'page040_img02_631x1089.jpeg', colorName: 'SMOKE SCREEN', specs: ['Light Filtering', 'BLKN-201'] },
        { image: 'page041_img01_631x1089.jpeg', colorName: 'JAVA', specs: ['Light Filtering', 'BLKN-401'] },
      ],
    },
    {
      name: 'Buckingham \u2014 Light Filtering',
      swatches: [
        { image: 'page042_img01_631x1089.jpeg', colorName: 'ORGANZA', specs: ['Light Filtering', 'BUCK-101'] },
        { image: 'page042_img02_631x1089.jpeg', colorName: 'OATMEAL', specs: ['Light Filtering', 'BUCK-301'] },
        { image: 'page043_img01_631x1089.jpeg', colorName: 'STONE', specs: ['Light Filtering', 'BUCK-801'] },
        { image: 'page043_img02_631x1089.jpeg', colorName: 'STEEL WOOL', specs: ['Light Filtering', 'BUCK-802'] },
      ],
    },
    {
      name: 'Dobby \u2014 Light Filtering',
      swatches: [
        { image: 'page044_img01_631x1089.jpeg', colorName: 'COCONUT MILK', specs: ['Light Filtering', 'DBY-101'] },
        { image: 'page044_img02_631x1089.jpeg', colorName: 'VANILLA CR\u00c8ME', specs: ['Light Filtering', 'DBY-301'] },
        { image: 'page045_img01_631x1089.jpeg', colorName: 'SILVER CR\u00c8ME', specs: ['Light Filtering', 'DBY-801'] },
      ],
    },
    {
      name: 'Everly \u2014 Light Filtering',
      swatches: [
        { image: 'page046_img01_631x1089.jpeg', colorName: 'COTTON', specs: ['Light Filtering', 'EVRL-101'] },
        { image: 'page046_img02_631x1089.jpeg', colorName: 'SILENT GRAY', specs: ['Light Filtering', 'EVRL-801'] },
        { image: 'page047_img01_631x1089.jpeg', colorName: 'TUSCANY', specs: ['Light Filtering', 'EVRL-401'] },
      ],
    },
    {
      name: 'Jordan \u2014 Light Filtering',
      swatches: [
        { image: 'page048_img01_631x1089.jpeg', colorName: 'SNOWCAP', specs: ['Light Filtering', 'JOR-101'] },
        { image: 'page048_img02_631x1089.jpeg', colorName: 'SILVER SNOW', specs: ['Light Filtering', 'JOR-801'] },
        { image: 'page049_img01_631x1089.jpeg', colorName: 'CHAMBRAY', specs: ['Light Filtering', 'JOR-601'] },
        { image: 'page049_img02_631x1089.jpeg', colorName: 'CARBON', specs: ['Light Filtering', 'JOR-901'] },
      ],
    },
    {
      name: 'McCormick \u2014 Light Filtering',
      swatches: [
        { image: 'page050_img01_631x1089.jpeg', colorName: 'SATIN WHITE', specs: ['Light Filtering', 'MCRM-101'] },
        { image: 'page050_img02_631x1089.jpeg', colorName: 'ONYX', specs: ['Light Filtering', 'MCRM-901'] },
      ],
    },
    {
      name: 'Mirabella \u2014 Light Filtering',
      swatches: [
        { image: 'page051_img01_631x1089.jpeg', colorName: 'GLAZE', specs: ['Light Filtering', 'MRB-201'] },
        { image: 'page051_img02_631x1089.jpeg', colorName: 'SMOKE', specs: ['Light Filtering', 'MRB-801'] },
      ],
    },
    {
      name: 'Olivia \u2014 Light Filtering',
      swatches: [
        { image: 'page052_img01_631x1089.jpeg', colorName: 'CHINA WHITE', specs: ['Light Filtering', 'OLV-101'] },
        { image: 'page052_img02_631x1089.jpeg', colorName: 'SLATE GRAY', specs: ['Light Filtering', 'OLV-801'] },
        { image: 'page053_img01_631x1089.jpeg', colorName: 'PORCELAIN', specs: ['Light Filtering', 'OLV-202'] },
        { image: 'page053_img02_631x1089.jpeg', colorName: 'GRAY ICE', specs: ['Light Filtering', 'OLV-802'] },
      ],
    },
    {
      name: 'Poppy \u2014 Light Filtering',
      swatches: [
        { image: 'page054_img01_631x1089.jpeg', colorName: 'FROST', specs: ['Light Filtering', 'POP-101'] },
        { image: 'page054_img02_631x1089.jpeg', colorName: 'LINEN WHITE', specs: ['Light Filtering', 'POP-201'] },
        { image: 'page055_img01_631x1089.jpeg', colorName: 'WASHED OAK', specs: ['Light Filtering', 'POP-303'] },
        { image: 'page055_img02_631x1089.jpeg', colorName: 'SOFT CARAMEL', specs: ['Light Filtering', 'POP-301'] },
      ],
    },
    {
      name: 'Queensland \u2014 Light Filtering',
      swatches: [
        { image: 'page056_img01_631x1089.jpeg', colorName: 'TENDER', specs: ['Light Filtering', 'QUEN-201'] },
        { image: 'page056_img02_631x1089.jpeg', colorName: 'DOVE', specs: ['Light Filtering', 'QUEN-801'] },
        { image: 'page057_img01_631x1089.jpeg', colorName: 'CASHMERE', specs: ['Light Filtering', 'QUEN-101'] },
      ],
    },
    {
      name: 'Reed \u2014 Light Filtering',
      swatches: [
        { image: 'page058_img01_631x1089.jpeg', colorName: 'GLACIER', specs: ['Light Filtering', 'REED-101'] },
        { image: 'page058_img02_631x1089.jpeg', colorName: 'DESERT MIST', specs: ['Light Filtering', 'REED-201'] },
        { image: 'page059_img01_631x1089.jpeg', colorName: 'NIGHT SKY', specs: ['Light Filtering', 'REED-901'] },
      ],
    },
    {
      name: 'Sienna \u2014 Light Filtering',
      swatches: [
        { image: 'page060_img01_631x1089.jpeg', colorName: 'SNOW', specs: ['Light Filtering', 'SNA-101'] },
        { image: 'page060_img02_631x1089.jpeg', colorName: 'LATTE', specs: ['Light Filtering', 'SNA-301'] },
        { image: 'page061_img01_631x1089.jpeg', colorName: 'MISTY GRAY', specs: ['Light Filtering', 'SNA-801'] },
      ],
    },
    {
      name: 'South Beach \u2014 Light Filtering',
      swatches: [
        { image: 'page062_img01_631x1089.jpeg', colorName: 'STARLIGHT', specs: ['Light Filtering', 'SOUB-101'] },
        { image: 'page062_img02_631x1089.jpeg', colorName: 'PLATINUM', specs: ['Light Filtering', 'SOUB-801'] },
        { image: 'page063_img01_631x1089.jpeg', colorName: 'PEBBLE TRAIL', specs: ['Light Filtering', 'SOUB-401'] },
      ],
    },
    {
      name: 'Summerlin \u2014 Light Filtering',
      swatches: [
        { image: 'page064_img01_631x1089.jpeg', colorName: 'CHIFFON', specs: ['Light Filtering', 'SMRL-101'] },
        { image: 'page064_img02_631x1089.jpeg', colorName: 'WARM NATURAL', specs: ['Light Filtering', 'SMRL-301'] },
        { image: 'page065_img01_631x1089.jpeg', colorName: 'ENLIGHTEN', specs: ['Light Filtering', 'SMRL-801'] },
      ],
    },
    {
      name: 'Winslow \u2014 Light Filtering',
      swatches: [
        { image: 'page066_img01_631x1089.jpeg', colorName: 'WHITE OPAL', specs: ['Light Filtering', 'WNSL-101'] },
        { image: 'page066_img02_631x1089.jpeg', colorName: 'SOFT FOCUS', specs: ['Light Filtering', 'WNSL-301'] },
        { image: 'page067_img01_631x1089.jpeg', colorName: 'HAZE', specs: ['Light Filtering', 'WNSL-801'] },
        { image: 'page067_img02_631x1089.jpeg', colorName: 'SHADOW GRAY', specs: ['Light Filtering', 'WNSL-802'] },
      ],
    },
    /* ═══ ClearView\u00ae ═══ */
    {
      name: 'Fairy Glen \u2014 ClearView\u00ae',
      swatches: [
        { image: 'page068_img01_631x1089.jpeg', colorName: 'SIMPLY WHITE', specs: ['ClearView\u00ae', 'FGL-101'] },
        { image: 'page068_img02_631x1089.jpeg', colorName: 'FRENCH LINEN', specs: ['ClearView\u00ae', 'FGL-201'] },
        { image: 'page069_img01_631x1089.jpeg', colorName: 'HARBOR GRAY', specs: ['ClearView\u00ae', 'FGL-208'] },
        { image: 'page069_img02_631x1089.jpeg', colorName: 'MIDNIGHT', specs: ['ClearView\u00ae', 'FGL-901'] },
      ],
    },
    {
      name: 'Mali \u2014 ClearView\u00ae',
      swatches: [
        { image: 'page070_img01_631x1089.jpeg', colorName: 'SILVER LINING', specs: ['ClearView\u00ae', 'MALI-101'] },
        { image: 'page070_img02_631x1089.jpeg', colorName: 'DESERT MIST', specs: ['ClearView\u00ae', 'MALI-301'] },
        { image: 'page071_img01_631x1089.jpeg', colorName: 'SERENE SLATE', specs: ['ClearView\u00ae', 'MALI-801'] },
      ],
    },
    {
      name: 'Skye \u2014 ClearView\u00ae',
      swatches: [
        { image: 'page072_img01_631x1089.jpeg', colorName: 'WINTER WHITE', specs: ['ClearView\u00ae', 'SKYE-201'] },
        { image: 'page072_img02_631x1089.jpeg', colorName: 'FEATHER GRAY', specs: ['ClearView\u00ae', 'SKYE-801'] },
        { image: 'page073_img01_631x1089.jpeg', colorName: 'WROUGHT IRON', specs: ['ClearView\u00ae', 'SKYE-802'] },
      ],
    },
    /* ═══ Light Dimming ═══ */
    {
      name: 'Harper \u2014 Light Dimming',
      swatches: [
        { image: 'page074_img01_631x1089.jpeg', colorName: 'ELEGANT IVORY', specs: ['Light Dimming', 'HARP-201'] },
        { image: 'page074_img02_631x1089.jpeg', colorName: 'TWEED', specs: ['Light Dimming', 'HARP-301'] },
      ],
    },
    {
      name: 'Oxford \u2014 Light Dimming',
      swatches: [
        { image: 'page075_img01_631x1089.jpeg', colorName: 'ALABASTER', specs: ['Light Dimming', 'OXF-201'] },
        { image: 'page075_img02_631x1089.jpeg', colorName: 'CLOUD', specs: ['Light Dimming', 'OXF-801'] },
        { image: 'page076_img01_631x1089.jpeg', colorName: 'ASH', specs: ['Light Dimming', 'OXF-802'] },
      ],
    },
    {
      name: 'Shanghai \u2014 Light Dimming',
      swatches: [
        { image: 'page077_img01_631x1089.jpeg', colorName: 'CITY LIGHTS', specs: ['Light Dimming', 'SHNG-101'] },
        { image: 'page077_img02_631x1089.jpeg', colorName: 'SWISS CR\u00c8ME', specs: ['Light Dimming', 'SHNG-201'] },
        { image: 'page078_img01_631x1089.jpeg', colorName: 'MYSTIC FOG', specs: ['Light Dimming', 'SHNG-801'] },
      ],
    },
    {
      name: 'Torrance \u2014 Light Dimming',
      swatches: [
        { image: 'page079_img01_631x1089.jpeg', colorName: 'ULTRA WHITE', specs: ['Light Dimming', 'TRNC-101'] },
        { image: 'page079_img02_631x1089.jpeg', colorName: 'ALMOND WISP', specs: ['Light Dimming', 'TRNC-301'] },
        { image: 'page080_img01_631x1089.jpeg', colorName: 'SILVER DOLLAR', specs: ['Light Dimming', 'TRNC-801'] },
      ],
    },
    {
      name: 'Zander \u2014 Light Dimming',
      swatches: [
        { image: 'page081_img01_631x1089.jpeg', colorName: 'SILVER DUST', specs: ['Light Dimming', 'ZAN-801'] },
        { image: 'page081_img02_631x1089.jpeg', colorName: 'CHAMPAGNE', specs: ['Light Dimming', 'ZAN-301'] },
      ],
    },
    {
      name: 'Zoey \u2014 Light Dimming',
      swatches: [
        { image: 'page082_img01_631x1089.jpeg', colorName: 'DREAMSCAPE', specs: ['Light Dimming', 'ZOE-801'] },
        { image: 'page082_img02_631x1089.jpeg', colorName: 'CAPPUCCINO', specs: ['Light Dimming', 'ZOE-401'] },
        { image: 'page083_img01_631x1089.jpeg', colorName: 'PURE BLACK', specs: ['Light Dimming', 'ZOE-901'] },
      ],
    },
  ],

  cellSize: null,
  opacity: null,
  edgeBanding: null,
  liner: null,
}
