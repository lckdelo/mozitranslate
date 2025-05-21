# MoziTranslate - Detailed Project Development Guide

This document provides a detailed step-by-step guide on how to develop the MoziTranslate application, split into backend and frontend tasks.

## Backend Development Tasks

### Phase 1: Project Setup

1. **Create Virtual Environment**
   - Navigate to backend directory
   - Run `python -m venv venv`
   - Activate environment (Windows: `venv\Scripts\activate`, Unix/Mac: `source venv/bin/activate`)

2. **Install Base Dependencies**
   - Create requirements.txt with:
     ```
     fastapi==0.104.1
     uvicorn==0.24.0
     pymupdf==1.23.7
     python-multipart==0.0.6
     pytest==7.4.3
     ```
   - Run `pip install -r requirements.txt`

3. **Configure Code Quality Tools**
   - Install and configure black for formatting: `pip install black`
   - Install and configure flake8 for linting: `pip install flake8`
   - Create .flake8 configuration file

### Phase 2: Translation Module

1. **Create Basic Translation Function**
   - Create file: `backend/translator.py`
   - Implement `translate(text, source_lang, target_lang)` function
   - Use urllib.request to make HTTP requests to Google Translate API
   - Parse JSON response and extract translated text
   - Add basic error handling

2. **Enhance Translation Capabilities**
   - Implement text segmentation for long texts
   - Add delay between requests to avoid rate limiting
   - Create retry mechanism for failed requests
   - Write unit tests for translation functions

3. **Create Translation Cache**
   - Implement in-memory cache for recently translated texts
   - Add cache expiration logic
   - Create mechanism to save/load cache to/from disk

### Phase 3: PDF Processing

1. **Create PDF Handling Module**
   - Create file: `backend/pdf_processor.py`
   - Implement functions to load PDF files using PyMuPDF
   - Create methods to extract text from specific pages
   - Implement page image rendering

2. **Enhance Text Extraction**
   - Use page.get_text("dict") to preserve text positioning
   - Create algorithms to maintain indentation and layout
   - Implement text block recognition for better translation results
   - Write tests for PDF extraction functions

### Phase 4: API Development

1. **Create FastAPI Application**
   - Create `backend/main.py` with FastAPI app initialization
   - Configure CORS and middleware
   - Set up exception handlers

2. **Implement Upload Endpoint**
   - Create `/pdf/upload` endpoint that:
     - Validates uploaded PDF files
     - Saves files to temporary storage
     - Generates and returns document ID

3. **Implement Page Translation Endpoint**
   - Create `/pdf/{doc_id}/page/{page_number}` endpoint that:
     - Validates document ID and page number
     - Extracts text from specified page
     - Translates extracted text
     - Returns JSON with page image (base64) and translated text

4. **Add API Documentation**
   - Configure Swagger/OpenAPI documentation
   - Add detailed descriptions for all endpoints
   - Include request/response examples

### Phase 5: Testing and Optimization

1. **Write Comprehensive Tests**
   - Create unit tests for all modules
   - Implement integration tests for API endpoints
   - Add test for edge cases and error handling

2. **Optimize Performance**
   - Implement more efficient caching
   - Add background task processing for heavy operations
   - Optimize PDF processing for speed

3. **Prepare for Deployment**
   - Create Docker configuration
   - Set up environment variable management
   - Configure production server settings

## Frontend Development Tasks

### Phase 1: Project Setup

1. **Initialize Next.js Project**
   - Navigate to frontend directory
   - Run `npx create-next-app@latest .`
   - Select TypeScript, ESLint, Tailwind CSS options

2. **Configure Development Tools**
   - Set up Prettier for code formatting
   - Configure ESLint rules
   - Create .editorconfig for consistent coding style

3. **Set Up Basic Project Structure**
   - Create folder structure for components, hooks, utils, etc.
   - Set up basic layout components
   - Configure theme and styling with Tailwind

### Phase 2: State Management and API Integration

1. **Create API Client**
   - Create utils for API communication
   - Implement functions for file upload
   - Create methods for fetching page translations

2. **Implement State Management**
   - Create React context for application state
   - Implement state for:
     - Current document
     - Current page
     - Translation cache
     - Loading states

3. **Create Custom Hooks**
   - Implement `usePdfTranslation` hook
   - Create `usePageNavigation` for page control
   - Add other utility hooks as needed

### Phase 3: PDF Viewer Component

1. **Create Basic PDF Viewer**
   - Create components/PdfViewer.tsx
   - Implement image rendering for PDF pages
   - Add loading and error states

2. **Add Navigation Controls**
   - Create next/previous page buttons
   - Implement page number input
   - Add keyboard navigation (arrow keys)

3. **Enhance Viewer Features**
   - Add zoom controls
   - Implement page rotation if needed
   - Create thumbnail navigation sidebar (optional)

### Phase 4: Translation Panel Component

1. **Create Translation Display**
   - Create components/TranslatedText.tsx
   - Implement styled text display with preserved formatting
   - Add loading indicators during translation

2. **Enhance Translation Features**
   - Add copy-to-clipboard functionality
   - Implement text highlighting
   - Create options for font size adjustment

### Phase 5: Main Application Layout

1. **Create Split-Screen Layout**
   - Implement 50/50 split layout for desktop
   - Create tab-based layout for mobile
   - Add resize handle for adjustable split

2. **Implement File Upload UI**
   - Create drag-and-drop upload area
   - Add file selection dialog
   - Implement upload progress indicator

3. **Add UI Refinements**
   - Implement dark/light mode toggle
   - Add accessibility features (ARIA labels, keyboard navigation)
   - Create smooth transitions between pages

### Phase 6: Testing and Deployment

1. **Write Frontend Tests**
   - Create component tests with React Testing Library
   - Implement integration tests for key user flows
   - Add snapshot tests for UI components

2. **Optimize Performance**
   - Implement lazy loading for components
   - Add memoization for expensive calculations
   - Optimize bundle size with code splitting

3. **Prepare for Production**
   - Configure production build settings
   - Set up environment variables
   - Create deployment configuration for Vercel/Netlify

## Integration and Deployment

1. **End-to-End Testing**
   - Create Cypress tests for full application flow
   - Test on multiple browsers and devices
   - Fix any integration issues

2. **Configure CI/CD Pipeline**
   - Set up GitHub Actions workflow
   - Configure automated testing and deployment
   - Implement versioning strategy

3. **Deploy Application**
   - Deploy backend to selected platform
   - Deploy frontend to Vercel/Netlify
   - Set up monitoring and error tracking

4. **Post-Deployment**
   - Conduct final testing in production environment
   - Monitor performance and errors
   - Create user documentation
