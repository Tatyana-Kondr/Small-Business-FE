export interface ValidationErrorDto {
  field: string;
  rejectedValue?: string;
  message: string;
}

export interface ValidationErrorsDto {
  errors: ValidationErrorDto[];
}