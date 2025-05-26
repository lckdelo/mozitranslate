import { useState, useEffect, useCallback } from 'react';
import { 
  PdfHistoryItem, 
  getPdfHistory, 
  addPdfToHistory, 
  updateReadingProgress,
  removePdfFromHistory,
  clearPdfHistory,
  getHistoryStatistics
} from '../utils/api';

export interface UsePdfHistoryDBReturn {
  history: PdfHistoryItem[];
  isLoading: boolean;
  error: string | null;
  addToHistory: (pdfData: {
    pdf_id: string;
    filename: string;
    file_path?: string;
    total_pages?: number;
    language?: string;
    language_flag?: string;
  }) => Promise<void>;
  updateProgress: (pdfId: string, currentPage: number, totalPages: number) => Promise<void>;
  removeFromHistory: (pdfId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  getStats: () => Promise<{
    total_documents: number;
    completed_documents: number;
    average_progress: number;
    total_pages_read: number;
  } | null>;
}

export const usePdfHistoryDB = (): UsePdfHistoryDBReturn => {
  const [history, setHistory] = useState<PdfHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history from database
  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const historyData = await getPdfHistory(10);
      setHistory(historyData);
    } catch (err) {
      console.error('Error loading PDF history:', err);
      setError('Failed to load PDF history');
      // Fallback to empty array if API fails
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Add or update PDF in history
  const addToHistory = useCallback(async (pdfData: {
    pdf_id: string;
    filename: string;
    file_path?: string;
    total_pages?: number;
    language?: string;
    language_flag?: string;
  }) => {
    try {
      setError(null);
      await addPdfToHistory({
        pdf_id: pdfData.pdf_id,
        filename: pdfData.filename,
        file_path: pdfData.file_path || '',
        last_page: 1,
        total_pages: pdfData.total_pages || 0,
        progress: 0,
        language: pdfData.language || 'Português',
        language_flag: pdfData.language_flag || '🇧🇷',
        upload_date: new Date().toISOString()
      });
      
      // Refresh history after adding
      await loadHistory();
    } catch (err) {
      console.error('Error adding to history:', err);
      setError('Failed to add PDF to history');
      throw err;
    }
  }, [loadHistory]);

  // Update reading progress
  const updateProgress = useCallback(async (
    pdfId: string, 
    currentPage: number, 
    totalPages: number
  ) => {
    try {
      setError(null);
      await updateReadingProgress(pdfId, currentPage, totalPages);
      
      // Update local state immediately for better UX
      setHistory(prev => prev.map(item => {
        if (item.pdf_id === pdfId) {
          const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100 * 10) / 10 : 0;
          return {
            ...item,
            last_page: currentPage,
            total_pages: totalPages,
            progress: progress,
            last_read_date: new Date().toISOString()
          };
        }
        return item;
      }));
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update reading progress');
      // Refresh history to get latest state from server
      await loadHistory();
    }
  }, [loadHistory]);

  // Remove PDF from history
  const removeFromHistory = useCallback(async (pdfId: string) => {
    try {
      setError(null);
      await removePdfFromHistory(pdfId);
      
      // Update local state immediately
      setHistory(prev => prev.filter(item => item.pdf_id !== pdfId));
    } catch (err) {
      console.error('Error removing from history:', err);
      setError('Failed to remove PDF from history');
      // Refresh history to get latest state from server
      await loadHistory();
      throw err;
    }
  }, [loadHistory]);

  // Clear all history
  const clearHistoryFunc = useCallback(async () => {
    try {
      setError(null);
      await clearPdfHistory();
      setHistory([]);
    } catch (err) {
      console.error('Error clearing history:', err);
      setError('Failed to clear history');
      throw err;
    }
  }, []);

  // Refresh history
  const refreshHistory = useCallback(async () => {
    await loadHistory();
  }, [loadHistory]);

  // Get statistics
  const getStats = useCallback(async () => {
    try {
      setError(null);
      return await getHistoryStatistics();
    } catch (err) {
      console.error('Error getting statistics:', err);
      setError('Failed to get statistics');
      return null;
    }
  }, []);

  return {
    history,
    isLoading,
    error,
    addToHistory,
    updateProgress,
    removeFromHistory,
    clearHistory: clearHistoryFunc,
    refreshHistory,
    getStats
  };
};

export default usePdfHistoryDB;
