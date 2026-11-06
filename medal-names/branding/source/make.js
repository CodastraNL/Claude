// MedalNames logo generator — MedalCapes slime + crown with a floating in-game style nametag
const opentype = require('opentype.js');
const fs = require('fs');
const OUT = process.argv[2] || 'out-names';
fs.mkdirSync(OUT, { recursive: true });

const fredoka = opentype.loadSync('node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff');
const pixel = opentype.loadSync('node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff');

const P = {
  Y: '#ffc21a', O: '#f5981f', D: '#1f7a3e', M: '#5cb43a', L: '#a8d15c', H: '#fff59d', S: '#d3ea55',
  T: '#2c343d',  // nametag plate
  t: '#1b2128',  // nametag plate edge
  W: '#ffffff',  // nametag text
  w: '#9aa6b2',  // nametag text shadow
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
....DDDDDDDDDDDDDDDDDDDDDDDD....`.trim().split("\n");

// tiny pixel font for the nametag
const GLYPH = {
  M: ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X'],
  E: ['XXX', 'X..', 'XX.', 'X..', 'XXX'],
  D: ['XXX.', 'X..X', 'X..X', 'X..X', 'XXX.'],
  A: ['.XX.', 'X..X', 'XXXX', 'X..X', 'X..X'],
  L: ['X..', 'X..', 'X..', 'X..', 'XXX'],
};

function canvas(w, h) {
  const px = new Map();
  return { w, h, px, set(x, y, c) { if (x >= 0 && y >= 0 && x < w && y < h) px.set(x + ',' + y, c); }, get(x, y) { return px.get(x + ',' + y); } };
}

function mascot() {
  const word = 'MEDAL';
  const textW = [...word].reduce((a, ch) => a + GLYPH[ch][0].length + 1, -1);
  const plateW = textW + 6, plateH = 9;
  const W = Math.max(32, plateW + 2), gapToCrown = 3;
  const crownY = plateH + gapToCrown;
  const H = crownY + SLIME.length;
  const cv = canvas(W, H);
  // nametag plate with pixel-rounded corners
  const px0 = Math.floor((W - plateW) / 2);
  for (let y = 0; y < plateH; y++) for (let x = 0; x < plateW; x++) {
    const corner = (y === 0 || y === plateH - 1) && (x === 0 || x === plateW - 1);
    if (corner) continue;
    const edge = y === 0 || y === plateH - 1 || x === 0 || x === plateW - 1;
    cv.set(px0 + x, y, edge ? 't' : 'T');
  }
  // white pixel text
  let cx = px0 + 3;
  const ty = 2;
  for (const ch of word) {
    const g = GLYPH[ch];
    g.forEach((row, y) => [...row].forEach((c, x) => { if (c === 'X') cv.set(cx + x, ty + y, 'W'); }));
    cx += g[0].length + 1;
  }
  // slime + crown
  const ox = Math.floor((W - 32) / 2);
  SLIME.forEach((row, y) => [...row].forEach((c, x) => { if (c !== '.') cv.set(ox + x, crownY + y, c); }));
  return cv;
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

function sparkle(x, y, s) {
  return `<g shape-rendering="crispEdges" fill="${P.Y}"><rect x="${x + 2 * s}" y="${y}" width="${s}" height="${5 * s}"/><rect x="${x}" y="${y + 2 * s}" width="${5 * s}" height="${s}"/></g>`;
}

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
const measure = (font, str, size, tr = 0) => textPath(font, str, 0, 0, size, tr).width;

const DEFS = `<defs>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd23a"/><stop offset="1" stop-color="#f7a51c"/></linearGradient>
<linearGradient id="accent" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe6f2"/><stop offset="1" stop-color="#2a9fd6"/></linearGradient>
</defs>`;

const GAP = 0.06;
function wordmarkWidth(size) { return measure(fredoka, 'MEDAL', size) + size * GAP + measure(fredoka, 'NAMES', size); }
function wordmark(x, baseline, size) {
  const a = textPath(fredoka, 'MEDAL', x, baseline, size);
  const b = textPath(fredoka, 'NAMES', x + a.width + size * GAP, baseline, size);
  return `<path d="${a.d}" fill="url(#gold)"/><path d="${b.d}" fill="url(#accent)"/>`;
}

// subtitle as a nametag plate (dark, pixel corners, white pixel text with shadow)
function tagline(cx, top, s, label) {
  const ts = 4 * s, tr = s * 1.2;
  const tw = measure(pixel, label, ts, tr);
  const w = Math.ceil((tw + 8 * s) / s) * s, h = 8 * s;
  const x = cx - w / 2;
  const R = [];
  const r = (rx, ry, rw, rh, c) => R.push(`<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${c}"/>`);
  r(x + s, top, w - 2 * s, h, P.t);
  r(x, top + s, w, h - 2 * s, P.t);
  r(x + s, top + s, w - 2 * s, h - 2 * s, P.T);
  const bx = cx - tw / 2, by = top + h / 2 + ts / 2;
  const shadow = textPath(pixel, label, bx + s * 0.5, by + s * 0.5, ts, tr);
  const t = textPath(pixel, label, bx, by, ts, tr);
  return { svg: `<g shape-rendering="crispEdges">${R.join('')}</g><path d="${shadow.d}" fill="${P.w}" opacity=".55"/><path d="${t.d}" fill="${P.W}"/>`, height: h };
}

