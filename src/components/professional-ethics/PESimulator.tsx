import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface SimOption {
  text: string;
  correct: boolean;
  explanation: string;
}

interface DilemmaScenario {
  id: number;
  title: string;
  description: string;
  options: SimOption[];
}

const dilemmaScenarios: DilemmaScenario[] = [
  {
    id: 1,
    title: 'Použití donucovacích prostředků při napadení kolegy',
    description: 'Jste na směně v oddílové chodbě. Odsouzený Petr Novák náhle zaútočí na vašeho kolegu - příslušníka VS ČR - a začne ho fyzicky napadat pěstmi. Kolega padá na zem a hrozí vážné zranění. Jste vyzbrojeni obuškem a pouty.',
    options: [
      {
        text: 'Bezodkladně zakročit a použít přiměřené donucovací prostředky (obušek, hmaty, chvaty) k ochraně kolegy, povolat posilu a neprodleně věc hlásit.',
        correct: true,
        explanation: 'Správně! Dle § 17 odst. 1 písm. b) z. č. 555/1992 Sb. je příslušník oprávněn a povinen použít donucovacích prostředků k ochraně jiné osoby. Nečinnost by byla porušením zákonné povinnosti.'
      },
      {
        text: 'Přivolat pomoc po telefonu a čekat, protože zasahovat samotný je nebezpečné.',
        correct: false,
        explanation: 'Chyba! Příslušník má ze zákona i eticky povinnost chránit životy ohrožených osob. Nečinnost by vedla ke smrti kolegy a byla by hrubým selháním povinností.'
      },
      {
        text: 'Zbraň použít, ale po zneškodnění útočníka mu neposkytovat první pomoc, protože si zranění způsobil sám svým protiprávním útokem.',
        correct: false,
        explanation: 'Chyba! Dle § 20 z. č. 555/1992 Sb. i zásad profesní etiky je příslušník povinen poskytnout první pomoc každé zraněné osobě, i pachateli.'
      }
    ]
  },
  {
    id: 2,
    title: 'Genderový standard osobní prohlídky vstupující osoby',
    description: 'Na hlavní bránu vazební věznice dorazila advokátka k návštěvě klienta. Rámový detektor kovů opakovaně signalizuje přítomnost kovu v oblasti oděvu. Je nutné provést osobní prohlídku.',
    options: [
      {
        text: 'Osobní prohlídku provede příslušnice (žena) za přítomnosti další příslušnice jako svědkyně (celkem 2 ženy). Vyloučí se přítomnost mužů a chráněna je důstojnost i transparentnost.',
        correct: true,
        explanation: 'Přesně tak! Dle § 11 odst. 2 z. č. 555/1992 Sb. a metodiky ZOP provádí prohlídku osoba stejného pohlaví za přítomnosti dalšího svědka stejného pohlaví, aby se předešlo podezření ze zneužití pravomoci.'
      },
      {
        text: 'Osobní prohlídku provede službu konající strážný (muž), pokud má nasazené rukavice.',
        correct: false,
        explanation: 'Chyba! Prohlídku osoby smí provádět výhradně příslušník stejného pohlaví.'
      },
      {
        text: 'Příslušník provede na místě důkladnou intimní prohlídku tělesných dutin.',
        correct: false,
        explanation: 'Chyba! Personál VS ČR nesmí provádět intimní tělesné prohlídky (EVP bod 54.6, § 11 odst. 2) – ty smí provádět výhradně lékař!'
      }
    ]
  },
  {
    id: 3,
    title: 'Střet zájmů a nabídka výhody od rodiny odsouzeného',
    description: 'Po skončení návštěvního dne vás na parkovišti před věznicí osloví manželka odsouzeného z vašeho oddílu. Nabízí vám dárkovou tašku s kvalitní kávou a prémiovým alkoholem se slovy: „To je jen malé poděkování za to, jak jste na manžela hodný."',
    options: [
      {
        text: 'Dar rázně a zdvořile odmítnout, vysvětlit zákaz přijímání jakýchkoli darů dle Čl. 5 Kodexu etiky a bezodkladně sepsat úřední záznam a informovat nadřízeného a oddělení prevence a stížností.',
        correct: true,
        explanation: 'Naprosto správně! Zaměstnanec nesmí přijmout žádné dary ani pozornosti, které by mohly ohrozit nestrannost. Událost musí být neprodleně písemně zaznamenána k ochraně příslušníka před vydíráním.'
      },
      {
        text: 'Dárkovou tašku převzít, protože káva a alkohol mají hodnotu pod 1 000 Kč a nejedná se o hotové peníze.',
        correct: false,
        explanation: 'Hrubá chyba! Zákaz přijímání darů v Čl. 5 Etického kodexu je absolutní. Přijetím daru se příslušník stává zavázaným a otevírá prostor pro vydírání a korupci.'
      },
      {
        text: 'Dar odmítnout, ale nikomu o tom neříkat, aby odsouzený neměl zbytečné problémy.',
        correct: false,
        explanation: 'Chyba! Zatajení takového kontaktu vystavuje příslušníka korupčnímu riziku a podezření z neohlášení protiprávního jednání dle Čl. 7 Kodexu.'
      }
    ]
  },
  {
    id: 4,
    title: 'Nezákonný pokyn nadřízeného na strážním stanovišti',
    description: 'Jste velen se zbraní na strážní stanoviště u vchodu. Přichází nadřízený důstojník a nařizuje vám, abyste mu okamžitě vydal svou nabitou služební zbraň, protože si ji chce prohlédnout, a mezitím pustil do objektu neznámou dodávku bez kontroly dokladů a prohlídky.',
    options: [
      {
        text: 'Pokyn nadřízeného odmítnout splnit, zbraň zásadně nevydat, vozidlo do objektu bez řádné kontroly nevpustit a trvat na dodržení zákona a strážního řádu (příslušník na stanovišti požívá zákonné ochrany a nesmí plnit pokyny v rozporu se zákonem).',
        correct: true,
        explanation: 'Výborně! Dle § 19 a § 28 NGŘ č. 38/2018 Sb. i zákona č. 555/1992 Sb. nesmí pokyn nadřízeného odporovat zákonným povinnostem stráže na stanovišti. Strážný zbraň nevydává a kontrolu provést musí.'
      },
      {
        text: 'Okamžitě odevzdat zbraň a vpustit dodávku, protože rozkaz nadřízeného má vždy přednost před všemi zákony.',
        correct: false,
        explanation: 'Závažné selhání! Příslušník nesmí uposlechnout rozkaz, kterým by zjevně spáchal trestný čin nebo porušil bezpečnost střeženého objektu (§ 46 zákona o služebním poměru).'
      },
      {
        text: 'Opustit stanoviště a jít si stěžovat na ředitelství věznice.',
        correct: false,
        explanation: 'Chyba! Samovolné opuštění strážního stanoviště se zbraní je závažným porušením služební kázně i trestným činem.'
      }
    ]
  }
];

