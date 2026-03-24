# Informe Centro-Oeste - Documentação de Deploy

## Visão Geral do Projeto

Portal de notícias regional **Informe Centro-Oeste / Informe TV** com:
- **Frontend**: React + Vite + TailwindCSS (portal público + painel admin)
- **Backend**: Express.js + Node.js (API REST com JWT)
- **Banco de dados**: PostgreSQL + Drizzle ORM
- **Upload de imagens**: Cloudinary + uploads locais

## Estrutura do Projeto (Monorepo pnpm)

```
/
├── artifacts/
│   ├── api-server/          # Backend Express.js (API)
│   │   ├── src/
│   │   │   ├── index.ts     # Entry point
│   │   │   ├── app.ts       # Express app config
│   │   │   ├── routes/      # Rotas (public, admin)
│   │   │   ├── middleware/   # Auth JWT middleware
│   │   │   └── lib/         # Utilitários (cache, audit)
│   │   ├── build.ts         # Script de build (esbuild)
│   │   ├── uploads/         # Pasta de uploads locais (NÃO versionada)
│   │   └── package.json
│   │
│   └── informe-portal/      # Frontend React + Vite
│       ├── src/
│       │   ├── pages/       # Páginas (public/, admin/)
│       │   ├── components/  # Componentes React
│       │   ├── hooks/       # React hooks customizados
│       │   └── lib/         # Utilitários
│       ├── public/          # Assets estáticos
│       ├── vite.config.ts   # Config Vite
│       └── package.json
│
├── lib/
│   ├── db/                  # Schema Drizzle ORM + conexão DB
│   │   ├── src/schema/      # Tabelas (news, users, banners, etc.)
│   │   └── drizzle.config.ts
│   ├── api-client-react/    # Client hooks React para API
│   ├── api-spec/            # Especificação da API
│   └── api-zod/             # Schemas Zod compartilhados
│
├── attached_assets/         # Imagens/assets do projeto (logo, etc.)
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # Config monorepo pnpm
├── pnpm-lock.yaml           # Lockfile
└── tsconfig.base.json       # Config TypeScript base
```

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env` ou configure no Render:

```env
# OBRIGATÓRIO - Banco de dados PostgreSQL
DATABASE_URL=postgresql://usuario:senha@host:5432/nome_do_banco

# OBRIGATÓRIO - Porta do servidor
PORT=8080

# OBRIGATÓRIO - Segredo JWT (gere uma string aleatória longa)
JWT_SECRET=sua_chave_secreta_jwt_aqui_muito_longa_e_aleatoria

# OBRIGATÓRIO - Segredo do Refresh Token
JWT_REFRESH_SECRET=outra_chave_secreta_para_refresh_token

# OPCIONAL - CORS (deixe vazio para aceitar todas as origens)
CORS_ORIGIN=https://seu-dominio.onrender.com

# OPCIONAL - Cloudinary (para upload de imagens via Cloudinary)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

# Para build do frontend (definido automaticamente nos scripts)
NODE_ENV=production
BASE_PATH=/
```

## Credenciais Padrão do Admin

Após o primeiro deploy, o sistema cria automaticamente:
- **Email**: `admin@informecentrooeste.com.br`
- **Senha**: `admin@2024Informe!`
- **Email (editor)**: `editor@informecentrooeste.com.br`
- **Senha (editor)**: `editor@2024Informe!`

**IMPORTANTE**: Troque as senhas após o primeiro acesso!

---

## Instruções para Subir no GitHub

### 1. Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `informe-centro-oeste` (ou o nome que preferir)
3. Deixe **privado**
4. **NÃO** inicialize com README (já temos os arquivos)
5. Clique em "Create repository"

### 2. Conectar e fazer push

```bash
# Na raiz do projeto, inicialize o git (se ainda não tiver)
git init

# Adicione o repositório remoto
git remote add origin https://github.com/SEU_USUARIO/informe-centro-oeste.git

# Adicione todos os arquivos
git add .

# Faça o commit
git commit -m "feat: portal Informe Centro-Oeste completo"

# Envie para o GitHub
git branch -M main
git push -u origin main
```

### 3. Verificar que o .gitignore está funcionando

Verifique que estes itens **NÃO** foram enviados:
- `node_modules/` (dependências)
- `dist/` (builds compilados)
- `artifacts/api-server/uploads/` (imagens uploadadas)
- `.env` (variáveis de ambiente)
- `artifacts/mockup-sandbox/` (sandbox de desenvolvimento)

---

## Instruções para Deploy no Render

O deploy no Render vai rodar **dois serviços**: o backend (API) que também serve o frontend buildado.

### Opção 1: Deploy Unificado (Recomendado)

Um único serviço Web Service que serve API + Frontend estático.

#### Passo 1: Criar banco PostgreSQL no Render

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** > **"PostgreSQL"**
3. Configure:
   - **Name**: `informe-db`
   - **Region**: Ohio (ou a mais próxima)
   - **Plan**: Free (ou o que preferir)
4. Clique em **"Create Database"**
5. Após criar, copie a **Internal Database URL** (formato: `postgresql://...`)

#### Passo 2: Criar Web Service

1. Clique em **"New +"** > **"Web Service"**
2. Conecte seu repositório GitHub
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `informe-centro-oeste` |
| **Region** | Mesmo do banco |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install -g pnpm && pnpm install && pnpm run build` |
| **Start Command** | `node artifacts/api-server/dist/index.cjs` |
| **Plan** | Free (ou o que preferir) |

#### Passo 3: Configurar variáveis de ambiente

Na aba **"Environment"** do serviço, adicione:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | (cole a Internal Database URL do passo 1) |
| `PORT` | `8080` |
| `JWT_SECRET` | (gere: `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | (gere: `openssl rand -hex 32`) |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://informe-centro-oeste.onrender.com` |
| `CLOUDINARY_CLOUD_NAME` | (seu cloud name do Cloudinary) |
| `CLOUDINARY_API_KEY` | (sua API key do Cloudinary) |
| `CLOUDINARY_API_SECRET` | (seu API secret do Cloudinary) |

