import React, { useEffect, useMemo } from "react";
import OpenAI from "openai";
import { Button } from "@/components/ui/button";
import {
  MessageCirclePlusIcon,
  MoreHorizontalIcon,
  SendIcon,
  StopCircleIcon,
  UserIcon,
} from "lucide-react";
import VirtualList from "@/components/virtual-scroll";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/tailwind";
import { ModelSelect } from "./model-select";
import { Textarea } from "@/components/ui/textarea";
import { SiIcon } from "@icons-pack/react-simple-icons";
import { Message } from "./message";
import { AiMode } from "@/types/ai";
import { toast } from "sonner";
import { ContextSelect } from "./context-select";
import { useTabStore } from "@/store/tab-store";
import { ViewParams, ViewType } from "@/types/view";
import { useAiStore } from "@/store/ai-store";

export function AssistantPanel() {
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
        context: context,
        model: model,
        mode: AiMode.sql,
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
  const view = useMemo(() => {
    if (tab === null) {
      return null;
    }
    const name = tab.name;
    const viewStore = localStorage.getItem("vs_" + name) + "";
    return JSON.parse(viewStore);
  }, [tab]);
  function getContext() {
    if (tab === null || view === null) {
      return "";
    }
    if (contextType === "default") {
      //获取当前展示的tab,从store中获取
      const viewType = view.type;
      if (viewType === ViewType.Sql) {
        const sql = view.params.sql;
        if (sql.length > 500) {
          return sql.substring(0, 500) + "...";
        }
        return "编辑SQL:" + sql;
      } else if (viewType === ViewType.Table) {
        const table = view.params.table;
        return "编辑表结构:" + table;
      }
    } else if (contextType === "none") {
      return "";
    } else if (contextType === "all") {
      return "";
    }
    return "";
  }

  useEffect(() => {
    const ai_asking = (params: { content: string; finished: boolean }) => {
      console.log("ai_asking", params);

      if (params.finished) {
        tempMessage && setMessages([...messages, tempMessage]);
        setTempMessage(null);
        setThinking(false);
      } else {
        if (tempMessage) {
          setTempMessage({
            role: "assistant",
            content: tempMessage.content + params.content,
          });
        } else {
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
  }, [messages, tempMessage]);
  const historyRef = React.useRef<HTMLDivElement>(null);
  //思考中
  const [thinking, setThinking] = React.useState<boolean>(false);
  const [contextType, setContextType] = React.useState<string>("default");

  const { model, setModel } = useAiStore();
  return (
    <div className="flex h-full w-full flex-col">
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
      {messages.length > 0 && (
        <>
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
                      <UserIcon size={14} />
                    ) : (
                      <SiIcon size={14} />
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
                        "box-content flex-1 overflow-auto rounded p-2",
                        item.role === "user" ? "bg-background" : "",
                      )}
                    >
                      <Message message={item}></Message>
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
                    <SiIcon size={14} />
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
              "mx-2 rounded-lg border-1 border-violet-500 p-[4px] pb-2",
              {
                "shadow-lg": focused,
              },
            )}
          >
            <Textarea
              value={input}
              className="max-h-[200px] min-h-[80px] resize-none overflow-auto border-none p-2 text-sm shadow-none outline-0 focus-visible:border-0 focus-visible:ring-0"
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
            <div className="flex h-[32px] items-center">
              <ContextSelect
                value={contextType}
                onChange={(value) => {
                  setContextType(value);
                }}
              />
              <div className="flex-1"></div>
              <ModelSelect
                onSelect={(model) => {
                  setModel(model);
                }}
              />
              <Button
                variant={"ghost"}
                size={"icon"}
                className="m-[0px] h-[28px] w-[28px]"
                onClick={() => {
                  handleSend();
                }}
              >
                <SendIcon size={14}></SendIcon>
              </Button>
            </div>
          </div>
        </>
      )}
      {messages.length == 0 && (
        <div className="flex w-full flex-1 items-center">
          <div className="w-full">
            <div className="text-muted-foreground pb-8 text-center text-lg">
              Collaborate with <span className="text-primary">UDB</span>
            </div>
            <div
              className={cn(
                "mx-2 flex-1 rounded-lg border-1 border-violet-500 p-[4px] pb-2",
                {
                  "shadow-lg": focused,
                },
              )}
            >
              <Textarea
                value={input}
                className="max-h-[200px] min-h-[80px] resize-none overflow-auto border-none p-2 text-sm shadow-none outline-0 focus-visible:border-0 focus-visible:ring-0"
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
                    // Check if the input method is active (to exclude Chinese input process carriage returns)

                    if (!e.nativeEvent.isComposing) {
                      e.preventDefault();
                      handleSend();
                    }
                  }
                }}
              />
              <div className="flex h-[32px] items-center">
                <ContextSelect
                  value={contextType}
                  onChange={(value) => {
                    setContextType(value);
                  }}
                />
                <div className="flex-1"></div>
                <ModelSelect
                  onSelect={(model) => {
                    setModel(model);
                  }}
                />
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="m-[0px] h-[28px] w-[28px]"
                  onClick={() => {
                    handleSend();
                  }}
                >
                  <SendIcon size={14}></SendIcon>
                </Button>
              </div>
            </div>
            <div className="p-5">
              <div
                className="bg-accent/60 hover:bg-accent text-muted-foreground flex items-center gap-2 overflow-hidden rounded p-2 text-sm overflow-ellipsis"
                onClick={() => {
                  handleSend("新建表");
                }}
              >
                查询所有的表
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
