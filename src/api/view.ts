import { IExplorerParam } from "@/layouts/explorer";
import { IAction } from "@/layouts/view-title/view-tabs";
import { ViewParams } from "@/types/view";
/**
 * 打开新页面
 * 
 * @param params 
 */
export function openView(params:ViewParams){
    window.api.send("view:open",params);
  }
export interface SqlActionParams{
    command:string;
}
  /**
   * sql action
   * 
   */
export function sqlAction(params:SqlActionParams){
    window.api.send("view:sql-action",params);
}
export function tableAction(params:SqlActionParams){
  window.api.send("view:table-action",params);
}
/**
 * 
 * show actions
 * 
 * @param params 
 */
export function showActions(params:IAction[]){
  window.api.send("view:show-actions",params);
}