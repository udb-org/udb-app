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
import { getView, saveView, saveViewValue } from "@/store/tab-store";
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
import { ScrollAreaScrollbar } from "@radix-ui/react-scroll-area";
import { useTranslation } from "react-i18next";
export default function ViewImport(
    props: {
        viewKey: string;
    }
) {
    const [view, setView] = React.useState<any>(null);
    const [database, setDatabase] = React.useState<string>("");
    const [table, setTable] = React.useState<string>("");
    const [path, setPath] = React.useState<string>("");
    const [step, setStep] = React.useState<string>("choose");
    const [tab, setTab] = React.useState<string>("choose");
    const [columns, setColumns] = React.useState<IDataBaseTableColumn[]>([]);
    const [mapStatus, setMapStatus] = React.useState<"ready" | "running" | "error">("ready");
    const [mapMessage, setMapMessage] = React.useState<string>("");
    const [isTruncate, setIsTruncate] = React.useState<boolean>(false);
    const [isAutoUpdate, setIsAutoUpdate] = React.useState<boolean>(true);

    const [importStatus, setImportStatus] = React.useState<"ready" | "running" | "success" | "error">("ready");
    const [importMessage, setImportMessage] = React.useState<string>("");
    const [importProgress, setImportProgress] = React.useState<number>(0);
    const [importId, setImportId] = React.useState<string>("");

    const { t } = useTranslation();

   
    useEffect(() => {
        //加载执行结果
        let _view = getView(props.viewKey);
        let _database = "";
        let _table = "";
       let _columns:IDataBaseTableColumn[]=[];
        
        if (_view) {
            if (_view.params.database) {
                _database = _view.params.database;
            }
            if (_view.params.table) {
                _table = _view.params.table;
            }
            _view.path&&setPath(_view.path);
            _view.step&&setStep(_view.step);
            _view.tab&&setTab(_view.tab);
            _view.isTruncate&&setIsTruncate(_view.isTruncate);
            _view.isAutoUpdate&&setIsAutoUpdate(_view.isAutoUpdate);
            _view.mapStatus&&setMapStatus(_view.mapStatus);
            _view.mapMessage&&setMapMessage(_view.mapMessage);
            _view.rows&&setRows(_view.rows);
            _view.columns&&setColumns(_view.columns);
            _view.importStatus&&setImportStatus(_view.importStatus);
            _view.importMessage&&setImportMessage(_view.importMessage);
            _view.importProgress&&setImportProgress(_view.importProgress);
            _view.importId&&setImportId(_view.importId);
            _columns=_view.columns||[];

        }
        if(_columns.length==0){
            window.api.invoke("db:getColumns", _table).then((res: IResult) => {
                if (res.status === 200) {
                    setColumns(res.data.rows as IDataBaseTableColumn[]);
                    saveViewValue(props.viewKey,"columns",res.data.rows);
                } else {
                    toast.error(res.message);
                }
            });
        }
        setTable(_table);
        setDatabase(_database);
        setView(_view);
      

    }, [props.viewKey]);
    const [rows, setRows] = React.useState<any[]>([{
        fileColIndex: 0,
        fileColName: "id",
        tableColIndex: 0,
        tableColName: "id"
    }]);
    //import_read_file_header_end
    useEffect(() => {
        const import_read_file_header_end = (res: IResult) => {
            if (res.status == 200) {
                setMapStatus("ready");
                setStep("map");
                setTab("map");
                saveViewValue(props.viewKey,"mapStatus","ready");
                saveViewValue(props.viewKey,"step","map");
                saveViewValue(props.viewKey,"tab","map");

                if (res.data.length > 0 && columns.length > 0) {
                    //判断是否存在同名字段
                    let _rows: any[] = [];
                    for (let i = 0; i < res.data.length; i++) {
                        const fileColName = res.data[i];
                        let row: any = {
                            fileColIndex: i,
                            fileColName: fileColName
                        };
                        for (let j = 0; j < columns.length; j++) {
                            let column = columns[j];
                            if (column.name.toLocaleLowerCase() == fileColName.toLocaleLowerCase()) {
                                row.tableColIndex = j;
                                row.tableColName = column.name;
                            }
                        }
                        _rows.push(row);
                    }
                    setRows(_rows);
                    saveViewValue(props.viewKey,"rows",_rows);

                }

            } else {
                toast.error(res.message);
                setMapStatus("error");
                setMapMessage(res.message);
                saveViewValue(props.viewKey,"mapStatus","error");
                saveViewValue(props.viewKey,"mapMessage",res.message);
            }
        }
        window.api.on("db:import_read_file_header_end", import_read_file_header_end);
        return () => {
            window.api.removeAllListeners("db:import_read_file_header_end");
        }
    }, [columns]);
    function startImport() {
        setImportStatus("running");
        setImportMessage("");
        setImportProgress(0);
        /**
         * table: string;
         * name: string;
         * type: string;
         * displayType?: string;
         * comment?: string;
         * isNullable?: boolean;
         * defaultValue?: string | number | boolean | null;
         * autoIncrement?: boolean;
         * length?: number;
         * scale?: number;
         * position?: number;
         * index:number;
         * head:string;
         * catalog: FieldTypeCategory;
         */
        let mapping: any[] = [];
        rows.forEach((row, i) => {
            const col = columns.find((col) => col.name == row.fileColName);
            if (col) {
                let item: any = {
                    ...col,
                    index: row.tableColIndex,
                    head: row.fileColName,
                };
                mapping.push(item);
            }

        });


        window.api.invoke("db:import", {
            database: database,
            table: table,
            path: path,
            isClear: isTruncate,
            isAutoUpdate: isAutoUpdate,
            mapping: mapping
        }).then((res: IResult) => {
            if (res.status == 800) {
                res.id && setImportId(res.id);
                setImportStatus("running");
                setImportMessage("running");
            } else {
                setImportStatus("error");
                setImportMessage(t("status." + res.status));
            }
        }).catch((err) => {
            setImportStatus("error");
            setImportMessage(t("status.500"));
        });

    }
    useEffect(() => {
        if (importStatus == "running" && importId != "") {
            const timer = setInterval(() => {

                window.api.invoke("db:import_result", importId).then((res: IResult) => {
                    if (res.status == 800) {
                        res.progress && setImportProgress(res.progress);
                    } else if (res.status == 200) {
                        setImportProgress(100);
                        setImportStatus("success");
                        setImportMessage(t("status.200"));
                        clearInterval(timer);
                    } else {
                        setImportStatus("error");
                       
                        clearInterval(timer);
                        if(res.status == 500){
                            setImportMessage(res.message||"Import failed");
                        }else{
                            setImportMessage(t("status." + res.status));
                        }
                    }
                });


            }, 100);
            return () => {

                clearInterval(timer);
            }
        }


    }, [importStatus, importId]);
    return (
        <div className="flex h-full w-full flex-col">
            <Tabs value={tab} onValueChange={(value) => {
                setTab(value);
                saveViewValue(props.viewKey,"tab",value);
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
                                        { name: "Files", extensions: ["csv", "xlsx", "json"] },

                                    ]).then((res) => {
                                        if (res) {
                                         setPath(res);
                                          saveViewValue(props.viewKey,"path",res);
                                     
                                        }
                                    });

                                }}
                            >
                                <FolderOpenIcon size={14}></FolderOpenIcon>

                            </Button>
                        </div>
                        <div className="flex justify-end pt-5">
                            <Button variant={"outline"}
                                disabled={mapStatus == "running"}
                                className="bg-card"
                                onClick={() => {
                                    setMapStatus("running");
                                    setMapMessage("");
                                    saveViewValue(props.viewKey,"mapStatus","running");
                                    saveViewValue(props.viewKey,"mapMessage","");
                                    window.api.send("db:import_read_file_header", {
                                        path: path
                                    })
                                }}
                            >
                                {mapStatus == "running" ? "Running..." : "Map to Table"}

                            </Button>
                        </div>
                        <div>
                            {mapStatus == "error" && <div className="text-red-500">{mapMessage}</div>}
                        </div>

                    </div>


                </TabsContent>
                <TabsContent value="map" className="h-full flex justify-center">

                    <div className="p-5 rounded-lg h-full flex flex-col">
                        <div className="flex justify-end gap-5">

                            <div className="flex items-center space-x-2">
                                <Switch id="airplane-mode" checked={isTruncate} onCheckedChange={(value) => {
                                    setIsTruncate(value);
                                    saveViewValue(props.viewKey,"isTruncate",value);
                                }}> </Switch>
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
                                <Switch id="airplane-mode" checked={isAutoUpdate} onCheckedChange={(value) => {
                                    setIsAutoUpdate(value);
                                    saveViewValue(props.viewKey,"isAutoUpdate",value);
                                }}></Switch>
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
                                    if (rows.length == 0) {
                                        toast.error("Please map data first!");
                                        return;
                                    }

                                    setStep("import");
                                    setTab("import");
                                    saveViewValue(props.viewKey,"step","import");
                                    saveViewValue(props.viewKey,"tab","import");
                                }}
                            >
                                Review & Import
                            </Button>
                        </div>
                        <Separator className="mt-2 mb-2"></Separator>
                        <ScrollArea className=" h-full">
                            {
                                //滚动条 竖
                            }
                            <ScrollAreaScrollbar />
                            <Table className=" ">
                                <TableHeader>
                                    <TableHead>File Column</TableHead>
                                    <TableHead>Table Column</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableHeader>
                                <TableBody>
                                    {
                                        rows.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row.fileColName}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={row.tableColName}
                                                        onValueChange={(value) => {
                                                            const _rows=rows.map((row, i) => {
                                                                if (index == i) {
                                                                    row.tableColName = value;
                                                                }
                                                                return row;
                                                            });
                                                            setRows(_rows);
                                                            saveViewValue(props.viewKey,"rows",_rows);
                                                        }}
                                                    >
                                                        <SelectTrigger className="bg-card w-full">
                                                            <SelectValue className="w-full" />
                                                            {/* {row.tableColName} */}
                                                            {/* <span className="text-muted-foreground text-xs">{row.comment}</span> */}
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {columns.map((column, index) => (
                                                                <SelectItem value={column.name}>
                                                                    {column.name}
                                                                    <span className="text-muted-foreground text-xs max-w-[100px] overflow-hidden overflow-ellipsis whitespace-nowrap">{column.comment}</span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant={"ghost"} className="bg-card">
                                                        <TrashIcon size={14}
                                                            onClick={() => {
                                                                const _rows=rows.filter((row, i) => {
                                                                    return index != i;
                                                                });
                                                                setRows(_rows);
                                                                saveViewValue(props.viewKey,"rows",_rows);
                                                            }}
                                                        ></TrashIcon>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }

                                </TableBody>
                            </Table>
                            <div className="h-[150px]">

                            </div>
                        </ScrollArea>


                    </div>

                </TabsContent>
                <TabsContent value="import" className="h-full flex justify-center ">
                    <div className="border p-5 rounded-lg h-min mt-5 ">
                        <div className="w-[250px] pb-5">
                            {
                                importStatus == "ready" && <>
                                    <div className="font-bold text-lg pb-2">You sure to import data?</div>
                                    <ul className="pl-5">
                                        {isTruncate && <li className="list-disc">This will clear the table data.</li>}
                                        {isAutoUpdate && <li className="list-disc">This will auto update the table after importing data.</li>}
                                    </ul>
                                </>
                            }
                            {
                                importStatus == "running" && <>
                                    <div className="font-bold text-lg pb-2">Importing...</div>
                                    <div className="text-sm">
                                        {importProgress}%
                                    </div>
                                </>
                            }
                            {
                                importStatus == "success" && <>
                                    <div className="font-bold text-lg pb-2">Import Success!</div>
                                    <div className="text-sm">
                                        {importMessage}
                                    </div>
                                </>
                            }
                            {
                                importStatus == "error" && <>
                                    <div className="font-bold text-lg pb-2 text-destructive">Import Failed!</div>
                                    <div className="text-sm text-destructive">
                                        {importMessage}
                                    </div>
                                </>
                            }

                        </div>
                        <div>
                            <Progress className="w-[250px]" value={importProgress} max={100}></Progress>
                        </div>
                        <div className="flex justify-end pt-5">
                            <Button variant={"outline"} className="bg-card"
                                disabled={importStatus == "running"}
                                onClick={() => {
                                    startImport();
                                }}
                            >
                                {importStatus == "running" ? "Running..." : "Import"}

                            </Button></div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
