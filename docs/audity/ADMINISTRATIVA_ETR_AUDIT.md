# Audit modulu „Administrativa a ETŘ“

**Rozsah auditu:** `src/components/PrisonAdministration.tsx` (1637 řádků) a související referenční data v `src/data/questions/vezenskaAdministrativa.ts`, které slouží jako interní „zdroj pravdy“ pro obsahovou správnost (otázky va_01–va_23 k ETŘ a záznamům o DP/KP).
**Metoda:** statická čtená analýza kódu, křížová kontrola generátorů záznamů a ETŘ simulátoru proti vlastní znalostní databázi aplikace (kvízové otázky se zdrojem PGŘ č. 3/2024, NGŘ č. 41/2024, NGŘ č. 24/2022, Pokyn GŘ č. 4/2016).
**Poznámka:** Produkční kód nebyl v rámci tohoto úkolu měněn. Zjištění č. 79 z `AUDIT_REPORT.md` („explicitní `any` na řádku 1197“) se v aktuální verzi souboru nepotvrdilo – řádek obsahuje pouze bezpečnou type-assertion `as 'ČJ' | 'PŘ' | 'TČ'` u `<select>`, žádné `any` se v souboru nenachází. Toto zjištění lze v `AUDIT_REPORT.md` označit za vyřešené/zastaralé.

---

## 1. Analýza duplicitních tlačítek a navigace

Komponenta obsahuje **dvě zcela nezávislé navigační vrstvy**, které se částečně překrývají a řídí tentýž stav `activeSection`:

| Vrstva | Řádky | Tlačítka | Ovládá |
|---|---|---|---|
| **A – Header banner** (uvnitř `bg-gradient-to-r ...` bannerů) | 371–395 | „Generátor záznamů“ (372–382), „ETŘ Trenažér“ (383–393) | pouze `generator` / `etr` |
| **B – Sub-Tabs lišta** | 399–447 | „Generátor & Vzorník záznamů (DP, ZKP, SZ)“ (400–410), „ETŘ: Spisová služba & Číslo jednací“ (412–422), „VIS: Evidence & Lustrace (§ 23a)“ (424–434), „7 pravidel úředního stylu & Kontrola chyb“ (436–446) | `generator` / `etr` / `vis` / `style-rules` |

### Zjištěné problémy

1. **Funkční duplicita (řádky 372–382 vs. 400–410 a 383–393 vs. 412–422).** Obě tlačítka v horní liště volají přesně `setActiveSection('generator')`, resp. `setActiveSection('etr')` – identicky jako první dvě tlačítka v dolní liště. Uživatel tak vidí **dva vizuálně odlišné přepínače pro tentýž přepínač stavu**, což je matoucí (není zřejmé, čím se liší „Generátor záznamů“ nahoře od „Generátor & Vzorník záznamů (DP, ZKP, SZ)“ dole).
2. **Nekonzistentní pojmenování stejné akce** – „ETŘ Trenažér“ (řádek 392) vs. „ETŘ: Spisová služba & Číslo jednací“ (řádek 421) popisují stejnou sekci odlišně dlouhými, odlišně formulovanými popisky.
3. **Neúplnost horní vrstvy** – vrstva A pokrývá jen 2 ze 4 sekcí (`vis` a `style-rules` nejsou z headeru dosažitelné vůbec), takže nejde o alternativní/rychlý přístup ke všem sekcím, ale o neúplnou, redundantní podmnožinu vrstvy B.
4. **Duplicitní ikony** – `FileText` a `FolderOpen` z `lucide-react` se vykreslují 2×, jednou v každé vrstvě (řádky 380, 391, 408, 420), zbytečně navyšuje DOM a JSX komponenty bez přínosu.
5. **Dopad na responzivitu** – viz bod 4.1 níže; kontejner vrstvy A (řádek 371, `flex items-center gap-2 shrink-0`) nemá na rozdíl od vrstvy B (`overflow-x-auto`, řádek 399) žádnou ochranu proti přetečení na malých telefonech.

### Návrh řešení

Sloučit obě vrstvy do **jediné moderní segmented-control lišty** se 4 položkami (viz kompletní návrh kódu v sekci 5), header banner ponechat čistě informativní (nadpis + popis, bez akčních tlačítek).

---

