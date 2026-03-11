'use client';

import { useState, useRef, useCallback, useMemo } from "react";

const FABRIC_DB = {
  roller: [
    { code: "MS1-001", price: 78.15, series: "MS1", type: "Sunscreen Roller Shade" },
    { code: "MB1-001", price: 85.95, series: "MB1", type: "Blackout Roller Shades" }
  ],
  zebra: [
    { code: "DE1-001", price: 90.2, series: "DE1", type: "Semi-Blackout Zebra Shades" },
    { code: "DB1-001", price: 107.42, series: "DB1", type: "Blackout Zebra Shades" }
  ],
  shangrila: [
    { code: "E1-001", price: 105.45 },
    { code: "N1-001", price: 93.75 }
  ],
  roman: [
    { code: "PE1-001", price: 105.45, series: "PE1", shading: "light filtering" },
    { code: "PB1-001", price: 126.55, series: "PB1", shading: "Semi-blackout" }
  ]
};

const SHUTTER_MATERIALS = [
  { id: "poly-vinyl", label: "Poly-Vinyl Solid Aluminum Reinforced", price: 10.25 },
  { id: "hardwood", label: "Hardwood", price: 10.25 }
];
const LOUVER_SIZES = ['2.5"', '3.5"', '4.5"', "Custom"];
const SHUTTER_COLORS = {
  paint: [{ name: "Antique", polyVinyl: true }, { name: "Ballet White", polyVinyl: true }, { name: "Stone", polyVinyl: false }],
  stain: [{ name: "American Maple" }, { name: "Dark Walnut" }]
};
const SHUTTER_UPGRADES = [
  { id: "u01", name: "Bay Post", price: 1.0, type: "psf", materials: ["poly-vinyl", "hardwood"] },
  { id: "u02", name: "Bi-Fold and By-Pass Track", price: 200, type: "ea", materials: ["poly-vinyl", "hardwood"] }
];
const USERS = [
  { id: "u1", name: "Sarah Chen", email: "sarah@drapes.com", password: "1234", role: "sales" },
  { id: "u2", name: "Mike Johnson", email: "mike@drapes.com", password: "1234", role: "sales" },
  { id: "u3", name: "Admin", email: "admin@drapes.com", password: "admin", role: "admin" }
];
const INCH_TO_M = 0.0254;
const INCH_TO_FT = 1 / 12;
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => (n == null ? "—" : "$" + Number(n).toFixed(2));
const avGrad = (s) => {
  const g = [
    "linear-gradient(135deg,#1D6A6E,#0F4547)",
    "linear-gradient(135deg,#B8924A,#7A5C1E)",
    "linear-gradient(135deg,#5B3E8A,#3A2566)",
    "linear-gradient(135deg,#2A7050,#144030)"
  ];
  return g[(s?.charCodeAt(0) || 0) % g.length];
};
const initials = (addr) =>
  addr
    ?.trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";
const blankClient = () => ({ address: "", sidemark: "", phone: "", email: "", notes: "" });
const blankPanel = () => ({
  id: uid(),
  label: "Panel 1",
  insideW1: "",
  insideW2: "",
  insideW3: "",
  insideH1: "",
  insideH2: "",
  insideH3: "",
  outsideW1: "",
  outsideW2: "",
  outsideW3: "",
  outsideH1: "",
  outsideH2: "",
  outsideH3: "",
  insideW: "",
  insideH: "",
  outsideW: "",
  outsideH: ""
});
const blankWindow = () => ({
  id: uid(),
  location: "",
  mountType: "inside",
  panels: [blankPanel()],
  spaceTop: "",
  spaceBottom: "",
  spaceLeft: "",
  spaceRight: "",
  notes: "",
  photos: []
});

