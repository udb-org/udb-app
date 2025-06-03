import { ask, clearHistory, fixSql, optimizeSql } from "@/services/ai";
import { ipcMain, nativeTheme } from "electron";
import { AiMode } from "@/types/ai";
import { getConfigItem } from "@/services/storage";
export function unregisterAppListeners() {
  ipcMain.removeHandler("app:getTheme");
  ipcMain.removeHandler("app:setTheme");
}
export function getThemeBg() {
  let appTheme = getConfigItem("app.theme");
  return getThemeBgByName(appTheme);
}
function getThemeBgByName(appTheme: string) {
  if (appTheme == null || appTheme.trim() === "") {
    appTheme = "system";
  }
  const darkBgColor = "#0b0d0e";
  const lightBgColor = "#f0f0f5";
  if (appTheme == "dark") {
    nativeTheme.themeSource = "dark";
    return darkBgColor;
  } else if (appTheme == "light") {
    nativeTheme.themeSource = "light";
    return lightBgColor;
  } else {
    nativeTheme.themeSource = "system";
    if (nativeTheme.shouldUseDarkColors) {
      return darkBgColor;
    } else {
      return lightBgColor;
    }
  }
}
export function registerAppListeners(mainWindow: Electron.BrowserWindow) {
  //get Theme
  ipcMain.handle("app:getTheme", async () => {
    if (nativeTheme.shouldUseDarkColors) {
      return "dark";
    } else {
      return "light";
    }
  });
  ipcMain.handle("app:setTheme", (event, theme: "dark" | "light" | "system") => {
    nativeTheme.themeSource = theme;
    const bgColor = getThemeBgByName(theme);
    mainWindow.setBackgroundColor(bgColor);
    if (nativeTheme.shouldUseDarkColors) {
      return "dark";
    } else {
      return "light";
    }
  });
}
