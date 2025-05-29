import React, { useEffect, useMemo } from "react";
import * as monaco from "monaco-editor";
import {
  getView,
  saveView,
  saveViewValue,
  useTabStore,
} from "@/store/tab-store";
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SqlActionParams } from "@/api/view";
import { AlignRight, PlayIcon, SaveIcon, ShareIcon } from "lucide-react";
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
export const ViewSQLActions = [
  {
    name: "Run",
    command: "run",
    icon: PlayIcon,
  },
];

export default function ViewSQL(props: { viewKey: string }) {
  const [results, setResults] = React.useState<any[]>([]);
  const [view, setView] = React.useState<any>(null);
  const { model } = useAiStore();
  useEffect(() => {
    //加载执行结果
    let _view = getView(props.viewKey);
    let _results = [];
    let _sql = "";
    if (_view) {
      if (_view.results) {
        _results = _view.results;
      }
      if (_view.params.sql) {
        _sql = _view.params.sql;
      }
    }
    setSql(_sql);
    setResults(_results);
    setView(_view);
  }, [props.viewKey]);

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
      run: () => {},
    });
    const open_action = editor.addAction({
      id: "open-sql",
      label: "Open SQL",
      contextMenuGroupId: "storage",
      contextMenuOrder: 3,
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO],
      run: () => {},
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

    // 注册代码提示提供者，并保存返回的 disposable 对象
    const completionItemProvider =
      monaco.languages.registerCompletionItemProvider("sql", {
        provideCompletionItems: async (model, position, context, token) => {
          console.log(
            "provideCompletionItems",
            model,
            position,
            context,
            token,
          );
          // 获取当前行内容
          const lineLeftText = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });
          const lineRightText = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: model.getLineMaxColumn(position.lineNumber),
          });
          const lineText = lineLeftText + lineRightText;
          console.log("lineText", lineText);
          //以下情况下，返回所有的表名
          if (
            lineLeftText.trim().toUpperCase().endsWith("FROM") ||
            lineLeftText.trim().toUpperCase().endsWith("JOIN") ||
            lineLeftText.trim().toUpperCase().endsWith("INNER JOIN") ||
            lineLeftText.trim().toUpperCase().endsWith("LEFT JOIN") ||
            lineLeftText.trim().toUpperCase().endsWith("RIGHT JOIN") ||
            lineLeftText.trim().toUpperCase().endsWith("FULL JOIN") ||
            lineLeftText.trim().toUpperCase().endsWith("CROSS JOIN") ||
            lineLeftText.trim().toUpperCase().endsWith("ON")
          ) {
            const tables = [];
            const res = await window.api.invoke("db:getTables", "");
            console.log("res", res);
            if (res.status === "success") {
              const dbs = res.data.data;
              const suggestions = dbs.map((db: any) => {
                return {
                  label: db.TABLE_NAME,
                  kind: monaco.languages.CompletionItemKind.Class,
                  insertText: db.TABLE_NAME,
                };
              });
              return {
                suggestions: suggestions,
              };
            }
            return {
              suggestions: tables.map((table) => {
                return {
                  label: table,
                  kind: monaco.languages.CompletionItemKind.Class,
                  insertText: table,
                };
              }),
            };
          }
          //以下情况下返回表字段，1、以SELECT结束，2、以,结束，3、以WHERE、AGROUP BY、HAVING、ORDER BY、AND、OR、(、结尾
          if (
            lineLeftText.trim().toUpperCase().endsWith("SELECT") ||
            lineLeftText.trim().toUpperCase().endsWith(",") ||
            lineLeftText.trim().toUpperCase().endsWith("WHERE") ||
            lineLeftText.trim().toUpperCase().endsWith("GROUP BY") ||
            lineLeftText.trim().toUpperCase().endsWith("HAVING") ||
            lineLeftText.trim().toUpperCase().endsWith("ORDER BY") ||
            lineLeftText.trim().toUpperCase().endsWith("AND") ||
            lineLeftText.trim().toUpperCase().endsWith("OR") ||
            lineLeftText.trim().toUpperCase().endsWith("(")
          ) {
            //从lineText 获取表名
            const tableNames = getTableNames(lineText);

            console.log("tableName", tableNames);

            const res = await window.api.invoke("db:getColumns", tableNames[0]);
            console.log("res", res);
            if (res.status === "success") {
              const dbs = res.data.data;
              const suggestions = dbs.map((db: any) => {
                return {
                  label: db.COLUMN_NAME,
                  kind: monaco.languages.CompletionItemKind.Class,
                  insertText: db.COLUMN_NAME,
                };
              });
              return {
                suggestions: suggestions,
              };
            }
            return {
              suggestions: [],
            };
          }

          //如何是.结束，说明.前面是表，后面是字段
          if (lineLeftText.trim().toUpperCase().endsWith(".")) {
            //从获取.前面的表名
            const lLT = lineLeftText.trim();
            console.log("endsWith . ", lLT);

            const lLTs = lLT.substring(0, lLT.length - 1).split(" ");
            let tableName = lLTs[lLTs.length - 1];
            //判断tableName 是真实表名还是别名，使用正侧表达式匹配[a-zA-Z0-9_]+ tableName 存在
            const regex = new RegExp(`[a-zA-Z0-9_]+ ${tableName}`, "i");
            //使用#替代所有的关键字
            let lineTextRp = lineText.toUpperCase().replaceAll(" FROM ", " # ");
            lineTextRp = lineTextRp.replaceAll(" JOIN ", " # ");
            lineTextRp = lineTextRp.replaceAll(" ON ", " # ");
            lineTextRp = lineTextRp.replaceAll("SELECT ", "# ");
            console.log("lineTextRp", lineTextRp);
            if (regex.test(lineTextRp)) {
              //如果是别名，则获取别名对应的表名
              const matches = lineTextRp.match(regex);
              if (matches) {
                tableName = matches[0].split(" ")[0];
              }
            }
            console.log("tableName", tableName);
            if (tableName) {
              const res = await window.api.invoke("db:getColumns", tableName);
              console.log("res", res);
              if (res.status === "success") {
                const dbs = res.data.data;
                const suggestions = dbs.map((db: any) => {
                  return {
                    label: db.COLUMN_NAME,
                    kind: monaco.languages.CompletionItemKind.Class,
                    insertText: db.COLUMN_NAME,
                  };
                });
                return {
                  suggestions: suggestions,
                };
              }
              return {
                suggestions: [],
              };
            }
          }

          // 如果当前行内容为空，则返回空数组
          if (lineText === "") {
            return { suggestions: [] };
          }

          return {
            suggestions: getSqlSuggestionsKeywords(),
          };
        },
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
  }, [execStatus, editor, currentViewZoneId]);
  useEffect(() => {
    const sqlActioning = (params: SqlActionParams) => {
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

    const aiInserting = (context: string) => {
      console.log("aiInserting", context);
      if (editor == null) {
        return;
      }
      //在光标处插入内容
      const position = editor.getPosition();
      if (position) {
        editor.executeEdits("aiInsert", [
          {
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column,
            ),
            text: context,
          },
        ]);
      }
    };
    window.api.on("ai:inserting", aiInserting);

    return () => {
      window.api.removeAllListeners("view:sql-actioning");
      window.api.removeAllListeners("db:execSqling");
      window.api.removeAllListeners("db:execSqlEnd");
      window.api.removeAllListeners("ai:inserting");
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
        dbExec(exeSql, false).then((res: any) => {
          console.log("dbExec", res);
          if (res.status === "running") {
            setSessionId(res.id);
          } else {
            if (res.error) {
              toast.error(res.error);
            } else if (res.message) {
              toast.error(res.message);
            }
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
      const timer = setInterval(() => {
        dbResult(sessionId).then((res: any) => {
          console.log("dbResult", res);
          if (res.error) {
            toast.error(res.error);
            setSessionId("");
          } else if (res.status === "fail") {
            toast.error(res.message);
            setSessionId("");
          } else {
            if (res.data.length > 0) {
              const resResults = JSON.parse(res.data);
              if (resResults.length > 0) {
                saveViewValue(props.viewKey, "results", resResults, true);
                setResults([...results, ...resResults]);
              }
            }
            if (res.status === "success") {
              setSessionId("");
            }
          }
        });
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [sessionId]);

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
        <ResizablePanel direction="vertical">
          <div ref={editorRef} className="h-full w-full"></div>
        </ResizablePanel>
        <ResizablePanelHandle
          direction="vertical"
          className="bg-background/50 rounded-full"
          onMove={(x, y) => {
            const height = resultHeight - y;

            if (height < 100) {
              setResultHeight(0);
            } else if (height > 600) {
              setResultHeight(600);
            } else {
              setResultHeight(height);
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
