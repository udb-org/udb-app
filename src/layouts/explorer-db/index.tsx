import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CodeIcon,
  ColumnsIcon,
  DatabaseIcon,
  MoreHorizontalIcon,
  TableIcon,
} from "lucide-react";
import VirtualList from "@/components/virtual-scroll";
import { IVirtualTreeItem, VirtualTree } from "@/components/virtual-tree";
import { openMenu } from "@/api/menu";
import { useProjectStore } from "@/store/project-store";
import {
  IDataBase,
  IDataBaseTable,
  IDataBaseTableColumn,
  IResult,
} from "@/types/db";
import { openView } from "@/api/view";
import { openDialog } from "../dialog";
import { DialogType } from "@/types/dialog";
import { ViewType } from "@/types/view";
import { useTranslation } from "react-i18next";
import { Webcome } from "./welcome";
import FolderDatabase from "@/components/icons/folder-database";
import FolderDatabaseOpen from "@/components/icons/folder-database-open";
import FolderContentOpen from "@/components/icons/folder-content-open";
import FolderContent from "@/components/icons/folder-content";
import FolderContextOpen from "@/components/icons/folder-context-open";
import FolderContext from "@/components/icons/folder-context";
import { toast } from "sonner";
export function ExplorerDb(props: { isVisible: boolean }) {
  const [files, setFiles] = React.useState<IVirtualTreeItem[]>([]);
  function transformFiles(files: any[]) {
    const _files: IVirtualTreeItem[] = [];
    files.forEach((file) => {
      _files.push({
        name: file.Database,
        isFolder: true,
        expandIcon: <FolderDatabaseOpen size={14} className="flex-shrink-0" />,
        collapseIcon: <FolderDatabase size={14} className="flex-shrink-0" />,

      });
    });
    return _files;
  }
  useEffect(() => {
    //打开项目
    const getDatabasesing = (res: IResult) => {
      console.log("getDatabasesing", res);
      if (res.status == 200) {
        const _files = transformFiles(res.data.data as IDataBase[]);
        setFiles(_files);
        // setDatabases((pre)=>res.data.data as IDataBase[]);
      }else{
        toast.error(t("status." + res.status));
      }
    };
    window.api.on("db:getDatabasesing", getDatabasesing);
    const explorer_db_actioning = (params: any) => {
      console.log("explorer-db-actioning", params);
      if (params.command === "addDatabase") {
        openDialog({
          type: DialogType.AddDatabase,
          params: params.params,
        });
      } else if (params.command === "deleteDatabase") {
        openDialog({
          type: DialogType.DeleteDatabase,
          params: params.params,
        });
      } else if (params.command === "addTable") {
        openView({
          type: ViewType.Table,
          params: {
            database: params.params.database,
          },
          path: [params.params.database],
        });
      } else if (params.command === "selectRows") {
        openView({
          type: ViewType.Sql,
          name: params.params.table + " Select Rows",
          params: {
            sql: `SELECT * FROM ${params.params.table} limit 100`,
            // database: params.params.database,
            // table: params.params.table,
          },
          path: [params.params.database, params.params.table],
        });
      } else if (params.command === "alterTable") {
        openView({
          type: ViewType.Table,
          name: "Alter " + params.params.table,
          params: {
            table: params.params.table,
          },
          path: [params.params.database],
        });
      } else if (params.command === "dropTable") {
        openDialog({
          type: DialogType.DropTable,
          params: {
            database: params.params.database,
            table: params.params.table,
          },
        });
      } else if (params.command === "showTables") {
        openView({
          type: ViewType.Tables,
          params: {
            database: params.params.database,
          },
          path: [params.params.database],
        });
      } else if (params.command === "exportDatabase") {
        openView({
          type: ViewType.Dump,
          params: {
            database: params.params.database,
          },
          path: [params.params.database],
        });
      }
    };
    window.api.on("explorer:db-actioning", explorer_db_actioning);
    return () => {
      window.api.removeAllListeners("db:getDatabasesing");
      window.api.removeAllListeners("explorer:db-actioning");
    };
  }, []);
  const { t } = useTranslation();
  return (
    <div
      className="h-full w-full flex-col"
      style={{
        display: props.isVisible ? "flex" : "none",
      }}
    >
      <div className="flex flex-shrink-0 items-center text-sm font-bold">
        <div className="text-sm font-bold">{t("active.bar.database")}</div>
        <div className="flex-1"></div>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="m-[0px] h-[28px] w-[28px]"
        >
          <MoreHorizontalIcon size={14}></MoreHorizontalIcon>
        </Button>
      </div>
      {/* <ScrollArea className="flex-1">
      <ScrollBar orientation="vertical" />
    </ScrollArea> */}
      {/* <VirtualList items={rows}  estimateHeight={32} renderItem={(item: IExplorerDbRow, i: number) => {
      return <div></div>
    }}></VirtualList> */}


      {files.length > 0 && <VirtualTree
        data={files}
        onLoad={(path: string[]) => {
          console.log("onLoad", path);
          //等待10秒
          if (path.length == 1) {
            //选择数据库
            window.api.send("db:selectDatabase", path[0]);
         
            //数据库,返回Tables,Views,Functions,Procedures
            return new Promise((resolve) => {
              const _files: IVirtualTreeItem[] = [];
              _files.push({
                name: "Tables",
                isFolder: true,
                expandIcon: <FolderContentOpen size={14} className="flex-shrink-0" />,
                collapseIcon: <FolderContent size={14} className="flex-shrink-0" />,
              });
              _files.push({
                name: "Views",
                isFolder: true,
              });
              _files.push({
                name: "Functions",
                isFolder: true,
              });
              _files.push({
                name: "Procedures",
                isFolder: true,
              });
              return resolve(_files);
            });
          } else if (path.length == 2) {
            //二级
            const databaseName = path[0];
            if (path[1] === "Tables") {
              //需要返回所有的表
              return window.api
                .invoke("db:getTables", databaseName)
                .then((getTablesResult: IResult) => {
                  console.log("getTables", getTablesResult);
                  if (getTablesResult.status==200) {
                    const _files: IVirtualTreeItem[] = [];
                    const tables = getTablesResult.data.data as IDataBaseTable[];
                    tables.forEach((table) => {
                      _files.push({
                        name: table.TABLE_NAME,
                        isFolder: true,
                        description: table.TABLE_COMMENT,
                        expandIcon: <FolderContextOpen size={14} className="flex-shrink-0" />,
                        collapseIcon: <FolderContext size={14} className="flex-shrink-0" />,
                        // icon: <TableIcon size={14} className="flex-shrink-0" />,
                      });
                    });
                    console.log("_files", _files);
                    if (_files.length==0){
                      _files.push({
                        name: "No Tables",
                        isFolder: false,
                        noChildren: true,
                      });
                    }
                    return _files;
                  }else{
                    toast.error(t("status." + getTablesResult.status));
                    return [{
                      name: "error",
                      isFolder: false,
                      isError: true,
                    }];
                  }
                });
            }
            if (path[1] === "Views") {
              //需要返回所有树图』
              return window.api
                .invoke("db:getViews", databaseName)
                .then((res: IResult) => {
                  console.log("getViews", res);
                  if (res.status === 200) {
                    const _files: IVirtualTreeItem[] = [];
                    const views = res.data.data;
                    views.forEach((view) => {
                      _files.push({
                        name: view.TABLE_NAME,
                        isFolder: true,
                        description: view.TABLE_COMMENT,
                        // icon: <TableIcon size={14} className="flex-shrink-0" />,
                      });
                    });
                    console.log("_files", _files);
                    if (_files.length==0){
                      _files.push({
                        name: "No Views",
                        isFolder: false,
                        noChildren: true,
                      });
                    }
                    return _files;
                  }else{
                    toast.error(t("status." + res.status));
                    return [{
                      name: "error",
                      isFolder: false,
                      isError: true,
                    }];
                  }
                });
            }
            if (path[1] === "Functions") {
              //需要返回所有方法
              return window.api
                .invoke("db:getFunctions", databaseName)
                .then((res: IResult) => {
                  console.log("getFunctions", res);
                  if (res.status === 200) {
                    let _files: IVirtualTreeItem[] = [];
                    const functions = res.data.data;
                    functions.forEach((fun) => {
                      _files.push({
                        name: fun.SPECIFIC_NAME,
                        isFolder: false,
                        icon: <CodeIcon size={14} className="flex-shrink-0" />,
                        description: fun.ROUTINE_COMMENT,
                      });
                    });
                    console.log("_files", _files);
                    if (_files.length==0){
                      _files.push({
                        name: "No Functions",
                        isFolder: false,
                        noChildren: true,
                      });
                    }
                    return _files;
                  }else{
                    toast.error(t("status." + res.status));
                    return [{
                      name: "error",
                      isFolder: false,
                      isError: true,
                    }]; 
                  }
                });
            }
            if (path[1] === "Procedures") {
              //需要返回所有方法
              return window.api
                .invoke("db:getProcedures", databaseName)
                .then((res: IResult) => {
                  console.log("getProcedures", res);
                  if (res.status === 200) {
                    let _files: IVirtualTreeItem[] = [];
                    const procedures = res.data.data;
                    procedures.forEach((fun) => {
                      _files.push({
                        name: fun.SPECIFIC_NAME,
                        isFolder: false,
                        icon: <CodeIcon size={14} className="flex-shrink-0" />,
                        description: fun.ROUTINE_COMMENT,
                      });
                    });
                    console.log("_files", _files);
                    if (_files.length==0){
                      _files.push({
                        name: "No Procedures",
                        isFolder: false,
                        noChildren: true,
                      });
                    }
                    return _files;
                  }else{
                    toast.error(t("status." + res.status));
                    return [{
                      name: "error",
                      isFolder: false,
                      isError: true,
                    }];
                  }
                });
            }
          } else if (path.length == 3) {
            //三级目录，表，视图、方法，点击表名
            if (path[1] === "Tables") {
              return new Promise((resolve) => {
                const _files: IVirtualTreeItem[] = [];
                _files.push({
                  name: "Columns",
                  isFolder: true,
                });
                _files.push({
                  name: "Indexes",
                  isFolder: true,
                });
                _files.push({
                  name: "Triggers",
                  isFolder: true,
                });
                resolve(_files);
              });
            }
            if (path[1] === "Views") {
            }
            if (path[1] === "Functions") {
            }
            if (path[1] === "Procedures") {
            }
          } else if (path.length == 4) {
            if (path[1] === "Tables" && path[3] === "Columns") {
              return window.api
                .invoke("db:getColumns", path[2])
                .then((res: IResult) => {
                  console.log("getColumns", res);
                  if (res.status === 200) {
                    const _files: IVirtualTreeItem[] = [];
                    const columns = res.data.data as IDataBaseTableColumn[];
                    columns.forEach((column) => {
                      _files.push({
                        name: column.COLUMN_NAME + "",
                        isFolder: false,
                        icon: (
                          <ColumnsIcon size={14} className="flex-shrink-0" />
                        ),
                        description: column.COLUMN_COMMENT,
                      });
                    });
                    console.log("_files", _files);
                    if (_files.length==0){
                      _files.push({
                        name: "No Columns",
                        isFolder: false,
                        noChildren: true,
                      });
                    }
                    return _files;
                  }else{
                    toast.error(t("status." + res.status));
                    return [{
                      name: "error",
                      isFolder: false,
                      isError: true,
                    }];
                  }
                });
            }
          }
        }}
        onRowClick={(row) => { }}
        onRowContextMenu={(row) => {
          const path = row.path;
          if (path.length == 1) {
            openMenu({
              channel: "explorer:db-actioning",
              params: {
                database: row.name,
              },
              items: [
                {
                  name: "Add Table",
                  command: "addTable",
                },
                {
                  type: "separator",
                },
                {
                  name: "Alter Database",
                  command: "alterDatabase",
                },
                {
                  name: "Drop Database",
                  command: "deleteDatabase",
                },
                {
                  type: "separator",
                },
                {
                  name: "Export Database",
                  command: "exportDatabase",
                },
                {
                  name: "Import Database",
                  command: "importDatabase",
                },
              ],
            });
          } else if (path.length == 2) {
            if (path[1] == "Tables") {
              openMenu({
                channel: "explorer:db-actioning",
                params: {
                  database: path[0],
                },
                items: [
                  {
                    name: "Add Table",
                    command: "addTable",
                  },
                  {
                    name: "Show Tables",
                    command: "showTables",
                  },
                ],
              });
            }
          } else if (path.length == 3) {
            if (path[1] === "Tables") {
              openMenu({
                channel: "explorer:db-actioning",
                params: {
                  table: row.name,
                },
                items: [
                  {
                    name: "Select Rows",
                    command: "selectRows",
                  },
                  {
                    type: "separator",
                  },
                  {
                    name: "Alter Table",
                    command: "alterTable",
                  },
                  {
                    name: "Drop Table",
                    command: "dropTable",
                  },
                  {
                    type: "separator",
                  },
                  {
                    name: "Export Table",
                    command: "exportTable",
                  },
                  {
                    name: "Import Table",
                    command: "importTable",
                  },
                ],
              });
            } else if (path[1] === "Views") {
            } else if (path[1] === "Functions") {
            } else if (path[1] === "Procedures") {
            }
          }
        }}
      ></VirtualTree>}

      {
        files.length==0&&<Webcome/>
      }



    </div>
  );
}
