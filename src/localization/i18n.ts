import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        "setup.welcome": "Welcome to UDB!",
        "setup.theme.title": "Select your theme",
        "setup.theme.subtitle": "You can change the theme later in the settings",
        "setup.theme.dark": "Dark",
        "setup.theme.light": "Light",
        "setup.theme.language": "Select your language",
        "setup.button.previous": "Previous",
        "setup.button.continue": "Continue",
        "setup.button.start": "Start UDB",

        "setup.error.configAiModels":"Please configure the AI models.",
        "setup.error.suggestionModelKey":"Please configure the suggestion model.",
        "setup.error.defaultModelKey":"Please configure the default model.",

        "settings.ai.title": "AI Settings",
        "settings.ai.subtitle": "Manage your AI settings",
        "settings.ai.desc": "Configure the API key and secret key for the OpenAI API.",
        "settings.ai.add": "Add",
        "settings.ai.suggestion.title": "Suggestions Model",
        "settings.ai.suggestion.desc": "Select the suggestions model for the application.",
        "settings.ai.chat.title": "Chat Default Model",
        "settings.ai.chat.desc": "Select the default model for the application..",

        
      },
    },
    zh: {
      translation: {
        "setup.welcome": "欢迎使用 UDB!",
        "setup.theme.title": "选择您的主题",
        "setup.theme.subtitle": "您可以稍后在设置中更改主题",
        "setup.theme.dark": "深色",
        "setup.theme.light": "浅色",
        "setup.theme.language": "选择您的语言",
        "setup.button.previous": "上一步",
        "setup.button.continue": "下一步",
        "setup.button.start": "启动 UDB",

        "setup.error.configAiModels":"请配置AI模型。",
        "setup.error.suggestionModelKey":"请配置建议模型。",
        "setup.error.defaultModelKey":"请配置默认模型。",

        "settings.ai.title": "AI 设置",
        "settings.ai.subtitle": "管理您的 AI 设置",
        "settings.ai.desc": "配置 OpenAI API 的 API 密钥和密钥。",
        "settings.ai.add": "添加",

        "settings.ai.suggestion.title": "建议模型",
        "settings.ai.suggestion.desc": "选择应用程序的建议模型。",
        "settings.ai.chat.title": "聊天默认模型",
        "settings.ai.chat.desc": "选择应用程序的默认模型。",
        


      },
    },
  },
});
