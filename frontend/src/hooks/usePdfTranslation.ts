"use client";

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

interface PageData {
  page_image: string;
  original_text: string;
  translated_text: string;
  page_number: number;
  total_pages: number;
}

interface UsePdfTranslationOptions {
  sourceLang?: string;
  targetLang?: string;
}

const usePdfTranslation = (
  docId: string, 
  initialPage: number = 1,
  options: UsePdfTranslationOptions = {}
) => {
  const { 
    sourceLang = 'auto',
    targetLang = 'pt'
  } = options;
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pagesInQueue, setPagesInQueue] = useState<number[]>([]);
  
  // Cache translated pages to avoid re-fetching
  // Use a key that combines page number, source language and target language
  const [cache, setCache] = useState<Record<string, PageData>>({});

  // Initialize document and load first page
  useEffect(() => {
    if (docId) {
      navigateToPage(initialPage);
      
      // Optional: Preload the next page in background
      if (initialPage < totalPages) {
        prefetchPage(initialPage + 1);
      }
    }
  }, [docId]); // Only run when docId changes

  // Prefetch a page in background without displaying it
  const prefetchPage = useCallback(
    async (pageNumber: number) => {
      // Generate a cache key that includes the language configuration
      const cacheKey = `${pageNumber}-${sourceLang}-${targetLang}`;
      
      // Don't prefetch if already in cache or currently loading
      if (cache[cacheKey] || pagesInQueue.includes(pageNumber)) {
        return;
      }

      // Add page to queue
      setPagesInQueue((prev) => [...prev, pageNumber]);

      try {
        const response = await axios.get(
          `http://localhost:8000/pdf/${docId}/page/${pageNumber}`,
          {
            params: {
              source_lang: sourceLang,
              target_lang: targetLang
            }
          }
        );
        
        // Update cache with prefetched data
        setCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: response.data,
        }));
        
        // If total pages hasn't been set yet, set it
        if (totalPages === 0 && response.data.total_pages) {
          setTotalPages(response.data.total_pages);
        }
      } catch (err) {
        console.error(`Failed to prefetch page ${pageNumber}:`, err);
      } finally {
        // Remove page from queue
        setPagesInQueue((prev) => prev.filter(p => p !== pageNumber));
      }
    },
    [docId, cache, pagesInQueue, totalPages, sourceLang, targetLang]
  );

  const navigateToPage = useCallback(
    async (pageNumber: number) => {
      if (!docId) {
        setError('No document selected');
        setIsLoading(false);
        return;
      }

      // Generate a cache key that includes the language configuration
      const cacheKey = `${pageNumber}-${sourceLang}-${targetLang}`;
      
      // Check if this page is already in cache
      if (cache[cacheKey]) {
        setPageData(cache[cacheKey]);
        setIsLoading(false);
        
        // Pre-fetch next page if possible
        if (pageNumber < (cache[cacheKey]?.total_pages || 0)) {
          prefetchPage(pageNumber + 1);
        }
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(
          `http://localhost:8000/pdf/${docId}/page/${pageNumber}`,
          {
            params: {
              source_lang: sourceLang,
              target_lang: targetLang
            }
          }
        );
        
        const newPageData = response.data;
        
        // Update cache with language-specific key
        setCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: newPageData,
        }));
        
        setPageData(newPageData);
        setTotalPages(newPageData.total_pages);
        setIsLoading(false);
        
        // Pre-fetch next page if possible
        if (pageNumber < newPageData.total_pages) {
          prefetchPage(pageNumber + 1);
        }
      } catch (err: any) {
        console.error('Failed to fetch page:', err);
        setError(err.response?.data?.detail || 'Failed to load page');
        setIsLoading(false);
      }
    },
    [docId, cache, prefetchPage, sourceLang, targetLang]
  );

  // Reset cache when languages change
  useEffect(() => {
    resetCache();
  }, [sourceLang, targetLang]);

  const resetCache = useCallback(() => {
    setCache({});
  }, []);

  return {
    pageData,
    isLoading,
    error,
    totalPages,
    navigateToPage,
    prefetchPage,
    resetCache,
    sourceLang,
    targetLang,
    isPageInQueue: (page: number) => pagesInQueue.includes(page),
    isPageCached: (page: number) => {
      const cacheKey = `${page}-${sourceLang}-${targetLang}`;
      return !!cache[cacheKey];
    },
  };
};

export default usePdfTranslation;
