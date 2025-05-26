import { PdfHistoryItem } from './usePdfHistory';

/**
 * Utility functions for PDF History management
 */

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatReadingTime = (currentPage: number, totalPages: number, averagePageTime = 2): string => {
  const remainingPages = totalPages - currentPage;
  const remainingMinutes = remainingPages * averagePageTime;
  
  if (remainingMinutes < 1) return 'Menos de 1 min';
  if (remainingMinutes < 60) return `${Math.round(remainingMinutes)} min`;
  
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = Math.round(remainingMinutes % 60);
  
  if (hours === 1) return minutes > 0 ? `1h ${minutes}min` : '1h';
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
};

export const formatDateRelative = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) return 'Agora mesmo';
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min atrás`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h atrás`;
  }
  
  // Check if it's today
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Hoje';
  }
  
  // Check if it's yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  }
  
  // Less than a week
  const days = Math.floor(diffInSeconds / 86400);
  if (days < 7) {
    return `${days} dias atrás`;
  }
  
  // Format as date
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getProgressColor = (progress: number): string => {
  if (progress < 25) return 'bg-red-500';
  if (progress < 50) return 'bg-orange-500';
  if (progress < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const getProgressTextColor = (progress: number): string => {
  if (progress < 25) return 'text-red-600 dark:text-red-400';
  if (progress < 50) return 'text-orange-600 dark:text-orange-400';
  if (progress < 75) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
};

export const truncateFilename = (filename: string, maxLength = 25): string => {
  if (filename.length <= maxLength) return filename;
  
  const extension = filename.split('.').pop();
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4);
  
  return `${truncatedName}...${extension}`;
};

export const sortHistoryItems = (items: PdfHistoryItem[], sortBy: 'recent' | 'name' | 'progress'): PdfHistoryItem[] => {
  switch (sortBy) {
    case 'name':
      return [...items].sort((a, b) => a.name.localeCompare(b.name));
    case 'progress':
      return [...items].sort((a, b) => b.progress - a.progress);
    case 'recent':
    default:
      return [...items].sort((a, b) => new Date(b.lastReadDate).getTime() - new Date(a.lastReadDate).getTime());
  }
};

export const getHistoryStats = (items: PdfHistoryItem[]) => {
  if (items.length === 0) {
    return {
      totalDocuments: 0,
      completedDocuments: 0,
      averageProgress: 0,
      totalPagesRead: 0,
      estimatedTimeRemaining: '0 min'
    };
  }
  
  const totalDocuments = items.length;
  const completedDocuments = items.filter(item => item.progress >= 100).length;
  const averageProgress = Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length);
  const totalPagesRead = items.reduce((sum, item) => sum + item.lastPage, 0);
  
  // Calculate estimated time remaining for incomplete documents
  const incompleteItems = items.filter(item => item.progress < 100);
  const remainingPages = incompleteItems.reduce((sum, item) => sum + (item.totalPages - item.lastPage), 0);
  const estimatedTimeRemaining = formatReadingTime(0, remainingPages, 2);
  
  return {
    totalDocuments,
    completedDocuments,
    averageProgress,
    totalPagesRead,
    estimatedTimeRemaining
  };
};

/**
 * Generate a thumbnail data URL for PDF (placeholder implementation)
 * In a real implementation, this would generate actual PDF thumbnails
 */
export const generatePdfThumbnail = async (pdfFile: File): Promise<string> => {
  // This is a placeholder - in a real implementation, you would:
  // 1. Use PDF.js to render the first page
  // 2. Generate a canvas thumbnail
  // 3. Convert to data URL
  
  return new Promise((resolve) => {
    // Create a simple gradient thumbnail as placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1e40af');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 120, 160);
    
    // Add PDF icon
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📄', 60, 100);
    
    resolve(canvas.toDataURL());
  });
};

/**
 * Export history data for backup or sharing
 */
export const exportHistoryData = (items: PdfHistoryItem[]): string => {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    history: items
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Import history data from exported JSON
 */
export const importHistoryData = (jsonData: string): PdfHistoryItem[] => {
  try {
    const importData = JSON.parse(jsonData);
    
    if (importData.history && Array.isArray(importData.history)) {
      return importData.history.filter((item: any) => 
        item.id && item.name && item.lastPage !== undefined && item.totalPages !== undefined
      );
    }
    
    return [];
  } catch (error) {
    throw new Error('Formato de arquivo de importação inválido');
  }
};
