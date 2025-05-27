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
export function AboutSetting() {
    return <div>
        <SettingTopic topic="About UDB" />
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