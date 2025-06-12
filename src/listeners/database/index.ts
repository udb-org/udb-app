
import { registerDbConfListeners, unregisterDbConfListeners } from "./db-conf";
import { registerDbExecListeners, unregisterDbExecListeners } from "./db-exec";
import { registerDbUniformListeners, unregisterDbUniformListeners } from "./db-uniform";
/**
 * Unregister all 'handle' and 'on' listeners related to the database operations
 */
export function unregisterDbListeners() {
    unregisterDbConfListeners();
    unregisterDbExecListeners();
    unregisterDbUniformListeners();
}
/**
 * Register all 'handle' and 'on' listeners related to the database operations
 *
 * This function is called when the database is selected
 * */
export function registerDbListeners(mainWindow: Electron.BrowserWindow) {
    registerDbConfListeners(mainWindow);
    registerDbExecListeners(mainWindow);
    registerDbUniformListeners(mainWindow);
}
