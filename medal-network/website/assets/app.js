/* Medal Network demo: live counter, count-ups, reveal, toast, particles */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = n => Math.round(n).toLocaleString("en-US");

  let tt;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2400); }
  document.addEventListener("click", e => { const t = e.target.closest("[data-toast]"); if (t) { e.preventDefault(); toast(t.dataset.toast); } });
  $("#partnerForm").addEventListener("submit", e => { e.preventDefault(); toast("Thanks! We will get back to you within 2 working days (demo)"); e.target.reset(); });
  $("#burger").addEventListener("click", () => $("#nav").classList.toggle("nav-open"));
  $$(".nav__links a").forEach(a => a.addEventListener("click", () => $("#nav").classList.remove("nav-open")));

  // live MedalMC player count
  let live = 2481, shown = live;
  function paint() {
    const from = shown, to = live, t0 = performance.now(), dur = reduce ? 0 : 900;
    (function step(now) {
      const p = dur ? Math.min(1, (now - t0) / dur) : 1;
      shown = from + (to - from) * (1 - Math.pow(1 - p, 3));
      $$('[data-live="mc"]').forEach(el => el.textContent = fmt(shown));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  setInterval(() => { live = Math.max(1200, live + Math.round((Math.random() - .45) * 60)); paint(); }, 3500);

  // count-up when visible (starts from 70% so the real number never looks empty)
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, to = +el.dataset.count, t0 = performance.now(), dur = reduce ? 0 : 1500;
    (function step(now) { const p = dur ? Math.min(1, (now - t0) / dur) : 1; el.textContent = fmt(to * (.7 + .3 * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); })(t0);
    cio.unobserve(el);
  }), { threshold: .4 });
  $$("[data-count]").forEach(el => cio.observe(el));

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach(el => io.observe(el));

  // hero particles in the three brand colours
  const cv = $("#particles");
  if (cv && !reduce) {
    const ctx = cv.getContext("2d"), COLORS = ["#ffc21a", "#ffd95c", "#5cb43a", "#5ec5e8", "#f5981f"];
    let W, H, parts = [];
    const spawn = any => ({ x: Math.random() * W, y: any ? Math.random() * H : H + 10, s: 2 + Math.random() * 4, v: .2 + Math.random() * .6, a: .15 + Math.random() * .5, c: COLORS[Math.random() * COLORS.length | 0], w: Math.random() * 6.28 });
    function size() { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); parts = Array.from({ length: Math.round(W * H / 22000) }, () => spawn(true)); }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) { p.y -= p.v; p.w += .01; p.x += Math.sin(p.w) * .2; if (p.y < -10) Object.assign(p, spawn(false)); ctx.globalAlpha = p.a * Math.min(1, p.y / (H * .3)); ctx.fillStyle = p.c; ctx.fillRect(p.x | 0, p.y | 0, p.s | 0, p.s | 0); }
      ctx.globalAlpha = 1; requestAnimationFrame(frame);
    }
    size(); addEventListener("resize", size); requestAnimationFrame(frame);
  }
})();
