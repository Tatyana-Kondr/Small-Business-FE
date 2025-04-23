export const unitOfMeasurements = ["KG", "GR", "LITER", "METER", "ST", "STUNDE", "SET", "MM", "CM", "KM"] as const;

export type UnitOfMeasurement = (typeof unitOfMeasurements)[number]; 