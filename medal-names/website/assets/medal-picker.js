/*!
 * Medal pickers: language + currency, one component for every Medal Network site.
 * Mobile: bottom sheet (drag handle, swipe down to close). Desktop: centered dialog.
 *
 *   <button data-medal-lang></button>                 flag + language name
 *   <button data-medal-lang="compact"></button>       flag + code (EN)
 *   <button data-medal-currency></button>             symbol + code + name
 *   <button data-medal-currency="compact"></button>   symbol + code
 *   <script src="medal-picker.js"></script>
 *   MedalLang.init({ current: "en", onSelect: l => location.href = l.url });
 *   MedalCurrency.init({ current: "USD", onSelect: c => location.search = "?currency=" + c.code.toLowerCase() });
 *
 * Theme with CSS variables on :root: --ml-panel, --ml-surface, --ml-hover, --ml-line, --ml-text,
 * --ml-muted, --ml-accent, --ml-accent-text, --ml-accent-bg, --ml-radius, --ml-font.
 * Made by Codastra.
 */
(function () {
  "use strict";

  /* ---------- round flags (30x30, clipped to a circle) ---------- */
  const F = {
    gb: '<rect width="30" height="30" fill="#012169"/><path d="M0 0L30 30M30 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0L30 30M30 0L0 30" stroke="#C8102E" stroke-width="2.4"/><path d="M15 0V30M0 15H30" stroke="#fff" stroke-width="10"/><path d="M15 0V30M0 15H30" stroke="#C8102E" stroke-width="6"/>',
    us: '<rect width="30" height="30" fill="#B22234"/><rect y="2.31" width="30" height="2.31" fill="#fff"/><rect y="6.92" width="30" height="2.31" fill="#fff"/><rect y="11.54" width="30" height="2.31" fill="#fff"/><rect y="16.15" width="30" height="2.31" fill="#fff"/><rect y="20.77" width="30" height="2.31" fill="#fff"/><rect y="25.38" width="30" height="2.31" fill="#fff"/><rect width="15" height="16.15" fill="#3C3B6E"/><circle cx="2.4" cy="2.6" r=".75" fill="#fff"/><circle cx="5.8" cy="2.6" r=".75" fill="#fff"/><circle cx="9.2" cy="2.6" r=".75" fill="#fff"/><circle cx="12.6" cy="2.6" r=".75" fill="#fff"/><circle cx="2.4" cy="6.2" r=".75" fill="#fff"/><circle cx="5.8" cy="6.2" r=".75" fill="#fff"/><circle cx="9.2" cy="6.2" r=".75" fill="#fff"/><circle cx="12.6" cy="6.2" r=".75" fill="#fff"/><circle cx="2.4" cy="9.8" r=".75" fill="#fff"/><circle cx="5.8" cy="9.8" r=".75" fill="#fff"/><circle cx="9.2" cy="9.8" r=".75" fill="#fff"/><circle cx="12.6" cy="9.8" r=".75" fill="#fff"/><circle cx="2.4" cy="13.4" r=".75" fill="#fff"/><circle cx="5.8" cy="13.4" r=".75" fill="#fff"/><circle cx="9.2" cy="13.4" r=".75" fill="#fff"/><circle cx="12.6" cy="13.4" r=".75" fill="#fff"/>',
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
  // round currency badge with the symbol
  function badge(sym) {
    const len = [...sym].length, size = len <= 1 ? 15 : len === 2 ? 12 : len === 3 ? 10 : 8.5;
    return `<span class="ml-flag ml-badge" aria-hidden="true" style="font-size:${size}px">${esc(sym)}</span>`;
  }

  /* ---------- defaults (same sets as medalcapes.com) ---------- */
  const DEFAULT_LANGS = [
    { code: "en", name: "English", flag: "us", path: "/" },
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
  const DEFAULT_CURRENCIES = [
    ["USD", "$", "US Dollar"], ["EUR", "€", "Euro"], ["GBP", "£", "British Pound"], ["AED", "AED", "UAE Dirham"],
    ["ARS", "$", "Argentine Peso"], ["AUD", "A$", "Australian Dollar"], ["BDT", "৳", "Bangladeshi Taka"], ["BOB", "Bs", "Bolivian Boliviano"],
    ["BRL", "R$", "Brazilian Real"], ["CAD", "C$", "Canadian Dollar"], ["CLP", "$", "Chilean Peso"], ["COP", "$", "Colombian Peso"],
    ["CRC", "₡", "Costa Rican Colón"], ["DZD", "DA", "Algerian Dinar"], ["EGP", "E£", "Egyptian Pound"], ["IDR", "Rp", "Indonesian Rupiah"],
    ["ILS", "₪", "Israeli Shekel"], ["INR", "₹", "Indian Rupee"], ["IQD", "IQD", "Iraqi Dinar"], ["JMD", "J$", "Jamaican Dollar"],
    ["JOD", "JD", "Jordanian Dinar"], ["KES", "KSh", "Kenyan Shilling"], ["MAD", "DH", "Moroccan Dirham"], ["MXN", "MX$", "Mexican Peso"],
    ["NGN", "₦", "Nigerian Naira"], ["PEN", "S/", "Peruvian Sol"], ["PHP", "₱", "Philippine Peso"], ["PKR", "Rs", "Pakistani Rupee"],
    ["PLN", "zł", "Polish Złoty"], ["PYG", "₲", "Paraguayan Guaraní"], ["SAR", "SR", "Saudi Riyal"], ["TRY", "₺", "Turkish Lira"],
    ["UAH", "₴", "Ukrainian Hryvnia"], ["UYU", "$U", "Uruguayan Peso"], ["UZS", "so'm", "Uzbek Som"], ["VND", "₫", "Vietnamese Đồng"],
    ["ZAR", "R", "South African Rand"],
  ].map(([code, symbol, name]) => ({ code, symbol, name }));
  // browser region -> local currency, for suggestions
  const REGION_CURRENCY = { US: "USD", GB: "GBP", NL: "EUR", BE: "EUR", DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", PT: "EUR", AT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR",
    PL: "PLN", TR: "TRY", BR: "BRL", MX: "MXN", AR: "ARS", CA: "CAD", AU: "AUD", IN: "INR", ID: "IDR", PH: "PHP", ZA: "ZAR", NG: "NGN", EG: "EGP", SA: "SAR", AE: "AED",
    IL: "ILS", UA: "UAH", CO: "COP", CL: "CLP", PE: "PEN", VN: "VND", PK: "PKR", BD: "BDT", KE: "KES", MA: "MAD", DZ: "DZD", JO: "JOD", IQ: "IQD", JM: "JMD", UY: "UYU", PY: "PYG", BO: "BOB", CR: "CRC", UZ: "UZS" };

  /* ---------- styles (injected once, first in <head> so site themes win) ---------- */
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
.ml-trigger--cur .ml-code{display:inline;font-size:13px}
.ml-trigger--cur .ml-name{display:none}
.ml-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--ml-accent-bg);color:var(--ml-accent-text);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);font-weight:800;line-height:1;letter-spacing:-.02em;overflow:hidden;white-space:nowrap}
.ml-trigger .ml-badge{font-size:11px!important}
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
.ml-search{position:relative;margin:6px 26px 4px}
.ml-search svg{position:absolute;left:14px;top:50%;width:18px;height:18px;transform:translateY(-50%);color:var(--ml-muted);pointer-events:none}
.ml-search input{width:100%;height:46px;padding:0 14px 0 42px;border-radius:14px;border:1px solid var(--ml-line);background:var(--ml-surface);color:var(--ml-text);font:500 16px var(--ml-font);outline:none;transition:border-color .2s}
.ml-search input:focus{border-color:var(--ml-accent)}
.ml-search input::placeholder{color:var(--ml-muted)}
.ml-body{overflow-y:auto;overscroll-behavior:contain;padding:6px 16px 8px}
.ml-label{margin:16px 10px 10px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ml-muted)}
.ml-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.ml-item{display:flex;align-items:center;gap:14px;min-height:56px;padding:0 14px;border-radius:14px;border:0;background:transparent;color:var(--ml-text);font:500 17px/1.2 var(--ml-font);text-align:left;cursor:pointer;transition:background .15s;min-width:0}
.ml-item:hover{background:var(--ml-hover)}
.ml-item:focus-visible{outline:2px solid var(--ml-accent);outline-offset:-2px}
.ml-item .ml-flag{width:30px;height:30px;flex:none}
.ml-item .ml-n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ml-item .ml-n small{display:block;margin-top:3px;font-size:13px;font-weight:500;color:var(--ml-muted);overflow:hidden;text-overflow:ellipsis}
.ml-item .ml-ok{width:20px;height:20px;color:var(--ml-accent);display:none;flex:none}
.ml-item[aria-checked="true"]{background:var(--ml-accent-bg);color:var(--ml-accent-text)}
.ml-item[aria-checked="true"] .ml-ok{display:block}
.ml-item[aria-checked="true"] .ml-badge{background:var(--ml-accent);color:#111}
.ml-empty{padding:28px 10px;text-align:center;color:var(--ml-muted)}
.ml-foot{margin:10px 16px 0;padding:16px 10px 18px;border-top:1px solid var(--ml-line);font-size:15px;color:var(--ml-muted);display:flex;align-items:center;gap:8px}
.ml-foot a{color:var(--ml-accent-text);text-decoration:none;font-weight:600}
.ml-foot a:hover{text-decoration:underline}
.ml-foot svg{width:18px;height:18px;opacity:.8;flex:none}
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
  const ICON_INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  const ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };
  function injectCSS() {
    if (document.getElementById("ml-css")) return;
    const st = document.createElement("style"); st.id = "ml-css"; st.textContent = CSS; document.head.prepend(st);
  }

  /* ---------- generic picker (shared by language and currency) ---------- */
  function Picker(cfg) {
    // cfg: attr, items, keyOf, icon(item), label(item) -> {name, code}, row(item) -> {title, sub}, suggestedOf(current), texts, onPick(item)
    const P = { cfg, current: null, root: null, lastTrigger: null, prevOverflow: "" };
    P.paint = () => {
      document.querySelectorAll(`[${cfg.attr}]`).forEach(t => {
        const compact = t.getAttribute(cfg.attr) === "compact";
        t.classList.add("ml-trigger"); t.classList.toggle("ml-trigger--compact", compact); if (cfg.triggerClass) t.classList.add(cfg.triggerClass);
        if (t.tagName === "BUTTON") t.type = "button";
        t.setAttribute("aria-haspopup", "dialog"); t.setAttribute("aria-expanded", P.root ? "true" : "false");
        const lb = cfg.label(P.current);
        t.setAttribute("aria-label", `${cfg.texts.title}: ${lb.name}`);
        t.innerHTML = `${cfg.icon(P.current)}<span class="ml-name">${esc(lb.name)}</span><span class="ml-code">${esc(lb.code)}</span>${ICON_CHEV}`;
      });
    };
    const item = it => {
      const r = cfg.row(it);
      return `<button class="ml-item" role="menuitemradio" aria-checked="${it === P.current}" data-key="${esc(cfg.keyOf(it))}"${r.lang ? ` lang="${r.lang}"` : ""}>${cfg.icon(it)}<span class="ml-n">${esc(r.title)}${r.sub ? `<small>${esc(r.sub)}</small>` : ""}</span>${ICON_OK}</button>`;
    };
    function lists(q) {
      const sug = cfg.suggestedOf(P.current);
      const match = it => !q || cfg.searchText(it).toLowerCase().includes(q);
      const s = sug.filter(match), a = cfg.items.filter(x => !sug.includes(x)).filter(match);
      if (!s.length && !a.length) return `<p class="ml-empty">${esc(cfg.texts.empty || "No results")}</p>`;
      return (s.length ? `<p class="ml-label">${esc(cfg.texts.suggested)}</p><div class="ml-grid" role="menu">${s.map(item).join("")}</div>` : "") +
        (a.length ? `<p class="ml-label">${esc(cfg.texts.all)}</p><div class="ml-grid" role="menu">${a.map(item).join("")}</div>` : "");
    }
    P.build = () => {
      const t = cfg.texts, root = document.createElement("div");
      const search = cfg.items.length > 12;
      root.className = "ml-root";
      root.innerHTML = `<div class="ml-backdrop" data-ml-close></div>
<div class="ml-sheet" role="dialog" aria-modal="true" aria-labelledby="ml-title">
  <div class="ml-grab"><span></span></div>
  <div class="ml-head"><h2 id="ml-title">${esc(t.title)}</h2><button class="ml-x" type="button" aria-label="Close" data-ml-close>${ICON_X}</button></div>
  ${search ? `<label class="ml-search">${ICON_SEARCH}<input type="search" placeholder="${esc(t.search || "Search")}" aria-label="${esc(t.search || "Search")}" autocomplete="off"></label>` : ""}
  <div class="ml-body">${lists("")}</div>
  ${t.foot ? `<div class="ml-foot">${t.footIcon || ICON_INFO}<span>${t.foot}</span></div>` : ""}
</div>`;
      root.addEventListener("click", e => {
        if (e.target.closest("[data-ml-close]")) return P.close();
        const it = e.target.closest(".ml-item"); if (it) P.select(it.dataset.key);
      });
      const inp = root.querySelector(".ml-search input");
      if (inp) inp.addEventListener("input", () => { root.querySelector(".ml-body").innerHTML = lists(inp.value.trim().toLowerCase()); });
      root.addEventListener("keydown", e => {
        if (e.key === "Escape") P.close();
        if (e.key === "Tab") {
          const f = [...root.querySelectorAll("button,a,input")], i = f.indexOf(document.activeElement);
          if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        }
      });
      // swipe down to close (mobile)
      const sheet = root.querySelector(".ml-sheet");
      let y0 = null, dy = 0;
      const start = e => { if (matchMedia("(min-width:720px)").matches || e.target.closest("button")) return; y0 = e.clientY; dy = 0; sheet.classList.add("ml-dragging"); e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); };
      const move = e => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; };
      const end = () => { if (y0 === null) return; sheet.classList.remove("ml-dragging"); sheet.style.transform = ""; y0 = null; if (dy > 90) P.close(); };
      root.querySelectorAll(".ml-grab,.ml-head").forEach(h => { h.addEventListener("pointerdown", start); h.addEventListener("pointermove", move); h.addEventListener("pointerup", end); h.addEventListener("pointercancel", end); });
      document.body.appendChild(root);
      return root;
    };
    P.open = trigger => {
      if (P.root) P.root.remove();
      P.root = P.build(); P.lastTrigger = trigger || null;
      P.prevOverflow = document.documentElement.style.overflow; document.documentElement.style.overflow = "hidden";
      document.querySelectorAll(`[${cfg.attr}]`).forEach(t => t.setAttribute("aria-expanded", "true"));
      P.root.classList.add("ml-open");
      requestAnimationFrame(() => requestAnimationFrame(() => P.root && P.root.classList.add("ml-in")));
      setTimeout(() => { if (!P.root) return; const sel = P.root.querySelector('.ml-item[aria-checked="true"]'); (sel || P.root.querySelector(".ml-x")).focus({ preventScroll: true }); }, 60);
    };
    P.close = () => {
      if (!P.root) return;
      const r = P.root; P.root = null;
      r.classList.remove("ml-in");
      document.documentElement.style.overflow = P.prevOverflow || "";
      document.querySelectorAll(`[${cfg.attr}]`).forEach(t => t.setAttribute("aria-expanded", "false"));
      setTimeout(() => r.remove(), 320);
      P.lastTrigger && P.lastTrigger.focus({ preventScroll: true });
    };
    P.select = key => {
      const it = cfg.items.find(x => cfg.keyOf(x) === key); if (!it) return;
      const changed = it !== P.current; P.current = it;
      P.paint();
      P.root && P.root.querySelectorAll(".ml-item").forEach(b => b.setAttribute("aria-checked", String(b.dataset.key === key)));
      setTimeout(P.close, 160);
      if (changed) cfg.onPick(it);
    };
    document.addEventListener("click", e => { const t = e.target.closest(`[${cfg.attr}]`); if (t) { e.preventDefault(); P.open(t); } });
    return P;
  }

  /* ---------- language ---------- */
  const MedalLang = {
    init(o = {}) {
      const opts = Object.assign({
        languages: DEFAULT_LANGS, current: null, baseUrl: "",
        title: "Language", suggested: "Suggested", all: "All languages",
        missing: "Missing yours?", helpText: "Help translate", helpHref: "#", onSelect: null,
      }, o);
      opts.languages.forEach(l => { l.url = l.url || (opts.baseUrl + l.path); });
      injectCSS();
      const P = Picker({
        attr: "data-medal-lang", items: opts.languages, keyOf: l => l.code,
        icon: l => flag(l.flag), label: l => ({ name: l.name, code: l.code }), row: l => ({ title: l.name, lang: l.code }),
        searchText: l => l.name + " " + l.code,
        suggestedOf: cur => {
          const out = [cur], nav = (navigator.languages || [navigator.language || ""]).map(x => x.slice(0, 2).toLowerCase());
          nav.forEach(c => { const l = opts.languages.find(x => x.code === c); if (l && !out.includes(l)) out.push(l); });
          return out.slice(0, 2);
        },
        texts: { title: opts.title, suggested: opts.suggested, all: opts.all, footIcon: ICON_TR, foot: `${esc(opts.missing)} <a href="${esc(opts.helpHref)}">${esc(opts.helpText)}</a>` },
        onPick: l => {
          document.documentElement.lang = l.code;
          document.dispatchEvent(new CustomEvent("medal:lang", { detail: l }));
          if (typeof opts.onSelect === "function") opts.onSelect(l);
        },
      });
      // Start in English. A multilingual site passes the language of the current page as `current`.
      P.current = opts.languages.find(l => l.code === (opts.current || "en")) || opts.languages[0];
      P.paint();
      Object.assign(this, { picker: P, open: t => P.open(t), close: () => P.close(), get current() { return P.current; } });
      return this;
    },
    flag,
  };

  /* ---------- currency ---------- */
  const MedalCurrency = {
    init(o = {}) {
      const opts = Object.assign({
        currencies: DEFAULT_CURRENCIES, current: null, storageKey: "medal-currency", remember: true,
        title: "Currency", suggested: "Suggested", all: "All currencies", search: "Search currency",
        note: "Prices update instantly to the currency you pick.",
        onSelect: null,
      }, o);
      injectCSS();
      const list = opts.currencies.map(c => typeof c === "string" ? DEFAULT_CURRENCIES.find(d => d.code === c.toUpperCase()) : c).filter(Boolean);
      const P = Picker({
        attr: "data-medal-currency", triggerClass: "ml-trigger--cur", items: list, keyOf: c => c.code,
        icon: c => badge(c.symbol), label: c => ({ name: c.name, code: c.code }), row: c => ({ title: c.code, sub: c.name }),
        searchText: c => c.code + " " + c.name + " " + c.symbol,
        suggestedOf: cur => {
          const out = [cur];
          const region = ((navigator.language || "").split("-")[1] || "").toUpperCase();
          [REGION_CURRENCY[region], "USD", "EUR"].forEach(code => { const c = list.find(x => x.code === code); if (c && !out.includes(c)) out.push(c); });
          return out.slice(0, 4);
        },
        texts: { title: opts.title, suggested: opts.suggested, all: opts.all, search: opts.search, empty: "No currency found", foot: esc(opts.note) },
        onPick: c => {
          if (opts.remember) store.set(opts.storageKey, c.code);
          document.dispatchEvent(new CustomEvent("medal:currency", { detail: c }));
          if (typeof opts.onSelect === "function") opts.onSelect(c);
        },
      });
      const start = (opts.current || (opts.remember && store.get(opts.storageKey)) || "USD").toUpperCase();
      P.current = list.find(c => c.code === start) || list[0];
      P.paint();
      Object.assign(this, { picker: P, open: t => P.open(t), close: () => P.close(), get current() { return P.current; } });
      return this;
    },
    currencies: DEFAULT_CURRENCIES,
  };

  window.MedalLang = MedalLang;
  window.MedalCurrency = MedalCurrency;
})();
