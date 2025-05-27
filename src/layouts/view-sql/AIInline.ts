// AICodeCompleter.ts
import * as monaco from "monaco-editor";
import OpenAI from "openai";

export class AIInline {
  private editor: monaco.editor.IStandaloneCodeEditor;

  constructor(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.initializecCommands();
  }

  private initializecCommands(): void {
    let currentViewZoneId: string | null = null;

    // 注册快捷键命令
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      const position = this.editor.getPosition();
      if (!position) return;

      const lineNumber = position.lineNumber;
      const domNode = document.createElement("div");
      domNode.className = "ai-inline";
      const flex = document.createElement("div");
      domNode.appendChild(flex);

      const input = document.createElement("div");
      const textArea = document.createElement("textarea");
      const icon = document.createElement("div");
      flex.appendChild(input);
      input.appendChild(textArea);
      input.appendChild(icon);

      // 渲染React组件到DOM节点
      const closeViewZone = () => {
        this.editor.changeViewZones((accessor) => {
          if (currentViewZoneId) {
            accessor.removeZone(currentViewZoneId);
            currentViewZoneId = null;
          }
        });
        // 清理React组件
      };

      // 添加ESC键监听
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeViewZone();
        }
      };
      document.addEventListener("keydown", handleEscape);

      // 添加View Zone
      this.editor.changeViewZones((accessor) => {
        // 移除之前的View Zone
        if (currentViewZoneId) {
          accessor.removeZone(currentViewZoneId);
        }

        const newViewZone: monaco.editor.IViewZone = {
          afterLineNumber: lineNumber,
          heightInPx: 75, // 根据组件实际高度调整
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
        currentViewZoneId = accessor.addZone(newViewZone);
        // 在下一个事件循环确保DOM渲染完成
        setTimeout(() => {
          textArea.focus();
        }, 0);
      });
    });
  }
}
