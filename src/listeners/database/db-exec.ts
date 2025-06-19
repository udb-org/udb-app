import {
  task_commit,
  task_list,
  task_result,
  task_run_dump,
  task_run_sql,
  task_stop,
  task_rollback,
  executeSql
} from "@/services/db-client";
import { ipcMain } from "electron";
// import { dialog } from "electron/main";
import { addHistory } from "@/services/history";
import { getCurrentConnection, getCurrentDataSource } from "./db-conf";
import { getDataBaseEX } from "@/extension/db";
import path from "path";
export function unregisterDbExecListeners() {
  // Unregister all 'handle' and 'on' listeners related to the database operations
  ipcMain.removeHandler("db:invokeSql");
  ipcMain.removeAllListeners("db:execSql");
  ipcMain.removeHandler("db:exec");
  ipcMain.removeHandler("db:result");
  ipcMain.removeHandler("db:stop");
  ipcMain.removeHandler("db:commit");
  ipcMain.removeHandler("db:rollback");
  ipcMain.removeHandler("db:getTasks");
}
/**
 * Register all 'handle' and 'on' listeners related to the database operations
 * 
 * This function is called when the database is selected
 * 
 * This function is responsible for registering all the listeners related to the database operations.
 * 
 * The following listeners are registered:
 * - db:invokeSql: invokeSql
 * - db:execSql: execSql
 * - db:exec: exec
 * - db:result: result
 * - db:stop: stop
 * - db:commit: commit
 * - db:rollback: rollback
 * - db:getTasks: getTasks
 *  
 * 
 * @param mainWindow 
 */
export function registerDbExecListeners(mainWindow: Electron.BrowserWindow) {

  //invokeSql
  ipcMain.handle("db:invokeSql", async (event, sql: string) => {
    const currentDataSource = getCurrentDataSource();
    if (currentDataSource == null) {
      return {
        status: 831,
        message: "Please select a database!",
      }
    }
    const dbEx = getDataBaseEX(currentDataSource.type);
    if (dbEx == null) {
      return {
        status: 880,
        message: "Unsupported database type!"
      }
    }
    return executeSql(sql, currentDataSource, dbEx);
  });
  //execSql
  ipcMain.on("db:execSql", async (event, sql: string) => {
    const currentConnection = getCurrentConnection();
    if (currentConnection == null) {
      return {
        status: 832,
        message: "Please select a connection!",
      }
    }
    const currentDataSource = getCurrentDataSource();
    if (currentDataSource == null) {
      return {
        status: 831,
        message: "Please select a database!",
      }
    }
    const dbEx = getDataBaseEX(currentDataSource.type);
    if (dbEx == null) {
      return {
        status: 880,
        message: "Unsupported database type!"
      }
    }
    //分割sql语句
    const sqls = sql.split(";");
    //依次执行sql语句
    for (let i = 0; i < sqls.length; i++) {
      const sql = sqls[i].trim();
      if (sql.length > 0) {
        console.log("execSql", sql);
        mainWindow.webContents.send("db:execSqling", {
          index: i,
          sql: sql,
        });
        executeSql(sql, currentDataSource, dbEx).then((res) => {
          console.log("db:execSql", res);
          mainWindow.webContents.send("db:execSqlEnd", {
            index: i,
            sql: sql,
            result: res,
          });
        });
      }
    }
  });
  ipcMain.handle(
    "db:exec",
    (
      event,
      args: {
        sql: string;
        isTransaction: boolean;
      },
    ) => {
      const currentConnection = getCurrentConnection();
      if (currentConnection == null) {
        return {
          status: 832,
          message: "Please select a connection!",
        }
      }
      const currentDataSource = getCurrentDataSource();
      if (currentDataSource == null) {
        return {
          status: 831,
          message: "Please select a database!",
        }
      }
      const dbEx = getDataBaseEX(currentDataSource.type);
      if (dbEx == null) {
        return {
          status: 880,
          message: "Unsupported database type!"
        }
      }
      addHistory(currentConnection.name, currentDataSource.database + "", args.sql);
      return task_run_sql(args.sql, currentDataSource, dbEx, args.isTransaction);
    },
  );
  ipcMain.handle("db:result", (event, id) => {
    return task_result(id);
  });
  ipcMain.handle("db:stop", (event, id) => {
    return task_stop(id);
  });
  ipcMain.handle("db:commit", (event, id) => {
    return task_commit(id);
  });
  ipcMain.handle("db:rollback", (event, id) => {
    return task_rollback(id);
  });
  ipcMain.handle("db:getTasks", (event) => {
    return task_list();
  });

}
