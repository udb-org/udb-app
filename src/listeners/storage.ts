import { testConnection } from "@/services/db";
import { executeSql } from "@/services/db-client";
import { addModel, getConfig, getConfigItem, getModels, getRecentProjects, initUdbFolder, readConnectionConfig, removeModel, setConfig, setRecentProjects, writeConnectionConfig } from "@/services/storage";
import { ConnectionConfig, IDataSource } from "@/types/db";
import { IProject } from "@/types/project";
import { ViewParams } from "@/types/view";
import { ipcMain, dialog } from "electron";
import * as fs from 'fs';

export function unregisterStorageListeners() {

  // Remove handlers for 'handle' type IPC events
  ipcMain.removeHandler("storage:init");
  


  // Remove listeners for 'on' type IPC events
 

}



export function registerStorageListeners(mainWindow: Electron.BrowserWindow) {

  //初始化设置
  ipcMain.handle("storage:init", (event, config: any) => {
    initUdbFolder();
    setConfig(config);
    return true;
  });



  //获取最近的文件夹
  ipcMain.handle("storage:getRecentProjects", async (event) => {
    const recentProjects = getRecentProjects();
    //按照lastOpenTime排序
    recentProjects.sort((a, b) => {
      return new Date(b.lastOpenTime).getTime() - new Date(a.lastOpenTime).getTime();
    });

    return recentProjects;
  });
  //设置最近的文件夹
  ipcMain.handle("storage:setRecentProjects", async (event, Projects: IProject[]) => {
    setRecentProjects(Projects);
    return true;
  });

  function getFiles(path: string) {
    //获得folder下的所有文件夹及文件
    let files = fs.readdirSync(path);
    // //排序
    // files = files.sort((a, b) => {
    //   return a.localeCompare(b);
    // })
    //排除一些特殊的文件和文件夹，如.git .idea .vscode .DS_Store 等
    const excludes = [".git", ".idea", ".vscode", ".DS_Store", ".github", ".vite", ".project", ".classpath", ".settings", ".ropeproject"];
    files = files.filter(file => {
      return !excludes.includes(file);
    })

    // Get detailed information about each file or folder, including type, modification time, creation time, etc.
    let fileList = [];
    let folderList = [];
    for (const file of files) {
      const filePath = `${path}/${file}`;
      const stats = fs.statSync(filePath);
      const item = {
        name: file,
        path: filePath,
        type: stats.isDirectory() ? 'directory' : (stats.isFile() ? 'file' : 'unknown'),

        size: stats.size,
        mtime: stats.mtime.toISOString(),
        ctime: stats.ctime.toISOString(),
        birthtime: stats.birthtime.toISOString(),
      }
      if (stats.isDirectory()) {
        folderList.push(item);
      } else {
        fileList.push(item);
      }
    }

    return folderList.concat(fileList);


  }

  ipcMain.on("storage:openProject", async (event, path: string) => {
    console.log("storage:openProject", path);
    //获得folder下的所有文件夹及文件
    let files = getFiles(path);
    let recentProjects = getRecentProjects();
    let name = path.substring(path.replaceAll("\\", "/").lastIndexOf("/") + 1);
    //删除已存在的
    recentProjects = recentProjects.filter(item => {
      return item.name !== name;
    })
    recentProjects.push({
      name: name,
      path: path,
      lastOpenTime: new Date().toLocaleString()
    });
    setRecentProjects(recentProjects);
    mainWindow.webContents.send("storage:openProjecting", files);
  });
  ipcMain.handle("storage:openFolder", async (event, projectPath: string, folderPath: string) => {
    const path = projectPath + "/" + folderPath;
    console.log("storage:openFolder", path);
    return getFiles(path);


  });
  ipcMain.on("storage:openFile", async (event, projectPath: string, filePath: string) => {
    const path = projectPath + "/" + filePath;
    console.log("storage:openFile", path);
    //获得文件内容并返回
    // const content = fs.readFileSync(path, 'utf-8');
    const isText = isTextFile(path);
    if (!isText) {
      dialog.showErrorBox("Error", "This is a binary file");
    } else {
      const content = fs.readFileSync(path, 'utf-8');
      let paths = filePath.replaceAll("\\", "/").split("/");
      //删除空的
      paths = paths.filter(item => {
        return item !== '';
      })
      const args: ViewParams = {
        name: path.substring(path.replaceAll("\\", "/").lastIndexOf("/") + 1),
        type: filePath.endsWith(".sql") ? "sql" : "text",
        params: {
          content: content,
          path: path
        },
        path: paths
      };
      mainWindow.webContents.send("view:opening", args);

    }
  });

  function isTextFile(filePath: string) {
    try {
      const buffer = fs.readFileSync(filePath);
      // 检查buffer中是否有非ASCII字符
      for (let i = 0; i < Math.min(buffer.length, 512); i++) {
        if (buffer[i] === 0) return false; // 二进制文件通常包含null字节
        if (buffer[i] < 32 && buffer[i] !== 9 && buffer[i] !== 10 && buffer[i] !== 13) {
          return false; // 非可打印ASCII控制字符
        }
      }
      return true;
    } catch (err) {
      console.error('Error reading file:', err);
      return false;
    }
  }



  //获取模型列表
  ipcMain.on("storage:getModels", (event, args: string) => {
    console.log("storage:getModels", args);
    const models = getModels();
    mainWindow.webContents.send("storage:getModelsing", models);
  });
  //增加模型
  ipcMain.on("storage:addModel", (event, args: string) => {
    console.log("storage:addModel", args);
    const model = JSON.parse(args);
    addModel(model);
    const models = getModels();
    mainWindow.webContents.send("storage:getModelsing", models);
  });
  //删除模型
  ipcMain.on("storage:deleteModel", (event, args: string) => {
    console.log("storage:deleteModel", args);
    removeModel(args);
    const models = getModels();
    mainWindow.webContents.send("storage:getModelsing", models);
  });
  //获取配置
  ipcMain.handle("storage:getConfig", (event, args: string) => {

    const config = getConfig();
    return config;
  });
  //设置配置
  ipcMain.handle("storage:setConfig", (event, args: any) => {
    console.log("storage:setConfig", args);
    let config = getConfig();
    for (const key in args) {
      config[key] = args[key];
    }
    setConfig(config);
    return true;
  });
  //获取配置
  ipcMain.handle("storage:getConfigItem", (event, args: string) => {

    const config = getConfigItem(args);
    return config;
  });


}
