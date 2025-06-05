import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiStore } from "@/store/ai-store";
import { getView, useTabStore } from "@/store/tab-store";
import { AiAgent, AiMode } from "@/types/ai";
import { ViewType } from "@/types/view";
import { cn } from "@/utils/tailwind";
import { SiIcon } from "@icons-pack/react-simple-icons";
import {
  BotIcon,
  MessageCirclePlusIcon,
  SendIcon,
  SmileIcon,
  SmilePlusIcon,
  UserIcon,
  XIcon
} from "lucide-react";
import OpenAI from "openai";
import React, { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ContextSelect } from "./context-select";
import { Message } from "./message";
import { ModelSelect } from "./model-select";
import { AgentSelect } from "./agent-select";
import { useTranslation } from "react-i18next";
import { editor } from "monaco-editor";
export function AssistantPanel() {
  const{t}=useTranslation();
  const [focused, setFocused] = React.useState<boolean>(false);
  const [input, setInput] = React.useState<string>("");
  const [messages, setMessages] = React.useState<
    OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  >([]);
  const [tempMessage, setTempMessage] =
    React.useState<OpenAI.Chat.Completions.ChatCompletionMessageParam | null>(
      null,
    );
  function handleSend(text?: string) {
    if (thinking) {
      toast.error("Thinking...");
      return;
    }
    let _input: string = "";
    if (text) {
      _input = text;
    } else {
      _input = input;
    }
    if (_input.length > 0) {
      setThinking(true);
      setTempMessage({
        role: "assistant",
        content: "",
      });
      setMessages([
        ...messages,
        {
          role: "user",
          content: _input,
        },
      ]);
      setInput("");
      //上下文
      const context = getContext();
      window.api.send("ai:ask", {
        input: _input,
        context: context?context.context:"",
        model: model,
        agent: agent==undefined?null:agent.name,
      });
      requestIdleCallback(() => {
        //滚动到底部
        if (historyRef.current) {
          historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
      });
    }
  }
  const tab = useTabStore((state: any) => state.tab);
  function getContext() :{
    type: string;
    context: string;
  }|null{
    if (tab === null) {
      return null;
    }
    const view = getView(tab.name);
    if (view == null) {
      return null;
    }
    if (contextType === "default") {
      //获取当前展示的tab,从store中获取
      const viewType = view.type;
      if (viewType === ViewType.Sql) {
        const sql = view.params.sql;
        if (sql.length > 500) {
          return {
            type:viewType,
            context: sql.substring(0, 500) + "...",
          };
        }
        return {
          type:viewType,
          context: sql,
        }
      } else if (viewType === ViewType.Table) {
        const table = view.params.table;
        return {
          type:viewType,
          context: table,
        };
      }
    } else if (contextType === "none") {
      return null;
    } else if (contextType === "all") {
      return null;
    }
    return null;
  }
  useEffect(() => {
    let context:string|null=null;
    const ai_asking = (params: { content: string; finished: boolean,status?:number }) => {
      if (params.status && params.status !== 200){
        // toast.error(params.content);
        params.content=t("status."+params.status)+"\n";
      }
   
      if (params.finished) {
    
        setThinking(false);
        setMessages([...messages, {
          role: "assistant",
          content: context,
        }]);
        setTempMessage(null);
        context=null;
      } else {
      
        if (context) {
             console.log("ai_asking", params);
             context=context + params.content;
          setTempMessage({
            role: "assistant",
            content: context,
          });
        } else {
          context=params.content;
          setTempMessage({
            role: "assistant",
            content: params.content,
          });
        }
      }
      //滚动到底部
      requestIdleCallback(() => {
        //滚动到底部
        if (historyRef.current) {
          historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
      });
    };
    window.api.on("ai:asking", ai_asking);
    return () => {
      window.api.removeAllListeners("ai:asking");
    };
  }, [messages]);//messages, tempMessage
  const historyRef = React.useRef<HTMLDivElement>(null);
  //思考中
  const [thinking, setThinking] = React.useState<boolean>(false);
  const [contextType, setContextType] = React.useState<string>("default");
  const [agent, setAgent] = React.useState<AiAgent | undefined>(
    {
      name: "Sql Agent",
      isBuiltIn: true,
      prompt: "你是一个数据库助手，根据用户的输入，生成对应的SQL语句。你可以使用工具函数来查询数据库中的信息。输出内容尽量简洁。sql语句必须使用代码块输出。如果需要绘制图表,请使用js代码块输出。",
      servers: [
        {
          name: "Sql Server",
        }
      ]
    }
  );
  const { model, setModel } = useAiStore();
  return (
    <div className="flex h-full w-full flex-col text-sm">
      <div className="flex flex-shrink-0 items-center px-2 pt-2 text-sm font-bold">
        <div className="text-sm font-bold">UDB</div>
        <div className="flex-1"></div>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="m-[0px] h-[28px] w-[28px]"
          onClick={() => {
            window.api.send("ai:clearHistory");
            setMessages([]);
          }}
        >
          <MessageCirclePlusIcon size={14}></MessageCirclePlusIcon>
        </Button>
      </div>


      <div
        ref={historyRef}
        className="w-full flex-1 overflow-auto select-text"
        style={{
          scrollbarWidth: "none",
        }}
      >
        <div className="space-y-5 px-3 pb-10">
          {messages.map((item, index) => (
            <div key={index} className="">
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-bold",
                  item.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {item.role === "user" ? (
                  <SmilePlusIcon size={14} />
                ) : (
                  <img src="./icons/logo.png" width={18} height={18} />
                )}
                {item.role === "user" ? "Me" : "Udb"}
              </div>
              <div className="flex">
                <div
                  className={cn(
                    "",
                    item.role === "user" ? "w-[50px] flex-shrink-0" : "",
                  )}
                ></div>
                <div
                  className={cn(
                    "box-content flex-1 overflow-visible rounded p-2",
                    item.role === "user" ? "bg-background" : "",
                  )}
                >
                  <Message message={item} onInsert={(text)=>{
                    const context = getContext();
                    if(context){
                      if(context.type === ViewType.Sql){
                        window.api.send("ai:mergeSql",{
                          input:text,
                          model:model,
                          context:getContext(),
                          prompt:t("ai.prompt.mergesql"),
                          original:t("ai.prompt.mergesql.original"),
                          newly:t("ai.prompt.mergesql.newly"),
                        });
                      }else if(context.type === ViewType.Table){
                        window.api.send("ai:mergeTable",text);

                      }

                    }
                 
                  }}></Message>
                </div>
              </div>
            </div>
          ))}
          {tempMessage && (
            <div className="">
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-bold",
                  "justify-start",
                )}
              >
               <img src="./icons/logo.png" width={18} height={18} />
                Udb
              </div>
              <div className="flex">
                <div className={cn("")}></div>
                <div
                  className={cn(
                    "box-content flex-1 overflow-auto rounded p-2",
                  )}
                >
                  <Message message={tempMessage}></Message>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className={cn(
          "mx-2 rounded-lg border-1 border-primary/50 p-[4px] pb-2 mb-2",
          {
            "shadow-lg": focused,
          },
        )}
      >
        <div>
          {
            agent &&
            <div className="flex items-center text-xs bg-background  rounded-lg p-1">
              <div className="rounded-full bg-card p-1 mr-1">
                <BotIcon size={14} />
              </div>
              <div>@
              </div>
              <div>
                {agent.name}
              </div>
              <div className="flex-1"></div>
              <Button className="p-0 m-0 h-auto w-auto" variant={"ghost"} size={"icon"}
                onClick={() => {
                  setAgent(undefined);
                }}
              >
                <XIcon size={14} />
              </Button>
            </div>
          }
        </div>
        <Textarea
          value={input}
          className="max-h-[200px] min-h-[40px] resize-none overflow-auto border-none p-2 text-sm shadow-none outline-0 focus-visible:border-0 focus-visible:ring-0"
          style={{
            scrollbarWidth: "none",
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
          }}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              if (!e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }
          }}
        />
        <div className="flex h-[32px] items-center  gap-1">
          <AgentSelect
            value={agent}
            onChange={(value) => {
              setAgent(value);
            }}
          />
          {/* <ContextSelect
            value={contextType}
            onChange={(value) => {
              setContextType(value);
            }}
          /> */}
          <div className="flex-1"></div>
          <ModelSelect
            onSelect={(model) => {
              setModel(model);
            }}
          />
          <Button
            variant={"ghost"}
            size={"icon"}
            className="m-[0px] h-[20px] w-[20px] shrink-0 items-center justify-center"
            onClick={() => {
              handleSend();
            }}
          >
            <SendIcon size={12}></SendIcon>
          </Button>
        </div>
      </div>



    </div>
  );
}
