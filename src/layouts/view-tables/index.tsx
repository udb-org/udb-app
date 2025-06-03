import React, { useEffect } from "react";
import { getView, useTabStore } from "@/store/tab-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/tailwind";
import { PlayIcon, TrashIcon } from "lucide-react";
import { openMenu } from "@/api/menu";
export const ViewTablesActions = [
  {
    name: "Drop Tables",
    command: "dropTables",
    icon: TrashIcon,
  },
];
export default function ViewTables(props: { viewKey: string }) {
  const [view, setView] = React.useState<any>(null);
  const [database, setDatabase] = React.useState<string>("");
  useEffect(() => {
    //加载执行结果
    let _view = getView(props.viewKey);
    console.log("_view", _view);
    let _database = "";
    if (_view) {
      if (_view.params.database) {
        _database = _view.params.database;
      }
    }
    setDatabase(_database);
    setView(_view);
  }, [props.viewKey]);
  const [data, setData] = React.useState<any[]>([]);
  useEffect(() => {
    if (database.length > 0) {
      window.api.invoke("db:getTables", database).then((res: any) => {
        console.log("getTables", res);
        if (res.status === "success") {
          const _tables = res.data.data as any[];
          console.log("_tables", _tables);
          setData(_tables);
        }
      });
    }
  }, [database]);
  const [selected, setSelected] = React.useState<string[]>([]);
  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full w-full">
        <div className="pb-[100px]">
          {data.map((item, index) => {
            return (
              <div
                key={index}
                className={cn(
                  "m-2 inline-block w-[120px] rounded p-2 text-center align-top hover:bg-gray-100",
                  selected.includes(item.TABLE_NAME) && "bg-accent",
                )}
                onClick={(e) => {
                  //如果Shift键按下，则多选
                  if (e.shiftKey) {
                    if (selected.includes(item.TABLE_NAME)) {
                      const _selected = selected.filter(
                        (it) => it !== item.TABLE_NAME,
                      );
                      setSelected([..._selected]);
                    } else {
                      setSelected([...selected, item.TABLE_NAME]);
                    }
                  } else {
                    setSelected([item.TABLE_NAME]);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openMenu({
                    channel: "",
                    params: {},
                    items: [
                      {
                        name: "Drop Table",
                        command: "dropTable",
                      },
                    ],
                  });
                }}
              >
                <div className="m-auto h-10 w-10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      fill="#8bc34a"
                      d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V9h5.5zm4 7.5h-4v2h1l-2 1.67L10 13h1v-2H7v2h1l3 2.5L8 18H7v2h4v-2h-1l2-1.67L14 18h-1v2h4v-2h-1l-3-2.5 3-2.5h1z"
                    />
                  </svg>
                </div>
                <div
                  className="text-sm"
                  style={{
                    wordBreak: "break-all",
                  }}
                >
                  {item.TABLE_NAME}
                </div>
                <div
                  className="text-xs"
                  style={{
                    wordBreak: "break-all",
                  }}
                >
                  {item.TABLE_COMMENT}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
