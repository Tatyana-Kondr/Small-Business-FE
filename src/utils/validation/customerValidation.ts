import {
  POSTAL_CODE_REGEX,
  CITY_REGEX,
  STREET_REGEX,
  BUILDING_REGEX,
  PHONE_REGEX,
  EMAIL_REGEX,
  WEBSITE_REGEX,
} from "../regex";

export type CustomerAddressFields = {
  postalCode: string;
  country: string;
  city: string;
  street: string;
  building: string;
};

export type CustomerContactFields = {
  phone: string;
  email: string;
  website: string;
};

export type CustomerSharedFields =
  CustomerAddressFields & CustomerContactFields;

export type CustomerSharedErrors = Partial<
  Record<keyof CustomerSharedFields, string>
>;

export function validateCustomerSharedFields(
  fields: CustomerSharedFields,
): CustomerSharedErrors {
  const errors: CustomerSharedErrors = {};

  const postalCode = fields.postalCode.trim();
  const country = fields.country.trim();
  const city = fields.city.trim();
  const street = fields.street.trim();
  const building = fields.building.trim();
  const phone = fields.phone.trim();
  const email = fields.email.trim();
  const website = fields.website.trim();

  // Land — Pflichtfeld
  if (!country) {
    errors.country = "Bitte ausfüllen";
  }

  // Postleitzahl — optional
  if (postalCode) {
    if (postalCode.length < 4 || postalCode.length > 10) {
      errors.postalCode = "Die Eingabe muss zwischen 4 und 10 Zeichen lang sein.";
    } else if (!POSTAL_CODE_REGEX.test(postalCode)) {
      errors.postalCode = "Ungültige Postleitzahl.";
    }
  }

  // Stadt — optional
  if (city) {
    if (city.length < 2 || city.length > 50) {
      errors.city =  "Die Eingabe muss zwischen 2 und 50 Zeichen lang sein.";
    } else if (!CITY_REGEX.test(city)) {
      errors.city = "Der Stadtname enthält ungültige Zeichen.";
    }
  }

  // Straße — optional
  if (street) {
    if (street.length < 3 || street.length > 100) {
      errors.street =  "Die Eingabe muss zwischen 3 und 100 Zeichen lang sein.";
    } else if (!STREET_REGEX.test(street)) {
      errors.street = "Der Straßenname enthält ungültige Zeichen.";
    }
  }

  // Hausnummer — optional
  if (building) {
    if (building.length > 6) {
      errors.building = "Die Hausnummer darf maximal 6 Zeichen lang sein.";
    } else if (!BUILDING_REGEX.test(building)) {
      errors.building = "Die Hausnummer enthält ungültige Zeichen.";
    }
  }

  // Telefonnummer — optional
  if (phone && !PHONE_REGEX.test(phone)) {
    errors.phone = "Ungültige Telefonnummer.";
  }

  // E-Mail — optional
  if (email && !EMAIL_REGEX.test(email)) {
    errors.email = "Ungültige E-Mail-Adresse.";
  }

  // Website — optional
  if (website && !WEBSITE_REGEX.test(website)) {
    errors.website = "Ungültige Website-Adresse.";
  }

  return errors;
}