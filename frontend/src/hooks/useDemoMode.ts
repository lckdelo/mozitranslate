import { PdfHistoryItem } from './usePdfHistory';

/**
 * Sample PDF history data for demo purposes
 */
export const generateSampleHistory = (): PdfHistoryItem[] => {
  const now = new Date();
  
  return [
    {
      id: 'demo-1',
      name: 'Manual do Usuário - Sistema ERP.pdf',
      uploadDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      lastReadDate: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      lastPage: 45,
      totalPages: 120,
      progress: 38,
      language: 'Inglês',
      languageFlag: '🇺🇸',
      thumbnail: '/api/placeholder/120/160'
    },
    {
      id: 'demo-2',
      name: 'Relatório Financeiro Q4 2024.pdf',
      uploadDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      lastReadDate: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      lastPage: 85,
      totalPages: 85,
      progress: 100,
      language: 'Espanhol',
      languageFlag: '🇪🇸',
      thumbnail: '/api/placeholder/120/160'
    },
    {
      id: 'demo-3',
      name: 'Especificações Técnicas - API REST.pdf',
      uploadDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      lastReadDate: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      lastPage: 22,
      totalPages: 56,
      progress: 39,
      language: 'Francês',
      languageFlag: '🇫🇷',
      thumbnail: '/api/placeholder/120/160'
    },
    {
      id: 'demo-4',
      name: 'Guia de Boas Práticas - React.pdf',
      uploadDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      lastReadDate: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      lastPage: 67,
      totalPages: 89,
      progress: 75,
      language: 'Alemão',
      languageFlag: '🇩🇪',
      thumbnail: '/api/placeholder/120/160'
    }
  ];
};

/**
 * Demo mode configuration
 */
export const DEMO_CONFIG = {
  enabled: false, // Set to true to enable demo mode
  autoAddSampleHistory: true,
  showDemoBanner: true,
  sampleHistoryKey: 'mozitranslate-demo-history'
};

/**
 * Initialize demo mode if enabled
 */
export const initializeDemoMode = (): PdfHistoryItem[] => {
  if (!DEMO_CONFIG.enabled) return [];
  
  // Check if we already have demo data
  const existingDemo = localStorage.getItem(DEMO_CONFIG.sampleHistoryKey);
  if (existingDemo) {
    try {
      return JSON.parse(existingDemo);
    } catch {
      // If parsing fails, generate new sample data
    }
  }
  
  if (DEMO_CONFIG.autoAddSampleHistory) {
    const sampleHistory = generateSampleHistory();
    localStorage.setItem(DEMO_CONFIG.sampleHistoryKey, JSON.stringify(sampleHistory));
    return sampleHistory;
  }
  
  return [];
};

/**
 * Clear demo data
 */
export const clearDemoData = () => {
  localStorage.removeItem(DEMO_CONFIG.sampleHistoryKey);
};

/**
 * Toggle demo mode
 */
export const toggleDemoMode = (enabled: boolean) => {
  DEMO_CONFIG.enabled = enabled;
  
  if (!enabled) {
    clearDemoData();
  } else if (DEMO_CONFIG.autoAddSampleHistory) {
    const sampleHistory = generateSampleHistory();
    localStorage.setItem(DEMO_CONFIG.sampleHistoryKey, JSON.stringify(sampleHistory));
  }
};

/**
 * Demo banner component props
 */
export interface DemoBannerProps {
  onEnableDemo: () => void;
  onDisableDemo: () => void;
  isDemoMode: boolean;
}

/**
 * Check if demo mode should be shown
 */
export const shouldShowDemo = (historyLength: number): boolean => {
  return historyLength === 0 && !DEMO_CONFIG.enabled;
};