## 2. Kontrola odborné přesnosti a obsahu (VS ČR praxe)

### 2.1 Generátor „Záznam o použití donucovacího prostředku“ (šablona `dp`, řádky 48–79, formulář 519–796)

**Pozitivní zjištění:** Povinná pole части první (řádek 54: `officer, dutyOrder, targetPerson, targetCode, datetimePlace, precedingEvents, officerAction, targetBehavior, dpUsedDetails, injuryDamage, firstAid, medicalExam, bossInformed, photoDoc, evaluation`) **odpovídají** vlastní referenční databázi aplikace (otázka `va_11` v `vezenskaAdministrativa.ts`, řádky 177–188), včetně požadavku na doslovnou citaci zákonné výzvy a grafické znázornění zasažených míst těla (implementováno jako interaktivní chips, řádky 618–661).

**🔴 Kritický obsahový nedostatek – chybí „Část druhá“ záznamu.** Vlastní znalostní báze aplikace (`va_12`, řádky 194–206) výslovně učí, že Záznam o použití DP dle Přílohy k PGŘ č. 3/2024 má **dvě části**:
- Část první – skutkový popis zákroku (to generátor obsahuje),
- **Část druhá – stanovisko vedoucího oddělení, zpráva o prošetření okolností zpracovaná 1. zástupcem ředitele věznice (1. ZŘV) a závazné rozhodnutí ředitele věznice o oprávněnosti a přiměřenosti zákroku.**

Generátor (`buildRecordText`, řádky 242–266) i formulář vůbec neobsahují pole pro Část druhou. Pole `evaluation` (řádek 786: *„Vyhodnocení použití DP (oprávněnost, účel, umístění po zákroku)“*) navíc **zavádí uživatele mylně** – text sugeruje, že o oprávněnosti a účelu rozhoduje sám zakročující příslušník, zatímco dle vlastního zdroje aplikace jde o **závazné rozhodnutí ředitele věznice** na základě stanoviska vedoucího oddělení a zprávy 1. ZŘV. Pro nástroj, který se má používat jako příprava na ústní/písemnou zkoušku ZOP (viz metodická poznámka na řádcích 1108–1116), jde o věcnou nepřesnost s rizikem naučení chybného postupu.
- *Doporučení:* Doplnit blok „Část druhá“ (pole `departmentHeadOpinion`, `zrvInvestigationReport`, `directorDecision`) nebo alespoň textovou poznámku, že pole `evaluation` je pouze podkladové hodnocení zakročujícího příslušníka a že závazné rozhodnutí činí ředitel věznice.

**🟡 Nesoulad formátu vzorového čísla jednacího.** Výchozí `defaultData.refNumber` pro šablonu `dp` (řádek 58): `'VS-1234/ČJ-2024-801345'` má strukturu `ORG-SPIS/TYP-ROK-OJKÓD` (5 segmentů). To je v rozporu s:
- vlastní ETŘ simulátorem téže komponenty (`fullGeneratedCj`, řádek 304): `${cjOrg}-${cjSpisNumber}-${cjDocNumber}/${cjSpisType}-${cjYear}-${cjOrgCode}...`, tedy `ORG-SPIS-DOK/TYP-ROK-OJKÓD[-EXT]`,
- funkcí `generateCJ()` (řádky 176–183), která **správně** generuje `VS-${seq}-1/ČJ-${year}-80${sub}-${num}` (7 segmentů vč. čísla dokumentu a rozlišení),
- vlastní znalostní databází aplikace (`va_01`, řádky 8–19): *„VS – [pořadové číslo spisu] – [pořadové číslo dokumentu] / [typ spisu] – [rok] – [kód OJ 80XXXX] – [další rozlišení]“*.

Vzorovému záznamu tedy chybí segment „pořadové číslo dokumentu“ – student, který se podle vzoru učí správný tvar Č.j., dostane nekonzistentní vzor oproti tomu, co stejná aplikace o pár řádků/sekci dále učí jako závazné pravidlo.
- *Doporučení:* Sjednotit `defaultData.refNumber` na plný formát (`VS-1234-1/ČJ-2024-801345-VYS`), případně vzorové Č.j. generovat přímo funkcí odpovídající logice `generateCJ()`/ETŘ tabu.

