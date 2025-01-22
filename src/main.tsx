import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { makeStore } from "./redux/store.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={makeStore()}>
    <App />
  </Provider>
);
