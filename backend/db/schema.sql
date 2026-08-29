-- Script idempotente de creación del esquema de DevBoard.
-- Puede ejecutarse sobre una base de datos vacía o existente sin errores.
-- Fuente de verdad: prisma/schema.prisma (las migraciones de Prisma son
-- la fuente autoritativa).

-- TIPOS

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL; 
END $$;

-- TABLAS

CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(50)  NOT NULL UNIQUE,
  color VARCHAR(7)   NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(120)  NOT NULL,
  description TEXT,
  status      task_status   NOT NULL DEFAULT 'pending',
  category_id INTEGER       REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  created_at  TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES

CREATE INDEX IF NOT EXISTS tasks_status_idx      ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_category_id_idx ON tasks(category_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx  ON tasks(created_at);
CREATE INDEX IF NOT EXISTS tasks_updated_at_idx  ON tasks(updated_at);
CREATE INDEX IF NOT EXISTS tasks_title_idx       ON tasks(title);

-- TRIGGER: updated_at
-- Se implementa en PostgreSQL y no en la capa de aplicación para garantizar
-- que cualquier UPDATE actualice el campo independientemente del origen.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_set_updated_at ON tasks;

CREATE TRIGGER tasks_set_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();