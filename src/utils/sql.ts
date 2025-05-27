/**
 * 获取SQL语句中的表名
 * @param sql SQL语句
 * @returns 表名数组
 */
export function getTableNames(sql: string) {
  const tableNames: string[] = [];

  // 预处理：移除所有注释（简单处理单行/多行注释）
  const cleanedSql = sql
    .replace(/--.*$/gm, "") // 移除单行注释
    .replace(/\/\*[\s\S]*?\*\//g, ""); // 移除多行注释

  // 匹配DDL操作：CREATE/ALTER/DROP TABLE/VIEW
  const ddlRegex =
    /(create|alter|drop)\s+(table|view)\s+(?:if\s+(?:not\s+)?exists\s+)*((?:`[^`]*`|"[^"]*"|$$[^$$]*\]|[^\s();]+))/gi;

  // 匹配DML操作：SELECT/INSERT/UPDATE/DELETE中的表（主要处理FROM/JOIN子句）
  const dmlRegex =
    /(?:from|join|update|into)\s+((?:`[^`]*`|"[^"]*"|$$[^$$]*\]|[^\s(),]+)(?:\.(?:`[^`]*`|"[^"]*"|$$[^$$]*\]|[^\s(),]+))?)(?:\s+(?:as\s+)?\w+)?/gi;

  // 处理DDL语句
  let match;
  while ((match = ddlRegex.exec(cleanedSql)) !== null) {
    processAndPushName(match[3], tableNames);
  }

  // 处理DML语句
  while ((match = dmlRegex.exec(cleanedSql)) !== null) {
    const rawTables = match[1];
    // 分割逗号分隔的表名（例如 FROM table1, table2）
    rawTables.split(/\s*,\s*/).forEach((rawTable) => {
      // 移除表别名（例如 FROM table1 AS t1）
      const rawName = rawTable.split(/\s+(?:as\s+)?/i)[0];
      processAndPushName(rawName, tableNames);
    });
  }

  return tableNames;
}

/** 规范化表名并加入数组 */
function processAndPushName(rawName: string, tableNames: string[]) {
  const processed = rawName
    .split(".")
    .map((part) => {
      // 处理被反引号、双引号、方括号包裹的标识符
      if (
        (part.startsWith("`") && part.endsWith("`")) ||
        (part.startsWith('"') && part.endsWith('"')) ||
        (part.startsWith("[") && part.endsWith("]"))
      ) {
        return part.slice(1, -1);
      }
      return part;
    })
    .join(".");
  tableNames.push(processed);
}
