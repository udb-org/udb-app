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
import { useTranslation } from "react-i18next";
export function AccountSetting(
    props:{
        config:any;  
        onConfigChange:(key:string,value:any)=>void;
    }
) {
    const {t}=useTranslation();
    return <div>
        <SettingTopic topic={t("settings.account.title")} />
        <SettingTitle title={t("settings.account.subtitle")} />
        <SettingDescription description="Current account: admin" />
    </div>
}