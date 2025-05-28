import { IDataSource } from "@/types/db";
import { dialog } from "electron";
import net from "net";
import path from "path";
const userHomeDir = require("os").homedir();
const udbFolderPath = path.join(userHomeDir, ".udb");
import fs from "fs";
/**
 * 异步执行sql，
 * 服务器返回一个id，客户端可以通过id来获取结果
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
 * 获取结果
 *
 * @param id
 * @returns  {status:string,message:string,startTime:string,endTime:string,results:any}
 */
export function db_result(id: string) {
  return db_func("getResult", {
    id: id,
  });
}
/**
 * 停止执行
 * @param id
 * @returns {status:string,message:string}
 */
export function db_stop(id: string) {
  return db_func("stop", {
    id: id,
  });
}
/**
 * 提交事务
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
 * 回滚事务
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
 * 获取所有的任务
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
 * 获取数据库列表的方法
 * @returns 返回一个 Promise，该 Promise 解析为数据库列表
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
/**
 * 启动服务器
 */
export function runServer() {
  getAvailablePort(10000, (err, port) => {
    if (err) {
      console.log("获取端口失败", err);
      return;
    }
    console.log("获取到的闲置端口:", port);
    if (port) {
      PORT = port;
      RunJar();
    }
  });
}
function RunJar() {
  const serverpath = path.join(udbFolderPath, "server");
  //如果不存在的话，则创建
  if (!fs.existsSync(serverpath)) {
    fs.mkdirSync(serverpath);
  }
  const javaPath = path.join(serverpath, "java", "bin", "java");
  if (!fs.existsSync(javaPath)) {
    //需要从服务下载
  }

  const jarP = path.join(serverpath, "jar", "udb-java-0.0.1-SNAPSHOT.jar");
  //如果不存在的话，则创建
  if (!fs.existsSync(jarP)) {
    fs.mkdirSync(path.join(serverpath, "jar"));
    //需要从服务下载
  }

  const childProcess = require("child_process");
  childProcess.execFile(
    "java",
    ["-jar", jarP, PORT],
    (error: any, stdout: any, stderr: any) => {
      //如果有错误
      if (error) {
        //显示提示
        dialog.showErrorBox("服务器启动失败", error.message);
        return;
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
