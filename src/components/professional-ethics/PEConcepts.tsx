import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';

type ConceptCategory = 'all' | 'normative' | 'corruption' | 'rights' | 'service';

interface Concept {
  id: number;
  term: string;
  category: Exclude<ConceptCategory, 'all'>;
  shortDef: string;
  detail: string;
  badge: string;
}

const conceptsList: Concept[] = [
  { id: 1, term: 'Etika', category: 'normative', shortDef: 'Praktická filozofická disciplína, věda o správném způsobu života a teorie normativních systémů.', detail: 'Hledá a formuluje pravidla pro harmonické, spravedlivé a vzájemně prospěšné soužití lidí ve společnosti. Směřuje k neměnným etickým pravidlům a zkoumá směřování k nejvyššímu etickému cíli (dobru).', badge: 'Základní pojem' },
  { id: 2, term: 'Etický cíl', category: 'normative', shortDef: 'Ideový směr zaměřený k absolutnímu dobru.', detail: 'Nemá materiální podstatu, není to dosažitelný bod, ale směr a celoživotní kompas. Podle směru k etickému cíli řadíme hodnoty do hodnotových žebříčků a poměřujeme své úmysly a činy.', badge: 'Axiologie' },
  { id: 3, term: 'Axiologie', category: 'normative', shortDef: 'Etická disciplína zabývající se vědou o hodnotách (z řeckého axia = hodnota).', detail: 'Zkoumá procesy vzniku hodnot, jejich třídění na materiální a nemateriální a uspořádání do hodnotových žebříčků. U zralého člověka stojí nejvýše nemateriální hodnoty (život, spravedlnost, čest).', badge: 'Axiologie' },
  { id: 4, term: 'Deontologie', category: 'normative', shortDef: 'Etická nauka o povinnostech (z řeckého deon = povinnost / to, co je správné).', detail: 'Zabývá se vytvářením žebříčku a pořadí plnění povinností odvozených z hodnotového žebříčku. Profesní deontologie stanovuje etické povinnosti a standardy příslušníka bezpečnostního sboru.', badge: 'Deontologie' },
  { id: 5, term: 'Hodnoty', category: 'normative', shortDef: 'Cokoli, k čemu osoba svobodně a dobrovolně zaujme pozitivní vztah.', detail: 'Dělí se na materiální (majetek, peníze) a nemateriální (láska k lidem, spravedlnost, pravda, důstojnost). Z hodnot se rodí plnění povinností.', badge: 'Axiologie' },
  { id: 6, term: 'Povinnosti', category: 'normative', shortDef: 'Požadavky a závazky k jednání, které člověk naplňuje a vytváří tak další hodnoty.', detail: 'Plněním povinností se zabývá deontologie. Ve službě jsou povinnosti konkretizovány zákony (z. č. 555/1992 Sb., z. č. 361/2003 Sb.) a Etickým kodexem.', badge: 'Deontologie' },
  { id: 7, term: 'Deskriptivní etika', category: 'normative', shortDef: 'Disciplína, která věcně popisuje reálné etické kontexty situací bez jejich hodnocení.', detail: 'Analyzuje zúčastněné osoby, čas, místo, vztahy a reálné chování lidí. Na jejím základě pak normativní etika stanovuje, jaké by jednání mělo být.', badge: 'Metodologie' },
  { id: 8, term: 'Normativní systém', category: 'normative', shortDef: 'Souhrn hodnotících sankcí, pravidel a vzorů regulujících lidské chování.', detail: 'Společnost stojí na třech provázaných vrstvách normativních systémů: mravnost (svědomí), morálka (společenské zvyklosti) a právo (státní donucení).', badge: 'Základní pojem' },
  { id: 9, term: 'Mravnost', category: 'normative', shortDef: 'Vnitřní, individuální normativní systém opírající se výhradně o svědomí.', detail: 'Svědomí je jedinou interní pozitivní i negativní sankcí (čisté svědomí vs. pocit viny a výčitky). Mravnost je nezávislá na vnějším pozorování.', badge: 'Normativní systém' },
  { id: 10, term: 'Morálka', category: 'normative', shortDef: 'Normativní systém opírající se o nepsané společenské zvyklosti, tradice a kulturu.', detail: 'Reguluje vnější chování pomocí pozitivních (uznání, respekt) a negativních (odsouzení, ostrakizace) sociálních sankcí. Hrozí u ní riziko tzv. dvojí morálky a pokrytectví.', badge: 'Normativní systém' },
  { id: 11, term: 'Kodifikované právo', category: 'normative', shortDef: 'Formální normativní systém psaných právních norem s legitimní donucovací mocí státu.', detail: 'Nastupuje tam, kde mravnost a morálka nestačí zabránit nebezpečným činům. Opírá se o státem vynucované vnější sankce (tresty, pokuty, ochrana práv).', badge: 'Normativní systém' },
  { id: 12, term: 'Autorita přirozená a formální', category: 'service', shortDef: 'Rozlišení autority plynoucí z osobních kvalit vs. autority dané služebním zařazením.', detail: 'Formální autorita vychází z hodnosti a funkce. Přirozená autorita je založena na odbornosti, morální integritě, spravedlivém přístupu a schopnosti jít příkladem.', badge: 'Služební etika' },
  { id: 13, term: 'Vzory pro socializaci člověka', category: 'normative', shortDef: 'Osoby a instituce ovlivňující osvojování společenských a etických norem.', detail: 'Primární socializace probíhá v rodině, sekundární ve škole, vrstevnických skupinách a profesním prostředí. Příslušník VS ČR musí působit jako pozitivní vzor.', badge: 'Socializace' },
  { id: 14, term: 'Právní vědomí', category: 'normative', shortDef: 'Znalost platného práva spojená s vnitřním postojem k jeho dodržování.', detail: 'Neznamená pouze pasivní znalost paragrafů, ale míru ztotožnění se se smyslem zákonů a ochotu dobrovolně a čestně je v praxi uplatňovat.', badge: 'Právní stát' },
  { id: 15, term: 'Sankce', category: 'normative', shortDef: 'Následky jednání sloužící k upevnění normativního systému.', detail: 'Dělí se na vnitřní (svědomí) a vnější (společenské či právní), a zároveň na pozitivní (odměna, pochvala, statut) a negativní (trest, pokuta, zavržení).', badge: 'Normativní systém' },
  { id: 16, term: 'Kompetence', category: 'service', shortDef: 'Zákonem svěřená oprávnění a povinnosti k výkonu konkrétních úkolů.', detail: 'Příslušník smí uplatňovat státní moc pouze v mezích zákona (§ 6 z. č. 555/1992 Sb., Čl. 2 odst. 2 Ústavy) a nesmí své kompetence překročit ani zneužít.', badge: 'Služební etika' },
  { id: 17, term: 'Asertivita', category: 'service', shortDef: 'Schopnost klidně, pevně a slušně prosazovat zákonné požadavky bez agrese a pasivity.', detail: 'Založena na sebeúctě a respektu k právům druhých. Slouží jako obrana proti manipulaci a zastrašování; příslušník neustupuje z oprávněných požadavků.', badge: 'Komunikace' },
  { id: 18, term: 'Korupce', category: 'corruption', shortDef: 'Zneužití postavení a pravomoci k získání neoprávněného prospěchu pro sebe či jiného.', detail: 'Výsledkem je nenárokový zisk obou stran (korumpujícího i korumpovaného) na úkor veřejného zájmu. Trestá se dle § 331–333 TZ (sazby až 12 let).', badge: 'Protikorupční' },
  { id: 19, term: 'Klientelismus', category: 'corruption', shortDef: 'Systém neformálních vazeb založený na poskytování vzájemných protislužeb a výhod.', detail: 'Obchází standardní transparentní procedury (např. při veřejných zakázkách nebo přidělování pracovních pozic) a poškozuje rovnost šancí.', badge: 'Protikorupční' },
  { id: 20, term: 'Informace se stávají komoditou', category: 'corruption', shortDef: 'Rizikový jev, kdy jsou neveřejné úřední informace zpeněžovány nebo směňovány za výhody.', detail: 'Úniky z VIS, osobních spisů nebo o umístění vězňů představují zásadní bezpečnostní a korupční ohrožení. Vyžaduje přísnou mlčenlivost dle § 9 a § 23a.', badge: 'Bezpečnost' },
  { id: 21, term: 'Ochrana osobních údajů (GDPR)', category: 'rights', shortDef: 'Zákonná ochrana dat o vězněných osobách, zaměstnancích a třetích subjektech.', detail: 'Příslušník má přístup jen k údajům nezbytným pro službu. Neoprávněné nahlížení nebo předávání údajů bez právního zájmu je přísně sankcionováno.', badge: 'Legislativa' },
  { id: 22, term: 'Katalog korupčních rizik', category: 'corruption', shortDef: 'Příloha NGŘ č. 28/2018 Sb. definující riziková místa ve VS ČR a jejich eliminaci.', detail: 'Obsahuje přehled činností, rizik, pravděpodobnost (1–5), dopad (1–5), celkovou míru rizika (1–25) a konkrétní kontrolní protikorupční opatření.', badge: 'Protikorupční' },
  { id: 23, term: 'Předsudek a rovný přístup', category: 'rights', shortDef: 'Požadavek nestranného jednání bez apriorních negativních soudů o osobách.', detail: 'Dle Čl. 3 Listiny a Čl. 4 Etického kodexu nesmí být nikdo diskriminován pro rasu, národnost, pohlaví, víru či majetek. S vězni se jedná korektně.', badge: 'Lidská práva' },
  { id: 24, term: 'Genderový stereotyp a předsudek', category: 'rights', shortDef: 'Zjednodušující představy o rolích mužů a žen v bezpečnostním sboru i věznici.', detail: 'VS ČR garantuje rovné postavení žen a mužů ve službě i specifická ochranná opatření pro vězněné ženy a matky s dětmi dle EVP a Bangkokských pravidel.', badge: 'Lidská práva' },
  { id: 25, term: 'Osobní prohlídka a gender', category: 'service', shortDef: 'Pravidlo provádění osobních prohlídek výhradně osobou stejného pohlaví.', detail: 'Při prohlídce civilisty/občana musí být přítomni 2 příslušníci stejného pohlaví jako prohlížená osoba (jeden provádí, druhý svědčí). Intimní prohlídky smí provádět pouze lékař.', badge: 'Bezpečnostní služba' },
  { id: 26, term: 'OSN (New York, Ženeva)', category: 'rights', shortDef: 'Organizace spojených národů garantující univerzální ochranu lidských práv.', detail: 'Centrála v New Yorku, Výbor proti mučení s evropskou pobočkou v Ženevě. Vydává globální standardy pro vězeňství (Mandelova a Bangkokská pravidla).', badge: 'Mezinárodní' },
  { id: 27, term: 'Mandelova pravidla OSN', category: 'rights', shortDef: 'Standardní minimální pravidla OSN pro zacházení s vězni (1955/1957, revize 2015).', detail: 'Pojmenována na počest Nelsona Mandely. Stanovují globální minimum pro ubytování, hygienu, lékařskou péči, zákaz mučení a lidskou důstojnost.', badge: 'Mezinárodní' },
  { id: 28, term: 'Rada Evropy (Štrasburk)', category: 'rights', shortDef: 'Mezinárodní evropská organizace chránící demokracii a lidská práva (založena 1949).', detail: 'Sídlí ve Štrasburku. Přijala Úmluvu o lidských právech, Evropská vězeňská pravidla a zřídila soudní (ESLP) i inspekční (CPT) orgány.', badge: 'Mezinárodní' },
  { id: 29, term: 'CPT (Výbor pro prevenci mučení)', category: 'rights', shortDef: 'Evropský výbor pro prevenci mučení a nelidského či ponižujícího zacházení.', detail: 'Orgán Rady Evropy ve Štrasburku. Vysílá nezávislé inspekční delegace do věznic (periodicky 1x za 5 let nebo ad hoc) a publikuje zprávy o stavu vězeňství.', badge: 'Mezinárodní' },
  { id: 30, term: 'Evropská vězeňská pravidla (EVP)', category: 'rights', shortDef: 'Doporučení Rec(2006)2-rev Rady Evropy (aktualizováno Výborem ministrů 1. 7. 2020).', detail: 'Náročnější evropský standard zacházení s vězni; klade důraz na normalizaci života, dynamickou bezpečnost, vzdělávání personálu a zákaz ponižování.', badge: 'Mezinárodní' },
  { id: 31, term: 'Nevládní organizace (NGO)', category: 'rights', shortDef: 'Nezávislé občanské organizace sledující dodržování lidských práv.', detail: 'Nejsou státními institucemi. V ČR působí zejména Český helsinský výbor a Amnesty International, které monitorují stav vězeňství a pomáhají obětem.', badge: 'Občanská společnost' },
  { id: 32, term: 'Ústavní zákon č. 1/1993 Sb.', category: 'rights', shortDef: 'Ústava České republiky – základní zákon státu definující dělbu moci a právní stát.', detail: 'Zakotvuje svrchovanost lidu, dělbu moci (zákonodárná, výkonná, soudní) a v Čl. 10 přednost mezinárodních smluv o lidských právech před zákonem.', badge: 'Ústava ČR' },
  { id: 33, term: 'Ústavní zákon č. 2/1993 Sb.', category: 'rights', shortDef: 'Listina základních práv a svobod – součást ústavního pořádku ČR.', detail: 'Garantuje nezadatelná lidská práva (právo na život, lidskou důstojnost, zákaz mučení Čl. 7, osobní svobodu Čl. 8, zákaz diskriminace Čl. 3).', badge: 'Ústava ČR' },
  { id: 34, term: 'Použití zbraně v etických kontextech', category: 'service', shortDef: 'Aplikace § 18 zákona č. 555/1992 Sb. a prolomení imperativu „Nezabiješ" při obraně životů.', detail: 'Stát zákonem zmocňuje příslušníka k použití zbraně při odvrácení smrtelného útoku nebo útěku nebezpečného vězně. Příslušník musí šetřit život a poskytnout první pomoc.', badge: 'Služební etika' },
  { id: 35, term: 'Zákonná ochrana na strážním stanovišti', category: 'service', shortDef: 'Specifické právní postavení ozbrojeného strážného veleného na stanoviště.', detail: 'Všechny osoby (včetně nadřízených) jsou povinny řídit se pokyny strážného. Nadřízený nesmí vydat nezákonný pokyn ani odvracet jeho pozornost či žádat zbraň.', badge: 'Bezpečnostní služba' },
  { id: 36, term: 'Kodex profesní etiky VS ČR', category: 'service', shortDef: 'Příloha č. 6 k NGŘ č. 28/2018 Sb. obsahující 8 závazných článků pro personál.', detail: 'Stanovuje etické standardy profesionality, nestrannosti, odmítání korupce a ochranu důstojnosti. Jeho porušení je kvalifikováno jako porušení služební kázně.', badge: 'Předpis VS ČR' },
];

