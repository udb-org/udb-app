import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CopyIcon,
  FolderOpenIcon,
  MoreHorizontalIcon,
  RotateCwIcon,
} from "lucide-react";
import VirtualList from "@/components/virtual-scroll";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { openView } from "@/api/view";
import { ViewType } from "@/types/view";
import { ISqlResult } from "@/types/db";
import { Input } from "@/components/ui/input";
import SearchInput from "@/components/SearchInput";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function ExplorerHistory(props: { isVisible: boolean }) {
  const [history, setHistory] = React.useState<any[]>([]);
  const [showHistory, setShowHistory] = React.useState<any[]>([]);
  const [suggestions, setSuggestions] = React.useState<any[]>([
    {
      sql: "SELECT * FROM users",
      time: "2023-03-01 12:00:00",
    },
  ]);
  React.useEffect(() => {
    //获取历史记录
    const geted = (_history: any[]) => {
      setHistory(_history);
    };
    window.api.on("history:geted", geted);
    //监听数据库变化
    const getTablesing = (res: ISqlResult) => {
      window.api.send("history:get");
    };
    window.api.on("db:getTablesing", getTablesing);
    return () => {
      window.api.removeListener("history:geted", geted);
      window.api.removeListener("db:getTablesing", getTablesing);
    };
  }, []);
  const [searchText, setSearchText] = React.useState("");
  useEffect(() => {
    setShowHistory(
      history.filter((item) => {
        if (searchText) {
          return item.sql.includes(searchText);
        } else {
          return true;
        }
      }),
    );
  }, [history, searchText]);

  function getSql(sql: string) {
    if (sql && sql.length > 35) {
      return sql.substring(0, 35) + "...";
    } else {
      return sql;
    }
  }

  function getTime(time: string) {
    const date = new Date(time);
    const now = new Date();
    const timeDiff = now.getTime() - date.getTime();
    const oneMinute = 60 * 1000;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;
    const oneWeek = 7 * oneDay;

    if (timeDiff < oneMinute) {
      return "刚刚";
    } else if (timeDiff < oneHour) {
      const minutes = Math.floor(timeDiff / oneMinute);
      return `${minutes}分钟前`;
    } else if (timeDiff < oneDay) {
      if (date.getDate() === now.getDate()) {
        return "今天";
      } else {
        const hours = Math.floor(timeDiff / oneHour);
        return `${hours}小时前`;
      }
    } else if (timeDiff < oneWeek) {
      if (date.getDate() === now.getDate() - 1) {
        return "昨天";
      } else {
        const days = Math.floor(timeDiff / oneDay);
        return `${days}天前`;
      }
    } else {
      return "很久很久以前";
    }
  }

  function renderItem(item: any, index: number) {
    return (
      <div
        key={index}
        className="hover:bg-accent group mb-2 flex h-[38px] items-center gap-2 rounded"
      >
        <div></div>
        <div className="flex-1 overflow-hidden">
          <div className="overflow-hidden text-sm text-ellipsis whitespace-nowrap">
            {getSql(item.sql)}
          </div>
          <div className="flex h-[18px] gap-1">
            <div className="text-muted-foreground text-[10px]">
              {getTime(item.time)}
            </div>
            <div className="flex-1"></div>

            <Button
              variant={"outline"}
              size={"icon"}
              className="m-[0px] hidden h-[18px] w-[18px] p-[4px] group-hover:flex"
              onClick={() => {
                //打开sql
                openView({
                  type: ViewType.Sql,
                  name: item.sql,
                  path: [],
                  params: {
                    sql: item.sql,
                  },
                });
              }}
            >
              <FolderOpenIcon></FolderOpenIcon>
            </Button>
            <Button
              variant={"outline"}
              size={"icon"}
              className="m-[0px] hidden h-[18px] w-[18px] p-[4px] group-hover:flex"
              onClick={() => {
                //复制到剪切板
                navigator.clipboard.writeText(item.sql);
              }}
            >
              <CopyIcon></CopyIcon>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full flex-col"
      style={{
        display: props.isVisible ? "flex" : "none",
      }}
    >
      <div className="flex flex-shrink-0 items-center text-sm font-bold">
        <div className="text-sm font-bold">Suggestions</div>
        <div className="flex-1"></div>
      </div>
      <div className="pt-1">
        {suggestions.map((item, index) => renderItem(item, index))}
      </div>

      <div className="flex flex-shrink-0 items-center text-sm font-bold">
        <div className="text-sm font-bold">History</div>
        <div className="flex-1"></div>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="m-[0px] h-[28px] w-[28px]"
          onClick={() => {
            window.api.send("history:get");
          }}
        >
          <RotateCwIcon size={14}></RotateCwIcon>
        </Button>
      </div>
      <div className="h-[40px]">
        <SearchInput
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
      </div>
      <div className="h-1"></div>
      <VirtualList
        items={showHistory}
        estimateHeight={38}
        renderItem={renderItem}
      ></VirtualList>
    </div>
  );
}
