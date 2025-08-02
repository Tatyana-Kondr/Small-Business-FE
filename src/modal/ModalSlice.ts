import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ModalState = {
  name: string | null;
  props: Record<string, any>;
};

const initialState: ModalState = {
  name: null,
  props: {},
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<{ name: string; props?: Record<string, any> }>) {
      state.name = action.payload.name;
      state.props = action.payload.props || {};
    },
    closeModal(state) {
      state.name = null;
      state.props = {};
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;