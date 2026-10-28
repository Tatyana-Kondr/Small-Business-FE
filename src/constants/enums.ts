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
  | "OFFEN"
  | "ANZAHLUNG"
  | "BEZAHLT";

export const PaymentStatuses: PaymentStatus[] = [
  "OFFEN",
  "ANZAHLUNG",
  "BEZAHLT",
];

// Типы платежей

export type PaymentType =
  | "EINNAHME"
  | "AUSGABE";

export const PaymentTypes: PaymentType[] = [
  "EINNAHME",
  "AUSGABE",
];