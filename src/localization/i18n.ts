import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        "setup.welcome": "Welcome to UDB!",
        "setup.theme.title": "Select your theme",
        "setup.theme.subtitle":
          "You can change the theme later in the settings",
        "setup.theme.dark": "Dark",
        "setup.theme.light": "Light",
        "setup.theme.language": "Select your language",
        "setup.button.previous": "Previous",
        "setup.button.continue": "Continue",
        "setup.button.start": "Start UDB",

        "setup.error.configAiModels": "Please configure the AI models.",
        "setup.error.suggestionModelKey":
          "Please configure the suggestion model.",
        "setup.error.defaultModelKey": "Please configure the default model.",

        "settings.base.title": "Base Settings",
        "settings.base.language": "Language",
        "settings.account.title": "Account Settings",
        "settings.account.subtitle": "Manage your account settings",
        "settings.about.title": "About",

        "settings.ai.title": "AI Settings",
        "settings.ai.subtitle": "Manage your AI settings",
        "settings.ai.desc":
          "Configure the API key and secret key for the OpenAI API.",
        "settings.ai.add": "Add",
        "settings.ai.suggestion.title": "Suggestions Model",
        "settings.ai.suggestion.desc":
          "Select the suggestions model for the application.",
        "settings.ai.chat.title": "Chat Default Model",
        "settings.ai.chat.desc":
          "Select the default model for the application..",

        "active.bar.database": "Database",
        "active.bar.favorite": "Favorite",
        "active.bar.search": "Search",
        "active.bar.folder": "Folder",
        "active.bar.history": "History",
        "active.bar.setting": "Setting",
        "active.bar.suggestion": "Suggestions",

        "title.bar.select.connection": "Select a connection",
        "title.bar.select.project": "Select a project",
        "title.bar.new.connection": "New Connection",
        "title.bar.recent.connection": "Recent",
        "title.bar.recent.project": "Recent",
        "title.bar.open.folder": "Open Folder",

        "welcome.title": "Welcome to UDB!",
        "welcome.button.more": "More",
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

        "setup.error.configAiModels": "请配置AI模型。",
        "setup.error.suggestionModelKey": "请配置建议模型。",
        "setup.error.defaultModelKey": "请配置默认模型。",

        "settings.base.title": "基础设置",
        "settings.base.language": "语言",
        "settings.account.title": "账户设置",
        "settings.account.subtitle": "管理您的账户设置",
        "settings.about.title": "关于",

        "settings.ai.title": "AI 设置",
        "settings.ai.subtitle": "管理您的 AI 设置",
        "settings.ai.desc": "配置 OpenAI API 的 API 密钥和密钥。",
        "settings.ai.add": "添加",

        "settings.ai.suggestion.title": "建议模型",
        "settings.ai.suggestion.desc": "选择应用程序的建议模型。",
        "settings.ai.chat.title": "聊天默认模型",
        "settings.ai.chat.desc": "选择应用程序的默认模型。",

        "active.bar.database": "数据库",
        "active.bar.favorite": "收藏",
        "active.bar.search": "搜索",
        "active.bar.folder": "文件夹",
        "active.bar.history": "历史",
        "active.bar.setting": "设置",
        "active.bar.suggestion": "建议",

        "title.bar.select.connection": "选择一个连接",
        "title.bar.select.project": "选择一个项目",
        "title.bar.new.connection": "新建连接",
        "title.bar.recent.connection": "最近",
        "title.bar.recent.project": "最近",
        "title.bar.open.folder": "打开文件夹",

        "welcome.title": "欢迎使用 UDB!",
        "welcome.button.more": "更多",
      },
    },
  },
});
