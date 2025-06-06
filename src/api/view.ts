import { IExplorerParam } from "@/layouts/explorer";
import { ActionParam, IAction, ViewParams } from "@/types/view";
/**
 * 打开新页面
 * 
 * @param params 
 */
export function openView(params:ViewParams){
    window.api.send("view:open",params);
  }


/**
 * 
 * show actions
 * 
 * @param params 
 */
export function showActions(channel:string,params:IAction[]){
  window.api.send("view:show-actions",{
    channel:channel,
    actions:params
  });
}

export function callAction(params:ActionParam){
  window.api.send("view:call-action",params);
}