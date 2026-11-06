// MedalMC logo generator — pixel mascot (from MedalCapes slime) + Fredoka wordmark
const opentype = require('opentype.js');
const fs = require('fs');
const OUT = process.argv[2] || 'out';
fs.mkdirSync(OUT, { recursive: true });

const fredoka = opentype.loadSync('node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff');
const pixel = opentype.loadSync('node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff');

// ---------- palette (taken from MedalCapes) ----------
const P = {
  Y: '#ffc21a', O: '#f5981f', D: '#1f7a3e', M: '#5cb43a', L: '#a8d15c', H: '#fff59d', S: '#d3ea55',
  // swords
  K: '#1b2128',          // outline
  W: '#ffffff', B: '#d5e1e8', G: '#93a6b3', // blade light / mid / shade
  N: '#7a4a24', n: '#4e2e14',               // handle
};

// MedalCapes slime + crown, 32x32 (identical to medalcapes.com favicon)
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

// ---------- pixel canvas ----------
function canvas(w, h) {
  const px = new Map();
  return {
    w, h, px,
    set(x, y, c) { if (x >= 0 && y >= 0 && x < w && y < h) px.set(x + ',' + y, c); },
    get(x, y) { return px.get(x + ',' + y); },
  };
}

// A diagonal sword: pommel bottom-left, tip top-right (mirror=true flips horizontally)
function drawSword(cv, mirror) {
  const pts = [];
  const put = (x, y, c) => pts.push([x, y, c]);
  const x0 = 7, y0 = 51;
  // blade t=6..TIP (drawn first, hilt goes on top)
  const TIP = 43;
  for (let t = 6; t <= TIP; t++) {
    const cx = x0 + t, cy = y0 - t;
    if (t < TIP - 1) { put(cx - 1, cy, 'G'); put(cx, cy, 'B'); put(cx + 1, cy, 'W'); }
    else if (t === TIP - 1) { put(cx - 1, cy, 'G'); put(cx, cy, 'W'); }
    else { put(cx - 1, cy, 'B'); }
  }
  // handle t=1..4
  for (let t = 1; t <= 4; t++) { put(x0 + t, y0 - t, 'N'); put(x0 + t + 1, y0 - t, 'n'); }
  // cross guard at t=5, perpendicular to the blade
  const gx = x0 + 5, gy = y0 - 5;
  for (let k = -2; k <= 2; k++) { put(gx + k, gy + k, 'Y'); put(gx + k + 1, gy + k, 'O'); }
  // pommel
  put(x0 - 1, y0, 'Y'); put(x0, y0, 'Y'); put(x0 - 1, y0 + 1, 'O'); put(x0, y0 + 1, 'O');
  for (const [x, y, c] of pts) cv.set(mirror ? cv.w - 1 - x : x, y, c);
}

function outline(cv, color) {
  const add = [];
  for (const key of cv.px.keys()) {
    const [x, y] = key.split(',').map(Number);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cv.w || ny >= cv.h) continue;
      if (!cv.get(nx, ny)) add.push([nx, ny]);
    }
  }
  for (const [x, y] of add) cv.set(x, y, color);
}

function mascot({ swords = true } = {}) {
  const W = 56, H = 54;
  const cv = canvas(W, H);
  if (swords) {
    drawSword(cv, false);
    drawSword(cv, true);
    outline(cv, 'K');
  }
  const ox = 12, oy = 10;
  SLIME.forEach((row, y) => [...row].forEach((c, x) => { if (c !== '.') cv.set(ox + x, oy + y, c); }));
  return cv;
}

// emit merged horizontal runs as rects
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

function sparkle(x, y, s) { // 5x5 plus, like the MedalCapes logo
  return `<g shape-rendering="crispEdges" fill="${P.Y}"><rect x="${x + 2 * s}" y="${y}" width="${s}" height="${5 * s}"/><rect x="${x}" y="${y + 2 * s}" width="${5 * s}" height="${s}"/></g>`;
}

// ---------- text helpers ----------
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
function measure(font, str, size, tracking = 0) { return textPath(font, str, 0, 0, size, tracking).width; }

const DEFS = `<defs>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd23a"/><stop offset="1" stop-color="#f7a51c"/></linearGradient>
<linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8d15c"/><stop offset="1" stop-color="#4fa83a"/></linearGradient>
</defs>`;

// wordmark "MEDAL" (gold) + "MC" (green); returns svg + width
function wordmark(x, baseline, size) {
  const a = textPath(fredoka, 'MEDAL', x, baseline, size);
  const gap = size * 0.06;
  const b = textPath(fredoka, 'MC', x + a.width + gap, baseline, size);
  // gradient bbox per path: use objectBoundingBox default -> per path bbox, fine
  return {
    svg: `<path d="${a.d}" fill="url(#gold)"/><path d="${b.d}" fill="url(#green)"/>`,
    width: a.width + gap + b.width,
  };
}

