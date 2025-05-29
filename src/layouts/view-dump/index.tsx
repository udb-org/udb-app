import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { saveAndOpenConnection, testConnection } from "@/api/storage";
import { ConnectionConfig, IDataBaseTable } from "@/types/db";
import { Textarea } from "@/components/ui/textarea";
import { addDatabase } from "@/api/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { getView } from "@/store/tab-store";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";


export default function ViewDump(
    props: {
        viewKey: string;
    }
) {

    const [view, setView] = React.useState<any>(null);
    const [database, setDatabase] = React.useState<string>("");
    const [tables, setTables] = useState<IDataBaseTable[]>([]);
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [exportType, setExportType] = useState<"sd" | "d" | "s">("sd");
    const [outFolder, setOutFolder] = useState("");
    const [sessionId, setSessionId] = React.useState<string>(
        view?.sessionId || "",
    );

    useEffect(() => {
        //加载执行结果
        let _view = getView(props.viewKey);
        let _database = "";
        if (_view) {

            if (_view.params.database) {
                _database = _view.params.database;
            }
        }
        setDatabase(_database);
        setView(_view);
        window.api.invoke("db:getTables", _database).then((res) => {
            console.log("getTables", res);
            if (res.status === "success") {
                setTables(res.data.data as IDataBaseTable[]);
            }
        });
    }, [props.viewKey]);

    function start() {
        if (selectedTables.length == 0) {
            toast.error("Please select at least one table");
            return;
        }
        if (outFolder == "") {
            toast.error("Please select a folder to export");
            return;
        }
        window.api.invoke("db:dump", {
            database: database,
            tables: JSON.stringify(selectedTables),
            path: outFolder,
            dumpType: exportType,
        }).then((res: any) => {
            console.log("dump", res);
            if (res.status === "success") {
                setSessionId(res.id);
            }
        })


    }
    const [results, setResults] = useState<any[]>([]);
    const [progress, setProgress] = useState<number>(0);
    useEffect(() => {
        if (sessionId && sessionId !== "") {
            const timer = setInterval(() => {
                window.api.invoke("db:dump_result", sessionId).then((res: any) => {
                    console.log("dbResult", res);
                    if (res.error) {
                        toast.error(res.error);
                        setSessionId("");
                    } else if (res.status === "fail") {
                        toast.error(res.message);
                        setSessionId("");
                    } else {
                        if (res.status === "success") {

                            setSessionId("");
                            setProgress(100);
                            toast.success("Export success");
                        }
                        if (res.data.length > 0) {
                            const resResults = JSON.parse(res.data);
                            if (resResults.length > 0) {
                                setResults([...results, ...resResults]);
                                const last = resResults[resResults.length - 1] + "";
                                if (last.indexOf("%:") > 0) {
                                    const _progress = parseInt(last.split("%:")[0]);
                                    setProgress(_progress);
                                }
                            }
                        }

                    }
                });
            }, 60);
            return () => {
                clearInterval(timer);
            };
        }
    }, [sessionId,progress]);
    return (
        <div className="flex h-full w-full flex-col">
            <div className="text-sm font-bold p-3">Export Database</div>
            <Separator></Separator>
            <div className="p-2">
                Export the database to a file.
            </div>
            <div className="flex gap-5">
                <ScrollArea className="border h-[400px] min-w-[200px] rounded-lg p-5">
                    {tables.map((table, index) => (
                        <div className="flex items-center space-x-2 pb-2" key={index}>
                            <Checkbox
                                checked={selectedTables.includes(table.TABLE_NAME)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedTables([...selectedTables, table.TABLE_NAME]);
                                    } else {
                                        setSelectedTables(
                                            selectedTables.filter(
                                                (item) => item !== table.TABLE_NAME,
                                            ),
                                        );
                                    }
                                }}
                            />
                            <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {table.TABLE_NAME}
                            </label>
                        </div>
                    ))}
                </ScrollArea>
                <div className="border rounded-lg p-5">
                    <div className="flex items-center justify-between gap-2">
                        <Button
                            variant={"outline"}
                            className="bg-card"
                            onClick={() => {
                                setSelectedTables(tables.map((item) => item.TABLE_NAME));
                            }}
                        >
                            Select All
                        </Button>
                        <Button
                            variant={"outline"}
                            className="bg-card"
                            onClick={() => {
                                setSelectedTables(
                                    tables
                                        .filter(
                                            (item) => !selectedTables.includes(item.TABLE_NAME),
                                        )
                                        .map((item) => item.TABLE_NAME),
                                );
                            }}
                        >
                            Deselect All
                        </Button>
                    </div>
                    <div className="p-2 text-sm">
                        you have selected {selectedTables.length} tables
                    </div>
                    <div>
                        <Select
                            className="w-full"
                            value={exportType}
                            onValueChange={(value) => {
                                setExportType(value);
                            }}
                        >
                            <SelectTrigger className="bg-card w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sd">Dump Structure and Data</SelectItem>
                                <SelectItem value="d">Dump Data Only</SelectItem>
                                <SelectItem value="s">Dump Structure Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="p-2 text-sm">Export to a file</div>
                    <div>
                        <Button
                            variant={"outline"}
                            className="bg-card max-w-[200px] justify-end overflow-hidden text-ellipsis"
                            onClick={() => {
                                window.api.invoke("dialog:openFolder").then((res) => {
                                    if (res == null) {
                                        setOutFolder("");
                                    } else {
                                        setOutFolder(res + "/" + database + ".sql");
                                    }
                                });
                            }}
                        >
                            {outFolder == "" ? "Select Folder" : outFolder}
                        </Button>
                    </div>
                    {
                        sessionId !== "" && <div className="flex justify-end pt-5">
                            <Progress value={progress} className="w-full" />
                        </div>
                    }

                    <div className="flex justify-end pt-5">
                        <Button variant={"outline"} className="bg-card"
                            disabled={sessionId !== ""}
                            onClick={start}
                        >
                            Start Export
                        </Button>
                    </div>
                </div>
            </div>
        </div>

    );
}