export const PESimulator: React.FC = () => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [selectedSimOption, setSelectedSimOption] = useState<number | null>(null);
  const [simSubmitted, setSimSubmitted] = useState<boolean>(false);
  const [simScore, setSimScore] = useState<number>(0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 print:bg-white p-6 print:p-4 rounded-2xl border border-slate-800 print:border-slate-300 space-y-5 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 print:border-slate-300 pb-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 print:text-slate-900 uppercase tracking-wider block">Modelová situace #{activeScenarioIdx + 1} ze {dilemmaScenarios.length}</span>
            <h3 className="font-bold text-white print:text-[#111827] text-lg mt-0.5">{dilemmaScenarios[activeScenarioIdx].title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 print:text-slate-700 font-mono">Skóre: {simScore} bodů</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 print:bg-slate-50 border border-slate-700 print:border-slate-300 text-xs md:text-sm text-slate-200 print:text-[#111827] leading-relaxed">
          <strong className="text-white print:text-slate-900 block mb-1.5 font-semibold">Popis služební situace:</strong>
          {dilemmaScenarios[activeScenarioIdx].description}
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 print:text-slate-700 block">Zvolte správný profesně-etický a zákonný postup:</span>
          {dilemmaScenarios[activeScenarioIdx].options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => { if (!simSubmitted) setSelectedSimOption(idx); }}
              className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all cursor-pointer ${
                selectedSimOption === idx
                  ? simSubmitted
                    ? opt.correct
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 print:bg-emerald-50 print:border-emerald-600 print:text-emerald-950'
                      : 'bg-red-950/60 border-red-500 text-red-200 print:bg-red-50 print:border-red-600 print:text-red-950'
                    : 'bg-emerald-500/10 border-emerald-500 text-white print:bg-emerald-50 print:border-emerald-600 print:text-emerald-950'
                  : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 text-slate-300 print:bg-white print:border-slate-300 print:text-[#111827]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${selectedSimOption === idx ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 print:bg-slate-100 text-slate-300 print:text-slate-900'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-relaxed">{opt.text}</span>
              </div>
            </button>
          ))}
        </div>

        {simSubmitted && selectedSimOption !== null && (
          <div className={`p-4 rounded-xl border text-xs md:text-sm leading-relaxed ${
            dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].correct
              ? 'bg-emerald-950/40 print:bg-emerald-50 border-emerald-500/50 print:border-emerald-600 text-emerald-200 print:text-emerald-950'
              : 'bg-red-950/40 print:bg-red-50 border-red-500/50 print:border-red-600 text-red-200 print:text-red-950'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1.5">
              {dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].correct ? (
                <><CheckCircle2 className="w-5 h-5 text-emerald-400 print:text-emerald-800" /><span>Správné řešení!</span></>
              ) : (
                <><AlertTriangle className="w-5 h-5 text-red-400 print:text-red-800" /><span>Nesprávný postup</span></>
              )}
            </div>
            <p>{dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].explanation}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 print:border-slate-300 no-print print:hidden">
          <button
            disabled={activeScenarioIdx === 0}
            onClick={() => { setActiveScenarioIdx(prev => prev - 1); setSelectedSimOption(null); setSimSubmitted(false); }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
          >
            Předchozí situace
          </button>

          {!simSubmitted ? (
            <button
              disabled={selectedSimOption === null}
              onClick={() => {
                setSimSubmitted(true);
                if (selectedSimOption !== null && dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].correct) {
                  setSimScore(prev => prev + 15);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm disabled:opacity-40 cursor-pointer"
            >
              Vyhodnotit rozhodnutí
            </button>
          ) : (
            <button
              onClick={() => {
                if (activeScenarioIdx < dilemmaScenarios.length - 1) {
                  setActiveScenarioIdx(prev => prev + 1);
                } else {
                  setActiveScenarioIdx(0);
                }
                setSelectedSimOption(null);
                setSimSubmitted(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm cursor-pointer"
            >
              {activeScenarioIdx < dilemmaScenarios.length - 1 ? 'Další modelová situace' : 'Začít znovu od 1. situace'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PESimulator;
