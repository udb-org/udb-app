import { openMenu } from "@/api/menu";
import { callAction, openView, sqlAction } from "@/api/view";
import { Icons } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { saveView, useTabStore } from "@/store/tab-store";
import { IAction, ViewParams } from "@/types/view";
import { cn } from "@/utils/tailwind";
import {
  CodeIcon,
  CogIcon,
  FileIcon,
  HardDriveDownloadIcon,
  HouseIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Table2,
  TableIcon,
  XIcon
} from "lucide-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Views } from "../view";
export function ViewTabs() {
  return (
    <div className="flex h-[32px] w-full items-center">
      <ViewTabsList />
      <ViewTabsTool />
    </div>
  );
}
export function ViewTabsList() {
  const { tab, setTab } = useTabStore();
  const [tabs, setTabs] = React.useState<
    {
      name: string;
      type: string;
      path: string[];
    }[]
  >([

  ]);
  useEffect(() => {
    const openViewing = (params: ViewParams) => {
      console.log("openViewing", params);
      setTab({
        type: params.type,
        name: params.name,
        path: params.path,
      });
      setTabs((prev: any) => {
        const newTabs = prev.filter((tab: any) => tab.name !== params.name);
        newTabs.push({
          type: params.type,
          name: params.name,
          path: params.path,
        });
        return newTabs;
      });
      saveView(params.name, params);
    };
    window.api.on("view:opening", openViewing);
    const switchViewing = (params: ViewParams) => {
      console.log("switchViewing", params);
      setTab({
        type: params.type,
        name: params.name,
        path: params.path,
      });
    };
    window.api.on("view:switch", switchViewing);
    return () => {
      window.api.removeListener("view:opening", openViewing);
      window.api.removeListener("view:switch", switchViewing);
    };
  }, []);
  return (
    <div
      className="scrollbar-none relative h-[28px] w-full flex-1 overflow-auto"
      onDoubleClick={() => {
        openView({
          type: "sql",
          params: {
            sql: "",
          },
          path: [],
        });
      }}
    >
      <div className="absolute whitespace-nowrap">
        {tabs.map((item: any, index: number) => (
          <ViewTabsItem
            key={item.name + ""}
            name={item.name + ""}
            path={item.path}
            type={item.type}
            isActive={tab.name === item.name}
            onClick={() => {
              setTab({
                type: item.type,
                name: item.name,
                path: item.path,
              });
            }}
            onClose={(e) => {
              e.stopPropagation();
              e.preventDefault();
              //如果只有一个tab，则不允许关闭
              if (tabs.length === 1) {
                return;
              }
              //如果是当前的tab
              if (tab.name === item.name) {
                console.log("tab.name === item.name", tab.name, item.name);
                //如果只有2个tab
                if (tabs.length === 2) {
                  //切换为另一个tab
                  let otherTab: any = {};
                  tabs.forEach((tab) => {
                    if (tab.name !== item.name) {
                      otherTab = tab;
                    }
                  });
                  setTab({
                    type: otherTab.type,
                    name: otherTab.name,
                    path: otherTab.path,
                  });
                } else if (tabs.length > 2) {
                  //切换为任意一个tab
                  let otherTab: any = {};
                  tabs.forEach((tab) => {
                    if (tab.name !== item.name) {
                      otherTab = tab;
                    }
                  });
                  setTab({
                    type: otherTab.type,
                    name: otherTab.name,
                    path: otherTab.path,
                  });
                }
              }
              //删除tab
              setTabs((prev: any) => {
                const newTabs = prev.filter(
                  (tab: any) => tab.name !== item.name,
                );
                return newTabs;
              });
            }}
          />
        ))}
        <div className="w-[100px]"></div>
      </div>
    </div>
  );
}
export function ViewTabsItem(props: {
  name: string;
  type: string;
  path: string[];
  isActive: boolean;
  onClick?: () => void;
  onClose?: (e: any) => void;
}) {
  function getIcon(t){
    console.log("getIcon",t);
    if (Views.hasOwnProperty(t)) {
      // const _view = Views[t.name].view;
      console.log("view",Views[t]);

      return Views[t].icon;
    }else{
      return <FileIcon className="w-[12px]" />
    }
  }
  return (
    <div
      className="group mr-1 inline-block h-[24px] select-none"
      onDoubleClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className={cn(
          "hover:bg-muted  flex h-[24px] cursor-pointer items-center gap-1 rounded-lg border border-transparent px-[8px] text-sm",
          props.isActive && "bg-muted border-foreground/10",
        )}
        onClick={props.onClick}
      >
        <div>
          {getIcon(props.type)}
         
        </div>
        <div className="max-w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {props.name}
        </div>
        <div className="h-[16px] w-[16px]">
          <Button
            variant={"ghost"}
            size={"icon"}
            className="hidden h-[16px] w-[16px] group-hover:flex"
            onClick={props.onClose}
          >
            <XIcon className="w-[14px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}


export function ViewTabsTool() {
  const [actions, setActions] = React.useState<IAction[]>([]);
  const [channel, setChannel] = React.useState<string>("");
  const tab = useTabStore((state: any) => state.tab);
  const {t}=useTranslation();

  useEffect(() => {
    const showActions = (arg:{
      actions: IAction[],channel:string
    }) => {
      setChannel(arg.channel);
      setActions(arg.actions);
    };
    window.api.on("view:showed-actions", showActions);
    return () => {
      window.api.removeAllListeners("view:show-actions");
    };
  }, []);

  function getIcon(name:string):React.ReactNode{
    if (name in Icons){
      return Icons[name];
    }
    return <></>
  }
  return (
    <div className="text-muted-foreground flex h-[28px] items-center">
      <Button
        variant={"ghost"}
        size={"sm"}
        className="ml-1 h-6 w-6 p-[4px]"
        onClick={() => {
          openView({
            type: "sql",
            params: {
              sql: "",
            },
            path: [],
          });
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PlusIcon />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("view.action.newtab")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Button>
      {actions.slice(0, 2).map((item, index) => (
        <Button
          key={item.name}
          variant={"ghost"}
          size={"sm"}
          className="ml-1 h-6 w-6 p-[4px]"
          onClick={() => {
            
            callAction({
              channel:channel,
              command:item.command,
            });
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {getIcon(item.icon)}
            
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Button>
      ))}
      {actions.length > 2 && (
        <Button
          variant={"ghost"}
          size={"sm"}
          className="ml-1 h-6 w-6 p-[4px]"
          onClick={() => {
            openMenu({
              channel: channel,
              items: actions.slice(2).map((item) => {
                return {
                  name: item.name,
                  command: item.command,
                
                };
              }),
            });
          }}
        >
          <MoreHorizontalIcon />
        </Button>
      )}

    </div>
  );
}
