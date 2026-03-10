/**
 * EverWood\u00ae & Parkland\u00ae Blinds - Product Layout Data
 * Rebuilt from PDF pages 7-10 (scenes), 20-29 (info sections)
 * Hardware Colors: page 36 (38 unique chips)
 * Decorative Tapes: page 37 (18 unique chips)
 * Swatches: unchanged from original
 */

import type { ProductLayout, SectionLayout, SwatchCollection } from './types'

export const everwoodParklandLayout: ProductLayout = {
  slug: 'everwood-parkland',
  name: 'EverWood\u00ae & Parkland\u00ae Blinds',
  description: 'EverWood Alternative Wood Blinds are created with quality materials for a classic look that stands the test of time, featuring the realistic TruGrain finish that captures authentic wood grain patterns.',

  heroImage: 'page005_img01_2603x1003.jpeg',
  heroLabel: 'Product 2" TruGrain\u00ae    Color Deco Gray    Operating System SimpleLift\u2122 with PowerView\u00ae Motorization',

  sections: [
    // ======== Pages 7-10: Scene Pairs (4 room scenes) ========
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page007_img01_1897x1004.jpeg',
          text: 'The TruGrain\u00ae finish captures realistic wood grain patterns to complement wooden accents and home d\u00e9cor.',
          label: '',
        },
        {
          image: 'page008_img01_1736x1004.jpeg',
          text: 'Available in multiple slat sizes and profiles, the Distinctions\u2122 line caters to any style.',
          label: 'Product 2\u00bd" Distinctions\u2122    Color Extreme White    Operating System SimpleLift\u2122 with Wand Tilt',
        },
        {
          image: 'page009_img01_1897x1004.jpeg',
          text: 'The Patina collection emulates high-end glazing with a distinctive slat profile.',
          label: 'Product 2\u00bd" Patina    Color Chateau    Operating System Cordlock with Cord Tilt',
        },
        {
          image: 'page010_img01_1897x1004.jpeg',
          text: 'Embossed slats in the Textured collection provide visual depth and texture.',
          label: 'Product 2" Textured    Color Almondine    Operating System LiteRise\u00ae with Wand Tilt',
        },
      ],
    },

    // ======== Page 20: Distinct Grain Patterns (3 cols \u00d7 2 rows) ========
    {
      type: 'comparison-grid',
      title: 'Distinct Grain Patterns',
      cols: 3,
      items: [
        { image: 'page020_img01_1004x268.jpeg', label: 'Flat Grain', sublabel: 'A swirl pattern produced by cutting tangent to growth rings.' },
        { image: 'page020_img02_858x268.jpeg', label: 'Mineral Deposits', sublabel: 'Result of environmental factors affecting a tree\'s development.' },
        { image: 'page020_img03_487x268.jpeg', label: 'Tiger Striping', sublabel: 'A grain structure caused by irregular growth due to temperature changes.' },
        { image: 'page020_img04_891x268.jpeg', label: 'Pin Knots', sublabel: 'Remnants of branches covered by the growth of new wood.' },
        { image: 'page020_img05_937x268.jpeg', label: 'Grain Change', sublabel: 'A place in the grain structure where a branch grew and caused growth rings to move in a different direction.' },
        { image: 'page020_img06_487x268.jpeg', label: 'Burl Figures', sublabel: 'Formed by irregular growth on a tree\'s outer surface.' },
      ],
    },

    // ======== Page 21: Slat Sizes & Routing Options (5 cols) ========
    {
      type: 'comparison-grid',
      title: 'Slat Sizes & Routing Options',
      cols: 5,
      items: [
        { image: 'page021_img01_447x710.jpeg', label: '2" Slat', sublabel: 'For traditional view-through.' },
        { image: 'page021_img02_447x710.jpeg', label: '2\u00bd" Slat', sublabel: 'For wider view-through to the outdoors.' },
        { image: 'page021_img03_299x708.jpeg', label: 'Traditional Routed Blinds', sublabel: 'Cords are routed through small holes in each slat.' },
        { image: 'page021_img04_300x709.jpeg', label: 'de-Light\u2122 Routless Design', sublabel: 'Eliminates cord holes to block light for enhanced privacy.' },
        { image: 'page021_img05_299x709.jpeg', label: 'Decorative Tapes', sublabel: 'Provide an accent for blinds and home d\u00e9cor.' },
      ],
    },

    // ======== Page 22: Operating Systems ========
    {
      type: 'control-systems',
      sceneImage: 'page022_img01_585x1004.jpeg',
      sceneLabel: '',
      panels: [
        {
          title: 'PowerView\u00ae Automation',
          image: 'page022_img05_139x298.jpeg',
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
            { image: 'page022_img02_423x268.jpeg', title: 'SimpleLift\u2122', desc: 'Operate blinds by engaging a push-button, located on the bottom rail. This cordless system is ideal for homes with children or pets.' },
            { image: 'page022_img03_422x268.jpeg', title: 'LiteRise\u00ae', desc: 'This cordless system lifts and lowers blinds with the touch of a finger.' },
            { image: 'page022_img06_422x268.jpeg', title: 'Cordlock', desc: 'Blinds lock in place when the cord is pulled to raise or lower. Cord cleats prevent cord from dangling to the floor.' },
          ],
        },
      ],
    },

    // ======== Page 24: Tilt Options & Valances (3 cols \u00d7 2 rows) ========
    {
      type: 'card-grid',
      title: 'Tilt Options & Valances',
      cols: 3,
      cards: [
        { image: 'page024_img01_447x268.jpeg', title: 'Cord Tilt', desc: 'Control the desired amount of light by gently pulling on the cord.' },
        { image: 'page024_img02_447x268.jpeg', title: 'Wand Tilt', desc: 'Softly rotate the wand to let in the preferred amount of light.' },
        { image: 'page024_img03_447x268.jpeg', title: 'Artemis\u2122 Valance', desc: '' },
        { image: 'page024_img04_447x268.jpeg', title: 'Grandover\u2122 Valance', desc: '' },
        { image: 'page024_img05_447x268.jpeg', title: 'Specialty Shapes', desc: 'Blinds are customized for certain unique window shapes.' },
        { image: 'page024_img06_447x268.jpeg', title: 'Crown Valance', desc: '' },
      ],
    },

    // ======== Page 25: Valance Mounting Profiles (3\u00d73 grid) ========
    {
      type: 'mounting-grid',
      title: 'Valance Mounting Profiles',
      rows: [
        {
          items: [
            { image: 'page025_img01_447x203.jpeg', label: 'Crown Valance, Inside Mount' },
            { image: 'page025_img02_447x203.jpeg', label: 'Grandover\u2122 Valance, Inside Mount' },
            { image: 'page025_img03_447x203.jpeg', label: 'Artemis\u2122 Valance, Inside Mount' },
          ],
        },
        {
          items: [
            { image: 'page025_img04_447x203.jpeg', label: 'Crown Valance, Outside Mount' },
            { image: 'page025_img05_447x203.jpeg', label: 'Grandover\u2122 Valance, Outside Mount' },
            { image: 'page025_img06_447x203.jpeg', label: 'Artemis\u2122 Valance, Outside Mount' },
          ],
        },
        {
          items: [
            { image: 'page025_img07_447x203.jpeg', label: 'Crown Valance, Inside/Outside Mount' },
            { image: 'page025_img08_447x203.jpeg', label: 'Grandover\u2122 Valance, Inside/Outside Mount' },
            { image: 'page025_img09_447x203.jpeg', label: 'Artemis\u2122 Valance, Inside/Outside Mount' },
          ],
        },
      ],
    },

    // ======== Page 26: Parkland\u00ae Wood Cornices (large scene) ========
    {
      type: 'scene-pair',
      scenes: [
        {
          image: 'page026_img01_1885x1004.jpeg',
          text: 'Parkland\u00ae Wood Cornices are crafted with meticulous attention to detail and can elegantly finish any Hunter Douglas window treatment.',
          label: '',
        },
      ],
    },

    // ======== Page 27: Cornice Styles (5 items) ========
    {
      type: 'comparison-grid',
      title: 'Cornice Styles',
      cols: 3,
      items: [
        { image: 'page027_img01_447x268.jpeg', label: 'Zurich Bead', sublabel: '6" cornice' },
        { image: 'page027_img02_447x268.jpeg', label: 'Zurich', sublabel: '6" cornice' },
        { image: 'page027_img03_446x268.jpeg', label: 'Claremont Dentil', sublabel: '9" or 12" cornice' },
        { image: 'page027_img04_445x268.jpeg', label: 'Inverness', sublabel: '9" or 12" cornice' },
        { image: 'page027_img05_447x267.jpeg', label: 'Townsend', sublabel: '9" or 12" cornice' },
      ],
    },

    // ======== Page 28: Cornice Accessories (10 items, 4 cols) ========
    {
      type: 'card-grid',
      title: 'Cornice Accessories',
      cols: 4,
      cards: [
        { image: 'page028_img01_448x268.jpeg', title: 'Mantel Shelves', desc: 'Coordinate d\u00e9cor with a matching mantel shelf.' },
        { image: 'page028_img02_447x268.jpeg', title: 'Carved Wood Appliqu\u00e9', desc: 'Add an elegant finishing touch with a handcrafted appliqu\u00e9.' },
        { image: 'page028_img03_447x184.jpeg', title: 'Grapevine Appliqu\u00e9', desc: '9" cornice: 20" \u00d7 4 \u00bc" | 12" cornice: 24" \u00d7 5"' },
        { image: 'page028_img04_447x184.jpeg', title: 'Same Color as Cornice', desc: 'Appliqu\u00e9 finish matches cornice color.' },
        { image: 'page028_img05_449x184.jpeg', title: 'Acanthus Leaf Appliqu\u00e9', desc: '9" cornice: 16" \u00d7 4" | 12" cornice: 24 5/8" \u00d7 6"' },
        { image: 'page028_img06_447x184.jpeg', title: 'Antique Silverleaf', desc: 'Silver appliqu\u00e9 finish.' },
        { image: 'page028_img07_447x268.jpeg', title: 'Decorative Keystones', desc: 'Create additional dimensional detail on a cornice with a decorative keystone.' },
        { image: 'page028_img08_447x268.jpeg', title: 'Decorative Plate Grooves', desc: 'Display plates or other special d\u00e9cor.' },
        { image: 'page028_img09_447x184.jpeg', title: 'Shell Appliqu\u00e9', desc: '9" cornice: 12 \u00bc" \u00d7 3 5/8" | 12" cornice: 24" \u00d7 5"' },
        { image: 'page028_img10_447x184.jpeg', title: 'Antique Goldleaf', desc: 'Gold appliqu\u00e9 finish.' },
      ],
    },

    // ======== Page 29: Whole House Solution\u2122 ========
    {
      type: 'split-scene',
      title: 'The Whole House Solution\u2122',
      sceneImage: 'page029_img01_686x1004.jpeg',
      sceneLabel: '',
      sceneSide: 'left',
      items: [
        { image: 'page029_img02_285x301.jpeg', label: '' },
        { image: 'page029_img03_285x302.jpeg', label: '' },
        { image: 'page029_img04_285x302.jpeg', label: '' },
      ],
    },
  ],

  // ======== Gallery ========
  gallery: [
    { image: 'page005_img01_2603x1003.jpeg', text: '', label: '' },
    { image: 'page006_img01_1885x1003.jpeg', text: '', label: '' },
    { image: 'page007_img01_1897x1004.jpeg', text: '', label: '' },
    { image: 'page014_img01_1897x1004.jpeg', text: '', label: '' },
    { image: 'page018_img01_1895x1004.jpeg', text: '', label: '' },
    { image: 'page023_img01_1885x1004.jpeg', text: '', label: '' },
    { image: 'page026_img01_1885x1004.jpeg', text: '', label: '' },
    { image: 'page031_img01_3009x2423.jpeg', text: '', label: '' },
    { image: 'page032_img01_3010x3010.jpeg', text: '', label: '' },
  ],

  // ======== Hardware Colors (page 36, 38 unique chips) ========
  hardwareColors: {
    type: 'hardware-colors',
    title: 'Hardware Color Guide',
    brandLabel: 'EverWood\u00ae & Parkland\u00ae Blinds',
    items: [
      { image: 'page036_img01_306x306.jpeg', label: '038 Black' },
      { image: 'page036_img02_306x306.jpeg', label: '084 Bronze' },
      { image: 'page036_img03_306x306.jpeg', label: '116 White Diamond' },
      { image: 'page036_img04_306x306.jpeg', label: '177 Ginger' },
      { image: 'page036_img05_306x306.jpeg', label: '237 Brushed Nickel' },
      { image: 'page036_img06_306x306.jpeg', label: '242 Venetian' },
      { image: 'page036_img07_306x306.jpeg', label: '269 Chenille' },
      { image: 'page036_img08_306x306.jpeg', label: '302 Bamboo Silk' },
      { image: 'page036_img09_306x306.jpeg', label: '369 Russet' },
      { image: 'page036_img10_306x306.jpeg', label: '390 Sweet Chocolate' },
      { image: 'page036_img11_306x306.jpeg', label: '391 Tender Taupe' },
      { image: 'page036_img12_306x306.jpeg', label: '449 Oak' },
      { image: 'page036_img13_306x306.jpeg', label: '679 Ash' },
      { image: 'page036_img14_306x306.jpeg', label: '756 Brown Bread' },
      { image: 'page036_img15_306x306.jpeg', label: '901 Riding Boot' },
      { image: 'page036_img16_306x306.jpeg', label: '993 Antique White' },
      { image: 'page036_img17_306x306.jpeg', label: '2102 Lily' },
      { image: 'page036_img18_306x306.jpeg', label: '2103 Meringue' },
      { image: 'page036_img19_306x306.jpeg', label: '2104 Heavy Cream' },
      { image: 'page036_img20_306x306.jpeg', label: '2105 Pale Moon' },
      { image: 'page036_img21_306x306.jpeg', label: '2106 Shiplap' },
      { image: 'page036_img22_306x306.jpeg', label: '2107 Magnolia' },
      { image: 'page036_img23_306x306.jpeg', label: '2108 Opaline' },
      { image: 'page036_img24_306x306.jpeg', label: '2110 Cloud Cover' },
      { image: 'page036_img25_306x306.jpeg', label: '2111 Cashmere' },
      { image: 'page036_img26_306x306.jpeg', label: '2112 Heirloom' },
      { image: 'page036_img27_306x306.jpeg', label: '2113 Icicle' },
      { image: 'page036_img28_306x306.jpeg', label: '2116 Mohair' },
      { image: 'page036_img29_306x306.jpeg', label: '2117 Silvery Moon' },
      { image: 'page036_img30_306x306.jpeg', label: '2118 Nickel' },
      { image: 'page036_img31_306x306.jpeg', label: '2119 Dapple Gray' },
      { image: 'page036_img32_306x306.jpeg', label: '2121 Boulevard' },
      { image: 'page036_img33_306x306.jpeg', label: '2123 Nutshell' },
      { image: 'page036_img34_306x306.jpeg', label: '2124 Waffle Cone' },
      { image: 'page036_img35_306x306.jpeg', label: '2134 Pinstripe' },
      { image: 'page036_img36_306x306.jpeg', label: '2136 Iron Gate' },
      { image: 'page036_img37_306x306.jpeg', label: '2139 Pencil Sketch' },
      { image: 'page036_img38_306x306.jpeg', label: '2140 Flaxen' },
    ],
  },

  // ======== Decorative Tapes (page 37, 18 unique chips) \u2014 stored in edgeBanding slot ========
  edgeBanding: {
    title: 'Decorative Tapes',
    colors: [
      { image: 'page037_img01_74x74.jpeg', label: '048 Black' },
      { image: 'page037_img02_74x74.jpeg', label: '064 Bronze' },
      { image: 'page037_img03_74x74.jpeg', label: '082 Camel' },
      { image: 'page037_img04_74x74.jpeg', label: '143 Smokey Beige' },
      { image: 'page037_img05_74x74.jpeg', label: '165 Maritime White' },
      { image: 'page037_img06_74x74.jpeg', label: '293 Bordeaux' },
      { image: 'page037_img07_74x74.jpeg', label: '302 Taupe' },
      { image: 'page037_img08_74x74.jpeg', label: '336 Chestnut' },
      { image: 'page037_img09_74x74.jpeg', label: '378 Sable' },
      { image: 'page037_img10_74x74.jpeg', label: '450 White' },
      { image: 'page037_img11_74x74.jpeg', label: '614 Ivory' },
      { image: 'page037_img12_74x74.jpeg', label: '685 Indigo' },
      { image: 'page037_img13_74x74.jpeg', label: '700 Pier' },
      { image: 'page037_img14_74x74.jpeg', label: '830 Almond' },
      { image: 'page037_img15_74x74.jpeg', label: '850 City Loft' },
      { image: 'page037_img16_74x74.jpeg', label: '861 Merino Sweater' },
      { image: 'page037_img17_74x74.jpeg', label: '867 Aged Gray' },
      { image: 'page037_img18_74x74.jpeg', label: '973 Antique White' },
    ],
  },

  // ======== Swatch Collections (unchanged) ========
  swatchCollections: [
    {
      name: 'Fabrics',
      swatches: [
        { image: 'page038_img01_1430x2410.jpeg', colorName: 'EXTREME WHITE', specs: ['SALT BOX', '794 (2" & 2\u00bd" Flat)'] },
        { image: 'page038_img02_1430x2410.jpeg', colorName: 'EXTREME WHITE', specs: ['984 (2" & 2\u00bd" Bevel/Flat)', '794 (2" & 2\u00bd" Flat)', '1'] },
        { image: 'page039_img01_1430x2410.jpeg', colorName: 'ARCTIC SNOW TEXTURED', specs: ['ARCTIC SNOW', '971 (2" & 2\u00bd" Bevel/Flat)'] },
        { image: 'page039_img02_1430x2410.jpeg', colorName: 'ARCTIC SNOW TEXTURED', specs: ['977 (2")', '971 (2" & 2\u00bd" Bevel/Flat)', '2'] },
        { image: 'page040_img01_1430x2410.jpeg', colorName: 'PORCELAIN', specs: ['972 (2" & 2\u00bd" Bevel/Flat)', 'PORCELAIN TEXTURED'] },
        { image: 'page040_img02_1430x2410.jpeg', colorName: '972 (2" & 2\u00bd" Bevel/Flat)', specs: ['PORCELAIN TEXTURED', '978 (2")', '3'] },
        { image: 'page041_img01_1430x2410.jpeg', colorName: 'MONTEREY WHITE', specs: ['791 (2" & 2\u00bd" Flat)', 'QUARTZ'] },
        { image: 'page041_img02_1430x2410.jpeg', colorName: '791 (2" & 2\u00bd" Flat)', specs: ['QUARTZ', '3100 (2" & 2\u00bd" Flat)', '4'] },
        { image: 'page042_img01_1430x2410.jpeg', colorName: 'WHITE BIRCH', specs: ['SUGAR PINE', '973 (2" & 2\u00bd" Bevel/Flat)'] },
        { image: 'page042_img02_1430x2410.jpeg', colorName: 'WHITE BIRCH', specs: ['970 (2" & 2\u00bd" Bevel)', '973 (2" & 2\u00bd" Bevel/Flat)', '5'] },
        { image: 'page043_img01_1430x2410.jpeg', colorName: 'FRENCH VANILLA', specs: ['WINTER WHITE', '975 (2" & 2\u00bd" Bevel)'] },
        { image: 'page043_img02_1430x2410.jpeg', colorName: 'FRENCH VANILLA', specs: ['976 (2" & 2\u00bd" Bevel)', '975 (2" & 2\u00bd" Bevel)', '6'] },
        { image: 'page044_img01_1430x2410.jpeg', colorName: 'PEPPERCORN', specs: ['3101 (2")', 'STONE HARBOR'] },
        { image: 'page044_img02_1430x2410.jpeg', colorName: '3101 (2")', specs: ['STONE HARBOR', '3104 (2")', '7'] },
        { image: 'page045_img01_1430x2410.jpeg', colorName: 'DECO GRAY', specs: ['952 (2")', 'PASHMINA'] },
        { image: 'page045_img02_1430x2410.jpeg', colorName: '952 (2")', specs: ['PASHMINA', '3102 (2")', '8'] },
        { image: 'page046_img01_1430x2410.jpeg', colorName: 'WEATHERED WHITE', specs: ['932 (2")', 'PEARLITE'] },
        { image: 'page046_img02_1430x2410.jpeg', colorName: '932 (2")', specs: ['PEARLITE', '3103 (2")', '9'] },
        { image: 'page047_img01_1430x2410.jpeg', colorName: 'SILVER LINING', specs: ['950 (2")', 'BEACH HOUSE'] },
        { image: 'page047_img02_1430x2410.jpeg', colorName: '950 (2")', specs: ['BEACH HOUSE', '953 (2")', '10'] },
        { image: 'page048_img01_1430x2410.jpeg', colorName: 'MAPLE TOFFEE', specs: ['940 (2")', 'MOCHA'] },
        { image: 'page048_img02_1430x2410.jpeg', colorName: '940 (2")', specs: ['MOCHA', '936 (2")', '11'] },
        { image: 'page049_img01_1430x2410.jpeg', colorName: 'PRALINE', specs: ['937 (2")', 'ENGLISH WALNUT'] },
        { image: 'page049_img02_1430x2410.jpeg', colorName: '937 (2")', specs: ['ENGLISH WALNUT', '945 (2")', '12'] },
        { image: 'page050_img01_1430x2410.jpeg', colorName: 'SNOWFALL', specs: ['3114 (2")', 'SAND DOLLAR'] },
        { image: 'page050_img02_1430x2410.jpeg', colorName: '3114 (2")', specs: ['SAND DOLLAR', '3116 (2")', '13'] },
        { image: 'page051_img01_1430x2410.jpeg', colorName: 'MORNING FOG', specs: ['3115 (2")', 'WINDSWEPT'] },
        { image: 'page051_img02_1430x2410.jpeg', colorName: '3115 (2")', specs: ['WINDSWEPT', '3112 (2")', '14'] },
        { image: 'page052_img01_1430x2410.jpeg', colorName: 'ALMONDINE', specs: ['3113 (2")', 'AMHERST'] },
        { image: 'page052_img02_1430x2410.jpeg', colorName: '3113 (2")', specs: ['AMHERST', '3111 (2")', '15'] },
        { image: 'page053_img01_1430x2410.jpeg', colorName: 'FEATHER DOWN', specs: ['2101 (2")', 'SHORTBREAD'] },
        { image: 'page053_img02_1430x2410.jpeg', colorName: '2101 (2")', specs: ['SHORTBREAD', '2142 (2")', '16'] },
        { image: 'page054_img01_1430x2410.jpeg', colorName: 'ACADIA WHITE', specs: ['3108 (2\u00bd")', 'LATTICE'] },
        { image: 'page054_img02_1430x2410.jpeg', colorName: '3108 (2\u00bd")', specs: ['LATTICE', '3105 (2\u00bd")', '17'] },
        { image: 'page055_img01_1430x2410.jpeg', colorName: 'POLISHED SILVER', specs: ['3107 (2\u00bd")', 'HAZELWOOD'] },
        { image: 'page055_img02_1430x2410.jpeg', colorName: '3107 (2\u00bd")', specs: ['HAZELWOOD', '3117 (2\u00bd")', '18'] },
        { image: 'page056_img01_1430x2410.jpeg', colorName: 'EQUESTRIAN', specs: ['3106 (2\u00bd")', 'CHATEAU'] },
        { image: 'page056_img02_1430x2410.jpeg', colorName: '3106 (2\u00bd")', specs: ['CHATEAU', '3109 (2\u00bd")', '19'] },
        { image: 'page057_img01_1430x2410.jpeg', colorName: 'HEARTH', specs: ['3110 (2\u00bd")'] },
        { image: 'page058_img01_1430x2410.jpeg', colorName: 'SEA SALT', specs: ['989 (2")', 'PLATINUM WASH'] },
        { image: 'page058_img02_1430x2410.jpeg', colorName: '989 (2")', specs: ['PLATINUM WASH', '991 (2")', '21'] },
        { image: 'page059_img01_1430x2410.jpeg', colorName: 'VINTAGE GRAY', specs: ['994 (2")', 'WET PAVEMENT'] },
        { image: 'page059_img02_1430x2410.jpeg', colorName: '994 (2")', specs: ['WET PAVEMENT', '993 (2")', '22'] },
        { image: 'page060_img01_1430x2410.jpeg', colorName: 'CARAMEL', specs: ['987 (2")', 'AVALANCHE'] },
        { image: 'page060_img02_1430x2410.jpeg', colorName: '987 (2")', specs: ['AVALANCHE', '959 (2")', '23'] },
        { image: 'page061_img01_1430x2410.jpeg', colorName: 'PICKET FENCE', specs: ['960 (2")', 'PICKET FENCE TEXTURED'] },
        { image: 'page061_img02_1430x2410.jpeg', colorName: '960 (2")', specs: ['PICKET FENCE TEXTURED', '964 (2")', '24'] },
        { image: 'page062_img01_1430x2410.jpeg', colorName: 'WILLOW', specs: ['904 (2")', 'ECRU'] },
        { image: 'page062_img02_1430x2410.jpeg', colorName: '904 (2")', specs: ['ECRU', '961 (2")', '25'] },
        { image: 'page063_img01_1430x2410.jpeg', colorName: 'ECRU TEXTURED', specs: ['965 (2")', 'FARMHOUSE'] },
        { image: 'page063_img02_1430x2410.jpeg', colorName: '965 (2")', specs: ['FARMHOUSE', '902 (2")', '26'] },
        { image: 'page064_img01_1430x2410.jpeg', colorName: 'JOURNAL WHITE', specs: ['962 (2")', 'WHITE PEPPER'] },
        { image: 'page064_img02_1430x2410.jpeg', colorName: '962 (2")', specs: ['WHITE PEPPER', '903 (2")', '27'] },
        { image: 'page065_img01_1430x2410.jpeg', colorName: 'SAHARA', specs: ['963 (2")', 'GRANITE DUST'] },
        { image: 'page065_img02_1430x2410.jpeg', colorName: '963 (2")', specs: ['GRANITE DUST', '905 (2")', '28'] },
        { image: 'page066_img01_1430x2410.jpeg', colorName: 'COTTAGE PINE', specs: ['869 (2" & 2\u00bd")', 'GOLDEN OAK'] },
        { image: 'page066_img02_1430x2410.jpeg', colorName: '869 (2" & 2\u00bd")', specs: ['GOLDEN OAK', '804 (2" & 2\u00bd")', '29'] },
        { image: 'page067_img01_1430x2410.jpeg', colorName: 'HICKORY', specs: ['466 (2" & 2\u00bd")', 'HARVEST'] },
        { image: 'page067_img02_1430x2410.jpeg', colorName: '466 (2" & 2\u00bd")', specs: ['HARVEST', '616 (2" & 2\u00bd")', '30'] },
        { image: 'page068_img01_1430x2410.jpeg', colorName: 'FRUITWOOD', specs: ['467 (2" & 2\u00bd")', 'WARM CHERRY'] },
        { image: 'page068_img02_1430x2410.jpeg', colorName: '467 (2" & 2\u00bd")', specs: ['WARM CHERRY', '870 (2" & 2\u00bd")', '31'] },
        { image: 'page069_img01_1430x2410.jpeg', colorName: 'PRAIRIE', specs: ['489 (2" & 2\u00bd")', 'THOROUGHBRED'] },
        { image: 'page069_img02_1430x2410.jpeg', colorName: '489 (2" & 2\u00bd")', specs: ['THOROUGHBRED', '636 (2" & 2\u00bd")', '32'] },
        { image: 'page070_img01_1430x2410.jpeg', colorName: 'MISSION OAK', specs: ['480 (2" & 2\u00bd")', 'TUSCANY'] },
        { image: 'page070_img02_1430x2410.jpeg', colorName: '480 (2" & 2\u00bd")', specs: ['TUSCANY', '618 (2" & 2\u00bd")', '33'] },
        { image: 'page071_img01_1430x2410.jpeg', colorName: 'ALLSPICE', specs: ['423 (2" & 2\u00bd")', 'ESPRESSO'] },
        { image: 'page071_img02_1430x2410.jpeg', colorName: '423 (2" & 2\u00bd")', specs: ['ESPRESSO', '471 (2" & 2\u00bd")', '34'] },
        { image: 'page072_img01_1430x2410.jpeg', colorName: 'FINE CHINA', specs: ['427 (2" & 2\u00bd")', 'VIVID WHITE'] },
        { image: 'page072_img02_1430x2410.jpeg', colorName: '427 (2" & 2\u00bd")', specs: ['VIVID WHITE', '867 (2" & 2\u00bd")', '35'] },
        { image: 'page073_img01_1430x2410.jpeg', colorName: 'DISTINCTLY WHITE', specs: ['450 (2" & 2\u00bd")', 'BRIGHT WHITE'] },
        { image: 'page073_img02_1430x2410.jpeg', colorName: '450 (2" & 2\u00bd")', specs: ['BRIGHT WHITE', '801 (2" & 2\u00bd")', '36'] },
        { image: 'page074_img01_1430x2410.jpeg', colorName: 'TUDOR CREAM', specs: ['424 (2" & 2\u00bd")', 'COTTONWOOD'] },
        { image: 'page074_img02_1430x2410.jpeg', colorName: '424 (2" & 2\u00bd")', specs: ['COTTONWOOD', '453 (2" & 2\u00bd")', '37'] },
        { image: 'page075_img01_1430x2410.jpeg', colorName: 'DESIGNER WHITE', specs: ['451 (2" & 2\u00bd")', 'LINEN'] },
        { image: 'page075_img02_1430x2410.jpeg', colorName: '451 (2" & 2\u00bd")', specs: ['LINEN', '809 (2" & 2\u00bd")', '38'] },
        { image: 'page076_img01_1430x2410.jpeg', colorName: 'EGGSHELL', specs: ['808 (2" & 2\u00bd")', 'LAMB\'S WOOL'] },
        { image: 'page076_img02_1430x2410.jpeg', colorName: '808 (2" & 2\u00bd")', specs: ['LAMB\'S WOOL', '426 (2" & 2\u00bd")', '39'] },
        { image: 'page077_img01_1430x2410.jpeg', colorName: 'GALLERY GRAY', specs: ['417 (2" & 2\u00bd")', 'BLACK'] },
        { image: 'page077_img02_1430x2410.jpeg', colorName: '417 (2" & 2\u00bd")', specs: ['BLACK', '112 (2" & 2\u00bd")', '40'] },
        { image: 'page078_img01_1430x2410.jpeg', colorName: 'GRANDFATHER CLOCK', specs: ['3332 (2")', 'MOLASSES'] },
        { image: 'page078_img02_1430x2410.jpeg', colorName: '3332 (2")', specs: ['MOLASSES', '3333 (2")', '41'] },
        { image: 'page079_img01_1430x2410.jpeg', colorName: 'DERBY', specs: ['2133 (2")', 'COSMOPOLITAN'] },
        { image: 'page079_img02_1430x2410.jpeg', colorName: '2133 (2")', specs: ['COSMOPOLITAN', '3331 (2")', '42'] },
        { image: 'page080_img01_1430x2410.jpeg', colorName: 'ASHWOOD', specs: ['2136 (2")', 'BARNWOOD'] },
        { image: 'page080_img02_1430x2410.jpeg', colorName: '2136 (2")', specs: ['BARNWOOD', '2137 (2")', '43'] },
        { image: 'page081_img01_1430x2410.jpeg', colorName: 'ESSEX GRAY', specs: ['3330 (2")', 'ROCKY COAST'] },
        { image: 'page081_img02_1430x2410.jpeg', colorName: '3330 (2")', specs: ['ROCKY COAST', '2138 (2")', '44'] },
        { image: 'page082_img01_1430x2410.jpeg', colorName: 'SKYLARK', specs: ['2140 (2")', 'CLEAN CANVAS'] },
        { image: 'page082_img02_1430x2410.jpeg', colorName: '2140 (2")', specs: ['CLEAN CANVAS', '2141 (2")', '45'] },
        { image: 'page083_img01_1430x2410.jpeg', colorName: 'MARSHMALLOW', specs: ['2143 (2")'] },
        { image: 'page084_img01_1430x2410.jpeg', colorName: 'CAST IRON', specs: ['3326 (2")', 'NIGHTINGALE'] },
        { image: 'page084_img02_1430x2410.jpeg', colorName: '3326 (2")', specs: ['NIGHTINGALE', '3325 (2")', '47'] },
        { image: 'page085_img01_1430x2410.jpeg', colorName: 'COBBLESTONE', specs: ['3324 (2")', 'ELEMENTAL'] },
        { image: 'page085_img02_1430x2410.jpeg', colorName: '3324 (2")', specs: ['ELEMENTAL', '3328 (2")', '48'] },
        { image: 'page086_img01_1430x2410.jpeg', colorName: 'SEA HAZE', specs: ['3323 (2")', 'PANNA COTTA'] },
        { image: 'page086_img02_1430x2410.jpeg', colorName: '3323 (2")', specs: ['PANNA COTTA', '3329 (2")', '49'] },
        { image: 'page087_img01_1430x2410.jpeg', colorName: 'LUMINARY', specs: ['3327 (2")'] },
        { image: 'page088_img01_1430x2410.jpeg', colorName: 'SPUN COTTON', specs: ['3317 (2")', 'SUN WASHED'] },
        { image: 'page088_img02_1430x2410.jpeg', colorName: '3317 (2")', specs: ['SUN WASHED', '3319 (2")', '51'] },
        { image: 'page089_img01_1430x2410.jpeg', colorName: 'PIEDMONT', specs: ['3321 (2")', 'DOVE WING'] },
        { image: 'page089_img02_1430x2410.jpeg', colorName: '3321 (2")', specs: ['DOVE WING', '3322 (2")', '52'] },
        { image: 'page090_img01_1430x2410.jpeg', colorName: 'MAGNETIC', specs: ['3320 (2")', 'NOMAD'] },
        { image: 'page090_img02_1430x2410.jpeg', colorName: '3320 (2")', specs: ['NOMAD', '3318 (2")', '53'] },
        { image: 'page091_img01_1430x2410.jpeg', colorName: 'WHITE SAND', specs: ['217 (2")', 'NORDIC'] },
        { image: 'page091_img02_1430x2410.jpeg', colorName: '217 (2")', specs: ['NORDIC', '3303 (2")', '54'] },
        { image: 'page092_img01_1430x2410.jpeg', colorName: 'CYPRESS', specs: ['3304 (2")', 'FLAXEN'] },
        { image: 'page092_img02_1430x2410.jpeg', colorName: '3304 (2")', specs: ['FLAXEN', '3305 (2")', '55'] },
        { image: 'page093_img01_1430x2410.jpeg', colorName: 'SPARROW', specs: ['3302 (2")', 'POND STONE'] },
        { image: 'page093_img02_1430x2410.jpeg', colorName: '3302 (2")', specs: ['POND STONE', '216 (2")', '56'] },
        { image: 'page094_img01_1430x2410.jpeg', colorName: 'METEORITE', specs: ['3301 (2")', 'CHARCOAL'] },
        { image: 'page094_img02_1430x2410.jpeg', colorName: '3301 (2")', specs: ['CHARCOAL', '3306 (2")', '57'] },
        { image: 'page095_img01_1430x2410.jpeg', colorName: 'CULINARY CREAM', specs: ['223 (2")', 'STEAMED VANILLA'] },
        { image: 'page095_img02_1430x2410.jpeg', colorName: '223 (2")', specs: ['STEAMED VANILLA', '224 (2")', '58'] },
        { image: 'page096_img01_1430x2410.jpeg', colorName: 'WHITE TRUFFLE', specs: ['221 (2")', 'WHITE TIE'] },
        { image: 'page096_img02_1430x2410.jpeg', colorName: '221 (2")', specs: ['WHITE TIE', '222 (2")', '59'] },
      ],
    },
  ],

  cellSize: null,
  opacity: null,
  liner: null,
}
