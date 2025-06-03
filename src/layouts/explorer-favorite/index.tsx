import { openMenu } from "@/api/menu";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import VirtualList from "@/components/virtual-scroll";
import { IDataBase, IDataBaseTable, ISqlResult } from "@/types/db";
import { ChevronDownIcon, ChevronRightIcon, DatabaseIcon, DotIcon, MoreHorizontalIcon, TableIcon } from "lucide-react";
import React, { useEffect } from "react";
import { openDialog } from "../dialog";
import { DialogType } from "@/types/dialog";
import { openView } from "@/api/view";
import { ViewType } from "@/types/view";
export function ExplorerFavorite(props:{
  isVisible:boolean;
}) {
  return <div className="h-full w-full  flex-col"
    style={{
      display: props.isVisible ? "flex" : "none"
    }}
  >
    <div className="text-sm flex items-center flex-shrink-0 ">
      <div className="text-sm font-bold">
        Favorite
      </div>
      <div className="flex-1"></div>
      <Button variant={"ghost"} size={"icon"} className="w-[28px] h-[28px] m-[0px]"
        onClick={()=>{
          openMenu({
            channel:"explorer:db-actioning",
            items:[
              {
                name:"Add Database",
                command:"addDatabase"
              }
            ]
          })
        }}
      >
        <MoreHorizontalIcon size={14}></MoreHorizontalIcon>
      </Button>
    </div>
    {/* <VirtualList items={rows}  estimateHeight={32} renderItem={(item: IExplorerDbRow, i: number) => {
      return <div className="flex items-center gap-[5px] h-[32px] hover:bg-accent rounded-lg select-none text-sm "
      >
      </div>
    }} /> */}
  </div>
}