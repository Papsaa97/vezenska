import React, { useId, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Lightbulb, Search, X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { NAV_TAB_LABELS, NavTab } from '../../data/navTabs';
import { HELP_GROUPS, HELP_SECTIONS, HelpBlock, HelpSection, groupsForRole } from '../../data/helpGuide';
import { foldSearchText } from '../../utils/searchText';

interface HelpCenterProps {
  onClose: () => void;
  /** Přepne záložku a nápovědu zavře. */
  onNavigate: (tab: NavTab) => void;
  /** Znovu otevře úvodní zprávu (tu, která se ukáže po prvním přihlášení). */
  onShowWelcome: () => void;
  /** Kapitola, na kterou se má nápověda rovnou posunout. */
  initialSectionId?: string;
}

/** Celý text kapitoly v jednom řetězci — pro vyhledávání. */
function sectionText(section: HelpSection): string {
  const parts: string[] = [section.title, section.summary];
  for (const block of section.blocks) {
    if (block.kind === 'p' || block.kind === 'tip') parts.push(block.text);
    else parts.push(block.title ?? '', ...block.items);
  }
  return foldSearchText(parts.join(' '));
}

function Block({ block }: { block: HelpBlock }) {
  if (block.kind === 'p') {
    return <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{block.text}</p>;
  }
  if (block.kind === 'tip') {
    return (
      <p className="flex gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
        <span>{block.text}</span>
      </p>
    );
  }
  const ListTag = block.kind === 'steps' ? 'ol' : 'ul';
  return (
    <div className="space-y-1.5">
      {block.title && <h4 className="text-sm font-bold text-slate-900 dark:text-white">{block.title}</h4>}
      <ListTag
        className={`space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed ${
          block.kind === 'steps' ? 'list-decimal' : 'list-disc'
        } marker:text-slate-400`}
      >
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}

/**
 * Nápověda — podrobný návod k aplikaci, dostupný kdykoli z otazníku
 * v hlavičce.
 *
 * Obsah je v `data/helpGuide.ts`; tady je jen zobrazení. Kapitoly pro velitele,
 * lektory a správce vidí jen ti, kterých se týkají (podle skutečné role, ne
 * podle náhledu role), aby student nemusel číst o věcech, které nemůže dělat.
 */
export default function HelpCenter({ onClose, onNavigate, onShowWelcome, initialSectionId }: HelpCenterProps) {
  const { realRole } = useAuth();
  const ids = useId();
  const [query, setQuery] = useState<string>('');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose });

  const role: UserRole = realRole ?? 'student';
  const visibleGroups = useMemo(() => groupsForRole(role), [role]);

  const searchIndex = useMemo(
    () => new Map(HELP_SECTIONS.map((s) => [s.id, sectionText(s)] as const)),
    [],
  );

  const needle = foldSearchText(query.trim());
  const sections = useMemo(
    () =>
      HELP_SECTIONS.filter(
        (s) =>
          visibleGroups.includes(s.group) &&
          (needle === '' || needle.split(/\s+/).every((word) => searchIndex.get(s.id)?.includes(word))),
      ),
    [visibleGroups, needle, searchIndex],
  );

  const scrollTo = (sectionId: string) => {
    const container = contentRef.current;
    const target = container?.querySelector<HTMLElement>(`[data-help-section="${sectionId}"]`);
    if (!container || !target) return;
    container.scrollTo({ top: target.offsetTop - container.offsetTop - 8, behavior: 'smooth' });
    target.focus({ preventScroll: true });
  };

  // Posun na požadovanou kapitolu až po vykreslení obsahu.
  const initialScrollDone = useRef(false);
  const setContentRef = (el: HTMLDivElement | null) => {
    contentRef.current = el;
    if (el && initialSectionId && !initialScrollDone.current) {
      initialScrollDone.current = true;
      requestAnimationFrame(() => {
        const target = el.querySelector<HTMLElement>(`[data-help-section="${initialSectionId}"]`);
        if (target) el.scrollTop = target.offsetTop - el.offsetTop - 8;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 no-print">
      {/* Ztmavené pozadí je dekorace: klik zavře, klávesnice má Escape (useDialog). */}
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${ids}-title`}
        className="relative w-full max-w-4xl h-[92dvh] sm:h-[85dvh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Hlavička */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id={`${ids}-title`} className="text-base font-bold text-slate-900 dark:text-white">
                Nápověda a návod
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Jak se v aplikaci zorientovat, jak funguje zařazení do třídy a co kde najdete
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít nápovědu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hledání */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Hledat v nápovědě"
              placeholder="Hledat, např. „velitel“, „heslo“, „zkouška“"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          {/* Na telefonu není místo na postranní obsah — místo něj výběr. */}
          <select
            aria-label="Přejít na kapitolu"
            value=""
            onChange={(e) => {
              if (e.target.value) scrollTo(e.target.value);
            }}
            className="md:hidden w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
          >
            <option value="">Přejít na kapitolu…</option>
            {HELP_GROUPS.filter((g) => visibleGroups.includes(g.id)).map((g) => (
              <optgroup key={g.id} label={g.label}>
                {sections
                  .filter((s) => s.group === g.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex-1 min-h-0 flex">
          {/* Obsah (od md) */}
          <nav
            aria-label="Kapitoly nápovědy"
            className="hidden md:block w-60 shrink-0 overflow-y-auto overscroll-contain border-r border-slate-200 dark:border-slate-800 p-3 space-y-4"
          >
            {HELP_GROUPS.filter((g) => visibleGroups.includes(g.id)).map((g) => {
              const inGroup = sections.filter((s) => s.group === g.id);
              if (inGroup.length === 0) return null;
              return (
                <div key={g.id}>
                  <div className="px-2 mb-1 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {g.label}
                  </div>
                  <ul className="space-y-0.5">
                    {inGroup.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => scrollTo(s.id)}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          {s.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>

          {/* Kapitoly */}
          <div ref={setContentRef} className="flex-1 min-w-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-6">
            {sections.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pro „{query.trim()}“ nápověda nic nenašla. Zkuste jiné slovo, nebo napište přes tlačítko Zpětná vazba
                v hlavičce, co hledáte.
              </p>
            )}
            {sections.map((s) => (
              <section
                key={s.id}
                data-help-section={s.id}
                tabIndex={-1}
                aria-labelledby={`${ids}-${s.id}`}
                className="space-y-3 scroll-mt-2 focus:outline-none"
              >
                <div>
                  <div className="text-[0.6875rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {HELP_GROUPS.find((g) => g.id === s.group)?.label}
                  </div>
                  <h3 id={`${ids}-${s.id}`} className="text-lg font-bold text-slate-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{s.summary}</p>
                </div>
                {s.blocks.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
                {s.tab && (
                  <button
                    type="button"
                    onClick={() => s.tab && onNavigate(s.tab)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Otevřít záložku {NAV_TAB_LABELS[s.tab]}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </section>
            ))}
          </div>
        </div>

        {/* Patička */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onShowWelcome}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
          >
            Zobrazit znovu úvodní zprávu
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold cursor-pointer"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
