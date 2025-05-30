import { AiMode, ask } from "@/services/ai";
import { getHistory } from "@/services/history";
import { ipcMain } from "electron";
import { getCurrentDataSource } from "./db";
import { getCurrentConnection } from "./storage";
export function unregisterHistoryListeners() {
    ipcMain.removeAllListeners("history:get");
}
export function registerHistoryListeners(mainWindow: Electron.BrowserWindow) {
    //获取历史记录
    ipcMain.on("history:get", (event, args) => {
        console.log("history:get", args);
        const currentConnection = getCurrentConnection();
        if (currentConnection == null) {
            return;
        }
       const currentDataSource=getCurrentDataSource();
        if (currentDataSource == null) {
            return;
        }
        const history = getHistory(currentConnection.name, currentDataSource.database);
        mainWindow.webContents.send("history:geted", history);
    });
}