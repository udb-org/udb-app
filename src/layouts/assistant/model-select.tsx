"use client";
import * as React from "react";
import {
  ArrowUpCircle,
  BrainIcon,
  CheckCircle2,
  Circle,
  HelpCircle,
  LucideIcon,
  PlusIcon,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/utils/tailwind";
import { Separator } from "@/components/ui/separator";
import { AddModelSetting } from "../explorer-setting/add-model";
import { AppConfig } from "@/api/config";
type Status = {
  value: string;
  label: string;
  icon: LucideIcon;
};
export function ModelSelect(props: { onSelect: (model: any) => void }) {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<any | null>();
  React.useEffect(() => {
    props.onSelect(selectedStatus);
  }, [selectedStatus]);
  const [models, setModels] = React.useState<any[]>([]);
  const [providers, setProviders] = React.useState<any[]>([]);
  React.useEffect(() => {
    AppConfig.getAiModels().then((models: any) => {
      setModels(models);
      AppConfig.getAiChatModel().then((model: any) => {
        setSelectedStatus(models.find((m: any) => m.key === model) || null);
      });
    });
    AppConfig.getAiProviders().then((providers: any) => {
      setProviders(providers);
    });
  }, []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground h-[20px] justify-start bg-transparent pl-1 text-[11px]"
        >
          {selectedStatus ? (
            <>
              {selectedStatus.provider}:{selectedStatus.model}
            </>
          ) : (
            <>+ Set Model</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="p-2 text-sm">
          <div>
            Models
          </div>
          <div className="space-y-1">
            {models.map((model, i) => <Button key={i}
            variant={"outline"}
            className="w-full justify-start"
              onClick={() => { 
                setSelectedStatus(
                  model
                );
                setOpen(false);
              }}
            >
              <BrainIcon size={12} className="mr-2" />
              {model.provider}:{model.model}

            </Button>)}
          </div>
        </div>

        <Separator></Separator>
        <div className="p-2">
          <div className="ml-1 p-1 text-sm">Custom Model

          </div>
          <AddModelSetting hasLabel providers={providers} onSuccess={() => {
            let _models = [...models];
            _models.push(selectedStatus);
            setModels(_models);
            AppConfig.saveConfig({
              "ai.models": _models,
            });
          }} onCancel={() => { }} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
