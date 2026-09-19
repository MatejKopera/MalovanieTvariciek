# Maľovanie tváričiek

Prezentačná webstránka pre facepainting služby.

## Lokálny náhľad

```powershell
node server.mjs
```

Stránka bude dostupná na `http://127.0.0.1:4173`.

## Fotografie

- `fotky-originaly/` – sem vložte nové fotografie v pôvodnej kvalite. Samotné fotografie Git ignoruje.
- `fotky-web/` – optimalizované obrázky, ktoré používa verejná stránka a ukladajú sa do Gitu.

Fotografie z priečinka `fotky-originaly/` sa pred zverejnením zmenšia, skonvertujú do vhodného webového formátu a uložia do `fotky-web/`.

## Písma

- `Poppins` je uložený lokálne v priečinku `fonty/` a používa sa na bežný text, navigáciu, tlačidlá a formulár.
- `Letters for Learners` je pripravený pre hlavné nadpisy a názov značky.
- `Hello` je pripravený pre krátke ručne písané poznámky a dekoratívne texty.

Posledné dve písma sa môžu vložiť až po dodaní licencovaných fontových súborov. Dovtedy sa automaticky použije vizuálne podobné náhradné písmo.

## Nasadenie

Projekt je statický web bez build kroku. V Cloudflare Pages použite Git integráciu, produkčnú vetvu `main` a koreňový priečinok repozitára ako výstupný priečinok.
