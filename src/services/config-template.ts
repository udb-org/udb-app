export const configTemplate = {
    "app.language": "en",
    "app.theme": "system",
    "ai.providers": [
        {
            name: "Qwen",
            baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
            models: [
                {
                    name: "qwen-max",
                }, {
                    name: "qwen-turbo",
                }, {
                    name: "qwen-plus",
                }
            ]
        },
        {
            name: "DeepSeek",
            baseUrl: "https://api.deepseek.com/v1",
            models: [
                {
                    name: "deepseek-chat"
                }, {
                    name: "deepseek-reasone"
                }
            ]

        }, {
            name: "Tencent Hunyuan",
            baseUrl: "https://api.hunyuan.cloud.tencent.com/v1",
            models: [
                {
                    name: "hunyuan-t1-latest"
                }, {
                    name: "hunyuan-turbos-latest"
                }
            ]
        }, {
            name: "OpenAI",
            baseUrl: "https://api.openai.com/v1",
            models: [
                {
                    name: "gpt-3.5-turbo"
                }, {
                    name: "gpt-4"
                }
            ]
        }, {
            name: "Doubao",
            baseUrl: "https://ark.cn-beijing.volces.com/api/v3/",
            models: [
                {
                    name: "doubao-1.5-thinking-pro"
                }, {
                    name: "doubao-1.5-pro-32k"
                }
            ]
        }
    ],
    "ai.models": [],
    "ai.chat.model": "",
    "ai.suggestion.model": "",
    "ai.mcp.servers": [
        {
            icon:"Database",
            name: "Sql Server",
            isBuiltIn: true,
            description: "Create, read, update, and delete data in a SQL Server database.",
        }, {
            name: "File System",
            icon:"Folder",
            isBuiltIn: true,
            description: "Create, read, update, and delete data in a file system.",
        }
    ],
    "ai.agents": [
        {
            name: "Sql Agent",
            isBuiltIn: true,
            prompt: "You are a database assistant that generates corresponding SQL statements based on user input. You can use utility functions to query information in the database. The output content should be as concise as possible. SQL statements must be output using code blocks. If you need to draw a chart, please use JS code block output.",
            servers: [
                {
                    name: "Sql Server",                   
                }
            ]
        }
    ],
    "ai.agent.default": "Sql Agent",
}