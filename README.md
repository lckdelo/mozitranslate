# MoziTranslate

MoziTranslate is an application that translates PDF pages in real-time as you read them. It features a split-screen interface with the original PDF on the left and the translated text on the right.

## 🌟 Key Features

- Real-time translation of PDF content using Google Translate's unofficial API
- Split-screen interface: original PDF view and translated text
- On-demand translation of the current page only
- Multi-language support with 10+ languages available
- Page navigation with keyboard shortcuts (arrow keys, Home/End)
- Cached translations to improve performance
- Preserved text formatting and indentation in translations
- Responsive design for desktop and mobile devices (switches to tabs on mobile)
- Dark/light mode support based on system preferences

## 🛠️ Technology Stack

### Backend
- Python with FastAPI
- PyMuPDF (fitz) for PDF processing
- Native urllib/json for translation requests
- Uvicorn/Gunicorn as ASGI server

### Frontend
- Next.js with React
- TypeScript for type safety
- Tailwind CSS for styling
- Custom React hooks for state management
- Responsive layout

## 📁 Project Structure

```
mozitranslate/
├── backend/
│   ├── main.py               # FastAPI application and endpoints
│   ├── translator.py         # Translation service with caching
│   ├── pdf_processor.py      # PDF manipulation functions
│   ├── run.py               # Entry point for running the application
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   │   ├── page.tsx      # Main application page
│   │   │   └── layout.tsx    # Application layout
│   │   ├── components/       # React components
│   │   │   ├── FileUploader.tsx
│   │   │   ├── PdfViewer.tsx
│   │   │   ├── TranslatedView.tsx
│   │   │   └── TranslationPanel.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── usePdfTranslation.ts
│   │   │   ├── usePageNavigation.ts
│   │   │   └── useLanguageSelection.ts
│   │   └── utils/           # Utility functions
│   │       └── api.ts       # API client functions
│   └── package.json         # Node.js dependencies
│
└── docs/                    # Project documentation
    ├── backend.md
    └── frontend.md
```

## 📋 Project Tasks

### 0. Initial Setup
- [x] Create Git repository
- [ ] Configure virtual environments (venv or poetry)
- [ ] Define code conventions (lint, formatter)
- [ ] Create folder structure:
  ```
  /backend
  /frontend
  /docs
  ```

### 1. Backend Development

#### 1.1. Configuration and Dependencies
- [ ] Initialize Python project in /backend
- [ ] Create requirements.txt or pyproject.toml with:
  - PyMuPDF (fitz)
  - FastAPI
  - Uvicorn/Gunicorn
  - pytest for testing
- [ ] Configure development server

#### 1.2. Translation Module
- [ ] Implement `translate(text, source_lang, target_lang)` function
  - Use urllib and json libraries
  - Add proper error handling and retry logic
- [ ] Create text segmentation logic for long texts
  - Implement character/word count limits
  - Add appropriate delays between requests
- [ ] Add request rate limiting to avoid IP blocks
- [ ] Create translation cache to avoid redundant requests

#### 1.3. PDF Processing
- [ ] Create PDF handling module with PyMuPDF
- [ ] Implement page extraction with proper text positioning
- [ ] Create functions to:
  - Extract text with positioning data
  - Convert page to image for display
  - Preserve original text layout and indentation

#### 1.4. API Endpoints
- [ ] Create `/pdf/upload` endpoint for PDF reception and storage
  - Implement secure file validation
  - Generate document ID for reference
- [ ] Create `/pdf/{doc_id}/page/{page_number}` endpoint
  - Extract and return page image
  - Extract, translate and return formatted text
- [ ] Implement caching system for translated pages
- [ ] Add error handling and validation
- [ ] Create API documentation with Swagger/OpenAPI

#### 1.5. Testing
- [ ] Write unit tests for translation module
- [ ] Write unit tests for PDF processing
- [ ] Create integration tests for API endpoints
- [ ] Implement performance tests and optimizations

### 2. Frontend Development

#### 2.1. Setup and Structure
- [ ] Initialize Next.js project in /frontend
- [ ] Configure Tailwind CSS and dark mode
- [ ] Create basic layout components
- [ ] Setup state management solution

#### 2.2. PDF Viewer (Left Panel)
- [ ] Create `<PdfViewer />` component
  - Implement page rendering
  - Add zoom controls
