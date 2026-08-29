import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../common/prisma/prisma.service';

import {
  CreateTaskDto,
  PatchTaskDto,
  TaskQueryDto,
  TaskStatus,
  UpdateTaskDto,
} from './dto/task.dto';

// Tipo generado por Prisma que incluye la relación category.
export type TaskWithCategory = Prisma.TaskGetPayload<{
  include: { category: true };
}>;

// Tipo explícito para las filas planas que devuelve el SQL raw.
type RawTaskRow = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  category_id: number | null;
  createdAt: Date;
  updatedAt: Date;

  cat_id: number | null;
  cat_name: string | null;
  cat_color: string | null;
  cat_createdAt: Date | null;
  cat_updatedAt: Date | null;
};

const SORT_COLUMN_MAP: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  title: 'title',
};

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  // FIND ALL — filtros, búsqueda, ordenamiento y paginación
  async findAll(
    query: TaskQueryDto,
  ): Promise<{
    tasks: TaskWithCategory[];
    total: number;
  }> {
    const {
      status,
      q,
      categoryId,
      page,
      limit,
      sort,
      order,
    } = query;

    const conditions: Prisma.Sql[] = [];

    if (status) {
      conditions.push(
        Prisma.sql`t.status = ${status}::task_status`,
      );
    }

    if (q) {
      conditions.push(
        Prisma.sql`t.title ILIKE ${'%' + q + '%'}`,
      );
    }

    if (categoryId !== undefined) {
      conditions.push(
        Prisma.sql`t.category_id = ${categoryId}`,
      );
    }

    const where =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(
            conditions,
            ' AND ',
          )}`
        : Prisma.empty;

    const sortColumn = SORT_COLUMN_MAP[sort];

    const orderDirection =
      order === 'asc'
        ? Prisma.sql`ASC`
        : Prisma.sql`DESC`;

    const offset = (page - 1) * limit;

    // MAIN QUERY 
    const rows = await this.prisma.$queryRaw<RawTaskRow[]>`
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.category_id,
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt",

        c.id AS "cat_id",
        c.name AS "cat_name",
        c.color AS "cat_color",
        c.created_at AS "cat_createdAt",
        c.updated_at AS "cat_updatedAt"

      FROM tasks t

      LEFT JOIN categories c
        ON c.id = t.category_id

      ${where}

      ORDER BY
        t.${Prisma.raw(sortColumn)}
        ${orderDirection}

      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // COUNT
    const countResult = await this.prisma.$queryRaw<
      [{ count: bigint }]
    >`
      SELECT COUNT(*) AS count
      FROM tasks t
      ${where}
    `;

    const total = Number(countResult[0].count);

    // RAW -> PRISMA
    const tasks: TaskWithCategory[] = rows.map((row) => {
      if (row.cat_id === null) {
        return {
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          categoryId: row.category_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          category: null,
        };
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        categoryId: row.category_id,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        category: {
          id: row.cat_id,
          name: row.cat_name!,
          color: row.cat_color!,
          createdAt: row.cat_createdAt!,
          updatedAt: row.cat_updatedAt!,
        },
      };
    });

    return {
      tasks,
      total,
    };
  }

  // FIND ONE
  async findOne(
    id: number,
  ): Promise<TaskWithCategory | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  // CREATE
  async create(
    dto: CreateTaskDto,
  ): Promise<TaskWithCategory> {
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

  // UPDATE — PUT
  async update(
    id: number,
    dto: UpdateTaskDto,
  ): Promise<TaskWithCategory> {
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

  // PATCH
  async patch(
    id: number,
    dto: PatchTaskDto,
  ): Promise<TaskWithCategory> {
    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && {
          title: dto.title,
        }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.status !== undefined && {
          status: dto.status,
        }),
        ...(dto.categoryId !== undefined && {
          categoryId: dto.categoryId,
        }),
      },
      include: { category: true },
    });
  }

  // DELETE
  async remove(id: number): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    });
  }
}