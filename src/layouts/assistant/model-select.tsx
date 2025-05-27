"use client";

import * as React from "react";
import {
  ArrowUpCircle,
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
  React.useEffect(() => {
    const getModels = (models: any[]) => {
      console.log("getModels", models);
      setModels(models);
      window.api
        .invoke("storage:getConfigItem", "defaultModelKey")
        .then((res: any) => {
          console.log("getConfigItem", res);
          const model = models.find((model) => model.key === res);
          setSelectedStatus(model);
        });
    };
    window.api.on("storage:getModelsing", getModels);
    window.api.send("storage:getModels");
    return () => {
      window.api.removeAllListeners("storage:getModelsing");
    };
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
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {models.map((status) => (
                <CommandItem
                  key={status.key}
                  value={status.key}
                  onSelect={(value) => {
                    setSelectedStatus(
                      models.find((m) => m.key === value) || null,
                    );
                    setOpen(false);
                  }}
                >
                  {/* <status.icon
                    className={cn(
                      "mr-1 h-4 w-4",
                      status.value === selectedStatus?.value
                        ? "opacity-100"
                        : "opacity-40"
                    )}
                  /> */}
                  <span className="text-sm">
                    {status.provider}:{status.model}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <Separator></Separator>
        <div className="ml-1 p-1 text-sm">Custom Model</div>
        <AddModelSetting onSuccess={() => {}} onCancel={() => {}} />
      </PopoverContent>
    </Popover>
  );
}
