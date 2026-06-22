import { HttpStatus } from "@nestjs/common";
import { ErrorResponse, FieldError } from "./error-response";

export function buildErrorResponse(
    status: number,
    message: string,
    path: string,
    fieldErrors: FieldError[] | null,
    error?: string,
): ErrorResponse {
    return {
        status,
        error: error ?? String(HttpStatus[status] ?? "Error"),
        message,
        path,
        timestamp: new Date().toISOString(),
        fieldErrors,
      };
}

export function parseHttpException(response: string | object): {
    message: string,
    fieldErrors: FieldError[] | null
} {

    if (typeof response === 'string') {
        return { message: response, fieldErrors: null };
    }

    const res = response as Record<string, unknown>;
    const rawMessage = res.message;
    
    if (Array.isArray(rawMessage)) {
        return {
            message: 'Validation failed',
            fieldErrors: rawMessage.map((msg) => ({
            field: 'unknown',
            message: String(msg),
            })),
        };
    }

    return {
        message: String(rawMessage ?? res.error ?? 'Error'),
        fieldErrors: null,
    };
}