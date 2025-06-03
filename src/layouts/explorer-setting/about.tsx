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
import { openView } from "@/api/view";
import { ViewType } from "@/types/view";
export function AboutSetting() {
    const {t}=useTranslation();
    return <div>
        <SettingTopic topic={t("settings.about.title")+ " UDB"} />
        {/* <SettingTitle title="Account" />
        <SettingDescription description="Current account: admin" /> */}
       <Button size={"sm"} variant={"link"} className="block"
                    onClick={()=>{
                        openView({
                            type: ViewType.UserProtocal,
                            params: {},
                            path: [],
                        });
                    }}
       >
                    User Protocol
                </Button>
                <Button size={"sm"} variant={"link"} className="block"
                    onClick={()=>{
                        openView({
                            type: ViewType.PrivacyPolicy,
                            params: {},
                            path: [],
                        });
                    }}
                >
                    Privacy Policy
                </Button>
                <Button size={"sm"} variant={"link"} className="block"
                    onClick={()=>{
                        openView({
                            type: ViewType.OpenSource,
                            params: {},
                            path: [],
                        });
                    }}
                >
                    Open Source License
                </Button>
    </div>
}