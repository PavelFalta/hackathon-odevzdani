# Kairos

Interaktivní mapová aplikace pro Karlovarský kraj: 3D mapa (Mapbox), hlasový asistent s odpověďmi nad otevřenými daty [datazapad.cz](https://www.datazapad.cz/) a doplňkovým vyhledáváním akcí a recenzí. Cílí na občany, návštěvníky regionu a pracovníky kraje, kteří potřebují rychle najít místa a ověřit fakta v kontextu mapy.

## Použitá data

V repozitáři jsou zdrojové exporty CSV (`datazapad/`), katalog `datazapad/_katalog.csv` a normalizované záznamy (`datazapad/normalized/`) připravené pro mapu a vektorové vyhledávání (sjednocené sloupce, souřadnice WGS-84, textové dokumenty pro RAG).

### Datové sady z katalogu datazapad.cz (88)

- [Agroturistické destinace v Karlovarském kraji](https://www.datazapad.cz/datasets/5e900a28dedd446aa8ae18d49ac88d70_0/about), CC BY 4.0, upraveno
- [Aktuální projekty Karlovarského kraje v oblasti rozvoje regionu a územního plánování](https://www.datazapad.cz/datasets/3f9c9a95272e40d1a24e2711515e3d4d_3/about), CC0 1.0, upraveno
- [Aquaparky, koupaliště a bazény v Karlovarském kraji](https://www.datazapad.cz/datasets/98d26c1b1c8f4bd49850af82a19a7f58_0/about), CC BY 4.0, upraveno
- [Archeologické památky v Karlovarském kraji](https://www.datazapad.cz/datasets/5b6083d1a59d46c59d26717b31e991d1_0/about), CC BY 4.0, upraveno
- [Asistenční vouchery 2020 - 2022 v Karlovarském kraji](https://www.datazapad.cz/datasets/6cd2b71c45184327aab9375661268f5d_3/about), CC BY 4.0, upraveno
- [Autobusové zastávky v Karlovarském kraji](https://www.datazapad.cz/datasets/979283f4b7ec4b778b8eed7aab6917c3_0/about), CC BY 4.0, upraveno
- [Botanické zahrady a arboreta v Karlovarském kraji](https://www.datazapad.cz/datasets/8ae1f28fc17f4918a0dba74bb11797ff_0/about), CC BY 4.0, upraveno
- [Divadla v Karlovarském kraji](https://www.datazapad.cz/datasets/805a0267da9e45eea0c20a2e3123189f_3/about), CC BY 4.0, upraveno
- [Dobroty Karlovarského kraje](https://www.datazapad.cz/datasets/5767506f1df649098991f462da16d497_3/about), CC0 1.0, upraveno
- [Dobrovolné svazky obcí Karlovarského kraje](https://www.datazapad.cz/datasets/dbe7041a35494dbe8e01fd86694faed8_3/about), CC0 1.0, upraveno
- [Evidované knihovny v Karlovarském kraji](https://www.datazapad.cz/datasets/371221f80ed145b2a562ee98ec321acb_0/about), CC0 1.0, upraveno
- [Galerie kreativců Karlovarského kraje](https://www.datazapad.cz/datasets/5ad57de2f5ea4f4483fd123f48beee47_0/about), CC BY 4.0, upraveno
- [Golfová hřiště v Karlovarském kraji](https://www.datazapad.cz/datasets/58bc30d273d84926bc4e817aabca9321_0/about), CC BY 4.0, upraveno
- [Historické městské soubory v Karlovarském kraji](https://www.datazapad.cz/datasets/5f5a19a727514857a731e29781448dc7_0/about), CC0 1.0, upraveno
- [Historické vesnické soubory v Karlovarském kraji](https://www.datazapad.cz/datasets/c3a31017e7ac4e8d8d75c6a1ed49bc03_0/about), CC0 1.0, upraveno
- [Hornické a technické památky v Karlovarském kraji](https://www.datazapad.cz/datasets/3727aefc159e47fd8cb9d70432ab7397_3/about), CC BY 4.0, upraveno
- [Hrady a jejich zříceniny v Karlovarském kraji](https://www.datazapad.cz/datasets/c3a42c283f0649248326a0bbd7dc5cc3_0/about), CC BY 4.0, upraveno
- [Inovační infrastruktury Karlovarského kraje](https://www.datazapad.cz/datasets/f98f8248cdf140ad84649976f2d6f499_3/about), CC BY 4.0, upraveno
- [Inovační vouchery 2020 - 2022](https://www.datazapad.cz/datasets/b59dc439b86147e4aefba8d94fc6aa9e_3/about), CC BY 4.0, upraveno
- [Jezdecké oddíly a kluby v Karlovarském kraji](https://www.datazapad.cz/datasets/4cc176ac502245ab8b6f40c425bb67b9_0/about), CC BY 4.0, upraveno
- [Jezdectví v Karlovarském kraji](https://www.datazapad.cz/datasets/1233e8ab25e64a859ad3c88d51f0fdb8_3/about), CC BY 4.0, upraveno
- [Jiné atraktivity v Karlovarském kraji](https://www.datazapad.cz/datasets/1e64adf22f8448a693f638c9f1334dc9_3/about), CC BY 4.0, upraveno
- [Kina a kinosály v Karlovarském kraji](https://www.datazapad.cz/datasets/94c4d284041c4412af231e96fe66cf6b_3/about), CC BY 4.0, upraveno
- [Koupací místa s kontrolou kvality vody v Karlovarském kraji do roku 2025](https://www.datazapad.cz/datasets/023d09f19a0943c989fb25266161ddff_0/about), CC BY 4.0, upraveno
- [Koupací místa s kontrolou kvality vody v roce 2026 v Karlovarském kraji](https://www.datazapad.cz/datasets/239805159c8649609d1bd40a30439623_0/about), CC BY 4.0, upraveno
- [Kreativní vouchery 2020 - 2022](https://www.datazapad.cz/datasets/387d1403bddb48b09ba4e3cd3b7894f8_0/about), CC BY 4.0, upraveno
- [Kulturní domy a centra v Karlovarském kraji](https://www.datazapad.cz/datasets/c548528f8601499d894cc7556e679de6_0/about), CC BY 4.0, upraveno
- [Lanová a zábavní centra v Karlovarském kraji](https://www.datazapad.cz/datasets/90441fa783444e1ead5ad71464504d6a_0/about), CC BY 4.0, upraveno
- [Letiště v Karlovarském kraji](https://www.datazapad.cz/datasets/fc44327a17e04959b7c5209d9ce32820_3/about), CC BY 4.0, upraveno
- [Lyžařské vleky a lanovky v Karlovarském kraji](https://www.datazapad.cz/datasets/d130e2d3a13d4ca39b16761d2131619b_0/about), CC BY 4.0, upraveno
- [Lázeňská místa v Karlovarském kraji](https://www.datazapad.cz/datasets/a193c3092bef4fa8b514761b421d9ee1_3/about), CC BY 4.0, upraveno
- [Lékařská a lékárenská pohotovostní služba v Karlovarském kraji](https://www.datazapad.cz/datasets/72aa9de6abc94f949f3959e70e0d241d_0/about), CC0 1.0, upraveno
- [Maloplošná zvláště chráněná území v Karlovarském kraji](https://www.datazapad.cz/datasets/01509286281c4bb994748444d79a1815_0/about), CC0 1.0, upraveno
- [MAS dle příslušnosti jednotlivých obcí v Karlovarském kraji](https://www.datazapad.cz/datasets/2c8293e475994414b4210f9ba00813f9_0/about), CC0 1.0, upraveno
- [Matriční úřady Karlovarského kraje](https://www.datazapad.cz/datasets/0fbcd94c27344fef86d2dafde1230761_0/about), CC0 1.0, upraveno
- [Mikroregiony v Karlovarském kraji](https://www.datazapad.cz/datasets/0e9821be72914b65ac6e9ccf37c8ea56_3/about), CC0 1.0, upraveno
- [Muzea a galerie v Karlovarském kraji](https://www.datazapad.cz/datasets/5aa3b9fe8da6474786ff2b9c81b006cb_0/about), CC BY 4.0, upraveno
- [Muzea v přírodě a skanzeny v Karlovarském kraji](https://www.datazapad.cz/datasets/6be3423787fd4c1fa19a70b025e2eb64_3/about), CC BY 4.0, upraveno
- [Místní organizace Českého rybářského svazu v Karlovarském kraji](https://www.datazapad.cz/datasets/89849217c2d14e8685b02a48ce600687_0/about), CC BY 4.0, upraveno
- [Nemocnice v Karlovarském kraji](https://www.datazapad.cz/datasets/03dbe5719ab64960ae70ee90af4790c6_3/about), CC BY 4.0 (uveďte původ), upraveno
- [Náboženské památky v Karlovarském kraji](https://www.datazapad.cz/datasets/2c9bd5558c4a495c8424a84bc6b370e2_3/about), CC BY 4.0, upraveno
- [Národní kulturní památky v Karlovarském kraji](https://www.datazapad.cz/datasets/c0ae279455b34b5fb4a929ef98675a5b_3/about), CC0 1.0, upraveno
- [Obce s rozšířenou působností Karlovarského kraje](https://www.datazapad.cz/datasets/52b5d92f7aff4e6282d6838ff338c76b_0/about), CC0 1.0, upraveno
- [Obecní živnostenské úřady Karlovarského kraje dle územní příslušnosti obcí](https://www.datazapad.cz/datasets/d27fb764c5a642e2bf2f8c134cbdeca2_3/about), CC0 1.0, upraveno
- [Obecní živnostenské úřady v Karlovarském kraji](https://www.datazapad.cz/datasets/4d8d7284782049ee826b794af25cbc05_0/about), CC0 1.0, upraveno
- [Odborné organizace v cestovním ruchu a lázeňství v Karlovarském kraji](https://www.datazapad.cz/datasets/5e92fe0bd817496eb38cd733543e56f8_0/about), CC0 1.0, upraveno
- [Organizace a společnosti zřízené Karlovarským krajem](https://www.datazapad.cz/datasets/a80fbe6e01f742a8a0a7b507bfb3998f_0/about), CC0 1.0, upraveno
- [Orgány a organizace státní památkové péče v Karlovarském kraji](https://www.datazapad.cz/datasets/10bdbfe0cb1341a784f5a1e4ed66b1da_3/about), CC0 1.0, upraveno
- [Osoby pověřené k výkonu sociálně-právní ochrany působící v Karlovarském kraji](https://www.datazapad.cz/datasets/b25ec3a5ec614f8ab341eeae3e9e19be_3/about), CC BY 4.0, upraveno
- [Památkově chráněná území v Karlovarském kraji](https://www.datazapad.cz/datasets/54223e92a9b04a0ba27e9800f41c4f1f_3/about), CC0 1.0, upraveno
- [Památky UNESCO v Karlovarském kraji](https://www.datazapad.cz/datasets/135900efd11e4df1865987b57428eb9f_3/about), CC BY 4.0, upraveno
- [Pivovarnictví v Karlovarském kraji](https://www.datazapad.cz/datasets/0ddb05a36f0c4b319975df6a4b1ed90e_3/about), CC BY 4.0, upraveno
- [Pohřebiště v Karlovarském kraji](https://www.datazapad.cz/datasets/1384c78c4e6846219a9829cd07c81f60_0/about), CC0 1.0, upraveno
- [Pohřební služby v Karlovarském kraji](https://www.datazapad.cz/datasets/d51db8b1ac8f40b6adf214e67cbb6f30_3/about), CC0 1.0, upraveno
- [Poskytovatelé pobytových sociálních služeb pro seniory v Karlovarském kraji](https://www.datazapad.cz/datasets/0fc741fffbb44c31820304ec60cc2ff0_3/about), CC0 1.0, upraveno
- [Poskytovatelé sociálních služeb v Karlovarském kraji](https://www.datazapad.cz/datasets/8a71d71444f14acd8d43023ce9c3fb95_0/about), CC0 1.0, upraveno
- [Průmyslové zóny a parky v Karlovarském kraji](https://www.datazapad.cz/datasets/6fb15a0f28fe41d083ac150dc7405171_0/about), CC0 1.0, upraveno
- [Přehled majetkových pasportů budov Karlovarského kraje](https://www.datazapad.cz/datasets/af6ba592d33945f384e41da14f381852_0/about), CC0 1.0, upraveno
- [Přírodní pozoruhodnosti v Karlovarském kraji](https://www.datazapad.cz/datasets/037f7b55d2d34fa88fd63bf2d2903839_3/about), CC BY 4.0, upraveno
- [Přístupné prameny v Karlovarském kraji](https://www.datazapad.cz/datasets/92327bf761e14d3c8cd169b7d65fa418_3/about), CC BY 4.0, upraveno
- [Rozhledny v Karlovarském kraji](https://www.datazapad.cz/datasets/2fe4d27ac10341f6bd2b4ea6380a2599_0/about), CC BY 4.0, upraveno
- [Seznam MAS v Karlovarském kraji](https://www.datazapad.cz/datasets/2293df931dc548668292c933ab7d4a6d_3/about), CC BY 4.0, upraveno
- [Seznam obcí Karlovarského kraje](https://www.datazapad.cz/datasets/17a673b7147d45ba8744904cae6afdbb_0/about), CC0 1.0, upraveno
- [Seznam provozovatelů školicích středisek v Karlovarském kraji](https://www.datazapad.cz/datasets/903168d407624e57a43cb4ab9bc97620_0/about), CC0 1.0, upraveno
- [Seznam strategických dokumentů Karlovarského kraje](https://www.datazapad.cz/datasets/01fcf68eb2054fb3ab99af6aa34af6e4_0/about), CC0 1.0, upraveno
- [Seznam vysokých škol působících v Karlovarském kraji](https://www.datazapad.cz/datasets/25589e2554f54259b200f4adb547db54_0/about), CC0 1.0, upraveno
- [Seznam škol a školských zařízení do stupně VOŠ v Karlovarském kraji](https://www.datazapad.cz/datasets/11796bcb67ee47bd8d38c0ec271b2787_3/about), CC0 1.0, upraveno
- [Služebny Policie ČR v Karlovarském kraji](https://www.datazapad.cz/datasets/2082ece6991c467295d15718759c5054_0/about), CC0 1.0, upraveno
- [Solné jeskyně v Karlovarském kraji](https://www.datazapad.cz/datasets/197c67d6a8604a78a57335fcabe4b4d2_0/about), CC0 1.0, upraveno
- [Sportovní areály a haly v Karlovarském kraji](https://www.datazapad.cz/datasets/4ce7c8a0d4604d76965b2e3753288ef9_3/about), CC BY 4.0 (uveďte původ), upraveno
- [Startovací vouchery v Karlovarském kraji v roce 2023](https://www.datazapad.cz/datasets/7974da466d594bdea7953f3542ef5ca9_3/about), CC BY 4.0, upraveno
- [Startovací vouchery v Karlovarském kraji v roce 2024](https://www.datazapad.cz/datasets/2ec6469e9f76487f8325504d8313a5f3_3/about), CC BY 4.0, upraveno
- [Stavební úřady v Karlovarském kraji dle katastrálních území](https://www.datazapad.cz/datasets/57a4ac11b4014df7803496c91408ec4e_0/about), CC0 1.0, upraveno
- [Stavební úřady v Karlovarském kraji dle okresů](https://www.datazapad.cz/datasets/5e85e517a5be4765bab75d6803665a2c_0/about), CC0 1.0, upraveno
- [Svazky obcí dle příslušnosti jednotlivých obcí v Karlovarském kraji](https://www.datazapad.cz/datasets/113ff94189844161b0b4b590e155793a_0/about), CC0 1.0, upraveno
- [Turistická informační centra v Karlovarském kraji](https://www.datazapad.cz/datasets/785fbd982147426ca275496791930eb8_0/about), CC BY 4.0, upraveno
- [Ukončené projekty Karlovarského kraje v oblasti rozvoje regionu a územního plánování](https://www.datazapad.cz/datasets/59e913758bea4217b37caaf525459eeb_3/about), CC0 1.0, upraveno
- [Vojenské a pietní památky v Karlovarském kraji](https://www.datazapad.cz/datasets/142875a7b4ba49769393c8a3b80cca6d_3/about), CC BY 4.0, upraveno
- [Výjezdové základny zdravotnické záchranné služby v Karlovarském kraji](https://www.datazapad.cz/datasets/4d7d80fc1d5f4f6bbb61a10b26d2a2aa_0/about), CC0 1.0, upraveno
- [Zařízení školního stravování v Karlovarském kraji](https://www.datazapad.cz/datasets/8476b25d75d54d9cb67356f76eb75450_0/about), CC0 1.0, upraveno
- [ZOO a zooparky v Karlovarském kraji](https://www.datazapad.cz/datasets/52658b60dacf474f80cf5bb7c8004cc6_0/about), CC BY 4.0, upraveno
- [Zvláště chráněná území v Karlovarském kraji](https://www.datazapad.cz/datasets/e7b8fdf0fa334a7ea6e3e235684e8d92_0/about), CC0 1.0, upraveno
- [Zájmová sdružení právnických osob (s obcemi) v Karlovarském kraji](https://www.datazapad.cz/datasets/b073abb685724bb88e1b560fe774edcd_3/about), CC BY 4.0, upraveno
- [Zámky v Karlovarském kraji](https://www.datazapad.cz/datasets/464108d64a93430083119bfb0845af3c_3/about), CC BY 4.0, upraveno
- [Záměr počtu přijímaných uchazečů středních škol v Karlovarském kraji pro školní rok 2024/2025](https://www.datazapad.cz/datasets/6f9302623bcd4a72af2ac674c3b46adf_0/about), CC0 1.0, upraveno
- [Záměr počtu přijímaných uchazečů středních škol v Karlovarském kraji pro školní rok 2025/2026](https://www.datazapad.cz/datasets/b69266abf22c4baa9fabeb437449c1e8_0/about), CC0 1.0, upraveno
- [Záměr počtu přijímaných uchazečů středních škol v Karlovarském kraji pro školní rok 2026/2027](https://www.datazapad.cz/datasets/9332e5a45e0d4dd999bef99a6f51fd40_0/about), CC0 1.0, upraveno
- [Školská poradenská zařízení v Karlovarském kraji](https://www.datazapad.cz/datasets/d3184b2f488f4d099bd56c84ace5ffd0_0/about), CC0 1.1, upraveno

Licenci jednotlivých sad uvádí katalog; u všech sad v repozitáři platí **upraveno** (normalizace sloupců, geometrie a textů pro aplikaci). Podrobnosti u každé sady: [Katalog otevřených dat Karlovarského kraje](https://www.datazapad.cz/search?collection=dataset&layout=grid).

### Další podklady

- [Územní členění — hranice Karlovarského kraje](https://geoportal.kr-karlovarsky.cz/arcgis/rest/services/DTM/Uzemni_cleneni/MapServer/0) — polygon kraje v `frontend/public/data/kvk-boundary.geojson` (podmínky poskytovatele geoportálu KK).
- **Mapbox** — podkladové mapy a geokódování (licence a API dle [Mapbox](https://www.mapbox.com/)); token `VITE_MAPBOX_TOKEN` / `MAPBOX_ACCESS_TOKEN`.
- **Google Places** (volitelné) — recenze míst v panelu mapy; API klíč `REVIEWS_API_KEY`.

## Použití AI

- **OpenAI Realtime API** — hlasový asistent Kairos (dialog, nástroje pro vyhledání v regionálních datech a na mapě).
- **OpenAI Embeddings** (`text-embedding-3-small`) — vektorový index nad normalizovanými záznamy (RAG, nástroj `search_regional_knowledge`).
- **OpenAI Responses / web search** — doplnění aktuálních akcí a událostí, když nestačí otevřená data (`WEB_SEARCH_MODEL`, výchozí `gpt-4.1-mini`).
- Při vývoji byly použity coding asistenty (Cursor); architekturu a nasazení tvoří tým.

## Spuštění

```bash
cp .env.example .env   # VITE_MAPBOX_TOKEN, JWT_SECRET, OPENAI_API_KEY (klíče necommitujte)
docker compose up --build
```

Aplikace: **http://localhost:8080** (nginx, `/api` → FastAPI). API dokumentace: http://localhost:8001/docs.

Ukázkové účty (bez databáze): `kairos` / `posledni-khk`, `operator` / `krakonos-3d`.

### Lokální vývoj bez Dockeru

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install && cp .env.example .env
npm run dev
```

Normalizace dat a sestavení knowledge indexu (při buildu Docker image se index generuje automaticky, pokud je `OPENAI_API_KEY`):

```bash
npm run datazapad:normalize
python scripts/build-knowledge-base.py
```

## Tým

- Pavel Falta ([@PavelFalta](https://github.com/PavelFalta)) – full-stack, data pipeline, asistent
- ([@dosekji1](https://github.com/dosekji1)) – vývoj

## Licence

Kód: [MIT](LICENSE). Ostatní obsah odvozený z otevřených dat: licence příslušných datových sad (viz výše, převážně **CC BY 4.0** a **CC0**).

---
Prototyp z Hackathonu otevřených dat Karlovarského kraje 2026. Není oficiální službou Karlovarského kraje ani KIC KK.
