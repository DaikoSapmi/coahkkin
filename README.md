# 🏛️ Parlamentarisk Møte-Timer & Strømmesystem

Et sanntidsbasert møtestyringssystem for kommunestyrer, fylkesting, landsmøter og organisasjoner. Systemet synkroniserer møtelederens iPad/PC med en passiv skjerm ved talerstolen samt transparente grafikkoverlegg (Lower Third og Saksvisning) for videostrømming i **OBS Studio** eller **vMix**.

## ✨ Nøkkelfunksjoner
- **Møteleder-dashboard (`/dashboard`):** Touch-vennlig grensesnitt for å gi ordet, starte/pause klokken, legge til hovedinnlegg og replikker (med automatisk svarreplikk for hovedtaler).
- **Partikvoter og Individuell taletid:** Støtter både rammestyrte debatter der taletiden trekkes direkte fra partiets tildelte pott i sanntid, og ordinære debatter med fast taletid per innlegg.
- **CSV-import (`/admin`):** Last opp `eksempel-representanter.csv` (eller egne lister) for å opprette representanter og partifarger automatisk.
- **Passiv Talerskjerm (`/display/podium`):** Høykontrasts fullskjermsvisning for talerstol/sal med stor nedtelling, aktiv taler, neste på talelisten og partikvotestatus.
- **Lower Third for strømming (`/overlay/lower-third`):** Transparent 1920x1080 visning med organisasjonslogo, talerens navn, partifarge og nedtelling.
- **Saksvisning i øvre høyre hjørne (`/overlay/agenda`):** Transparent overlegg som viser gjeldende saksnummer og sakstittel.

---

## 🚀 Kom i gang i VS Code

1. **Pakk ut prosjektmappen** og åpne den i **Visual Studio Code**.
2. Åpne terminalen i VS Code (`Ctrl + ø` eller `Cmd + J`) og installer avhengigheter:
   ```bash
   npm install
   ```
3. Start sanntidsserveren og web-applikasjonen:
   ```bash
   npm run dev
   ```
4. Åpne **`http://localhost:3000`** i nettleseren!

*(For å bruke en iPad på samme WiFi-nettverk som møteleder-kontroller: Finn PC-ens lokale IP-adresse, f.eks. `http://192.168.1.50:3000/dashboard`, og åpne den i Safari på iPaden).*

---

## 🎥 Oppsett i OBS Studio / vMix
1. Legg til en ny **Browser Source** i OBS.
2. Sett bredde til `1920` og høyde til `1080`.
3. Bruk følgende URL-er:
   - **Lower Third:** `http://localhost:3000/overlay/lower-third`
   - **Saksvisning (Øvre høyre hjørne):** `http://localhost:3000/overlay/agenda`

---
