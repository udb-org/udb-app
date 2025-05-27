//AI服务
import OpenAI from "openai";
import { executeSql } from "./db-client";
import { getCurrentConnection } from "@/listeners/storage";
import { getCurrentDataSource } from "@/listeners/db";
import { dialog } from "electron";
import { boolean } from "zod";
import { AiMode } from "@/types/ai";
import { getTableNames } from "@/utils/sql";

let history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

//清楚历史记录
export function clearHistory() {
  history = [];
}
/**
 * 提问
 * @param input
 * @param model
 */
export async function ask(
  input: string,
  model: any,
  mode: AiMode,
  context: string,
  sender: (content: string, finished: boolean) => void,
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
  //调用内部函数
  let lastFunction = "";
  askInner(input, model, messages, mode, lastFunction, context, sender);
}
/**
 * 提问，内部调用
 * @param input
 * @param model
 * @param messages
 */
export async function askInner(
  input: string,
  model: any,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  mode: AiMode,
  lastFunction: string,
  context: string,
  sender: (content: string, finished: boolean) => void,
) {
  const _messages: any = [
    ...messages,
    {
      role: "system",
      content: mode === AiMode.sql ? SqlPrompt : TablePrompt,
    },
    {
      role: "system",
      content: context.length > 0 ? "当前软件展示内容如下：\n" + context : "",
    },
  ];
  console.log("askInner", _messages);
  let client: OpenAI = new OpenAI({
    apiKey: model.apiKey,
    baseURL: model.baseUrl,
  });
  const stream = await client.chat.completions.create({
    model: model.model,
    messages: _messages,
    tools: tools,
    stream: true,
  });
  //保存ai的回复
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
          const fun = Tools_Funs[aiToolCallName];
          console.log("toolName", aiToolCallName);
          console.log("fun", fun);
          if (fun) {
            const call = (res: any) => {
              console.log("res", res);

              if (res.status === "error") {
                sender(res.message, true);
              } else if (res.status === "success") {
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
                  mode,
                  lastFunction,
                  context,
                  sender,
                );
              }
            };
            //调用工具函数
            if (aiToolCallArguments && aiToolCallArguments.length > 0) {
              fun(JSON.parse(aiToolCallArguments)).then(call);
            } else {
              fun().then(call);
            }
          }
        }
      } else if (chunk.choices[0].finish_reason === "length") {
        sender("长度超过限制", true);
      } else if (chunk.choices[0].finish_reason === "content_filter") {
      } else {
      }
    }

    // if(chunk.choices[0]){

    //     if(chunk.choices[0].finish_reason){
    //         //如果ai有回复
    //         if (chunk.choices[0].message.content) {
    //             messages.push(chunk.choices[0].message);
    //             //结束整个会话，返回结果
    //             sender(chunk.choices[0].message.content);
    //         }
    //     }
    // }
  }
}

//提示词:sql
const SqlPrompt = `你是一个数据库助手，根据用户的输入，生成对应的SQL语句。你可以使用工具函数来查询数据库中的信息。输出内容尽量简洁。sql语句必须使用代码块输出。
如果需要绘制图表,请使用js代码块输出`;
//提示词:table
const TablePrompt = `
`;
//提示词:setting
const SettingPrompt = `
`;

//注册工具函数
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  //通过提供的字符，根据表名称和表备进行模糊查询，返回表名称和表备注的数组
  {
    type: "function",
    function: {
      name: "query_tables",
      description:
        "通过提供的字符，根据表名称和表备进行模糊查询，返回表名称和表备注的数组",
      parameters: {
        type: "object",
        properties: {
          names: {
            type: "array",
            items: {
              type: "string",
              description: "需要模糊查询的字符",
            },
            description: "需要模糊查询的字符数组",
          },
        },
      },
    },
  },
  //根据多个表名称，查询读个表的字段信息，返回表名称及字段信息
  {
    type: "function",
    function: {
      name: "query_table_columns",
      description: "根据多个表名称，查询读个表的字段信息，返回表名称及字段信息",
      parameters: {
        type: "object",
        properties: {
          tables: {
            type: "array",
            items: {
              type: "string",
              description: "表名称",
            },
            description: "表名称数组",
          },
        },
      },
    },
  },
  //根据表名称，查询表的前5条数据
  {
    type: "function",
    function: {
      name: "query_table_data",
      description: "根据表名称，查询表的前5条数据",
      parameters: {
        type: "object",
        properties: {
          table_name: {
            type: "string",
            description: "表名称",
          },
        },
      },
    },
  },
];

