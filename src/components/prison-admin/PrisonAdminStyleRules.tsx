import React, { useState, useCallback } from 'react';
import { CheckCircle2, RefreshCw, Check } from 'lucide-react';
import { updateDailyStreak } from '../../utils/gamification';
import { activateOnKey } from '../../utils/a11y';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface StyleExerciseSegment {
  id: number;
  text: string;
  isError: boolean;
  correction: string;
}

interface StyleExercise {
  title: string;
  badge: string;
  instruction: string;
  originalTextSegments: StyleExerciseSegment[];
}

// ─── Static data ───────────────────────────────────────────────────────────────

const STYLE_EXERCISES: StyleExercise[] = [
  {
    title: 'Hledání chyb ve Služebním záznamu',
    badge: 'Cvičení 1: Služební záznam',
    instruction: 'V níže uvedeném textu označte všechny závažné chyby proti metodice VS ČR (kliknutím na problematická místa):',
    originalTextSegments: [
      { id: 1, text: 'Včera odpoledne kolem třetí hodiny ', isError: true, correction: 'Chyba: Vágní časové určení. Správně: „Dne 14.03.2024 v čase 15:10 hod."' },
      { id: 2, text: 'jsme byli s kolegou na oddíle ', isError: true, correction: 'Chyba: 1. osoba množného čísla bez uvedení rozkazu. Správně: „Dne ... jsem byl velen rozkazem... byl jsem přítomen s prap. Novákem..."' },
      { id: 3, text: 'a viděli jsme tam tohoto vězně, jak dělal bordel na cele. ', isError: true, correction: 'Chyba: Nespisovný a obecný výraz („bordel", „tento vězeň"). Správně: „ods. Petr Král, nar. ..., kopal do dveří cely č. 12."' },
      { id: 4, text: 'Řekl jsem mu, ať se uklidní, jinak dostane. ', isError: true, correction: 'Chyba: Chybí přesná zákonná výzva a citace. Správně: „Použil jsem zákonnou výzvu dle § 6 odst. 3 písm. b) z. č. 555/1992 Sb. slovy: ..."' },
      { id: 5, text: 'Potom jsme ho odvedli k doktorovi a bylo to nahlášeno.', isError: true, correction: 'Chyba: Neurčitý časový sled a anonymní trpný rod. Správně: Uvést přesný čas předvedení k MUDr. a konkrétní orgány, kterým byla událost ohlášena (ISS-O, VISS).' }
    ]
  },
  {
    title: 'Hledání chyb v Záznamu o kázeňském přestupku',
    badge: 'Cvičení 2: Kázeňský přestupek',
    instruction: 'Najděte nedostatky v popisu skutku a právní kvalifikaci:',
    originalTextSegments: [
      { id: 1, text: 'Dne 10.02.2024 v čase 09:15 jsem zjistil odsouzeného Jana Malého na ložnici č. 201, ', isError: false, correction: 'V pořádku (přesný datum, čas, jméno i místo).' },
      { id: 2, text: 'který porušil vnitřní řád věznice tím, že neměl uklizeno. ', isError: true, correction: 'Chyba: Nelze uvést POUZE porušení Vnitřního řádu! Vždy musí být uvedeno porušení zákonné povinnosti dle § 28 zákona č. 169/1999 Sb.' },
      { id: 3, text: 'Odsouzený mi řekl, že na to kašle a uklízet nebude. ', isError: true, correction: 'Chyba: Chybí doslovná přímá řeč v uvozovkách. Správně: užil slov, cituji: „..."' },
      { id: 4, text: 'Odsouzený odmítl se k věci vyjádřit, tak jsem to nechal být a podepsal sám bez svědků.', isError: true, correction: 'Chyba: Do protokolu se musí výslovně zapsat, že odsouzený odmítl vyjádření/podpis, a uvést svědky přítomné incidentu.' }
    ]
  }
];

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Sekce "7 pravidel úředního stylu & Kontrola chyb" extrahovaná z PrisonAdministration.
 * Obsahuje vlastní lokální state pro interaktivní cvičení (výběr cvičení,
 * označení chyb, vyhodnocení).
 */
