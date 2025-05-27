// preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// 定义暴露给渲染进程的 API 类型
type ElectronAPI = {
  invoke: <T>(channel: string, ...args: any[]) => Promise<T>;
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, listener: (...args: any[]) => void) => void;
  once: (channel: string, listener: (...args: any[]) => void) => void;
  removeListener: (channel: string, listener: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
};

// 自定义的 API 对象
const electronAPI: ElectronAPI = {
  invoke: async (channel, ...args) => {
    try {
      return await ipcRenderer.invoke(channel, ...args);
    } catch (error) {
      // 统一错误处理
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
  }
};

// 暴露安全 API 到 window 对象
contextBridge.exposeInMainWorld("api", electronAPI);

// 类型声明文件 (在项目中需要全局声明)
declare global {
  interface Window {
    api: ElectronAPI;
  }
}
