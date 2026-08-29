import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../common/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check(@Res() res: Response): Promise<void> {
    let dbStatus = 'ok';
    let httpStatus = HttpStatus.OK;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
      httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
    }

    res.status(httpStatus).json({
      status: 'ok',
      database: dbStatus,
    });
  }
}