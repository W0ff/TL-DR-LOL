import React, { useState } from 'react';
import { AppStatus, FileData, AnalysisResult } from './types';
import * as geminiService from './services/geminiService';
import FileUpload from './components/FileUpload';
import PartySelector from './components/PartySelector';
import AnalysisDashboard from './components/AnalysisDashboard';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [identifiedParties, setIdentifiedParties] = useState<string[]>([]);
  const [representedParty, setRepresentedParty] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelect = async (file: FileData) => {
    setFileData(file);
    setStatus(AppStatus.EXTRACTING_PARTIES);
    setErrorMsg('');

    try {
      const parties = await geminiService.identifyParties(file);
      if (parties.length === 0) {
        // Fallback if no parties found
        setIdentifiedParties(['Party A', 'Party B']);
      } else {
        setIdentifiedParties(parties);
      }
      setStatus(AppStatus.SELECTING_PARTY);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to read document parties. Please try a clearer document.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handlePartyConfirm = async (myParty: string, otherParty: string) => {
    if (!fileData) return;
    
    setRepresentedParty(myParty);
    setStatus(AppStatus.ANALYZING);
    
    try {
      const result = await geminiService.analyzeContract(fileData, myParty, otherParty);
      setAnalysisResult(result);
      setStatus(AppStatus.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Analysis failed. The AI could not process this document.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setFileData(null);
    setIdentifiedParties([]);
    setAnalysisResult(null);
    setStatus(AppStatus.IDLE);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              LoL
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">tl;dr LoL</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 relative overflow-hidden">
        {status === AppStatus.IDLE && (
          <div className="h-full flex flex-col items-center justify-center p-8 overflow-y-auto">
            <div className="text-center mb-10 max-w-2xl">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                Contract Risk, <span className="text-indigo-600">Decoded.</span>
              </h1>
              <p className="text-lg text-slate-600">
                Upload a contract to instantly extract and visualize risk profiles for Indemnification and Limitation of Liability clauses.
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
          </div>
        )}

        {(status === AppStatus.EXTRACTING_PARTIES || status === AppStatus.ANALYZING) && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-lg font-medium text-slate-700">
              {status === AppStatus.EXTRACTING_PARTIES ? 'Identifying Contracting Parties...' : 'Analyzing Clauses...'}
            </p>
            <p className="text-sm text-slate-500 mt-2">This usually takes about 10-20 seconds.</p>
          </div>
        )}

        {status === AppStatus.SELECTING_PARTY && (
          <div className="flex items-center justify-center h-full p-8 overflow-y-auto">
            <PartySelector 
              identifiedParties={identifiedParties} 
              onConfirm={handlePartyConfirm} 
            />
          </div>
        )}

        {status === AppStatus.RESULTS && analysisResult && fileData && (
          <AnalysisDashboard 
            result={analysisResult} 
            representedParty={representedParty}
            onReset={handleReset}
            fileData={fileData}
          />
        )}

        {status === AppStatus.ERROR && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-red-50 text-red-700 px-6 py-4 rounded-lg shadow-sm border border-red-100 max-w-md text-center">
              <svg className="w-12 h-12 mx-auto text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
              <p>{errorMsg}</p>
              <button 
                onClick={handleReset}
                className="mt-6 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 font-medium text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;