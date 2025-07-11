import {

  executeSql,
  task_result,
  task_run_dump,
  task_run_import,
  task_stop
} from "@/services/db-client";
import { ConnectionConfig, FieldType, IDataSource } from "@/types/db";
import { dialog, ipcMain } from "electron";
import * as fs from "fs";
// import { dialog } from "electron/main";
import { getDataBaseEX, getDataBaseEXs } from "@/extension/db";
import { getCurrentConnection, getCurrentDataSource, setCurrentConnection, setCurrentDataSource } from "./db-conf";
import { readCsvHeader, readJsonHeader, readXlsxHeader } from "@/services/storage";
export function unregisterDbUniformListeners() {
  // Unregister all 'handle' and 'on' listeners related to the database operations
  ipcMain.removeHandler("db:getDatabases");
  // Unregister 'on' listeners
  ipcMain.removeAllListeners("db:selectDatabase");
  // Unregister other 'handle' listeners
  ipcMain.removeHandler("db:addDatabase");
  ipcMain.removeHandler("db:getTables");
  ipcMain.removeHandler("db:dropTable");
  ipcMain.removeHandler("db:clearTable");
  ipcMain.removeHandler("db:getTableInfo");
  ipcMain.removeHandler("db:getColumns");
  ipcMain.removeHandler("db:getViews");
  ipcMain.removeHandler("db:getFunctions");
  ipcMain.removeHandler("db:getProcedures");
  ipcMain.removeHandler("db:getConstraints");
  ipcMain.removeHandler("db:getIndexes");
  ipcMain.removeHandler("db:getTriggers");
  ipcMain.removeHandler("db:dump");
  ipcMain.removeHandler("db:dump_result");
  ipcMain.removeHandler("db:dump_stop");
}



