import React, { useState, useCallback, useMemo } from 'react';
import { CheckCircle2, RefreshCw, Check } from 'lucide-react';
import { updateDailyStreak } from '../../utils/gamification';
import { activateOnKey } from '../../utils/a11y';
import { defaultStyleExercises, StyleExercise } from '../../data/prisonAdminData';
import { useEditableContent } from '../../hooks/useEditableContent';
import ContentEditorBar from '../common/ContentEditorBar';
import StyleExerciseEditModal from '../common/StyleExerciseEditModal';
import { useStudySections } from '../../hooks/useStudySections';
import StudySectionsEditor from '../common/StudySectionsEditor';
import CustomStudySections from '../common/CustomStudySections';
import RichText from '../common/RichText';

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Sekce "7 pravidel úředního stylu & Kontrola chyb" extrahovaná z PrisonAdministration.
 * Obsahuje vlastní lokální state pro interaktivní cvičení (výběr cvičení,
 * označení chyb, vyhodnocení).
 */
export default function PrisonAdminStyleRules() {
  // Bloky z repozitáře přepsané úpravami lektora (contentLibrary.ts, druh 'study_section').
  const sectionState = useStudySections('styl');
  const { byId, custom } = sectionState;
  const rules = byId('styl-pravidla');
  const signature = byId('styl-dolozka');
  const canEdit = sectionState.canEdit;

  // Cvičení z repozitáře přepsaná úpravami lektora (contentLibrary.ts, druh 'admin_exercise').
  const exerciseContent = useEditableContent<StyleExercise>('admin_exercise', defaultStyleExercises, canEdit);
  const exercises = exerciseContent.items;

  const [selectedExercise, setSelectedExercise] = useState<number>(0);
  const [userErrorsFound, setUserErrorsFound] = useState<number[]>([]);
  const [exerciseChecked, setExerciseChecked] = useState(false);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<StyleExercise | null>(null);

  // Lektor mohl cvičení odebrat — index nesmí ukazovat za konec seznamu.
  const exerciseIdx = Math.min(selectedExercise, Math.max(exercises.length - 1, 0));
  // `as` jen přiznává, že index za koncem (prázdný seznam) vrací undefined.
  const currentExerciseData = exercises[exerciseIdx] as StyleExercise | undefined;
  const exerciseEntry = exerciseContent.entries.find((e) => e.id === currentExerciseData?.id);

  const handleToggleErrorSegment = useCallback((segmentId: number) => {
    setUserErrorsFound(prev => {
      if (exerciseChecked) return prev;
      return prev.includes(segmentId) ? prev.filter(id => id !== segmentId) : [...prev, segmentId];
    });
  }, [exerciseChecked]);

  /** Výsledek po vyhodnocení: nalezené chyby a zbytečně označené úseky. */
  const result = useMemo(() => {
    const segments = currentExerciseData?.originalTextSegments ?? [];
    const errors = segments.filter((seg) => seg.isError);
    return {
      total: errors.length,
      found: errors.filter((seg) => userErrorsFound.includes(seg.id)).length,
      wrong: segments.filter((seg) => !seg.isError && userErrorsFound.includes(seg.id)).length,
    };
  }, [currentExerciseData, userErrorsFound]);

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

      <StudySectionsEditor area="styl" state={sectionState} />

      {/* The 7 Golden Rules */}
      {(rules || signature) && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          {rules && (
            <>
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                {rules.kicker && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {rules.kicker}
                  </span>
                )}
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {rules.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {rules.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {item.label && <span className="text-amber-600 dark:text-amber-400">{item.label}.</span>}
                      <span>{item.title}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[0.6875rem]"><RichText text={item.text} /></p>
                  </div>
                ))}
              </div>
            </>
          )}

          {signature && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                {signature.title}
              </div>
              {signature.items.map((item, idx) => (
                <p key={idx} className="text-slate-700 dark:text-slate-200 font-mono text-[0.6875rem]">
                  {item.text && <>{item.text}<br /></>}
                  <strong>{item.title}</strong>
                  {item.note && <><br /><span className="text-[0.625rem] text-slate-500">{item.note}</span></>}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {canEdit && (
        <>
          <ContentEditorBar
            content={exerciseContent}
            targets={exerciseEntry ? [exerciseEntry] : []}
            deleted={exerciseContent.entries.filter((e) => e.isDeleted)}
            getName={(ex) => ex.badge}
            noun="cvičení"
            onEdit={(ex) => {
              setEditingExercise(ex);
              setExerciseModalOpen(true);
            }}
            onAdd={() => {
              setEditingExercise(null);
              setExerciseModalOpen(true);
            }}
          />
          <StyleExerciseEditModal
            exercise={editingExercise}
            isOpen={exerciseModalOpen}
            usedIds={exerciseContent.entries.map((e) => e.id)}
            onClose={() => {
              setExerciseModalOpen(false);
              setEditingExercise(null);
            }}
            onSave={async (ex) => {
              const result = await exerciseContent.save(ex);
              if (!result.error) {
                // Označené úseky patří staré podobě textu — začít nanovo.
                handleResetExercise();
                // Nové cvičení se řadí na konec; index se ořízne na poslední.
                if (!editingExercise) setSelectedExercise(Number.MAX_SAFE_INTEGER);
              }
              return result;
            }}
          />
        </>
      )}

      {/* Interactive Error Detection Training Exercise */}
      {!currentExerciseData ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
          Zatím tu nejsou žádná cvičení{canEdit ? ' — přidejte je tlačítkem Přidat cvičení.' : '.'}
        </p>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Cvičení: najděte chyby
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {currentExerciseData.title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {exercises.map((ex, idx) => (
                <button
                  type="button"
                  key={ex.id}
                  aria-pressed={exerciseIdx === idx}
                  onClick={() => {
                    setSelectedExercise(idx);
                    handleResetExercise();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    exerciseIdx === idx
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-400 dark:border-amber-500/60 text-slate-900 dark:text-white'
                      : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 leading-loose text-sm font-serif">
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
                badgeClass = 'bg-amber-200 dark:bg-amber-500/30 text-slate-950 dark:text-white px-1 rounded cursor-pointer';
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
                  type="button"
                  onClick={handleCheckExercise}
                  disabled={userErrorsFound.length === 0}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zkontrolovat označené chyby ({userErrorsFound.length})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetExercise}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Vyzkoušet znovu</span>
                </button>
              )}
            </div>

            {/* Dřív tu stálo jen „Vyhodnoceno“ — výsledek musel student
                spočítat z barev sám. */}
            {exerciseChecked && (
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Nalezeno {result.found} z {result.total} chyb
                  {result.wrong > 0 && `, ${result.wrong} ${result.wrong === 1 ? 'úsek označen' : 'úseky označeny'} zbytečně`}
                </span>
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
                {currentExerciseData.originalTextSegments.map(seg => {
                  const marked = userErrorsFound.includes(seg.id);
                  const verdict = seg.isError
                    ? marked
                      ? { text: 'Našli jste', cls: 'text-emerald-700 dark:text-emerald-300' }
                      : { text: 'Přehlédnuto', cls: 'text-red-700 dark:text-red-300' }
                    : marked
                      ? { text: 'Označeno zbytečně', cls: 'text-amber-700 dark:text-amber-300' }
                      : { text: 'V pořádku', cls: 'text-slate-500 dark:text-slate-400' };
                  return (
                    <div
                      key={seg.id}
                      className="p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 space-y-1"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className={`font-bold ${verdict.cls}`}>{verdict.text}</span>
                        <span className="font-serif italic text-slate-500 dark:text-slate-400">„{seg.text.trim()}“</span>
                      </div>
                      <div>{seg.correction}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Bloky přidané lektorem */}
      <CustomStudySections sections={custom} tone="adaptive" />

    </div>
  );
}
