# Kosmos

Agenda virtual modular y personalizable. Los usuarios crean **espacios** (a partir de plantillas o desde cero) donde organizan tareas con subtareas, vista de lista o calendario, y reciben recordatorios mediante notificaciones push del navegador.

![Node](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

## Índice

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [API del backend](#api-del-backend)
- [Scripts disponibles](#scripts-disponibles)
- [Documentación adicional](#documentación-adicional)

## Características

- **Autenticación con refresh token**: login/registro con JWT de acceso de corta duración + refresh token, hasheo de contraseñas con bcrypt.
- **Espacios personalizables**: cada espacio tiene nombre, color y una vista propia (lista o calendario), que se puede alternar en cualquier momento.
- **Plantillas de espacio**: catálogo de plantillas predefinidas que se pueden aplicar para arrancar un espacio con una estructura ya lista, en vez de partir de cero.
- **Tareas con subtareas**: creación, edición, cambio de estado y reordenamiento (drag & drop con `@dnd-kit`) de tareas; cada tarea admite subtareas independientes.
- **Vista de calendario**: integración con `FullCalendar` para ver y planificar tareas por fecha.
- **Notificaciones push**: suscripción/desuscripción a notificaciones del navegador vía Web Push (VAPID), para avisos y recordatorios aunque la app esté cerrada.
- **PWA instalable**: el frontend se registra como Progressive Web App (`vite-plugin-pwa` + Workbox) con soporte offline básico.

## Arquitectura

Monorepo (pnpm + Turborepo) con backend en **arquitectura hexagonal** organizada como **Screaming Architecture** (las carpetas gritan el caso de uso, no la tecnología) y frontend con estructura **vertical-slice** por feature.

```mermaid
flowchart LR
    subgraph Cliente
        WEB["frontend<br/>(React + Vite, PWA)"]
    end

    subgraph Backend["backend (Express)"]
        AUTH[auth]
        SPACES[spaces]
        TASKS[tasks]
        NOTIF[notifications]
    end

    DB[(PostgreSQL<br/>vía Prisma)]
    PUSH[[Web Push<br/>VAPID]]

    WEB -- "REST + JWT" --> AUTH
    WEB -- "REST + JWT" --> SPACES
    WEB -- "REST + JWT" --> TASKS
    WEB -- "REST + JWT" --> NOTIF

    AUTH --> DB
    SPACES --> DB
    TASKS --> DB
    NOTIF --> DB
    NOTIF -- "envía notificación" --> PUSH
```

### Backend — arquitectura hexagonal por módulo

Cada módulo de negocio (`src/modules/{auth,spaces,tasks,notifications}`) se divide en tres capas:

| Capa | Contenido |
|---|---|
| `domain/` | Entidades, value objects y puertos (interfaces). Sin dependencias externas. |
| `application/use-cases/` | Casos de uso que implementan los puertos de entrada, orquestando la lógica de negocio. |
| `infrastructure/` | Adaptadores concretos: controladores Express (`http/`), repositorios Prisma (`persistence/`), JWT, bcrypt. |

La composición de dependencias de cada módulo vive en su `*.module.ts` y se registra en el contenedor de inyección de dependencias (`tsyringe`) desde `app.ts`. Gracias a los puertos, cambiar de proveedor de persistencia o de notificaciones es escribir un nuevo adaptador sin tocar los casos de uso.

### Frontend — vertical slice

```
src/
  app/        Shell de la app, rutas, layout, providers
  features/   auth, spaces, tasks — cada uno con su api, hooks, páginas y componentes
  shared/     cliente HTTP, utilidades de storage
```

Cada feature contiene todo lo que necesita de punta a punta (componentes, hooks, llamadas a la API); no hay carpetas globales de "components" o "hooks" a nivel de toda la app.

## Stack tecnológico

| Capa | Tecnologías |
|---|---|
| Backend | Node.js, Express, TypeScript, Prisma (PostgreSQL), Zod, `tsyringe` (DI), JWT, bcrypt, `web-push`, Helmet |
| Frontend | React 18, Vite, TypeScript, React Router 7, `@dnd-kit` (drag & drop), `@fullcalendar/react`, `vite-plugin-pwa` |
| Infraestructura | Docker, Docker Compose, pnpm + Turborepo (monorepo) |

## Estructura del proyecto

```
kosmos/
├── docker-compose.yml
├── apps/
│   ├── backend/    Node.js + Express + TypeScript + Prisma (PostgreSQL)
│   │   └── src/
│   │       ├── modules/{auth,spaces,tasks,notifications}/
│   │       │   ├── domain/
│   │       │   ├── application/use-cases/
│   │       │   └── infrastructure/{http,persistence}/
│   │       └── shared/
│   │           └── infrastructure/{config,di,http,jobs,persistence}/
│   └── frontend/   Vite + React + TypeScript (PWA)
│       └── src/
│           ├── app/
│           ├── features/{auth,spaces,tasks}/
│           └── shared/
└── packages/
    └── shared-types/   Tipos compartidos entre backend y frontend
```

## Puesta en marcha

### Opción A — Desarrollo local

Requiere Node.js 20+, pnpm y Docker (solo para Postgres).

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Levantar solo Postgres
docker compose up -d postgres

# Migraciones
pnpm --filter @kosmos/backend prisma:migrate

pnpm dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

### Opción B — Docker (stack completo)

Requiere Docker y Docker Compose.

```bash
cp .env.example .env
# completar JWT_ACCESS_SECRET y JWT_REFRESH_SECRET con valores propios
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

Las migraciones de Prisma se aplican automáticamente al arrancar el contenedor `backend`.

## Variables de entorno

### `apps/backend/.env`

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor Express |
| `DATABASE_URL` | `postgresql://kosmos:kosmos@localhost:5432/kosmos?schema=public` | Cadena de conexión a PostgreSQL |
| `JWT_ACCESS_SECRET` | *(requerida)* | Firma del token de acceso |
| `JWT_REFRESH_SECRET` | *(requerida)* | Firma del refresh token |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Expiración del token de acceso |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Expiración del refresh token |
| `CORS_ORIGIN` | `http://localhost:5173` | Origin permitido por CORS |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | — | Claves VAPID para notificaciones push (Web Push) |
| `VAPID_SUBJECT` | `mailto:admin@kosmos.app` | Contacto asociado a las claves VAPID |

### `apps/frontend/.env`

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | URL base del backend |

## API del backend

Base URL: `http://localhost:3000/api`

| Módulo | Método | Ruta | Descripción |
|---|---|---|---|
| Auth | `POST` | `/auth/register` | Crea una cuenta |
| Auth | `POST` | `/auth/login` | Inicia sesión, devuelve access + refresh token |
| Auth | `POST` | `/auth/refresh` | Renueva el token de acceso |
| Spaces | `GET` | `/spaces` | Lista los espacios del usuario |
| Spaces | `POST` | `/spaces` | Crea un espacio |
| Spaces | `PATCH` | `/spaces/:id/toggle` | Activa/desactiva un espacio |
| Spaces | `PATCH` | `/spaces/:id/view` | Cambia la vista (lista/calendario) |
| Spaces | `PATCH` | `/spaces/:id/color` | Cambia el color del espacio |
| Spaces | `DELETE` | `/spaces/:id` | Elimina un espacio |
| Spaces | `GET` | `/spaces/templates` | Lista las plantillas disponibles |
| Spaces | `POST` | `/spaces/templates/:templateId/apply` | Aplica una plantilla |
| Tasks | `GET` | `/tasks` | Lista tareas |
| Tasks | `POST` | `/tasks` | Crea una tarea |
| Tasks | `PATCH` | `/tasks/reorder` | Reordena tareas (drag & drop) |
| Tasks | `PATCH` | `/tasks/:taskId/status` | Cambia el estado de una tarea |
| Tasks | `PATCH` | `/tasks/:taskId` | Edita una tarea |
| Tasks | `DELETE` | `/tasks/:taskId` | Elimina una tarea |
| Tasks | `POST` | `/tasks/:taskId/subtasks` | Crea una subtarea |
| Tasks | `PATCH` | `/tasks/:taskId/subtasks/:subtaskId` | Edita una subtarea |
| Tasks | `DELETE` | `/tasks/:taskId/subtasks/:subtaskId` | Elimina una subtarea |
| Notifications | `GET` | `/notifications/public-key` | Devuelve la clave pública VAPID |
| Notifications | `POST` | `/notifications/subscribe` | Suscribe al usuario a notificaciones push |
| Notifications | `POST` | `/notifications/unsubscribe` | Cancela la suscripción |

Todas las rutas salvo `auth/register` y `auth/login` requieren el header `Authorization: Bearer <token>`.

## Scripts disponibles

Desde la raíz (Turborepo):

```bash
pnpm dev                  # backend + frontend en modo desarrollo
pnpm build                # build de todo el monorepo
pnpm lint                 # lint de todo el monorepo
pnpm test                 # tests (vitest) del backend
pnpm typecheck            # chequeo de tipos en todo el monorepo
pnpm prisma:generate      # regenerar el cliente de Prisma
pnpm prisma:migrate       # crear/aplicar una migración de base de datos
```

## Documentación adicional

- [`ARQUITECTURA_BACKEND.md`](./ARQUITECTURA_BACKEND.md) — detalle de la arquitectura hexagonal del backend.
- [`ARQUITECTURA_FRONTEND.md`](./ARQUITECTURA_FRONTEND.md) — detalle de la estructura vertical-slice del frontend.
