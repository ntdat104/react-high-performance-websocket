import { configureStore } from "@reduxjs/toolkit";
import websocketReducer from "./ws-slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      websocket: websocketReducer,
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
};

// Infer the return type of `makeStore`
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
