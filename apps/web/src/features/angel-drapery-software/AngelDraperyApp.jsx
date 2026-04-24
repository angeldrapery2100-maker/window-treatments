'use client';

import { useRef, useState, useCallback, useMemo } from "react";

const FABRIC_DB = {
  roller: [
    { code: "MS1-001", price: 78.15, series: "MS1", type: "Sunscreen Roller Shade" },
    { code: "MS1-002", price: 87.5, series: "MS1", type: "Sunscreen Roller Shade" },
    { code: "MS10-001", price: 49.2, series: "MS10", type: "Sunscreen Roller Shade" },
    { code: "ME1-001", price: 54.7, series: "ME1", type: "Semi-Blackout Roller Shades" },
    { code: "ME10-001", price: 58.6, series: "ME10", type: "Semi-Blackout Roller Shades" },
    { code: "MB1-001", price: 85.95, series: "MB1", type: "Blackout Roller Shades" },
    { code: "MB10-001", price: 46.9, series: "MB10", type: "Blackout Roller Shades" },
    { code: "MB30-001", price: 42.95, series: "MB30", type: "Blackout Roller Shades" }
  ],
  zebra: [
    { code: "DE1-001", price: 90.2, series: "DE1", type: "Semi-Blackout Zebra Shades" },
    { code: "DE3-001", price: 107.42, series: "DE3", type: "Semi-Blackout Zebra Shades" },
    { code: "DE20-001", price: 84.2, series: "DE20", type: "Semi-Blackout Zebra Shades" },
    { code: "DB1-001", price: 107.42, series: "DB1", type: "Blackout Zebra Shades" },
    { code: "DB8-001", price: 139.2, series: "DB8", type: "Blackout Zebra Shades" },
    { code: "DB15-001", price: 197.67, series: "DB15", type: "Blackout Zebra Shades" },
    { code: "DF1-001", price: 107.42, series: "DF1", type: "Semi-Blackout Zebra Shades" },
    { code: "DF7-001", price: 141.79, series: "DF7", type: "Semi-Blackout Zebra Shades" }
  ],
  shangrila: [
    { code: "E1-001", price: 105.45 },
    { code: "E3-001", price: 152.35 },
    { code: "ER2001", price: 59.4 },
    { code: "E9-001", price: 89.85 },
    { code: "EB10-001", price: 131.25 },
    { code: "N1-001", price: 93.75 }
  ],
  roman: [
    { code: "PE1-001", price: 105.45, series: "PE1", shading: "light filtering" },
    { code: "PE2-001", price: 105.45, series: "PE2", shading: "Semi-blackout" },
    { code: "PE8-001", price: 85.95, series: "PE8", shading: "Semi-blackout" },
    { code: "PB1-001", price: 126.55, series: "PB1", shading: "Semi-blackout" },
    { code: "PB4-001", price: 121.9, series: "PB4", shading: "Blackout" },
    { code: "PB10-001", price: 131.25, series: "PB10", shading: "99% Blackout" }
  ]
};

const SHUTTER_MATERIALS = [
  { id: "poly-vinyl", label: "Poly-Vinyl Solid Aluminum Reinforced", price: 10.25 },
  { id: "hardwood", label: "Hardwood", price: 10.25 },
  { id: "grained-paulownia", label: "Grained Paulownia", price: 10.75 },
  { id: "basswood-painted", label: "Basswood Premium Painted", price: 10.95 },
  { id: "basswood-stained", label: "Basswood Premium Stained", price: 12.75 }
];

const LOUVER_SIZES = ['2.5"', '3.5"', '4.5"', "Custom"];

const SHUTTER_COLORS = {
  paint: [
    { name: "Antique", polyVinyl: true },
    { name: "Ballet White", polyVinyl: true },
    { name: "Castle Stone", polyVinyl: false },
    { name: "Chantilly Lace", polyVinyl: true },
    { name: "Dove", polyVinyl: true },
    { name: "Grained White", polyVinyl: false },
    { name: "Oxford", polyVinyl: true },
    { name: "Swiss Coffee", polyVinyl: true },
    { name: "Urban", polyVinyl: false }
  ],
  stain: [
    { name: "American Maple" },
    { name: "Chestnut" },
    { name: "Coffee Bean" },
    { name: "Dark Walnut" },
    { name: "Mahogany" },
    { name: "Tuscany" }
  ]
};

