import { registerAiListeners, unregisterAiListeners } from "./ai";
import { registerDbListeners, unregisterDbListeners } from "./db";
import { registerDialogListeners, unregisterDialogListeners } from "./dialog";
import { registerExplorerListeners, unregisterExplorerListeners } from "./explorer";
import { registerHistoryListeners, unregisterHistoryListeners } from "./history";
import { registerMenuListeners, unregisterMenuListeners } from "./menu";
import { registerPlatformListeners, unregisterPlatformListeners } from "./platfrom";
import { registerStorageListeners, unregisterStorageListeners } from "./storage";
import { registerViewListeners, unregisterViewListeners } from "./view";

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
export function unregisterListeners() {
  unregisterAiListeners();
  unregisterDbListeners();
  unregisterDialogListeners();
  unregisterExplorerListeners();
  unregisterHistoryListeners();
  unregisterMenuListeners();
  unregisterPlatformListeners();
  unregisterStorageListeners();
  unregisterViewListeners();
}

