import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";

// Material Dashboard 2 PRO React Context Provider
import { MaterialUIControllerProvider } from "context";
import { SnackbarProvider } from "context/snackbarContext";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <MaterialUIControllerProvider>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </MaterialUIControllerProvider>
  </BrowserRouter>
);