const SHUTTER_UPGRADES = [
  { id: "u01", name: "Bay Post", price: 1.0, type: "psf", materials: ["poly-vinyl", "hardwood", "grained-paulownia", "basswood-painted", "basswood-stained"] },
  { id: "u02", name: "Bi-Fold and By-Pass Track", price: 200, type: "ea", materials: ["poly-vinyl", "hardwood", "grained-paulownia", "basswood-painted", "basswood-stained"] },
  { id: "u04", name: 'Buildout 1" - 3"', price: 1.0, type: "psf", materials: ["poly-vinyl", "hardwood", "grained-paulownia", "basswood-painted", "basswood-stained"] },
  { id: "u08", name: "Custom Paint Color", price: 190, type: "ea", materials: ["poly-vinyl", "hardwood", "basswood-painted", "basswood-stained"] },
  { id: "u09", name: "Custom Stain", price: 210, type: "ea", materials: ["basswood-stained"] },
  { id: "u14", name: "Hidden Tilt", price: 0.25, type: "psf", materials: ["poly-vinyl", "hardwood", "grained-paulownia", "basswood-painted", "basswood-stained"] },
  { id: "u15", name: "Integrated Tilt", price: 1.0, type: "psf", materials: ["poly-vinyl", "hardwood", "grained-paulownia", "basswood-painted", "basswood-stained"] },
  { id: "u19", name: "Rake", price: 160, type: "ea", materials: ["poly-vinyl", "hardwood", "grained-paulownia", "basswood-painted", "basswood-stained"] },
  { id: "u24", name: "Specialty Shapes", price: 190, type: "ea", materials: ["hardwood", "grained-paulownia", "basswood-painted", "basswood-stained"] }
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
  const gradients = [
    "linear-gradient(135deg,#1D6A6E,#0F4547)",
    "linear-gradient(135deg,#B8924A,#7A5C1E)",
    "linear-gradient(135deg,#5B3E8A,#3A2566)",
    "linear-gradient(135deg,#2A7050,#144030)"
  ];
  return gradients[(s?.charCodeAt(0) || 0) % gradients.length];
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
  const mixed = s.match(/^(\d+(?:\.\d+)?)\s*[\s-]\s*(\d+)\/(\d+)$/);
  if (mixed) return parseFloat(mixed[1]) + parseFloat(mixed[2]) / parseFloat(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseFloat(frac[1]) / parseFloat(frac[2]);
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
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
  const map = {
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
  };
  return whole + (map[frac16] ? " " + map[frac16] : "") + '"';
}

const DEFAULT_SETTINGS = {
  motorizedFee: 250,
  cordlessFee: 50,
  shutterFrames: [
    { id: "sf1", name: '2.5" Flat Z-Frame', offset: 3.5, pricePerSqFt: 10.25 },
    { id: "sf2", name: '3.5" Flat Z-Frame', offset: 3.5, pricePerSqFt: 10.25 },
    { id: "sf3", name: '4.5" Flat Z-Frame', offset: 3.5, pricePerSqFt: 10.25 },
    { id: "sf4", name: '2.5" L-Frame', offset: 2.0, pricePerSqFt: 10.25 }
  ],
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
      { id: "d2", name: "H-Rod Double Layer", pricePerM: 215 },
      { id: "d3", name: "Single Track", pricePerM: 82 },
      { id: "d4", name: "Double Track", pricePerM: 131 }
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

  let fabricCost = 0;
  let hardwareCost = 0;
  let laborCost = 0;
  let addonCost = 0;
  let breakdown = {};

  const hw = (settings.hardware[product] || []).find((h) => h.id === hardwareId);
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
    breakdown = {
      fabricCode,
      fabricPriceM2: fabric.price,
      areaM2: +areaM2.toFixed(3),
      fabricCost: +fabricCost.toFixed(2)
    };
  } else if (product === "shutter") {
    const frame = (settings.shutterFrames || []).find((f) => f.id === item.shutterFrameId);
    const offset = frame ? parseFloat(frame.offset) || 0 : 0;
    const finW = w_in + offset;
    const finH = h_in + offset;
    const finFt2 = (finW / 12) * (finH / 12);
    const basePrice = frame ? parseFloat(frame.pricePerSqFt) || 10.25 : 10.25;
    fabricCost = basePrice * finFt2;

    let upgradeCost = 0;
    (item.shutterUpgrades || []).forEach((upgradeId) => {
      const upgrade = SHUTTER_UPGRADES.find((u) => u.id === upgradeId);
      if (!upgrade) return;
      upgradeCost += upgrade.type === "psf" ? upgrade.price * finFt2 : upgrade.price;
    });

    laborCost = upgradeCost;
    breakdown = {
      frameName: frame?.name || "",
      offset,
      basePerSqFt: basePrice,
      measuredW: w_in,
      measuredH: h_in,
      finishedW: +finW.toFixed(3),
      finishedH: +finH.toFixed(3),
      finishedSqFt: +finFt2.toFixed(2),
      fabricCost: +fabricCost.toFixed(2),
      upgradeCost: +upgradeCost.toFixed(2)
    };
  } else if (product === "drapery") {
    const isSplit = panelType !== "single";
    const liningRates = {
      NO: { fabricUSD: 0, labor: 30 },
      LF: { fabricUSD: 6, labor: 36 },
      BO: { fabricUSD: 8, labor: 38 }
    };
    const rate = liningRates[lining] || liningRates.NO;
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
    const hMult = h_in < 120 ? 1 : 1.5 + (h_in - 120) / 120;
    const wMult = singlePanelCount >= 5 ? 1.5 : 1;
    const laborPerPanel = rate.labor * hMult * wMult;

    laborCost = totalPanels * laborPerPanel;
    fabricCost = (fabricPriceYd + rate.fabricUSD) * yardage;
    breakdown = {
      totalPanels,
      singlePanelCount,
      yardage,
      lining,
      hMult: +hMult.toFixed(3),
      wMult,
      laborPerPanel: +laborPerPanel.toFixed(2),
      laborCost: +laborCost.toFixed(2),
      fabricCost: +fabricCost.toFixed(2)
    };
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
    windows: [
      {
        id: "w1",
        location: "Master Bedroom - South",
        mountType: "both",
        insideW: "71.5",
        insideH: "83.5",
        outsideW: "76",
        outsideH: "88",
        panels: [
          {
            id: "p1",
            label: "Panel 1",
            insideW1: "72",
            insideW2: "71.5",
            insideW3: "72",
            insideH1: "84",
            insideH2: "84",
            insideH3: "83.5",
            outsideW1: "76",
            outsideW2: "76",
            outsideW3: "76",
            outsideH1: "88",
            outsideH2: "88",
            outsideH3: "88",
            insideW: "71.5",
            insideH: "83.5",
            outsideW: "76",
            outsideH: "88"
          }
        ],
        spaceTop: "4",
        spaceBottom: "2",
        spaceLeft: "3",
        spaceRight: "3",
        notes: "Full blackout required",
        photos: [],
        quotes: [
          {
            id: "q1",
            name: "Option A",
            isPrimary: true,
            product: "zebra",
            fabricCode: "DB1-001",
            dimSource: "inside",
            hardwareId: "z1",
            addons: { motorized: false, cordless: false },
            quoteResult: { total: 312.5, fabricCost: 245, hardwareCost: 42.5, laborCost: 0, addonCost: 25, breakdown: {} }
          }
        ]
      }
    ]
  },
  {
    id: "c2",
    createdBy: "u2",
    createdByName: "Mike Johnson",
    createdAt: "2025-03-05",
    address: "88 Wilshire Ave, Beverly Hills, CA 90210",
    sidemark: "WILS-088",
    phone: "310-555-0344",
    email: "bh@email.com",
    notes: "High-end project",
    status: "Active",
    windows: [
      {
        id: "w3",
        location: "Study - North",
        mountType: "outside",
        insideW: "",
        insideH: "",
        outsideW: "48",
        outsideH: "66",
        panels: [
          {
            id: "p1",
            label: "Panel 1",
            insideW1: "",
            insideW2: "",
            insideW3: "",
            insideH1: "",
            insideH2: "",
            insideH3: "",
            outsideW1: "48",
            outsideW2: "48",
            outsideW3: "",
            outsideH1: "66",
            outsideH2: "66",
            outsideH3: "",
            insideW: "",
            insideH: "",
            outsideW: "48",
            outsideH: "66"
          }
        ],
        spaceTop: "5",
        spaceBottom: "3",
        spaceLeft: "4",
        spaceRight: "4",
        notes: "",
        photos: [],
        quotes: []
      }
    ]
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
  十三: 13,
  十四: 14,
  十五: 15,
  十六: 16,
  十七: 17,
  十八: 18,
  十九: 19,
  二十: 20,
  二十一: 21,
  二十二: 22,
  二十三: 23,
  二十四: 24,
  二十五: 25,
  二十六: 26,
  二十七: 27,
  二十八: 28,
  二十九: 29,
  三十: 30,
  三十一: 31,
  三十六: 36,
  四十二: 42,
  四十八: 48,
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
    t.match(/(\d+(?:\.\d+)?)\s*(?:inches?|")\s*wide/i);
  const EN_IH =
    t.match(/inside\s*height\s*(\d+(?:\.\d+)?)/i) ||
    t.match(/height\s*(?:is\s*)?(\d+(?:\.\d+)?)/i) ||
    t.match(/(\d+(?:\.\d+)?)\s*(?:inches?|")\s*(?:tall|high)/i);
  const EN_OW = t.match(/outside\s*width\s*(\d+(?:\.\d+)?)/i);
  const EN_OH = t.match(/outside\s*height\s*(\d+(?:\.\d+)?)/i);
  const EN_TOP = t.match(/top\s*(?:space\s*)?(\d+(?:\.\d+)?)/i);
  const EN_BOT = t.match(/bottom\s*(?:space\s*)?(\d+(?:\.\d+)?)/i);
  const EN_L = t.match(/left\s*(?:space\s*)?(\d+(?:\.\d+)?)/i);
  const EN_R = t.match(/right\s*(?:space\s*)?(\d+(?:\.\d+)?)/i);

  const ZH_IW = text.match(/内框宽(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_IH = text.match(/内框高(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_OW = text.match(/外框宽(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_OH = text.match(/外框高(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_W = text.match(/(?:^|[，,。\s])宽(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_H = text.match(/(?:^|[，,。\s])高(?:度)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_TOP = text.match(/上(?:边)?空(?:间)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_BOT = text.match(/下(?:边)?空(?:间)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_L = text.match(/左(?:边)?空(?:间)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);
  const ZH_R = text.match(/右(?:边)?空(?:间)?[是为：: ]*([零一两二三四五六七八九十百\d]+(?:\.\d+)?)/);

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

  if (EN_TOP || ZH_TOP) res.spaceTop = parseFloat((EN_TOP || ZH_TOP)[1]) || parseCN((ZH_TOP || EN_TOP)[1]);
  if (EN_BOT || ZH_BOT) res.spaceBottom = parseFloat((EN_BOT || ZH_BOT)[1]) || parseCN((ZH_BOT || EN_BOT)[1]);
  if (EN_L || ZH_L) res.spaceLeft = parseFloat((EN_L || ZH_L)[1]) || parseCN((ZH_L || EN_L)[1]);
  if (EN_R || ZH_R) res.spaceRight = parseFloat((EN_R || ZH_R)[1]) || parseCN((ZH_R || EN_R)[1]);

  return Object.fromEntries(Object.entries(res).filter(([, v]) => v != null && !isNaN(v)));
}

function useVoice({ lang, onResult }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);
  const txRef = useRef("");

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition needs Safari iOS 16+ or Chrome.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = lang === "zh" ? "zh-CN" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onstart = () => setListening(true);
    rec.onresult = (e) => {
      const t = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setTranscript(t);
      txRef.current = t;
    };
    rec.onend = () => {
      setListening(false);
      if (txRef.current) onResult(txRef.current);
    };
    rec.onspeechend = () => rec.stop();
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    txRef.current = "";
    rec.start();
  }, [lang, onResult]);

  return { listening, transcript, setTranscript, start, stop };
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
:root{--bg:#F2EEE8;--surf:#FFFFFF;--surf2:#F7F4F0;--surf3:#EDE9E3;--ink:#1A1816;--ink2:#524D47;--ink3:#96908A;--teal:#1C686C;--tealBg:rgba(28,104,108,.09);--tealBd:rgba(28,104,108,.25);--amber:#B8772A;--amberBg:rgba(184,119,42,.09);--amberBd:rgba(184,119,42,.25);--red:#BE3A2E;--redBg:rgba(190,58,46,.07);--redBd:rgba(190,58,46,.22);--green:#256B42;--greenBg:rgba(37,107,66,.08);--greenBd:rgba(37,107,66,.22);--bd:#DDD8D0;--bd2:#CAC3BA;--r8:8px;--r12:12px;--r16:16px;--r20:20px;--s1:0 1px 3px rgba(26,24,22,.07);--s2:0 4px 16px rgba(26,24,22,.11);--s3:0 12px 40px rgba(26,24,22,.17)}
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
.l-inp:focus{border-color:rgba(28,104,108,.7);background:rgba(255,255,255,.1)}
.l-err{font-size:12px;color:#FF7878;margin-bottom:10px;padding:9px 14px;background:rgba(190,58,46,.15);border-radius:var(--r8);border:1px solid rgba(190,58,46,.3)}
.l-btn{width:100%;background:var(--teal);color:#fff;border:none;border-radius:var(--r12);padding:16px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 24px rgba(28,104,108,.4);margin-top:4px}
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
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 4px 13px;border:none;background:transparent;cursor:pointer;position:relative}
.nb::after{content:'';position:absolute;bottom:0;left:22%;right:22%;height:2px;background:var(--amber);border-radius:2px 2px 0 0;transform:scaleX(0);transition:transform .22s}
.nb.on::after{transform:scaleX(1)}
.nb-l{font-size:10px;font-weight:600;color:rgba(255,255,255,.28);transition:color .2s}
.nb.on .nb-l{color:var(--amber)}
.scr{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 14px 90px}
.scr::-webkit-scrollbar{display:none}
.sr{display:flex;gap:8px;margin-bottom:16px}
.sw{flex:1;position:relative}
.si{font-size:14px;position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none}
.s-inp{width:100%;background:var(--surf2);border:1.5px solid transparent;border-radius:var(--r12);padding:11px 13px 11px 35px;font-family:'Mulish',sans-serif;font-size:13px;color:var(--ink);outline:none}
.ba{background:var(--teal);color:#fff;border:none;border-radius:var(--r12);width:44px;height:44px;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:18px}
.stat{background:var(--surf2);border-radius:var(--r12);padding:14px 10px;text-align:center;border:1px solid var(--bd)}
.stat-n{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:var(--ink);line-height:1}
.stat-l{font-size:10px;color:var(--ink3);margin-top:4px;font-weight:600;letter-spacing:.3px}
.sh{display:flex;justify-content:space-between;align-items:center;margin-bottom:11px}
.sh-t{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:var(--ink)}
.sh-b{font-size:10px;background:var(--surf2);color:var(--ink3);padding:3px 9px;border-radius:20px;font-weight:600;border:1px solid var(--bd)}
.cc{background:#fff;border-radius:var(--r16);border:1.5px solid var(--bd);margin-bottom:10px;cursor:pointer;box-shadow:var(--s1);overflow:hidden}
.cc-b{display:flex;gap:12px;align-items:center;padding:13px 14px}
.av{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#fff;flex-shrink:0}
.ci{flex:1;min-width:0}
.cn{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.csm{font-size:11.5px;color:var(--teal);font-weight:700;margin-top:1px;font-family:'Syne',sans-serif}
.cm{font-size:11px;color:var(--ink3);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.c-by{font-size:10px;color:var(--ink3);margin-top:4px}
.c-wc{font-size:11px;color:var(--ink3);background:var(--surf2);padding:3px 9px;border-radius:20px;border:1px solid var(--bd)}
.cc-ft{border-top:1px solid var(--bd);padding:8px 14px;display:flex;gap:5px;flex-wrap:wrap;background:var(--surf2)}
.tag{font-size:10px;padding:2px 9px;border-radius:20px;font-weight:700}
.tg-teal{background:var(--tealBg);color:var(--teal);border:1px solid var(--tealBd)}
.tg-amb{background:var(--amberBg);color:var(--amber);border:1px solid var(--amberBd)}
.tg-grn{background:var(--greenBg);color:var(--green);border:1px solid var(--greenBd)}
.tg-stone{background:var(--surf2);color:var(--ink3);border:1px solid var(--bd)}
.ov{position:fixed;inset:0;background:rgba(26,24,22,.55);z-index:200;display:flex;align-items:flex-end;backdrop-filter:blur(6px)}
.sht{background:var(--surf);border-radius:24px 24px 0 0;width:100%;max-height:94vh;overflow-y:auto;padding-bottom:48px}
.mh{width:36px;height:4px;background:var(--bd);border-radius:4px;margin:13px auto 0}
.mhdr{padding:18px 18px 14px;border-bottom:1px solid var(--bd);display:flex;align-items:flex-start;justify-content:space-between}
.mt{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--ink)}
.ms{font-size:12px;color:var(--ink3);margin-top:3px}
.bx{background:var(--surf2);border:none;border-radius:50%;width:30px;height:30px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink)}
.fs{padding:14px 18px 0}
.fst{font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--teal);margin-bottom:10px;display:flex;align-items:center;gap:7px}
.fst::after{content:'';flex:1;height:1px;background:var(--bd)}
.fg{display:flex;flex-direction:column;gap:5px;margin-bottom:10px}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}
.fl{font-size:10.5px;font-weight:700;color:var(--ink3);letter-spacing:.4px}
.req{color:var(--red);margin-left:2px}
.fi,.fsel,.fta{background:var(--surf2);border:1.5px solid transparent;border-radius:var(--r8);padding:11px 13px;font-family:'Mulish',sans-serif;font-size:14px;color:var(--ink);outline:none;width:100%}
.fta{resize:none;min-height:64px;line-height:1.6}
.seg{display:flex;background:var(--surf2);border-radius:var(--r8);padding:3px;margin-bottom:14px;border:1px solid var(--bd)}
.seg-b{flex:1;padding:8px 4px;border:none;background:transparent;border-radius:6px;font-family:'Mulish',sans-serif;font-size:11px;font-weight:600;color:var(--ink3);cursor:pointer;text-align:center}
.seg-b.on{background:#fff;color:var(--ink);box-shadow:var(--s1)}
.prod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.prod-card{border:1.5px solid var(--bd);border-radius:var(--r12);padding:14px 8px;text-align:center;cursor:pointer;background:#fff}
.prod-card.sel{border-color:var(--teal);background:var(--tealBg)}
.pc-i{font-size:26px;margin-bottom:6px}
.pc-l{font-size:11px;font-weight:700;color:var(--ink);line-height:1.3}
.fab-results{background:#fff;border:1.5px solid var(--bd);border-radius:var(--r12);max-height:220px;overflow-y:auto;box-shadow:var(--s2)}
.fab-item{padding:10px 14px;border-bottom:1px solid var(--bd);cursor:pointer;display:flex;justify-content:space-between;align-items:center}
.fab-item:last-child{border-bottom:none}
.fab-item.sel{background:var(--tealBg)}
.fab-code{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--ink)}
.fab-meta{font-size:10px;color:var(--ink3);margin-top:1px}
.fab-price{font-size:12px;font-weight:700;color:var(--teal)}
.fab-selected{background:var(--tealBg);border:1.5px solid var(--tealBd);border-radius:var(--r8);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.qsum{background:var(--surf2);border:1.5px solid var(--bd);border-radius:var(--r12);overflow:hidden}
.qsum-row{display:flex;justify-content:space-between;align-items:center;padding:9px 14px;border-bottom:1px solid var(--bd)}
.qsum-row:last-child{border-bottom:none;background:var(--tealBg)}
.qsum-l{font-size:12px;color:var(--ink3)}
.qsum-v{font-size:13px;font-weight:700;color:var(--ink)}
.qsum-v.total{font-size:16px;color:var(--teal);font-family:'Syne',sans-serif;font-weight:800}
.wc{background:var(--surf2);border:1.5px solid var(--bd);border-radius:var(--r16);margin-bottom:10px;overflow:hidden}
.wc-hdr{background:#fff;border-bottom:1px solid var(--bd);padding:12px 14px;display:flex;justify-content:space-between;align-items:center}
.wc-loc{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:var(--ink);display:flex;align-items:center;gap:7px}
.wc-dims{display:flex;gap:6px;flex-wrap:wrap;padding:9px 14px}
.wd{font-size:11px;padding:3px 9px;border-radius:20px;background:#fff;border:1px solid var(--bd);color:var(--ink);display:flex;align-items:center;gap:3px}
.wd b{font-weight:700;color:var(--teal)}
.wc-note{padding:0 14px 10px;font-size:12px;color:var(--ink3);font-style:italic}
.dsec{padding:13px 18px;border-bottom:1px solid var(--bd)}
.dst{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--teal);margin-bottom:9px}
.dkv{display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;gap:8px}
.dk{font-size:13px;color:var(--ink3)}
.dv{font-size:13px;color:var(--ink);font-weight:700;text-align:right}
.dv.grn{color:var(--green)}
.addon-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.addon-btn{flex:1;min-width:120px;border:1.5px solid var(--bd);border-radius:var(--r8);padding:10px 12px;background:#fff;cursor:pointer;display:flex;align-items:center;gap:8px}
.addon-btn.on{border-color:var(--teal);background:var(--tealBg)}
.addon-check{width:18px;height:18px;border-radius:4px;border:2px solid var(--bd);flex-shrink:0;display:flex;align-items:center;justify-content:center}
.addon-btn.on .addon-check{background:var(--teal);border-color:var(--teal);color:#fff;font-size:11px}
.addon-label{font-size:12px;font-weight:700;color:var(--ink)}
.addon-price{font-size:11px;color:var(--ink3)}
.set-section{background:#fff;border-radius:var(--r16);border:1.5px solid var(--bd);overflow:hidden;margin-bottom:14px}
.set-hdr{padding:14px 16px;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;align-items:center}
.set-hdr-t{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:var(--ink)}
.set-row{padding:11px 16px;border-bottom:1px solid var(--bd);display:flex;align-items:center;gap:10px;justify-content:space-between}
.set-row:last-child{border-bottom:none}
.set-name{font-size:13px;color:var(--ink);font-weight:600;flex:1}
.set-sub{font-size:10px;color:var(--ink3)}
.set-inp{width:90px;background:var(--surf2);border:1.5px solid var(--bd);border-radius:var(--r8);padding:7px 10px;font-family:'Mulish',sans-serif;font-size:13px;color:var(--ink);outline:none;text-align:right}
.set-add{display:flex;align-items:center;gap:6px;padding:10px 16px;cursor:pointer;color:var(--teal);font-size:12px;font-weight:700}
.set-del{background:none;border:none;color:var(--red);font-size:16px;cursor:pointer;padding:0 4px}
.set-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:12px 16px 0}
.set-tab{padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid var(--bd);background:var(--surf2);color:var(--ink3)}
.set-tab.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.notif{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:11px 22px;border-radius:30px;font-size:13px;font-weight:600;z-index:999;white-space:nowrap;box-shadow:var(--s3)}
.empty{text-align:center;padding:52px 20px;color:var(--ink3)}
.empty-i{font-size:42px;margin-bottom:14px;opacity:.55}
.prof-card{background:#fff;border-radius:var(--r16);border:1.5px solid var(--bd);padding:20px;margin-bottom:12px;display:flex;gap:16px;align-items:center}
.prof-av{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#fff}
.prof-name{font-family:'Syne',sans-serif;font-weight:800;font-size:19px;color:var(--ink)}
.lo-btn{background:var(--redBg);color:var(--red);border:1px solid var(--redBd);border-radius:var(--r8);padding:8px 16px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer}
.acts{display:flex;gap:9px;padding:14px 18px 0}
.bp{flex:1;background:var(--teal);color:#fff;border:none;border-radius:var(--r12);padding:14px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer}
.bp.amb{background:var(--amber)}
.bp.grn{background:var(--green)}
.bs{background:var(--surf2);color:var(--ink);border:1.5px solid var(--bd);border-radius:var(--r12);padding:14px 16px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer}
.bdel{background:var(--redBg);color:var(--red);border:1.5px solid var(--redBd);border-radius:var(--r8);padding:6px 12px;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;cursor:pointer}
.voice-box{background:var(--surf2);border:1.5px solid var(--bd);border-radius:var(--r16);padding:14px}
.voice-hint{font-size:11.5px;color:var(--ink3);line-height:1.7;margin-bottom:10px}
.voice-hint em{color:var(--ink2);font-style:normal;font-weight:600}
.voice-ctrl{display:flex;gap:10px;align-items:center}
.voice-lang{display:flex;background:var(--surf3);border-radius:var(--r8);padding:2px;border:1px solid var(--bd);flex-shrink:0}
.vl-btn{padding:6px 10px;border:none;background:transparent;border-radius:6px;font-size:11px;font-weight:700;color:var(--ink3);cursor:pointer}
.vl-btn.on{background:#fff;color:var(--ink);box-shadow:var(--s1)}
.voice-transcript{flex:1;min-height:36px;font-size:12px;color:var(--ink2);line-height:1.6;font-style:italic;padding:0 4px}
.mic-btn{width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.mic-btn.idle{background:#fff;border:1.5px solid var(--bd)}
.mic-btn.rec{background:var(--red)}
.space-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:6px}
.sdiag{position:relative;width:200px;height:200px}
.sdiag-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:84px;height:84px;border:2px dashed var(--bd2);border-radius:8px;background:var(--surf2);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--ink3);text-align:center;line-height:1.4;font-weight:600;letter-spacing:.5px;text-transform:uppercase}
.sdc{position:absolute;background:#fff;border:1.5px solid var(--bd);border-radius:10px;display:flex;flex-direction:column;align-items:center;padding:6px 9px;min-width:54px;box-shadow:var(--s1)}
.sdc.t{top:0;left:50%;transform:translateX(-50%)}
.sdc.b{bottom:0;left:50%;transform:translateX(-50%)}
.sdc.l{left:0;top:50%;transform:translateY(-50%)}
.sdc.r{right:0;top:50%;transform:translateY(-50%)}
.sdc-l{font-size:8px;font-weight:700;color:var(--ink3);letter-spacing:.5px;text-transform:uppercase;margin-bottom:2px}
.sdc-f{width:44px;border:none;background:transparent;text-align:center;font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--ink);outline:none}
.sdc-u{font-size:8px;color:var(--teal);font-weight:700}
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
      .filter((f) =>
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
        <div className="fab-selected">
          <div>
            <div className="fab-code">{selected.code}</div>
            <div className="fab-meta">
              {selected.series || ""} {selected.type || selected.shading || ""}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="fab-price">${selected.price}/m²</div>
            <button className="bdel" onClick={() => { onChange(null); setQ(""); setOpen(false); }}>
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="fab-search-wrap">
          <div className="sw" style={{ marginBottom: 8 }}>
            <span className="si">🔍</span>
            <input
              className="s-inp"
              placeholder="Search fabric code (e.g. DE1, MB3...)"
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
            />
          </div>
          {open && results.length > 0 && (
            <div className="fab-results">
              {results.map((f) => (
                <div
                  key={f.code}
                  className={`fab-item ${f.code === value ? "sel" : ""}`}
                  onClick={() => { onChange(f.code); setOpen(false); setQ(""); }}
                >
                  <div>
                    <div className="fab-code">{f.code}</div>
                    <div className="fab-meta">
                      {f.series || ""} {f.type || f.shading || ""}
                    </div>
                  </div>
                  <div className="fab-price">${f.price}/m²</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminSettings({ settings, onSave }) {
  const [state, setState] = useState(() => JSON.parse(JSON.stringify(settings)));
  const [hwTab, setHwTab] = useState("roller");
  const hwProducts = [
    { id: "roller", l: "Roller" },
    { id: "zebra", l: "Zebra" },
    { id: "shangrila", l: "Sheer" },
    { id: "roman", l: "Roman" },
    { id: "drapery", l: "Drapery" }
  ];

  const updateHW = (product, id, field, val) => {
    setState((prev) => {
      const hw = { ...prev.hardware };
      hw[product] = hw[product].map((h) =>
        h.id === id
          ? { ...h, [field]: field === "pricePerM" || field === "pricePerSqFt" ? parseFloat(val) || 0 : val }
          : h
      );
      return { ...prev, hardware: hw };
    });
  };

  const addHW = (product) => {
    setState((prev) => {
      const hw = { ...prev.hardware };
      hw[product] = [...(hw[product] || []), { id: uid(), name: "New Option", pricePerM: 0 }];
      return { ...prev, hardware: hw };
    });
  };

  const delHW = (product, id) => {
    setState((prev) => {
      const hw = { ...prev.hardware };
      hw[product] = hw[product].filter((h) => h.id !== id);
      return { ...prev, hardware: hw };
    });
  };

  const addFrame = () => {
    setState((prev) => ({
      ...prev,
      shutterFrames: [...(prev.shutterFrames || []), { id: uid(), name: "New Frame", offset: 0, pricePerSqFt: 10.25 }]
    }));
  };

  const updateFrame = (id, field, val) => {
    setState((prev) => ({
      ...prev,
      shutterFrames: (prev.shutterFrames || []).map((frame) =>
        frame.id === id
          ? { ...frame, [field]: ["offset", "pricePerSqFt"].includes(field) ? parseFloat(val) || 0 : val }
          : frame
      )
    }));
  };

  const delFrame = (id) => {
    setState((prev) => ({
      ...prev,
      shutterFrames: (prev.shutterFrames || []).filter((frame) => frame.id !== id)
    }));
  };

  return (
    <div className="scr">
      <div className="set-section">
        <div className="set-hdr">
          <span className="set-hdr-t">Global Pricing</span>
        </div>
        {[
          { k: "motorizedFee", l: "Motorized Add-on", u: "$/window" },
          { k: "cordlessFee", l: "Cordless Add-on", u: "$/window" }
        ].map(({ k, l, u }) => (
          <div key={k} className="set-row">
            <div>
              <div className="set-name">{l}</div>
              <div className="set-sub">{u}</div>
            </div>
            <input
              className="set-inp"
              type="number"
              step="0.5"
              value={state[k] || 0}
              onChange={(e) => setState((prev) => ({ ...prev, [k]: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        ))}
      </div>

      <div className="set-section">
        <div className="set-hdr">
          <span className="set-hdr-t">Shutter Frames</span>
          <span style={{ fontSize: 10, color: "var(--ink3)" }}>name · offset · $/ft²</span>
        </div>
        {(state.shutterFrames || []).map((frame) => (
          <div key={frame.id} className="set-row">
            <input className="fi" style={{ flex: 1 }} value={frame.name} onChange={(e) => updateFrame(frame.id, "name", e.target.value)} />
            <input className="set-inp" type="number" step="0.25" value={frame.offset} onChange={(e) => updateFrame(frame.id, "offset", e.target.value)} />
            <input className="set-inp" type="number" step="0.25" value={frame.pricePerSqFt} onChange={(e) => updateFrame(frame.id, "pricePerSqFt", e.target.value)} />
            <button className="set-del" onClick={() => delFrame(frame.id)}>✕</button>
          </div>
        ))}
        <div className="set-add" onClick={addFrame}>＋ Add Frame</div>
      </div>

      <div className="set-section">
        <div className="set-hdr">
          <span className="set-hdr-t">Hardware</span>
        </div>
        <div className="set-tabs">
          {hwProducts.map((p) => (
            <button key={p.id} className={`set-tab ${hwTab === p.id ? "on" : ""}`} onClick={() => setHwTab(p.id)}>
              {p.l}
            </button>
          ))}
        </div>
        <div style={{ paddingTop: 12 }}>
          {(state.hardware[hwTab] || []).map((hw) => (
            <div key={hw.id} className="set-row">
              <input className="fi" style={{ flex: 1 }} value={hw.name} onChange={(e) => updateHW(hwTab, hw.id, "name", e.target.value)} />
              <input className="set-inp" type="number" step="1" value={hw.pricePerM || 0} onChange={(e) => updateHW(hwTab, hw.id, "pricePerM", e.target.value)} />
              <button className="set-del" onClick={() => delHW(hwTab, hw.id)}>✕</button>
            </div>
          ))}
          <div className="set-add" onClick={() => addHW(hwTab)}>＋ Add Option</div>
        </div>
      </div>

      <div className="acts" style={{ paddingBottom: 16 }}>
        <button className="bp grn" onClick={() => onSave(state)}>Save Settings</button>
      </div>
    </div>
  );
}

function ShutterQuoteSection({ state, onChange, settings, w_in, h_in }) {
  const { shutterMaterial, shutterColor, shutterLouver, shutterUpgrades = [], shutterFrameId } = state;
  const isPolyVinyl = shutterMaterial === "poly-vinyl";
  const frames = settings.shutterFrames || [];
  const selectedFrame = frames.find((frame) => frame.id === shutterFrameId);
  const offset = selectedFrame ? parseFloat(selectedFrame.offset) || 0 : 0;
  const finFt2 = ((w_in + offset) / 12) * ((h_in + offset) / 12);
  const availPaint = SHUTTER_COLORS.paint.filter((c) => (isPolyVinyl ? c.polyVinyl : true));
  const availStain = !isPolyVinyl ? SHUTTER_COLORS.stain : [];
  const availUpgrades = SHUTTER_UPGRADES.filter((u) => u.materials.includes(shutterMaterial));

  const toggle = (key, val) => onChange({ ...state, [key]: val });
  const toggleUpgrade = (upgradeId) => {
    const next = shutterUpgrades.includes(upgradeId)
      ? shutterUpgrades.filter((id) => id !== upgradeId)
      : [...shutterUpgrades, upgradeId];
    onChange({ ...state, shutterUpgrades: next });
  };

  return (
    <>
      <div className="fs" style={{ marginTop: 14 }}>
        <div className="fst">Frame</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {frames.map((frame) => (
            <div
              key={frame.id}
              className={`addon-btn ${shutterFrameId === frame.id ? "on" : ""}`}
              style={{ minWidth: "unset", flex: "unset" }}
              onClick={() => toggle("shutterFrameId", frame.id)}
            >
              <div className="addon-check">{shutterFrameId === frame.id && "✓"}</div>
              <div style={{ flex: 1 }}>
                <div className="addon-label">{frame.name}</div>
                <div className="addon-price">+{frame.offset}" finish offset</div>
              </div>
              <div className="fab-price">${frame.pricePerSqFt}/ft²</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fs" style={{ marginTop: 14 }}>
        <div className="fst">Material</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SHUTTER_MATERIALS.map((material) => (
            <div
              key={material.id}
              className={`addon-btn ${shutterMaterial === material.id ? "on" : ""}`}
              style={{ minWidth: "unset", flex: "unset" }}
              onClick={() => onChange({ ...state, shutterMaterial: material.id, shutterColor: "", shutterUpgrades: [] })}
            >
              <div className="addon-check">{shutterMaterial === material.id && "✓"}</div>
              <div style={{ flex: 1 }}>
                <div className="addon-label">{material.label}</div>
              </div>
              <div className="fab-price">${material.price}/ft²</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fs" style={{ marginTop: 14 }}>
        <div className="fst">Louver Size</div>
        <div className="seg">
          {LOUVER_SIZES.map((size) => (
            <button key={size} className={`seg-b ${shutterLouver === size ? "on" : ""}`} onClick={() => toggle("shutterLouver", size)}>
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="fs" style={{ marginTop: 14 }}>
        <div className="fst">Color</div>
        {availPaint.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink3)", marginBottom: 6 }}>Paint</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
              {availPaint.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggle("shutterColor", color.name)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: 20,
                    fontSize: 11,
                    border: `1.5px solid ${shutterColor === color.name ? "var(--teal)" : "var(--bd)"}`,
                    background: shutterColor === color.name ? "var(--tealBg)" : "#fff"
                  }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </>
        )}
        {availStain.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink3)", marginBottom: 6 }}>Stain</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {availStain.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggle("shutterColor", color.name)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: 20,
                    fontSize: 11,
                    border: `1.5px solid ${shutterColor === color.name ? "var(--amber)" : "var(--bd)"}`,
                    background: shutterColor === color.name ? "var(--amberBg)" : "#fff"
                  }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="fs" style={{ marginTop: 14 }}>
        <div className="fst">Upgrades</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {availUpgrades.map((upgrade) => {
            const sel = shutterUpgrades.includes(upgrade.id);
            const cost = upgrade.type === "psf" && finFt2 > 0 ? ` = $${(upgrade.price * finFt2).toFixed(2)}` : "";
            return (
              <div
                key={upgrade.id}
                className={`addon-btn ${sel ? "on" : ""}`}
                style={{ minWidth: "unset", flex: "unset" }}
                onClick={() => toggleUpgrade(upgrade.id)}
              >
                <div className="addon-check">{sel && "✓"}</div>
                <div style={{ flex: 1 }}>
                  <div className="addon-label">{upgrade.name}</div>
                  <div className="addon-price">
                    {upgrade.type === "psf" ? `$${upgrade.price}/ft²` : `$${upgrade.price} each`}
                    {cost ? <span style={{ color: "var(--teal)", fontWeight: 700 }}> {cost}</span> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function QuoteForm({ win, existingQuote, client, allWindows, settings, onSave, onCancel }) {
  const existingQ = existingQuote || {};
  const [product, setProduct] = useState(existingQ.product || "");
  const [fabricCode, setFabricCode] = useState(existingQ.fabricCode || null);
  const [dimSource, setDimSource] = useState(existingQ.dimSource || "inside");
  const [hardwareId, setHardwareId] = useState(existingQ.hardwareId || "");
  const [addons, setAddons] = useState(existingQ.addons || { motorized: false, cordless: false });
  const [lining, setLining] = useState(existingQ.lining || "NO");
  const [panelType, setPanelType] = useState(existingQ.panelType || "split");
  const [fabricPriceYd, setFabricPriceYd] = useState(existingQ.fabricPriceYd || "");
  const [shutterState, setShutterState] = useState({
    shutterMaterial: existingQ.shutterMaterial || "poly-vinyl",
    shutterColor: existingQ.shutterColor || "",
    shutterLouver: existingQ.shutterLouver || '3.5"',
    shutterUpgrades: existingQ.shutterUpgrades || [],
    shutterFrameId: existingQ.shutterFrameId || (settings.shutterFrames?.[0]?.id || "")
  });
  const [copyOpen, setCopyOpen] = useState(false);

  const prod = PRODUCTS.find((p) => p.id === product);
  const panels = win.panels || [{ id: "p0", insideW: win.insideW, insideH: win.insideH, outsideW: win.outsideW, outsideH: win.outsideH, label: "Panel 1" }];
  const panelDims = panels.map((panel) => ({
    w_in: dimSource === "inside" ? parseFrac(panel.insideW) || 0 : parseFrac(panel.outsideW) || 0,
    h_in: dimSource === "inside" ? parseFrac(panel.insideH) || 0 : parseFrac(panel.outsideH) || 0,
    label: panel.label || "Panel"
  }));
  const hasInside = panels.some((p) => p.insideW && p.insideH);
  const hasOutside = panels.some((p) => p.outsideW && p.outsideH);

  const panelResults = panelDims.map(({ w_in, h_in, label }) => {
    const item = {
      product,
      fabricCode,
      dimSource,
      w_in,
      h_in,
      hardwareId,
      addons,
      lining,
      panelType,
      fabricPriceYd: parseFloat(fabricPriceYd) || 0,
      ...shutterState
    };
    const result = product && w_in > 0 && h_in > 0 ? calcQuote(item, settings) : null;
    return { label, w_in, h_in, result };
  });

  const validResults = panelResults.filter((p) => p.result);
  const totalResult = validResults.length
    ? {
        total: +validResults.reduce((sum, p) => sum + p.result.total, 0).toFixed(2),
        fabricCost: +validResults.reduce((sum, p) => sum + p.result.fabricCost, 0).toFixed(2),
        hardwareCost: +validResults.reduce((sum, p) => sum + p.result.hardwareCost, 0).toFixed(2),
        laborCost: +validResults.reduce((sum, p) => sum + p.result.laborCost, 0).toFixed(2),
        addonCost: +validResults.reduce((sum, p) => sum + p.result.addonCost, 0).toFixed(2),
        breakdown: validResults[0].result.breakdown
      }
    : null;

  const hwOptions = settings.hardware[product] || [];
  const canSave = product && totalResult && totalResult.total > 0;
  const otherWindows = (allWindows || []).filter((w) => w.id !== win.id && (w.quotes || []).some((q) => q.product));

  const copyFrom = (srcWin) => {
    const q = (srcWin.quotes || []).find((quote) => quote.isPrimary) || (srcWin.quotes || [])[0];
    if (!q) return;
    setProduct(q.product || "");
    setFabricCode(q.fabricCode || null);
    setDimSource(q.dimSource || "inside");
    setHardwareId(q.hardwareId || "");
    setAddons(q.addons || { motorized: false, cordless: false });
    setLining(q.lining || "NO");
    setPanelType(q.panelType || "split");
    setFabricPriceYd(q.fabricPriceYd || "");
    setShutterState({
      shutterMaterial: q.shutterMaterial || "poly-vinyl",
      shutterColor: q.shutterColor || "",
      shutterLouver: q.shutterLouver || '3.5"',
      shutterUpgrades: q.shutterUpgrades || [],
      shutterFrameId: q.shutterFrameId || (settings.shutterFrames?.[0]?.id || "")
    });
    setCopyOpen(false);
  };

  return (
    <div className="sht">
      <div className="mh" />
      <div className="mhdr">
        <div>
          <div className="mt">Quote Window</div>
          <div className="ms">
            {win.location} · {client.sidemark}
            {panels.length > 1 ? <span style={{ marginLeft: 6, color: "var(--teal)", fontWeight: 700 }}>{panels.length} panels</span> : null}
          </div>
        </div>
        <button className="bx" onClick={onCancel}>×</button>
      </div>

      {otherWindows.length > 0 ? (
        <div style={{ margin: "0 18px", position: "relative" }}>
          <button
            onClick={() => setCopyOpen((open) => !open)}
            style={{ width: "100%", padding: "9px 14px", background: "var(--surf2)", border: "1.5px solid var(--bd)", borderRadius: "var(--r8)", fontSize: 12, fontWeight: 700, marginBottom: copyOpen ? 0 : 14 }}
          >
            Copy settings from another window {copyOpen ? "▲" : "▼"}
          </button>
          {copyOpen ? (
            <div style={{ background: "#fff", border: "1.5px solid var(--teal)", borderRadius: "var(--r8)", marginBottom: 14, overflow: "hidden" }}>
              {otherWindows.map((w) => {
                const q0 = (w.quotes || []).find((q) => q.isPrimary) || (w.quotes || [])[0];
                const p = PRODUCTS.find((x) => x.id === q0?.product);
                return (
                  <div key={w.id} onClick={() => copyFrom(w)} style={{ padding: "10px 14px", borderBottom: "1px solid var(--bd)", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{p?.icon || "🪟"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{w.location}</div>
                      <div style={{ fontSize: 11, color: "var(--ink3)" }}>{p?.label}{q0?.fabricCode ? ` · ${q0.fabricCode}` : ""}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--teal)" }}>Copy</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="fs">
        <div className="fst">Product Type</div>
        <div className="prod-grid">
          {PRODUCTS.map((p) => (
            <div key={p.id} className={`prod-card ${product === p.id ? "sel" : ""}`} onClick={() => { setProduct(p.id); setFabricCode(null); setHardwareId(""); }}>
              <div className="pc-i">{p.icon}</div>
              <div className="pc-l">{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      {product ? (
        <>
          <div className="fs" style={{ marginTop: 16 }}>
            <div className="fst">Dimension Source</div>
            <div className="seg">
              {hasInside ? <button className={`seg-b ${dimSource === "inside" ? "on" : ""}`} onClick={() => setDimSource("inside")}>Inside Frame</button> : null}
              {hasOutside ? <button className={`seg-b ${dimSource === "outside" ? "on" : ""}`} onClick={() => setDimSource("outside")}>Outside Frame</button> : null}
            </div>
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
              {panelDims.map(({ label, w_in, h_in }, i) =>
                w_in > 0 && h_in > 0 ? (
                  <div key={i} style={{ fontSize: 11, color: "var(--ink3)", display: "flex", gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "var(--ink2)", minWidth: 60 }}>{label}</span>
                    <span>{fmtFrac(w_in)} × {fmtFrac(h_in)}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {prod?.hasFabric ? (
            <div className="fs" style={{ marginTop: 14 }}>
              <div className="fst">Fabric</div>
              <FabricPicker productKey={prod.fabricKey} value={fabricCode} onChange={setFabricCode} />
            </div>
          ) : null}

          {product === "shutter" ? (
            <ShutterQuoteSection state={shutterState} onChange={setShutterState} settings={settings} w_in={panelDims[0]?.w_in || 0} h_in={panelDims[0]?.h_in || 0} />
          ) : null}

          {product === "drapery" ? (
            <div className="fs" style={{ marginTop: 14 }}>
              <div className="fst">Drapery Details</div>
              <div className="fg2">
                <div className="fg" style={{ margin: 0 }}>
                  <label className="fl">Fabric Price ($/yard)<span className="req"> *</span></label>
                  <input className="fi" type="number" step="0.5" placeholder="e.g. 25.00" value={fabricPriceYd} onChange={(e) => setFabricPriceYd(e.target.value)} />
                </div>
                <div className="fg" style={{ margin: 0 }}>
                  <label className="fl">Panel Type</label>
                  <select className="fsel" value={panelType} onChange={(e) => setPanelType(e.target.value)}>
                    <option value="split">Split</option>
                    <option value="single">Single</option>
                  </select>
                </div>
              </div>
              <div className="fg">
                <label className="fl">Lining</label>
                <div className="seg">
                  {[["NO", "No Lining"], ["LF", "Light Filter"], ["BO", "Blackout"]].map(([v, l]) => (
                    <button key={v} className={`seg-b ${lining === v ? "on" : ""}`} onClick={() => setLining(v)}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {hwOptions.length > 0 && product !== "shutter" ? (
            <div className="fs" style={{ marginTop: 14 }}>
              <div className="fst">Hardware</div>
              <select className="fsel" value={hardwareId} onChange={(e) => setHardwareId(e.target.value)} style={{ marginBottom: 8 }}>
                <option value="">— No hardware —</option>
                {hwOptions.map((hw) => (
                  <option key={hw.id} value={hw.id}>
                    {hw.name} (+${hw.pricePerM != null ? `${hw.pricePerM}/m` : `${hw.pricePerSqFt}/sqft`})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {product !== "shutter" ? (
            <div className="fs" style={{ marginTop: 14 }}>
              <div className="fst">Add-ons</div>
              <div className="addon-row">
                {[
                  { k: "motorized", l: "Motorized", price: settings.motorizedFee },
                  { k: "cordless", l: "Cordless", price: settings.cordlessFee }
                ].map(({ k, l, price }) => (
                  <div key={k} className={`addon-btn ${addons[k] ? "on" : ""}`} onClick={() => setAddons((prev) => ({ ...prev, [k]: !prev[k] }))}>
                    <div className="addon-check">{addons[k] && "✓"}</div>
                    <div>
                      <div className="addon-label">{l}</div>
                      <div className="addon-price">+${price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {totalResult ? (
            <div className="fs" style={{ marginTop: 16 }}>
              <div className="fst">Quote Breakdown</div>
              <div className="qsum">
                {product === "shutter" ? (
                  <>
                    <div className="qsum-row">
                      <span className="qsum-l">Shutter ({totalResult.breakdown?.finishedSqFt} ft² × ${totalResult.breakdown?.basePerSqFt}/ft²)</span>
                      <span className="qsum-v">{fmt(totalResult.fabricCost)}</span>
                    </div>
                    {totalResult.laborCost > 0 ? (
                      <div className="qsum-row">
                        <span className="qsum-l">Upgrades</span>
                        <span className="qsum-v">{fmt(totalResult.laborCost)}</span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    {totalResult.fabricCost > 0 ? <div className="qsum-row"><span className="qsum-l">Fabric</span><span className="qsum-v">{fmt(totalResult.fabricCost)}</span></div> : null}
                    {totalResult.hardwareCost > 0 ? <div className="qsum-row"><span className="qsum-l">Hardware</span><span className="qsum-v">{fmt(totalResult.hardwareCost)}</span></div> : null}
                    {totalResult.laborCost > 0 ? <div className="qsum-row"><span className="qsum-l">Labor</span><span className="qsum-v">{fmt(totalResult.laborCost)}</span></div> : null}
                    {totalResult.addonCost > 0 ? <div className="qsum-row"><span className="qsum-l">Add-ons</span><span className="qsum-v">{fmt(totalResult.addonCost)}</span></div> : null}
                  </>
                )}
                <div className="qsum-row">
                  <span className="qsum-l" style={{ fontWeight: 700, color: "var(--ink)" }}>
                    Total
                    {panels.length > 1 ? <span style={{ fontWeight: 400, fontSize: 10, color: "var(--ink3)" }}> ({panels.length} panels)</span> : null}
                  </span>
                  <span className="qsum-v total">{fmt(totalResult.total)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ margin: "14px 18px 0", padding: 12, background: "var(--amberBg)", border: "1.5px solid var(--amberBd)", borderRadius: "var(--r8)", fontSize: 12, color: "var(--amber)" }}>
              {prod?.hasFabric && !fabricCode ? "Please select a fabric" : product === "drapery" && !fabricPriceYd ? "Please enter fabric price" : "Please check dimensions"}
            </div>
          )}
        </>
      ) : null}

      <div className="acts">
        <button className="bs" onClick={onCancel}>Cancel</button>
        <button
          className={`bp ${canSave ? "" : " amb"}`}
          disabled={!canSave}
          style={{ opacity: canSave ? 1 : 0.5 }}
          onClick={() =>
            onSave(
              {
                product,
                fabricCode,
                dimSource,
                hardwareId,
                addons,
                lining,
                panelType,
                fabricPriceYd: parseFloat(fabricPriceYd) || 0,
                ...shutterState
              },
              totalResult,
              existingQ.id
            )
          }
        >
          {canSave ? `Save Quote ${fmt(totalResult?.total)}` : "Complete quote to save"}
        </button>
      </div>
    </div>
  );
}

export default function AngelDraperyApp() {
  const [user, setUser] = useState(null);
  const [lForm, setLForm] = useState({ email: "", password: "" });
  const [lErr, setLErr] = useState("");
  const [clients, setClients] = useState(SAMPLES);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tab, setTab] = useState("clients");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selClient, setSelClient] = useState(null);
  const [selWin, setSelWin] = useState(null);
  const [cForm, setCForm] = useState(blankClient());
  const [wForm, setWForm] = useState(blankWindow());
  const [voiceLang, setVoiceLang] = useState("en");
  const [notif, setNotif] = useState(null);
  const [selQuote, setSelQuote] = useState(null);

  const toast = useCallback((msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 2800);
  }, []);

  const onVoiceResult = useCallback((text) => {
    const parsed = parseVoice(text);
    if (Object.keys(parsed).length > 0) {
      setWForm((prev) => {
        const next = { ...prev };
        Object.entries(parsed).forEach(([k, v]) => {
          if (v != null) next[k] = String(v);
        });
        return next;
      });
    }
  }, []);

  const voice = useVoice({ lang: voiceLang, onResult: onVoiceResult });

  const doLogin = () => {
    const found = USERS.find((u) => u.email.trim() === lForm.email.trim() && u.password === lForm.password);
    if (!found) {
      setLErr("Invalid email or password");
      return;
    }
    setUser(found);
    setLErr("");
  };

  const doLogout = () => {
    setUser(null);
    setTab("clients");
    setModal(null);
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
      toast("Address required");
      return;
    }
    if (!cForm.sidemark.trim()) {
      toast("Sidemark required");
      return;
    }
    if (!cForm.phone.trim()) {
      toast("Phone required");
      return;
    }

    const nextClient = {
      id: uid(),
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString().slice(0, 10),
      ...cForm,
      status: "Active",
      windows: []
    };
    setClients((prev) => [nextClient, ...prev]);
    setModal(null);
    setCForm(blankClient());
    toast("Client created");
  };

  const saveWindow = () => {
    if (!wForm.location.trim()) {
      toast("Location required");
      return;
    }

    const isEdit = !!selWin;
    const savedPanels = (wForm.panels || []).map((panel) => ({
      ...panel,
      insideW: String(minOf3(panel.insideW1, panel.insideW2, panel.insideW3) || ""),
      insideH: String(minOf3(panel.insideH1, panel.insideH2, panel.insideH3) || ""),
      outsideW: String(minOf3(panel.outsideW1, panel.outsideW2, panel.outsideW3) || ""),
      outsideH: String(minOf3(panel.outsideH1, panel.outsideH2, panel.outsideH3) || "")
    }));
    const firstPanel = savedPanels[0] || {};
    const nextWindow = {
      ...wForm,
      panels: savedPanels,
      insideW: firstPanel.insideW || "",
      insideH: firstPanel.insideH || "",
      outsideW: firstPanel.outsideW || "",
      outsideH: firstPanel.outsideH || ""
    };

    setClients((prev) => {
      const updated = prev.map((client) => {
        if (client.id !== selClient.id) return client;
        const windows = isEdit ? client.windows.map((w) => (w.id === nextWindow.id ? nextWindow : w)) : [...client.windows, nextWindow];
        return { ...client, windows };
      });
      setSelClient(updated.find((c) => c.id === selClient.id));
      return updated;
    });

    setModal("detail");
    setSelWin(null);
    voice.setTranscript("");
    toast(isEdit ? "Window updated" : "Window added");
  };

  const saveQuote = (quoteData, quoteResult, quoteId) => {
    setClients((prev) => {
      const updated = prev.map((client) => {
        if (client.id !== selClient.id) return client;
        return {
          ...client,
          windows: client.windows.map((window) => {
            if (window.id !== selWin.id) return window;
            const existing = window.quotes || [];
            const idx = existing.findIndex((q) => q.id === quoteId);
            const nextQuote = {
              ...quoteData,
              id: quoteId || uid(),
              quoteResult,
              name: idx === -1 ? `Option ${String.fromCharCode(65 + existing.length)}` : existing[idx].name
            };
            const quotes = idx === -1 ? [...existing, nextQuote] : existing.map((q, i) => (i === idx ? nextQuote : q));
            return { ...window, quotes };
          })
        };
      });
      setSelClient(updated.find((c) => c.id === selClient.id));
      return updated;
    });

    setModal("detail");
    setSelWin(null);
    setSelQuote(null);
    toast(`Quote saved · ${fmt(quoteResult.total)}`);
  };

  const deleteWindow = (wid) => {
    setClients((prev) => {
      const updated = prev.map((client) =>
        client.id !== selClient.id ? client : { ...client, windows: client.windows.filter((w) => w.id !== wid) }
      );
      setSelClient(updated.find((c) => c.id === selClient.id));
      return updated;
    });
    toast("Window removed");
  };

  const sqft = (w, h) => (w && h ? ((parseFloat(w) * parseFloat(h)) / 144).toFixed(1) : null);

  if (!user) {
    return (
      <>
        <style>{CSS}</style>
        <div className="app">
          <div className="login">
            <div className="login-glow" />
            <div className="login-glow2" />
            <div className="lz">
              <div className="l-eye">Angel Drapery · Window Management</div>
              <div className="l-h">Welcome<br />Back</div>
              <div className="l-sub">Sign in to continue</div>
              <label className="l-lbl">Email</label>
              <input className="l-inp" type="email" placeholder="you@company.com" value={lForm.email} onChange={(e) => setLForm((f) => ({ ...f, email: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && doLogin()} autoCapitalize="none" />
              <label className="l-lbl">Password</label>
              <input className="l-inp" type="password" placeholder="••••••••" value={lForm.password} onChange={(e) => setLForm((f) => ({ ...f, password: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && doLogin()} />
              {lErr ? <div className="l-err">{lErr}</div> : null}
              <button className="l-btn" onClick={doLogin}>Sign In</button>
              <div className="l-demo">
                <strong style={{ color: "rgba(255,255,255,.45)" }}>Demo Accounts</strong><br />
                sarah@drapes.com · mike@drapes.com<br />
                Password: <strong style={{ color: "rgba(255,255,255,.5)" }}>1234</strong><br />
                Admin: admin@drapes.com / <strong style={{ color: "rgba(255,255,255,.5)" }}>admin</strong>
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
        {notif ? <div className="notif">{notif}</div> : null}

        <div className="hdr">
          <div className="hdr-row">
            <div className="hdr-brand">Angel Drapery</div>
            <div className="hdr-user-btn" onClick={doLogout}>
              <div className="hdr-av" style={{ background: avGrad(user.name) }}>{user.name[0]}</div>
              <div className="hdr-uname">{user.name.split(" ")[0]}</div>
            </div>
          </div>
          <div className="hdr-h">{tab === "clients" ? "Clients" : tab === "settings" ? "Settings" : "Account"}</div>
          <div className="hdr-s">
            {tab === "clients" ? (user.role === "admin" ? `Admin · ${visible.length} clients` : `${user.name} · ${visible.length} clients`) : tab === "settings" ? "Admin Configuration" : "My Profile"}
          </div>
        </div>

        <div className="nav">
          {navItems.map((item) => (
            <button key={item.id} className={`nb ${tab === item.id ? "on" : ""}`} onClick={() => setTab(item.id)}>
              <span>{item.i}</span>
              <span className="nb-l">{item.l}</span>
            </button>
          ))}
        </div>

        {tab === "settings" && user.role === "admin" ? <AdminSettings settings={settings} onSave={(s) => { setSettings(s); toast("Settings saved"); }} /> : null}

        {tab === "account" ? (
          <div className="scr">
            <div className="prof-card">
              <div className="prof-av" style={{ background: avGrad(user.name) }}>{user.name[0]}</div>
              <div>
                <div className="prof-name">{user.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink3)", marginTop: 3 }}>{user.email}</div>
                <span className={`tag ${user.role === "admin" ? "tg-amb" : "tg-teal"}`} style={{ marginTop: 7, display: "inline-block" }}>
                  {user.role.toUpperCase()}
                </span>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid var(--bd)", overflow: "hidden", marginBottom: 12 }}>
              <div className="dsec">
                <div className="dst">Stats</div>
                <div className="dkv"><span className="dk">Clients</span><span className="dv">{clients.filter((c) => c.createdBy === user.id).length}</span></div>
                <div className="dkv"><span className="dk">Windows measured</span><span className="dv">{clients.filter((c) => c.createdBy === user.id).reduce((a, c) => a + c.windows.length, 0)}</span></div>
                <div className="dkv"><span className="dk">Windows quoted</span><span className="dv">{clients.filter((c) => c.createdBy === user.id).reduce((a, c) => a + c.windows.filter((w) => (w.quotes || []).some((q) => q.quoteResult)).length, 0)}</span></div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: "#fff", borderRadius: 16, border: "1.5px solid var(--bd)" }}>
              <span style={{ fontSize: 12, color: "var(--ink3)" }}>Signed in as {user.name}</span>
              <button className="lo-btn" onClick={doLogout}>Sign Out</button>
            </div>
          </div>
        ) : null}

        {tab === "clients" ? (
          <div className="scr">
            <div className="stats">
              <div className="stat"><div className="stat-n">{visible.length}</div><div className="stat-l">Clients</div></div>
              <div className="stat"><div className="stat-n">{visible.reduce((a, c) => a + c.windows.length, 0)}</div><div className="stat-l">Windows</div></div>
              <div className="stat"><div className="stat-n">{visible.reduce((a, c) => a + c.windows.filter((w) => (w.quotes || []).some((q) => q.quoteResult)).length, 0)}</div><div className="stat-l">Quoted</div></div>
            </div>

            <div className="sr">
              <div className="sw">
                <span className="si">🔍</span>
                <input className="s-inp" placeholder="Address, sidemark, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button className="ba" onClick={() => { setCForm(blankClient()); setModal("newClient"); }}>＋</button>
            </div>

            <div className="sh">
              <span className="sh-t">Client Profiles</span>
              <span className="sh-b">{visible.length} total</span>
            </div>

            {visible.length === 0 ? (
              <div className="empty">
                <div className="empty-i">🏠</div>
                <div style={{ fontSize: 14, color: "var(--ink3)", lineHeight: 1.8 }}>No clients yet.<br />Tap ＋ to create first profile.</div>
              </div>
            ) : (
              visible.map((c) => (
                <div key={c.id} className="cc" onClick={() => { setSelClient(c); setModal("detail"); }}>
                  <div className="cc-b">
                    <div className="av" style={{ background: avGrad(c.sidemark) }}>{initials(c.address)}</div>
                    <div className="ci">
                      <div className="cn">{c.address}</div>
                      <div className="csm">SM: {c.sidemark}</div>
                      <div className="cm">📱 {c.phone}{c.email ? ` · ✉ ${c.email}` : ""}</div>
                      <div className="c-by">{c.createdByName} · {c.createdAt}</div>
                    </div>
                    <div className="c-wc">🪟 {c.windows.length}</div>
                  </div>
                  {c.windows.length > 0 ? (
                    <div className="cc-ft">
                      {c.windows.slice(0, 2).map((w) => {
                        const qs = (w.quotes || []).filter((q) => q.quoteResult);
                        return (
                          <span key={w.id} className={`tag ${qs.length > 0 ? "tg-grn" : "tg-teal"}`}>
                            {w.location}{qs.length > 0 ? ` ${qs.length > 1 ? qs.length + " opts" : fmt(qs[0].quoteResult.total)}` : ""}
                          </span>
                        );
                      })}
                      {c.windows.length > 2 ? <span className="tag tg-stone">+{c.windows.length - 2} more</span> : null}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        ) : null}

        {modal === "newClient" ? (
          <div className="ov" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
            <div className="sht">
              <div className="mh" />
              <div className="mhdr">
                <div>
                  <div className="mt">New Client Profile</div>
                  <div className="ms">Created by {user.name}</div>
                </div>
                <button className="bx" onClick={() => setModal(null)}>×</button>
              </div>
              <div className="fs">
                <div className="fst">Client Information</div>
                <div className="fg">
                  <label className="fl">Address<span className="req"> *</span></label>
                  <input className="fi" placeholder="123 Main St, City, State ZIP" value={cForm.address} onChange={(e) => setCForm((f) => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="fg2">
                  <div className="fg" style={{ margin: 0 }}>
                    <label className="fl">Sidemark<span className="req"> *</span></label>
                    <input className="fi" placeholder="SMITH-001" value={cForm.sidemark} onChange={(e) => setCForm((f) => ({ ...f, sidemark: e.target.value }))} />
                  </div>
                  <div className="fg" style={{ margin: 0 }}>
                    <label className="fl">Phone<span className="req"> *</span></label>
                    <input className="fi" type="tel" placeholder="555-000-0000" value={cForm.phone} onChange={(e) => setCForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="fg">
                  <label className="fl">Email</label>
                  <input className="fi" type="email" value={cForm.email} onChange={(e) => setCForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="fg">
                  <label className="fl">Notes</label>
                  <textarea className="fta" placeholder="Style preferences, budget..." value={cForm.notes} onChange={(e) => setCForm((f) => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <div className="acts">
                <button className="bs" onClick={() => setModal(null)}>Cancel</button>
                <button className="bp" onClick={saveClient}>Save Profile</button>
              </div>
            </div>
          </div>
        ) : null}

        {modal === "detail" && selClient ? (
          (() => {
            const sc = clients.find((c) => c.id === selClient.id) || selClient;
            return (
              <div className="ov" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
                <div className="sht">
                  <div className="mh" />
                  <div className="mhdr">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div className="av" style={{ background: avGrad(sc.sidemark), width: 50, height: 50, fontSize: 17 }}>{initials(sc.address)}</div>
                      <div>
                        <div className="mt" style={{ fontSize: 16, lineHeight: 1.25 }}>{sc.address}</div>
                        <div className="ms">SM: {sc.sidemark}</div>
                      </div>
                    </div>
                    <button className="bx" onClick={() => setModal(null)}>×</button>
                  </div>

                  <div className="dsec">
                    <div className="dst">Client Info</div>
                    <div className="dkv"><span className="dk">Phone</span><span className="dv">{sc.phone}</span></div>
                    {sc.email ? <div className="dkv"><span className="dk">Email</span><span className="dv">{sc.email}</span></div> : null}
                    <div className="dkv"><span className="dk">Created by</span><span className="dv grn">{sc.createdByName}</span></div>
                    <div className="dkv"><span className="dk">Date</span><span className="dv">{sc.createdAt}</span></div>
                    {sc.notes ? <div className="dkv"><span className="dk">Notes</span><span className="dv" style={{ fontStyle: "italic", fontWeight: 400, color: "var(--ink3)" }}>{sc.notes}</span></div> : null}
                  </div>

                  <div className="dsec">
                    <div className="dst" style={{ marginBottom: 12 }}>Windows ({sc.windows.length})</div>
                    {sc.windows.length === 0 ? (
                      <div style={{ fontSize: 13, color: "var(--ink3)", textAlign: "center", padding: "14px 0" }}>No windows added yet</div>
                    ) : (
                      sc.windows.map((w) => {
                        const quotes = w.quotes || [];
                        return (
                          <div key={w.id} className="wc">
                            <div className="wc-hdr">
                              <div className="wc-loc">🪟 {w.location}</div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="tag tg-stone" style={{ cursor: "pointer" }} onClick={() => { setSelWin(w); setWForm({ ...w }); voice.setTranscript(""); setModal("winForm"); }}>Edit</button>
                                <button className="bdel" onClick={() => deleteWindow(w.id)}>✕</button>
                              </div>
                            </div>
                            <div className="wc-dims">
                              {w.mountType !== "outside" && w.insideW ? <div className="wd">In <b>{fmtFrac(parseFrac(w.insideW))} × {fmtFrac(parseFrac(w.insideH))}</b></div> : null}
                              {w.mountType !== "inside" && w.outsideW ? <div className="wd">Out <b>{fmtFrac(parseFrac(w.outsideW))} × {fmtFrac(parseFrac(w.outsideH))}</b></div> : null}
                              {w.insideW && w.insideH ? <div className="wd">Area <b>{sqft(w.insideW, w.insideH)} ft²</b></div> : null}
                              {(w.panels || []).length > 1 ? <div className="wd" style={{ color: "var(--teal)", fontWeight: 700 }}>{(w.panels || []).length} panels</div> : null}
                            </div>
                            <div style={{ padding: "0 14px 8px" }}>
                              {quotes.map((q) => {
                                const qProd = PRODUCTS.find((p) => p.id === q.product);
                                return (
                                  <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderTop: "1px solid var(--bd)" }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink2)" }}>{q.name}</span>
                                      </div>
                                      {q.quoteResult ? <div style={{ fontSize: 11, color: "var(--ink3)" }}>{qProd?.icon} {qProd?.label}{q.fabricCode ? ` · ${q.fabricCode}` : ""}</div> : null}
                                    </div>
                                    {q.quoteResult ? <span style={{ fontSize: 13, fontWeight: 800, color: "var(--teal)", fontFamily: "Syne,sans-serif", flexShrink: 0 }}>{fmt(q.quoteResult.total)}</span> : null}
                                    <button onClick={() => { setSelWin(w); setSelQuote(q); setModal("quoteForm"); }} style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", background: "var(--tealBg)", border: "1.5px solid var(--tealBd)", borderRadius: 14, padding: "4px 10px", cursor: "pointer" }}>
                                      {q.quoteResult ? "Edit" : "Fill"}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                            <button onClick={() => { setSelWin(w); setSelQuote(null); setModal("quoteForm"); }} style={{ width: "100%", margin: "0 0 8px", padding: "7px", background: "var(--tealBg)", border: "1.5px dashed var(--tealBd)", borderRadius: "var(--r8)", fontSize: 12, fontWeight: 700, color: "var(--teal)", cursor: "pointer" }}>
                              ＋ {quotes.length === 0 ? "Add Quote" : "Add Another Option"}
                            </button>
                            {w.notes ? <div className="wc-note">"{w.notes}"</div> : null}
                          </div>
                        );
                      })
                    )}
                    <button className="bp" style={{ width: "100%", marginTop: 6 }} onClick={() => { setSelWin(null); setWForm(blankWindow()); voice.setTranscript(""); setModal("winForm"); }}>
                      ＋ Add Window
                    </button>
                  </div>

                  <div className="acts">
                    <button className="bs" onClick={() => setModal(null)}>Close</button>
                    <button className="bp amb" onClick={() => toast("PDF export coming soon")}>Export PDF</button>
                  </div>
                </div>
              </div>
            );
          })()
        ) : null}

        {modal === "winForm" ? (
          (() => {
            const setField = (panelIdx, key, val) => {
              setWForm((prev) => ({
                ...prev,
                panels: (prev.panels || []).map((panel, i) => (i === panelIdx ? { ...panel, [key]: val } : panel))
              }));
            };

            return (
              <div className="ov" onClick={(e) => { if (e.target === e.currentTarget) { setModal("detail"); setSelWin(null); } }}>
                <div className="sht">
                  <div className="mh" />
                  <div className="mhdr">
                    <div>
                      <div className="mt">{selWin ? "Edit Window" : "Add Window"}</div>
                      <div className="ms">{selClient?.sidemark} · {selClient?.address?.split(",")[0]}</div>
                    </div>
                    <button className="bx" onClick={() => { setModal("detail"); setSelWin(null); }}>×</button>
                  </div>

                  <div className="fs">
                    <div className="fst">Window Location</div>
                    <input className="fi" placeholder="e.g. Master Bedroom - South Wall" value={wForm.location} onChange={(e) => setWForm((prev) => ({ ...prev, location: e.target.value }))} />
                  </div>

                  <div className="fs" style={{ marginTop: 14 }}>
                    <div className="fst">Voice Input</div>
                    <div className="voice-box">
                      <div className="voice-hint"><em>EN:</em> "inside width 36, height 48"<br /><em>中文:</em> "内框宽三十六，高四十八"</div>
                      <div className="voice-ctrl">
                        <div className="voice-lang">
                          <button className={`vl-btn ${voiceLang === "en" ? "on" : ""}`} onClick={() => { setVoiceLang("en"); if (voice.listening) voice.stop(); }}>EN</button>
                          <button className={`vl-btn ${voiceLang === "zh" ? "on" : ""}`} onClick={() => { setVoiceLang("zh"); if (voice.listening) voice.stop(); }}>中文</button>
                        </div>
                        <div className="voice-transcript">{voice.transcript || (voice.listening ? (voiceLang === "zh" ? "正在聆听..." : "Listening...") : (voiceLang === "zh" ? "点击录入" : "Tap mic to speak"))}</div>
                        <button className={`mic-btn ${voice.listening ? "rec" : "idle"}`} onClick={voice.listening ? voice.stop : voice.start}>
                          {voice.listening ? "⏹" : "🎙"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="fs" style={{ marginTop: 16 }}>
                    <div className="fst">Mount Type</div>
                    <div className="seg">
                      {[["inside", "Inside"], ["outside", "Outside"], ["both", "Both"]].map(([v, l]) => (
                        <button key={v} className={`seg-b ${wForm.mountType === v ? "on" : ""}`} onClick={() => setWForm((prev) => ({ ...prev, mountType: v }))}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="fs" style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div className="fst" style={{ margin: 0 }}>Measurements</div>
                      <button onClick={() => setWForm((prev) => ({ ...prev, panels: [...(prev.panels || []), { ...blankPanel(), label: `Panel ${(prev.panels || []).length + 1}` }] }))} style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", background: "var(--tealBg)", border: "1.5px solid var(--tealBd)", borderRadius: 20, padding: "5px 14px", cursor: "pointer" }}>
                        ＋ Panel
                      </button>
                    </div>

                    {(wForm.panels || []).map((panel, panelIdx) => (
                      <div key={panel.id || panelIdx} style={{ border: "1.5px solid var(--bd)", borderRadius: "var(--r12)", marginBottom: 10, overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--surf2)", borderBottom: "1px solid var(--bd)" }}>
                          <input className="fi" value={panel.label || ""} placeholder={`Panel ${panelIdx + 1}`} onChange={(e) => setField(panelIdx, "label", e.target.value)} style={{ flex: 1, fontWeight: 700, padding: "6px 10px" }} />
                          {(wForm.panels || []).length > 1 ? <button onClick={() => setWForm((prev) => ({ ...prev, panels: prev.panels.filter((_, i) => i !== panelIdx) }))} style={{ background: "none", border: "none", fontSize: 18, color: "var(--ink3)", cursor: "pointer" }}>✕</button> : null}
                        </div>
                        <div style={{ padding: "12px 14px 10px" }}>
                          {(wForm.mountType === "inside" || wForm.mountType === "both") ? (
                            <>
                              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ink3)", marginBottom: 6 }}>Inside</div>
                              <div className="fg2">
                                <input className="fi" placeholder="Inside width #1" value={panel.insideW1 || ""} onChange={(e) => setField(panelIdx, "insideW1", e.target.value)} />
                                <input className="fi" placeholder="Inside width #2" value={panel.insideW2 || ""} onChange={(e) => setField(panelIdx, "insideW2", e.target.value)} />
                              </div>
                              <div className="fg2">
                                <input className="fi" placeholder="Inside width #3" value={panel.insideW3 || ""} onChange={(e) => setField(panelIdx, "insideW3", e.target.value)} />
                                <input className="fi" placeholder="Inside height #1" value={panel.insideH1 || ""} onChange={(e) => setField(panelIdx, "insideH1", e.target.value)} />
                              </div>
                              <div className="fg2">
                                <input className="fi" placeholder="Inside height #2" value={panel.insideH2 || ""} onChange={(e) => setField(panelIdx, "insideH2", e.target.value)} />
                                <input className="fi" placeholder="Inside height #3" value={panel.insideH3 || ""} onChange={(e) => setField(panelIdx, "insideH3", e.target.value)} />
                              </div>
                              {minOf3(panel.insideW1, panel.insideW2, panel.insideW3) && minOf3(panel.insideH1, panel.insideH2, panel.insideH3) ? (
                                <div style={{ background: "var(--tealBg)", border: "1px solid var(--tealBd)", borderRadius: 8, padding: "6px 12px", fontSize: 12, marginBottom: 8 }}>
                                  Final: <strong style={{ color: "var(--teal)", fontFamily: "Syne,sans-serif" }}>{fmtFrac(minOf3(panel.insideW1, panel.insideW2, panel.insideW3))} × {fmtFrac(minOf3(panel.insideH1, panel.insideH2, panel.insideH3))}</strong>
                                </div>
                              ) : null}
                            </>
                          ) : null}

                          {(wForm.mountType === "outside" || wForm.mountType === "both") ? (
                            <>
                              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ink3)", marginBottom: 6 }}>Outside</div>
                              <div className="fg2">
                                <input className="fi" placeholder="Outside width #1" value={panel.outsideW1 || ""} onChange={(e) => setField(panelIdx, "outsideW1", e.target.value)} />
                                <input className="fi" placeholder="Outside width #2" value={panel.outsideW2 || ""} onChange={(e) => setField(panelIdx, "outsideW2", e.target.value)} />
                              </div>
                              <div className="fg2">
                                <input className="fi" placeholder="Outside width #3" value={panel.outsideW3 || ""} onChange={(e) => setField(panelIdx, "outsideW3", e.target.value)} />
                                <input className="fi" placeholder="Outside height #1" value={panel.outsideH1 || ""} onChange={(e) => setField(panelIdx, "outsideH1", e.target.value)} />
                              </div>
                              <div className="fg2">
                                <input className="fi" placeholder="Outside height #2" value={panel.outsideH2 || ""} onChange={(e) => setField(panelIdx, "outsideH2", e.target.value)} />
                                <input className="fi" placeholder="Outside height #3" value={panel.outsideH3 || ""} onChange={(e) => setField(panelIdx, "outsideH3", e.target.value)} />
                              </div>
                              {minOf3(panel.outsideW1, panel.outsideW2, panel.outsideW3) && minOf3(panel.outsideH1, panel.outsideH2, panel.outsideH3) ? (
                                <div style={{ background: "var(--tealBg)", border: "1px solid var(--tealBd)", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                                  Final: <strong style={{ color: "var(--teal)", fontFamily: "Syne,sans-serif" }}>{fmtFrac(minOf3(panel.outsideW1, panel.outsideW2, panel.outsideW3))} × {fmtFrac(minOf3(panel.outsideH1, panel.outsideH2, panel.outsideH3))}</strong>
                                </div>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="fs" style={{ marginTop: 4 }}>
                    <div className="fst">Surrounding Space (inches)</div>
                    <div className="space-wrap">
                      <div className="sdiag">
                        <div className="sdiag-center">Window<br />Frame</div>
                        {[["t", "Top", "spaceTop"], ["b", "Bot", "spaceBottom"], ["l", "Left", "spaceLeft"], ["r", "Right", "spaceRight"]].map(([pos, lbl, key]) => (
                          <div key={pos} className={`sdc ${pos}`}>
                            <div className="sdc-l">{lbl}</div>
                            <input className="sdc-f" type="number" step=".125" placeholder="0" value={wForm[key] || ""} onChange={(e) => setWForm((prev) => ({ ...prev, [key]: e.target.value }))} />
                            <div className="sdc-u">"</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="fs" style={{ marginTop: 14 }}>
                    <div className="fst">Notes</div>
                    <textarea className="fta" placeholder="Special requirements, obstructions..." value={wForm.notes || ""} onChange={(e) => setWForm((prev) => ({ ...prev, notes: e.target.value }))} />
                  </div>

                  <div className="acts">
                    <button className="bs" onClick={() => { setModal("detail"); setSelWin(null); }}>Back</button>
                    <button className="bp" onClick={saveWindow}>{selWin ? "Update Window" : "Save Window"}</button>
                  </div>
                </div>
              </div>
            );
          })()
        ) : null}

        {modal === "quoteForm" && selWin && selClient ? (
          <div className="ov" onClick={(e) => e.target === e.currentTarget && setModal("detail")}>
            <QuoteForm
              win={selWin}
              existingQuote={selQuote}
              client={selClient}
              allWindows={(clients.find((c) => c.id === selClient.id) || selClient).windows}
              settings={settings}
              onSave={saveQuote}
              onCancel={() => { setModal("detail"); setSelWin(null); setSelQuote(null); }}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
