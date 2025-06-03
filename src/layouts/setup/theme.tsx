import { setAppLanguage } from "@/api/language";
import { updateDocumentTheme } from "@/api/theme";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import langs from "@/localization/langs";
import { cn } from "@/utils/tailwind";
import React from "react";
import { useTranslation } from "react-i18next";
export function SetupTheme(
    props: {
        onNext?: () => void;
        onPrev?: () => void;
        config: any;
        onConfigChange: (key: string, value: any) => void;
    }
) {
    const { t, i18n } = useTranslation();
    return <div>
        <div className="text-2xl font-bold text-center pt-5">
            {t("setup.theme.title")}
        </div>
        <div className="text-lg font-bold text-center pt-1 pb-5 text-muted-foreground">
            {t("setup.theme.subtitle")}
        </div>
        <div className="flex gap-5">
            <div className={
                cn("bg-accent p-5 rounded-2xl ",
                    props.config["app.theme"] == "light" && " outline-2"
                )
            }
                onClick={() => {
                    props.onConfigChange("app.theme", "light");
                    window.api.invoke("app:setTheme", "light").then((theme) => {
                        updateDocumentTheme(theme == "dark");
                    });
                }}
            >
                <div className="bg-gray-300 w-[200px] h-[140px] rounded-2xl pt-[20px] pl-[20px] shadow-2xl">
                    <div className=" w-[180px] h-[120px] rounded-tl-lg overflow-hidden">
                        <div className="h-[20px] bg-gray-200 flex justify-end pt-2 gap-2">
                            <div className="h-[5px] w-[30px] rounded-2xl bg-neutral-300"></div>
                            <div className="h-[5px] w-[40px] rounded-2xl bg-neutral-400"></div>
                        </div>
                        <div className="flex h-[100px]">
                            <div className="w-[50px] bg-gray-200 p-[5px] space-y-2">
                                <div className="h-[6px] rounded-2xl bg-gray-300"></div>
                                <div className="h-[6px] rounded-2xl bg-gray-300"></div>
                                <div className="h-[6px] rounded-2xl bg-gray-300"></div>
                            </div>
                            <div className="flex-1 bg-gray-50 space-y-3 p-2">
                                <div className="flex gap-1">
                                    <div className="flex-2 h-[4px] rounded-2xl bg-gray-600"></div>
                                    <div className="flex-2 h-[4px] rounded-2xl bg-amber-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-indigo-600"></div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-2 h-[4px] rounded-2xl bg-purple-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-indigo-600"></div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-1 h-[4px] rounded-2xl bg-violet-600"></div>
                                    <div className="flex-2 h-[4px] rounded-2xl bg-emerald-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-600"></div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-500"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-500"></div>
                                    <div className="flex-3 h-[4px] rounded-2xl bg-neutral-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-lg font-bold text-center pt-5">
                    {t("setup.theme.light")}
                </div>
            </div>
            <div className={
                cn("bg-accent p-5 rounded-2xl ",
                    props.config["app.theme"] == "dark" && " outline-2"
                )
            }
                onClick={() => {
                    props.onConfigChange("app.theme", "dark");
                    window.api.invoke("app:setTheme", "dark").then((theme) => {
                        updateDocumentTheme(theme == "dark");
                    });
                }}
            >
                <div className="bg-gray-700 w-[200px] h-[140px] rounded-2xl pt-[20px] pl-[20px] shadow-2xl">
                    <div className=" w-[180px] h-[120px] rounded-tl-lg overflow-hidden">
                        <div className="h-[20px] bg-gray-800 flex justify-end pt-2 gap-2">
                            <div className="h-[5px] w-[30px] rounded-2xl bg-neutral-600"></div>
                            <div className="h-[5px] w-[40px] rounded-2xl bg-neutral-500"></div>
                        </div>
                        <div className="flex h-[100px]">
                            <div className="w-[50px] bg-gray-800 p-[5px] space-y-2">
                                <div className="h-[6px] rounded-2xl bg-gray-600"></div>
                                <div className="h-[6px] rounded-2xl bg-gray-600"></div>
                                <div className="h-[6px] rounded-2xl bg-gray-600"></div>
                            </div>
                            <div className="flex-1 bg-gray-700 space-y-3 p-2">
                                <div className="flex gap-1">
                                    <div className="flex-2 h-[4px] rounded-2xl bg-gray-600"></div>
                                    <div className="flex-2 h-[4px] rounded-2xl bg-amber-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-indigo-600"></div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-2 h-[4px] rounded-2xl bg-purple-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-indigo-600"></div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-1 h-[4px] rounded-2xl bg-violet-600"></div>
                                    <div className="flex-2 h-[4px] rounded-2xl bg-emerald-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-600"></div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-500"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-500"></div>
                                    <div className="flex-3 h-[4px] rounded-2xl bg-neutral-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-lg font-bold text-center pt-5">
                    {t("setup.theme.dark")}
                </div>
            </div>
            <div className={
                cn("bg-accent p-5 rounded-2xl ",
                    props.config["app.theme"] == "system" && " outline-2"
                )
            }
                onClick={() => {
                    props.onConfigChange("app.theme", "system");
                    window.api.invoke("app:setTheme", "system").then((theme) => {
                        updateDocumentTheme(theme == "dark");
                    });
                }}
            >
                <div className="bg-gray-400 w-[200px] h-[140px] rounded-2xl pt-[20px] pl-[20px] shadow-2xl">
                    <div className=" w-[180px] h-[120px] rounded-tl-lg overflow-hidden">
                        <div className="h-[20px] bg-gray-300 flex justify-end pt-2 gap-2">
                            <div className="h-[5px] w-[30px] rounded-2xl bg-neutral-600"></div>
                            <div className="h-[5px] w-[40px] rounded-2xl bg-neutral-500"></div>
                        </div>
                        <div className="flex h-[100px]">
                            <div className="w-[50px] bg-gray-300 p-[5px] space-y-2">
                                <div className="h-[6px] rounded-2xl bg-gray-600"></div>
                                <div className="h-[6px] rounded-2xl bg-gray-600"></div>
                                <div className="h-[6px] rounded-2xl bg-gray-600"></div>
                            </div>
                            <div className="flex-1 bg-gray-700 space-y-3 p-2">
                                <div className="flex gap-1">
                                    <div className="flex-2 h-[4px] rounded-2xl bg-gray-600"></div>
                                    <div className="flex-2 h-[4px] rounded-2xl bg-amber-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-indigo-600"></div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-2 h-[4px] rounded-2xl bg-purple-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-indigo-600"></div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-1 h-[4px] rounded-2xl bg-violet-600"></div>
                                    <div className="flex-2 h-[4px] rounded-2xl bg-emerald-600"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-600"></div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-500"></div>
                                    <div className="flex-1 h-[4px] rounded-2xl bg-neutral-500"></div>
                                    <div className="flex-3 h-[4px] rounded-2xl bg-neutral-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-lg font-bold text-center pt-5">
                    {t("setup.theme.system")}
                </div>
            </div>
        </div>
        <div className="text-lg font-bold text-center pt-5">
            {t("setup.theme.language")}
        </div>
        <div className="pt-2">
            <Select value={props.config["app.language"]} onValueChange={(value) => {
                props.onConfigChange("app.language", value);
                setAppLanguage(value, i18n);
            }}>
                <SelectTrigger size="sm" className="w-full bg-muted">
                    <SelectValue placeholder="Select a Language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {
                            langs.map((lang) => {
                                return <SelectItem value={lang.key} key={lang.key}>{lang.prefix} {lang.nativeName}</SelectItem>
                            })
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div className="flex  items-center justify-center pt-8 gap-5" >
            <div>
                <Button variant={"outline"} onClick={
                    () => {
                        props.onPrev?.();
                    }
                }>
                    {t("setup.button.previous")}
                </Button>
            </div>
            <div>
                <Button onClick={
                    () => {
                        props.onNext?.();
                    }
                }>
                    {t("setup.button.continue")}
                </Button>
            </div>
        </div>
    </div>
}