# Maľovanie tváričiek – technický záznam webu

**Projekt / produkčná doména:** https://malovanietvariciek.sk  
**Dátum poslednej aktualizácie záznamu:** 2. november 2026  
**Pôvod dokumentácie:** postup a screenshoty z dočasného rozhovoru ChatGPT  
**Účel:** prenos kontextu do nového rozhovoru / Work mode a priebežný technický tracking record.

> **Legenda stavov:** ✅ dokončené a potvrdené používateľom alebo screenshotom · 🟡 rozpracované / čaká na kontrolu · ⬜ ešte neurobené · ⚠️ pozor / preveriť.  
> Záznam rozlišuje, čo sa skutočne urobilo, čo sa iba odporúčalo a čo treba ešte overiť. Nefunguje ako živý monitoring služieb.

## 1. Stručný stav projektu

| Oblasť | Stav | Poznámka |
|---|---|---|
| Registrácia `.sk` domény | ✅ | Doména **malovanietvariciek.sk** zakúpená cez **HostCreators**. |
| Hosting webu | ✅ | Existujúci projekt na **Cloudflare Pages**, napojený na GitHub. |
| DNS servery | ✅ | Zmenené z HostCreators na **Cloudflare**. |
| Aktivácia DNS zóny v Cloudflare | ✅ | V Domains → Overview sa zobrazil stav **Active**. |
| Vlastná doména bez `www` | ✅ | V Cloudflare Pages → Custom domains **Active**, **SSL enabled**. |
| Vlastná doména s `www` | ✅ | V Cloudflare Pages → Custom domains **Active**. |
| Presmerovanie `www` → bez `www` | ✅ | Pravidlo 301 vytvorené, používateľ otestoval: funguje. |
| DNSSEC | 🟡 | Starý kľúč v HostCreators odstránený; v Cloudflare spustené nové nastavenie, finálny stav **nebol nezávisle overený**. |
| Google Search Console | ✅ | Doména úspešne overená („Vlastníctvo bolo overené“). |
| Sitemap v Search Console | ⬜ | Zatiaľ neodoslaná. V XML sú staré `pages.dev` adresy – najprv opraviť v Gite. |
| SEO / robots.txt / canonical | 🟡 | Odporúčaná kontrola, zatiaľ bez výsledku. |
| Doménové e-maily | 🟡 | Sú importované niektoré e-mailové DNS záznamy, ale použitie e-mailovej služby nebolo potvrdené. |

## 2. Technické identifikátory

- **Registrátor domény:** HostCreators – https://www.hostcreators.sk/
- **Produkčná URL:** `https://malovanietvariciek.sk/`
- **Druhá URL:** `https://www.malovanietvariciek.sk/` → presmerovanie na URL bez `www`.
- **Cloudflare DNS nameservers:**
  - `kyle.ns.cloudflare.com`
  - `nena.ns.cloudflare.com`
- **Cloudflare Pages – názov projektu:** `malovanietvariciek`
- **Aktuálna Pages cieľová adresa podľa rozhrania Cloudflare:** `malovanietvariciek.pages.dev`
- **GitHub:** projekt/repozitár `MalovanieTvariciek` pripojený ku Cloudflare Pages (deployment sa spúšťa z GitHubu).
- **⚠️ Nezhoda:** starý `sitemap.xml` uvádza **`malovanie-tvariciek.pages.dev`** (s pomlčkou), kým projekt Pages v rozhraní používa **`malovanietvariciek.pages.dev`** (bez pomlčky). Opraviť bez ohľadu na to, či historická adresa ešte funguje.

**Údaj o expirácii:** v HostCreators bol na screenshote dátum **01.11.2027** a prepínač **Automatické predlžovanie** vyzeral vypnutý. ⚠️ Overiť v administrácii a prípadne nastaviť pripomienku/predlžovanie – nech doména neprepadne.

