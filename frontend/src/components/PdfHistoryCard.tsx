"use client";

import React from 'react';
import { PdfHistoryItem } from '@/utils/api';
import { 
  formatDateRelative, 
  getProgressColor, 
  getProgressTextColor,
  truncateFilename,
  formatReadingTime
} from '@/hooks/usePdfHistoryUtils';

interface PdfHistoryCardProps {
  item: PdfHistoryItem;
  onSelect: (pdfId: string, lastPage?: number) => void;
  onRemove: (pdfId: string) => void;
}

const PdfHistoryCard: React.FC<PdfHistoryCardProps> = ({ item, onSelect, onRemove }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays - 1} dias atrás`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'from-red-400 to-red-500';
    if (progress < 50) return 'from-amber-400 to-amber-500';
    if (progress < 75) return 'from-blue-400 to-blue-500';
    return 'from-emerald-400 to-emerald-500';
  };
  return (
    <div className="group relative bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transform hover:-translate-y-1 hover:scale-[1.02]">
      {/* Remove Button */}      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.pdf_id);
        }}
        className="absolute top-3 right-3 z-10 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs shadow-lg hover:scale-110"
        title="Remover do histórico"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Card Content */}      <div 
        className="p-5 cursor-pointer h-full flex flex-col relative overflow-hidden"
        onClick={() => onSelect(item.pdf_id, item.last_page)}
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-primary-50/0 to-secondary-50/0 dark:from-primary-900/0 dark:via-primary-900/0 dark:to-secondary-900/0 group-hover:from-primary-50/30 group-hover:via-primary-50/20 group-hover:to-secondary-50/30 dark:group-hover:from-primary-900/20 dark:group-hover:via-primary-900/10 dark:group-hover:to-secondary-900/20 transition-all duration-500"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate pr-8 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors" title={item.filename}>
                {item.filename}
              </h3>
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-xl transform group-hover:scale-110 transition-transform duration-200">{item.language_flag}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-full">
                  {item.language}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Thumbnail */}
          <div className="bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-lg h-24 mb-4 flex items-center justify-center group-hover:from-primary-200 group-hover:to-secondary-200 dark:group-hover:from-primary-800/50 dark:group-hover:to-secondary-800/50 transition-all duration-300 relative overflow-hidden">
            {/* Animated background pattern */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z'/%3E%3C/g%3E%3C/svg%3E")`
              }}
            />
            <svg className="w-10 h-10 text-primary-600 dark:text-primary-400 relative z-10 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Progress Section with enhanced styling */}
          <div className="mt-auto space-y-3">
            {/* Progress Bar */}
            <div className="relative">
              <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full bg-gradient-to-r ${getProgressColor(item.progress)} transition-all duration-700 ease-out rounded-full relative overflow-hidden`}
                  style={{ width: `${item.progress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                  Página {item.last_page} de {item.total_pages}
                </span>
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                  {item.progress}%
                </span>
              </div>
            </div>

            {/* Date and Resume Button */}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-700 group-hover:border-primary-200 dark:group-hover:border-primary-700 transition-colors">              <span className="text-xs text-neutral-500 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 px-2 py-1 rounded-md">
                {formatDate(item.last_read_date)}
              </span>
              <div className="flex items-center space-x-1.5 text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                <svg className="w-3.5 h-3.5 group-hover:animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs font-semibold">
                  {item.progress === 100 ? 'Revisar' : 'Continuar'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Hover Effect Border */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-primary-200 dark:group-hover:ring-primary-700 transition-all duration-300 pointer-events-none"></div>
      
      {/* Completion Badge */}
      {item.progress === 100 && (
        <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Concluído</span>
        </div>
      )}
    </div>
  );
};

export default PdfHistoryCard;
