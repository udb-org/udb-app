import { ask, clearHistory, fixSql, mergeSql, optimizeSql } from "@/services/ai";
import { ipcMain } from "electron";
import { AiMode } from "@/types/ai";
export  function unregisterAiListeners() {
  ipcMain.removeAllListeners("ai:ask");
  ipcMain.removeAllListeners("ai:insert");
  ipcMain.removeAllListeners("ai:clearHistory");
  ipcMain.removeAllListeners("ai:optimizeSql");
  ipcMain.removeAllListeners("ai:fixSql");
}
export function registerAiListeners(mainWindow: Electron.BrowserWindow) {
  //监听ask
  ipcMain.on(
    "ai:ask",
    async (
      event,
      args: {
        input: string;
        model: any;
        context: string;
        agent: string|null;
      },
    ) => {
      console.log("ai:ask", args);
      ask(
        args.input,
        args.model,
        args.context,
        args.agent,
        (content: string,finished: boolean,status?:number) => {
          mainWindow.webContents.send("ai:asking", {
            content: content,
            finished: finished,
            status:status,
          });
        },
      );
    },
  );
  //监听Insert
  ipcMain.on("ai:mergeTable", async (event, args: string) => {
    console.log("ai:mergeTable", args);
    //向正在打开的窗口发送消息，插入内容，可能是sql编辑器，也可能是table设计器等等
    mainWindow.webContents.send("ai:mergeTableing", args);
  });
  //清除历史记录
  ipcMain.on("ai:clearHistory", async (event, args: string) => {
    console.log("ai:clearHistory", args);
    clearHistory();
  });
  //优化sql
  ipcMain.on(
    "ai:optimizeSql",
    async (
      event,
      args: {
        input: string;
        model: any;
        context: string;
      },
    ) => {
      console.log("ai:optimizeSql", args);
      ask(
        args.input,
        args.model,
        args.context,
        "Sql Agent",
        (content: string, finished: boolean) => {
          mainWindow.webContents.send("ai:asking", {
            content: content,
            finished: finished,
          });
        },
      );
    },
  );
  //修复sql
  ipcMain.on(
    "ai:fixSql",
    async (
      event,
      args: {
        input: string;
        model: any;
        context: string;
      },
    ) => {
      console.log("ai:fixSql", args);
      ask(
        args.input,
        args.model,
        args.context,
        "Sql Agent",
        (content: string, finished: boolean) => {
          mainWindow.webContents.send("ai:asking", {
            content: content,
            finished: finished,
          });
        },
      );
    },
  );

    //Merge sql
    ipcMain.on(
      "ai:mergeSql",
      async (
        event,
        args: {
          input: string;
          model: any;
          context: string;
          prompt:string;
          original:string;
          newly:string;
        },
      ) => {
        console.log("ai:mergeSql", args);
        if(args.input.trim().length==0){
          mainWindow.webContents.send("ai:mergeSqling", {
            content:"",
            status: 870,
          });
          return; //return fals
        }
        if(args.input.length>120*1000){
          mainWindow.webContents.send("ai:mergeSqling", {
            content:"",
            status: 870,
          });
          return;
          
        }
        if(args.context.length>120*1000){
          mainWindow.webContents.send("ai:mergeSqling", {
            content:"",
            status: 870,
          });
          return;
        }



        mainWindow.webContents.send("ai:mergeSqling", {
          content: "",
          status: 799,
          
        });
        if(args.context.trim().length==0){
          mainWindow.webContents.send("ai:mergeSqling", {
            content:args.input,
            status: 200,
          });
        }else{
          mergeSql(
            args.input,
            args.model,
            args.context,
            args.prompt,
            args.original,
            args.newly,
            (content: string, status: number) => {
              mainWindow.webContents.send("ai:mergeSqling", {
                content: content,
                status: status,
              });
            },
          );
        }

     
      },
    );
}
