import { Injectable } from '@nestjs/common';
import { CategoriesRepository, CategoryResponse } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<CategoryResponse[]> {
    return this.categoriesRepository.findAll();
  }
}