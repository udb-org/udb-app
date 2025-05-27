import * as React from "react"
import {
  CheckCheckIcon,
  CheckIcon,
  ChevronDownIcon,
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LinkIcon,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar"
import { Label } from "@radix-ui/react-dropdown-menu"
import { openDialog } from "../dialog"
import { DialogType } from "@/types/dialog"
import { useEffect } from "react"
import { getConnectionConfig, openConnection } from "@/api/storage"
import { ConnectionConfig } from "@/types/db"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"


export function DropdownMenuConnect() {
  const [connections, setConnections] = React.useState<ConnectionConfig[]>([]);
  const [currentConnection, setCurrentConnection] = React.useState<ConnectionConfig | null>(null);
  useEffect(() => {

    const getConnectionConfiging = (connections: ConnectionConfig[]) => {
      setConnections(connections);

    }
    window.api.on("storage:getConnectionConfiging", getConnectionConfiging);


    getConnectionConfig();

    const openConnectioning = (conf: ConnectionConfig) => {
      console.log("openConnectioning", conf)
      setCurrentConnection(conf);
    }
    window.api.on("storage:openConnectioning", openConnectioning);
    return () => {
      window.api.removeListener("storage:openConnectioning", openConnectioning);
      window.api.removeListener("storage:getConnectionConfiging", getConnectionConfiging);
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"sm"} className="h-[24px] items-center flex gap-1 font-normal text-foreground/90">
          <div className="rounded-md bg-amber-800 px-[2px] py-[2px] text-sm text-white ">
            {currentConnection && currentConnection.name.substring(0, 2).toUpperCase()}
          </div>
          {currentConnection && currentConnection.name}
          {currentConnection == null && "Please select a connection"}
          <ChevronDownIcon size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 min-w-[240px]">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => {
            openDialog({
              type: DialogType.AddConnection,
              params: {}
            })
          }}>
            <LinkIcon />
            <span>New Connection</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuLabel>Recent</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="w-full h-[200px]">
          <ScrollBar orientation="vertical" />
          <DropdownMenuGroup >

            {
              connections.map((conf) =>
                <DropdownMenuItem key={conf.name} onClick={() => {
                  setCurrentConnection(conf);
                  openConnection(conf);

                }}>
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-800 rounded-md p-[2px] w-[32px] h-[32px] flex items-center justify-center">
                      {conf.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="">
                        {conf.name}
                      </div>
                      <div className="text-sm text-">
                        {conf.host}:{conf.port}
                      </div>
                    </div>
                    <div>
                      {
                        currentConnection && currentConnection.name == conf.name && <CheckIcon size={14} className="text-primary" />
                      }

                    </div>
                  </div>
                </DropdownMenuItem>)
            }
          </DropdownMenuGroup>
        </ScrollArea>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
