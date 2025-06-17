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
  | "NICHT_BEZAHLT"
  | "TEILWEISEBEZAHLT"
  | "BEZAHLT"
  | "PENDING"
  | "CANCELLED";

export const PaymentStatuses: PaymentStatus[] = [
  "NICHT_BEZAHLT",
  "TEILWEISEBEZAHLT",
  "BEZAHLT",
  "PENDING",
  "CANCELLED",
];

// Тип документа
export type TypeOfDocument =
  | "RECHNUNG"
  | "BON"
  | "BESTELLUNG";

export const TypesOfDocument: TypeOfDocument[] = [
  "RECHNUNG",
  "BON",
  "BESTELLUNG",
];

// Доставка
export type Shipping  =
  | "DHL_PAKET"
  | "POST_MAXI_BRIEF"
  | "HERMES"
  | "ASH_LOGISTIK_LUFTFRACHT_TRANSPORTE_ZOLLSERVICE"
  | "ABHOLUNG";

export const Shipping: Shipping[] = [
 "DHL_PAKET",
  "POST_MAXI_BRIEF",
  "HERMES",
  "ASH_LOGISTIK_LUFTFRACHT_TRANSPORTE_ZOLLSERVICE",
  "ABHOLUNG"
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
