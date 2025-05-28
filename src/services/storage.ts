import { ConnectionConfig } from '@/types/db';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import { IProject } from '@/types/project';
import { configTemplate } from './config-template';
const userHomeDir = require('os').homedir();
const udbFolderPath = path.join(userHomeDir, '.udb');

// Initialize storage
export function startStorage() {
    if (!checkUdbFolderExists()) {
        initUdbFolder();
    }  
}

/**
 * Check if .udb folder exists in user directory (synchronously creates if not)
 */
export function checkUdbFolderExists() {
    if (!fs.existsSync(udbFolderPath)) {
        return false;
    }
    return true;
}
/**
 * Initialize .udb folder structure (synchronously creates)
 */
const algorithm = 'aes-256-cbc'; // Using AES-256-CBC algorithm
const keyPath = path.join(udbFolderPath, 'secure.key');

// Initialize security key
function initSecureKey() {
    if (!fs.existsSync(keyPath)) {
        // 生成32字节（256位）的随机密钥
        const key = crypto.randomBytes(32);
        fs.writeFileSync(keyPath, key.toString('hex'));
    }
}

// Encrypt password
function encryptPassword(password: string): { iv: string; encrypted: string } {
    const iv = crypto.randomBytes(16);
    const key = fs.readFileSync(keyPath, 'utf-8');
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encrypted };
}

// Decrypt password 
function decryptPassword(encrypted: string, ivHex: string): string {
    const key = fs.readFileSync(keyPath, 'utf-8');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Modified initialization function
export function initUdbFolder() {
    // Create directory
    if (!fs.existsSync(udbFolderPath)) {
        fs.mkdirSync(udbFolderPath);
    }
    // Create files
    initConnectionConfig();
    initSecureKey(); // Initialize key file
}
/**
 * Initialize connection config file (JSON format)
 */
export function initConnectionConfig() {
    const confPath = path.join(udbFolderPath, 'connections.json');
    if (!fs.existsSync(confPath)) {
        fs.writeFileSync(confPath, '[]');
    }
}
/**
 * Read connection config file (JSON format)
 */
export function readConnectionConfig(): ConnectionConfig[]  {
    // Reading file
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
 * Write connection config file (JSON format, UTF-8 encoding)
 */
export function writeConnectionConfig(conf: ConnectionConfig[]) {
    // Encrypt passwords
    conf.forEach(item => {
        if (item.password) {
            const { iv, encrypted } = encryptPassword(item.password);
            item.password = `${iv}:${encrypted}`; // 存储IV和密文
        }
      
    });
    // Writing file
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
    if(configCache!=null){
        return configCache;
    }
    if(!fs.existsSync(udbFolderPath)){
        return configTemplate
    }
    const configPath = path.join(udbFolderPath,'config.json');
    if(!fs.existsSync(configPath)){
        fs.writeFileSync(configPath,JSON.stringify(configTemplate,null,4),'utf-8');
        return configTemplate;
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