- [ ] Add navigation controls (next/previous page)
- [ ] Create loading states and error handling
- [ ] Implement page tracking to trigger translations

#### 2.3. Translation Panel (Right Panel)
- [ ] Create `<TranslatedText />` component
  - Display translated text with preserved formatting
  - Implement syntax highlighting if needed
- [ ] Add loading indicators during translation
- [ ] Create error states for failed translations

#### 2.4. Application State Management
- [ ] Implement React Context or state manager
  - Track current page
  - Manage translation cache
  - Handle document state
- [ ] Create effect hooks to trigger translation on page change
- [ ] Implement optimistic UI updates

#### 2.5. UI/UX Refinement
- [ ] Design responsive layout
  - 50/50 split on desktop
  - Tab-based navigation on mobile
- [ ] Implement dark/light mode
- [ ] Add accessibility features
- [ ] Create proper loading/error states
- [ ] Polish typography and spacing

### 3. Testing and Deployment

#### 3.1. Backend Testing and Deployment
- [ ] Complete unit and integration tests
- [ ] Set up CI pipeline with GitHub Actions
- [ ] Prepare deployment configurations
- [ ] Deploy to selected platform (Heroku/AWS/DigitalOcean)

#### 3.2. Frontend Testing and Deployment
- [ ] Write component and integration tests
- [ ] Set up CI pipeline
- [ ] Optimize build for production
- [ ] Deploy to Vercel/Netlify

#### 3.3. Integration and E2E Testing
- [ ] Create end-to-end tests
- [ ] Perform cross-browser testing
- [ ] Test on various devices and screen sizes

## 📝 Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/TypeScript
- Write tests for all new features
- Document code with docstrings and comments
- Use Git flow for branch management

## 🚀 Getting Started

### Prerequisites
- Python 3.8+ installed
- Node.js 14+ installed
- npm or yarn package manager
- Internet connection for translation API

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On Unix/MacOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python run.py
# or alternatively (Recommended):
uvicorn main:app --reload --port 8000
```

The backend API will be available at http://localhost:8000

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or if you're using yarn:
# yarn install

# Start the development server
npm run dev
# or with yarn:
# yarn dev
```

The frontend application will be available at http://localhost:3000

### Running Both at Once
You can run both the backend and frontend in separate terminal windows using the commands above.

For Windows PowerShell users, you can use this command to run both:
```powershell
Start-Process powershell -ArgumentList "cd $PWD/backend; python run.py" -NoNewWindow; cd frontend; npm run dev
```

For Windows Command Prompt or Unix-like systems, open two terminal windows and run the backend and frontend separately.

### Test Your Installation
1. Open your browser and navigate to http://localhost:3000
2. Upload a PDF file using the upload interface
3. The document should appear with the original PDF on the left and the translated text on the right
4. Use navigation buttons to move through pages and change languages

## 📘 Usage Guide

### Upload a PDF
1. On the home page, click on the upload area or drag and drop a PDF file
2. Wait for the upload to complete and processing to finish

### Navigate Through Pages
- Use the navigation buttons (◀ ▶) to move between pages
- Click on the first (⟪) or last (⟫) page buttons to jump to the beginning or end
- Enter a specific page number in the input field and press Enter
- Use keyboard shortcuts (see below)

### Change Translation Language
1. Click on the language button at the top of the control bar
2. Select your desired target language from the dropdown menu
3. The current page will be automatically re-translated to the new language

### Mobile Usage
- On mobile devices, use the tabs at the top to switch between the original PDF view and the translated text
- All other features work the same as on desktop

### Keyboard Shortcuts
- `→` or `Page Down`: Next page
- `←` or `Page Up`: Previous page
- `Home`: Jump to first page
- `End`: Jump to last page
- `Ctrl + 1-9`: Jump to a percentage of the document (e.g., Ctrl+5 jumps to the middle)

### Troubleshooting
- If you encounter CORS issues, ensure the backend is running on port 8000
- If translations fail, check your internet connection as the app uses Google Translate
- Make sure you have the latest dependencies installed
- For PDF rendering issues, try with a different PDF file as some complex layouts might not render correctly

## 📊 Performance Considerations
- The application uses caching for translated pages to avoid redundant API calls
- PDF pages are only loaded when needed to improve performance
- Translation requests are rate-limited to avoid API blocking
- Image rendering is optimized for most common PDF formats
