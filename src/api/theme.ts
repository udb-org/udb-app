import * as monaco from "monaco-editor";
export function updateDocumentTheme(isDarkMode: boolean) {
    if (!isDarkMode) {
      document.documentElement.classList.remove("dark");
      monaco.editor.setTheme("vs");
    } else {
      document.documentElement.classList.add("dark");
      monaco.editor.setTheme("vs-dark");
    }
  }