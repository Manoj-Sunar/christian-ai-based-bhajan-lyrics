import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class ErrorUtil {
  static badRequest(message: string, errors?: any) {
    return new AppException(message, HttpStatus.BAD_REQUEST, 'BAD_REQUEST', errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppException(message, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new AppException(message, HttpStatus.FORBIDDEN, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new AppException(message, HttpStatus.NOT_FOUND, 'NOT_FOUND');
  }

  static conflict(message = 'Conflict error') {
    return new AppException(message, HttpStatus.CONFLICT, 'CONFLICT');
  }

  static internal(message="Internal error"){
    return new AppException(message,HttpStatus.INTERNAL_SERVER_ERROR,'INTERNAL');
  }
}