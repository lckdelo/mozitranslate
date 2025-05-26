"use client";

import { useState, useEffect, useCallback } from 'react';

export interface PdfHistoryItem {
  id: string;
  name: string;
  uploadDate: string;
  lastReadDate: string;
  lastPage: number;
  totalPages: number;
  progress: number; // percentage
  thumbnail?: string;
  language: string;
  languageFlag: string;
}

interface UsePdfHistoryOptions {
  maxItems?: number;
}

const usePdfHistory = (options: UsePdfHistoryOptions = {}) => {
  const { maxItems = 4 } = options;
  const [history, setHistory] = useState<PdfHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('mozitranslate-pdf-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (error) {
        console.error('Error loading PDF history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mozitranslate-pdf-history', JSON.stringify(history));
  }, [history]);

  // Add or update a PDF in history
  const addToHistory = useCallback((pdfData: Omit<PdfHistoryItem, 'uploadDate' | 'lastReadDate'>) => {
    setHistory(prev => {
      const existingIndex = prev.findIndex(item => item.id === pdfData.id);
      const now = new Date().toISOString();
      
      const newItem: PdfHistoryItem = {
        ...pdfData,
        uploadDate: existingIndex >= 0 ? prev[existingIndex].uploadDate : now,
        lastReadDate: now,
      };

      let updatedHistory;
      if (existingIndex >= 0) {
        // Update existing item
        updatedHistory = [...prev];
        updatedHistory[existingIndex] = newItem;
      } else {
        // Add new item
        updatedHistory = [newItem, ...prev];
      }

      // Sort by last read date (most recent first) and limit to maxItems
      return updatedHistory
        .sort((a, b) => new Date(b.lastReadDate).getTime() - new Date(a.lastReadDate).getTime())
        .slice(0, maxItems);
    });
  }, [maxItems]);

  // Update reading progress
  const updateProgress = useCallback((pdfId: string, currentPage: number, totalPages: number) => {
    setHistory(prev => 
      prev.map(item => 
        item.id === pdfId 
          ? {
              ...item,
              lastPage: currentPage,
              totalPages,
              progress: Math.round((currentPage / totalPages) * 100),
              lastReadDate: new Date().toISOString()
            }
          : item
      )
    );
  }, []);

  // Remove PDF from history
  const removeFromHistory = useCallback((pdfId: string) => {
    setHistory(prev => prev.filter(item => item.id !== pdfId));
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('mozitranslate-pdf-history');
  }, []);

  // Get specific PDF from history
  const getPdfFromHistory = useCallback((pdfId: string) => {
    return history.find(item => item.id === pdfId);
  }, [history]);

  return {
    history,
    addToHistory,
    updateProgress,
    removeFromHistory,
    clearHistory,
    getPdfFromHistory,
  };
};

export default usePdfHistory;
