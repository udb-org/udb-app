import React, { use, useEffect, useState } from "react";
import { DropdownMenuConnect } from "./DropdownMenuConnect";
import { getPlatformInfo } from "@/api/platfrom";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon, PanelLeftDashed, PanelLeftDashedIcon, PanelLeftIcon, PanelRightDashedIcon, PanelRightIcon, User2Icon } from "lucide-react";
import { useActiveStore } from "@/store/active-store";
import { DropdownMenuProject } from "./DropdownMenuProject";
import { useLayoutStore } from "@/store/layout-store";
export default function TitleBar() {
  const [platform, setPlatform] = useState<any>(null);
  const active = useActiveStore((state: any) => state.active);
  const { leftPanelSize, setLeftPanelSize, rightPanelSize, setRightPanelSize,
    leftVisible, setLeftVisible,
    rightVisible, setRightVisible } = useLayoutStore();
  useEffect(() => {
    getPlatformInfo().then((info: any) => {
      setPlatform(info);
      console.log(info);
      let cls = "mac";
      if (info.os === "win32") {
        cls = "windows";
      } else if (info.os === "linux") {
        cls = "linux";
      }
      document.body.classList.add(cls);
    });
  }, []);
  return (
    <div className="flex h-[40px] w-full items-center flex-shrink-0 ">
      {
        //macOS
      }
      {platform && platform.os === "darwin" && <div className="w-[75px]"></div>}
      {
        //Workbench
      }
      {
        active == "Database" && <DropdownMenuConnect />
      }
      {
        active == "Folder" && <DropdownMenuProject />
      }
      <div className="app-region h-full flex-1"></div>
      {
        //操作
      }
      {
        leftVisible && <Button variant={"ghost"} size={"icon"} className="h-[24px] w-[24px] p-[2px]"
          onClick={() => {
            setLeftVisible(false);
          }}
        >
          <PanelLeftIcon size={12} />
        </Button>
      }
      {
        !leftVisible && <Button variant={"ghost"} size={"icon"} className="h-[24px] w-[24px] p-[2px]"
          onClick={() => {
            setLeftVisible(true);
          }}
        >
          <PanelLeftDashedIcon size={12} />
        </Button>
      }
      {
        rightVisible && <Button variant={"ghost"} size={"icon"} className="h-[24px] w-[24px] p-[2px]"
          onClick={() => {
            setRightVisible(false);
          }}
        >
          <PanelRightIcon size={12} />
        </Button>
      }
      {
        !rightVisible && <Button variant={"ghost"} size={"icon"} className="h-[24px] w-[24px] p-[2px]"
          onClick={() => {
            setRightVisible(true);
          }}
        >
          <PanelRightDashedIcon size={12} />
        </Button>
      }



      <Button variant={"ghost"} size={"icon"} className="h-[24px] w-[24px] p-[2px]">
        <User2Icon size={14} />
      </Button>
      {
        //Linux or Windows
      }
      {platform && (platform.os === "win32" || platform.os === "linux") && (
        <div className=""></div>
      )}
      <div className="w-2"></div>
    </div>
  );
}
