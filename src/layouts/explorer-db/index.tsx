import { openMenu } from "@/api/menu";
import { openView } from "@/api/view";
import FolderContent from "@/components/icons/folder-content";
import FolderContentOpen from "@/components/icons/folder-content-open";
import FolderContext from "@/components/icons/folder-context";
import FolderContextOpen from "@/components/icons/folder-context-open";
import FolderDatabase from "@/components/icons/folder-database";
import FolderDatabaseOpen from "@/components/icons/folder-database-open";
import { Button } from "@/components/ui/button";
import { IVirtualTreeItem, VirtualTree } from "@/components/virtual-tree";
import { useDbStore } from "@/store/db-store";
import {
  IDataBase,
  IDataBaseTable,
  IDataBaseTableColumn,
  IResult
} from "@/types/db";
import { DialogType } from "@/types/dialog";
import { ViewType } from "@/types/view";
import {
  CodeIcon,
  ColumnsIcon,
  Loader,
  MoreHorizontalIcon
} from "lucide-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { openDialog } from "../dialog";
import { Webcome } from "./welcome";
export function ExplorerDb(props: { isVisible: boolean }) {
  //Global store connection
  const connection = useDbStore((state) => state.connection);
  const setConnection = useDbStore((state) => state.setConnection);
  const [files, setFiles] = React.useState<IVirtualTreeItem[]>([]);
  /**
   * Transform files to virtual tree items
   * 
   * @param files 
   * @returns 
   */
  function transformFiles(files: any[]) {
    const _files: IVirtualTreeItem[] = [];
    files.forEach((file) => {
      _files.push({
        name: file.name,
        isFolder: true,
        expandIcon: <FolderDatabaseOpen size={14} className="flex-shrink-0" />,
        collapseIcon: <FolderDatabase size={14} className="flex-shrink-0" />,

      });
    });
    return _files;
  }
  const [status, setStatus] = React.useState<"welcome" | "connecting" | "showDatabases" | "error">("welcome");
  //Listen for connection change, if connection change, get databases
  useEffect(() => {
    window.api.on("db:openConnectioning", (res: IResult) => {
      console.log("db:openConnectioning", res);
      if (res.status == 799) {
        //Starting...
        setStatus("connecting");
      }
      else if (res.status == 200) {
        setStatus("connected");
        //Success
        setConnection(res.data);

        window.api.invoke<IResult>("db:getDatabases", connection).then((res) => {
          if (res.status == 200) {
            setStatus("showDatabases");
            const _files = transformFiles(res.data.rows as IDataBase[]);
            setFiles(_files);
          } else {
            toast.error(t("status." + res.status));
            setStatus("error");
          }
        });
      } else {
        //Error
        toast.error(t("status." + res.status));
        setStatus("error");
      }
    });
    return () => {
      window.api.removeAllListeners("db:openConnectioning");
    };


  }, []);
  //Listen for db-actioning event, if event is triggered, open dialog or view
  useEffect(() => {

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
      }else if (params.command === "import-data") {
        openView({
          type: ViewType.ImportData,
          params: {
            database: params.params.database,
            table: params.params.table,
          },
          path: [params.params.database],
        });
      }else if (params.command === "export-data") {
        openView({
          type: ViewType.ExportData,
          params: {
            database: params.params.database,
            table: params.params.table,
          },
          path: [params.params.database],
        });
      }
    };
    window.api.on("explorer:db-actioning", explorer_db_actioning);
    return () => {
      window.api.removeAllListeners("explorer:db-actioning");

    };
  }, []);
  const { t } = useTranslation();
  //Global store setDatabase
  const setDatabase = useDbStore((state: any) => state.setDatabase);
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

      {status == "showDatabases" && <VirtualTree
        data={files}
        onLoad={(path: string[]) => {
          console.log("onLoad", path);
          //等待10秒
          if (path.length == 1) {
            //选择数据库
            window.api.send("db:selectDatabase", path[0]);
            setDatabase(path[0]);

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

                  if (getTablesResult.status == 200) {
                    const _files: IVirtualTreeItem[] = [];
                    const tables = getTablesResult.data.rows as IDataBaseTable[];
                    tables.forEach((table) => {
                      _files.push({
                        name: table.name,
                        isFolder: true,
                        description: table.comment,
                        expandIcon: <FolderContextOpen size={14} className="flex-shrink-0" />,
                        collapseIcon: <FolderContext size={14} className="flex-shrink-0" />,
                        // icon: <TableIcon size={14} className="flex-shrink-0" />,
                      });
                    });
                    console.log("_files", _files);
                    if (_files.length == 0) {
                      _files.push({
                        name: "No Tables",
                        isFolder: false,
                        noChildren: true,
                      });
                    }
                    return _files;
                  } else {
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
                    if (_files.length == 0) {
                      _files.push({
                        name: "No Views",
                        isFolder: false,
                        noChildren: true,
                      });
                    }
                    return _files;
                  } else {
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
                    if (_files.length == 0) {
                      _files.push({
                        name: "No Functions",
                        isFolder: false,
                        noChildren: true,
                      });
                    }
                    return _files;
                  } else {
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
                    if (_files.length == 0) {
                      _files.push({
                        name: "No Procedures",
                        isFolder: false,
                        noChildren: true,
                      });
                    }
                    return _files;
                  } else {
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
                    const columns = res.data.rows as IDataBaseTableColumn[];
                    columns.forEach((column) => {
                      _files.push({
                        name: column.name + "",
                        isFolder: false,
                        icon: (
                          <ColumnsIcon size={10} className="flex-shrink-0" />
                        ),
                        description: column.comment,
                      });
                    });
                    console.log("_files", _files);
                    if (_files.length == 0) {
                      _files.push({
                        name: "No Columns",
                        isFolder: false,
                        noChildren: true,
                      });
                    }
                    return _files;
                  } else {
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
                    name:"Import data from file",
                    command:"import-data",
                  },
                  {
                    name: "Export data to file",
                    command: "export-data",
                  },
                  {
                    type: "separator",
                  },
                  {
                    name: "Dump",
                    command: "dumpTable",
                  },{
                    name:"Execute sql",
                    command:"executeSql"
                  }
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
        status == "welcome" && <Webcome />
      }

      {
        status == "connecting" && <div className="flex h-full w-full flex-col items-center justify-center">
          <Loader size={32} className="text-primary animate-spin" />
          <div className="mt-5 text-sm">
            {t("view.db.connecting")}
          </div>
        </div>
      }
      {
        status == "error" && <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="text-red-500 text-sm">
            {t("view.db.error")}
          </div>
        </div>
      }



    </div>
  );
}
