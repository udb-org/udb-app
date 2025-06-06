export function getConfigItem(key:string){
    return  window.api.invoke("storage:getConfigItem",key);
}
export const AppConfig={
    getAppLanguage:()=>getConfigItem("app.language"),
    getAppTheme:()=>getConfigItem("app.theme"),
    getAiProviders:()=>getConfigItem("ai.providers"),
    getAiModels:()=>getConfigItem("ai.models"),
    getAiChatModel:()=>getConfigItem("ai.chat.model"),
    getAiSuggestionModel:()=>getConfigItem("ai.suggestion.model"),
    getAiMcpServers:()=>getConfigItem("ai.mcp.servers"),
    getAiAgents:()=>getConfigItem("ai.agents"),
    getAiAgentDefault:()=>getConfigItem("ai.agent.default"),

    saveConfig:(config:any)=>window.api.invoke("storage:setConfig",config),
}