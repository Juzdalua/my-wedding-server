import { saveLogger } from '@/utils/save-logger';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse() as string | { message: string | string[]; error: string };

    const message = typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse.message;

    const error = typeof exceptionResponse === 'string' ? null : exceptionResponse['error'];

    saveLogger.error(`[${status}] ${message}\n`);

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message.join(', ') : message,
      error,
      statusCode: status
    });
  }
}
