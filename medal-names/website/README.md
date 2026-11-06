# MedalNames.com: website-demo

Statische demo van MedalNames.com, in hetzelfde thema als [MedalCapes.com](https://medalcapes.com): het donkere grid, Press Start 2P-koppen, Inter als tekstfont, de Minecraft-knoppen en de badges. De inhoud is ingericht op Minecraft-namen en -accounts.

Open `index.html` in de browser. Er is geen build-stap nodig.

## Pagina's
| Pagina | Inhoud |
|---|---|
| `index.html` (Home) | Hero met de typende naamplaatje-mascotte, de naamcheck, twee tegels (Names / Accounts), populaire names en accounts, weekly drop-veiling met afteltimer, de vertrouwensbalk, "Hoe het werkt" en een Discord-banner |
| `names.html` (Names) | Alle namen met filters (3 chars, 4 chars, Words, + Cape), sorteren (prijs, kortste eerst), de naamcheck en een aanvraagformulier voor een specifieke naam |
| `accounts.html` (Accounts) | Fresh accounts, accounts met een cape van MedalCapes en MedalMC-bundels, met filters, sorteren, voorraadmeldingen ("Only 2 left") en een blok "Every account" |
| `contact.html` (Contact) | Contactformulier met onderwerp en ordernummer, kaarten voor Discord, e-mail en responstijd, en de FAQ |

## Structuur
- `assets/styles.css`: het gedeelde thema (overgenomen van medalcapes.com)
- `assets/app.js`: header en footer (op elke pagina hetzelfde, met de actieve pagina gemarkeerd), de catalogus (de arrays `NAMES` en `ACCOUNTS`), de winkelwagen (blijft bewaard tussen pagina's), de valutakeuze en de logica per pagina
- `assets/capes/`: cape-afbeeldingen van MedalCapes

Handige links: `names.html?name=Frost#request` vult het aanvraagformulier vooraf in, en `contact.html?subject=warranty` kiest vooraf het onderwerp.

## Demo-beperkingen
- De voorraad en prijzen staan in `NAMES` en `ACCOUNTS` in `assets/app.js`. Het zijn voorbeelden.
- Afrekenen, inloggen, bieden en de formulieren tonen alleen een melding. Er is nog geen backend.
- Voor productie is nodig: een database voor de voorraad, Mollie- en Stripe-checkout, een orderpagina die na betaling de inloggegevens toont (versleuteld opgeslagen, net als de codes bij MedalCapes) en een beheerpagina om namen en accounts toe te voegen.
