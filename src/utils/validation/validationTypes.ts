export interface ValidationErrorDto {
  field: string;
  message: string;
}

export interface ValidationErrorsDto {
  errors: ValidationErrorDto[];
}