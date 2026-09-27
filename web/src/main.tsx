import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "@/context/AppContext";
import "./styles/index.css";

// Standalone/demo builds (e.g. a single-file artifact) use hash routing so the
// app works from static hosting with no server-side SPA fallback.
const Router = import.meta.env.VITE_STANDALONE === "true" ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <AppProvider>
        <App />
      </AppProvider>
    </Router>
  </React.StrictMode>,
);
