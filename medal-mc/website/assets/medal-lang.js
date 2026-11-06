/*!
 * Medal language picker: one component for every Medal Network site.
 * Mobile: bottom sheet (drag handle, swipe down to close). Desktop: centered dialog.
 * Usage:
 *   <button data-medal-lang></button>            full trigger (flag + name)
 *   <button data-medal-lang="compact"></button>  flag + code only
 *   <script src="medal-lang.js"></script>
 *   MedalLang.init({ current: "en", onSelect: lang => location.href = lang.url });
 * Theme with CSS variables on :root: --ml-panel, --ml-surface, --ml-text, --ml-muted, --ml-accent, --ml-accent-text.
 * Made by Codastra.
 */
(function () {
  "use strict";

  /* ---------- round flags (30x30, clipped to a circle) ---------- */
  const F = {
    gb: '<rect width="30" height="30" fill="#012169"/><path d="M0 0L30 30M30 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0L30 30M30 0L0 30" stroke="#C8102E" stroke-width="2.4"/><path d="M15 0V30M0 15H30" stroke="#fff" stroke-width="10"/><path d="M15 0V30M0 15H30" stroke="#C8102E" stroke-width="6"/>',
    de: '<rect width="30" height="10" fill="#000"/><rect y="10" width="30" height="10" fill="#DD0000"/><rect y="20" width="30" height="10" fill="#FFCE00"/>',
    es: '<rect width="30" height="30" fill="#AA151B"/><rect y="7.5" width="30" height="15" fill="#F1BF00"/><rect x="7" y="12" width="4" height="6" rx="1" fill="#AA151B" opacity=".75"/>',
    fr: '<rect width="10" height="30" fill="#0055A4"/><rect x="10" width="10" height="30" fill="#fff"/><rect x="20" width="10" height="30" fill="#EF4135"/>',
    it: '<rect width="10" height="30" fill="#009246"/><rect x="10" width="10" height="30" fill="#fff"/><rect x="20" width="10" height="30" fill="#CE2B37"/>',
    nl: '<rect width="30" height="10" fill="#AE1C28"/><rect y="10" width="30" height="10" fill="#fff"/><rect y="20" width="30" height="10" fill="#21468B"/>',
    pl: '<rect width="30" height="15" fill="#fff"/><rect y="15" width="30" height="15" fill="#DC143C"/>',
    pt: '<rect width="30" height="30" fill="#FF0000"/><rect width="12" height="30" fill="#006600"/><circle cx="12" cy="15" r="5" fill="#FFCC00"/><circle cx="12" cy="15" r="3" fill="#FF0000"/><rect x="10.6" y="13.2" width="2.8" height="3.6" rx=".6" fill="#fff"/>',
    ru: '<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#0039A6"/><rect y="20" width="30" height="10" fill="#D52B1E"/>',
    tr: '<rect width="30" height="30" fill="#E30A17"/><circle cx="12.5" cy="15" r="6.5" fill="#fff"/><circle cx="14.2" cy="15" r="5.2" fill="#E30A17"/><path d="M19.2 15l4.6-1.5-2.85 3.9V12.6l2.85 3.9z" fill="#fff"/>',
    cn: '<rect width="30" height="30" fill="#DE2910"/><path d="M8 6l1.2 3.6H13l-3 2.2 1.1 3.6L8 13.2 4.9 15.4 6 11.8 3 9.6h3.8z" fill="#FFDE00"/><circle cx="15" cy="5.5" r="1.1" fill="#FFDE00"/><circle cx="17.5" cy="8.5" r="1.1" fill="#FFDE00"/><circle cx="17.5" cy="12.5" r="1.1" fill="#FFDE00"/><circle cx="15" cy="15.5" r="1.1" fill="#FFDE00"/>',
  };
  let uid = 0;
  function flag(code) {
    const id = "mlc" + (++uid);
    return `<svg class="ml-flag" viewBox="0 0 30 30" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="15" cy="15" r="15"/></clipPath></defs><g clip-path="url(#${id})">${F[code] || ""}</g><circle cx="15" cy="15" r="14.5" fill="none" stroke="rgba(255,255,255,.18)"/></svg>`;
  }

  /* ---------- default languages (same set and URLs as medalcapes.com) ---------- */
  const DEFAULT_LANGS = [
    { code: "en", name: "English", flag: "gb", path: "/" },
    { code: "de", name: "Deutsch", flag: "de", path: "/de" },
    { code: "es", name: "Español", flag: "es", path: "/es" },
    { code: "fr", name: "Français", flag: "fr", path: "/fr" },
    { code: "it", name: "Italiano", flag: "it", path: "/it" },
    { code: "nl", name: "Nederlands", flag: "nl", path: "/nl" },
    { code: "pl", name: "Polski", flag: "pl", path: "/pl" },
    { code: "pt", name: "Português", flag: "pt", path: "/pt" },
    { code: "ru", name: "Русский", flag: "ru", path: "/ru" },
    { code: "tr", name: "Türkçe", flag: "tr", path: "/tr" },
    { code: "zh", name: "中文", flag: "cn", path: "/zh" },
  ];

  /* ---------- styles (injected once) ---------- */
  const CSS = `
:root{--ml-panel:#151a24;--ml-surface:rgba(255,255,255,.05);--ml-hover:rgba(255,255,255,.07);--ml-line:rgba(255,255,255,.08);--ml-text:#f4f6f8;--ml-muted:#8d97a5;--ml-accent:#ffc21a;--ml-accent-text:#ffd95c;--ml-accent-bg:rgba(255,194,26,.12);--ml-radius:22px;--ml-font:inherit}
.ml-trigger{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 12px 0 8px;border-radius:999px;border:1px solid var(--ml-line);background:var(--ml-surface);color:var(--ml-text);font:600 14px/1 var(--ml-font);cursor:pointer;transition:background .2s,border-color .2s;white-space:nowrap}
.ml-trigger:hover{background:var(--ml-hover);border-color:rgba(255,255,255,.16)}
.ml-trigger .ml-flag{width:24px;height:24px;flex:none}
.ml-trigger .ml-chev{width:14px;height:14px;opacity:.6;transition:transform .2s}
.ml-trigger[aria-expanded="true"] .ml-chev{transform:rotate(180deg)}
.ml-trigger--compact{padding:0 10px 0 8px;gap:6px}
.ml-trigger--compact .ml-name{display:none}
.ml-trigger .ml-code{display:none;text-transform:uppercase;font-size:12px;letter-spacing:.04em}
.ml-trigger--compact .ml-code{display:inline}
.ml-root{position:fixed;inset:0;z-index:2147483000;display:none}
.ml-root.ml-open{display:block}
.ml-backdrop{position:absolute;inset:0;background:rgba(4,6,10,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .28s ease}
.ml-root.ml-in .ml-backdrop{opacity:1}
.ml-sheet{position:absolute;left:0;right:0;bottom:0;max-height:88vh;max-height:88dvh;display:flex;flex-direction:column;background:var(--ml-panel);color:var(--ml-text);border-radius:var(--ml-radius) var(--ml-radius) 0 0;box-shadow:0 -20px 60px rgba(0,0,0,.45);border:1px solid var(--ml-line);border-bottom:0;font-family:var(--ml-font);transform:translateY(100%);transition:transform .34s cubic-bezier(.2,.9,.25,1);padding-bottom:env(safe-area-inset-bottom)}
.ml-root.ml-in .ml-sheet{transform:translateY(0)}
.ml-sheet.ml-dragging{transition:none}
.ml-grab{padding:10px 0 2px;display:flex;justify-content:center;cursor:grab;touch-action:none}
.ml-grab span{width:42px;height:5px;border-radius:3px;background:rgba(255,255,255,.22)}
.ml-head{display:flex;align-items:center;justify-content:space-between;padding:12px 22px 8px 26px;touch-action:none}
.ml-head h2{margin:0;font-size:22px;font-weight:700;letter-spacing:-.01em;color:var(--ml-text)}
.ml-x{width:44px;height:44px;border-radius:50%;border:0;background:var(--ml-surface);color:var(--ml-text);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s}
.ml-x:hover{background:var(--ml-hover)}
.ml-body{overflow-y:auto;overscroll-behavior:contain;padding:6px 16px 8px}
.ml-label{margin:16px 10px 10px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ml-muted)}
.ml-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.ml-item{display:flex;align-items:center;gap:14px;min-height:56px;padding:0 14px;border-radius:14px;border:0;background:transparent;color:var(--ml-text);font:500 17px/1.2 var(--ml-font);text-align:left;cursor:pointer;transition:background .15s}
.ml-item:hover{background:var(--ml-hover)}
.ml-item:focus-visible{outline:2px solid var(--ml-accent);outline-offset:-2px}
.ml-item .ml-flag{width:30px;height:30px;flex:none}
.ml-item .ml-n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ml-item .ml-ok{width:20px;height:20px;color:var(--ml-accent);display:none}
.ml-item[aria-checked="true"]{background:var(--ml-accent-bg);color:var(--ml-accent-text)}
.ml-item[aria-checked="true"] .ml-ok{display:block}
.ml-foot{margin:10px 16px 0;padding:16px 10px 18px;border-top:1px solid var(--ml-line);font-size:15px;color:var(--ml-muted);display:flex;align-items:center;gap:8px}
.ml-foot a{color:var(--ml-accent-text);text-decoration:none;font-weight:600}
.ml-foot a:hover{text-decoration:underline}
.ml-foot svg{width:18px;height:18px;opacity:.8}
@media (min-width:720px){
  .ml-sheet{left:50%;top:50%;bottom:auto;right:auto;width:min(560px,calc(100vw - 48px));max-height:min(680px,calc(100vh - 80px));border-radius:var(--ml-radius);border-bottom:1px solid var(--ml-line);transform:translate(-50%,-46%) scale(.97);opacity:0;transition:transform .26s cubic-bezier(.2,.9,.25,1),opacity .2s}
  .ml-root.ml-in .ml-sheet{transform:translate(-50%,-50%) scale(1);opacity:1}
  .ml-grab{display:none}
  .ml-head{padding-top:22px}
  .ml-foot{margin-bottom:6px}
}
@media (prefers-reduced-motion:reduce){.ml-sheet,.ml-backdrop{transition:none!important}}
`;
  const ICON_X = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICON_OK = '<svg class="ml-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_CHEV = '<svg class="ml-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const ICON_TR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h8M8 3v2M10.5 5c-.6 3.5-3 6.5-6.5 8M6 9c1.2 2 3 3.6 5 4.5"/><path d="M13 21l4-9 4 9M14.4 18h5.2"/></svg>';

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };

  const MedalLang = {
    opts: null, root: null, lastTrigger: null,
    init(o = {}) {
      this.opts = Object.assign({
        languages: DEFAULT_LANGS,
        current: null,                      // code; default: stored choice, <html lang>, then "en"
        title: "Language", suggested: "Suggested", all: "All languages",
        missing: "Missing yours?", helpText: "Help translate", helpHref: "#",
        storageKey: "medal-lang",
        baseUrl: "",                        // e.g. "https://medalcapes.com" to build lang.url
        onSelect: null,                     // function(lang) — default: store + update UI + dispatch event
      }, o);
      const L = this.opts.languages;
      L.forEach(l => { l.url = l.url || (this.opts.baseUrl + l.path); });
      const htmlLang = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
      const cur = this.opts.current || store.get(this.opts.storageKey) || (L.some(l => l.code === htmlLang) ? htmlLang : "en");
      this.current = L.find(l => l.code === cur) || L[0];
      if (!document.getElementById("ml-css")) { const st = document.createElement("style"); st.id = "ml-css"; st.textContent = CSS; document.head.prepend(st); } // first in <head>, so site themes override the defaults
      this.paintTriggers();
      document.addEventListener("click", e => { const t = e.target.closest("[data-medal-lang]"); if (t) { e.preventDefault(); this.open(t); } });
      return this;
    },
    paintTriggers() {
      document.querySelectorAll("[data-medal-lang]").forEach(t => {
        const compact = t.getAttribute("data-medal-lang") === "compact";
        t.classList.add("ml-trigger"); t.classList.toggle("ml-trigger--compact", compact);
        if (t.tagName === "BUTTON") t.type = "button";
        t.setAttribute("aria-haspopup", "dialog"); t.setAttribute("aria-expanded", "false");
        t.setAttribute("aria-label", `${this.opts.title}: ${this.current.name}`);
        t.innerHTML = `${flag(this.current.flag)}<span class="ml-name">${esc(this.current.name)}</span><span class="ml-code">${esc(this.current.code)}</span>${ICON_CHEV}`;
      });
    },
    suggestedList() {
      const L = this.opts.languages, out = [this.current];
      const nav = (navigator.languages || [navigator.language || ""]).map(x => x.slice(0, 2).toLowerCase());
      nav.forEach(c => { const l = L.find(x => x.code === c); if (l && !out.includes(l)) out.push(l); });
      return out.slice(0, 2);
    },
    build() {
      const o = this.opts, sug = this.suggestedList();
      const item = l => `<button class="ml-item" role="menuitemradio" aria-checked="${l === this.current}" data-code="${l.code}" lang="${l.code}">${flag(l.flag)}<span class="ml-n">${esc(l.name)}</span>${ICON_OK}</button>`;
      const root = document.createElement("div");
      root.className = "ml-root";
      root.innerHTML = `<div class="ml-backdrop" data-ml-close></div>
<div class="ml-sheet" role="dialog" aria-modal="true" aria-labelledby="ml-title">
  <div class="ml-grab"><span></span></div>
  <div class="ml-head"><h2 id="ml-title">${esc(o.title)}</h2><button class="ml-x" type="button" aria-label="Close" data-ml-close>${ICON_X}</button></div>
  <div class="ml-body">
    <p class="ml-label">${esc(o.suggested)}</p>
    <div class="ml-grid" role="menu">${sug.map(item).join("")}</div>
    <p class="ml-label">${esc(o.all)}</p>
    <div class="ml-grid" role="menu">${o.languages.filter(l => !sug.includes(l)).map(item).join("")}</div>
  </div>
  <div class="ml-foot">${ICON_TR}<span>${esc(o.missing)}</span><a href="${esc(o.helpHref)}">${esc(o.helpText)}</a></div>
</div>`;
      root.addEventListener("click", e => {
        if (e.target.closest("[data-ml-close]")) return this.close();
        const it = e.target.closest(".ml-item"); if (it) this.select(it.dataset.code);
      });
      root.addEventListener("keydown", e => {
        if (e.key === "Escape") this.close();
        if (e.key === "Tab") { // keep focus inside
          const f = [...root.querySelectorAll("button,a")], i = f.indexOf(document.activeElement);
          if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        }
      });
      this.enableDrag(root);
      document.body.appendChild(root);
      return root;
    },
    enableDrag(root) {
      const sheet = root.querySelector(".ml-sheet");
      let y0 = null, dy = 0;
      const start = e => { if (matchMedia("(min-width:720px)").matches) return; y0 = e.clientY; dy = 0; sheet.classList.add("ml-dragging"); e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); };
      const move = e => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; };
      const end = () => { if (y0 === null) return; sheet.classList.remove("ml-dragging"); sheet.style.transform = ""; y0 = null; if (dy > 90) this.close(); };
      root.querySelectorAll(".ml-grab,.ml-head").forEach(h => { h.addEventListener("pointerdown", start); h.addEventListener("pointermove", move); h.addEventListener("pointerup", end); h.addEventListener("pointercancel", end); });
    },
    open(trigger) {
      if (this.root) this.root.remove();
      this.root = this.build(); this.lastTrigger = trigger || null;
      this.prevOverflow = document.documentElement.style.overflow; document.documentElement.style.overflow = "hidden";
      document.querySelectorAll("[data-medal-lang]").forEach(t => t.setAttribute("aria-expanded", "true"));
      this.root.classList.add("ml-open");
      requestAnimationFrame(() => requestAnimationFrame(() => this.root.classList.add("ml-in")));
      setTimeout(() => { const sel = this.root.querySelector('.ml-item[aria-checked="true"]'); (sel || this.root.querySelector(".ml-x")).focus({ preventScroll: true }); }, 60);
    },
    close() {
      if (!this.root) return;
      const r = this.root; this.root = null;
      r.classList.remove("ml-in");
      document.documentElement.style.overflow = this.prevOverflow || "";
      document.querySelectorAll("[data-medal-lang]").forEach(t => t.setAttribute("aria-expanded", "false"));
      setTimeout(() => r.remove(), 320);
      this.lastTrigger && this.lastTrigger.focus({ preventScroll: true });
    },
    select(code) {
      const l = this.opts.languages.find(x => x.code === code); if (!l) return;
      const changed = l !== this.current;
      this.current = l; store.set(this.opts.storageKey, code);
      document.documentElement.lang = code;
      this.paintTriggers();
      this.root && this.root.querySelectorAll(".ml-item").forEach(b => b.setAttribute("aria-checked", String(b.dataset.code === code)));
      setTimeout(() => this.close(), 160);
      if (changed) {
        document.dispatchEvent(new CustomEvent("medal:lang", { detail: l }));
        if (typeof this.opts.onSelect === "function") this.opts.onSelect(l);
      }
    },
    flag,
  };
  window.MedalLang = MedalLang;
})();
