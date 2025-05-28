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
import { useTranslation } from "react-i18next";


export default function ActiveBar() {

  const {t}=useTranslation();

const explorers = [
  {
    name: t("active.bar.database"),
    icon: DatabaseIcon,
    key: "database",
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
    name: t("active.bar.folder"),
    key: "folder",
    icon: FolderIcon,
    explorer: {
      type: "folder",
      params: {},
    },
  },
  {
    name: t("active.bar.history"),
    key: "history",
    icon: HistoryIcon,
    explorer: {
      type: "history",
      params: {},
    },
  },
  {
    name: t("active.bar.setting"),
    key: "setting",
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
            active === item.key && "bg-primary/20",
          )}
          onClick={() => {
            setActive(item.key);
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
