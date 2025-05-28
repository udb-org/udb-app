import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/tailwind";
import React, { useEffect, useState } from "react";
import langs from "@/localization/langs";
import { useTranslation } from "react-i18next";
import { setAppLanguage } from "@/api/language";
import { SettingDescription, SettingTitle, SettingTopic } from "./common";
import { updateDocumentTheme } from "@/api/theme";
export function SettingTheme(
    props: {
        onNext?: () => void;
        onPrev?: () => void;
        config: any;
        onConfigChange: (key: string, value: any) => void;
    }
) {
    const { t, i18n } = useTranslation();

    return <div>
        {/* <SettingTopic topic={t("setup.theme.title")} /> */}
        <SettingTitle title={t("setup.theme.title")} />
       
        <div className="flex gap-2" >
            <div className={
                cn("bg-accent p-2 rounded-2xl ",
                    props.config["app.theme"] == "light" && " outline-2"
                )
            }
                onClick={() => {
                    props.onConfigChange("app.theme", "light");
                    updateDocumentTheme(false);
                }}

            >
                <div className="bg-gray-300 w-[120px] h-[80px] rounded-2xl pt-[10px] pl-[10px] shadow-xl">
                    <div className="w-[100px] h-[60px] rounded-tl overflow-hidden">
                        <div className="h-[12px] bg-gray-200 flex justify-end pt-1 gap-1">
                            <div className="h-[3px] w-[18px] rounded-2xl bg-neutral-300"></div>
                            <div className="h-[3px] w-[24px] rounded-2xl bg-neutral-400"></div>
                        </div>
                        <div className="flex h-[48px]">
                            <div className="w-[30px] bg-gray-200 p-1 space-y-1">
                                <div className="h-[4px] rounded-2xl bg-gray-300"></div>
                                <div className="h-[4px] rounded-2xl bg-gray-300"></div>
                                <div className="h-[4px] rounded-2xl bg-gray-300"></div>
                            </div>
                            <div className="flex-1 bg-gray-50 space-y-2 p-1">
                                <div className="flex gap-0.5">
                                    <div className="flex-2 h-[2px] rounded-2xl bg-gray-600"></div>
                                    <div className="flex-2 h-[2px] rounded-2xl bg-amber-600"></div>
                                    <div className="flex-1 h-[2px] rounded-2xl bg-indigo-600"></div>
                                </div>
                                <div className="flex gap-0.5">
                                    <div className="flex-2 h-[2px] rounded-2xl bg-purple-600"></div>
                                    <div className="flex-1 h-[2px] rounded-2xl bg-neutral-600"></div>
                                    <div className="flex-1 h-[2px] rounded-2xl bg-indigo-600"></div>
                                </div>
                                <div className="flex gap-0.5">
                                    <div className="flex-1 h-[2px] rounded-2xl bg-violet-600"></div>
                                    <div className="flex-2 h-[2px] rounded-2xl bg-emerald-600"></div>
                                    <div className="flex-1 h-[2px] rounded-2xl bg-neutral-600"></div>
                                </div>
                                <div className="flex gap-0.5">
                                    <div className="flex-1 h-[2px] rounded-2xl bg-neutral-500"></div>
                                    <div className="flex-1 h-[2px] rounded-2xl bg-neutral-500"></div>
                                    <div className="flex-3 h-[2px] rounded-2xl bg-neutral-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-sm font-bold text-center pt-2">
                    {t("setup.theme.light")}
                </div>
            </div>

            <div className={
                cn("bg-accent p-2 rounded-2xl ",
                    props.config["app.theme"] == "dark" && " outline-2"
                )
            }
                onClick={() => {
                    props.onConfigChange("app.theme", "dark");
                    updateDocumentTheme(true);
                }}

            >
                <div className="bg-gray-700 w-[120px] h-[80px] rounded-2xl pt-[10px] pl-[10px] shadow-xl">
                    <div className="w-[100px] h-[60px] rounded-tl overflow-hidden">
                        <div className="h-[12px] bg-gray-800 flex justify-end pt-1 gap-1">
                            <div className="h-[3px] w-[18px] rounded-2xl bg-neutral-600"></div>
                            <div className="h-[3px] w-[24px] rounded-2xl bg-neutral-500"></div>
                        </div>
                        <div className="flex h-[48px]">
                            <div className="w-[30px] bg-gray-800 p-1 space-y-1">
                                <div className="h-[4px] rounded-2xl bg-gray-600"></div>
                                <div className="h-[4px] rounded-2xl bg-gray-600"></div>
                                <div className="h-[4px] rounded-2xl bg-gray-600"></div>
                            </div>
                            <div className="flex-1 bg-gray-700 space-y-2 p-1">
                                <div className="flex gap-0.5">
                                    <div className="flex-2 h-[2px] rounded-2xl bg-gray-600"></div>
                                    <div className="flex-2 h-[2px] rounded-2xl bg-amber-600"></div>
                                    <div className="flex-1 h-[2px] rounded-2xl bg-indigo-600"></div>
                                </div>
                                <div className="flex gap-0.5">
                                    <div className="flex-2 h-[2px] rounded-2xl bg-purple-600"></div>
                                    <div className="flex-1 h-[2px] rounded-2xl bg-neutral-600"></div>
                                    <div className="flex-1 h-[2px] rounded-2xl bg-indigo-600"></div>
                                </div>
                                <div className="flex gap-0.5">
                                    <div className="flex-1 h-[2px] rounded-2xl bg-violet-600"></div>
                                    <div className="flex-2 h-[2px] rounded-2xl bg-emerald-600"></div>
                                    <div className="flex-1 h-[2px] rounded-2xl bg-neutral-600"></div>
                                </div>
                                <div className="flex gap-0.5">
                                    <div className="flex-1 h-[2px] rounded-2xl bg-neutral-500"></div>
                                    <div className="flex-1 h-[2px] rounded-2xl bg-neutral-500"></div>
                                    <div className="flex-3 h-[2px] rounded-2xl bg-neutral-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-sm font-bold text-center pt-2">
                    {t("setup.theme.dark")}
                </div>
            </div>





        </div>


    </div>
}