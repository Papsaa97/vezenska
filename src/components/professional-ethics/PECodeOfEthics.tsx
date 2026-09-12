import React from 'react';
import { Award, FileText } from 'lucide-react';

export const PECodeOfEthics: React.FC = () => {
  const desatero = [
    { num: 'I.', title: 'Etické zvažování', desc: 'Každou situaci zvažujeme podle etických zásad a při pochybnostech žádáme o radu nadřízené.' },
    { num: 'II.', title: 'Profesionalita', desc: 'Chováme se profesionálně vůči všem osobám (vězňům, kolegům, nadřízeným, soudcům).' },
    { num: 'III.', title: 'Mlčenlivost', desc: 'Důsledně chráníme důvěrné informace a osobní údaje před nepovolanými osobami.' },
    { num: 'IV.', title: 'Týmová spolupráce', desc: 'Vážíme si spolupráce v týmu a respektujeme všechny kolegy a členy personálu.' },
    { num: 'V.', title: 'Nulová diskriminace', desc: 'Jsme striktně proti jakékoli formě diskriminace (rasa, pohlaví, víra, majetek).' },
    { num: 'VI.', title: 'Zákaz darů a výhod', desc: 'Nepřijímáme ani nevyžadujeme dary, výhody ani pozornosti spojené s výkonem funkce.' },
    { num: 'VII.', title: 'Předcházení střetu', desc: 'Aktivně předcházíme střetu zájmů a okamžitě hlásíme možnou podjatost.' },
    { num: 'VIII.', title: 'Ochrana majetku', desc: 'Bráníme škodám, podvodům, zpronevěrám a neoprávněnému obohacování.' },
    { num: 'IX.', title: 'Integrita a čest', desc: 'Jsme čestní, objektivní, nestranní a za všech okolností nekompromitovaní.' },
    { num: 'X.', title: 'Důvěra veřejnosti', desc: 'Usilujeme o transparentnost a budujeme důvěru veřejnosti k VS ČR jako pilíři spravedlnosti.' },
  ];

  const articles = [
    {
      art: 'Článek 1', title: 'Zákonnost a mezinárodní soulad',
      text: 'Zaměstnanec VS ČR vykonává profesi ve shodě s Ústavou ČR, Listinou základních práv a svobod, zákony, právem EU, doporučeními Evropských vězeňských pravidel (EVP) a mezinárodními smlouvami.',
      note: 'Stanovuje univerzální právní a etický rámec činnosti sboru.',
    },
    {
      art: 'Článek 2', title: 'Profesionalita, lidská důstojnost a vzdělávání',
      text: '(1) Povinností zaměstnance je jednat profesionálně, svědomitě, nestranně a ve vztahu ke všem osobám ctít lidskou důstojnost a princip rovného zacházení. (2) Odpovídá za úroveň svého výkonu, plní pokyny nadřízených vydané v souladu s kodexem, dbá o hospodárnost a své vzdělání si průběžně prohlubuje.',
      note: 'Důraz na celoživotní vzdělávání a zákaz vzniku zbytečných nákladů státu.',
    },
    {
      art: 'Článek 3', title: 'Důvěryhodnost a vystupování na veřejnosti',
      text: '(1) Profesní etika je neslučitelná s šířením urážek, pomluv nebo nepodložených obvinění vůči orgánům veřejné moci a kolegům. (2) Chová se tak, aby nediskreditoval sebe ani VS ČR. (3) Při výkonu služby je vždy vhodně oblečen a upraven.',
      note: 'Ochrana dobrého jména Vězeňské služby a dodržování služební zdvořilosti.',
    },
    {
      art: 'Článek 4', title: 'Zdvořilost a zákaz diskriminace',
      text: 'Zaměstnanec je vždy zdvořilý, tolerantní a vylučuje diskriminaci na základě pohlaví, rasy, barvy pleti, jazyka, víry, politického smýšlení či sociálního původu. S vězněnými osobami jedná korektně.',
      note: 'Korektnost a respekt k lidským právům bez ohledu na charakter trestné činnosti vězně.',
    },
    {
      art: 'Článek 5', title: 'Zákaz korupčního jednání a nepřijímání darů',
      text: '(1) Jakékoliv korupční jednání je neslučitelné s výkonem služby. (2) Zaměstnanec nevyžaduje a nesmí přijmout žádné dary ani zvýhodnění, která by mohla ovlivnit nestrannost. Nenabízí výhody spojené s postavením a neuvádí se do stavu závazku.',
      note: 'Absolutní zákaz přijetí jakýchkoli darů od vězňů, rodin nebo dodavatelů.',
    },
    {
      art: 'Článek 6', title: 'Ochrana osobních údajů a mlčenlivost',
      text: 'Zaměstnanec je povinen dodržovat zásady ochrany osobních údajů a zachovávat mlčenlivost o skutečnostech, o nichž se dozvěděl při výkonu své profese a které mají zůstat utajeny.',
      note: 'Ochrana dat z VIS, spisové služby a prevence komoditizace informací.',
    },
    {
      art: 'Článek 7', title: 'Ohlašovací povinnost při neetickém jednání (Whistleblowing)',
      text: 'Zjistí-li zaměstnanec ztrátu, neodpovědné hospodaření s majetkem, podvodné nebo korupční jednání, anebo se na něm vyžaduje neetické či protiprávní jednání, oznámí toto bez zbytečného odkladu.',
      note: 'Právní a etická povinnost aktivně ohlásit nekalé praktiky a tlaky.',
    },
    {
      art: 'Článek 8', title: 'Právní závaznost a služební kázeň',
      text: 'Etický kodex navazuje na povinnosti ze služebního poměru / zákoníku práce. Nerespektování zásad tohoto kodexu je posuzováno a trestáno jako porušení služební kázně nebo pracovních povinností.',
      note: 'Kodex není pouhým doporučením, ale přímou součástí hodnocení kázně.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Desatero Zásad Banner */}
      <div className="bg-slate-900 border border-slate-800 print:border-slate-300 rounded-2xl p-6 print:p-4 print-card break-inside-avoid print:bg-white print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
        <h2 className="text-lg font-bold text-white print:text-[#111827] flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-emerald-400 print:text-slate-900" />
          <span>Desatero etických zásad příslušníka a zaměstnance VS ČR</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 print:grid-cols-2 gap-3 text-xs">
          {desatero.map(item => (
            <div key={item.num} className="bg-slate-800/80 print:bg-slate-50 p-3.5 rounded-xl border border-slate-700 print:border-slate-300 print-card break-inside-avoid print:text-[#111827] flex flex-col justify-between" style={{ breakInside: 'avoid' }}>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-bold text-emerald-400 print:text-slate-900 font-mono">{item.num}</span>
                  <h4 className="font-bold text-white print:text-[#111827]">{item.title}</h4>
                </div>
                <p className="text-slate-300 print:text-[#111827] leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8 Articles */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white print:text-[#111827] flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400 print:text-slate-900" />
          <span>Znění Kodexu profesní etiky (Příloha č. 6 k NGŘ č. 28/2018 Sb.)</span>
        </h3>

        {articles.map(art => (
          <div key={art.art} className="bg-slate-900/90 border border-slate-800 print:border-slate-300 p-5 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 print-card break-inside-avoid print:bg-white print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 print:bg-slate-100 text-emerald-300 print:text-slate-900 font-mono text-xs font-bold border border-emerald-500/30 print:border-slate-300">
                  {art.art}
                </span>
                <h4 className="font-bold text-white print:text-[#111827] text-sm md:text-base">{art.title}</h4>
              </div>
              <p className="text-xs md:text-sm text-slate-300 print:text-[#111827] leading-relaxed pt-1">
                {art.text}
              </p>
            </div>
            <div className="md:w-64 bg-slate-800/80 print:bg-slate-50 p-3 rounded-xl border border-slate-700/60 print:border-slate-300 text-xs text-slate-300 print:text-[#111827] shrink-0">
              <span className="text-emerald-400 print:text-slate-900 font-semibold block mb-1">Aplikační význam:</span>
              {art.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PECodeOfEthics;
