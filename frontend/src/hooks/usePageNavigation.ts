"use client";

import { useState, useCallback, useEffect } from 'react';

interface UsePageNavigationProps {
  totalPages: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

interface PageNavigationResult {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  jumpToPage: (page: number) => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

/**
 * Custom hook for managing PDF page navigation
 */
const usePageNavigation = ({
  totalPages,
  initialPage = 1,
  onPageChange,
}: UsePageNavigationProps): PageNavigationResult => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Validate and update page number
  const jumpToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        if (onPageChange) {
          onPageChange(page);
        }
      }
    },
    [totalPages, onPageChange]
  );

  // Navigate to next page if possible
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      jumpToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, jumpToPage]);

  // Navigate to previous page if possible
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      jumpToPage(currentPage - 1);
    }
  }, [currentPage, jumpToPage]);

  // Go to first page
  const goToFirstPage = useCallback(() => {
    jumpToPage(1);
  }, [jumpToPage]);

  // Go to last page
  const goToLastPage = useCallback(() => {
    jumpToPage(totalPages);
  }, [totalPages, jumpToPage]);

  // If totalPages changes and current page is out of bounds, adjust
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return {
    currentPage,
    setCurrentPage: jumpToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    jumpToPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages || totalPages === 0,
  };
};

export default usePageNavigation;
