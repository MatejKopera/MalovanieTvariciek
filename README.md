# Maľovanie tváričiek

Responzívna prezentačná stránka pre maľovanie na tvár podľa dodaného návrhu z Figmy. Statické HTML, CSS a JavaScript bez frameworku, inštalácie závislostí alebo build kroku.

- `index.html` – služby, výber fotografií, cenník a kontakt.
- `galeria.html` – 33 fotografií so zväčšením v prístupnom dialógu.
- `ochrana-osobnych-udajov.html` – existujúce informácie o spracúvaní údajov.

## Lokálny náhľad

```powershell
node server.mjs
```

Stránka bude dostupná na `http://127.0.0.1:4173`.

Server počúva iba na tomto počítači. Pracovné priečinky, originály a skryté súbory cez náhľad nesprístupňuje. Zmeny HTML/CSS/JS stačí obnoviť v prehliadači; po zmene `server.mjs` treba server reštartovať.

## Fotografie

- `fotky-originaly/figma-fotografie/` – 34 spoločných fotografických podkladov z Figmy pre náhľady aj zväčšenie.
- `fotky-originaly/figma-uvod/` – tri priehľadné fotografie a originálne ozdoby úvodu z Figmy.
- `fotky-web/` – optimalizované obrázky, ktoré používa verejná stránka a ukladajú sa do Gitu.
- Všetky priečinky pod `fotky-originaly/` Git ignoruje. Staré ručné exporty a nepoužívané obrázky sú uložené v zálohe `.qa/archiv-povodne-podklady-20261029.zip`, mimo aktívnych podkladov.

Fotografie z priečinka `fotky-originaly/` sa pred zverejnením zmenšia, skonvertujú do vhodného webového formátu a uložia do `fotky-web/`.

Pripravené WebP varianty majú šírku 320, 640 a najviac 1280 px podľa dostupného rozlíšenia. Náhľad aj zväčšenie používajú rovnaký záber a proporcie podľa obrazovej predlohy Figmy. Technické podklady so zmenenými proporciami sa korigujú podľa predlohy; rozmery samotného zdrojového súboru sa nepovažujú za dôkaz správnych proporcií. EXIF a poloha sa neukladajú. HTML obsahuje responzívne zdroje, rozmery a odložené načítanie galérie. Úvodná fotografia sa načítava prioritne.

Voliteľná obnova médií: `python scripts/prepare_assets.py` (Pillow). Používa iba uložené podklady z Figmy. `scripts/prepare_photos.py` spolu s `photo_geometry.py` generuje 38 obrazových miest v rôznych rozlíšeniach. Po otvorení sa použije najväčšia dostupná verzia rovnakého orezu ako v kartičke, najviac 1280 px na šírku. Kompozícia, pomer strán, otočenie aj zrkadlenie sú zhodné; malé zdroje sa umelo nezväčšujú. Postup upraví aj odkazy a rozmery obrázkov v HTML. `scripts/figma-photo-sources.json` eviduje pôvod a rozlíšenie 34 zdrojov, `scripts/photos.json` webové varianty a `scripts/figma-photos.json` jednotlivé obrazové miesta. Samostatný príkaz `python scripts/prepare_figma_photos.py` obnoví fotografie rovnakým postupom. Úvod sa skladá z priehľadných podkladov a pôvodných tvarov Figmy; aj pri jeho fotografiách sa zachovávajú proporcie.

Pôvodné oddelené podklady náhľadov a nahradené webové verzie sú zálohované v `.qa/archiv-pred-opravou-obrazkov-20261029.zip`. Na aktuálnu obnovu ich netreba.

Presná geometria každého záberu je uložená v `layout` v `scripts/figma-photos.json`. Vychádza z porovnania zhodných obrazových bodov so skutočným renderom Figmy, vrátane orezu, otočenia a proporcií. Nezávislé obrazové predlohy pre všetkých 38 miest sú v `tests/fixtures/figma-photos/` a používajú sa iba pri testovaní, nikdy ako webové obrázky. Testy porovnávajú hotové WebP s týmito predlohami; portrét s ružovými kvetmi má aj samostatný regresný test proti opätovnému natiahnutiu alebo chybnému orezu.

Nepoužívané neorezané webové varianty sú v `.qa/archiv-neorezane-web-20261029.zip`; zdrojové fotografie vo `fotky-originaly/figma-fotografie/` zostávajú zachované.

