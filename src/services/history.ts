//历史记录管理
import * as fs from 'fs';
import * as path from 'path';
/**
 * 检查和创建目录
 */
export function checkAndCreateHistoryFolder(connectionName: string, databaseName: string) {
    const userHomeDir = require('os').homedir();
const udbFolderPath = path.join(userHomeDir, '.udb');
const historyFolderPath = path.join(udbFolderPath, 'history');
    if (!fs.existsSync(historyFolderPath)) {
        fs.mkdirSync(historyFolderPath);
    }
    const connectionFolderPath = path.join(historyFolderPath, connectionName);
    if (!fs.existsSync(connectionFolderPath)) {
        fs.mkdirSync(connectionFolderPath);
    }
    const historyPath = path.join(connectionFolderPath, `${databaseName}.json`);
    if (!fs.existsSync(historyPath)) {
        return false;
    }
    return true;
}
/**
 * 获取历史记录
 * @param connectionName 
 * @param databaseName 
 */
export function getHistory(connectionName: string, databaseName: string) {
    const userHomeDir = require('os').homedir();
const udbFolderPath = path.join(userHomeDir, '.udb');
const historyFolderPath = path.join(udbFolderPath, 'history');
    if (checkAndCreateHistoryFolder(connectionName, databaseName)) {
        const historyPath = path.join(historyFolderPath, connectionName, `${databaseName}.json`);
        const history = fs.readFileSync(historyPath, 'utf-8');
        return JSON.parse(history);
    } else {
        return [];
    }
}
/**
 * 添加历史记录
 * @param connectionName 
 * @param databaseName 
 * @param sql 
 */
export function addHistory(connectionName: string, databaseName: string, sql: string) {
    const userHomeDir = require('os').homedir();
const udbFolderPath = path.join(userHomeDir, '.udb');
const historyFolderPath = path.join(udbFolderPath, 'history');
    console.log("addHistory",connectionName,databaseName,sql);
    const historyPath = path.join(historyFolderPath, connectionName, `${databaseName}.json`);
    if (checkAndCreateHistoryFolder(connectionName, databaseName)) {
        let history = getHistory(connectionName, databaseName);
        if(history.length>0){
            //删除重名的
            history = history.filter((item:any)=>item.sql!==sql);
        }
        history.push({
            sql: sql,
            time: new Date().toISOString(),
        });
        // 只保留最近的100条记录
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        fs.writeFile(historyPath, JSON.stringify(history, null, 4), {
            encoding:'utf-8'
        },()=>{});
    } else {
        fs.writeFile(historyPath, JSON.stringify([{
            sql: sql,
            time: new Date().toISOString(),
        }], null, 4), {
            encoding:'utf-8'
        },()=>{});
    }
}