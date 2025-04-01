import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: false,
};

const ConnectSlice = createSlice({
  name: "connected",
  initialState,
  reducers: {
    isConnected: (state) => {
      state.value = true;
    },
    disconnected: (state) => {
      state.value = false;
    },
  },
});

export const { isConnected, disconnected } = ConnectSlice.actions;
export default ConnectSlice.reducer;