**Držiteľ domény:** diskusia sa týkala toho, či bude držiteľom majiteľka podnikania alebo jej partner, ktorý web spravuje. **Konečný údaj o držiteľovi nebol potvrdený**. Nezamieňať správcu účtu HostCreators s právnym držiteľom domény. Odporúčané overiť údaje držiteľa, hlavný kontaktný e-mail a prístup k účtu.

## 3. Chronologický postup – čo bolo vykonané

### A. Nákup domény na HostCreators ✅

1. Zakúpená doména `malovanietvariciek.sk`.
2. Pri nákupe nebolo potrebné zadávať vlastné DNS servery; nastavili sa dodatočne.
3. V HostCreators bola otvorená sekcia domény → **DNS**.
4. Najprv zostali predvolené NS/DNS servery HostCreators.

### B. Pridanie domény do Cloudflare ✅

1. Cloudflare Dashboard → **Add domain / Connect your domain**.
2. Zadané `malovanietvariciek.sk` (bez `www`, bez `https://`).
3. Zvolený **Free plan ($0)**.
4. Pri nastavovaní sa objavili voľby pre Search / Training / Agents / Bot Preference Sync; odporúčané povoliť prehľadávanie vyhľadávačmi, pri AI tréningu zvážiť obmedzenie a ponechať automatický import DNS.
5. Cloudflare naimportoval existujúce DNS záznamy od HostCreators.
6. Pred pokračovaním boli CNAME záznamy `imap`, `pop3`, `smtp`, `ssh` prepnuté z **Proxied** (oranžový oblak) na **DNS only** (sivý oblak).
7. Kliknuté **Continue to activation**.
8. Cloudflare zobrazil pridelené nameservery `kyle.ns.cloudflare.com` a `nena.ns.cloudflare.com`.

### C. Zmena nameserverov v HostCreators ✅

1. HostCreators → doména → **DNS**.
2. V sekcii DNSSEC bol odstránený pôvodný DS/DNSSEC kľúč (na screenshote **Key tag 35216**) pred zmenou nameserverov.
3. Vybraná možnosť **Mám vlastné NS / DNS servery**.
4. Nastavené:
   - **NS1:** `kyle.ns.cloudflare.com`
   - **NS2:** `nena.ns.cloudflare.com`
   - **NS3, NS4:** prázdne
5. Uložené. Tým sa nahradili pôvodné nameservery `ns1.hostcreators.sk`, `ns2.hostcreators.sk`, `ns3.hostcreators.sk`, `ns4.hostcreators.eu`.
6. V Cloudflare kliknuté **I updated my nameservers**.
7. V Cloudflare Domains → Overview bola doména následne označená **Active**.

**Poznámka:** po odstránení starého DS záznamu sa nemusí zmena prejaviť u všetkých DNS resolverov súčasne; v tejto fáze však na novej doméne ešte nebežali dôležité služby.

### D. Pripojenie Cloudflare Pages k doméne ✅

1. Cloudflare → **Workers & Pages** → projekt `malovanietvariciek`.
2. Otvorená záložka **Custom domains** → **Set up a custom domain**.
3. Pridané `malovanietvariciek.sk`.
4. Potvrdená výmena starých apex `A`/`AAAA` záznamov HostCreators za **CNAME** smerujúci na `malovanietvariciek.pages.dev`.
5. Kliknuté **Activate domain**; stav postupne `Initializing` → `Verifying` → **Active**, potom viditeľné **SSL enabled**.
6. Rovnako pridané `www.malovanietvariciek.sk`.
7. Cloudflare nahradil pôvodné `www` záznamy `A`/`AAAA` za `www` **CNAME** → `malovanietvariciek.pages.dev`.
8. Aj verzia s `www` prešla do stavu **Active**.

### E. Presmerovanie `www` na základnú doménu ✅

1. Cloudflare → doména `malovanietvariciek.sk` → **Rules → Overview**.
2. Použitá šablóna **Redirect from WWW to root**.
3. Vytvorené pravidlo:
   - **Rule name:** `Redirect from WWW to root [Template]`
   - **Condition / Request URL:** `https://www.*` (**Wildcard pattern**)
   - **Target URL:** `https://${1}`
   - **Status code:** `301 – Permanent Redirect`
   - **Preserve query string:** zapnuté
