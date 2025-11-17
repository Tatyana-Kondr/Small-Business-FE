import { createAppSlice } from "../../redux/createAppSlice";
import { fetchProductHistory, fetchProductStock, fetchWarehouseStocks } from "./api";
import { PaginatedResponse, WarehouseRecord, WarehouseStock, WarenhousRecordState, WarenhousStockState } from "./types";

const initialStocksState: WarenhousStockState = {
  warehouseStocksLiist: [],
  selectedWarehouseStock: undefined,
  loading: false,
  error: null,
};

const initialRecordsState: WarenhousRecordState = {
  warehouseRecordsLiist: [],
  selectedWarehouseRecord: undefined,
  totalPages: 1,
  currentPage: 0,
  loading: false,
  error: null,
};

const handlePending = (state: any) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state: any, action: any, message: string) => {
  state.error = action.error?.message ?? message;
  state.loading = false;
};

export const warehouseSlice = createAppSlice({
  name: "warehouse",
  initialState: {
    stocks: initialStocksState,
    records: initialRecordsState,
  },
  reducers: (create) => ({
  
    getWarehouseStocks: create.asyncThunk(
      async ({ page, size = 15, sort = "productName,ASC" }: { page: number; size?: number; sort?: string }) => {
        return await fetchWarehouseStocks(page, size, sort);
      },
      {
        pending: (state) => handlePending(state.stocks),
        fulfilled: (state, action) => {
          const payload = action.payload as PaginatedResponse<WarehouseStock>;
          state.stocks.warehouseStocksLiist = payload.content;
          state.stocks.loading = false;
          state.stocks.error = null;
        },
        rejected: (state, action) => handleRejected(state.stocks, action, "Fehler beim Laden des Lagerbestands."),
      }
    ),

    getProductStock: create.asyncThunk(
      async (productId: number) => {
        return await fetchProductStock(productId);
      },
      {
        pending: (state) => handlePending(state.stocks),
        fulfilled: (state, action) => {
          state.stocks.selectedWarehouseStock = action.payload;
          state.stocks.loading = false;
          state.stocks.error = null;
        },
        rejected: (state, action) => handleRejected(state.stocks, action, "Fehler beim Laden des Produkts im Lager."),
      }
    ),

    getProductHistory: create.asyncThunk(
      async ({
        productId,
        page,
        size = 15,
        sort = "date,DESC",
      }: {
        productId: number;
        page: number;
        size?: number;
        sort?: string;
      }) => {
        return await fetchProductHistory(productId, page, size, sort);
      },
      {
        pending: (state) => handlePending(state.records),
        fulfilled: (state, action) => {
          const payload = action.payload as PaginatedResponse<WarehouseRecord>;
          state.records.warehouseRecordsLiist = payload.content;
          state.records.totalPages = payload.totalPages;
          state.records.currentPage = payload.pageable.pageNumber;
          state.records.loading = false;
          state.records.error = null;
        },
        rejected: (state, action) =>
          handleRejected(state.records, action, "Fehler beim Laden der Bewegungshistorie."),
      }
    ),
  }),

  selectors: {
    selectWarehouseStocks: (state) => state.stocks.warehouseStocksLiist,
    selectSelectedWarehouseStock: (state) => state.stocks.selectedWarehouseStock,
    selectWarehouseRecords: (state) => state.records.warehouseRecordsLiist,
    selectWarehouseRecordPages: (state) => state.records.totalPages,
    selectWarehouseRecordPage: (state) => state.records.currentPage,
    selectLoadingStocks: (state) => state.stocks.loading,
    selectLoadingRecords: (state) => state.records.loading,
    selectWarehouseError: (state) => state.stocks.error || state.records.error,
  },
});

export const { getWarehouseStocks, getProductStock, getProductHistory,} = warehouseSlice.actions;

export const {
  selectWarehouseStocks,
  selectSelectedWarehouseStock,
  selectWarehouseRecords,
  selectWarehouseRecordPages,
  selectWarehouseRecordPage,
  selectLoadingStocks,
  selectLoadingRecords,
  selectWarehouseError,
} = warehouseSlice.selectors;