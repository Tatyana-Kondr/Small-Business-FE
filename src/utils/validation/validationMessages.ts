const validationMessages: Record<string, string> = {
  // Required
  "Can not be blank": "Bitte ausfüllen.",
  "Must not be empty": "Bitte ausfüllen.",
  "Can not be null": "Bitte ausfüllen.",

  // Оставляем для DTO/стандартных Jakarta-сообщений,
  // если где-то они ещё возвращаются
  "must not be blank": "Bitte ausfüllen.",
  "must not be empty": "Bitte ausfüllen.",
  "must not be null": "Bitte ausfüllen.",

  // Sale
  "The order must contain at least one item":
    "Der Auftrag muss mindestens eine Position enthalten.",

  // Dates
  "Date must be in the past or present":
    "Das Datum darf nicht in der Zukunft liegen.",

  "Date of the last purchase must be in the past or present":
    "Das Datum des letzten Einkaufs darf nicht in der Zukunft liegen.",

  // Numbers
  "must be greater than 0": "Der Wert muss größer als 0 sein.",

  "Value must be greater than or equal to 0.0":
    "Der Wert muss größer oder gleich 0 sein.",

  "Weight must be greater than or equal to 0.0":
    "Das Gewicht muss größer oder gleich 0 sein.",

  "Value must be greater than or equal to 0":
    "Der Wert muss größer oder gleich 0 sein.",

  "Value must be less than or equal to 100":
    "Der Wert muss kleiner oder gleich 100 sein.",

    "The value must not be negative.": "Der Wert darf nicht negativ sein.",

  // Product category
  "Category already exists": "Kategorie existiert bereits.",

  "Category article name already exists": "ArtName existiert bereits.",

  "Only letters (A-Z, a-z) and numbers (0-9) are allowed.":
  "Nur Buchstaben (A-Z, a-z) und Zahlen (0-9) sind erlaubt.",

  // Payment method / process
  "Process name must not exceed 30 characters":
    "Der Name des Zahlungsvorgangs darf maximal 30 Zeichen lang sein.",

  "Provider must not exceed 50 characters":
    "Der Provider darf maximal 50 Zeichen lang sein.",

  "Masked number must not exceed 30 characters":
    "Die maskierte Nummer darf maximal 30 Zeichen lang sein.",

  "Details must not exceed 50 characters":
    "Die Details dürfen maximal 50 Zeichen lang sein.",

  // Product / general text
  "Name contains invalid characters": "Ungültige Zeichen sind nicht erlaubt.",

  // Customer
  "Customer with the same name and address already exists":
    "Ein Kunde/Lieferant mit diesem Namen und dieser Adresse existiert bereits.",

  "The customer number already exists.":
    "Diese Kundennummer existiert bereits.",

  // Address / contact
  "Invalid postalCode": "Ungültige Postleitzahl.",

  "Invalid building number": "Ungültige Hausnummer.",

  "Invalid phone number": "Ungültige Telefonnummer.",

  "Email should be valid": "Ungültige E-Mail-Adresse.",

  "Website should be valid": "Ungültige Website-Adresse.",

  "This field can only contain letters, hyphens, spaces, apostrophes, periods, and German special characters (Ä, Ö, Ü, ä, ö, ü, ß).":
    "Dieses Feld darf nur Buchstaben, Bindestriche, Leerzeichen, Apostrophe, Punkte sowie deutsche Sonderzeichen (Ä, Ö, Ü, ä, ö, ü, ß) enthalten.",

  "Street name can only contain letters, numbers, hyphens, spaces, apostrophes, periods, and German special characters (Ä, Ö, Ü, ä, ö, ü, ß).":
    "Der Straßenname darf nur Buchstaben, Zahlen, Bindestriche, Leerzeichen, Apostrophe, Punkte sowie deutsche Sonderzeichen (Ä, Ö, Ü, ä, ö, ü, ß) enthalten.",
};

type ValidationMessageRule = {
  pattern: RegExp;
  translate: (match: RegExpMatchArray) => string;
};

const validationMessageRules: ValidationMessageRule[] = [
  // Name
  {
    pattern: /^Name must be between (\d+) and (\d+) characters$/,
    translate: (match) =>
      `Die Eingabe muss zwischen ${match[1]} und ${match[2]} Zeichen lang sein.`,
  },

  // Article
  {
    pattern: /^Article must be (\d+) characters$/,
    translate: (match) =>
      `Die Artikelnummer darf höchstens ${match[1]} Zeichen lang sein.`,
  },

  // Description
  {
    pattern: /^Description must be (\d+) characters$/,
    translate: (match) =>
      `Die Beschreibung darf höchstens ${match[1]} Zeichen lang sein.`,
  },

  // General size
  {
    pattern: /^Must be between (\d+) and (\d+) characters$/,
    translate: (match) =>
      `Die Eingabe muss zwischen ${match[1]} und ${match[2]} Zeichen lang sein.`,
  },

  // General max size
  {
    pattern: /^Cannot be more than (\d+) characters$/,
    translate: (match) =>
      `Die Eingabe darf höchstens ${match[1]} Zeichen lang sein.`,
  },

  // Customer number
  {
    pattern: /^Customer number must not exceed (\d+) characters$/,
    translate: (match) =>
      `Die Kundennummer darf höchstens ${match[1]} Zeichen lang sein.`,
  },

  // General digits
  {
    pattern:
      /^Value must have up to (\d+) integer digits and (\d+) fractional digits$/,
    translate: (match) =>
      `Der Wert darf höchstens ${match[1]} Stellen vor und ${match[2]} Stellen nach dem Komma haben.`,
  },

  // Quantity
  {
    pattern:
      /^Quantity must have up to (\d+) integer digits and (\d+) fractional digits$/,
    translate: (match) =>
      `Die Menge darf höchstens ${match[1]} Stellen vor und ${match[2]} Stellen nach dem Komma haben.`,
  },

  // Price
  {
    pattern:
      /^Price must have up to (\d+) integer digits and (\d+) fractional digits$/,
    translate: (match) =>
      `Der Preis darf höchstens ${match[1]} Stellen vor und ${match[2]} Stellen nach dem Komma haben.`,
  },

  // Amount
  {
    pattern:
      /^Amount must have up to (\d+) integer digits and (\d+) fractional digits$/,
    translate: (match) =>
      `Der Betrag darf höchstens ${match[1]} Stellen vor und ${match[2]} Stellen nach dem Komma haben.`,
  },

  // Weight
  {
    pattern:
      /^Weight must have up to (\d+) integer digits and (\d+) fractional digits$/,
    translate: (match) =>
      `Das Gewicht darf höchstens ${match[1]} Stellen vor und ${match[2]} Stellen nach dem Komma haben.`,
  },

  // Fallback для стандартных Jakarta-сообщений,
  // если они ещё где-то встречаются
  {
    pattern: /^must be greater than or equal to (.+)$/,
    translate: (match) => `Der Wert muss größer oder gleich ${match[1]} sein.`,
  },

  {
    pattern: /^must be less than or equal to (.+)$/,
    translate: (match) => `Der Wert muss kleiner oder gleich ${match[1]} sein.`,
  },
];

export function translateValidationMessage(message: string): string {
  const normalizedMessage = message.trim();

  const exactTranslation = validationMessages[normalizedMessage];

  if (exactTranslation) {
    return exactTranslation;
  }

  for (const rule of validationMessageRules) {
    const match = normalizedMessage.match(rule.pattern);

    if (match) {
      return rule.translate(match);
    }
  }

  return normalizedMessage;
}
