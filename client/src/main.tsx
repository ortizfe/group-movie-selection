import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GlobalStyles, StyledEngineProvider } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router";
import FiltersPage from "./pages/FiltersPage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <BrowserRouter>
        <Routes>
          <Route index path="/" element={<App />} />
          <Route path="/mood" element={<FiltersPage />} />
        </Routes>
      </BrowserRouter>
    </StyledEngineProvider>
  </StrictMode>
);