**🟡 `generateCJ()` napevno nastavuje typ spisu na „ČJ“ pro všechny šablony.** Tlačítko „Generovat Č.j.“ (řádky 539–547) je dostupné jen ve formuláři DP, ale kdyby se stejná logika rozšířila i na `zkp` (kázeňský přestupek), typ „ČJ“ neodpovídá vlastnímu pravidlu hierarchie spisů popsanému tamtéž v ETŘ sekci (řádky 1246–1250: `ČJ → PŘ → TČ`) – kázeňský přestupek koncepčně spadá pod „PŘ“. Aktuálně to není chyba (funkce se používá jen pro DP), ale je to skryté riziko při budoucím rozšíření generátoru.

### 2.2 Generátor „Záznam o kázeňském přestupku“ (šablona `zkp`, řádky 81–98)

Struktura odpovídá interní referenci: povinnost uvést porušení **§ 28 zákona č. 169/1999 Sb.** (nikoli jen Vnitřní řád), doslovnou citaci vyjádření odsouzeného a důkazní prostředky – to vše je 1:1 procvičováno i v tréninkovém cvičení „Cvičení 2: Kázeňský přestupek“ (řádky 320–330), kde jsou přesně tytéž chyby (chybějící § 28, chybějící uvozovky u přímé řeči, chybějící záznam o odmítnutí podpisu/vyjádření) správně vysvětleny. **Obsahově v pořádku, žádný rozpor nenalezen.**

### 2.3 „Služební záznam“, „Odnětí věci“, „Fyzické násilí“ (šablony `sz`, `odneti`, `nasilie`, řádky 100–152)

Povinná pole a vzorové texty korespondují s právními odkazy uvedenými v `normReference` (§ 12 zákona č. 555/1992 Sb. pro odnětí věci, NGŘ č. 24/2022 pro násilí) i s odpovídajícími otázkami v `vezenskaAdministrativa.ts` (řádky 296–309 pro NGŘ 24/2022). Bez zásadních věcných výhrad.

### 2.4 Simulátor tvorby ČJ v ETŘ (řádky 1124–1319)

Křížová kontrola vůči vlastní databázi (`va_01`–`va_20`) potvrzuje, že **vysvětlivky odpovídají realitě spisového řádu** aplikace beze zbytku:

| Tvrzení v komponentě | Řádek | Shoda s `vezenskaAdministrativa.ts` |
|---|---|---|
| Struktura ČJ `ORG-SPIS-DOK/TYP-ROK-OJKÓD-EXT` | 304, 1149 | ✅ shoduje se s `va_01` |
| Nejdůležitější krok = přiřadit zpracovatele přes „Přiděleno“ | 1236–1240 | ✅ shoduje se s `va_02` |
| Hierarchie změny typu spisu jen `ČJ → PŘ → TČ` | 1246–1250 | ✅ shoduje se s `va_03` |
| Pravidlo slučování spisů (TČ nelze do ČJ, opačně ano) | 1299–1302 | ✅ shoduje se s `va_04` |
| Zákaz klikání na „ZAMKNOUT“ při běžné editaci | 1256–1260 | ✅ shoduje se s `va_20` |
| Skartační znaky S / V / A a nutnost nejdřív přehodnotit „V“ | 1309–1312 | ✅ shoduje se s `va_06` a druhou otázkou o skartaci |

Jediná nepřesnost dotýkající se ETŘ je tedy nepřímá – popsaný formátový nesoulad vzorového `refNumber` v generátoru DP (bod 2.1). Samotný simulátor a jeho vysvětlivky jsou věcně správné a interně konzistentní.

---

## 3. Analýza funkčnosti a stavu (React logika)

### 3.1 Ukládání rozpracovaných konceptů – **chybí zcela**

V celém souboru není žádné volání `localStorage`, `sessionStorage` ani `useEffect` (ověřeno greppem). Veškerý stav (`formData`, `selectedBodyParts`, ETŘ vstupy, cvičení) žije jen v paměti komponenty. Důsledky:
- Obnovení stránky, přepnutí sekce v nadřazené navigaci `App.tsx` (pokud dochází k unmountu) nebo pád prohlížeče **nenávratně smaže rozepsaný záznam**, ačkoliv formulář DP má 15 povinných polí a reálně se do něj bude psát dlouhý text.
- Neexistuje žádný „Uložit koncept“ / auto-save mechanismus, přestože jde o nástroj myšlený k opakovanému procvičování psaní úředních záznamů.
- *Doporučení:* `useEffect` s debounced zápisem `formData` + `selectedTemplateId` do `localStorage`, s obnovením při mountu (per `selectedTemplateId`, aby se konceptu nekřížily mezi šablonami).

