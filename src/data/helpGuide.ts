import type { UserRole } from '../types';
import type { NavTab } from './navTabs';

/**
 * Obsah nápovědy (otazník v hlavičce).
 *
 * PRAVIDLA PRO ÚPRAVY: popisuj jen to, co aplikace opravdu dělá, a popisky
 * tlačítek piš přesně tak, jak jsou v rozhraní — student podle nich hledá.
 * Portál je studijní pomůcka akademie, ne oficiální systém VS ČR; tak o něm
 * také mluv. Když se změní chování (např. kdo smí měnit třídu), oprav i tuhle
 * nápovědu.
 */

export type HelpGroupId = 'zaciname' | 'trida' | 'studium' | 'ucet' | 'velitel' | 'lektor' | 'spravce' | 'otazky';

export interface HelpGroup {
  id: HelpGroupId;
  label: string;
}

export type HelpBlock =
  | { kind: 'p'; text: string }
  | { kind: 'tip'; text: string }
  | { kind: 'list' | 'steps'; title?: string; items: string[] };

export interface HelpSection {
  id: string;
  group: HelpGroupId;
  title: string;
  /** Jedna věta pod nadpisem — o čem kapitola je. */
  summary: string;
  blocks: HelpBlock[];
  /** Záložka, do které kapitola vede (tlačítko „Otevřít záložku …“). */
  tab?: NavTab;
}

export const HELP_GROUPS: HelpGroup[] = [
  { id: 'zaciname', label: 'Začínáme' },
  { id: 'trida', label: 'Moje třída' },
  { id: 'studium', label: 'Studium' },
  { id: 'ucet', label: 'Účet a nastavení' },
  { id: 'velitel', label: 'Pro velitele třídy' },
  { id: 'lektor', label: 'Pro lektory' },
  { id: 'spravce', label: 'Pro správce' },
  { id: 'otazky', label: 'Časté otázky' },
];

/** Které skupiny kapitol daná role uvidí. */
export function groupsForRole(role: UserRole): HelpGroupId[] {
  const common: HelpGroupId[] = ['zaciname', 'trida', 'studium', 'ucet'];
  switch (role) {
    case 'velitel_tridy':
      return [...common, 'velitel', 'otazky'];
    case 'lektor':
      return [...common, 'velitel', 'lektor', 'otazky'];
    case 'admin':
      return [...common, 'velitel', 'lektor', 'spravce', 'otazky'];
    default:
      return [...common, 'otazky'];
  }
}

