import { getConnectionConfig, openConnection } from "@/api/storage";
import { Button } from "@/components/ui/button";
import { ConnectionConfig } from "@/types/db";
import { LinkIcon } from "lucide-react";
import React, { useEffect } from "react";
import { openDialog } from "../dialog";
import { DialogType } from "@/types/dialog";
export function ViewWebcome(
    props:{
        viewKey:string
    }
) {

const [connections, setConnections] = React.useState<ConnectionConfig[]>([]);
const [showConnections, setShowConnections] = React.useState<ConnectionConfig[]>([]);
useEffect(() => {

    const getConnectionConfiging = (connections: ConnectionConfig[]) => {
        setConnections(connections);
        if(connections.length>4){
            setShowConnections(connections.slice(0,4));
        }else{
            setShowConnections(connections);
        }
    
      }
      window.api.on("storage:getConnectionConfiging",getConnectionConfiging);
  
    getConnectionConfig();
    return ()=>{
      window.api.removeListener("storage:getConnectionConfiging",getConnectionConfiging);
    }
}, []);

  return   <div className="h-full w-full box-border flex flex-col items-center justify-center">
    <div className="w-[300px]">
        <Button size={"sm"} variant={"secondary"} className="w-full" onClick={()=>{
            openDialog({
                type:DialogType.AddConnection,
                params:{}
            })
        }}>
            <LinkIcon size={16}></LinkIcon>
            <span className="ml-2">
                New Connection
            </span>
        </Button>
        <div className="mt-5">
            {showConnections.map((connection,i) => (
              <Button key={i} size={"sm"} variant={"ghost"} className="w-full gap-1 mb-1 text-sm"
                onClick={()=>{
                    openConnection(connection);
                }}
              >
                <LinkIcon size={12}></LinkIcon>
                <div>
                    {connection.name}
                    </div>
                    <div className="flex-1">

                    </div>
                <div className="text-muted-foreground ">
                    {connection.host}
                </div>

             </Button>
            ))}

        </div>
        <Button size={"sm"} variant={"ghost"} className="w-full">
            <span className="ml-2 text-muted-foreground text-sm">
               More
            </span>
        </Button>
      
    </div>
  </div>

}