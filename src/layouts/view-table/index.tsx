import { execSql, invokeSql } from "@/api/db";
import { openView } from "@/api/view";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getView, useTabStore } from "@/store/tab-store";
import { IDataBaseTableColumn } from "@/types/db";
import {
  ChevronDownIcon,
  CodeIcon,
  MoveVertical,
  MoveVerticalIcon,
  PlusIcon,
  SaveIcon,
  SquareCheck,
  SquareCheckIcon,
  SquareIcon,
  XCircleIcon,
} from "lucide-react";
import React, { useEffect, useMemo } from "react";

export const ViewTableActions = [
  {
    name: "Save",
    command: "save",
    icon: SaveIcon,
  },
  {
    name: "DDL",
    command: "ddl",
    icon: CodeIcon,
  },
];

export default function ViewTable(props: { viewKey: string }) {
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
    let _sql = "";
    if (_view) {
      if (_view.results) {
        _results = _view.results;
      }
      if (_view.params.sql) {
        _sql = _view.params.sql;
      }
    }

    setResults(_results);
    setView(_view);
  }, [props.viewKey]);

  const [tableName, setTableName] = React.useState<string>("");
  const [tableComment, setTableComment] = React.useState<string>("");

  useEffect(() => {
    if (view) {
      setTableName(view.params.table);
      //查询表信息
      invokeSql(
        `select * from INFORMATION_SCHEMA.TABLES where  TABLE_NAME='${view.params.table}'`,
      ).then((res: any) => {
        console.log("查询表信息", res);
        if (res.status === "success") {
          setTableComment(res.data.data[0].TABLE_COMMENT);
        }
      });

      //查询列信息
      invokeSql(
        `select * from INFORMATION_SCHEMA.COLUMNS where  TABLE_NAME='${view.params.table}'`,
      ).then((res: any) => {
        console.log("查询列信息", res);
        if (res.status === "success") {
          setColumns(res.data.data);
        }
      });
    }
  }, [view]);
  useEffect(() => {
    const mergeTableing = (context: string) => {
      console.log("mergeTableing", context);
      //使用空格替代换行
      context = context.replaceAll("\n", " ");
      const sqls = context.split(";");
      sqls.forEach((sql) => {
        //判断sql是建表语句，还是修改表名或列或设置主键等
        if (sql.trim().toUpperCase().startsWith("CREATE TABLE")) {
          //提取表名
          const tableName = sql.split("CREATE TABLE")[1].split("(")[0].trim();
          setTableName(tableName);
          //提取列
          const _cols = parseDDLToColumns(sql);
          setColumns(_cols);
          //提取表注释
          const _comment = sql.split("COMMENT")[1].split("'")[1].trim();
          setTableComment(_comment);
        } else if (sql.trim().toUpperCase().startsWith("ALTER TABLE")) {
          if (sql.toUpperCase().includes("RENAME TO")) {
            //重命名表
            const tableName = sql.split("RENAME TO")[1].trim();
            setTableName(tableName);
          } else if (
            sql.toUpperCase().includes("ADD COLUMN") ||
            sql.toUpperCase().includes("MODIFY COLUMN") ||
            sql.toUpperCase().includes("DROP COLUMN")
          ) {
            //添加列或修改列
            // Parse the SQL for adding a column and generate a column object
            const addColumnMatch = sql.match(
              /ADD COLUMN\s+`?(\w+)`?\s+([a-z]+)(?:\((\d+)(?:,\s*(\d+))?\))?(?:\s+(unsigned))?(?:\s+(NOT NULL|NULL))?(?:\s+DEFAULT\s+(?:((?:'((?:\\'|[^'])*)')|[\dA-Za-z_]+)|(NULL)))?(?:\s+COMMENT\s+'((?:\\'|[^'])*)')?/i,
            );
            if (addColumnMatch) {
              const [
                _,
                name,
                type,
                length,
                scale,
                unsigned,
                nullable,
                defaultVal,
                defaultStr,
                defaultNull,
                comment,
              ] = addColumnMatch;
              const newColumn: IDataBaseTableColumn = {
                COLUMN_NAME: name,
                COLUMN_TYPE: type.toUpperCase() + (unsigned ? " UNSIGNED" : ""),
                CHARACTER_MAXIMUM_LENGTH: length ? parseInt(length) : null,
                NUMERIC_SCALE: scale ? parseInt(scale) : null,
                IS_NULLABLE:
                  (nullable ? nullable.toUpperCase() === "NULL" : !nullable) +
                  "",
                COLUMN_DEFAULT: defaultNull ? null : defaultStr || defaultVal,
                COLUMN_COMMENT: (comment || "").replace(/\\'/g, "'"),
                PRIVILEGES: "",
                EXTRA: "",
              };
              setColumns([...columns, newColumn]);
            }

            // Parse the SQL for modifying a column
            const modifyColumnMatch = sql.match(
              /MODIFY COLUMN\s+`?(\w+)`?\s+([a-z]+)(?:\((\d+)(?:,\s*(\d+))?\))?(?:\s+(unsigned))?(?:\s+(NOT NULL|NULL))?(?:\s+DEFAULT\s+(?:((?:'((?:\\'|[^'])*)')|[\dA-Za-z_]+)|(NULL)))?(?:\s+COMMENT\s+'((?:\\'|[^'])*)')?/i,
            );
            if (modifyColumnMatch) {
              const [
                _,
                name,
                type,
                length,
                scale,
                unsigned,
                nullable,
                defaultVal,
                defaultStr,
                defaultNull,
                comment,
              ] = modifyColumnMatch;
              const newColumns = columns.map((col) => {
                if (col.COLUMN_NAME === name) {
                  return {
                    ...col,
                    COLUMN_TYPE:
                      type.toUpperCase() + (unsigned ? " UNSIGNED" : ""),
                    CHARACTER_MAXIMUM_LENGTH: length ? parseInt(length) : null,
                    NUMERIC_SCALE: scale ? parseInt(scale) : null,
                    IS_NULLABLE:
                      (nullable
                        ? nullable.toUpperCase() === "NULL"
                        : !nullable) + "",
                    COLUMN_DEFAULT: defaultNull
                      ? null
                      : defaultStr || defaultVal,
                    COLUMN_COMMENT: (comment || "").replace(/\\'/g, "'"),
                  };
                }
                return col;
              });
              setColumns(newColumns);
            }

            // Parse the SQL for dropping a column
            const dropColumnMatch = sql.match(/DROP COLUMN\s+`?(\w+)`?/i);
            if (dropColumnMatch) {
              const [_, name] = dropColumnMatch;
              const newColumns = columns.filter(
                (col) => col.COLUMN_NAME !== name,
              );
              setColumns(newColumns);
            }
          } else if (
            sql.toUpperCase().includes("ADD PRIMARY KEY") ||
            sql.toUpperCase().includes("DROP PRIMARY KEY")
          ) {
            //添加主键或删除主键
          }
          //ALTER TABLE ele_month_bus COMMENT '新的备注信息';
          else if (
            sql.trim().toUpperCase().startsWith("ALTER TABLE") &&
            sql.toUpperCase().includes("COMMENT")
          ) {
            // Update table comment
            const commentMatch = sql.match(
              /ALTER TABLE\s+`?(\w+)`?\s+COMMENT\s+'((?:\\'|[^'])*)'/i,
            );
            if (commentMatch) {
              const [_, tableNameMatch, newComment] = commentMatch;
              setTableComment(newComment.replace(/\\'/g, "'"));
            }
          }
        } else if (sql.trim().toUpperCase().startsWith("RENAME TABLE")) {
          //重命名表
          const tableName = sql.split("RENAME TABLE")[1].split("TO")[1].trim();
          setTableName(tableName);
        }
      });
    };
    window.api.on("ai:mergeTableing", mergeTableing);

    return () => {
      window.api.removeListener("ai:mergeTableing", mergeTableing);
    };
  }, [columns]);
  useEffect(() => {
    const view_table_actioning = (params: any) => {
      console.log("view_table_actioning", params);
      if (params.command === "ddl") {
        setDdl(parseColumnsToDDL(columns));
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

    return () => {
      window.api.removeListener("view:table-actioning", view_table_actioning);
    };
  }, []);

  const [ddl, setDdl] = React.useState<string>(""
    // "CREATE TABLE `ele_month` (" +
    //   "  `id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'ID'," +
    //   "  `month` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '月份，yyyy-MM'," +
    //   "  `company` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '供电单位'," +
    //   "  `ele_catalog` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '用电类别'," +
    //   "  `ele_value` double DEFAULT NULL COMMENT '用电量'," +
    //   "  `org` varchar(20) COLLATE utf8mb4_general_ci NOT NULL COMMENT '所属地市'," +
    //   "  PRIMARY KEY (`id`)" +
    //   ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci",
  );

  useEffect(() => {
    const columns = parseDDLToColumns(ddl);
    setColumns(columns);
  }, []);
  //解析DDL转换为列表结构
  function parseDDLToColumns(ddl: string) {
    // 提取CREATE TABLE括号内的内容
    const columnsMatch = ddl.match(/CREATE TABLE\s+`?\w+`?\s*\((.*)\)/s);
    if (!columnsMatch) return [];

    const columnsPart = columnsMatch[1];

    // 分割每个列定义，处理可能的逗号在括号内的情况（如外键）
    const columnDefs = columnsPart.split(/,\s*(?![^(]*\))/g);

    const columns: IDataBaseTableColumn[] = [];
    for (const def of columnDefs) {
      // 跳过约束定义（如PRIMARY KEY）
      if (/^(PRIMARY|KEY|CONSTRAINT|FOREIGN)/i.test(def.trim())) continue;

      // 匹配列定义
      const colMatch = def
        .trim()
        .match(
          /^`?(\w+)`?\s+([a-z]+)(?:$(\d+)(?:,\s*(\d+))?$)?(?:\s+(unsigned))?(?:\s+(NOT NULL|NULL))?(?:\s+DEFAULT\s+(?:((?:'((?:\\'|[^'])*)')|[\dA-Za-z_]+)|(NULL)))?(?:\s+COMMENT\s+'((?:\\'|[^'])*)')?/i,
        );
      if (!colMatch) continue;

      const [
        _,
        name,
        type,
        length,
        scale,
        unsigned,
        nullable,
        defaultVal,
        defaultStr,
        defaultNull,
        comment,
      ] = colMatch;

      columns.push({
        COLUMN_NAME: name,
        COLUMN_TYPE: type.toUpperCase() + (unsigned ? " UNSIGNED" : ""),
        CHARACTER_MAXIMUM_LENGTH: length ? parseInt(length) : null,
        NUMERIC_SCALE: scale ? parseInt(scale) : null,
        IS_NULLABLE:
          (nullable ? nullable.toUpperCase() === "NULL" : !nullable) + "", // 如果明确NOT NULL则为false，否则可能为true
        COLUMN_DEFAULT: defaultNull ? null : defaultStr || defaultVal,
        COLUMN_COMMENT: (comment || "").replace(/\\'/g, "'"),
      });
    }
    console.log(columns);
    return columns;
  }

  function parseColumnsToDDL(columns: IDataBaseTableColumn[]) {
    let ddl = "CREATE TABLE `table_name` (";
    const primaryKeys: string[] = [];

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      ddl += `\n  \`${column.COLUMN_NAME}\` ${column.COLUMN_TYPE}`;

      if (column.CHARACTER_MAXIMUM_LENGTH !== null) {
        ddl += `(${column.CHARACTER_MAXIMUM_LENGTH}`;
        if (column.NUMERIC_SCALE !== null) {
          ddl += `, ${column.NUMERIC_SCALE}`;
        }
        ddl += `)`;
      }

      if (column.IS_NULLABLE === "NO") {
        ddl += ` NOT NULL`;
      }

      if (column.COLUMN_DEFAULT !== null) {
        if (typeof column.COLUMN_DEFAULT === "string") {
          ddl += ` DEFAULT '${column.COLUMN_DEFAULT.replace(/'/g, "\\'")}'`;
        } else {
          ddl += ` DEFAULT ${column.COLUMN_DEFAULT}`;
        }
      }

      if (column.COLUMN_COMMENT) {
        ddl += ` COMMENT '${column.COLUMN_COMMENT.replace(/'/g, "\\'")}'`;
      }

      if (i < columns.length - 1) {
        ddl += ",";
      }

      if (column.PRIVILEGES === "pk") {
        primaryKeys.push(column.COLUMN_NAME);
      }
    }

    if (primaryKeys.length > 0) {
      ddl += `,\n  PRIMARY KEY (\`${primaryKeys.join("`, `")}\`)`;
    }

    ddl +=
      "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    return ddl;
  }

  const mysqlDataTypes = [
    "BOOLEAN",
    "VARCHAR()",
    "INT",
    "BIGINT",
    "FLOAT",
    "DOUBLE",
    "DECIMAL",
    "DATE",
    "TIME",
    "DATETIME",
    "TIMESTAMP",
    "TEXT",
    "BLOB",
    "ENUM",
    "SET",
  ];
  return (
    <div className="flex h-full w-full flex-col">
      <div className="p-2">
        <div className="text-sm font-bold">Base Infomation</div>
        <Separator></Separator>
        <div className="space-y-2 p-2">
          <div className="flex items-center gap-2">
            <div className="w-[100px]">TableName:</div>
            <Input className="" value={tableName} />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[100px]">Comment:</div>

            <Input className="" value={tableComment} />
          </div>
        </div>
      </div>
      <div className="p-2">
        <div className="text-sm font-bold">Columns</div>
        <Separator></Separator>
        <div className="space-y-2 p-2 text-center">
          <div className="flex items-center gap-1">
            <Button
              variant={"ghost"}
              size={"icon"}
              className="h-[24px]"
            ></Button>
            <div className="flex-1">Name</div>
            <div className="w-[140px]">Type</div>
            <div className="w-[40px] text-center">Nullable</div>
            <div className="flex-1">Default</div>
            <div className="flex-1">Comment</div>
            <div className="">Primary Key</div>
            <Button variant={"ghost"} size={"icon"}></Button>
          </div>
          <div>
            {columns.map((item, index) => (
              <div
                key={index}
                className="bg-background mb-1 flex items-center gap-1 rounded text-sm"
              >
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="hover:bg-primary h-[26px] w-[26px] cursor-row-resize"
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
                    };
                    document.addEventListener("mousemove", onMouseMove);
                    document.addEventListener("mouseup", onMouseUp);
                  }}
                >
                  <MoveVerticalIcon size={12} />
                </Button>
                <div className="flex-1">
                  <Input
                    value={item.COLUMN_NAME}
                    onChange={(e) => {
                      const newColumns = [...columns];
                      newColumns[index].COLUMN_NAME = e.target.value;
                      setColumns(newColumns);
                    }}
                    className="h-[24px] w-full border-0 shadow-none outline-0 md:text-sm"
                  />
                </div>
                <div className="flex w-[140px] items-center gap-1">
                  <Input
                    value={item.COLUMN_TYPE}
                    onChange={(e) => {
                      const newColumns = [...columns];
                      newColumns[index].COLUMN_TYPE = e.target.value;
                      setColumns(newColumns);
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
                        {mysqlDataTypes.map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => {
                              const newColumns = [...columns];
                              newColumns[index].COLUMN_TYPE = type;
                              setColumns(newColumns);
                            }}
                          >
                            {type}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex w-[40px] items-center justify-center text-center">
                  <Checkbox
                    checked={item.IS_NULLABLE === "YES"}
                    onCheckedChange={(status) => {
                      const newColumns = [...columns];
                      newColumns[index].IS_NULLABLE = status ? "YES" : "NO";
                      setColumns(newColumns);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={item.COLUMN_DEFAULT + ""}
                    onChange={(e) => {
                      const newColumns = [...columns];
                      newColumns[index].COLUMN_DEFAULT = e.target.value;
                      setColumns(newColumns);
                    }}
                    className="h-[24px] w-full border-0 shadow-none outline-0 md:text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    className="h-[24px] w-full border-0 shadow-none outline-0 md:text-sm"
                    value={item.COLUMN_COMMENT}
                    onChange={(e) => {
                      const newColumns = [...columns];
                      newColumns[index].COLUMN_COMMENT = e.target.value;
                      setColumns(newColumns);
                    }}
                  />
                </div>
                <div className="flex w-[40px] items-center justify-center text-center">
                  <Checkbox
                    checked={item.PRIVILEGES === "pk"}
                    onCheckedChange={(status) => {
                      const newColumns = [...columns];
                      newColumns[index].PRIVILEGES = status ? "pk" : "";
                      setColumns(newColumns);
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
                  COLUMN_NAME: "",
                  COLUMN_TYPE: "INT",
                  COLUMN_COMMENT: "",
                  PRIVILEGES: "pk",
                  IS_NULLABLE: "YES",
                  COLUMN_DEFAULT: null,
                  EXTRA: "",
                });
                setColumns(newColumns);
              }}
            >
              <PlusIcon size={14} />
              Add Column
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
