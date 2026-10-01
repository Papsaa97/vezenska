import React, { useId } from 'react';
import { BookOpen, CircleHelp, Compass, School } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface WelcomeMessageProps {
  /** Zavře zprávu (a označí ji za přečtenou). */
  onClose: () => void;
  /** Zavře zprávu a otevře podrobný návod. */
  onOpenGuide: () => void;
}

interface WelcomePoint {
  icon: typeof School;
  title: string;
  text: string;
}

/** Co je v úvodu o třídě — liší se podle toho, kdo se přihlásil. */
function classPoint(role: UserRole): WelcomePoint {
  switch (role) {
    case 'velitel_tridy':
      return {
        icon: School,
        title: 'Vaše třída',
        text:
          'Jako velitel třídy vyřizujete na Nástěnce žádosti o zařazení, můžete do třídy označit nezařazené ' +
          'studenty, určit si zástupce a vést třídní nástěnku i diskuzi.',
      };
    case 'lektor':
    case 'admin':
      return {
        icon: School,
        title: 'Třídy a velitelé',
        text:
          'Na Nástěnce vidíte všechny třídy. Zařazujete studenty, jmenujete velitele tříd (v každé třídě jeden) ' +
          'a vidíte seznam nezařazených.',
      };
    default:
      return {
        icon: School,
        title: 'Zařazení do třídy',
        text:
          'Po zavření této zprávy si vyberete svou třídu. Žádost dostane velitel třídy (nebo lektor) a po ' +
          'schválení vás zařadí. Třídu pak sami změnit nemůžete — to dělá lektor nebo správce. Nevidíte-li svou ' +
          'třídu, zvolte „Nevidím zde svou třídu“ a napište, kam patříte.',
      };
  }
}

/**
 * Úvodní zpráva po prvním přihlášení.
 *
 * Krátká: co aplikace je, jak funguje třída, kde co najdete a že podrobný
 * návod je kdykoli pod otazníkem v hlavičce. Ukáže se jednou za účet
 * (viz useWelcomeSeen) a znovu ji lze otevřít z nápovědy.
 */
export default function WelcomeMessage({ onClose, onOpenGuide }: WelcomeMessageProps) {
  const { profile, realRole } = useAuth();
  const ids = useId();
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose });

  const firstName = profile?.full_name?.trim().split(/\s+/)[0];
  const points: WelcomePoint[] = [
    classPoint(realRole ?? 'student'),
    {
      icon: Compass,
      title: 'Orientace v aplikaci',
      text:
        'Nástěnka ukazuje vaši třídu, rozvrh a oznámení. V Předmětech je učivo, ve Zkoušce testy na procvičení ' +
        'i zkoušku nanečisto. Další moduly (Kompas zákonů, scénáře, kartičky, statistiky, knihovna…) jsou ' +
        'v nabídce „Další“. Zvonek v hlavičce hlásí novinky.',
    },
    {
      icon: CircleHelp,
      title: 'Nápověda je kdykoli po ruce',
      text:
        'Otazník v hlavičce otevře podrobný návod. Najdete-li chybu nebo něco chybí, napište přes tlačítko ' +
        'Zpětná vazba (bublina v hlavičce).',
    },
  ];

  return (
    <div className="fixed inset-0 z-[75] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${ids}-title`}
        aria-describedby={`${ids}-desc`}
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5"
      >
        <div className="space-y-1.5">
          <h2 id={`${ids}-title`} className="text-xl font-bold text-slate-900 dark:text-white">
            {firstName ? `Vítejte, ${firstName}` : 'Vítejte'}
          </h2>
          <p id={`${ids}-desc`} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Tohle je studijní portál pro přípravu v akademii VS ČR — testy, učivo, předpisy a třídní nástěnka na
            jednom místě. Nejde o oficiální systém Vězeňské služby.
          </p>
        </div>

        <ul className="space-y-3.5">
          {points.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenGuide}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Podrobný návod
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold cursor-pointer"
          >
            Rozumím, začít
          </button>
        </div>
      </div>
    </div>
  );
}
