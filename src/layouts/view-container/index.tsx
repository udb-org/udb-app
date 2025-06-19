import { useTabStore } from "@/store/tab-store";
import React from "react";
import ViewData from "../view-data";
import ViewDump from "../view-dump";
import ViewSQL from "../view-sql";
import ViewTable from "../view-table";
import ViewTables from "../view-tables";
import ViewText from "../view-text";
import ViewUserProtocal from "../view-user-protocal";
import ViewPrivacyPolicy from "../view-privacy-policy";
import ViewOpenSource from "../view-open-source";
import ViewImport from "../view-import";
import ViewExport from "../view-export";
import { Views } from "../view";


/**
 *
 * View 容器
 * 1. 用于显示当前选中的视图
 * 2. 视图类型：SQL、设置、表格
 * @returns
 */
export function ViewContainer() {
  const { tab } = useTabStore();
  function getView(t){
    if (Views.hasOwnProperty(t.type)) {
      const _view = Views[t.type].view(t.name);
      // const _icon=Views[t.name].icon;
      return _view;
    }else{
      return <div>No view {t.type}</div>;
    }
  }
  return (
    <div className="box-border h-full w-full">
      {getView(tab)}
    </div>
  );
}