4. Pri nasadzovaní Cloudflare upozornil, že pravidlo možno nebude zodpovedať proxied DNS; zvolená možnosť **Ignore and deploy rule anyway** (existujúci `www` CNAME bol proxied).
5. Kliknuté **Deploy rule**.
6. **Používateľ otestoval a potvrdil, že presmerovanie funguje.**

**Výsledok:** preferovaná (kanonická) verejná URL je `https://malovanietvariciek.sk/`. V HTML je vhodné tiež používať túto doménu v canonical meta značkách.

### F. DNSSEC – rozpracované 🟡

1. Pôvodný DNSSEC DS kľúč v HostCreators bol **odstránený** pred zmenou nameserverov.
2. Po aktivácii Cloudflare bolo otvorené **DNS → Settings → DNSSEC → Enable DNSSEC**.
3. Zobrazené údaje **DS Record** pre nový Cloudflare podpis:
   - **Algorithm:** `13`
   - **Digest type:** `2 (SHA256)`
   - **Key tag:** `2371`
   - **Flags:** `257 (KSK)`
   - **Úplný digest, DS record ani verejný kľúč nie sú v tomto dokumente prepísané** (na screenshote boli skrátené; treba kopírovať priamo z Cloudflare).
4. V rozhovore bolo odporučené kliknúť **Confirm**. **Nemáme však screenshot definitívneho stavu Active**, ani potvrdenie existencie nového DS záznamu v registri.

**Ďalší postup:** skontrolovať v Cloudflare **DNS → Settings → DNSSEC**, či je **Active**. Ak je Pending, overiť u registrátora HostCreators / v registri `.sk`, či bol správny DS záznam publikovaný. Cloudflare môže poskytovať CDS na automatizáciu zmeny, no netreba bez kontroly predpokladať, že pre danú doménu a registrátora už prebehla. **Nepridávať náhodne starý DS kľúč** – nesprávny DS záznam môže spôsobiť nedostupnosť domény pri DNSSEC validácii.

### G. Google Search Console – overenie vlastníctva ✅

1. Otvorený https://search.google.com/search-console.
2. **Pridať web → Doména** → `malovanietvariciek.sk`.
3. Google ponúkol automatické overenie cez **Cloudflare.com**.
4. Kliknuté **Spustiť overenie** → autorizácia Cloudflare DNS.
5. Google požadoval jednorazové pridanie **TXT** záznamu `google-site-verification=...` pre koreň domény.
6. Kliknuté **Authorize**.
7. Google zobrazil **„Vlastníctvo bolo overené“**.
8. **TXT overovací záznam neodstraňovať**, inak môže byť nutné vlastníctvo overovať znova.

**Dôležité:** úspešné overenie vlastníctva ≠ automatické indexovanie alebo dobrá pozícia na Googli. V sekcii *Indexovanie stránok* sa práve spracúvali údaje.

### H. Sitemap – zistený problém 🟡

1. Search Console → **Indexovanie → Počet súborov Sitemap**.
2. Zoznam odoslaných sitemap bol **prázdny**.
3. Pri otvorení `https://malovanietvariciek.sk/sitemap.xml` sa zobrazilo platné XML bez grafického štýlovania (to **nie je chyba**).
4. Aktuálny obsah sitemap obsahoval dve staré `loc` URL:

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://malovanie-tvariciek.pages.dev/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://malovanie-tvariciek.pages.dev/galeria.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

5. **Odporučená, ale ešte nevykonaná oprava:** v repozitári GitHub zmeniť oba `<loc>` na:
   - `https://malovanietvariciek.sk/`
   - `https://malovanietvariciek.sk/galeria.html`
