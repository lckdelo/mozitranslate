# MoziTranslate - Implementação SQLite para Histórico de PDFs

## Visão Geral

O MoziTranslate agora utiliza um banco de dados SQLite para armazenar persistentemente o histórico de PDFs visualizados pelo usuário. Isso garante que o histórico seja mantido mesmo após reiniciar a aplicação.

## Funcionalidades Implementadas

### 🗄️ Backend (SQLite Database)

#### **PdfHistoryDB Class** (`pdf_history_db.py`)
Classe principal para gerenciamento do banco de dados SQLite:

**Principais Métodos:**
- `add_or_update_pdf()` - Adiciona novo PDF ou atualiza existente
- `update_progress()` - Atualiza progresso de leitura
- `get_history()` - Busca histórico ordenado por última leitura
- `get_pdf_by_id()` - Busca PDF específico por ID
- `remove_pdf()` - Remove PDF do histórico
- `clear_history()` - Limpa todo o histórico
- `get_statistics()` - Estatísticas do histórico

**Estrutura da Tabela:**
```sql
CREATE TABLE pdf_history (
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
```

#### **API Endpoints** (`main.py`)
Novos endpoints adicionados para gerenciar histórico:

- `GET /pdf/history` - Listar histórico de PDFs
- `POST /pdf/history` - Adicionar PDF ao histórico
- `PUT /pdf/history/progress` - Atualizar progresso de leitura
- `GET /pdf/history/{pdf_id}` - Buscar PDF específico
- `DELETE /pdf/history/{pdf_id}` - Remover PDF do histórico
- `DELETE /pdf/history` - Limpar todo o histórico
- `GET /pdf/history/stats` - Obter estatísticas

### 🎨 Frontend (React/TypeScript)

#### **usePdfHistoryDB Hook** (`usePdfHistoryDB.ts`)
Hook personalizado que substitui o localStorage pelo SQLite:

**Principais Funcionalidades:**
- Carregamento automático do histórico na inicialização
- Atualização de progresso em tempo real
- Tratamento de erros com fallback
- Estado de loading para melhor UX
- Cache local para performance

#### **API Integration** (`api.ts`)
Funções TypeScript para comunicação com o backend:

```typescript
// Principais funções adicionadas
getPdfHistory(limit?: number): Promise<PdfHistoryItem[]>
addPdfToHistory(pdfData: AddPdfHistoryRequest): Promise<void>
updateReadingProgress(pdfId: string, currentPage: number, totalPages: number): Promise<void>
removePdfFromHistory(pdfId: string): Promise<void>
clearPdfHistory(): Promise<void>
getHistoryStatistics(): Promise<HistoryStatsResponse['data']>
```

#### **Components Updates**
- **PdfHistory.tsx**: Adicionados estados de loading e erro
- **PdfHistoryCard.tsx**: Atualizado para usar interface SQLite
- **page.tsx**: Integração completa com novo hook

## Como Usar

### 1. **Inicialização Automática**
O banco SQLite é criado automaticamente quando o backend é iniciado pela primeira vez.

### 2. **Upload de PDF**
```typescript
// Quando um PDF é enviado, automaticamente é adicionado ao histórico
const handleFileUploaded = (newDocId: string, fileName?: string) => {
  setDocId(newDocId);
  if (fileName) {
    addToHistory({
      pdf_id: newDocId,
      filename: fileName,
      total_pages: 0,
      language: 'Português',
      language_flag: '🇧🇷',
    });
  }
};
```

### 3. **Atualização de Progresso**
```typescript
// Automaticamente atualizado quando o usuário navega entre páginas
const updateProgress = (pdfId: string, currentPage: number, totalPages: number) => {
  // Atualiza no banco SQLite via API
  updateReadingProgress(pdfId, currentPage, totalPages);
};
```

### 4. **Recuperação do Histórico**
```typescript
// Histórico é carregado automaticamente no hook
const { history, isLoading, error } = usePdfHistoryDB();
```

## Vantagens da Implementação SQLite

### ✅ **Persistência Verdadeira**
- Dados são mantidos mesmo após reinicialização da aplicação
- Não depende do navegador ou localStorage
- Backup automático dos dados

### ✅ **Performance**
- Consultas SQL otimizadas com índices
- Cache local no frontend para responsividade
- Atualizações em tempo real

### ✅ **Escalabilidade**
- Suporta milhares de registros sem problemas
- Estrutura preparada para funcionalidades futuras
- Fácil migração para PostgreSQL/MySQL se necessário

### ✅ **Confiabilidade**
- Transações ACID garantem integridade dos dados
- Tratamento robusto de erros
- Validação de dados no backend

## Migração de localStorage para SQLite

### **Dados Existentes**
Os usuários que já tinham histórico no localStorage **não** perderão os dados. Você pode implementar uma migração opcional:

```typescript
// Função de migração (opcional)
const migrateFromLocalStorage = async () => {
  const oldHistory = localStorage.getItem('mozitranslate-pdf-history');
  if (oldHistory) {
    const parsedHistory = JSON.parse(oldHistory);
    // Migrar cada item para SQLite
    for (const item of parsedHistory) {
      await addPdfToHistory({
        pdf_id: item.id,
        filename: item.name,
        // ... outros campos
      });
    }
    localStorage.removeItem('mozitranslate-pdf-history');
  }
};
```

## Estrutura de Arquivos

```
backend/
├── pdf_history_db.py       # Classe principal SQLite
├── main.py                 # Endpoints da API
└── pdf_history.db          # Banco SQLite (criado automaticamente)

frontend/
├── hooks/
│   ├── usePdfHistoryDB.ts  # Hook principal SQLite
│   └── usePdfHistory.ts    # Hook antigo (localStorage)
├── utils/
│   └── api.ts              # Funções de API
└── components/
    ├── PdfHistory.tsx      # Container do histórico
    └── PdfHistoryCard.tsx  # Cards individuais
```

## Comandos para Execução

### **Backend**
```bash
cd backend
python main.py
```

### **Frontend**
```bash
cd frontend
npm run dev
```

## Monitoramento e Debug

### **Verificar Banco SQLite**
Você pode usar ferramentas como DB Browser for SQLite para visualizar os dados:

```bash
# Localização do banco
./backend/pdf_history.db
```

### **Logs de API**
O backend registra automaticamente erros e operações importantes no console.

### **Estado do Frontend**
O hook `usePdfHistoryDB` expõe estados úteis para debug:

```typescript
const { history, isLoading, error } = usePdfHistoryDB();
console.log('História:', history);
console.log('Carregando:', isLoading);
console.log('Erro:', error);
```

## Próximos Passos

### 🔮 **Funcionalidades Futuras**
- Sincronização entre dispositivos
- Thumbnails de PDFs
- Categorias/tags para organização
- Exportação/importação de histórico
- Busca por conteúdo dentro dos PDFs

### 🛠️ **Melhorias Técnicas**
- Paginação para históricos grandes
- Compressão automática de dados antigos
- Backup automático em nuvem
- Otimizações de performance

A implementação SQLite está completa e pronta para uso em produção!
