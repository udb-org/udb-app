// AI Service
import { getCurrentDataSource } from "@/listeners/database/db-conf";
import { AiAgent } from "@/types/ai";
import { getTableNames } from "@/utils/sql";
import OpenAI from "openai";
import { ChatCompletionTool } from "openai/resources/chat";
import { executeSql } from "./db-client";
import { IMCPServer } from "../mcp/mcp-server";
import { SqlMcpServer } from "../mcp/sql-server";
import { getConfigItem } from "./storage";
import { IResult } from "@/types/db";
import { L } from "vitest/dist/chunks/reporters.d.C-cu31ET";

let history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
const mcpServers: IMCPServer[] = [
  new SqlMcpServer()
];
// Clear history records
export function clearHistory() {
  history = [];
}
/**
 * Ask a question
 * @param input 
 * @param model 
 */
export async function ask(
  input: string,
  model: any,
  context: string,
  agent: string | null,
  sender: (content: string, finished: boolean, status?: number) => void,
) {
  let message: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: "user",
    content: input,
  };
  let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    ...history,
    message,
  ];
  history.push(message);
  // Call internal function
  let lastFunction = "";
  askInner(input, model, messages, lastFunction, context, agent, sender);
}
/**
 * Internal ask function
 * @param input 
 * @param model 
 * @param messages 
 */
export async function askInner(
  input: string,
  model: any,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],

  lastFunction: string,
  context: string,
  agent: string | null,
  sender: (content: string, finished: boolean, status?: number) => void,
) {
  console.log("askInner",
    agent, sender
  );
  let _messages: any = [
    ...messages
  ];
  // Get tools
  let agentTools: ChatCompletionTool[] = [];
  let agentObj: AiAgent | null = null;
  //如果有代理，添加到消息中
  if (agent != null && agent.length > 0) {
    //Get agent
    const agents = getConfigItem("ai.agents");
    agentObj = agents.find((a: AiAgent) => a.name = agent);
    if (agentObj) {
      _messages.push({
        role: "system",
        content: agentObj.prompt
      });
      if (agentObj.servers) {
        agentObj.servers.forEach(server => {
          //获取server的方法
          const serverObj = mcpServers.find(s => s.name == server.name);
          if (serverObj) {
            serverObj.getTools().forEach(tool => {
              const func = {
                ...tool.function,
                //函数名称:服务名称.函数名称
                name: server.name + "." + tool.function.name,
              };
              //添加到工具函数数组
              agentTools.push({
                type: "function",
                function: func
              })
            })
          }
        })
      }
    }

  }
  //如果有打开数据库，添加到消息中
  const currentDataSource = getCurrentDataSource();
  if (currentDataSource != null) {
    _messages.push({
      role: "system",
      content: "当前打开的数据库为：" + JSON.stringify({
        name: currentDataSource.name,
        type: currentDataSource.type,
        host: currentDataSource.host,
        port: currentDataSource.port,
        database: currentDataSource.database,
      }),
    });
  }

  //如果有上下文，添加到消息中
  if (context && context.length > 0) {
    _messages.push({
      role: "system",
      content: context.length > 0 ? "当前软件展示内容如下：\n" + context : "",
    });
  }

  console.log("askInner", _messages);
  let client: OpenAI = new OpenAI({
    apiKey: model.apiKey,
    baseURL: model.baseUrl,
  });
  const stream = await client.chat.completions.create({
    model: model.model,
    messages: _messages,
    tools: agentTools,
    stream: true,
  });
  // Save ai's reply
  let aiContent = "";
  let aiToolCallId: string | null = null;
  let aiToolCallIndex: number | null = null;
  let aiToolCallName: string | null = null;
  let aiToolCallArguments: string | null = null;
  for await (const chunk of stream) {
    // console.log("choice", chunk.choices[0]);
    // console.log("delta", JSON.stringify(chunk.choices[0].delta));
    if (chunk.choices[0].delta.content) {
      const content = chunk.choices[0].delta.content;
      aiContent += content;
      sender(content, false);
    } else if (chunk.choices[0].delta.tool_calls) {
      //如果有工具调用
      const toolCall = chunk.choices[0].delta.tool_calls[0];
      if (toolCall.id && toolCall.id.length > 0) {
        aiToolCallId = toolCall.id;
      }
      if (toolCall.index) {
        aiToolCallIndex = toolCall.index;
      }
      const fun = toolCall.function;
      if (fun) {
        if (fun.name) {
          aiToolCallName = fun.name;
        }
        if (fun.arguments) {
          if (aiToolCallArguments) {
            aiToolCallArguments = aiToolCallArguments + fun.arguments;
          } else {
            aiToolCallArguments = fun.arguments;
          }
        }
      }
    }
    if (chunk.choices[0].finish_reason) {
      if (chunk.choices[0].finish_reason === "stop") {
        const key = aiToolCallName + "" + aiToolCallArguments;
        console.log("key", key);
        const aiMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
          role: "assistant",
          content: aiContent,
        };
        history.push(aiMessage);
        sender("", true);
      } else if (chunk.choices[0].finish_reason === "tool_calls") {
        sender("", true);
        //检查是否重复调用
        const key = aiToolCallName + "" + aiToolCallArguments;
        console.log("key", key);
        if (
          key !== lastFunction &&
          aiToolCallName &&
          aiToolCallName.length > 0
        ) {
          lastFunction = key;
          //执行工具函数
          if (agentObj && agentObj.servers) {
            //获取服务
            const callServerName = aiToolCallName.split(".")[0];
            const callFuncName = aiToolCallName.split(".")[1];
            const server = mcpServers.find(s => s.name == callServerName);
            if (server) {
              //获取服务的方法
              const callFunc = server.getTools().find(t => t.function.name == callFuncName);
              if (callFunc) {
                //执行服务的方法
                const callback = (res: IResult) => {
                  console.log("res", res);
                  if (res.status === 200) {
                    const aiMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam =
                    {
                      role: "assistant",
                      content: aiContent,
                      tool_calls: [
                        {
                          index: aiToolCallIndex,
                          id: aiToolCallId + "",
                          type: "function",
                          function: {
                            name: aiToolCallName + "",
                            arguments: aiToolCallArguments + "",
                          },
                        },
                      ],
                    };
                    messages.push(aiMessage);
                    history.push(aiMessage);
                    const message: OpenAI.Chat.Completions.ChatCompletionMessageParam =
                    {
                      role: "tool",
                      content: JSON.stringify(res.data),
                      tool_call_id: aiToolCallId + "",
                    };
                    messages.push(message);
                    history.push(message);
                    //将结果返回给AI
                    askInner(
                      input,
                      model,
                      messages,
                      lastFunction,
                      context,
                      agent,
                      sender
                    );
                  } else {
                    sender(res.message + "", true, res.status);
                  }
                };
                console.log("aiToolCallArguments", aiToolCallArguments);
                //调用工具函数
                if (aiToolCallArguments && aiToolCallArguments.length > 0) {
                  server.executeTool(callFuncName, aiToolCallArguments).then(callback);
                } else {
                  server.executeTool(callFuncName, {}).then(callback);
                }
              }
            }
          }
        }
      } else if (chunk.choices[0].finish_reason === "length") {
        sender("长度超过限制", true);
      } else if (chunk.choices[0].finish_reason === "content_filter") {
      } else {
      }
    }
  }
}

