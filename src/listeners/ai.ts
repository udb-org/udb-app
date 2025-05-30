import { ask, clearHistory, fixSql, optimizeSql } from "@/services/ai";
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
        mode: AiMode;
        context: string;
      },
    ) => {
      console.log("ai:ask", args);
      ask(
        args.input,
        args.model,
        args.mode,
        args.context,
        (content: string, finished: boolean) => {
          mainWindow.webContents.send("ai:asking", {
            content: content,
            finished: finished,
          });
        },
      );
    },
  );
  //监听Insert
  ipcMain.on("ai:insert", async (event, args: string) => {
    console.log("ai:insert", args);
    //向正在打开的窗口发送消息，插入内容，可能是sql编辑器，也可能是table设计器等等
    mainWindow.webContents.send("ai:inserting", args);
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
        model: any;
        context: string;
      },
    ) => {
      console.log("ai:optimizeSql", args);
      ask(
        "优化sql",
        args.model,
        AiMode.sql,
        args.context,
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
        model: any;
        context: string;
      },
    ) => {
      console.log("ai:fixSql", args);
      ask(
        "修复sql",
        args.model,
        AiMode.sql,
        args.context,
        (content: string, finished: boolean) => {
          mainWindow.webContents.send("ai:asking", {
            content: content,
            finished: finished,
          });
        },
      );
    },
  );
}
