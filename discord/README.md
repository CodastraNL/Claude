# Discord: rol "Server Partner"

Een aparte rol voor **eigenaren van partner-servers** (bijv. Lachly, eigenaar van FaithfulMC).
De rol staat **boven "Partner"** en wordt in de ledenlijst als **eigen groep** getoond, dus
Server Partners staan boven de gewone partners.

| Instelling            | Waarde                                                   |
|-----------------------|----------------------------------------------------------|
| Naam                  | `Server Partner`                                         |
| Kleur                 | Oranje `#FF8C00`. Is oranje al bezet, dan een andere vrije oranjetint |
| Apart tonen in lijst  | Aan (hoist)                                              |
| Vermeldbaar           | Aan                                                      |
| Rechten               | Gelijk aan `Partner`                                     |
| Positie               | Direct boven `Partner`                                   |

## Optie A: met het script (aanbevolen)

Vereist Node 18+. Er hoeft niets geïnstalleerd te worden.

```bash
cd discord
# eerst kijken wat er zou gebeuren:
DRY_RUN=1 DISCORD_TOKEN=<bot-token> GUILD_ID=<server-id> node create-server-partner-role.mjs

# echt uitvoeren en meteen aan Lachly geven:
DISCORD_TOKEN=<bot-token> GUILD_ID=<server-id> MEMBER_IDS=<discord-id-van-lachly> \
  node create-server-partner-role.mjs
```

- `MEMBER_IDS` mag meerdere ID's bevatten, gescheiden door komma's.
- Bestaat de rol al, dan werkt het script de rol bij in plaats van een dubbele aan te maken.
- De bot heeft **Rollen beheren** nodig, en de rol van de bot moet **boven "Partner"** staan.

ID's kopiëren: zet *Gebruikersinstellingen → Geavanceerd → Ontwikkelaarsmodus* aan. Klik daarna
met rechts op de server of het lid en kies **ID kopiëren**.

## Optie B: handmatig in Discord (ongeveer 1 minuut)

1. *Serverinstellingen → Rollen → Rol aanmaken*, naam: **Server Partner**.
2. Kleur **#FF8C00**. Kijk eerst of er al een oranje rol is; zo ja, kies dan `#FF6A00` of `#FFA31A`.
3. Zet **"Rolleden apart van online leden weergeven"** aan, en ook **"Iedereen toestaan deze rol te @vermelden"**.
4. Rechten: neem dezelfde rechten over als bij **Partner**.
5. Sleep de rol in de rollenlijst **direct boven Partner**.
6. *Leden*: klik op Lachly → **+** → **Server Partner**.

Extra (bij serverboost niveau 2): geef de rol een **rolicoon**, bijvoorbeeld 🤝 of 🏆.
Daarmee valt de rol naast de naam nog meer op.
