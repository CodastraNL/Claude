// Medal Network brand kit generator
// One visual system for: Medal Network (umbrella), MedalMC (servers), MedalNames (names & accounts).
// Pixel mascot (the MedalCapes slime) + Fredoka wordmark + pixel subtitle element.
const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(process.argv[2] || '../');

const fredoka = opentype.loadSync('node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff');
const pixel = opentype.loadSync('node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff');

/* ---------------- palette ---------------- */
const P = {
  // slime + crown (MedalCapes)
  Y: '#ffc21a', O: '#f5981f', D: '#1f7a3e', M: '#5cb43a', L: '#a8d15c', H: '#fff59d', S: '#d3ea55',
  K: '#1b2128',                                   // outline
  W: '#ffffff', B: '#d5e1e8', G: '#93a6b3',       // steel
  N: '#7a4a24', n: '#4e2e14',                     // handle
  T: '#2c343d', t: '#1b2128', X: '#ffffff',       // nametag plate + text
  // medal
  g1: '#ffe27a', g2: '#ffc21a', g3: '#f0a01a', g4: '#c77a0c', g5: '#8a5206',
  // ribbon stripes
  rG: '#3f9b2a', rg: '#2a7a1c', rY: '#ffc21a', ry: '#d99a10', rB: '#2a9fd6', rb: '#1b6fa0',
  // laurel
  lf: '#5cb43a', lF: '#8fd14f', ls: '#2a7a1c',
};

const SLIME = `
..........YY...YY...OO..........
..........YY...YY...OO..........
..........YY..YYYY..OO..........
..........YYYYYYYYYOOO..........
..........YYYYYYYYYOOO..........
..........YYYYYYYYYOOO..........
..........YYYOOOOOOOOO..........
................................
...........DDDDDDDDDD...........
.........DDMMMMMMMMMMDD.........
.......DDMMLLLLLLLLLLMMDD.......
......DMMLLLLLLLLLLLLLLMMD......
.....DMLLHHHLLLLLLLLLLLLLMD.....
....DMLLHHHHHLLLLLLLLLLLLLMD....
...DMLLLHHHHHLLLLLLLLLLLLLLMD...
..DMLLLLLHHHLLLLLLLLLLLLLLLLMD..
..DMLLLLLLLLLLLLLLLLLLLLLLLLMD..
.DMLLLLLLLLLLLLLLLLLLLLLLLLLLMD.
.DMLLLLLLLLLDLLLLLLDLLLLLLLLLMD.
DMLLLLLLLLLLDLLLLLLDLLLLLLLLLLMD
DMLHHLLLLLLLDLLLLLLDLLLLLLLLLLMD
DSLHHLLLDLLLLLLLLLLLLLLDLLLLLLMD
DSLLLLLLDLLLLLLLLLLLLLLDLLLLLLMD
DSLLLLLLLDLLLLLLLLLLLLDLLLLLLLMD
DSLLLLLLLLDLLLLLLLLLLDLLLLLLLLMD
DSLLLLLLLLLDDDDDDDDDDLLLLLLLLLMD
DSLLLLLLLLLLLLLLLLLLLLLLLLLLLLMD
DSLLLLLLLLLLLLLLLLLLLLLLLLLLLLMD
.DSLLLLLLLLLLLLLLLLLLLLLLLLLLMD.
.DMSSSSSSSSLLLLLLLLLLLLLLLLMMMD.
..DDMMMMMMMMMMMMMMMMMMMMMMMMDD..
....DDDDDDDDDDDDDDDDDDDDDDDD....`.trim().split('\n');

