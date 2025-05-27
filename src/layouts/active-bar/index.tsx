import { openExplorer } from "@/api/explorer";
import { openView } from "@/api/view";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActiveStore } from "@/store/active-store";
import { useLayoutStore } from "@/store/layout-store";
import { cn } from "@/utils/tailwind";
import {
  BookmarkIcon,
  Database,
  DatabaseIcon,
  FolderIcon,
  HistoryIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";
import React from "react";

const explorers = [
  {
    name: "Database",
    icon: DatabaseIcon,
    explorer: {
      type: "db",
      params: {},
    },
  },
  // {
  //   name:"Favorite",
  //   icon:BookmarkIcon,
  //   explorer:{
  //     type:"favorite",
  //     params:{}
  //   }
  // },
  // {
  //   name:"Search",
  //   icon:SearchIcon,
  //   explorer:{
  //     type:"search",
  //     params:{}
  //   }
  // },
  {
    name: "Folder",
    icon: FolderIcon,
    explorer: {
      type: "folder",
      params: {},
    },
  },
  {
    name: "History",
    icon: HistoryIcon,
    explorer: {
      type: "history",
      params: {},
    },
  },
  {
    name: "Setting",
    icon: SettingsIcon,
    explorer: {
      type: "setting",
      params: {},
    },
  },
  // {
  //   name:"Setting",
  //   icon:SettingsIcon,
  //   view:{
  //     type:"setting",
  //     name:"Setting",
  //     params:{},
  //     path:["setting"]
  //   }
  // }
];

export default function ActiveBar() {
  const { active, setActive } = useActiveStore();
  const { leftVisible, setLeftVisible } = useLayoutStore();
  return (
    <div className="h-full w-[40px] flex-shrink-0">
      {explorers.map((item, index) => (
        <Button
          key={index}
          variant={"ghost"}
          size={"icon"}
          className={cn(
            "hover:bg-primary/10 m-[4px] h-[28px] w-[28px]",
            active === item.name && "bg-primary/20",
          )}
          onClick={() => {
            setActive(item.name);
            if (item.explorer) {
              openExplorer(item.explorer);
              if (!leftVisible) {
                setLeftVisible(true);
              }
            } else if (item.view) {
              openView(item.view);
            }
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <item.icon size={14} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Button>
      ))}
    </div>
  );
}