export default function PrisonAdminStyleRules() {
  const [selectedExercise, setSelectedExercise] = useState<number>(0);
  const [userErrorsFound, setUserErrorsFound] = useState<number[]>([]);
  const [exerciseChecked, setExerciseChecked] = useState(false);

  const currentExerciseData = STYLE_EXERCISES[selectedExercise];

  const handleToggleErrorSegment = useCallback((segmentId: number) => {
    setUserErrorsFound(prev => {
      if (exerciseChecked) return prev;
      return prev.includes(segmentId) ? prev.filter(id => id !== segmentId) : [...prev, segmentId];
    });
  }, [exerciseChecked]);

  const handleCheckExercise = useCallback(() => {
    setExerciseChecked(true);
    updateDailyStreak();
  }, []);

  const handleResetExercise = useCallback(() => {
    setUserErrorsFound([]);
    setExerciseChecked(false);
  }, []);

  return (
    <div className="space-y-6 no-print print:hidden">

      {/* The 7 Golden Rules */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Metodika tvorby úředních písemností VS ČR
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            7 základních požadavků kladených na úřední písemnost
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">

          {[
            { num: '1', title: 'Spisovná čeština a odbornost', desc: 'Užití spisovného jazyka včetně přesné terminologie bezpečnostního sboru. Žádné hovorové výrazy ani slang.' },
            { num: '2', title: '1. osoba jednotného čísla', desc: 'Vždy minulý čas: „Já jsem viděl, zjistil, vyzval, zajistil..." (nikoli neurčitý trpný rod nebo množné číslo).' },
            { num: '3', title: 'Max. 3 věty v souvětí', desc: 'Krátká, srozumitelná souvětí zabraňující zkreslení výpovědi a zmatení chronologického děje.' },
            { num: '4', title: 'Konkrétní čas a místo', desc: 'Zákaz vágních příslovcí (tam, zde, v odpoledních hodinách, asi, hned, potom). Vždy uvést přesný čas a číslo ložnice/cely.' },
            { num: '5', title: 'Zákaz vycpávkových slov', desc: 'Nepoužívat bezobsahová ukazovací zájmena (ten, tento, onen, jakoby).' },
            { num: '6', title: 'Přesný pravopis přímé řeči', desc: 'Doslovná citace verbálních projevů a vulgarismů v uvozovkách: „Sledujte dobře, jak se píší mezery v přímé řeči."' },
          ].map(({ num, title, desc }) => (
            <div key={num} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span>{num}. {title}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">{desc}</p>
            </div>
          ))}

        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
          <div className="font-bold text-amber-700 dark:text-amber-300">
            7. Kompletní podpisová doložka příslušníka:
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-mono text-[11px]">
            vlastnoruční podpis<br />
            <strong>v. ref. strm. Bc. Jan Novák, DiS., sl. č. 12345, strážný</strong><br />
            <span className="text-[10px] text-slate-500">(služ. hodnost, hodn. označení, titul, jméno, příjmení, služební číslo, služební zařazení / funkce)</span>
          </p>
        </div>

      </div>

      {/* Interactive Error Detection Training Exercise */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Tréninkový modul
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {currentExerciseData.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {STYLE_EXERCISES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedExercise(idx);
                  handleResetExercise();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedExercise === idx
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {ex.badge}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          {currentExerciseData.instruction}
        </p>

        {/* Clickable text segments */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 leading-loose text-sm font-serif">
          {currentExerciseData.originalTextSegments.map(seg => {
            const isSelected = userErrorsFound.includes(seg.id);
            let badgeClass = 'hover:bg-amber-200/50 dark:hover:bg-amber-900/40 rounded px-1 cursor-pointer transition-colors';

            if (exerciseChecked) {
              if (seg.isError && isSelected) {
                badgeClass = 'bg-emerald-200 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold px-1 rounded ring-1 ring-emerald-500';
              } else if (seg.isError && !isSelected) {
                badgeClass = 'bg-red-200 dark:bg-red-950 text-red-900 dark:text-red-200 font-bold px-1 rounded ring-1 ring-red-500 underline';
              } else if (!seg.isError && isSelected) {
                badgeClass = 'bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-1 rounded line-through';
              }
            } else if (isSelected) {
              badgeClass = 'bg-amber-300 dark:bg-amber-700 text-slate-950 dark:text-white font-bold px-1 rounded';
            }

            return (
              // <button> tu být nemůže: je inline-block, takže by se delší úsek
              // textu nemohl zalomit uprostřed a odstavec by se přeskládal
              // (na úzké obrazovce až k přetečení). Proto span s rolí tlačítka.
              <span
                key={seg.id}
                role="button"
                tabIndex={0}
                onClick={() => handleToggleErrorSegment(seg.id)}
                onKeyDown={activateOnKey(() => handleToggleErrorSegment(seg.id))}
                className={badgeClass}
              >
                {seg.text}
              </span>
            );
          })}
        </div>

        {/* Exercise Check / Result Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {!exerciseChecked ? (
              <button
                onClick={handleCheckExercise}
                disabled={userErrorsFound.length === 0}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Zkontrolovat označené chyby ({userErrorsFound.length})</span>
              </button>
            ) : (
              <button
                onClick={handleResetExercise}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Vyzkoušet znovu</span>
              </button>
            )}
          </div>

          {exerciseChecked && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Vyhodnoceno (+15 XP do celkového postupu)</span>
            </span>
          )}
        </div>

        {/* Explanations of corrections when checked */}
        {exerciseChecked && (
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Rozbor a správné znění oprav:
            </h4>
            <div className="space-y-2">
              {currentExerciseData.originalTextSegments.map(seg => (
                <div
                  key={seg.id}
                  className={`p-3 rounded-xl text-xs ${
                    seg.isError
                      ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold">{seg.correction}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
