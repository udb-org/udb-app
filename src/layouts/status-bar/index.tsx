import { ISqlResult } from "@/types/db";
import { DatabaseIcon } from "lucide-react";
import React from "react";
export default function StatusBar() {
  const [database, setDatabase] = React.useState<string>("");
  React.useEffect(() => {
   
    //监听数据库变化
    const selectDatabased = (res) => {
      if(res){
        setDatabase(res);
      }else{
        setDatabase("");
      }
    
    }
    window.api.on("db:selectDatabased", selectDatabased);
    return () => {

      window.api.removeListener("db:selectDatabased", selectDatabased);
    }
  }, [])
  return <div className="h-[32px] w-full flex-shrink-0  flex items-center gap-1 text-muted-foreground text-sm">
    <div className="w-8"></div>
    <DatabaseIcon size={12}/>
  {database}
  <div className="flex-1">

  </div>

  Ctrl/Cmd+I Open/Close AI Inline
  <div className="w-8"></div>

  </div>
}