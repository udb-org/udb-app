import { ipcMain } from "electron";
export function unregisterPlatformListeners() {
  ipcMain.removeHandler("platfrom:getInfo");
  ipcMain.removeAllListeners("platfrom:open");
}
export function registerPlatformListeners(mainWindow: Electron.BrowserWindow) {
  ipcMain.handle("platfrom:getInfo", async () => {
    return {
      os: process.platform,
      arch: process.arch,
      version: process.version,
    };
  });
  //使用默认应用打开文件
  ipcMain.on("platfrom:open", (event, args) => {
    console.log("platfrom:open", args);
    const exec=require("child_process").exec;
    exec(`open ${args.path}`);
  });
}
