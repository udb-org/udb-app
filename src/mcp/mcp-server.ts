import OpenAI from "openai";

export interface IMCPServer{
    name:string
    description:string
    icon:string
    isBuiltIn:boolean

    /**
     * 获取工具函数
     * @returns 工具函数数组
     */
    getTools:()=>OpenAI.Chat.Completions.ChatCompletionTool[]
    /**
     * 执行工具函数
     */
    executeTool:(toolName:string,args:any)=>Promise<any>
}