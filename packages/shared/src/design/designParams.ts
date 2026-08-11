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

/**
 * How the panels part. Three answers, not two (Eddie 2026-08-11): a one-way
 * draw has a side, and the workroom needs to know which one — the leading edge
 * is finished differently and the stack lands on the wall the customer picked.
 *
 * `one_way_left` / `one_way_right` name the side the fabric STACKS on when the
 * drapery is open, read facing the window from inside the room. The two price
 * identically (one panel either way); they differ in make-up and in the render.
 */
export type OpenDirection = 'split' | 'one_way_left' | 'one_way_right'

/** A centre-open pair is two panels; either one-way draw is one. */
export function isSplit(open: OpenDirection): boolean {
  return open === 'split'
}

/**
 * AAPP's own `operation` vocabulary (`DraperyOperation` in the pricing
 * package). `_priceHandcraftedDrapery` only branches on `=== "split"`, so the
 * two singles cost the same — the side is carried through for the workroom
 * ticket, not for the maths.
 */
export function draperyOperation(open: OpenDirection): 'split' | 'single_left' | 'single_right' {
  if (open === 'one_way_left') return 'single_left'
  if (open === 'one_way_right') return 'single_right'
  return 'split'
}

export function openDirectionLabel(open: OpenDirection): string {
  if (open === 'one_way_left') return 'One-way draw, stacks left'
  if (open === 'one_way_right') return 'One-way draw, stacks right'
  return 'Centre-open pair'
}

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
    /**
     * Replaced the old `split: boolean` on 2026-08-11, when the third option
     * (which side a one-way draw stacks on) went in. Nothing had shipped
     * against the boolean yet, so this is a rename rather than a migration —
     * the 3D line reads `open` and gets the side for free.
     */
    open: OpenDirection
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
