import { translateValidationMessage } from "./validationMessages";

const QUANTITY_INTEGER_DIGITS = 6;
const QUANTITY_FRACTION_DIGITS = 3;

const MONEY_INTEGER_DIGITS = 10;
const MONEY_FRACTION_DIGITS = 2;

function hasMaxDigits(
  value: number,
  maxIntegerDigits: number,
  maxFractionDigits: number
): boolean {
  if (!Number.isFinite(value)) {
    return false;
  }

  const normalized = Math.abs(value).toString();
  const [integerPart, fractionPart = ""] = normalized.split(".");

  return (
    integerPart.length <= maxIntegerDigits &&
    fractionPart.length <= maxFractionDigits
  );
}

export function validateQuantity(
  value: number
): string | undefined {
  if (!Number.isFinite(value) || value < 0.001) {
    return translateValidationMessage(
      "must be greater than 0"
    );
  }

  if (
    !hasMaxDigits(
      value,
      QUANTITY_INTEGER_DIGITS,
      QUANTITY_FRACTION_DIGITS
    )
  ) {
    return translateValidationMessage(
      `Quantity must have up to ${QUANTITY_INTEGER_DIGITS} integer digits and ${QUANTITY_FRACTION_DIGITS} fractional digits`
    );
  }

  return undefined;
}

export function validatePrice(
  value: number
): string | undefined {
  if (!Number.isFinite(value) || value < 0) {
    return translateValidationMessage(
      "Value must be greater than or equal to 0.0"
    );
  }

  if (
    !hasMaxDigits(
      value,
      MONEY_INTEGER_DIGITS,
      MONEY_FRACTION_DIGITS
    )
  ) {
    return translateValidationMessage(
      `Price must have up to ${MONEY_INTEGER_DIGITS} integer digits and ${MONEY_FRACTION_DIGITS} fractional digits`
    );
  }

  return undefined;
}

export function validateAmountDigits(
  value: number
): string | undefined {
  if (
    !hasMaxDigits(
      value,
      MONEY_INTEGER_DIGITS,
      MONEY_FRACTION_DIGITS
    )
  ) {
    return translateValidationMessage(
      `Amount must have up to ${MONEY_INTEGER_DIGITS} integer digits and ${MONEY_FRACTION_DIGITS} fractional digits`
    );
  }

  return undefined;
}

export function validatePercentage(
  value: number
): string | undefined {
  if (!Number.isFinite(value) || value < 0) {
    return translateValidationMessage(
      "Value must be greater than or equal to 0.0"
    );
  }

  if (value > 100) {
    return translateValidationMessage(
      "must be less than or equal to 100.0"
    );
  }

  return undefined;
}

export function validateWeight(value: number): string | undefined {
  if (!Number.isFinite(value) || value < 0) {
    return translateValidationMessage(
      "Value must be greater than or equal to 0.0"
    );
  }

  if (!hasMaxDigits(value, 5, 3)) {
    return translateValidationMessage(
      "Weight must have up to 5 integer digits and 3 fractional digits"
    );
  }

  return undefined;
}

export function validateDimension(value: number): string | undefined {
  if (!Number.isFinite(value) || value < 0) {
    return translateValidationMessage(
      "Value must be greater than or equal to 0.0"
    );
  }

  if (!hasMaxDigits(value, 5, 2)) {
    return translateValidationMessage(
      "Value must have up to 5 integer digits and 2 fractional digits"
    );
  }

  return undefined;
}