function parseFrac(v) {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v)
    .trim()
    .replace(/\u00bd/g, "1/2")
    .replace(/\u00bc/g, "1/4")
    .replace(/\u00be/g, "3/4")
    .replace(/\u215b/g, "1/8")
    .replace(/\u215c/g, "3/8")
    .replace(/\u215d/g, "5/8")
    .replace(/\u215e/g, "7/8");
  const m = s.match(/^(\d+(?:\.\d+)?)\s*[\s\-]\s*(\d+)\/(\d+)$/);
  if (m) return parseFloat(m[1]) + parseFloat(m[2]) / parseFloat(m[3]);
  const m2 = s.match(/^(\d+)\/(\d+)$/);
  if (m2) return parseFloat(m2[1]) / parseFloat(m2[2]);
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}
function minOf3(a, b, c) {
  const vals = [a, b, c].map(parseFrac).filter((v) => v != null && v > 0);
  return vals.length ? Math.min(...vals) : null;
}
function fmtFrac(v) {
  if (v === null || v === undefined || v === "") return "";
  const num = typeof v === "string" ? parseFrac(v) : v;
  if (!num || num <= 0) return "";
  const whole = Math.floor(num);
  const frac16 = Math.round((num - whole) * 16);
  if (frac16 === 0) return whole + '"';
  if (frac16 === 16) return whole + 1 + '"';
  const fracStr = {
    1: "1/16",
    2: "⅛",
    3: "3/16",
    4: "¼",
    5: "5/16",
    6: "⅜",
    7: "7/16",
    8: "½",
    9: "9/16",
    10: "⅝",
    11: "11/16",
    12: "¾",
    13: "13/16",
    14: "⅞",
    15: "15/16"
  }[frac16] || "";
  return whole + (fracStr ? " " + fracStr : "") + '"';
}

const DEFAULT_SETTINGS = {
  motorizedFee: 250,
  cordlessFee: 50,
  shutterFrames: [{ id: "sf1", name: '2.5" Flat Z-Frame', offset: 3.5, pricePerSqFt: 10.25 }],
  hardware: {
    roller: [
      { id: "r1", name: "Standard Roller Tube", pricePerM: 15 },
      { id: "r2", name: "Motorized Rail", pricePerM: 45 }
    ],
    zebra: [
      { id: "z1", name: "Standard Zebra Rail", pricePerM: 18 },
      { id: "z2", name: "Motorized Zebra Rail", pricePerM: 50 }
    ],
    shangrila: [
      { id: "s1", name: "Shangri-La Rail", pricePerM: 20 },
      { id: "s2", name: "Motorized Shangri-La Rail", pricePerM: 55 }
    ],
    roman: [
      { id: "ro1", name: "Roman Shade Rail", pricePerM: 16 },
      { id: "ro2", name: "Motorized Roman Rail", pricePerM: 48 }
    ],
    drapery: [
      { id: "d1", name: "H-Rod Single Layer", pricePerM: 98 },
      { id: "d2", name: "H-Rod Double Layer", pricePerM: 215 }
    ]
  }
};

