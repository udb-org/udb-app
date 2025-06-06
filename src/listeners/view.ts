import { SqlActionParams } from "@/api/view";
import { IAction } from "@/layouts/view-title/view-tabs";
import { DialogParams } from "@/types/dialog";
import { ActionParam, ViewParams } from "@/types/view";
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
    
    //action
    ipcMain.on("view:show-actions", (event, args:{
      channel:string,
      actions:IAction[]
    }) => {

      event.reply("view:showed-actions", args);
      
    })
    ipcMain.on("view:call-action", (event, args:ActionParam) => {
      console.log("view:call-action", args);
      event.reply(args.channel, args);
    });
}
