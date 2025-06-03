import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveAndOpenConnection, testConnection } from "@/api/storage";
import { ConnectionConfig } from "@/types/db";
import { Textarea } from "@/components/ui/textarea";
import { addDatabase } from "@/api/db";
import { AiAgent, AiAgentServer } from "@/types/ai";
import { Checkbox } from "@/components/ui/checkbox";
import { AppConfig } from "@/api/config";
import { toast } from "sonner";
import { openView } from "@/api/view";
import { useActiveStore } from "@/store/active-store";
import { openExplorer } from "@/api/explorer";
import { PlusIcon } from "lucide-react";
import { cn } from "@/utils/tailwind";
const formSchema = z.object({
    name: z.string().min(5, "Name large than 5 characters"),
    prompt: z.string().min(5, "Prompt large than 5 characters").max(1000, "Prompt is too long"),
    servers: z.array(z.string()),
})
export function AddAgent(props: {
    servers: AiAgentServer[];
    onSuccess?: (agent: AiAgent) => void;
    onCancel?: () => void;
    hasLabel?: boolean;
}) {

    const [isRunnind, setIsRunning] = useState(false)
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            prompt: "",
            servers: [],
        },
    })
    // 保存配置处理
    const onSubmit = (e: any) => {
        // e.preventDefault();
        // e.stopPropagation();
        if (isRunnind) {
            return;
        }
        setIsRunning(true);
        // const values = form.getValues();
        // console.log("保存配置:", values)
        const list: AiAgentServer[] = form.watch("servers").map(ser => {
            return {
                name: ser
            }
        })
        const agent: AiAgent = {
            name: form.watch("name"),
            prompt: form.watch("prompt"),
            servers: list
        }
        //Read the existing agents from the configuration file, and then add the new agent to the list, and then save the configuration file.
        AppConfig.getAiAgents().then((res: any) => {
            console.log("getAiAgents", res);
            const newAgents = [...res, agent];
            //Save the configuration file
            AppConfig.saveConfig({
                "ai.agents": newAgents
            }).then(() => {
                setIsRunning(false);
                props.onSuccess?.(agent);
                setOpen(false);
            }).catch((e) => {
                setIsRunning(false);
                toast.error(e);
            });
        }).catch((e) => {
            setIsRunning(false);
            toast.error(e);
        });
    }

    const servers = props.servers;

    const [open, setOpen] = React.useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"outline"} size={props.hasLabel?"default":"icon"} 
                className={
                    cn(
                        props.hasLabel?"w-full":"h-5 w-5",
                    )
                }>
                    <PlusIcon size={12} ></PlusIcon>
                    {props.hasLabel && <div className="ml-1">Add Agent</div>}
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Agent</DialogTitle>
                    <DialogDescription>
                        Add a new agent to your workspace.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter agent  name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prompt *</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter the agent's role,tone,workflow,toole preferences,and other relevant information" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="servers"
                            render={() => (
                                <FormItem>
                                    <div className="">
                                        <FormLabel >MCP Servers</FormLabel>
                                        <FormDescription>
                                            Equip your agent with the necessary MCP servers to interact with the database.
                                        </FormDescription>
                                    </div>
                                    {servers && servers.map((item, i) => (
                                        <FormField
                                            key={i}
                                            control={form.control}
                                            name="servers"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={item.name}
                                                        className="flex flex-row items-center gap-2 whitespace-nowrap"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item.name)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, item.name])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value) => value !== item.name
                                                                            )
                                                                        )
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal">
                                                            {item.name}
                                                        </FormLabel>
                                                        <div className="flex-1"></div>
                                                        <FormLabel className="text-sm text-muted-foreground font-normal max-w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                                                            {item.description}
                                                        </FormLabel>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-2 justify-end">

                            <Button type="submit" size={"sm"} disabled={isRunnind}>Create</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
