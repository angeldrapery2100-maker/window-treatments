/**
 * Vignette® Modern Roman Shades - Layout data
 * Contemporary Roman shades with consistent folds and no exposed rear cords
 * 107 pages, swatch pages 52-107 (19 fabric collections, 112 colors)
 */

import type { SectionLayout, SwatchCollection } from './applause-layout'

export interface VignetteLayout {
  slug: string
  name: string
  description: string
  heroImage: string
  heroLabel: string
  sections: SectionLayout[]
  gallery: { image: string; text: string; label: string }[]
  hardwareColors: SectionLayout | null
  swatchCollections: SwatchCollection[]
}

export const vignetteLayout: VignetteLayout = {
  slug: 'vignette',
  name: 'Vignette® Modern Roman Shades',
  description: 'Vignette® Modern Roman Shades feature consistent folds with no exposed rear cords, creating a clean, tailored look in both raised and lowered positions.',

  heroImage: 'page006_img01_5859x3009.jpeg',
  heroLabel: '',

  sections: [
    // ──── Scene Pairs ────
    {
      type: 'scene-pair',
      scenes: [
        { image: 'page007_img01_5991x3010.jpeg', text: 'Vignette® Modern Roman Shades are a contemporary update to the classic Roman shade with a clean, crisp appearance and no exposed rear cords.', label: '' },
        { image: 'page008_img01_5990x3015.jpeg', text: 'The Duolite® design option layers a front sheer or light-filtering fabric with a room-darkening panel for flexible light control and privacy.', label: '' },
        { image: 'page015_img01_5991x3010.jpeg', text: 'Layer Vignette® shades with coordinating Design Studio™ drapery to add texture and personal style to your windows.', label: '' },
        { image: 'page016_img01_5991x3010.jpeg', text: 'As part of The Whole House Solution™, Vignette® fabrics can be coordinated with Duette® Honeycomb Shades across rooms.', label: '' },
      ],
    },

    // ──── Benefits (page 17, 8 cards 4×2) ────
    {
      type: 'card-grid',
      title: 'Benefits',
      cols: 4,
      cards: [
        { image: 'page017_img03_1527x872.jpeg', title: 'Richly Woven Fabrics', desc: 'From exquisite silks to textured tweeds, Vignette® fabrics are offered in on-trend colors that complement every design style.' },
        { image: 'page017_img04_1528x872.jpeg', title: 'Safer for Children and Pets', desc: 'Designed with safety in mind, Vignette shades do not have any exposed rear cords.' },
        { image: 'page017_img05_1524x872.jpeg', title: 'Versatility', desc: 'Choose from two Roman fold styles. Flat fold and full fold shades can roll into the headrail, and full fold can also stack when raised.' },
        { image: 'page017_img06_1529x872.jpeg', title: 'Responsibly Designed', desc: 'Vignette® shades are GREENGUARD certified for low indoor chemical emissions and rated by AERC for energy-efficiency benefits.' },
        { image: 'page017_img07_1528x872.jpeg', title: 'Uniform, Clean Appearance', desc: 'Vignette shades are precision engineered for an uncluttered street-side appearance.' },
        { image: 'page017_img08_1528x872.jpeg', title: 'Low Maintenance', desc: 'All Vignette fabrics are durable, maintain their beauty over time and require minimal fabric dressing.' },
        { image: 'page017_img09_1521x869.jpeg', title: 'Increased Privacy', desc: 'When fully lowered, rolling style shades kick back toward the window for added privacy.' },
        { image: 'page017_img10_1526x872.jpeg', title: 'Quick Delivery', desc: 'Your Hunter Douglas shades are made to measure and delivered within days.' },
      ],
    },

    // ──── Energy Efficiency (page 18, 4 cards) ────
    {
      type: 'card-grid',
      title: 'Energy Efficiency',
      cols: 4,
      cards: [
        { image: 'page018_img02_1529x867.jpeg', title: 'Live Comfortably in Any Climate', desc: '' },
        { image: 'page018_img03_1528x872.jpeg', title: 'Year-Round Temperature Control', desc: '' },
        { image: 'page018_img06_1529x872.jpeg', title: 'Lower Energy Demand', desc: '' },
        { image: 'page018_img07_1528x872.jpeg', title: 'Soft Natural Light', desc: '' },
      ],
    },

    // ──── Style Comparison (page 20, 4 items) ────
    {
      type: 'comparison-grid',
      title: 'Style Comparison',
      cols: 2,
      items: [
        { image: 'page020_img02_1528x910.jpeg', label: 'Sheer', sublabel: 'Provides the most natural light and view-through with minimal privacy.' },
        { image: 'page020_img03_1528x910.jpeg', label: 'Light Filtering', sublabel: 'Gently filters light and offers moderate privacy.' },
        { image: 'page020_img04_1529x909.jpeg', label: 'Room Darkening', sublabel: 'Blocks most incoming light with maximum privacy.' },
        { image: 'page020_img05_1528x910.jpeg', label: 'Duolite® Dual Opacity Design Option', sublabel: 'Blocks majority of light when desired with a room-darkening panel that operates sequentially with a sheer or light-filtering face fabric.' },
      ],
    },

    // ──── PowerView and Operating Systems (page 21) ────
    {
      type: 'comparison-grid',
      title: 'PowerView and Operating Systems',
      cols: 4,
      items: [
        { image: 'page021_img04_504x990.jpeg', label: 'PowerView® Automation', sublabel: 'Achieve your perfect light automatically—morning, noon and night.' },
        { image: 'page021_img05_637x1811.jpeg', label: 'LiteRise®', sublabel: 'Cordless manual operation for premium child and pet safety.' },
        { image: 'page021_img06_637x1812.jpeg', label: 'UltraGlide®', sublabel: 'A single retractable wand for enhanced child safety.' },
        { image: 'page021_img07_637x1812.jpeg', label: 'EasyRise™', sublabel: 'A continuous cord loop system with cord tensioner.' },
      ],
    },

    // ──── Design Options (page 23, 7 cards) ────
    {
      type: 'card-grid',
      title: 'Design Options',
      cols: 4,
      cards: [
        { image: 'page023_img03_1528x909.jpeg', title: 'Top-Down/Bottom-Up', desc: 'The shade can be opened from the top or bottom for a greater range of light control. Available in 4" full fold stacking style in all opacities.' },
        { image: 'page023_img04_1528x905.jpeg', title: 'Specialty Shapes', desc: 'From arches to angles, Vignette® shades can cover many specialty shapes. They are non-operable and available exclusively as inside mount.' },
        { image: 'page023_img05_1529x910.jpeg', title: 'Accents by the Yard™', desc: 'Every Vignette fabric is offered as cut yardage, so you can create coordinating home accents like pillows and duvets.' },
        { image: 'page023_img06_1528x910.jpeg', title: 'Duolite®', desc: 'The Vignette® Duolite front shade and room-darkening back panel both roll into a single headrail for the ultimate in light control and privacy.' },
        { image: 'page023_img07_1528x909.jpeg', title: 'Two-On-One Headrail', desc: 'Two independently operated shades can share the same headrail. Available in rolling and stacking styles.' },
        { image: 'page023_img08_1529x909.jpeg', title: '4" Full Fold', desc: 'This design features soft, cascading fabric folds. Available in rolling and stacking styles.' },
        { image: 'page023_img09_1528x909.jpeg', title: '6" Flat Fold', desc: 'This design features non-dimensional fabric folds. Available exclusively in rolling style.' },
      ],
    },

    // ──── Mounting Profiles (page 24) ────
    {
      type: 'mounting-grid',
      title: 'Mounting Profiles',
      rows: [
        {
          items: [
            { image: 'page024_img03_959x609.jpeg', label: 'Fully Recessed (Rolling)' },
            { image: 'page024_img04_959x609.jpeg', label: 'Fully Recessed (Stacking)' },
            { image: 'page024_img05_959x609.jpeg', label: 'Partially Recessed (Rolling)' },
          ],
        },
        {
          items: [
            { image: 'page024_img06_959x609.jpeg', label: 'Partially Recessed (Stacking)' },
            { image: 'page024_img07_959x609.jpeg', label: 'Outside Mount (Rolling)' },
            { image: 'page024_img08_959x609.jpeg', label: 'Outside Mount (Stacking)' },
          ],
        },
      ],
    },
  ],

  // ──── Gallery ────
  gallery: [
    { image: 'page005_img02_1959x3009.jpeg', text: '', label: '' },
    { image: 'page010_img01_3909x3012.jpeg', text: '', label: '' },
    { image: 'page011_img01_7810x3009.jpeg', text: '', label: '' },
    { image: 'page012_img01_3909x3009.jpeg', text: '', label: '' },
    { image: 'page013_img01_2820x1623.jpeg', text: '', label: '' },
    { image: 'page014_img01_5234x3010.jpeg', text: '', label: '' },
    { image: 'page020_img01_3909x3010.jpeg', text: '', label: '' },
  ],

  hardwareColors: null,

  // ──── 19 Swatch Collections (pages 52-107) ────
  swatchCollections: [
    {
      name: 'Alustra® Elysian™',
      swatches: [
        { image: 'page052_img01_705x1039.jpeg', colorName: 'Beyond', specs: ['Sheer E22S-1189', 'Light Filtering E22-1189', 'Room Darkening ZE22-1189'] },
        { image: 'page052_img02_705x1039.jpeg', colorName: 'Demure', specs: ['Sheer E22S-1189', 'Light Filtering E22-1189', 'Room Darkening ZE22-1189'] },
        { image: 'page053_img01_705x1039.jpeg', colorName: 'Petrichor', specs: ['Sheer E22S-1191', 'Light Filtering E22-1191', 'Room Darkening ZE22-1191'] },
        { image: 'page053_img02_705x1039.jpeg', colorName: 'Sonder', specs: ['Sheer E22S-1191', 'Light Filtering E22-1191', 'Room Darkening ZE22-1191'] },
        { image: 'page054_img01_705x1039.jpeg', colorName: 'Sirimiri', specs: ['Sheer E22S-1193', 'Light Filtering E22-1193', 'Room Darkening ZE22-1193'] },
        { image: 'page054_img02_705x1039.jpeg', colorName: 'Ghataa', specs: ['Sheer E22S-1193', 'Light Filtering E22-1193', 'Room Darkening ZE22-1193'] },
      ],
    },
    {
      name: 'Alustra® Idyllic™',
      swatches: [
        { image: 'page055_img01_705x1039.jpeg', colorName: 'Mejuri', specs: ['Sheer I22S-1196', 'Light Filtering I22-1196', 'Room Darkening ZI22-1196'] },
        { image: 'page055_img02_705x1039.jpeg', colorName: 'Mangata', specs: ['Sheer I22S-1196', 'Light Filtering I22-1196', 'Room Darkening ZI22-1196'] },
        { image: 'page056_img01_705x1039.jpeg', colorName: 'Sarang', specs: ['Sheer I22S-1198', 'Light Filtering I22-1198', 'Room Darkening ZI22-1198'] },
        { image: 'page056_img02_705x1039.jpeg', colorName: 'Meraki', specs: ['Sheer I22S-1198', 'Light Filtering I22-1198', 'Room Darkening ZI22-1198'] },
        { image: 'page057_img01_705x1039.jpeg', colorName: 'Norri', specs: ['Sheer I22S-1195', 'Light Filtering I22-1195', 'Room Darkening ZI22-1195'] },
        { image: 'page057_img02_705x1039.jpeg', colorName: 'Sundar', specs: ['Sheer I22S-1195', 'Light Filtering I22-1195', 'Room Darkening ZI22-1195'] },
      ],
    },
    {
      name: 'Alustra® Silk Road™',
      swatches: [
        { image: 'page058_img01_705x1039.jpeg', colorName: 'Steppe', specs: ['Sheer J30S-750', 'Light Filtering J30-750', 'Room Darkening ZJ30-750'] },
        { image: 'page058_img02_705x1039.jpeg', colorName: 'Petra', specs: ['Sheer J30S-750', 'Light Filtering J30-750', 'Room Darkening ZJ30-750'] },
        { image: 'page059_img01_705x1039.jpeg', colorName: 'Kingdom', specs: ['Sheer J30S-752', 'Light Filtering J30-752', 'Room Darkening ZJ30-752'] },
        { image: 'page059_img02_705x1039.jpeg', colorName: 'Asha', specs: ['Sheer J30S-752', 'Light Filtering J30-752', 'Room Darkening ZJ30-752'] },
        { image: 'page060_img01_705x1039.jpeg', colorName: 'Sari', specs: ['Sheer J30S-1157', 'Light Filtering J30-1157', 'Room Darkening ZJ30-1157'] },
        { image: 'page060_img02_705x1039.jpeg', colorName: 'Keeva', specs: ['Sheer J30S-1157', 'Light Filtering J30-1157', 'Room Darkening ZJ30-1157'] },
      ],
    },
    {
      name: 'Loren™',
      swatches: [
        { image: 'page061_img01_705x1039.jpeg', colorName: 'Summer Mist', specs: ['Sheer G22S-1164', 'Light Filtering G22-1164', 'Room Darkening ZG22-1164'] },
        { image: 'page061_img02_705x1039.jpeg', colorName: 'Coastal Calm', specs: ['Sheer G22S-1164', 'Light Filtering G22-1164', 'Room Darkening ZG22-1164'] },
        { image: 'page062_img01_705x1039.jpeg', colorName: 'Light Touch', specs: ['Sheer G22S-1166', 'Light Filtering G22-1166', 'Room Darkening ZG22-1166'] },
        { image: 'page062_img02_705x1039.jpeg', colorName: 'Misty Pebble', specs: ['Sheer G22S-1166', 'Light Filtering G22-1166', 'Room Darkening ZG22-1166'] },
        { image: 'page063_img01_705x1039.jpeg', colorName: 'Sea Stone', specs: ['Sheer G22S-1168', 'Light Filtering G22-1168', 'Room Darkening ZG22-1168'] },
        { image: 'page063_img02_705x1039.jpeg', colorName: 'Pleasant Gray', specs: ['Sheer G22S-1168', 'Light Filtering G22-1168', 'Room Darkening ZG22-1168'] },
      ],
    },
    {
      name: 'Leela™',
      swatches: [
        { image: 'page064_img01_705x1039.jpeg', colorName: 'Cloud', specs: ['Sheer L22S-740', 'Light Filtering L22-740', 'Room Darkening ZL22-740'] },
        { image: 'page064_img02_705x1039.jpeg', colorName: 'Illusion', specs: ['Sheer L22S-740', 'Light Filtering L22-740', 'Room Darkening ZL22-740'] },
        { image: 'page065_img01_705x1039.jpeg', colorName: 'Soft Rain', specs: ['Sheer L22S-1154', 'Light Filtering L22-1154', 'Room Darkening ZL22-1154'] },
        { image: 'page065_img02_705x1039.jpeg', colorName: 'Just Kissed', specs: ['Sheer L22S-1154', 'Light Filtering L22-1154', 'Room Darkening ZL22-1154'] },
        { image: 'page066_img01_705x1039.jpeg', colorName: 'Inspire', specs: ['Sheer L22S-743', 'Light Filtering L22-743', 'Room Darkening ZL22-743'] },
        { image: 'page066_img02_705x1039.jpeg', colorName: 'Escape', specs: ['Sheer L22S-743', 'Light Filtering L22-743', 'Room Darkening ZL22-743'] },
      ],
    },
    {
      name: 'Jewelstone™',
      swatches: [
        { image: 'page067_img01_705x1039.jpeg', colorName: 'Moonstone', specs: ['Sheer L52S-531', 'Light Filtering L52-531', 'Room Darkening ZL52-531'] },
        { image: 'page067_img02_705x1039.jpeg', colorName: 'Lunar Eclipse', specs: ['Sheer L52S-531', 'Light Filtering L52-531', 'Room Darkening ZL52-531'] },
        { image: 'page068_img01_705x1039.jpeg', colorName: 'Tourmaline', specs: ['Sheer L52S-1142', 'Light Filtering L52-1142', 'Room Darkening ZL52-1142'] },
        { image: 'page068_img02_705x1039.jpeg', colorName: 'Agate', specs: ['Sheer L52S-1142', 'Light Filtering L52-1142', 'Room Darkening ZL52-1142'] },
        { image: 'page069_img01_705x1039.jpeg', colorName: 'Dark Onyx', specs: ['Sheer L52S-1143', 'Light Filtering L52-1143', 'Room Darkening ZL52-1143'] },
        { image: 'page069_img02_705x1039.jpeg', colorName: 'Jet', specs: ['Sheer L52S-1143', 'Light Filtering L52-1143', 'Room Darkening ZL52-1143'] },
      ],
    },
    {
      name: 'Knox™',
      swatches: [
        { image: 'page070_img01_705x1039.jpeg', colorName: 'Wisp White', specs: ['Sheer K22S-1182', 'Light Filtering K22-1182', 'Room Darkening ZK22-1182'] },
        { image: 'page070_img02_705x1039.jpeg', colorName: 'Soft Neutral', specs: ['Sheer K22S-1182', 'Light Filtering K22-1182', 'Room Darkening ZK22-1182'] },
        { image: 'page071_img01_705x1039.jpeg', colorName: 'Aged Clay', specs: ['Sheer K22S-1184', 'Light Filtering K22-1184', 'Room Darkening ZK22-1184'] },
        { image: 'page071_img02_705x1039.jpeg', colorName: 'Simply Pewter', specs: ['Sheer K22S-1184', 'Light Filtering K22-1184', 'Room Darkening ZK22-1184'] },
        { image: 'page072_img01_705x1039.jpeg', colorName: 'Horizon Sky', specs: ['Sheer K22S-1186', 'Light Filtering K22-1186', 'Room Darkening ZK22-1186'] },
        { image: 'page072_img02_705x1039.jpeg', colorName: 'Classic Noir', specs: ['Sheer K22S-1186', 'Light Filtering K22-1186', 'Room Darkening ZK22-1186'] },
      ],
    },
    {
      name: 'Cambria™',
      swatches: [
        { image: 'page073_img01_705x1039.jpeg', colorName: 'Classic Linen', specs: ['Sheer A22S-1201', 'Light Filtering A22-1201', 'Room Darkening ZA22-1201'] },
        { image: 'page073_img02_705x1039.jpeg', colorName: 'Misty Grey', specs: ['Sheer A22S-1201', 'Light Filtering A22-1201', 'Room Darkening ZA22-1201'] },
        { image: 'page074_img01_705x1039.jpeg', colorName: 'Night Sky', specs: ['Sheer A22S-1203', 'Light Filtering A22-1203', 'Room Darkening ZA22-1203'] },
        { image: 'page074_img02_705x1039.jpeg', colorName: 'Just Right', specs: ['Sheer A22S-1203', 'Light Filtering A22-1203', 'Room Darkening ZA22-1203'] },
        { image: 'page075_img01_705x1039.jpeg', colorName: 'Natural Nude', specs: ['Sheer A22S-1205', 'Light Filtering A22-1205', 'Room Darkening ZA22-1205'] },
        { image: 'page075_img02_705x1039.jpeg', colorName: 'Earth Tone', specs: ['Sheer A22S-1205', 'Light Filtering A22-1205', 'Room Darkening ZA22-1205'] },
      ],
    },
    {
      name: 'Belfast Linen',
      swatches: [
        { image: 'page076_img01_705x1039.jpeg', colorName: 'Whitehall', specs: ['Sheer J16S-720', 'Light Filtering J16-720', 'Room Darkening ZJ16-720'] },
        { image: 'page076_img02_705x1039.jpeg', colorName: 'Ivory Lace', specs: ['Sheer J16S-720', 'Light Filtering J16-720', 'Room Darkening ZJ16-720'] },
        { image: 'page077_img01_705x1039.jpeg', colorName: 'Sandcastle', specs: ['Sheer J16S-722', 'Light Filtering J16-722', 'Room Darkening ZJ16-722'] },
        { image: 'page077_img02_705x1039.jpeg', colorName: 'Homespun', specs: ['Sheer J16S-722', 'Light Filtering J16-722', 'Room Darkening ZJ16-722'] },
        { image: 'page078_img01_705x1039.jpeg', colorName: 'Flax', specs: ['Sheer J16S-724', 'Light Filtering J16-724', 'Room Darkening ZJ16-724'] },
        { image: 'page078_img02_705x1039.jpeg', colorName: 'Silversea', specs: ['Sheer J16S-724', 'Light Filtering J16-724', 'Room Darkening ZJ16-724'] },
        { image: 'page079_img01_705x1039.jpeg', colorName: 'Mink', specs: ['Sheer J16S-726', 'Light Filtering J16-726', 'Room Darkening ZJ16-726'] },
        { image: 'page079_img02_705x1039.jpeg', colorName: 'Smooth Stone', specs: ['Sheer J16S-726', 'Light Filtering J16-726', 'Room Darkening ZJ16-726'] },
        { image: 'page080_img01_705x1039.jpeg', colorName: 'Summer Storm', specs: ['Sheer J16S-1136', 'Light Filtering J16-1136', 'Room Darkening ZJ16-1136'] },
      ],
    },
    {
      name: 'Linen Weave',
      swatches: [
        { image: 'page081_img01_705x1039.jpeg', colorName: 'Birch Bark', specs: ['Sheer J6S-141', 'Light Filtering J6-141', 'Room Darkening ZJ6-141'] },
        { image: 'page081_img02_705x1039.jpeg', colorName: 'Aspen Cream', specs: ['Sheer J6S-141', 'Light Filtering J6-141', 'Room Darkening ZJ6-141'] },
        { image: 'page082_img01_705x1039.jpeg', colorName: 'Beechnut', specs: ['Sheer J6S-144', 'Light Filtering J6-144', 'Room Darkening ZJ6-144'] },
        { image: 'page082_img02_705x1039.jpeg', colorName: 'Winterking', specs: ['Sheer J6S-144', 'Light Filtering J6-144', 'Room Darkening ZJ6-144'] },
        { image: 'page083_img01_705x1039.jpeg', colorName: 'Marshland', specs: ['Sheer J6S-146', 'Light Filtering J6-146', 'Room Darkening ZJ6-146'] },
        { image: 'page083_img02_705x1039.jpeg', colorName: 'Silver Pine', specs: ['Sheer J6S-146', 'Light Filtering J6-146', 'Room Darkening ZJ6-146'] },
      ],
    },
    {
      name: 'Caden',
      swatches: [
        { image: 'page084_img01_705x1039.jpeg', colorName: 'Stone Manor', specs: ['Sheer B22S-1158', 'Light Filtering B22-1158', 'Room Darkening ZB22-1158'] },
        { image: 'page084_img02_705x1039.jpeg', colorName: 'Pale Shadow', specs: ['Sheer B22S-1158', 'Light Filtering B22-1158', 'Room Darkening ZB22-1158'] },
        { image: 'page085_img01_705x1039.jpeg', colorName: 'Olde Harbour', specs: ['Sheer B22S-1160', 'Light Filtering B22-1160', 'Room Darkening ZB22-1160'] },
        { image: 'page085_img02_705x1039.jpeg', colorName: 'Soft Henley', specs: ['Sheer B22S-1160', 'Light Filtering B22-1160', 'Room Darkening ZB22-1160'] },
        { image: 'page086_img01_705x1039.jpeg', colorName: 'English Tweed', specs: ['Sheer B22S-1162', 'Light Filtering B22-1162', 'Room Darkening ZB22-1162'] },
        { image: 'page086_img02_705x1039.jpeg', colorName: 'Book Clothe', specs: ['Sheer B22S-1162', 'Light Filtering B22-1162', 'Room Darkening ZB22-1162'] },
      ],
    },
    {
      name: 'Cascade',
      swatches: [
        { image: 'page087_img01_705x1039.jpeg', colorName: 'Bridalveil', specs: ['Sheer J13S-701', 'Light Filtering J13-701', 'Room Darkening ZJ13-701'] },
        { image: 'page087_img02_705x1039.jpeg', colorName: 'Bashful', specs: ['Sheer J13S-701', 'Light Filtering J13-701', 'Room Darkening ZJ13-701'] },
        { image: 'page088_img01_705x1039.jpeg', colorName: 'Shimmer', specs: ['Sheer J13S-703', 'Light Filtering J13-703', 'Room Darkening ZJ13-703'] },
        { image: 'page088_img02_705x1039.jpeg', colorName: 'Contemplation', specs: ['Sheer J13S-703', 'Light Filtering J13-703', 'Room Darkening ZJ13-703'] },
        { image: 'page089_img01_705x1039.jpeg', colorName: 'Soft Whisper', specs: ['Sheer J13S-1139', 'Light Filtering J13-1139', 'Room Darkening ZJ13-1139'] },
        { image: 'page089_img02_705x1039.jpeg', colorName: 'Soothing Storm', specs: ['Sheer J13S-1139', 'Light Filtering J13-1139', 'Room Darkening ZJ13-1139'] },
      ],
    },
    {
      name: 'Brooklyn Tweed',
      swatches: [
        { image: 'page090_img01_705x1039.jpeg', colorName: 'Ivory Trellis', specs: ['Sheer L51S-551', 'Light Filtering L51-551', 'Room Darkening ZL51-551'] },
        { image: 'page090_img02_705x1039.jpeg', colorName: 'Almond Latte', specs: ['Sheer L51S-551', 'Light Filtering L51-551', 'Room Darkening ZL51-551'] },
        { image: 'page091_img01_705x1039.jpeg', colorName: 'Dream Weaver', specs: ['Sheer L51S-553', 'Light Filtering L51-553', 'Room Darkening ZL51-553'] },
        { image: 'page091_img02_705x1039.jpeg', colorName: 'Vintage Suede', specs: ['Sheer L51S-553', 'Light Filtering L51-553', 'Room Darkening ZL51-553'] },
        { image: 'page092_img01_705x1039.jpeg', colorName: 'Hudson Yard', specs: ['Sheer L51S-1146', 'Light Filtering L51-1146', 'Room Darkening ZL51-1146'] },
        { image: 'page092_img02_705x1039.jpeg', colorName: 'Hale Navy', specs: ['Sheer L51S-1146', 'Light Filtering L51-1146', 'Room Darkening ZL51-1146'] },
      ],
    },
    {
      name: 'Rory™',
      swatches: [
        { image: 'page093_img01_705x1039.jpeg', colorName: 'All White', specs: ['Sheer R22S-1170', 'Light Filtering R22-1170', 'Room Darkening ZR22-1170'] },
        { image: 'page093_img02_705x1039.jpeg', colorName: 'Sand Wash', specs: ['Sheer R22S-1170', 'Light Filtering R22-1170', 'Room Darkening ZR22-1170'] },
        { image: 'page094_img01_705x1039.jpeg', colorName: 'Brushed Beige', specs: ['Sheer R22S-1172', 'Light Filtering R22-1172', 'Room Darkening ZR22-1172'] },
        { image: 'page094_img02_705x1039.jpeg', colorName: 'Wisp Gray', specs: ['Sheer R22S-1172', 'Light Filtering R22-1172', 'Room Darkening ZR22-1172'] },
        { image: 'page095_img01_705x1039.jpeg', colorName: 'Soft Stone', specs: ['Sheer R22S-1174', 'Light Filtering R22-1174', 'Room Darkening ZR22-1174'] },
        { image: 'page095_img02_705x1039.jpeg', colorName: 'Moon Shadow', specs: ['Sheer R22S-1174', 'Light Filtering R22-1174', 'Room Darkening ZR22-1174'] },
      ],
    },
    {
      name: 'Prairie',
      swatches: [
        { image: 'page096_img01_705x1039.jpeg', colorName: 'Dove', specs: ['Sheer T8S-528', 'Light Filtering T8-528', 'Room Darkening ZT8-528'] },
        { image: 'page096_img02_705x1039.jpeg', colorName: 'Lynx', specs: ['Sheer T8S-528', 'Light Filtering T8-528', 'Room Darkening ZT8-528'] },
        { image: 'page097_img01_705x1039.jpeg', colorName: 'Reeds', specs: ['Sheer T8S-1152', 'Light Filtering T8-1152', 'Room Darkening ZT8-1152'] },
        { image: 'page097_img02_705x1039.jpeg', colorName: 'Feather', specs: ['Sheer T8S-1152', 'Light Filtering T8-1152', 'Room Darkening ZT8-1152'] },
        { image: 'page098_img01_705x1039.jpeg', colorName: 'Fox Fur', specs: ['Sheer T8S-1150', 'Light Filtering T8-1150', 'Room Darkening ZT8-1150'] },
        { image: 'page098_img02_705x1039.jpeg', colorName: 'Rye', specs: ['Sheer T8S-1150', 'Light Filtering T8-1150', 'Room Darkening ZT8-1150'] },
      ],
    },
    {
      name: 'Siena™',
      swatches: [
        { image: 'page099_img01_705x1039.jpeg', colorName: 'Still White', specs: ['Sheer S22S-1176', 'Light Filtering S22-1176', 'Room Darkening ZS22-1176'] },
        { image: 'page099_img02_705x1039.jpeg', colorName: 'Revere Pewter', specs: ['Sheer S22S-1176', 'Light Filtering S22-1176', 'Room Darkening ZS22-1176'] },
        { image: 'page100_img01_705x1039.jpeg', colorName: 'New Mauve', specs: ['Sheer S22S-1178', 'Light Filtering S22-1178', 'Room Darkening ZS22-1178'] },
        { image: 'page100_img02_705x1039.jpeg', colorName: 'Indigo Batik', specs: ['Sheer S22S-1178', 'Light Filtering S22-1178', 'Room Darkening ZS22-1178'] },
        { image: 'page101_img01_705x1039.jpeg', colorName: 'Misty Horizon', specs: ['Sheer S22S-1180', 'Light Filtering S22-1180', 'Room Darkening ZS22-1180'] },
        { image: 'page101_img02_705x1039.jpeg', colorName: 'Aged Iron', specs: ['Sheer S22S-1180', 'Light Filtering S22-1180', 'Room Darkening ZS22-1180'] },
      ],
    },
    {
      name: 'India Silk™',
      swatches: [
        { image: 'page102_img01_705x1039.jpeg', colorName: 'Raw Canvas', specs: ['Sheer P4HS-547', 'Light Filtering P4H-547', 'Room Darkening ZP4H-547'] },
        { image: 'page102_img02_705x1039.jpeg', colorName: 'Vin Blanc', specs: ['Sheer P4HS-547', 'Light Filtering P4H-547', 'Room Darkening ZP4H-547'] },
        { image: 'page103_img01_705x1039.jpeg', colorName: 'Arani', specs: ['Sheer P4HS-823', 'Light Filtering P4H-823', 'Room Darkening ZP4H-823'] },
        { image: 'page103_img02_705x1039.jpeg', colorName: 'Temple', specs: ['Sheer P4HS-823', 'Light Filtering P4H-823', 'Room Darkening ZP4H-823'] },
        { image: 'page104_img01_705x1039.jpeg', colorName: 'Sira', specs: ['Sheer P4HS-571', 'Light Filtering P4H-571', 'Room Darkening ZP4H-571'] },
        { image: 'page104_img02_705x1039.jpeg', colorName: 'Retreat', specs: ['Sheer P4HS-571', 'Light Filtering P4H-571', 'Room Darkening ZP4H-571'] },
      ],
    },
    {
      name: 'Shantung',
      swatches: [
        { image: 'page105_img01_705x1039.jpeg', colorName: 'Ming Porcelain', specs: ['Sheer M4S-501', 'Light Filtering M4-501', 'Room Darkening ZM4-501'] },
        { image: 'page105_img02_705x1039.jpeg', colorName: 'White Jade', specs: ['Sheer M4S-501', 'Light Filtering M4-501', 'Room Darkening ZM4-501'] },
        { image: 'page106_img01_705x1039.jpeg', colorName: 'Buff', specs: ['Sheer M4S-1148', 'Light Filtering M4-1148', 'Room Darkening ZM4-1148'] },
        { image: 'page106_img02_705x1039.jpeg', colorName: 'Blade', specs: ['Sheer M4S-1148', 'Light Filtering M4-1148', 'Room Darkening ZM4-1148'] },
        { image: 'page107_img01_705x1039.jpeg', colorName: 'Palomino', specs: ['Sheer M4S-524', 'Light Filtering M4-524', 'Room Darkening ZM4-524'] },
        { image: 'page107_img02_705x1039.jpeg', colorName: 'Peppercorn', specs: ['Sheer M4S-524', 'Light Filtering M4-524', 'Room Darkening ZM4-524'] },
      ],
    },
  ],
}
