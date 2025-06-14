import { ConnectionConfig, IDataSource } from "@/types/db";
import { ipcMain } from "electron";
// import { dialog } from "electron/main";
import { readConnectionConfig, writeConnectionConfig } from "@/services/storage";
import { runServer } from "@/services/db-client";
import { testConnection } from "@/api/db";
export function unregisterDbConfListeners() {
  // Unregister all 'handle' and 'on' listeners related to the database operations
  // Unregister all the handlers registered in registerDbConfListeners function
  ipcMain.removeHandler("db:getConnectionConfig");
  ipcMain.removeHandler("db:setConnectionConfig");
  ipcMain.removeHandler("db:testConnection");
  ipcMain.removeHandler("db:saveAndOpenConnection");
  ipcMain.removeAllListeners("db:openConnection");
  ipcMain.removeHandler("db:deleteConnection");
  ipcMain.removeHandler("db:selectDatabase");

}
//当前打开的连接
let currentConnection: ConnectionConfig | null = null;
export function getCurrentConnection() {
  return currentConnection;
} export function setCurrentConnection(connection: ConnectionConfig) {
  currentConnection = connection;
}
let currentDataSource: IDataSource | null = null;
export function getCurrentDataSource() {
  return currentDataSource;
}

export function setCurrentDataSource(dataSource: IDataSource) {
  currentDataSource = dataSource;
}

export function registerDbConfListeners(mainWindow: Electron.BrowserWindow) {


  //获取连接配置信息
  ipcMain.handle("db:getConnectionConfig", (event) => {
    const configs = readConnectionConfig();
    return {
      status: 200,
      data: configs
    };
  });

  //写入连接配置信息
  ipcMain.handle("db:setConnectionConfig", async (event, conf: ConnectionConfig[]) => {
    try {
      await writeConnectionConfig(conf);
      return {
        status: 200,
        message: "Success"
      }
    } catch (e) {
      return {
        status: 500,
        message: "Internal Server Error"
      }
    }
  });
  //测试链接
  ipcMain.handle("db:testConnection", async (event, conf: ConnectionConfig) => {
    const configs = await readConnectionConfig();
    //检查是否有相同名称的链接
    for (const c of configs) {
      if (c.name == conf.name) {
        //如果有相同名称的链接，对话框提示
        return {
          status: 833,
          message: "Connection name already exists"
        }
      }
    }
    return testConnection(conf);
  });
  //保存并打开连接
  ipcMain.handle("db:saveAndOpenConnection", async (event, conf: ConnectionConfig) => {
    try {
      const configs = await readConnectionConfig();
      //检查是否有相同名称的链接
      for (const c of configs) {
        if (c.name == conf.name) {

          return {
            status: 833,
            message: "Connection name already exists"
          }
        }
      }
      configs.push(conf);
      await writeConnectionConfig(configs);
      currentConnection = conf;
      return {
        status: 200,
        message: "Success"
      }
    } catch (e) {
      return {
        status: 500,
        message: "Internal Server Error"
      }
    }
  });

  //打开连接
  ipcMain.on("db:openConnection", async (event, conf: ConnectionConfig) => {
    console.log("db:openConnection", conf)
    mainWindow.webContents.send("db:openConnectioning", {
      status: 799,
      message: "Starting...",
    });
    //服务端启动适合连接的驱动程序
    runServer(conf,(result)=>{
      console.log("runServer",result);
      result.data=conf;
      if(result.status==200){
        setCurrentConnection(conf);
      }
      mainWindow.webContents.send("db:openConnectioning", result);
    })
  });
  //删除连接
  ipcMain.handle("db:deleteConnection", async (event, conf: ConnectionConfig) => {
    try {
      const configs = await readConnectionConfig();
      configs.splice(configs.indexOf(conf), 1);
      await writeConnectionConfig(configs);
      return {
        status: 200,
        message: "Success"
      }
    } catch (e) {
      return {
        status: 500,
        message: "Internal Server Error"
      }
    }
  });


  //selectDatabase
  ipcMain.handle("db:selectDatabase", async (event, dbName: string) => {
    const conf = getCurrentConnection();
    if (conf == null) {
      return {
        status: 832,
        message: "Please select a connection!"
      }
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
    return {
      status: 200,
      message: "Success"
    }
  });

}