export const PEConcepts: React.FC = () => {
  const [conceptFilter, setConceptFilter] = useState<ConceptCategory>('all');
  const [conceptSearch, setConceptSearch] = useState('');
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number | null>(null);

  const filteredConcepts = conceptsList.filter(c => {
    const matchesCategory = conceptFilter === 'all' || c.category === conceptFilter;
    const matchesSearch =
      c.term.toLowerCase().includes(conceptSearch.toLowerCase()) ||
      c.shortDef.toLowerCase().includes(conceptSearch.toLowerCase()) ||
      c.detail.toLowerCase().includes(conceptSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filterButtons: { value: ConceptCategory; label: string }[] = [
    { value: 'all', label: 'Vše (36)' },
    { value: 'normative', label: 'Normativní systémy & Axiologie' },
    { value: 'corruption', label: 'Protikorupční pojmy' },
    { value: 'rights', label: 'Lidská práva & Ústava' },
    { value: 'service', label: 'Služební etika & Gender' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 no-print print:hidden">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setConceptFilter(btn.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                conceptFilter === btn.value
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={conceptSearch}
            onChange={e => setConceptSearch(e.target.value)}
            placeholder="Hledat v 36 pojmech..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
        {filteredConcepts.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedConceptIndex(selectedConceptIndex === item.id ? null : item.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative group print-card break-inside-avoid print:bg-white print:text-[#111827] print:border-slate-300 print:p-4 print:mb-3 print:shadow-none ${
              selectedConceptIndex === item.id
                ? 'bg-slate-800/95 border-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/80 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
            }`}
            style={{ breakInside: 'avoid' }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 print:bg-slate-100 text-emerald-400 print:text-slate-900 flex items-center justify-center text-xs font-bold font-mono border border-emerald-500/30 print:border-slate-300">
                  {item.id}
                </span>
                <h3 className="font-bold text-base text-white print:text-[#111827] group-hover:text-emerald-300 transition-colors">
                  {item.term}
                </h3>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 print:bg-slate-100 text-slate-300 print:text-slate-800 border border-slate-700 print:border-slate-300">
                {item.badge}
              </span>
            </div>

            <p className="text-xs text-slate-300 print:text-[#111827] leading-relaxed line-clamp-3 print:line-clamp-none">
              {item.shortDef}
            </p>

            <div className={`${selectedConceptIndex === item.id ? 'block' : 'hidden print:block'} mt-3 pt-2.5 border-t border-slate-700/60 print:border-slate-200 text-xs text-emerald-200/90 print:text-[#111827] space-y-2 animate-fadeIn`}>
              <p className="leading-relaxed bg-emerald-950/40 print:bg-slate-50 p-2.5 rounded-xl border border-emerald-500/30 print:border-slate-200 print:text-[#111827]">
                <strong className="text-emerald-300 print:text-slate-900 block mb-0.5">Podrobný rozbor a penitenciární aplikace:</strong>
                {item.detail}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 no-print print:hidden">
              <span className="text-emerald-400 font-medium">
                {selectedConceptIndex === item.id ? 'Kliknutím sbalit' : 'Klikněte pro podrobnosti'}
              </span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedConceptIndex === item.id ? 'rotate-90' : ''}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PEConcepts;
