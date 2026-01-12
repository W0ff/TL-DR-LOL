import React from 'react';
import { LoLSummary } from '../types';

interface LoLCardProps {
  data: LoLSummary;
}

const LoLCard: React.FC<LoLCardProps> = ({ data }) => {
  const isPass = data.consequentialDamagesStatus === 'PASS';
  const isMutual = data.partyName === 'Mutual';
  // Defensive defaults
  const consequentialDamagesExclusions = data.consequentialDamagesExclusions || [];
  const capExclusions = data.capExclusions || [];

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Decorative Top Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />

      <div className="p-6 flex-1">
        {/* Header */}
         <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {isMutual ? 'Mutual Liability Limits' : `Limits for ${data.partyName}`}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Risk Allocation Analysis
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Consequential Damages */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
             <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Consequential Damages Waiver</span>
                {isPass ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 bg-white px-2 py-1 rounded-md shadow-sm text-xs font-bold border border-emerald-100">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> PASS
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-rose-600 bg-white px-2 py-1 rounded-md shadow-sm text-xs font-bold border border-rose-100">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> FAIL
                    </span>
                )}
             </div>
             
             {consequentialDamagesExclusions.length > 0 ? (
                 <div className="mt-3 text-xs text-slate-600 border-t border-slate-200 pt-3">
                    <span className="font-medium text-slate-400 uppercase tracking-wide">Exclusions:</span>
                    <ul className="mt-1 space-y-1">
                        {consequentialDamagesExclusions.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                                <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {item}
                            </li>
                        ))}
                    </ul>
                 </div>
             ) : (
                 <p className="text-xs text-slate-400 mt-2">
                    {isPass 
                      ? "Standard waiver with no notable exceptions." 
                      : `${data.partyName === 'Mutual' ? 'The agreement' : data.partyName} does not disclaim consequential damages.`}
                 </p>
             )}
          </div>

          {/* Liability Cap */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="mb-2">
              <span className="text-sm font-semibold text-slate-700">Total Liability Cap</span>
            </div>
            
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {data.capDescription}
            </p>

            {capExclusions.length > 0 && (
                <div className="mt-3 text-xs text-slate-600 border-t border-slate-200 pt-3">
                   <span className="font-medium text-slate-400 uppercase tracking-wide">Exclusions:</span>
                   <ul className="mt-1 space-y-1">
                       {capExclusions.map((item, i) => (
                           <li key={i} className="flex items-start gap-1.5">
                               <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                               {item}
                           </li>
                       ))}
                   </ul>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {data.citations && (
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-start gap-2 mt-auto">
           <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
           </svg>
           <p className="text-xs text-slate-500 leading-tight">
             <span className="font-semibold">Reference:</span> {data.citations}
           </p>
        </div>
      )}
    </div>
  );
};

export default LoLCard;