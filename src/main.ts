/**
 * This file is the entry point for the main process of the application.
 * It is responsible for creating the main window and registering listeners.
 * It also checks if the app is already running and quits if it is.
 * @author udb
 * @date 2025/04/21
 * @version 1.0.0
 */
import { app, BrowserWindow } from "electron";
// import {
//   installExtension,
//   REACT_DEVELOPER_TOOLS,
// } from "electron-devtools-installer";
import path from "path";
import { registerListeners, unregisterListeners } from "./listeners";
import { getThemeBg } from "./listeners/app";
const isDev =true;


function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
    },
    backgroundColor:getThemeBg(),
    titleBarStyle: "hidden",
    trafficLightPosition: {
      x: 10,
      y: 12,
    },
  });
  registerListeners(mainWindow);
  if(isDev){
    mainWindow.webContents.openDevTools();
  }
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
  mainWindow.on("closed", () => {
    unregisterListeners();
  });
}
async function installExtensions() {
  try {
    if(isDev){
      const { REACT_DEVELOPER_TOOLS ,installExtension} = require("electron-devtools-installer");
      const result = await installExtension(REACT_DEVELOPER_TOOLS);
      console.log(`Extensions installed successfully: ${result.name}`);
    }
    
  } catch {
    console.error("Failed to install extensions");
  }
}
app.whenReady().then(createWindow).then(installExtensions);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});