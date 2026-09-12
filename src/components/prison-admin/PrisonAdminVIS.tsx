import React from 'react';
import {
  CheckCircle2,
  UserCheck,
  Clock,
  Eye,
  Phone,
} from 'lucide-react';

/**
 * VIS — Vězeňský informační systém.
 * Statická vzdělávací sekce (bez lokálního state) — zobrazuje
 * evidenční stavy osob a pravidla poskytování informací dle § 23a
 * zákona č. 555/1992 Sb.
 */
export default function PrisonAdminVIS() {
  return (
    <div className="space-y-6 no-print print:hidden">

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Vězeňský informační systém VIS
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Evidenční stavy osob a právní režim poskytování informací
            </h2>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
            § 23a zákona č. 555/1992 Sb.
          </div>
        </div>

        {/* 3 Evidential States of Prisoners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Stav kmenový</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Sledování podle umístění
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Vězněná osoba je kmenově zařazena a vedena ve stavu té konkrétní věznice či vazební věznice,
              do které byla rozhodnutím generálního ředitelství umístěna.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>Stav administrativní</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Sledování podle běhu lhůt
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Sledování právního stavu a lhůt výkonu vazby, trestu odnětí svobody nebo zabezpečovací detence
              (počátek trestu, termíny přezkumů, konec trestu, podmíněné propuštění).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs">
              <Eye className="w-3.5 h-3.5" />
              <span>Stav fyzický</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Sledování fyzické přítomnosti
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Reálná fyzická přítomnost v objektu. Při eskortě k civilnímu soudu či do civilní nemocnice
              je vězeň kmenově v mateřské věznici, ale fyzicky se nachází mimo ni.
            </p>
          </div>

        </div>

        {/* Rules of Information Sharing Grid */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Pravidla poskytování informací z evidence VS ČR (§ 23a zákona č. 555/1992 Sb.)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Poskytování bez souhlasu vězněné osoby</span>
              </h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] list-disc list-inside">
                <li><strong>Orgánům činným v trestním řízení (OČTŘ)</strong>, soudům a státním zastupitelstvím.</li>
                <li><strong>Státním orgánům a institucím:</strong> ČSSZ, OSSZ, finanční úřady, exekutoři, probační služba (PMaS), sociální péče, ombudsman.</li>
                <li><strong>Třetím osobám (věřitelé, zaměstnavatelé, osoby blízké):</strong> POUZE údaj o umístění a délce trestu, pokud <em>osvědčí právní zájem</em>.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>Telefonické lustrace &amp; Ochrana svědků</span>
              </h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] list-disc list-inside">
                <li><strong>Telefonická hesla:</strong> Stanovuje odbor správní GŘ VS ČR s platností na <strong>3 měsíce</strong>. Po telefonu <em>bez platného hesla</em> se nesmí podat žádná informace!</li>
                <li><strong>Zvláštní ochrana svědka (z. č. 137/2001 Sb.):</strong> Informace lze podat pouze na základě písemné žádosti schválené Útvarem speciálních činností Policie ČR.</li>
                <li><strong>Nahlížení do osobního spisu:</strong> Vězeň může žádat písemně; bezpečnostní údaje a totožnost zaměstnanců v komisích se neposkytují formou kopií, ale pouze výpisem.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