/* ---------------- pixel canvas ---------------- */
function canvas(w, h) {
  const px = new Map();
  return {
    w, h, px,
    set(x, y, c) { if (x >= 0 && y >= 0 && x < w && y < h) px.set(x + ',' + y, c); },
    get(x, y) { return px.get(x + ',' + y); },
  };
}
function stamp(cv, rows, ox, oy) { rows.forEach((row, y) => [...row].forEach((c, x) => { if (c !== '.') cv.set(ox + x, oy + y, c); })); }
function outline(cv, color = 'K', only) {
  const add = [];
  for (const key of cv.px.keys()) {
    const [x, y] = key.split(',').map(Number);
    if (only && !only(cv.get(x, y))) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cv.w || ny >= cv.h) continue;
      if (!cv.get(nx, ny)) add.push([nx, ny]);
    }
  }
  for (const [x, y] of add) cv.set(x, y, color);
}
function rects(cv, s, ox = 0, oy = 0) {
  let out = '';
  for (let y = 0; y < cv.h; y++) {
    let x = 0;
    while (x < cv.w) {
      const c = cv.get(x, y);
      if (!c) { x++; continue; }
      let e = x; while (e + 1 < cv.w && cv.get(e + 1, y) === c) e++;
      out += `<rect x="${ox + x * s}" y="${oy + y * s}" width="${(e - x + 1) * s}" height="${s}" fill="${P[c] || c}"/>`;
      x = e + 1;
    }
  }
  return `<g shape-rendering="crispEdges">${out}</g>`;
}

/* ---------------- mascots ---------------- */
// MedalMC: slime + crown in front of two crossed swords
function drawSword(cv, mirror) {
  const pts = [], put = (x, y, c) => pts.push([x, y, c]);
  const x0 = 7, y0 = 51, TIP = 43;
  for (let t = 6; t <= TIP; t++) {
    const cx = x0 + t, cy = y0 - t;
    if (t < TIP - 1) { put(cx - 1, cy, 'G'); put(cx, cy, 'B'); put(cx + 1, cy, 'W'); }
    else if (t === TIP - 1) { put(cx - 1, cy, 'G'); put(cx, cy, 'W'); }
    else put(cx - 1, cy, 'B');
  }
  for (let t = 1; t <= 4; t++) { put(x0 + t, y0 - t, 'N'); put(x0 + t + 1, y0 - t, 'n'); }
  const gx = x0 + 5, gy = y0 - 5;
  for (let k = -2; k <= 2; k++) { put(gx + k, gy + k, 'Y'); put(gx + k + 1, gy + k, 'O'); }
  put(x0 - 1, y0, 'Y'); put(x0, y0, 'Y'); put(x0 - 1, y0 + 1, 'O'); put(x0, y0 + 1, 'O');
  for (const [x, y, c] of pts) cv.set(mirror ? cv.w - 1 - x : x, y, c);
}
function mascotMC() {
  const cv = canvas(56, 54);
  drawSword(cv, false); drawSword(cv, true); outline(cv);
  stamp(cv, SLIME, 12, 10);
  return cv;
}

// MedalNames: the crowned slime on its own (same mascot as the rest of the family)
function mascotNames() {
  const cv = canvas(32, SLIME.length);
  stamp(cv, SLIME, 0, 0);
  return cv;
}