### 3.2 Validace povinných polí – **deklarovaná, ale mrtvá**

- Typ `RecordTemplate` definuje `mandatoryFields: string[]` (řádek 44) a každá šablona toto pole vyplňuje (54, 86, 105, 123, 141).
- Existuje state `showValidation` (řádek 163), který se nastavuje na `false` při přepnutí šablony (`handleSelectTemplate`, řádek 209) – **ale nikdy není nastaven na `true`** a nikde v JSX není čten ani použit.
- Vizuálně „povinná“ pole mají natvrdo zapsanou třídu `border-red-300 dark:border-red-900/60` (např. řádky 530, 563, 577…) **bez ohledu na to, zda je pole skutečně vyplněné** – červený rámeček je jen statický design, nikoli reálná validace.
- `handleCopyRecord` (223–229) i `handlePrint` (231–234) spouští export/tisk okamžitě, bez jakékoli kontroly, zda jsou `mandatoryFields` z aktuální šablony vyplněná. Lze tedy zkopírovat/vytisknout záznam s prázdnými povinnými poli (v `buildRecordText` se prázdná pole jen tiše nahradí `''`, řádky 243–301).
- *Důsledek:* `mandatoryFields` je v praxi nepoužívaná (dead) datová struktura – buď ji reálně zapojit do validace (zvýraznit skutečně prázdná povinná pole, zablokovat/varovat před kopírováním), nebo ji z modelu odstranit, aby nepůsobila zavádějícím dojmem funkční validace.

### 3.3 Kopírování a tisk

- `handleCopyRecord` používá `navigator.clipboard.writeText(...)` **bez `.catch`** – v nezabezpečeném kontextu (`http://`), starším prohlížeči nebo bez oprávnění clipboard API tiše selže a uživatel dostane vizuální potvrzení „Zkopírováno!“ (`copiedSuccess`), i když se ve skutečnosti nic nezkopírovalo, protože stav se nastavuje synchronně bez čekání na resolve promisy... ve skutečnosti je nastaven uvnitř `.then()`-like řetězce jen u `copyCJ` (řádky 185–192), zatímco `handleCopyRecord` nastavuje `setCopiedSuccess(true)` **hned**, mimo `.then()` (řádky 223–226) – tedy potvrzovací UI se zobrazí bez ohledu na to, zda `writeText` skutečně uspělo.
- `handlePrint` volá čistě `window.print()` (řádek 232) nad **celou aplikací** – neexistuje žádné dedikované `@media print` pravidlo ani tisková komponenta, která by vytiskla jen náhled dokumentu (pravý panel, řádky 1102–1105). Výsledný tisk tak pravděpodobně obsahuje i levý formulář, navigaci, header banner atd., což je v přímém rozporu s účelem tlačítka „Tisk / PDF“ (řádek 1094).

### 3.4 Zbytečné re-rendery a chybějící memoizace

- `STYLE_EXERCISES` (řádky 307–331) je pole objektů definované **uvnitř funkce komponenty** – vytváří se znovu při každém renderu, ačkoliv je to statický obsah (na rozdíl od `RECORD_TEMPLATES`, které je správně mimo komponentu na řádku 47).
- Pole 12 částí těla pro DP formulář (inline literal, řádky 630–643) se rovněž vytváří znovu při každém renderu uvnitř JSX.
- Žádný `useMemo`/`useCallback` v celém souboru (potvrzeno greppem) – `buildRecordText()` (velký řetězcový switch, 241–302) se přepočítává při každém stisku klávesy v libovolném poli aktivní šablony, což je při formuláři DP s ~15 kontrolovanými poli zbytečná, byť dnes ještě ne kriticky pomalá, práce. Toto zjištění je konzistentní s již existujícím zjištěním v `AUDIT_REPORT.md` (řádek 41: *„PrisonAdministration.tsx: Potential unnecessary re-renders“*).
- *Doporučení:* přesunout `STYLE_EXERCISES` a seznam částí těla na modulovou úroveň (vedle `RECORD_TEMPLATES`), obalit `buildRecordText` do `useMemo` závislého na `formData`, `selectedTemplateId`, `selectedBodyParts`.

