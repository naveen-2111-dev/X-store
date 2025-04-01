import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: "empty",
};

const AdressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    Connect_Address: (state, action) => {
      state.value = action.payload;
    },
    Disconnect_address: (state) => {
      state.value = null;
    },
  },
});

export const { Connect_Address, Disconnect_address } = AdressSlice.actions;
export default AdressSlice.reducer;
