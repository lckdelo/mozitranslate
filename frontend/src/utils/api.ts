import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface UploadResponse {
  doc_id: string;
  page_count: number;
  filename: string;
}

export interface PageResponse {
  page_image: string;
  original_text: string;
  translated_text: string;
  page_number: number;
  total_pages: number;
}

export interface PdfHistoryItem {
  pdf_id: string;
  filename: string;
  file_path?: string;
  last_page: number;
  total_pages: number;
  progress: number;
  language: string;
  language_flag: string;
  upload_date: string;
  last_read_date: string;
  thumbnail_path?: string;
}

export interface HistoryResponse {
  status: string;
  data: PdfHistoryItem[];
}

export interface HistoryStatsResponse {
  status: string;
  data: {
    total_documents: number;
    completed_documents: number;
    average_progress: number;
    total_pages_read: number;
  };
}

export interface AddPdfHistoryRequest {
  pdf_id: string;
  filename: string;
  file_path?: string;
  last_page?: number;
  total_pages?: number;
  progress?: number;
  language?: string;
  language_flag?: string;
  upload_date?: string;
}

export interface ProgressUpdateRequest {
  pdf_id: string;
  current_page: number;
  total_pages: number;
}

// Upload a PDF file and get a document ID
export const uploadPdf = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<UploadResponse>(
    `${API_BASE_URL}/pdf/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

// Get a specific page with translation
export const getPage = async (
  docId: string,
  pageNumber: number,
  sourceLang: string = 'auto',
  targetLang: string = 'en'
): Promise<PageResponse> => {
  const response = await axios.get<PageResponse>(
    `${API_BASE_URL}/pdf/${docId}/page/${pageNumber}?source_lang=${sourceLang}&target_lang=${targetLang}`
  );

  return response.data;
};

// Close a document and free resources
export const closeDocument = async (docId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/pdf/${docId}`);
};

// Reopen a PDF from history using its stored file path
export const reopenPdfFromHistory = async (pdfId: string): Promise<UploadResponse> => {
  const response = await axios.post<UploadResponse>(
    `${API_BASE_URL}/pdf/reopen/${pdfId}`
  );

  return response.data;
};

// PDF History API functions

// Get PDF history
export const getPdfHistory = async (limit: number = 10): Promise<PdfHistoryItem[]> => {
  const response = await axios.get<HistoryResponse>(
    `${API_BASE_URL}/pdf/history?limit=${limit}`
  );
  return response.data.data;
};

// Add or update PDF in history
export const addPdfToHistory = async (pdfData: AddPdfHistoryRequest): Promise<void> => {
  await axios.post(`${API_BASE_URL}/pdf/history`, pdfData);
};

// Update reading progress
export const updateReadingProgress = async (
  pdfId: string,
  currentPage: number,
  totalPages: number
): Promise<void> => {
  const data: ProgressUpdateRequest = {
    pdf_id: pdfId,
    current_page: currentPage,
    total_pages: totalPages
  };
  await axios.put(`${API_BASE_URL}/pdf/history/progress`, data);
};

// Get specific PDF from history
export const getPdfFromHistory = async (pdfId: string): Promise<PdfHistoryItem> => {
  const response = await axios.get<{status: string; data: PdfHistoryItem}>(
    `${API_BASE_URL}/pdf/history/${pdfId}`
  );
  return response.data.data;
};

// Remove PDF from history
export const removePdfFromHistory = async (pdfId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/pdf/history/${pdfId}`);
};

// Clear all history
export const clearPdfHistory = async (): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/pdf/history`);
};

// Get history statistics
export const getHistoryStatistics = async (): Promise<HistoryStatsResponse['data']> => {
  const response = await axios.get<HistoryStatsResponse>(
    `${API_BASE_URL}/pdf/history/stats`
  );
  return response.data.data;
};
