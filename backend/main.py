"""
MoziTranslate - Main FastAPI application
Provides API endpoints for PDF upload, page rendering and translation
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from typing import Dict, Optional

# Import local modules
from translator import translate_with_cache, TranslationError
from pdf_processor import (
    save_uploaded_pdf, 
    get_document, 
    render_page_to_image,
    extract_text_from_page,
    get_page_count,
    close_document,
    PDFProcessingError
)

app = FastAPI(
    title="MoziTranslate API",
    description="API for translating PDF pages in real-time",
    version="0.1.0"
)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for request/response
class UploadResponse(BaseModel):
    doc_id: str
    page_count: int
    filename: str

class PageResponse(BaseModel):
    page_image: str
    original_text: str
    translated_text: str
    page_number: int
    total_pages: int

# Cache for page translations
translation_cache: Dict[str, Dict[int, str]] = {}

@app.post("/pdf/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file and get a document ID for future reference
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        # Read file content
        contents = await file.read()
        
        # Save and process the PDF
        doc_id, _ = save_uploaded_pdf(contents)
        
        # Get page count
        page_count = get_page_count(doc_id)
        
        return UploadResponse(
            doc_id=doc_id,
            page_count=page_count,
            filename=file.filename
        )
    except PDFProcessingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@app.get("/pdf/{doc_id}/page/{page_number}", response_model=PageResponse)
async def get_page(
    doc_id: str, 
    page_number: int, 
    source_lang: str = "auto",
    target_lang: str = "en",
    background_tasks: BackgroundTasks = None
):
    """
    Get a specific page from a PDF with translation
    """
    try:
        # Validate page number
        total_pages = get_page_count(doc_id)
        if page_number < 1 or page_number > total_pages:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid page number. Must be between 1 and {total_pages}"
            )
        
        # Render page to image
        page_image = render_page_to_image(doc_id, page_number)
        
        # Extract text from page
        original_text = extract_text_from_page(doc_id, page_number)
        
        # Generate cache key for this translation
        cache_key = f"{doc_id}_{page_number}_{source_lang}_{target_lang}"
        
        # Check if translation is cached
        if doc_id in translation_cache and page_number in translation_cache[doc_id]:
            translated_text = translation_cache[doc_id][page_number]
        else:
            # Translate text
            try:
                translated_text = translate_with_cache(original_text, source_lang, target_lang)
                
                # Cache the translation
                if doc_id not in translation_cache:
                    translation_cache[doc_id] = {}
                translation_cache[doc_id][page_number] = translated_text
            except TranslationError as e:
                raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")
        
        return PageResponse(
            page_image=page_image,
            original_text=original_text,
            translated_text=translated_text,
            page_number=page_number,
            total_pages=total_pages
        )
    except PDFProcessingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process page: {str(e)}")

@app.delete("/pdf/{doc_id}")
async def close_pdf(doc_id: str):
    """
    Close a PDF document and free resources
    """
    try:
        close_document(doc_id)
        
        # Also remove from translation cache
        if doc_id in translation_cache:
            del translation_cache[doc_id]
            
        return {"status": "success", "message": "Document closed successfully"}
    except PDFProcessingError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to close document: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
