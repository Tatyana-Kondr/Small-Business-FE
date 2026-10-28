
import { errorMap } from "./errorMap";

type FieldError = {
  field: string;
  message: string;
};

export function getFieldErrors(
  data: unknown,
  allowedFields: readonly string[]
): Record<string, string> {
  if (typeof data !== "object" || data === null) {
    return {};
  }

  const response = data as Record<string, unknown>;

  if (!Array.isArray(response.errors)) {
    return {};
  }

  const result: Record<string, string> = {};

  for (const item of response.errors) {
    if (
      typeof item !== "object" ||
      item === null
    ) {
      continue;
    }

    const error = item as Partial<FieldError>;

    if (
      typeof error.field !== "string" ||
      typeof error.message !== "string"
    ) {
      continue;
    }

    if (!allowedFields.includes(error.field)) {
      continue;
    }

    result[error.field] =
      errorMap[error.message] ?? error.message;
  }

  return result;
}
