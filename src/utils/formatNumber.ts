export const formatNumber = (
  value: number | null | undefined
): string => {
  return Number(value ?? 0).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};