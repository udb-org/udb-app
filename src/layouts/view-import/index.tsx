import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getView } from "@/store/tab-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IDataBaseTable, IDataBaseTableColumn, IResult } from "@/types/db";
import { toast } from "sonner";
import { setServers } from "dns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FolderOpenIcon, MessageCircleQuestionIcon, TrashIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
export default function ViewImport(
    props: {
        viewKey: string;
    }
) {
    const [view, setView] = React.useState<any>(null);
    const [database, setDatabase] = React.useState<string>("");
    const [table, setTable] = React.useState<string>("");
    const [path, setPath] = React.useState<string>("");
    const [step, setStep] = React.useState<string>("map");
    const [tab, setTab] = React.useState<string>("map");
    const [columns, setColumns] = React.useState<IDataBaseTableColumn[]>([]);
    useEffect(() => {
        //加载执行结果
        let _view = getView(props.viewKey);
        let _database = "";
        let _table = "";
        if (_view) {
            if (_view.params.database) {
                _database = _view.params.database;
            }
            if (_view.params.table) {
                _table = _view.params.table;
            }
        }
        setTable(_table);
        setDatabase(_database);
        setView(_view);
        window.api.invoke("db:getColumns", _table).then((res: IResult) => {
            if (res.status === 200) {
                setColumns(res.data.rows as IDataBaseTableColumn[]);
            } else {
                toast.error(res.message);
            }
        });

    }, [props.viewKey]);
    return (
        <div className="flex h-full w-full flex-col">
            <Tabs value={tab} onValueChange={(value) => {
                setTab(value);
            }} className="w-full h-full">
                <TabsList className="bg-transparent border-2 m-auto">
                    <TabsTrigger value="choose">Choose File</TabsTrigger>
                    <TabsTrigger value="map" disabled={step == "choose"}>Map to Table</TabsTrigger>
                    <TabsTrigger value="import" disabled={step != "import"}>Review & Import</TabsTrigger>
                </TabsList>
                <TabsContent value="choose" className="h-full flex justify-center ">
                    <div className="border p-5 rounded-lg h-min mt-5 ">
                        <div className="text-lg font-bold pb-5">Import data into table {table}</div>
                        <div className="text-sm">Select a file to import(csv,xlsx,json)</div>
                        <div className="flex gap-2">
                            <Input className="bg-card min-w-[300px]" value={path}></Input>
                            <Button variant={"outline"} className="bg-card"
                                onClick={() => {
                                    window.api.invoke("dialog:openFile", [
                                        { name: "CSV Files", extensions: ["csv"] },
                                        { name: "Excel Files", extensions: ["xlsx"] },
                                        { name: "JSON Files", extensions: ["json"] },
                                    ]).then((res) => {
                                        if (res) {
                                            setPath(res);
                                        }
                                    });

                                }}
                            >
                                <FolderOpenIcon size={14}></FolderOpenIcon>

                            </Button>
                        </div>
                        <div className="flex justify-end pt-5">
                            <Button variant={"outline"} className="bg-card"
                                onClick={() => {
                                    setStep("map");
                                    setTab("map");
                                }}
                            >
                                Map to Table
                            </Button>
                        </div>

                    </div>


                </TabsContent>
                <TabsContent value="map" className="h-full flex justify-center">

                    <div className="p-5 rounded-lg h-min  ">
                        <div className="flex justify-end gap-5">

                            <div className="flex items-center space-x-2">
                                <Switch id="airplane-mode" />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Label htmlFor="airplane-mode" className="underline text-xs ">Truncate Table
                                        </Label>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Truncate table before importing data</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="airplane-mode" />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Label htmlFor="airplane-mode" className="underline text-xs ">Auto Update
                                        </Label>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Auto update table after importing data(Be sure to map a primary key field!)</p>
                                    </TooltipContent>
                                </Tooltip>
                              
                            </div>
                            <Button variant={"default"} 
                                onClick={() => {
                                    setStep("import");
                                    setTab("import");
                                }}
                            >
                                Review & Import
                            </Button>
                        </div>
                        <Separator className="mt-2 mb-2"></Separator>
                        <ScrollArea>
                            <Table>
                                <TableHeader>
                                    <TableHead>File Column</TableHead>
                                    <TableHead>Table Column</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Id</TableCell>
                                        <TableCell>
                                            <Select
                                                value={table}
                                                onValueChange={(value) => {
                                                    setTable(value);
                                                }}
                                            >
                                                <SelectTrigger className="bg-card w-full">
                                                    <SelectValue className="w-full" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {columns.map((column, index) => (
                                                        <SelectItem value={column.name}>
                                                            {column.name}
                                                            <span className="text-muted-foreground text-xs">{column.comment}</span>

                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant={"ghost"} className="bg-card">
                                                <TrashIcon size={14}></TrashIcon>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </ScrollArea>

                    </div>

                </TabsContent>
                <TabsContent value="import">

                <div className="p-5 rounded-lg h-min  ">
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