const wrap = (w0, h0, body) => { const w = Math.ceil(w0), h = Math.ceil(h0); return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${DEFS}${body}</svg>`; };
const TAG = 'RARE USERNAMES';

function stacked() {
  const s = 12, W = 1300;
  const m = mascot();
  const mw = m.w * s, mh = m.h * s;
  const mx = (W - mw) / 2, my = 40;
  let body = sparkle(mx - 110, my + 200, 12) + sparkle(mx - 50, my + 430, 9)
    + sparkle(mx + mw + 50, my + 160, 12) + sparkle(mx + mw + 10, my + 400, 9);
  body += rects(m, s, mx, my);
  const size = 172;
  const baseline = my + mh + 40 + size * 0.72;
  body += wordmark((W - wordmarkWidth(size)) / 2, baseline, size);
  const tg = tagline(W / 2, baseline + 50, 9, TAG);
  body += tg.svg;
  return wrap(W, baseline + 50 + tg.height + 40, body);
}

function horizontal() {
  const s = 8, pad = 30, size = 160;
  const m = mascot();
  const mw = m.w * s, mh = m.h * s;
  const wmW = wordmarkWidth(size);
  const textX = pad + mw + 36;
  const W = textX + wmW + pad, H = mh + 2 * pad;
  let body = rects(m, s, pad, pad);
  const capH = size * 0.7, gap = 34, tagH = 8 * 7;
  const blockTop = pad + mh * 0.6 - (capH + gap + tagH) / 2;
  const baseline = blockTop + capH;
  body += wordmark(textX, baseline, size);
  body += tagline(textX + wmW / 2, baseline + gap, 7, TAG).svg;
  return wrap(Math.ceil(W), Math.ceil(H), body);
}

function icon(size, bg, round) {
  const m = mascot();
  const s = Math.max(1, Math.floor(size * 0.8 / Math.max(m.w, m.h)));
  const mw = m.w * s, mh = m.h * s;
  const ox = Math.floor((size - mw) / 2), oy = Math.floor((size - mh) / 2);
  const back = bg ? `<rect width="${size}" height="${size}"${round ? ` rx="${size * 0.22}"` : ''} fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${back}${rects(m, s, ox, oy)}</svg>`;
}

const files = {
  'medalnames-logo.svg': stacked(),
  'medalnames-logo-horizontal.svg': horizontal(),
  'medalnames-icon.svg': icon(512),
  'medalnames-icon-dark.svg': icon(512, '#120800', true),
};
for (const [n, c] of Object.entries(files)) fs.writeFileSync(`${OUT}/${n}`, c);
console.log('wrote', Object.keys(files).join(', '));
