// Luma work-order FORM payload builder.
//
// Companion to draperyWorkOrderForm.ts: maps a website order's shade / Luma
// lines into the payload the embedded AAPP Luma form (public/work-orders/
// luma-order.html) expects via postMessage `LUMA_LOAD` — { meta, rows }.
//
// Field derivation mirrors AAPP app-workorder-preview.js `mapLumaOrderToForm`
// 1:1: only DRIVER fields are populated (product / operation / sizes / cassette
// / explicit colors); the form's own finalizeRow() then applies the business
// rules (mm = inch·25.4 with width −2mm, bead-height auto-match, stainless→304,
// colour follows cassette, downrail by product). Everything is hand-editable.

import type { FormOption, FormOrderItem } from './draperyWorkOrderForm'

export interface LumaFormEntry {
  item: FormOrderItem
  production?: Record<string, number | string> | null
}

export interface LumaFormRow {
  customer: string
  product: string
  fabric: string
  window: string
  w_in: string
  h_in: string
  w_mm: string
  h_mm: string
  operation: string
  dir: string
  height: string
  color: string
  cassette: string
  cassetteType: string
  downrail: string
  remark: string
}

export interface LumaFormPayload {
  meta: {
    company: string
    phone: string
    address: string
    website: string
    logo: string
    po: string
    customer: string
    pi: string
    date: string
    remark: string
    title: string
  }
  rows: LumaFormRow[]
}

const COMPANY = 'Angel Drapery, Inc'
const ADDRESS = '8831 Las Tunas Dr, Temple City, CA 91780'
const PHONE = '888-689-9989'
const WEBSITE = 'angel-drapery.com'

function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
function parseFraction(f: unknown): number {
  if (f == null || f === '' || f === '0') return 0
  const s = String(f).trim()
  if (s.includes('/')) { const [a, b] = s.split('/').map(Number); return b ? a / b : 0 }
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}
function findOption(item: FormOrderItem, matchers: RegExp[]): FormOption | undefined {
  const opts = item.options || []
  for (const re of matchers) {
    const hit = opts.find(o => re.test(String(o.name || '')) || re.test(String(o.displayLabel || '')))
    if (hit) return hit
  }
  return undefined
}
function optText(o?: FormOption): string {
  return o ? String(o.valueLabel || o.value || '') : ''
}

// Roller / Zebra / Sheer — mirrors AAPP productOf().
function productOf(item: FormOrderItem): string {
  const s = `${item.productName || ''} ${item.productType || ''}`.toLowerCase()
  if (/zebra|luma/.test(s)) return 'Zebra shade'
  if (/sheer|shangri|柔纱|香格里拉/.test(s)) return 'Sheer shade'
  return 'Roller shade'
}

// Polyester / Stainless / Cordless / Motorized — mirrors AAPP operationOf().
function operationOf(controlText: string): string {
  const o = controlText.toLowerCase()
  if (/motor|电动/.test(o)) return 'Motorized'
  if (/cordless|无拉/.test(o)) return 'Cordless'
  if (/stainless|不锈钢/.test(o)) return 'Stainless chain'
  return 'Polyester chain'
}

// Square / Round / '' — mirrors AAPP cassetteOf().
function cassetteOf(cassetteText: string): string {
  const c = cassetteText.toLowerCase()
  if (/round|6#|8#/.test(c)) return 'Round'
  if (/square|sqaure|fabric wrap/.test(c)) return 'Square'
  if (/open|none/.test(c)) return ''
  return cassetteText ? cassetteText : ''
}

function sideLabel(s: string): string {
  const t = s.toLowerCase()
  return /left/.test(t) ? 'Left' : /right/.test(t) ? 'Right' : ''
}

/** Build one Luma-form row from a shade order line. */
export function lumaRowFromEntry(entry: LumaFormEntry, customerName: string): LumaFormRow {
  const { item } = entry
  const control = optText(findOption(item, [/^control$/i, /^operation$/i, /control|operation/i]))
  const operation = operationOf(control)
  const isMotor = operation === 'Motorized'

  // Front/back fabric (zebra) or single fabric — joined like AAPP fabricsOf().
  const fabricOpts = (item.options || []).filter(o =>
    /fabric_code|fabric_color|front_fabric|back_fabric|^fabric$|^fabric /i.test(String(o.name || o.displayLabel || '')))
  const fabric = fabricOpts.map(o => optText(o)).filter(Boolean).join(' / ')

  const motorModel = optText(findOption(item, [/^motor$/i, /motor.?model|motor.?system/i]))
  const remote = optText(findOption(item, [/^remote$/i, /remote|channel/i]))
  const chainColor = optText(findOption(item, [/chain.?color|拉珠颜色/i]))
  const cordLen = optText(findOption(item, [/cord.?length|bead.?height|拉珠高度/i]))

  const finW = num(item.width) + parseFraction(item.widthFraction)
  const finH = num(item.height) + parseFraction(item.heightFraction)

  return {
    customer: customerName,
    product: productOf(item),
    fabric,
    window: item.location || '',
    w_in: finW > 0 ? String(finW) : '',
    h_in: finH > 0 ? String(finH) : '',
    w_mm: '',
    h_mm: '',
    operation,
    dir: sideLabel(optText(findOption(item, [/control_side|chain_side|^side$|direction|方向/i]))),
    height: isMotor ? motorModel.replace(/_/g, ' ') : cordLen,
    color: isMotor ? (remote ? (/^remote|channel/i.test(remote) ? remote : 'Remote ' + remote) : '') : chainColor,
    cassette: cassetteOf(optText(findOption(item, [/^cassette$/i, /cassette|外罩/i]))),
    cassetteType: '',
    downrail: optText(findOption(item, [/downrail|下杆/i])),
    remark: item.notes || '',
  }
}

/** Build the full LUMA_LOAD payload from an order + its shade/Luma lines. */
export function buildLumaFormPayload(
  order: { order_number?: string; customer_name?: string; created_at?: string; poNumber?: string },
  entries: LumaFormEntry[],
): LumaFormPayload {
  const po = order.poNumber || order.order_number || ''
  const customer = order.customer_name || ''
  const date = order.created_at ? String(order.created_at).slice(0, 10) : ''
  return {
    meta: {
      company: COMPANY,
      phone: PHONE,
      address: ADDRESS,
      website: WEBSITE,
      logo: '',
      po,
      customer,
      pi: order.order_number || '',
      date,
      remark: '',
      title: (po || 'Luma') + ' Luma Work Order' + (customer ? ' — ' + customer : ''),
    },
    rows: entries.map(e => lumaRowFromEntry(e, customer)),
  }
}
