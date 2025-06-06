import OpenAI from "openai";
import { IMCPServer } from "./mcp-server";
import { getCurrentDataSource } from "@/listeners/db";
import { executeSql } from "../services/db-client";
/**
 * sql Mcp Server
 */
export class SqlMcpServer implements IMCPServer {
    public name: string = "Sql Server";
    public description: string = "Create, read, update, and delete data in a SQL Server database.";
    public icon: string = "Database";
    public isBuiltIn: boolean = true;

    public getTools() {
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
            // Query the field information of multiple tables based on multiple table names, and return the table names and field information
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
            }
        ]
        return tools;
    }
    public executeTool(toolName: string, args: any) {
        switch (toolName) {
            case "query_tables":
                return this.query_tables(JSON.parse(args));
            case "query_table_columns":
                return this.query_table_columns(JSON.parse(args));
            case "query_table_data":
                return this.query_table_data(JSON.parse(args));
            default:
                return new Promise((resolve, reject) => {
                    resolve({
                        status: 500
                    })
                })
        }
    }
    //通过提供的字符，根据表名称和表备进行模糊查询，返回表名称和表备注的数组
    public query_tables(args: any) {
        const currentDataSource = getCurrentDataSource();
        if (currentDataSource == null) {
            return new Promise((resolve, reject) => {
                resolve({
                    status:831,
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
    }
    // Query the field information of multiple tables based on multiple table names, and return the table names and field information
    public query_table_columns(args: any) {
        const currentDataSource = getCurrentDataSource();
        if (currentDataSource == null) {
            return new Promise((resolve, reject) => {
                resolve({
                    status: 831,
                    message: "Please select a database!",
                    data: [],
                });
            });
        } else {
            const tables: string[] = args.tables;
            // Query the field information of multiple tables based on multiple table names, and return the table names and field information
            const sql = `
                SELECT table_name, column_name, data_type, column_comment
                FROM information_schema.columns
                WHERE table_name IN (${tables.map((name) => `'${name}'`).join(",")})
            `;
            return executeSql(sql, currentDataSource);
        }
    }
    //根据表名称，查询表的前2条数据
    public query_table_data(args: any) {
        const currentDataSource = getCurrentDataSource();
        if (currentDataSource == null) {
            return new Promise((resolve, reject) => {
                resolve({
                    status: 831,
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
    }

}