Aktívna sada obsahuje 30 uložených podkladov z návrhového kontextu Figmy a štyri overené dodané Figma exporty, ktoré nahradili podklady so zmenenými proporciami. Ich geometria bola porovnaná priamo s návrhom. Pôvodná sada zdrojov je zálohovaná v `.qa/archiv-zdroje-pred-obnovou-figmy.zip`, nahradené webové súbory v `.qa/archiv-pred-presnym-porovnanim-figma.zip`. Na prevádzku ani obnovu médií netreba ďalší prístup do Figmy ani nástroje na porovnávanie obrazových bodov; stačí Pillow a uložené údaje.

## Písma

- Lokálny Poppins v rezoch 300, 400, 500, 600 a 700 sa používa pre celú stránku vrátane nadpisov podľa pôvodných vrstiev Figmy. Logo je SVG.
- Web načítava malé WOFF2 súbory so znakmi pre slovenčinu a latinku; pôvodné TTF aj licencia OFL zostávajú v `fonty/`.
- Voliteľná obnova fontov: `python scripts/prepare_fonts.py` (FontTools a Brotli). Nie je potrebná na spustenie webu.

## Formulár a ovládanie

FormSubmit odosiela dopyt na existujúcu adresu Beáty. Povinné sú meno/firma a e-mail; dátum a správa sú voliteľné. Počas odosielania sa nedá odoslať ďalší dopyt. Chyba alebo prekročenie 60 sekúnd zachová údaje; potvrdený úspech ich vymaže. Pri časovom limite hlásenie upozorní, že služba už mohla správu prijať, aby návštevník neposlal duplicitu. Hlásenie zostáva pri formulári. Zachované je ochranné honeypot pole.

Galéria sťahuje veľkú fotografiu až po otvorení. Dialóg má priehľadné pozadie bez širokého obdĺžnika okolo fotky a vopred rezervované prirodzené rozmery. Počas načítania zobrazuje krúžok. Veľká fotografia sa objaví po dekódovaní. Pri chybe zostáva dostupný náhľad a chybové hlásenie. Dokončenie starej požiadavky po zatvorení nemôže prepísať inú otvorenú fotku. Zatvorenie funguje tlačidlom, Escape alebo kliknutím mimo fotografie; Tab ostáva v dialógu a fokus sa vráti na pôvodný obrázok.

Zväčšené fotografie na hlavnej stránke aj v galérii možno prepínať tlačidlami vľavo/vpravo alebo klávesmi ←/→ v poradí na stránke. Po poslednej nasleduje prvá a opačne. Pri zatvorení sa fokus vráti na pôvodne otvorený náhľad.

## Kontroly

Pracovné náhľady, porovnania a pomocné audity z upratania 6. novembra 2026 sú v lokálnom archíve `.qa/archiv-upratanie-20261106.zip`. Archív zachováva pôvodné cesty a obsahuje aj vyradené písmo ExtraBold, starú šípku Galérie a pôvodný zoznam SVG podkladov.

```powershell
node --test tests/form.test.mjs tests/lightbox.test.mjs
python -m unittest discover -s tests -p photos_test.py
python scripts/check_site.py
```

Node testy overujú formulár bez posielania e-mailov a otváranie fotiek vrátane pomalého načítania, chyby, zmeny rozmerov a zatvorenia pred dokončením požiadavky. Python testy overujú geometrické operácie, okraje bez pásov, všetkých 38 fotografických miest voči nezávislým obrazovým predlohám Figmy, zhodný orez pri zväčšení a správne HTML odkazy. `check_site.py` overuje súbory, kotvy, počty fotografií, responzívne zdroje a EXIF. Python kontroly vyžadujú Pillow.

Vizuálne overovať obe stránky pri šírkach 360, 390, 768, 1024 a 1440 px. Výkon merať cez lokálny Lighthouse v mobilnom režime. Aktuálne výsledky a rozsah overenia sú v `OVERENIE.md`. Skutočné doručenie do schránky nie je súčasťou simulovaných testov.

## Nasadenie

Projekt je statický web bez build kroku. V Cloudflare Pages použite Git integráciu, produkčnú vetvu `main` a koreňový priečinok repozitára ako výstupný priečinok.

Formulár (pole `_url`), canonical, sociálne metadáta, štruktúrované údaje, robots.txt a sitemap používajú produkčnú doménu `https://malovanietvariciek.sk/`. Históriu úprav a overenia nasadenia sleduje technický záznam. Po nasadení treba overiť aktiváciu FormSubmit a skutočné doručenie formulára pre novú doménu. Pri požiadavke na aktiváciu FormSubmit treba potvrdiť aktivačný e-mail pre verejný web. Do commitu nepridávať originály, exporty Figmy ani pomocný priečinok `.qa/`.
