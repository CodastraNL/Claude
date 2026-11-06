# MedalNetwork.com: website-demo

De overkoepelende portal van Medal Network. Live op https://medalnetwork-demo.netlify.app (Netlify-project `medalnetwork-demo`, team Codastra).

Het is een statische site zonder build-stap. Hij gebruikt dezelfde stijl als de MedalMC-site (`assets/styles.css`), aangevuld met eigen secties.

## Secties
- **Statusbalk:** alle merken operationeel en het live aantal spelers op MedalMC.
- **Hero, de Medal-straat:** een pixel-art straat bij nacht (`assets/street.js` en `assets/street.css`):
  - **Tekenen:** de gevel, de boogdeur, de etalages, de lantaarns en de natte kinderkopjes worden in code getekend op een canvas. Het canvas is twee keer zo breed als de scène, zodat de straat op brede schermen doorloopt.
  - **Wind:** een rustige basiswind met willekeurige vlagen. Daarop reageren de hangende vaandels (MedalMC, MedalNames), de medaille boven de deur en het stoepbord.
  - **Personage en straat:** het haar van het personage wisselt tussen 4 frames, afhankelijk van hoe hard het waait. Er waaien blaadjes, stof, windstrepen en papiertjes door de straat, met mist over de grond.
  - **De deur:** klik je erop, dan gaan de deuren open met warm licht, volgt een flits en scrollt de pagina naar de merken.
  - **Neonborden:** MedalCapes, MedalMC, MedalNames, de live serverstatus en het stoepbord "OG NAMES" linken naar de juiste sites.
- **Brands:** MedalMC, MedalCapes en MedalNames, elk met logo, domein, live-status en een link.
- **About:** de drie pijlers Play (MC), Show off (Capes) en Be known (Names).
- **Roadmap:** MedalCapes → MedalMC + MedalNames → Medal Account → Medal Rewards.
- **Partners & creators:** het creator-programma, events en partnerships, met een contactformulier (demo).
- **Discord en footer.**

## Domeinen
| Domein | Site |
|---|---|
| medalnetwork.com | deze site (`medalnetwork-demo`) |
| medalmc.com | `medal-mc/website` (`medalmc-demo`) |
| medalnames.com | `medal-names/website` (`medalnames-demo`) |
| medalcapes.com | de bestaande productiesite (`mc-capes-store`) |

De links tussen de merken wijzen naar de echte domeinen. Zolang een site op `*.netlify.app` draait, zet een klein script onderaan `assets/app.js` die links om naar de demo-adressen. Op de echte domeinen verandert er niets, dus na het koppelen is geen nieuwe deploy nodig.
