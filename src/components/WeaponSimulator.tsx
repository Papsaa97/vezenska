import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Layers,
  Zap,
  Award,
  AlertOctagon,
  Wrench,
  HelpCircle,
  Info,
  XCircle,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  type LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DRILL_XP, loadCompletedDrills, saveCompletedDrills, updateDailyStreak } from '../utils/gamification';
import { useProgressRevision } from '../hooks/useProgressRevision';
import { useAuth } from '../context/AuthContext';
import { useEditableContent } from '../hooks/useEditableContent';
import { defaultStoppageDrills, defaultWeapons, StoppageDrill, WeaponData } from '../data/weaponsData';
import { NAV_TAB_LABELS } from '../data/navTabs';
import WeaponEditModal from './common/WeaponEditModal';
import StoppageDrillEditModal from './common/StoppageDrillEditModal';
import ConfirmDialog from './common/ConfirmDialog';

interface WeaponSimulatorProps {
  onNavigateToBadges?: () => void;
}

type SimulatorMode = 'safety' | 'disassembly' | 'troubleshooting' | 'specs';

interface ModeTab {
  id: SimulatorMode;
  label: string;
  icon: LucideIcon;
}

const MODE_TABS: ModeTab[] = [
  { id: 'safety', label: 'Bezpečnostní kontrola a vybíjení', icon: ShieldCheck },
  { id: 'disassembly', label: 'Částečná rozborka', icon: Layers },
  { id: 'troubleshooting', label: 'Odstraňování závad', icon: Wrench },
  { id: 'specs', label: 'Takticko-technická data', icon: Zap },
];

/** Odstraní případné pořadové číslo ze začátku názvu („3. Natažení…“ → „Natažení…“).
 *  Lektor může název zadat i bez číslování — pak se vrátí beze změny. */
function stripLeadingNumber(name: string): string {
  return name.replace(/^\s*\d+\s*[.)]\s*/, '').trim() || name;
}

/** Český tvar podle počtu: 1 krok / 2 kroky / 5 kroků. */
function pluralCz(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;
  if (count >= 2 && count <= 4) return few;
  return many;
}

const SECONDARY_BUTTON =
  'px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer';
const PRIMARY_BUTTON =
  'px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer';

