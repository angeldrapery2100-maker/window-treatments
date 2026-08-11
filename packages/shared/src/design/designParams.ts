/**
 * The contract between the /design page and the 3D drapery designer.
 *
 * SHARED FILE — both the website line and the 3D line read it, so a change
 * here has to be agreed on both sides (see 《OPUS 任务书 — 3D 设计器》 §5 and
 * 《网站第二阶段》 §5). The website assembles `DesignParams` and holds it in
 * page state today; when the 3D module ships it is handed straight to
 * `mount(el, params)` with no reshaping.
 */

export type HeadingStyle = 'pinch2' | 'pinch3' | 'wave' | 'grommet'
export type HardwareType = 'wood_pole' | 'alu_track' | 'h_rail'
export type MountType = 'wall' | 'ceiling'

export type DesignParams = {
  fabric: {
    id: string
    textureUrl: string
    fabricWidthIn: number
    repeatVIn?: number
    repeatHIn?: number
    sheer: boolean
  }
  window: {
    finishedWidthIn: number
    finishedHeightIn: number
  }
  style: {
    heading: HeadingStyle
    /** true = a centre-open pair, false = one panel drawing to one side. */
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
