import { cn } from "@/utils/tailwind";
import React, { useEffect, useState } from "react";
import { SetupHome } from "./home";
import { SetupTheme } from "./theme";
import { SetupLogin } from "./login";
import { SetupEnd } from "./end";
import { SetupAi } from "./ai";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function Setup() {
    const [steps, setSteps] = useState<number[]>([
        1, 2, 3, 4
    ]);
    const [current, setCurrent] = useState<number>(1);
    const [theme, setTheme] = useState<string>("light");
    const [aiConfig, setAiConfig] = useState<any>({});
    const [language, setLanguage] = useState<string>("en");
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    return <div className="h-screen w-screen flex flex-col">
        <div className="h-[100px] app-region">
        </div>
        {
            isLoading && <div className="h-screen w-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-neutral-300"></div>
            </div>
        }
        {
            !isLoading && <div className="flex-1 flex flex-col items-center justify-center">
                {
                    current == 1 && <SetupHome onNext={() => {
                        setCurrent(2);
                    }} />
                }
                {
                    current == 2 && <SetupTheme
                        theme={theme}
                        language={language}
                        onLanguageChange={(language) => {
                            setLanguage(language);
                        }}
                        onThemeChange={(theme) => {
                            setTheme(theme);
                        }}
                        onNext={() => {
                            setCurrent(3);
                        }}
                        onPrev={() => {
                            setCurrent(1);
                        }}

                    />
                }
                {
                    current == 3 && <SetupAi config={aiConfig}
                        onConfigChange={(key, value) => {
                            setAiConfig({
                                ...aiConfig,
                                [key]: value
                            });
                        }}
                        onNext={() => {
                            setCurrent(4);
                        }}
                        onPrev={() => {
                            setCurrent(2);
                        }} />
                }
                {
                    current == 4 && <SetupEnd onNext={() => {
                        //检查所有的设置是否都已经配置了，主要是模型
                        //如果没有配置，则提示用户去配置
                        console.log("aiConfig", aiConfig);
                        if ("models" in aiConfig) {
                            if (aiConfig.models.length == 0) {
                                toast.error(t("setup.error.configAiModels"));
                                return;
                            }
                        } else {
                            toast.error(t("setup.error.configAiModels"));
                            return;
                        }
                        if ("suggestionModelKey" in aiConfig) {
                            if (aiConfig.suggestionModelKey === "") {
                                toast.error(t("setup.error.suggestionModelKey"));
                                return;
                            }
                        } else {
                            toast.error(t("setup.error.suggestionModelKey"));
                            return;
                        }
                        if ("defaultModelKey" in aiConfig) {
                            if (aiConfig.defaultModelKey === "") {
                                toast.error("setup.error.defaultModelKey");
                                return;
                            }
                        } else {
                            toast.error("setup.error.defaultModelKey");
                            return;
                        }
                        setIsLoading(true);
                        window.api.invoke("storage:init", {
                            ...aiConfig,
                            language: language,
                            theme: theme
                        }).then(() => {
                            //设置完成,强制属性页面
                            window.location.reload();
                            
                        }).catch((e) => {
                            setIsLoading(false);
                            toast.error(e);
                        });
                    }}
                        onPrev={() => {
                            setCurrent(3);
                        }} />
                }
            </div>

        }


        <div className="h-[100px] flex justify-center gap-2">
            {
                steps.map((item, index) => {
                    return <div key={index} className={
                        cn("w-2 h-2 rounded-full bg-accent-foreground",
                            current == item && " w-10"
                        )
                    }></div>
                })
            }
        </div>
    </div>
}