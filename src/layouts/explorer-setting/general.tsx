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
import { setAppLanguage, updateAppLanguage } from "@/api/language";
export function GeneralSetting(
    props:{
        config:any;
        onConfigChange:(key:string,value:any)=>void;
    }
) {
    const {t,i18n}=useTranslation();
    return <div>
        <SettingTitle title={t("settings.base.language")} />
        <SettingDescription description={t("setup.theme.language")} />
        <Select
            value={props.config["app.language"]}
            onValueChange={(value) => {
                props.onConfigChange("app.language", value);
                setAppLanguage(value, i18n);
            }}
        >
            <SelectTrigger>
                <SelectValue  />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="zh">Chinese(Simplified)中文简体</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    </div>
}