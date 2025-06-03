import { setAppLanguage } from "@/api/language";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
export function SetupHome(
    props: {
        onNext?: () => void;
    }
) {
    const { t} = useTranslation();
  return <div>
   <div className="flex flex-col items-center justify-center">
   <div className="bg-card/50 border p-5 rounded-2xl" >
        <img className="w-20" src="./icons/logo.png"></img>
    </div>
   </div>
    <div className="text-lg font-bold text-center pt-5">
       {t("setup.welcome")}
    </div>
    <div className="flex flex-col items-center justify-center pt-10">
        <Button  onClick={
            () => {
                props.onNext?.();
            }
        }>
            Get Started
        </Button>
    </div>
  </div>
}