// pixel ribbon with notched tails + "NETWORK" in Press Start 2P
function ribbon(cx, top, s, label = 'NETWORK') {
  const ts = 4 * s;              // text size (Press Start 2P is an 8px-grid font: use multiples)
  const tracking = s * 1.6;
  const tw = measure(pixel, label, ts, tracking);
  const bodyW = Math.ceil((tw + 8 * s) / s) * s; // pad
  const bodyH = 8 * s;
  const x = cx - bodyW / 2;
  const R = [];
  const r = (rx, ry, w, h, c) => R.push(`<rect x="${rx}" y="${ry}" width="${w}" height="${h}" fill="${c}"/>`);
  // tails (behind), dark green, V-notched at the outer end
  const tailW = 7 * s, drop = 2 * s, rows = bodyH / s;
  const notch = i => Math.min(i, rows - 1 - i, 3);
  for (const side of [-1, 1]) {
    const inner = side < 0 ? x : x + bodyW;            // inner edge (under the body)
    const outer = side < 0 ? x - tailW : x + bodyW + tailW;
    const ty = top + drop;
    for (let i = -1; i <= rows; i++) {
      const d = (i < 0 || i >= rows) ? 0 : notch(i) * s;
      const o = outer - side * d;                       // outer edge for this row
      const a = Math.min(inner, o), w = Math.abs(o - inner);
      // outline row (one pixel wider at outer edge)
      r(side < 0 ? a - s : a, ty + i * s, w + s, s, P.K);
      if (i >= 0 && i < rows) r(side < 0 ? a : a, ty + i * s, w, s, i === rows - 1 ? '#0f4a24' : '#17602f');
    }
  }
  // fold shadows
  r(x, top + bodyH, 2 * s, drop, P.K);
  r(x + bodyW - 2 * s, top + bodyH, 2 * s, drop, P.K);
  // body
  r(x - s, top - s, bodyW + 2 * s, bodyH + 2 * s, P.K);
  r(x, top, bodyW, bodyH, P.D);
  r(x, top, bodyW, s, P.M);             // top highlight
  r(x, top + bodyH - s, bodyW, s, '#17602f'); // bottom shade
  const t = textPath(pixel, label, cx - tw / 2, top + bodyH / 2 + ts / 2, ts, tracking);
  return {
    svg: `<g shape-rendering="crispEdges">${R.join('')}</g><path d="${t.d}" fill="${P.H}"/>`,
    width: bodyW + 2 * tailW, height: bodyH + drop + 2 * s,
  };
}

function wrap(w, h, body, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${DEFS}${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}${body}</svg>`;
}

// ---------- 1) stacked primary logo ----------
function stacked(bg) {
  const s = 10;                 // mascot pixel size
  const W = 1200;
  const m = mascot();
  const mw = m.w * s, mh = m.h * s;
  const mx = (W - mw) / 2, my = 40;
  let body = '';
  // sparkles
  body += sparkle(mx - 60, my + 120, 10) + sparkle(mx - 10, my + 330, 8);
  body += sparkle(mx + mw + 20, my + 60, 10) + sparkle(mx + mw - 10, my + 300, 8);
  body += rects(m, s, mx, my);
  const size = 200;
  const wmW = measure(fredoka, 'MEDAL', size) + size * 0.06 + measure(fredoka, 'MC', size);
  const baseline = my + mh + 40 + size * 0.72;
  const wm = wordmark((W - wmW) / 2, baseline, size);
  body += wm.svg;
  const rb = ribbon(W / 2, baseline + 50, 10);
  body += rb.svg;
  const H = baseline + 50 + rb.height + 40;
  return wrap(W, H, body, bg);
}

// ---------- 2) horizontal logo ----------
function horizontal(bg) {
  const s = 7;
  const m = mascot();
  const mw = m.w * s, mh = m.h * s;
  const pad = 30;
  const size = 170;
  const wmW = measure(fredoka, 'MEDAL', size) + size * 0.06 + measure(fredoka, 'MC', size);
  const textX = pad + mw + 30;
  const W = textX + wmW + pad;
  const H = mh + 2 * pad;
  let body = rects(m, s, pad, pad);
  // text block: cap height (~0.7em) + gap + ribbon (~100px), centred on the mascot body
  const capH = size * 0.7, gap = 34, ribbonH = 8 * 11;
  const blockTop = pad + mh * 0.56 - (capH + gap + ribbonH) / 2;
  const baseline = blockTop + capH;
  body += wordmark(textX, baseline, size).svg;
  const rb = ribbon(textX + wmW / 2, baseline + gap, 8);
  body += rb.svg;
  return wrap(Math.ceil(W), Math.ceil(H), body, bg);
}

// ---------- 3) square icon (mascot crest) ----------
function icon(size, bg, round) {
  const m = mascot();
  const s = Math.floor(size / 64) || 1;
  const mw = m.w * s, mh = m.h * s;
  const ox = Math.floor((size - mw) / 2), oy = Math.floor((size - mh) / 2);
  let back = '';
  if (bg) back = round
    ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${bg}"/>`
    : `<rect width="${size}" height="${size}" fill="${bg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${back}${rects(m, s, ox, oy)}</svg>`;
}

const files = {
  'medalmc-logo.svg': stacked(),
  'medalmc-logo-horizontal.svg': horizontal(),
  'medalmc-icon.svg': icon(512),
  'medalmc-icon-dark.svg': icon(512, '#120800', true),
  'server-icon.svg': icon(64),
};
for (const [n, c] of Object.entries(files)) fs.writeFileSync(`${OUT}/${n}`, c);
console.log('wrote', Object.keys(files).join(', '));
