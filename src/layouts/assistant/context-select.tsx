"use client"

import * as React from "react"
import {
  ArrowUpCircle,
  CheckCircle2,
  Circle,
  HelpCircle,
  LucideIcon,
  PlusIcon,
  XCircle,
} from "lucide-react"


import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/utils/tailwind"
import { Separator } from "@/components/ui/separator"



type Status = {
  value: string
  label: string
  icon: string
}

const statuses: Status[] = [
  {
    value: "default",
    label: "Default",
    icon:"#"
  },
  {
    value: "none",
    label: "None",
    icon: "&"
  },
  {
    value: "all",
    label: "All",
    icon: "%"
  },
 

]

export function ContextSelect(
  props:{
    onChange:(value:string)=>void,
    value:string
  }
) {
  const [open, setOpen] = React.useState(false)
 
  function getIcon(value:string){
  let icon="#";
   statuses.forEach(status=>{
      if(status.value===value){
        icon=status.icon;
      }
    })
    return icon
  }
  function getLabel(value:string){
    let label="Default";
    statuses.forEach(status=>{
      if(status.value===value){
        label=status.label;
      }
    })
    return label
  }
  return (
    <Popover open={open} onOpenChange={setOpen} >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="pl-1  justify-start h-[20px] text-[11px] bg-transparent text-muted-foreground"
          >
            {props.value ? (
              <>
                {getIcon(props.value)}
                <span className="w-1"/>
                {getLabel(props.value)}
              </>
            ) : (
              <>+ Set status</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 " >
          <Command>
           
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status.value}
                    value={status.value}
                    onSelect={(value) => {
                      props.onChange(value);
                      setOpen(false)
                    }}
                  >
           
                    <div
                      className={cn(
                        "",
                        status.value === props.value
                          ? "opacity-100"
                          : "opacity-40"
                      )}
                    >
                    {status.icon}
                    </div>
                    <span className="text-sm">{status.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        

        </PopoverContent>
      </Popover>
  )
}
