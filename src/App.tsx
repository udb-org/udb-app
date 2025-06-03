import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import Workbench from "./layouts/workbench";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { Setup } from "./layouts/setup";
import { AppConfig } from "./api/config";
import { updateDocumentTheme } from "./api/theme";
import { setAppLanguage } from "./api/language";
export default function App() {
  const { i18n } = useTranslation();
  useEffect(() => {
    //clean LocalStorage
    localStorage.clear();
  }, []);
  useEffect(() => {
    window.api.invoke("app:getTheme").then((theme) => {
      updateDocumentTheme(theme === "dark");
    });
  }, []);
  useEffect(() => {
    AppConfig.getAppLanguage().then((language) => {
      setAppLanguage(language as string, i18n);
    });
  }, []);
  const isFirstRun = window.api.isFirstRun();
  return (
    <ThemeProvider storageKey="vite-ui-theme" defaultTheme="system"  >
      {
        isFirstRun && <Setup />
      }
      {
        !isFirstRun && <Workbench />
      }
      <Toaster />
    </ThemeProvider>
  );
}
const root = createRoot(document.getElementById("app")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
