"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import PdfViewer from './PdfViewer';
import TranslationPanel from './TranslationPanel';
import usePdfTranslation from '@/hooks/usePdfTranslation';
import usePageNavigation from '@/hooks/usePageNavigation';
import useLanguageSelection from '@/hooks/useLanguageSelection';

interface TranslatedViewProps {
  docId: string;
}

const TranslatedView: React.FC<TranslatedViewProps> = ({ docId }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'original' | 'translated'>('original');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [lastAttemptedPage, setLastAttemptedPage] = useState<number>(1);
  const [showPageJumper, setShowPageJumper] = useState(false);
  const languageSelectorRef = useRef<HTMLDivElement>(null);
  const pageJumperRef = useRef<HTMLDivElement>(null);
  
  // Language selection hook
  const {
    sourceLang,
    targetLang,
    setSourceLang,
    setTargetLang,
    swapLanguages,
    availableLanguages,
    getLanguageName,
    getLanguageFlag
  } = useLanguageSelection({
    initialSourceLang: 'auto',
    initialTargetLang: 'pt',
    onLanguageChange: () => {
      setIsChangingLanguage(true);
      setTimeout(() => setIsChangingLanguage(false), 500); // Reset after a delay
    }
  });
  
  // PDF translation hook with language options
  const {
    pageData,
    isLoading,
    error,
    totalPages,
    navigateToPage,
    isPageCached,
    resetCache
  } = usePdfTranslation(docId, 1, { sourceLang, targetLang });
  
  // Handle errors in PDF processing
  useEffect(() => {
    if (error) {
      setPageLoadError(error);
      console.error("Error loading page:", error);
    } else {
      setPageLoadError(null);
    }
  }, [error]);
  
  // Use our custom navigation hook
  const {
    currentPage,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    isFirstPage,
    isLastPage,
  } = usePageNavigation({
    totalPages,
    initialPage: 1,
    onPageChange: (page) => {
      // This will be called whenever the page changes
      setLastAttemptedPage(page);
      navigateToPage(page);
    }
  });

  // Add retry mechanism for failed page loads
  const retryPageLoad = useCallback(() => {
    if (lastAttemptedPage) {
      setPageLoadError(null);
      navigateToPage(lastAttemptedPage);
    }
  }, [lastAttemptedPage, navigateToPage]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  // Handle clicks outside of dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLanguageSelector && 
          languageSelectorRef.current && 
          !languageSelectorRef.current.contains(event.target as Node)) {
        setShowLanguageSelector(false);
      }
      
      if (showPageJumper && 
          pageJumperRef.current && 
          !pageJumperRef.current.contains(event.target as Node)) {
        setShowPageJumper(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageSelector, showPageJumper]);
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore keyboard events when inside form inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        goToNextPage();
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        goToPreviousPage();
      } else if (event.key === 'Home') {
        goToFirstPage();
      } else if (event.key === 'End') {
        goToLastPage();
      } else if (/^\d$/.test(event.key) && event.ctrlKey) {
        // Ctrl + number for quick navigation (1-9)
        const pageNum = parseInt(event.key) || 1;
        const targetPage = Math.ceil(totalPages * (pageNum / 9));
        setCurrentPage(targetPage);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, totalPages, goToNextPage, goToPreviousPage, goToFirstPage, goToLastPage, setCurrentPage]);

  const handlePageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('page') as HTMLInputElement;
    const pageNum = parseInt(input.value);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setShowPageJumper(false);
    } else {
      input.value = currentPage.toString();
    }
  };

  if (pageLoadError) {
    return (
      <div className="p-8 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center mb-6 text-state-error">
          <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 8C12.5523 8 13 8.44772 13 9V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V9C11 8.44772 11.4477 8 12 8ZM12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15Z" fill="currentColor" />
          </svg>
          <h2 className="text-xl font-semibold">Erro ao carregar a página</h2>
        </div>
        
        <div className="mb-6 p-4 bg-state-errorLight dark:bg-neutral-900 rounded-lg">
          <p className="text-neutral-800 dark:text-neutral-200">{pageLoadError}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={retryPageLoad}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors font-medium shadow-sm flex items-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4V9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 20V15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.5 7.5C15.5333 6.53333 14.3 6 12.8 6C11.3 6 10.0667 6.53333 9.1 7.5C8.13333 8.46667 7.65 9.7 7.65 11.2C7.65 12.7 8.18333 14 9.25 15.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14.3 16.6C13.4333 17.3333 12.4333 17.7 11.3 17.7C9.8 17.7 8.56667 17.1667 7.6 16.1C6.63333 15.0333 6.15 13.8 6.15 12.4C6.15 10.9 6.68333 9.56667 7.75 8.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Tentar novamente
          </button>
          
          <button
            onClick={() => {
              resetCache();
              retryPageLoad();
            }}
            className="px-4 py-2 bg-state-error hover:bg-red-600 text-white rounded-md transition-colors font-medium shadow-sm flex items-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M18 6V18C18 19.1046 17.1046 20 16 20H8C6.89543 20 6 19.1046 6 18V6M10 10V16M14 10V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Limpar cache e tentar novamente
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-md transition-colors font-medium shadow-sm flex items-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V2M12 4C7.58172 4 4 7.58172 4 12M12 4C16.4183 4 20 7.58172 20 12M12 20V22M12 20C7.58172 20 4 16.4183 4 12M12 20C16.4183 20 20 16.4183 20 12M2 12H4M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Recarregar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Tabs */}
      {isMobile && (
        <div className="mb-6 bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-md">
          <div className="flex">
            <button
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'original'
                  ? 'bg-primary-500 text-white font-medium'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              onClick={() => setActiveTab('original')}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 18H17V16H7V18Z" fill="currentColor" />
                  <path d="M17 14H7V12H17V14Z" fill="currentColor" />
                  <path d="M7 10H11V8H7V10Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4Z" fill="currentColor" />
                </svg>
                PDF Original
              </div>
            </button>
            <button
              className={`flex-1 px-4 py-3 text-center transition-colors ${
                activeTab === 'translated' 
                  ? 'bg-primary-500 text-white font-medium'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              onClick={() => setActiveTab('translated')}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10Z" fill="currentColor"/>
                </svg>
                Texto Traduzido
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Controls Bar - Language Selection and Navigation */}
      <div className="mb-6">
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Language Selector */}
            <div className="relative" ref={languageSelectorRef}>
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10Z" fill="currentColor"/>
                </svg>
                <span className="font-medium flex items-center gap-1.5">
                  <span>{getLanguageFlag(targetLang)}</span>
                  <span>{getLanguageName(targetLang)}</span>
                </span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${showLanguageSelector ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Language Selection Dropdown */}
              {showLanguageSelector && (
                <div className="absolute mt-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-72 overflow-y-auto w-64 z-50">
                  <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Selecionar idioma</h3>
                  </div>
                  <div className="py-2">
                    {availableLanguages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          if (lang.code !== targetLang) {
                            setTargetLang(lang.code);
                            resetCache();
                            navigateToPage(currentPage);
                          }
                          setShowLanguageSelector(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                          targetLang === lang.code ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className={`${targetLang === lang.code ? 'font-medium text-primary-700 dark:text-primary-300' : 'text-neutral-700 dark:text-neutral-300'}`}>
                          {lang.name}
                        </span>
                        {targetLang === lang.code && (
                          <svg className="w-5 h-5 ml-auto text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Page Navigation */}
            <div className="flex items-center">
              <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <button
                  onClick={goToFirstPage}
                  disabled={isFirstPage || isLoading}
                  title="Primeira página"
                  aria-label="Primeira página"
                  className="p-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 17L13 12L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11 17L6 12L11 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <button
                  onClick={goToPreviousPage}
                  disabled={isFirstPage || isLoading}
                  title="Página anterior"
                  aria-label="Página anterior"
                  className="p-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {/* Page indicator and jumper */}
                <div className="relative mx-1" ref={pageJumperRef}>
                  <button 
                    onClick={() => setShowPageJumper(!showPageJumper)}
                    className="px-4 py-2 bg-white dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700 flex items-center min-w-[100px] justify-center"
                  >
                    <span className="font-medium text-primary-700 dark:text-primary-300">{currentPage}</span>
                    <span className="text-neutral-500 dark:text-neutral-500 mx-1">/</span>
                    <span className="text-neutral-700 dark:text-neutral-400">{totalPages || '?'}</span>
                  </button>
                  
                  {showPageJumper && (
                    <div className="absolute top-full mt-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-3 w-52 z-50">
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-2">Ir para a página:</p>
                      <form onSubmit={handlePageSubmit} className="flex space-x-2">
                        <input
                          type="number"
                          name="page"
                          min={1}
                          max={totalPages || 1}
                          defaultValue={currentPage}
                          className="w-full px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                        >
                          Ir
                        </button>
                      </form>
                      <div className="grid grid-cols-5 gap-1 mt-2">
                        {[...Array(Math.min(10, totalPages))].map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => {
                                setCurrentPage(pageNum);
                                setShowPageJumper(false);
                              }}
                              className={`p-2 rounded text-sm ${
                                pageNum === currentPage
                                  ? 'bg-primary-600 text-white'
                                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      {totalPages > 10 && (
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                          <button
                            onClick={() => {
                              setCurrentPage(Math.round(totalPages * 0.25));
                              setShowPageJumper(false);
                            }}
                            className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded text-neutral-800 dark:text-neutral-300"
                          >
                            25%
                          </button>
                          <button
                            onClick={() => {
                              setCurrentPage(Math.round(totalPages * 0.5));
                              setShowPageJumper(false);
                            }}
                            className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded text-neutral-800 dark:text-neutral-300"
                          >
                            50%
                          </button>
                          <button
                            onClick={() => {
                              setCurrentPage(Math.round(totalPages * 0.75));
                              setShowPageJumper(false);
                            }}
                            className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded text-neutral-800 dark:text-neutral-300"
                          >
                            75%
                          </button>
                          <button
                            onClick={() => {
                              setCurrentPage(totalPages);
                              setShowPageJumper(false);
                            }}
                            className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded text-neutral-800 dark:text-neutral-300"
                          >
                            100%
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={isLastPage || isLoading}
                  title="Próxima página"
                  aria-label="Próxima página"
                  className="p-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <button
                  onClick={goToLastPage}
                  disabled={isLastPage || isLoading}
                  title="Última página"
                  aria-label="Última página"
                  className="p-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 17L18 12L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 17L11 12L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Keyboard shortcuts hint */}
          <div className="mt-2 flex justify-center">
            <div className="text-xs text-neutral-500 dark:text-neutral-500 flex items-center space-x-4">
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-800 dark:text-neutral-300 mr-1">←</kbd>
                <span>Página anterior</span>
              </span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-800 dark:text-neutral-300 mr-1">→</kbd>
                <span>Próxima página</span>
              </span>
              <span className="hidden md:flex items-center">
                <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-800 dark:text-neutral-300 mr-1">Home</kbd>
                <span>Primeira página</span>
              </span>
              <span className="hidden md:flex items-center">
                <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-800 dark:text-neutral-300 mr-1">End</kbd>
                <span>Última página</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
        {/* PDF Viewer */}
        {(!isMobile || activeTab === 'original') && (
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 transition-all duration-300">
            <PdfViewer 
              pageImage={pageData?.page_image || ''} 
              isLoading={isLoading}
              pageNumber={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}

        {/* Translation Panel */}
        {(!isMobile || activeTab === 'translated') && (
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 transition-all duration-300">          
            <TranslationPanel
              originalText={pageData?.original_text || ''}
              translatedText={pageData?.translated_text || ''}
              isLoading={isLoading}
              targetLang={targetLang}
              targetLangName={getLanguageName(targetLang)}
              targetLangFlag={getLanguageFlag(targetLang)}
            />
          </div>
        )}
      </div>
      
      {/* Document progress indicator */}
      {totalPages > 0 && (
        <div className="mt-4 bg-white dark:bg-neutral-800 rounded-lg p-2 shadow-sm border border-neutral-200 dark:border-neutral-700">
          <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 transition-all duration-300 rounded-full"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center px-1 mt-1 text-xs text-neutral-500 dark:text-neutral-500">
            <span>Início</span>
            <span>{Math.round((currentPage / totalPages) * 100)}% concluído</span>
            <span>Fim</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslatedView;
