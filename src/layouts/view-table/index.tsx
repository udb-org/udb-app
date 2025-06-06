import { openView, showActions } from "@/api/view";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getDataBaseEX } from "@/extension/db";
import { useDbStore } from "@/store/db-store";
import { getView, saveViewValue } from "@/store/tab-store";
import { ConnectionConfig, DataBaseTableConstraintEnum, IDataBaseEX, IDataBaseTable, IDataBaseTableColumn, IDataBaseTableConstraint, IDataBaseTableIndex, IResult } from "@/types/db";
import { ActionParam } from "@/types/view";
import {
  ChevronDownIcon,
  LoaderIcon,
  PlusIcon,
  XCircleIcon
} from "lucide-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { format as sqlFormatter } from "sql-formatter";
export default function ViewTable(props: { viewKey: string }) {
  const [databaseEx, setDatabaseEx] = React.useState<IDataBaseEX | null>(null);
  const connection: ConnectionConfig = useDbStore((state: any) => state.connection);
  const { t } = useTranslation();
  const [view, setView] = React.useState<any>(null);
  const [results, setResults] = React.useState<any[]>([]);
  const [columns, setColumns] = React.useState<IDataBaseTableColumn[]>([
    // {
    //   COLUMN_NAME: "id",
    //   COLUMN_TYPE: "INT",
    //   COLUMN_COMMENT: "",
    //   PRIVILEGES: "pk",
    //   IS_NULLABLE: "YES",
    //   COLUMN_DEFAULT: null,
    //   EXTRA: "",
    // },
  ]);
  useEffect(() => {
    //加载执行结果
    let _view = getView(props.viewKey);
    let _results = [];
    
    let _ddl = "";
    if (_view) {
      if (_view.results) {
        _results = _view.results;
      }
   
      if (_view.ddl) {
        _ddl = _view.ddl;
      }
    }
    setResults(_results);
    setView(_view);
    setDdl(_ddl);
  }, [props.viewKey]);
  const [tableName, setTableName] = React.useState<string>("");
  const [tableComment, setTableComment] = React.useState<string>("");
  const [constraints, setConstraints] = React.useState<IDataBaseTableConstraint[]>([]);
  const [indexs, setIndexs] = React.useState<IDataBaseTableIndex[]>([]);
  const [chatset, setChatset] = React.useState<string>("");
  useEffect(() => {
    if (view&&(view.ddl==undefined||view.ddl=="")) {
      setTableName(view.params.table);
      window.api.invoke("db:getTableInfo", view.params.table).then((res: IResult) => {
        console.log("查询表信息", res);
        if (res.status === 200) {
          const tb: IDataBaseTable = res.data;
          setTableComment(tb.comment + "");
          //查询列信息
          window.api.invoke("db:getColumns", view.params.table).then((resCol: IResult) => {
            console.log("查询列信息", resCol);
            if (resCol.status === 200) {
              setColumns(resCol.data.rows);
              window.api.invoke("db:getConstraints", view.params.table).then((resC: IResult) => {
                console.log("查询约束信息", resC);
                if (resC.status === 200) {
                  const constraints: IDataBaseTableConstraint[] = resC.data.rows;
                  setConstraints(constraints)
                  willToDDl({
                    name: view.params.table,
                    columns: resCol.data.rows,
                    constraints: resC.data.rows,  
                    indexes: [],
                    comment: tb.comment,
                  });
                }
              });
            }
          });
        }
      });
 
      // invokeSql(
      //   `select * from INFORMATION_SCHEMA.COLUMNS where  TABLE_NAME='${view.params.table}'`,
      // ).then((res: any) => {
      //   console.log("查询列信息", res);
      //   if (res.status === "success") {
      //     setColumns(res.data.data);
      //   }
      // });
    }else if(view&&view.ddl&&view.ddl.length>0){
      parseDDLToColumns(view.ddl);
    }
  }, [view]);
  const [isMark, setIsMark] = React.useState<boolean>(false);
  useEffect(() => {
    let mergeContext: string | null = null;
    const mergeTabling = (params: {
      content: string,
      status: number

    }) => {
      console.log("aiMergeSqling", params);

      if (params.status == 799) {
       mergeContext="";
        //Mark 
        setIsMark(true);


      } else if (params.status == 200) {
        if (params.content.length > 0) {
         
          mergeContext+=params.content;
        }
        setDdl(sqlFormatter(mergeContext+""));
        parseDDLToColumns(mergeContext+"");
        mergeContext=null;
        //Mark
        setIsMark(false);

      } else if (params.status == 800) {
        mergeContext+=params.content;
        
      } else {
        toast.error(t("status." + params.status));
        setIsMark(false);
      }

    };
    window.api.on("ai:mergeTabling", mergeTabling);
    return () => {
      window.api.removeAllListeners("ai:mergeTabling");
    };
  }, [props.viewKey, databaseEx]);
  useEffect(() => {
    const view_table_actioning = (params: ActionParam) => {
      console.log("view_table_actioning", params);
      if (params.command === "ddl") {
        setDdl(parseColumnsToDDL()+"");
        openView({
          name: "ddl",
          type: "sql",
          params: {
            sql: ddl,
          },
          path: [],
        });
      }
    };
    window.api.on("view:table-actioning", view_table_actioning);

    showActions(
      "view:table-actioning",
      [
      {
        name: t("view.action.save"),
        command: "save",
        icon: "save",
      }
    ]);

    return () => {
      window.api.removeListener("view:table-actioning", view_table_actioning);
    };
  }, []);
  const [ddl, setDdl] = React.useState<string>("");
  useEffect(() => {
    // const columns = parseDDLToColumns(ddl);
    // setColumns(columns);
  }, []);
  //解析DDL转换为列表结构
  function parseDDLToColumns(ddl: string) {
    console.log("parseDDLToColumns",ddl);
    if (databaseEx) {
     try{
      const tb=databaseEx.ddlToObj(ddl);
      console.log("parseDDLToColumns",tb);
      if(tb){
        setColumns(tb.columns||[]);
        setIndexs(tb.indexes||[]);
        setConstraints(tb.constraints||[]);
        setTableComment(tb.comment||"");
        setTableName(tb.name||"");

      }else{
        setColumns([]);
        setIndexs([]);
        setConstraints([]);
        setTableComment("");
        setTableName("");
      }
     }catch(e){
      toast.error(t("status."+500));
     }
    }else{
      console.log("parseDDLToColumns","databaseEx is null");
    }
  }
  function parseColumnsToDDL(tb?:IDataBaseTable) {
    if (databaseEx) {
      const table=tb?tb:{
        name: tableName,
        columns: columns,
        constraints: constraints,
        comment: tableComment,
        indexes: indexs,
      }
      return databaseEx.objToDdl(table);
    }
  }
  
  useEffect(() => {
    if (connection) {
      const dbEx = getDataBaseEX(connection.type);
      if (dbEx) {
        setDatabaseEx(dbEx);
      }
    }
  }, []);

  function willToDDl(td?:IDataBaseTable) {
    setTimeout(() => {
      const ddl = parseColumnsToDDL(td);
      if (ddl != undefined) {
        setDdl(ddl);
        saveViewValue(props.viewKey,"ddl", ddl);
      } else {
        setDdl("");
        saveViewValue(props.viewKey,"ddl", "");
      }
    }, 500);
  }

  return (
    <div className="flex h-full w-full flex-col relative">
      <div className="p-2">
        <div className="text-sm font-bold">{t("view.table.base.title")}</div>
        <Separator></Separator>
        <table className="text-sm">
          <tbody>
          <tr>
            <td className="h-2"></td>
          </tr>
          <tr >
            <td>
              <div className="pr-1">{t("view.table.base.tableName")}:</div>
            </td>
            <td>
              <Input className="" value={tableName} />
            </td>
            <td className="w-5"></td>
            <td>
              <div className="pr-1">Charset:</div>
            </td>
            <td>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"

                  >
                    {chatset}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    {/* List of MySQL data types */}
                    {databaseEx && databaseEx.getChatsets().map((cs) => (
                      <DropdownMenuItem
                        key={cs}
                        onClick={() => {
                          setChatset(cs);

                        }}
                      >
                        {cs}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
          <tr>
            <td className="h-2"></td>
          </tr>
          <tr>
            <td>
              <div className="pr-1">{t("view.table.base.tableComment")}:</div>
            </td>
            <td colSpan={4}>
              <Input className="" value={tableComment} />
            </td>
          </tr>
          </tbody>
        </table>

      </div>
      <Separator className="mb-2" />
      <Tabs defaultValue="columns">
        <TabsList className="bg-card border p-0">
          <TabsTrigger value="columns">{t("view.table.column.title")}</TabsTrigger>
          <TabsTrigger value="constraints">{t("view.table.constraint.title")}</TabsTrigger>
          <TabsTrigger value="index">{t("view.table.index.title")}</TabsTrigger>
          <TabsTrigger value="ddl"
          >{t("view.table.ddl.title")}</TabsTrigger>
        </TabsList>
        <TabsContent value="columns">
          <div className="space-y-2 p-2 text-center text-sm whitespace-nowrap">
            <div className="flex  items-center gap-1">
              <Button
                variant={"ghost"}
                size={"icon"}
                className="h-[24px]"
              ></Button>
              <div className="flex-1">{t("view.table.column.columnName")}</div>
              <div className="w-[140px]">{t("view.table.column.columnType")}</div>
              <div className="w-[70px] text-center">{t("view.table.column.isNullable")}</div>
              <div className="flex-1">{t("view.table.column.defaultValue")}</div>
              <div className="flex-1">{t("view.table.column.columnComment")}</div>
              <div className="">{t("view.table.column.primaryKey")}</div>
              <Button variant={"ghost"} size={"icon"}></Button>
            </div>
            <div>
              {columns.map((item, index) => (
                <div
                  key={index}
                  className="bg-background mb-1 flex items-center gap-1 rounded text-sm select-none"
                >
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="hover:bg-primary h-[26px] w-[26px] cursor-row-resize text-xs"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      //拖拽调整顺序
                      const startIndex = index;
                      let draggedElement: HTMLElement | null = null;
                      // Store the dragged element
                      draggedElement = e.currentTarget
                        .parentElement as HTMLElement;
                      // Add a class to the dragged element for visual feedback
                      draggedElement.classList.add("dragging");
                      const onMouseMove = (moveEvent: MouseEvent) => {
                        if (!draggedElement) return;
                        const { clientY } = moveEvent;
                        const allItems = Array.from(
                          draggedElement.parentElement?.children || [],
                        );
                        const targetItem = allItems.find((item) => {
                          const rect = item.getBoundingClientRect();
                          return clientY > rect.top && clientY < rect.bottom;
                        });
                        if (targetItem && targetItem !== draggedElement) {
                          const targetIndex = allItems.indexOf(targetItem);
                          const newColumns = [...columns];
                          const [removed] = newColumns.splice(startIndex, 1);
                          newColumns.splice(targetIndex, 0, removed);
                          setColumns(newColumns);
                        }
                      };
                      const onMouseUp = () => {
                        if (draggedElement) {
                          draggedElement.classList.remove("dragging");
                        }
                        document.removeEventListener("mousemove", onMouseMove);
                        document.removeEventListener("mouseup", onMouseUp);
                        willToDDl();
                      };
                      document.addEventListener("mousemove", onMouseMove);
                      document.addEventListener("mouseup", onMouseUp);
                    }}
                  >
                    {index + 1}
                  </Button>
                  <div className="flex-1">
                    <Input
                      value={item.name}
                      onChange={(e) => {
                        const newColumns = [...columns];
                        newColumns[index].name = e.target.value;
                        setColumns(newColumns);
                        willToDDl();
                      }}
                      className="h-[24px] w-full border-0 shadow-none outline-0 md:text-sm"
                    />
                  </div>
                  <div className="flex w-[140px] items-center gap-1">
                    <Input
                      value={item.displayType ? item.displayType : item.type}
                      onChange={(e) => {
                        const newColumns = [...columns];
                        const val = e.target.value;
                        if (val.indexOf("(") > 0) {
                          newColumns[index].displayType = val;
                          const temp = val.split("(")[1].split(")")[0];
                          if (temp.indexOf(",") > 0) {
                            const len = parseInt(temp.split(",")[0]);
                            const scale = parseInt(temp.split(",")[1]);
                            newColumns[index].length = len;
                            newColumns[index].scale = scale;
                          } else {
                            const len = parseInt(temp);
                            newColumns[index].length = len;
                          }
                          newColumns[index].type = val.split("(")[0];
                        } else {
                          newColumns[index].displayType = undefined;
                          newColumns[index].type = val;
                        }
                        setColumns(newColumns);
                        willToDDl();
                      }}
                      className="h-[24px] w-full border-0 shadow-none outline-0 md:text-sm"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-[20px] w-[20px] p-1"
                        >
                          <ChevronDownIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuGroup>
                          {/* List of MySQL data types */}
                          {databaseEx && databaseEx.getSupportFieldTypes().map((ft) => (
                            <DropdownMenuItem
                              key={ft.name}
                              onClick={() => {
                                const newColumns = [...columns];
                                if (ft.name.indexOf("(") > 0) {
                                  newColumns[index].displayType = ft.name;
                                  const temp = ft.name.split("(")[1].split(")")[0];
                                  if (temp.indexOf(",") > 0) {
                                    const len = parseInt(temp.split(",")[0]);
                                    const scale = parseInt(temp.split(",")[1]);
                                    newColumns[index].length = len;
                                    newColumns[index].scale = scale;
                                  } else {
                                    const len = parseInt(temp);
                                    newColumns[index].length = len;
                                  }
                                  newColumns[index].type = ft.name.split("(")[0];
                                } else {
                                  newColumns[index].displayType = undefined;
                                  newColumns[index].type = ft.name;
                                }
                                setColumns(newColumns);
                                willToDDl();
                              }}
                            >
                              {ft.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex w-[70px] items-center justify-center text-center">
                    <Checkbox
                      checked={item.isNullable}
                      onCheckedChange={(status) => {
                        const newColumns = [...columns];
                        newColumns[index].isNullable = status ? true : false;
                        setColumns(newColumns);
                        willToDDl();
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={item.defaultValue ? item.defaultValue.toString() : ""}
                      onChange={(e) => {
                        const newColumns = [...columns];
                        newColumns[index].comment = e.target.value;
                        setColumns(newColumns);
                        willToDDl();
                      }}
                      className="h-[24px] w-full border-0 shadow-none outline-0 md:text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      className="h-[24px] w-full border-0 shadow-none outline-0 md:text-sm"
                      value={item.comment ? item.comment : ""}
                      onChange={(e) => {
                        const newColumns = [...columns];
                        newColumns[index].comment = e.target.value;
                        setColumns(newColumns);
                        willToDDl();
                      }}
                    />
                  </div>
                  <div className="flex w-[40px] items-center justify-center text-center">
                    <Checkbox
                      checked={constraints.find((con) => con.column === item.name)?.type === DataBaseTableConstraintEnum.PRIMARY}
                      onCheckedChange={(status) => {
                        // const newColumns = [...columns];
                        // newColumns[index].keyType = status ? KeyType.PRIMARY : KeyType.NONE;
                        // setColumns(newColumns);
                        if (status) {
                          setConstraints([...constraints, {
                            column: item.name,
                            type: DataBaseTableConstraintEnum.PRIMARY
                          }]);
                        } else {
                          const constraint = constraints.find((con) => con.column === item.name);
                          if (constraint) {
                            const newConstraints = [...constraints];
                            newConstraints.splice(constraints.indexOf(constraint), 1);
                            setConstraints(newConstraints);
                          }
                        }
                        willToDDl();
                      }}
                    />
                  </div>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="hover:bg-destructive h-[24px] w-[24px]"
                    onClick={() => {
                      const newColumns = [...columns];
                      newColumns.splice(index, 1);
                      setColumns(newColumns);
                      willToDDl();
                    }}
                  >
                    <XCircleIcon size={14} />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded">
              <Button
                variant={"ghost"}
                className="text-muted-foreground h-[24px] w-full text-sm"
                onClick={() => {
                  const newColumns = [...columns];
                  newColumns.push({
                    name: "",
                    type: "",
                    isNullable: true,
                  });
                  setColumns(newColumns);
                }}
              >
                <PlusIcon size={14} />
                {t("view.table.button.addColumn")}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="ddl">
          <Textarea value={ddl} onChange={(e) => {
            setDdl(e.target.value);
          }} />
        </TabsContent>
      </Tabs>

      {
            isMark && <div className="left-0 top-0 bottom-0 right-0 absolute z-20 bg-background/20 flex items-center justify-center">
              <LoaderIcon className=" animate-spin" />
            </div>
          }
    </div>
  );
}
