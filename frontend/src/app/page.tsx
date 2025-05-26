"use client";

import { useState, useEffect } from 'react';
import FileUploader from '@/components/FileUploader';
import TranslatedView from '@/components/TranslatedView';
import PdfHistory from '@/components/PdfHistory';
import usePdfHistoryDB from '@/hooks/usePdfHistoryDB';

export default function Home() {
  const [docId, setDocId] = useState<string | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null); // Original PDF ID for history tracking
  const [startingPage, setStartingPage] = useState<number>(1);
  
  // PDF History management with SQLite
  const {
    history,
    isLoading,
    error,
    addToHistory,
    updateProgress,
    removeFromHistory,
    clearHistory,
  } = usePdfHistoryDB();
  // Handle file upload with history tracking
  const handleFileUploaded = (newDocId: string, fileName?: string) => {
    setDocId(newDocId);
    setPdfId(newDocId); // For new uploads, doc_id and pdf_id are the same
    setStartingPage(1);
      // Add to history when a new PDF is uploaded
    if (fileName) {
      addToHistory({
        pdf_id: newDocId,
        filename: fileName,
        total_pages: 0, // Will be updated when first page loads
        language: 'Português',
        language_flag: '🇧🇷',
      }).catch(console.error);
    }
  };  // Handle selecting PDF from history
  const handleSelectFromHistory = async (pdfId: string, lastPage?: number) => {
    try {
      // Try to reopen the PDF from the stored file path
      const { reopenPdfFromHistory } = await import('@/utils/api');
      const response = await reopenPdfFromHistory(pdfId);
      
      // Set the new document ID returned from reopening
      setDocId(response.doc_id);
      setPdfId(pdfId); // Keep the original PDF ID for history tracking
      setStartingPage(lastPage || 1);
    } catch (error) {
      console.error('Failed to reopen PDF from history:', error);
      
      // If reopening fails, treat it as document not found
      handleDocumentNotFound(pdfId);
    }
  };
  // Handle document not found error
  const handleDocumentNotFound = (pdfId: string) => {
    // Remove the invalid PDF from history
    handleRemoveFromHistory(pdfId);
    // Reset the view to show upload interface
    setDocId(null);
    setPdfId(null);
    setStartingPage(1);
  };  // Handle removing PDF from history
  const handleRemoveFromHistory = async (pdfId: string) => {
    try {
      // If the currently opened PDF is being removed, close it immediately
      // This prevents the component from trying to load a document that's being deleted
      if (docId === pdfId) {
        setDocId(null);
        setPdfId(null);
        setStartingPage(1);
      }
      
      await removeFromHistory(pdfId);
    } catch (error) {
      console.error('Failed to remove PDF from history:', error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {!docId ? (
        <div className="flex-1 flex flex-col p-2 min-h-0 space-y-6">
          {/* File Upload Section */}
          <div className="flex-shrink-0 flex items-center justify-center">
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
                <FileUploader onFileUploaded={handleFileUploaded} />
              </div>
              
              <div className="text-center text-xs text-sky-600 dark:text-sky-400 mt-4">
                <p className="mb-1">Suporta tradução instantânea de PDFs para vários idiomas</p>
                <p>As páginas são traduzidas enquanto você navega no documento</p>
              </div>
            </div>
          </div>
          
          {/* PDF History Section */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="max-w-6xl mx-auto px-4">              <PdfHistory
                history={history}
                isLoading={isLoading}
                error={error}
                onSelectPdf={handleSelectFromHistory}
                onRemovePdf={handleRemoveFromHistory}
                onClearHistory={clearHistory}
              />
            </div>
          </div>
        </div>) : (
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
            </div>            <div className="flex-1 min-h-0 overflow-auto">              <TranslatedView 
                docId={docId} 
                pdfId={pdfId}
                startingPage={startingPage}
                onProgressUpdate={updateProgress}
                onDocumentNotFound={handleDocumentNotFound}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
