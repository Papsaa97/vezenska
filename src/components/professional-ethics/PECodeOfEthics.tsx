import React from 'react';
import { Award, FileText } from 'lucide-react';
import { useStudySections } from '../../hooks/useStudySections';
import StudySectionsEditor from '../common/StudySectionsEditor';
import CustomStudySections from '../common/CustomStudySections';
import RichText from '../common/RichText';

export const PECodeOfEthics: React.FC = () => {
  // Bloky z repozitáře přepsané úpravami lektora (contentLibrary.ts, druh 'study_section').
  const sectionState = useStudySections('kodex');
  const { byId, custom } = sectionState;
  const desatero = byId('kodex-desatero');
  const articles = byId('kodex-clanky');

  return (
    <div className="space-y-6">
      <StudySectionsEditor area="kodex" state={sectionState} />

      {/* Desatero Zásad Banner */}
      {desatero && (
        <div className="bg-slate-900 border border-slate-800 print:border-slate-300 rounded-2xl p-6 print:p-4 print-card break-inside-avoid print:bg-white print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
          <h2 className="text-lg font-bold text-white print:text-[#111827] flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-emerald-400 print:text-slate-900" />
            <span>{desatero.title}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 print:grid-cols-2 gap-3 text-xs">
            {desatero.items.map((item, idx) => (
              <div key={`${idx}-${item.label}`} className="bg-slate-800/80 print:bg-slate-50 p-3.5 rounded-xl border border-slate-700 print:border-slate-300 print-card break-inside-avoid print:text-[#111827] flex flex-col justify-between" style={{ breakInside: 'avoid' }}>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="font-bold text-emerald-400 print:text-slate-900 font-mono">{item.label}</span>
                    <h4 className="font-bold text-white print:text-[#111827]">{item.title}</h4>
                  </div>
                  <p className="text-slate-300 print:text-[#111827] leading-snug"><RichText text={item.text} /></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8 Articles */}
      {articles && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white print:text-[#111827] flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400 print:text-slate-900" />
            <span>{articles.title}</span>
          </h3>

          {articles.items.map((art, idx) => (
            <div key={`${idx}-${art.label}`} className="bg-slate-900/90 border border-slate-800 print:border-slate-300 p-5 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 print-card break-inside-avoid print:bg-white print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 print:bg-slate-100 text-emerald-300 print:text-slate-900 font-mono text-xs font-bold border border-emerald-500/30 print:border-slate-300">
                    {art.label}
                  </span>
                  <h4 className="font-bold text-white print:text-[#111827] text-sm md:text-base">{art.title}</h4>
                </div>
                <p className="text-xs md:text-sm text-slate-300 print:text-[#111827] leading-relaxed pt-1">
                  <RichText text={art.text} />
                </p>
              </div>
              {art.note && (
                <div className="md:w-64 bg-slate-800/80 print:bg-slate-50 p-3 rounded-xl border border-slate-700/60 print:border-slate-300 text-xs text-slate-300 print:text-[#111827] shrink-0">
                  <span className="text-emerald-400 print:text-slate-900 font-semibold block mb-1">Aplikační význam:</span>
                  <RichText text={art.note} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bloky přidané lektorem */}
      <CustomStudySections sections={custom} tone="dark" />
    </div>
  );
};

export default PECodeOfEthics;
