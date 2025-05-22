"use client";

import React, { useEffect, useRef, useState } from 'react';

interface PdfViewerProps {
  pageImage: string;
  isLoading: boolean;
  pageNumber: number;
  totalPages: number;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ 
  pageImage, 
  isLoading, 
  pageNumber, 
  totalPages 
}) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const prevPageRef = useRef<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Reset image loading state when page changes
  useEffect(() => {
    if (prevPageRef.current !== pageImage) {
      setImgLoading(true);
      setImgError(false);
      prevPageRef.current = pageImage;
    }
  }, [pageImage]);

  // Scroll to top when changing pages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [pageNumber]);

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Safety check to retry loading the image if it fails
  useEffect(() => {
    if (imgError && pageImage && imgRef.current) {
      const timer = setTimeout(() => {
        if (imgRef.current) {
          setImgError(false);
          setImgLoading(true);
          // Force a reload by updating the src
          imgRef.current.src = `data:image/png;base64,${pageImage}?reload=${Date.now()}`;
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [imgError, pageImage]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with document title and navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700 mb-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 flex items-center">
          <svg className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18H17V16H7V18Z" fill="currentColor" />
            <path d="M17 14H7V12H17V14Z" fill="currentColor" />
            <path d="M7 10H11V8H7V10Z" fill="currentColor" />
            <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
          </svg>
          Documento Original
        </h2>
        
        {/* Zoom controls */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            className="p-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 disabled:opacity-40 transition-colors"
            title="Diminuir zoom"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          
          <button 
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-md text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition-colors"
            title="Redefinir zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          
          <button 
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="p-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 disabled:opacity-40 transition-colors"
            title="Aumentar zoom"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div 
        ref={containerRef}
        className="relative flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-md"
      >
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[600px] gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
            </div>
            <p className="text-primary-700 dark:text-primary-300 font-medium animate-pulse">
              Carregando página {pageNumber} de {totalPages}...
            </p>
          </div>
        ) : pageImage ? (
          <div className="relative" ref={viewportRef}>
            {imgLoading && (
              <div className="absolute inset-0 flex justify-center items-center bg-neutral-50 dark:bg-neutral-900 z-10">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
                </div>
              </div>
            )}
            <div className="flex justify-center min-h-[600px] p-4">
              <img
                ref={imgRef}
                src={`data:image/png;base64,${pageImage}`}
                alt={`PDF página ${pageNumber}`}
                className="max-w-full object-contain transition-transform duration-300 ease-out"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  display: imgLoading ? 'none' : 'block'
                }}
                onLoad={() => setImgLoading(false)}
                onError={() => {
                  console.error(`Error loading image for page ${pageNumber}`);
                  setImgLoading(false);
                  setImgError(true);
                }}
              />
            </div>
            {imgError && (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="max-w-md p-6 bg-state-errorLight dark:bg-neutral-800 rounded-lg shadow-md border border-state-error/20 dark:border-state-error/30">
                  <div className="flex items-center mb-4 text-state-error">
                    <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 8C12.5523 8 13 8.44772 13 9V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V9C11 8.44772 11.4477 8 12 8ZM12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15Z" fill="currentColor" />
                    </svg>
                    <h3 className="text-lg font-semibold">Erro ao carregar a página</h3>
                  </div>
                  <p className="mb-4 text-neutral-700 dark:text-neutral-300">
                    Não foi possível carregar a imagem desta página do PDF. Isso pode ocorrer devido a problemas na conversão do arquivo.
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors font-medium shadow-sm"
                      onClick={() => {
                        setImgError(false);
                        setImgLoading(true);
                        if (imgRef.current) {
                          imgRef.current.src = `data:image/png;base64,${pageImage}?reload=${Date.now()}`;
                        }
                      }}
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-[600px] gap-2">
            <svg className="w-16 h-16 text-neutral-400 dark:text-neutral-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
              <path d="M7 18H17V16H7V18Z" fill="currentColor" />
              <path d="M17 14H7V12H17V14Z" fill="currentColor" />
              <path d="M7 10H11V8H7V10Z" fill="currentColor" />
            </svg>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Nenhuma página para exibir</p>
            <p className="text-neutral-500 dark:text-neutral-500 text-sm">Selecione um documento PDF para traduzir</p>
          </div>
        )}
      </div>
      
      {/* Footer with page info */}
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded font-medium">
            PDF Original
          </span>
        </div>
        
        <div className="text-sm text-right text-neutral-600 dark:text-neutral-400">
          <span className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-md font-medium">
            Página <span className="text-primary-600 dark:text-primary-400 font-semibold">{pageNumber}</span> de {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
