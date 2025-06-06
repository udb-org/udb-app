import React from "react";
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
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { SettingDescription, SettingTitle } from "./common";
import { DialogType } from "@/types/dialog";
import { openDialog } from "../dialog";
import { AddAgent } from "./add-agent";
export function AiAgentSetting(props: {
    config: any;
    onConfigChange: (key: string, value: any) => void;
}) {
    const agents = props.config["ai.agents"] || [];
    return <div>
    <SettingTitle title="Agents Settings" />
        <SettingDescription description="Manage your agents." />
        <Table className="border-1 rounded text-sm">
            <TableHeader className="bg-muted">
                <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                    <TableHead >Prompt</TableHead>
                    <TableHead >MCP Servers</TableHead>
                    <TableHead>
                       
                    <AddAgent servers={props.config["ai.mcp.servers"]} onSuccess={(agent) => {
                        let _agents = [...agents];
                        _agents.push(agent);
                        props.onConfigChange("ai.agents", _agents);
                    }} onCancel={() => {
                        // setOpen(false);
                    }} />
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {agents.map((agent, i) => (
                    <TableRow key={i}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell className="font-medium  whitespace-break-spaces" title={agent.prompt}>{agent.prompt}</TableCell>
                        <TableCell className="font-medium  whitespace-break-spaces">{agent.servers.map(s=><div className="whitespace-nowrap" key={s}>
                            {s.name}
                        </div>)}</TableCell>
                        <TableCell className="font-medium">
                            {
                                !agent.isBuiltIn && <Button variant={"ghost"} size={"sm"} className="h-[24px]"
                                onClick={() => {
                                    // window.api.send("storage:deleteModel",model.key);
                                    let _agents = [...agents];
                                    _agents.splice(i, 1);
                                    props.onConfigChange("ai.agents", _agents);
                                }}
                            >
                                <TrashIcon size={12} ></TrashIcon>
                            </Button>
                            }
                            {
                                agent.isBuiltIn &&"BuiltIn"
                            }
                           
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

    </div>
}