6. Commit/push do GitHubu → automatický deployment cez Cloudflare Pages (ak produkčná vetva a deployment nastavenia zostali ako doteraz).
7. Skontrolovať `https://malovanietvariciek.sk/sitemap.xml` a overiť, že obsahuje opravené adresy.
8. Až potom v Search Console → Sitemapy → pridať **`https://malovanietvariciek.sk/sitemap.xml`** → **Odoslať**.

## 4. Súčasné a historické DNS záznamy – poznámky

Pri pôvodnom importe z HostCreators a neskoršej kontrole Cloudflare bolo vidieť:

| Typ / názov | Smerovanie alebo význam | Stav / poznámka |
|---|---|---|
| CNAME `@` | `malovanietvariciek.pages.dev` | ✅ finálny apex web, proxied |
| CNAME `www` | `malovanietvariciek.pages.dev` | ✅ finálny `www` web, proxied |
| A `*` | `185.208.201.7` | ⚠️ pôvodný wildcard HostCreators, zostal v Cloudflare |
| AAAA `*` | `2a10:9c80::185:208:201:7` | ⚠️ pôvodný wildcard HostCreators, zostal v Cloudflare |
| CNAME `imap` | `imap.hostcreators.sk` | DNS only |
| CNAME `pop3` | `pop3.hostcreators.sk` | DNS only |
| CNAME `smtp` | `smtp.hostcreators.sk` | DNS only |
| CNAME `ssh` | `ssh.hostcreators.sk` | DNS only |
| MX `@` | `mx1.hostcreators.sk`, priorita **10** | Importované |
| MX `@` | `mx2.hostcreators.sk`, priorita **20** | Importované |
| TXT `@` | SPF s `include:_spf.hostcreators.sk` | Importované; skontrolovať pri rozbehu e-mailov |
| TXT `_dmarc` | DMARC, `p=reject` | Importované; skontrolovať pri rozbehu e-mailov |
| TXT `@` | `google-site-verification=...` | ✅ doplnené autorizáciou Search Console |

**⚠️ E-mailové záznamy, ktoré sa pravdepodobne NENAIMPORTOVALI:** na pôvodných screenshotoch HostCreators sú navyše:

- **SRV** `_autodiscover._tcp.malovanietvariciek.sk` → `0 0 443 autodiscover.hostcreators.sk`
- **DKIM** `hcdefault._domainkey.malovanietvariciek.sk` → dlhý TXT verejný kľúč

Na následnom screenshote DNS Records v Cloudflare tieto položky **neboli zobrazené** (13 záznamov, bez SRV/DKIM). Ak bude pre doménu fungovať e-mail cez HostCreators, treba tieto záznamy **overiť a prípadne presne skopírovať** z nastavení e-mailovej služby; neodhadovať celý DKIM kľúč. Ak doménové e-maily vôbec neplánujete, nie je to blokujúce pre samotný web.

**Wildcard `*` A/AAAA** stále smeruje na pôvodný HostCreators server. Pre hlavný web nie je potrebný, ale neodstraňovať ho bez kontroly, či sa nepoužíva pre iné subdomény. Možno ho vyčistiť neskôr.

## 5. Najbližšie úlohy – odporúčané poradie

