import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import Workbench from "./layouts/workbench";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
export default function App() {
  const { i18n } = useTranslation();
  useEffect(() => {}, [i18n]);
  return  <ThemeProvider  storageKey="vite-ui-theme"> <Workbench /> <Toaster /></ThemeProvider>
}
const root = createRoot(document.getElementById("app")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
