import { IDataBaseEX } from "@/types/db";
import { MysqlEx } from "./mysql";
/**
 * 
 * get database extension by name
 * 
 * @param name  database name
 * @returns 
 */
export function getDataBaseEX(name:string):IDataBaseEX|null{
    if(name==="mysql"){
        return new MysqlEx();
    }
    return null;
}