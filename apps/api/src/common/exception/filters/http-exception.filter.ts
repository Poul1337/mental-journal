import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import type { Request, Response } from "express";
import { buildErrorResponse, parseHttpException } from "../utlis/exception-response.util";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

    catch(exception: HttpException, host:ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const error =
          typeof exceptionResponse === 'object' &&
          exceptionResponse !== null &&
          'error' in exceptionResponse
              ? String((exceptionResponse as { error?: string }).error)
              : undefined;

      const { message, fieldErrors } = parseHttpException(exceptionResponse);

      return response.status(status).json(buildErrorResponse(status, message, request.url, fieldErrors, error))
    }
}