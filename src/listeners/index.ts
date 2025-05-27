import { registerAiListeners } from "./ai";
import { registerDbListeners } from "./db";
import { registerDialogListeners } from "./dialog";
import { registerExplorerListeners } from "./explorer";
import { registerHistoryListeners } from "./history";
import { registerMenuListeners } from "./menu";
import { registerPlatformListeners } from "./platfrom";
import { registerStorageListeners } from "./storage";
import { registerViewListeners } from "./view";

export function registerListeners(mainWindow: Electron.BrowserWindow) {
  registerPlatformListeners(mainWindow);
  registerStorageListeners(mainWindow);
  registerDialogListeners(mainWindow);
  registerDbListeners(mainWindow);
  registerExplorerListeners(mainWindow);
  registerViewListeners(mainWindow);
  registerMenuListeners(mainWindow);
  registerAiListeners(mainWindow);
  registerHistoryListeners(mainWindow);
}