const Tools_Funs: any = {
  //通过提供的字符，根据表名称和表备进行模糊查询，返回表名称和表备注的数组
  query_tables: (args: any) => {
    const currentDataSource = getCurrentDataSource();
    if (currentDataSource == null) {
      return new Promise((resolve, reject) => {
        resolve({
          status: "error",
          message: "Please select a database!",
          data: [],
        });
      });
    } else {
      const names: string[] = args.names;
      //通过提供的字符，根据表名称和表备进行模糊查询，返回表名称和表备注的数组
      const sql = `
                        SELECT table_name, table_comment
                        FROM information_schema.tables
                        WHERE
                        ${names.map((name) => `(table_name LIKE '%${name}%' OR table_comment LIKE '%${name}%')`).join(" OR ")}
                    `;
      return executeSql(sql, currentDataSource);
    }
  },
  //根据多个表名称，查询读个表的字段信息，返回表名称及字段信息
  query_table_columns: (args: any) => {
    const currentDataSource = getCurrentDataSource();
    if (currentDataSource == null) {
      return new Promise((resolve, reject) => {
        resolve({
          status: "error",
          message: "Please select a database!",
          data: [],
        });
      });
    } else {
      const tables: string[] = args.tables;
      //根据多个表名称，查询读个表的字段信息，返回表名称及字段信息
      const sql = `
                SELECT table_name, column_name, data_type, column_comment
                FROM information_schema.columns
                WHERE table_name IN (${tables.map((name) => `'${name}'`).join(",")})
            `;
      return executeSql(sql, currentDataSource);
    }
  },
  //根据表名称，查询表的前2条数据
  query_table_data: (args: any) => {
    const currentDataSource = getCurrentDataSource();
    if (currentDataSource == null) {
      return new Promise((resolve, reject) => {
        resolve({
          status: "error",
          message: "Please select a database!",
          data: [],
        });
      });
    } else {
      const tableName: string = args.table_name;
      //根据表名称，查询表的前5条数据
      const sql = `SELECT * FROM ${tableName} limit 2`;
      return executeSql(sql, currentDataSource);
    }
  },
};

/**
 * 优化sql代码
 * @param content
 * @param model
 */
export async function optimizeSql(content: string, model: any) {
  //如果包含太多的sql语句或者长度太大，不能执行
  if (content.length > 10000) {
    return;
  }
  const cleanSql = content
    .replace(/\/\*[\s\S]*?\*\//g, "") // 移除多行注释
    .replace(/--.*$/gm, ""); // 移除单行注释
  const sqls = cleanSql.split(";");
  if (sqls.length > 5) {
    return;
  }
  //解析content，提供可能用到的表和表结构
  let tableInfo: string = "";
  let tables: string[] = [];
  sqls.forEach((sql) => {
    const tableNames = getTableNames(sql);
    tables = tables.concat(tableNames);
  });
  if (tables.length > 0) {
    //获得表结构
    const currentDataSource = getCurrentDataSource();
    if (currentDataSource == null) {
    } else {
      //根据多个表名称，查询读个表的字段信息，返回表名称及字段信息
      const sql = `
                SELECT table_name, column_name, data_type, column_comment
                FROM information_schema.columns
                WHERE table_name IN (${tables.map((name) => `'${name}'`).join(",")})
            `;
      const table_cols = await executeSql(sql, currentDataSource);
      tableInfo = JSON.stringify(table_cols);
    }
  }
  if (tables.length > 0 && tableInfo.length == 0) {
    tableInfo = JSON.stringify(tables);
  }
  //询问ai，根据表结构，优化sql
  let client: OpenAI = new OpenAI({
    apiKey: model.apiKey,
    baseURL: model.baseUrl,
  });
  const messages = [
    {
      role: "system",
      content:
        "你是一个sql优化专家。可以根据提供的sql，相关的表或表结构，优化sql，并返回优化后的sql。",
    },
    {
      role: "user",
      content: "表或表接口如下\n" + tableInfo,
    },
    {
      role: "user",
      content: "需要优化的sql如下\n" + content,
    },
  ];
  console.log("optimizeSql", messages);
  const steam = await client.chat.completions.create({
    model: model.model,
    messages: messages,
  });
  const res = steam.choices[0].message.content;
  console.log("optimizeSql end", res);

  return res;
}
/**
 * 修复sql代码
 * @param content
 * @param model
 */
export async function fixSql(content: string, model: any) {
  //如果包含太多的sql语句或者长度太大，不能执行
  if (content.length > 10000) {
    return;
  }
  const cleanSql = content
    .replace(/\/\*[\s\S]*?\*\//g, "") // 移除多行注释
    .replace(/--.*$/gm, ""); // 移除单行注释
  const sqls = cleanSql.split(";");
  if (sqls.length > 5) {
    return;
  }
  //解析content，提供可能用到的表和表结构
  let tableInfo: string = "";
  let tables: string[] = [];
  sqls.forEach((sql) => {
    const tableNames = getTableNames(sql);
    tables = tables.concat(tableNames);
  });
  if (tables.length > 0) {
    //获得表结构
    const currentDataSource = getCurrentDataSource();
    if (currentDataSource == null) {
    } else {
      //根据多个表名称，查询读个表的字段信息，返回表名称及字段信息
      const sql = `
                SELECT table_name, column_name, data_type, column_comment
                FROM information_schema.columns
                WHERE table_name IN (${tables.map((name) => `'${name}'`).join(",")})
            `;
      const table_cols = await executeSql(sql, currentDataSource);
      tableInfo = JSON.stringify(table_cols);
    }
  }
  if (tables.length > 0 && tableInfo.length == 0) {
    tableInfo = JSON.stringify(tables);
  }
  //询问ai，根据表结构，优化sql
  let client: OpenAI = new OpenAI({
    apiKey: model.apiKey,
    baseURL: model.baseUrl,
  });
  const steam = await client.chat.completions.create({
    model: model.model,
    messages: [
      {
        role: "system",
        content:
          "你是一个sql错误修复专家。可以根据提供的sql，相关的表或表结构，修复sql错误，并返回修复后的sql。",
      },
      {
        role: "user",
        content: "表或表接口如下\n" + tableInfo,
      },
      {
        role: "user",
        content: "需要修复的sql如下\n" + content,
      },
    ],
  });

  return steam.choices[0].message.content;
}
