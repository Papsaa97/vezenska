import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Layers,
  Zap,
  Sparkles,
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
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loadCompletedDrills, saveCompletedDrills, updateDailyStreak } from '../utils/gamification';
import { useProgressRevision } from '../hooks/useProgressRevision';
import { useAuth } from '../context/AuthContext';
import { useEditableContent } from '../hooks/useEditableContent';
import { defaultStoppageDrills, defaultWeapons, StoppageDrill, WeaponData } from '../data/weaponsData';
import WeaponEditModal from './common/WeaponEditModal';
import StoppageDrillEditModal from './common/StoppageDrillEditModal';
import ConfirmDialog from './common/ConfirmDialog';

interface WeaponSimulatorProps {
  onNavigateToBadges?: () => void;
}


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
  const [activeMode, setActiveMode] = useState<'safety' | 'disassembly' | 'troubleshooting' | 'specs'>('safety');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Troubleshooting mode state
  const [currentDrillIndex, setCurrentDrillIndex] = useState<number>(0);
  const [selectedDrillOption, setSelectedDrillOption] = useState<number | null>(null);
  const [isDrillAnswered, setIsDrillAnswered] = useState<boolean>(false);
  const [completedDrills, setCompletedDrills] = useState<string[]>(loadCompletedDrills);

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
  const stepsToUse = currentWeapon
    ? (activeMode === 'safety' ? currentWeapon.safetySteps : currentWeapon.disassemblySteps)
    : [];
  // Lektor mohl závadu odebrat — index nesmí ukazovat za konec seznamu.
  const drillIndex = Math.min(currentDrillIndex, Math.max(drills.length - 1, 0));
  const otherWeapon = weaponList.length > 1
    ? weaponList[(weaponList.findIndex(w => w.id === currentWeapon?.id) + 1) % weaponList.length]
    : null;

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
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps(prev => [...prev, currentStepIndex]);
    }
    if (currentStepIndex < stepsToUse.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
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

  const handleSwitchMode = (mode: 'safety' | 'disassembly' | 'troubleshooting' | 'specs') => {
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
    if (drill?.options[index]?.isCorrect) {
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

  const currentStep = stepsToUse[currentStepIndex];

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto p-2 sm:p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-md border border-amber-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-400/20">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Střelecká a zbraňová příprava VS ČR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Trenažér manipulace a rozborky zbraní</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Interaktivní nácvik bezpečnostní prověrky, vybíjení do lapače střel a postupu částečné rozborky služebních zbraní.
            </p>
          </div>

          {/* Weapon Selector Tabs */}
          {weaponList.length > 0 && (
            <div className="flex flex-wrap bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              {weaponList.map(w => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSwitchWeapon(w.id)}
                  aria-pressed={currentWeapon?.id === w.id}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    currentWeapon?.id === w.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Správa obsahu záložky — jen lektor a správce */}
      {canEdit && (
        <div className="mb-5 space-y-2">
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
                  <Edit3 className="w-3.5 h-3.5" />
                  Upravit zbraň {currentWeapon.name}
                </button>
                <button
                  type="button"
                  onClick={() => weaponContent.toggleHidden(currentWeapon.id).then(r => setContentError(r.error))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  {weaponEntry?.isHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                  {weaponEntry?.isHidden ? 'Zveřejnit studentům' : 'Skrýt studentům'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction({ kind: 'weapon', action: 'remove', id: currentWeapon.id, name: currentWeapon.name })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
              <Plus className="w-3.5 h-3.5" />
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
                      <Edit3 className="w-3.5 h-3.5" />
                      Upravit závadu
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmAction({ kind: 'drill', action: 'remove', id: drills[drillIndex].id, name: drills[drillIndex].name })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
                  <Plus className="w-3.5 h-3.5" />
                  Přidat závadu
                </button>
              </>
            )}
          </div>

          {(deletedWeapons.length > 0 || deletedDrills.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
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
                    <RotateCcw className="w-3 h-3" />
                    {item.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction({ kind: item.kind, action: 'purge', id: item.id, name: item.name })}
                    aria-label={`Smazat ${item.name} natrvalo`}
                    className="p-1 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
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

      {/* Mode Sub-nav */}
      <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => handleSwitchMode('safety')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeMode === 'safety'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. Bezpečnostní kontrola & Vybíjení</span>
          </button>

          <button
            onClick={() => handleSwitchMode('disassembly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeMode === 'disassembly'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Částečná rozborka</span>
          </button>

          <button
            onClick={() => handleSwitchMode('troubleshooting')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeMode === 'troubleshooting'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>3. Odstraňování závad</span>
            {completedDrills.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black">
                {drills.filter(d => completedDrills.includes(d.id)).length}/{drills.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSwitchMode('specs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeMode === 'specs'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>4. Takticko-technická data</span>
          </button>
        </div>

        {activeMode !== 'specs' && activeMode !== 'troubleshooting' && (
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs shrink-0 cursor-pointer"
            title="Resetovat průchod"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        )}
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
            <Info className="w-4 h-4 mt-px shrink-0 text-blue-500" />
            <span>
              Tyto závady a postupy jejich odstranění jsou <strong>společné pro všechny zbraně
              v této záložce</strong> — nejde o sadu vázanou na zbraň zvolenou výše. Konkrétní hmaty si vždy ověřte podle návodu k dané zbrani a pokynů instruktora.
            </span>
          </div>

          {/* Drills Selector Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {drills.map((drill, idx) => {
              const isCurrent = idx === drillIndex;
              const isDone = completedDrills.includes(drill.id);
              return (
                <button
                  key={drill.id}
                  onClick={() => {
                    setCurrentDrillIndex(idx);
                    setSelectedDrillOption(null);
                    setIsDrillAnswered(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                      : isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{drill.name.split('. ')[1] || drill.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Drill Card */}
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <AlertOctagon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modelová střelecká závada</span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{drill.name}</h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Závada {drillIndex + 1} z {drills.length}
                  </span>
                </div>

                {/* Symptom & Cause Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Příznak závady (Symptom):</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      {drill.symptom}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                      <HelpCircle className="w-4 h-4" />
                      <span>Možná příčina:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {drill.cause}
                    </p>
                  </div>
                </div>

                {/* Prompt & Options */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span>Jaký je správný a bezpečný metodický postup odstranění závady?</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5">
                    {drill.options.map((opt, optIdx) => {
                      const isSelected = selectedDrillOption === optIdx;
                      let optClass = "border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-amber-400";
                      
                      if (isDrillAnswered) {
                        if (opt.isCorrect) {
                          optClass = "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs";
                        } else if (isSelected) {
                          optClass = "border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold shadow-xs";
                        } else {
                          optClass = "opacity-40 border-slate-200 dark:border-slate-800 text-slate-400";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleDrillChoice(optIdx)}
                          disabled={isDrillAnswered}
                          className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${optClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="text-xs sm:text-sm leading-relaxed">{opt.text}</span>
                          </div>
                          {isDrillAnswered && (
                            opt.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : isSelected ? (
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            ) : null
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback & Explanation Card */}
                {isDrillAnswered && selectedDrillOption !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      {drill.options[selectedDrillOption].isCorrect ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          SPRÁVNÉ ROZHODNUTÍ (+40 XP)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs">
                          NESPRÁVNÝ POSTUP
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                      {drill.options[selectedDrillOption].feedback}
                    </p>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div><strong>Správný metodický postup:</strong> {drill.correctAction}</div>
                      <div><strong>Zdůvodnění:</strong> {drill.whyCorrect}</div>
                      <div><strong>Nebezpečí nesprávného zásahu:</strong> <span className="text-rose-600 dark:text-rose-400 font-medium">{drill.dangerOfWrongAction}</span></div>
                    </div>

                    <div className="flex justify-end pt-2">
                      {drillIndex < drills.length - 1 ? (
                        <button
                          onClick={handleNextDrill}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                        >
                          <span>Další závada</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setCurrentDrillIndex(0);
                            setSelectedDrillOption(null);
                            setIsDrillAnswered(false);
                          }}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Všechny závady procvičeny! Restartovat</span>
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
        /* Technical Specifications Tab */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
              <Crosshair className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentWeapon.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentWeapon.serviceRole}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {currentWeapon.technicalSpecs.map((spec, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{spec.label}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-right">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Zkušební požadavek Akademie VS ČR ke zkoušce ZOP A:</span>
              Frekventant musí samostatně předvést bezpečnou kontrolu zbraně a částečnou rozborku do 60 sekund bez míření zbraní mimo bezpečný prostor lapače střel.
            </div>
          </div>
        </div>
      ) : isFinished ? (
        /* Completion Summary View */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-6 sm:p-8 shadow-lg text-center space-y-6"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Nácvik úspěšně dokončen
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {activeMode === 'safety' ? 'Bezpečnostní protokol bezchybně zvládnut!' : 'Částečná rozborka bezchybně zvládnuta!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xl mx-auto">
              Úspěšně jste prošli všemi {stepsToUse.length} fázemi metodického postupu pro <strong className="text-slate-900 dark:text-white">{currentWeapon.name}</strong>.
            </p>
          </div>

          {/* Steps Summary Card */}
          <div className="text-left bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 space-y-2.5 max-w-2xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Splněné kontrolní body Akademie VS ČR:
            </div>
            {stepsToUse.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{step.title}</span>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.whyCrucial}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Zopakovat tento nácvik</span>
            </button>

            {activeMode === 'safety' ? (
              <button
                onClick={() => handleSwitchMode('disassembly')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Přejít na částečnou rozborku</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSwitchMode('specs')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Takticko-technická data</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {otherWeapon && (
              <button
                type="button"
                onClick={() => handleSwitchWeapon(otherWeapon.id)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
                <span>Přepnout na {otherWeapon.name}</span>
              </button>
            )}

            {onNavigateToBadges && (
              <button
                onClick={onNavigateToBadges}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors border border-amber-500/30 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Zobrazit odznaky a hodnost</span>
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        /* Interactive Step by Step Simulation */
        <div className="flex flex-col gap-5">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {stepsToUse.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isDone = completedSteps.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                      : isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{idx + 1}</span>}
                  <span className="truncate max-w-[120px]">{step.title.split('. ')[1] || step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedWeaponId}-${activeMode}-${currentStepIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full border border-amber-500/20">
                  {currentWeapon.name} • {activeMode === 'safety' ? 'Bezpečnostní postup' : 'Rozborka'}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Krok {currentStepIndex + 1} z {stepsToUse.length}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {currentStep.title}
              </h3>

              {/* Action Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                  Požadovaný úkon střelce:
                </span>
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                  {currentStep.actionInstruction}
                </p>
              </div>

              {/* Crucial & Danger Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Proč je tento krok klíčový:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                    {currentStep.whyCrucial}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800 dark:text-rose-300 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Riziko při opomenutí:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200/90 leading-relaxed">
                    {currentStep.dangerIfOmitted}
                  </p>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex(prev => prev - 1)}
                  className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Předchozí krok
                </button>

                <button
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>{currentStepIndex === stepsToUse.length - 1 ? 'Dokončit nácvik' : 'Potvrdit provedení & Další krok'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
