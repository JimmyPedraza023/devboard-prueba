-- Datos de prueba para DevBoard.
-- Ejecutar despues de schema.sql o de las migraciones de Prisma.
-- Ojo: limpia y reinicia las tablas antes de insertar.

-- LIMPIEZA
SET client_encoding = 'UTF8';
TRUNCATE TABLE tasks RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- CATEGORÍAS (3 requeridas por el enunciado)

INSERT INTO categories (name, color) VALUES
  ('Bug',     '#E5484D'),
  ('Feature', '#0091FF'),
  ('Mejora',  '#30A46C');

-- TAREAS (25 requeridas, distribuidas entre estados y categorías)
-- category_id: 1=Bug, 2=Feature, 3=Mejora, NULL=sin categoría

INSERT INTO tasks (title, description, status, category_id, created_at) VALUES

  -- PENDING (9 tareas)
  ('Corregir validacion del formulario de login',
   'El campo de email permite cadenas sin formato valido.',
   'pending', 1,
   NOW() - INTERVAL '30 days'),

  ('Agregar endpoint GET /api/health',
   'Debe verificar la conexión a la base de datos y retornar 200 o 503.',
   'pending', 2,
   NOW() - INTERVAL '28 days'),

  ('Mejorar tiempo de respuesta en listado de tareas',
   'El endpoint tarda más de 800ms con 1000 registros. Revisar indices.',
   'pending', 3,
   NOW() - INTERVAL '26 days'),

  ('Validar longitud maxima del campo titulo',
   'El backend no rechaza titulos de mas de 120 caracteres.',
   'pending', 1,
   NOW() - INTERVAL '24 days'),

  ('Implementar paginación en el frontend',
   'Actualmente se cargan todas las tareas sin paginar.',
   'pending', 2,
   NOW() - INTERVAL '22 days'),

  ('Revisar contraste de colores en modo oscuro',
   'Varios textos no cumplen el ratio minimo WCAG AA.',
   'pending', 3,
   NOW() - INTERVAL '20 days'),

  ('Documentar endpoints en README',
   NULL,
   'pending', NULL,
   NOW() - INTERVAL '18 days'),

  ('Agregar indice a la columna status en tasks',
   NULL,
   'pending', NULL,
   NOW() - INTERVAL '16 days'),

  ('Configurar ESLint y Prettier en el proyecto',
   'Unificar reglas de estilo para backend y frontend.',
   'pending', NULL,
   NOW() - INTERVAL '14 days'),

  -- IN PROGRESS (9 tareas)
  ('Implementar filtro por estado en GET /api/tasks',
   'El parametro status debe filtrarse en SQL, no en memoria.',
   'in_progress', 2,
   NOW() - INTERVAL '29 days'),

  ('Corregir error 500 al eliminar tarea inexistente',
   'Debe retornar 404 con mensaje descriptivo.',
   'in_progress', 1,
   NOW() - INTERVAL '27 days'),

  ('Agregar skeleton loaders en el listado',
   'Mostrar placeholders mientras se cargan las tareas.',
   'in_progress', 3,
   NOW() - INTERVAL '25 days'),

  ('Implementar busqueda por título con debounce',
   'El parámetro q debe hacer ILIKE en PostgreSQL con debounce de 300ms.',
   'in_progress', 2,
   NOW() - INTERVAL '23 days'),

  ('Corregir foreign key al asignar categoría inexistente',
   'El backend retorna 500 en lugar de 400.',
   'in_progress', 1,
   NOW() - INTERVAL '21 days'),

  ('Refactorizar TasksRepository para separar queries',
   'Actualmente el servicio tiene queries directas mezcladas con logica.',
   'in_progress', 3,
   NOW() - INTERVAL '19 days'),

  ('Agregar campo updatedAt a la respuesta del API',
   NULL,
   'in_progress', NULL,
   NOW() - INTERVAL '17 days'),

  ('Implementar ordenamiento por título en GET /api/tasks',
   NULL,
   'in_progress', 2,
   NOW() - INTERVAL '15 days'),

  ('Configurar CORS en el backend para el frontend local',
   'Permitir origen http://localhost:5173 en desarrollo.',
   'in_progress', NULL,
   NOW() - INTERVAL '13 days'),

  -- COMPLETED (7 tareas)
  ('Crear estructura inicial del monorepo',
   'Carpetas backend y frontend con configuracion base.',
   'completed', NULL,
   NOW() - INTERVAL '31 days'),

  ('Configurar Docker Compose para PostgreSQL',
   'Imagen postgres:16-alpine con volumen persistente.',
   'completed', 3,
   NOW() - INTERVAL '29 days'),

  ('Definir schema de base de datos con Prisma',
   'Modelos Task y Category con enums, índices y trigger de updated_at.',
   'completed', 2,
   NOW() - INTERVAL '27 days'),

  ('Implementar POST /api/tasks con validacion Zod',
   'Titulo obligatorio, descripcion opcional, categoryId validado.',
   'completed', 2,
   NOW() - INTERVAL '25 days'),

  ('Corregir bug de CORS en preflight OPTIONS',
   'Las peticiones OPTIONS retornaban 404.',
   'completed', 1,
   NOW() - INTERVAL '23 days'),

  ('Agregar .gitignore con node_modules y .env',
   NULL,
   'completed', NULL,
   NOW() - INTERVAL '21 days'),

  ('Escribir seed.sql con 25 tareas de prueba',
   'Distribuidas entre los 3 estados y las 3 categorias.',
   'completed', 3,
   NOW() - INTERVAL '19 days');