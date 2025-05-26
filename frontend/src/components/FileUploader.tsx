"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface FileUploaderProps {
  onFileUploaded: (docId: string, fileName?: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragCounter, setDragCounter] = useState(0); // Track multiple drag events
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      
      // Add a small animation effect when file is selected
      if (dropZoneRef.current) {
        dropZoneRef.current.classList.add('scale-105');
        setTimeout(() => {
          if (dropZoneRef.current) {
            dropZoneRef.current.classList.remove('scale-105');
          }
        }, 200);
      }
    } else {
      setFile(null);
      setError('Por favor, selecione um arquivo PDF válido');
      
      // Add error shake animation
      if (dropZoneRef.current) {
        dropZoneRef.current.classList.add('shake-animation');
        setTimeout(() => {
          if (dropZoneRef.current) {
            dropZoneRef.current.classList.remove('shake-animation');
          }
        }, 500);
      }
    }
  };
  
  // Improved drag and drop handlers to handle nested elements better
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragging(false);
      setDragCounter(0);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'; // Show the copy icon
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    
    // Create a realistic upload simulation with dynamic speed simulation
    progressTimerRef.current = setInterval(() => {
      setProgress(prev => {
        // Initial fast progress that slows down towards 90%
        const newProgress = prev < 20 
          ? prev + 3 
          : prev < 50 
            ? prev + (2 + Math.random()) 
            : prev < 75 
              ? prev + (0.7 + Math.random() * 0.8)
              : prev < 85
                ? prev + (0.2 + Math.random() * 0.4)
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
          onFileUploaded(response.data.doc_id, file.name);
        }, 800);
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
  };    return (
    <div className="w-full">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden border border-neutral-100 dark:border-neutral-700 transition-all duration-300">
        <div className="p-4">
          {/* Upload Area */}
          <div
            ref={dropZoneRef}
            className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 cursor-pointer ${
              isDragging
                ? 'border-primary-400 dark:border-primary-500 bg-primary-50/80 dark:bg-primary-900/30'
                : file 
                  ? 'border-secondary-300 dark:border-secondary-700 bg-secondary-50/80 dark:bg-secondary-900/20' 
                  : 'border-neutral-300 dark:border-neutral-700 bg-neutral-100/70 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/70 hover:border-neutral-400'
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
            
            <div className="flex flex-col items-center justify-center py-3">
              {file ? (
                // File selected state
                <div className="flex flex-col items-center">
                  <div className="p-2 mb-2 rounded-full bg-secondary-100 dark:bg-secondary-900/30">
                    <svg 
                      className="w-6 h-6 text-secondary-600 dark:text-secondary-400" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="font-medium text-base text-secondary-600 dark:text-secondary-300 mb-1 break-all max-w-full text-center">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              ) : (
                // No file selected state
                <div className="flex flex-col items-center">
                  <div className="p-3 mb-2 rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <svg
                      className="w-6 h-6 text-neutral-600 dark:text-neutral-400"
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
                  <p className="font-medium text-base text-neutral-700 dark:text-neutral-200 mb-1">
                    {isDragging ? 'Solte o arquivo aqui' : 'Clique ou arraste um PDF'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center">
                    Suporta arquivos PDF até 20MB
                  </p>
                </div>
              )}
            </div>
            
            {/* Uploading overlay */}
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-lg">
                <div className="flex flex-col items-center max-w-xs">
                  <div className="relative w-12 h-12 mb-2">
                    <div className="absolute inset-0 rounded-full border-3 border-primary-200/50 dark:border-primary-900/50"></div>
                    <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full h-1 bg-primary-100 dark:bg-primary-900/50 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-primary-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-center font-semibold text-primary-700 dark:text-primary-300 text-sm mb-1">
                    {uploadSuccess ? 'Upload concluído!' : 'Enviando arquivo...'}
                  </p>
                  <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                    {uploadSuccess 
                      ? 'Preparando para tradução...' 
                      : 'Aguarde...'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 8C12.5523 8 13 8.44772 13 9V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V9C11 8.44772 11.4477 8 12 8ZM12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15Z" fill="currentColor" />
                </svg>
                <p className="text-red-700 dark:text-red-300 font-medium text-sm">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Upload button */}
          <div className="mt-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-3 px-6 rounded-lg text-white font-bold shadow-lg transition-all duration-300 ${
                !file || uploading
                  ? 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 transform hover:translate-y-[-1px] hover:shadow-xl'
              }`}
            >
              {file ? 'Traduzir PDF' : 'Selecione um arquivo para começar'}
            </button>
          </div>        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes shake-animation {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .shake-animation {
          animation: shake-animation 0.5s ease-in-out;
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(6, 182, 212, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default FileUploader;