export default function WeaponSimulator({ onNavigateToBadges }: WeaponSimulatorProps = {}) {
  const { profile } = useAuth();
  const canEdit = profile?.role === 'lektor' || profile?.role === 'admin';

  // Zbraně a závady z repozitáře přepsané úpravami lektora (contentLibrary.ts).
  // Dřív byly natvrdo v komponentě a upravit je nešlo (zpětná vazba 18. 9. 2026).
  const weaponContent = useEditableContent<WeaponData>('weapon', defaultWeapons, canEdit);
  const drillContent = useEditableContent<StoppageDrill>('stoppage_drill', defaultStoppageDrills, canEdit);
  const weaponList = weaponContent.items;
  const drills = drillContent.items;

  const [weaponModalOpen, setWeaponModalOpen] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState<WeaponData | null>(null);
  const [drillModalOpen, setDrillModalOpen] = useState(false);
  const [editingDrill, setEditingDrill] = useState<StoppageDrill | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    { kind: 'weapon' | 'drill'; action: 'remove' | 'purge'; id: string; name: string } | null
  >(null);
  const [contentError, setContentError] = useState<string | null>(null);

  const [selectedWeaponId, setSelectedWeaponId] = useState<string>(defaultWeapons[0]?.id ?? '');
  const [activeMode, setActiveMode] = useState<SimulatorMode>('safety');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Troubleshooting mode state
  const [currentDrillIndex, setCurrentDrillIndex] = useState<number>(0);
  const [selectedDrillOption, setSelectedDrillOption] = useState<number | null>(null);
  const [isDrillAnswered, setIsDrillAnswered] = useState<boolean>(false);
  const [completedDrills, setCompletedDrills] = useState<string[]>(loadCompletedDrills);
  // Drily, ve kterých student v této návštěvě odpověděl špatně. Dril se
  // započítá jen napoprvé správně — jinak by stačilo proklikat možnosti.
  const [missedDrills, setMissedDrills] = useState<string[]>([]);
  // Co přinesla poslední správná odpověď: nové XP, nic (dril už byl
  // započítaný), nebo nic kvůli dřívější chybě. Určí se v okamžiku odpovědi —
  // po ní je dril v completedDrills vždy a nové splnění by nešlo odlišit.
  const [drillAward, setDrillAward] = useState<'xp' | 'already' | 'missed'>('xp');

  // Postup se přečte znovu při každé změně úložiště — i po přihlášení, kdy se
  // vlastník klíče změní z „anon“ na id účtu.
  const progressRevision = useProgressRevision();
  useEffect(() => {
    setCompletedDrills(loadCompletedDrills());
  }, [progressRevision]);

  // Seznam může být prázdný (lektor odebral všechny zbraně) — `as` jen
  // přiznává, že index za koncem pole vrací undefined.
  const currentWeapon = (weaponList.find(w => w.id === selectedWeaponId) ?? weaponList[0]) as
    | WeaponData
    | undefined;
  const currentWeaponId = currentWeapon?.id;
  const stepsToUse = currentWeapon
    ? (activeMode === 'safety' ? currentWeapon.safetySteps : currentWeapon.disassemblySteps)
    : [];
  // Lektor mohl krok nebo závadu odebrat (nebo zbraň zmizela a přepnulo se na
  // první v seznamu) — index nesmí ukazovat za konec seznamu.
  const stepIndex = Math.min(currentStepIndex, Math.max(stepsToUse.length - 1, 0));
  const drillIndex = Math.min(currentDrillIndex, Math.max(drills.length - 1, 0));
  const otherWeapon = weaponList.length > 1
    ? weaponList[(weaponList.findIndex(w => w.id === currentWeapon?.id) + 1) % weaponList.length]
    : null;

  // Když se změní zobrazená zbraň jinak než tlačítkem (odebrání lektorem,
  // načtení úprav), rozpracovaný postup by ukazoval na kroky jiné zbraně.
  useEffect(() => {
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsFinished(false);
  }, [currentWeaponId]);

  const weaponEntry = weaponContent.entries.find(e => e.id === currentWeapon?.id);
  const deletedWeapons = weaponContent.entries.filter(e => e.isDeleted);
  const deletedDrills = drillContent.entries.filter(e => e.isDeleted);

  const runConfirmedAction = async () => {
    if (!confirmAction) return;
    const { kind, action, id } = confirmAction;
    setConfirmAction(null);
    const content = kind === 'weapon' ? weaponContent : drillContent;
    const result = action === 'remove' ? await content.remove(id) : await content.purge(id);
    setContentError(result.error);
  };

  const handleNextStep = () => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps(prev => [...prev, stepIndex]);
    }
    if (stepIndex < stepsToUse.length - 1) {
      setCurrentStepIndex(stepIndex + 1);
    } else {
      setIsFinished(true);
      updateDailyStreak();
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsFinished(false);
    setSelectedDrillOption(null);
    setIsDrillAnswered(false);
  };

  const handleSwitchWeapon = (id: string) => {
    setSelectedWeaponId(id);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsFinished(false);
    setSelectedDrillOption(null);
    setIsDrillAnswered(false);
  };

  const handleSwitchMode = (mode: SimulatorMode) => {
    setActiveMode(mode);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsFinished(false);
    setSelectedDrillOption(null);
    setIsDrillAnswered(false);
  };

  const handleDrillChoice = (index: number) => {
    if (isDrillAnswered) return;
    setSelectedDrillOption(index);
    setIsDrillAnswered(true);

    const drill = drills[drillIndex];
    if (drill && !drill.options[index]?.isCorrect) {
      setMissedDrills(prev => (prev.includes(drill.id) ? prev : [...prev, drill.id]));
    }
    if (drill?.options[index]?.isCorrect) {
      setDrillAward(
        missedDrills.includes(drill.id) ? 'missed' : completedDrills.includes(drill.id) ? 'already' : 'xp'
      );
    }
    if (drill?.options[index]?.isCorrect && !missedDrills.includes(drill.id)) {
      setCompletedDrills(prev => {
        if (prev.includes(drill.id)) return prev;
        const next = [...prev, drill.id];
        // Zápis mimo updater — ten musí být čistá funkce (StrictMode ho ve
        // vývoji spouští dvakrát).
        queueMicrotask(() => saveCompletedDrills(next));
        return next;
      });
      updateDailyStreak();
    }
  };

  const handleNextDrill = () => {
    if (drillIndex < drills.length - 1) {
      setCurrentDrillIndex(drillIndex + 1);
      setSelectedDrillOption(null);
      setIsDrillAnswered(false);
    }
  };

  // Nový průchod závadami: i chyby z minulého kola se zapomenou, jinak by
  // student za správnou odpověď v dalším kole nikdy nedostal XP.
  const handleRestartDrills = () => {
    setCurrentDrillIndex(0);
    setSelectedDrillOption(null);
    setIsDrillAnswered(false);
    setMissedDrills([]);
  };

  const currentStep = stepsToUse[stepIndex] as (typeof stepsToUse)[number] | undefined;
  const drillsDone = drills.filter(d => completedDrills.includes(d.id)).length;

  return (
    <div className="w-full flex flex-col gap-5 pb-8">
      {/* Záhlaví — stejně klidné jako u Administrativy a Profesní etiky */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Crosshair className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{NAV_TAB_LABELS.weapons}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Nácvik bezpečnostní kontroly, vybíjení, částečné rozborky a odstraňování závad služebních zbraní.
              </p>
            </div>
          </div>

          {weaponList.length > 0 && (
            <div role="group" aria-label="Výběr zbraně" className="flex flex-wrap items-center gap-2 shrink-0">
              {weaponList.map(w => {
                const isActive = currentWeapon?.id === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleSwitchWeapon(w.id)}
                    aria-pressed={isActive}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {w.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Správa obsahu záložky — jen lektor a správce */}
      {canEdit && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {currentWeapon && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditingWeapon(currentWeapon);
                    setWeaponModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  Upravit zbraň {currentWeapon.name}
                </button>
                <button
                  type="button"
                  onClick={() => weaponContent.toggleHidden(currentWeapon.id).then(r => setContentError(r.error))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  {weaponEntry?.isHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                  {weaponEntry?.isHidden ? 'Zveřejnit studentům' : 'Skrýt studentům'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction({ kind: 'weapon', action: 'remove', id: currentWeapon.id, name: currentWeapon.name })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Odebrat zbraň
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setEditingWeapon(null);
                setWeaponModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Přidat zbraň
            </button>
            {activeMode === 'troubleshooting' && (
              <>
                {drills[drillIndex] && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDrill(drills[drillIndex]);
                        setDrillModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      Upravit závadu
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmAction({ kind: 'drill', action: 'remove', id: drills[drillIndex].id, name: drills[drillIndex].name })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Odebrat závadu
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingDrill(null);
                    setDrillModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  Přidat závadu
                </button>
              </>
            )}
          </div>

          {(deletedWeapons.length > 0 || deletedDrills.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap text-[0.6875rem] text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Odebrané (vrátit / smazat natrvalo):</span>
              {[
                ...deletedWeapons.map(e => ({ kind: 'weapon' as const, id: e.id, name: e.item.name })),
                ...deletedDrills.map(e => ({ kind: 'drill' as const, id: e.id, name: e.item.name })),
              ].map(item => (
                <span key={`${item.kind}-${item.id}`} className="inline-flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      (item.kind === 'weapon' ? weaponContent : drillContent)
                        .restore(item.id)
                        .then(r => setContentError(r.error))
                    }
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    {item.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction({ kind: item.kind, action: 'purge', id: item.id, name: item.name })}
                    aria-label={`Smazat ${item.name} natrvalo`}
                    className="p-1 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {contentError && (
            <p role="alert" className="text-xs text-red-600 dark:text-red-400">{contentError}</p>
          )}

          <WeaponEditModal
            weapon={editingWeapon}
            isOpen={weaponModalOpen}
            usedIds={weaponContent.entries.map(e => e.id)}
            onClose={() => {
              setWeaponModalOpen(false);
              setEditingWeapon(null);
            }}
            onSave={async (w) => {
              const result = await weaponContent.save(w);
              setContentError(result.error);
              if (!result.error) setSelectedWeaponId(w.id);
              return result;
            }}
          />
          <StoppageDrillEditModal
            drill={editingDrill}
            isOpen={drillModalOpen}
            usedIds={drillContent.entries.map(e => e.id)}
            onClose={() => {
              setDrillModalOpen(false);
              setEditingDrill(null);
            }}
            onSave={async (d) => {
              const result = await drillContent.save(d);
              setContentError(result.error);
              return result;
            }}
          />
          <ConfirmDialog
            isOpen={confirmAction !== null}
            title={confirmAction?.action === 'purge' ? 'Smazat natrvalo?' : 'Odebrat ze záložky?'}
            description={
              confirmAction?.action === 'purge'
                ? `„${confirmAction?.name ?? ''}“ zmizí i z přehledu odebraných.`
                : `„${confirmAction?.name ?? ''}“ studenti přestanou vidět. Vrátit to půjde z přehledu odebraných.`
            }
            confirmLabel={confirmAction?.action === 'purge' ? 'Smazat natrvalo' : 'Odebrat'}
            tone="danger"
            onCancel={() => setConfirmAction(null)}
            onConfirm={runConfirmedAction}
          />
        </div>
      )}

      {/* Režimy trenažéru */}
      <div role="tablist" aria-label="Části trenažéru zbraní" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MODE_TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeMode === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              title={label}
              onClick={() => handleSwitchMode(id)}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
              {id === 'troubleshooting' && drillsDone > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[0.625rem] font-bold shrink-0 ${
                    isActive ? 'bg-slate-950/15 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {drillsDone}/{drills.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeMode === 'troubleshooting' ? (
        <div className="flex flex-col gap-5">
          {/* Závady jsou společné pro obě zbraně.
              Dřív se týchž pět závad zobrazovalo pod hlavičkou vybrané zbraně,
              takže to vypadalo, že jsou pro ni specifické. Nejsou — a vymýšlet
              si zvláštní sadu pro Scorpion by znamenalo psát obsah bez
              podkladu, což je přesně to, co se v téhle aplikaci nemá dělat. */}
          <div
            role="note"
            className="flex items-start gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300"
          >
            <Info className="w-4 h-4 mt-px shrink-0 text-slate-400" aria-hidden="true" />
            <span>
              Tyto závady a postupy jejich odstranění jsou <strong>společné pro všechny zbraně
              v této záložce</strong> — nejde o sadu vázanou na zbraň zvolenou výše. Konkrétní hmaty si vždy ověřte podle návodu k dané zbrani a pokynů instruktora.
            </span>
          </div>

          {/* Výběr závady */}
          {drills.length > 0 && (
            <div role="group" aria-label="Výběr závady" className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {drills.map((drill, idx) => {
                const isCurrent = idx === drillIndex;
                const isDone = completedDrills.includes(drill.id);
                return (
                  <button
                    key={drill.id}
                    type="button"
                    aria-pressed={isCurrent}
                    onClick={() => {
                      setCurrentDrillIndex(idx);
                      setSelectedDrillOption(null);
                      setIsDrillAnswered(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950'
                        : isDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <span className="w-4 text-center shrink-0" aria-hidden="true">{idx + 1}</span>
                    )}
                    <span>{stripLeadingNumber(drill.name)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Aktivní závada */}
          {(() => {
            const drill = drills[drillIndex];
            if (!drill) {
              return (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
                  V záložce zatím nejsou žádné závady k procvičení.
                </p>
              );
            }
            return (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <AlertOctagon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Modelová střelecká závada</span>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{drill.name}</h2>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                    Závada {drillIndex + 1} z {drills.length}
                  </span>
                </div>

                {/* Příznak a příčina */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                      <span>Příznak závady</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {drill.symptom}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      <HelpCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Možná příčina</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {drill.cause}
                    </p>
                  </div>
                </div>

                {/* Otázka a možnosti */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <span>Jaký je správný a bezpečný metodický postup odstranění závady?</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5">
                    {drill.options.map((opt, optIdx) => {
                      const isSelected = selectedDrillOption === optIdx;
                      let optClass = 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-amber-400';

                      if (isDrillAnswered) {
                        if (opt.isCorrect) {
                          optClass = 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                        } else if (isSelected) {
                          optClass = 'border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold';
                        } else {
                          optClass = 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleDrillChoice(optIdx)}
                          disabled={isDrillAnswered}
                          className={`p-4 rounded-xl border text-left transition-colors flex items-start justify-between gap-3 cursor-pointer ${optClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="text-sm leading-relaxed">{opt.text}</span>
                          </div>
                          {isDrillAnswered && (
                            opt.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                            ) : isSelected ? (
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                            ) : null
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vyhodnocení */}
                {isDrillAnswered && selectedDrillOption !== null && drill.options[selectedDrillOption] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      {drill.options[selectedDrillOption].isCorrect ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                          {drillAward === 'missed'
                            ? 'Správně (XP jen za odpověď napoprvé)'
                            : drillAward === 'already'
                              ? 'Správně (XP už máte připsané)'
                              : `Správně (+${DRILL_XP} XP)`}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold text-xs">
                          Nesprávný postup
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      {drill.options[selectedDrillOption].feedback}
                    </p>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div><strong>Správný metodický postup:</strong> {drill.correctAction}</div>
                      <div><strong>Zdůvodnění:</strong> {drill.whyCorrect}</div>
                      <div><strong>Nebezpečí nesprávného zásahu:</strong> <span className="text-rose-600 dark:text-rose-400 font-medium">{drill.dangerOfWrongAction}</span></div>
                    </div>

                    <div className="flex justify-end pt-2">
                      {drillIndex < drills.length - 1 ? (
                        <button type="button" onClick={handleNextDrill} className={PRIMARY_BUTTON}>
                          <span>Další závada</span>
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button type="button" onClick={handleRestartDrills} className={SECONDARY_BUTTON}>
                          <RotateCcw className="w-4 h-4" aria-hidden="true" />
                          <span>Projít závady znovu od začátku</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })()}
        </div>
      ) : !currentWeapon ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
          V záložce zatím není žádná zbraň{canEdit ? ' — přidejte ji tlačítkem Přidat zbraň.' : '.'}
        </p>
      ) : activeMode === 'specs' ? (
        /* Takticko-technická data */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Crosshair className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{currentWeapon.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentWeapon.serviceRole}</p>
            </div>
          </div>

          {currentWeapon.technicalSpecs.length > 0 ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentWeapon.technicalSpecs.map((spec, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex justify-between items-center gap-3">
                  <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">{spec.label}</dt>
                  <dd className="text-sm font-bold text-slate-900 dark:text-white text-right">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">U této zbraně zatím nejsou vyplněna technická data.</p>
          )}
        </div>
      ) : isFinished ? (
        /* Shrnutí po dokončení postupu */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-6"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Postup dokončen</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xl mx-auto">
              {activeMode === 'safety' ? 'Bezpečnostní kontrola a vybíjení' : 'Částečná rozborka'} pro{' '}
              <strong className="text-slate-900 dark:text-white">{currentWeapon.name}</strong>: potvrzeno{' '}
              {completedSteps.length} z {stepsToUse.length} {pluralCz(stepsToUse.length, 'kroku', 'kroků', 'kroků')}.
              {completedSteps.length < stepsToUse.length && ' Přeskočené kroky si projděte znovu.'}
            </p>
          </div>

          {/* Přehled kroků — fajfku dostane jen krok, který student skutečně potvrdil */}
          <ul className="text-left bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 space-y-2.5 max-w-2xl mx-auto">
            {stepsToUse.map((step, idx) => {
              const done = completedSteps.includes(idx);
              return (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-label="Potvrzeno" />
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[0.625rem] font-bold shrink-0 mt-0.5"
                      aria-label="Nepotvrzeno"
                    >
                      {idx + 1}
                    </span>
                  )}
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{step.title}</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.whyCrucial}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button type="button" onClick={handleReset} className={SECONDARY_BUTTON}>
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Zopakovat postup</span>
            </button>

            {activeMode === 'safety' ? (
              <button type="button" onClick={() => handleSwitchMode('disassembly')} className={PRIMARY_BUTTON}>
                <Layers className="w-4 h-4" aria-hidden="true" />
                <span>Přejít na částečnou rozborku</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button type="button" onClick={() => handleSwitchMode('specs')} className={PRIMARY_BUTTON}>
                <Zap className="w-4 h-4" aria-hidden="true" />
                <span>Takticko-technická data</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            {otherWeapon && (
              <button type="button" onClick={() => handleSwitchWeapon(otherWeapon.id)} className={SECONDARY_BUTTON}>
                <Crosshair className="w-4 h-4" aria-hidden="true" />
                <span>Přepnout na {otherWeapon.name}</span>
              </button>
            )}

            {onNavigateToBadges && (
              <button type="button" onClick={onNavigateToBadges} className={SECONDARY_BUTTON}>
                <Award className="w-4 h-4" aria-hidden="true" />
                <span>Zobrazit odznaky a hodnost</span>
              </button>
            )}
          </div>
        </motion.div>
      ) : !currentStep ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
          U této zbraně zatím není žádný krok {activeMode === 'safety' ? 'bezpečnostní kontroly' : 'rozborky'}
          {canEdit ? ' — doplňte je v úpravě zbraně.' : '.'}
        </p>
      ) : (
        /* Postup krok za krokem */
        <div className="flex flex-col gap-5">
          {/* Ukazatel postupu */}
          <div role="group" aria-label="Kroky postupu" className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {stepsToUse.map((step, idx) => {
              const isCurrent = idx === stepIndex;
              const isDone = completedSteps.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  aria-pressed={isCurrent}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950'
                      : isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <span className="w-4 text-center shrink-0" aria-hidden="true">{idx + 1}</span>
                  )}
                  <span className="truncate max-w-[140px]">{stripLeadingNumber(step.title)}</span>
                </button>
              );
            })}
          </div>

          {/* Karta aktivního kroku */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentWeapon.id}-${activeMode}-${stepIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs font-semibold px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full border border-amber-500/20 truncate">
                  {currentWeapon.name} · {activeMode === 'safety' ? 'Bezpečnostní postup' : 'Rozborka'}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Krok {stepIndex + 1} z {stepsToUse.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Začít postup znovu"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Znovu</span>
                  </button>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                {currentStep.title}
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-4">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Požadovaný úkon střelce
                </span>
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                  {currentStep.actionInstruction}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-800 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span>Proč je tento krok klíčový</span>
                  </div>
                  <p className="text-sm text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                    {currentStep.whyCrucial}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-rose-800 dark:text-rose-300 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" aria-hidden="true" />
                    <span>Riziko při opomenutí</span>
                  </div>
                  <p className="text-sm text-rose-900 dark:text-rose-200/90 leading-relaxed">
                    {currentStep.dangerIfOmitted}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={stepIndex === 0}
                  onClick={() => setCurrentStepIndex(Math.max(stepIndex - 1, 0))}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Předchozí krok
                </button>

                <button type="button" onClick={handleNextStep} className={PRIMARY_BUTTON}>
                  <span>{stepIndex === stepsToUse.length - 1 ? 'Dokončit postup' : 'Potvrdit a pokračovat'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
