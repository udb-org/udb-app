import { create } from "zustand";

/**
 * Saves view state to localStorage with a specific view key
 * @param viewKey - Unique identifier for the view state
 * @param view - The view state object to be serialized and stored
 */
export function saveView(viewKey: string | undefined, view: any) {
  localStorage.setItem("vs_" + viewKey, JSON.stringify(view));
}

/**
 * Updates a specific value in view state storage with optional array appending
 * @param viewKey - Unique identifier for the view state
 * @param key - Property key to update in the view state
 * @param value - New value to set or append
 * @param append - When true, appends value to existing array instead of replacing
 */
export function saveViewValue(viewKey: string | undefined, key: string, value: any, append?: boolean) {
  const viewStore = localStorage.getItem("vs_" + viewKey);
  if (viewStore) {
    const view = JSON.parse(viewStore);
    if (append) {
      if (!view[key]) {
        view[key] = [];
      }
      const oldValue = view[key];
      view[key] = oldValue.concat(value);
    } else {
      view[key] = value;
    }
    localStorage.setItem("vs_" + viewKey, JSON.stringify(view));
  } else {
    const view: any = {};
    view[key] = value;
    localStorage.setItem("vs_" + viewKey, JSON.stringify(view));
  }
}

/**
 * Retrieves stored view state from localStorage
 * @param viewKey - Unique identifier for the view state
 * @returns Parsed view state object or null if not found
 */
export function getView(viewKey: string) {
  const viewStore = localStorage.getItem("vs_" + viewKey);
  return viewStore ? JSON.parse(viewStore) : null;
}

/**
 * Interface defining the tab navigation state and its setter
 */
export interface TabStore {
  /** Current tab state containing type, name, and path array */
  tab: {
    type: string;
    name: string;
    path: string[];
    isChanged?: boolean;
  };
  
  /** 
   * Updates the current tab state
   * @param tab - New tab state object containing type, name, and path
   */
  setTab: (tab: {
    type: string;
    name: string;
    isChanged?: boolean;
    path: string[];
  }) => void;
}

/**
 * Zustand store instance for managing tab navigation state
 */
export const useTabStore = create<TabStore>((set) => ({
  tab: {
    type: "",
    name: "",
    path: [],
  },
  setTab: (tab) => {
    console.log("Updating tab state:", tab);
    set((state) => ({
      tab: tab,
    }));
  },
}));