import React from 'react';
import { IndemnitySummary } from '../types';

interface IndemnityCardProps {
  data: IndemnitySummary;
}

const IndemnityCard: React.FC<IndemnityCardProps> = ({ data }) => {
  const isMutual = data.partyName === 'Mutual';
  // Defensive defaults in case AI response is partial
  const claimType = data.claimType || 'Unknown';
  const scope = data.scope || [];
  const additions = data.additions || [];
  const removals = data.removals || [];

  // Badge Color Logic
  const getBadgeStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('third') && t.includes('first')) {
      return 'bg-amber-50 text-amber-700 border-amber-200'; // Both
    }
    if (t.includes('first')) {
      return 'bg-purple-50 text-purple-700 border-purple-200'; // First Party
    }
    if (t.includes('third')) {
      return 'bg-blue-50 text-blue-700 border-blue-200'; // Third Party
    }
    return 'bg-slate-100 text-slate-600 border-slate-200'; // Unknown
  };
  
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-200 overflow-hidden h-full flex flex-col">
      {/* Decorative Top Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
      
      <div className="p-6 flex-1">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 leading-tight">
            {isMutual ? 'Mutual Indemnification' : data.partyName}
          </h3>
        </div>

        <div className="space-y-6">
          {/* Scope Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                   <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Covered Claims</h4>
              </div>
              <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getBadgeStyle(claimType)}`}>
                {claimType}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {scope.length > 0 ? (
                scope.map((item, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-slate-50 text-slate-700 border border-slate-200">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400 italic pl-1">No specific scope defined.</span>
              )}
            </div>
          </div>

          {/* Analysis / Suggestions */}
          {(additions.length > 0 || removals.length > 0) && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              
              {additions.length > 0 && (
                <div className="bg-emerald-50/50 rounded-lg p-3 border-l-4 border-emerald-500">
                  <h5 className="text-xs font-bold text-emerald-700 uppercase mb-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    Consider Adding
                  </h5>
                  <ul className="space-y-1">
                    {additions.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 leading-relaxed">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {removals.length > 0 && (
                <div className="bg-rose-50/50 rounded-lg p-3 border-l-4 border-rose-500">
                  <h5 className="text-xs font-bold text-rose-700 uppercase mb-2 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    Risky Terms
                  </h5>
                  <ul className="space-y-1">
                    {removals.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 leading-relaxed">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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

export default IndemnityCard;