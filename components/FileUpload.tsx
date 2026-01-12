import React, { useCallback } from 'react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileSelect: (fileData: FileData) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      onFileSelect({
        base64: base64String,
        mimeType: file.type || 'application/pdf', // Default to PDF if type is missing, Gemini is usually smart enough
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors bg-white shadow-sm">
        <input
          type="file"
          accept=".pdf,.md,.txt"
          onChange={handleFileChange}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-slate-900">
              {isLoading ? "Reading document..." : "Drop your contract here"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Supports PDF, Markdown, or Text files
            </p>
          </div>
          {!isLoading && (
            <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors pointer-events-none">
              Browse Files
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;