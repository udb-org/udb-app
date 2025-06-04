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
        "setup.theme.system": "System",

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

       
        "status.200":"Success",
        "status.500":"Internal Server Error",
        "status.799":"Starting...",
        "status.800":"Running",
        "status.810":"Too many tasks, please try again later.",
        "status.820":"Task does not exist.",
        "status.830":"Data source does not exist.",
        "status.831":"Please select a database!",
        "status.840":"Dump is running.",
        "status.850":"Transaction has been rollback or commited.",
        "status.860":"Server not started.",
        "status.870":"Token length exceeds the limit.",



        "tree.no.children":"No Children",
        
        "ai.prompt.fixsql":"Fix the SQL statement, make sure it is correct and can be executed. If it is not correct, explain why it is not correct.",
        "ai.prompt.optimizesql":"Optimize the SQL statement, make sure it is efficient and can be executed. If it is not efficient, explain why it is not efficient.",
        "ai.prompt.error.context":"The error message is as follows:",
        "ai.prompt.mergesql":"Update Context2 into Context1, automatically determining based on the content: whether to append a new row or to replace all or part of it. Only output SQL code, do not consider the merging of SQL query results, and do not use code blocks.",

        "editor.button.fixsql":"Fix SQL",

      },
    },
    zh: {
      translation: {
        "setup.welcome": "欢迎使用 UDB!",
        "setup.theme.title": "选择您的主题",
        "setup.theme.subtitle": "您可以稍后在设置中更改主题",
        "setup.theme.dark": "深色",
        "setup.theme.light": "浅色",
        "setup.theme.system": "系统",
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

        "status.200":"成功",
        "status.500":"内部服务器错误",
        "status.799":"启动中...",
        "status.800":"运行中",
        "status.810":"任务数过多，请稍后再试",
        "status.820":"任务不存在",
        "status.830":"数据源不存在",
        "status.840":"导出任务正在运行",
        "status.850":"事务已经回滚或者提交",
        "status.860":"服务器未启动",
        "status.870":"Token长度超过限制",

        "tree.no.children":"空空如也",

        "ai.prompt.fixsql":"修复SQL语句，确保它是正确的并且可以执行。如果不正确，请解释为什么不正确。",
        "ai.prompt.optimizesql":"优化SQL语句，确保它是高效的并且可以执行。如果不是高效的，请解释为什么不是高效的。",
        "ai.prompt.mergesql":"将Context2更新到Context1中，根据内容自动判断：是新增一行追加；还是是替换全部或其中的一部分。只输出SQL代码，不要考虑SQL查询结果的合并，不要使用代码块。",

        "editor.button.fixsql":"修复SQL",


      },
    },
  },
});
