export const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
export const toLab = ([r, g, b]) => {
  const [lr, lg, lb] = [r, g, b].map((v) => toLinear(v / 255));
  const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / 0.95047;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb;
  const z = (0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};
export const deltaE = (a, b) => {
  const [L1, a1, b1] = a; const [L2, a2, b2] = b;
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1); const C2 = Math.hypot(a2, b2);
  const Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1; const ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1); const Cp2 = Math.hypot(ap2, b2);
  const hp = (y, x) => { const h = Math.atan2(y, x) / rad; return h >= 0 ? h : h + 360; };
  const hp1 = Cp1 === 0 ? 0 : hp(b1, ap1); const hp2 = Cp2 === 0 ? 0 : hp(b2, ap2);
  const dL = L2 - L1; const dC = Cp2 - Cp1;
  let dh = 0;
  if (Cp1 * Cp2 !== 0) { dh = hp2 - hp1; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360; }
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(dh * rad / 2);
  const Lm = (L1 + L2) / 2; const Cpm = (Cp1 + Cp2) / 2;
  let hm = hp1 + hp2;
  if (Cp1 * Cp2 !== 0) hm = Math.abs(hp1 - hp2) > 180 ? (hp1 + hp2 + (hp1 + hp2 < 360 ? 360 : -360)) / 2 : (hp1 + hp2) / 2;
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hm - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7));
  const Sl = 1 + 0.015 * (Lm - 50) ** 2 / Math.sqrt(20 + (Lm - 50) ** 2);
  const Sc = 1 + 0.045 * Cpm; const Sh = 1 + 0.015 * Cpm * T;
  const Rt = -Math.sin(2 * dTheta * rad) * Rc;
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh));
};

export const NAMED = { white: [255, 255, 255], black: [0, 0, 0] };
export const parseHex = (hex) => {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  const n = (i) => parseInt(h.slice(i, i + 2), 16);
  const alpha = h.length === 8 ? n(6) / 255 : 1;
  return { rgb: [n(0), n(2), n(4)], alpha, alphaText: h.length === 8 ? String(Math.round(alpha * 100) / 100) : null };
};
export const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^()]*\)|hsla?\([^()]*\)|(?<![\w-])(?:white|black)(?![\w-])/g;
const hslToRgb = (h, s, l) => {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
};
export const parseColor = (text) => {
  if (text.startsWith('#')) return /^#[0-9a-f]{3}$|^#[0-9a-f]{4}$|^#[0-9a-f]{6}$|^#[0-9a-f]{8}$/i.test(text) ? parseHex(text) : null;
  if (/^(white|black)$/.test(text)) return { rgb: NAMED[text], alpha: 1, alphaText: null };
  const inner = text.slice(text.indexOf('(') + 1, -1).trim();
  if (inner.includes('var(')) return null;
  const parts = inner.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const alpha = parts[3] === undefined ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
  if (text.startsWith('hsl')) return { rgb: hslToRgb(parseFloat(parts[0]), parseFloat(parts[1]) / 100, parseFloat(parts[2]) / 100), alpha, alphaText: parts[3] ?? null };
  const rgb = parts.slice(0, 3).map((p) => (p.endsWith('%') ? Math.round(parseFloat(p) * 2.55) : parseFloat(p)));
  return rgb.some(Number.isNaN) ? null : { rgb, alpha, alphaText: parts[3] ?? null };
};

export const rgbKey = (rgb) => rgb.map((value) => value.toString(16).padStart(2, '0')).join('');
