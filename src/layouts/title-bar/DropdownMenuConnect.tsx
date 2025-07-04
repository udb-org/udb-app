import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useDbStore } from "@/store/db-store"
import { ConnectionConfig, IResult } from "@/types/db"
import { DialogType } from "@/types/dialog"
import {
  CheckIcon,
  ChevronDownIcon,
  LinkIcon
} from "lucide-react"
import * as React from "react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { openDialog } from "../dialog"
import { openConnection } from "@/api/db"
export function DropdownMenuConnect() {
  const [connections, setConnections] = React.useState<ConnectionConfig[]>([]);
  
  const connection=useDbStore((state)=>state.connection);
  const setConnection=useDbStore((state)=>state.setConnection);
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  useEffect(() => {
    if(open){
      window.api.invoke<IResult>("db:getConnectionConfig").then((res) => {
        if (res.status == 200) {
          setConnections(res.data);
        }
      });
    }  
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"sm"} className="h-[24px] items-center flex gap-1 font-normal text-foreground/90">
          <div className="rounded-md bg-amber-800 px-[2px] py-[2px] text-sm text-white ">
            {connection && connection.name.substring(0, 2).toUpperCase()}
          </div>
          {connection && connection.name}
          {connection == null && t("title.bar.select.connection")}
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
            <span>{t("title.bar.new.connection")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuLabel>{t("title.bar.recent.connection")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="w-full h-[200px]">
          <ScrollBar orientation="vertical" />
          <DropdownMenuGroup >
            {
              connections.map((conf) =>
                <DropdownMenuItem key={conf.name} onClick={() => {
         
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
                        connection && connection.name == conf.name && <CheckIcon size={14} className="text-primary" />
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
