import { translateValidationMessage } from "./validationMessages";
import type { ValidationErrorDto, ValidationErrorsDto } from "./validationTypes";

export const REQUIRED_FIELD_MESSAGE = "Bitte ausfüllen";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function isBackendValidationErrors(
  error: unknown
): error is ValidationErrorsDto {
  return (
    typeof error === "object" &&
    error !== null &&
    Array.isArray((error as ValidationErrorsDto).errors)
  );
}

export function backendErrorsToFormErrors<T>(
  errors: ValidationErrorDto[]
): FormErrors<T> {
  const result: FormErrors<T> = {};

  errors.forEach((error) => {
    result[error.field as keyof T] =
      translateValidationMessage(error.message);
  });

  return result;
}

export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (typeof value === "number") {
    return value === 0;
  }

  if (typeof value === "object" && "id" in value) {
    return Number((value as { id?: number }).id) === 0;
  }

  return false;
}

export function validateRequiredFields<T extends object>(
  values: T,
  fields: Array<keyof T>
): FormErrors<T> {
  const errors: FormErrors<T> = {};

  fields.forEach((field) => {
    if (isEmptyValue(values[field])) {
      errors[field] = REQUIRED_FIELD_MESSAGE;
    }
  });

  return errors;
}

export function hasErrors<T>(errors: FormErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}

export function clearFieldError<T>(
  errors: FormErrors<T>,
  field: keyof T
): FormErrors<T> {
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}