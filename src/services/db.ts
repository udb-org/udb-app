//数据库操作
import { ConnectionConfig, IDataSource } from "@/types/db";
import { executeSql } from "./db-client";
/**
 * 测试连接
 */
export function testConnection(conf: ConnectionConfig) {
    //测试连接
    const datasource:IDataSource = {
        name:conf.name,
        type:conf.type,
        host:conf.host,
        port:conf.port,
        username:conf.username,
        password:conf.password,
        driver:conf.driver,
        database:conf.database,
        params:conf.params
    };
    return executeSql("select 1",datasource)
}