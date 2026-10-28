export const errorMap: Record<string, string> = {
  // -------------------- GENERAL --------------------

  "List is empty": "Die Liste ist leer.",

  "Data integrity violation":
    "Der Vorgang konnte aufgrund eines Datenkonflikts nicht abgeschlossen werden.",

  "Internal server error":
    "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.",

  "Invalid request parameters": "Die Anfrage enthält ungültige Parameter.",

  "Requested resource not found":
    "Der angeforderte Eintrag wurde nicht gefunden.",

  // -------------------- EMAIL --------------------

  "Email already exists": "Diese E-Mail-Adresse wird bereits verwendet.",

  "Email does not exist": "Diese E-Mail-Adresse ist nicht registriert.",

  "Invalid email": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",

  // -------------------- USERS / AUTH --------------------

  "User not found": "Der Benutzer wurde nicht gefunden.",

  "User already exists": "Dieser Benutzer existiert bereits.",

  "Username already exists": "Dieser Benutzername ist bereits vergeben.",

  "Invalid username": "Der Benutzername ist ungültig.",

  "Invalid password": "Das Passwort ist ungültig.",
  "Invalid old password": "Das aktuelle Passwort ist falsch.",
  // -------------------- VALIDATION --------------------

  "Username is required": "Bitte Benutzername eingeben.",

  "Email is required": "Bitte E-Mail-Adresse eingeben.",

  "Password is required": "Bitte Passwort eingeben.",

  "Invalid email format": "Ungültige E-Mail-Adresse.",

  "Password must contain at least 8 characters, uppercase and lowercase letters, a number and a special character":
    "Das Passwort muss mindestens 8 Zeichen, Groß- und Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.",

  Forbidden: "Sie haben keine Berechtigung, diese Aktion auszuführen.",

  Unauthorized: "Bitte melden Sie sich an, um fortzufahren.",

  "Refresh token missing":
    "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",

  "Refresh token not found":
    "Ihre Sitzung ist ungültig. Bitte melden Sie sich erneut an.",

  "Refresh token expired":
    "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",

  "Employee not found": "Der Mitarbeiter wurde nicht gefunden.",

  "No authenticated user available for generating JWT":
    "Es ist kein angemeldeter Benutzer vorhanden.",

  "Token has expired":
    "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",

  "Invalid JWT token format":
    "Die Anmeldedaten sind ungültig. Bitte melden Sie sich erneut an.",

  "JWT signature does not match locally computed signature":
    "Die Anmeldedaten sind ungültig. Bitte melden Sie sich erneut an.",

  "JWT token is missing": "Bitte melden Sie sich an, um fortzufahren.",

  "No token provided": "Bitte melden Sie sich an, um fortzufahren.",

  "Request cannot be null": "Die Anfrage enthält keine Daten.",

  "Token type cannot be null": "Der erforderliche Tokentyp fehlt.",

  "No roles found for the user.": "Dem Benutzer wurde keine Rolle zugewiesen.",

  "Invalid user role": "Die ausgewählte Benutzerrolle ist ungültig.",

  // -------------------- COMPANY --------------------

  "Company not found": "Die Firma wurde nicht gefunden.",

  "Company logo not found": "Das Firmenlogo wurde nicht gefunden.",

  // -------------------- PRODUCT CATEGORIES --------------------

  "Category not found": "Die Kategorie wurde nicht gefunden.",

  "Category already exists": "Diese Kategorie existiert bereits.",

  "Category article name already exists":
    "Dieses Artikelkürzel wird bereits für eine Kategorie verwendet.",

  "Category cannot be deleted because it is used in other records.":
    "Die Kategorie kann nicht gelöscht werden, da sie bereits in anderen Datensätzen verwendet wird.",

  // -------------------- PRODUCTS --------------------

  "Product not found": "Das Produkt wurde nicht gefunden.",

  "Product with the same name and article already exists.":
    "Ein Produkt mit diesem Namen und dieser Artikelnummer existiert bereits.",

  "List of products is empty": "Die Produktliste ist leer.",

  "Product cannot be deleted because it is used in other records.":
    "Das Produkt kann nicht gelöscht werden, da es bereits in anderen Datensätzen verwendet wird.",

  "Name must be between 2 and 5 characters":
    "Der Name muss zwischen 2 und 5 Zeichen lang sein.",

  // -------------------- PRODUCTION --------------------

  "Amount of the product must exceed the cost of materials.":
    "Der Wert des hergestellten Produkts muss höher sein als die Materialkosten.",

  "Production not found": "Die Herstellung wurde nicht gefunden.",

  "No products in production": "Keine Produkte in der Herstellung vorhanden.",

  "Production must contain at least one material":
    "Die Herstellung muss mindestens ein Material enthalten.",

  // -------------------- WAREHOUSE --------------------
  "Warehouse record not found for product":
    "Für dieses Produkt wurde kein Lagerbestand gefunden.",

  "Warehouse operation requires a product":
    "Für die Lagerbuchung muss ein Produkt angegeben werden.",

  "Warehouse quantity must be greater than zero":
    "Die Menge für die Lagerbuchung muss größer als null sein.",

  "Invalid warehouse document": "Ungültiger Lagerbeleg.",

  "Invalid warehouse operation type": "Ungültige Lagerbuchungsart.",

  "Invalid warehouse document item": "Ungültige Position im Lagerbeleg.",

  "Failed to read warehouse document item":
    "Die Position im Lagerbeleg konnte nicht gelesen werden.",

  "Invalid warehouse movement record": "Ungültige Lagerbewegung.",

  // -------------------- UNITS OF MEASUREMENT --------------------

  "Unit of measurement already exists": "Diese Maßeinheit existiert bereits.",

  "Unit of measurement not found": "Die Maßeinheit wurde nicht gefunden.",

  "Invalid unit of measurement format":
    "Das Format der Maßeinheit ist ungültig.",

  "Unit of measurement name must not exceed 20 characters":
    "Der Name der Maßeinheit darf höchstens 20 Zeichen lang sein.",

  "Unit of measurement is already used by products and cannot be deleted.":
    "Diese Maßeinheit wird bereits von Produkten verwendet und kann nicht gelöscht werden.",

  // -------------------- FILES --------------------

  "Unsupported file type": "Dieser Dateityp wird nicht unterstützt.",

  "Invalid file name": "Der Dateiname ist ungültig.",

  "File not found": "Die Datei wurde nicht gefunden.",

  "Directory path creation failed":
    "Der Speicherordner konnte nicht erstellt werden.",

  "The file could not be uploaded":
    "Die Datei konnte nicht hochgeladen werden.",

  "Error storing file": "Die Datei konnte nicht gespeichert werden.",

  "Unsupported operation on the filesystem":
    "Dieser Dateivorgang wird nicht unterstützt.",

  "File could not be deleted": "Die Datei konnte nicht gelöscht werden.",

  "File could not be converted to Base64":
    "Die Datei konnte nicht verarbeitet werden.",

  "File name is empty": "Bitte geben Sie einen Dateinamen an.",

  "File is empty": "Die ausgewählte Datei ist leer.",

  // -------------------- CUSTOMERS / SUPPLIERS --------------------

  "Customer with the same name and address already exists":
    "Ein Kunde oder Lieferant mit diesem Namen und dieser Adresse existiert bereits.",

  "The customer number already exists.":
    "Diese Kundennummer ist bereits vergeben.",

  "Customer not found": "Der Kunde oder Lieferant wurde nicht gefunden.",

  // -------------------- PAYMENTS --------------------

  "Payment not found": "Die Zahlung wurde nicht gefunden.",

  "Payment cannot be linked to both a sale and a purchase":
    "Eine Zahlung kann nicht gleichzeitig einem Verkauf und einem Einkauf zugeordnet werden.",

  // -------------------- PAYMENT METHODS --------------------

  "Payment method already exists": "Diese Zahlungsmethode existiert bereits.",
  "Payment method not found": "Die Zahlungsmethode wurde nicht gefunden.",
  "This payment method cannot be deleted because it is already in use.":
    "Die Zahlungsmethode wird bereits verwendet und kann nicht gelöscht werden.",

  // -------------------- PAYMENT PROCESSES --------------------

  "Payment process already exists": "Dieser Zahlungsvorgang existiert bereits.",
  "Payment process not found": "Der Zahlungsvorgang wurde nicht gefunden.",
  "This payment process cannot be deleted because it is already in use.":
    "Der Zahlungsprozess wird bereits verwendet und kann nicht gelöscht werden.",

  // -------------------- PURCHASES --------------------

  "Purchase not found": "Der Einkauf wurde nicht gefunden.",

  "No products in purchase": "Der Einkauf enthält keine Artikel.",

  "Purchase cannot be deleted because it has already been paid":
    "Die Bestellung kann nicht gelöscht werden, da sie bereits bezahlt wurde.",

  "Purchase cannot be deleted because payments have already been recorded":
    "Die Bestellung kann nicht gelöscht werden, da bereits Zahlungen erfasst wurden.",
  "Cannot change vendor: purchase has registered payments.":
    "Der Lieferant kann nicht geändert werden, da bereits Zahlungen vorhanden sind.",

  // -------------------- OPERATIONS --------------------

  "Invalid operation type": "Die ausgewählte Vorgangsart ist ungültig.",

  "Invalid payment status": "Der ausgewählte Zahlungsstatus ist ungültig.",

  // -------------------- DOCUMENT TYPES --------------------

  "Type of document already exists": "Dieser Dokumenttyp existiert bereits.",

  "Type of document not found": "Der Dokumenttyp wurde nicht gefunden.",

  "Document type name must not exceed 30 characters":
    "Der Name des Dokumenttyps darf höchstens 30 Zeichen lang sein.",

  "This document type cannot be deleted because it is already in use.":
    "Dieser Dokumenttyp kann nicht gelöscht werden, da er bereits verwendet wird.",

  // -------------------- SALES --------------------

  "Sale not found": "Der Verkauf wurde nicht gefunden.",

  "No products in sale": "Der Verkauf enthält keine Artikel.",

  "Sale cannot be deleted because it has already been paid":
    "Der Auftrag kann nicht gelöscht werden, da er bereits bezahlt wurde.",

  "Sale cannot be deleted because payments have already been recorded":
    "Der Auftrag kann nicht gelöscht werden, da bereits Zahlungen erfasst wurden.",

  "Sale cannot be updated because it has already been paid":
    "Der Auftrag kann nicht geändert werden, da er bereits bezahlt wurde.",
  "Cannot change customer: sale has registered payments.":
    "Der Kunde kann nicht geändert werden, da bereits Zahlungen vorhanden sind.",

  // -------------------- PDF --------------------

  "PDF document could not be generated":
    "Das PDF-Dokument konnte nicht erstellt werden.",

  "PDF document could not be replaced":
    "Das PDF-Dokument konnte nicht ersetzt werden.",

  // -------------------- TAX RATES --------------------

  "Tax rate already exists": "Dieser Steuersatz existiert bereits.",

  "Tax rate not found": "Der Steuersatz wurde nicht gefunden.",

  "Default tax rate not found": "Der Standard-Steuersatz wurde nicht gefunden.",

  "The default tax rate cannot be unset without assigning another default rate.":
    "Der Standard-Steuersatz kann nicht aufgehoben werden, ohne einen anderen Standard-Steuersatz festzulegen.",

  "The default tax rate cannot be deleted.":
    "Der Standard-Steuersatz kann nicht gelöscht werden.",

  // -------------------- DISCOUNT RATES --------------------

  "Discount rate already exists": "Dieser Rabattsatz existiert bereits.",

  "Discount rate not found": "Der Rabattsatz wurde nicht gefunden.",

  "Discount rate must not be negative":
    "Der Rabattsatz darf nicht negativ sein.",

  "Discount rate must not exceed 100":
    "Der Rabattsatz darf 100 % nicht überschreiten.",

  "0% discount rate cannot be changed":
    "Der Rabattsatz von 0 % kann nicht geändert werden.",

  "0% discount rate cannot be deleted":
    "Der Rabattsatz von 0 % kann nicht gelöscht werden.",

  // -------------------- SHIPPING --------------------

  "Shipping already exists": "Diese Versandart existiert bereits.",

  "Shipping not found": "Die Versandart wurde nicht gefunden.",

  "Shipping name must not exceed 50 characters":
    "Der Name der Versandart darf höchstens 50 Zeichen lang sein.",

  "This shipping method cannot be deleted because it is already in use.":
    "Diese Versandart kann nicht gelöscht werden, da sie bereits verwendet wird.",

  // -------------------- TERMS OF PAYMENT --------------------

  "Term of payment already exists":
    "Diese Zahlungsbedingung existiert bereits.",

  "Term of payment not found": "Die Zahlungsbedingung wurde nicht gefunden.",

  "Term of payment name must not exceed 50 characters":
    "Der Name der Zahlungsbedingung darf höchstens 50 Zeichen lang sein.",

  "This payment term cannot be deleted because it is already in use.":
    "Diese Zahlungsbedingung kann nicht gelöscht werden, da sie bereits verwendet wird.",
};
