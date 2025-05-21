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
