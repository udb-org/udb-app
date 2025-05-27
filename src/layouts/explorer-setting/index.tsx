import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pen, PenIcon, TrashIcon } from "lucide-react";
import { GeneralSetting } from "./general";
import { AccountSetting } from "./account";
import { AiSetting } from "./ai";
import { AboutSetting } from "./about";
import { cn } from "@/utils/tailwind";

export default function ExplorerSetting(props: { isVisible: boolean }) {
  const [config, setConfig] = React.useState<any>({});
  useEffect(() => {
    window.api.invoke("storage:getConfig").then((res: any) => {
      console.log("getConfig", res);
      setConfig(res);
    });
  }, []);
  function handleChange(key: string, value: any) {
    setConfig({
      ...config,
      [key]: value,
    });
    window.api.invoke("storage:setConfig", config);
    console.log("handleChange", key, value);
  }
  return (
    <div
      className={cn("flex h-full w-full", props.isVisible ? "block" : "hidden")}
    >
      <ScrollArea className="h-full flex-1 overflow-auto">
        <div className="p-2">
          <GeneralSetting config={config} onConfigChange={handleChange} />
          <Separator className="my-5" />
          <AccountSetting config={config} onConfigChange={handleChange} />
          <Separator className="my-5" />
          <AiSetting config={config} onConfigChange={handleChange} />
          <Separator className="my-5" />
          <AboutSetting />
        </div>
        <div className="h-100"></div>
      </ScrollArea>
    </div>
  );
}