### 3.5 Chybějící/nedotažený reset formuláře

- `handleResetToDefault` (236–239) **nemaže** formulář do prázdna – vrací jen ukázková demo data (`currentTemplate.defaultData`). Uživatel, který chce vyplnit **svůj vlastní** reálný záznam, nemá žádné tlačítko „Vyčistit formulář“ – musí ručně smazat text ve všech polích.
- Reset nevynuluje `copiedSuccess` ani neresetuje případně zobrazenou validaci (byť ta je stejně nefunkční – viz 3.2), a proběhne bez potvrzovacího dialogu, takže rozepsaná úprava reálných dat se nevratně přepíše ukázkovým vzorem jedním klikem (řádky 501–507).

---

## 4. Responzivita na tabletech a mobilech

| Prvek | Řádek(y) | Problém |
|---|---|---|
| Řádek tlačítek v header banneru | 371–395 (`<div className="flex items-center gap-2 shrink-0">`) | Bez `flex-wrap` i bez `overflow-x-auto` (na rozdíl od navigace níže). Dvě tlačítka s ikonou a delším textem („Generátor záznamů“, „ETŘ Trenažér“) se na displejích ~320–360 px šířky (starší/menší telefony) mohou začít ořezávat nebo tisknout mimo kartu banneru. Řeší se automaticky sloučením do jediné segmented-control lišty (sekce 5). |
| Sub-Tabs lišta | 399 (`overflow-x-auto`) + `whitespace-nowrap` na všech 4 tlačítkách | Funkčně nepadá, ale na mobilu se poslední 2 položky („VIS…“, „7 pravidel…“) často schovají mimo viditelnou oblast bez jakékoli vizuální nápovědy (žádný stínový/šipkový indikátor), že lze scrollovat vodorovně – nízká objevitelnost, typický anti-pattern horizontálního tab-scrolleru. |
| ETŘ segmenty čísla jednacího | 1158 (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`) | Na mobilu (2 sloupce) jsou popisky jako „6. Kód OJ (80XXXX)“ vedle úzkého vstupního pole dost stísněné a zalamují se na 2 řádky – nejde o horizontální scroll, ale o vizuální nepohodlí; doporučeno `grid-cols-1 xs:grid-cols-2` nebo skupinu rozdělit na dva řádky po 3. |
| Náhled dokumentu | 1103 (`max-h-[750px] overflow-y-auto`) | Fixní max-výška 750 px na tabletu na výšku (portrait, menší výška okna s adresním řádkem) může zabírat většinu viewportu; funguje (vertikální scroll), ale doporučeno nahradit responzivní `max-h-[60vh] lg:max-h-[750px]`. |

**Pozitivní zjištění:** V souboru nebyly nalezeny žádné `<table>` elementy ani pevné `w-[...px]`/`min-w-[...px]` třídy mimo výše uvedené `max-h`, takže mimo dvou navigačních lišt **nehrozí systémový horizontální scroll** zbytku modulu – formulářové mřížky (`grid-cols-1 sm:grid-cols-2/3`) jsou navrženy mobile-first korektně.

---

## 5. Návrh refaktorovaného kódu – sloučení duplicitních tlačítek

Níže uvedený návrh nahrazuje **oba** bloky (řádky 371–395 a 399–447) jedinou segmentovanou lištou o 4 položkách, která se vejde na mobil bez horizontálního scrollu (`grid-cols-2` na mobilu → `sm:grid-cols-4` od tabletu výš) a řeší zároveň problém z bodu 4 (žádná skrytá položka mimo viewport).

**1. Konfigurace sekcí** (umístit k modulové konstantě `RECORD_TEMPLATES`, mimo tělo komponenty):

```tsx
interface NavSection {
  id: AdminSection;
  label: string;      // plný popisek pro title/aria
  shortLabel: string;  // krátký popisek do chipu
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'generator',    label: 'Generátor záznamů (DP, ZKP, SZ)',              shortLabel: 'Generátor záznamů',     icon: FileText },
  { id: 'etr',          label: 'ETŘ: Spisová služba & Číslo jednací',          shortLabel: 'ETŘ Trenažér',          icon: FolderOpen },
  { id: 'vis',          label: 'VIS: Evidence & Lustrace (§ 23a)',             shortLabel: 'VIS Evidence',          icon: Search },
  { id: 'style-rules',  label: '7 pravidel úředního stylu & Kontrola chyb',    shortLabel: 'Styl & kontrola chyb',  icon: Sparkles },
];
```

**2. Náhrada JSX** – v headeru (řádky 356–396) odstranit celý blok tlačítek (řádky 371–395) a header ponechat čistě informativní; blok „Navigation Sub-Tabs“ (řádky 398–447) nahradit jedinou segmented-control komponentou:

```tsx
{/* Header Banner – pouze informativní, bez akčních tlačítek */}
<div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
  <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
  <div className="relative z-10 space-y-2">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 border border-amber-300/30 text-amber-200 text-xs font-bold uppercase tracking-wider">
      <FileText className="w-3.5 h-3.5" />
      <span>Vězeňská administrativa & ETŘ</span>
    </div>
    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
      Spisová služba, tiskopisy & informační systémy VS ČR
    </h1>
    <p className="text-amber-100 text-sm max-w-3xl leading-relaxed">
      Interaktivní trenažér elektronické spisové služby ETŘ (pokyn GŘ č. 4/2016), generátor povinných úředních záznamů
      (PGŘ č. 3/2024, NGŘ č. 41/2024 a NGŘ č. 24/2022) a metodika informačního systému VIS.
    </p>
  </div>
