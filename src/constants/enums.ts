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