#### Passo 4: Configurar o build para servir o frontend

O backend precisa servir os arquivos estáticos do frontend em produção. Para isso, precisamos ajustar o app.ts. O build command já compila tudo.

#### Passo 5: Criar pasta de uploads

Após o primeiro deploy, acesse o Shell do Render e execute:
```bash
mkdir -p uploads
```

**Nota**: No plano Free do Render, uploads locais são perdidos a cada deploy. Recomenda-se usar **Cloudinary** para armazenar imagens permanentemente.

### Opção 2: Deploy Separado (Frontend + Backend)

#### Backend (Web Service)
- **Build Command**: `npm install -g pnpm && pnpm install && pnpm --filter @workspace/api-server run build`
- **Start Command**: `node artifacts/api-server/dist/index.cjs`
- Mesmas variáveis de ambiente acima

#### Frontend (Static Site)
1. Clique em **"New +"** > **"Static Site"**
2. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `informe-frontend` |
| **Build Command** | `npm install -g pnpm && pnpm install && BASE_PATH=/ PORT=3000 pnpm --filter @workspace/informe-portal run build` |
| **Publish Directory** | `artifacts/informe-portal/dist/public` |

3. Na aba **"Redirects/Rewrites"**, adicione:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`

4. Adicione variável de ambiente:
   - `VITE_API_URL` = `https://informe-centro-oeste-api.onrender.com`

---

## Ajustes Necessários para Produção

### 1. Servir frontend estático pelo backend

Para o deploy unificado, o backend precisa servir os arquivos do frontend. Adicione ao `artifacts/api-server/src/app.ts`, ANTES do handler 404:

```typescript
// Em produção, serve o frontend estático
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(process.cwd(), "artifacts/informe-portal/dist/public");
  app.use(express.static(frontendPath, { maxAge: "7d" }));
  
  // SPA fallback - qualquer rota não-API retorna o index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}
```

### 2. Migração do banco de dados

Após configurar o DATABASE_URL no Render, execute no Shell:

```bash
cd lib/db && npx drizzle-kit push --force
```

Ou localmente apontando para o banco do Render:

```bash
DATABASE_URL="postgresql://..." npx drizzle-kit push --force --config lib/db/drizzle.config.ts
```

### 3. Vite config para produção

O `vite.config.ts` precisa funcionar sem as variáveis `PORT` e `BASE_PATH` durante o build no Render. O build command já passa essas variáveis.

---

## Resumo dos Comandos

```bash
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm --filter @workspace/api-server run dev    # Backend (porta 8080)
pnpm --filter @workspace/informe-portal run dev # Frontend (porta dinâmica)

# Build para produção
pnpm run build                                  # Build completo (typecheck + todos os artifacts)
pnpm --filter @workspace/api-server run build   # Build só do backend
pnpm --filter @workspace/informe-portal run build # Build só do frontend

# Migração do banco
cd lib/db && npx drizzle-kit push --force       # Push do schema para o banco

# Iniciar em produção
node artifacts/api-server/dist/index.cjs        # Inicia o servidor
```

---

## Posições de Banner

| Posição | Descrição | Tamanho |
|---------|-----------|---------|
| TOP | Banner topo desktop | 1920×250 |
| TOP_MOBILE | Banner topo mobile | 750×150 |
| ABOVE_DESTAQUE | Acima do destaque | 970×120 |
| ABOVE_TITLE_NEWS | Acima do título da notícia | 728×90 |
| MID_NEWS | No meio do conteúdo da notícia | 728×90 |

---

## Categorias do Menu

| Ordem | Nome | Slug |
|-------|------|------|
| 1 | Geral | geral |
| 2 | Formiga | formiga |
| 3 | Regional ▾ | regional |
| 4 | Estadual | estadual |
| 5 | Brasil | brasil |
| 6 | Política | politica |

A categoria **Regional** tem dropdown com filtro por cidades (Córrego Fundo, Pains, etc.).

---

## Rotas da API

### Públicas (`/api/public/`)
- `GET /news` - Lista notícias (paginação, filtros por categoria, cidade)
- `GET /news/:slug` - Detalhes de uma notícia
- `GET /categories` - Lista categorias
- `GET /banners?position=XXX` - Banners por posição
- `GET /cities?category=regional` - Cidades de uma categoria
- `GET /search?q=termo` - Busca de notícias

### Admin (`/api/admin/`) - Requer JWT
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- CRUD de notícias, categorias, banners, usuários, cidades
- `POST /cloudinary/image` - Upload de imagem via Cloudinary
- `POST /cloudinary/video` - Upload de vídeo via Cloudinary

---

## Troubleshooting

### Erro "PORT environment variable is required"
Certifique-se de que a variável `PORT` está definida no Render (valor: `8080`).

### Erro de conexão com banco
Verifique se o `DATABASE_URL` está correto e o banco está ativo no Render.

### Frontend não carrega
Se usando deploy unificado, verifique que o bloco de serve estático está no `app.ts` e que o build do frontend foi executado.

### Uploads perdidos após deploy
No plano Free do Render, o filesystem é efêmero. Use **Cloudinary** para uploads permanentes. As imagens já salvas no Cloudinary não são afetadas.

### CORS errors
Configure a variável `CORS_ORIGIN` com a URL exata do seu frontend (incluindo `https://`).
