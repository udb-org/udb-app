import { Button } from "@/components/ui/button";
import { VirtualData } from "@/components/virtual-data";
import { useAiStore } from "@/store/ai-store";
import { getView, useTabStore } from "@/store/tab-store";
import { cn } from "@/utils/tailwind";
import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
export function SqlResults(props: { data: any[] }) {
  const {t}=useTranslation();
  const { model } = useAiStore();
  const results = props.data;
  // const tab = useTabStore((state: any) => state.tab);
  // const [results, setResults] = React.useState<any[]>([]);
  // useEffect(() => {
  //     if(tab.name.length>0){
  //         const view =getView(tab.name);
  //         if(view){
  //             if(view.results){
  //                 setResults(view.results);
  //             }else{
  //                 setResults([]);
  //             }
  //         }
  //     }
  // },[tab]);
  // const results: any = useMemo(() => {
  //     const view =getView(tab.name);
  //     if(view==null){
  //         return null;
  //     }
  //     const _rs=view.results;
  //     // console.log("results", _rs);
  //     return _rs;
  // }, [tab])
  const [actice, setActive] = React.useState(0);
  const [data, setData] = React.useState<any>({});
  const [sql, setSql] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");
  useEffect(() => {
    if (results == null || results.length === 0) {
      setData({});
      setStatus("");
      setMessage("");
      return;
    }
    const tab = results[actice];
    if (tab && tab.status === "success") {
      setData({
        columns: tab.columns,
        rows: tab.rows,
      });
      setStatus(tab.status);
      setMessage(tab.message);
    } else if (tab && tab && tab.status === "fail") {
      setData({});
      setStatus(tab.status);
      setMessage(tab.message);
    } else {
      setData({});
      setStatus("fail");
      setMessage("未知错误");
    }
    if (tab) {
      setSql(tab.sql);
    } else {
      setSql("");
    }
  }, [results, actice]);
  const [visiableData, setVisiableData] = React.useState<boolean>(false);
  const [height, setHeight] = React.useState<number>(0);
  const panelRef = React.useRef<HTMLDivElement>(null);
  //监听panelRef的高度变化
  useEffect(() => {
    if (panelRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry.contentRect.height > 0) {
          setHeight(entry.contentRect.height);
          setVisiableData(true);
        }
      });
      resizeObserver.observe(panelRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);
  function fixAction() {
    if (sql.length > 0) {
      console.log("fixAction", sql);
      window.api.send("ai:fixSql", {
        input:t("ai.prompt.fixsql"),
        model: model,
        context: sql + "\n" + t("ai.prompt.error.context") + "\n" + message
      });
    }
  }
  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-1 overflow-hidden" ref={panelRef}>
        <div className="absolute w-full">
          {status === "success" && visiableData && (
            <VirtualData height={height} source={data} />
          )}
          {status === "fail" && (
            <div className="p-2">
              <div className="p-2">{message}</div>
              <div>
                <Button variant={"outline"} className="border-primary/50" onClick={fixAction}>
                  {t("editor.button.fixsql")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex h-[26px] items-center">
        {
          //tabs
        }
        {results != null &&
          results.map((result: any, i: number) => (
            <div
              key={i}
              className={cn(
                "hover:bg-accent flex h-[24px] items-center rounded px-2 text-sm",
                actice === i && "bg-accent",
              )}
              onClick={() => {
                setActive(i);
              }}
            >
              Result {result.index + 1}
            </div>
          ))}
      </div>
    </div>
  );
}
