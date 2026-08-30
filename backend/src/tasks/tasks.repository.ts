import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  PatchTaskDto,
  TaskQueryDto,
} from './dto/task.dto';
import { Prisma } from '@prisma/client';

// Tipo que incluye la relación category
export type TaskWithCategory = Prisma.TaskGetPayload<{
  include: { category: true };
}>;

// Mapa explícito de campos del API a columnas de PostgreSQL
const SORT_COLUMN_MAP: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  title: 'title',
};

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  // FIND ALL — con filtros, ordenamiento y paginación
  // Se usa SQL raw para manejar condiciones opcionales múltiples
  async findAll(query: TaskQueryDto): Promise<{ tasks: TaskWithCategory[]; total: number }> {
    const { status, q, categoryId, page, limit, sort, order } = query;

    const conditions: Prisma.Sql[] = [];

    if (status) {
      conditions.push(Prisma.sql`t.status = ${status}::task_status`);
    }

    if (q) {
      conditions.push(Prisma.sql`t.title ILIKE ${'%' + q + '%'}`);
    }

    if (categoryId) {
      conditions.push(Prisma.sql`t.category_id = ${categoryId}`);
    }

    const where =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const sortColumn = SORT_COLUMN_MAP[sort];
    const orderDirection = order === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    const offset = (page - 1) * limit;

    // Query principal con JOIN para traer la categoría
    const tasks = await this.prisma.$queryRaw<TaskWithCategory[]>`
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.category_id,
        t.created_at   AS "createdAt",
        t.updated_at   AS "updatedAt",
        c.id           AS "cat_id",
        c.name         AS "cat_name",
        c.color        AS "cat_color"
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      ${where}
      ORDER BY t.${Prisma.raw(sortColumn)} ${orderDirection}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) AS count
      FROM tasks t
      ${where}
    `;

    const total = Number(countResult[0].count);

    // Mapear las columnas planas del JOIN al objeto anidado category
    const mapped = tasks.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      categoryId: row.category_id,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      category: row.cat_id
        ? { id: row.cat_id, name: row.cat_name, color: row.cat_color }
        : null,
    }));

    return { tasks: mapped as unknown as TaskWithCategory[], total };
  }

  // FIND ONE
  async findOne(id: number): Promise<TaskWithCategory | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  // CREATE
  async create(dto: CreateTaskDto): Promise<TaskWithCategory> {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status ?? 'pending',
        categoryId: dto.categoryId ?? null,
      },
      include: { category: true },
    });
  }

  // UPDATE — reemplaza todos los campos (PUT)
  async update(id: number, dto: UpdateTaskDto): Promise<TaskWithCategory> {
    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status,
        categoryId: dto.categoryId ?? null,
      },
      include: { category: true },
    });
  }

  // PATCH — actualización parcial
  async patch(id: number, dto: PatchTaskDto): Promise<TaskWithCategory> {
    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
      },
      include: { category: true },
    });
  }

  // DELETE
  async remove(id: number): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}