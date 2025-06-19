import { DialogParams } from "@/types/dialog";
import { dialog, ipcMain } from "electron";
export function unregisterDialogListeners() {
  ipcMain.removeHandler("dialog:openFolder");
  ipcMain.removeAllListeners("dialog:opening");
}
export function registerDialogListeners(mainWindow: Electron.BrowserWindow) {
  ipcMain.on("dialog:open", (event, args:DialogParams) => {
    console.log("dialog:open",args);
    event.reply("dialog:opening", args);
  });
  //打开文件夹选择对话框
  ipcMain.handle("dialog:openFolder", async (event, args: any) => {
    console.log("dialog:openFolder", args);
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });
    if (result.canceled) {
      return null;
    }
    const folder = result.filePaths[0];
    console.log("folder", folder);
    return folder;
  });
  //选择文件对话框
  ipcMain.handle("dialog:openFile", async (event, filters: any) => {
    console.log("dialog:openFile", filters);
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: filters,
    });
    if (result.canceled) {
      return null;
    }
    const file = result.filePaths[0];
    console.log("file", file);
    return file;
  });
}
