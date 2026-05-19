import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    errorCode: string,
    errors?: any,
  ) {
    super(
      {
        success: false,
        statusCode,
        message,
        errorCode,
        errors: errors || null,
      },
      statusCode,
    );
  }
}