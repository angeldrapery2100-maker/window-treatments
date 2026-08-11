/**
 * The contract between the /design page and the 3D drapery designer.
 *
 * SHARED FILE — both the website line and the 3D line read it, so a change
 * here has to be agreed on both sides (see 《OPUS 任务书 — 3D 设计器》 §5 and
 * 《网站第二阶段》 §5). The website assembles `DesignParams` and holds it in
 * page state today; when the 3D module ships it is handed straight to
 * `mount(el, params)` with no reshaping.
 */

/**
 * Heading styles, using the website's spelling of AAPP's style keys — the
 * pricing engine accepts both vocabularies (functions/index.js maps
 * `2fold_pinch` → `pinch_2`), and this is the one `draperyPricing.ts` already
 * validates against, so nothing in the quoting chain has to change.
 *
 * These ten ARE the range (Eddie 2026-08-11). Grommet, rod pocket and the rest
 * are not made — do not put anything here that the workroom won't sew.
 */
export type PleatedHeading = '2fold_pinch' | '3fold_pinch' | '2fold_tailored' | '3fold_tailored'
export type RippleHeading = 'cn_6cm' | 'cn_7cm' | 'us_60' | 'us_80' | 'us_100' | 'us_120'
export type HeadingStyle = PleatedHeading | RippleHeading

export type HeadingFamily = 'pleated' | 'ripple'

/**
 * How many layers hang at this window. AAPP's own field name and values —
 * `_priceHandcraftedDrapery` prices `layers.main` and `layers.sheer` off their
 * own $/yard, so a drape with a sheer behind it is two fabrics at two rates.
 */
export type Composition = 'fabric_only' | 'sheer_only' | 'fabric_plus_sheer'

export type HardwareType = 'wood_pole' | 'alu_track' | 'h_rail'
export type MountType = 'wall' | 'ceiling'

/** true = a centre-open pair, false = one panel drawing to one side. */
export type OpenDirection = 'split' | 'one_way'

export interface FabricRef {
  id: string
  textureUrl: string
  fabricWidthIn: number
  repeatVIn?: number
  repeatHIn?: number
  sheer: boolean
}

export type DesignParams = {
  /**
   * The layer the room sees. For `sheer_only` this IS the sheer — read
   * `composition` rather than inferring the arrangement from `fabric.sheer`.
   */
  fabric: FabricRef
  /** The layer behind, present only when composition is `fabric_plus_sheer`. */
  sheer?: FabricRef
  /** Optional for backward compatibility; absent means `fabric_only`. */
  composition?: Composition
  window: {
    finishedWidthIn: number
    finishedHeightIn: number
  }
  style: {
    heading: HeadingStyle
    /** true = centre-open pair. */
    split: boolean
    fullness?: number
  }
  hardware: {
    type: HardwareType
    mount: MountType
    /** Pole: diameter / finish / fluted / finial. */
    options?: Record<string, string>
  }
}

/**
 * The 3D module will be delivered as an ES module with this shape. /design
 * already reserves `<div id="scene-root">` for it; swapping the placeholder
 * for the real viewport is meant to be a one-line change.
 */
export interface DraperyScene {
  mount(el: HTMLElement, params: DesignParams): void | Promise<void>
  update(partial: Partial<DesignParams>): void
  screenshot(): Promise<Blob>
  destroy(): void
}
