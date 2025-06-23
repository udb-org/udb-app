
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConnectionConfig, IResult } from "@/types/db";
import { DialogType } from "@/types/dialog";
import { LinkIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { openDialog } from "../dialog";
import { useDbStore } from "@/store/db-store";
import { openConnection } from "@/api/db";
export function Webcome() {
  const [connections, setConnections] = React.useState<ConnectionConfig[]>([]);
  const [showConnections, setShowConnections] = React.useState<
    ConnectionConfig[]
  >([]);
  const connection=useDbStore((state)=>state.connection);
  const setConnection=useDbStore((state)=>state.setConnection);
  useEffect(() => {
    window.api.invoke<IResult>("db:getConnectionConfig").then((res) => {
      if (res.status == 200) {
        setConnections(res.data);
        if (res.data.length > 3) {
          setShowConnections(res.data.slice(0, 3));
        }else{
          setShowConnections(res.data);
        }
      }
    });
  }, []);
  const { t } = useTranslation();
  return (
    <div className="box-border flex h-full w-full flex-col items-center justify-center">
      <div >
        <Button
          size={"sm"}
          variant={"default"}
          className="w-full  shadow-md md:min-w-0"
          onClick={() => {
            openDialog({
              type: DialogType.AddConnection,
              params: {},
            });
          }}
        >
          <LinkIcon size={16}></LinkIcon>
          <span className="ml-2">{t("title.bar.new.connection")}</span>
        </Button>
        <div className="mt-5">
          {showConnections.map((connection, i) => (
            <Button
              key={i}
              size={"sm"}
              variant={"ghost"}
              className="mb-1 w-full gap-1 text-sm  md:min-w-0"
              onClick={() => {
                openConnection(connection);
                // setConnection(connection);
              }}
            >
              <LinkIcon size={12}></LinkIcon>
              <div className="max-w-[90px]">{connection.name}</div>
              <div className="flex-1"></div>
              <div className="max-w-[40px] text-muted-foreground overflow-hidden overflow-ellipsis">{connection.host}</div>
            </Button>
          ))}
        </div>

        <Popover>
          <PopoverTrigger asChild>
          <Button size={"sm"} variant={"ghost"} className="w-full">
          <span className="text-muted-foreground ml-2 text-xs">{t("welcome.button.more")}</span>
        </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] md:min-w-0">
          {connections.map((connection, i) => (
            <Button
              key={i}
              size={"sm"}
              variant={"ghost"}
              className="mb-1 w-full gap-1 text-sm"
              onClick={() => {
                openConnection(connection);
              }}
            >
              <LinkIcon size={12}></LinkIcon>
              <div>{connection.name}</div>
              <div className="flex-1"></div>
              <div className="text-muted-foreground overflow-hidden overflow-ellipsis">{connection.host}</div>
            </Button>
          ))}
          </PopoverContent>

        </Popover>

       
      </div>
    </div>
  );
}
