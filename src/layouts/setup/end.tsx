import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
export function SetupEnd(
    props: {
        onNext?: () => void;
        onPrev?: () => void;
    }
) {
    const { t } = useTranslation();
    return <div className="space-y-5 w-[200px]">

        <div className="flex gap-2 items-center justify-center">
            <Button variant={"outline"} onClick={
                () => {
                    props.onPrev?.();
                }
            }>
                {t("setup.button.previous")}
            </Button>
           
       </div>
       <div className="flex gap-2 items-center justify-center">
           
            <Button size={"lg"} onClick={
                () => {
                    props.onNext?.();
                }
            }>
                {t("setup.button.start")}
            
            </Button>
       </div>
    </div>
}