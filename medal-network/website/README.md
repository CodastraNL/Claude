# MedalNetwork.com: website-demo

De overkoepelende portal van Medal Network. Live op https://medalnetwork-demo.netlify.app (Netlify-project `medalnetwork-demo`, team Codastra).

Het is een statische site zonder build-stap. Hij gebruikt dezelfde stijl als de MedalMC-site (`assets/styles.css`), aangevuld met eigen secties.

## Secties
- **Statusbalk:** alle merken operationeel en het live aantal spelers op MedalMC.
- **Hero:** de gouden medaille met zwevende kaarten per merk, en de cijfers.
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
