"use client";

import React, { useEffect, useRef, useState } from 'react';

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
  const [isCopied, setIsCopied] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showOriginal, setShowOriginal] = useState(false);
  
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
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };
  
  // Handle font size adjustments
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));
  const resetFontSize = () => setFontSize(16);
  
  // Format text with some basic markdown-like parsing for better readability
  const formatText = (text: string) => {
    if (!text) return null;
    
    // Split by paragraph and preserve line breaks
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      // Check if looks like a heading (starts with # or is all caps and short)
      if (paragraph.trim().startsWith('#') || 
          (paragraph.trim() === paragraph.trim().toUpperCase() && paragraph.length < 50)) {
        return (
          <h3 key={index} className="text-lg font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
            {paragraph.replace(/^#+\s*/, '')} {/* Remove leading # characters */}
          </h3>
        );
      } 
      
      // Check if this looks like a list item
      else if (paragraph.trim().match(/^(\d+\.|\*|\-)\s/)) {
        return (
          <div key={index} className="ml-4 my-2">
            {paragraph.split('\n').map((line, lineIndex) => (
              <div key={`${index}-${lineIndex}`} className="flex items-baseline mb-1">
                <div className="w-4 flex-shrink-0 text-primary-500 dark:text-primary-400">
                  {line.trim().match(/^\d+\./) ? '•' : '•'}
                </div>
                <div>{line.replace(/^(\d+\.|\*|\-)\s*/, '')}</div>
              </div>
            ))}
          </div>
        );
      } 
      
      // Regular paragraph with support for line breaks
      else {
        return (
          <p key={index} className="mb-4 last:mb-0">
            {paragraph.split('\n').map((line, lineIndex, array) => (
              <React.Fragment key={`${index}-${lineIndex}`}>
                {line}
                {lineIndex < array.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      }
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with title and controls */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700 mb-4">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z" fill="currentColor"/>
          </svg>
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
            Texto Traduzido
          </h2>
          <div className="ml-3 flex items-center px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm">
            <span className="mr-1">{targetLangFlag}</span>
            <span className="font-medium">{targetLangName}</span>
          </div>
        </div>
        
        {/* Text size controls */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={decreaseFontSize}
            disabled={fontSize <= 12}
            className="p-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 disabled:opacity-40 transition-colors"
            title="Diminuir fonte"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 8V20M14 8H10M14 8H18M10 20H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button 
            onClick={resetFontSize}
            className="px-2 py-1 rounded-md text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition-colors"
            title="Tamanho padrão da fonte"
          >
            {fontSize}px
          </button>
          
          <button 
            onClick={increaseFontSize}
            disabled={fontSize >= 24}
            className="p-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 disabled:opacity-40 transition-colors"
            title="Aumentar fonte"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 8V20M14 8H10M14 8H18M10 20H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-[600px] bg-neutral-50 dark:bg-neutral-900 rounded-lg gap-4 border border-neutral-200 dark:border-neutral-700">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
          </div>
          <p className="text-primary-700 dark:text-primary-300 font-medium">Traduzindo texto...</p>
          <p className="text-neutral-500 dark:text-neutral-500 text-sm max-w-xs text-center">
            Estamos processando o texto do documento para oferecer a melhor tradução possível
          </p>
        </div>
      ) : translatedText ? (
        <div className="flex-1 flex flex-col">
          {/* Actions bar */}
          <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
            <div className="flex space-x-2">
              <button 
                className={`px-4 py-2 rounded-md text-sm flex items-center shadow-sm transition-colors ${
                  isCopied 
                    ? 'bg-secondary-600 text-white' 
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
                onClick={copyToClipboard}
              >
                {isCopied ? (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copiado!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M16 2H8C6.89543 2 6 2.89543 6 4V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V4C18 2.89543 17.1046 2 16 2ZM8 4H16V16H8V4Z" fill="currentColor"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M4 8H2V20C2 21.1046 2.89543 22 4 22H16V20H4V8Z" fill="currentColor"/>
                    </svg>
                    Copiar Texto
                  </>
                )}
              </button>
              
              <button 
                className={`px-4 py-2 rounded-md text-sm flex items-center shadow-sm transition-colors ${
                  showOriginal
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                }`}
                onClick={() => setShowOriginal(prev => !prev)}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 10H20M4 14H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {showOriginal ? 'Ver Tradução' : 'Ver Original'}
              </button>
            </div>
            
            <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-md">
              <span className="hidden sm:inline mr-1">Caracteres:</span> 
              <span className="font-medium">{originalText.length}</span> 
              <svg className="w-4 h-4 mx-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> 
              <span className="font-medium">{translatedText.length}</span>
            </div>
          </div>
          
          {/* Text content */}
          <div 
            ref={contentRef}
            className="flex-1 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-6 overflow-auto min-h-[500px] border border-neutral-200 dark:border-neutral-700 shadow-sm"
            style={{ fontSize: `${fontSize}px` }}
          >
            <div className="text-neutral-900 dark:text-neutral-200 leading-relaxed font-[system-ui]">
              {showOriginal ? (
                <pre className="font-[system-ui] whitespace-pre-wrap">{originalText}</pre>
              ) : (
                formatText(translatedText)
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-[600px] bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 gap-2">
          <svg className="w-16 h-16 text-neutral-400 dark:text-neutral-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10Z" fill="currentColor"/>
          </svg>
          <p className="text-neutral-700 dark:text-neutral-300 text-lg">Nenhuma tradução disponível</p>
          <p className="text-neutral-500 dark:text-neutral-500 text-sm">Selecione um documento para traduzir</p>
        </div>
      )}
    </div>
  );
};

export default TranslationPanel;
