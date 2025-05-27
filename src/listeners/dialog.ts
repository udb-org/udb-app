import { DialogParams } from "@/types/dialog";
import { dialog, ipcMain } from "electron";

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
}
