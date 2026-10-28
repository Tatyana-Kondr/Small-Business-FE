export const formatWeight = (
  value: number | null | undefined
): string => {
  return Number(value ?? 0).toLocaleString("de-DE", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};