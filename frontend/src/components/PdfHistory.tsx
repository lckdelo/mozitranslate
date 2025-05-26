"use client";

import React from 'react';
import { PdfHistoryItem } from '@/hooks/usePdfHistory';
import PdfHistoryCard from './PdfHistoryCard';

interface PdfHistoryProps {
  history: PdfHistoryItem[];
  onSelectPdf: (pdfId: string, lastPage?: number) => void;
  onRemovePdf: (pdfId: string) => void;
  onClearHistory: () => void;
}

const PdfHistory: React.FC<PdfHistoryProps> = ({ 
  history, 
  onSelectPdf, 
  onRemovePdf, 
  onClearHistory 
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-xl p-8 text-center border-2 border-dashed border-neutral-300 dark:border-neutral-600">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Nenhum PDF traduzido ainda
          </h3>
          <p className="text-neutral-500 dark:text-neutral-500 text-sm leading-relaxed">
            Quando você traduzir seus primeiros documentos, eles aparecerão aqui para fácil acesso e continuação da leitura.
          </p>
        </div>
      </div>    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-1">
            PDFs Traduzidos Recentemente
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Continue lendo de onde parou
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            title="Limpar histórico"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Limpar</span>
          </button>
        )}
      </div>      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {history.map((item) => (
          <PdfHistoryCard
            key={item.id}
            item={item}
            onSelect={onSelectPdf}
            onRemove={onRemovePdf}
          />
        ))}
      </div>
    </div>
  );
};

export default PdfHistory;
