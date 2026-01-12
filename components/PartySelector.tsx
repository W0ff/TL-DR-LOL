import React, { useState } from 'react';

interface PartySelectorProps {
  identifiedParties: string[];
  onConfirm: (representedParty: string, counterParty: string) => void;
}

const PartySelector: React.FC<PartySelectorProps> = ({ identifiedParties, onConfirm }) => {
  const [selectedParty, setSelectedParty] = useState<string>(identifiedParties[0] || '');
  const [manualParty, setManualParty] = useState<string>('');
  const [useManual, setUseManual] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const myParty = useManual ? manualParty : selectedParty;
    // Simple heuristic: The counter party is the one NOT selected. 
    // If manual entry or >2 parties, this might need refinement, but sufficient for MVP.
    const otherParty = identifiedParties.find(p => p !== myParty) || "The Counterparty";
    
    if (myParty) {
      onConfirm(myParty, otherParty);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-slate-100 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Identify Yourself</h2>
      <p className="text-slate-500 mb-6 text-sm">Select which party you represent in this agreement.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            I represent:
          </label>
          {!useManual ? (
            <div className="space-y-2">
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {identifiedParties.map((party, idx) => (
                  <option key={idx} value={party}>{party}</option>
                ))}
              </select>
              <button 
                type="button"
                onClick={() => setUseManual(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Party not listed? Enter manually
              </button>
            </div>
          ) : (
             <div className="space-y-2">
              <input
                type="text"
                value={manualParty}
                onChange={(e) => setManualParty(e.target.value)}
                placeholder="Enter your party name"
                className="w-full rounded-lg border-slate-300 border p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
               <button 
                type="button"
                onClick={() => setUseManual(false)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Back to list
              </button>
             </div>
          )}
        </div>

        <button
          type="submit"
          disabled={useManual && !manualParty}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Analyze Risk Profile
        </button>
      </form>
    </div>
  );
};

export default PartySelector;