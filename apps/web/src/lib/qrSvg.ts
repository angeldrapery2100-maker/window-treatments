import QRCode from 'qrcode'

// Server-side QR rendering for the referral pages.
//
// Rendered here, not by a third-party QR image service: nobody outside our
// stack needs to see a referral token, and the code still draws if the
// visitor goes offline after first paint.
//
// Two shapes, deliberately:
//  · qrSvg  — inline SVG, crisp at any size, for on-screen display.
//  · qrPng  — a PNG data URL rendered into an <img>, because "press and hold
//    to save" only offers Save Image for a real bitmap; an inline <svg> can't
//    be saved from a phone, and saving it is the whole point on a partner
//    page (they text it, print it, put it on a business card).
// Error-correction level M survives a camera at an angle and a reprint.

const OPTS = {
  margin: 1,
  errorCorrectionLevel: 'M' as const,
  color: { dark: '#12141C', light: '#FFFFFF' },
}

export async function qrSvg(text: string): Promise<string> {
  try {
    return await QRCode.toString(text, { type: 'svg', ...OPTS })
  } catch {
    return ''
  }
}

export async function qrPng(text: string, width = 640): Promise<string> {
  try {
    return await QRCode.toDataURL(text, { width, ...OPTS })
  } catch {
    return ''
  }
}
