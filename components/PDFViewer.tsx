import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Fix for ESM import of pdfjs-dist where properties might be on default depending on the bundler/CDN
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Configure the worker using UNPKG (classic script) instead of ESM.sh.
// This prevents "Failed to execute 'importScripts'" errors because standard workers expect classic scripts.
if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

// Sub-component to render individual pages
interface PDFPageProps {
  pdfDoc: any;
  pageNum: number;
  scale: number;
}

const PDFPage: React.FC<PDFPageProps> = ({ pdfDoc, pageNum, scale }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let renderTask: any = null;

    const render = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      
      try {
        const page = await pdfDoc.getPage(pageNum);
        
        // Support High DPI screens for crisper text
        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * pixelRatio });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;

        // Set actual canvas dimensions to match the physical pixels
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Scale down visually using CSS to match the logical size
        canvas.style.width = `${viewport.width / pixelRatio}px`;
        canvas.style.height = `${viewport.height / pixelRatio}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
            console.error(`Error rendering page ${pageNum}:`, err);
        }
      }
    };

    render();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale]);

  return (
    <div className="mb-6 shadow-lg">
      <canvas ref={canvasRef} className="bg-white block" />
    </div>
  );
};

interface PDFViewerProps {
  base64: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ base64 }) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2); // Default zoom
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Load Document
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      setIsLoading(true);
      setError('');
      try {
        // We must convert base64 back to binary for PDF.js
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Use the resolved pdfjs object here
        const loadingTask = pdfjs.getDocument({ data: bytes });
        const doc = await loadingTask.promise;
        
        if (isMounted) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        if (isMounted) {
          setError('Failed to load PDF document. ' + (err.message || ''));
          setIsLoading(false);
        }
      }
    };

    if (base64) {
      loadPdf();
    }
    
    return () => {
      isMounted = false;
    };
  }, [base64]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 p-6 text-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-200">
      {/* Toolbar */}
      <div className="bg-slate-700 text-white p-2 flex items-center justify-between shadow-md z-10 flex-shrink-0">
        <div className="text-xs font-medium px-2 opacity-80">
            {isLoading ? 'Loading...' : `${numPages} Pages`}
        </div>
        
        <div className="flex items-center space-x-2">
           <button 
             onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
             className="p-1 rounded hover:bg-slate-600"
             title="Zoom Out"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
           </button>
           <span className="text-xs w-8 text-center">{Math.round(scale * 100)}%</span>
           <button 
             onClick={() => setScale(s => Math.min(3.0, s + 0.2))}
             className="p-1 rounded hover:bg-slate-600"
             title="Zoom In"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
           </button>
        </div>
      </div>

      {/* Scrollable PDF Area */}
      <div className="flex-1 overflow-auto flex justify-center p-6 bg-slate-200/50">
        {isLoading ? (
          <div className="self-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
             {Array.from({ length: numPages }, (_, i) => (
               <PDFPage 
                 key={i + 1} 
                 pdfDoc={pdfDoc} 
                 pageNum={i + 1} 
                 scale={scale} 
               />
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;