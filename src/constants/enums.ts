// Типы операций
export type TypeOfOperation =
  | "EINKAUF"
  | "LIEFERANT_RABATT"
  | "VERKAUF"
  | "KUNDENERSTATTUNG"
  | "PRODUKTION"
  | "PRODUKTIONSMATERIAL";

export const OperationTypes: TypeOfOperation[] = [
  "EINKAUF",
  "LIEFERANT_RABATT",
  "VERKAUF",
  "KUNDENERSTATTUNG",
  "PRODUKTION",
  "PRODUKTIONSMATERIAL",
];

// Статусы оплаты
export type PaymentStatus =
  | "AUSSTEHEND"
  | "ANZAHLUNG"
  | "BEZAHLT";

export const PaymentStatuses: PaymentStatus[] = [
  "AUSSTEHEND",
  "ANZAHLUNG",
  "BEZAHLT",
];

// Тип документа
export type TypeOfDocument =
  | "RECHNUNG"
  | "BON"
  | "BESTELLUNG"
  | "VERTRAG"
  | "BESCHEID";

export const TypesOfDocument: TypeOfDocument[] = [
  "RECHNUNG",
  "BON",
  "BESTELLUNG",
  "VERTRAG",
  "BESCHEID",
];

//Вид оплаты счета
export type TermsOfPayment =
| "BETRAG_IM_BAR"
| "ÜBERWEISUNG_7_TAGE_2_PROZENT_14_TAGE_NETTO"
| "ÜBERWEISUNG_7_TAGE"
| "ÜBERWEISUNG_14_TAGE"
| "BETRAG_ERHALTEN_AM";

export const TermsOfPayment: TermsOfPayment[] = [
"BETRAG_IM_BAR",
"ÜBERWEISUNG_7_TAGE_2_PROZENT_14_TAGE_NETTO",
"ÜBERWEISUNG_7_TAGE",
"ÜBERWEISUNG_14_TAGE",
"BETRAG_ERHALTEN_AM"
];
