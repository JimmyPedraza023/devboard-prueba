import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message, details } = this.extractError(exception, request);

    response.status(status).json({
      error: {
        code,
        message,
        ...(details.length > 0 && { details }),
      },
    });
  }

  private extractError(
    exception: unknown,
    request: Request,
  ): { status: number; code: string; message: string; details: unknown[] } {
    // Errores HTTP conocidos lanzados por NestJS o por nosotros
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'details' in exceptionResponse
      ) {
        const res = exceptionResponse as {
          message: string;
          details: unknown[];
        };
        return {
          status,
          code: this.codeFromStatus(status),
          message: res.message,
          details: res.details,
        };
      }

      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message: string }).message ??
            exception.message;

      return {
        status,
        code: this.codeFromStatus(status),
        message,
        details: [],
      };
    }

    // Cualquier error no controlado → 500
    console.error(`[${request.method}] ${request.url}`, exception);

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocurrió un error inesperado en el servidor.',
      details: [],
    };
  }

  private codeFromStatus(status: number): string {
    const codes: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      404: 'NOT_FOUND',
      503: 'SERVICE_UNAVAILABLE',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codes[status] ?? 'INTERNAL_SERVER_ERROR';
  }
}