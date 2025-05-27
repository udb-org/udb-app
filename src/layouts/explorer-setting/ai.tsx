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

import { Pen, PenIcon, TrashIcon } from "lucide-react";
import { SettingDescription, SettingTitle, SettingTopic } from "./common";
import { Button } from "@/components/ui/button";

import { AddModelSetting } from "./add-model";
import { useTranslation } from "react-i18next";

export function AiSetting(   props:{
    config:any;
    onConfigChange:(key:string,value:any)=>void;
}) {
    const models=props.config.models||[];
    const {t}=useTranslation();

    return <div>
        <SettingTopic topic={
            t("settings.ai.title")
        } />
        <SettingTitle title={
            t("settings.ai.subtitle")
        } />
        <SettingDescription description={
            t("settings.ai.desc")
        } />
        <div className="py-1">
            <AddModelSetting onSuccess={(model) => {
                console.log("onSuccess",model);
                let _models = [...models];
                _models.push(model);
                // setModels(_models);
                props.onConfigChange("models",_models);
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
        <SettingTitle title={t("settings.ai.chat.title")} />
        <SettingDescription description={t("settings.ai.chat.desc")} />
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
        <SettingTitle title={
            t("settings.ai.suggestion.title")
        } />
        <SettingDescription description={
            t("settings.ai.suggestion.desc")
        } />
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