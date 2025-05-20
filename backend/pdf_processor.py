"""
MoziTranslate - PDF processing module
Uses PyMuPDF (fitz) to extract text and render PDF pages
"""
import os
import fitz  # PyMuPDF
import base64
import tempfile
from typing import Dict, List, Optional, Tuple, Any
from uuid import uuid4

# Store open documents with their IDs for reuse
_open_documents: Dict[str, Tuple[fitz.Document, str]] = {}

class PDFProcessingError(Exception):
    """Exception raised for errors in PDF processing."""
    pass

def open_pdf(file_path: str) -> Tuple[str, fitz.Document]:
    """
    Opens a PDF file and returns a document ID and the document object.
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Tuple of (doc_id, document)
        
    Raises:
        PDFProcessingError: If the file cannot be opened or is not a valid PDF
    """
    try:
        document = fitz.open(file_path)
        if document.is_pdf:
            # Generate a unique ID for this document
            doc_id = str(uuid4())
            # Store the document for future reference
            _open_documents[doc_id] = (document, file_path)
            return doc_id, document
        else:
            document.close()
            raise PDFProcessingError("The file is not a valid PDF")
    except Exception as e:
        raise PDFProcessingError(f"Failed to open PDF file: {str(e)}")

def get_document(doc_id: str) -> fitz.Document:
    """
    Retrieves a previously opened document by its ID.
    
    Args:
        doc_id: Document ID returned from open_pdf
        
    Returns:
        The document object
        
    Raises:
        PDFProcessingError: If the document ID is not found
    """
    if doc_id in _open_documents:
        return _open_documents[doc_id][0]
    raise PDFProcessingError(f"Document with ID {doc_id} not found")

def close_document(doc_id: str) -> None:
    """
    Closes a previously opened document and removes it from memory.
    
    Args:
        doc_id: Document ID to close
        
    Raises:
        PDFProcessingError: If the document ID is not found
    """
    if doc_id in _open_documents:
        document, _ = _open_documents[doc_id]
        document.close()
        del _open_documents[doc_id]
    else:
        raise PDFProcessingError(f"Document with ID {doc_id} not found")

def save_uploaded_pdf(file_content: bytes) -> Tuple[str, str]:
    """
    Saves an uploaded PDF to a temporary file and opens it.
    
    Args:
        file_content: PDF file bytes
        
    Returns:
        Tuple of (doc_id, file_path)
        
    Raises:
        PDFProcessingError: If the file cannot be saved or opened
    """
    try:
        # Create a temporary file
        temp_dir = tempfile.gettempdir()
        file_name = f"uploaded_pdf_{uuid4()}.pdf"
        file_path = os.path.join(temp_dir, file_name)
        
        # Write the file content
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Open the PDF and get its ID
        doc_id, _ = open_pdf(file_path)
        
        return doc_id, file_path
    except Exception as e:
        raise PDFProcessingError(f"Failed to save uploaded PDF: {str(e)}")

def get_page_count(doc_id: str) -> int:
    """
    Returns the number of pages in the document.
    
    Args:
        doc_id: Document ID
        
    Returns:
        Number of pages
        
    Raises:
        PDFProcessingError: If the document ID is not found
    """
    document = get_document(doc_id)
    return len(document)

def render_page_to_image(doc_id: str, page_number: int, zoom: float = 2.0) -> str:
    """
    Renders a PDF page as a base64-encoded PNG image.
    
    Args:
        doc_id: Document ID
        page_number: 1-based page number
        zoom: Zoom factor for rendering (higher values for better quality)
        
    Returns:
        Base64-encoded PNG image
        
    Raises:
        PDFProcessingError: If rendering fails or page number is invalid
    """
    try:
        document = get_document(doc_id)
        
        # Adjust for 0-based indexing
        page_idx = page_number - 1
        
        if page_idx < 0 or page_idx >= len(document):
            raise PDFProcessingError(f"Invalid page number {page_number}")
        
        page = document[page_idx]
        
        # Create a pixmap with higher resolution for better quality
        matrix = fitz.Matrix(zoom, zoom)
        pixmap = page.get_pixmap(matrix=matrix, alpha=False)
        
        # Convert to PNG and encode as base64
        png_bytes = pixmap.tobytes("png")
        base64_image = base64.b64encode(png_bytes).decode('utf-8')
        
        return base64_image
    except Exception as e:
        raise PDFProcessingError(f"Failed to render page {page_number}: {str(e)}")

def extract_text_from_page(doc_id: str, page_number: int) -> str:
    """
    Extracts text from a PDF page, preserving layout.
    
    Args:
        doc_id: Document ID
        page_number: 1-based page number
        
    Returns:
        Extracted text with layout preserved
        
    Raises:
        PDFProcessingError: If extraction fails or page number is invalid
    """
    try:
        document = get_document(doc_id)
        
        # Adjust for 0-based indexing
        page_idx = page_number - 1
        
        if page_idx < 0 or page_idx >= len(document):
            raise PDFProcessingError(f"Invalid page number {page_number}")
        
        page = document[page_idx]
        
        # Extract text with format data to better preserve layout
        text = page.get_text("text")
        return text
    except Exception as e:
        raise PDFProcessingError(f"Failed to extract text from page {page_number}: {str(e)}")

def extract_structured_text(doc_id: str, page_number: int) -> Dict[str, Any]:
    """
    Extracts structured text data from a PDF page.
    
    Args:
        doc_id: Document ID
        page_number: 1-based page number
        
    Returns:
        Dictionary with text blocks and their positions
        
    Raises:
        PDFProcessingError: If extraction fails or page number is invalid
    """
    try:
        document = get_document(doc_id)
        
        # Adjust for 0-based indexing
        page_idx = page_number - 1
        
        if page_idx < 0 or page_idx >= len(document):
            raise PDFProcessingError(f"Invalid page number {page_number}")
        
        page = document[page_idx]
        
        # Get text in dict format to preserve layout information
        dict_text = page.get_text("dict")
        return dict_text
    except Exception as e:
        raise PDFProcessingError(f"Failed to extract structured text from page {page_number}: {str(e)}")
