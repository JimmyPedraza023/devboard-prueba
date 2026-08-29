import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  PatchTaskSchema,
  TaskQuerySchema,
  CreateTaskDto,
  UpdateTaskDto,
  PatchTaskDto,
  TaskQueryDto,
} from './dto/task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // GET /api/tasks
  @Get()
  findAll(
    @Query(new ZodValidationPipe(TaskQuerySchema)) query: TaskQueryDto,
  ) {
    return this.tasksService.findAll(query);
  }

  // GET /api/tasks/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  // POST /api/tasks
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(CreateTaskSchema)) dto: CreateTaskDto,
  ) {
    return this.tasksService.create(dto);
  }

  // PUT /api/tasks/:id
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateTaskSchema)) dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, dto);
  }

  // PATCH /api/tasks/:id
  @Patch(':id')
  patch(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(PatchTaskSchema)) dto: PatchTaskDto,
  ) {
    return this.tasksService.patch(id, dto);
  }

  // DELETE /api/tasks/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}