- [ ] **1. Opraviť a commitnúť `sitemap.xml`** v GitHub repozitári (odstrániť staré `pages.dev` URL; použiť produkčnú `.sk` doménu).
- [ ] **2. Overiť nasadený súbor** `https://malovanietvariciek.sk/sitemap.xml` a funkčnosť uvedených stránok.
- [ ] **3. Odoslať sitemap** cez Google Search Console → Sitemapy.
- [ ] **4. Skontrolovať `robots.txt`** na `https://malovanietvariciek.sk/robots.txt`; nesmie nechtiac blokovať Googlebot a ideálne má obsahovať odkaz na sitemap.
- [ ] **5. Skontrolovať SEO v kóde stránky** – `<title>`, meta description, canonical URL (`https://malovanietvariciek.sk/...`), Open Graph/social URL a odkazy; prehľadať celý repozitár na texty `pages.dev`.
- [ ] **6. V Google Search Console skontrolovať indexovanie** hlavnej stránky cez URL Inspection a podľa potreby požiadať o indexovanie. Spracovanie môže trvať dni až týždne.
- [ ] **7. Overiť finálny stav DNSSEC** v Cloudflare a podľa potreby správnosť DS záznamu u HostCreators / SK-NIC.
- [ ] **8. Skontrolovať držiteľa domény, kontaktné údaje a automatické predlžovanie**; na screenshote bolo vypnuté, expirácia 01.11.2027.
- [ ] **9. Rozhodnúť, či budú používané e-maily `@malovanietvariciek.sk`**. Ak áno, overiť DKIM a SRV (a správnosť SPF/MX/DMARC) pred používaním.
- [ ] **10. Voliteľne:** prečistiť nevyužité wildcard DNS záznamy a zapojiť Google Business Profile / lokálne SEO pre služby maľovania na tvár.

## 6. Prečo takto – krátky slovník

- **Registrátor (HostCreators):** miesto, kde je doména zaregistrovaná a platí sa jej obnova.
- **DNS / nameserver:** prevádza názov domény na technické smerovanie. Nameservery sú teraz u Cloudflare.
- **Cloudflare Pages:** hostuje publikovaný web. Aktualizácie typicky prichádzajú z GitHubu.
- **CNAME:** DNS záznam smerujúci názov domény na iný hostname; tu na Pages projekt.
- **SSL / HTTPS:** šifrované spojenie návštevníka s webom.
- **301 redirect:** trvalé presmerovanie zo `www` na hlavnú URL bez `www`.
- **DNSSEC:** kryptografické overenie pravosti DNS odpovedí. Pri zmene poskytovateľa DNS treba správny nový DS záznam.
- **SK-NIC:** správca registra slovenských domén `.sk`.
- **DS / CDS:** DS je záznam v nadradenej DNS zóne potrebný na reťazec dôvery DNSSEC; CDS je jeden zo spôsobov oznámenia zmeny DS registračnej infraštruktúre. Automatické spracovanie treba overiť.
- **Google Search Console:** nástroj, ktorým sa overí kontrola nad doménou, posielajú sitemapy a sleduje indexovanie.
- **Sitemap (`sitemap.xml`):** zoznam URL, ktoré chce web ponúknuť vyhľadávačom na objavenie.
- **`robots.txt`:** súbor pravidiel pre robotov; sám osebe nie je bezpečnostná ochrana.
- **Canonical URL:** preferovaná oficiálna adresa tej istej stránky pre vyhľadávače.

## 7. Štartovací text do nového chatu / Work mode

> Pokračujeme v projekte **malovanietvariciek.sk**. Tento priložený súbor je náš technický tracking record z pôvodného dočasného chatu. Prečítaj ho celý a pracuj s tým, že doména, Cloudflare Pages, obe custom domény, HTTPS, presmerovanie `www` → bez `www` a overenie Google Search Console sú hotové. **Sitemap v GitHube je ešte chybná a nie je odoslaná do Search Console; DNSSEC je potrebné overiť.** Pokračuj prioritne opravou sitemap a kontrolou `robots.txt`/canonical údajov. Rozlišuj potvrdené kroky od predpokladov. Pred zmenami, ktoré môžu ovplyvniť DNS, e-maily, indexovanie alebo dostupnosť webu, vysvetli riziko a vyžiadaj si moje rozhodnutie. Po každom významnom kroku aktualizuj tracking record v Markdown.

---

**Ďalšie záznamy:** pri pokračovaní dopĺňať sekcie s dátumom, zmenenými súbormi alebo nastaveniami, výsledkom testu a prípadnými otvorenými problémami. Do dokumentu neukladať heslá, prístupové tokeny ani súkromné API kľúče.

## 8. Pokračovanie – 2. november 2026 (lokálna príprava)

