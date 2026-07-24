import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { DomainException } from "../domain.exception";
import type { Response, Request } from "express";
import { buildErrorResponse } from "../utlis/exception-response.util";

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {

    catch(exception: DomainException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = HttpStatus.BAD_REQUEST;

        return response.status(status).json(
            buildErrorResponse(
                status,
                exception.message,
                request.url,
                null,
                "Bad Request"
            )
        )
    }
}