import { getConnectionConfig, openConnection } from "@/api/storage";
import { Button } from "@/components/ui/button";
import { ConnectionConfig } from "@/types/db";
import { LinkIcon } from "lucide-react";
import React, { useEffect } from "react";
import { openDialog } from "../dialog";
import { DialogType } from "@/types/dialog";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
export function Webcome() {
  const [connections, setConnections] = React.useState<ConnectionConfig[]>([]);
  const [showConnections, setShowConnections] = React.useState<
    ConnectionConfig[]
  >([]);
  useEffect(() => {
    const getConnectionConfiging = (connections: ConnectionConfig[]) => {
      setConnections(connections);
      if (connections.length > 4) {
        setShowConnections(connections.slice(0, 4));
      } else {
        setShowConnections(connections);
      }
    };
    window.api.on("storage:getConnectionConfiging", getConnectionConfiging);
    getConnectionConfig();
    return () => {
      window.api.removeListener(
        "storage:getConnectionConfiging",
        getConnectionConfiging,
      );
    };
  }, []);
  const { t } = useTranslation();
  return (
    <div className="box-border flex h-full w-full flex-col items-center justify-center">
      <div >
        <Button
          size={"sm"}
          variant={"outline"}
          className="w-full border border-primary"
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
              className="mb-1 w-full gap-1 text-sm"
              onClick={() => {
                openConnection(connection);
              }}
            >
              <LinkIcon size={12}></LinkIcon>
              <div>{connection.name}</div>
              <div className="flex-1"></div>
              <div className="text-muted-foreground">{connection.host}</div>
            </Button>
          ))}
        </div>

        <Popover>
          <PopoverTrigger asChild>
          <Button size={"sm"} variant={"ghost"} className="w-full">
          <span className="text-muted-foreground ml-2 text-xs">{t("welcome.button.more")}</span>
        </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px]">
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
              <div className="text-muted-foreground">{connection.host}</div>
            </Button>
          ))}
          </PopoverContent>

        </Popover>

       
      </div>
    </div>
  );
}
