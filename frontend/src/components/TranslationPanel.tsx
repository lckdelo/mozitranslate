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
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Reset scroll position when content changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    setSelectedText('');
    setShowTooltip(false);
  }, [translatedText]);
  
  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString());
      
      // Get position for the tooltip
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      
      setShowTooltip(true);
    } else {
      setSelectedText('');
      setShowTooltip(false);
    }
  };

  // Function to copy text with notification
  const copyToClipboard = (text?: string) => {
    const textToCopy = text || translatedText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
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
  
  // Format text with enhanced markdown-like parsing for better readability
  const formatText = (text: string) => {
    if (!text) return null;
    
    // Split by paragraph and preserve line breaks
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      // Check if looks like a heading (starts with # or is all caps and short)
      if (paragraph.trim().startsWith('#') || 
          (paragraph.trim() === paragraph.trim().toUpperCase() && paragraph.length < 50)) {
        return (
          <h3 key={index} className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-200 dark:border-neutral-700">
            {paragraph.replace(/^#+\s*/, '')} {/* Remove leading # characters */}
          </h3>
        );
      } 
      
      // Check if this looks like a list item
      else if (paragraph.trim().match(/^(\d+\.|\*|\-)\s/)) {
        return (
          <div key={index} className="ml-4 my-3 space-y-2">
            {paragraph.split('\n').map((line, lineIndex) => (
              <div key={`${index}-${lineIndex}`} className="flex items-baseline mb-1 group">
                <div className="w-6 flex-shrink-0 text-primary-500 dark:text-primary-400 font-bold text-center">
                  {line.trim().match(/^\d+\./) ? '•' : '•'}
                </div>
                <div className="flex-1 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10 rounded px-2 py-1 transition-colors">
                  {line.replace(/^(\d+\.|\*|\-)\s*/, '')}
                </div>
              </div>
            ))}
          </div>
        );
      } 
      
      // Check if this looks like a quote
      else if (paragraph.trim().startsWith('>')) {
        return (
          <blockquote key={index} className="border-l-4 border-primary-300 dark:border-primary-700 pl-4 my-4 italic text-neutral-700 dark:text-neutral-300">
            {paragraph.replace(/^>\s*/, '')}
          </blockquote>
        );
      }
      
      // Check if this might be a definition or key-value pair
      else if (paragraph.includes(':') && paragraph.split(':')[0].trim().length < 30) {
        const parts = paragraph.split(':');
        const term = parts[0].trim();
        const definition = parts.slice(1).join(':').trim();
        
        return (
          <div key={index} className="mb-4 last:mb-0">
            <span className="font-semibold text-primary-700 dark:text-primary-300">{term}:</span>
            <span className="ml-2">{definition}</span>
          </div>
        );
      }
      
      // Regular paragraph with support for line breaks
      else {
        return (
          <p key={index} className="mb-4 last:mb-0 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 rounded py-1 transition-colors leading-relaxed">
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
          <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 mr-3">
            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10Z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
            Texto Traduzido
          </h2>
          <div className="ml-3 flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 text-primary-800 dark:text-primary-200 text-sm border border-primary-200 dark:border-primary-800/50 shadow-sm">
            <span className="mr-2 text-lg">{targetLangFlag}</span>
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
        <div className="flex flex-col justify-center items-center h-[600px] bg-neutral-50 dark:bg-neutral-900 rounded-xl gap-4 border border-neutral-200 dark:border-neutral-700 shadow-inner">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-8 border-primary-100 dark:border-primary-900 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <p className="text-primary-700 dark:text-primary-300 font-medium text-lg">Traduzindo texto...</p>
          <p className="text-neutral-500 dark:text-neutral-500 text-sm max-w-xs text-center">
            Estamos processando o texto do documento para oferecer a melhor tradução possível
          </p>
          <div className="w-64 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 animate-pulse-gradient rounded-full"></div>
          </div>
        </div>
      ) : translatedText ? (
        <div className="flex-1 flex flex-col">
          {/* Actions bar */}
          <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
            <div className="flex space-x-3">
              <button 
                className={`px-4 py-2.5 rounded-lg text-sm flex items-center shadow-sm transition-all duration-300 ${
                  isCopied 
                    ? 'bg-secondary-600 text-white shadow-secondary-500/20 ring-2 ring-offset-2 ring-secondary-500/10' 
                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md hover:shadow-primary-500/20'
                }`}
                onClick={() => copyToClipboard()}
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
                className={`px-4 py-2.5 rounded-lg text-sm flex items-center shadow-sm transition-all duration-300 ${
                  showOriginal
                    ? 'bg-neutral-700 text-white shadow-neutral-500/20'
                    : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800 hover:shadow-md'
                }`}
                onClick={() => setShowOriginal(prev => !prev)}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 10H20M4 14H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {showOriginal ? 'Ver Tradução' : 'Ver Original'}
              </button>
            </div>
            
            <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg space-x-2">
              <span className="hidden sm:inline">Caracteres:</span> 
              <span className="font-semibold bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 rounded">{originalText.length}</span> 
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> 
              <span className="font-semibold bg-secondary-100 dark:bg-secondary-900/30 px-2 py-0.5 rounded">{translatedText.length}</span>
            </div>
          </div>
          
          {/* Text content */}
          <div 
            ref={contentRef}
            className="flex-1 bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6 overflow-auto min-h-[500px] border border-neutral-200 dark:border-neutral-700 shadow-inner"
            style={{ fontSize: `${fontSize}px` }}
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
          >
            {/* Selection tooltip */}
            {showTooltip && selectedText && (
              <div 
                className="fixed bg-neutral-800 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg z-50 flex space-x-2"
                style={{
                  left: tooltipPosition.x + 'px',
                  top: tooltipPosition.y - 40 + 'px',
                  transform: 'translateX(-50%)'
                }}
              >
                <button 
                  onClick={() => copyToClipboard(selectedText)}
                  className="hover:text-primary-300 transition-colors"
                  title="Copiar seleção"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16 2H8C6.89543 2 6 2.89543 6 4V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V4C18 2.89543 17.1046 2 16 2ZM8 4H16V16H8V4Z" fill="currentColor"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M4 8H2V20C2 21.1046 2.89543 22 4 22H16V20H4V8Z" fill="currentColor"/>
                  </svg>
                </button>
                <button 
                  onClick={() => setShowTooltip(false)}
                  className="hover:text-red-300 transition-colors"
                  title="Fechar"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}

            <div className="text-neutral-900 dark:text-neutral-200 leading-relaxed font-[system-ui] selection:bg-primary-100 dark:selection:bg-primary-900/30 selection:text-primary-800 dark:selection:text-primary-200">
              {showOriginal ? (
                <pre className="font-[system-ui] whitespace-pre-wrap rounded-xl p-4 bg-neutral-100 dark:bg-neutral-800">{originalText}</pre>
              ) : (
                formatText(translatedText)
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-[600px] bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 gap-3">
          <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-neutral-400 dark:text-neutral-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10Z" fill="currentColor"/>
            </svg>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 text-lg font-medium">Nenhuma tradução disponível</p>
          <p className="text-neutral-500 dark:text-neutral-500 text-sm">Selecione um documento para traduzir</p>
          <div className="mt-4 flex gap-3">
            <div className="h-2 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
            <div className="h-2 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
            <div className="h-2 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
          </div>
        </div>
      )}
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes pulse-gradient {
          0%, 100% { width: 10%; }
          50% { width: 90%; }
        }
        .animate-pulse-gradient {
          animation: pulse-gradient 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TranslationPanel;
