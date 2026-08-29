import { z } from 'zod';

// ENUM de estados — espejo del enum de PostgreSQL

export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed']);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// CREATE — POST /api/tasks
// Título obligatorio, descripción opcional, categoryId opcional
export const CreateTaskSchema = z.object({
  title: z
    .string({ required_error: 'El título es obligatorio.' })
    .trim()
    .min(1, 'El título no puede estar vacío.')
    .max(120, 'El título no puede superar los 120 caracteres.'),
  description: z
    .string()
    .max(2000, 'La descripción no puede superar los 2000 caracteres.')
    .nullable()
    .optional(),
  status: TaskStatusSchema.optional(),
  categoryId: z.number().int().positive().nullable().optional(),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

// UPDATE — PUT /api/tasks/:id
// Reemplaza título, descripción, estado y categoría completos.
// Todos los campos son obligatorios excepto description y categoryId
export const UpdateTaskSchema = z.object({
  title: z
    .string({ required_error: 'El título es obligatorio.' })
    .trim()
    .min(1, 'El título no puede estar vacío.')
    .max(120, 'El título no puede superar los 120 caracteres.'),
  description: z
    .string()
    .max(2000, 'La descripción no puede superar los 2000 caracteres.')
    .nullable()
    .optional(),
  status: TaskStatusSchema,
  categoryId: z.number().int().positive().nullable().optional(),
});

export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;

// PATCH — PATCH /api/tasks/:id
// Actualización parcial — todos los campos opcionales
export const PatchTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título no puede estar vacío.')
    .max(120, 'El título no puede superar los 120 caracteres.')
    .optional(),
  description: z
    .string()
    .max(2000, 'La descripción no puede superar los 2000 caracteres.')
    .nullable()
    .optional(),
  status: TaskStatusSchema.optional(),
  categoryId: z.number().int().positive().nullable().optional(),
});

export type PatchTaskDto = z.infer<typeof PatchTaskSchema>;

// QUERY PARAMS — GET /api/tasks
export const TaskQuerySchema = z.object({
  status: TaskStatusSchema.optional(),
  q: z.string().optional(),
  categoryId: z
    .string()
    .regex(/^\d+$/, 'categoryId debe ser un entero positivo.')
    .transform(Number)
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'page debe ser un entero positivo.')
    .transform(Number)
    .refine((val) => val >= 1, 'page debe ser mayor o igual a 1.')
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'limit debe ser un entero positivo.')
    .transform(Number)
    .refine((val) => val >= 1 && val <= 100, 'limit debe estar entre 1 y 100.')
    .optional()
    .default('10'),
  sort: z
    .enum(['createdAt', 'updatedAt', 'title'], {
      errorMap: () => ({
        message: 'sort debe ser createdAt, updatedAt o title.',
      }),
    })
    .optional()
    .default('createdAt'),
  order: z
    .enum(['asc', 'desc'], {
      errorMap: () => ({
        message: 'order debe ser asc o desc.',
      }),
    })
    .optional()
    .default('desc'),
});

export type TaskQueryDto = z.infer<typeof TaskQuerySchema>;

//RESPUESTA — TaskResponse
export type TaskResponse = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: { id: number; name: string; color: string } | null;
  createdAt: string;
  updatedAt: string;
};