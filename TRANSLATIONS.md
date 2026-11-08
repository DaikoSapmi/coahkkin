# 🌍 Bidra med oversettelser (Internationalization / i18n)

Dette prosjektet bruker åpne standarder for flerspråklighet:
- **IETF BCP 47 / ISO 639** språkkoder
- **i18next JSON v4** nøkkel-verdi-struktur

## Støttede språk per nå
| Språk | Eigennavn | BCP 47 Kode | Filplassering |
| :--- | :--- | :--- | :--- |
| **Norsk (Bokmål)** | Norsk | `nb` | `src/i18n/locales/nb.json` |
| **Nordsamisk** | Davvisámegiella | `se` | `src/i18n/locales/se.json` |
| **Sørsamisk** | Åarjelsaemien | `sma` | `src/i18n/locales/sma.json` |
| **Lulesamisk** | Julevsámegiella | `smj` | `src/i18n/locales/smj.json` |
| **Engelsk** | English | `en` | `src/i18n/locales/en.json` |

---

## Slik forbedrer du en eksisterende oversettelse
1. Åpne språkfilen i `src/i18n/locales/` (f.eks. `se.json`, `sma.json` eller `smj.json`).
2. Endre tekstene på høyre side av kolon (`:`). **Ikke** endre nøklene på venstre side eller variabler i dobbel krøllparentes som `{{repCount}}`.
3. Lagre filen – endringen vises umiddelbart i nettleseren!

## Slik legger du til et helt nytt språk (f.eks. Kvensk `fkv` eller Finsk `fi`)
1. Kopier `src/i18n/locales/nb.json` til en ny fil i samme mappe, f.eks. `src/i18n/locales/fkv.json`.
2. Oversett verdiene i JSON-filen.
3. Registrer språket i `src/i18n/index.ts` under `SUPPORTED_LANGUAGES` og `resources`.

## Samarbeid via GitHub / Weblate / Crowdin
Fordi alle språkfiler er rene JSON-filer i `src/i18n/locales/`, kan GitHub-repoet kobles direkte til gratis verktøy for åpen kildekode som **Weblate** eller **Crowdin** (eller GiellaLT-fellesskapet). Da får oversettere et enkelt nettskjema og endringene sendes automatisk som *Pull Requests* til GitHub.
