import { create } from "zustand";
/**
 * This interface defines the structure of the layout store.
 */
export interface LayoutStore {
  leftPanelSize: number;
  rightPanelSize: number;
  leftVisible: boolean;
  rightVisible: boolean;
  /**
   * Sets the size of the left panel.
   * 
   * @param size The size of the left panel in pixels.
   * @returns 
   */
  setLeftPanelSize: (size: number) => void;
  /**
   * Sets the size of the right panel.
   *
   * @param size The size of the right panel in pixels.
   * @returns
   */
  setRightPanelSize: (size: number) => void;
  /**
   * Sets whether the left panel is visible or not.
   *
   * @param visible Whether the left panel is visible or not.
   * @returns
   */
  setLeftVisible: (visible: boolean) => void;
  /**
   * Sets whether the right panel is visible or not.
   *
   * @param visible Whether the right panel is visible or not.
   * @returns
   */
  setRightVisible: (visible: boolean) => void;
}
/**
 * This store manages the layout of the application.
 * It allows you to set the size of the left and right panels,
 * and whether they are visible or not.
 *
 * @example
 * const { leftPanelSize, setLeftPanelSize } = useLayoutStore();
 * setLeftPanelSize(200);
 */
export const useLayoutStore = create<LayoutStore>((set) => ({
  leftPanelSize: 200,
  rightPanelSize: 300,
  leftVisible: true,
  rightVisible: true,
  setLeftPanelSize: (size: number) => {
    set((state) => ({
      leftPanelSize: size
    }));
  },
  setRightPanelSize: (size: number) => {
    set((state) => ({
      rightPanelSize: size
    }));
  },
  setLeftVisible: (visible: boolean) => {
    set((state) => ({
      leftVisible: visible
    }));
  },
  setRightVisible: (visible: boolean) => {
    set((state) => ({
      rightVisible: visible
    }));
  },
}));
