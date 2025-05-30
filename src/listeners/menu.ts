import { IMenuParams } from "@/api/menu";
import { SqlActionParams } from "@/api/view";
import { DialogParams } from "@/types/dialog";
import { ViewParams } from "@/types/view";
import { ipcMain, Menu } from "electron";
let viewsCounter: Map<string, number> = new Map();
export function unregisterMenuListeners() {
  ipcMain.removeAllListeners("menu:open");
}
export function registerMenuListeners(mainWindow: Electron.BrowserWindow) {
  //打开菜单
  ipcMain.on("menu:open", (event, args: IMenuParams) => {
    console.log("menu:open", args);
    const menu = Menu.buildFromTemplate(
      args.items.map((item) => {
        return {
          label: item.name,
          type: item.type,
          accelerator: item.accelerator,
          click: () => {
            mainWindow.webContents.send(args.channel, {
              command: item.command,
              params: args.params,
            });
          },
        };
      }),
    );
    menu.popup();
  });
}
