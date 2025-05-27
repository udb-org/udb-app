import { DialogParams } from "@/types/dialog";
import { ipcMain } from "electron";

export function registerExplorerListeners(mainWindow: Electron.BrowserWindow) {
  ipcMain.on("explorer:open", (event, args: DialogParams) => {
    console.log("explorer:open",args);
    event.reply("explorer:opening", args);
  });
}
