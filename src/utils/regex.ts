export const PHONE_REGEX = /^$|^\+?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
export const EMAIL_REGEX = /^$|^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/;
export const IBAN_DE_REGEX = /^DE\d{20}$/;
export const VAT_REGEX = /^DE[0-9]{9}$/;
export const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s&'’‘\-/,\.]+$/;
export const POSTAL_CODE_REGEX = /^([A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}|\d{5}(-\d{4})?|[A-Z]\d[A-Z] \d[A-Z]\d|\d{4}|\d{4} [A-Z]{2}|\d{3} \d{2}|\d{5})$/;
export const CITY_REGEX = /^[A-Za-zÄÖÜäöüß\-\s'\.]+$/;
export const WEBSITE_REGEX = /^$|^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;