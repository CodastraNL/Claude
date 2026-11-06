# Medal language picker

Eén taalkiezer voor alle sites van Medal Network (MedalNetwork, MedalMC, MedalNames en MedalCapes). Het ontwerp is geïnspireerd op de taalknop van echo.ac.

- **Mobiel:** een bottom sheet met een greep bovenaan; naar beneden vegen sluit hem. Bovenaan staat "Suggested" met de huidige taal (met vinkje) en de taal van de browser. Daaronder staan alle talen in 2 kolommen met ronde vlaggen, en onderaan "Missing yours? Help translate".
- **Desktop:** dezelfde inhoud in een gecentreerd venster in plaats van een los zwevend dropdownmenu.
- **Toegankelijkheid:** Esc sluit, de focus blijft in het venster, de rollen zijn correct (`dialog`, `menuitemradio`), en `prefers-reduced-motion` wordt gerespecteerd.
- **Geen afhankelijkheden:** één bestand (`medal-lang.js`) zonder externe bestanden. De stijl wordt automatisch ingeladen; vlaggen zijn inline SVG.

## Gebruik
```html
<button data-medal-lang></button>            <!-- vlag + taalnaam -->
<button data-medal-lang="compact"></button>  <!-- vlag + code (EN), voor mobiele navigatie -->

<script src="/medal-lang.js"></script>
<script>
  MedalLang.init({
    current: document.documentElement.lang.slice(0, 2),
    helpHref: "https://discord.gg/...",
    onSelect: lang => { location.href = lang.url; },
  });
</script>
```
Standaard bevat het onderdeel dezelfde 11 talen en paden als medalcapes.com: `/`, `/de`, `/es`, `/fr`, `/it`, `/nl`, `/pl`, `/pt`, `/ru`, `/tr`, `/zh`. Met `languages: [...]` geef je een eigen lijst mee. Zonder `current` start de kiezer altijd op Engels (met de Amerikaanse vlag). Bij een keuze wordt `<html lang>` bijgewerkt en gaat er een event `medal:lang` uit.

## Thema
Stel de kleuren in met CSS-variabelen op `:root`: `--ml-panel`, `--ml-surface`, `--ml-hover`, `--ml-line`, `--ml-text`, `--ml-muted`, `--ml-accent`, `--ml-accent-text`, `--ml-accent-bg`, `--ml-radius`, `--ml-font`. Het onderdeel laadt zijn eigen stijl als eerste in `<head>`, zodat het thema van de site altijd voorgaat.

## MedalCapes (Astro)
1. Zet `medal-lang.js` en `medalcapes-theme.css` in `public/`.
2. Vervang in de navigatie het huidige taal-dropdownmenu (de `<details>` met "English") door:
   ```astro
   <button data-medal-lang></button>
   ```
   Gebruik in het mobiele menu `<button data-medal-lang="compact"></button>`.
3. Voeg in de layout toe:
   ```astro
   <link rel="stylesheet" href="/medalcapes-theme.css" />
   <script is:inline src="/medal-lang.js"></script>
   <script is:inline>
     MedalLang.init({
       current: document.documentElement.lang.slice(0, 2),
       helpHref: "mailto:info@medal-capes.com",
       onSelect: l => { location.href = l.code === "en" ? "/?lang=en" : l.path + location.search; },
     });
   </script>
   ```
   Voor Engels gebruikt MedalCapes `/?lang=en`, zodat de automatische taalkeuze wordt overschreven. Daarom staat die uitzondering in `onSelect`.
