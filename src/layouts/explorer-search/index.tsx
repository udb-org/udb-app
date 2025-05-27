import React from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontalIcon } from "lucide-react"
import VirtualList from "@/components/virtual-scroll";

export function ExplorerSearch(props:{
  isVisible:boolean;
}) {
  return (
    <div className="h-full w-full  flex-col"
    style={{
      display: props.isVisible ? "flex" : "none"
    }}
  >
    <div className="font-bold text-sm flex items-center flex-shrink-0 ">
    <div className="text-sm font-bold">
      Search
      </div>
      <div className="flex-1"></div>
      <Button variant={"ghost"} size={"icon"} className="w-[28px] h-[28px] m-[0px]">
        <MoreHorizontalIcon size={14}></MoreHorizontalIcon>
      </Button>
    </div>
    {/* <ScrollArea className="flex-1">
      <ScrollBar orientation="vertical" />
      

    </ScrollArea> */}
    {/* <VirtualList items={rows}  estimateHeight={32} renderItem={(item: IExplorerDbRow, i: number) => {
      return <div></div>
    }}></VirtualList> */}
    </div>
    
  )
}