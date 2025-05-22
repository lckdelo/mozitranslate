"use client";

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import TranslatedView from '@/components/TranslatedView';

export default function Home() {
  const [docId, setDocId] = useState<string | null>(null);
  
  return (
    <div className="w-full h-full flex flex-col">
      {!docId ? (
        <div className="flex-1 flex items-center justify-center p-2 min-h-0">
          <div className="w-full max-w-xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-3 text-sky-700 dark:text-sky-300 tracking-tight">
                MoziTranslate
              </h1>
              <p className="text-base text-sky-600 dark:text-sky-400 max-w-md mx-auto">
                Traduza documentos PDF em tempo real enquanto navega pelas páginas
              </p>
            </div>
            
            <div className="bg-gradient-to-b from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 p-4 rounded-xl shadow-lg">
              <FileUploader onFileUploaded={setDocId} />
            </div>
            
            <div className="text-center text-xs text-sky-600 dark:text-sky-400 mt-4">
              <p className="mb-1">Suporta tradução instantânea de PDFs para vários idiomas</p>
              <p>As páginas são traduzidas enquanto você navega no documento</p>
            </div>
          </div>
        </div>      ) : (
        <div className="flex-1 flex flex-col p-2 min-h-0 overflow-auto">
          <div className="bg-sky-50 dark:bg-slate-800 rounded-lg shadow-lg border border-sky-100 dark:border-sky-900 p-2 md:p-4 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
              <h2 className="text-lg font-bold text-sky-700 dark:text-sky-300">Tradutor de PDF</h2>
              <button 
                onClick={() => setDocId(null)} 
                className="px-3 py-1 bg-sky-200 dark:bg-sky-800 hover:bg-sky-300 dark:hover:bg-sky-700 rounded-md text-sky-800 dark:text-sky-200 text-sm transition-colors"
              >
                Escolher outro PDF
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              <TranslatedView docId={docId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
