import { getDataBaseEX } from "@/extension/db";
import { ConnectionConfig, IDataBaseEX, IDataSource, IResult } from "@/types/db";
import fs from "fs";
import net from "net";
import os from "os";
import path from "path";
import { getLatestRelease } from "./github";
import { downloadJdk } from "./jdk";
const userHomeDir = require("os").homedir();
const udbFolderPath = path.join(userHomeDir, ".udb");

export function testConnection(sql: string, datasource: IDataSource, dbEx: IDataBaseEX) {
  return executeSql(sql, datasource, dbEx);
}


/**
 *
 * The server returns an id, and the client can use this id to fetch the result
 *
 * @param sql
 * @param datasource
 * @param isTransaction
 * @returns  {status:string,message:string,id:string,}
 */
export function task_run_sql(
  sql: string,
  datasource: IDataSource,
  dbEx: IDataBaseEX,
  isTransaction: boolean,
) {
  const db = {
    name: datasource.name,
    database: datasource.database,
    username: datasource.username,
    password: datasource.password,
    driverMainClass: dbEx.getDriverMainClass(),
    driverJdbcUrl: dbEx.getDriverJdbcUrl(datasource),
  }
  return task_func("run", {
    type: "sql",
    sql: sql,
    datasource: JSON.stringify(db),
    isTransaction: isTransaction,
  });
}

export function task_run_dump(args: any) {
  return task_func("run", {
    type: "dump",
    ...args
  });
}
/**
 * Get execution result
 * @param id
 * @returns {status:string,message:string,startTime:string,endTime:string,results:any}
 */
export function task_result(id: string) {
  return task_func("result", {
    id: id,
  });
}
/**
 * Stop execution
 * @param id
 * @returns {status:string,message:string}
 */
export function task_stop(id: string) {
  return task_func("stop", {
    id: id,
  });
}
/**
 * Commit transaction
 *
 * @param id
 * @returns  {status:string,message:string}
 */
export function task_commit(id: string) {
  return task_func("commit", {
    id: id,
  });
}
/**
 * Rollback transaction
 *
 * @param id
 * @returns  {status:string,message:string}
 */
export function task_rollback(id: string) {
  return task_func("rollback", {
    id: id,
  });
}
/**
 * Get all tasks
 *
 * @returns
 */
export function task_list() {
  return task_func("list", {});
}


function task_func(url: string, args: any) {
  console.log("db_func", url, args);
  return fetch("http://localhost:" + PORT + "/api/task/" + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  }).then((res) => res.json());
}

/**
 * This method is used to execute sql
 * 
 * @param sql 
 * @param datasource 
 * @returns  Promise<IResult> {status:number,message:string,data:{
 *  columns:[],
 *  rows:[]
 * }}
 */
export function executeSql(sql: string, datasource: IDataSource, dbEx: IDataBaseEX) {
  const db = {
    name: datasource.name,
    database: datasource.database,
    username: datasource.username,
    password: datasource.password,
    driverMainClass: dbEx.getDriverMainClass(),
    driverJdbcUrl: dbEx.getDriverJdbcUrl(datasource),
  }
  console.log("executeSql", sql, db);
  return fetch("http://localhost:" + PORT + "/api/base/executeSql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql: sql,
      datasource: JSON.stringify(db),
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.log("executeSql", err);
      // dialog.showErrorBox("Failed to execute SQL", err.message);
      return {
        status: 860,
        message: err.message,
      };
    });
}
let PORT: number = 10001;
/**
 * This method is used to get the jdk bin path
 * 
 * @returns 
 */
function getJdkBinPath(): string {
  const platform = os.platform();
  if (platform === "win32") {
    return path.join(udbFolderPath, "server", "java", "jdk-21.0.2.jdk", "bin", "java.exe");
  } else if (platform === "darwin") {
    return path.join(
      udbFolderPath,
      "server",
      "java",
      "jdk-21.0.2.jdk",
      "Contents",
      "Home",
      "bin",
      "java",
    );
  } else if (platform === "linux") {
    return path.join(udbFolderPath, "server", "java", "jdk-21.0.2.jdk", "bin", "java");
  }
  return "";
}


/**
* This method is used to got the server running
 *  java -cp "udb-java-0.0.2:udb-java-0.0.2/BOOT-INF/classes:udb-java-0.0.2/BOOT-INF/lib/*:/Users/taoyongwen/.udb/server/driver/com/mysql/mysql-connector-j/9.3.0/mysql-connector-j-9.3.0.jar"
 *  com.udb.server.UdbApplication   10001 "mysql(2,3)"
 */
function getServersRunning(): {
  pid: string,
  port: string,
  dbType: string
}[] {
  try {
    let pids: {
      pid: string,
      port: string,
      dbType: string
    }[] = [];
    const { execSync } = require('child_process');
    if (process.platform === 'win32') {
      const stdout = execSync(`wmic process where "name like '%%java%%'" get ProcessId, CommandLine | findstr "udb-java"`, { encoding: 'utf-8' });
      if (stdout || stdout.length > 0) {
        const lines = stdout.split('\n');
        lines.forEach((line: string) => {
          if (line.length > 10) {
            const items = line.split(' ');
            pids.push({
              pid: items[0],
              port: items[items.length - 2],
              dbType: items[items.length - 1],
            })

          }

        })
      }

    } else if (process.platform === 'darwin' || process.platform === 'linux') {
      const stdout = execSync(`ps -e -o pid,args | grep -F "udb-java" | grep -v grep`, { encoding: 'utf-8' });
      if (stdout || stdout.length > 0) {
        const lines = stdout.split('\n');
        lines.forEach((line: string) => {
          if (line.length > 10) {
            const items = line.split(' ');
            pids.push({
              pid: items[0],
              port: items[items.length - 2],
              dbType: items[items.length - 1],
            })
          }

        })
      }


    }
    return pids;
  } catch (e) {
    console.log("checkServerRunning", e);
    return [];
  }


}

