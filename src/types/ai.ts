export enum AiMode {
    "sql" = "sql",
    "table" = "table",
    "setting" = "setting"
}
export type AiAgent = {
    name: string;
    isBuiltIn?: boolean;
    prompt: string;
    servers?: AiAgentServer[];
}
export type AiAgentServer = {
    name: string;
    icon?: string;
    isBuiltIn?: boolean;
    description?: string;
}