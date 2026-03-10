/**
 * Shared type definitions for all Hunter Douglas product layouts.
 * Extracted from applause-layout.ts + additional types from other products.
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
  desc?: string
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

/* ── Section Layout Union ── */
export type SectionLayout =
  | { type: 'hero'; image: string; label: string }
  | { type: 'scene-pair'; scenes: { image: string; text: string; label: string }[] }
  | { type: 'card-grid'; title: string; cols: number; cards: CardItem[] }
  | { type: 'comparison-grid'; title: string; subtitle?: string; cols: number; items: ImageLabel[] }
  | { type: 'image-label-grid'; title: string; cols: number; items: ImageLabel[] }
  | { type: 'mounting-grid'; title: string; rows: { label?: string; items: ImageLabel[] }[] }
  | { type: 'cell-size'; title: string; brandLabel: string; items: ImageLabel[] }
  | { type: 'hardware-colors'; title: string; brandLabel: string; items: ImageLabel[] }
  | { type: 'control-systems'; panels: ControlSystemPanel[]; sceneImage: string | null; sceneLabel: string }
  | { type: 'control-systems-pair'; groups: { title: string; sceneImage: string; panels: ControlSystemPanel[] }[] }
  // Product-specific types
  | { type: 'shade-styles'; title: string; topImages?: ImageLabel[]; lineDrawings?: ImageLabel[] }
  | { type: 'mounting-profiles'; title: string; description?: string; topTreatments?: any[]; bottomBar?: any }
  | { type: 'reverse-roll'; title: string; items?: ImageLabel[]; variations?: ImageLabel[]; variationNote?: string }
  | { type: 'edge-banding'; title: string; widths?: ImageLabel[]; desc?: string; colors?: ImageLabel[]; footnote?: string }
  | { type: 'liner'; title: string; independent?: any; attached?: any; groups?: any }
  // Split-scene: large scene image on one side + detail items on the other (like PDF spread)
  | { type: 'split-scene'; title: string; sceneImage: string; sceneLabel?: string; sceneSide: 'left' | 'right'; items: ImageLabel[] }
  // Mixed grid: main items in columns + a stacked column on the right (e.g. Light Control)
  | { type: 'mixed-grid'; title: string; cols: number; items: ImageLabel[]; stackedItems: ImageLabel[] }

/* ── Scene Row (for Alustra-style layouts) ── */
export interface SceneRow {
  image: string
  text?: string
  label?: string
  textSide?: 'left' | 'right'
}

/* ── Unified Product Layout Interface ── */
export interface ProductLayout {
  slug: string
  name: string
  description: string
  heroImage: string
  heroLabel: string
  /** Scene-pair data in sections array (most products) */
  sections: SectionLayout[]
  /** Standalone scenes for Alustra-style layouts (optional) */
  scenes?: SceneRow[]
  gallery: { image: string; text: string; label: string }[]
  cellSize?: SectionLayout | null
  hardwareColors?: SectionLayout | null
  swatchCollections: SwatchCollection[]
  /** Product-specific collapsible sections */
  opacity?: SectionLayout | null
  edgeBanding?: any | null
  liner?: any | null
  decorativeTapes?: SectionLayout | null
}
