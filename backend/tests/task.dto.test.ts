import { describe, it, expect } from 'vitest'
import {
  CreateTaskSchema,
  TaskQuerySchema,
  PatchTaskSchema,
} from '../src/tasks/dto/task.dto'

describe('Validaciones de DTOs (sección 6.3)', () => {

  //CREATE TASK 

  describe('CreateTaskSchema', () => {
    it('acepta un payload mínimo válido con solo el título', () => {
      const result = CreateTaskSchema.safeParse({ title: 'Tarea válida' })
      expect(result.success).toBe(true)
    })

    it('rechaza un título vacío', () => {
      const result = CreateTaskSchema.safeParse({ title: '' })
      expect(result.success).toBe(false)
    })

    it('rechaza un título de solo espacios (trim)', () => {
      const result = CreateTaskSchema.safeParse({ title: '   ' })
      expect(result.success).toBe(false)
    })

    it('rechaza un título que supera los 120 caracteres', () => {
      const result = CreateTaskSchema.safeParse({ title: 'a'.repeat(121) })
      expect(result.success).toBe(false)
    })

    it('acepta un título de exactamente 120 caracteres', () => {
      const result = CreateTaskSchema.safeParse({ title: 'a'.repeat(120) })
      expect(result.success).toBe(true)
    })

    it('rechaza un status con valor fuera del enum', () => {
      const result = CreateTaskSchema.safeParse({
        title: 'Tarea',
        status: 'done',
      })
      expect(result.success).toBe(false)
    })

    it('acepta categoryId null explícito', () => {
      const result = CreateTaskSchema.safeParse({
        title: 'Tarea',
        categoryId: null,
      })
      expect(result.success).toBe(true)
    })

    it('ignora campos extra sin rechazar el request (strip mode)', () => {
      const result = CreateTaskSchema.safeParse({
        title: 'Tarea',
        campoDesconocido: 'valor',
      })
      expect(result.success).toBe(true)
      // El campo extra no debe aparecer en el output
      expect((result as any).data).not.toHaveProperty('campoDesconocido')
    })
  })

  //QUERY PARAMS 

  describe('TaskQuerySchema', () => {
    it('aplica valores por defecto cuando no se pasan params', () => {
      const result = TaskQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(10)
        expect(result.data.sort).toBe('createdAt')
        expect(result.data.order).toBe('desc')
      }
    })

    it('transforma page de string a número', () => {
      const result = TaskQuerySchema.safeParse({ page: '3' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(3)
      }
    })

    it('rechaza un status inválido en query params', () => {
      const result = TaskQuerySchema.safeParse({ status: 'archivado' })
      expect(result.success).toBe(false)
    })

    it('rechaza limit fuera del rango permitido (> 100)', () => {
      const result = TaskQuerySchema.safeParse({ limit: '101' })
      expect(result.success).toBe(false)
    })

    it('rechaza un valor de sort no permitido', () => {
      const result = TaskQuerySchema.safeParse({ sort: 'nombre' })
      expect(result.success).toBe(false)
    })
  })

  //PATCH TASK 

  describe('PatchTaskSchema', () => {
    it('acepta un payload vacío (todos los campos opcionales)', () => {
      const result = PatchTaskSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('rechaza un título vacío aunque sea parcial', () => {
      const result = PatchTaskSchema.safeParse({ title: '' })
      expect(result.success).toBe(false)
    })

    it('acepta actualizar solo el status', () => {
      const result = PatchTaskSchema.safeParse({ status: 'completed' })
      expect(result.success).toBe(true)
    })
  })
})