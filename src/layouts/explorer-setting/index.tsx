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
import { useTranslation } from "react-i18next";
import { SetupTheme } from "../setup/theme";
import { SettingTheme } from "./theme";
import { SettingTopic } from "./common";
import { AppConfig } from "@/api/config";
import { AiAgentSetting } from "./ai-agent";
import { AiMcpSetting } from "./ai-mcp";
export default function ExplorerSetting(props: { isVisible: boolean }) {
  const [config, setConfig] = React.useState<any>({});
  useEffect(() => {
    window.api.invoke("storage:getConfig").then((res: any) => {
      
      setConfig(res);
    });
  }, []);
  function handleChange(key: string, value: any) {
    const _config = { ...config, [key]: value };
    setConfig(_config);
    AppConfig.saveConfig(_config);
  }
  const { t } = useTranslation();
  return (
    <div
      className={cn("flex h-full w-full", props.isVisible ? "block" : "hidden")}
    >
      <div className="flex flex-shrink-0 items-center text-sm font-bold">
        <div className="text-sm font-bold">
          {t("active.bar.setting")}
        </div>
        <div className="flex-1"></div>
      </div>
      <ScrollArea className="h-full flex-1 overflow-auto">
        <div className="p-2">
          <SettingTopic topic={t("settings.base.title")} />
          <SettingTheme config={config} onConfigChange={handleChange} />
          <GeneralSetting config={config} onConfigChange={handleChange} />
          <Separator className="my-5" />
          <AccountSetting config={config} onConfigChange={handleChange} />
          <Separator className="my-5" />
          <AiSetting config={config} onConfigChange={handleChange} />
           <AiAgentSetting config={config} onConfigChange={handleChange} />
         <AiMcpSetting config={config} onConfigChange={handleChange} />
          <Separator className="my-5" />
          <AboutSetting />
        </div>
        <div className="h-100"></div>
      </ScrollArea>
    </div>
  );
}
