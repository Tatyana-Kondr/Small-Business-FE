import { HttpError } from "./handleFetchError";
import { showErrorToast } from "./toast";

type ErrorWithMessage = {
  message: string;
};

const errorMap: Record<string, string> = {
  // Customer
  "Customer with the same name and address already exists": "Ein Kunde/Lieferant mit diesem Namen und dieser Adresse existiert bereits.",
  "The customer number already exists.": "Ein Kunde mit diesem Nummer existiert bereits.",
  "Customer not found": "Der Kunde/Lieferant wurde nicht gefunden.",
  "Email already exists": "Diese E-Mail-Adresse wird bereits verwendet.",
  //User
  "Username already exists": "Benutzername existiert bereits.",
  "Email does not exist": "Diese E-Mail-Adresse existiert nicht.",
  "Invalid email": "Ungültige E-Mail-Adresse.",
  "Invalid username": "Ungültiger Benutzername.",
  "Invalid password": "Ungültiges Passwort.",
  "User not found": "Benutzer wurde nicht gefunden.",
  "User already exists": "Benutzer existiert bereits.",
  "Forbidden": "Zugriff verweigert.",
  "Unauthorized": "Nicht autorisiert.",
  //Product
  "Category not found": "Kategorie wurde nicht gefunden.",
  "Category already exists": "Kategorie existiert bereits.",
  "Product not found": "Produkt wurde nicht gefunden.",
  "Product with the same name and article already exists.": "Produkt mit gleichem Namen und Artikel existiert bereits.",
  "List of products is empty": "Die Produktliste ist leer.",
  "Product cannot be deleted because it is used in other records.": "Produkt kann nicht gelöscht werden, da es in anderen Datensätzen verwendet wird.",
  "Category cannot be deleted because it is used in other records.": "Produktkategorie kann nicht gelöscht werden, da es in anderen Datensätzen verwendet wird.",
  "Amount of the product must exceed the cost of materials.": "Der Produktpreis muss höher als die Materialkosten sein.",
  "File not found": "Datei wurde nicht gefunden.",
  "Unsupported file type": "Nicht unterstützter Dateityp.",
  "Invalid file name": "Ungültiger Dateiname.",
  "File could not be deleted": "Datei konnte nicht gelöscht werden.",
  "File could not be uploaded": "Datei konnte nicht hochgeladen werden.",
  "File could not be converted to Base64": "Datei konnte nicht konvertiert werden.",
  // Purchase
  "No products in purchase": "Die Bestellung enthält keine Artikel.",

  //Payments
  "List of payments is empty": "Die Zahlungsliste ist leer.",
  "List is empty": "Die Liste ist leer.",
};

export function handleApiError(
  error: unknown,
  fallbackMessage = "Ein unbekannter Fehler ist aufgetreten."
) {
  console.error("API Fehler:", error);

  let title = "Fehler";
  let message = fallbackMessage;

  if (error instanceof HttpError) {
    // используем сообщение из HttpError
    message = errorMap[error.message] || error.message || fallbackMessage;
  } else {
    try {
      const err = error as ErrorWithMessage;
      message = errorMap[err?.message] || err?.message || fallbackMessage;
    } catch {
      // fallback
    }
  }

  showErrorToast(title, message);
}