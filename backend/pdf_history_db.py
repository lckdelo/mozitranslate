import sqlite3
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

class PdfHistoryDB:
    def __init__(self, db_path: str = "pdf_history.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the SQLite database with the pdf_history table"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS pdf_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pdf_id TEXT UNIQUE NOT NULL,
                    filename TEXT NOT NULL,
                    file_path TEXT,
                    last_page INTEGER DEFAULT 1,
                    total_pages INTEGER DEFAULT 0,
                    progress REAL DEFAULT 0.0,
                    language TEXT DEFAULT 'Português',
                    language_flag TEXT DEFAULT '🇧🇷',
                    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_read_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    thumbnail_path TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create index for better performance
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_pdf_id ON pdf_history(pdf_id)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_last_read_date ON pdf_history(last_read_date DESC)
            ''')
            
            conn.commit()
    
    def add_or_update_pdf(self, pdf_data: Dict[str, Any]) -> bool:
        """Add a new PDF or update existing one in history"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                now = datetime.now().isoformat()
                
                # Check if PDF already exists
                cursor.execute('SELECT id FROM pdf_history WHERE pdf_id = ?', (pdf_data['pdf_id'],))
                existing = cursor.fetchone()
                
                if existing:
                    # Update existing record
                    cursor.execute('''
                        UPDATE pdf_history 
                        SET filename = ?, last_page = ?, total_pages = ?, 
                            progress = ?, language = ?, language_flag = ?,
                            last_read_date = ?, updated_at = ?
                        WHERE pdf_id = ?
                    ''', (
                        pdf_data['filename'],
                        pdf_data.get('last_page', 1),
                        pdf_data.get('total_pages', 0),
                        pdf_data.get('progress', 0.0),
                        pdf_data.get('language', 'Português'),
                        pdf_data.get('language_flag', '🇧🇷'),
                        now,
                        now,
                        pdf_data['pdf_id']
                    ))
                else:
                    # Insert new record
                    cursor.execute('''
                        INSERT INTO pdf_history 
                        (pdf_id, filename, file_path, last_page, total_pages, 
                         progress, language, language_flag, upload_date, last_read_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        pdf_data['pdf_id'],
                        pdf_data['filename'],
                        pdf_data.get('file_path', ''),
                        pdf_data.get('last_page', 1),
                        pdf_data.get('total_pages', 0),
                        pdf_data.get('progress', 0.0),
                        pdf_data.get('language', 'Português'),
                        pdf_data.get('language_flag', '🇧🇷'),
                        pdf_data.get('upload_date', now),
                        now
                    ))
                
                conn.commit()
                return True
        except Exception as e:
            print(f"Error adding/updating PDF history: {e}")
            return False
    
    def update_progress(self, pdf_id: str, current_page: int, total_pages: int) -> bool:
        """Update reading progress for a specific PDF"""
        try:
            progress = round((current_page / total_pages) * 100, 1) if total_pages > 0 else 0
            now = datetime.now().isoformat()
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE pdf_history 
                    SET last_page = ?, total_pages = ?, progress = ?, 
                        last_read_date = ?, updated_at = ?
                    WHERE pdf_id = ?
                ''', (current_page, total_pages, progress, now, now, pdf_id))
                
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating progress: {e}")
            return False
    
    def get_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get PDF history ordered by last read date"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT pdf_id, filename, file_path, last_page, total_pages, 
                           progress, language, language_flag, upload_date, 
                           last_read_date, thumbnail_path
                    FROM pdf_history 
                    ORDER BY last_read_date DESC 
                    LIMIT ?
                ''', (limit,))
                
                rows = cursor.fetchall()
                columns = ['pdf_id', 'filename', 'file_path', 'last_page', 'total_pages', 
                          'progress', 'language', 'language_flag', 'upload_date', 
                          'last_read_date', 'thumbnail_path']
                
                return [dict(zip(columns, row)) for row in rows]
        except Exception as e:
            print(f"Error getting history: {e}")
            return []
    
    def get_pdf_by_id(self, pdf_id: str) -> Optional[Dict[str, Any]]:
        """Get specific PDF from history by ID"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT pdf_id, filename, file_path, last_page, total_pages, 
                           progress, language, language_flag, upload_date, 
                           last_read_date, thumbnail_path
                    FROM pdf_history 
                    WHERE pdf_id = ?
                ''', (pdf_id,))
                
                row = cursor.fetchone()
                if row:
                    columns = ['pdf_id', 'filename', 'file_path', 'last_page', 'total_pages', 
                              'progress', 'language', 'language_flag', 'upload_date', 
                              'last_read_date', 'thumbnail_path']
                    return dict(zip(columns, row))
                return None
        except Exception as e:
            print(f"Error getting PDF by ID: {e}")
            return None
    
    def remove_pdf(self, pdf_id: str) -> bool:
        """Remove PDF from history"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM pdf_history WHERE pdf_id = ?', (pdf_id,))
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error removing PDF: {e}")
            return False
    
    def clear_history(self) -> bool:
        """Clear all PDF history"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM pdf_history')
                conn.commit()
                return True
        except Exception as e:
            print(f"Error clearing history: {e}")
            return False
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get history statistics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Total documents
                cursor.execute('SELECT COUNT(*) FROM pdf_history')
                total_docs = cursor.fetchone()[0]
                
                # Completed documents (progress >= 100)
                cursor.execute('SELECT COUNT(*) FROM pdf_history WHERE progress >= 100')
                completed_docs = cursor.fetchone()[0]
                
                # Average progress
                cursor.execute('SELECT AVG(progress) FROM pdf_history')
                avg_progress = cursor.fetchone()[0] or 0
                
                # Total pages read
                cursor.execute('SELECT SUM(last_page) FROM pdf_history')
                total_pages = cursor.fetchone()[0] or 0
                
                return {
                    'total_documents': total_docs,
                    'completed_documents': completed_docs,
                    'average_progress': round(avg_progress, 1),
                    'total_pages_read': total_pages
                }
        except Exception as e:
            print(f"Error getting statistics: {e}")
            return {
                'total_documents': 0,
                'completed_documents': 0,
                'average_progress': 0,
                'total_pages_read': 0
            }

# Initialize global database instance
pdf_history_db = PdfHistoryDB()
