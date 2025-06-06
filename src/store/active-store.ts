import { create } from "zustand";

/**
 * Interface defining the shape of the active store
 * @property active - Currently active view identifier (default: "database")
 * @property setActive - Function to update the active view
 */
export interface ActiveStore {
  active: string;
  setActive: (active: string) => void;
}

/**
 * Zustand store for managing the currently active view in the application
 * @returns Store object with:
 *   - active: Current active view identifier
 *   - setActive: Function to update the active view
 */
export const useActiveStore = create<ActiveStore>((set) => ({
  // Default to 'database' view on initial load
  active: "database",
  
  /**
   * Updates the currently active view
   * @param active - New view identifier to set as active
   */
  setActive: (active: string) => {
    set((state) => ({
      active: active
    }));
  }
}));
