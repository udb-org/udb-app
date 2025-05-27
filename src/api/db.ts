export function execSql(sqls: string) {
  window.api.send("db:execSql", sqls);
}
export function invokeSql(sqls: string) {
  return window.api.invoke("db:invokeSql", sqls);
}
export function addDatabase(database: string) {
  return window.api.send("db:addDatabase", database);
}
export function deleteDatabase(database: string) {
  return window.api.send("db:delDatabase", database);
}
export function dropTable(table: string) {
  return window.api.send("db:dropTable", table);
}
export function dbExec(sql: string, isTransaction: boolean) {
  return window.api.invoke("db:exec", {
    sql: sql,
    isTransaction: isTransaction,
  });
}
export function dbResult(id: string) {
  return window.api.invoke("db:result", id);
}
export function dbStop(id: string) {
  return window.api.invoke("db:stop", id);
}
export function dbCommit(id: string) {
  return window.api.invoke("db:commit", id);
}
export function dbRollback(id: string) {
  return window.api.invoke("db:rollback", id);
}
export function getTasks() {
  return window.api.invoke("db:getTasks");
}
