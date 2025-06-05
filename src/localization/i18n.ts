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
       
        "ai.prompt.mergesql":"As a SQL expert, you need to merge two SQL scripts into one complete and executable script. Strictly follow these rules for the merge:\n\n#### Input Explanation  \n1. **Existing SQL**: User-provided script containing business logic, custom rules, and critical content.  \n2. **Newly Generated SQL**: AI-auto-generated update script potentially including table structure changes, data migrations, etc.  \n\n#### Merge Rules  \n**Priority Principle**  \n- In conflicts, **content from Existing SQL always takes precedence over Newly Generated SQL**.  \n- Exception: If new SQL contains explicit `DROP/CREATE` statements for objects absent in existing SQL, execute the new SQL.  \n\n**Structure Preservation**  \n- 100% preserve comments (`--` or `/* */`) from Existing SQL.  \n- Do not overwrite complete code blocks (stored procedures/functions/triggers) in Existing SQL.  \n- If `ALTER TABLE` statements for a table exist alongside its `CREATE TABLE` in Existing SQL, integrate them into the table creation statement.  \n\n**Intelligent Deduplication**  \n- Remove duplicate `CREATE TABLE` or `ALTER TABLE` statements, retaining definitions from Existing SQL.  \n- Merge identical `INSERT` statements (determined by primary/unique keys).  \n\n**Dependency Ordering**  \nReorganize code in this sequence:  \n1. Table/view/type creation  \n2. Structural changes (`ALTER TABLE`)  \n3. Index/constraint creation  \n4. Stored procedures/functions  \n5. Data operations (`INSERT/UPDATE`)  \n6. Triggers  \n\n**Conflict Handling**  \n- For conflicting column definitions (e.g., `VARCHAR(50)` vs. `VARCHAR(100)`), **use Existing SQL’s definition**.  \n- When adding new tables/columns, auto-sort based on foreign key dependencies.  \n- Mark locations needing manual review with `/* MERGE CONFLICT */` comments.  \n\n#### Output Requirements  \nOutput only the complete SQL script. Do not use code blocks.",
        "ai.prompt.mergesql.original":"Existing SQL",
        "ai.prompt.mergesql.newly":"Newly Generated SQL",
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
        "ai.prompt.mergesql":"你是一个SQL专家，需要将两个SQL脚本合并为一个完整且可执行的脚本。请严格遵循以下规则执行合并：\n#### 输入说明\n1. **原有SQL**：用户提供的已存在脚本（包含业务逻辑、自定义规则等关键内容）\n2. **新生成SQL**：AI自动生成的更新脚本（可能包含表结构变更、数据迁移等操作）\n#### 合并规则\n **优先级原则**  \n- 当两者有冲突时，**原有SQL的内容优先级永远高于新生成SQL**\n- 例外：如果新SQL包含显式的 `DROP/CREATE` 语句且原有SQL无对应对象，则按新SQL执行\n**结构保留**  \n- 原有SQL的注释（`--` 或 `/* */`）必须100%保留\n- 原有SQL的存储过程/函数/触发器等完整代码块不允许被覆盖\n- 如果已有新建表语句，识别到相同表的ALTER TABLE语句的话，合并当建表语句中\n**智能去重**  \n- 识别重复的 `CREATE TABLE` 或 `ALTER TABLE` 语句，保留原有SQL的定义\n- 相同的 `INSERT` 语句合并为一条（通过主键或唯一索引判断）\n **依赖排序**  \n按以下顺序重组代码：\n1. 表/视图/类型创建\n2. 结构变更（`ALTER TABLE`）\n3. 索引/约束创建\n4. 存储过程/函数\n5. 数据操作（`INSERT/UPDATE`）\n6. 触发器\n **冲突处理**\n- 如果新旧SQL对同一列定义冲突（如 `VARCHAR(50)` vs `VARCHAR(100)`），**采用原有SQL定义**\n- 新增表或字段时，必须检查外键依赖关系并自动排序\n- 用 `/* MERGE CONFLICT */` 注释标记需要人工复核的位置\n#### 输出要求\n只输出完整SQL脚本，不要使用代码块。",     
        "ai.prompt.mergesql.original":"原有SQL",
        "ai.prompt.mergesql.newly":"新生成SQL",
        "editor.button.fixsql":"修复SQL",


      },
    },
  },
});
