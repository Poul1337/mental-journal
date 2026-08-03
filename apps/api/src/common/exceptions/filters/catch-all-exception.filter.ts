import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { buildErrorResponse } from '../utlis/exception-response.util';

@Catch()
export class CatchAllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CatchAllExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(`Unexpected error on ${request.url}`, exception);

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    return response
      .status(status)
      .json(
        buildErrorResponse(
          status,
          'Internal server error',
          request.url,
          null,
          'Internal Server Error',
        ),
      );
  }
}
