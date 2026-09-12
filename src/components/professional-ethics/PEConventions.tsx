import React from 'react';
import { Globe2, Scale, Building, HeartHandshake } from 'lucide-react';

export const PEConventions: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">

      {/* EVP Card */}
      <div className="bg-slate-900 print:bg-white p-5 rounded-2xl border border-slate-800 print:border-slate-300 space-y-3 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
        <div className="flex items-center gap-2 text-emerald-400 print:text-slate-900 font-bold">
          <Globe2 className="w-5 h-5" />
          <span>Evropská vězeňská pravidla (EVP)</span>
        </div>
        <p className="text-xs text-slate-300 print:text-[#111827] leading-relaxed">
          Doporučení Rec(2006)2-rev Výboru ministrů Rady Evropy (aktualizováno 1. 7. 2020). Základní principy: výkon trestu se musí co nejvíce přibližovat životu na svobodě (normalizace), zákaz zhoršování utrpení nad rámec odnětí svobody a důraz na dynamickou bezpečnost.
        </p>
        <div className="p-2.5 bg-slate-800/80 print:bg-slate-50 rounded-xl border border-slate-700/60 print:border-slate-200 text-[11px] text-slate-300 print:text-[#111827] space-y-1">
          <div>• <strong>Samovazba (bod 60.6):</strong> Max. limity, zákaz pro děti a těhotné ženy, denní vizita ředitelem.</div>
          <div>• <strong>Prohlídky (bod 54):</strong> Pouze osobou stejného pohlaví, intimní prohlídky smí provádět <em>pouze lékař</em>.</div>
        </div>
      </div>

      {/* Mandela Rules Card */}
      <div className="bg-slate-900 print:bg-white p-5 rounded-2xl border border-slate-800 print:border-slate-300 space-y-3 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
        <div className="flex items-center gap-2 text-blue-400 print:text-slate-900 font-bold">
          <Scale className="w-5 h-5" />
          <span>Mandelova pravidla OSN</span>
        </div>
        <p className="text-xs text-slate-300 print:text-[#111827] leading-relaxed">
          Standardní minimální pravidla OSN pro zacházení s vězni (1955/1957, revidována 2015 v Ženevě). Pojmenována po Nelsonu Mandelovi. Stanovují univerzální minimální standardy lidské důstojnosti po celém světě.
        </p>
        <div className="p-2.5 bg-slate-800/80 print:bg-slate-50 rounded-xl border border-slate-700/60 print:border-slate-200 text-[11px] text-slate-300 print:text-[#111827] space-y-1">
          <div>• <strong>Bangkokská pravidla (2010):</strong> Specifické záruky pro vězněné ženy, matky a děti.</div>
          <div>• <strong>Výbor proti mučení OSN:</strong> Sídlo evropské pobočky v Ženevě.</div>
        </div>
      </div>

      {/* Institutions Card */}
      <div className="bg-slate-900 print:bg-white p-5 rounded-2xl border border-slate-800 print:border-slate-300 space-y-3 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
        <div className="flex items-center gap-2 text-amber-400 print:text-slate-900 font-bold">
          <Building className="w-5 h-5" />
          <span>Kontrolní instituce ochrany LP</span>
        </div>
        <div className="space-y-2 text-xs text-slate-300 print:text-[#111827]">
          {[
            { label: 'ESLP (Štrasburk):', desc: 'Evropský soud pro lidská práva (zřízen 1959).' },
            { label: 'CPT (Štrasburk):', desc: 'Evropský výbor pro prevenci mučení (inspekce 1x za 5 let nebo ad hoc).' },
            { label: 'Veřejný ochránce práv (Brno):', desc: 'Nezávislý ombudsman v ČR (Stanislav Křeček).' },
            { label: 'Dozorový státní zástupce:', desc: 'Pravidelné prověrky zákonnosti přímo ve věznicích.' },
          ].map(({ label, desc }) => (
            <div key={label}>
              <strong className="text-white print:text-slate-900 block">{label}</strong>
              {desc}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Spiritual Care Section */}
    <div className="bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 rounded-2xl p-6 print:p-4 space-y-4 print-card break-inside-avoid print:text-[#111827] print:shadow-none" style={{ breakInside: 'avoid' }}>
      <h3 className="font-bold text-white print:text-[#111827] text-base flex items-center gap-2">
        <HeartHandshake className="w-5 h-5 text-emerald-400 print:text-slate-900" />
        <span>Duchovní péče ve vězeňství (VDP & VDS)</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 print:text-[#111827]">
        <div className="p-4 bg-slate-800/70 print:bg-slate-50 rounded-xl border border-slate-700 print:border-slate-300 space-y-2">
          <h4 className="font-bold text-emerald-300 print:text-slate-900 text-sm">Smluvní základ a formy</h4>
          <p>Duchovní péče je poskytována na základě <strong>trojstranné dohody</strong> (VS ČR + ČBK + ERC) a <strong>dvoustranné dohody</strong> (VS ČR + NSSJ). Účast odsouzených je <strong>zcela dobrovolná</strong>.</p>
          <p>Duchovní působí buď jako neplacení dobrovolníci ve spolku <strong>Vězeňská duchovenská péče (VDP, z.s.)</strong>, nebo po zapracování jako kaplani <strong>Vězeňské duchovní služby (VDS)</strong> – zaměstnanci VS ČR.</p>
        </div>
        <div className="p-4 bg-slate-800/70 print:bg-slate-50 rounded-xl border border-slate-700 print:border-slate-300 space-y-2">
          <h4 className="font-bold text-emerald-300 print:text-slate-900 text-sm">Zákonné mantinely & Svoboda vyznání</h4>
          <p>Dle Čl. 15–16 Listiny základních práv a svobod má každý zaručenu svobodu myšlení, svědomí a vyznání. Nikdo nesmí být nucen k účasti na bohoslužbách ani k přijímání návštěv církevních představitelů.</p>
          <p>Vězněným osobám je umožněno vlastnit náboženskou literaturu a účastnit se povolených pastoračních aktivit v rámci programu zacházení.</p>
        </div>
      </div>
    </div>
  </div>
);

export default PEConventions;
