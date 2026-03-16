# 🎬 CyCat — Catálogo de Cine y Series

> Plataforma web moderna para explorar, rankear y descubrir películas y series.
> Inspirada en FilmAffinity, IMDb y Letterboxd.

---

## Stack Tecnológico

| Capa       | Tecnología                            |
|------------|---------------------------------------|
| Frontend   | React 18 + Vite + CSS Modules         |
| Backend    | Node.js + Express                     |
| Base datos | SQLite (better-sqlite3)               |
| API datos  | TMDB (The Movie Database)             |
| Testing    | Playwright (E2E + API Contract)       |

---

## Estructura del Proyecto

```
cycat/
├── frontend/               # React + Vite
│   └── src/
│       ├── components/     # UI reutilizable
│       │   ├── catalog/    # MediaCard, MediaGrid, Skeletons
│       │   ├── detail/     # Componentes de ficha
│       │   ├── auth/       # Formularios de auth
│       │   ├── rankings/   # StarRating, RankItem
│       │   ├── layout/     # Navbar, Footer, Layout
│       │   └── ui/         # StarRating, botones, etc
│       ├── pages/          # Páginas principales
│       ├── hooks/          # useAuth, useFetch, usePaginatedFetch
│       ├── services/       # api.js (axios)
│       ├── utils/          # tmdb.js helpers
│       └── styles/         # globals.css (Design System)
│
├── backend/                # Node.js + Express
│   └── src/
│       ├── routes/         # catalog, detail, search, auth, rankings
│       ├── services/       # tmdb.js (integración TMDB)
│       ├── middleware/     # auth.js (JWT)
│       └── utils/          # database.js (SQLite)
│
├── testing/                # Playwright
│   └── specs/
│       ├── catalogo.spec.js
│       ├── detalle.spec.js
│       ├── auth.spec.js
│       ├── rankings.spec.js
│       └── api-contract.spec.js
│
└── docs/                   # Documentación adicional
```

---

## Configuración inicial

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/cycat.git
cd cycat
npm install
```

### 2. Variables de entorno

**Backend:**
```bash
cp backend/.env.example backend/.env
# Editá backend/.env y ponés tu TMDB_API_KEY
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env.local
```

Obtené tu API Key gratis en: https://www.themoviedb.org/settings/api

### 3. Correr en desarrollo

```bash
# Corre frontend (5173) y backend (3001) juntos
npm run dev
```

O por separado:
```bash
npm run dev:frontend
npm run dev:backend
```

---

## Testing

```bash
# Todos los tests
npm run test:e2e

# Suite específica
cd testing
npx playwright test specs/catalogo.spec.js
npx playwright test specs/api-contract.spec.js

# Con interfaz visual
npx playwright test --ui

# Ver reporte
npx playwright show-report
```

### Suites disponibles

| Archivo                 | Cubre                                      |
|-------------------------|--------------------------------------------|
| `catalogo.spec.js`      | Grilla, filtros, paginación, navegación    |
| `detalle.spec.js`       | Ficha completa, reparto, similares         |
| `auth.spec.js`          | Registro, login, validaciones              |
| `rankings.spec.js`      | Página de rankings, StarRating             |
| `api-contract.spec.js`  | Endpoints REST, schemas, flujo auth        |

---

## API Endpoints

### Catálogo
```
GET /api/catalog/trending/:mediaType/:timeWindow
GET /api/catalog/movies/popular?page=1
GET /api/catalog/series/popular?page=1
GET /api/catalog/movie/top-rated?page=1
GET /api/catalog/tv/top-rated?page=1
GET /api/catalog/:type/genre/:genreId?page=1
GET /api/catalog/genres/:type
```

### Detalle
```
GET /api/detail/movie/:id
GET /api/detail/tv/:id
GET /api/detail/:type/:id/credits
GET /api/detail/:type/:id/videos
GET /api/detail/:type/:id/similar
```

### Búsqueda
```
GET /api/search?q=:query&page=1
GET /api/search/:type?q=:query
```

### Autenticación
```
POST /api/auth/register   { username, email, password }
POST /api/auth/login      { email, password }
GET  /api/auth/me         [requiere JWT]
POST /api/auth/logout     [requiere JWT]
```

### Rankings
```
POST /api/rankings/rate           { type, contentId, score } [requiere JWT]
GET  /api/rankings/rating/:type/:id
GET  /api/rankings/top/:type?page=1
GET  /api/rankings/user/ratings   [requiere JWT]
```

---

## Roadmap

### ✅ Fase 1 — Core
- [x] Catálogo de películas y series
- [x] Fichas detalladas
- [x] Integración TMDB
- [x] Autenticación JWT
- [x] Sistema de calificaciones
- [x] Testing automatizado (Playwright)

### 🚧 Fase 2 — Exploración
- [ ] Buscador global con debounce
- [ ] Filtros avanzados (año, idioma, runtime)
- [ ] Rankings globales CyCat
- [ ] Paginación infinita

### 📋 Fase 3 — Usuario
- [ ] Listas personalizadas
- [ ] Favoritos
- [ ] Historial de vistos
- [ ] Perfil completo

### 🌐 Fase 4 — Comunidad
- [ ] Reviews y reseñas
- [ ] Recomendaciones personalizadas
- [ ] Sistema social (follows, actividad)
- [ ] Auth con Google OAuth

---

## Design System

CyCat usa un sistema de diseño oscuro tipo "cinema":

- **Fuentes:** Playfair Display (headings) + DM Sans (body) + DM Mono (datos)
- **Color primario:** `#e8a020` (dorado)
- **Fondo:** `#0a0a0f` (negro cinema)
- **CSS Variables:** definidas en `globals.css`

---

*Este producto usa la API de TMDB pero no está respaldado ni certificado por TMDB.*
