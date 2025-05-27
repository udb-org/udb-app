import * as React from "react"
import {
  CheckCheckIcon,
  CheckIcon,
  ChevronDownIcon,
  Cloud,
  CreditCard,
  FolderOpenIcon,
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

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useProjectStore } from "@/store/project-store"
import { IProject } from "@/types/project"
import { cn, colors } from "@/utils/tailwind"


export function DropdownMenuProject() {
  const [folders, setFolders] = React.useState<IProject[]>([]);
  const { project, setProject } = useProjectStore();
  useEffect(() => {
    window.api.invoke("storage:getRecentProjects").then((res: any) => {
      console.log("getRecentProjects", res);
      setFolders(res);
    })
  },[]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"sm"} className="h-[24px] items-center flex gap-1 font-normal text-foreground/90">
          <div className="rounded-md bg-amber-800 px-[2px] py-[2px] text-sm text-white ">
            {project && project.name.substring(0, 2).toUpperCase()}
          </div>
          {project && project.name!=""&&project.name}
          {(!project||project.name=="") && "Please select a folder"}
          <ChevronDownIcon size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 min-w-[240px]">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => {
            window.api.invoke("dialog:openFolder").then((res: any) => {
              console.log("openFolder", res);
              if (res) {
                const name = res.substring(res.lastIndexOf("/") + 1);
                setProject({
                  name: name,
                  path: res,
                  lastOpenTime: new Date().toLocaleString()
                });
                window.api.send("storage:openProject", res);
              }
            })
          }}>
            <FolderOpenIcon />
            <span>Open Folder</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuLabel>Recent</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="w-full h-[200px]">
          <ScrollBar orientation="vertical" />
          <DropdownMenuGroup >

            {
              folders.map((conf,index) =>
                <DropdownMenuItem key={conf.name} onClick={() => {
                  // setCurrentFolder(conf.name);
                  // openFolder(conf);
                  setProject({
                    name: conf.name,
                    path: conf.path,
                    lastOpenTime: new Date().toLocaleString()
                  });
                  window.api.send("storage:openProject",conf.path);

                }}>
                  <div className="flex items-center gap-2">
                    <div className={
                      cn(" rounded-md text-white p-[1px] w-[24px] h-[24px] flex items-center justify-center font-bold",
                        colors[index%10]
                      )
                    }>
                      {conf.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="">
                        {conf.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conf.path}
                      </div>
                    </div>
                    <div>
                      {
                        project && project.name == conf.name && <CheckIcon size={14} className="text-primary" />
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