export async function mergeSql(input: string, model: any, context: string, prompt: string, original: string,
  newly: string, sender: (content: string, status: number) => void) {

  let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  //如果有打开数据库，添加到消息中
  const currentDataSource = getCurrentDataSource();
  if (currentDataSource != null) {
    messages.push({
      role: "system",
      content: "DB:" + JSON.stringify({
        name: currentDataSource.name,
        type: currentDataSource.type,
        host: currentDataSource.host,
        port: currentDataSource.port,
        database: currentDataSource.database,
      }),
    });
  }
  messages.push({

    role: "user",
    content: original + ":\n" + context
  });
  messages.push({
    role: "user",
    content: newly + ":\n" + input
  });
  messages.push({
    role: "user",
    content: prompt
  });



  let client: OpenAI = new OpenAI({
    apiKey: model.apiKey,
    baseURL: model.baseUrl,
  });
  const stream = await client.chat.completions.create({
    model: model.model,
    messages: messages,
    stream: true,
  });
  // Save ai's reply
  let aiContent = "";
  for await (const chunk of stream) {
    if (chunk.choices[0].delta.content) {
      const content = chunk.choices[0].delta.content;
      aiContent += content;
      sender(content, 800);
    }
    if (chunk.choices[0].finish_reason) {
      if (chunk.choices[0].finish_reason === "stop") {
        const aiMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
          role: "assistant",
          content: aiContent,
        };
        history.push(aiMessage);
        sender("", 200);
      } if (chunk.choices[0].finish_reason === "length") {
        sender("长度超过限制", 870);
      } else if (chunk.choices[0].finish_reason === "content_filter") {
      } else {
      }
    }
  }

}