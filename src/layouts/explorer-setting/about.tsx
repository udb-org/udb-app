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
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
export function AboutSetting() {
    const {t}=useTranslation();
    return <div>
        <SettingTopic topic={t("settings.about.title")+ " UDB"} />
        {/* <SettingTitle title="Account" />
        <SettingDescription description="Current account: admin" /> */}
       <Button size={"sm"} variant={"link"} className="">
                    User Protocol
                </Button>
                <Button size={"sm"} variant={"link"} className="">
                    Privacy Policy
                </Button>
                <Button size={"sm"} variant={"link"} className="">
                    Open Source License
                </Button>
    </div>
}