# Frontend Development Documentation

This document provides technical details about the MoziTranslate frontend implementation.

## Architecture Overview

The frontend is built with Next.js and uses React hooks for state management. The UI is designed with a responsive split-screen layout that works on both desktop and mobile devices.

### Key Components

#### PDF Viewer Component
The PDF viewer displays the original PDF page as an image. It includes navigation controls and maintains the current page state.

#### Translation Panel Component
The translation panel displays the translated text with preserved formatting from the original PDF.

#### Application State
React Context API is used to manage:
- Current document state
- Current page number
- Translation cache
- Loading states

## Responsive Design

The application uses a responsive layout:
- Desktop: 50/50 split between PDF viewer and translation panel
- Tablet: 40/60 split favoring the translation panel
- Mobile: Tab-based navigation between PDF viewer and translation panel

## State Management

The application state is managed using React Context with hooks:

```typescript
interface AppState {
  currentDocId: string | null;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  translationCache: Record<string, TranslatedPage>;
}

interface TranslatedPage {
  pageImage: string;  // base64
  originalText: string;
  translatedText: string;
}
```

## API Integration

The frontend communicates with the backend API using custom hooks:

```typescript
// Example usage
const { uploadPdf, isUploading } = useDocumentUpload();
const { 
  pageData, 
  isLoading, 
  navigateToPage 
} = usePageNavigation(docId);
```

## UI Components Hierarchy

```
<Layout>
  <Header />
  <SplitScreen>
    <PdfViewer 
      pageImage={pageData.pageImage}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={navigateToPage}
    />
    <TranslatedText
      originalText={pageData.originalText}
      translatedText={pageData.translatedText}
      isLoading={isLoading}
    />
  </SplitScreen>
  <Footer />
</Layout>
```