function calcQuote(item, settings) {
  const { product, fabricCode, w_in, h_in, hardwareId, addons = {}, lining = "NO", panelType = "split" } = item;
  if (!w_in || !h_in || w_in <= 0 || h_in <= 0) return null;
  const wM = w_in * INCH_TO_M;
  const hM = h_in * INCH_TO_M;
  const areaM2 = wM * hM;
  const areaFt2 = w_in * INCH_TO_FT * h_in * INCH_TO_FT;
  let fabricCost = 0,
    hardwareCost = 0,
    laborCost = 0,
    addonCost = 0,
    breakdown = {};
  const hwList = settings.hardware[product] || [];
  const hw = hwList.find((h) => h.id === hardwareId);
  if (hw) {
    if (hw.pricePerM != null) hardwareCost = hw.pricePerM * wM;
    else if (hw.pricePerSqFt != null) hardwareCost = hw.pricePerSqFt * areaFt2;
  }
  if (addons.motorized) addonCost += settings.motorizedFee || 0;
  if (addons.cordless) addonCost += settings.cordlessFee || 0;

  if (["roller", "zebra", "shangrila", "roman"].includes(product)) {
    const fabric = (FABRIC_DB[product] || []).find((f) => f.code === fabricCode);
    if (!fabric) return null;
    fabricCost = fabric.price * areaM2;
    breakdown = { fabricCode, fabricPriceM2: fabric.price, areaM2: +areaM2.toFixed(3), fabricCost: +fabricCost.toFixed(2) };
  } else if (product === "shutter") {
    const frame = (settings.shutterFrames || []).find((f) => f.id === item.shutterFrameId);
    const offset = frame ? parseFloat(frame.offset) || 0 : 0;
    const finW = w_in + offset;
    const finH = h_in + offset;
    const finFt2 = (finW / 12) * (finH / 12);
    const basePrice = frame ? parseFloat(frame.pricePerSqFt) || 10.25 : 10.25;
    fabricCost = basePrice * finFt2;
    let upgradeCost = 0;
    (item.shutterUpgrades || []).forEach((id) => {
      const u = SHUTTER_UPGRADES.find((x) => x.id === id);
      if (!u) return;
      upgradeCost += u.type === "psf" ? u.price * finFt2 : u.price;
    });
    laborCost = upgradeCost;
    breakdown = {
      frameName: frame?.name || "",
      offset,
      basePerSqFt: basePrice,
      finishedSqFt: +finFt2.toFixed(2)
    };
  } else if (product === "drapery") {
    const isSplit = panelType !== "single";
    const liningRates = { NO: { fabricUSD: 0, labor: 30 }, LF: { fabricUSD: 6, labor: 36 }, BO: { fabricUSD: 8, labor: 38 } };
    const lr = liningRates[lining] || liningRates.NO;
    const fabricPriceYd = item.fabricPriceYd || 0;
    const roundUp23 = (n) => {
      const f = Math.floor(n);
      return n - f < 0.33 ? f : n - f < 0.67 ? f : f + 1;
    };
    const totalPanelsRaw = (w_in * 3) / 55;
    let totalPanels;
    let singlePanelCount;
    if (isSplit) {
      singlePanelCount = roundUp23(((w_in / 2) * 3) / 55);
      totalPanels = singlePanelCount * 2;
    } else {
      singlePanelCount = roundUp23(totalPanelsRaw);
      totalPanels = singlePanelCount;
    }
    const yardage = roundUp23((totalPanels * (h_in + 30)) / 36);
    const hMult = h_in < 120 ? 1.0 : 1.5 + (h_in - 120) / 120;
    const wMult = singlePanelCount >= 5 ? 1.5 : 1.0;
    laborCost = totalPanels * lr.labor * hMult * wMult;
    fabricCost = (fabricPriceYd + lr.fabricUSD) * yardage;
  }
  const total = fabricCost + hardwareCost + laborCost + addonCost;
  return {
    total: +total.toFixed(2),
    fabricCost: +fabricCost.toFixed(2),
    hardwareCost: +hardwareCost.toFixed(2),
    laborCost: +laborCost.toFixed(2),
    addonCost: +addonCost.toFixed(2),
    breakdown
  };
}

const SAMPLES = [
  {
    id: "c1",
    createdBy: "u1",
    createdByName: "Sarah Chen",
    createdAt: "2025-03-01",
    address: "1420 Sunset Blvd, Los Angeles, CA 90028",
    sidemark: "SUNSET-001",
    phone: "310-555-0192",
    email: "owner@email.com",
    notes: "Prefers neutral tones",
    status: "Active",
    windows: []
  }
];

const CN_NUM = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  十一: 11,
  十二: 12,
  二十: 20,
  三十: 30,
  四十: 40,
  五十: 50,
  六十: 60,
  七十: 70,
  八十: 80,
  九十: 90,
  一百: 100
};
const parseCN = (s) => {
  if (!s) return null;
  const n = parseFloat(s);
  if (!isNaN(n)) return n;
  return CN_NUM[s] ?? null;
};

