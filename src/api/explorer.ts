import { IExplorerParam } from "@/layouts/explorer";
export function openExplorer(params:IExplorerParam){
    window.api.send("explorer:open",params);
  }