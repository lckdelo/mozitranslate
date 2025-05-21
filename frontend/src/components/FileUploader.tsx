"use client";

import { useState } from 'react';
import axios from 'axios';

interface FileUploaderProps {
  onFileUploaded: (docId: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError('Please select a PDF file');
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please drop a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:8000/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.doc_id) {
        onFileUploaded(response.data.doc_id);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-sky-100 dark:border-sky-900 p-8">
      <div
        className="border-2 border-dashed border-sky-300 dark:border-sky-700 rounded-lg p-8 text-center cursor-pointer bg-sky-50 dark:bg-slate-900 hover:border-sky-400 dark:hover:border-sky-600 transition-all duration-300"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center">
          <div className="mb-6 p-3 rounded-full bg-sky-100 dark:bg-sky-900">
            <svg
              className="w-12 h-12 text-sky-500 dark:text-sky-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <p className="text-lg font-medium text-sky-700 dark:text-sky-300">
            {file ? file.name : 'Clique ou arraste um arquivo PDF para upload'}
          </p>
          <p className="text-sm text-sky-500 dark:text-sky-400 mt-2">
            Apenas arquivos PDF são suportados
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 rounded-md border border-red-200 dark:border-red-800">
          <p className="text-center text-red-600 dark:text-red-300 font-medium">
            {error}
          </p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium shadow-sm ${
            !file || uploading
              ? 'bg-sky-300 dark:bg-sky-800 cursor-not-allowed'
              : 'bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 transform hover:-translate-y-0.5 transition-all duration-200'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Enviando...</span>
            </div>
          ) : (
            <span>Enviar PDF para Tradução</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
