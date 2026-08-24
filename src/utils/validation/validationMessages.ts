const validationMessages: Record<string, string> = {
  "must not be blank": "Bitte ausfüllen.",
  "must not be empty": "Bitte ausfüllen.",
  "must not be null": "Bitte ausfüllen.",

  "Name contains invalid characters":
    "Ungültige Zeichen sind nicht erlaubt.",

  "Price must be greater than or equal to 0.0":
    "Der Preis muss größer oder gleich 0 sein.",

  "Weight must be greater than or equal to 0.0":
    "Das Gewicht muss größer oder gleich 0 sein.",

  "Date of the last purchase must be in the past or present":
    "Das Datum des letzten Einkaufs darf nicht in der Zukunft liegen.",

  "Invalid postalCode":
    "Ungültige Postleitzahl.",

  "Invalid building number":
    "Ungültige Hausnummer.",

  "Invalid phone number":
    "Ungültige Telefonnummer.",

  "Email should be valid":
    "Ungültige E-Mail-Adresse.",

  "Website should be valid":
    "Ungültige Website-Adresse.",

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
  {
    pattern: /^Article must be (\d+) characters$/,
    translate: (match) =>
      `Die Artikelnummer darf höchstens ${match[1]} Zeichen lang sein.`,
  },

  {
  pattern: /^Name must be between (\d+) and (\d+) characters$/,
  translate: (match) =>
    `Die Eingabe muss zwischen ${match[1]} und ${match[2]} Zeichen lang sein.`,
},

  {
    pattern: /^Description must be (\d+) characters$/,
    translate: (match) =>
      `Die Beschreibung darf höchstens ${match[1]} Zeichen lang sein.`,
  },

  {
    pattern: /^Cannot be more than (\d+) characters$/,
    translate: (match) =>
      `Die Eingabe darf höchstens ${match[1]} Zeichen lang sein.`,
  },

  {
    pattern:
      /^Price must have up to (\d+) integer digits and (\d+) fractional digits$/,
    translate: (match) =>
      `Der Preis darf höchstens ${match[1]} Stellen vor und ${match[2]} Stellen nach dem Komma haben.`,
  },

  {
    pattern:
      /^Weight must have up to (\d+) integer digits and (\d+) fractional digits$/,
    translate: (match) =>
      `Das Gewicht darf höchstens ${match[1]} Stellen vor und ${match[2]} Stellen nach dem Komma haben.`,
  },

  {
    pattern: /^Name must be between (\d+) and (\d+) characters$/,
    translate: (match) =>
      `Die Eingabe muss zwischen ${match[1]} und ${match[2]} Zeichen lang sein.`,
  },

  {
    pattern: /^Size must be between (\d+) and (\d+)$/,
    translate: (match) =>
      `Die Eingabe muss zwischen ${match[1]} und ${match[2]} Zeichen lang sein.`,
  },

  {
    pattern: /^must be greater than or equal to (.+)$/,
    translate: (match) =>
      `Der Wert muss größer oder gleich ${match[1]} sein.`,
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