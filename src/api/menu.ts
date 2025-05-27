import { IExplorerParam } from "@/layouts/explorer";
import { ViewParams } from "@/types/view";
export interface IMenuItem {
  name?: string;
  command?: string;
  type?: "normal" | "separator" | "submenu" | "checkbox" | "radio";
  accelerator?: string;
}
export interface IMenuParams {
  channel: string;
  params?: any;
  items: IMenuItem[];
}
/**
 * 菜单
 *
 */
export function openMenu(params: IMenuParams) {
  window.api.send("menu:open", params);
}