</div>

{/* Jediná segmentovaná navigace – nahrazuje obě původní duplicitní lišty */}
<div
  role="tablist"
  aria-label="Sekce modulu Administrativa a ETŘ"
  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
>
  {NAV_SECTIONS.map(({ id, label, shortLabel, icon: Icon }) => {
    const isActive = activeSection === id;
    return (
      <button
        key={id}
        role="tab"
        aria-selected={isActive}
        title={label}
        onClick={() => setActiveSection(id)}
        className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isActive
            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{shortLabel}</span>
      </button>
    );
  })}
</div>
```

### Přínosy tohoto refaktoru

1. **Jedno místo pravdy** pro navigaci – žádné dva odlišně pojmenované ovladače téhož stavu.
2. **Mobilní responzivita bez horizontálního scrollu** – `grid-cols-2` na mobilu zobrazí všechny 4 položky vždy viditelně (žádná skrytá karta jako dosud u `overflow-x-auto` lišty).
3. **Přístupnost** – přidány `role="tablist"`/`role="tab"`/`aria-selected`, které v původním kódu chyběly úplně.
4. **Menší JSX/DOM** – odstraňuje ~75 řádků duplicitního kódu a 2 zbytné instance ikon `FileText`/`FolderOpen`.
5. **Snazší rozšiřitelnost** – přidání páté sekce znamená jeden řádek v `NAV_SECTIONS`, nikoli úpravu dvou samostatných bloků JSX.

---

## Shrnutí priorit

| Priorita | Zjištění | Sekce |
|---|---|---|
| 🔴 Kritická | Chybí „Část druhá“ Záznamu o DP (stanovisko, zpráva 1. ZŘV, rozhodnutí ředitele) a zavádějící pole `evaluation` | 2.1 |
| 🔴 Kritická | Validace (`mandatoryFields`, `showValidation`) je zcela nefunkční mrtvý kód – lze generovat/tisknout prázdné povinné záznamy | 3.2 |
| 🟠 Vysoká | Duplicitní přepínací tlačítka (header vs. sub-tabs) | 1, 5 |
| 🟠 Vysoká | Chybí ukládání rozpracovaných konceptů (žádný localStorage/persist) | 3.1 |
| 🟡 Střední | `handlePrint` tiskne celou aplikaci místo náhledu dokumentu; `handleCopyRecord` ignoruje chybu clipboard API | 3.3 |
| 🟡 Střední | Nesoulad formátu vzorového Č.j. (`defaultData.refNumber`) vůči vlastní ETŘ logice a znalostní databázi | 2.1 |
| 🟢 Nízká | Chybějící memoizace (`STYLE_EXERCISES`, seznam částí těla, `buildRecordText`) | 3.4 |
| 🟢 Nízká | Drobné responzivní doladění ETŘ mřížky a výšky náhledu | 4 |
