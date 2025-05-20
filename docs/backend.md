# Backend Development Documentation

This document provides technical details about the MoziTranslate backend implementation.

## Architecture Overview

The backend uses FastAPI to create a RESTful API that serves two main functions:
1. PDF processing using PyMuPDF
2. Text translation using the unofficial Google Translate API

### Key Components

#### Translation Module
The translation module uses Python's standard libraries to make requests to Google Translate's unofficial API endpoint.
This approach avoids the need for API keys while providing good translation quality.

#### PDF Processing Module
PyMuPDF (Fitz) is used to:
- Extract text with position information
- Render PDF pages as images
- Process document structure

## API Endpoints

### POST /pdf/upload
Uploads a PDF file and returns a document ID for future reference.

**Request:**
- Multipart form with PDF file

**Response:**
```json
{
  "doc_id": "unique-document-identifier",
  "page_count": 10,
  "filename": "document.pdf"
}
```

### GET /pdf/{doc_id}/page/{page_number}
Returns the specified page as an image and its translated text.

**Parameters:**
- doc_id: Document identifier returned from upload
- page_number: Page number to retrieve (1-based)
- source_lang: Source language code (default: auto)
- target_lang: Target language code (default: en)

**Response:**
```json
{
  "page_image": "base64-encoded-image",
  "original_text": "Text extracted from the PDF",
  "translated_text": "Translated version of the text",
  "page_number": 1,
  "total_pages": 10
}
```

## Translation Implementation

The translation uses the unofficial Google Translate API by:
1. Formatting the request in the expected way
2. Sending an HTTP request to the translation endpoint
3. Parsing the JSON response to extract translated text

For long texts, the implementation:
1. Splits text into manageable chunks
2. Translates each chunk separately
3. Adds delays between requests to avoid rate limiting
4. Reassembles the translated chunks
