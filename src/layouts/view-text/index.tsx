import React, { useEffect, useMemo } from "react";
import * as monaco from 'monaco-editor';
import { getView, saveView, useTabStore } from "@/store/tab-store";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SqlActionParams } from "@/api/view";
import { AlignRight, PlayIcon, SaveIcon, ShareIcon } from "lucide-react";
import { dbExec, dbResult, execSql } from "@/api/db";

import { format as sqlFormatter } from "sql-formatter";
import { toast } from "sonner";

export default function ViewText(
    props: {
        viewKey: string;
    }
) {


    const view = useMemo(() => {
        return getView(props.viewKey);
    }, [props.viewKey])
    const [editor, setEditor] = React.useState<any>(null);
    const editorRef = React.useRef<any>(null);
    const [content, setContent] = React.useState<string>(view?.content || "");


    React.useEffect(() => {
        let language="text";
        if(view.type==="sql"){
            language="sql";
        }else if(view.type==="text"){
            const extName=view.name.substring(view.name.lastIndexOf(".")+1);
            const ext:any={
                ".sql":"sql",
                ".json":"json",
                ".yaml":"yaml",
                ".yml":"yaml",
                ".js":"javascript",
                ".ts":"typescript", 
                ".java":"java",
                ".py":"python",
                ".go":"go",
                ".php":"php",
                ".rb":"ruby",
                ".c":"c",
                ".txt":"text",
                ".md":"markdown",
                ".html":"html",
                ".css":"css",
                ".less":"less",
                ".scss":"scss",
                ".xml":"xml",
                ".svg":"svg",
                ".vue":"vue",
                ".jsx":"javascriptreact",
                ".tsx":"typescriptreact",
     

              
                
            }
            if(ext[extName]){
                language=ext[extName];
            }
        }
        const _editor = monaco.editor.create(editorRef.current, {
            value: view && view.params.content || '',
            language: 'sql',
            minimap: { enabled: false },
            automaticLayout: true,
        });
        // monaco.editor.addKeybindingRule({
        //     // 当输入 Ctrl+Shift+P 时执行 editor.action.quickCommand
        //     keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP,
        //     command: 'editor.action.quickCommand',
        //     when: 'editorTextFocus'
        // });
        setEditor(_editor);
        return () => {
            _editor.dispose();
        };
    }, [props.viewKey])
    useEffect(() => {
        if (editor) {
            // 监听内容变化
            const changeListener = editor.onDidChangeModelContent((e) => {
                const _view = getView(props.viewKey);
                if (_view) {
                    _view.params.content = editor.getValue();
                    saveView(props.viewKey, _view);
                }
            });
            return () => {
                changeListener.dispose();
            };
        }
    }, [view, editor])

    return <div className="w-full h-full " >
        <div ref={editorRef} className="w-full h-full"></div>
    </div>
}