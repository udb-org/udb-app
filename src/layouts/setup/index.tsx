import { cn } from "@/utils/tailwind";
import React, {  useState } from "react";
import { SetupHome } from "./home";
import { SetupTheme } from "./theme";
import { SetupEnd } from "./end";
import { SetupAi } from "./ai";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { configTemplate } from "@/services/config-template";
export function Setup() {
    const [steps, setSteps] = useState<number[]>([
        1, 2, 3, 4
    ]);
    const [current, setCurrent] = useState<number>(1);
    const [config, setConfig] = useState<any>(
        configTemplate
    );
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
                        config={config}
                        onConfigChange={(key, value) => {
                            setConfig({
                                ...config,
                                [key]: value
                            });
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
                    current == 3 && <SetupAi config={config}
                        onConfigChange={(key, value) => {
                            setConfig({
                                ...config,
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
                        console.log("config", config);
                        if (config["ai.models"].length == 0) {
                            toast.error(t("setup.error.configAiModels"));
                            return;
                        }
                        if (config["ai.suggestion.model"] === "") {
                            toast.error(t("setup.error.suggestionModelKey"));
                            return;
                        }
                        if (config["ai.chat.model"] === "") {
                            toast.error("setup.error.defaultModelKey");
                            return;
                        }
                        setIsLoading(true);
                        window.api.invoke("storage:init", {
                            ...config
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