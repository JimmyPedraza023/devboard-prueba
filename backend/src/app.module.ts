import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [PrismaModule, TasksModule, CategoriesModule, HealthModule],
})
export class AppModule {}