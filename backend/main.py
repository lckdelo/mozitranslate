"""
MoziTranslate - Main FastAPI application
Provides API endpoints for PDF upload, page rendering and translation
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import traceback
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
    PDFProcessingError,
    open_pdf
)
from pdf_history_db import pdf_history_db

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

class PdfHistoryItem(BaseModel):
    pdf_id: str
    filename: str
    file_path: Optional[str] = None
    last_page: int = 1
    total_pages: int = 0
    progress: float = 0.0
    language: str = "Português"
    language_flag: str = "🇧🇷"
    upload_date: str
    last_read_date: str
    thumbnail_path: Optional[str] = None

class ProgressUpdateRequest(BaseModel):
    pdf_id: str
    current_page: int
    total_pages: int

class AddPdfHistoryRequest(BaseModel):
    pdf_id: str
    filename: str
    file_path: Optional[str] = None
    last_page: int = 1
    total_pages: int = 0
    progress: float = 0.0
    language: str = "Português"
    language_flag: str = "🇧🇷"
    upload_date: Optional[str] = None
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
        doc_id, file_path = save_uploaded_pdf(contents)
        
        # Get page count
        page_count = get_page_count(doc_id)
        
        # Save to history with file path
        pdf_data = {
            'pdf_id': doc_id,
            'filename': file.filename,
            'file_path': file_path,
            'total_pages': page_count,
            'last_page': 1,
            'progress': 0.0
        }
        pdf_history_db.add_or_update_pdf(pdf_data)
        
        return UploadResponse(
            doc_id=doc_id,
            page_count=page_count,
            filename=file.filename
        )
    except PDFProcessingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

@app.post("/pdf/reopen/{pdf_id}", response_model=UploadResponse)
async def reopen_pdf_from_history(pdf_id: str):
    """
    Reopen a PDF from history using its stored file path
    """
    try:
        # Get PDF data from history
        pdf_data = pdf_history_db.get_pdf_by_id(pdf_id)
        
        if not pdf_data:
            raise HTTPException(status_code=404, detail="PDF not found in history")
        
        file_path = pdf_data.get('file_path')
        if not file_path:
            raise HTTPException(status_code=400, detail="File path not found in history")
        
        # Check if file still exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="PDF file no longer exists at the stored location")
        
        # Open the PDF using the stored file path
        new_doc_id, _ = open_pdf(file_path)
        
        # Get page count
        page_count = get_page_count(new_doc_id)
        
        return UploadResponse(
            doc_id=new_doc_id,
            page_count=page_count,
            filename=pdf_data['filename']
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reopen PDF: {str(e)}")

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
        
        # Render page to image - Try multiple times if necessary
        max_attempts = 3
        page_image = None
        last_error = None
        
        for attempt in range(max_attempts):
            try:
                page_image = render_page_to_image(doc_id, page_number)
                break  # If successful, exit the loop
            except Exception as e:
                last_error = str(e)
                # Wait a bit before retrying
                import time
                time.sleep(0.5)
                
        if page_image is None:
            raise PDFProcessingError(f"Failed to render page after {max_attempts} attempts: {last_error}")
            
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
        # Log the full exception for debugging
        print(f"Error processing page {page_number}:")
        traceback.print_exc()
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

# PDF History Endpoints

@app.get("/pdf/history")
async def get_pdf_history(limit: int = 10):
    """
    Get PDF history ordered by last read date
    """
    try:
        history = pdf_history_db.get_history(limit=limit)
        return {"status": "success", "data": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

@app.post("/pdf/history")
async def add_pdf_to_history(request: AddPdfHistoryRequest):
    """
    Add or update a PDF in history
    """
    try:
        pdf_data = request.dict()
        success = pdf_history_db.add_or_update_pdf(pdf_data)
        
        if success:
            return {"status": "success", "message": "PDF added to history"}
        else:
            raise HTTPException(status_code=500, detail="Failed to add PDF to history")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add PDF to history: {str(e)}")

@app.put("/pdf/history/progress")
async def update_reading_progress(request: ProgressUpdateRequest):
    """
    Update reading progress for a specific PDF
    """
    try:
        success = pdf_history_db.update_progress(
            pdf_id=request.pdf_id,
            current_page=request.current_page,
            total_pages=request.total_pages
        )
        
        if success:
            return {"status": "success", "message": "Progress updated"}
        else:
            raise HTTPException(status_code=404, detail="PDF not found in history")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")

@app.get("/pdf/history/{pdf_id}")
async def get_pdf_from_history(pdf_id: str):
    """
    Get specific PDF from history by ID
    """
    try:
        pdf_data = pdf_history_db.get_pdf_by_id(pdf_id)
        
        if pdf_data:
            return {"status": "success", "data": pdf_data}
        else:
            raise HTTPException(status_code=404, detail="PDF not found in history")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get PDF from history: {str(e)}")

@app.delete("/pdf/history/{pdf_id}")
async def remove_pdf_from_history(pdf_id: str):
    """
    Remove PDF from history
    """
    try:
        success = pdf_history_db.remove_pdf(pdf_id)
        
        if success:
            return {"status": "success", "message": "PDF removed from history"}
        else:
            raise HTTPException(status_code=404, detail="PDF not found in history")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove PDF from history: {str(e)}")

@app.delete("/pdf/history")
async def clear_pdf_history():
    """
    Clear all PDF history
    """
    try:
        success = pdf_history_db.clear_history()
        
        if success:
            return {"status": "success", "message": "History cleared"}
        else:
            raise HTTPException(status_code=500, detail="Failed to clear history")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear history: {str(e)}")

@app.get("/pdf/history/stats")
async def get_history_statistics():
    """
    Get history statistics
    """
    try:
        stats = pdf_history_db.get_statistics()
        return {"status": "success", "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
