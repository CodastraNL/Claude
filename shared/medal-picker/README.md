# Medal pickers: taal en valuta

Eén onderdeel (`medal-picker.js`, zonder afhankelijkheden) met een **taalkiezer** en een **valutakiezer** in dezelfde stijl, voor alle sites van Medal Network (MedalNetwork, MedalMC, MedalNames en MedalCapes). Het ontwerp is geïnspireerd op de taalknop van echo.ac.

- **Mobiel:** een bottom sheet met een greep bovenaan; naar beneden vegen sluit hem.
- **Desktop:** een gecentreerd venster in plaats van een los zwevend dropdownmenu.
- **Indeling:** "Suggested" bovenaan, daaronder alle opties in 2 kolommen. Talen hebben ronde vlaggen, valuta een rond valutateken (€, $, £, R$ …).
- **Zoeken:** bij meer dan 12 opties verschijnt automatisch een zoekveld. Bij de 37 valuta van MedalCapes zoek je op code, naam of teken.
- **Toegankelijkheid:** Esc sluit, de focus blijft in het venster, de rollen zijn correct en `prefers-reduced-motion` wordt gerespecteerd.

## Gebruik
```html
<button data-medal-lang></button>                <!-- vlag + taalnaam -->
<button data-medal-lang="compact"></button>      <!-- vlag + EN -->
<button data-medal-currency></button>            <!-- teken + code -->
<button data-medal-currency="compact"></button>

<script src="/medal-picker.js"></script>
<script>
  MedalLang.init({ current: "en", onSelect: l => location.href = l.url });
  MedalCurrency.init({ current: "USD", onSelect: c => { /* prijzen omrekenen of pagina herladen */ } });
</script>
```

**Taal:**
- Standaard dezelfde 11 talen en paden als medalcapes.com.
- Zonder `current` start de kiezer altijd op **English** met de Amerikaanse vlag.
- Bij een keuze wordt `<html lang>` bijgewerkt en gaat er een event `medal:lang` uit.

**Valuta:**
- Standaard dezelfde 37 valuta als medalcapes.com.
- Met `currencies: ["EUR", "USD", …]` kies je een eigen selectie.
- De keuze wordt onthouden (`localStorage`, sleutel `medal-currency`). Zonder opgeslagen keuze start hij op `current` of USD.
- Bij een keuze gaat er een event `medal:currency` uit.

## Thema
Stel de kleuren in met CSS-variabelen op `:root`: `--ml-panel`, `--ml-surface`, `--ml-hover`, `--ml-line`, `--ml-text`, `--ml-muted`, `--ml-accent`, `--ml-accent-text`, `--ml-accent-bg`, `--ml-radius`, `--ml-font`. Het onderdeel laadt zijn eigen stijl als eerste, zodat het thema van de site voorgaat. `medalcapes-theme.css` is het thema voor MedalCapes: een pixel-titel en groene accenten.

## MedalCapes (Astro)
1. Zet `medal-picker.js` en `medalcapes-theme.css` in `public/`.
2. Vervang in de navigatie de dropdownmenu's "English ⌄" en "$ USD ⌄" door:
   ```astro
   <button data-medal-lang></button>
   <button data-medal-currency></button>
   ```
   Gebruik in het mobiele menu de varianten met `="compact"`.
3. Voeg in de layout toe:
   ```astro
   <link rel="stylesheet" href="/medalcapes-theme.css" />
   <script is:inline src="/medal-picker.js"></script>
   <script is:inline>
     MedalLang.init({
       current: document.documentElement.lang.slice(0, 2),
       helpHref: "mailto:info@medal-capes.com",
       onSelect: l => { location.href = l.code === "en" ? "/?lang=en" : l.path + location.search; },
     });
     MedalCurrency.init({
       current: new URLSearchParams(location.search).get("currency") || undefined,
       onSelect: c => { const u = new URL(location.href); u.searchParams.set("currency", c.code.toLowerCase()); location.href = u; },
     });
   </script>
   ```
   MedalCapes gebruikt nu `?currency=eur` in de links. De `onSelect` hierboven volgt die structuur.