// Medal Network: a gold medal with the crowned slime, tri-colour ribbon and laurel wreath
function emblemNetwork() {
  const W = 76, H = 78;
  const cv = canvas(W, H);
  const cx = 37.5, cy = 48.5, R = 26;
  // ribbon (behind): two straps in a V, stripes MC green / Capes gold / Names blue
  const stripes = ['rG', 'rG', 'rY', 'rY', 'rB', 'rB'];
  const stripesR = ['rB', 'rB', 'rY', 'rY', 'rG', 'rG'];
  for (let y = 0; y <= 26; y++) {
    const off = Math.round(y * 0.42);
    for (let i = 0; i < 12; i++) {
      const sx = 21 + off + i, sx2 = 54 - off - i;
      const shadeL = y > 20 || i === 0 || i === 11;
      cv.set(sx, y, shadeL ? stripes[Math.floor(i / 2)].replace(/^r(.)/, (m, c) => 'r' + c.toLowerCase()) : stripes[Math.floor(i / 2)]);
      cv.set(sx2, y, shadeL ? stripesR[Math.floor(i / 2)].replace(/^r(.)/, (m, c) => 'r' + c.toLowerCase()) : stripesR[Math.floor(i / 2)]);
    }
  }
  // laurel wreath: continuous stem with leaves pointing outward and upward
  const at = (a, side, r) => { const rad = a * Math.PI / 180; return [cx + side * Math.sin(rad) * r, cy - Math.cos(rad) * r]; };
  for (const side of [-1, 1]) {
    for (let a = 94; a <= 178; a += 0.5) { const [x, y] = at(a, side, R + 3.4); cv.set(Math.floor(x), Math.floor(y), 'ls'); }
    for (let a = 98; a <= 170; a += 12) {
      const rad = a * Math.PI / 180;
      const out = [side * Math.sin(rad), -Math.cos(rad)];          // radial outward
      const up = [-side * Math.cos(rad), -Math.sin(rad)];          // along the wreath, towards the top
      const [bx, by] = at(a, side, R + 3.4);
      const P2 = (o, u) => [Math.floor(bx + out[0] * o + up[0] * u), Math.floor(by + out[1] * o + up[1] * u)];
      [[1, 0, 'lf'], [1.6, 1, 'lf'], [2.4, 1.6, 'lF'], [1, 1.2, 'lF'], [2.2, 2.6, 'lf'], [0.2, 1.6, 'lf']].forEach(([o, u, c]) => { const [x, y] = P2(o, u); cv.set(x, y, c); });
    }
  }
  // medal disc
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x + .5 - cx - .5, dy = y + .5 - cy - .5, d = Math.hypot(dx, dy);
    if (d > R) continue;
    let c;
    if (d > R - 1.2) c = 'g5';
    else if (d > R - 3) c = (dx + dy < 0) ? 'g2' : 'g4';
    else if (d > R - 4.2) c = 'g4';
    else {
      const k = (dx + dy) / R;
      c = k < -0.75 ? 'g1' : k < 0.35 ? 'g2' : 'g3';
    }
    cv.set(x, y, c);
  }
  // rim studs
  for (let a = 0; a < 360; a += 30) {
    const rad = (a * Math.PI) / 180;
    cv.set(Math.round(cx + Math.sin(rad) * (R - 2)), Math.round(cy - Math.cos(rad) * (R - 2)), 'g1');
  }
  // clasp between ribbon and medal
  for (let x = 32; x <= 43; x++) for (let y = 21; y <= 24; y++) cv.set(x, y, y === 21 ? 'g1' : y === 24 ? 'g4' : 'g2');
  // slime + crown on the medal face, with a dark contour so the gold crown reads on the gold disc
  const sx = 22, sy = 31;
  SLIME.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '.') return;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!(SLIME[ny] && SLIME[ny][nx] && SLIME[ny][nx] !== '.')) cv.set(sx + nx, sy + ny, 'K');
    }
  }));
  stamp(cv, SLIME, sx, sy);
  outline(cv);
  return cv;
}

function sparkle(x, y, s, fill = P.Y) {
  return `<g shape-rendering="crispEdges" fill="${fill}"><rect x="${x + 2 * s}" y="${y}" width="${s}" height="${5 * s}"/><rect x="${x}" y="${y + 2 * s}" width="${5 * s}" height="${s}"/></g>`;
}

/* ---------------- type ---------------- */
function textPath(font, str, x, y, size, tracking = 0) {
  let d = '', cx = x;
  const glyphs = font.stringToGlyphs(str);
  glyphs.forEach((g, i) => {
    d += g.getPath(cx, y, size).toPathData(2);
    let adv = g.advanceWidth * size / font.unitsPerEm;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * size / font.unitsPerEm;
    cx += adv + tracking;
  });
  return { d, width: cx - x - tracking };
}
const measure = (font, s, size, tr = 0) => textPath(font, s, 0, 0, size, tr).width;

const DEFS = `<defs>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd23a"/><stop offset="1" stop-color="#f7a51c"/></linearGradient>
<linearGradient id="goldRich" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset=".45" stop-color="#ffc21a"/><stop offset="1" stop-color="#e8890f"/></linearGradient>
<linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8d15c"/><stop offset="1" stop-color="#4fa83a"/></linearGradient>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe6f2"/><stop offset="1" stop-color="#2a9fd6"/></linearGradient>
</defs>`;
const GAP = 0.06;
function wordmark(parts, x, baseline, size) {
  let svg = '', cx = x;
  parts.forEach(([txt, fill], i) => {
    const t = textPath(fredoka, txt, cx, baseline, size);
    svg += `<path d="${t.d}" fill="${fill}"/>`;
    cx += t.width + (i < parts.length - 1 ? size * GAP : 0);
  });
  return { svg, width: cx - x };
}
const wordmarkWidth = (parts, size) => parts.reduce((a, [t], i) => a + measure(fredoka, t, size) + (i < parts.length - 1 ? size * GAP : 0), 0);

