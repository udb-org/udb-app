import { SqlActionParams } from "@/api/view";
import { DialogParams } from "@/types/dialog";
import { ViewParams } from "@/types/view";
import { ipcMain } from "electron";
import { argv } from "process";
export function unregisterViewListeners() {
  ipcMain.removeAllListeners("view:open");
  ipcMain.removeAllListeners("view:sql-action");
  ipcMain.removeAllListeners("view:table-action");
}
let viewsCounter:Map<string,number>=new Map();
export function registerViewListeners(mainWindow: Electron.BrowserWindow) {
  //打开窗口
  ipcMain.on("view:open", (event, args:ViewParams) => {
    console.log("view:open",args);
    let count=viewsCounter.get(args.type)||0;
    //打开窗口
    if(args.name){
      viewsCounter.set(args.type,count+1);
      event.reply("view:opening", args);
    }else{
      //唯一页面
      const singleViews=["welcome","setting"];
      if(singleViews.includes(args.type)){
        viewsCounter.set(args.type,1);
        event.reply("view:opening", args);
        //切换页面
        event.reply("view:switch", args);
      }else{
        let name=args.type+"-"+count;
        args.name=name;
        viewsCounter.set(args.type,count+1);
        event.reply("view:opening", args);
      }
      
    }
   
  });
  //sql action
  ipcMain.on("view:sql-action", (event, args:SqlActionParams) => {
    console.log("view:sql-action", args);
    event.reply("view:sql-actioning", args);
  });
    //table action
    ipcMain.on("view:table-action", (event, args:SqlActionParams) => {
      console.log("view:table-action", args);
      event.reply("view:table-actioning", args);
    });
}
