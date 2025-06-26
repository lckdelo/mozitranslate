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
    // Handle font size adjustments with enhanced scaling
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 10));
  const resetFontSize = () => setFontSize(16);
    // Enhanced text formatting with better typography and styling
  const formatText = (text: string) => {
    if (!text) return null;
    
    // Split by paragraph and preserve line breaks
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
        // Enhanced heading detection with improved typography
      if (trimmedParagraph.startsWith('#')) {
        const level = (trimmedParagraph.match(/^#+/) || [''])[0].length;
        const title = trimmedParagraph.replace(/^#+\s*/, '');
        
        // Different styles for different heading levels with enhanced visual hierarchy
        if (level === 1) {
          return (
            <h1 key={index} className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 pb-4 border-b-2 border-gradient-to-r from-primary-300 to-secondary-300 dark:from-primary-600 dark:to-secondary-600 leading-tight tracking-tight">
              {title}
            </h1>
          );
        } else if (level === 2) {
          return (
            <h2 key={index} className="text-3xl font-extrabold mb-6 text-neutral-900 dark:text-neutral-100 pb-3 border-b-2 border-primary-200 dark:border-primary-700 leading-tight tracking-tight">
              {title}
            </h2>
          );
        } else if (level === 3) {
          return (
            <h3 key={index} className="text-2xl font-bold mb-5 text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-300 dark:border-neutral-600 leading-tight">
              {title}
            </h3>
          );
        } else {
          return (
            <h4 key={index} className="text-xl font-bold mb-4 text-primary-800 dark:text-primary-200 pb-1 leading-tight">
              {title}
            </h4>
          );
        }
      }
      
        // Detect uppercase titles (likely headings) with enhanced styling
      else if (trimmedParagraph === trimmedParagraph.toUpperCase() && 
               trimmedParagraph.length < 80 && 
               trimmedParagraph.length > 3 &&
               !trimmedParagraph.includes('.') &&
               !trimmedParagraph.match(/^\d/)) {
        return (
          <h2 key={index} className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-secondary-700 dark:from-primary-300 dark:to-secondary-300 pb-3 border-b-2 border-primary-200 dark:border-primary-700 uppercase tracking-wider leading-tight shadow-sm">
            {trimmedParagraph}
          </h2>
        );
      }
      
      // Detect sentence case titles with improved prominence
      else if (trimmedParagraph.length < 100 && 
               trimmedParagraph.split(' ').every(word => 
                 word.length === 0 || 
                 word[0] === word[0].toUpperCase() || 
                 ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos', 'a', 'o', 'as', 'os', 'para', 'por', 'com'].includes(word.toLowerCase())
               ) &&
               !trimmedParagraph.endsWith('.') &&
               !trimmedParagraph.endsWith(':') &&
               !trimmedParagraph.match(/^\d/)) {
        return (
          <h3 key={index} className="text-2xl font-bold mb-5 text-neutral-800 dark:text-neutral-200 pb-2 border-b border-neutral-200 dark:border-neutral-700 leading-tight tracking-wide">
            {trimmedParagraph}
          </h3>
        );
      }
      
      // Enhanced list detection and formatting
      else if (trimmedParagraph.match(/^(\d+\.|\*|\-|•)\s/)) {
        return (
          <div key={index} className="ml-4 my-4 space-y-2">
            {paragraph.split('\n').map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;
              
              const match = trimmedLine.match(/^(\d+\.|\*|\-|•)\s*(.+)/);
              if (match) {
                const [, bullet, content] = match;
                return (
                  <div key={`${index}-${lineIndex}`} className="flex items-start mb-2 group hover:bg-primary-50/50 dark:hover:bg-primary-900/20 rounded-lg p-2 transition-all duration-200">
                    <div className="w-8 flex-shrink-0 text-primary-600 dark:text-primary-400 font-bold text-lg">
                      {bullet.includes('.') ? bullet : '•'}
                    </div>
                    <div className="flex-1 text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {content}
                    </div>
                  </div>
                );
              }
              return (
                <div key={`${index}-${lineIndex}`} className="ml-8 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {trimmedLine}
                </div>
              );
            })}
          </div>
        );
      }
      
      // Enhanced quote formatting
      else if (trimmedParagraph.startsWith('>')) {
        return (
          <blockquote key={index} className="border-l-4 border-primary-400 dark:border-primary-600 bg-primary-50/30 dark:bg-primary-900/20 pl-6 pr-4 py-4 my-6 italic text-neutral-700 dark:text-neutral-300 rounded-r-lg shadow-sm">
            <div className="text-lg leading-relaxed">
              {trimmedParagraph.replace(/^>\s*/, '')}
            </div>
          </blockquote>
        );
      }
      
      // Enhanced definition formatting
      else if (trimmedParagraph.includes(':') && 
               trimmedParagraph.split(':')[0].trim().length < 50 &&
               trimmedParagraph.split(':')[0].trim().length > 2) {
        const colonIndex = trimmedParagraph.indexOf(':');
        const term = trimmedParagraph.substring(0, colonIndex).trim();
        const definition = trimmedParagraph.substring(colonIndex + 1).trim();
        
        return (
          <div key={index} className="mb-6 last:mb-0 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <dt className="font-bold text-lg text-primary-700 dark:text-primary-300 mb-2">
              {term}
            </dt>
            <dd className="text-neutral-800 dark:text-neutral-200 leading-relaxed pl-2 border-l-2 border-primary-200 dark:border-primary-700">
              {definition}
            </dd>
          </div>
        );
      }
        // Enhanced paragraph formatting with smart heading detection
      else {
        return (
          <div key={index} className="mb-6 last:mb-0">
            <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed hover:bg-primary-50/20 dark:hover:bg-primary-900/10 rounded-lg p-3 transition-all duration-200 border border-transparent hover:border-primary-200 dark:hover:border-primary-800">
              {paragraph.split('\n').map((line, lineIndex, array) => {
                const trimmedLine = line.trim();
                
                // Check if line looks like a sub-heading within paragraph (enhanced detection)
                if (trimmedLine.length < 80 && 
                    (trimmedLine.endsWith(':') || trimmedLine.endsWith('?') || trimmedLine.endsWith('!')) &&
                    !trimmedLine.match(/^\d/) &&
                    lineIndex === 0 &&
                    !trimmedLine.includes(',')) {
                  return (
                    <React.Fragment key={`${index}-${lineIndex}`}>
                      <span className="font-extrabold text-xl text-neutral-900 dark:text-neutral-100 block mb-3 pb-1 border-b border-primary-200 dark:border-primary-700">
                        {trimmedLine.slice(0, -1)}
                      </span>
                    </React.Fragment>
                  );
                }
                  // Detect numbered sections (1., 2., etc.)
                else if (trimmedLine.match(/^\d+\.\s+[A-Z]/) && lineIndex === 0) {
                  return (
                    <React.Fragment key={`${index}-${lineIndex}`}>
                      <span className="font-bold text-lg text-primary-800 dark:text-primary-200 block mb-2">
                        {trimmedLine}
                      </span>
                    </React.Fragment>
                  );
                }
                
                // Detect important notes (NOTA:, IMPORTANTE:, ATENÇÃO:, etc.)
                else if (trimmedLine.match(/^(NOTA|IMPORTANTE|ATENÇÃO|OBSERVAÇÃO|AVISO|CUIDADO):/i)) {
                  return (
                    <React.Fragment key={`${index}-${lineIndex}`}>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 pl-4 py-3 mb-4 rounded-r-lg">
                        <span className="font-bold text-amber-800 dark:text-amber-200 text-lg block">
                          {trimmedLine}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                }
                
                // Detect lines that are all bold (potential titles)
                else if (trimmedLine.length < 70 && 
                         trimmedLine.length > 10 &&
                         !trimmedLine.includes('.') &&
                         !trimmedLine.includes(',') &&
                         lineIndex === 0 &&
                         array.length > 1) {
                  return (
                    <React.Fragment key={`${index}-${lineIndex}`}>
                      <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100 block mb-3">
                        {trimmedLine}
                      </span>
                    </React.Fragment>
                  );
                }
                
                return (
                  <React.Fragment key={`${index}-${lineIndex}`}>
                    {line}
                    {lineIndex < array.length - 1 && <br />}
                  </React.Fragment>
                );
              })}
            </p>
          </div>
        );
      }
    }).filter(Boolean); // Remove null entries
  };
  
  return (
    <div className="flex flex-col h-full">      {/* Header with enhanced title and controls */}
      <div className="flex items-center justify-between pb-5 border-b-2 border-gradient-to-r from-primary-200 to-secondary-200 dark:from-primary-700 dark:to-secondary-700 mb-6">
        <div className="flex items-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/50 dark:to-secondary-900/50 mr-4 shadow-lg ring-1 ring-primary-200 dark:ring-primary-800">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-1">
              Texto Traduzido
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Tradução automática com IA
            </p>
          </div>
          <div className="ml-4 flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 text-primary-800 dark:text-primary-200 text-sm border border-primary-200 dark:border-primary-800/50 shadow-md">
            <span className="mr-2 text-xl">{targetLangFlag}</span>
            <span className="font-semibold">{targetLangName}</span>
            <div className="ml-2 w-2 h-2 rounded-full bg-secondary-500 animate-pulse"></div>
          </div>
        </div>        
        {/* Enhanced text size controls */}
        <div className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 shadow-inner">          <button 
            onClick={decreaseFontSize}
            disabled={fontSize <= 10}
            className="p-2 rounded-lg bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 disabled:opacity-40 transition-all duration-200 shadow-sm hover:scale-105 active:scale-95"
            title="Diminuir fonte"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 8V20M14 8H10M14 8H18M10 20H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button 
            onClick={resetFontSize}
            className="px-3 py-2 rounded-lg text-sm bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition-all duration-200 font-medium shadow-sm hover:scale-105 active:scale-95 min-w-[50px]"
            title="Tamanho padrão da fonte"
          >
            {fontSize}px
          </button>
          
          <button 
            onClick={increaseFontSize}
            disabled={fontSize >= 28}
            className="p-2 rounded-lg bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 disabled:opacity-40 transition-all duration-200 shadow-sm hover:scale-105 active:scale-95"
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
          </div>          {/* Enhanced text content with better typography */}
          <div 
            ref={contentRef}
            className="flex-1 bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900 dark:to-neutral-800/50 rounded-2xl p-6 overflow-auto min-h-0 border border-neutral-200 dark:border-neutral-700 shadow-inner backdrop-blur-sm"            style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: fontSize <= 12 ? '1.7' : fontSize <= 16 ? '1.6' : fontSize <= 20 ? '1.5' : fontSize <= 24 ? '1.4' : '1.3'
            }}
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
      ) : (        <div className="flex flex-col justify-center items-center h-[600px] bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900 dark:to-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700 gap-4 backdrop-blur-sm">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center shadow-lg ring-1 ring-neutral-300 dark:ring-neutral-600">
            <svg className="w-12 h-12 text-neutral-400 dark:text-neutral-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="text-center max-w-sm">
            <p className="text-neutral-700 dark:text-neutral-300 text-xl font-semibold mb-2">Nenhuma tradução disponível</p>
            <p className="text-neutral-500 dark:text-neutral-500 text-sm leading-relaxed">Selecione um documento PDF para visualizar a tradução automática do texto</p>
          </div>
          <div className="flex gap-3 mt-2">
            <div className="h-2 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
            <div className="h-2 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="h-2 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
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
