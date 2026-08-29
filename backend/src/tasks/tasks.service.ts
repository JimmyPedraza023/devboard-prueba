import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  TasksRepository,
  TaskWithCategory,
} from './tasks.repository';

import { PrismaService } from '../common/prisma/prisma.service';

import {
  CreateTaskDto,
  PatchTaskDto,
  TaskQueryDto,
  TaskResponse,
  UpdateTaskDto,
} from './dto/task.dto';

// Tipo explícito para la metadata de paginación.
type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly prisma: PrismaService,
  ) {}

  // FIND ALL
  async findAll(
    query: TaskQueryDto,
  ): Promise<{
    data: TaskResponse[];
    meta: PaginationMeta;
  }> {
    const { tasks, total } =
      await this.tasksRepository.findAll(query);

    const totalPages = Math.ceil(
      total / query.limit,
    );

    return {
      data: tasks.map((task) =>
        this.toResponse(task),
      ),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  // FIND ONE
  async findOne(id: number): Promise<TaskResponse> {
    const task =
      await this.tasksRepository.findOne(id);

    if (!task) {
      throw new NotFoundException(
        `No existe una tarea con el id ${id}.`,
      );
    }

    return this.toResponse(task);
  }

  // CREATE
  async create(
    dto: CreateTaskDto,
  ): Promise<TaskResponse> {
    if (
      dto.categoryId !== undefined &&
      dto.categoryId !== null
    ) {
      await this.assertCategoryExists(
        dto.categoryId,
      );
    }

    const task =
      await this.tasksRepository.create(dto);

    return this.toResponse(task);
  }

  // UPDATE — PUT
  async update(
    id: number,
    dto: UpdateTaskDto,
  ): Promise<TaskResponse> {
    await this.assertTaskExists(id);

    if (
      dto.categoryId !== undefined &&
      dto.categoryId !== null
    ) {
      await this.assertCategoryExists(
        dto.categoryId,
      );
    }

    const task =
      await this.tasksRepository.update(id, dto);

    return this.toResponse(task);
  }

  // PATCH
  async patch(
    id: number,
    dto: PatchTaskDto,
  ): Promise<TaskResponse> {
    await this.assertTaskExists(id);

    if (
      dto.categoryId !== undefined &&
      dto.categoryId !== null
    ) {
      await this.assertCategoryExists(
        dto.categoryId,
      );
    }

    const task =
      await this.tasksRepository.patch(id, dto);

    return this.toResponse(task);
  }

  // DELETE
  async remove(id: number): Promise<void> {
    await this.assertTaskExists(id);

    await this.tasksRepository.remove(id);
  }

  // HELPERS PRIVADOS
  private async assertTaskExists(
    id: number,
  ): Promise<void> {
    const task =
      await this.tasksRepository.findOne(id);

    if (!task) {
      throw new NotFoundException(
        `No existe una tarea con el id ${id}.`,
      );
    }
  }

  private async assertCategoryExists(
    categoryId: number,
  ): Promise<void> {
    const category =
      await this.prisma.category.findUnique({
        where: { id: categoryId },
      });

    if (!category) {
      throw new BadRequestException(
        `No existe una categoría con el id ${categoryId}.`,
      );
    }
  }

  // MAPEO A RESPUESTA DEL API
  private toResponse(
    task: TaskWithCategory,
  ): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,

      category: task.category
        ? {
            id: task.category.id,
            name: task.category.name,
            color: task.category.color,
          }
        : null,

      createdAt:
        task.createdAt.toISOString(),

      updatedAt:
        task.updatedAt.toISOString(),
    };
  }
}