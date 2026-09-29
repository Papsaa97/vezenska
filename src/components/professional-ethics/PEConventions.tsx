import React from 'react';
import { Globe2, Scale, Building, HeartHandshake } from 'lucide-react';
import { defaultEthicsSections } from '../../data/professionalEthicsData';
import { StudySection } from '../../data/studySections';
import RichText, { textLines } from '../common/RichText';

const CARD_CLASS =
  'bg-slate-900 print:bg-white p-5 rounded-2xl border border-slate-800 print:border-slate-300 space-y-3 print-card break-inside-avoid print:text-[#111827] print:shadow-none';

/** Karta s úvodním textem a odrážkami (EVP, Mandelova pravidla). */
function BulletCard({ section, icon, color }: { section: StudySection; icon: React.ReactNode; color: string }) {
  return (
    <div className={CARD_CLASS} style={{ breakInside: 'avoid' }}>
      <div className={`flex items-center gap-2 ${color} print:text-slate-900 font-bold`}>
        {icon}
        <span>{section.title}</span>
      </div>
      {section.intro && (
        <p className="text-xs text-slate-300 print:text-[#111827] leading-relaxed">
          <RichText text={section.intro} />
        </p>
      )}
      {section.items.length > 0 && (
        <div className="p-2.5 bg-slate-800/80 print:bg-slate-50 rounded-xl border border-slate-700/60 print:border-slate-200 text-[11px] text-slate-300 print:text-[#111827] space-y-1">
          {section.items.map((item, idx) => (
            <div key={idx}>• <strong>{item.title}</strong> <RichText text={item.text} /></div>
          ))}
        </div>
      )}
    </div>
  );
}

export const PEConventions: React.FC = () => {
  const sections = defaultEthicsSections;
  const evp = sections.find((s) => s.id === 'evp-evp');
  const mandela = sections.find((s) => s.id === 'evp-mandela');
  const institutions = sections.find((s) => s.id === 'evp-instituce');
  const spiritual = sections.find((s) => s.id === 'evp-duchovni');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">

        {/* EVP Card */}
        {evp && <BulletCard section={evp} icon={<Globe2 className="w-5 h-5" />} color="text-emerald-400" />}

        {/* Mandela Rules Card */}
        {mandela && <BulletCard section={mandela} icon={<Scale className="w-5 h-5" />} color="text-blue-400" />}

        {/* Institutions Card */}
        {institutions && (
          <div className={CARD_CLASS} style={{ breakInside: 'avoid' }}>
            <div className="flex items-center gap-2 text-amber-400 print:text-slate-900 font-bold">
              <Building className="w-5 h-5" />
              <span>{institutions.title}</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300 print:text-[#111827]">
              {institutions.items.map((item, idx) => (
                <div key={idx}>
                  <strong className="text-white print:text-slate-900 block">{item.title}</strong>
                  <RichText text={item.text} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spiritual Care Section */}
      {spiritual && (
        <div className="bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 rounded-2xl p-6 print:p-4 space-y-4 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
          <h3 className="font-bold text-white print:text-[#111827] text-base flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400 print:text-slate-900" />
            <span>{spiritual.title}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 print:text-[#111827]">
            {spiritual.items.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-800/70 print:bg-slate-50 rounded-xl border border-slate-700 print:border-slate-300 space-y-2">
                <h4 className="font-bold text-emerald-300 print:text-slate-900 text-sm">{item.title}</h4>
                {textLines(item.text).map((line, lineIdx) => (
                  <p key={lineIdx}><RichText text={line} /></p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PEConventions;
