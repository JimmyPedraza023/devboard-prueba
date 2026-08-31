import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { TasksService } from '../src/tasks/tasks.service'

// Mocks de las dependencias del service
const mockRepository = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  patch: vi.fn(),
  remove: vi.fn(),
}

const mockPrisma = {
  category: {
    findUnique: vi.fn(),
  },
}

function makeService() {
  return new TasksService(
    mockRepository as any,
    mockPrisma as any,
  )
}

// Tarea de ejemplo que devuelve el repositorio
const mockTask = {
  id: 1,
  title: 'Tarea de prueba',
  description: null,
  status: 'pending' as const,
  category: null,
  categoryId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

describe('TasksService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  //CREATE 

  describe('create', () => {
    it('crea una tarea y retorna la respuesta mapeada', async () => {
      mockRepository.create.mockResolvedValue(mockTask)

      const service = makeService()
      const result = await service.create({ title: 'Tarea de prueba' })

      expect(mockRepository.create).toHaveBeenCalledWith({ title: 'Tarea de prueba' })
      expect(result).toMatchObject({
        id: 1,
        title: 'Tarea de prueba',
        status: 'pending',
        category: null,
      })
    })

    it('lanza BadRequestException si el categoryId no existe en la BD', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null)

      const service = makeService()

      await expect(
        service.create({ title: 'Tarea', categoryId: 999 }),
      ).rejects.toThrow(BadRequestException)

      // El repositorio no debe llamarse si la categoría no existe
      expect(mockRepository.create).not.toHaveBeenCalled()
    })

    it('crea la tarea correctamente cuando el categoryId existe', async () => {
      const category = { id: 1, name: 'Bug', color: '#ff0000' }
      mockPrisma.category.findUnique.mockResolvedValue(category)
      mockRepository.create.mockResolvedValue({ ...mockTask, category, categoryId: 1 })

      const service = makeService()
      const result = await service.create({ title: 'Tarea con categoría', categoryId: 1 })

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(result.category).toMatchObject({ id: 1, name: 'Bug' })
    })
  })

  //FIND ONE 

  describe('findOne', () => {
    it('retorna la tarea mapeada cuando existe', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask)

      const service = makeService()
      const result = await service.findOne(1)

      expect(mockRepository.findOne).toHaveBeenCalledWith(1)
      expect(result).toMatchObject({
        id: 1,
        title: 'Tarea de prueba',
        status: 'pending',
      })
      // Las fechas deben serializarse a ISO string
      expect(typeof result.createdAt).toBe('string')
      expect(typeof result.updatedAt).toBe('string')
    })

    it('lanza NotFoundException cuando la tarea no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      const service = makeService()

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
    })
  })
})