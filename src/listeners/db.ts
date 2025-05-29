import {
  db_commit,
  db_dump,
  db_dump_result,
  db_dump_stop,
  db_exec,
  db_getTasks,
  db_result,
  db_rollback,
  db_stop,
  executeSql,
  runServer,
} from "@/services/db-client";
import { IDataSource } from "@/types/db";
import { ipcMain, dialog } from "electron";
// import { dialog } from "electron/main";
import { getCurrentConnection } from "./storage";
import { addHistory } from "@/services/history";
import { ITask } from "@/types/task";

let currentDataSource: IDataSource | null = null;

export function getCurrentDataSource() {
  return currentDataSource;
}

export function registerDbListeners(mainWindow: Electron.BrowserWindow) {
 
 
  ipcMain.once("db:startServer", (event) => {
    console.log("db:startServer");
    const task:ITask={
      id:"startServer",
      status:"running",
      message:"Starting server...",
      startTime:new Date().toLocaleString(),
      endTime:"",
    }
    runServer((status,message)=>{
      mainWindow.webContents.send("status:tasked",{
        ...task,
        status:status,
        message:message
      });
    });
  
  });
 
  //查询所有的数据库
  ipcMain.handle("db:getDatabases", async (event) => {
    if (currentDataSource == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
    }
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
    }
    const datasource: IDataSource = {
      name: conf.name,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: conf.database,
    };
    const sql = "show databases;";
    executeSql(sql, datasource).then((res) => {
      console.log("db:getDatabases", res);
      mainWindow.webContents.send("db:getDatabasesing", res);
    });
  });
  //selectDatabase
  ipcMain.on("db:selectDatabase", async (event, dbName: string) => {
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
    }
    const datasource: IDataSource = {
      name: conf.name + "_" + dbName,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: dbName,
    };
    currentDataSource = datasource;
    mainWindow.webContents.send("db:selectDatabased", dbName);
  });
  //getTables
  ipcMain.handle("db:getTables", async (event, databaseName: string) => {
    console.log("db:getTables", databaseName);
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
    }
    let _databaseName = databaseName;
    if (databaseName.length == 0) {
      if (currentDataSource == null) {
        dialog.showErrorBox("Error", "Please select a database!");
        return;
      }

      console.log(currentDataSource);
      _databaseName = currentDataSource.database;
    }
    console.log("_databaseName", _databaseName);
    const datasource: IDataSource = {
      name: conf.name + "_" + _databaseName,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: _databaseName,
    };
    if (databaseName.length > 0) {
      currentDataSource = datasource;
    }

    const sql =
      "select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA='" +
      _databaseName +
      "'";
    return await executeSql(sql, datasource);
  });
  //getViews
  ipcMain.handle("db:getViews", async (event, databaseName: string) => {
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
    }
    const datasource: IDataSource = {
      name: conf.name + "_" + databaseName,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: databaseName,
    };
    currentDataSource = datasource;
    const sql =
      "select * from INFORMATION_SCHEMA.VIEWS where TABLE_SCHEMA='" +
      databaseName +
      "'";
    return await executeSql(sql, currentDataSource);
  });
  //getFunctions
  ipcMain.handle("db:getFunctions", async (event, databaseName: string) => {
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
    }
    const datasource: IDataSource = {
      name: conf.name + "_" + databaseName,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: databaseName,
    };
    currentDataSource = datasource;
    const sql =
      "select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_TYPE='FUNCTION' and ROUTINE_SCHEMA='" +
      databaseName +
      "'";
    return await executeSql(sql, currentDataSource);
  });
  //getProcedures
  ipcMain.handle("db:getProcedures", async (event, databaseName: string) => {
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
    }
    const datasource: IDataSource = {
      name: conf.name + "_" + databaseName,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: databaseName,
    };
    currentDataSource = datasource;
    const sql =
      "select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_TYPE='PROCEDURE' and ROUTINE_SCHEMA='" +
      databaseName +
      "'";
    return await executeSql(sql, currentDataSource);
  });
  //getColumns
  ipcMain.handle("db:getColumns", async (event, tableName: string) => {
    if (currentDataSource == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
    }
    const sql =
      "select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME='" +
      tableName +
      "' and TABLE_SCHEMA='" +
      currentDataSource.database +
      "'";
    console.log("db:getColumns", sql);
    return await executeSql(sql, currentDataSource);
  });
  //getIndexes
  ipcMain.handle("db:getIndexes", async (event, tableName: string) => {
    if (currentDataSource == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
    }
    const sql =
      "select * from INFORMATION_SCHEMA.INDEXES where TABLE_NAME='" +
      tableName +
      "'";
    console.log("db:getIndexes", sql);
    return await executeSql(sql, currentDataSource);
  });
  //getTriggers
  ipcMain.handle("db:getTriggers", async (event, tableName: string) => {
    if (currentDataSource == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
    }
    const sql =
      "select * from INFORMATION_SCHEMA.TRIGGERS where TABLE_NAME='" +
      tableName +
      "'";
    console.log("db:getTriggers", sql);
    return await executeSql(sql, currentDataSource);
  });
  function getTables(dataSource: IDataSource) {
    const sql =
      "select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA='" +
      dataSource.database +
      "'";
    executeSql(sql, dataSource).then((res) => {
      console.log("db:getTables", res);
      mainWindow.webContents.send("db:getTablesing", res);
    });
  }

  //invokeSql
  ipcMain.handle("db:invokeSql", async (event, sql: string) => {
    if (currentDataSource == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return null;
    }
    return executeSql(sql, currentDataSource);
  });
  //execSql
  ipcMain.on("db:execSql", async (event, sql: string) => {
    const currentConnection = getCurrentConnection();
    if (currentConnection == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return null;
    }
    if (currentDataSource == null) {
      dialog.showErrorBox("Error", "Please select a database!");
      return;
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

        executeSql(sql, currentDataSource).then((res) => {
          console.log("db:execSql", res);
          addHistory(currentConnection.name, currentDataSource.database, sql);
          mainWindow.webContents.send("db:execSqlEnd", {
            index: i,
            sql: sql,
            result: res,
          });
        });
      }
    }
  });
  //新增数据库
  ipcMain.on("db:addDatabase", (event, database: string) => {
    const sql = "create database " + database;
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a connection!");
      return;
    }
    console.log("db:addDatabase", sql);
    const datasource: IDataSource = {
      name: conf.name + "_" + conf.database,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: conf.database,
    };
    executeSql(sql, datasource).then((res) => {
      console.log("db:addDatabase", res);
      executeSql("show databases", datasource).then((res) => {
        console.log("db:getDatabases", res);
        mainWindow.webContents.send("db:getDatabasesing", res);
        mainWindow.webContents.send("db:addDatabaseEnd", {
          status: "success",
          message: "新增成功",
        });
      });
    });
  });
  //删除数据库
  ipcMain.on("db:delDatabase", (event, database: string) => {
    const sql = "drop database " + database;
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a connection!");
      return;
    }
    console.log("db:delDatabase", sql);
    const datasource: IDataSource = {
      name: conf.name + "_" + conf.database,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: conf.database,
    };
    executeSql(sql, datasource).then((res) => {
      console.log("db:delDatabase", res);
      executeSql("show databases", datasource).then((res) => {
        console.log("db:getDatabases", res);
        mainWindow.webContents.send("db:getDatabasesing", res);
        mainWindow.webContents.send("db:delDatabaseEnd", {
          status: "success",
          message: "删除成功",
        });
      });
    });
  });
  //drop table
  ipcMain.on("db:dropTable", (event, table: string) => {
    const sql = "drop table " + table;

    if (currentDataSource == null) {
      dialog.showErrorBox("Error", "Please select a connection!");
      return;
    }
    console.log("db:dropTable", sql);

    executeSql(sql, currentDataSource).then((res) => {
      console.log("db:dropTable", res);
      mainWindow.webContents.send("db:dropTableEnd", {
        status: "success",
        message: "删除成功",
      });
    });
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
      const datasource = getCurrentDataSource();
      if (datasource == null) {
        return null;
      }
      return db_exec(args.sql, datasource, args.isTransaction);
    },
  );
  ipcMain.handle("db:result", (event, id) => {
    return db_result(id);
  });
  ipcMain.handle("db:stop", (event, id) => {
    return db_stop(id);
  });
  ipcMain.handle("db:commit", (event, id) => {
    return db_commit(id);
  });
  ipcMain.handle("db:rollback", (event, id) => {
    return db_rollback(id);
  });
  ipcMain.handle("db:getTasks", (event) => {
    return db_getTasks();
  });

  ipcMain.handle("db:dump",async (event,args) => {
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a connection!");
      return;
    }
    const datasource: IDataSource = {
      name: conf.name + "_" + args.database,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: args.database,
    };
    const arg={
      ...args,
      datasource:JSON.stringify(datasource)
    }
    const res= await db_dump(arg);
    console.log("db:dump",res);
    return res;
  });
  ipcMain.handle("db:dump_result", async (event, id: string) => {
    const res= await db_dump_result(id);
    console.log("db:dump_result",res);
    return res;
  });
  ipcMain.handle("db:dump_stop", (event, id: string) => {
    return db_dump_stop(id);
    
  })
}
