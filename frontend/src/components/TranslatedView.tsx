"use client";

import { useState, useEffect, useCallback } from 'react';
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
    // Track language changes
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  
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
      navigateToPage(page);
    }
  });

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

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 rounded-md text-red-800 dark:text-red-200">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-4">      {/* Mobile Tabs */}
      {isMobile && (
        <div className="flex mb-6 bg-sky-100 dark:bg-sky-900 rounded-lg overflow-hidden shadow-soft-blue">
          <button
            className={`flex-1 px-4 py-3 text-center transition-colors ${
              activeTab === 'original'
                ? 'bg-sky-500 text-white font-medium'
                : 'text-sky-800 dark:text-sky-200 hover:bg-sky-200 dark:hover:bg-sky-800'
            }`}
            onClick={() => setActiveTab('original')}
          >
            PDF Original
          </button>
          <button
            className={`flex-1 px-4 py-3 text-center transition-colors ${
              activeTab === 'translated' 
                ? 'bg-sky-500 text-white font-medium'
                : 'text-sky-800 dark:text-sky-200 hover:bg-sky-200 dark:hover:bg-sky-800'
            }`}
            onClick={() => setActiveTab('translated')}
          >
            Texto Traduzido
          </button>
        </div>
      )}      {/* Controls Bar - Language Selection and Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3 bg-sky-100 dark:bg-sky-900 p-3 rounded-lg shadow-soft-blue">
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-800 rounded-md shadow-sm hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors text-sky-700 dark:text-sky-300"
          >
            <span>{getLanguageFlag(targetLang)}</span>
            <span className="font-medium">{getLanguageName(targetLang)}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
            {/* Language Selection Dropdown */}
          {showLanguageSelector && (
            <div className="absolute mt-1 bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 border border-sky-100 dark:border-sky-800 max-h-60 overflow-y-auto" style={{ top: "100%", left: "0" }}>
              {availableLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    if (lang.code !== targetLang) {
                      setTargetLang(lang.code);
                      resetCache(); // Reset cache when language changes
                      navigateToPage(currentPage); // Force reload the current page
                    }
                    setShowLanguageSelector(false);
                  }}
                  className={`flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-sky-50 dark:hover:bg-sky-900 ${
                    targetLang === lang.code ? 'bg-sky-100 dark:bg-sky-800 font-medium' : ''
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToFirstPage}
            disabled={isFirstPage || isLoading}
            title="Primeira página"
            aria-label="Primeira página"
            className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md disabled:opacity-40 disabled:bg-sky-300 transition-colors duration-200"
          >
            ⟪
          </button>
          <button
            onClick={goToPreviousPage}
            disabled={isFirstPage || isLoading}
            title="Página anterior"
            aria-label="Página anterior"
            className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md disabled:opacity-40 disabled:bg-sky-300 transition-colors duration-200"
          >
            ◀
          </button>
          
          <div className="flex items-center gap-2 px-4 bg-white dark:bg-slate-800 rounded-md shadow-sm">
            <span className="hidden md:inline text-sky-700 dark:text-sky-300 font-medium">Página</span>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem('page') as HTMLInputElement;
                const pageNum = parseInt(input.value);
                if (pageNum >= 1 && pageNum <= totalPages) {
                  setCurrentPage(pageNum);
                } else {
                  input.value = currentPage.toString();
                }
              }}
              className="inline-flex items-center"
            >
              <input
                type="number"
                name="page"
                min={1}
                max={totalPages || 1}
                defaultValue={currentPage}
                className="w-14 text-center bg-white dark:bg-slate-700 border border-sky-300 dark:border-sky-600 rounded px-1 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </form>
            <span className="text-sky-700 dark:text-sky-300">de {totalPages || '?'}</span>
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={isLastPage || isLoading}
            title="Próxima página"
            aria-label="Próxima página"
            className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md disabled:opacity-40 disabled:bg-sky-300 transition-colors duration-200"
          >
            ▶
          </button>
          <button
            onClick={goToLastPage}
            disabled={isLastPage || isLoading}
            title="Última página"
            aria-label="Última página"
            className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md disabled:opacity-40 disabled:bg-sky-300 transition-colors duration-200"
          >
            ⟫
          </button>
        </div>
      </div>{/* Content */}
      <div className={`${isMobile ? '' : 'split-view'} gap-6`}>
        {/* PDF Viewer */}
        {(!isMobile || activeTab === 'original') && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-sky-100 dark:border-sky-900 overflow-hidden transition-all duration-300">
            <PdfViewer 
              pageImage={pageData?.page_image || ''} 
              isLoading={isLoading}
              pageNumber={currentPage}
            />
          </div>
        )}

        {/* Translation Panel */}
        {(!isMobile || activeTab === 'translated') && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-sky-100 dark:border-sky-900 mt-6 md:mt-0 transition-all duration-300">          <TranslationPanel
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
    </div>
  );
};

export default TranslatedView;