export const HELP_SECTIONS: HelpSection[] = [
  // ─── Začínáme ──────────────────────────────────────────────────────────────
  {
    id: 'zaciname',
    group: 'zaciname',
    title: 'Co je tahle aplikace',
    summary: 'Studijní portál pro přípravu v akademii VS ČR.',
    blocks: [
      {
        kind: 'p',
        text:
          'Aplikace slouží k přípravě na výcvik a zkoušky: testy z otázek, učivo po předmětech, výklad předpisů, ' +
          'modelové situace, kartičky a třídní nástěnka s rozvrhem a službami. Je to studijní pomůcka, ne oficiální ' +
          'systém Vězeňské služby — závazné jsou vždy platné předpisy a pokyny vyučujících.',
      },
      {
        kind: 'steps',
        title: 'První kroky',
        items: [
          'Po prvním přihlášení si vyberte svou třídu (viz kapitola Zařazení do třídy).',
          'Na Nástěnce si projděte rozvrh, ústroj a termíny služeb své třídy.',
          'V Předmětech si otevřete učivo, ve Zkoušce si zkuste první procvičovací test.',
          'V profilu si můžete nastavit fotku, velikost písma a upozornění do telefonu.',
        ],
      },
      {
        kind: 'tip',
        text: 'Tuhle nápovědu otevřete kdykoli otazníkem v hlavičce. Na telefonu je i v nabídce „Více“.',
      },
    ],
  },
  {
    id: 'orientace',
    group: 'zaciname',
    title: 'Orientace v aplikaci',
    summary: 'Kde najdete jednotlivé moduly na počítači a na telefonu.',
    blocks: [
      {
        kind: 'list',
        title: 'Na počítači',
        items: [
          'Hlavička nahoře: Nástěnka, Předměty, Zkouška a AI Asistent přímo, ostatní moduly v nabídkách „Výcvik & Praxe“, „Znalosti a dril“ a „Další“.',
          'Šipky vlevo v hlavičce vrací zpět a vpřed mezi záložkami.',
          'Vpravo je váš profil (hodnost a XP), Chat (dvě bubliny, číslo ukazuje nepřečtené zprávy), zvonek s oznámeními, otazník s nápovědou, Zpětná vazba (jedna bublina) a přepínač světlého a tmavého režimu.',
        ],
      },
      {
        kind: 'list',
        title: 'Na telefonu',
        items: [
          'Spodní lišta: Předměty, Zkouška, Asistent, Výcvik a Více. V nabídce „Více“ je Nástěnka, Chat, Kompas zákonů, Kartičky, Poznávačka, Odznaky, Statistiky, Knihovna a tahle nápověda.',
          'Rychlým tahem prstu doprava se vrátíte o záložku zpět, doleva vpřed.',
        ],
      },
      {
        kind: 'list',
        title: 'Moduly v kostce',
        items: [
          'Nástěnka — vaše třída: rozvrh, ústroj, služby, hlášení, diskuze a celoškolní oznámení.',
          'Chat — soukromé zprávy a skupinové konverzace s lidmi z akademie.',
          'Předměty — učivo a otázky s vysvětlením po předmětech, spuštění testu nebo kartiček.',
          'Zkouška — procvičování a zkouška nanečisto.',
          'AI Asistent — rozbor zadání nebo fotky úlohy s návrhem odpovědí.',
          'Kompas zákonů — studijní výběr ustanovení s výkladem a katalog předpisů.',
          'Administrativa & ETŘ, Profesní etika, Taktické scénáře, Zbraně & Střelba — výcvikové moduly.',
          'Kartičky, Poznávačka — opakování pojmů.',
          'Odznaky & Úrovně, Statistiky — váš postup.',
          'Knihovna — studijní podklady (PDF, Word, prezentace) k otevření i stažení.',
        ],
      },
    ],
  },

  // ─── Moje třída ────────────────────────────────────────────────────────────
  {
    id: 'zarazeni',
    group: 'trida',
    title: 'Zařazení do třídy',
    summary: 'Jak se dostanete do své třídy a kdo o tom rozhoduje.',
    tab: 'dashboard',
    blocks: [
      {
        kind: 'steps',
        title: 'Jak to probíhá',
        items: [
          'Po prvním přihlášení se ukáže okno „Zvolte svou třídu“. U každé třídy vidíte jejího velitele.',
          'Vyberte třídu a stiskněte „Požádat o zařazení“. Žádost dostane velitel třídy, případně lektor, a o přijetí mohou hlasovat i členové třídy.',
          'Než o ní někdo rozhodne, ukazuje Nástěnka u vaší třídy „čeká na schválení“ a kolik členů už hlasovalo pro (jména nevidíte). Žádost můžete změnit tlačítkem „Změnit žádost“.',
          'Přijati jste, když žádost schválí velitel (zástupce, lektor), nebo když pro vás hlasuje víc než polovina členů třídy. Zamítnou-li vás členové hlasováním, do téže třídy můžete znovu požádat až po 24 hodinách.',
          'Po schválení jste ve třídě a vidíte její rozvrh, služby, ústroj, členy a diskuzi.',
        ],
      },
      {
        kind: 'list',
        title: 'Nevidíte svou třídu?',
        items: [
          'Zvolte „Nevidím zde svou třídu“ a napište, kam patříte (např. „ZOP A15, nástup 1. 10.“). Poznámku uvidí velitelé, lektoři a správce a zařadí vás.',
          'Třída se do seznamu dostane, až ji lektor nebo správce založí.',
        ],
      },
      {
        kind: 'list',
        title: 'Označení od velitele',
        items: [
          'Velitel vás může do své třídy sám označit. Pak se vám ukáže okno „Byli jste označeni ve třídě …“ a vy to potvrdíte, nebo odmítnete.',
          'Odmítnete-li, zůstanete mezi nezařazenými a velitel dostane oznámení.',
        ],
      },
      {
        kind: 'tip',
        text:
          'Svou třídu si sami změnit nemůžete. Patříte-li jinam, napište veliteli nebo lektorovi — přeřadit vás může jen lektor nebo správce.',
      },
    ],
  },
  {
    id: 'velitel-a-zastupce',
    group: 'trida',
    title: 'Velitel třídy a zástupce',
    summary: 'Kdo třídu vede a jak se velitel mění.',
    blocks: [
      {
        kind: 'list',
        items: [
          'Každá třída má nejvýše jednoho velitele. Jmenuje ho lektor nebo správce.',
          'Velitel vyřizuje žádosti o zařazení (přijmout nového člena mohou i členové hlasováním), vede nástěnku třídy (rozvrh, ústroj, služby, hlášení) a moderuje diskuzi.',
          'Velitel si může určit zástupce z členů třídy — na určitou dobu nebo do odvolání. Zástupce má po tu dobu stejná práva jako velitel.',
          'Velitel může funkci předat jinému členovi třídy; uvádí přitom odůvodnění, které vidí lektoři. Původní velitel se pak stává běžným členem.',
          'Jméno velitele a zástupce je v záhlaví třídy na Nástěnce a v přehledu všech tříd.',
        ],
      },
    ],
  },
  {
    id: 'hlasovani-o-prijeti',
    group: 'trida',
    title: 'Hlasování o přijetí nového člena',
    summary: 'Jak členové třídy přijmou nového člena, když velitel nereaguje.',
    tab: 'dashboard',
    blocks: [
      {
        kind: 'list',
        items: [
          'Když někdo požádá o zařazení do vaší třídy, dostanete oznámení a na nástěnce třídy se objeví blok „Žádosti o vstup do třídy“.',
          'Hlasujete „Pro přijetí“ nebo „Proti“. Každý má jeden hlas a do rozhodnutí ho může změnit.',
          'Přijato je, jakmile pro hlasuje víc než polovina členů třídy (u 5 členů 3, u 6 členů 4). Zamítnuto je, jakmile už většina vzniknout nemůže.',
          'Hlasovat mohou jen ti, kdo byli ve třídě už při podání žádosti. Kdo přibude později nebo je z jiné třídy, nehlasuje.',
          'Má-li třída méně než 3 členy, nehlasuje se a rozhoduje velitel, zástupce nebo lektor.',
          'Velitel, zástupce, lektor a správce vidí, kdo jak hlasoval; ostatní členové a žadatel jen počty. Velitel může žádost dál schválit nebo odmítnout sám.',
        ],
      },
    ],
  },
  {
    id: 'nastenka',
    group: 'trida',
    title: 'Nástěnka třídy',
    summary: 'Co na Nástěnce najdete.',
    tab: 'dashboard',
    blocks: [
      {
        kind: 'list',
        items: [
          'Přepínač nahoře: „Moje třída“ a „Všechny třídy“. U cizích tříd vidíte jen velitele, zástupce a počet členů — rozvrh, služby a ústroj vidí jen členové.',
          'Průběh výcviku — odpočet do konce kurzu.',
          'Denní hlášení, operativní změny a zkoušky.',
          'Rozvrh hodin — jde zvětšit na celou obrazovku a vytisknout na A4.',
          'Ústrojová kázeň — co na sebe a co s sebou v jednotlivé dny, dnešek je zvýrazněný.',
          'Termíny výpomocí a služeb (Pankrác, Recepce, střelby, zkoušky…) — kdy, kde, kdo a v jaké výstroji.',
          'Studijní soubory pro třídu, členové třídy a diskuze.',
          'Informace pro všechny — celoškolní hlášení; naléhavá jsou červeně.',
          'Jídelníček — jeden společný pro všechny třídy, pokud ho lektor nebo velitel vyplní. Pod ním je, kdo ho naposledy upravil.',
        ],
      },
      {
        kind: 'tip',
        text: 'Cizí třídu můžete z přehledu skrýt; skrytí platí jen v tomto prohlížeči.',
      },
    ],
  },
  {
    id: 'diskuze',
    group: 'trida',
    title: 'Diskuze třídy',
    summary: 'Zprávy, označení spolužáků a ankety uvnitř třídy.',
    tab: 'dashboard',
    blocks: [
      {
        kind: 'list',
        items: [
          'Zprávu napíšete do pole „Napište zprávu třídě…“ a stisknete „Zveřejnit“. Vidí ji jen členové třídy, lektoři a správce.',
          '„Označit člena…“ — označený spolužák dostane oznámení do zvonku.',
          '„Anketa“ — 2 až 10 možností, volitelně s koncem hlasování. Dokud hlasování běží, svůj hlas můžete změnit.',
          'Svou zprávu můžete smazat. Velitel, zástupce, lektor a správce mohou zprávy připnout, skrýt nebo smazat.',
        ],
      },
    ],
  },
  {
    id: 'chat',
    group: 'trida',
    title: 'Chat',
    summary: 'Soukromé zprávy, skupiny, přílohy a sdílení z aplikace.',
    tab: 'chat',
    blocks: [
      {
        kind: 'p',
        text:
          'Chat otevřete ikonou se dvěma bublinami v hlavičce, na telefonu v nabídce „Více“. Číslo u ikony ukazuje ' +
          'nepřečtené zprávy. Psát si mohou jen lidé z akademie: studenti a velitelé zařazení do třídy, lektoři ' +
          'a správce. Dokud vás nikdo nezařadí do třídy, chat se vám neotevře a nikdo vám nenapíše.',
      },
      {
        kind: 'steps',
        title: 'Jak napsat',
        items: [
          '„Nová konverzace“ → vyhledejte člověka podle jména nebo třídy (spolužáci jsou nahoře).',
          'Vyberete-li jednoho člověka, „Otevřít konverzaci“ otevře soukromou konverzaci (s každým máte jen jednu).',
          'Vyberete-li víc lidí, napište „Název skupiny“ a stiskněte „Založit skupinu“ (nejvýš 50 členů).',
          'Zprávu odešlete klávesou Enter nebo šipkou; Shift+Enter zalomí řádek.',
          'Soubor přiložíte sponkou vedle pole pro zprávu: PDF, Word, Excel, PowerPoint, obrázek nebo text do 10 MB. Popisek je nepovinný.',
          'Na počítači jde soubor i přetáhnout do konverzace a snímek obrazovky vložit do pole pro zprávu (Ctrl+V).',
        ],
      },
      {
        kind: 'list',
        title: 'Poslat do chatu z aplikace',
        items: [
          'Tlačítko s bublinami „Poslat do chatu“ najdete u souborů v Knihovně, u otázky v Zkoušce (po odpovědi v procvičování a v přehledu výsledků), u kartiček a v Kompasu zákonů u předpisu i ustanovení.',
          'Vyberete konverzaci (nebo člověka, se kterým ještě nepíšete), můžete připsat zprávu a stisknete „Odeslat“.',
          'Ve zprávě se věc ukáže jako karta: soubor z Knihovny otevřete přímo v chatu, u otázky si správnou odpověď odkryjete, předpis a ustanovení otevřou Kompas zákonů.',
        ],
      },
      {
        kind: 'list',
        title: 'Co ještě jde',
        items: [
          'Každý vidí jen konverzace, ve kterých je. Lektoři ani správce cizí konverzace nečtou.',
          'Při otevření konverzace s novými zprávami vás aplikace posune na čáru „Nové zprávy“. Odkazy (https://…) ve zprávě otevřete klepnutím.',
          'Svou zprávu smažete ikonou koše pod ní; ostatní místo ní uvidí „Zpráva byla smazána.“ Smaže se i její příloha.',
          'Přílohy vidí jen členové konverzace. Za 24 hodin můžete poslat nejvýš 40 souborů.',
          'Nevhodnou zprávu nahlásíte ikonou praporku. Uvidí ji lektoři a správce (jen tu jednu zprávu) a mohou ji skrýt; autor se nedozví, kdo ji nahlásil, ani když je sám lektor nebo správce.',
          'Ikona „i“ v konverzaci ukáže členy a nabídne „Ztlumit“ — bez upozornění do zařízení a bez počítání do čísla v hlavičce.',
          'Skupinu přejmenovává a členy přidává nebo odebírá ten, kdo ji založil. Noví členové uvidí i dřívější zprávy a přílohy skupiny. „Opustit skupinu“ může kdokoli; odejde-li zakladatel, správu převezme další člen.',
          'Na novou zprávu přijde upozornění do zařízení, máte-li ho zapnuté (druh „Nové zprávy v chatu“). Do zvonku chatové zprávy nechodí.',
          'Kdo přestane být zařazený do třídy (například po smazání třídy na konci kurzu), chat ztratí: nejde mu psát a upozornění na zprávy ze skupin mu už nechodí.',
        ],
      },
      {
        kind: 'tip',
        text:
          'Chat je pro studium a běžnou domluvu. Aplikace není služební systém Vězeňské služby, proto do chatu nepište ' +
          'údaje o vězněných osobách ani jiné služební informace.',
      },
    ],
  },

  // ─── Studium ───────────────────────────────────────────────────────────────
  {
    id: 'predmety',
    group: 'studium',
    title: 'Předměty',
    summary: 'Učivo a otázky rozdělené podle předmětů.',
    tab: 'subjects',
    blocks: [
      {
        kind: 'p',
        text:
          'Vyberte předmět a otevřete ho. Najdete v něm okruhy, otázky s vysvětlením a zdrojem, soubory k předmětu ' +
          'a tlačítka „Spustit test“ a „Kartičky“ jen z tohoto předmětu. Otázku si můžete přidat do oblíbených.',
      },
    ],
  },
  {
    id: 'zkouska',
    group: 'studium',
    title: 'Zkouška: procvičování a zkouška nanečisto',
    summary: 'Dva režimy testu a jak se počítá výsledek.',
    tab: 'quiz',
    blocks: [
      {
        kind: 'list',
        title: 'Procvičování',
        items: [
          'Vyberete předmět (nebo všechny) a počet otázek 5–50. Po každé odpovědi hned vidíte, jestli byla správně, a vysvětlení.',
          '„Chytrý výběr otázek“ dává přednost vašim chybám a otázkám, které jste ještě neviděli; zvládnuté se vrátí až po týdnu.',
          'U odpovědi můžete označit „Vím jistě“, „Tipuji“ nebo „Nevím“. Tipnutá otázka se nepočítá jako zvládnutá.',
          'Panel „Připravenost“ ukazuje, kolik otázek máte zvládnutých (dvakrát po sobě správně bez tipování).',
          'Po testu jde spustit „Procvičit chyby z tohoto testu“.',
        ],
      },
      {
        kind: 'list',
        title: 'Zkouška nanečisto',
        items: [
          '50 otázek ze všech předmětů a jeden časový limit 45 minut na celý test. V posledních 5 minutách se čas zvýrazní.',
          'Mezi otázkami se můžete vracet a odpovědi měnit; výsledek uvidíte až po odevzdání.',
          'Počet otázek a limit jsou nastavení aplikace pro trénink, ne pravidla skutečné zkoušky.',
        ],
      },
      {
        kind: 'tip',
        text:
          'Hranice úspěšnosti je 75 %, od 90 % je to s vyznamenáním. Rozpracovaný test se při odchodu ze záložky neuloží — aplikace se nejdřív zeptá.',
      },
    ],
  },
  {
    id: 'asistent',
    group: 'studium',
    title: 'AI Asistent',
    summary: 'Rozbor zadání nebo fotky úlohy s návrhem odpovědí.',
    tab: 'assistant',
    blocks: [
      {
        kind: 'steps',
        items: [
          'Vložte text úlohy („Vložit text“), nebo ji vyfoťte či nahrajte („Vyfotit nebo nahrát“).',
          'Stiskněte „Navrhnout odpovědi“.',
          'Výsledek můžete procvičit jako test, uložit do kartiček, nechat přečíst nahlas nebo vytisknout.',
        ],
      },
      {
        kind: 'p',
        text:
          'Asistent používá službu Google Gemini a potřebuje API klíč. Pokud ho aplikace nemá sdílený, zadejte vlastní ' +
          'přes tlačítko „Zadat API klíč“ v záložce (klíč zdarma získáte na aistudio.google.com). Klíč se uloží jen ' +
          'v tomto prohlížeči u vašeho účtu a jde odstranit.',
      },
      {
        kind: 'tip',
        text: 'Návrhy umělé inteligence mohou být chybné. Vždy je ověřte v předpisech nebo u vyučujícího.',
      },
    ],
  },
  {
    id: 'kompas',
    group: 'studium',
    title: 'Kompas zákonů',
    summary: 'Výklad vybraných ustanovení a katalog předpisů.',
    tab: 'compass',
    blocks: [
      {
        kind: 'list',
        items: [
          '„Paragrafový výklad“ — studijní výběr ustanovení s vysvětlením. Nejde o úplné znění předpisu.',
          '„Katalog předpisů“ — zákony, vyhlášky a NGŘ s informativním zněním z e-Sbírky.',
          'Plná znění si můžete stáhnout do zařízení, aby fungovala i bez internetu.',
        ],
      },
    ],
  },
  {
    id: 'vycvik',
    group: 'studium',
    title: 'Výcvikové moduly',
    summary: 'Administrativa, etika, scénáře a zbraně.',
    blocks: [
      {
        kind: 'list',
        items: [
          'Administrativa & ETŘ — úřední záznamy, spisová služba, evidence a úřední styl.',
          'Profesní etika — klíčové pojmy, etický kodex, protikorupce, lidská práva a etická dilemata.',
          'Taktické scénáře — modelové situace ze služby, postup volíte krok za krokem.',
          'Zbraně & Střelba — bezpečnostní kontrola a vybíjení, částečná rozborka, odstraňování závad a takticko-technická data.',
        ],
      },
      {
        kind: 'tip',
        text: 'Scénář nebo nácvik se započítá do postupu jen tehdy, když ho zvládnete správně napoprvé.',
      },
    ],
  },
  {
    id: 'karticky-poznavacka',
    group: 'studium',
    title: 'Kartičky a Poznávačka',
    summary: 'Opakování otázek a pojmů.',
    blocks: [
      {
        kind: 'list',
        items: [
          'Kartičky — otázka na jedné straně, odpověď na druhé. S Leitnerovým systémem se kartičky řadí do 5 krabiček a aplikace vám každý den připraví ty, které je potřeba zopakovat („Ke zopakování dnes“).',
          '„Umím“ posune kartičku do vyšší krabičky, „Ještě neumím“ ji vrátí do první.',
          'Poznávačka — spojujete pojmy s definicemi nebo umisťujete názvy součástí do schémat (např. části zbraní). Rychlost a bezchybnost přidávají XP.',
        ],
      },
      {
        kind: 'tip',
        text: 'Pořadí kartiček v krabičkách se pamatuje jen v tomto zařízení.',
      },
    ],
  },
  {
    id: 'postup',
    group: 'studium',
    title: 'Odznaky, hodnosti a statistiky',
    summary: 'Jak se počítá XP a kde vidíte svůj postup.',
    blocks: [
      {
        kind: 'list',
        items: [
          'XP získáváte za testy, poznávačky, scénáře a nácviky. Testy pod 50 % se do XP a odznaků nepočítají.',
          'Podle XP postupujete v hodnostech; přehled je v Odznacích & Úrovních a v profilu.',
          'Statistiky ukazují úspěšnost v čase, počet testů a okruhy k procvičení. Tlačítko „Procvičit“ spustí test z nejslabšího okruhu.',
          '„Vymazat historii testů“ ve Statistikách smaže historii testů a poznávaček v zařízení i na serveru. Nejde to vrátit.',
        ],
      },
    ],
  },
  {
    id: 'knihovna',
    group: 'studium',
    title: 'Knihovna',
    summary: 'Studijní podklady k otevření a stažení.',
    tab: 'library',
    blocks: [
      {
        kind: 'p',
        text:
          'V Knihovně jsou soubory, které nahráli lektoři (PDF, Word, prezentace, obrázky). Otevřete je přímo ' +
          'v aplikaci nebo stáhnete. Soubory označené pro předmět najdete i v detailu předmětu, soubory pro třídu ' +
          'na Nástěnce třídy.',
      },
    ],
  },

  // ─── Účet a nastavení ─────────────────────────────────────────────────────
  {
    id: 'profil',
    group: 'ucet',
    title: 'Profil, heslo a vzhled',
    summary: 'Co si můžete nastavit sami.',
    blocks: [
      {
        kind: 'list',
        items: [
          'Profil otevřete kliknutím na své jméno vpravo v hlavičce → „Upravit profil“.',
          'Můžete změnit fotku (vlastní nebo služební avatar), jméno, velikost zobrazení a heslo (alespoň 12 znaků, malé i velké písmeno, číslice a speciální znak).',
          'E-mail a roli sami změnit nemůžete. Třídu mění jen lektor nebo správce.',
          'Velikost zobrazení se uloží k účtu a platí na všech zařízeních. Světlý a tmavý režim se pamatuje jen v daném prohlížeči.',
          'Zapomenuté heslo: na přihlašovací stránce „Zapomněli jste heslo?“ — odkaz přijde e-mailem (zkontrolujte i nevyžádanou poštu).',
        ],
      },
    ],
  },
  {
    id: 'upozorneni',
    group: 'ucet',
    title: 'Oznámení a upozornění do telefonu',
    summary: 'Zvonek v aplikaci a upozornění mimo ni.',
    blocks: [
      {
        kind: 'list',
        items: [
          'Zvonek v hlavičce ukazuje zprávy od správce, žádosti a zařazení do třídy, označení v diskuzi, nové ankety, hlášení třídy a celoškolní oznámení. Zprávy z Chatu do zvonku nechodí — počítá je ikona Chatu.',
          'Upozornění do zařízení zapnete v profilu v části „Upozornění do zařízení“ → „Zapnout v tomto zařízení“. Každé zařízení se zapíná zvlášť; které druhy zpráv chcete dostávat, platí pro všechna.',
          'iPhone a iPad: upozornění fungují jen z aplikace přidané na plochu — v Safari Sdílet → Přidat na plochu a pak aplikaci otevírejte z plochy.',
        ],
      },
    ],
  },
  {
    id: 'offline',
    group: 'ucet',
    title: 'Kde se ukládá postup a co funguje bez internetu',
    summary: 'Na co se můžete spolehnout při výpadku sítě nebo na cizím počítači.',
    blocks: [
      {
        kind: 'list',
        items: [
          'Výsledky testů se ukládají k vašemu účtu. Splněné scénáře, nácviky, oblíbené otázky a historie poznávaček se zálohují na server a po přihlášení se sloučí.',
          'Bez internetu fungují testy, kartičky a stažené předpisy. Dokončený test počká v zařízení a odešle se sám, jakmile se připojíte — i když aplikaci mezitím zavřete.',
          'Nástěnka třídy se načítá ze serveru, bez připojení ji neuvidíte aktuální.',
          'Na sdíleném počítači se data jednotlivých účtů nemíchají. Po skončení se odhlaste.',
          'Aplikace anonymně měří návštěvnost a rychlost načítání (Vercel Web Analytics a Speed Insights). Nepoužívá k tomu cookies ani vaše jméno či e-mail; slouží jen k nalezení pomalých míst.',
        ],
      },
      {
        kind: 'tip',
        text: 'Aplikaci si můžete nainstalovat na plochu telefonu nebo počítače; když vyjde nová verze, nabídne „Aktualizovat teď“.',
      },
    ],
  },
  {
    id: 'zpetna-vazba',
    group: 'ucet',
    title: 'Zpětná vazba a hlášení chyb',
    summary: 'Jak nahlásit chybu v aplikaci nebo v otázce.',
    blocks: [
      {
        kind: 'p',
        text:
          'Ikona Zpětná vazba (bublina v hlavičce, na počítači i tlačítko vlevo dole) otevře formulář. Vyberte druh ' +
          '(chyba v aplikaci, chyba nebo překlep v otázce, nápad, jiné) a popište, co se stalo. Obrazovka, na které ' +
          'jste, se přiloží sama. Hlášení čtou lektoři a správce; odpověď přímo v aplikaci zatím nepřijde.',
      },
    ],
  },

  // ─── Pro velitele třídy ───────────────────────────────────────────────────
  {
    id: 'velitel-zarazeni',
    group: 'velitel',
    title: 'Žádosti a nezařazení studenti',
    summary: 'Panel „Zařazení“ na Nástěnce.',
    tab: 'dashboard',
    blocks: [
      {
        kind: 'list',
        items: [
          'V panelu „Zařazení“ vidíte nezařazené studenty, jejich poznámku a jak dlouho čekají.',
          'Žádost do své třídy vyřídíte tlačítky „Schválit“ nebo „Odmítnout“. U žádosti vidíte i průběh hlasování členů a kdo jak hlasoval; jakmile pro hlasuje většina třídy, žadatel je přijat i bez vás.',
          '„Označit do …“ pošle studentovi nabídku do vaší třídy; zařazen je, až ji potvrdí. Označení jde zrušit.',
          'Přeřadit už zařazeného studenta nemůžete — to dělá lektor nebo správce.',
        ],
      },
    ],
  },
  {
    id: 'velitel-nastenka',
    group: 'velitel',
    title: 'Vedení nástěnky třídy',
    summary: 'Co velitel (a jeho zástupce) na Nástěnce upravuje.',
    tab: 'dashboard',
    blocks: [
      {
        kind: 'list',
        items: [
          'Rozvrh: „Nahrát rozvrh nyní“, později ikona „Upravit třídu a rozvrh“.',
          '„Upravit hlášení“ — denní hlášení, operativní změny a zkoušky.',
          '„Ústrojová kázeň“ — co na sebe a s sebou v jednotlivé dny.',
          '„Přidat službu“ — výpomoci, recepce, střelby, zkoušky, stáže; s místem, časem, určenými posluchači a výstrojí. Proběhlé služby vidíte jen vy.',
          '„Přidat sekci“ — vlastní doplňující informace pro třídu.',
          '„Nastavit termín“ kurzu pro odpočet průběhu výcviku.',
          'V diskuzi můžete zprávy připnout, skrýt a smazat.',
          'Jídelníček — společný pro celou školu, upravit ho může kterýkoli velitel i zástupce. Každá změna se uloží s vaším jménem; „Historie“ ukáže, kdo co kdy změnil, a vrátí starší verzi.',
        ],
      },
      {
        kind: 'tip',
        text: 'Přejmenovat nebo smazat třídu a přidat celoškolní hlášení může jen lektor nebo správce.',
      },
    ],
  },
  {
    id: 'velitel-zastupce',
    group: 'velitel',
    title: 'Zástupce a předání funkce',
    summary: 'V seznamu „Členové třídy“.',
    tab: 'dashboard',
    blocks: [
      {
        kind: 'list',
        items: [
          '„Určit zástupcem“ u člena třídy → datum „Zastupuje do“ (prázdné = do odvolání) → „Potvrdit zástupce“. Zástupcování ukončíte tlačítkem „Ukončit zástupcování“.',
          '„Předat funkci“ → napište odůvodnění (10–500 znaků, uvidí ho lektoři) → „Předat funkci velitele“. Vy se tím stáváte běžným členem třídy a nejde to vzít zpět.',
        ],
      },
    ],
  },

  // ─── Pro lektory ──────────────────────────────────────────────────────────
  {
    id: 'lektor-tridy',
    group: 'lektor',
    title: 'Třídy, zařazování a velitelé',
    summary: 'Správa tříd na Nástěnce.',
    tab: 'dashboard',
    blocks: [
      {
        kind: 'list',
        items: [
          '„Přidat třídu“ založí novou třídu; u karty třídy ji jde přejmenovat nebo smazat.',
          'Výběr „Zobrazená třída“ otevře nástěnku libovolné třídy, kterou pak můžete upravovat jako velitel.',
          'V panelu „Zařazení“ vidíte všechny studenty i s e-mailem. Třídu přiřadíte výběrem a „Přiřadit“; „Zobrazit i zařazené“ ukáže i ty, kdo už třídu mají.',
          '„Jmenovat velitelem“ — v každé třídě je jeden velitel; dosavadní velitel se tím stane studentem a zástupcování skončí. „Odvolat velitele“ funkci odebere.',
          '„Historie velitelů a zástupců“ ukazuje jmenování, odvolání, předání i odůvodnění.',
          '„Přidat celoškolní hlášení“ (s prioritou Běžná až Naléhavá) spravují jen lektoři a správce.',
          'Jídelníček upravují lektoři, správci i velitelé všech tříd a jejich zástupci. Každou změnu databáze zapíše se jménem; „Historie“ u jídelníčku ukáže kdo, kdy a co, a jedním tlačítkem vrátí starší verzi. Záznamy nejde smazat ani z aplikace.',
        ],
      },
    ],
  },
  {
    id: 'lektor-obsah',
    group: 'lektor',
    title: 'Úpravy obsahu a Správa obsahu',
    summary: 'Otázky, soubory a zpětná vazba.',
    tab: 'content-manager',
    blocks: [
      {
        kind: 'list',
        items: [
          'Ve většině modulů (Předměty, Kompas, Administrativa, Etika, Scénáře, Zbraně, Kartičky, Poznávačka) můžete obsah upravovat přímo tlačítky „Upravit“ a „Přidat“. Smazaný obsah jde obnovit.',
          'Správa obsahu → „Správce souborů“: nahrání PDF, Word, PowerPoint a obrázků. Štítky předmětu a třídy určují, kde se soubor ukáže (detail předmětu, nástěnka třídy). Bez štítku je jen v Knihovně.',
          'Správa obsahu → „Banka otázek“: úpravy, hromadný import a tisk otázek. Skryté otázky studenti nevidí, vy ano.',
          'Správa obsahu → „Zpětná vazba“: hlášení od uživatelů, filtr nová/vyřešená, označení jako vyřešené.',
        ],
      },
    ],
  },
  {
    id: 'lektor-chat',
    group: 'lektor',
    title: 'Nahlášené zprávy v chatu',
    summary: 'Jak vyřídit zprávu, kterou někdo nahlásil.',
    tab: 'chat',
    blocks: [
      {
        kind: 'list',
        items: [
          'O nové nahlášené zprávě přijde lektorům a správci oznámení do zvonku (a do zařízení, máte-li zapnutý druh „Nové zprávy v chatu“). Klepnutí na upozornění v zařízení otevře rovnou „Nahlášené“.',
          'V záložce Chat stiskněte „Nahlášené“. Vidíte nahlášenou zprávu, autora, kdo ji nahlásil a proč — zbytek konverzace ne.',
          'Nahlášení vaší vlastní zprávy neuvidíte a oznámení o něm vám nepřijde; vyřídí ho jiný lektor nebo správce.',
          'Má-li zpráva přílohu nebo sdílenou věc, uvidíte ji u nahlášení a přílohu si můžete otevřít.',
          '„Skrýt zprávu“ smaže její text i přílohu všem v konverzaci, „Ponechat“ nahlášení jen uzavře. „I vyřízené“ ukáže i starší vyřízená nahlášení.',
          'Smaže-li autor nahlášenou zprávu sám, její text i příloha zůstanou pro vás uložené, dokud nahlášení nevyřídíte.',
        ],
      },
    ],
  },

  // ─── Pro správce ──────────────────────────────────────────────────────────
  {
    id: 'spravce',
    group: 'spravce',
    title: 'Správa uživatelů a role',
    summary: 'Co může jen správce.',
    tab: 'content-manager',
    blocks: [
      {
        kind: 'list',
        items: [
          'Správa obsahu → „Správa uživatelů“: změna role (student, lektor, správce), úprava jména, zpráva jednomu uživateli nebo „Hromadná zpráva všem“ (přijde do zvonku) a smazání účtu.',
          'Roli velitele třídy nepřidělujte tady — velitele jmenujte na Nástěnce v panelu „Zařazení“.',
          'Jen správce smí přepsat celou banku otázek novou revizí.',
          '„Náhled role“ v profilu ukáže aplikaci očima studenta, velitele nebo lektora. Mění jen zobrazení, ne oprávnění; ukončíte ho tlačítkem „Ukončit náhled“ nebo obnovením stránky.',
        ],
      },
    ],
  },

  // ─── Časté otázky ─────────────────────────────────────────────────────────
  {
    id: 'faq',
    group: 'otazky',
    title: 'Časté otázky',
    summary: 'Rychlé odpovědi na nejčastější situace.',
    blocks: [
      {
        kind: 'list',
        title: 'Vybral(a) jsem špatnou třídu.',
        items: ['Dokud o žádosti nikdo nerozhodl (velitel ani hlasování třídy), změňte ji na Nástěnce tlačítkem „Změnit žádost“. Po zařazení vás přeřadí jen lektor nebo správce.'],
      },
      {
        kind: 'list',
        title: 'Nevidím rozvrh své třídy.',
        items: ['Rozvrh vidí jen členové třídy. Zkontrolujte, že vaše žádost byla schválena. Jestli rozvrh chybí úplně, ještě ho velitel nenahrál.'],
      },
      {
        kind: 'list',
        title: 'Test se mi nezapočítal do XP.',
        items: ['Do XP a odznaků se počítají jen testy s výsledkem alespoň 50 %. Bez připojení test počká v zařízení a odešle se po připojení.'],
      },
      {
        kind: 'list',
        title: 'Nechodí mi upozornění do telefonu.',
        items: ['Zapněte je v profilu v tomto zařízení a povolte je v prohlížeči. Na iPhonu jen z aplikace přidané na plochu.'],
      },
      {
        kind: 'list',
        title: 'Asistent hlásí chybu klíče.',
        items: ['Zkontrolujte API klíč přes tlačítko klíče v záložce AI Asistent, případně si na aistudio.google.com vytvořte nový.'],
      },
      {
        kind: 'list',
        title: 'Našel/našla jsem chybu v otázce.',
        items: ['Pošlete ji přes Zpětnou vazbu s druhem „Chyba / překlep v otázce“ a napište, co je špatně.'],
      },
    ],
  },
];
