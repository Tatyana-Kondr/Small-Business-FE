export const getAdaptivePageSize = (): number => {
  const viewportHeight = window.innerHeight;

  const headerHeight = 64;
  const mainVerticalPadding = 32;

  const toolbarHeight = 64;
  const tableHeaderHeight = 44;
  const paginationHeight = 48;
  const reserve = 20;

  const rowHeight = 32;

  const availableHeight =
    viewportHeight -
    headerHeight -
    mainVerticalPadding -
    toolbarHeight -
    tableHeaderHeight -
    paginationHeight -
    reserve;

  return Math.max(5, Math.floor(availableHeight / rowHeight));
};