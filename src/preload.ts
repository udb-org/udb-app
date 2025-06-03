// preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
// Define the Electron API interface
type ElectronAPI = {
  invoke: <T>(channel: string, ...args: any[]) => Promise<T>;
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, listener: (...args: any[]) => void) => void;
  once: (channel: string, listener: (...args: any[]) => void) => void;
  removeListener: (channel: string, listener: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
  isFirstRun: () => boolean;
};
//Safe API
const electronAPI: ElectronAPI = {
  invoke: async (channel, ...args) => {
    try {
      return await ipcRenderer.invoke(channel, ...args);
    } catch (error) {
      //do not throw error, just log it
      console.error(`Invoke error [${channel}]:`, error);
      throw {
        name: "ElectronAPIError",
        message: `IPC invoke error: ${error instanceof Error ? error.message : String(error)}`,
        channel,
        original: error,
      };
    }
  },
  send: (channel, ...args) => {
    ipcRenderer.send(channel, ...args);
  },
  on: (channel, listener) => {
    const subscription = (_event: IpcRendererEvent, ...args: any[]) =>
      listener(...args);
    ipcRenderer.on(channel, subscription);
  },
  once: (channel, listener) => {
    const subscription = (_event: IpcRendererEvent, ...args: any[]) =>
      listener(...args);
    ipcRenderer.once(channel, subscription);
  },
  removeListener: (channel, listener) => {
    ipcRenderer.removeListener(channel, listener);
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  isFirstRun: () => {
    const fs=require('fs');
    const path=require('path');
    const userHomeDir = require('os').homedir();
      const udbFolderPath = path.join(userHomeDir, '.udb');
      return !fs.existsSync(udbFolderPath);
  }
};
contextBridge.exposeInMainWorld("api", electronAPI);
declare global {
  interface Window {
    api: ElectronAPI;
  }
}
