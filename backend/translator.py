"""
MoziTranslate - PDF translation module
Uses the unofficial Google Translate API to translate text
"""
import urllib.request
import urllib.parse
import json
import time
from typing import Dict, List, Optional

class TranslationError(Exception):
    """Exception raised for errors in the translation process."""
    pass

def translate(text: str, source_lang: str = "auto", target_lang: str = "en") -> str:
    """
    Translates a single text using the unofficial Google Translate API.
    
    Args:
        text: String to translate
        source_lang: Source language code (e.g. 'en', 'pt', 'auto' for auto-detect)
        target_lang: Target language code (e.g. 'en', 'pt')
        
    Returns:
        Translated text
        
    Raises:
        TranslationError: If translation fails
    """
    if not text.strip():
        return ""
        
    # Prepare the request
    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        "client": "gtx",
        "sl": source_lang,
        "tl": target_lang,
        "dt": "t",
        "q": text
    }
    
    url = f"{url}?{urllib.parse.urlencode(params)}"
    
    try:
        # Create request with a user agent to avoid blocks
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        )
        
        # Make the request
        with urllib.request.urlopen(request, timeout=5) as response:
            response_data = response.read().decode("utf-8")
            data = json.loads(response_data)
        
        # Process response
        if not data or not isinstance(data, list) or len(data) < 1:
            raise TranslationError("Invalid response format from translation API")
            
        # Extract translated segments and join them
        translated_segments = [segment[0] for segment in data[0] if segment and len(segment) > 0]
        return "".join(translated_segments)
        
    except urllib.error.URLError as e:
        raise TranslationError(f"Network error during translation: {str(e)}")
    except json.JSONDecodeError:
        raise TranslationError("Failed to parse translation API response")
    except Exception as e:
        raise TranslationError(f"Unexpected error during translation: {str(e)}")

def translate_long_text(text: str, source_lang: str = "auto", target_lang: str = "en", 
                        max_chunk_size: int = 1000, delay_seconds: float = 0.5) -> str:
    """
    Translates a long text by breaking it into smaller chunks.
    
    Args:
        text: Long text to translate
        source_lang: Source language code
        target_lang: Target language code
        max_chunk_size: Maximum characters per chunk
        delay_seconds: Delay between API requests to avoid rate limiting
        
    Returns:
        Complete translated text
    """
    if not text.strip():
        return ""
    
    # Simple chunking by sentences to avoid cutting in the middle of sentences
    chunks = []
    current_chunk = ""
    
    # Split by common sentence terminators, preserving the terminators
    sentences = []
    current_sentence = ""
    
    for char in text:
        current_sentence += char
        if char in ['.', '!', '?', '\n']:
            sentences.append(current_sentence)
            current_sentence = ""
    
    # Add any remaining text as the last sentence
    if current_sentence:
        sentences.append(current_sentence)
    
    # Group sentences into chunks that don't exceed max_chunk_size
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_chunk_size:
            current_chunk += sentence
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = sentence
    
    # Add the last chunk if there is one
    if current_chunk:
        chunks.append(current_chunk)
    
    # Translate each chunk with delays between requests
    translated_chunks = []
    for i, chunk in enumerate(chunks):
        translated_chunks.append(translate(chunk, source_lang, target_lang))
        
        # Add delay between requests to avoid rate limiting, except after the last chunk
        if i < len(chunks) - 1:
            time.sleep(delay_seconds)
    
    # Join translated chunks
    return "".join(translated_chunks)

# Simple in-memory cache for translations
_translation_cache: Dict[str, Dict[str, str]] = {}

def get_cached_translation(text: str, source_lang: str, target_lang: str) -> Optional[str]:
    """Gets a cached translation if available."""
    cache_key = f"{source_lang}|{target_lang}"
    if cache_key in _translation_cache and text in _translation_cache[cache_key]:
        return _translation_cache[cache_key][text]
    return None

def cache_translation(text: str, source_lang: str, target_lang: str, translated_text: str) -> None:
    """Caches a translation result."""
    cache_key = f"{source_lang}|{target_lang}"
    if cache_key not in _translation_cache:
        _translation_cache[cache_key] = {}
    _translation_cache[cache_key][text] = translated_text

def translate_with_cache(text: str, source_lang: str = "auto", target_lang: str = "en") -> str:
    """Translates text with caching for efficiency."""
    # Check cache first
    cached = get_cached_translation(text, source_lang, target_lang)
    if cached:
        return cached
    
    # If not in cache, translate and then cache
    result = translate_long_text(text, source_lang, target_lang)
    cache_translation(text, source_lang, target_lang, result)
    return result
