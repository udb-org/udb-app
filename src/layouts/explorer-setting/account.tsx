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
export function AccountSetting(
    props:{
        config:any;  
        onConfigChange:(key:string,value:any)=>void;
    }
) {
    return <div>
        <SettingTopic topic="Account Settings" />
        <SettingTitle title="Account" />
        <SettingDescription description="Current account: admin" />
    </div>
}