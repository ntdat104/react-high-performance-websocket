import { createSlice } from "@reduxjs/toolkit";
import WebsocketService from "../utils/websocket";

export interface WebsocketState {
  ws: WebsocketService;
  connected: boolean;
}

const initialState: WebsocketState = {
  ws: new WebsocketService({
    url: "wss://stream.binance.com/stream",
  }),
  connected: false,
};

export const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    connect: (state: any) => {
      if (!state.connected) {
        state.ws.connect();
        state.connected = true;
      }
    },
  },
});

export const { connect } = websocketSlice.actions;

export default websocketSlice.reducer;
