"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';

// Define types for the gesture handlers
interface DragState {
  movement: [number, number];
  first: boolean;
  last: boolean;
}

interface WheelState {
  delta: [number, number];
}

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
  // Enhanced state variables for improved UX
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  
  const prevPageRef = useRef<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset image loading state when page changes
  useEffect(() => {
    if (prevPageRef.current !== pageImage) {
      setImgLoading(true);
      setImgError(false);
      prevPageRef.current = pageImage;
      setPan({ x: 0, y: 0 });
    }
  }, [pageImage]);

  // Scroll to top when changing pages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    setPan({ x: 0, y: 0 });
    setShowControlsOverlay(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControlsOverlay(false);
    }, 2000);
    
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [pageNumber]);

  // Clean up effect
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // Enhanced zoom controls with smoother steps
  const handleZoomIn = () => {
    setZoomLevel(prev => {
      const newZoom = prev + (prev >= 2 ? 0.5 : 0.25);
      return Math.min(newZoom, 5);
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = prev - (prev > 2 ? 0.5 : 0.25);
      return Math.max(newZoom, 0.5);
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setRotationDegree(0);
  };

  const handleRotate = () => {
    setRotationDegree((prev) => (prev + 90) % 360);
  };

  // Keyboard handlers for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '+') handleZoomIn();
    if (e.key === '-') handleZoomOut();
    if (e.key === '0') handleResetZoom();
    if (e.key === 'r') handleRotate();
  }, []);
  // Use gesture hook for pan and zoom
  const bind = useGesture({
    onDrag: ({ movement: [mx, my], first, last }: DragState) => {
      if (zoomLevel <= 1) return;
      if (first) setIsDragging(true);
      if (last) setIsDragging(false);
      setPan(current => ({ x: current.x + mx, y: current.y + my }));
    },
    onWheel: ({ delta: [, dy] }: WheelState) => {
      if (dy > 0) {
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
      } else {
        setZoomLevel(prev => Math.min(prev + 0.1, 5));
      }
    }
  }, {
    drag: {
      enabled: zoomLevel > 1
    }
  });

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
  
  // Toggle full screen mode
  const toggleFullScreen = () => {
    setShowFullScreenImage(!showFullScreenImage);
  };

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header with document title and enhanced controls */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700 mb-4">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 flex items-center group">
          <svg className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400 group-hover:animate-pulse transition-all duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18H17V16H7V18Z" fill="currentColor" />
            <path d="M17 14H7V12H17V14Z" fill="currentColor" />
            <path d="M7 10H11V8H7V10Z" fill="currentColor" />
            <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
          </svg>
          <span className="relative">
            Documento Original
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-500/80 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </span>
        </h2>
        
        {/* Enhanced zoom and view controls */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            className="p-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 disabled:opacity-40 transition-colors transform hover:scale-105 active:scale-95 shadow-sm"
            title="Diminuir zoom (tecla -)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          
          <button 
            onClick={handleResetZoom}
            className="px-2.5 py-1 rounded-md text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition-colors font-medium shadow-sm transform hover:scale-105 active:scale-95"
            title="Redefinir zoom (tecla 0)"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          
          <button 
            onClick={handleZoomIn}
            disabled={zoomLevel >= 5}
            className="p-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 disabled:opacity-40 transition-colors transform hover:scale-105 active:scale-95 shadow-sm"
            title="Aumentar zoom (tecla +)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          
          <button 
            onClick={handleRotate}
            className="p-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition-colors transform hover:scale-105 active:scale-95 shadow-sm"
            title="Girar PDF (tecla r)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12C4 15.866 7.13401 19 11 19C14.866 19 18 15.866 18 12C18 8.13401 14.866 5 11 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9L11 5L7 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button 
            onClick={toggleFullScreen}
            className="p-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition-colors transform hover:scale-105 active:scale-95 shadow-sm"
            title="Expandir/Minimizar"
          >
            {!showFullScreenImage ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 14H10V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 10H14V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 10L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 14H10V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 10H14V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 4L21 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div 
        ref={containerRef}
        className={`
          relative flex-1 overflow-hidden bg-neutral-50 dark:bg-neutral-900 rounded-lg 
          border border-neutral-200 dark:border-neutral-700 shadow-md 
          transition-all duration-300 ease-out
          ${showFullScreenImage ? 'fixed inset-4 z-50' : ''}
          ${isDragging ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : ''}
        `}
        {...(zoomLevel > 1 ? bind() : {})}
      >
        {/* Overlay controls for page navigation */}
        <div className={`
          absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex justify-between items-center
          transition-opacity duration-300 
          ${showControlsOverlay || showFullScreenImage ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <div className="flex space-x-2">
            {showFullScreenImage && (
              <button
                onClick={toggleFullScreen}
                className="p-2 bg-white/90 dark:bg-neutral-800/90 rounded-full text-neutral-800 dark:text-white shadow-lg hover:bg-white dark:hover:bg-neutral-700 transition-all transform hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="bg-white/90 dark:bg-neutral-800/90 px-4 py-2 rounded-full shadow-lg">
            <span className="font-medium text-neutral-800 dark:text-white">{pageNumber} / {totalPages}</span>
          </div>
        </div>

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
          <div className="relative h-full" ref={viewportRef}>
            {imgLoading && (
              <div className="absolute inset-0 flex justify-center items-center bg-neutral-50 dark:bg-neutral-900 z-10">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
                </div>
              </div>
            )}
            <div className="flex justify-center min-h-[600px] p-4 overflow-auto h-full">
              <img
                ref={imgRef}
                src={`data:image/png;base64,${pageImage}`}
                alt={`PDF página ${pageNumber}`}
                className="max-w-full object-contain transition-all duration-300 ease-out"
                style={{ 
                  transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px) rotate(${rotationDegree}deg)`,
                  transformOrigin: 'center center',
                  display: imgLoading ? 'none' : 'block',
                  willChange: 'transform',
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  userSelect: 'none',
                }}
                onLoad={() => setImgLoading(false)}
                onError={() => {
                  console.error(`Error loading image for page ${pageNumber}`);
                  setImgLoading(false);
                  setImgError(true);
                }}
                draggable="false"
              />
            </div>
            {imgError && (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="max-w-md p-6 bg-state-errorLight dark:bg-neutral-800 rounded-lg shadow-md border border-state-error/20 dark:border-state-error/30 animate-fade-in">
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
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors font-medium shadow-sm transform hover:scale-105 active:scale-95"
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
            
            {/* Zoom level indicator - shows only briefly when zooming */}
            <div className={`
              absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full
              text-sm font-medium transition-opacity duration-300 pointer-events-none
              ${showControlsOverlay ? 'opacity-100' : 'opacity-0'}
            `}>
              {Math.round(zoomLevel * 100)}%
            </div>
            
            {/* Hint overlay when zoomed */}
            {zoomLevel > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm pointer-events-none opacity-70">
                {isDragging ? 'Movendo o documento...' : 'Clique e arraste para mover'}
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
      
      {/* Footer with enhanced page info */}
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded font-medium inline-flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M7 18H17V16H7V18Z" fill="currentColor" />
              <path d="M17 14H7V12H17V14Z" fill="currentColor" />
              <path d="M7 10H11V8H7V10Z" fill="currentColor" />
              <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4Z" fill="currentColor" />
            </svg>
            PDF Original
          </span>
        </div>
        
        <div className="text-sm text-right text-neutral-600 dark:text-neutral-400">
          <span className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-md font-medium inline-flex items-center gap-1">
            <span className="text-xs text-neutral-500 dark:text-neutral-500">Página</span>
            <span className="text-primary-600 dark:text-primary-400 font-semibold">{pageNumber}</span>
            <span className="text-neutral-400 dark:text-neutral-600">de</span>
            <span className="font-medium">{totalPages}</span>
            
            {/* Visual page indicators */}
            <span className="ml-1.5 flex items-center gap-0.5">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                // Show indicators for first, last, current, and nearby pages
                const isVisible = i === 0 || i === Math.min(4, totalPages-1) || 
                  Math.abs(i - (pageNumber-1) % Math.min(5, totalPages)) <= 1;
                
                return (
                  <span 
                    key={i} 
                    className={`
                      w-1.5 h-1.5 rounded-full transition-all duration-300 
                      ${i === ((pageNumber-1) % Math.min(5, totalPages)) 
                        ? 'bg-primary-500 scale-125' 
                        : isVisible 
                          ? 'bg-neutral-400 dark:bg-neutral-600' 
                          : 'bg-neutral-300 dark:bg-neutral-700 scale-75 opacity-50'
                      }
                    `}
                  ></span>
                );
              })}
            </span>
          </span>
        </div>
      </div>
      
      {/* Keyboard shortcut hints */}
      <div className="mt-3 text-xs text-center text-neutral-500 dark:text-neutral-500">
        <div className="flex justify-center gap-3 flex-wrap">
          <span className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-800 dark:text-neutral-300 mr-1">+</kbd>
            <span>Zoom in</span>
          </span>
          <span className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-800 dark:text-neutral-300 mr-1">-</kbd>
            <span>Zoom out</span>
          </span>
          <span className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-800 dark:text-neutral-300 mr-1">r</kbd>
            <span>Girar</span>
          </span>
          <span className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-800 dark:text-neutral-300 mr-1">0</kbd>
            <span>Restaurar</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
