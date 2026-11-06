# MedalMC.com: website-demo

Demo van de website van MedalMC, de servers van Medal Network. Live op https://medalmc-demo.netlify.app (Netlify-project `medalmc-demo`, team Codastra).

Het is een statische site zonder build-stap: `index.html`, `assets/styles.css` en `assets/app.js`.

## Secties
- **Statusbalk:** servers online, live spelersaantal en de countdown tot het einde van het seizoen.
- **Hero:** de mascotte met roterende ringen, zwevende kaarten met live spelers per speltype, het server-IP om te kopiëren (`play.medalmc.com`), de Discord-knop en stijgende pixel-deeltjes.
- **Statistieken:** spelers online, unieke spelers, Discord-leden en uptime.
- **Live ticker:** recente gebeurtenissen met procedureel gegenereerde spelerskoppen.
- **Speltypes:** HCF, BedWars en KitPvP, met live aantallen spelers. Daaronder een stemming voor het volgende speltype (SkyWars, Practice, Survival).
- **Seizoen:** de countdown van HCF Map 1 en de beloningen.
- **Leaderboards:** tabs per speltype, plus de netwerkstatus en een grafiek van de spelers in de afgelopen 24 uur.
- **Overige secties:** "Built for competition", nieuws, store-ranks (VIP, Medalist, Legend, alleen cosmetisch), een Discord-banner, de Medal-familie (MedalCapes, MedalNames) en de footer.

## Demo
- De aantallen spelers, statistieken, leaderboards en prijzen zijn voorbeelden. De tellers bewegen willekeurig.
- Later koppelen aan echte data, bijvoorbeeld via een server-status-API (zoals mcsrvstat) en de database van de server voor de leaderboards.
- `netlify.toml` houdt de demo uit zoekmachines (`noindex`) en zorgt met `no-cache` dat elke deploy direct zichtbaar is.
