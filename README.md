# DevBoard

Aplicación web de gestión de tareas desarrollada como prueba técnica para Londoño Gómez.

El proyecto está compuesto por una SPA desarrollada con React y Vite, una API REST desarrollada con NestJS y una base de datos PostgreSQL.

---

## Requisitos previos

| Herramienta | Versión |
|---|---|
| Node.js | 22.23.2 |
| npm | 10.9.8 |
| PostgreSQL | 16 o superior (probado con 17.6) |
| Git | 2.39.0.windows.2 |

También se puede utilizar Docker para ejecutar PostgreSQL localmente.

---

## Puertos

| Servicio | Puerto |
|---|---:|
| Backend (NestJS) | `3000` |
| Frontend (Vite) | `5173` |
| PostgreSQL nativo | `5432` |
| PostgreSQL con Docker | `5433` |

---

## Variables de entorno

El proyecto incluye archivos `.env.example` tanto en `backend/` como en `frontend/`.

### Backend

Copiar `backend/.env.example` como `backend/.env`:

```bash
cd backend
cp .env.example .env
```

El archivo contiene las siguientes variables:

```env
DATABASE_URL="postgresql://devboard_user:devboard_pass@127.0.0.1:5433/devboard"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

Cuando se utiliza PostgreSQL nativo, es necesario ajustar `DATABASE_URL` de acuerdo con las credenciales y el puerto de la instalación local.

### Frontend

Copiar `frontend/.env.example` como `frontend/.env`:

```bash
cd frontend
cp .env.example .env
```

Contenido:

```env
VITE_API_URL="http://localhost:3000/api"
```

Los archivos `.env.example` no contienen credenciales reales. Los archivos `.env` deben mantenerse fuera del repositorio.

---

## Instalación y levantamiento

Hay dos alternativas para ejecutar el proyecto:

- **Opción A:** PostgreSQL mediante Docker, recomendada para reproducir el entorno de la prueba.
- **Opción B:** PostgreSQL instalado directamente en el sistema.

> No es necesario utilizar Docker para el backend ni para el frontend. Docker se utiliza únicamente para ejecutar PostgreSQL localmente.

---

### Opción A — PostgreSQL con Docker

#### 1. Levantar la base de datos

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

Esto inicia PostgreSQL 16 en el puerto `5433`, utilizando las credenciales definidas en `docker-compose.yml`.

Para verificar que el contenedor está ejecutándose:

```bash
docker-compose ps
```

#### 2. Configurar el backend

Desde la raíz del proyecto:

```bash
cd backend
cp .env.example .env
```

El `.env.example` ya está configurado para conectarse al PostgreSQL ejecutado mediante Docker.

#### 3. Instalar las dependencias del backend

```bash
npm install
```

#### 4. Crear el esquema de la base de datos

Con PostgreSQL ejecutándose en Docker:

```bash
psql -h localhost -p 5433 -U devboard_user -d devboard -f db/schema.sql
```

Este script crea las tablas, tipos, restricciones e índices necesarios.

#### 5. Cargar los datos de prueba

```bash
psql -h localhost -p 5433 -U devboard_user -d devboard -f db/seed.sql
```

El seed contiene las categorías y tareas necesarias para probar las funcionalidades de la aplicación, incluyendo la paginación.

#### 6. Generar Prisma Client

Prisma Client se genera a partir de `schema.prisma`. En este flujo no se ejecutan las migraciones porque el esquema ya fue creado mediante `schema.sql`.

```bash
npx prisma generate
```

#### 7. Levantar el backend

```bash
npm run start:dev
```

La API queda disponible en:

```text
http://localhost:3000/api
```

#### 8. Configurar el frontend

Abrir una nueva terminal desde la raíz del proyecto:

```bash
cd frontend
cp .env.example .env
```

#### 9. Instalar las dependencias del frontend

```bash
npm install
```

#### 10. Levantar el frontend

```bash
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:5173
```

---

### Opción B — PostgreSQL nativo

#### 1. Crear la base de datos

Con PostgreSQL instalado y ejecutándose localmente:

```bash
psql -U postgres -c "CREATE DATABASE devboard;"
```

El usuario y puerto utilizados en este flujo pueden variar dependiendo de la instalación local.

#### 2. Configurar el backend

Desde la raíz del proyecto:

```bash
cd backend
cp .env.example .env
```

Ajustar `DATABASE_URL` en `.env` para utilizar las credenciales y el puerto de la instalación local de PostgreSQL.

Por ejemplo:

```env
DATABASE_URL="postgresql://usuario:contraseña@127.0.0.1:5432/devboard"
```

#### 3. Instalar las dependencias del backend

```bash
npm install
```

#### 4. Crear el esquema de la base de datos

```bash
psql -U postgres -d devboard -f db/schema.sql
```

#### 5. Cargar los datos de prueba

```bash
psql -U postgres -d devboard -f db/seed.sql
```

#### 6. Generar Prisma Client

Prisma Client se genera a partir de `schema.prisma`. En este flujo no se ejecutan las migraciones porque el esquema ya fue creado mediante `schema.sql`.

```bash
npx prisma generate
```

Las migraciones de Prisma se conservan en `backend/prisma/migrations/` como mecanismo para versionar el esquema, pero no deben ejecutarse sobre una base de datos que ya haya sido creada mediante `schema.sql`.

#### 7. Levantar el backend

```bash
npm run start:dev
```

La API queda disponible en:

```text
http://localhost:3000/api
```

#### 8. Configurar el frontend

Abrir una nueva terminal:

```bash
cd frontend
cp .env.example .env
```

#### 9. Instalar las dependencias del frontend

```bash
npm install
```

#### 10. Levantar el frontend

```bash
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:5173
```

---

## Ejecutar las pruebas

Las pruebas están implementadas con Vitest.

### Frontend

Desde `frontend/`:

```bash
npm test
```

Pruebas incluidas:

- **`TaskForm`**: modos de creación y edición, validación del título (obligatorio, `trim`, longitud) y comportamiento general del formulario.
- **`useDebounce`**: delay correcto antes de actualizar el valor, reinicio del timer ante cambios consecutivos y soporte de delay personalizado.

### Backend

Desde `backend/`:

```bash
npm test
```

Pruebas incluidas:

- **`TasksService`**: `create` lanza una excepción cuando `categoryId` no existe en la base de datos; `findOne` lanza `NotFoundException` cuando el ID no corresponde a ninguna tarea.
- **`task.dto`**: validaciones del contrato 6.3, incluyendo `trim` del título, rechazo de valores inválidos para `status`, comportamiento `strip` de Zod ante campos desconocidos y valores por defecto de los parámetros de paginación.

Ambos comandos ejecutan las pruebas en modo `run` y muestran el resultado en consola.

---

## Qué implementé y qué dejé pendiente

### Nivel 1 — Base - Completo

- Listar tareas con título, descripción, estado, categoría y fecha de creación.
- Crear tarea mediante formulario, con título obligatorio y descripción opcional.
- Cambiar el estado de una tarea entre pendiente, en progreso y completada.
- Eliminar una tarea mediante confirmación explícita antes de borrar.

### Nivel 2 — Intermedio - Completo

- Filtrar tareas por estado mediante tabs: todas, pendientes, en progreso y completadas.
- Búsqueda por título en tiempo real con debounce de 300 ms.
- La búsqueda se realiza en el backend mediante `ILIKE`, no sobre los datos cargados en el navegador.
- Editar tareas, permitiendo modificar título, descripción y estado.
- Persistencia real en PostgreSQL: los datos sobreviven al reinicio del servidor y al refresco del navegador.

### Nivel 3 — Avanzado - Completo

- Categorías cargadas desde la base de datos mediante `GET /api/categories` y seleccionables desde los formularios de creación y edición.
- Filtrado por categoría disponible mediante el parámetro `categoryId` en `GET /api/tasks`.
- Seed inicial con 3 categorías y más de 25 tareas para facilitar la verificación de la paginación.
- Paginación de 10 tareas por página por defecto, con soporte de los parámetros `page`, `limit`, `sort` (`createdAt`, `updatedAt`, `title`) y `order` (`asc`, `desc`). Un valor fuera del conjunto admitido responde `400`.
- Metadatos de paginación devueltos por el API: `page`, `limit`, `total` y `totalPages`.
- Manejo de errores ante fallos de validación, recursos inexistentes, errores del servidor y caída del API.
- Mensajes de validación mostrados directamente en el formulario.
- Skeleton loaders durante la carga inicial de las tareas.
- Indicador de refetch durante actualizaciones en segundo plano.
- Pruebas unitarias de frontend y backend para validar componentes, hooks, servicios y contratos de entrada.

### Pendientes

No quedaron funcionalidades pendientes dentro del alcance definido para los niveles 1, 2 y 3 de la prueba.

Las funcionalidades fuera de alcance definidas por el enunciado no fueron implementadas.

---

## Decisiones técnicas

### NestJS

Elegí NestJS como framework backend en lugar de Express plano.

El enunciado permite explícitamente NestJS y su estructura modular facilita separar responsabilidades entre módulos, controladores, servicios y acceso a datos. En el proyecto esta separación se refleja principalmente en los módulos `tasks`, `categories`, `common` y `health`.

### Prisma como ORM

Elegí Prisma como capa de acceso a datos por su integración con TypeScript y porque permite generar un cliente tipado a partir del modelo de datos.

Las operaciones CRUD simples utilizan las APIs de Prisma, mientras que el listado de tareas utiliza `$queryRaw` junto con `Prisma.sql` para construir dinámicamente las condiciones de filtrado, búsqueda, ordenamiento y paginación.

De esta manera, el filtrado, la búsqueda y la paginación se ejecutan en PostgreSQL y no sobre los datos en memoria del frontend.

### `updated_at`

Decidí actualizar el campo `updated_at` desde la capa de acceso a datos en cada operación de modificación.

Elegí este enfoque en lugar de un trigger de PostgreSQL para mantener esta responsabilidad centralizada en el repositorio y dentro del flujo de escritura utilizado por la aplicación.

### Zod

Utilicé Zod para la validación de datos en el backend.

Implementé un `ZodValidationPipe` personalizado para validar los cuerpos y parámetros de consulta antes de que lleguen a la lógica de negocio.

En el frontend apliqué las mismas reglas funcionales principales para la validación del título, incluyendo `trim`, longitud mínima y máxima.

Elegí Zod por su integración con TypeScript y porque permite inferir tipos directamente a partir de los schemas.

### TanStack Query

Utilicé TanStack Query para gestionar el estado proveniente del servidor.

Me permite manejar caché, estados de carga, refetch e invalidación de consultas después de las mutaciones.

La `queryKey` de las tareas incluye los parámetros utilizados para filtros, búsqueda y paginación, por lo que los cambios en estos valores generan automáticamente una nueva consulta al backend.

### Campos adicionales en el body

Los schemas de Zod utilizan el comportamiento `strip` por defecto.

Por lo tanto, los campos desconocidos enviados en el body son ignorados silenciosamente en lugar de generar un error.

Mantuve este comportamiento de forma consistente en los endpoints que utilizan estos schemas.

---

## Convivencia entre `schema.sql`, `seed.sql` y migraciones de Prisma

El proyecto incluye dos mecanismos para gestionar el esquema de la base de datos.

### Scripts SQL

`backend/db/schema.sql` y `backend/db/seed.sql` son los scripts SQL independientes requeridos por la prueba técnica.

- `schema.sql` permite crear el esquema de la base de datos.
- `seed.sql` permite cargar los datos iniciales de prueba.

Estos scripts pueden ejecutarse directamente sobre PostgreSQL sin depender de Prisma.

### Migraciones de Prisma

Las migraciones almacenadas en `backend/prisma/migrations/` me permiten versionar los cambios del esquema durante el desarrollo y mantener un historial de las modificaciones realizadas mediante Prisma.

Ambos mecanismos representan el mismo modelo de datos, pero **no deben ejecutarse simultáneamente sobre una misma base de datos**.

Para reproducir la entrega siguiendo este README utilizo:

```text
schema.sql
    ↓
seed.sql
    ↓
prisma generate
    ↓
backend
```

Las migraciones de Prisma se mantienen en el repositorio como mecanismo de versionado del esquema.

---

## Estructura general

```text
devboard-prueba/
├── backend/
│   ├── db/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── categories/
│   │   ├── common/
│   │   └── tasks/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
├── .gitignore
└── README.md
```

Organicé la estructura para mantener separadas las responsabilidades de presentación, comunicación con el API, lógica de aplicación y acceso a datos.

---

## Uso de inteligencia artificial

Durante el desarrollo utilicé Claude (Sonnet) y ChatGPT (GPT-5.6 Luna) como asistentes.

Principalmente los utilicé para generar y revisar componentes React con Tailwind, configurar inicialmente el pipeline de Vitest para NestJS y revisar algunas decisiones de arquitectura del backend.

La implementación final la revisé y ajusté a medida que avanzaba en el proyecto. También ejecuté y verifiqué las pruebas y el funcionamiento de las distintas funcionalidades.