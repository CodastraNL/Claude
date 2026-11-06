/* MedalNames demo: shared header/footer, catalogue, cart and page logic */
(function () {
  "use strict";

  /* ---------- storage (safe) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };

  /* ---------- pixel slime (identical to the MedalCapes mascot) ---------- */
  const SLIME = [
    "..........YY...YY...OO..........", "..........YY...YY...OO..........", "..........YY..YYYY..OO..........",
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
  const PAL = { Y: "#ffc21a", O: "#f5981f", D: "#1f7a3e", M: "#5cb43a", L: "#a8d15c", H: "#fff59d", S: "#d3ea55" };
  const SLIME_RECTS = (() => {
    let r = "";
    SLIME.forEach((row, y) => {
      let x = 0;
      while (x < 32) {
        const c = row[x];
        if (c === ".") { x++; continue; }
        let e = x; while (e + 1 < 32 && row[e + 1] === c) e++;
        r += `<rect x="${x}" y="${y}" width="${e - x + 1}" height="1" fill="${PAL[c]}"/>`;
        x = e + 1;
      }
    });
    return r;
  })();
  const slime = (cls = "") => `<svg class="${cls}" viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">${SLIME_RECTS}</svg>`;
  function paintSlimes(root = document) {
    root.querySelectorAll(".js-slime").forEach(el => {
      el.setAttribute("viewBox", "0 0 32 32");
      el.setAttribute("shape-rendering", "crispEdges");
      el.innerHTML = SLIME_RECTS;
    });
  }

  const DISCORD = '<path d="M20.3 1.5A19.7 19.7 0 0 0 15.4 0l-.6 1.3a18.3 18.3 0 0 0-5.6 0L8.6 0a19.7 19.7 0 0 0-4.9 1.5C.6 6.1-.3 10.6.1 15a19.9 19.9 0 0 0 6 3l1.3-2.1a12.8 12.8 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1L17.9 18a19.8 19.8 0 0 0 6-3c.5-5.1-.8-9.6-3.6-13.5ZM8 12.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 7.5 8 7.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"/>';
  const discordIcon = (w = 20, h = 16, fill = "currentColor") => `<svg width="${w}" height="${h}" viewBox="0 0 24 18" fill="${fill}" aria-hidden="true">${DISCORD}</svg>`;
  const CART_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 4h2l2.4 11h11l2-8H6.3"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>';

  /* ---------- demo catalogue ---------- */
  const NAMES = [
    { id: "n-ace", n: "Ace", cat: "og", price: 890, views: 2100, desc: "Three-letter OG name. Short, clean and instantly recognisable in chat.", tags: ["og"] },
    { id: "n-kai", n: "Kai", cat: "og", price: 640, old: 780, views: 1600, desc: "Three-letter name that reads well on every scoreboard.", tags: ["og"] },
    { id: "n-q7x", n: "Q7x", cat: "og", price: 220, views: 640, desc: "Three-character name with a digit. Rare and affordable.", tags: ["og"] },
    { id: "n-lynx", n: "Lynx", cat: "4c", price: 310, views: 1100, desc: "Four-letter animal name. Sharp and easy to remember.", tags: ["4c"] },
    { id: "n-byte", n: "Byte", cat: "4c", price: 260, views: 980, desc: "Four-letter tech word. Perfect for a PvP or tech main.", tags: ["4c"] },
    { id: "n-nova", n: "Nova", cat: "4c", price: 340, views: 1400, desc: "Four-letter name, comes with the Migrator cape on the account.", tags: ["4c", "cape"] },
    { id: "n-frost", n: "Frost", cat: "word", price: 180, views: 870, desc: "Dictionary word. Fits any PvP, BedWars or HCF player.", tags: ["word"] },
    { id: "n-orbit", n: "Orbit", cat: "word", price: 95, old: 120, views: 410, desc: "Dictionary word, clean history, never used on public servers.", tags: ["word"] },
    { id: "n-pixel", n: "Pixel", cat: "word", price: 420, views: 1900, desc: "Popular word name, comes with the Migrator cape on the account.", tags: ["word", "cape"] },
    { id: "n-vex", n: "Vex", cat: "og", price: 760, views: 1800, desc: "Three-letter OG name with an edge. A true PvP main.", tags: ["og"] },
    { id: "n-echo", n: "Echo", cat: "4c", price: 290, views: 1000, desc: "Four-letter word that everyone can spell.", tags: ["4c"] },
    { id: "n-ember", n: "Ember", cat: "word", price: 150, views: 690, desc: "Warm, short dictionary word. Great for streamers.", tags: ["word"] },
  ];
  const RAR = {
    og: { label: "3 CHARS", cls: "badge-gold", glow: "rgba(255,194,26,.22)" },
    "4c": { label: "4 CHARS", cls: "badge-purple", glow: "rgba(180,140,255,.22)" },
    word: { label: "WORD", cls: "badge-sky", glow: "rgba(94,197,232,.20)" },
  };

  /* Account pricing (EUR): base account + extras, minus 10% when combined */
  const ACCOUNT_EUR = 12;           // one fresh full access account
  const COMBO_DISCOUNT = 0.10;      // 10% off any combination
  const EXTRA_EUR = {               // cape prices as on medalcapes.com (USD / 1.10)
    builder: 1.50, aurora: 0.75, hero: 35.00, moonlight: 86.36, tiktok: 272.73,
    vip: 5.00,                      // MedalMC lifetime VIP rank (placeholder price)
  };
  const r2 = v => Math.round(v * 100) / 100;
  function priced(a) {
    const list = r2(ACCOUNT_EUR * (a.qty || 1) + (a.extras || []).reduce((t, k) => t + EXTRA_EUR[k], 0));
    const combo = (a.qty || 1) > 1 || (a.extras || []).length > 0;
    return Object.assign(a, combo ? { price: r2(list * (1 - COMBO_DISCOUNT)), old: list } : { price: list });
  }

  const ACCOUNTS = [
    { id: "a-fresh", title: "Fresh account", cat: "fresh", stock: 38, art: "slime", tag: "Player123",
      desc: "Brand-new full access account with a random name.",
      feats: ["Java & Bedrock", "Name change available right away", "Email and password changeable"] },
    { id: "a-fresh5", title: "Fresh account × 5", cat: "fresh", qty: 5, stock: 12, art: "multi",
      desc: "Five fresh accounts for alts, events or your team. 10% off.",
      feats: ["5 × Java & Bedrock", "Name change available on each", "Delivered in one order"] },
    { id: "a-builder", title: "Account + Builder Cape", cat: "cape", extras: ["builder"], stock: 21, art: "capes/builder-cape.png",
      desc: "Fresh account with the Builder Cape already redeemed.",
      feats: ["Builder Cape active", "Name change available", "Java & Bedrock"] },
    { id: "a-aurora", title: "Account + Aurora Cape", cat: "cape", extras: ["aurora"], stock: 9, art: "capes/aurora-cape.png",
      desc: "Fresh account with the shimmering Aurora Cape.",
      feats: ["Aurora Cape active", "Name change available", "Java & Bedrock"] },
    { id: "a-moon", title: "Account + Moonlight Trail Cape", cat: "cape", extras: ["moonlight"], stock: 4, art: "capes/moonlight-trail-cape.png",
      desc: "Fresh account with the deep blue Moonlight Trail Cape.",
      feats: ["Moonlight Trail Cape active", "Name change available", "Java & Bedrock"] },
    { id: "a-tiktok", title: "Account + TikTok Cape", cat: "cape", extras: ["tiktok"], stock: 2, art: "capes/tiktok-cape.png",
      desc: "Fresh account with the rare black TikTok Cape.",
      feats: ["TikTok Cape active", "Name change available", "Java & Bedrock"] },
    { id: "a-vip", title: "MedalMC VIP account", cat: "bundle", extras: ["vip"], stock: 25, art: "slime", tag: "VIP",
      desc: "Fresh account with a lifetime VIP rank on MedalMC.",
      feats: ["Lifetime VIP on play.medalmc.com", "Name change available", "Java & Bedrock"] },
    { id: "a-starter", title: "Starter bundle", cat: "bundle", extras: ["hero", "vip"], stock: 15, art: "capes/hero-cape.png",
      desc: "Account with Hero Cape plus lifetime MedalMC VIP. The full Medal package.",
      feats: ["Hero Cape active", "Lifetime MedalMC VIP", "Name change available"] },
  ].map(priced);
  const ACAT = { fresh: { label: "FRESH", cls: "badge-green" }, cape: { label: "CAPE", cls: "badge-gold" }, bundle: { label: "BUNDLE", cls: "badge-purple" } };

  const byId = id => NAMES.find(x => x.id === id) || ACCOUNTS.find(x => x.id === id);
  const itemTitle = x => x.n || x.title;

  /* ---------- currency ---------- */
  // prices are stored in EUR; USD uses the same rate as MedalCapes
  let currency = store.get("mn-currency2", "EUR");
  const RATE = { EUR: 1, USD: 1.10 }, SYM = { USD: "US$", EUR: "€" };
  const fmt = v => SYM[currency] + (v * RATE[currency]).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const kfmt = v => v >= 1000 ? (v / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(v);

  /* ---------- header / footer ---------- */
  const PAGES = [["index.html", "Home", "home"], ["names.html", "Names", "names"], ["accounts.html", "Accounts", "accounts"], ["contact.html", "Contact", "contact"]];
  const page = document.body.dataset.page || "home";

  function header() {
    return `
<div class="announce">🎉 Launch week: 10% off every name and account with code <code>MEDAL10</code></div>
<header class="nav" id="nav">
  <div class="wrap nav__inner">
    <a class="nav__brand" href="index.html" aria-label="Medal Names home">${slime()}<span class="nav__brand-text">MEDAL <b>NAMES</b></span></a>
    <ul class="nav__links" id="navLinks">
      ${PAGES.map(([href, label, key]) => `<li><a class="nav__link${key === page ? " nav__link--active" : ""}" href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}
    </ul>
    <div class="nav__actions">
      <select class="select" id="currency" aria-label="Currency">
        <option value="EUR"${currency === "EUR" ? " selected" : ""}>€ EUR</option>
        <option value="USD"${currency === "USD" ? " selected" : ""}>$ USD</option>
      </select>
      <a class="nav__icon nav__discord" href="#" aria-label="Discord">${discordIcon()}</a>
      <a class="nav__icon" href="#" data-toast="Sign in is coming soon (demo)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg><span class="nav__label">Sign in</span></a>
      <button class="nav__icon" id="cartBtn" type="button">${CART_ICON.replace('width="18" height="18"', 'width="20" height="20"')}<span class="nav__label">Cart</span><span class="cart-count" id="cartCount">0</span></button>
      <button class="nav__burger" id="burger" type="button" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
  }

  function footer() {
    return `
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <a class="nav__brand" href="index.html">${slime()}<span class="nav__brand-text" style="display:inline;font-size:10px">MEDAL <b>NAMES</b></span></a>
        <p class="muted" style="font-size:14px;margin:12px 0 0">Rare Minecraft names and accounts, delivered instantly</p>
        <div class="pay" style="margin-top:14px">
          <span><i style="background:#cc0066"></i>iDEAL</span><span><i style="background:#169bd7"></i>PayPal</span>
          <span><i style="background:#1a1f71"></i>VISA</span><span><i style="background:#eb001b"></i>Mastercard</span>
        </div>
        <div class="footer__family">
          <a class="badge badge-gold" href="https://medalcapes.com">MedalCapes</a>
          <a class="badge badge-green" href="https://medalmc.com">MedalMC</a>
        </div>
      </div>
      <div><h4>Shop</h4><ul><li><a href="names.html">All names</a></li><li><a href="accounts.html">All accounts</a></li><li><a href="names.html#request">Request a name</a></li><li><a href="index.html#drop">Weekly drop</a></li></ul></div>
      <div><h4>Support</h4><ul><li><a href="contact.html">Contact support</a></li><li><a href="mailto:info@medalnames.com">info@medalnames.com</a></li><li><a href="contact.html#faq">FAQ</a></li><li><a href="contact.html?subject=warranty">Warranty &amp; refunds</a></li></ul></div>
      <div><h4>Legal</h4><ul><li><a href="#">Terms &amp; conditions</a></li><li><a href="#">Privacy policy</a></li></ul></div>
    </div>
    <div class="footer__legal">
      <div>
        <b>NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.</b>
        Minecraft is a trademark of Mojang AB. Demo site: prices and stock are examples.<br>
        © 2026 Medal Names. Payments secured by Mollie and Stripe.
      </div>
      <div style="display:inline-flex;align-items:center;gap:8px"><img src="assets/network-icon.svg" alt="" width="22" height="22">A Medal Network brand · Made by <a href="https://codastra.nl">Codastra</a></div>
    </div>
  </div>
</footer>
<div class="drawer-bg" id="drawerBg"></div>
<aside class="drawer" aria-label="Cart">
  <div class="drawer__head"><h3>YOUR CART</h3><button class="line__x" id="closeCart" type="button" aria-label="Close">✕</button></div>
  <div class="drawer__body" id="cartLines"></div>
  <div class="drawer__foot">
    <div class="drawer__total"><span>Total</span><span class="price" id="cartTotal">US$0.00</span></div>
    <button class="btn btn-primary btn-block btn-lg" type="button" data-toast="Checkout via Mollie or Stripe (demo)">Checkout</button>
  </div>
</aside>
<div class="toast" id="toast" role="status"></div>`;
  }

  const mountH = document.getElementById("site-header"), mountF = document.getElementById("site-footer");
  if (mountH) mountH.outerHTML = header();
  if (mountF) mountF.outerHTML = footer();
  paintSlimes();

  /* ---------- cards ---------- */
  function nameCard(x) {
    const r = RAR[x.cat];
    return `
  <article class="card pcard" id="${x.id}">
    <div class="pcard__media" style="--glow:${r.glow}">
      <div class="pcard__badges"><span class="badge badge-sky">Java &amp; Bedrock</span><span class="badge badge-pixel ${r.cls}">${r.label}</span></div>
      <div class="pcard__tag">${x.n}</div>
      <span class="pcard__views">⌕ ${kfmt(x.views)} searches</span>
    </div>
    <div class="pcard__body">
      <h3>${x.n}</h3><p>${x.desc}</p>
      <div class="pcard__row"><span class="price">${x.old ? `<s>${fmt(x.old)}</s>` : ""}${fmt(x.price)}</span>${x.tags.includes("cape") ? '<span class="badge badge-gold">+ Cape</span>' : '<span class="badge badge-green">Full access</span>'}</div>
      <button class="btn btn-primary btn-block" type="button" data-add="${x.id}">${CART_ICON}Add to cart</button>
    </div>
  </article>`;
  }

  function accountArt(x) {
    if (x.art === "slime") return `<div class="slime-art"><span class="mini-tag">${x.tag}</span>${slime()}</div>`;
    if (x.art === "multi") return `<div class="slime-art multi">${slime().repeat(x.qty || 5)}</div>`;
    return `<img src="assets/${x.art}" alt="" loading="lazy">`;
  }
  function accountCard(x) {
    const c = ACAT[x.cat];
    const glow = x.cat === "cape" ? "rgba(255,194,26,.16)" : x.cat === "bundle" ? "rgba(180,140,255,.18)" : "rgba(var(--green-rgb),.20)";
    return `
  <article class="card pcard" id="${x.id}">
    <div class="pcard__media" style="--glow:${glow}">
      <div class="pcard__badges"><span class="badge badge-sky">Java &amp; Bedrock</span><span class="badge badge-pixel ${c.cls}">${c.label}</span></div>
      ${accountArt(x)}
    </div>
    <div class="pcard__body">
      <h3>${x.title}</h3><p>${x.desc}</p>
      <ul class="feats">${x.feats.map(f => `<li>${f}</li>`).join("")}</ul>
      <div class="pcard__row"><span class="price">${x.old ? `<s>${fmt(x.old)}</s>` : ""}${fmt(x.price)}</span>${x.stock <= 5 ? `<span class="badge badge-alert">Only ${x.stock} left</span>` : '<span class="badge badge-green">In stock</span>'}</div>
      <button class="btn btn-primary btn-block" type="button" data-add="${x.id}">${CART_ICON}Add to cart</button>
    </div>
  </article>`;
  }

  /* ---------- cart ---------- */
  let cart = store.get("mn-cart", []).filter(byId);
  function renderCart() {
    const items = cart.map(byId);
    const c = document.getElementById("cartCount");
    c.textContent = items.length; c.classList.toggle("on", items.length > 0);
    document.getElementById("cartLines").innerHTML = items.length ? items.map(x => `
      <div class="line"><span class="line__tag">${x.n || x.tag || "MC"}</span>
        <div class="line__info"><b>${itemTitle(x)}</b><span>${x.n ? RAR[x.cat].label.toLowerCase() + " name" : ACAT[x.cat].label.toLowerCase() + " account"} · full access</span></div>
        <span class="price" style="font-size:12px">${fmt(x.price)}</span>
        <button class="line__x" data-del="${x.id}" aria-label="Remove">✕</button></div>`).join("")
      : '<p class="muted">Your cart is empty.</p>';
    document.getElementById("cartTotal").textContent = fmt(items.reduce((a, x) => a + x.price, 0));
    store.set("mn-cart", cart);
  }
  const openCart = o => document.body.classList.toggle("cart-open", o);

  let tt;
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("on");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2200);
  }

  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) {
      const x = byId(add.dataset.add);
      if (cart.includes(x.id)) toast(`${itemTitle(x)} is already in your cart`);
      else { cart.push(x.id); renderCart(); toast(`${itemTitle(x)} added to cart`); }
    }
    const del = e.target.closest("[data-del]");
    if (del) { cart = cart.filter(id => id !== del.dataset.del); renderCart(); }
    const t = e.target.closest("[data-toast]");
    if (t) { e.preventDefault(); toast(t.dataset.toast); }
  });
  document.getElementById("cartBtn").onclick = () => openCart(true);
  document.getElementById("closeCart").onclick = () => openCart(false);
  document.getElementById("drawerBg").onclick = () => openCart(false);
  document.addEventListener("keydown", e => { if (e.key === "Escape") openCart(false); });
  document.getElementById("burger").onclick = () => document.getElementById("nav").classList.toggle("nav-open");

  const rerender = [];
  document.getElementById("currency").addEventListener("change", e => {
    currency = e.target.value; store.set("mn-currency2", currency);
    renderCart(); rerender.forEach(f => f());
    document.querySelectorAll("[data-price]").forEach(el => el.textContent = fmt(+el.dataset.price));
  });
  document.querySelectorAll("[data-price]").forEach(el => el.textContent = fmt(+el.dataset.price));

  /* ---------- reusable widgets ---------- */
  function catalogue({ grid, filters, sort, count, list, card, match }) {
    const g = document.getElementById(grid);
    if (!g) return;
    let f = "all", s = "featured";
    const draw = () => {
      let items = list.filter(x => f === "all" || match(x, f));
      if (s === "low") items = [...items].sort((a, b) => a.price - b.price);
      if (s === "high") items = [...items].sort((a, b) => b.price - a.price);
      if (s === "short") items = [...items].sort((a, b) => a.n.length - b.n.length || b.price - a.price);
      g.innerHTML = items.length ? items.map(card).join("") : '<div class="empty">Nothing in this category right now.</div>';
      paintSlimes(g);
      if (count) document.getElementById(count).textContent = `${items.length} ${items.length === 1 ? "item" : "items"}`;
    };
    const fe = document.getElementById(filters);
    if (fe) fe.addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      f = b.dataset.f; fe.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === b)); draw();
    });
    const se = sort && document.getElementById(sort);
    if (se) se.addEventListener("change", e => { s = e.target.value; draw(); });
    rerender.push(draw);
    draw();
  }

  function checker() {
    const form = document.getElementById("checkForm");
    if (!form) return;
    const onNames = page === "names";
    form.addEventListener("submit", e => {
      e.preventDefault();
      const v = document.getElementById("checkInput").value.trim(), out = document.getElementById("checkResult");
      out.className = "checker__result on";
      if (!/^[A-Za-z0-9_]{3,16}$/.test(v)) { out.classList.add("err"); out.textContent = "Minecraft names are 3 to 16 characters: letters, numbers and _ only."; return; }
      const hit = NAMES.find(x => x.n.toLowerCase() === v.toLowerCase());
      if (hit) {
        out.classList.add("ok");
        out.innerHTML = `<span><b class="pixel" style="font-size:12px">${hit.n}</b> is in stock for ${fmt(hit.price)}</span><a class="btn btn-primary btn-sm" href="${onNames ? "" : "names.html"}#${hit.id}">View name</a>`;
      } else {
        out.classList.add("no");
        const safe = v.replace(/[^A-Za-z0-9_]/g, "");
        out.innerHTML = `<span><b class="pixel" style="font-size:12px">${safe}</b> is not in stock right now. We can try to get it for you.</span><a class="btn btn-sky btn-sm" href="names.html?name=${encodeURIComponent(safe)}#request" id="reqLink">Request it</a>`;
        if (onNames) document.getElementById("reqLink").addEventListener("click", () => { document.getElementById("reqName").value = safe; });
      }
    });
  }

  function forms() {
    document.querySelectorAll("form[data-demo]").forEach(f => f.addEventListener("submit", e => {
      e.preventDefault(); toast(f.dataset.demo); f.reset();
    }));
  }

  /* ---------- page specific ---------- */
  function home() {
    const feat = document.getElementById("featNames");
    if (feat) feat.innerHTML = NAMES.filter(x => ["n-ace", "n-nova", "n-frost"].includes(x.id)).map(nameCard).join("");
    const fa = document.getElementById("featAccounts");
    if (fa) { fa.innerHTML = ACCOUNTS.filter(x => ["a-fresh", "a-aurora", "a-starter"].includes(x.id)).map(accountCard).join(""); paintSlimes(fa); }
    rerender.push(home);
  }

  function typing() {
    const el = document.getElementById("typeName");
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = ["Ace", "Kai", "Lynx", "Frost", "Nova", "Zen", "Pixel"];
    let w = 0, i = 3, dir = -1;
    setTimeout(function tick() {
      i += dir; el.textContent = words[w].slice(0, Math.max(i, 0)) || " ";
      let d = dir < 0 ? 70 : 120;
      if (dir < 0 && i <= 0) { dir = 1; w = (w + 1) % words.length; d = 300; }
      else if (dir > 0 && i >= words[w].length) { dir = -1; d = 1800; }
      setTimeout(tick, d);
    }, 1800);
  }

  function countdown() {
    if (!document.getElementById("cdD")) return;
    const end = new Date(); end.setDate(end.getDate() + ((7 - end.getDay()) % 7 || 7)); end.setHours(20, 0, 0, 0);
    const p = n => String(n).padStart(2, "0");
    const t = () => {
      const s = Math.max(0, (end - new Date()) / 1000 | 0);
      cdD.textContent = p(s / 86400 | 0); cdH.textContent = p(s % 86400 / 3600 | 0); cdM.textContent = p(s % 3600 / 60 | 0); cdS.textContent = p(s % 60);
    };
    t(); setInterval(t, 1000);
  }

  const params = new URLSearchParams(location.search);
  if (page === "home") { home(); typing(); countdown(); }
  if (page === "names") {
    catalogue({ grid: "grid", filters: "filters", sort: "sort", count: "count", list: NAMES, card: nameCard, match: (x, f) => x.tags.includes(f) });
    const q = params.get("name");
    if (q) document.getElementById("reqName").value = q.replace(/[^A-Za-z0-9_]/g, "").slice(0, 16);
  }
  if (page === "accounts") {
    catalogue({ grid: "grid", filters: "filters", sort: "sort", count: "count", list: ACCOUNTS, card: accountCard, match: (x, f) => x.cat === f });
  }
  if (page === "contact") {
    const subj = params.get("subject"), sel = document.getElementById("subject");
    if (subj && sel && [...sel.options].some(o => o.value === subj)) sel.value = subj;
  }
  checker(); forms(); renderCart();
  // honour #hash after dynamic content rendered
  if (location.hash) { const el = document.querySelector(location.hash); if (el) setTimeout(() => el.scrollIntoView(), 50); }
})();
