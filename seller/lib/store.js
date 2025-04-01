import { configureStore } from "@reduxjs/toolkit";
import addressReducer from "./features/address/AddresSlice";
import connectReducer from "./features/Connect/ConnectSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      address: addressReducer,
      connected: connectReducer,
    },
  });
};
