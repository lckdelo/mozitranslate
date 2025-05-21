"use client";

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import TranslatedView from '@/components/TranslatedView';

export default function Home() {
  const [docId, setDocId] = useState<string | null>(null);
  
  return (
    <div className="container mx-auto p-4">
      {!docId ? (
        <div className="max-w-xl mx-auto mt-6 md:mt-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-sky-700 dark:text-sky-300 tracking-tight">
              MoziTranslate
            </h1>
            <p className="text-lg text-sky-600 dark:text-sky-400 max-w-lg mx-auto">
              Traduza documentos PDF em tempo real enquanto navega pelas páginas
            </p>
          </div>
          
          <div className="bg-gradient-to-b from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 p-6 rounded-2xl shadow-lg mb-8">
            <FileUploader onFileUploaded={setDocId} />
          </div>
          
          <div className="text-center text-sm text-sky-600 dark:text-sky-400">
            <p className="mb-2">Suporta tradução instantânea de PDFs para vários idiomas</p>
            <p>As páginas são traduzidas enquanto você navega no documento</p>
          </div>
        </div>
      ) : (
        <div className="bg-sky-50 dark:bg-slate-800 rounded-lg shadow-lg border border-sky-100 dark:border-sky-900 p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-sky-700 dark:text-sky-300">Tradutor de PDF</h2>
            <button 
              onClick={() => setDocId(null)} 
              className="px-4 py-1 bg-sky-200 dark:bg-sky-800 hover:bg-sky-300 dark:hover:bg-sky-700 rounded-md text-sky-800 dark:text-sky-200 text-sm transition-colors"
            >
              Escolher outro PDF
            </button>
          </div>
          <TranslatedView docId={docId} />
        </div>
      )}
    </div>
  );
}
