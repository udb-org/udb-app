import React from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SettingDescription, SettingTitle, SettingTopic } from "./common";
export function GeneralSetting(
    props:{
        config:any;
        onConfigChange:(key:string,value:any)=>void;
    }
) {
    return <div>
        <SettingTopic topic="General" />
        <SettingTitle title="Language" />
        <SettingDescription description="Select the language for the application." />
        <Select
            value={props.config.language}
            onValueChange={(value) => {
                props.onConfigChange("language", value);
            }}
        >
            <SelectTrigger>
                <SelectValue placeholder="Select a Language" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="Chinese(Simplified)">Chinese(Simplified)中文简体</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    </div>
}