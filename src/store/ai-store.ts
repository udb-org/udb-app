import { create } from "zustand";

/**
 * 值存储可以需要多页面同步的值，不需要同步的数据可以放在localStorage中
 */
export const useAiStore = create((set) => ({
  model: {
    apiKey: "",
    baseUrl: "",
    model: "",
  },
  setModel: (model: any) => {
    set((state) => ({
      model: {
        ...state.model,
        ...model,
      },
    }));
  },
}));
