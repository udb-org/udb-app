import { IDataSource } from "@/types/db";
import { dialog } from "electron";
import net from "net";
import path from "path";
const userHomeDir = require("os").homedir();
const udbFolderPath = path.join(userHomeDir, ".udb");
import fs from "fs";
import { getLatestRelease } from "./github";
import os from 'os';
import { downloadJdk } from "./jdk";
/**
 * 
 * The server returns an id, and the client can use this id to fetch the result
 *
 * @param sql
 * @param datasource
 * @param isTransaction
 * @returns  {status:string,message:string,id:string,}
 */
export function db_exec(
  sql: string,
  datasource: IDataSource,
  isTransaction: boolean,
) {
  return db_func("exec", {
    sql: sql,
    datasource: JSON.stringify(datasource),
    isTransaction: isTransaction,
  });
}
/**
 * Get execution result
 * @param id 
 * @returns {status:string,message:string,startTime:string,endTime:string,results:any}
 */
export function db_result(id: string) {
  return db_func("getResult", {
    id: id,
  });
}
/**
 * Stop execution
 * @param id 
 * @returns {status:string,message:string}
 */
export function db_stop(id: string) {
  return db_func("stop", {
    id: id,
  });
}
/**
 * Commit transaction
 *
 * @param id
 * @returns  {status:string,message:string}
 */
export function db_commit(id: string) {
  return db_func("commit", {
    id: id,
  });
}
/**
 * Rollback transaction
 *
 * @param id
 * @returns  {status:string,message:string}
 */
export function db_rollback(id: string) {
  return db_func("rollback", {
    id: id,
  });
}
/**
 * Get all tasks
 *
 * @returns
 */
export function db_getTasks() {
  return db_func("getTasks", {});
}

function db_func(url: string, args: any) {
  console.log("db_func", url, args);
  return fetch("http://localhost:" + PORT + "/api/base/" + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  }).then((res) => res.json());
}

/**
 * Method to get database list
 * @returns Promise that resolves to database list
 */

export function execFuntion(url: string, args: any) {
  console.log("execFuntion", url, args);
  return fetch("http://localhost:" + PORT + "/api/base/" + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  }).then((res) => res.json());
}

/**
/**
 * 执行 SQL 语句的方法
 * @param sql - 要执行的 SQL 语句
 * @param datasource - 数据源对象，包含数据源的相关信息
 * @returns 返回一个 Promise，该 Promise 解析为执行 SQL 语句后的响应结果
 */
export function executeSql(sql: string, datasource: IDataSource) {
  console.log("executeSql", sql, datasource);
  return fetch("http://localhost:" + PORT + "/api/base/executeSql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql: sql,
      datasource: JSON.stringify(datasource),
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      dialog.showErrorBox("Failed to execute SQL", err);
    });
}
let PORT: number = 10001;

let isServerRunning = false;
/**
 * 启动服务器
 */
export function runServer(callback: (status: string, message: string) => void) {
  if (isServerRunning) {
    return;
  }
  isServerRunning = true;
  getAvailablePort(10000, (err, port) => {
    if (err) {
      console.log("获取端口失败", err);
      callback("error", err.message);
      isServerRunning = false;
      return;
    }
    console.log("获取到的闲置端口:", port);
    callback("running", "Getting port...");
    if (port) {
      PORT = port;
      try {
        RunJar(callback);
      } catch (e) {
        callback("error", e.message);
        isServerRunning = false;
      }
    }
  });
}
async function RunJar(callback: (status: string, message: string) => void) {
  const serverpath = path.join(udbFolderPath, "server");
  //如果不存在的话，则创建
  if (!fs.existsSync(serverpath)) {
    fs.mkdirSync(serverpath);
  }
  callback("running", "Found server folder");
  const javaPath = path.join(serverpath, "java");
  if (!fs.existsSync(javaPath)) {
    //需要从服务下载
    fs.mkdirSync(javaPath);
    callback("running", "Downloading java...");
    await downloadJdk(javaPath);
  }
  let javaBinPath = "";

  const platform = os.platform();
  if (platform === 'win32') {
    javaBinPath = path.join(javaPath, "jdk-21.0.2.jdk", "bin", "java.exe");
  } else if (platform === 'darwin') {
    javaBinPath = path.join(javaPath, "jdk-21.0.2.jdk", "Contents", "Home", "bin", "java");
  } else if (platform === 'linux') {
    javaBinPath = path.join(javaPath, "jdk-21.0.2.jdk", "bin", "java");
  }

  const jarPath = path.join(serverpath, "jar");
  //如果不存在的话，则创建
  if (!fs.existsSync(jarPath)) {
    fs.mkdirSync(jarPath);
  }
  const serverJarPath = path.join(jarPath, "udb-java.jar");
  //如果不存在的话，则创建
  if (!fs.existsSync(serverJarPath)) {
    //需要从服务下载
    callback("running", "Downloading jar...");
    getLatestRelease(serverJarPath).then(() => {

      runJar(javaBinPath, serverJarPath, callback);
    }).catch((e) => {
      console.log("Download failed", e);
      callback("error", e.message);
    });
  } else {
    runJar(javaBinPath, serverJarPath, callback);
    callback("success", "Server started successfully");
  }


}
function runJar(javaBinPath: string, serverJarPath: string, callback: (status: string, message: string) => void) {
  const childProcess = require("child_process");
  childProcess.execFile(
    javaBinPath,
    ["-jar", serverJarPath, PORT],
    (error: any, stdout: any, stderr: any) => {
      //如果有错误
      if (error) {
        //显示提示
        dialog.showErrorBox("服务器启动失败", error.message);
        callback("error", error.message);
        return;
      } else {
        callback("success", "Server started successfully");
      }
      console.log(stdout);
      console.log(stderr);
    },
  );
}

function getAvailablePort(
  startPort: number,
  callback: (err: any, port?: number) => void,
) {
  let port = startPort;
  const server = net.createServer();
  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      // 端口被占用，尝试下一个端口
      server.close();
      getAvailablePort(port + 1, callback);
    } else {
      callback(err);
    }
  });
  server.on("listening", () => {
    // 端口可用，关闭服务器并返回端口号
    server.close(() => {
      callback(null, port);
    });
  });
  server.listen(port);
}
// 获取一个大于 10000 的闲置端口
getAvailablePort(10000, (err, port) => {
  if (err) {
    console.error("获取端口失败:", err);
  } else {
    console.log("获取到的闲置端口:", port);
  }
});
