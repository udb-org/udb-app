import { useTabStore } from "@/store/tab-store";
import React from "react";
import ViewData from "../view-data";
import ViewDump from "../view-dump";
import ViewSQL from "../view-sql";
import ViewTable from "../view-table";
import ViewTables from "../view-tables";
import ViewText from "../view-text";
import { ViewWebcome } from "../view-welcome";
/**
 *
 * View 容器
 * 1. 用于显示当前选中的视图
 * 2. 视图类型：SQL、设置、表格
 * @returns
 */
export function ViewContainer() {
  const { tab } = useTabStore();

  return (
    <div className="box-border h-full w-full">
      {tab.name.length > 0 && tab.type === "sql" && (
        <ViewSQL viewKey={tab.name} />
      )}

      {tab.name.length > 0 && tab.type === "table" && (
        <ViewTable viewKey={tab.name} />
      )}
      {tab.name.length > 0 && tab.type === "data" && (
        <ViewData viewKey={tab.name} />
      )}

      {tab.name.length > 0 && tab.type === "welcome" && (
        <ViewWebcome viewKey={tab.name} />
      )}
      {tab.name.length > 0 && tab.type === "text" && (
        <ViewText viewKey={tab.name} />
      )}
      {tab.name.length > 0 && tab.type === "tables" && (
        <ViewTables viewKey={tab.name} />
      )}
       {tab.name.length > 0 && tab.type === "dump" && (
        <ViewDump viewKey={tab.name} />
      )}
    </div>
  );
}