**Stav: pripravené lokálne, bez commitu/pushu a bez nasadenia.** Pôvodné tabuľky a checklist vyššie opisujú posledný potvrdený verejný stav; tento dodatok zaznamenáva novú lokálnu prípravu.

- V `sitemap.xml` sú obe URL zmenené na `https://malovanietvariciek.sk/` a `https://malovanietvariciek.sk/galeria.html`.
- V `robots.txt` zostáva `Allow: /`; odkaz na sitemap používa produkčnú `.sk` doménu.
- V `index.html` a `galeria.html` sú opravené canonical, Open Graph URL a obrázky. V hlavnej stránke je opravená aj URL v štruktúrovaných údajoch.
- `README.md` bol zosúladený s lokálnou prípravou.
- Skryté pole formulára `_url` stále používa `https://malovanietvariciek.pages.dev/#kontakt`. Jeho zmena a overenie skutočného doručenia zostávajú samostatnou úlohou.
- Kontroly: sitemap je platné XML s dvomi očakávanými produkčnými URL; canonical na oboch stránkach aj robots.txt prešli kontrolou. `git diff --check` bez chýb. Všetkých 16 existujúcich Node testov formulára a galérie prešlo.
- `python scripts/check_site.py` sa nespustil, pretože dostupný príkaz Python smeruje na nefunkčný Windows alias. Úplná kontrola obrázkov týmto skriptom teda nebola vykonaná.
- Verejnú stránku, sitemap a robots.txt sa cez webový nástroj nepodarilo načítať. Nasadený obsah preto nie je nezávisle overený.
- DNS, e-mailové nastavenia ani Google Search Console neboli menené. DNSSEC zostáva neoverené.

**Ďalší krok:** rozhodnutie používateľa o zverejnení pripravených opráv. Zmena dá vyhľadávačom preferovanú `.sk` doménu namiesto starej Pages adresy a môže zmeniť výber indexovaných URL; negarantuje termín indexovania ani pozíciu. Pred pushom overiť produkčnú vetvu a stav vzdialeného repozitára. Po nasadení skontrolovať verejné súbory a až potom odoslať sitemap do Search Console.
## 9. Dokončenie lokálnej prípravy – 2. november 2026

**Pokyn používateľa:** najprv pripraviť všetko potrebné, push vykonať až následne. Žiadny commit, push ani nasadenie v tomto kroku neprebehli.

- Opravené aj skryté pole formulára `_url` na `https://malovanietvariciek.sk/#kontakt`; príjemca a spôsob odosielania zostali rovnaké. Tento bod nahrádza otvorenú lokálnu úlohu v sekcii 8.
- Všetky verejné HTML, CSS, JavaScript, sitemap a robots.txt sú bez odkazov na `pages.dev`.
- Samostatná kontrola overila presné canonical a Open Graph URL na oboch indexovateľných stránkach, existenciu sociálneho obrázka, popisy, platný JSON štruktúrovaných údajov, URL formulára, platné XML sitemap a lokálnu existenciu jej cieľov. Robots.txt povoľuje prehľadávanie a odkazuje na správnu sitemap.
- Stránka ochrany údajov si zachováva existujúce `noindex, follow` a nie je v sitemap.
- Všetkých 16 existujúcich Node testov prešlo aj po dokončení úprav. `git diff --check` bez chýb. Aktuálna lokálna vetva: `main`; stav vzdialenej vetvy ešte neoverený.
- Python sa podarilo spustiť cez pribalený runtime. `scripts/check_site.py` potvrdil lokálne odkazy, kotvy, responzívne obrázky, CSS podklady, WebP metadáta, SVG rozmery a počty fotografií. Potom sa zastavil na chýbajúcom origináli `fotky-originaly/figma-fotografie/tiger.png`. Celý skript teda neprešiel; nejde o chýbajúci verejný obrázok. Chýbajúci podklad môže byť potrebný pri budúcom generovaní fotografií, ktoré sa teraz nevykonávalo.
- Pri opakovanej verejnej kontrole zlyhalo DNS rozlíšenie domény aj služby `dns.google` (`ENOTFOUND`). Z tohto prostredia preto nemožno usudzovať na dostupnosť webu ani stav DNSSEC.

