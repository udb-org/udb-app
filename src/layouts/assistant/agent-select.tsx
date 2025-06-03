"use client"
import * as React from "react"
import {
  ArrowUpCircle,
  BotIcon,
  CheckCircle2,
  Circle,
  HelpCircle,
  LucideIcon,
  PlusIcon,
  TrashIcon,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/utils/tailwind"
import { Separator } from "@/components/ui/separator"
import { AppConfig } from "@/api/config"
import { AiAgent, AiAgentServer } from "@/types/ai"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { openDialog } from "../dialog"
import { DialogType } from "@/types/dialog"
import { toast } from "sonner"
import { AddAgent } from "../explorer-setting/add-agent"

export function AgentSelect(
  props: {
    onChange: (value: AiAgent) => void,
    value: AiAgent | undefined
  }
) {
  const [open, setOpen] = React.useState(false)

  const [agents, setAgents] = React.useState<AiAgent[]>([]);
  const [servers, setServers] = React.useState<AiAgentServer[]>([]);
  React.useEffect(() => {
    AppConfig.getAiAgents().then((res: any) => {
      console.log("getAiAgents", res);
      setAgents(res);
    })
    AppConfig.getAiMcpServers().then((res: any) => {
      console.log("getAiAgentServers", res);
      setServers(res);
    })
  }, [open]);


  return (
    <Popover open={open} onOpenChange={setOpen} >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="pl-1  justify-start h-[20px] text-[11px] bg-transparent text-muted-foreground"
        >
          @ Agent
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 " >
        <div className="p-2">
          <div>
            Agents
          </div>
          {
            agents.map((agent, i) => (

              <Button
                key={i}
                variant="ghost"
                className="w-full justify-start h-auto"
                onClick={() => {
                  props.onChange(agent);
                  setOpen(false);
                }}
              >
                <div className="flex w-full items-center gap-2">
                  <div className="rounded-full bg-background p-2">
                    <BotIcon size={14} />
                  </div>
                  {agent.name}
                </div>
                {!agent.isBuiltIn &&
                  <div onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    //Delete the agent
                    //Read the existing agents from the configuration file, and then add the new agent to the list, and then save the configuration file.
                    AppConfig.getAiAgents().then((res: any) => {
                      console.log("getAiAgents", res);
                      const newAgents = res.filter((item: AiAgent) => item.name !== agent.name);
                      //Save the configuration file
                      AppConfig.saveConfig({
                        "ai.agents": newAgents
                      }).then(() => {
                        setAgents(newAgents);

                      }).catch((e) => {
                        toast.error(e);
                      });
                    }).catch((e) => {
                      toast.error(e);
                    });

                  }}>
                    <TrashIcon size={12} />
                  </div>
                }
              </Button>

            ))
          }
        </div>
        <Separator className="my-1" />
        <div className="p-2">
          <AddAgent servers={servers} hasLabel onSuccess={(agent) => {
            let _agents = [...agents];
            _agents.push(agent);
            AppConfig.saveConfig({
              "ai.agents": _agents
            }).then(() => {
              setAgents(_agents);
            }).catch((e) => {
              toast.error(e);
            });
          }} onCancel={() => {
            // setOpen(false);
          }} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
