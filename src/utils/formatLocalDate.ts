export const formatLocalDate = (value?: string | null): string => {
  if (!value) return "";

  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};