### Zostávajúce kroky pred pushom a po nasadení

1. Pred pushom skontrolovať rozdiely voči vzdialenej vetve; potvrdiť zverejnenie používateľom podľa jeho pokynu. Lokálne zmeny sú pripravené na revíziu.
2. V Cloudflare skontrolovať DNSSEC (Active/Pending); pri Pending porovnať presný aktuálny DS záznam s údajmi HostCreators. Bez overenia nemeniť DNS.
3. V HostCreators preveriť držiteľa domény, kontaktný e-mail a automatické predlžovanie. Posledný historický údaj o expirácii: 01.11.2027.
4. Rozhodnúť o používaní doménovej e-mailovej služby; pri jej používaní preveriť DKIM/SRV a ostatné e-mailové záznamy. Kontaktný formulár aktuálne smeruje na Gmail.
5. Po nasadení overiť verejnú sitemap, robots.txt, canonical, dostupnosť sociálneho obrázka a presmerovanie www. Pre FormSubmit overiť prípadnú požiadavku aktivácie pre novú doménu a skutočné doručenie správy; automatické testy e-maily neposielali.
6. Až po potvrdení nasadenia odoslať `https://malovanietvariciek.sk/sitemap.xml` v Google Search Console a skontrolovať hlavnú URL cez kontrolu adresy.

Administratívne body 2–4 neboli v účtoch vykonané ani potvrdené. Google Search Console sa nemenilo. Lokálna príprava nenahrádza kontrolu po nasadení.
## 10. Odoslanie zmien do GitHubu – 2. november 2026

Používateľ schválil commit a push pripravených zmien. `git fetch origin` prešiel; pred commitom bola lokálna vetva `main` zhodná s `origin/main` (žiadne rozdielne commity). Rozsah: sitemap, robots.txt, canonical a Open Graph údaje, URL služby v JSON-LD, pole `_url` formulára, README a tento záznam. Funkčnosť formulára a galérie overilo 16 testov počas prípravy; zistené obmedzenie kontroly originálnych fotografií zostáva uvedené v sekcii 9.

Tento zápis vzniká pred commitom: úspech pushu ani dokončenie Cloudflare nasadenia týmto ešte nie sú potvrdené. Po pushi treba overiť verejné súbory, HTTP hlavičky, canonical a presmerovania. Sitemap do Search Console zatiaľ nebola odoslaná; živý e-mailový test neprebehol.
## 11. Prvý push a živá kontrola – 2. november 2026

- Commit `d6db200` bol úspešne pushnutý do `origin/main`.
- Verejný web sa podarilo načítať po povolení sieťového prístupu. Predchádzajúce ENOTFOUND teda nebolo dôkazom chyby domény.
- Prvá kontrola po pushi ešte vrátila starú sitemap, robots.txt a canonical; dokončenie nasadenia vtedy nebolo potvrdené.
- Hlavná stránka, galéria, sitemap, robots.txt a sociálny obrázok odpovedali 200 po prípadnom presmerovaní. `www` odpovedalo 301 na doménu bez www a zachovalo query string.
- Zistenie: `/galeria.html` sa presmerúva na `/galeria`. Preto v následnej úprave používajú canonical, Open Graph URL galérie a sitemap finálnu URL `https://malovanietvariciek.sk/galeria`. Týmto sa spresňujú pôvodné odporúčania adries s `.html`.
- Cloudflare pridáva do robots.txt vlastné pravidlá pre robotov. V načítanej odpovedi bolo všeobecné prehľadávanie povolené. HTTP odpovede nemali X-Robots-Tag; obsahovali X-Content-Type-Options: nosniff. HSTS v týchto odpovediach nebolo prítomné.
- Sitemap do Search Console zatiaľ neodoslaná; čaká na potvrdenie aktuálneho obsahu po nasadení.