/**
 * 启动服务器
 */
export function runServer(conf: ConnectionConfig,
  callback: (result: IResult) => void
) {
  try {
    const pids = getServersRunning();
    console.log("runServer", pids);
    if (pids.length > 0) {
      //如果有进程在运行
      let has = false;
      //判断是否是同一个数据库
      for (let i = 0; i < pids.length; i++) {
        if (pids[i].dbType == conf.type) {
          PORT = pids[i].port;
          has = true;
        } else {
          //如果是同一个数据库，则关闭其他的服务器
          killServer(pids[i].pid);
        }
      }
      if (has) {
        callback({
          status: 200,
          message: "Server is running, port:" + PORT,
        });
      } else {
        //启动新的服务器
        return runNewServer(conf, callback);
      }

    } else {
      //启动新的服务器
      return runNewServer(conf, callback);
    }

  } catch (e) {
    callback({
      status: 500,
      message: "Internal Server Error",
    })
  }


}
function killServer(pid: string) {
  if (pid.length <= 0) {
    return;
  }
  const platform = os.platform();
  const { execSync } = require('child_process');
  if (platform === "win32") {
    execSync(`taskkill /F /PID ${pid}`);
  } else if (platform === "darwin" || platform === "linux") {
    execSync(`kill -9 ${pid}`);
  }
}
function runNewServer(conf: ConnectionConfig, callback: (result: IResult) => void) {

  getAvailablePort(10001, (err, port) => {
    if (err) {

      callback({
        status: 810,
        message: "Get port failed"
      });

    } else if (port) {
      PORT = port;
      const dbEx = getDataBaseEX(conf.type);
      if (dbEx == null) {
        callback({
          status: 880,
          message: "Unsupported database type!"
        });
      } else {
        runJar(conf.type,
          path.join(udbFolderPath, "server", "driver", dbEx.getDriverPath())
          , callback);
      }

    }

  });

}
async function runJar(dbType: string, driverPath: string, callback: (result: IResult) => void) {
  const serverpath = path.join(udbFolderPath, "server");
  //如果不存在的话，则创建
  if (!fs.existsSync(serverpath)) {
    fs.mkdirSync(serverpath);
  }

  const javaPath = path.join(serverpath, "java");
  if (!fs.existsSync(javaPath)) {
    //需要从服务下载
    fs.mkdirSync(javaPath);
    callback({
      status: 802,
      message: "Downloading java..."
    });
    await downloadJdk(javaPath);
  }

  const javaBinPath = getJdkBinPath();

  const jarPath = path.join(serverpath, "jar");
  //如果不存在的话，则创建
  if (!fs.existsSync(jarPath)) {
    fs.mkdirSync(jarPath);
  }

  const serverJarPath = path.join(jarPath, "udb-java.jar");
  //如果不存在的话，则创建
  if (!fs.existsSync(serverJarPath)) {
    //需要从服务下载
    callback({
      status: 803,
      message: "Downloading jar..."
    });
    getLatestRelease(serverJarPath)
      .then(() => {
        spawnJar(javaBinPath, jarPath, PORT, dbType, driverPath, callback);
      })
      .catch((e) => {
        console.log("Downloading udb-java jar failed", e);
        callback({
          status: 804,
          message: "Downloading udb-java jar failed"
        });
      });
  } else {
    spawnJar(javaBinPath, jarPath, PORT, dbType, driverPath, callback);

  }
}
/**
 * 
 *  java -cp "udb-java-0.0.2:udb-java-0.0.2/BOOT-INF/classes:udb-java-0.0.2/BOOT-INF/lib/*:/Users/taoyongwen/.udb/server/driver/com/mysql/mysql-connector-j/9.3.0/mysql-connector-j-9.3.0.jar"
 *  com.udb.server.UdbApplication 
 *   10001 "mysql(2,3)"
 * 
 */
function spawnJar(
  javaBinPath: string,
  jarPath: string,
  port: number,
  dbType: string,
  driverPath: string,
  callback: (result: IResult) => void,
) {
  const cp = `udb-java:udb-java/BOOT-INF/classes:udb-java/BOOT-INF/lib/*:${driverPath}`;
  const { spawn } = require("child_process");
  console.log("spawnJar", javaBinPath, jarPath, port, dbType);
  const a="--add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.time=ALL-UNNAMED"
  //cd jarPath
  const child = spawn(
    javaBinPath,
    ["-cp", cp,
      "--add-opens",
      "java.base/java.lang=ALL-UNNAMED",
      "--add-opens",
      "java.base/java.util=ALL-UNNAMED",
      "--add-opens",
      "java.base/java.time=ALL-UNNAMED"
      , "com.udb.server.UdbApplication", port, dbType],
    {
      cwd: jarPath,
    }
  );
  //打印完整的命令
  console.log(child.spawnargs);

  child.stdout.on("data", (data: string) => {
    console.log(`输出: ${data}`);
    if (data.includes("Started UdbApplication")) {
      callback({
        status: 200,
        message: "Server started successfully"
      });
    }
  });

  child.stderr.on("data", (data: any) => {
    console.error(`错误: ${data}`);
    callback({
      status: 500,
      message: "Server started successfully"
    });
  });

  child.on("close", (code: any) => {
    console.log(`子进程退出，代码 ${code}`);
  });


}

function getAvailablePort(
  startPort: number,
  callback: (err: any, port?: number) => void,
) {
  let port = startPort;
  const server = net.createServer();
  server.on
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