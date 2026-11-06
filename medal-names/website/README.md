# MedalNames.com: website-demo

Statische demo van MedalNames.com, in hetzelfde thema als [MedalCapes.com](https://medalcapes.com): het donkere grid, Press Start 2P-koppen, Inter als tekstfont, de Minecraft-knoppen en de badges. De inhoud is ingericht op Minecraft-namen en -accounts.

Open `index.html` in de browser. Er is geen build-stap nodig.

## Wat zit erin
- **Aankondigingsbalk** en **navigatie** zoals bij MedalCapes, met "NAMES" in sky-blauw.
- **Hero** met de slime-mascotte: het naamplaatje erboven typt telkens een andere naam.
- **Naamcheck**: zoekt in de voorraad en geeft bij een niet-bestaande naam een knop "Request it".
- **Weekly drop**: een veiling van een 3-letter OG-naam met afteltimer (tot zondag 20:00).
- **Vertrouwensbalk**: directe levering, full access, veilige checkout, 14 dagen garantie.
- **Catalogus** met filters (3 chars, 4 chars, Words, + Cape), werkende winkelwagen en USD/EUR-keuze.
- **Hoe het werkt** in drie stappen, een **aanvraagformulier**, **FAQ**, **Discord-CTA** en een **footer** met links naar MedalCapes en MedalMC.

## Demo-beperkingen
- De voorraad en prijzen staan in de `NAMES`-array in het script. Het zijn voorbeelden.
- Checkout, inloggen, bieden en het formulier tonen alleen een melding. Er is nog geen backend.
- Voor productie is nodig: een database voor de voorraad, Mollie- en Stripe-checkout, een orderpagina die na betaling de inloggegevens toont (versleuteld opgeslagen, net als de codes bij MedalCapes) en een admin om namen toe te voegen.