export function registerDbUniformListeners(mainWindow: Electron.BrowserWindow) {

  //This method is used to get the supported databases
  ipcMain.handle("db:getSupportDatabases", async (event) => {
    const exs = getDataBaseEXs();
    const res = exs.map(ex => {
      return {
        name: ex.getName(),
        supportVersions: ex.getSupportVersions()
      }
    });
    return res;
  });

  //Query the database list
  ipcMain.handle("db:getDatabases", async (event, conn?: ConnectionConfig) => {
    let conf: ConnectionConfig | null = null;
    if (conn) {
      conf = conn;
      setCurrentConnection(conn);
    } else {
      conf = getCurrentConnection();
    }
    if (conf == null) {
      return {
        status: 832,
        message: "Please select a connection!"
      }
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
    //Uniform database extension
    const dbEx = getDataBaseEX(conf.type);
    if (dbEx == null) {
      return {
        status: 880,
        message: "Unsupported database type!"
      }
    }
    const sql = dbEx.showDatabases().sql;
    let res = await executeSql(sql, datasource, dbEx);
    console.log("db:getDatabases", res);
    if (dbEx.showDatabases().callback) {
      res = dbEx.showDatabases().callback(res);
    }
    return res;
  });

  //新增数据库
  ipcMain.handle("db:addDatabase", async (event, database: string) => {
    const conf = getCurrentConnection();
    if (conf == null) {
      return {
        status: 832,
        message: "Please select a connection!"
      }
    }
    const dbEx = getDataBaseEX(conf.type);
    if (dbEx == null) {
      return {
        status: 880,
        message: "Unsupported database type!"
      }
    }
    const sql = dbEx.newDatabase(database).sql;
    console.log("db:addDatabase", sql);
    const datasource: IDataSource = {
      name: conf.name + "_" + conf.database,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: conf.database
    };
    return await executeSql(sql, datasource, dbEx);
  });
  //删除数据库
  ipcMain.on("db:dropDatabase", async (event, database: string) => {

    const conf = getCurrentConnection();
    if (conf == null) {
      return {
        status: 832,
        message: "Please select a connection!"
      }
    }
    const dbEx = getDataBaseEX(conf.type);
    if (dbEx == null) {
      return {
        status: 880,
        message: "Unsupported database type!"
      }
    }
    const sql = dbEx.dropDatabase(database).sql;
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
    return await executeSql(sql, datasource, dbEx);
  });
  //getTables
  ipcMain.handle("db:getTables", async (event, databaseName: string) => {

    const conf = getCurrentConnection();
    if (conf == null) {
      return {
        status: 832,
        message: "Please select a connection!"
      }
    }
    const currentDataSource = getCurrentDataSource();
    let _databaseName = databaseName;
    if (databaseName.length == 0) {
      if (currentDataSource == null) {
        return {
          status: 831,
          message: "Please select a database!",
        }
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
      //存储当前数据源
      setCurrentDataSource(datasource);
    }
    const dbEx = getDataBaseEX(conf.type);
    if (dbEx == null) {
      return {
        status: 880,
        message: "Unsupported database type!"
      }
    }

    const sql = dbEx.showTables(_databaseName).sql;

    // "select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA='" +
    // _databaseName +
    // "'";
    let result = await executeSql(sql, datasource, dbEx);
    if (dbEx.showTables(_databaseName).callback) {
      result = dbEx.showTables(_databaseName).callback(result);
    }
    return result;
  });
  //drop table
  ipcMain.handle("db:dropTable", async (event, table: string) => {
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
    const sql = dbEx.dropTable(currentDataSource.database + "", table).sql;
    console.log("db:dropTable", sql);
    return await executeSql(sql, currentDataSource, dbEx);
  });
  ipcMain.handle("db:clearTable", async (event, table: string) => {
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
    const sql = dbEx.clearTable(currentDataSource.database + "", table).sql;
    console.log("db:clearTable", sql);
    return await executeSql(sql, currentDataSource, dbEx);
  });

  //getTables
  ipcMain.handle("db:getTableInfo", async (event, tableName: string) => {
    console.log("db:getTableInfo", tableName);
    const conf = getCurrentConnection();
    if (conf == null) {
      return {
        status: 832,
        message: "Please select a connection!"
      }
    }
    const currentDataSource = getCurrentDataSource();
    if (currentDataSource == null) {
      return {
        status: 831,
        message: "Please select a database!",
      }
    }
    const dbEx = getDataBaseEX(conf.type);
    if (dbEx == null) {
      return {
        status: 880,
        message: "Unsupported database type!"
      }
    }
    const sql = dbEx.showTable(currentDataSource.database + "", tableName).sql;
    let result = await executeSql(sql, currentDataSource, dbEx);
    if (dbEx.showTable(currentDataSource.database + "", tableName).callback) {
      result = dbEx.showTable(currentDataSource.database + "", tableName).callback(result);
    }
    return result;
  });
  //getColumns
  ipcMain.handle("db:getColumns", async (event, tableName?: string) => {
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
    const sql = dbEx.showColumns(currentDataSource.database + "", tableName).sql;

    console.log("db:getColumns", sql);
    let result = await executeSql(sql, currentDataSource, dbEx);
    if (dbEx.showColumns(currentDataSource.database + "", tableName).callback) {
      result = dbEx.showColumns(currentDataSource.database + "", tableName).callback(result);
    }
    return result;
  });
  //getViews
  ipcMain.handle("db:getViews", async (event, databaseName: string) => {
    return null;
  });
  //getFunctions
  ipcMain.handle("db:getFunctions", async (event, databaseName: string) => {
    return null;
  });
  //getProcedures
  ipcMain.handle("db:getProcedures", async (event, databaseName: string) => {
    return null;
  });

  //getConstraints
  ipcMain.handle("db:getConstraints", async (event, tableName: string) => {
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
    const sql = dbEx.showConstraints(currentDataSource.database + "", tableName).sql;

    console.log("db:getConstraints", sql);
    let result = await executeSql(sql, currentDataSource, dbEx);
    if (dbEx.showConstraints(currentDataSource.database + "", tableName).callback) {
      result = dbEx.showConstraints(currentDataSource.database + "", tableName).callback(result);
    }
    return result;
  });
  //getIndexes
  ipcMain.handle("db:getIndexes", async (event, tableName: string) => {
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
    const sql = dbEx.showIndexes(currentDataSource.database + "", tableName).sql;

    console.log("db:getIndexes", sql);
    let result = await executeSql(sql, currentDataSource, dbEx);
    if (dbEx.showIndexes(currentDataSource.database + "", tableName).callback) {
      result = dbEx.showIndexes(currentDataSource.database + "", tableName).callback(result);
    }
    return result;
  });
  //getTriggers
  ipcMain.handle("db:getTriggers", async (event, tableName: string) => {
    return null;
  });




  ipcMain.handle("db:dump", async (event, args) => {
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a connection!");
      return;
    }
    const dbEx = getDataBaseEX(conf.type);
    if (dbEx == null) {
      return {
        status: 880,
        message: "Unsupported database type!"
      }
    }
    let datasource: IDataSource = {
      name: conf.name + "_" + args.database,
      type: conf.type,
      driver: conf.driver,
      host: conf.host,
      port: conf.port,
      username: conf.username,
      password: conf.password,
      database: args.database,
      driverMainClass: dbEx.getDriverMainClass()
    };
    datasource.driverJdbcUrl = dbEx.getDriverJdbcUrl(datasource);

    const arg = {
      ...args,
      datasource: JSON.stringify(datasource),
      identifierQuoteSymbol: dbEx.getIdentifierQuoteSymbol(),
      //删除表sql
      dropTableSql: dbEx.dropTable(args.database, "{table}").sql,
      //dd sql
      ddlSql: dbEx.showTableDDL(args.database, "{table}").sql,
      //分页查询表数据
      pageSql: dbEx.getPageSql(1, 2, "{}").sql,
      //字段类型
      fieldTypes: JSON.stringify(dbEx.getSupportFieldTypes()),
    }
    const res = await task_run_dump(arg);
    console.log("db:dump", res);
    return res;
  });
  ipcMain.handle("db:dump_result", async (event, id: string) => {
    const res = await task_result(id);
    console.log("db:dump_result", res);
    return res;
  });
  ipcMain.handle("db:dump_stop", (event, id: string) => {
    return task_stop(id);
  })

  ipcMain.on("db:import_read_file_header", async (event, args) => {
    console.log("db:import_read_file_header", args);
    //判断是否存在
    const path = args.path;
    if (!fs.existsSync(path)) {
      mainWindow.webContents.send("db:import_read_file_header_end", {
        status: 890,
        message: "File not found!"
      });
    }
    //判断文件是否为csv或者xlsx格式或者json格式
    const ext = path.split(".").pop();
    if (ext != "csv" && ext != "xlsx" && ext != "json") {
      mainWindow.webContents.send("db:import_read_file_header_end", {
        status: 891,
        message: "File format is incorrect! It should be csv, xlsx or json."
      });
    }
    if (ext == "csv") {
      readCsvHeader(path, (header,error) => {
        if(error){
          mainWindow.webContents.send("db:import_read_file_header_end", {
            status: 891,
            message: error.message,
          });
      
        }else{
          mainWindow.webContents.send("db:import_read_file_header_end", {
            status: 200,
            message: "Success",
            data: header,
          });
        }
     
      });
    }
    if (ext == "xlsx") {
      readXlsxHeader(path, (header,error) => {
        if(error){
          mainWindow.webContents.send("db:import_read_file_header_end", {
            status: 891,
            message: error.message,
          });
      
        }else{
          mainWindow.webContents.send("db:import_read_file_header_end", {
            status: 200,
            message: "Success",
            data: header,
          });
        }
      });
    }
    if (ext == "json") {

      readJsonHeader(path, (header,error) => {
        if(error){
          mainWindow.webContents.send("db:import_read_file_header_end", {
            status: 891,
            message: error.message,
          });
      
        }else{
          mainWindow.webContents.send("db:import_read_file_header_end", {
            status: 200,
            message: "Success",
            data: header,
          });
        }
      });
    }


  });



  ipcMain.handle("db:import", async (event, args) => {
    const conf = getCurrentConnection();
    if (conf == null) {
      dialog.showErrorBox("Error", "Please select a connection!");
      return;
    }
    const dbEx = getDataBaseEX(conf.type);
    if (dbEx == null) {
      return {
        status: 880,
        message: "Unsupported database type!"
      }
    }
   const currentDataSource = getCurrentDataSource();
    if (currentDataSource == null) {
      return {
        status: 831,
        message: "Please select a database!",
      }
    }
    let datasource: IDataSource = {
     ...currentDataSource,
      driverMainClass: dbEx.getDriverMainClass()
    };
    datasource.driverJdbcUrl = dbEx.getDriverJdbcUrl(datasource);
    let mapping: any[] = [];
    args.mapping.forEach((item: any) => {
      const colName=item.name;
      const colType=item.type;
      dbEx.getSupportFieldTypes().forEach((fieldType: FieldType) => {
        if(fieldType.name.split("(")[0]==colType.toUpperCase()){
          item.catalog=fieldType.catalog;
        }
      });
      mapping.push(item);
    });
    const arg = {
      ...args,
      datasource: JSON.stringify(datasource),
      identifierQuoteSymbol: dbEx.getIdentifierQuoteSymbol(),
      clearTableSql: dbEx.clearTable(args.database, args.table).sql,
      //字段类型
      mapping: JSON.stringify(mapping),
    }
    const res = await task_run_import(arg);
    console.log("db:import", res);
    return res;
  });
  ipcMain.handle("db:import_result", async (event, id: string) => {
    const res = await task_result(id);
    console.log("db:import_result", res);
    return res;
  });
  ipcMain.handle("db:import_stop", (event, id: string) => {
    return task_stop(id);
  })


}
