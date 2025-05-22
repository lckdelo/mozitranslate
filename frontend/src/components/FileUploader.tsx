"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface FileUploaderProps {
  onFileUploaded: (docId: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset progress when a new file is selected
  useEffect(() => {
    setProgress(0);
    setError(null);
    setUploadSuccess(false);
  }, [file]);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError('Por favor, selecione um arquivo PDF válido');
      }
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Por favor, arraste apenas arquivos PDF');
      }
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    
    // Create a realistic upload simulation
    progressTimerRef.current = setInterval(() => {
      setProgress(prev => {
        // Slowly accelerate then decelerate as it gets closer to 90%
        const newProgress = prev < 30 
          ? prev + 3 
          : prev < 60 
            ? prev + 2 
            : prev < 85 
              ? prev + 0.5
              : prev;
              
        if (newProgress >= 90) {
          if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
          }
          return 90; // Hold at 90% until actual completion
        }
        return newProgress;
      });
    }, 150);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo para enviar');
      return;
    }

    setUploading(true);
    setError(null);
    simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:8000/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.doc_id) {
        // Set progress to 100% when upload completes
        setProgress(100);
        setUploadSuccess(true);
        
        // Small delay to show the full progress bar and success state before transitioning
        setTimeout(() => {
          onFileUploaded(response.data.doc_id);
        }, 500);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err: any) {
      console.error('Erro de upload:', err);
      setError(err.response?.data?.detail || 'Falha ao enviar o arquivo');
      // Reset progress on error
      setProgress(0);
    } finally {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      setUploading(false);
    }
  };
  
  // Format file size to readable format (KB, MB)
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="mb-4">
              <svg className="w-16 h-16 text-primary-500 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4Z" fill="currentColor" />
                <path d="M7 18H17V16H7V18Z" fill="currentColor" />
                <path d="M17 14H7V12H17V14Z" fill="currentColor" />
                <path d="M7 10H11V8H7V10Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 text-center">
              Traduza seu documento PDF
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-center max-w-md">
              Selecione um arquivo PDF para traduzir para vários idiomas enquanto preserva o layout original
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragging
                ? 'border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : file 
                  ? 'border-secondary-400 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/10' 
                  : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id="file-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            
            <div className="flex flex-col items-center justify-center py-6">
              {file ? (
                // File selected state
                <div className="flex flex-col items-center">
                  <div className="p-3 mb-3 rounded-full bg-secondary-100 dark:bg-secondary-900/30">
                    <svg 
                      className="w-8 h-8 text-secondary-600 dark:text-secondary-400" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="font-medium text-secondary-700 dark:text-secondary-300 mb-1 break-all max-w-full">
                    {file.name}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              ) : (
                // No file selected state
                <div className="flex flex-col items-center">
                  <div className="p-3 mb-3 rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <svg
                      className="w-8 h-8 text-neutral-600 dark:text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                  </div>
                  <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Clique ou arraste um PDF
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500">
                    Suporta arquivos PDF até 20MB
                  </p>
                </div>
              )}
            </div>
            
            {/* Uploading overlay */}
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-xl">
                <div className="flex flex-col items-center max-w-xs">
                  <div className="relative w-16 h-16 mb-4">
                    <svg className="absolute inset-0 w-16 h-16 text-primary-200 dark:text-primary-900 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg className="absolute inset-0 w-16 h-16 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeDasharray={`${progress * 0.6} 100`} 
                        transform="rotate(-90 12 12)" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-center font-medium text-primary-700 dark:text-primary-300 mb-1">
                    {uploadSuccess ? 'Upload concluído!' : 'Enviando arquivo...'}
                  </p>
                  <p className="text-sm text-center text-neutral-500 dark:text-neutral-400">
                    {uploadSuccess 
                      ? 'Preparando para tradução...' 
                      : 'Este processo pode levar alguns segundos dependendo do tamanho do seu PDF'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-state-errorLight dark:bg-neutral-900 rounded-lg border border-state-error/20 dark:border-state-error/30">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-state-error mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 8C12.5523 8 13 8.44772 13 9V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V9C11 8.44772 11.4477 8 12 8ZM12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15Z" fill="currentColor" />
                </svg>
                <p className="text-state-error font-medium">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Upload button */}
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-3.5 px-4 rounded-lg text-white font-semibold shadow-md transition-all duration-300 ${
                !file || uploading
                  ? 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 transform hover:translate-y-[-1px] hover:shadow-lg'
              }`}
            >
              {file ? 'Traduzir PDF' : 'Selecione um arquivo para começar'}
            </button>
          </div>
          
          {/* Additional information */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
              <svg className="w-5 h-5 mr-2 text-primary-500 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M12 3L13.9101 4.87147L16.5 4.20577L17.2184 6.78155L19.7942 7.5L19.1285 10.0899L21 12L19.1285 13.9101L19.7942 16.5L17.2184 17.2184L16.5 19.7942L13.9101 19.1285L12 21L10.0899 19.1285L7.5 19.7942L6.78155 17.2184L4.20577 16.5L4.87147 13.9101L3 12L4.87147 10.0899L4.20577 7.5L6.78155 6.78155L7.5 4.20577L10.0899 4.87147L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>50+ idiomas suportados</span>
            </div>
            
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
              <svg className="w-5 h-5 mr-2 text-primary-500 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.2218 11.2218C18.4027 11.636 18.5 12.0981 18.5 12.5833C18.5 13.0685 18.4027 13.5306 18.2218 13.9448M5.77823 13.9448C5.59733 13.5306 5.5 13.0685 5.5 12.5833C5.5 12.0981 5.59733 11.636 5.77823 11.2218M15.7218 8.7782C16.6926 9.75223 17.25 11.0818 17.25 12.5C17.25 13.9182 16.6926 15.2478 15.7218 16.2218M8.27823 16.2218C7.30737 15.2478 6.75 13.9182 6.75 12.5C6.75 11.0818 7.30737 9.75223 8.27823 8.7782M3 12.5C3 7.25 7.25 3 12.5 3C17.75 3 22 7.25 22 12.5C22 17.75 17.75 22 12.5 22C7.25 22 3 17.75 3 12.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Rápido e seguro</span>
            </div>
            
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
              <svg className="w-5 h-5 mr-2 text-primary-500 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Preserva o layout do documento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
