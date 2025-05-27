import { create } from "zustand";


/**
 * 值存储可以需要多页面同步的值，不需要同步的数据可以放在localStorage中
 */
export const useLayoutStore = create((set) => ({
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
