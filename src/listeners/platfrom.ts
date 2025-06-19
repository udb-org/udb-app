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
    //判断是哪个平台
    if(process.platform === "darwin"){
      exec(`open ${args.path}`);
    }else if(process.platform === "win32"){
      exec(`start ${args.path}`);
    }else if(process.platform === "linux"){
      exec(`xdg-open ${args.path}`);
    }   
  });
}
