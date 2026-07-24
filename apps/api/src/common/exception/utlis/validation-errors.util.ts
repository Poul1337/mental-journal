import { ValidationError } from 'class-validator';
import { FieldError } from '../interfaces/error-response';

export function mapValidationErrors(errors: ValidationError[]): FieldError[] {
  return errors.flatMap((error) => {
    const current = error.constraints
      ? Object.values(error.constraints).map((message) => ({
          field: error.property,
          message,
        }))
      : [];

    const nested = error.children?.length
      ? mapValidationErrors(error.children)
      : [];
    
    return [...current, ...nested];
  });
}