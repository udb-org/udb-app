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
import { AddMCP } from "./add-mcp";
export function AiMcpSetting(props: {
    config: any;
    onConfigChange: (key: string, value: any) => void;
}) {
    const servers = props.config["ai.mcp.servers"] || [];
    return <div>
        <SettingTitle title="Mcp Servers Settings" />
        <SettingDescription description="Manage your Mcp Servers." />
        <Table className="border-1 rounded text-sm">
            <TableHeader className="bg-muted">
                <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                    <TableHead >Description</TableHead>
                    <TableHead> 
                        <AddMCP />
                        </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {servers.map((server, i) => (
                    <TableRow key={i}>
                        <TableCell className="font-medium">{server.name}</TableCell>
                        <TableCell className="font-medium  whitespace-break-spaces" title={server.description}>{server.description}</TableCell>

                      
                        <TableCell className="font-medium">
                            {
                                !server.isBuiltIn && <Button variant={"ghost"} size={"sm"} className="h-[24px]"
                                    onClick={() => {
                                        // window.api.send("storage:deleteModel",model.key);
                                        let _agents = [...servers];
                                        _agents.splice(i, 1);
                                        props.onConfigChange("ai.mcp.servers", _agents);
                                    }}
                                >
                                    <TrashIcon size={12} ></TrashIcon>
                                </Button>
                            }
                            {
                                server.isBuiltIn && "BuiltIn"
                            }

                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

    </div>
}