// product ribbon (MC green, Names blue): same shape for every sub-brand
const RIBBONS = {
  green: { face: '#1f7a3e', top: '#5cb43a', bottom: '#17602f', tail: '#17602f', tailDark: '#0f4a24', text: '#fff59d' },
  sky: { face: '#1b6fa0', top: '#5ec5e8', bottom: '#155a83', tail: '#155a83', tailDark: '#0e4466', text: '#ffffff' },
};
function ribbon(cx, top, s, label, theme) {
  const C = RIBBONS[theme];
  const ts = 4 * s, tracking = s * 1.6;
  const tw = measure(pixel, label, ts, tracking);
  const bodyW = Math.ceil((tw + 8 * s) / s) * s, bodyH = 8 * s, x = cx - bodyW / 2;
  const R = [], r = (rx, ry, w, h, c) => R.push(`<rect x="${rx}" y="${ry}" width="${w}" height="${h}" fill="${c}"/>`);
  const tailW = 7 * s, drop = 2 * s, rows = bodyH / s, notch = i => Math.min(i, rows - 1 - i, 3);
  for (const side of [-1, 1]) {
    const inner = side < 0 ? x : x + bodyW, outer = side < 0 ? x - tailW : x + bodyW + tailW, ty = top + drop;
    for (let i = -1; i <= rows; i++) {
      const d = (i < 0 || i >= rows) ? 0 : notch(i) * s;
      const o = outer - side * d, a = Math.min(inner, o), w = Math.abs(o - inner);
      r(side < 0 ? a - s : a, ty + i * s, w + s, s, P.K);
      if (i >= 0 && i < rows) r(a, ty + i * s, w, s, i === rows - 1 ? C.tailDark : C.tail);
    }
  }
  r(x, top + bodyH, 2 * s, drop, P.K); r(x + bodyW - 2 * s, top + bodyH, 2 * s, drop, P.K);
  r(x - s, top - s, bodyW + 2 * s, bodyH + 2 * s, P.K);
  r(x, top, bodyW, bodyH, C.face); r(x, top, bodyW, s, C.top); r(x, top + bodyH - s, bodyW, s, C.bottom);
  const t = textPath(pixel, label, cx - tw / 2, top + bodyH / 2 + ts / 2, ts, tracking);
  return { svg: `<g shape-rendering="crispEdges">${R.join('')}</g><path d="${t.d}" fill="${C.text}"/>`, height: bodyH + drop + 2 * s };
}

// network subtitle: trophy plaque (dark plate, double gold border)
function plaque(cx, top, s, label) {
  const ts = 4 * s, tracking = s * 2.2;
  const tw = measure(pixel, label, ts, tracking);
  const w = Math.ceil((tw + 14 * s) / s) * s, h = 10 * s, x = cx - w / 2;
  const R = [], r = (rx, ry, rw, rh, c) => R.push(`<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${c}"/>`);
  // outline, gold frame with bevel, dark inner plate
  r(x + s, top - s, w - 2 * s, h + 2 * s, P.K); r(x, top, w, h, P.K);
  r(x + s, top, w - 2 * s, h, P.g2); r(x, top + s, w, h - 2 * s, P.g2);
  r(x + s, top + h - s, w - 2 * s, s, P.g4); r(x + w - s, top + s, s, h - 2 * s, P.g4);
  r(x + s, top, w - 2 * s, s, P.g1);
  r(x + 2 * s, top + 2 * s, w - 4 * s, h - 4 * s, '#14181f');
  r(x + 2 * s, top + 2 * s, w - 4 * s, s, '#232a35');
  // rivets
  for (const rx of [x + 3 * s, x + w - 4 * s]) r(rx, top + h / 2 - s / 2, s, s, P.g2);
  const t = textPath(pixel, label, cx - tw / 2, top + h / 2 + ts / 2, ts, tracking);
  return { svg: `<g shape-rendering="crispEdges">${R.join('')}</g><path d="${t.d}" fill="url(#goldRich)"/>`, height: h + s };
}

