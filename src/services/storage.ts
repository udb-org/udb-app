import { ConnectionConfig } from '@/types/db';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import { IProject } from '@/types/project';
const userHomeDir = require('os').homedir();
const udbFolderPath = path.join(userHomeDir, '.udb');
/**
 * 启动存储
 */
export function startStorage() {
    if (!checkUdbFolderExists()) {
        initUdbFolder();
    }  
}

/**
 * 检查用户目录是否存在.udb文件夹，同步创建
 */
export function checkUdbFolderExists() {
   
    if (!fs.existsSync(udbFolderPath)) {
        return false;
    }
    return true;
}
/**
 * 初始化.udb文件夹目录,同步创建
 */
const algorithm = 'aes-256-cbc'; // 使用AES-256-CBC算法
const keyPath = path.join(udbFolderPath, 'secure.key');

// 初始化安全密钥
function initSecureKey() {
    if (!fs.existsSync(keyPath)) {
        // 生成32字节（256位）的随机密钥
        const key = crypto.randomBytes(32);
        fs.writeFileSync(keyPath, key.toString('hex'));
    }
}

// 加密密码
function encryptPassword(password: string): { iv: string; encrypted: string } {
    const iv = crypto.randomBytes(16);
    const key = fs.readFileSync(keyPath, 'utf-8');
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encrypted };
}

// 解密密码 
function decryptPassword(encrypted: string, ivHex: string): string {
    const key = fs.readFileSync(keyPath, 'utf-8');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// 修改初始化函数
export function initUdbFolder() {
    //创建目录
    if (!fs.existsSync(udbFolderPath)) {
        fs.mkdirSync(udbFolderPath);
    }
    //创建文件
    initConnectionConfig();
    initSecureKey(); // 初始化密钥文件
}
/**
 * 初始化连接配置文件，json格式
 */
export function initConnectionConfig() {
    const confPath = path.join(udbFolderPath, 'connections.json');
    if (!fs.existsSync(confPath)) {
        fs.writeFileSync(confPath, '[]');
    }
}
/**
 * 读取连接配置文件,json格式
 */
export function readConnectionConfig(): ConnectionConfig[]  {
    //读取文件
    const confPath = path.join(udbFolderPath, 'connections.json');
    if (!fs.existsSync(confPath)) {
        return [];
    }
    const confStr = fs.readFileSync(confPath, 'utf-8');
   
    const conf = JSON.parse(confStr);
   
    conf.forEach((item: ConnectionConfig) => {
        if (item.password) {
            const [iv, encrypted] = item.password.split(':');
            if (iv && encrypted) {
                item.password = decryptPassword(encrypted, iv);
            }
        }
    });
    return conf;
}
/**
 * 写入连接配置文件,json格式.utf-8编码
 */
export function writeConnectionConfig(conf: ConnectionConfig[]) {
    //加密密码
    conf.forEach(item => {
        if (item.password) {
            const { iv, encrypted } = encryptPassword(item.password);
            item.password = `${iv}:${encrypted}`; // 存储IV和密文
        }
      
    });
    //写入文件
    const confPath = path.join(udbFolderPath, 'connections.json');
    fs.writeFileSync(confPath, JSON.stringify(conf, null, 4), 'utf-8');
}



/**
 * 获取所有模型
 */
export function getModels(){
    const modelsPath = path.join(udbFolderPath,'models.json');
    if(!fs.existsSync(modelsPath)){
        return [];
    }
    return JSON.parse(fs.readFileSync(modelsPath,'utf-8'));
}
export function addModel(model:any){
    const modelsPath = path.join(udbFolderPath,'models.json');
    if(!fs.existsSync(modelsPath)){
        fs.writeFileSync(modelsPath,JSON.stringify([model],null,4),'utf-8');
    }else{
        const models=JSON.parse(fs.readFileSync(modelsPath,'utf-8'));
        for(const m of models){
            if(m.key==model.key){
                return;
            }
        }
        models.push(model);
        fs.writeFileSync(modelsPath,JSON.stringify(models,null,4),'utf-8');
    }
}
export function removeModel(modelKey:any){
    const modelsPath = path.join(udbFolderPath,'models.json');
    if(!fs.existsSync(modelsPath)){
        return;
    }else{
        const models=JSON.parse(fs.readFileSync(modelsPath,'utf-8'));
        const newModels=models.filter((m:any)=>m.key!=modelKey);
        fs.writeFileSync(modelsPath,JSON.stringify(newModels,null,4),'utf-8');
        
    }
}


let configCache:any=null;
/**
 * 使用缓存配置，增加性能
 * 获取配置项
 * @param key  
 * @returns 
 */
export function getConfigItem(key:string){
    if(configCache==null){
        configCache=getConfig();
    }
    return configCache[key];
}

/**
 * 获取配置
 * @returns 
 */
export function getConfig(){
    const configPath = path.join(udbFolderPath,'config.json');
    if(!fs.existsSync(configPath)){
        return {};
    }
    return JSON.parse(fs.readFileSync(configPath,'utf-8'));
}
/**
 * 设置配置
 * @param config
 */
export function setConfig(config:any){
    const configPath = path.join(udbFolderPath,'config.json');
    configCache=config;
    if(!fs.existsSync(configPath)){
        fs.writeFileSync(configPath,JSON.stringify(config,null,4),'utf-8');
    }else{
        fs.writeFileSync(configPath,JSON.stringify(config,null,4),'utf-8');
    }
}
//获取最近的项目
export function getRecentProjects(){
    const configPath = path.join(udbFolderPath,'projects.json');
    if(!fs.existsSync(configPath)){
        return [];
    }
    const recentProjects:IProject[]=JSON.parse(fs.readFileSync(configPath,'utf-8'));
    return recentProjects;
}
//设置最近的项目
export function setRecentProjects(projects:IProject[]){
    const configPath = path.join(udbFolderPath,'projects.json');
    if(!fs.existsSync(configPath)){
        fs.writeFileSync(configPath,JSON.stringify(projects,null,4),'utf-8');
    }else{
        fs.writeFileSync(configPath,JSON.stringify(projects,null,4),'utf-8');
    }       
    
}