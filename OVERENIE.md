# Overenie redizajnu

Overené lokálne 29. októbra 2026. Web nebol zverejnený ani odoslaný do GitHubu.

## Automatické meranie

Lighthouse 13.6.0, Chrome, predvolené mobilné emulovanie a simulované spomalenie. Ide o lokálne laboratórne meranie, nie o údaje skutočných návštevníkov.

| Stránka | Výkon | Prístupnosť | Technické postupy | SEO |   LCP | CLS |
| ------- | ----: | ----------: | ----------------: | --: | ----: | --: |
| Hlavná  |    93 |          96 |               100 | 100 | 3,2 s |   0 |
| Galéria |    95 |         100 |               100 | 100 | 2,9 s |   0 |

Galéria bola premeraná po obnove fotografií podľa nezávislých predlôh Figmy. Skóre hlavnej stránky je z predchádzajúceho merania.

Poppins používa lokálne WOFF2 rezy 300, 400, 500, 600 a 700. Webové fotografie majú varianty bez zväčšovania dostupných zdrojov a bez EXIF; obnovená úvodná desktopová kompozícia má približne 70 kB. Presné nastavenie `sizes` zabraňuje sťahovaniu príliš veľkých náhľadov na mobile; prvý obrázok galérie sa načítava prioritne. Prístupnosť hlavnej stránky znižuje kontrast pôvodných ružových farieb; farebnosť je zachovaná podľa Figmy.

Podrobné JSON výstupy merania sú iba v ignorovanom pracovnom priečinku `.qa/`.

## Funkčné a vizuálne kontroly

- Hlavná stránka aj galéria: šírky 360, 390, 768, 1024 a 1440 px bez vodorovného presahu; zodpovedajúce počty stĺpcov.
- Desktop: určujúcou predlohou fotografií je ich skutočný vzhľad vo Figme, vrátane orezu, orientácie a proporcií tvárí a motívov. Všetkých 38 miest bolo porovnaných vedľa nezávislej obrazovej predlohy; porovnania sú v `.qa/figma-visual-review-1.png` až `5.png`. Mobil a tablet používajú odvodené rozloženie.
- Mobilná navigácia: otvorenie, prechod na kontakt a automatické zatvorenie.
- Formulár v prehliadači: prázdne povinné údaje aj neplatný e-mail zastavia odoslanie a presunú fokus na príslušné pole.
- Formulár v automatických testoch: potvrdený úspech, neúspešná HTTP/API odpoveď, neplatné JSON, výpadok siete, pomalá odpoveď, blokovanie opakovaného odoslania, časový limit a honeypot. Všetkých päť skupín testov prešlo, žiadne skúšobné e-maily sa neposielali.
- Oprava fotografií: všetkých 38 miest používa spoločný zdroj a rovnakú orientáciu náhľadu aj zväčšenia. Podľa následnej požiadavky sa po otvorení zobrazuje rovnaký orez ako v kartičke, vo vyššom dostupnom rozlíšení až do šírky 1280 px. Veľká verzia je priamo najväčší variant náhľadu, preto nemení kompozíciu, otočenie ani zrkadlenie. Malé zdroje sa nezväčšujú. Aj úvod zachováva prirodzené proporcie fotografií.
- Automatické testy obrázkov: geometrické operácie, správne pixelové pozície po otočení a zrkadlení, okraje bez čiernych pásov, EXIF a všetkých 38 HTML prepojení. Hotové veľké obrázky sa porovnávajú s nezávislými predlohami Figmy v `tests/fixtures/figma-photos/`; náhľady musia mať rovnaký orez. Samostatný test portrétu s ružovými kvetmi chráni jeho proporcie a záber podľa Figmy. Všetkých šesť skupín obrazových testov prešlo.
- Testy otvárania: rezervované proporcie pred načítaním, zobrazenie až po dekódovaní, nemenné rozmery po načítaní, pomalá a chybná odpoveď, zatvorenie počas načítania a okamžité otvorenie inej fotografie, prispôsobenie rozmerom a zachovanie fokusu. Všetkých šesť skupín testov dialógu prešlo.
- Prehliadač: jednotlivo otvorených všetkých 33 fotografií galérie a všetkých päť hlavnej stránky. Každá sa načítala, mala prirodzený pomer strán a priehľadný dialóg bez rámu navyše. Overené šírky 360, 390, 768, 1024, 1440 px aj otočený displej 844 × 390 px: fotka a zatváracie tlačidlo sa zmestia, bez presahu a deformácie. Tab, Escape, skutočné kliknutie mimo fotky a návrat fokusu prešli. Záznamy sú v `.qa/lightbox-*-check.json`, náhľad v `.qa/oprava-fotografii.png`.
- Kontrola súborov: tri stránky, všetky lokálne odkazy a kotvy, CSS zdroje, varianty obrázkov, päť fotografií na hlavnej stránke a 33 v galérii. Overené aj pôvodné rozmery SVG a neprítomnosť EXIF vo všetkých WebP vrátane náhľadov.
- Výmena podkladov: aktívna sada obsahuje 30 uložených podkladov z kontextu Figmy a štyri overené dodané Figma exporty, ktoré nahradili deformované technické podklady. Geometria všetkých 38 miest bola odmeraná proti skutočnej predlohe, aspoň 50 zhodných obrazových bodov na fotku a medián odchýlky pod 0,5 px pri návrhovej veľkosti. Priehľadná kompozícia úvodu zostáva z dodaných podkladov Figmy.
- Po zmene požiadavky na rovnaký orez: všetkých 38 prepojení a obrazových orezov prešlo aktualizovanými testami. V prehliadači overená zhodná sada obrazových variantov náhľadu a zväčšenia, aj mobilný pomer strán. Náhľad aktuálneho otvorenia je `.qa/zvacsenie-rovnaky-orez.png`. Sto nepoužívaných neorezaných webových variantov bolo zálohovaných do `.qa/archiv-neorezane-web-20261029.zip`; zdroje zostávajú zachované.
- Upratanie: prvá záloha `.qa/archiv-povodne-podklady-20261029.zip` obsahuje 85 nepotrebných zdrojových a 43 nepoužívaných webových súborov. Pri oprave sa ďalších 48 nahradených súborov presunulo do `.qa/archiv-pred-opravou-obrazkov-20261029.zip`. Aktívne podklady sú iba v `figma-fotografie/` a `figma-uvod/`.
- Konzola hlavnej stránky bez zaznamenaných chýb a varovaní. Základné ovládanie funguje cez klávesnicu, aktívny prvok má viditeľné zvýraznenie.
- Lokálny server: stránky a fonty odpovedajú 200 so správnym typom obsahu; originály, exporty Figmy, Git a pracovný priečinok odpovedajú 404.
- Git: originály, Figma exporty a pracovné nástroje sú ignorované; kontrola bielych znakov cez `git diff --check` prešla.

## Rozsah a limity

Automatické skóre prístupnosti nenahrádza úplný audit s asistívnymi technológiami. Testované v Chrome, bez samostatného overenia Safari/iOS a Firefoxu. Testy formulára používajú simulovaný prenos; skutočné doručenie a aktiváciu existujúcej schránky FormSubmit treba overiť samostatne pri príprave publikovania. Mobilný Figma návrh nebol dodaný. Presné vlastnosti desktopových vrstiev boli načítané cez pripojenú Figmu a uložené lokálne; dosiahnutie limitu nebráni spusteniu ani obnove webu z uložených podkladov.