const wrap = (w, h, body, bg) => { w = Math.ceil(w); h = Math.ceil(h); return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${DEFS}${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}${body}</svg>`; };

/* ---------------- brands ---------------- */
const BRANDS = {
  network: { mascot: emblemNetwork, parts: [['MEDAL', 'url(#goldRich)']], sub: s => ['plaque', 'NETWORK'], s: 9, size: 230, hS: 6, hSize: 190 },
  mc: { mascot: mascotMC, parts: [['MEDAL', 'url(#gold)'], ['MC', 'url(#green)']], sub: ['ribbon', 'SERVERS', 'green'], s: 10, size: 200, hS: 7, hSize: 170 },
  names: { mascot: mascotNames, parts: [['MEDAL', 'url(#gold)'], ['NAMES', 'url(#sky)']], sub: ['ribbon', 'NAMES & ACCOUNTS', 'sky'], s: 14, size: 180, hS: 9, hSize: 150 },
};
function subtitle(b, cx, top, s) {
  const sub = typeof b.sub === 'function' ? b.sub(s) : b.sub;
  return sub[0] === 'plaque' ? plaque(cx, top, s, sub[1]) : ribbon(cx, top, s, sub[1], sub[2]);
}

function stacked(key, bg) {
  const b = BRANDS[key], s = b.s, m = b.mascot();
  const wmW = wordmarkWidth(b.parts, b.size);
  const mw = m.w * s, mh = m.h * s;
  const subW = 900; // generous; actual width depends on label
  const W = Math.max(mw + 320, wmW + 120, 1200);
  const mx = (W - mw) / 2, my = 50;
  let body = '';
  body += sparkle(mx - 110, my + mh * .3, 12) + sparkle(mx - 60, my + mh * .78, 9);
  body += sparkle(mx + mw + 50, my + mh * .22, 12) + sparkle(mx + mw + 15, my + mh * .7, 9);
  body += rects(m, s, mx, my);
  const baseline = my + mh + 40 + b.size * 0.72;
  body += wordmark(b.parts, (W - wmW) / 2, baseline, b.size).svg;
  const st = subtitle(b, W / 2, baseline + 50, 10);
  body += st.svg;
  return wrap(W, baseline + 50 + st.height + 50, body, bg);
}

function horizontal(key, bg) {
  const b = BRANDS[key], s = b.hS, m = b.mascot(), pad = 30;
  const mw = m.w * s, mh = m.h * s;
  const wmW = wordmarkWidth(b.parts, b.hSize);
  const textX = pad + mw + 34;
  const capH = b.hSize * 0.7, gap = 36, subH = 8 * 11;
  const H = Math.max(mh, capH + gap + subH + 20) + 2 * pad;
  const blockTop = (H - (capH + gap + subH)) / 2;
  const baseline = blockTop + capH;
  let body = rects(m, s, pad, (H - mh) / 2);
  body += wordmark(b.parts, textX, baseline, b.hSize).svg;
  const st = subtitle(b, textX + wmW / 2, baseline + gap, 8);
  body += st.svg;
  // subtitle may be wider than the wordmark (e.g. NAMES & ACCOUNTS)
  return wrap(textX + Math.max(wmW, 0) + pad + 40, H, body, bg);
}

function icon(key, size, bg, round) {
  const m = BRANDS[key].mascot();
  const s = Math.max(1, Math.floor(size * 0.84 / Math.max(m.w, m.h)));
  const mw = m.w * s, mh = m.h * s;
  const ox = Math.floor((size - mw) / 2), oy = Math.floor((size - mh) / 2);
  const back = bg ? `<rect width="${size}" height="${size}"${round ? ` rx="${size * 0.22}"` : ''} fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${back}${rects(m, s, ox, oy)}</svg>`;
}

for (const key of Object.keys(BRANDS)) {
  const dir = path.join(OUT, key, 'svg');
  fs.mkdirSync(dir, { recursive: true });
  const files = {
    [`medal${key}-logo.svg`]: stacked(key),
    [`medal${key}-logo-horizontal.svg`]: horizontal(key),
    [`medal${key}-icon.svg`]: icon(key, 512),
    [`medal${key}-icon-dark.svg`]: icon(key, 512, '#120800', true),
  };
  if (key === 'mc') files['server-icon.svg'] = icon(key, 64);
  for (const [n, c] of Object.entries(files)) fs.writeFileSync(path.join(dir, n), c);
  console.log(key, Object.keys(files).join(', '));
}
