import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { AddModelSetting } from "../explorer-setting/add-model";
import { AiSetting } from "../explorer-setting/ai";
import { useTranslation } from "react-i18next";
export function SetupAi(
    props: {
        config: any;
        onConfigChange: (key: string, value: any) => void;
        onNext?: () => void;
        onPrev?: () => void;
    }
) {
    const {t}=useTranslation();
    return <div className="space-y-5 w-[400px] bg-card p-5 rounded-md shadow-lg">
      
        <AiSetting config={props.config} onConfigChange={(key, value) => {
            props.onConfigChange(key, value);
        }} />
        <div className="flex gap-2 items-center justify-center">
            <Button variant={"outline"} onClick={
                () => {
                    props.onPrev?.();
                }
            }>
                {t("setup.button.previous")}
            </Button>
            <Button onClick={
                () => {
                    props.onNext?.();
                }
            }>
                {t("setup.button.continue")}
            </Button>
        </div>

    </div>
}