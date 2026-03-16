# CyCat — Decisiones de Arquitectura

## ADR-001: Separación Frontend / Backend

**Decisión:** Monorepo con workspaces npm separados para frontend y backend.

**Razonamiento:**
- Deployments independientes (Vercel para frontend, Railway/Fly.io para backend)
- Equipos pueden trabajar en paralelo
- El backend actúa como BFF (Backend for Frontend) que encapsula la TMDB API Key
- Permite agregar cache y rate limiting sin exponer la key al cliente

---

## ADR-002: TMDB como única fuente de datos

**Decisión:** No persistir datos de películas/series en DB local.

**Razonamiento:**
- TMDB tiene datos completos, actualizados y gratuitos
- Mantener sincronización sería costoso
- Solo se persisten datos propios del usuario (ratings, listas)

**Trade-off:** Dependencia de disponibilidad de TMDB API.

---

## ADR-003: SQLite para persistencia

**Decisión:** SQLite con better-sqlite3 en lugar de PostgreSQL para v1.

**Razonamiento:**
- Zero config para desarrollo local
- Suficiente para MVP y primeros usuarios
- Fácil migración a PostgreSQL cuando escale

**Migración futura:** Cambiar only `database.js` + queries SQL.

---

## ADR-004: CSS Modules sobre CSS-in-JS

**Decisión:** CSS Modules + variables CSS globales.

**Razonamiento:**
- Zero runtime overhead
- Scoping automático por componente
- Design tokens globales via variables CSS
- No requiere instalar styled-components/emotion

---

## ADR-005: Playwright para testing E2E

**Decisión:** Solo Playwright, no Jest/Vitest para unit tests en v1.

**Razonamiento:**
- Los tests E2E validan el sistema completo (frontend + backend + TMDB)
- Los API contract tests cubren la lógica del backend
- Mayor confianza por test que unit tests aislados
- Un solo runner para todo

**Evolución:** Agregar Vitest para lógica de utilidades pura.

---

## Flujo de autenticación

```
Cliente → POST /api/auth/login → Backend verifica hash bcrypt → 
genera JWT → cliente guarda en localStorage → 
envía en cada request como Bearer token → 
middleware auth.js verifica JWT → extrae user del token
```

---

## Estructura de respuestas API

**Éxito con datos directos (TMDB):**
```json
{ "results": [...], "total_pages": 10 }
```

**Éxito con wrapper (detalle):**
```json
{ "data": { "id": 278, "title": "..." } }
```

**Error:**
```json
{ "error": "Mensaje descriptivo" }
```
