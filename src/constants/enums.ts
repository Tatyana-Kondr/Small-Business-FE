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
