import { IProject } from "@/types/project";
import { create } from "zustand";

/**
 * Interface defining the structure and behavior of the Project Store.
 * @property {IProject} project - Current project data object
 * @property {Function} setProject - Method to update the entire project state
 */
export interface ProjectStore {
  project: IProject;
  setProject: (project: IProject) => void;
}

/**
 * Zustand store for managing project-related state across the application.
 * Initializes with default empty project values and provides a state updater.
 */
export const useProjectStore = create((set) => ({
  // Current project data, initialized with empty values
  project: {
    name: "",
    path: "", // Filesystem path to the project directory
  },
  
  /**
   * Updates the entire project state with new values.
   * @param {IProject} project - New project data object containing updated values
   * @example
   * // Usage example:
   * useProjectStore.getState().setProject({
   *   name: "New Project",
   *   path: "/path/to/project"
   * });
   */
  setProject: (project: IProject) => {
    set((state) => ({
      project: project // Complete state replacement with new project object
    }));
  }
}));
