"use client";

import React, { useEffect, useRef } from 'react';

interface TranslationPanelProps {
  originalText: string;
  translatedText: string;
  isLoading: boolean;
  targetLang?: string;
  targetLangName?: string;
  targetLangFlag?: string;
}

const TranslationPanel: React.FC<TranslationPanelProps> = ({
  originalText,
  translatedText,
  isLoading,
  targetLang = 'pt',
  targetLangName = 'Português',
  targetLangFlag = '🇧🇷',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Reset scroll position when content changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [translatedText]);
  
  // Function to copy text with notification
  const copyToClipboard = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText)
        .then(() => {
          // Show a temporary tooltip or notification
          const button = document.getElementById('copy-button');
          if (button) {
            const originalText = button.innerText;
            button.innerText = 'Copiado!';
            setTimeout(() => {
              button.innerText = originalText;
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };
  return (
    <div className="flex flex-col h-full">      <h2 className="text-xl font-bold mb-4 text-sky-700 dark:text-sky-300 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span>Texto Traduzido</span>
        <span className="ml-2 flex items-center text-sm font-normal bg-sky-200 dark:bg-sky-800 px-2 py-0.5 rounded-full">
          <span className="mr-1">{targetLangFlag}</span>
          <span>{targetLangName}</span>
        </span>
      </h2>
      
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-[600px] bg-sky-50 dark:bg-slate-900 rounded-lg gap-4 border border-sky-100 dark:border-sky-800">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-500"></div>
          <p className="text-sky-600 dark:text-sky-400">Traduzindo texto...</p>
        </div>
      ) : translatedText ? (
        <div 
          ref={contentRef}
          className="bg-sky-50 dark:bg-slate-900 rounded-lg p-6 overflow-auto h-[600px] whitespace-pre-wrap font-sans border border-sky-100 dark:border-sky-800"
        >
          <div className="mb-6 pb-4 border-b border-sky-200 dark:border-sky-800 flex flex-wrap justify-between items-center gap-4">
            <button 
              id="copy-button"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm flex items-center shadow-sm transition-colors"
              onClick={copyToClipboard}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copiar Texto
            </button>
            <div className="text-sm text-sky-600 dark:text-sky-400 flex items-center bg-sky-100 dark:bg-sky-900 px-3 py-1 rounded-full">
              <span className="mr-1">Caracteres:</span> 
              <span className="font-medium">{originalText.length}</span> 
              <span className="mx-1">→</span> 
              <span className="font-medium">{translatedText.length}</span>
            </div>
          </div>
          <div className="text-slate-800 dark:text-slate-200 leading-relaxed">
            {translatedText}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-[600px] bg-sky-50 dark:bg-slate-900 rounded-lg border border-sky-100 dark:border-sky-800">
          <p className="text-sky-600 dark:text-sky-400">Nenhuma tradução disponível</p>
        </div>
      )}
    </div>
  );
};

export default TranslationPanel;