function parseVoice(text) {
  const t = text.toLowerCase().trim();
  const res = {};
  const EN_IW =
    t.match(/inside\s*width\s*(\d+(?:\.\d+)?)/i) ||
    t.match(/width\s*(?:is\s*)?(\d+(?:\.\d+)?)/i) ||
    t.match(/(\d+(?:\.\d+)?)\s*(?:inches?|\")\s*wide/i);
  const EN_IH =
    t.match(/inside\s*height\s*(\d+(?:\.\d+)?)/i) ||
    t.match(/height\s*(?:is\s*)?(\d+(?:\.\d+)?)/i) ||
    t.match(/(\d+(?:\.\d+)?)\s*(?:inches?|\")\s*(?:tall|high)/i);
  const EN_OW = t.match(/outside\s*width\s*(\d+(?:\.\d+)?)/i);
  const EN_OH = t.match(/outside\s*height\s*(\d+(?:\.\d+)?)/i);
  const ZH_IW = text.match(/内框宽(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_IH = text.match(/内框高(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_OW = text.match(/外框宽(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_OH = text.match(/外框高(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_W = text.match(/(?:^|[，,。\s])宽(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_H = text.match(/(?:^|[，,。\s])高(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);

  if (EN_IW) res.insideW = parseFloat(EN_IW[1]);
  if (EN_IH) res.insideH = parseFloat(EN_IH[1]);
  if (EN_OW) res.outsideW = parseFloat(EN_OW[1]);
  if (EN_OH) res.outsideH = parseFloat(EN_OH[1]);
  if (ZH_IW) res.insideW = parseCN(ZH_IW[1]);
  if (ZH_IH) res.insideH = parseCN(ZH_IH[1]);
  if (ZH_OW) res.outsideW = parseCN(ZH_OW[1]);
  if (ZH_OH) res.outsideH = parseCN(ZH_OH[1]);
  if (!res.insideW && !res.outsideW) {
    if (ZH_W) res.insideW = parseCN(ZH_W[1]);
  }
  if (!res.insideH && !res.outsideH) {
    if (ZH_H) res.insideH = parseCN(ZH_H[1]);
  }

  return Object.fromEntries(Object.entries(res).filter(([, v]) => v != null && !isNaN(v)));
}

function useVoice({ lang, onResult }) {
  const [listening, setL] = useState(false);
  const [transcript, setT] = useState("");
  const recRef = useRef(null);
  const txRef = useRef("");

  const stop = useCallback(() => {
    recRef.current?.stop();
    setL(false);
  }, []);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition needs Safari iOS 16+ or Chrome.");
      return;
    }
    const rec = new SR();
    rec.lang = lang === "zh" ? "zh-CN" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onstart = () => setL(true);
    rec.onresult = (e) => {
      const t = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setT(t);
      txRef.current = t;
    };
    rec.onend = () => {
      setL(false);
      if (txRef.current) onResult(txRef.current);
    };
    rec.onspeechend = () => rec.stop();
    rec.onerror = () => setL(false);
    recRef.current = rec;
    txRef.current = "";
    rec.start();
  }, [lang, onResult]);

  return { listening, transcript, setTranscript: setT, start, stop };
}

const PRODUCTS = [
  { id: "roller", label: "Roller Shade", icon: "🪟", hasFabric: true, fabricKey: "roller" },
  { id: "zebra", label: "Zebra Shade", icon: "🦓", hasFabric: true, fabricKey: "zebra" },
  { id: "shangrila", label: "Sheer Shade", icon: "🌸", hasFabric: true, fabricKey: "shangrila" },
  { id: "roman", label: "Roman Shade", icon: "📜", hasFabric: true, fabricKey: "roman" },
  { id: "shutter", label: "Wood Shutter", icon: "🏠", hasFabric: false, fabricKey: null },
  { id: "drapery", label: "Drapery", icon: "🎭", hasFabric: false, fabricKey: null, isDrapery: true }
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Mulish:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#F2EEE8;--surf:#FFFFFF;--surf2:#F7F4F0;--ink:#1A1816;--ink2:#524D47;--ink3:#96908A;--teal:#1C686C;--tealBg:rgba(28,104,108,.09);--tealBd:rgba(28,104,108,.25);--amber:#B8772A;--amberBg:rgba(184,119,42,.09);--amberBd:rgba(184,119,42,.25);--red:#BE3A2E;--redBg:rgba(190,58,46,.07);--redBd:rgba(190,58,46,.22);--green:#256B42;--greenBg:rgba(37,107,66,.08);--greenBd:rgba(37,107,66,.22);--bd:#DDD8D0;--bd2:#CAC3BA;--r8:8px;--r12:12px;--r16:16px;--r20:20px;--s1:0 1px 3px rgba(26,24,22,.07);--s2:0 4px 16px rgba(26,24,22,.11);--s3:0 12px 40px rgba(26,24,22,.17);}
body{background:var(--bg);font-family:'Mulish',sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink)}
.app{max-width:430px;margin:0 auto;min-height:100vh;background:var(--surf);display:flex;flex-direction:column;overflow:hidden;position:relative}
.login{flex:1;display:flex;flex-direction:column;justify-content:center;padding:36px 28px 52px;background:var(--ink);position:relative;overflow:hidden;min-height:100vh}
.login-glow{position:absolute;top:-80px;right:-60px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(28,104,108,.3),transparent 65%);pointer-events:none}
.login-glow2{position:absolute;bottom:-60px;left:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(184,119,42,.18),transparent 65%);pointer-events:none}
.lz{position:relative;z-index:1}
.l-eye{font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--amber);margin-bottom:10px}
.l-h{font-family:'Syne',sans-serif;font-size:38px;font-weight:800;color:#fff;line-height:1;margin-bottom:8px}
.l-sub{font-size:14px;color:rgba(255,255,255,.38);font-weight:300;margin-bottom:48px}
.l-lbl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:7px;display:block}
.l-inp{width:100%;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.1);border-radius:var(--r12);padding:15px 16px;font-family:'Mulish',sans-serif;font-size:15px;color:#fff;outline:none;transition:all .2s;margin-bottom:14px}
.l-err{font-size:12px;color:#FF7878;margin-bottom:10px;padding:9px 14px;background:rgba(190,58,46,.15);border-radius:var(--r8);border:1px solid rgba(190,58,46,.3)}
.l-btn{width:100%;background:var(--teal);color:#fff;border:none;border-radius:var(--r12);padding:16px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 24px rgba(28,104,108,.4);transition:transform .15s;margin-top:4px}
.l-demo{font-size:11.5px;color:rgba(255,255,255,.22);text-align:center;margin-top:24px;line-height:1.9;background:rgba(255,255,255,.04);border-radius:var(--r12);padding:12px 16px;border:1px solid rgba(255,255,255,.07)}
.hdr{background:var(--ink);padding:50px 18px 0;flex-shrink:0;position:relative;overflow:hidden}
.hdr-row{display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1}
.hdr-brand{font-size:10px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:var(--amber)}
.hdr-user-btn{display:flex;align-items:center;gap:7px;cursor:pointer;background:rgba(255,255,255,.07);border-radius:30px;padding:5px 10px 5px 5px;border:1px solid rgba(255,255,255,.1)}
.hdr-av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:11px;font-weight:800;color:#fff}
.hdr-uname{font-size:11px;color:rgba(255,255,255,.55);font-weight:600}
.hdr-h{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:#fff;line-height:1;margin:10px 0 3px;position:relative;z-index:1}
.hdr-s{font-size:11px;color:rgba(255,255,255,.32);font-weight:300;margin-bottom:16px;position:relative;z-index:1}
.nav{background:var(--ink);display:flex;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 4px 13px;border:none;background:transparent;cursor:pointer}
.nb-l{font-size:10px;font-weight:600;color:rgba(255,255,255,.28)}
.nb.on .nb-l{color:var(--amber)}
.scr{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 14px 90px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:18px}
.stat{background:var(--surf2);border-radius:var(--r12);padding:14px 10px;text-align:center;border:1px solid var(--bd)}
.stat-n{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:var(--ink);line-height:1}
.stat-l{font-size:10px;color:var(--ink3);margin-top:4px;font-weight:600;letter-spacing:.3px}
.sr{display:flex;gap:8px;margin-bottom:16px}
.sw{flex:1;position:relative}
.si{font-size:14px;position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none}
.s-inp{width:100%;background:var(--surf2);border:1.5px solid transparent;border-radius:var(--r12);padding:11px 13px 11px 35px;font-family:'Mulish',sans-serif;font-size:13px;color:var(--ink);outline:none}
.ba{background:var(--teal);color:#fff;border:none;border-radius:var(--r12);width:44px;height:44px;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.cc{background:#fff;border-radius:var(--r16);border:1.5px solid var(--bd);margin-bottom:10px;cursor:pointer;box-shadow:var(--s1);overflow:hidden}
.cc-b{display:flex;gap:12px;align-items:center;padding:13px 14px}
.av{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#fff;flex-shrink:0}
.cn{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:var(--ink)}
.csm{font-size:11.5px;color:var(--teal);font-weight:700;margin-top:1px;font-family:'Syne',sans-serif}
.cm{font-size:11px;color:var(--ink3);margin-top:2px}
.empty{text-align:center;padding:52px 20px;color:var(--ink3)}
`;

function FabricPicker({ productKey, value, onChange }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const fabrics = FABRIC_DB[productKey] || [];
  const selected = fabrics.find((f) => f.code === value);
  const results = useMemo(() => {
    if (!q) return fabrics.slice(0, 30);
    const ql = q.toLowerCase();
    return fabrics
      .filter(
        (f) =>
          f.code.toLowerCase().includes(ql) ||
          (f.series || "").toLowerCase().includes(ql) ||
          (f.type || "").toLowerCase().includes(ql) ||
          (f.shading || "").toLowerCase().includes(ql)
      )
      .slice(0, 40);
  }, [q, fabrics]);

  return (
    <div>
      {selected ? (
        <div style={{ border: "1px solid var(--tealBd)", borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{selected.code}</div>
              <div style={{ fontSize: 12, color: "var(--ink3)" }}>
                {selected.series || ""} {selected.type || selected.shading || ""}
              </div>
            </div>
            <button className="ba" style={{ width: 30, height: 30 }} onClick={() => onChange(null)}>
              ×
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="sw" style={{ marginBottom: 8 }}>
            <span className="si">🔍</span>
            <input
              className="s-inp"
              placeholder="Search fabric code"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
          </div>
          {open && results.length > 0 && (
            <div style={{ border: "1px solid var(--bd)", borderRadius: 8, maxHeight: 200, overflow: "auto" }}>
              {results.map((f) => (
                <div
                  key={f.code}
                  style={{ padding: "8px 12px", borderBottom: "1px solid var(--bd)", cursor: "pointer" }}
                  onClick={() => {
                    onChange(f.code);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{f.code}</div>
                  <div style={{ fontSize: 11, color: "var(--ink3)" }}>{f.series || ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuoteQuick({ settings }) {
  const [product, setProduct] = useState("roller");
  const [fabricCode, setFabricCode] = useState("MS1-001");
  const [w, setW] = useState("48");
  const [h, setH] = useState("72");
  const [hardwareId, setHardwareId] = useState("r1");
  const [addons, setAddons] = useState({ motorized: false, cordless: false });

  const result = calcQuote(
    {
      product,
      fabricCode,
      w_in: parseFloat(w) || 0,
      h_in: parseFloat(h) || 0,
      hardwareId,
      addons
    },
    settings
  );

  return (
    <div style={{ background: "#fff", border: "1.5px solid var(--bd)", borderRadius: 12, padding: 12, marginTop: 12 }}>
      <div style={{ fontFamily: "Syne", fontWeight: 700, marginBottom: 8 }}>Quick Quote Preview</div>
      <div style={{ display: "grid", gap: 8 }}>
        <select className="s-inp" value={product} onChange={(e) => setProduct(e.target.value)}>
          {PRODUCTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        {["roller", "zebra", "shangrila", "roman"].includes(product) && (
          <FabricPicker productKey={product} value={fabricCode} onChange={setFabricCode} />
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input className="s-inp" value={w} onChange={(e) => setW(e.target.value)} placeholder="Width (in)" />
          <input className="s-inp" value={h} onChange={(e) => setH(e.target.value)} placeholder="Height (in)" />
        </div>

        <select className="s-inp" value={hardwareId} onChange={(e) => setHardwareId(e.target.value)}>
          <option value="">No hardware</option>
          {(settings.hardware[product] || []).map((hw) => (
            <option key={hw.id} value={hw.id}>
              {hw.name}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={addons.motorized}
              onChange={(e) => setAddons((a) => ({ ...a, motorized: e.target.checked }))}
            />{" "}
            Motorized
          </label>
          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={addons.cordless}
              onChange={(e) => setAddons((a) => ({ ...a, cordless: e.target.checked }))}
            />{" "}
            Cordless
          </label>
        </div>

        <div style={{ borderTop: "1px solid var(--bd)", paddingTop: 8, fontSize: 13 }}>
          <div>Total: <b>{fmt(result?.total)}</b></div>
          <div>Fabric: {fmt(result?.fabricCost)}</div>
          <div>Hardware: {fmt(result?.hardwareCost)}</div>
          <div>Add-on: {fmt(result?.addonCost)}</div>
        </div>
      </div>
    </div>
  );
}

export default function AngelDraperyPreview() {
  const [user, setUser] = useState(null);
  const [lForm, setLForm] = useState({ email: "", password: "" });
  const [lErr, setLErr] = useState("");
  const [clients, setClients] = useState(SAMPLES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tab, setTab] = useState("clients");
  const [search, setSearch] = useState("");
  const [cForm, setCForm] = useState(blankClient());
  const [voiceLang, setVoiceLang] = useState("en");
  const [notif, setNotif] = useState(null);

  const toast = useCallback((msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 2800);
  }, []);

  const onVoiceResult = useCallback((text) => {
    const parsed = parseVoice(text);
    if (Object.keys(parsed).length > 0) toast(`voice parsed: ${JSON.stringify(parsed)}`);
  }, [toast]);
  const voice = useVoice({ lang: voiceLang, onResult: onVoiceResult });

  const doLogin = () => {
    const u = USERS.find((x) => x.email.trim() === lForm.email.trim() && x.password === lForm.password);
    if (!u) {
      setLErr("Invalid email or password");
      return;
    }
    setUser(u);
    setLErr("");
  };

  const doLogout = () => {
    setUser(null);
    setTab("clients");
  };

  const visible = clients.filter(
    (c) =>
      (user?.role === "admin" ? true : c.createdBy === user?.id) &&
      (c.address.toLowerCase().includes(search.toLowerCase()) ||
        c.sidemark.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search))
  );

  const saveClient = () => {
    if (!cForm.address.trim()) {
      toast("⚠ Address required");
      return;
    }
    const nc = {
      id: uid(),
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString().slice(0, 10),
      ...cForm,
      status: "Active",
      windows: []
    };
    setClients((prev) => [nc, ...prev]);
    setCForm(blankClient());
    toast("✓ Client created");
  };

  if (!user) {
    return (
      <>
        <style>{CSS}</style>
        <div className="app">
          <div className="login">
            <div className="login-glow" />
            <div className="login-glow2" />
            <div className="lz">
              <div className="l-eye">Angel Drapery · 窗帘管理系统</div>
              <div className="l-h">Welcome<br />Back</div>
              <div className="l-sub">Sign in to continue · 登录您的账户</div>
              <label className="l-lbl">Email 邮箱</label>
              <input
                className="l-inp"
                type="email"
                placeholder="you@company.com"
                value={lForm.email}
                onChange={(e) => setLForm((f) => ({ ...f, email: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
                autoCapitalize="none"
              />
              <label className="l-lbl">Password 密码</label>
              <input
                className="l-inp"
                type="password"
                placeholder="••••••••"
                value={lForm.password}
                onChange={(e) => setLForm((f) => ({ ...f, password: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
              />
              {lErr && <div className="l-err">⚠ {lErr}</div>}
              <button className="l-btn" onClick={doLogin}>Sign In →</button>
              <div className="l-demo">
                <strong style={{ color: "rgba(255,255,255,.45)" }}>Demo Accounts</strong>
                <br />sarah@drapes.com · mike@drapes.com
                <br />Password: <strong style={{ color: "rgba(255,255,255,.5)" }}>1234</strong>
                <br />Admin: admin@drapes.com / <strong style={{ color: "rgba(255,255,255,.5)" }}>admin</strong>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const navItems = [
    { id: "clients", i: "📋", l: "Clients" },
    ...(user.role === "admin" ? [{ id: "settings", i: "⚙️", l: "Settings" }] : []),
    { id: "account", i: "👤", l: "Account" }
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {notif && <div style={{ position: "fixed", bottom: 20, left: 20, background: "#111", color: "#fff", padding: "8px 12px", borderRadius: 8 }}>{notif}</div>}
        <div className="hdr">
          <div className="hdr-row">
            <div className="hdr-brand">Angel Drapery</div>
            <div className="hdr-user-btn" onClick={doLogout}>
              <div className="hdr-av" style={{ background: avGrad(user.name) }}>{user.name[0]}</div>
              <div className="hdr-uname">{user.name.split(" ")[0]}</div>
            </div>
          </div>
          <div className="hdr-h">{tab === "clients" ? "Clients" : tab === "settings" ? "Settings" : "Account"}</div>
          <div className="hdr-s">{user.name}</div>
        </div>

        <div className="nav">
          {navItems.map((t) => (
            <button key={t.id} className={`nb ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              <span>{t.i}</span>
              <span className="nb-l">{t.l}</span>
            </button>
          ))}
        </div>

        {tab === "account" && (
          <div className="scr">
            <div style={{ background: "#fff", border: "1px solid var(--bd)", borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <div><b>{user.name}</b></div>
              <div style={{ color: "var(--ink3)", fontSize: 12 }}>{user.email}</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid var(--bd)", borderRadius: 12, padding: 12 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>Voice Input Test</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button className="ba" style={{ width: 70 }} onClick={() => setVoiceLang("en")}>EN</button>
                <button className="ba" style={{ width: 70 }} onClick={() => setVoiceLang("zh")}>中文</button>
              </div>
              <button className="ba" style={{ width: 120 }} onClick={voice.listening ? voice.stop : voice.start}>
                {voice.listening ? "Stop" : "Start Mic"}
              </button>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink3)" }}>{voice.transcript || "No transcript"}</div>
            </div>
          </div>
        )}

        {tab === "settings" && user.role === "admin" && (
          <div className="scr">
            <div style={{ background: "#fff", border: "1px solid var(--bd)", borderRadius: 12, padding: 12 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>Global Pricing</div>
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  className="s-inp"
                  type="number"
                  value={settings.motorizedFee}
                  onChange={(e) => setSettings((s) => ({ ...s, motorizedFee: parseFloat(e.target.value) || 0 }))}
                />
                <input
                  className="s-inp"
                  type="number"
                  value={settings.cordlessFee}
                  onChange={(e) => setSettings((s) => ({ ...s, cordlessFee: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <QuoteQuick settings={settings} />
          </div>
        )}

        {tab === "clients" && (
          <div className="scr">
            <div className="stats">
              <div className="stat"><div className="stat-n">{visible.length}</div><div className="stat-l">Clients</div></div>
              <div className="stat"><div className="stat-n">{visible.reduce((a, c) => a + c.windows.length, 0)}</div><div className="stat-l">Windows</div></div>
              <div className="stat"><div className="stat-n">{visible.reduce((a, c) => a + c.windows.filter((w) => (w.quotes || []).some((q) => q.quoteResult)).length, 0)}</div><div className="stat-l">Quoted</div></div>
            </div>

            <div className="sr">
              <div className="sw">
                <span className="si">🔍</span>
                <input className="s-inp" placeholder="Address, sidemark, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button className="ba" onClick={saveClient}>＋</button>
            </div>

            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              <input className="s-inp" placeholder="Address" value={cForm.address} onChange={(e) => setCForm((f) => ({ ...f, address: e.target.value }))} />
              <input className="s-inp" placeholder="Sidemark" value={cForm.sidemark} onChange={(e) => setCForm((f) => ({ ...f, sidemark: e.target.value }))} />
              <input className="s-inp" placeholder="Phone" value={cForm.phone} onChange={(e) => setCForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>

            {visible.length === 0 ? (
              <div className="empty">
                <div className="empty-i">🏠</div>
                <div style={{ fontSize: 14, color: "var(--ink3)", lineHeight: 1.8 }}>No clients yet.</div>
              </div>
            ) : (
              visible.map((c) => (
                <div key={c.id} className="cc">
                  <div className="cc-b">
                    <div className="av" style={{ background: avGrad(c.sidemark) }}>{initials(c.address)}</div>
                    <div>
                      <div className="cn">{c.address}</div>
                      <div className="csm">SM: {c.sidemark}</div>
                      <div className="cm">📱 {c.phone}</div>
                    </div>
                  </div>
                </div>
              ))
            )}

            <QuoteQuick settings={settings} />

            <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink3)" }}>
              Helpers check: `parseFrac(\"71 1/2\")` = {String(parseFrac("71 1/2"))}, minOf3 = {String(minOf3("72", "71.5", "72"))}, fmtFrac = {fmtFrac(71.5)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
