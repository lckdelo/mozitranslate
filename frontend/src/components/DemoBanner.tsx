"use client";

import React from 'react';

interface DemoBannerProps {
  onEnableDemo: () => void;
  onDisableDemo: () => void;
  isDemoMode: boolean;
}

const DemoBanner: React.FC<DemoBannerProps> = ({ onEnableDemo, onDisableDemo, isDemoMode }) => {
  if (isDemoMode) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                Modo Demo Ativo
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Você está visualizando dados de exemplo do histórico de PDFs
              </p>
            </div>
          </div>
          <button
            onClick={onDisableDemo}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Desativar Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-6 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 3H6C4.9 3 4 3.9 4 5V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V8L15 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 3V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 13H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Experimente o Histórico de PDFs
        </h3>
        
        <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm leading-relaxed">
          Veja como funciona o sistema de histórico com alguns documentos de exemplo. 
          Explore as funcionalidades de progresso, retomada de leitura e organização.
        </p>
        
        <button
          onClick={onEnableDemo}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5V19L19 12L8 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Ativar Modo Demo</span>
        </button>
        
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
          Os dados de demonstração não afetam seus documentos reais
        </p>
      </div>
    </div>
  );
};

export default DemoBanner;
