import React, { useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Pen, PenIcon, TrashIcon } from "lucide-react";
import { SettingDescription, SettingTitle, SettingTopic } from "./common";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { AddModelSetting } from "./add-model";



export function AiSetting(   props:{
    config:any;
    onConfigChange:(key:string,value:any)=>void;
}) {
    const [models, setModels] = React.useState<any[]>([
    ]);

 
    useEffect(() => {
        const getModels=(models:any[])=>{
            console.log("getModels",models);
            // props.onConfigChange("models",models);
            setModels(models);
        }
        window.api.on("storage:getModelsing",getModels);

        window.api.send("storage:getModels");
        return () => {
            window.api.removeListener("storage:getModelsing",getModels);
        }
    }, [])


    return <div>
        <SettingTopic topic="AI Settings" />
        <SettingTitle title="Model Management" />
        <SettingDescription description="Configure the API key and secret key for the OpenAI API." />

        <div className="py-1">

            <AddModelSetting onSuccess={() => {

            }} onCancel={() => {

            }} />
        </div>
        <Table className="border-1 rounded text-sm">
            <TableHeader className="bg-muted">
                <TableRow>
                    <TableHead className="w-[100px]">Provider</TableHead>
                    <TableHead className="w-[100px]">Model</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {models.map((model, i) => (
                    <TableRow key={i}>
                        <TableCell className="font-medium">{model.provider}</TableCell>
                        <TableCell className="font-medium">{model.model}</TableCell>
                        <TableCell className="font-medium">


                            <Button variant={"ghost"} size={"sm"} className="h-[24px]"
                                onClick={()=>{
                                    window.api.send("storage:deleteModel",model.key);
                                }}
                            >
                                <TrashIcon size={12} ></TrashIcon>
                            </Button>

                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <SettingTitle title="Chat Default Model" />
        <SettingDescription description="Select the default model for the application." />
        <Select value={props.config.defaultModelKey} onValueChange={(value) => {
         
            console.log("onValueChange",value);
            props.onConfigChange("defaultModelKey",value);
        }}>
            <SelectTrigger size="sm" className="w-full bg-muted">
                <SelectValue placeholder="Select a Model" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {
                        models.map((model) => (
                            <SelectItem key={model.key} value={model.key}>{model.provider}:{model.model}</SelectItem>
                        ))
                    }

                </SelectGroup>
            </SelectContent>
        </Select>
        <SettingTitle title="Suggestions Model" />
        <SettingDescription description="Select the suggestions model for the application." />
        <Select value={props.config.suggestionModelKey} onValueChange={(value) => {
         
            console.log("onValueChange",value);
            props.onConfigChange("suggestionModelKey",value);
        }}>
            <SelectTrigger size="sm" className="w-full bg-muted">
                <SelectValue placeholder="Select a Model" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {
                        models.map((model) => (
                            <SelectItem key={model.key} value={model.key}>{model.provider}:{model.model}</SelectItem>
                        ))
                    }

                </SelectGroup>
            </SelectContent>
        </Select>
    </div>
}