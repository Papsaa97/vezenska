import { Question } from '../../types';

export const vezenskaAdministrativaQuestions: Question[] = [
  {
    id: 'va_01',
    subject: 'Vězeňská administrativa',
    topic: 'Elektronická spisová služba ETŘ',
    question: 'Jaká je správná struktura čísla jednacího (ČJ) v informačním systému ETŘ?',
    answer: 'VS - [pořadové číslo spisu] - [pořadové číslo dokumentu] / [typ spisu] - [rok] - [kód organizační jednotky 80XXXX] - [další rozlišení]',
    options: [
      'VS - [pořadové číslo spisu] - [pořadové číslo dokumentu] / [typ spisu] - [rok] - [kód organizační jednotky 80XXXX] - [další rozlišení]',
      'VS - [kód organizační jednotky 80XXXX] - [rok] / [pořadové číslo spisu] - [typ spisu] - [oddělení/útvar] - [číslo dokumentu]',
      'ČJ - [pořadové číslo spisu] / [typ spisu] - [kód organizační jednotky 80XXXX] - [rok] - [pořadové číslo dokumentu] - [jméno zpracovatele]',
      'VS - [typ spisu] - [pořadové číslo dokumentu] / [pořadové číslo spisu] - [datum zápisu DDMMRRRR] - [kód organizační jednotky 80XXXX]'
    ],
    correctOption: 0,
    rationale: 'Dle metodiky ETŘ má číslo jednací strukturu: Označení organizace (VS) – Pořadové číslo spisu – Pořadové číslo dokumentu v rámci spisu / Typ spisu (ČJ/PŘ/TČ) – Rok – Šestimístný numerický kód organizace (80XXXX) – Další volitelný rozlišující údaj (např. LOG/02).',
    source: 'Pokyn GŘ č. 4/2016 o spisové službě'
  },
  {
    id: 'va_02',
    subject: 'Vězeňská administrativa',
    topic: 'Elektronická spisová služba ETŘ',
    question: 'Jaký je 1. nejdůležitější úkol zpracovatele bezprostředně při založení spisu v ETŘ a proč?',
    answer: 'Přidělit spis zpracovateli přes záložku „Přiděleno“ (nebo volbou při zakládání), protože bez určeného zpracovatele vidí spis všichni uživatelé organizační jednotky',
    options: [
      'Přidělit spis zpracovateli přes záložku „Přiděleno“ (nebo volbou při zakládání), protože bez určeného zpracovatele vidí spis všichni uživatelé organizační jednotky',
      'Okamžitě zaškrtnout volbu „ZAMKNOUT“, protože bez uzamčení nemůže podatelna dokument doručit do centrální evidence Generálního ředitelství',
      'Přiřadit spisu skartační znak „A“ a lhůtu 50 let v záložce „Skartace“, aby byl spis chráněn proti neoprávněnému smazání jinými referenty',
      'Odeslat spis ke schválení do schvalovacího workflow vedoucímu oddělení, protože do schválení nelze do spisu vložit žádný vložený dokument'
    ],
    correctOption: 0,
    rationale: 'Určení zpracovatele přes záložku „Přiděleno“ je klíčový krok. Není-li určen zpracovatel spisu, uvidí spis všichni příslušníci a zaměstnanci z dané OJ. Po přidělení jej vidí zpracovatel a jeho vedoucí.',
    source: 'Příručka ETŘ – Založení spisu'
  },
  {
    id: 'va_03',
    subject: 'Vězeňská administrativa',
    topic: 'Elektronická spisová služba ETŘ',
    question: 'V jaké hierarchii je v systému ETŘ povoleno provádět změnu typu spisu?',
    answer: 'Pouze vzestupně: Číslo jednací (ČJ) → Přestupek (PŘ) → Trestný čin (TČ)',
    options: [
      'Pouze vzestupně: Číslo jednací (ČJ) → Přestupek (PŘ) → Trestný čin (TČ)',
      'Pouze sestupně: Trestný čin (TČ) → Přestupek (PŘ) → Číslo jednací (ČJ), pokud se nepotvrdí podezření ze spáchání deliktu',
      'Libovolně v obou směrech (ČJ ↔ PŘ ↔ TČ) podle aktuálního procesního stavu vyšetřování na základě rozhodnutí referenta',
      'Pouze přímým převodem: Číslo jednací (ČJ) → Trestný čin (TČ), přičemž typ Přestupek (PŘ) se v systému ETŘ eviduje v samostatném modulu'
    ],
    correctOption: 0,
    rationale: 'Ke změně typu spisu může dojít výhradně v hierarchii ČJ → Přestupek → Trestný čin (nikoli v obráceném pořadí). Zpětnou změnu může pouze ve zcela výjimečných případech provést administrátor.',
    source: 'Metodika ETŘ v kostce'
  },
  {
    id: 'va_04',
    subject: 'Vězeňská administrativa',
    topic: 'Elektronická spisová služba ETŘ',
    question: 'Jaká pravidla platí v ETŘ pro slučování spisů?',
    answer: 'Spis TČ nelze sloučit do spisu ČJ, naopak sloučení spisu ČJ do spisu TČ je povoleno (vyšší typ je důležitější)',
    options: [
      'Spis TČ nelze sloučit do spisu ČJ, naopak sloučení spisu ČJ do spisu TČ je povoleno (vyšší typ je důležitější)',
      'Spis vyššího typu (TČ nebo PŘ) lze vždy sloučit do spisu nižšího typu (ČJ), pokud byl spis ČJ založen v časovém pořadí jako první',
      'Při sloučení dvou spisů systém vždy automaticky vygeneruje nové ČJ a původní osoby, věci a vložené dokumenty ze sloučeného spisu nenávratně odstraní',
      'Slučování spisů různých typů je v ETŘ zcela vyloučeno a spisy lze slučovat pouze tehdy, mají-li shodného zpracovatele i schvalovatele'
    ],
    correctOption: 0,
    rationale: 'Slučování se provádí, pokud věc dorazí do úřadu více cestami. Platí striktní pravidlo, že spis trestního řízení (TČ) se nesmí slučovat do spisu ČJ, zatímco sloučení ČJ do TČ je povoleno.',
    source: 'Metodika ETŘ v kostce'
  },
  {
    id: 'va_05',
    subject: 'Vězeňská administrativa',
    topic: 'Elektronická spisová služba ETŘ',
    question: 'Co v systému ETŘ znamená a k čemu slouží tzv. „Sběrný arch“?',
    answer: 'Jedno číslo jednací (ČJ) vedené na celý kalendářní rok pro evidenci jednoduchých dokumentů (např. žádosti o dovolenou, zápisy z porad)',
    options: [
      'Jedno číslo jednací (ČJ) vedené na celý kalendářní rok pro evidenci jednoduchých dokumentů (např. žádosti o dovolenou, zápisy z porad)',
      'Centrální přehled všech trestních spisů (TČ) vedených v daném kalendářním roce pro potřeby předávání informací GIBS a Policii ČR',
      'Elektronický protokol generovaný systémem při skartačním řízení, do kterého se zapisují vyřazené spisy se skartační lhůtou kratší než 5 let',
      'Záznam o oběhu utajovaného dokumentu mezi jednotlivými organizačními jednotkami VS ČR podléhající režimu zákona č. 412/2005 Sb.'
    ],
    correctOption: 0,
    rationale: 'Sběrný arch představuje jedno ČJ na celý rok určené pro jednoduché a opakující se agendy (dovolenky, provozní zápisy). Pokud je věc procesně složitější, zakládá se pro ni samostatné ČJ.',
    source: 'Metodika ETŘ v kostce'
  },
  {
    id: 'va_06',
    subject: 'Vězeňská administrativa',
    topic: 'Elektronická spisová služba ETŘ',
    question: 'Jaký je postup při skartačním řízení v ETŘ a jak se zachází se skartačním znakem „V“?',
    answer: 'Systém uživatele upozorní, že před výběrem dokumentů se znakem „S“ (stoupa/skartace) musí nejprve přehodnotit skupinu dokumentů se znakem „V“ (výběr na trvalé uložení nebo skartaci)',
    options: [
      'Systém uživatele upozorní, že před výběrem dokumentů se znakem „S“ (stoupa/skartace) musí nejprve přehodnotit skupinu dokumentů se znakem „V“ (výběr na trvalé uložení nebo skartaci)',
      'Dokumenty se znakem „V“ se automaticky při spuštění skartačního modulu převedou do kategorie „S“ a bez posouzení komisí se vymažou ze serveru',
      'Skartační znak „V“ označuje dokumenty trvalé hodnoty (Věčný archiv), které se bez výběrového řízení ihned fyzicky předávají Národnímu archivu',
      'Zpracovatel spisu má oprávnění sám dokumenty se znakem „V“ skartovat přímým smazáním ze systému bez nutnosti vyhotovení skartačního návrhu'
    ],
    correctOption: 0,
    rationale: 'Při skartačním řízení v ETŘ systém hlídá, aby byla nejprve přehodnocena skupina dokumentů se skartačním znakem „V“ (výběr), která se rozdělí na „A“ (archiv) nebo „S“ (skartace). Skartační návrh schvaluje skartační komise a archiv.',
    source: 'Metodika ETŘ v kostce'
  },
  {
    id: 'va_07',
    subject: 'Vězeňská administrativa',
    topic: 'Kázeňské řízení a záznam o KP',
    question: 'Kdo podle § 16 NGŘ č. 41/2024 může zpracovat záznam o kázeňském přestupku vězněné osoby a v jaké lhůtě?',
    answer: 'Kterýkoliv zaměstnanec VS ČR (i jiná osoba podílející se na plnění úkolů), zpravidla v den spáchání nebo v den, kdy se o něm dozvěděl',
    options: [
      'Kterýkoliv zaměstnanec VS ČR (i jiná osoba podílející se na plnění úkolů), zpravidla v den spáchání nebo v den, kdy se o něm dozvěděl',
      'Výhradně příslušník vězeňské stráže ve směnném provozu, a to nejpozději do 24 hodin od ukončení mimořádné události',
      'Pouze ředitel věznice nebo jím písemně pověřený vedoucí oddělení výkonu vazby a trestu ve lhůtě do 30 dnů od zjištění skutku',
      'Výhradně speciální pedagog nebo vychovatel oddílu po předchozím projednání s psychologem věznice, nejpozději do 5 pracovních dnů'
    ],
    correctOption: 0,
    rationale: 'Dle § 16 odst. 1 a 2 NGŘ č. 41/2024 může záznam o kázeňském přestupku sepsat kterýkoliv zaměstnanec VS ČR nebo jiná podílející se osoba, pokud k nápravě nepostačí domluva nebo výzva. Sepisuje se zpravidla v den spáchání či zjištění.',
    source: 'NGŘ č. 41/2024 § 16'
  },
  {
    id: 'va_08',
    subject: 'Vězeňská administrativa',
    topic: 'Kázeňské řízení a záznam o KP',
    question: 'Jaké povinné náležitosti musí obsahovat část „Popis skutku“ v záznamu o kázeňském přestupku?',
    answer: 'Přesné určení času a místa, způsob spáchání, vylíčení průběhu s uvedením porušené zákonné povinnosti (§ 28 zákona č. 169/1999 Sb.) a seznam svědků',
    options: [
      'Přesné určení času a místa, způsob spáchání, vylíčení průběhu s uvedením porušené zákonné povinnosti (§ 28 zákona č. 169/1999 Sb.) a seznam svědků',
      'Rámcové časové období, obecné konstatování porušení vnitřního řádu bez citace zákona a návrh konkrétního kázeňského trestu zpracovatelem',
      'Právní kvalifikaci dle trestního zákoníku, podpis státního zástupce, výpis z rejstříku trestů a otisky prstů podezřelého odsouzeného',
      'Subjektivní hodnocení chování odsouzeného za celé období výkonu trestu, stanovisko psychologa oddělení a souhlas dozorčího orgánu'
    ],
    correctOption: 0,
    rationale: 'Dle NGŘ č. 41/2024 musí popis skutku obsahovat přesný čas, přesné místo, způsob spáchání, vylíčení průběhu s konkrétním porušením zákonné povinnosti (např. § 28 odst. 1, 2, 3 z. č. 169/1999 Sb.), popř. VŘV, a seznam svědků.',
    source: 'NGŘ č. 41/2024 § 16'
  },
  {
    id: 'va_09',
    subject: 'Vězeňská administrativa',
    topic: 'Kázeňské řízení a záznam o KP',
    question: 'Jakým způsobem se do záznamu o kázeňském přestupku zaznamenává vyjádření podezřelého odsouzeného?',
    answer: 'Zpravidla v přímé řeči sepsané zpracovatelem (doslovně) nebo umožněním vlastnoručního vyjádření v tiskopisu',
    options: [
      'Zpravidla v přímé řeči sepsané zpracovatelem (doslovně) nebo umožněním vlastnoručního vyjádření v tiskopisu',
      'Výhradně volnou parafrází zpracovatele ve 3. osobě s vynecháním vulgarismů a subjektivních námitek odsouzeného',
      'Vyjádření se do záznamu nezapisuje, protože odsouzený se vyjadřuje až při ústním projednání před disciplinární komisí',
      'Pouze audiozáznamem na služební diktafon za povinné přítomnosti obhájce odsouzeného nebo nestranného svědka z řad vězňů'
    ],
    correctOption: 0,
    rationale: 'Dle § 16 odst. 5 NGŘ č. 41/2024 sepíše zpracovatel vyjádření podezřelého zpravidla ještě týž den v přímé řeči, anebo mu umožní se v tiskopisu vyjádřit vlastnoručně.',
    source: 'NGŘ č. 41/2024 § 16'
  },
  {
    id: 'va_10',
    subject: 'Vězeňská administrativa',
    topic: 'Záznam o použití donucovacích prostředků',
    question: 'Jak přesně zní zákonná výzva příslušníka před použitím donucovacího prostředku dle § 6 odst. 3 písm. b) zákona č. 555/1992 Sb.?',
    answer: '„Jménem zákona, vyzývám Vás, zanechte svého protiprávního jednání nebo proti Vám bude použito donucovacích prostředků.“',
    options: [
      '„Jménem zákona, vyzývám Vás, zanechte svého protiprávního jednání nebo proti Vám bude použito donucovacích prostředků.“',
      '„Jménem zákona, stůjte, nebo použiji donucovacích prostředků a služební zbraně!“',
      '„Jménem republiky Vás vyzývám k okamžitému upuštění od útoku, jinak bude použito fyzické síly a chvatů sebeobrany.“',
      '„Vězeňská služba, z moci úřední Vás vyzývám, upusťte od protiprávního jednání, jinak budou použita donucovací opatření.“'
    ],
    correctOption: 0,
    rationale: 'Zákonná výzva dle § 6 odst. 3 písm. b) zákona č. 555/1992 Sb. musí být v záznamu o použití DP přesně a doslovně citována: „Jménem zákona, vyzývám Vás, zanechte svého protiprávního jednání nebo proti Vám bude použito donucovacích prostředků.“',
    source: '§ 6 odst. 3 písm. b) z. č. 555/1992 Sb.'
  },
  {
    id: 'va_11',
    subject: 'Vězeňská administrativa',
    topic: 'Záznam o použití donucovacích prostředků',
    question: 'Která pole a údaje jsou v části první Záznamu o použití DP (příloha k PGŘ č. 3/2024) povinná?',
    answer: 'Č. rozkazu k velení do služby, datum, čas a místo, co předcházelo (domluva, výzva vč. citace), jednání vězněného, přesný popis použitého DP, zranění/škoda, první pomoc, lékařské ošetření, fotodokumentace a grafické vyznačení zasažených míst',
    options: [
      'Č. rozkazu k velení do služby, datum, čas a místo, co předcházelo (domluva, výzva vč. citace), jednání vězněného, přesný popis použitého DP, zranění/škoda, první pomoc, lékařské ošetření, fotodokumentace a grafické vyznačení zasažených míst',
      'Pouze datum a čas zákroku, jméno velitele směny, typ použitého donucovacího prostředku a konečné rozhodnutí ředitele věznice o oprávněnosti',
      'Číslo jednací spisu ETŘ, seznam všech přítomných vězněných osob na oddíle a záznam o provedené dechové zkoušce na alkohol',
      'Všeobecný popis incidentu, podpis zakročujícího příslušníka, stanovisko psychologa a návrh na náhradu způsobené škody na majetku VS ČR'
    ],
    correctOption: 0,
    rationale: 'Formulář záznamu o použití DP má červeně orámovaná povinná pole: velení do služby rozkazem, čas, místo, předchozí domluva a citace výzvy, verbální a fyzické projevy odsouzeného, popis DP (způsob, počet, části těla), zranění, lékař, fotodokumentace VISS a schéma zasažených míst.',
    source: 'Příloha k PGŘ č. 3/2024'
  },
  {
    id: 'va_12',
    subject: 'Vězeňská administrativa',
    topic: 'Záznam o použití donucovacích prostředků',
    question: 'Kdo zpracovává a schvaluje druhou část Záznamu o použití donucovacího prostředku?',
    answer: 'Stanovisko zpracovává vedoucí oddělení, zprávu o prošetření zpracovává 1. ZŘV a konečné rozhodnutí o oprávněnosti a přiměřenosti vydává ředitel věznice',
    options: [
      'Stanovisko zpracovává vedoucí oddělení, zprávu o prošetření zpracovává 1. ZŘV a konečné rozhodnutí o oprávněnosti a přiměřenosti vydává ředitel věznice',
      'Stanovisko i konečné rozhodnutí zpracovává samostatně zakročující příslušník společně s velitelem směny bez účasti vedení věznice',
      'Druhou část zpracovává výhradně dozorující státní zástupce Krajského státního zastupitelství ve spolupráci s vyšetřovatelem GIBS',
      'Stanovisko vydává bezpečnostní technik věznice a konečné schválení podléhá výhradně souhlasu ošetřujícího lékaře zdravotnického střediska'
    ],
    correctOption: 0,
    rationale: 'Část druhá obsahuje stanovisko vedoucího oddělení zakročujícího příslušníka, zprávu o prošetření okolností a důvodů 1. zástupcem ředitele věznice (1. ZŘV) a závazné rozhodnutí ředitele věznice o oprávněnosti a přiměřenosti zákroku.',
    source: 'Příloha k PGŘ č. 3/2024'
  },
  {
    id: 'va_13',
    subject: 'Vězeňská administrativa',
    topic: 'Vězeňský informační systém VIS',
    question: 'Jaké tři evidenční stavy osob ve výkonu vazby, trestu a zabezpečovací detence rozeznává systém VIS?',
    answer: 'Kmenový (podle umístění), Administrativní (podle běhu lhůt vazby/trestu), Fyzický (podle reálné fyzické přítomnosti)',
    options: [
      'Kmenový (podle umístění), Administrativní (podle běhu lhůt vazby/trestu), Fyzický (podle reálné fyzické přítomnosti)',
      'Aktivní (přítomen na cele), Dočasný (na eskortě u soudu), Archivní (po ukončení výkonu trestu odnětí svobody)',
      'Vstupní (v přijímacím oddílu), Standardní (v základním bloku), Výstupní (ve výstupním oddílu před propuštěním)',
      'Primární (dle rozsudku soudu), Sekundární (dle zdravotní klasifikace), Tranzitní (při převozu mezi organizačními jednotkami)'
    ],
    correctOption: 0,
    rationale: 'Z evidenčního hlediska rozeznává VS ČR ve VIS tři stavy: kmenový (evidován k dané organizační jednotce), administrativní (sledování běhu právních lhůt vazby/trestu) a fyzický (reálná fyzická přítomnost v objektu, např. při eskortě do nemocnice je kmenově ve věznici, ale fyzicky mimo ni).',
    source: 'Metodika VIS a evidence VS ČR'
  },
  {
    id: 'va_14',
    subject: 'Vězeňská administrativa',
    topic: 'Vězeňský informační systém VIS',
    question: 'Jaká jsou pravidla pro telefonické lustrace o vězněných osobách z centrální evidence VS ČR?',
    answer: 'Lustraci lze podat pouze žadateli z OČTŘ, který sdělí platné bezpečnostní heslo vydané odborem správním GŘ VS ČR (platnost hesla je zpravidla 3 měsíce)',
    options: [
      'Lustraci lze podat pouze žadateli z OČTŘ, který sdělí platné bezpečnostní heslo vydané odborem správním GŘ VS ČR (platnost hesla je zpravidla 3 měsíce)',
      'Informace lze podat kterémukoliv policistovi po sdělení čísla služebního průkazu a jednorázového denního hesla velitele směny',
      'Telefonické lustrace jsou ze zákona přísně zakázány a veškeré dotazy OČTŘ musí být zasílány výhradně poštou na formuláři s kolkem',
      'Lustraci lze sdělit advokátovi nebo osobě blízké, pokud uvedou přesné rodné číslo vězněné osoby a číslo trestního spisu soudu'
    ],
    correctOption: 0,
    rationale: 'Telefonické lustrace umožňují OČTŘ rychlé zjištění umístění osoby. Odbor správní GŘ VS ČR vydává vybraným subjektům hesla s platností zpravidla na 3 měsíce. Bez platného hesla se po telefonu žádné informace nepodávají.',
    source: 'Metodika VIS – Lustrace'
  },
  {
    id: 'va_15',
    subject: 'Vězeňská administrativa',
    topic: 'Vězeňský informační systém VIS',
    question: 'Komu lze dle § 23a zákona č. 555/1992 Sb. poskytnout informaci o umístění vězněné osoby bez jejího souhlasu?',
    answer: 'Orgánům činným v trestním řízení a státním orgánům k výkonu správy, a dále osobám blízkým, věřitelům či zaměstnavatelům, pokud osvědčí právní zájem',
    options: [
      'Orgánům činným v trestním řízení a státním orgánům k výkonu správy, a dále osobám blízkým, věřitelům či zaměstnavatelům, pokud osvědčí právní zájem',
      'Jakékoliv fyzické nebo právnické osobě na základě žádosti podle zákona č. 106/1999 Sb. o svobodném přístupu k informacím bez omezení',
      'Výhradně a pouze obhájci vězněné osoby, ostatním subjektům včetně OČTŘ nelze údaj bez písemného souhlasu vězně poskytnout',
      'Pouze Veřejnému ochránci práv a zástupcům Českého červeného kříže v rámci pravidelných monitorovacích návštěv věznice'
    ],
    correctOption: 0,
    rationale: 'Orgánům dle § 23a odst. 3 písm. a–c (soudy, PČR, státní zastupitelství, ČSSZ, FÚ...) se údaje poskytují ze zákona. Jiným osobám (věřitelé, zaměstnavatelé, osoby blízké) lze údaj o umístění a délce trestu poskytnout bez souhlasu odsouzeného pouze, pokud osvědčí právní zájem.',
    source: '§ 23a zákona č. 555/1992 Sb.'
  },
  {
    id: 'va_16',
    subject: 'Vězeňská administrativa',
    topic: 'Zásady úředního stylu a písemností',
    question: 'Jaké je jedno ze základních stylistických pravidel pro psaní úředních záznamů (SZ, ZKP, záznam o DP) příslušníkem VS ČR?',
    answer: 'Píše se spisovnou češtinou, v 1. osobě jednotného čísla a v minulém čase (např. „já jsem viděl, zjistil, vyzval...“)',
    options: [
      'Píše se spisovnou češtinou, v 1. osobě jednotného čísla a v minulém čase (např. „já jsem viděl, zjistil, vyzval...“)',
      'Píše se zásadně ve 3. osobě množného čísla v přítomném čase k zachování anonymity zasahujících příslušníků (např. „hlídka provádí, příslušníci zjišťují“)',
      'Píše se výhradně v trpném rodě v budoucím čase s obecnými formulacemi (např. „bylo zjištěno, bude zakročeno, bylo konstatováno“)',
      'Používá se hovorový jazyk s citovým zabarvením a přibližným časovým vymezením (např. „kolem oběda se vězeň choval nepřístojně a my jsme ho uklidnili“)'
    ],
    correctOption: 0,
    rationale: 'Základní požadavky na úřední písemnost: spisovná čeština a odborná terminologie, 1. osoba jednotného čísla, minulý čas („dne 14.1. jsem byl velen... vstoupil jsem... vyzval jsem...“), konkrétní čas a místo a max. 3 věty v souvětí.',
    source: 'Manuál pro předmět Vězeňská administrativa'
  },
  {
    id: 'va_17',
    subject: 'Vězeňská administrativa',
    topic: 'Záznam o odnětí věci',
    question: 'Podle jakého zákonného ustanovení a jakým způsobem se sepisuje Záznam o odnětí věci u vězněné osoby?',
    answer: 'Dle § 12 odst. 1 zákona č. 555/1992 Sb., s přesným a nezaměnitelným popisem věci (výrobní čísla, značka, barva, rozměry, tvar a počet tablet, nominální hodnoty a série bankovek) a uvedením důvodu odnětí',
    options: [
      'Dle § 12 odst. 1 zákona č. 555/1992 Sb., s přesným a nezaměnitelným popisem věci (výrobní čísla, značka, barva, rozměry, tvar a počet tablet, nominální hodnoty a série bankovek) a uvedením důvodu odnětí',
      'Dle zákona o odpovědnosti za přestupky s hromadným paušálním popisem bez nutnosti uvádět výrobní čísla elektroniky nebo nominální hodnoty bankovek',
      'Dle § 78 trestního řádu jako vydání věci, přičemž věci se pouze orientačně zváží v celkovém balíku bez individuální specifikace rozměrů a značek',
      'Dle § 28 zákona o výkonu trestu, přičemž záznam se povinně vystavuje pouze u předmětů s odhadní hodnotou přesahující částku 10 000 Kč'
    ],
    correctOption: 0,
    rationale: 'Dle § 12 odst. 1 z. č. 555/1992 Sb. je příslušník oprávněn odebrat věc, kterou vězněná osoba nesmí mít u sebe. V záznamu musí být věci přesně a nezaměnitelně popsány (např. výrobní číslo telefonu, rozměry čepele nože, série bankovek).',
    source: '§ 12 zákona č. 555/1992 Sb.'
  },
  {
    id: 'va_18',
    subject: 'Vězeňská administrativa',
    topic: 'Fyzické násilí a nevhodné jednání',
    question: 'Jaký postup ukládá NGŘ č. 24/2022 při zjištění nebo oznámení fyzického násilí a známek ponižujícího jednání mezi vězněnými osobami?',
    answer: 'Sepsat záznam (příloha č. 1), provést prohlídku těla, neprodleně informovat IDS a VISS, zajistit lékařskou prohlídku na ZS a vyžádat odborná stanoviska (psycholog, prevence a stížnosti)',
    options: [
      'Sepsat záznam (příloha č. 1), provést prohlídku těla, neprodleně informovat IDS a VISS, zajistit lékařskou prohlídku na ZS a vyžádat odborná stanoviska (psycholog, prevence a stížnosti)',
      'Vyřešit incident na místě ústní domluvou mezi odsouzenými, útočníka přemístit na jinou celu bez lékařské prohlídky a věc neevidovat',
      'Zapsat událost pouze do střídací knihy dozorce oddílu a vyčkat na pravidelné měsíční hlášení bezpečnostní komisi věznice',
      'Postoupit případ přímo okresnímu soudu k občanskoprávnímu řízení bez provedení osobní prohlídky těla a bez vyrozumění orgánů věznice'
    ],
    correctOption: 0,
    rationale: 'Při zjištění fyzického násilí se dle NGŘ č. 24/2022 sepisuje standardizovaný záznam, provede se prohlídka těla a lékařské vyšetření na zdravotnickém středisku věznice, informuje se IDS a VISS a následuje šetření oddělení prevence a stížností a posudek psychologa.',
    source: 'NGŘ č. 24/2022'
  },
  {
    id: 'va_19',
    subject: 'Vězeňská administrativa',
    topic: 'Zásady úředního stylu a písemností',
    question: 'Jaké prvky tvoří kompletní podpisovou doložku příslušníka VS ČR v úředním záznamu?',
    answer: 'Vlastnoruční podpis, hodnostní označení zkratkou, služební hodnost, akademický titul, jméno, příjmení, služební číslo a služební zařazení (např. v. ref. strm. Bc. Jan Novák, DiS., sl. č. 12345, strážný)',
    options: [
      'Vlastnoruční podpis, hodnostní označení zkratkou, služební hodnost, akademický titul, jméno, příjmení, služební číslo a služební zařazení (např. v. ref. strm. Bc. Jan Novák, DiS., sl. č. 12345, strážný)',
      'Pouze vlastnoruční podpis, kulaté úřední razítko věznice a datum podpisu bez uvedení hodnosti, jména a služebního čísla',
      'Pouze služební číslo a kryptonym útvaru z důvodu utajení identity příslušníka před vězněnými osobami a jejich obhájci',
      'Elektronická adresa, telefonní linka na stanoviště a civilní pracovní zařazení bez uvedení služební hodnosti a hodnostního označení'
    ],
    correctOption: 0,
    rationale: 'Kompletní podpisová doložka obsahuje: vlastnoruční podpis a textovou doložku (služební hodnost, hodnostní označení, titul, jméno, příjmení, služební číslo, služební zařazení / funkce).',
    source: 'Manuál pro předmět Vězeňská administrativa'
  },
  {
    id: 'va_20',
    subject: 'Vězeňská administrativa',
    topic: 'Elektronická spisová služba ETŘ',
    question: 'Co stanoví metodika ETŘ ohledně políčka „ZAMKNOUT“ při editaci popisu spisu?',
    answer: 'Při běžné editaci se na políčko „ZAMKNOUT“ NIKDY nekliká, protože uzamčení spisu omezí přístup pouze na zpracovatele a jeho přímé vedení a vyžaduje odůvodněný deliktní režim',
    options: [
      'Při běžné editaci se na políčko „ZAMKNOUT“ NIKDY nekliká, protože uzamčení spisu omezí přístup pouze na zpracovatele a jeho přímé vedení a vyžaduje odůvodněný deliktní režim',
      'Na políčko „ZAMKNOUT“ je povinnost kliknout po každé dílčí editaci, aby se zabránilo souběžnému zápisu jiných referentů a aktivoval se podpisový certifikát',
      'Políčko „ZAMKNOUT“ slouží k automatickému odeslání dokumentu prostřednictvím informačního systému datových schránek (ISDS)',
      'Kliknutím na políčko „ZAMKNOUT“ se spis trvale převede do skartačního řízení a odešle k archivaci do Národního archivu'
    ],
    correctOption: 0,
    rationale: 'Dle příručky ETŘ: Při běžném zakládání a doplňování rozlišení ČJ NIKDY NEKLIKÁME na políčko „ZAMKNOUT“. Zamčení spisu omezí přístup výhradně na zpracovatele a vedení a je vyhrazeno pro specifické bezpečnostní režimy.',
    source: 'Příručka ETŘ – Založení spisu'
  }
];
