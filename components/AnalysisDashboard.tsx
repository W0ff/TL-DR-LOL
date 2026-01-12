import React, { useMemo, useEffect, useState } from 'react';
import { AnalysisResult, FileData } from '../types';
import IndemnityCard from './IndemnityCard';
import LoLCard from './LoLCard';
import PDFViewer from './PDFViewer';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  representedParty: string;
  fileData: FileData;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, onReset, representedParty, fileData }) => {
  const [docUrl, setDocUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  
  // Helper to determine grid class based on item count
  const getGridClass = (count: number) => {
    return count > 1 
      ? "grid grid-cols-1 xl:grid-cols-2 gap-6" 
      : "grid grid-cols-1 gap-6";
  };

  // Sorting logic
  const sortedIndemnity = useMemo(() => {
    return [...result.indemnity].sort((a, b) => {
      if (a.partyName === representedParty) return -1;
      if (b.partyName === representedParty) return 1;
      return 0;
    });
  }, [result.indemnity, representedParty]);

  const sortedLoL = useMemo(() => {
    return [...result.lol].sort((a, b) => {
      if (a.partyName === representedParty) return -1;
      if (b.partyName === representedParty) return 1;
      return 0;
    });
  }, [result.lol, representedParty]);

  const isWordDoc = fileData.mimeType.includes('word') || fileData.mimeType.includes('officedocument');
  const isPdf = fileData.mimeType === 'application/pdf';

  // For text files, we can still use a blob url/iframe safely usually, or a simple pre
  useEffect(() => {
    if (isWordDoc || isPdf) return; // Handled separately

    try {
        const byteCharacters = atob(fileData.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileData.mimeType });
        const url = URL.createObjectURL(blob);
        setDocUrl(url);

        return () => URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Failed to create blob URL", e);
    }
  }, [fileData, isWordDoc, isPdf]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    setIsDownloading(true);

    try {
      // Small delay to ensure render updates if any
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2, // Retain quality
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc' // Match bg-slate-50
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for a continuous page PDF
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Create PDF with custom dimension matching the content
      // using points (pt) or pixels (px) is easiest for exact match
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const safeFilename = `Risk_Report_${representedParty.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      pdf.save(safeFilename);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex h-full w-full animate-in fade-in duration-700">
      
      {/* Left Panel: Document Viewer */}
      <div className="hidden lg:flex flex-col w-[45%] h-full border-r border-slate-300 bg-slate-200 relative">
        <div className="absolute top-0 left-0 w-full h-10 bg-slate-800 text-white flex items-center px-4 text-xs font-medium tracking-wide z-10 shadow-md">
          ORIGINAL AGREEMENT
        </div>
        <div className="pt-10 h-full w-full">
            {isPdf ? (
              <PDFViewer base64={fileData.base64} />
            ) : isWordDoc ? (
                 <div className="h-full w-full flex flex-col items-center justify-center p-8 text-slate-500">
                    <svg className="w-16 h-16 mb-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-center font-medium">Preview not available for Word documents.</p>
                    <p className="text-sm text-center mt-2">Please refer to the original file in your local editor.</p>
                 </div>
            ) : (
                <iframe
                    src={docUrl}
                    className="w-full h-full border-none bg-white"
                    title="Original Agreement"
                />
            )}
        </div>
      </div>

      {/* Right Panel: Analysis */}
      <div className="w-full lg:w-[55%] h-full overflow-y-auto bg-slate-50">
          <div id="report-content" className="p-8 max-w-5xl mx-auto bg-slate-50">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-slate-200 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                        AI
                      </span>
                      <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Analysis Complete</h2>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">Contract Risk Report</h1>
                  <p className="text-slate-500 mt-2 text-base">
                    Reviewing position for: <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{representedParty}</span>
                  </p>
                </div>
                
                {/* Controls - Hide during capture via data-html2canvas-ignore */}
                <div className="flex gap-3" data-html2canvas-ignore="true">
                    <button 
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="hidden md:inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                      </>
                    )}
                    </button>
                    <button 
                    onClick={onReset}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                    New Analysis
                    </button>
                </div>
              </div>

              <div className="flex flex-col gap-12">
                
                {/* Indemnity Section */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-800">Indemnification</h2>
                  </div>
                  
                  <div className={getGridClass(sortedIndemnity.length)}>
                    {sortedIndemnity.length > 0 ? (
                        sortedIndemnity.map((item, index) => (
                            <IndemnityCard key={`indemnity-${index}`} data={item} />
                        ))
                    ) : (
                        <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-300 w-full">
                            <p className="text-slate-500">No significant indemnity clauses identified.</p>
                        </div>
                    )}
                  </div>
                </section>

                {/* LoL Section */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-800">Limitation of Liability</h2>
                  </div>

                  <div className={getGridClass(sortedLoL.length)}>
                    {sortedLoL.length > 0 ? (
                        sortedLoL.map((item, index) => (
                            <LoLCard key={`lol-${index}`} data={item} />
                        ))
                    ) : (
                        <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-300 w-full">
                            <p className="text-slate-500">No limitation of liability clauses identified.</p>
                        </div>
                    )}
                  </div>
                </section>

              </div>

              <div className="mt-16 border-t border-slate-200 pt-8 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-slate-400 max-w-2xl">
                    This report was generated by AI based on the text provided. It identifies potential risks but does not constitute legal advice. 
                    Verification by qualified counsel is recommended before execution.
                </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;