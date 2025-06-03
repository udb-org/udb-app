import { create } from "zustand";
/**
 * 保存视图
 */
export function saveView(viewKey: string | undefined, view: any) {
  localStorage.setItem("vs_" + viewKey, JSON.stringify(view));
}
/**
 * 保存视图的值
 * @param viewKey 
 * @param key 
 * @param value 
 */
export function saveViewValue(viewKey: string | undefined, key: string, value: any,append?:boolean) {
  const viewStore = localStorage.getItem("vs_" + viewKey);
  if (viewStore) {
    const view = JSON.parse(viewStore);
    if(append){
      if(!view[key]){
        view[key]=[];
      }
      const oldValue=view[key];
      view[key]=oldValue.concat(value);
    }else{
      view[key] = value;
    }
    localStorage.setItem("vs_" + viewKey, JSON.stringify(view));
  }
  else {
    const view: any = {};
    view[key] = value;
    localStorage.setItem("vs_" + viewKey, JSON.stringify(view));
  }
}
/**
 * 获取视图
 * 
 * @param viewKey 视图的key
 * @returns 
 */
export function getView(viewKey: string) {
  const viewStore = localStorage.getItem("vs_" + viewKey);
  if (viewStore) {
    return JSON.parse(viewStore);
  }
  return null;
}
/**
 * 值存储可以需要多页面同步的值，不需要同步的数据可以放在localStorage中
 */
export const useTabStore = create((set) => ({
  tab: {
    type: "",
    name: "",
    path: []
  },
  setTab: (
    tab: {
      type: string,
      name: string,
      path: string[]
    }
  ) => {
    console.log("setTab", tab);
    set((state) => ({
      tab: tab
    }));
  }
}));
