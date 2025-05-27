// AICodeCompleter.ts
import * as monaco from 'monaco-editor';
import OpenAI from 'openai';



export class AICodeCompleter {
  private editor: monaco.editor.IStandaloneCodeEditor;
  private decorations: monaco.editor.IEditorDecorationsCollection; // 修改为新的装饰器集合类型
  private currentSuggestion = '';
  private lastPosition: monaco.Position | null = null;
  private debounceTimeout: number | null;

  // 配置项
  private readonly debounceTime: number = 3000;
  private readonly maxTokens: number;
  private readonly model: string;

  constructor(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.decorations = this.editor.createDecorationsCollection(); // 初始化装饰器集合
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // 内容变化监听
    this.editor.onDidChangeModelContent(() => this.handleContentChange());

    // 键盘事件监听
    this.editor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Tab && this.currentSuggestion) {
        e.preventDefault();
        this.acceptSuggestion();
      }
    });

    // 光标移动监听
    this.editor.onDidChangeCursorPosition(() => {
      if (this.lastPosition && !this.lastPosition.equals(this.editor.getPosition()!)) {
        this.clearSuggestion();
      }
    });
  }

  private handleContentChange(): void {
    if (this.debounceTimeout) {
      window.clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = window.setTimeout(async () => {
      await this.provideSuggestion();
    }, this.debounceTime);
  }

  private async provideSuggestion(): Promise<void> {
    console.log("provideSuggestion");
    try {
      const position = this.editor.getPosition();
      if (!position) return;

      const model = this.editor.getModel();
      if (!model) return;
      //获取编辑器的内容
      const content = model.getValue();
      console.log("position.lineNumber", position.lineNumber);
      
      //根据光标的位置在content中插入内容
      let bef = "";//全文之前，不止一行
      for (let i = 1; i < position.lineNumber; i++) {
        console.log("i", model.getLineContent(i));
        bef += model.getLineContent(i) + "\n";
      }
      console.log("bef", bef);
    
      //获取光标之前的内容
      bef += model.getLineContent(position.lineNumber).substring(0, position.column - 1);
      console.log("bef", bef);


      let after = "";
      //获取光标之后的内容
      after += model.getLineContent(position.lineNumber).substring(position.column - 1);
      //获取光标之后的内容，包括换行
      for (let i = position.lineNumber + 1; i <= model.getLineCount(); i++) {
        after += "\n" + model.getLineContent(i);
      }
      console.log("after", after);
      const prefix = bef + "[在此处补全代码]" + after;
      console.log("prefix", prefix);
      if (prefix.length < 3) return;

      const suggestion = await this.getAISuggestion(prefix);
      this.showSuggestion(suggestion, position);
    } catch (error) {
      console.error('AI Completion Error:', error);
      this.clearSuggestion();
    }
  }

  private async getAISuggestion(prefix: string): Promise<string> {
    console.log("getAISuggestion", prefix);
    const res = await window.api.invoke("ai-completion", {
      prefix: prefix
    });
    console.log("ai", res);
    return this.sanitizeSuggestion(res);
  }

  private sanitizeSuggestion(suggestion: string): string {
    console.log("sanitizeSuggestion", suggestion);
    return suggestion
      .replace(/^`+|`+$/g, '')     // 移除代码块标记
      .replace(/\/\/.*$/g, '')     // 移除注释
      .split('\n')[0]              // 取第一行
      .trim();
  }
  /**
   * 
   * 显示建议代码
   * 
   * @param suggestion 
   * @param position 
   * @returns 
   */
  private showSuggestion(suggestion: string, position: monaco.Position): void {
    if (!suggestion) return;
    this.currentSuggestion = suggestion;
    this.lastPosition = position;
    const model = this.editor.getModel();
    if (!model) return;
    const lineContent = model.getLineContent(position.lineNumber);
    if (lineContent.length == 0) {
      //向编辑器这一行先插入一个空格
      model.pushEditOperations([], [{
        range: new monaco.Range(
          position.lineNumber,
          1,  // 起始列为1
          position.lineNumber,
          1  // 结束列也为1
        ),
        text: ' '
      }],null);

      const decoration: monaco.editor.IModelDeltaDecoration = {
        range: new monaco.Range(
          position.lineNumber,
          1,  // 起始列为1
          position.lineNumber,
          1  // 结束列也为1
        ),
        options: {
          before: {
            content: suggestion,
            inlineClassName: 'ai-inline-suggestion',
            cursorStops: monaco.editor.InjectedTextCursorStops.None
          }
        }
      };
      console.log("decoration", JSON.stringify(decoration));
      this.decorations.set([decoration]);


    } else {

      const col = position.column;

      const decoration: monaco.editor.IModelDeltaDecoration = {
        range: new monaco.Range(
          position.lineNumber,
          col - 1,  // 使用调整后的起始列
          position.lineNumber,
          col      // 保持结束列为当前列
        ),
        options: {
          after: {
            content: suggestion,
            inlineClassName: 'ai-inline-suggestion',
            cursorStops: monaco.editor.InjectedTextCursorStops.None
          }
        }
      };
      console.log("decoration", JSON.stringify(decoration));
      this.decorations.set([decoration]);
    }






  }

  private clearSuggestion(): void {
    this.decorations.clear(); // 使用 clear 方法清除所有装饰器
    this.currentSuggestion = '';
    this.lastPosition = null;
  }

  private acceptSuggestion(): void {
    if (!this.lastPosition || !this.currentSuggestion) return;

    this.editor.executeEdits('ai-completion', [{
      range: new monaco.Range(
        this.lastPosition.lineNumber,
        this.lastPosition.column,
        this.lastPosition.lineNumber,
        this.lastPosition.column
      ),
      text: this.currentSuggestion,
      forceMoveMarkers: true
    }]);

    this.clearSuggestion();
  }

  public dispose(): void {
    this.clearSuggestion();
    // 这里可以添加其他清理逻辑
  }
}

// 样式定义（建议在全局CSS中定义）
declare global {
  interface CSSStyleSheet {
    insertRule(rule: string, index?: number): void;
  }
}

const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  .ai-inline-suggestion {
    opacity: 0.5;
  }
`);