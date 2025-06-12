import { ConnectionConfig } from "@/types/db";


export function testConnection(conf: ConnectionConfig) {
    return window.api.invoke("db:testConnection", conf);
}
//保存并打开连接
export function saveAndOpenConnection(conf: ConnectionConfig) {
   window.api.send("db:saveAndOpenConnection", conf);
}
//打开连接
export function openConnection(conf: ConnectionConfig) {
   window.api.send("db:openConnection", conf);
}