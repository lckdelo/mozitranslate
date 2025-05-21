"use client";

import React, { useEffect, useRef, useState } from 'react';

interface PdfViewerProps {
  pageImage: string;
  isLoading: boolean;
  pageNumber: number;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pageImage, isLoading, pageNumber }) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const prevPageRef = useRef<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  
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
  return (
    <div className="flex flex-col items-center" ref={containerRef}>
      <h2 className="text-xl font-bold mb-4 text-sky-700 dark:text-sky-300 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        PDF Original
      </h2>
      <div className="w-full bg-sky-50 dark:bg-slate-900 rounded-lg overflow-hidden border border-sky-100 dark:border-sky-800">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[600px] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-500"></div>
            <p className="text-sky-600 dark:text-sky-400">Carregando página {pageNumber}...</p>
          </div>
        ) : pageImage ? (
          <div className="relative">
            {imgLoading && (
              <div className="absolute inset-0 flex justify-center items-center bg-sky-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-500"></div>
              </div>
            )}
            <img
              src={`data:image/png;base64,${pageImage}`}
              alt={`PDF página ${pageNumber}`}
              className="max-w-full w-full object-contain"
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgLoading(false);
                setImgError(true);
              }}
              style={{ display: imgLoading ? 'none' : 'block' }}
            />
            {imgError && (
              <div className="flex justify-center items-center h-[300px]">
                <div className="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-md border border-red-200 dark:border-red-800">
                  <p className="font-medium">Erro ao carregar a imagem da página</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-[600px]">
            <p className="text-sky-600 dark:text-sky-400">Nenhuma página para exibir</p>
          </div>
        )}
      </div>
      <div className="w-full text-right mt-2 text-xs text-sky-600 dark:text-sky-400">
        Página {pageNumber} • PDF Original
      </div>
    </div>
  );
};

export default PdfViewer;
