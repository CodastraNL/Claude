/* MedalMC demo: live counters, pixel icons, ticker, leaderboards, vote, countdown */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
  const fmt = n => Math.round(n).toLocaleString("en-US");

  /* ---------- pixel art ---------- */
  function pix(rows, pal) {
    const w = Math.max(...rows.map(r => r.length)), h = rows.length;
    let out = "";
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const c = row[x];
        if (c === "." || !pal[c]) { x++; continue; }
        let e = x; while (e + 1 < row.length && row[e + 1] === c) e++;
        out += `<rect x="${x}" y="${y}" width="${e - x + 1}" height="1" fill="${pal[c]}"/>`;
        x = e + 1;
      }
    });
    return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${out}</svg>`;
  }
  const ICONS = {
    shield: pix([
      "..KKKKKKKKKKKK..", ".KYYYYYYYYYYYYK.", ".KYGGGGGGGGGGOK.", ".KYGGGGGYGGGGOK.",
      ".KYGGGGYYYGGGOK.", ".KYGGGYYHYYGGOK.", ".KYGGYYHYYYYGOK.", ".KYGGGYYYYYGGOK.",
      ".KYGGGGYYYGGGOK.", ".KYGGGGGYGGGGOK.", "..KYGGGGGGGGOK..", "...KYGGGGGGOK...",
      "....KYGGGGOK....", ".....KYOOOK.....", "......KKKK......"],
      { K: "#1b2128", Y: "#ffd23a", O: "#e8910f", G: "#3f9b2a", H: "#fff59d" }),
    bed: pix([
      "..KKKK..........",
      ".KWWWWKKKKKKKKK.", ".KWWWWKRRRRRRRRK", ".KwwwwKRRRRRRRRK", ".KwwwwKrrrrrrrrK",
      ".KBBBBBBBBBBBBBK", ".KbbbbbbbbbbbbbK", ".KBK.........KBK", ".KKK.........KKK"],
      { K: "#1b2128", W: "#ffffff", w: "#cfd8e0", R: "#ff5a5f", r: "#c8343a", B: "#a0703c", b: "#6e4a24" }),
    sword: pix([
      "............KKK.", "...........KWCK.", "..........KWCcK.", ".........KWCcK..",
      "........KWCcK...", ".......KWCcK....", "..KK..KWCcK.....", "..KYKKWCcK......",
      "...KYWCcK.......", "....KYcK........", "...KNKYK........", "..KNK.KYK.......",
      ".KNK...KK.......", "KYK.............", "KK.............."],
      { K: "#1b2128", W: "#e9fbff", C: "#5ee6e0", c: "#1fa3a8", Y: "#ffc21a", N: "#7a4a24" }),
    island: pix([
      "......GGGG......", "....GGGGGGGG....", "...GgGGGGGGgG...", "...BBBBBBBBBB...",
      "....BbBBBBbB....", ".....bBBBBb.....", "......bBBb......", ".......bb......."],
      { G: "#5cb43a", g: "#3f9b2a", B: "#8a5a2b", b: "#5e3b1a" }),
    gloves: pix([
      "..KKKK....KKKK..", ".KRRRRK..KRRRRK.", ".KRRRRK..KRRRRK.", ".KRrrRK..KRrrRK.",
      ".KRRRRK..KRRRRK.", "..KWWK....KWWK..", "..KKKK....KKKK.."],
      { K: "#1b2128", R: "#b48cff", r: "#7d5cff", W: "#ffffff" }),
    pick: pix([
      "...KKKKKKKKK....", "..KCCCCCCCCCK...", ".KCcK.KNK.KcCK..", ".KK...KNK...KK..",
      "......KNK.......", "......KNK.......", "......KNK.......", "......KKK......."],
      { K: "#1b2128", C: "#ffd23a", c: "#e8910f", N: "#7a4a24" }),
  };
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
  const slimeSVG = pix(SLIME, { Y: "#ffc21a", O: "#f5981f", D: "#1f7a3e", M: "#5cb43a", L: "#a8d15c", H: "#fff59d", S: "#d3ea55" });
  $$("[data-icon]").forEach(el => { el.innerHTML = ICONS[el.dataset.icon] || ""; });
  $$("[data-slime]").forEach(el => { el.outerHTML = slimeSVG; });

  // procedural 8x8 player head from a name (original faces, no Mojang skins)
  function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function head(name) {
    const h = hash(name);
    const skin = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac", "#d9a066"][h % 6];
    const hair = ["#2b1d0e", "#6b3e1e", "#e8c15a", "#1b1b1b", "#b8462f", "#7d5cff", "#5ec5e8", "#ececec"][(h >> 3) % 8];
    const eye = ["#3b6fd8", "#3f9b2a", "#5a3b1e", "#1b2128", "#b48cff"][(h >> 6) % 5];
    const style = (h >> 9) % 3;
    const rows = [
      "HHHHHHHH",
      style === 0 ? "HHHHHHHH" : "HSHHHHSH",
      style === 2 ? "HSSSSSSH" : "SSSSSSSS",
      "SSSSSSSS",
      "SWESSEWS",
      "SSSssSSS",
      "SSsMMsSS",
      "SSSSSSSS"];
    return pix(rows, { H: hair, S: skin, s: shade(skin), W: "#ffffff", E: eye, M: "#8a3b2a" });
  }
  function shade(hex) { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) * .85, g = ((n >> 8) & 255) * .85, b = (n & 255) * .85; return `rgb(${r | 0},${g | 0},${b | 0})`; }

  /* ---------- toast + copy IP ---------- */
  let tt;
  function toast(msg) {
    const t = $("#toast");
    t.innerHTML = msg; t.classList.add("on");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2400);
  }
  async function copyIP() {
    const ip = "play.medalmc.com";
    try { await navigator.clipboard.writeText(ip); }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = ip; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e2) { /* ignore */ } ta.remove();
    }
    toast('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>IP copied: play.medalmc.com. See you in game!');
  }
  $$("[data-copy-ip]").forEach(el => {
    el.addEventListener("click", copyIP);
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); copyIP(); } });
  });
  document.addEventListener("click", e => { const t = e.target.closest("[data-toast]"); if (t) { e.preventDefault(); toast(t.dataset.toast); } });
  $("#burger").addEventListener("click", () => $("#nav").classList.toggle("nav-open"));
  $$(".nav__links a").forEach(a => a.addEventListener("click", () => $("#nav").classList.remove("nav-open")));

  /* ---------- live player counts ---------- */
  const live = { hcf: 812, bedwars: 1204, kitpvp: 465 };
  const shown = { ...live, total: live.hcf + live.bedwars + live.kitpvp };
  function paintLive() {
    const total = live.hcf + live.bedwars + live.kitpvp;
    const target = { ...live, total };
    const start = { ...shown }, t0 = performance.now(), dur = reduce ? 0 : 900;
    function step(now) {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - p, 3);
      for (const k in target) {
        shown[k] = start[k] + (target[k] - start[k]) * e;
        $$(`[data-live="${k}"]`).forEach(el => el.textContent = fmt(shown[k]));
      }
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  paintLive();
  setInterval(() => {
    for (const k in live) live[k] = Math.max(50, live[k] + Math.round((Math.random() - .45) * live[k] * .03));
    paintLive();
  }, 3500);

  // count-up stats when visible
  const countIO = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, to = +el.dataset.count, t0 = performance.now(), dur = reduce ? 0 : 1600;
    (function step(now) {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1;
      el.textContent = fmt(to * (0.7 + 0.3 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
    countIO.unobserve(el);
  }), { threshold: .4 });
  $$("[data-count]").forEach(el => countIO.observe(el));

  // ping jitter
  setInterval(() => {
    $$("[data-ping]").forEach(el => { const base = el.dataset.ping === "eu" ? 18 : 31; el.textContent = base + Math.round(Math.random() * 6 - 3); });
  }, 2000);

  /* ---------- ticker ---------- */
  const NAMES = ["Vexified", "Kai", "BlockBaron", "NovaStrike", "Frostbyte", "Lynx_", "Q7x", "EmberPvP", "Zenith", "PixelPaladin", "OrbitOP", "Ace", "SlimeKing", "Glacier", "Raidmaster", "Skylo"];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const EVENTS = [
    n => [`<b>${n}</b> won a BedWars Squads match`, "BW"],
    n => [`<b>${n}</b> is on a 25 killstreak`, "KIT"],
    n => [`Faction <b>${n}</b> captured KOTH Citadel`, "HCF"],
    n => [`<b>${n}</b> earned the <b>Champion</b> medal`, "MEDAL"],
    n => [`<b>${n}</b> reached Diamond in Ranked`, "BW"],
    n => [`<b>${n}</b> claimed a 500 coin bounty`, "KIT"],
    n => [`Faction <b>${n}</b> raided a base at 0, -1200`, "HCF"],
    n => [`<b>${n}</b> joined the network for the first time`, "NEW"],
  ];
  const items = Array.from({ length: 16 }, () => { const n = pick(NAMES); const [txt, tag] = pick(EVENTS)(n); return `<span class="tick">${head(n)}<em>${tag}</em>${txt}</span>`; }).join("");
  $("#ticker").innerHTML = items + items;

  /* ---------- vote for next mode ---------- */
  const SOON = [
    { id: "skywars", name: "SkyWars", icon: "island", base: 1840 },
    { id: "practice", name: "Practice", icon: "gloves", base: 1525 },
    { id: "survival", name: "Survival", icon: "pick", base: 990 },
  ];
  let myVote = store.get("mmc-vote", null);
  function drawSoon() {
    const votes = SOON.map(s => s.base + (myVote === s.id ? 1 : 0));
    const total = votes.reduce((a, b) => a + b, 0);
    $("#soon").innerHTML = SOON.map((s, i) => {
      const pct = Math.round(votes[i] / total * 100);
      return `<button class="soon__card reveal in${myVote === s.id ? " voted" : ""}" data-vote="${s.id}" type="button">
        ${ICONS[s.icon]}
        <div class="soon__info"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h4>${s.name}</h4><span class="chip chip--soon">${myVote === s.id ? "Your vote" : "Vote"}</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div><div class="meta"><span>${fmt(votes[i])} votes</span><span>${pct}%</span></div></div>
      </button>`;
    }).join("");
  }
  drawSoon();
  $("#soon").addEventListener("click", e => {
    const b = e.target.closest("[data-vote]"); if (!b) return;
    myVote = myVote === b.dataset.vote ? null : b.dataset.vote; store.set("mmc-vote", myVote); drawSoon();
    if (myVote) toast(`Thanks! You voted for ${SOON.find(s => s.id === myVote).name}`);
  });

  /* ---------- leaderboards ---------- */
  const LB = {
    bedwars: { cols: ["#", "Player", "Wins", "Final kills", "Win rate"], rows: [
      ["NovaStrike", 4821, 15204, "71%", true], ["Frostbyte", 4410, 13980, "68%"], ["Vexified", 4102, 14311, "66%"], ["PixelPaladin", 3877, 11802, "64%"], ["Glacier", 3640, 10955, "62%"], ["Skylo", 3412, 9870, "61%"]] },
    hcf: { cols: ["#", "Faction", "Points", "KOTHs", "Members"], rows: [
      ["Raidmaster", 2840, 12, 15, true], ["SlimeKing", 2615, 9, 14], ["BlockBaron", 2290, 8, 12], ["Zenith", 1980, 6, 10], ["OrbitOP", 1745, 4, 11], ["EmberPvP", 1520, 3, 9]] },
    kitpvp: { cols: ["#", "Player", "Kills", "K/D", "Best streak"], rows: [
      ["Ace", 18320, "4.82", 87, true], ["Lynx_", 16904, "4.10", 74], ["Kai", 15211, "3.96", 69], ["Q7x", 13870, "3.55", 61], ["EmberPvP", 12006, "3.21", 58], ["Zenith", 11450, "3.02", 52]] },
  };
  function drawLB(key) {
    const d = LB[key];
    $("#lbHead").innerHTML = `<tr>${d.cols.map((c, i) => `<th class="${i > 1 ? "num-r" : ""}${i === 3 ? " hide-xs" : ""}">${c}</th>`).join("")}</tr>`;
    $("#lbBody").innerHTML = d.rows.map((r, i) => `<tr>
      <td><span class="rank rank--${i + 1}">${String(i + 1).padStart(2, "0")}</span></td>
      <td><span class="player">${head(r[0])}${r[0]}${r[4] ? '<span class="tag-medal">🏅 #1</span>' : ""}</span></td>
      <td class="num-r">${typeof r[1] === "number" ? fmt(r[1]) : r[1]}</td>
      <td class="num-r hide-xs">${typeof r[2] === "number" ? fmt(r[2]) : r[2]}</td>
      <td class="num-r">${typeof r[3] === "number" ? fmt(r[3]) : r[3]}</td></tr>`).join("");
  }
  drawLB("bedwars");
  $("#lbTabs").addEventListener("click", e => {
    const b = e.target.closest("[data-lb]"); if (!b) return;
    $$("#lbTabs .tab").forEach(t => t.classList.toggle("on", t === b)); drawLB(b.dataset.lb);
  });

  // 24h bars
  const bars = $("#bars");
  const curve = Array.from({ length: 24 }, (_, i) => 0.35 + 0.65 * Math.pow(Math.sin(((i - 6) / 24) * Math.PI), 2));
  bars.innerHTML = curve.map(v => `<i style="height:${Math.round(v * 100)}%"></i>`).join("");
  setInterval(() => { const last = bars.lastElementChild; last.style.height = (70 + Math.random() * 30).toFixed(0) + "%"; }, 3500);

  // community avatars
  $("#avatars").innerHTML = ["NovaStrike", "Kai", "Frostbyte", "Ace", "Zenith", "Lynx_", "SlimeKing"].map(head).join("");

  /* ---------- season countdown (next Sunday 20:00 + 7 days) ---------- */
  const end = (() => { const d = new Date(); d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7) + 7); d.setHours(20, 0, 0, 0); return d; })();
  const p2 = n => String(n).padStart(2, "0");
  function tick() {
    const s = Math.max(0, (end - new Date()) / 1000 | 0);
    const d = s / 86400 | 0, h = s % 86400 / 3600 | 0, m = s % 3600 / 60 | 0, sec = s % 60;
    $$('[data-cd="d"]').forEach(e => e.textContent = p2(d)); $$('[data-cd="h"]').forEach(e => e.textContent = p2(h));
    $$('[data-cd="m"]').forEach(e => e.textContent = p2(m)); $$('[data-cd="s"]').forEach(e => e.textContent = p2(sec));
    $$("[data-cd-short]").forEach(e => e.textContent = `${d}d ${h}h ${m}m`);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- hero particles (pixel squares rising) ---------- */
  const cv = $("#particles");
  if (cv && !reduce) {
    const ctx = cv.getContext("2d");
    let W, H, parts = [];
    const COLORS = ["#ffc21a", "#ffd95c", "#5cb43a", "#8fe076", "#f5981f"];
    function size() {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(W * H / 22000);
      parts = Array.from({ length: n }, () => spawn(true));
    }
    function spawn(any) {
      return { x: Math.random() * W, y: any ? Math.random() * H : H + 10, s: 2 + Math.random() * 4, v: .2 + Math.random() * .6, a: .15 + Math.random() * .5, c: pick(COLORS), w: Math.random() * Math.PI * 2 };
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y -= p.v; p.w += .01; p.x += Math.sin(p.w) * .2;
        if (p.y < -10) Object.assign(p, spawn(false));
        ctx.globalAlpha = p.a * Math.min(1, p.y / (H * .3));
        ctx.fillStyle = p.c; ctx.fillRect(p.x | 0, p.y | 0, p.s | 0, p.s | 0);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    size(); addEventListener("resize", size); requestAnimationFrame(frame);
  }
})();
