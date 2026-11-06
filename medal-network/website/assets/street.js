/* Medal Network street hero: procedural pixel backdrop, wind simulation, swaying signs,
   wind-blown hair, flying leaves/dust/paper, and the door that opens the network. */
(function () {
  "use strict";
  const street = document.getElementById("street");
  if (!street) return;
  const scene = street.querySelector(".scene");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LW = 400, LH = 225;

  /* ---------- place overlay boxes from logical coordinates ---------- */
  street.querySelectorAll("[data-box]").forEach(el => {
    const [x, y, w, h] = el.dataset.box.split(/\s+/).map(Number);
    el.classList.add("box");
    el.style.left = (x / LW * 100) + "%"; el.style.top = (y / LH * 100) + "%";
    el.style.width = (w / LW * 100) + "%"; el.style.height = (h / LH * 100) + "%";
  });

  /* ---------- seeded random ---------- */
  let seed = 7;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];

  /* ---------- pixel backdrop ---------- */
  const bg = scene.querySelector("canvas.bg");
  const M = 200;                       // extra street on both sides of the 400px core
  bg.width = LW + 2 * M; bg.height = LH;
  const c = bg.getContext("2d");
  c.translate(M, 0);
  const px = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

  function bricks(x0, y0, w, h) {
    const cols = ["#251a37", "#2a1f3e", "#211730", "#2e2344", "#1f1630"];
    px(x0, y0, w, h, "#130d1e");
    for (let y = y0, row = 0; y < y0 + h; y += 4, row++) {
      for (let x = x0 - (row % 2 ? 4 : 0); x < x0 + w; x += 8) {
        const bx = Math.max(x, x0), bw = Math.min(x + 7, x0 + w) - bx;
        if (bw <= 0) continue;
        px(bx, y, bw, 3, pick(cols));
        if (rnd() < .3) px(bx, y, Math.min(bw, 3), 1, "#33274a");
        if (rnd() < .08) px(bx + 2, y + 1, 2, 1, "#1a1228");
      }
    }
  }
  function stones(x0, y0, w, h) {
    const cols = ["#3a2f4f", "#41355a", "#352b49", "#463a60", "#30273f"];
    px(x0, y0, w, h, "#1a1326");
    for (let y = y0, row = 0; y < y0 + h; y += 7, row++) {
      for (let x = x0 - (row % 2 ? 7 : 0); x < x0 + w; x += 14) {
        const bx = Math.max(x, x0), bw = Math.min(x + 13, x0 + w) - bx;
        if (bw <= 0) continue;
        const col = pick(cols);
        px(bx, y, bw, 6, col);
        px(bx, y, bw, 1, "#544670");
        px(bx, y + 5, bw, 1, "#2a2140");
      }
    }
  }
  // base walls (core + side extensions)
  bricks(-M, 0, M + 142, 182); bricks(258, 0, 142 + M, 182);
  stones(142, 0, 116, 182);
  // pilasters + drainpipes
  [[138, "#1b1428"], [258, "#1b1428"]].forEach(([x, col]) => { px(x, 0, 4, 182, col); px(x + 1, 0, 1, 182, "#2c2240"); });
  [[6, 0], [392, 0]].forEach(([x]) => { px(x, 0, 3, 182, "#2a2a36"); px(x, 0, 1, 182, "#4a4a5c"); for (let y = 10; y < 180; y += 30) px(x - 1, y, 5, 2, "#3a3a4a"); });
  // upper floor windows
  function upperWin(x, y, lit) {
    px(x - 1, y - 1, 16, 15, "#120c1b");
    if (lit) { px(x, y, 14, 13, "#ffb45a"); px(x, y, 14, 4, "#ffd38a"); px(x + 2, y + 6, 10, 7, "#e98a35"); }
    else { px(x, y, 14, 13, "#1b2a44"); px(x + 1, y + 1, 4, 3, "#2c4266"); }
    px(x + 6, y, 2, 13, "#120c1b"); px(x, y + 6, 14, 1, "#120c1b");
    px(x - 2, y + 13, 18, 2, "#3a2f4f");
  }
  upperWin(22, 6, false); upperWin(58, 6, true); upperWin(104, 6, false);
  upperWin(282, 6, true); upperWin(326, 6, false); upperWin(366, 6, true);
  // side extensions: more windows, a lamp post's worth of detail and pipes
  [-178, -136, -92, -48].forEach((x, i) => { upperWin(x, 6, i % 2 === 0); upperWin(x, 60, i % 3 === 1); upperWin(x, 120, i === 2); });
  [418, 462, 506, 550].forEach((x, i) => { upperWin(x, 6, i % 2 === 1); upperWin(x, 60, i % 3 === 0); upperWin(x, 120, i === 1); });
  [-110, 480].forEach(x => { px(x, 30, 3, 152, "#2a2a36"); px(x, 30, 1, 152, "#4a4a5c"); });
  // cornice
  px(-M, 24, 400 + 2 * M, 3, "#3d3156"); px(-M, 24, 400 + 2 * M, 1, "#57487a"); px(-M, 27, 400 + 2 * M, 1, "#120c1b");
  // shop windows + awnings
  function shop(x, y, w, h, stripeA, stripeB) {
    px(x - 3, y - 3, w + 6, h + 6, "#2a1a10"); px(x - 2, y - 2, w + 4, h + 4, "#4a2e18");
    px(x, y, w, h, "#120a18");
    // warm interior gradient
    for (let i = 0; i < h; i++) { const a = i / h; c.fillStyle = `rgba(255,${150 + 40 * a | 0},70,${.08 + .22 * a})`; c.fillRect(x, y + i, w, 1); }
    px(x, y + h - 6, w, 6, "#3a2414"); px(x, y + h - 6, w, 1, "#5c3a20");     // display shelf
    px(x + w / 2 - 1, y, 2, h - 6, "#2a1a10");                              // mullion
    px(x + 4, y + 3, 2, 12, "rgba(255,255,255,.12)"); px(x + 8, y + 3, 1, 8, "rgba(255,255,255,.08)"); // glass glare
    // awning with scallops
    const ay = y - 15;
    for (let i = 0; i < w + 10; i++) { const col = Math.floor(i / 6) % 2 ? stripeA : stripeB; px(x - 5 + i, ay, 1, 9, col); }
    px(x - 5, ay, w + 10, 1, "#ffffff22");
    for (let i = 0; i < w + 10; i += 6) { const col = Math.floor(i / 6) % 2 ? stripeA : stripeB; px(x - 5 + i + 1, ay + 9, 4, 2, col); px(x - 5 + i + 2, ay + 11, 2, 1, col); }
    px(x - 5, ay + 9, w + 10, 0.5, "#00000055");
  }
  shop(20, 118, 100, 46, "#c88a12", "#2a1d10");
  shop(280, 118, 100, 46, "#1b6fa0", "#10202e");
  // door arch frame (stone voussoirs)
  const dcx = 200, dcy = 115, dr = 35;
  for (let y = dcy - dr - 8; y < 182; y++) for (let x = dcx - dr - 8; x < dcx + dr + 8; x++) {
    const dx = x + .5 - dcx, dy = y + .5 - dcy;
    let inFrame = false, ang = 0;
    if (y < dcy) { const d = Math.hypot(dx, dy); inFrame = d >= dr && d < dr + 7; ang = Math.atan2(dy, dx); }
    else inFrame = (Math.abs(dx) >= dr && Math.abs(dx) < dr + 7);
    if (!inFrame) continue;
    const seg = y < dcy ? Math.floor((ang + Math.PI) / (Math.PI / 9)) : Math.floor((y - dcy) / 8);
    const base = ["#4c3f66", "#54476f", "#463a5f"][seg % 3];
    const edge = y < dcy ? (Math.abs(((ang + Math.PI) / (Math.PI / 9)) % 1) < .12) : ((y - dcy) % 8 === 0);
    px(x, y, 1, 1, edge ? "#2a2140" : base);
  }
  // keystone
  px(dcx - 5, dcy - dr - 9, 10, 10, "#6a5a8c"); px(dcx - 5, dcy - dr - 9, 10, 1, "#8a78b0"); px(dcx - 4, dcy - dr - 6, 8, 4, "#ffc21a"); px(dcx - 3, dcy - dr - 5, 6, 2, "#fff0a0");
  // door opening (DOM door sits on top)
  for (let y = dcy - dr; y < 182; y++) for (let x = dcx - dr; x < dcx + dr; x++) {
    const dx = x + .5 - dcx, dy = y + .5 - dcy;
    if (y < dcy && Math.hypot(dx, dy) >= dr) continue;
    px(x, y, 1, 1, "#0b0610");
  }
  // steps
  px(158, 182, 84, 4, "#4a3e62"); px(158, 182, 84, 1, "#6a5a8c"); px(152, 186, 96, 3, "#3a2f4f");
  // sidewalk
  px(-M, 182, 400 + 2 * M, 10, "#251d36"); px(-M, 182, 400 + 2 * M, 1, "#3d3256");
  for (let x = -M; x < 400 + M; x += 20) px(x, 183, 1, 9, "#1a1428");
  px(-M, 192, 400 + 2 * M, 2, "#120c1b");
  // cobblestone street
  px(-M, 194, 400 + 2 * M, 31, "#120d1c");
  for (let y = 195, row = 0; y < 225; y += 5, row++) {
    for (let x = -M - (row % 2 ? 5 : 0); x < 400 + M; x += 10) {
      const col = pick(["#211a32", "#1d172d", "#251d38", "#1a1429"]);
      px(x + 1, y, 8, 4, col); px(x + 2, y, 6, 1, "#2e2545");
    }
  }
  // wet reflections (warm under the door + lanterns, cyan under neon)
  function glow(x, y, rx, ry, rgb, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, rx);
    g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.save(); c.globalCompositeOperation = "lighter"; c.translate(x, y); c.scale(1, ry / rx); c.translate(-x, -y);
    c.fillStyle = g; c.fillRect(x - rx, y - rx, rx * 2, rx * 2); c.restore();
  }
  glow(200, 200, 70, 18, "255,150,60", .35);
  glow(150, 206, 20, 8, "255,160,70", .25); glow(250, 206, 20, 8, "255,160,70", .25);
  glow(60, 205, 60, 10, "60,200,255", .12); glow(340, 205, 60, 10, "120,220,90", .12);
  glow(70, 140, 70, 40, "255,170,80", .1); glow(330, 140, 70, 40, "90,190,255", .08);
  glow(200, 60, 80, 50, "255,190,60", .14);
  // vignette
  const vg = c.createRadialGradient(200, 120, 90, 200, 120, 420);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(.55, "rgba(5,2,10,.35)"); vg.addColorStop(1, "rgba(5,2,10,.8)");
  c.fillStyle = vg; c.fillRect(-M, 0, LW + 2 * M, LH);

  /* ---------- pixel sprites ---------- */
  function svgPix(rows, pal, extra = "") {
    const w = Math.max(...rows.map(r => r.length)), h = rows.length;
    let r = "";
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        if (ch === "." || !pal[ch]) { x++; continue; }
        let e = x; while (e + 1 < row.length && row[e + 1] === ch) e++;
        r += `<rect x="${x}" y="${y}" width="${e - x + 1}" height="1" fill="${pal[ch]}"/>`; x = e + 1;
      }
    });
    return { rects: r, w, h, svg: `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r}${extra}</svg>` };
  }
  const SLIME = ["..........YY...YY...OO..........", "..........YY...YY...OO..........", "..........YY..YYYY..OO..........",
    "..........YYYYYYYYYOOO..........", "..........YYYYYYYYYOOO..........", "..........YYYYYYYYYOOO..........",
    "..........YYYOOOOOOOOO..........", "................................", "...........DDDDDDDDDD...........",
    ".........DDMMMMMMMMMMDD.........", ".......DDMMLLLLLLLLLLMMDD.......", "......DMMLLLLLLLLLLLLLLMMD......",
    ".....DMLLHHHLLLLLLLLLLLLLMD.....", "....DMLLHHHHHLLLLLLLLLLLLLMD....", "...DMLLLHHHHHLLLLLLLLLLLLLLMD...",
    "..DMLLLLLHHHLLLLLLLLLLLLLLLLMD..", "..DMLLLLLLLLLLLLLLLLLLLLLLLLMD..", ".DMLLLLLLLLLLLLLLLLLLLLLLLLLLMD.",
    ".DMLLLLLLLLLDLLLLLLDLLLLLLLLLMD.", "DMLLLLLLLLLLDLLLLLLDLLLLLLLLLLMD", "DMLHHLLLLLLLDLLLLLLDLLLLLLLLLLMD",
    "DSLHHLLLDLLLLLLLLLLLLLLDLLLLLLMD", "DSLLLLLLDLLLLLLLLLLLLLLDLLLLLLMD", "DSLLLLLLLDLLLLLLLLLLLLDLLLLLLLMD",
    "DSLLLLLLLLDLLLLLLLLLLDLLLLLLLLMD", "DSLLLLLLLLLDDDDDDDDDDLLLLLLLLLMD", "DSLLLLLLLLLLLLLLLLLLLLLLLLLLLLMD",
    "DSLLLLLLLLLLLLLLLLLLLLLLLLLLLLMD", ".DSLLLLLLLLLLLLLLLLLLLLLLLLLLMD.", ".DMSSSSSSSSLLLLLLLLLLLLLLLLMMMD.",
    "..DDMMMMMMMMMMMMMMMMMMMMMMMMDD..", "....DDDDDDDDDDDDDDDDDDDDDDDD...."];
  const slime = svgPix(SLIME, { Y: "#ffc21a", O: "#f5981f", D: "#1f7a3e", M: "#5cb43a", L: "#a8d15c", H: "#fff59d", S: "#d3ea55" });
  street.querySelectorAll("[data-slime]").forEach(el => el.innerHTML = slime.svg);

  // lantern
  const lantern = svgPix([
    "...kkkk...", "..kkggkk..", ".kkkkkkkk.", ".k.kkkk.k.", "kkkkkkkkkk", "kffyyyyffk", "kfyyWWyyfk", "kfyyWWyyfk",
    "kfyyyyyyfk", "kffyyyyffk", "kkkkkkkkkk", ".kkkkkkkk.", "...kkkk..."],
    { k: "#1d1724", g: "#5a4a6a", f: "#ffb44a", y: "#ffd56b", W: "#fff6d0" });
  street.querySelectorAll("[data-lantern]").forEach(el => el.innerHTML = lantern.svg);

  // pointing hand (gold)
  const hand = svgPix([
    "....kk......", "...kWWk.....", "...kWWk.....", "...kWWkkk...", "...kWWkWWkk.", ".kkkWWkWWkWk", "kWWkWWWWWkWk",
    "kWWWWWWWWWWk", ".kWWWWWWWWWk", "..kWWWWWWWk.", "...kWWWWWk..", "...kkkkkkk.."],
    { k: "#3a2400", W: "#ffd23a" });
  street.querySelectorAll("[data-hand]").forEach(el => el.innerHTML = hand.svg);

  // hero character, seen from behind: hoodie with the Medal Network medal on the back
  const BODY = [
    "........kssssssk........",
    "......kkhhhhhhhhkk......",
    "....kkhHHhhhhhhHHhkk....",
    "...khHhhhhhhhhhhhhHhk...",
    "..khhhhhhhxxyybbhhhhhk..",
    "..khhhhhhhhxyybhhhhhhk..",
    ".kHhhhhhhhggggghhhhhhHk.",
    ".kHhhhhhhgGggggghhhhhHk.",
    ".kHhhhhhhgggGgGghhhhhHk.",
    ".kHhhhhhhgggggGghhhhhHk.",
    ".kHhhhhhhhggGggghhhhhHk.",
    ".kHhdhhhhhhgggghhhhdhHk.",
    ".kHhdhhhhhhhhhhhhhhdhHk.",
    ".kHhdhhhhhhhhhhhhhhdhHk.",
    ".kHhdhhhhhhhhhhhhhhdhHk.",
    ".kHhdkhhhhhhhhhhhhkdhHk.",
    ".kHhdkhhhhhhhhhhhhkdhHk.",
    ".khhdkddddddddddddkdhhk.",
    ".kssdkpppppppppppkkdssk.",
    ".kssk.kppppppppppk.kssk.",
    "..kk..kpppPppPpppk..kk..",
    "......kpppPkkPpppk......",
    "......kpppPk.kPppk......",
    "......kpppPk.kPppk......",
    "......kpppPk.kPppk......",
    "......kpppPk.kPppk......",
    "......kpppk...kppk......",
    ".....kooook...koook.....",
    ".....kOOOOk...kOOOOk....",
  ];
  const HAIR = [
    "......r.....r....r......",
    ".....rRr..rRr...rRr.r...",
    "...r.rRRrrRRRr.rRRrrRr..",
    "..rRrRRRRRRRRRrRRRRRRr..",
    "..rRRRRRqRRRRRRRqRRRRRr.",
    ".rRRRqRRRRRRRRRRRRRRqRr.",
    ".rRRRRRRRRRRRRRRRRRRRRr.",
    "..rRRRRRRRRRRRRRRRRRRr..",
    "..rRRRRRRRRRRRRRRRRRRr..",
    "...rsRRRRRRRRRRRRRRRsr..",
    "...rsrRRRRRRRRRRRRRrsr..",
    ".....rrRRRRRRRRRRrr.....",
  ];
  const charPal = { k: "#0d0a14", s: "#d39a6a", h: "#2a2140", H: "#3d3160", d: "#1c162c", g: "#ffc21a", G: "#e8890f", x: "#5cb43a", y: "#ffc21a", b: "#2a9fd6",
    p: "#1a1626", P: "#262036", o: "#120f1a", O: "#3a3450", r: "#1a0f0a", R: "#3a2416", q: "#8a5a34" };
  // wind-blown hair frames: upper rows drift downwind more than lower rows
  function hairFrame(k) {
    return HAIR.map((row, i) => {
      const shift = i < 7 ? Math.round(k * (7 - i) / 7) : 0;
      if (!shift) return row;
      // keep the base silhouette (lower part) but let tips trail: shift right, fill left with original edge
      return (".".repeat(shift) + row).slice(0, 24 + shift).slice(0, 26);
    });
  }
  const charEl = street.querySelector("[data-char]");
  if (charEl) {
    const W = 26, H = HAIR.length + BODY.length - 1;
    const body = svgPix([...Array(HAIR.length - 1).fill(""), ...BODY], charPal);
    const frames = [0, 1, 2, 3].map(k => svgPix(hairFrame(k), charPal).rects);
    charEl.innerHTML = `<svg viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" aria-hidden="true">${body.rects}${frames.map((f, i) => `<g data-hair="${i}"${i ? ' style="display:none"' : ""}>${f}</g>`).join("")}</svg><span class="hero-char__shadow"></span>`;
  }
  const hairGroups = charEl ? [...charEl.querySelectorAll("[data-hair]")] : [];

  /* ---------- wind simulation ---------- */
  let wind = .35, target = .35, nextGust = 2500, gustEnd = 0, t = 0, last = performance.now();
  const swayers = [...street.querySelectorAll("[data-sway]")].map(el => {
    const [amp, freq, lean, phase] = el.dataset.sway.split(/\s+/).map(Number);
    return { el, amp, freq, lean, phase, flutter: el.hasAttribute("data-flutter") };
  });
  let hairK = 0, hairTimer = 0;
  function setHair(k) { if (k === hairK) return; hairGroups[hairK] && (hairGroups[hairK].style.display = "none"); hairGroups[k] && (hairGroups[k].style.display = ""); hairK = k; }

  /* ---------- particles ---------- */
  const fx = scene.querySelector("canvas.fx"), fctx = fx.getContext("2d");
  let FW = 0, FH = 0, U = 1, parts = [];
  function sizeFx() {
    const r = fx.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    FW = r.width; FH = r.height; U = FW / (LW + 2 * M); fx.width = FW * d; fx.height = FH * d; fctx.setTransform(d, 0, 0, d, 0, 0);
  }
  const LEAF = ["#5cb43a", "#8fd14f", "#ffc21a", "#e8890f", "#a8d15c"];
  function spawn(initial) {
    const r = Math.random(), type = r < .42 ? "leaf" : r < .82 ? "dust" : r < .95 ? "streak" : "paper";
    return {
      type, x: initial ? Math.random() * FW : -40 - Math.random() * 60,
      y: FH * (type === "streak" ? .25 + Math.random() * .7 : .35 + Math.random() * .62),
      vx: 0, vy: 0, rot: Math.random() * 6.28, vr: (Math.random() - .5) * 6, ph: Math.random() * 6.28,
      col: type === "leaf" ? LEAF[Math.random() * LEAF.length | 0] : type === "dust" ? "rgba(230,215,255,.7)" : "#e9e4f2",
      z: .6 + Math.random() * .8, len: 20 + Math.random() * 60,
    };
  }
  function stepParticles(dt) {
    const want = Math.round(24 + wind * 120);
    while (parts.length < want) parts.push(spawn(false));
    fctx.clearRect(0, 0, FW, FH);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const speed = (60 + wind * 380) * p.z * (FW / 2800);
      p.ph += dt * (2 + wind * 3);
      p.x += speed * dt * (p.type === "streak" ? 2.2 : 1);
      p.y += (Math.sin(p.ph) * (p.type === "leaf" || p.type === "paper" ? 26 : 8) + (p.type === "leaf" ? 6 : 0)) * dt * (FW / 2800);
      p.rot += p.vr * dt * (.5 + wind);
      if (p.x > FW + 80 || p.y > FH + 20) { if (parts.length > want) parts.splice(i, 1); else parts[i] = spawn(false); continue; }
      fctx.save();
      if (p.type === "streak") {
        const g = fctx.createLinearGradient(p.x - p.len * U * .4, 0, p.x, 0);
        g.addColorStop(0, "rgba(220,210,255,0)"); g.addColorStop(1, `rgba(220,210,255,${.07 + wind * .12})`);
        fctx.fillStyle = g; fctx.fillRect(p.x - p.len * U * .4, p.y, p.len * U * .4, Math.max(1, U * .35));
      } else {
        fctx.translate(p.x, p.y); fctx.rotate(p.rot);
        const s = U * p.z;
        if (p.type === "leaf") { fctx.fillStyle = p.col; fctx.fillRect(-s, -s * .5, s * 2, s); fctx.fillRect(-s * .5, -s, s, s * .5); }
        else if (p.type === "dust") { fctx.fillStyle = p.col; fctx.globalAlpha = .35 + wind * .4; fctx.fillRect(0, 0, s * .6, s * .6); }
        else { fctx.fillStyle = p.col; fctx.globalAlpha = .85; fctx.fillRect(-s * 1.6, -s * 2, s * 3.2, s * 4); fctx.fillStyle = "#b9b0cc"; fctx.fillRect(-s * 1.2, -s * 1.2, s * 2.4, s * .5); fctx.fillRect(-s * 1.2, -s * .2, s * 2, s * .5); }
      }
      fctx.restore();
    }
  }

  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    // gusts
    if (now > nextGust && !gustEnd) { target = .85 + Math.random() * .35; gustEnd = now + 1400 + Math.random() * 1600; }
    if (gustEnd && now > gustEnd) { target = .22 + Math.random() * .2; gustEnd = 0; nextGust = now + 3500 + Math.random() * 5000; }
    wind += (target - wind) * Math.min(1, dt * 1.6);
    // signs & medal & a-frame
    for (const s of swayers) {
      const osc = Math.sin(t * s.freq + s.phase) * s.amp * (.35 + wind) + Math.sin(t * s.freq * 2.7 + s.phase) * s.amp * .25 * wind;
      const ang = -wind * s.lean + osc;
      let tr = `rotate(${ang.toFixed(2)}deg)`;
      if (s.flutter) tr += ` skewY(${(Math.sin(t * 7 + s.phase) * wind * 2.2).toFixed(2)}deg)`;
      s.el.style.transform = tr;
    }
    // hair: stronger wind = longer trailing frames, with a quick flutter between neighbours
    hairTimer -= dt;
    if (hairTimer <= 0) {
      const baseK = wind > .85 ? 3 : wind > .6 ? 2 : wind > .35 ? 1 : 0;
      const flick = Math.random() < .45 ? -1 : 0;
      setHair(Math.max(0, baseK + flick));
      hairTimer = .09 + Math.random() * .12;
    }
    stepParticles(dt);
    requestAnimationFrame(frame);
  }
  sizeFx(); addEventListener("resize", sizeFx);
  for (let i = 0; i < 30; i++) parts.push(spawn(true));
  if (!reduce) requestAnimationFrame(frame);

  /* ---------- the door ---------- */
  const door = street.querySelector(".door"), flash = street.querySelector(".flash");
  let busy = false;
  door.addEventListener("click", () => {
    if (busy) return; busy = true;
    street.classList.add("is-open");
    setTimeout(() => flash.classList.add("on"), reduce ? 0 : 650);
    setTimeout(() => { const to = document.getElementById("brands"); to && to.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }, reduce ? 50 : 1250);
    setTimeout(() => { flash.classList.remove("on"); street.classList.remove("is-open"); busy = false; }, reduce ? 300 : 2600);
  });
})();
