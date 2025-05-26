# MoziTranslate

MoziTranslate é uma aplicação que traduz páginas de PDF em tempo real enquanto você as lê. Ela possui uma interface dividida com o PDF original à esquerda e o texto traduzido à direita.

## 🌟 Funcionalidades Principais

- **Tradução em tempo real** de conteúdo PDF usando a API não oficial do Google Translate
- **Interface dividida**: visualização do PDF original e texto traduzido
- **Sistema de Histórico PDF**: Rastreamento automático de progresso de leitura com cartões visuais
- **Retomada de Leitura**: Continue de onde parou automaticamente
- **Tipografia Avançada**: Sistema de formatação inteligente com detecção de cabeçalhos e conteúdo especial
- Tradução sob demanda apenas da página atual
- Suporte a múltiplos idiomas com mais de 10 idiomas disponíveis
- Navegação por páginas com atalhos de teclado (setas, Home/End)
- Traduções em cache para melhorar o desempenho
- Formatação de texto e recuos preservados nas traduções
- Design responsivo para dispositivos desktop e móveis (muda para abas em dispositivos móveis)
- Suporte a modo claro/escuro baseado nas preferências do sistema

## 🛠️ Stack de Tecnologia

### Backend
- Python com FastAPI
- PyMuPDF (fitz) para processamento de PDF
- urllib/json nativo para requisições de tradução
- Uvicorn/Gunicorn como servidor ASGI

### Frontend
- Next.js com React
- TypeScript para segurança de tipos
- Tailwind CSS para estilização
- Hooks React personalizados para gerenciamento de estado
- Layout responsivo

## 📁 Estrutura do Projeto

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


## 📝 Diretrizes de Desenvolvimento
- Seguir PEP 8 para código Python
- Usar ESLint e Prettier para JavaScript/TypeScript
- Escrever testes para todas as novas funcionalidades
- Documentar código com docstrings e comentários
- Usar Git flow para gerenciamento de branches

## 🚀 Como Começar

Esta seção fornece instruções detalhadas para configurar o MoziTranslate após clonar o repositório do GitHub.

### Pré-requisitos
- Python 3.8+ instalado
- Node.js 14+ instalado
- Gerenciador de pacotes npm ou yarn
- Git
- Conexão com a internet para a API de tradução

### Passo 1: Clonar o Repositório
```bash
# Clonar o repositório
git clone https://github.com/lckdelo/mozitranslate.git

# Navegar para o diretório do projeto
cd mozitranslate
```

### Passo 2: Configuração do Backend
```bash
# Navegar para o diretório do backend
cd backend

# Criar um ambiente virtual
python -m venv venv

# Ativar o ambiente virtual
# No Windows:
venv\Scripts\activate
# No Unix/MacOS:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Iniciar o servidor backend
python run.py
```

A API do backend estará disponível em http://localhost:8000. Você também pode acessar a documentação da API em http://localhost:8000/docs

### Passo 3: Configuração do Frontend
Abra uma nova janela de terminal (mantenha o backend em execução no terminal anterior)

```bash
# Navegue até a raiz do projeto e depois para o diretório frontend
cd mozitranslate/frontend
# Ou se você já estiver na raiz do projeto:
# cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação frontend estará disponível em http://localhost:3000

### Executando Ambos em Modo de Desenvolvimento
Para a melhor experiência de desenvolvimento:

**Opção 1: Usar janelas de terminal separadas (Recomendado)**
- Terminal 1: Execute o servidor backend
- Terminal 2: Execute o servidor de desenvolvimento frontend

**Opção 2: Para usuários de Windows PowerShell**
```powershell
# Do diretório raiz do projeto
Start-Process powershell -ArgumentList "cd $PWD/backend; .\venv\Scripts\activate; python run.py" -NoNewWindow
cd frontend
npm run dev
```

**Opção 3: Usar um gerenciador de processos como PM2**
Se você trabalha frequentemente no projeto, considere configurar um gerenciador de processos como o PM2 para gerenciar ambos os serviços.

### Solucionando Problemas Comuns de Instalação

#### Problemas no Backend
- **Erros de módulo não encontrado**: Certifique-se de ter ativado o ambiente virtual e instalado todas as dependências
- **Porta já em uso**: Se a porta 8000 já estiver sendo usada, modifique `run.py` para usar uma porta diferente
- **Erros de processamento de PDF**: Garanta que o PyMuPDF esteja corretamente instalado com `pip install pymupdf`

#### Problemas no Frontend
- **Erros de módulos Node**: Exclua a pasta `node_modules` e o arquivo `package-lock.json`, então execute `npm install` novamente
- **Erros de CORS**: Certifique-se de que o backend está rodando e verifique se as URLs da API no código frontend correspondem à porta do backend
- **Erros de build**: Certifique-se de ter uma versão compatível do Node.js (14+)

### Verificando Sua Instalação
1. Abra seu navegador e acesse http://localhost:3000
2. Faça upload de um arquivo PDF usando a interface de upload
3. O documento deve aparecer com o PDF original à esquerda e o texto traduzido à direita
4. Use os botões de navegação para mover-se pelas páginas e mudar idiomas

## 📘 Guia de Uso

### Enviar um PDF
1. Na página inicial, clique na área de upload ou arraste e solte um arquivo PDF
2. Aguarde o upload completar e o processamento terminar

### Navegar pelas Páginas
- Use os botões de navegação (◀ ▶) para mover-se entre as páginas
- Clique nos botões de primeira (⟪) ou última (⟫) página para pular para o início ou fim
- Digite um número de página específico no campo de entrada e pressione Enter
- Use atalhos de teclado (veja abaixo)

### Alterar o Idioma de Tradução
1. Clique no botão de idioma na parte superior da barra de controle
2. Selecione o idioma de destino desejado no menu suspenso
3. A página atual será automaticamente retraduzida para o novo idioma

### Uso em Dispositivos Móveis
- Em dispositivos móveis, use as abas no topo para alternar entre a visualização do PDF original e o texto traduzido
- Todas as outras funcionalidades funcionam da mesma forma que no desktop

### Atalhos de Teclado
- `→` ou `Page Down`: Próxima página
- `←` ou `Page Up`: Página anterior
- `Home`: Pular para a primeira página
- `End`: Pular para a última página
- `Ctrl + 1-9`: Pular para uma porcentagem do documento (ex: Ctrl+5 pula para o meio)

### Solução de Problemas
- Se encontrar problemas de CORS, certifique-se de que o backend está rodando na porta 8000
- Se as traduções falharem, verifique sua conexão com a internet, pois o aplicativo usa o Google Translate
- Certifique-se de ter as dependências mais recentes instaladas
- Para problemas de renderização de PDF, tente com um arquivo PDF diferente, pois alguns layouts complexos podem não ser renderizados corretamente

## 📊 Considerações de Desempenho
- A aplicação utiliza cache para páginas traduzidas para evitar chamadas redundantes da API
- As páginas do PDF são carregadas apenas quando necessário para melhorar o desempenho
- As solicitações de tradução são limitadas para evitar bloqueio da API
- A renderização de imagens é otimizada para os formatos de PDF mais comuns
