import React, { useEffect } from "react";
import { ViewTitle } from "../view-title";
import ViewSQL from "../view-sql";
import { useTabStore } from "@/store/tab-store";
import ViewTable from "../view-table";
import ViewData from "../view-data";
import { ViewWebcome } from "../view-welcome";
import ViewText from "../view-text";
import { useLayoutStore } from "@/store/layout-store";
import ViewTables from "../view-tables";
import ViewDump from "../view-dump";
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
