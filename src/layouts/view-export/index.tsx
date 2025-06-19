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
import { IDataBaseTable, IResult } from "@/types/db";
import { toast } from "sonner";
import { setServers } from "dns";
import { Label } from "@/components/ui/label";
export default function ViewExport(
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
    const [status, setStatus] = useState<"ready" | "loading" | "success" | "failed">("ready");
    const [sessionId, setSessionId] = React.useState<string>(
        view?.sessionId || "",
    );
    const [message, setMessage] = useState<string>("");
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
        window.api.invoke("db:getTables", _database).then((res: IResult) => {

            if (res.status === 200) {
                setTables(res.data.rows as IDataBaseTable[]);
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
        setProgress(0);
        window.api.invoke("db:dump", {
            database: database,
            tables: JSON.stringify(selectedTables),
            path: outFolder,
            dumpType: exportType,
        }).then((res: any) => {
            console.log("dump", res);
            if (res.status === 800) {
                setSessionId(res.id);
                setStatus("loading");
            }else{
                setMessage(res.message||"Export failed");
                setStatus("failed");
            }
        }).catch((err: any) => {
            toast.error(err.message);
        
        });
    }
    function stop() {
        if (sessionId && sessionId !== "") {
            window.api.invoke("db:stop", sessionId).then((res: IResult) => {
                console.log("dbResult", res);
                if (res.status === 200) {
                    setSessionId("");
                    setProgress(0);
                    toast.success("Stop success");
                    setStatus("ready");
                } else {
                    toast.error(res.message);
                  
                }
            });
        } else {
            toast.error("Please select a session id");
        }
    }
    // const [results, setResults] = useState<any[]>([]);
    const [progress, setProgress] = useState<number>(0);
    useEffect(() => {
        if (sessionId && sessionId !== "") {
            const timer = setInterval(() => {
                window.api.invoke("db:dump_result", sessionId).then((res: IResult) => {
                    console.log("dbResult", res);
                    if (res.status === 200) {
                        setSessionId("");
                        setProgress(100);
                        toast.success("Export success");
                        setStatus("success");
                    } else if (res.status == 800) {
                        setProgress(res.progress || 0);
                    } else {
                        toast.error(res.message);
                        setSessionId("");
                        setMessage(res.message||"Export failed");
                        setStatus("failed");

                    }
                });
            }, 60);
            return () => {
                clearInterval(timer);
            };
        }
    }, [sessionId, progress]);
    return (
        <div className="flex h-full w-full flex-col">
            <div className="text-sm font-bold p-3">Export Database</div>
            <Separator></Separator>
            <div className="p-2">
                Export the database to a file.
            </div>
            {
                status == "ready" && <div className="flex-1 flex gap-5 ">
                    <ScrollArea className="border h-[400px] min-w-[200px] rounded-lg p-5">
                        {tables.map((table, index) => (
                            <div className="flex items-center space-x-2 pb-2" key={index}>
                                <Checkbox
                                    checked={selectedTables.includes(table.name)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedTables([...selectedTables, table.name]);
                                        } else {
                                            setSelectedTables(
                                                selectedTables.filter(
                                                    (item) => item !== table.name,
                                                ),
                                            );
                                        }
                                    }}
                                />
                                <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {table.name}<br />
                                    <span className="text-muted-foreground text-xs">{table.comment}</span>
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
                                    setSelectedTables(tables.map((item) => item.name));
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
                                                (item) => !selectedTables.includes(item.name),
                                            )
                                            .map((item) => item.name),
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

                                value={exportType}
                                onValueChange={(value) => {
                                    setExportType(value);
                                }}
                            >
                                <SelectTrigger className="bg-card w-full">
                                    <SelectValue className="w-full" />
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
            }
            {
                status == "loading" && <div className="flex-1 flex gap-5  justify-center items-center">
                    <Progress value={10} className="w-[80%]" />
                    <Button variant={"outline"} className="bg-card"
                        onClick={stop}
                    >
                        Stop
                    </Button>
                </div>

            }
            {
                status == "success" && <div className="flex-1 flex gap-5  justify-center items-center">
                   <div className="space-y-5">
                   <Label>Export success</Label>
                    <Button variant={"outline"} className="bg-card"
                     onClick={()=>{
                        window.api.send("platfrom:open",{path:outFolder});
                     }}
                    >
                        Open File
                    </Button>
                    <Button variant={"outline"} className="bg-card"
                        onClick={()=>{
                            setStatus("ready");
                            setProgress(0);
                            setSessionId("");
                        }}
                    >
                        Again Export
                    </Button>
                    </div>
                </div>
            }
            {
                status == "failed" && <div className="flex-1 flex gap-5  justify-center items-center">
                   <div className="space-y-5">
                   <Label>Export Failed</Label>
                   <Label>{message}</Label>

                    <Button variant={"outline"} className="bg-card"
                         onClick={start}
                    >
                        Retry
                    </Button>
                    <Button variant={"outline"} className="bg-card"
                        onClick={()=>{
                            setStatus("ready");
                            setProgress(0);
                            setSessionId("");
                        }}
                    >
                        Again Export
                    </Button>
                    </div>
                </div>
            }
        </div>
    );
}
