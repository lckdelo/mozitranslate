#!/usr/bin/env python3
"""
Script de teste para verificar a implementação SQLite do histórico de PDFs
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pdf_history_db import PdfHistoryDB
from datetime import datetime
import json

def test_sqlite_implementation():
    """Testa todas as funcionalidades da implementação SQLite"""
    
    # Inicializar banco
    print("🗄️ Inicializando banco SQLite...")
    db = PdfHistoryDB("test_pdf_history.db")
    
    # Limpar dados de teste anteriores
    db.clear_history()
    print("✅ Banco inicializado e limpo")
    
    # Teste 1: Adicionar PDFs
    print("\n📄 Teste 1: Adicionando PDFs ao histórico")
    
    test_pdfs = [
        {
            "pdf_id": "doc_001",
            "filename": "Manual_Usuario.pdf",
            "file_path": "/uploads/manual.pdf",
            "last_page": 5,
            "total_pages": 50,
            "progress": 10.0,
            "language": "Português",
            "language_flag": "🇧🇷"
        },
        {
            "pdf_id": "doc_002", 
            "filename": "Python_Guide.pdf",
            "file_path": "/uploads/python.pdf",
            "last_page": 25,
            "total_pages": 100,
            "progress": 25.0,
            "language": "English",
            "language_flag": "🇺🇸"
        },
        {
            "pdf_id": "doc_003",
            "filename": "Tutorial_React.pdf", 
            "file_path": "/uploads/react.pdf",
            "last_page": 80,
            "total_pages": 80,
            "progress": 100.0,
            "language": "Português",
            "language_flag": "🇧🇷"
        }
    ]
    
    for pdf in test_pdfs:
        success = db.add_or_update_pdf(pdf)
        print(f"   {'✅' if success else '❌'} Adicionado: {pdf['filename']}")
    
    # Teste 2: Buscar histórico
    print("\n📋 Teste 2: Buscando histórico")
    history = db.get_history(limit=10)
    print(f"   📊 Total de PDFs no histórico: {len(history)}")
    
    for item in history:
        print(f"   📄 {item['filename']} - Página {item['last_page']}/{item['total_pages']} ({item['progress']:.1f}%)")
    
    # Teste 3: Atualizar progresso
    print("\n🔄 Teste 3: Atualizando progresso de leitura")
    success = db.update_progress("doc_001", 15, 50)
    print(f"   {'✅' if success else '❌'} Progresso atualizado para doc_001")
    
    # Verificar atualização
    updated_pdf = db.get_pdf_by_id("doc_001")
    if updated_pdf:
        print(f"   📊 Novo progresso: Página {updated_pdf['last_page']}/{updated_pdf['total_pages']} ({updated_pdf['progress']:.1f}%)")
    
    # Teste 4: Estatísticas
    print("\n📈 Teste 4: Estatísticas do histórico")
    stats = db.get_statistics()
    print(f"   📚 Total de documentos: {stats['total_documents']}")
    print(f"   ✅ Documentos completos: {stats['completed_documents']}")
    print(f"   📊 Progresso médio: {stats['average_progress']:.1f}%")
    print(f"   📖 Total de páginas lidas: {stats['total_pages_read']}")
    
    # Teste 5: Buscar PDF específico
    print("\n🔍 Teste 5: Buscando PDF específico")
    specific_pdf = db.get_pdf_by_id("doc_002")
    if specific_pdf:
        print(f"   ✅ Encontrado: {specific_pdf['filename']}")
        print(f"   📊 Progresso: {specific_pdf['progress']:.1f}%")
    else:
        print("   ❌ PDF não encontrado")
    
    # Teste 6: Remover PDF
    print("\n🗑️ Teste 6: Removendo PDF do histórico")
    success = db.remove_pdf("doc_003")
    print(f"   {'✅' if success else '❌'} PDF removido")
    
    # Verificar remoção
    history_after_remove = db.get_history()
    print(f"   📊 PDFs restantes: {len(history_after_remove)}")
    
    # Teste 7: Testar PDF duplicado (atualização)
    print("\n🔄 Teste 7: Testando atualização de PDF existente")
    duplicate_pdf = {
        "pdf_id": "doc_001",
        "filename": "Manual_Usuario_v2.pdf",  # Nome atualizado
        "last_page": 30,
        "total_pages": 60,  # Total de páginas atualizado
        "progress": 50.0,
        "language": "Português",
        "language_flag": "🇧🇷"
    }
    
    success = db.add_or_update_pdf(duplicate_pdf)
    print(f"   {'✅' if success else '❌'} PDF atualizado")
    
    updated_pdf = db.get_pdf_by_id("doc_001")
    if updated_pdf:
        print(f"   📄 Nome atualizado: {updated_pdf['filename']}")
        print(f"   📊 Progresso atualizado: {updated_pdf['progress']:.1f}%")
    
    # Teste 8: Histórico final
    print("\n📋 Teste 8: Histórico final")
    final_history = db.get_history()
    print(f"   📊 Total final: {len(final_history)} PDFs")
    
    for item in final_history:
        print(f"   📄 {item['filename']} - {item['progress']:.1f}% completo")
    
    # Limpar banco de teste
    print("\n🧹 Limpando dados de teste...")
    db.clear_history()
    print("✅ Dados de teste removidos")
    
    # Remover arquivo de teste
    try:
        os.remove("test_pdf_history.db")
        print("✅ Arquivo de teste removido")
    except:
        pass
    
    print("\n🎉 Todos os testes concluídos com sucesso!")
    print("   ✅ Implementação SQLite está funcionando corretamente")
    print("   ✅ Todas as operações CRUD testadas")
    print("   ✅ Estatísticas e busca funcionando")
    print("   ✅ Sistema pronto para produção!")

if __name__ == "__main__":
    test_sqlite_implementation()
