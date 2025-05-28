export const configTemplate = {
    "app.language":"en",
    "app.theme":"light",
    "ai.providers":[
        {
            name: "Qwen",
            baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
            models:[
                {
                    name:"qwen-max",
                },{
                    name:"qwen-turbo",
                },{
                    name:"qwen-plus",
                }
            
            ]
        }
    ],
    "ai.models":[],
    "ai.chat.model":"",
    "ai.suggestion.model":"",

}