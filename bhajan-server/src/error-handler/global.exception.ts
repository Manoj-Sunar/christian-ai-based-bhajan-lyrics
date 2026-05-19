import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let errors: any = null;

    // ✅ HTTP Exception
    if (exception instanceof HttpException) {
      const response: any = exception.getResponse();

      statusCode = exception.getStatus();
      message = response?.message || exception.message;
      errorCode = response?.errorCode || 'HTTP_EXCEPTION';
      errors = response?.errors || null;
    }

    // ✅ Validation Error (class-validator)
    if ((exception as any)?.response?.message instanceof Array) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      errorCode = 'VALIDATION_ERROR';
      errors = (exception as any).response.message;
    }

    // ✅ Mongo Duplicate
    if ((exception as any)?.code === 11000) {
      statusCode = HttpStatus.CONFLICT;
      message = 'Duplicate field value';
      errorCode = 'DUPLICATE_KEY';
      errors = exception;
    }

    // ✅ Log (with more context)
    this.logger.error(
      `${req.method} ${req.url}`,
      JSON.stringify({
        body: req.body,
        params: req.params,
        query: req.query,
      }),
    );

    console.error(exception);

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      errors,
    });
  }
}