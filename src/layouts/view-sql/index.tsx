import React, { useEffect, useMemo } from "react";
import * as monaco from "monaco-editor";
import {
  getView,
  saveView,
  saveViewValue,
  useTabStore,
} from "@/store/tab-store";
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { showActions } from "@/api/view";
import { AlignRight, LoaderIcon, PlayIcon, SaveIcon, ShareIcon } from "lucide-react";
import { dbExec, dbResult, execSql, invokeSql } from "@/api/db";
import { SqlResults } from "./sql-results";
import { format as sqlFormatter } from "sql-formatter";
import { toast } from "sonner";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizablePanelHandle,
} from "@/components/resizable-panel";
import { ResizableHandle } from "@/components/ui/resizable";
import { useAiStore } from "@/store/ai-store";
import { getSqlSuggestionsKeywords } from "./sql-suggestions";
import { getTableNames } from "@/utils/sql";
import { openMenu } from "@/api/menu";
import { ActionParam, IAction } from "@/types/view";
import { IDataBaseTableColumn, IResult } from "@/types/db";
import { useTranslation } from "react-i18next";
import { useDbStore } from "@/store/db-store";


export default function ViewSQL(props: { viewKey: string }) {

  const { t } = useTranslation();



  useEffect(() => {
    //初始化工具栏
    showPlayAction();
  }, [])
  /**
   * 显示工具栏
   * Play:执行sql

   */
  function showPlayAction() {
    const actions: IAction[] = [
      {
        name: t("view.action.run"),
        command: "run",
        icon: "play",
      }
    ];
    showActions("view:sql-actioning", actions);
  }
  /**
   * 显示工具栏
   * Stop:停止执行sql

   */
  function showStopAction() {

    const actions: IAction[] = [
      {
        name: t("view.action.stop"),
        command: "stop",
        icon: "stop",
      }
    ];
    showActions("view:sql-actioning", actions);
  }



  const [results, setResults] = React.useState<any[]>([]);
  const [view, setView] = React.useState<any>(null);
  const { model } = useAiStore();
  useEffect(() => {
    //加载执行结果
    let _view = getView(props.viewKey);
    let _results = [];
    let _resultHeight = 300;
    let _sql = "";
    if (_view) {
      if (_view.results) {
        _results = _view.results;
      }
      if (_view.params.sql) {
        _sql = _view.params.sql;
      }
      if (_view.resultHeight) {
        _resultHeight = _view.resultHeight;
      }
    }
    setSql(_sql);
    setResults(_results);
    setView(_view);
    setResultHeight(_resultHeight);

  }, [props.viewKey]);
  //Global store setDatabase
  const database = useDbStore((state: any) => state.database);
  const [databaseMetadata, setDatabaseMetadata] = React.useState<any>({
    tables: {
      'users': ['id', 'name', 'email', 'created_at'],
      'orders': ['order_id', 'user_id', 'amount', 'order_date'],
      'products': ['product_id', 'product_name', 'price', 'category']
    },
    functions: ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CONCAT', 'DATE_FORMAT']

  });
  useEffect(() => {
    if (database) {
      setDatabaseMetadata({
        tables: {
        },
        functions: ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CONCAT', 'DATE_FORMAT']
      });
      //更新数据词典
      window.api.invoke("db:getColumns").then((res: any) => {

        if (res.status == 200) {
          const rows = res.data.rows;
          if (rows.length > 0) {
            //按照表名分组
            const tables: any = {};
            rows.forEach((row: any) => {
              if (!tables[row.table]) {
                tables[row.table] = [];
              }
              tables[row.table].push(row);
            });
            setDatabaseMetadata({
              tables: tables,
              functions: ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CONCAT', 'DATE_FORMAT']
            });

          }


        }

      }
      );

    }
  }, [database]);


  const [editor, setEditor] = React.useState<any>(null);
  const editorRef = React.useRef<any>(null);
  const [sql, setSql] = React.useState<string>("");
  const [execStatus, setExecStatus] = React.useState<
    {
      row: number;
      type: string;
    }[]
  >([]);
  const decorationsCollection =
    React.useRef<monaco.editor.IEditorDecorationsCollection>(null); // 新增装饰器集合引用
  const [sessionId, setSessionId] = React.useState<string>(
    view?.sessionId || "",
  );
  const [currentViewZoneId, setCurrentViewZoneId] = React.useState<
    string | null
  >(null);
  useEffect(() => {
    if (editor == null) {
      return;
    }
    //删除已注册的命令
    // editor.unr
    //增加命令:执行sql
    const run_action = editor.addAction({
      id: "run-sql",
      label: "Run SQL",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 0,
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR,
      ],
      run: () => {
        runAction();
      },
    });
    //增加命令:格式化sql
    const format_action = editor.addAction({
      id: "format-sql",
      label: "Format SQL",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1,
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
      ],
      run: () => {
        formatAction();
      },
    });
    //增加命令：优化sql
    const optimize_action = editor.addAction({
      id: "optimize-sql",
      label: "Optimize SQL",
      contextMenuGroupId: "ai",
      contextMenuOrder: 2,
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyO,
      ],
      run: () => {
        optimizeAction();
      },
    });
    //增加命令：修复sql错误
    const fix_action = editor.addAction({
      id: "fix-sql",
      label: "Fix SQL",
      contextMenuGroupId: "ai",
      contextMenuOrder: 3,
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyX,
      ],
      run: () => {
        fixAction();
      },
    });
    //AIInline
    const aiInlineCommand = editor.addAction({
      id: "ai-inline",
      label: "AI Inline",
      contextMenuGroupId: "ai",
      contextMenuOrder: 4,
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
      run: () => {
        const position = editor.getPosition();
        if (!position) return;
        // 渲染React组件到DOM节点
        const closeViewZone = () => {
          editor.changeViewZones((accessor) => {
            if (currentViewZoneId) {
              accessor.removeZone(currentViewZoneId);
              setCurrentViewZoneId(null);
            }
          });
          // 清理React组件
        };
        if (currentViewZoneId) {
          closeViewZone();
          return;
        }
        const lineNumber = position.lineNumber;
        const domNode = document.createElement("div");
        domNode.className = "ai-inline";
        const flex = document.createElement("div");
        domNode.appendChild(flex);
        const input = document.createElement("div");
        input.className = "ai-inline-input";
        const textArea = document.createElement("textarea");
        const icon = document.createElement("div");
        icon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send-icon lucide-send"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>';
        flex.appendChild(input);
        input.appendChild(textArea);
        input.appendChild(icon);
        // 添加ESC键监听
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            closeViewZone();
          }
        };
        textArea.addEventListener("keydown", (e) => {
          console.log("keydown", e);
          setTimeout(() => {
            handleEscape(e);
          }, 100);
        });
        // 添加View Zone
        editor.changeViewZones((accessor) => {
          // 移除之前的View Zone
          if (currentViewZoneId) {
            accessor.removeZone(currentViewZoneId);
          }
          const newViewZone: monaco.editor.IViewZone = {
            afterLineNumber: lineNumber,
            heightInPx: 42, // 根据组件实际高度调整
            domNode: domNode,
            suppressMouseDown: false, // 防止点击时焦点丢失
            onDomNodeTop: (top: number) => {
              // 确保DOM节点位置正确
              domNode.style.top = `${top}px`;
            },
          };
          //监听textArea高度变化
          textArea.addEventListener("input", () => {
            newViewZone.heightInPx = textArea.clientHeight;
          });
          //监听textArea按键，如果是Enter触发代码补全,Shift_Enter 换行
          textArea.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
              if (e.shiftKey) {
                // Shift+Enter 换行
                return; // 允许默认行为
              } else {
                // Enter 触发代码补全
                e.preventDefault();
                const text = textArea.value;
                // TODO: 这里添加代码补全逻辑
                console.log("触发代码补全:", text);
              }
            }
          });
          // 手动处理焦点
          domNode.addEventListener("mousedown", (e) => {
            e.stopPropagation();
            textArea.focus();
          });
          setCurrentViewZoneId(accessor.addZone(newViewZone));
          // 在下一个事件循环确保DOM渲染完成
          setTimeout(() => {
            textArea.focus();
          }, 0);
        });
      },
    });
    const save_action = editor.addAction({
      id: "save-sql",
      label: "Save SQL",
      contextMenuGroupId: "storage",
      contextMenuOrder: 3,
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => { },
    });
    const open_action = editor.addAction({
      id: "open-sql",
      label: "Open SQL",
      contextMenuGroupId: "storage",
      contextMenuOrder: 3,
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO],
      run: () => { },
    });
    console.log("execStatus", execStatus);
    let decorations: monaco.editor.IModelDeltaDecoration[] = [];
    for (let i = 0; i < execStatus.length; i++) {
      const item = execStatus[i];
      const range = new monaco.Range(item.row, 1, item.row, 1);
      decorations.push({
        range: range,
        options: {
          lineNumberClassName: "state-icon state-" + item.type,
        },
      });
    }
    // 创建装饰器集合
    decorationsCollection.current =
      editor.createDecorationsCollection(decorations);


    // 预处理函数：去除注释
    function removeComments(sql: string) {
      // 去除单行注释
      sql = sql.replace(/--.*$/gm, '');
      // 去除多行注释
      sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
      return sql;
    }

    // 预处理函数：匹配表别名
    function parseTableAliases(sql: string) {
      const aliases = {};
      const regex = /FROM\s+([\w]+)(?:\s+AS)?\s+([\w]+)|JOIN\s+([\w]+)(?:\s+AS)?\s+([\w]+)/gi;
      let match;

      while ((match = regex.exec(sql)) !== null) {
        if (match[1] && match[2]) aliases[match[2]] = match[1];
        if (match[3] && match[4]) aliases[match[4]] = match[3];
      }

      return aliases;
    }

    // 获取当前SQL语句（从分号分隔）
    function getCurrentStatement(model: any, position: any) {
      const sql = model.getValue();
      const offset = model.getOffsetAt(position);

      // 找到前一个分号位置
      let prevSemicolon = sql.lastIndexOf(';', offset - 1);
      prevSemicolon = prevSemicolon === -1 ? 0 : prevSemicolon + 1;

      // 找到后一个分号位置
      let nextSemicolon = sql.indexOf(';', offset);
      nextSemicolon = nextSemicolon === -1 ? sql.length : nextSemicolon;

      return sql.substring(prevSemicolon, nextSemicolon);
    }

    // 注册代码提示提供者，并保存返回的 disposable 对象
    const completionItemProvider =
      monaco.languages.registerCompletionItemProvider("sql", {
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });

          console.log("textUntilPosition", textUntilPosition);

          // 一、预处理
          const cleanSQL = removeComments(textUntilPosition);
          const currentStatement = getCurrentStatement(model, position);
          const tableAliases = parseTableAliases(cleanSQL);

          // 二、特殊提示处理
          // 1. 开头提示：位于SQL起始位置
          if (/^\s*$/.test(textUntilPosition)) {
            return {
              suggestions: [
                { label: 'SELECT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'SELECT ' },
                { label: 'CREATE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'CREATE TABLE ' },
                { label: 'INSERT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'INSERT INTO ' },
                { label: 'UPDATE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'UPDATE ' },
                { label: 'DELETE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'DELETE FROM ' },
                { label: 'DROP', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'DROP TABLE ' }
              ]
            };
          }

          // 2. 表名提示：FROM、JOIN、ON等后跟表名
          const tableNameTriggers = [
            { regex: /(FROM|JOIN|INTO)\s*$/i, position: 'after' },
            { regex: /(UPDATE)\s+$/i, position: 'after' },
            { regex: /(DELETE\s+FROM)\s+$/i, position: 'after' }
          ];

          if (tableNameTriggers.some(trigger => trigger.regex.test(textUntilPosition))) {
            return {
              suggestions: Object.keys(databaseMetadata.tables).map(table => ({
                label: table,
                kind: monaco.languages.CompletionItemKind.Struct,
                insertText: table
              }))
            };
          }

          // 3. 字段提示：点后提示字段名
          const dotFieldTrigger = /([\w]+)\.$/i;
          const dotMatch = textUntilPosition.match(dotFieldTrigger);

          if (dotMatch) {
            const aliasOrTable = dotMatch[1];
            const tableName = tableAliases[aliasOrTable] || aliasOrTable;

            if (databaseMetadata.tables[tableName]) {
              return {
                suggestions: databaseMetadata.tables[tableName].map((field: IDataBaseTableColumn) => ({
                  label: field.name,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: field.name,
                  detail: field.comment
                }))
              };
            }
          }

          // 4. 表名后提示关键字
          const afterTableTriggers = [
            { regex: /(FROM|JOIN)\s+[\w]+\s$/i, suggestions: ['WHERE', 'JOIN', 'ON', 'GROUP BY', 'HAVING', 'ORDER BY'] },
            { regex: /(UPDATE)\s+[\w]+\s$/i, suggestions: ['SET'] },
            { regex: /(DELETE\s+FROM)\s+[\w]+\s$/i, suggestions: ['WHERE'] }
          ];

          const afterTableMatch = afterTableTriggers.find(trigger => trigger.regex.test(textUntilPosition));
          if (afterTableMatch) {
            return {
              suggestions: afterTableMatch.suggestions.map(keyword => ({
                label: keyword,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: keyword + ' '
              }))
            };
          }

          // 三、单表查询逻辑
          if (currentStatement.toUpperCase().startsWith('SELECT')) {
            // 获取表名
            const tableMatch = currentStatement.match(/FROM\s+(\w+)/i);
            if (tableMatch) {
              const tableName = tableMatch[1];

              // 1. SELECT之后，FROM之前
              if (/SELECT\s/i.test(textUntilPosition) && !/FROM\s/i.test(textUntilPosition)) {

                const fieldSuggestions = databaseMetadata.tables[tableName].map((field: IDataBaseTableColumn) => ({
                  label: field.name,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: field.name,
                  detail: field.comment

                }));

                const funcSuggestions = databaseMetadata.functions.map(func => ({
                  label: func,
                  kind: monaco.languages.CompletionItemKind.Function,
                  insertText: `${func}($1)`,
                  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,

                }));

                return { suggestions: [...fieldSuggestions, ...funcSuggestions] };
              }

              // 2. FROM之后，WHERE之前
              if (/FROM\s+\w+\s$/i.test(textUntilPosition)) {
                return {
                  suggestions: ['WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT'].map(item => ({
                    label: item,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: item + ' '
                  }))
                };
              }

              // 3. WHERE之后
              if (/WHERE\s/i.test(textUntilPosition)) {
                return {
                  suggestions: [
                    ...databaseMetadata.tables[tableName].map((field: IDataBaseTableColumn) => ({
                      label: field.name,
                      kind: monaco.languages.CompletionItemKind.Field,
                      insertText: field.name,
                      detail: field.comment
                    })),
                    ...['AND', 'OR', 'NOT'].map(keyword => ({
                      label: keyword,
                      kind: monaco.languages.CompletionItemKind.Keyword,
                      insertText: keyword + ' '
                    }))
                  ]
                };
              }
            }
          }

          // 四、单表删除逻辑
          if (currentStatement.toUpperCase().startsWith('DELETE')) {
            const tableMatch = currentStatement.match(/FROM\s+(\w+)/i);
            if (tableMatch) {
              const tableName = tableMatch[1];

              // 1. WHERE之前
              if (/FROM\s+\w+\s$/i.test(textUntilPosition)) {
                return {
                  suggestions: ['WHERE'].map(item => ({
                    label: item,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: item + ' '
                  }))
                };
              }

              // 2. WHERE之后
              if (/WHERE\s$/i.test(textUntilPosition)) {
                return {
                  suggestions: [
                    ...databaseMetadata.tables[tableName].map((field: IDataBaseTableColumn) => ({
                      label: field.name,
                      kind: monaco.languages.CompletionItemKind.Field,
                      insertText: field.name,
                      detail: field.comment
                    })),
                    ...['AND', 'OR', 'NOT'].map(keyword => ({
                      label: keyword,
                      kind: monaco.languages.CompletionItemKind.Keyword,
                      insertText: keyword + ' '
                    }))
                  ]
                };
              }
            }
          }

          // 五、单表修改逻辑
          if (currentStatement.toUpperCase().startsWith('UPDATE')) {
            const tableMatch = currentStatement.match(/UPDATE\s+(\w+)/i);
            if (tableMatch) {
              const tableName = tableMatch[1];

              // 1. SET之后，WHERE之前
              if (/SET\s$/i.test(textUntilPosition) ||
                /,\s*$/i.test(textUntilPosition) ||
                /=\s*$/i.test(textUntilPosition)) {

                const suggestions = [];

                // 字段建议
                databaseMetadata.tables[tableName].forEach((field: IDataBaseTableColumn) => {
                  suggestions.push({
                    label: field.name,
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: field.name,
                    detail: field.comment
                  });

                  // 字段=值格式
                  suggestions.push({
                    label: `${field.name}=`,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: `${field.name} = \${1:value}\$0`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: field.comment
                  });
                });

                // 逗号分隔建议
                suggestions.push({
                  label: ',',
                  kind: monaco.languages.CompletionItemKind.Operator,
                  insertText: ', '
                });

                // WHERE建议
                suggestions.push({
                  label: 'WHERE',
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: '\nWHERE '
                });

                return { suggestions };
              }

              // 2. WHERE之后
              if (/WHERE\s$/i.test(textUntilPosition)) {
                return {
                  suggestions: [
                    ...databaseMetadata.tables[tableName].map((field: IDataBaseTableColumn) => ({
                      label: field.name,
                      kind: monaco.languages.CompletionItemKind.Field,
                      insertText: field.name,
                      detail: field.comment
                    })),
                    ...['AND', 'OR', 'NOT'].map(keyword => ({
                      label: keyword,
                      kind: monaco.languages.CompletionItemKind.Keyword,
                      insertText: keyword + ' '
                    }))
                  ]
                };
              }
            }
          }

          // 默认提示：基本SQL关键字
          const keywords = [
            'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT',
            'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
            'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON',
            'GROUP BY', 'HAVING', 'ORDER BY', 'ASC', 'DESC',
            'LIMIT', 'OFFSET', 'AS', 'DISTINCT', 'BETWEEN',
            'LIKE', 'IN', 'IS NULL', 'IS NOT NULL', 'CASE', 'WHEN'
          ];

          return {
            suggestions: keywords.map(keyword => ({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword.includes(' ') ? keyword + ' ' : keyword + ' '
            }))
          };
        },

        triggerCharacters: ['.', ',', '=', '>', '<', '(', ')', ' ']
      });
    return () => {
      decorationsCollection.current?.clear();
      run_action.dispose();
      format_action.dispose();
      optimize_action.dispose();
      fix_action.dispose();
      completionItemProvider.dispose();
      aiInlineCommand.dispose();
    };
  }, [execStatus, editor, currentViewZoneId, databaseMetadata]);

  const [isMark, setIsMark] = React.useState<boolean>(false);

  useEffect(() => {
    const sqlActioning = (params: ActionParam) => {
      console.log("sqlActioning", params);
      if (params.command === "run") {
        runAction();
      } else if (params.command === "format") {
        formatAction();
      } else if (params.command === "save") {
      }
    };
    window.api.on("view:sql-actioning", sqlActioning);
    const execSqling = (params: { index: number; sql: string }) => {
      console.log("execSqling", params);
      if (editor == null) {
        return;
      }
      //找到是哪一行
      let exeSql = "";
      const selectedText = editor
        .getModel()
        .getValueInRange(editor.getSelection());
      if (selectedText && selectedText.trim() !== "") {
        exeSql = selectedText;
      } else {
        exeSql = editor.getValue();
      }
      const sqls = exeSql.split(";");
      if (params.index >= sqls.length) {
        return;
      }
      let r = 0;
      if (params.index === 0) {
        r = 1;
      } else {
        let len = 0;
        for (let i = 0; i < sqls.length; i++) {
          if (i == params.index) {
            break;
          }
          len += sqls[i].length + 1;
        }
        r = exeSql.substring(0, len).split("\n").length + 1;
      }
      const temp = execStatus.filter((item) => item.row !== r);
      //设置装饰器
      setExecStatus([
        ...temp,
        {
          row: r,
          type: "running",
        },
      ]);
      console.log("execSqling", params);
    };
    window.api.on("db:execSqling", execSqling);
    const execSqlingEnd = (params: {
      index: number;
      sql: string;
      result: {
        status: "success" | "error";
        message: string;
        data: any;
      };
    }) => {
      console.log("execSqlingEnd", params);
      if (editor == null) {
        return;
      }
      //找到是哪一行
      let exeSql = "";
      const selectedText = editor
        .getModel()
        .getValueInRange(editor.getSelection());
      if (selectedText && selectedText.trim() !== "") {
        exeSql = selectedText;
      } else {
        exeSql = editor.getValue();
      }
      const sqls = exeSql.split(";");
      if (params.index >= sqls.length) {
        return;
      }
      let r = 0;
      if (params.index === 0) {
        r = 1;
      } else {
        let len = 0;
        for (let i = 0; i < sqls.length; i++) {
          if (i == params.index) {
            break;
          }
          len += sqls[i].length + 1;
        }
        r = exeSql.substring(0, len).split("\n").length + 1;
      }
      console.log("r", r, "index", params.index);
      const temp = execStatus.filter((item) => item.row !== r);
      //设置装饰器
      setExecStatus([
        ...temp,
        {
          row: r,
          type: "success",
        },
      ]);
      console.log("execSqlEnd", params);
      const _results = [...results];
      _results.push(params);
      //显示执行结果
      putView(props.viewKey, {
        ...view,
        params: {
          ...view.params,
          results: _results,
        },
      });
      setResults(_results);
    };
    window.api.on("db:execSqlEnd", execSqlingEnd);

    const aiMergeSqling = (params: {
      content: string,
      status: number

    }) => {
      console.log("aiMergeSqling", params);

      if (params.status == 799) {
        editor.setValue("");
        //Mark 
        setIsMark(true);


      } else if (params.status == 200) {
        if (params.content.length > 0) {
          editor.setValue(editor.getValue() + params.content);
        }
        //Mark
        setIsMark(false);

      } else if (params.status == 800) {
        editor.setValue(editor.getValue() + params.content);
        const lineCount = editor.getModel().getLineCount();
        const lastLine = editor.getModel().getLineContent(lineCount);

        // 移动光标到底部行
        editor.setPosition({
          lineNumber: lineCount,
          column: lastLine.length + 1
        });

        // 滚动到光标位置
        editor.revealPositionInCenterIfOutsideViewport(
          editor.getPosition(),
          monaco.editor.ScrollType.Smooth
        );
      } else {
        toast.error(t("status." + params.status));
        setIsMark(false);
      }

    };
    window.api.on("ai:mergeSqling", aiMergeSqling);
    return () => {
      window.api.removeAllListeners("view:sql-actioning");
      window.api.removeAllListeners("db:execSqling");
      window.api.removeAllListeners("db:execSqlEnd");
      // window.api.removeAllListeners("ai:inserting");
      window.api.removeAllListeners("ai:mergeSqling");
    };
  }, [execStatus, editor]);
  /**
   * f
   */
  function formatAction() {
    if (editor) {
      editor.setValue(
        sqlFormatter(editor.getValue(), {
          language: "sql",
          tabWidth: 4,
          useTabs: false,
        }),
      );
    }
  }
  /**
   * 运行sql
   */
  function runAction() {
    if (editor) {
      //设置停止按钮
      showStopAction();
      //每次运行时清除之前的装饰器
      setExecStatus([]);
      decorationsCollection.current?.clear();
      //清除执行结果
      setResults([]);
      saveViewValue(props.viewKey, "results", []);
      //执行sql
      let exeSql = "";
      const selectedText = editor
        .getModel()
        ?.getValueInRange(editor.getSelection());
      if (selectedText && selectedText.trim() !== "") {
        exeSql = selectedText;
      } else {
        exeSql = editor.getValue();
      }
      console.log("exeSql", exeSql);
      if (exeSql.trim() !== "") {
        console.log("exeSql", exeSql);
        dbExec(exeSql, false).then((res: IResult) => {
          console.log("dbExec", res);
          if (res.status === 800) {
            if (res.id) {
              setSessionId(res.id);
            }
          } else {
            showPlayAction();
            toast.error(t("status." + res.status));
          }
        });
      }
    }
  }
  /**
   * 优化sql
   */
  function optimizeAction() {
    if (editor) {
      //sql
      let exeSql = "";
      const selectedText = editor
        .getModel()
        ?.getValueInRange(editor.getSelection());
      if (selectedText && selectedText.trim() !== "") {
        exeSql = selectedText;
      } else {
        exeSql = editor.getValue();
      }
      console.log("exeSql", exeSql);
      if (exeSql.trim() !== "") {
        window.api.send("ai:optimizeSql", {
          model: model,
          context: exeSql,
        });
      }
    }
  }
  /**
   * 修复sql
   */
  function fixAction() {
    if (editor) {
      //sql
      let exeSql = "";
      const selectedText = editor
        .getModel()
        ?.getValueInRange(editor.getSelection());
      if (selectedText && selectedText.trim() !== "") {
        exeSql = selectedText;
      } else {
        exeSql = editor.getValue();
      }
      console.log("exeSql", exeSql);
      if (exeSql.trim() !== "") {
        window.api.send("ai:fixSql", { model: model, context: exeSql });
      }
    }
  }
  useEffect(() => {
    if (sessionId && sessionId !== "") {
      let resultTemp: any[] = [];
      const timer = setInterval(() => {
        dbResult(sessionId).then((res: IResult) => {
          console.log("dbResult", res);
          if (res.status === 800) {
            //继续执行
            if (res.data&&res.data.length > 0) {
              const resResults = JSON.parse(res.data);
              if (resResults) {
                resultTemp = [...resultTemp, ...resResults];
                saveViewValue(props.viewKey, "results", resultTemp, true);
                setResults(resultTemp);
              }
            }
          } else if (res.status === 200) {
            console.log("res", res.data&&res.data.length > 0);
               if (res.data&&res.data.length > 0) {
              const resResults = JSON.parse(res.data);
           
            
              if (resResults) {
                  console.log("resResults", resultTemp);
                resultTemp = [...resultTemp, ...resResults];
                saveViewValue(props.viewKey, "results", resultTemp, true);
                setResults(resultTemp);
              }
            }
    
            //执行成功
            setSessionId("");
            showPlayAction();
         
          } else {
            //执行失败
            setSessionId("");
            showPlayAction();
            toast.error(t("status." + res.status));

          }

        });
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [sessionId, results]);
  React.useEffect(() => {
    const _editor = monaco.editor.create(editorRef.current, {
      value: sql || "",
      language: "sql",
      minimap: { enabled: false },
      automaticLayout: true,
    });
    monaco.editor.addKeybindingRule({
      // 当输入 Ctrl+Shift+P 时执行 editor.action.quickCommand
      keybinding:
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP,
      command: "editor.action.quickCommand",
      when: "editorTextFocus",
    });
    setEditor(_editor);
    return () => {
      _editor.dispose();
    };
  }, [view]);
  useEffect(() => {
    if (editor) {
      // 监听内容变化
      const changeListener = editor.onDidChangeModelContent((e) => {
        const _view = getView(props.viewKey);
        if (_view) {
          _view.params.sql = editor.getValue();
          saveView(props.viewKey, _view);
        }
      });
      return () => {
        changeListener.dispose();
      };
    }
  }, [view, editor]);
  const [resultHeight, setResultHeight] = React.useState(300);
  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel direction="vertical" >
          <div ref={editorRef} className="h-full w-full"></div>
          {
            isMark && <div className="left-0 top-0 bottom-0 right-0 absolute z-20 bg-background/20 flex items-center justify-center">
              <LoaderIcon className=" animate-spin" />
            </div>
          }

        </ResizablePanel>
        <ResizablePanelHandle
          direction="vertical"
          className="bg-background/50 rounded-full"
          onMove={(x, y) => {
            const height = resultHeight - y;
            if (height < 100) {
              setResultHeight(0);
              saveViewValue(props.viewKey, "resultHeight", 0);
            } else if (height > 600) {
              setResultHeight(600);
              saveViewValue(props.viewKey, "resultHeight", 600);
            } else {
              setResultHeight(height);
              saveViewValue(props.viewKey, "resultHeight", height);
            }
          }}
        ></ResizablePanelHandle>
        <ResizablePanel height={resultHeight} direction="vertical">
          <SqlResults data={results} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
