import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        issue: err.message,
      }));

      throw new BadRequestException({
        message: 'Error de validación en los datos enviados.',
        details,
      });
    }

    return result.data;
  }
}