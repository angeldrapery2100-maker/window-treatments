/**
 * Modern Precious Metals\u00ae Aluminum Blinds - Product Layout Data
 * Rebuilt with proper sections for pages 7-19, 25-27 and swatches
 */

import type { ProductLayout, SectionLayout, SwatchCollection } from './types'

export const modernPreciousMetalsLayout: ProductLayout = {
  slug: 'modern-precious-metals',
  name: 'Modern Precious Metals\u00ae Aluminum Blinds',
  description: 'Modern Precious Metals Aluminum Blinds combine style and functionality with a range of on-trend metallic finishes that add contemporary sophistication to any room.',

  heroImage: 'page006_img01_2930x1505.jpeg',
  heroLabel: 'Product 1\u201d D\u00e9cor\u00ae    Color Brushed Gold Metallic\nOperating System LiteRise\u00ae with Wand Tilt',

  /* =====================================================================
   *  SCENE SECTIONS  (PDF pages 7, 8, 9, 10, 13)
   * =================================================================== */
  sections: [
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page007_img01_2994x1506.jpeg',
          text: 'Modern Precious Metals\u00ae Aluminum Blinds combine exceptional beauty, durability and innovative design features to make a stylish statement in your home.',
          label: '',
        },
        {
          image: 'page008_img01_2996x1505.jpeg',
          text: 'A range of on-trend colors and finishes lets you find Modern Precious Metals\u00ae blinds that perfectly match your d\u00e9cor.',
          label: 'Product 1\u201d D\u00e9cor\u00ae     Color Naval\nOperating System Cordlock with Wand Tilt',
        },
        {
          image: 'page009_img01_3904x1504.jpeg',
          text: '',
          label: 'Product 1\u201d D\u00e9cor\u00ae    Color Brushed Aluminum Metallic\nOperating System Cordlock with Wand Tilt',
        },
        {
          image: 'page010_img01_3905x1505.jpeg',
          text: '',
          label: 'Product 1\u201d Celebrity\u00ae    Color Cr\u00e8me de la Cr\u00e8me\nOperating System SimpleLift\u2122 with Wand Tilt',
        },
        {
          image: 'page013_img01_2996x1505.jpeg',
          text: 'Together, Modern Precious Metals\u00ae blinds and Design Studio\u2122 drapery create a layered look that adds beautiful dimension to the window.',
          label: 'Product 2\u201d Macro with Decorative Tapes    Color Woodland Dusk\nTape Color Smokey Beige   Design Studio\u2122 Color Gardenia\nOperating System SimpleLift\u2122 with PowerView\u00ae Automation',
        },
      ],
    },

    /* ===================================================================
     *  PAGE 14 \u2013 Benefits  (card-grid, 3 cols)
     * ================================================================= */
    {
      type: 'card-grid',
      title: 'Benefits',
      cols: 3,
      cards: [
        { image: 'page014_img01_762x455.jpeg', title: 'Multiple Finish and Color Options', desc: 'Modern Precious Metals\u00ae blinds are extremely versatile. Select from multiple slat sizes and a wide array of finishes that appeal to any design style.' },
        { image: 'page014_img02_764x455.jpeg', title: 'Durable Construction', desc: 'Slats are specially engineered to never warp, bow or fade.' },
        { image: 'page014_img03_764x455.jpeg', title: 'Easy to Clean', desc: 'Slats are designed for carefree maintenance. No professional cleaning is required.' },
        { image: 'page014_img04_764x455.jpeg', title: 'Customized Light and Privacy', desc: 'Create your perfect amount of light and privacy by tilting slats to any angle or raising the blind to any position.' },
        { image: 'page014_img05_764x455.jpeg', title: 'Expansive Sizes and Effortless Operation', desc: 'Modern Precious Metals\u00ae blinds can beautifully accommodate larger windows. Slats are lightweight yet sturdy for easy lifting.' },
        { image: 'page014_img06_764x455.jpeg', title: 'Minimal Stacking Height', desc: 'In the fully raised position, blinds feature a minimal stacking height so you can enjoy more of your outdoor view.' },
      ],
    },

    /* ===================================================================
     *  PAGE 15 \u2013 Light Control and Privacy
     *  Left: Slat Sizes (4 items)  |  Right: Light Control Options (3 items)
     * ================================================================= */
    {
      type: 'control-systems',
      sceneLabel: 'Light Control and Privacy',
      sceneImage: null,
      panels: [
        {
          title: 'Slat Sizes',
          items: [
            { image: 'page015_img04_764x455.jpeg', title: '\u00bd\u201d Slat', desc: '' },
            { image: 'page015_img05_764x455.jpeg', title: '1\u201d Slat', desc: '' },
            { image: 'page015_img06_764x455.jpeg', title: '2\u201d Slat', desc: '' },
            { image: 'page015_img07_764x455.jpeg', title: '2\u201d Slat with MagnaView\u00ae Tilt Option', desc: 'Increases view-through from 2\u201d to 4\u201d' },
          ],
        },
        {
          title: 'Light Control Options',
          items: [
            { image: 'page015_img01_480x1132.jpeg', title: 'Traditional Routed Blinds', desc: 'Cords are routed through small holes in each slat.' },
            { image: 'page015_img02_480x1132.jpeg', title: 'de-Light\u2122 Routless Design', desc: 'Cord holes are eliminated to block light.' },
            { image: 'page015_img03_480x1132.jpeg', title: 'Decorative Tapes', desc: 'Accents that coordinate with your d\u00e9cor.' },
          ],
        },
      ],
    },

    /* ===================================================================
     *  PAGE 16 \u2013 PowerView\u00ae Automation + Operating Systems (4 cols)
     * ================================================================= */
    {
      type: 'comparison-grid',
      title: 'PowerView\u00ae Automation',
      cols: 4,
      items: [
        { image: 'page016_img01_1091x1505.jpeg', label: 'PowerView\u00ae Automation', sublabel: 'Achieve your perfect light automatically. Schedule blinds to close whenever you prefer. Program blinds to be in the best positions throughout the day. Compatible with smart speakers and smart-home systems.' },
        { image: 'page016_img03_319x902.jpeg', label: 'LiteRise\u00ae', sublabel: 'This cordless system lifts and lowers blinds with the touch of a finger.' },
        { image: 'page016_img04_319x902.jpeg', label: 'SimpleLift\u2122', sublabel: 'Operate blinds by engaging a push-button, located on the bottom rail. This cordless system is ideal for homes with children or pets. (SimpleLift available with PowerView\u00ae Automation)' },
        { image: 'page016_img05_319x906.jpeg', label: 'Cordlock', sublabel: 'Blinds lock in place when the cord is pulled to raise or lower. Cord cleats prevent cord from dangling to the floor.' },
      ],
    },

    /* ===================================================================
     *  PAGE 18 \u2013 MagnaView\u00ae Tilt Option + Options
     *  Left: Tilt Options  |  Center: Scene  |  Right: MagnaView sequence
     * ================================================================= */
    {
      type: 'control-systems',
      sceneLabel: 'MagnaView\u00ae Tilt Option',
      sceneImage: null,
      panels: [
        {
          title: 'Tilt Options',
          items: [
            { image: 'page018_img02_764x455.jpeg', title: 'Cord Tilt', desc: '' },
            { image: 'page018_img05_764x455.jpeg', title: 'Wand Tilt', desc: 'Decorative Tapes, SimpleLift\u2122 Bottom Rail' },
          ],
        },
        {
          title: 'MagnaView\u00ae Sequence',
          items: [
            { image: 'page018_img03_764x455.jpeg', title: '', desc: 'When closed, the blind looks like a standard 2\u201d horizontal blind.' },
            { image: 'page018_img04_764x455.jpeg', title: '', desc: 'As you tilt the blind open, slats begin to nest closely together in pairs.' },
            { image: 'page018_img06_764x455.jpeg', title: '', desc: 'The slats continue to come together until they are parallel.' },
            { image: 'page018_img07_765x455.jpeg', title: '', desc: 'When the slats are fully nested, a standard 2\u201d view-through is doubled to 4\u201d.' },
          ],
        },
      ],
    },

    /* ===================================================================
     *  PAGE 19 \u2013 Mounting Profiles  (mounting-grid, 3 rows \u00d7 3 cols)
     * ================================================================= */
    {
      type: 'mounting-grid',
      title: 'Mounting Profiles',
      rows: [
        {
          label: 'Celebrity\u00ae Headrail',
          items: [
            { image: 'page019_img01_764x320.jpeg', label: 'Celebrity\u00ae Headrail\nInside Mount' },
            { image: 'page019_img02_764x320.jpeg', label: 'Celebrity\u00ae Headrail\nPartially Recessed' },
            { image: 'page019_img03_763x320.jpeg', label: 'Celebrity Headrail\nOutside Mount' },
          ],
        },
        {
          label: 'D\u00e9cor\u00ae Headrail',
          items: [
            { image: 'page019_img04_765x320.jpeg', label: 'D\u00e9cor\u00ae Headrail\nInside Mount' },
            { image: 'page019_img05_764x320.jpeg', label: 'D\u00e9cor\u00ae Headrail\nPartially Recessed' },
            { image: 'page019_img06_763x320.jpeg', label: 'D\u00e9cor Headrail\nOutside Mount' },
          ],
        },
        {
          label: 'Macro Valance',
          items: [
            { image: 'page019_img07_764x320.jpeg', label: 'Macro Valance\nInside Mount' },
            { image: 'page019_img08_761x320.jpeg', label: 'Macro Valance\nPartially Recessed' },
            { image: 'page019_img09_763x320.jpeg', label: 'Macro Valance\nOutside Mount' },
          ],
        },
      ],
    },

    /* ===================================================================
     *  PAGE 25 \u2013 Slat Sizes  (comparison-grid)
     * ================================================================= */
    {
      type: 'comparison-grid',
      title: 'Slat Sizes',
      cols: 3,
      items: [
        { image: 'page025_img01_1201x1200.jpeg', label: '1\u201d Celebrity / 1\u201d D\u00e9cor', sublabel: '(not available in Canada)' },
        { image: 'page025_img02_1206x1206.jpeg', label: '\u00bd\u201d D\u00e9cor', sublabel: '(not available in Canada)' },
        { image: 'page025_img03_1202x1202.jpeg', label: '2\u201d Macro', sublabel: '' },
      ],
    },
  ],

  /* =====================================================================
   *  GALLERY
   * =================================================================== */
  gallery: [
    { image: 'page006_img01_2930x1505.jpeg', text: '', label: 'Product 1\u201d D\u00e9cor\u00ae    Color Brushed Gold Metallic\nOperating System LiteRise\u00ae with Wand Tilt' },
    { image: 'page007_img01_2994x1506.jpeg', text: '', label: '' },
    { image: 'page008_img01_2996x1505.jpeg', text: '', label: 'Product 1\u201d D\u00e9cor\u00ae     Color Naval\nOperating System Cordlock with Wand Tilt' },
    { image: 'page009_img01_3904x1504.jpeg', text: '', label: 'Product 1\u201d D\u00e9cor\u00ae    Color Brushed Aluminum Metallic\nOperating System Cordlock with Wand Tilt' },
    { image: 'page010_img01_3905x1505.jpeg', text: '', label: 'Product 1\u201d Celebrity\u00ae    Color Cr\u00e8me de la Cr\u00e8me\nOperating System SimpleLift\u2122 with Wand Tilt' },
    { image: 'page011_img01_3905x1505.jpeg', text: '', label: 'Product 2\u201d Macro with MagnaView\u00ae    Color Satin Silver\nOperating System Cordlock with Cord Tilt' },
    { image: 'page012_img01_3906x1505.jpeg', text: '', label: 'Product 2\u201d Macro    Color Cameo\nOperating System LiteRise\u00ae with Cord Tilt' },
    { image: 'page013_img01_2996x1505.jpeg', text: '', label: 'Product 2\u201d Macro with Decorative Tapes    Color Woodland Dusk\nTape Color Smokey Beige   Design Studio\u2122 Color Gardenia\nOperating System SimpleLift\u2122 with PowerView\u00ae Automation' },
    { image: 'page016_img01_1091x1505.jpeg', text: '', label: '' },
    { image: 'page020_img01_1955x1504.jpeg', text: '', label: '' },
    { image: 'page022_img01_3008x2425.jpeg', text: '', label: '' },
  ],

  /* =====================================================================
   *  HARDWARE COLOR GUIDE  (Page 26 \u2013 23 items)
   * =================================================================== */
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'Modern Precious Metals\u00ae Aluminum Blinds',
    items: [
      /* Row 1 */
      { image: 'page026_img01_306x306.jpeg', label: '038 Black Textured' },
      { image: 'page026_img02_302x302.jpeg', label: '044 Aluminum Metallic' },
      { image: 'page026_img03_306x306.jpeg', label: '084 Bronze Textured' },
      { image: 'page026_img04_306x306.jpeg', label: '116 White Diamond Textured' },
      { image: 'page026_img05_306x306.jpeg', label: '237 Brushed Nickel Metallic' },
      { image: 'page026_img06_306x306.jpeg', label: '242 Venetian Bronze Textured' },
      { image: 'page026_img07_306x306.jpeg', label: '269 Chenille Textured' },
      { image: 'page026_img08_306x306.jpeg', label: '302 Bamboo Silk Textured' },
      /* Row 2 */
      { image: 'page026_img09_306x306.jpeg', label: '391 Tender Taupe Textured' },
      { image: 'page026_img10_98x98.jpeg', label: '435 Tuscan Tan Textured' },
      { image: 'page026_img11_99x99.jpeg', label: '560 Metallic Cream Textured' },
      { image: 'page026_img12_98x98.jpeg', label: '591 White Tiara Textured' },
      { image: 'page026_img13_99x99.jpeg', label: '852 Gardenia Textured' },
      { image: 'page026_img14_99x99.jpeg', label: '851 Platinum Gray Textured' },
      { image: 'page026_img15_306x306.jpeg', label: '901 Riding Boot Textured' },
      { image: 'page026_img16_306x306.jpeg', label: '993 Antique White Textured' },
      /* Row 3 */
      { image: 'page026_img17_306x306.jpeg', label: '2103 Meringue Textured' },
      { image: 'page026_img18_306x306.jpeg', label: '2107 Magnolia Textured' },
      { image: 'page026_img19_306x306.jpeg', label: '2119 Dapple Gray Textured' },
      { image: 'page026_img20_306x306.jpeg', label: '2124 Waffle Cone Textured' },
      { image: 'page026_img21_306x306.jpeg', label: '2136 Iron Gate Textured' },
      { image: 'page026_img22_306x306.jpeg', label: '2139 Pencil Sketch Textured' },
      { image: 'page026_img23_306x306.jpeg', label: '2140 Flaxen Textured' },
    ],
  },

  /* =====================================================================
   *  DECORATIVE TAPES  (Page 27 \u2013 18 items)
   * =================================================================== */
  decorativeTapes: {
    type: 'hardware-colors',
    title: 'Decorative Tapes',
    brandLabel: 'Modern Precious Metals\u00ae Aluminum Blinds',
    items: [
      /* Row 1 */
      { image: 'page027_img01_91x92.jpeg', label: '048 Black' },
      { image: 'page027_img02_93x93.jpeg', label: '064 Bronze' },
      { image: 'page027_img03_74x74.jpeg', label: '082 Camel' },
      { image: 'page027_img04_74x74.jpeg', label: '143 Smokey Beige' },
      { image: 'page027_img05_96x96.jpeg', label: '165 Maritime White' },
      { image: 'page027_img06_74x74.jpeg', label: '293 Bordeaux' },
      { image: 'page027_img07_92x92.jpeg', label: '302 Taupe' },
      { image: 'page027_img08_74x74.jpeg', label: '336 Chestnut' },
      /* Row 2 */
      { image: 'page027_img09_74x74.jpeg', label: '378 Sable' },
      { image: 'page027_img10_74x74.jpeg', label: '450 White' },
      { image: 'page027_img11_74x74.jpeg', label: '614 Ivory' },
      { image: 'page027_img12_74x74.jpeg', label: '685 Indigo' },
      { image: 'page027_img13_74x74.jpeg', label: '700 Pier' },
      { image: 'page027_img14_74x74.jpeg', label: '830 Almond' },
      { image: 'page027_img15_74x74.jpeg', label: '850 City Loft' },
      { image: 'page027_img16_74x74.jpeg', label: '861 Merino Sweater' },
      /* Row 3 */
      { image: 'page027_img17_74x74.jpeg', label: '867 Aged Gray' },
      { image: 'page027_img18_74x74.jpeg', label: '973 Antique White' },
    ],
  },

  // ──── Swatch Collections — 2026-08-12 与 hd-modern-precious-metals-digital-sample-book.pdf Color Chart 核对重绑 ────
  swatchCollections: [
    {
      name: 'Fabrics',
      swatches: [
        { image: 'page028_img01_613x1059.jpeg', colorName: 'Brilliant White', specs: ['3346 (1" Celebrity*, ½" Décor*, 1" Décor*, 2" Macro)'] },
        { image: 'page028_img02_613x1059.jpeg', colorName: 'Sailor\'s Knot', specs: ['943 (1" Celebrity*, 1" Décor*, 2" Macro)'] },
        { image: 'page029_img01_613x1059.jpeg', colorName: 'White Ice', specs: ['3347 (1" Celebrity*, ½" Décor*, 1" Décor*, 2" Macro)'] },
        { image: 'page029_img02_613x1059.jpeg', colorName: 'Flex White', specs: ['885 (1" Celebrity*, ½" Décor*, 1" Décor*, 2" Macro)'] },
        { image: 'page030_img01_613x1059.jpeg', colorName: 'Frost Opalescence', specs: ['586 (1" Celebrity*, 1" Décor*)'] },
        { image: 'page030_img02_613x1059.jpeg', colorName: 'Pearl Frost', specs: ['718 (1" Celebrity*)'] },
        { image: 'page031_img01_613x1059.jpeg', colorName: 'Snowbound', specs: ['3353 (1" Celebrity*, 1" Décor*, 2" Macro)'] },
        { image: 'page031_img02_613x1059.jpeg', colorName: 'Sea Shell', specs: ['3348 (1" Celebrity*, 1" Décor*, 2" Macro)'] },
        { image: 'page032_img01_613x1059.jpeg', colorName: 'Winter Sky', specs: ['3350 (1" Celebrity*, 1" Décor*)'] },
        { image: 'page032_img02_613x1059.jpeg', colorName: 'Pearl', specs: ['974 (1" Celebrity*, ½" Décor*, 1" Décor*, 2" Macro)'] },
        { image: 'page033_img01_613x1059.jpeg', colorName: 'Alabaster', specs: ['002 (1" Celebrity*, 1" Décor*, 2" Macro)'] },
        { image: 'page033_img02_613x1059.jpeg', colorName: 'Picket Fence', specs: ['918 (1" Celebrity*, 1" Décor*)'] },
        { image: 'page034_img01_613x1059.jpeg', colorName: 'Crème de la Crème', specs: ['268 (1" Celebrity*, 1" Décor*)'] },
        { image: 'page034_img02_613x1059.jpeg', colorName: 'Chenille', specs: ['269 (1" Celebrity*, ½" Décor*, 1" Décor*, 2" Macro)'] },
        { image: 'page035_img01_613x1059.jpeg', colorName: 'Antique White', specs: ['973 (1" Celebrity*, ½" Décor*, 1" Décor*, 2" Macro)'] },
        { image: 'page035_img02_613x1059.jpeg', colorName: 'Almond', specs: ['830 (1" Celebrity*, 1" Décor*, 2" Macro)'] },
        { image: 'page036_img01_613x1059.jpeg', colorName: 'Nordic Mist Opalescence', specs: ['587 (1" Celebrity*, 1" Décor*)'] },
        { image: 'page036_img02_613x1059.jpeg', colorName: 'Linen', specs: ['270 (1" Celebrity*, 1" Décor*, 2" Macro)'] },
        { image: 'page037_img01_613x1059.jpeg', colorName: 'Fawn', specs: ['205 (1" Celebrity*, ½" Décor*, 1" Décor*, 2" Macro)'] },
        { image: 'page037_img02_613x1059.jpeg', colorName: 'Beige', specs: ['186 (1" Celebrity*, 1" Décor*)'] },
        { image: 'page038_img01_613x1059.jpeg', colorName: 'Brushed Aluminum Metallic', specs: ['065 (1" Celebrity*, ½" Décor*, 1" Décor*, 2" Macro)'] },
        { image: 'page038_img02_613x1059.jpeg', colorName: 'Bright Aluminum', specs: ['190 (1" Celebrity*, 1" Décor*, 2" Macro)'] },
        { image: 'page039_img01_613x1059.jpeg', colorName: 'Castaway', specs: ['3352 (1" Celebrity*)'] },
        { image: 'page039_img02_613x1059.jpeg', colorName: 'Satin Silver', specs: ['018 (1" Celebrity*, 1" Décor*, 2" Macro)'] },
        { image: 'page040_img01_613x1059.jpeg', colorName: 'Silver Cloud', specs: ['318 (1" Celebrity*, 1" Décor*)'] },
        { image: 'page040_img02_613x1059.jpeg', colorName: 'Dove Gray', specs: ['180 (1" Celebrity*)'] },
        { image: 'page041_img01_613x1059.jpeg', colorName: 'Stonecutter', specs: ['3349 (1" Celebrity*, 1" Décor*, 2" Macro)'] },
        { image: 'page041_img02_613x1059.jpeg', colorName: 'Gray Flannel', specs: ['405 (1" Celebrity*, 1" Décor*)'] },
        { image: 'page042_img01_613x1059.jpeg', colorName: 'Cinder', specs: ['913 (1" Celebrity*, 1" Décor*)'] },
        { image: 'page042_img02_613x1059.jpeg', colorName: 'Riding Boot', specs: ['911 (1" Celebrity*)'] },
        { image: 'page043_img01_613x1059.jpeg', colorName: 'Bronze', specs: ['064 (1" Celebrity*, ½" Décor*, 1" Décor*, 2" Macro)'] },
        { image: 'page043_img02_613x1059.jpeg', colorName: 'Umber', specs: ['820 (1" Celebrity*, 1" Décor*)'] },
        { image: 'page044_img01_613x1059.jpeg', colorName: 'Black', specs: ['048 (1" Celebrity*, 1" Décor*, 2" Macro)'] },
        { image: 'page044_img02_613x1059.jpeg', colorName: 'Porcelain Pearl', specs: ['711 (½" Décor*, 1" Décor*)'] },
        { image: 'page045_img01_613x1059.jpeg', colorName: 'Ice Cap', specs: ['3339 (1" Décor*, 2" Macro)'] },
        { image: 'page045_img02_613x1059.jpeg', colorName: 'Snowy White Matte', specs: ['248 (1" Décor*, 2" Macro)'] },
        { image: 'page046_img01_613x1059.jpeg', colorName: 'White Oxford', specs: ['930 (1" Décor*, 2" Macro)'] },
        { image: 'page046_img02_613x1059.jpeg', colorName: 'Dover Matte', specs: ['246 (1" Décor*, 2" Macro)'] },
        { image: 'page047_img01_613x1059.jpeg', colorName: 'Cameo', specs: ['3336 (1" Décor*, 2" Macro)'] },
        { image: 'page047_img02_613x1059.jpeg', colorName: 'Macadamia', specs: ['3351 (1" Décor*)'] },
        { image: 'page048_img01_613x1059.jpeg', colorName: 'Tuscan Tan', specs: ['402 (1" Décor*)'] },
        { image: 'page048_img02_613x1059.jpeg', colorName: 'Steel Wind Brushed', specs: ['262 (1" Décor*)'] },
        { image: 'page049_img01_613x1059.jpeg', colorName: 'Stormy White Brushed', specs: ['161 (1" Décor*)'] },
        { image: 'page049_img02_613x1059.jpeg', colorName: 'Stoneware', specs: ['3345 (1" Décor*, 2" Macro)'] },
        { image: 'page050_img01_613x1059.jpeg', colorName: 'Mica Opalescence', specs: ['588 (1" Décor*)'] },
        { image: 'page050_img02_613x1059.jpeg', colorName: 'Silverado', specs: ['276 (1" Décor*)'] },
        { image: 'page051_img01_613x1059.jpeg', colorName: 'Graystone', specs: ['3340 (1" Décor*, 2" Macro)'] },
        { image: 'page051_img02_613x1059.jpeg', colorName: 'Stingray', specs: ['3341 (1" Décor*, 2" Macro)'] },
        { image: 'page052_img01_613x1059.jpeg', colorName: 'Venetian Bronze Brushed', specs: ['234 (1" Décor*, 2" Macro)'] },
        { image: 'page052_img02_613x1059.jpeg', colorName: 'Bronze Matte', specs: ['254 (1" Décor*)'] },
        { image: 'page053_img01_613x1059.jpeg', colorName: 'Inkwell', specs: ['3337 (1" Décor*, 2" Macro)'] },
        { image: 'page053_img02_613x1059.jpeg', colorName: 'Blush', specs: ['3338 (1" Décor*)'] },
        { image: 'page054_img01_613x1059.jpeg', colorName: 'Woodland Dusk', specs: ['909 (1" Décor*, 2" Macro)'] },
        { image: 'page054_img02_613x1059.jpeg', colorName: 'Brushed Copper', specs: ['3335 (1" Décor*)'] },
        { image: 'page055_img01_613x1059.jpeg', colorName: 'Colonial Copper', specs: ['194 (1" Décor*)'] },
        { image: 'page055_img02_613x1059.jpeg', colorName: 'Brushed Gold Metallic', specs: ['3334 (1" Décor*)'] },
        { image: 'page056_img01_613x1059.jpeg', colorName: 'Brushed Nickel', specs: ['237 (1" Décor*, 2" Macro)'] },
        { image: 'page056_img02_613x1059.jpeg', colorName: 'Khaki', specs: ['383 (1" Décor*)'] },
        { image: 'page057_img01_613x1059.jpeg', colorName: 'Brown Sugar', specs: ['3342 (1" Décor*)'] },
        { image: 'page057_img02_613x1059.jpeg', colorName: 'Hunter Green', specs: ['413 (1" Décor*)'] },
        { image: 'page058_img01_613x1059.jpeg', colorName: 'Sea Glass', specs: ['3343 (1" Décor*)'] },
        { image: 'page058_img02_613x1059.jpeg', colorName: 'Davenport', specs: ['914 (1" Décor*)'] },
        { image: 'page059_img01_613x1059.jpeg', colorName: 'Naval', specs: ['3344 (1" Décor*, 2" Macro)'] },
        { image: 'page059_img02_613x1059.jpeg', colorName: 'Sand Pebble', specs: ['539 (2" Macro)'] },
        { image: 'page060_img01_613x1059.jpeg', colorName: 'Jute', specs: ['544 (2" Macro)'] },
        { image: 'page060_img02_613x1059.jpeg', colorName: 'Stone', specs: ['538 (2" Macro)'] },
        { image: 'page061_img01_613x1059.jpeg', colorName: 'Slate', specs: ['547 (2" Macro)'] },
        { image: 'page061_img02_613x1059.jpeg', colorName: 'Fossil Rock', specs: ['546 (2" Macro)'] },
        { image: 'page062_img01_613x1059.jpeg', colorName: 'Brushed Brass', specs: ['537 (2" Macro)'] },
        { image: 'page062_img02_613x1059.jpeg', colorName: 'Brownstone', specs: ['548 (2" Macro)'] },
      ],
    },
  ],

  cellSize: null,
  opacity: null,
  edgeBanding: null,
  liner: null,
}
