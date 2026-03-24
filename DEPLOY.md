# Informe Centro-Oeste / Informe TV

Portal completo de notícias regionais do Centro-Oeste de Minas Gerais, com portal público, painel administrativo, sistema de banners, TV ao vivo, e integração com Cloudinary.

**Cor principal da marca**: `#474085` (roxo escuro)

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Banco de Dados](#banco-de-dados)
5. [API - Rotas Públicas](#api---rotas-públicas)
6. [API - Rotas de Autenticação](#api---rotas-de-autenticação)
7. [API - Rotas Admin](#api---rotas-admin)
8. [Middleware e Segurança](#middleware-e-segurança)
9. [Frontend - Páginas Públicas](#frontend---páginas-públicas)
10. [Frontend - Painel Admin](#frontend---painel-admin)
11. [Componentes Principais](#componentes-principais)
12. [Sistema de Banners](#sistema-de-banners)
13. [Sistema de Cidades e Filtros](#sistema-de-cidades-e-filtros)
14. [Upload de Imagens (Cloudinary)](#upload-de-imagens-cloudinary)
15. [Variáveis de Ambiente](#variáveis-de-ambiente)
16. [Credenciais Padrão](#credenciais-padrão)
17. [Como Subir no GitHub](#como-subir-no-github)
18. [Como Fazer Deploy no Render](#como-fazer-deploy-no-render)
19. [Comandos Úteis](#comandos-úteis)
20. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O **Informe Centro-Oeste** é um portal de notícias completo dividido em duas partes:

### Portal Público (visitantes)
- Homepage com TV ao vivo (streaming via logicahost), carrossel de destaques, seções de notícias por categoria
- Páginas de categoria com filtro por cidade
- Página de artigo completo com compartilhamento (WhatsApp/Facebook), galeria de fotos, vídeos, anexos
- Busca de notícias
- Sidebar com últimas notícias, mais lidas, programas e TV ao vivo
- Sistema de banners publicitários em múltiplas posições
- Layout responsivo (mobile/tablet/desktop)

### Painel Administrativo (gestão)
- Dashboard com estatísticas (total de notícias, views, categorias)
- CRUD completo de notícias com editor rico, SEO, galeria de fotos, vídeos
- Gestão de categorias, cidades, banners, vídeos, programas, articulistas
- Gestão de usuários com três níveis de permissão (ADMIN, EDITOR, AUTHOR)
- Upload de imagens via Cloudinary
- Importação de dados do WordPress
- Logs de auditoria de todas as ações admin
- Configurações do site (chave-valor)

---

## Tecnologias Utilizadas

### Frontend
| Tecnologia | Uso |
|---|---|
| **React 19** | Framework de UI |
| **Vite 7** | Build tool e dev server |
| **TailwindCSS 4** | Estilização (utility-first CSS) |
| **wouter 3** | Roteamento (alternativa leve ao React Router) |
| **TanStack React Query 5** | Gerenciamento de estado server-side e cache |
| **Radix UI** | Componentes acessíveis (dialog, tabs, accordion, etc.) |
| **Lucide React** | Ícones SVG |
| **date-fns** | Formatação de datas em português |
| **Framer Motion** | Animações |
| **Recharts** | Gráficos no dashboard admin |
| **Sonner** | Notificações toast |
| **React Hook Form + Zod** | Formulários com validação |

### Backend
| Tecnologia | Uso |
|---|---|
| **Node.js** | Runtime JavaScript |
| **Express 5** | Framework HTTP |
| **PostgreSQL** | Banco de dados relacional |
| **Drizzle ORM** | ORM type-safe para PostgreSQL |
| **JWT (jsonwebtoken)** | Autenticação via tokens |
| **bcrypt** | Hash de senhas |
| **Cloudinary SDK** | Upload de imagens/vídeos na nuvem |
| **Multer** | Upload de arquivos locais |
| **Helmet** | Headers de segurança HTTP |
| **CORS** | Cross-Origin Resource Sharing |
| **compression** | Compressão gzip das respostas |
| **express-rate-limit** | Limitação de requisições |
| **esbuild** | Bundler para build de produção |

### Ferramentas
| Tecnologia | Uso |
|---|---|
| **pnpm** | Gerenciador de pacotes (monorepo) |
| **TypeScript 5.9** | Tipagem estática |
| **Drizzle Kit** | Migrações e push do schema |

---

## Estrutura do Projeto

Este é um **monorepo pnpm** com a seguinte estrutura:

```
informe-centro-oeste/
│
├── package.json                    # Root - scripts globais
├── pnpm-workspace.yaml             # Configuração do monorepo pnpm
├── pnpm-lock.yaml                  # Lockfile (versionado)
├── tsconfig.base.json              # Config base TypeScript
├── tsconfig.json                   # Config TypeScript raiz
├── .gitignore                      # Arquivos ignorados pelo Git
├── DEPLOY.md                       # Esta documentação
├── replit.md                       # Notas de desenvolvimento
│
├── artifacts/
│   ├── api-server/                 # === BACKEND (Express.js API) ===
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── build.ts                # Script de build com esbuild
│   │   ├── uploads/                # Pasta de uploads locais (não versionada)
│   │   └── src/
│   │       ├── index.ts            # Entry point - inicia o servidor
│   │       ├── app.ts              # Configuração Express (cors, helmet, rotas)
│   │       ├── routes/
│   │       │   ├── index.ts        # Router principal - monta todas as rotas
│   │       │   ├── auth.ts         # POST /login, /refresh, /logout, GET /me
│   │       │   ├── public.ts       # Rotas públicas (news, categories, banners, etc.)
│   │       │   ├── health.ts       # Health check
│   │       │   └── admin/
│   │       │       ├── news.ts             # CRUD de notícias
│   │       │       ├── categories.ts       # CRUD de categorias
│   │       │       ├── banners.ts          # CRUD de banners
│   │       │       ├── users.ts            # CRUD de usuários
│   │       │       ├── cities.ts           # CRUD de cidades
│   │       │       ├── videos.ts           # CRUD de vídeos
│   │       │       ├── instagram-videos.ts # CRUD de vídeos Instagram
│   │       │       ├── columnists.ts       # CRUD de articulistas
│   │       │       ├── programs.ts         # CRUD de programas
│   │       │       ├── settings.ts         # Configurações do site
│   │       │       ├── dashboard.ts        # Estatísticas do dashboard
│   │       │       ├── audit.ts            # Logs de auditoria
│   │       │       ├── upload.ts           # Upload de arquivos locais
│   │       │       ├── cloudinary-upload.ts # Upload via Cloudinary
│   │       │       └── wp-import.ts        # Importação do WordPress
│   │       ├── middleware/
│   │       │   └── auth.ts         # Middleware JWT (requireAuth, requireRole)
│   │       └── lib/
│   │           ├── jwt.ts          # Geração e verificação de tokens JWT
│   │           ├── cache.ts        # Cache em memória para queries frequentes
│   │           └── audit.ts        # Log de auditoria no banco
│   │
│   └── informe-portal/             # === FRONTEND (React + Vite) ===
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts          # Configuração Vite (plugins, alias, proxy)
│       ├── index.html              # HTML template
│       ├── components.json         # Config shadcn/ui
│       ├── public/                 # Assets estáticos (favicon, etc.)
│       └── src/
│           ├── App.tsx             # Router principal (wouter)
│           ├── main.tsx            # Entry point React
│           ├── index.css           # Estilos globais + TailwindCSS
│           ├── pages/
│           │   ├── public/
│           │   │   ├── Home.tsx        # Homepage (TV, destaques, seções)
│           │   │   ├── Category.tsx    # Página de categoria com filtro cidade
│           │   │   ├── Article.tsx     # Página de artigo completo
│           │   │   ├── Search.tsx      # Página de busca
│           │   │   └── Columnist.tsx   # Página do articulista
│           │   └── admin/
│           │       ├── Login.tsx               # Tela de login
│           │       ├── Dashboard.tsx           # Dashboard com estatísticas
│           │       ├── NewsList.tsx            # Lista de notícias
│           │       ├── NewsForm.tsx            # Editor de notícia (criar/editar)
│           │       ├── CategoriesAdmin.tsx     # Gestão de categorias
│           │       ├── CitiesAdmin.tsx         # Gestão de cidades
│           │       ├── BannersAdmin.tsx        # Gestão de banners
│           │       ├── UsersAdmin.tsx          # Gestão de usuários
│           │       ├── VideosAdmin.tsx         # Gestão de vídeos
│           │       ├── InstagramVideosAdmin.tsx # Gestão de vídeos Instagram
│           │       ├── ColumnistsAdmin.tsx     # Gestão de articulistas
│           │       ├── ProgramsAdmin.tsx       # Gestão de programas
│           │       ├── SettingsAdmin.tsx       # Configurações do site
│           │       ├── AuditAdmin.tsx          # Logs de auditoria
│           │       └── WpImportAdmin.tsx       # Importação do WordPress
│           ├── components/
│           │   ├── shared/
│           │   │   ├── PublicLayout.tsx     # Layout público (header, footer, nav)
│           │   │   ├── PublicSidebar.tsx    # Sidebar (TV, programas, últimas)
│           │   │   ├── NewsCard.tsx         # Card de notícia reutilizável
│           │   │   ├── BannerCarousel.tsx   # Carrossel de banners por posição
│           │   │   ├── VideoEmbed.tsx       # Embed de vídeo (YouTube, etc.)
│           │   │   ├── VideosCarousel.tsx   # Carrossel de vídeos
│           │   │   ├── ImageLightbox.tsx    # Lightbox para ampliar imagens
│           │   │   └── InstagramEmbed.tsx   # Embed do Instagram
│           │   ├── admin/
│           │   │   ├── ImageUpload.tsx      # Upload de imagem local
│           │   │   └── CloudinaryUpload.tsx # Upload via Cloudinary
│           │   └── ui/                     # 50+ componentes Radix/shadcn-ui
│           ├── hooks/
│           │   ├── use-auth.ts      # Hook de autenticação (login, logout, token)
│           │   ├── use-public.ts    # Hooks para dados públicos (news, categories)
│           │   ├── use-admin.ts     # Hooks para dados admin (CRUD operations)
│           │   ├── use-mobile.tsx   # Detecção de dispositivo mobile
│           │   └── use-toast.ts     # Hook de notificações toast
│           └── lib/
│               ├── utils.ts         # Funções utilitárias (cn, formatDate)
│               ├── image-url.ts     # Conversão de URLs de imagens
│               └── queryClient.ts   # Configuração TanStack Query
│
├── lib/
│   ├── db/                          # === BANCO DE DADOS (Drizzle ORM) ===
│   │   ├── package.json
│   │   ├── drizzle.config.ts        # Config do Drizzle Kit
│   │   └── src/
│   │       ├── index.ts             # Conexão com PostgreSQL + exports
│   │       └── schema/
│   │           ├── index.ts             # Re-exporta todos os schemas
│   │           ├── users.ts             # Tabela users + roles
│   │           ├── news.ts              # Tabela news + tags
│   │           ├── categories.ts        # Tabela categories
│   │           ├── cities.ts            # Tabela cities
│   │           ├── banners.ts           # Tabela banners + enum positions
│   │           ├── columnists.ts        # Tabela columnists
│   │           ├── programs.ts          # Tabela programs
│   │           ├── videos.ts            # Tabela videos
│   │           ├── instagram-videos.ts  # Tabela instagram_videos
│   │           ├── settings.ts          # Tabela site_settings
│   │           └── audit.ts             # Tabela audit_logs
│   ├── api-client-react/            # Client hooks React para consumir a API
│   ├── api-spec/                    # Especificação/tipagem da API
│   └── api-zod/                     # Schemas Zod compartilhados (validação)
│
└── attached_assets/                 # Imagens do projeto (logo, banners, etc.)
    ├── logo-informe.png             # Logo principal
    └── ...                          # Outros assets
```

---

## Banco de Dados

PostgreSQL com 14 tabelas gerenciadas pelo Drizzle ORM.

### Tabela `users` - Usuários do sistema
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID auto-incremento |
| name | text | Nome completo |
| email | text (unique) | Email de login |
| password_hash | text | Senha com bcrypt |
| role | enum (ADMIN, EDITOR, AUTHOR) | Nível de permissão |
| is_active | boolean | Usuário ativo/inativo |
| failed_login_attempts | integer | Tentativas de login falhas |
| locked_until | timestamp | Bloqueio temporário por tentativas |
| last_login_at | timestamp | Último login |
| created_at / updated_at | timestamp | Timestamps |

### Tabela `news` - Notícias
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID auto-incremento |
| title | text | Título da notícia |
| slug | text (unique) | URL amigável (gerado automaticamente) |
| summary | text | Resumo/subtítulo |
| content | text | Conteúdo HTML completo |
| featured_image | text | URL da imagem de capa |
| status | enum (DRAFT, PUBLISHED, ARCHIVED) | Estado da publicação |
| category_id | integer FK → categories | Categoria da notícia |
| author_id | integer FK → users | Autor da notícia |
| city_id | integer FK → cities (nullable) | Cidade associada |
| is_featured | boolean | Notícia em destaque |
| published_at | timestamp | Data de publicação |
| view_count | integer | Contador de visualizações |
| seo_title / seo_description / seo_keywords | text | Campos SEO |
| video_url | text | URL de vídeo associado |
| gallery_images | text (JSON) | Array JSON com URLs de galeria |
| attachment_url / attachment_name | text | Arquivo anexo |
| redirect_url | text | URL de redirecionamento externo |
| created_at / updated_at | timestamp | Timestamps |

### Tabela `categories` - Categorias
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID |
| name | text | Nome da categoria |
| slug | text (unique) | URL amigável |
| description | text | Descrição |
| is_active | boolean | Ativa/inativa |

### Tabela `cities` - Cidades
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID |
| name | text | Nome da cidade |
| slug | text (unique) | URL amigável |
| category_id | integer FK → categories | Categoria vinculada (ex: Regional) |
| is_active | boolean | Ativa/inativa |

### Tabela `banners` - Banners publicitários
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID |
| title | text | Título/nome do banner |
| position | enum banner_position | Posição no site |
| image_url | text | URL da imagem do banner |
| target_url | text | URL de destino ao clicar |
| sort_order | integer | Ordem de exibição |
| is_active | boolean | Ativo/inativo |
| starts_at / ends_at | timestamp | Período de exibição |

### Tabela `columnists` - Articulistas
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID |
| name | varchar(200) | Nome do articulista |
| photo_url | text | Foto |
| bio | text | Biografia |
| article_slug | varchar(300) | Slug do artigo vinculado |
| sort_order | integer | Ordem de exibição |
| is_active | boolean | Ativo/inativo |

### Tabela `programs` - Programas da TV
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID |
| name | varchar(200) | Nome do programa |
| description | text | Descrição |
| cover_url | text | Imagem de capa |
| link_url | text | Link externo |
| sort_order | integer | Ordem |
| is_active | boolean | Ativo/inativo |

### Tabela `videos` - Vídeos
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID |
| title | text | Título |
| source_type | enum (YOUTUBE, INSTAGRAM, INTERNAL) | Fonte do vídeo |
| video_url | text | URL do vídeo |
| thumbnail_url | text | Thumbnail |
| description | text | Descrição |
| redirect_url | text | Link de redirecionamento |
| is_active | boolean | Ativo/inativo |

### Tabela `instagram_videos` - Vídeos do Instagram
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID |
| title | text | Título |
| description | text | Descrição |
| instagram_url | text | URL do Instagram |
| thumbnail_url | text | Thumbnail |
| is_active | boolean | Ativo/inativo |

### Tabela `site_settings` - Configurações do site
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID |
| key | text (unique) | Chave da configuração |
| value | text | Valor |

### Tabela `audit_logs` - Logs de auditoria
| Coluna | Tipo | Descrição |
|---|---|---|
| id | serial PK | ID |
| user_id | integer FK → users | Quem fez a ação |
| action | text | Tipo de ação (CREATE, UPDATE, DELETE) |
| entity_type | text | Tipo de entidade (NEWS, BANNER, etc.) |
| entity_id | text | ID da entidade |
| metadata | jsonb | Dados adicionais em JSON |
| created_at | timestamp | Quando aconteceu |

### Tabelas auxiliares
- **`news_tags`**: Tags de notícias (id, name)
- **`news_to_tags`**: Relação many-to-many entre news e tags
- **`refresh_tokens`**: Tokens de refresh para renovação de sessão JWT

---

## API - Rotas Públicas

Prefixo: `/api/public`

| Método | Rota | Descrição | Parâmetros |
|---|---|---|---|
| GET | `/news` | Lista notícias paginadas | `?page=1&limit=10&category=slug&city=slug&featured=true&sort=latest` |
| GET | `/news/:slug` | Detalhes de notícia (+ related, tags, prev/next) | slug na URL |
| GET | `/categories` | Lista categorias ativas | - |
| GET | `/cities` | Lista cidades | `?category=slug` |
| GET | `/featured-news` | Notícias em destaque | - |
| GET | `/latest-news` | Últimas notícias | `?limit=10` |
| GET | `/most-read` | Mais lidas | `?limit=10` |
| GET | `/sidebar-news` | Notícias para sidebar | - |
| GET | `/banners` | Banners ativos por posição | `?position=TOP` |
| GET | `/videos` | Lista de vídeos | - |
| GET | `/instagram-videos` | Vídeos do Instagram | - |
| GET | `/programs` | Lista de programas | - |
| GET | `/columnists` | Lista de articulistas | - |
| GET | `/columnists/:id` | Detalhes do articulista | ID na URL |
| GET | `/search` | Busca de notícias | `?q=termo&page=1&limit=10` |
| GET | `/settings` | Configurações públicas do site | - |
| GET | `/weather` | Previsão do tempo (Formiga, MG) | - |

---

## API - Rotas de Autenticação

Prefixo: `/api/auth`

| Método | Rota | Descrição | Body |
|---|---|---|---|
| POST | `/login` | Login (retorna access + refresh token) | `{ email, password }` |
| POST | `/refresh` | Renova access token | `{ refreshToken }` |
| POST | `/logout` | Invalida refresh token | `{ refreshToken }` |
| GET | `/me` | Dados do usuário logado | Header: `Authorization: Bearer <token>` |

**Rate limit no login**: 5 tentativas por IP a cada 15 minutos.
**Bloqueio de conta**: Após 5 tentativas falhas, conta bloqueada por 15 minutos.

---

## API - Rotas Admin

Prefixo: `/api/admin` - Todas exigem JWT válido.

### Notícias (`/api/admin/news`)
| Método | Rota | Descrição | Permissão |
|---|---|---|---|
| GET | `/` | Lista notícias (com filtros) | ADMIN, EDITOR, AUTHOR |
| GET | `/:id` | Detalhes de uma notícia | ADMIN, EDITOR, AUTHOR |
| POST | `/` | Criar notícia | ADMIN, EDITOR, AUTHOR |
| PUT | `/:id` | Editar notícia | ADMIN, EDITOR (AUTHOR: só as próprias) |
| DELETE | `/:id` | Excluir notícia | ADMIN |

### Categorias (`/api/admin/categories`)
| Método | Rota | Descrição | Permissão |
|---|---|---|---|
| GET | `/` | Listar | ADMIN, EDITOR |
| POST | `/` | Criar | ADMIN |
| PUT | `/:id` | Editar | ADMIN |
| DELETE | `/:id` | Excluir | ADMIN |

### Banners (`/api/admin/banners`)
| Método | Rota | Descrição | Permissão |
|---|---|---|---|
| GET | `/` | Listar todos | ADMIN, EDITOR |
| POST | `/` | Criar (máx. 5 por posição) | ADMIN, EDITOR |
| PUT | `/:id` | Editar | ADMIN, EDITOR |
| DELETE | `/:id` | Excluir | ADMIN, EDITOR |

### Usuários (`/api/admin/users`)
| Método | Rota | Descrição | Permissão |
|---|---|---|---|
| GET | `/` | Listar | ADMIN |
| POST | `/` | Criar | ADMIN |
| PUT | `/:id` | Editar | ADMIN |
| DELETE | `/:id` | Excluir | ADMIN |

### Cidades (`/api/admin/cities`)
| Método | Rota | Descrição | Permissão |
|---|---|---|---|
| GET | `/` | Listar | ADMIN, EDITOR |
| POST | `/` | Criar | ADMIN |
| PUT | `/:id` | Editar | ADMIN |
| DELETE | `/:id` | Excluir | ADMIN |

### Outros CRUDs (mesma estrutura GET/POST/PUT/DELETE)
- `/api/admin/videos` - Vídeos
- `/api/admin/instagram-videos` - Vídeos Instagram
- `/api/admin/columnists` - Articulistas
- `/api/admin/programs` - Programas
- `/api/admin/settings` - Configurações (chave-valor)

### Endpoints especiais
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/dashboard` | Estatísticas do dashboard |
| GET | `/api/admin/audit-logs` | Logs de auditoria (só ADMIN) |
| POST | `/api/admin/upload` | Upload de arquivo local |
| POST | `/api/admin/cloudinary/image` | Upload de imagem via Cloudinary |
| POST | `/api/admin/cloudinary/video` | Upload de vídeo via Cloudinary |
| POST | `/api/admin/wp-import` | Importar dados do WordPress |

---

## Middleware e Segurança

### `requireAuth` (middleware/auth.ts)
- Extrai o token JWT do header `Authorization: Bearer <token>`
- Verifica e decodifica o token com `JWT_SECRET`
- Anexa `req.user` com `{ id, email, role }` à requisição
- Retorna 401 se token inválido/expirado

### `requireRole(...roles)`
- Verifica se `req.user.role` está na lista de roles permitidos
- Retorna 403 se não autorizado

### Outras proteções
- **Helmet**: Headers de segurança (XSS, CSRF, etc.)
- **CORS**: Configurável via `CORS_ORIGIN`
- **Rate Limit**: Login (5/15min), Busca (30/min)
- **Compression**: gzip em todas as respostas
- **Trust Proxy**: Configurado para funcionar atrás de proxy (Render, etc.)

---

## Frontend - Páginas Públicas

### Home.tsx (`/`)
Layout com duas colunas (75% conteúdo / 25% sidebar):
1. TV ao vivo (iframe logicahost player)
2. Banner acima do destaque
3. Carrossel de destaques (5 últimas notícias em destaque)
4. Grid 2 colunas: Formiga | Regional
5. Grid 2 colunas: Política | Geral
6. Seção Estadual
7. Seção Brasil

### Category.tsx (`/categoria/:slug`)
- Lista notícias da categoria com paginação
- Filtro por cidade via query param `?cidade=slug`
- Contador de resultados ("42 notícias encontradas" / "Mostrando 12 de 17 notícias de Córrego Fundo")

### Article.tsx (`/noticia/:slug`)
- Banner acima do título (ABOVE_TITLE_NEWS)
- Badge da categoria, título, subtítulo, data
- Imagem de capa com lightbox
- Botões de compartilhamento (WhatsApp, Facebook)
- Vídeo incorporado (se houver)
- Conteúdo HTML com banner no meio (MID_NEWS - divide o texto na metade)
- Galeria de fotos com lightbox
- Arquivo anexo para download
- Link de redirecionamento externo
- Tags
- Navegação anterior/próxima
- Notícias relacionadas

### Search.tsx (`/busca?q=termo`)
- Busca de notícias por título/resumo com paginação

### Columnist.tsx (`/articulista/:id`)
- Página de perfil do articulista com seu artigo

---

## Frontend - Painel Admin

Acessível em `/admin` - requer login.

| Página | Rota | Descrição |
|---|---|---|
| Login | `/admin` | Tela de login com email/senha |
| Dashboard | `/admin/dashboard` | Estatísticas e gráficos |
| Notícias | `/admin/noticias` | Lista com filtros, busca, paginação |
| Nova/Editar Notícia | `/admin/noticias/nova` ou `/editar/:id` | Editor completo |
| Categorias | `/admin/categorias` | Gestão de categorias |
| Cidades | `/admin/cidades` | Gestão de cidades |
| Banners | `/admin/banners` | Gestão por posição (acordeões) |
| Usuários | `/admin/usuarios` | Gestão de contas |
| Vídeos | `/admin/videos` | Gestão de vídeos |
| Instagram | `/admin/instagram` | Gestão de vídeos Instagram |
| Articulistas | `/admin/articulistas` | Gestão de articulistas |
| Programas | `/admin/programas` | Gestão de programas da TV |
| Configurações | `/admin/configuracoes` | Configurações chave-valor |
| Auditoria | `/admin/auditoria` | Logs de todas as ações |
| WP Import | `/admin/wp-import` | Importação do WordPress |

---

## Componentes Principais

### PublicLayout.tsx
- Header fixo com logo, navegação (GERAL | FORMIGA | REGIONAL ▾ | ESTADUAL | BRASIL | POLÍTICA)
- Menu mobile com busca e dropdown Regional por cidades
- Botão "TV AO VIVO" no header mobile (abre player em nova aba)
- Footer com logo, redes sociais, links Google Play/App Store, grupos WhatsApp

### PublicSidebar.tsx
- Botão "TV AO VIVO" (link para player)
- Seção Programas (lista de programas da TV)
- Últimas Notícias (lista compacta)
- Mais Lidas (lista compacta)

### NewsCard.tsx
- Card de notícia reutilizável com imagem, categoria, título, data
- Badge de cidade quando disponível
- Usado em todas as listagens de notícias

### BannerCarousel.tsx
- Carrossel de banners com auto-rotação (5 segundos)
- Navegação por pontos
- Busca banners por posição via API
- Mostra placeholder quando não há banners

---

## Sistema de Banners

5 posições ativas, cada uma suporta até 5 banners com rotação automática:

| Posição | Onde aparece | Tamanho recomendado |
|---|---|---|
| `TOP` | Topo do site (desktop) | 1920×250 |
| `TOP_MOBILE` | Topo do site (mobile) | 750×150 |
| `ABOVE_DESTAQUE` | Acima do carrossel de destaques | 970×120 |
| `ABOVE_TITLE_NEWS` | Página de notícia, acima do título | 728×90 |
| `MID_NEWS` | Página de notícia, no meio do conteúdo | 728×90 |

No admin, os banners são organizados por posição em acordeões expansíveis com preview de thumbnail.

---

## Sistema de Cidades e Filtros

- Cidades são vinculadas a uma categoria (ex: "Regional")
- Cada notícia pode ter uma cidade associada (campo `city_id`)
- Na navegação, o dropdown "Regional" mostra as cidades disponíveis
- O link `/categoria/regional?cidade=corrego-fundo` filtra as notícias daquela cidade
- A API retorna o campo `cityName` via LEFT JOIN para exibir no NewsCard

Cidades atuais: Córrego Fundo, Pains (vinculadas à categoria Regional)

---

## Upload de Imagens (Cloudinary)

### Configuração
- SDK: `cloudinary` v2
- Pastas no Cloudinary:
  - Imagens: `informe-centro-oeste/images`
  - Vídeos: `informe-centro-oeste/videos`

### Rotas
- `POST /api/admin/cloudinary/image` - Upload de imagem (multipart/form-data)
- `POST /api/admin/cloudinary/video` - Upload de vídeo (multipart/form-data)

### Componente frontend
`CloudinaryUpload.tsx` - botão de upload que envia para Cloudinary e retorna a URL.

### Fallback
O sistema também suporta uploads locais via `multer` (pasta `artifacts/api-server/uploads/`). Uploads locais são servidos em `/api/uploads/`.

---

## Variáveis de Ambiente

### Obrigatórias

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@host:5432/dbname` |
| `PORT` | Porta do servidor | `8080` |
| `JWT_SECRET` | Chave secreta para access tokens | (gere com `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | Chave secreta para refresh tokens | (gere com `openssl rand -hex 32`) |

### Opcionais

| Variável | Descrição | Exemplo |
|---|---|---|
| `NODE_ENV` | Ambiente de execução | `production` |
| `CORS_ORIGIN` | Origem permitida para CORS | `https://meusite.onrender.com` |
| `CLOUDINARY_CLOUD_NAME` | Nome da cloud Cloudinary | `minha-cloud` |
| `CLOUDINARY_API_KEY` | API Key do Cloudinary | `123456789` |
| `CLOUDINARY_API_SECRET` | API Secret do Cloudinary | `abc123...` |
| `BASE_PATH` | Caminho base do frontend (dev) | `/` |

---

## Credenciais Padrão

Após a primeira migração do banco, insira os usuários padrão:

| Papel | Email | Senha |
|---|---|---|
| Admin | `admin@informecentrooeste.com.br` | `admin@2024Informe!` |
| Editor | `editor@informecentrooeste.com.br` | `editor@2024Informe!` |

**TROQUE AS SENHAS APÓS O PRIMEIRO ACESSO!**

---

## Como Subir no GitHub

### Passo 1: Criar repositório
1. Acesse [github.com/new](https://github.com/new)
2. Nome: `informe-centro-oeste`
3. Marque como **Privado**
4. **NÃO** inicialize com README, .gitignore ou licença
5. Clique em **Create repository**

### Passo 2: Inicializar Git e fazer push
No terminal, na raiz do projeto:

```bash
# 1. Inicializar repositório Git
git init

# 2. Adicionar o repositório remoto do GitHub
git remote add origin https://github.com/SEU_USUARIO/informe-centro-oeste.git

# 3. Verificar que o .gitignore está correto (já configurado)
# Deve ignorar: node_modules, dist, uploads, .env, .local, .cache

# 4. Adicionar todos os arquivos
git add .

# 5. Verificar o que será enviado (opcional, mas recomendado)
git status

# 6. Fazer o primeiro commit
git commit -m "feat: portal Informe Centro-Oeste - versão completa"

# 7. Definir branch principal e enviar
git branch -M main
git push -u origin main
```

### Passo 3: Verificar no GitHub
Acesse o repositório no GitHub e confirme que:
- Os arquivos de código estão presentes
- `node_modules/` NÃO está presente
- `artifacts/api-server/uploads/` NÃO está presente
- `.env` NÃO está presente
- `dist/` NÃO está presente

### Atualizações futuras
Sempre que fizer alterações:
```bash
git add .
git commit -m "descrição da mudança"
git push
```

---

## Como Fazer Deploy no Render

### Passo 1: Criar banco PostgreSQL

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** > **"PostgreSQL"**
3. Configure:
   - **Name**: `informe-db`
   - **Database**: `informe_centro_oeste`
   - **User**: `informe_user`
   - **Region**: Ohio (US East) ou a mais próxima do Brasil
   - **Plan**: Free (ou Starter para produção)
4. Clique em **"Create Database"**
5. Aguarde a criação (pode levar 1-2 minutos)
6. Copie a **Internal Database URL** — será algo como:
   ```
   postgresql://informe_user:SENHA_GERADA@dpg-xxx.render.com/informe_centro_oeste
   ```

### Passo 2: Criar Web Service

1. Clique em **"New +"** > **"Web Service"**
2. Escolha **"Build and deploy from a Git repository"**
3. Conecte sua conta GitHub e selecione o repositório `informe-centro-oeste`
4. Configure:

| Campo | Valor |
|---|---|
| **Name** | `informe-centro-oeste` |
| **Region** | Mesmo do banco (ex: Ohio) |
| **Branch** | `main` |
| **Root Directory** | (deixe vazio) |
| **Runtime** | `Node` |
| **Build Command** | `npm install -g pnpm && pnpm install && pnpm run build` |
| **Start Command** | `node artifacts/api-server/dist/index.cjs` |
| **Plan** | Free (ou Starter para produção) |

5. Clique em **"Create Web Service"**

### Passo 3: Configurar variáveis de ambiente

Na aba **"Environment"** do Web Service, adicione todas as variáveis:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | (cole a Internal Database URL do Passo 1) |
| `PORT` | `8080` |
| `JWT_SECRET` | (gere: abra o terminal e execute `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | (gere: execute novamente `openssl rand -hex 32`) |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://informe-centro-oeste.onrender.com` |
| `CLOUDINARY_CLOUD_NAME` | (seu cloud name) |
| `CLOUDINARY_API_KEY` | (sua API key) |
| `CLOUDINARY_API_SECRET` | (seu API secret) |

Clique em **"Save Changes"** — isso vai disparar um novo deploy.

### Passo 4: Migrar o banco de dados

Após o primeiro deploy bem-sucedido, vá na aba **"Shell"** do Web Service no Render e execute:

```bash
cd lib/db && npx drizzle-kit push --force
```

Isso cria todas as tabelas no banco PostgreSQL do Render.

**Alternativa**: Execute localmente apontando para o banco do Render:
```bash
DATABASE_URL="postgresql://informe_user:SENHA@dpg-xxx.render.com/informe_centro_oeste" npx drizzle-kit push --force --config lib/db/drizzle.config.ts
```

### Passo 5: Criar usuário admin

No Shell do Render, execute:
```bash
node -e "
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('admin@2024Informe!', 10);
console.log('INSERT INTO users (name, email, password_hash, role, is_active) VALUES');
console.log(\"(\'Administrador\', \'admin@informecentrooeste.com.br\', \'\" + hash + \"\', \'ADMIN\', true);\");
" | psql $DATABASE_URL
```

Ou execute diretamente no SQL (gere o hash antes):
```sql
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES ('Administrador', 'admin@informecentrooeste.com.br', '$2b$10$HASH_AQUI', 'ADMIN', true);
```

### Passo 6: Testar

1. Acesse `https://informe-centro-oeste.onrender.com` — deve mostrar o portal público
2. Acesse `https://informe-centro-oeste.onrender.com/admin` — deve mostrar a tela de login
3. Faça login com as credenciais admin
4. Crie categorias, cidades e publique notícias

### Passo 7: Deploy automático

O Render faz deploy automático a cada push na branch `main` do GitHub:
```bash
git add .
git commit -m "nova funcionalidade"
git push
# → Render detecta e faz deploy automaticamente
```

---

## Comandos Úteis

```bash
# === DESENVOLVIMENTO ===

# Instalar todas as dependências
pnpm install

# Iniciar backend (API) em desenvolvimento
pnpm --filter @workspace/api-server run dev

# Iniciar frontend em desenvolvimento
pnpm --filter @workspace/informe-portal run dev

# === BUILD DE PRODUÇÃO ===

# Build completo (typecheck + backend + frontend)
pnpm run build

# Build só do backend
pnpm --filter @workspace/api-server run build

# Build só do frontend
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/informe-portal run build

# === BANCO DE DADOS ===

# Push do schema (criar/atualizar tabelas)
cd lib/db && npx drizzle-kit push --force

# === PRODUÇÃO ===

# Iniciar servidor em produção (após build)
node artifacts/api-server/dist/index.cjs
```

---

## Troubleshooting

### Build falha no Render
- Verifique se o **Build Command** está exato: `npm install -g pnpm && pnpm install && pnpm run build`
- Verifique se o `pnpm-lock.yaml` está versionado no Git

### "PORT environment variable is required"
- Adicione `PORT=8080` nas variáveis de ambiente do Render

### Erro de conexão com banco
- Verifique se o `DATABASE_URL` está correto
- Se usando Internal URL, o banco e o web service devem estar na **mesma região**
- Verifique se o banco está ativo no Render

### Frontend não carrega (página em branco)
- Verifique se o build do frontend foi executado (`artifacts/informe-portal/dist/public/` deve existir)
- Verifique se o `app.ts` tem o bloco de serve estático para produção
- Verifique se `NODE_ENV=production` está definido

### CORS errors
- Configure `CORS_ORIGIN` com a URL completa do site (com `https://`)
- Exemplo: `https://informe-centro-oeste.onrender.com`

### Imagens/uploads perdidos após deploy
- No plano Free do Render, o filesystem é **efêmero** (reinicia a cada deploy)
- Use **Cloudinary** para uploads permanentes — as imagens salvas no Cloudinary não são afetadas
- Uploads locais (`/api/uploads/`) serão perdidos a cada novo deploy

### Login não funciona
- Verifique se `JWT_SECRET` e `JWT_REFRESH_SECRET` estão definidos
- Verifique se o usuário admin foi criado no banco
- Verifique se a senha foi hasheada com bcrypt

### Categorias do menu não aparecem
- Crie as categorias no admin com os slugs corretos: `geral`, `formiga`, `regional`, `estadual`, `brasil`, `politica`
- Certifique-se de que estão marcadas como ativas

---

## Informações Adicionais

### TV ao Vivo
- Player: `https://player.logicahost.com.br/player.php?player=2050`
- Embutido via iframe na homepage e sidebar

### Redes Sociais
- Instagram: `@informecentrooeste`
- Facebook: `/share/14TiuW9h73u`
- YouTube: `@informecentrooeste`
- WhatsApp (contato): `+55 37 99824-9936`
- Grupo WhatsApp Formiga: `chat.whatsapp.com/EhLqmbJ7UndF7IKgYUFjCh`
- Grupo WhatsApp Córrego Fundo: `chat.whatsapp.com/IqL5s8VYgxW7Vxql1WTAo3`

### Apps Mobile
- Google Play: `com.logicahost.informetv`
- App Store: `id6746223815`

### Autenticação
- Access Token: expira em 15 minutos
- Refresh Token: expira em 7 dias
- Armazenamento no frontend: `localStorage` com chaves `informe_access_token` e `informe_refresh_token`
