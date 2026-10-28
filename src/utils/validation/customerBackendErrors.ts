import { translateValidationMessage } from "./validationMessages";

export type CustomerValidationField =
  | "name"
  | "customerNumber"
  | "postalCode"
  | "country"
  | "city"
  | "street"
  | "building"
  | "phone"
  | "email"
  | "website";

export type CustomerValidationErrors = Partial<
  Record<CustomerValidationField, string>
>;

export type BackendFieldError = {
  field: string;
  message: string;
};

const fieldMap: Record<string, CustomerValidationField> = {
  name: "name",
  customerNumber: "customerNumber",

  "addressDto.postalCode": "postalCode",
  "addressDto.country": "country",
  "addressDto.city": "city",
  "addressDto.street": "street",
  "addressDto.building": "building",

  phone: "phone",
  email: "email",
  website: "website",
};

export function mapCustomerBackendErrors(
  backendErrors: BackendFieldError[],
): {
  fieldErrors: CustomerValidationErrors;
  unmappedErrors: string[];
} {
  const fieldErrors: CustomerValidationErrors = {};
  const unmappedErrors: string[] = [];

  backendErrors.forEach(({ field, message }) => {
    const mappedField = fieldMap[field];
    const translatedMessage = translateValidationMessage(message);

    if (mappedField) {
      fieldErrors[mappedField] = translatedMessage;
    } else {
      unmappedErrors.push(translatedMessage);
    }
  });

  return {
    fieldErrors,
    unmappedErrors,
  };
}