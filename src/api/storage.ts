import { ConnectionConfig } from "@/types/db";

export  function getConnectionConfig(){
    window.api.send("storage:getConnectionConfig");
}

export function testConnection(conf: ConnectionConfig) {
    return window.api.invoke("storage:testConnection", conf);
}
//保存并打开连接
export function saveAndOpenConnection(conf: ConnectionConfig) {
   window.api.send("storage:saveAndOpenConnection", conf);
}
//打开连接
export function openConnection(conf: ConnectionConfig) {
   window.api.send("storage:openConnection", conf);
}