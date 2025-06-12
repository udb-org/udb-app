import { IDataBaseEX } from "@/types/db";
import { MysqlEx } from "./mysql";

let checkDriverFlag:Map<string,boolean>=new Map();
/**
 * 
 * This function is used to get the database extension by name and version
 * if version is null, it will return the first version of the database
 * 
 * @param name  databaseType eg:Mysql、Mysql(8)、Mysql(7,8)
 * @param version  database version eg:8、7、6,if name is Mysql(8),version is 8
 * @returns 
 */
export function getDataBaseEX(name:string,version?:string):IDataBaseEX|null{
    const exs=getDataBaseEXs();
    if(exs.length>0){
        for(const ex of exs){
            if(name==ex.getName()+"("+ex.getSupportVersions().join(",")+")"){
                return ex;
            }
            if(ex.getName()===name){
                if(version){
                    if(ex.getSupportVersions().indexOf(version)>=0){
                        //检查版本驱动
                        if(!checkDriverFlag.get(ex.getName()+ex.getSupportVersions().join(","))){
                            
                        }
                        return ex;
                    }
                }else{
                    return ex;
                }
            }
        }
    }
    return null;
}
export function getDataBaseEXs():IDataBaseEX[]{
    return [new MysqlEx()];
}