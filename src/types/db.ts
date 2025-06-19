export interface IDataBaseEXCall{
    sql:string;
    callback?:(res:IResult)=>IResult;
} 
export interface IDataBaseEX {
    getName(): string;
    getSupportVersions(): string[];
    /**
     * get driver jar path
     * support :
     * 2.https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/9.3.0/mysql-connector-j-9.3.0.jar
     * 3./Users/xxx/driver/mysql/mysql-connector-java-8.0.33.jar
     * 4.C:\Users\xxx\driver\mysql\mysql-connector-java-8.0.33.jar
     * @returns 
     */
    getDriverPath(): string;
    getDriverJdbcUrl(datasource: IDataSource): string;
    getDriverMainClass(): string;
    getDriverInstallUri(): string;

    showDatabases():IDataBaseEXCall;
    newDatabase(databaseName:string):IDataBaseEXCall;
    dropDatabase(databaseName:string):IDataBaseEXCall;

    showTables(databaseName:string):IDataBaseEXCall;
    showTable(databaseName:string,tableName:string):IDataBaseEXCall;
    /**
     * 
     * @param databaseName 
     * @param tableName 
     * @return data:ddl
     */
    showTableDDL(databaseName:string,tableName:string):IDataBaseEXCall;
    copyTableStructure(databaseName:string,tableName:string,newTableName:string):IDataBaseEXCall;
    dropTable(databaseName:string,tableName:string):IDataBaseEXCall;
    clearTable(databaseName:string,tableName:string):IDataBaseEXCall;
    //实现分页查询
    /**
     * 
     * @param offset 
     * @param fetch 
     * @param replace  比如:[] 或者{}
     */
    getPageSql(offset:number,fetch:number,replace?:string):IDataBaseEXCall;

    showColumns(databaseName:string,tableName?:string):IDataBaseEXCall;
    showConstraints(databaseName:string,tableName:string):IDataBaseEXCall;
    showIndexes(databaseName:string,tableName:string):IDataBaseEXCall;
    /**
     * 对比表对象差异，生成增量SQL
     * @param originalTable 
     * @param newTable 
     */
    generateSqlByMergeTable(originalTable:IDataBaseTable,newTable:IDataBaseTable):string;

    getChatsets(): string[];
    /**
     * get database field types
     * @returns string[]
     */
    getSupportFieldTypes(): FieldType[];


    /**
     * 
     * This method is used to generate a table object from the DDL
     * 
     * @param sql 
     */
    ddlToObj(sql: string): IDataBaseTable;
    /**
     * 
     * This method is used to generate a DDL from the table object
     * 
     * @param table 
     */
    objToDdl(table: IDataBaseTable): string;

    //标识符引用符号
    getIdentifierQuoteSymbol(): string;
   

  
}
export interface ConnectionConfig {
    name: string;
    type: DatabaseType | string;
    host: string;
    port: number;
    username: string;
    password: string;
    driver?: string;
    database?: string;
    params?: any;
}
export interface IResult {
    status: number;
    message?: string;
    data?: any;
    id?: string;
    startTime?: string;
    endTime?: string;
    progress?: number;
}
/**
 * 支持的数据库类型
 */
export enum DatabaseType {
    MySQL = "mysql",
    PostgreSQL = "postgresql",
    SQLite = "sqlite"
}
/**
 * 数据库配置接口
 */
export interface IDataSource {
    name: string;
    type: DatabaseType | string;
    host: string;
    port: number;
    username: string;
    password: string;
    driver?: string;
    database?: string;
    params?: string;
    driverPath?:string;
    driverMainClass?:string;
    driverJdbcUrl?:string;
}
export interface IDataBase {
    //数据库名称
    name: string;
    //展开
    expand?: boolean;
    //表
    tables?: IDataBaseTable[];
    tablesExpand?: boolean;
}
export interface IDataBaseTable {
    name: string;
    comment?: string;
    columns?: IDataBaseTableColumn[];
    constraints?: IDataBaseTableConstraint[];
    indexes?: IDataBaseTableIndex[];
    //展开
    expand?: boolean;
    //列展开
    columnsExpand?: boolean;
    chatset?:string;
}
export enum DataBaseTableConstraintEnum {
    PRIMARY = 'primary key',     // 主键
    UNIQUE = 'unique key',       // 唯一键
    FOREIGN = 'foreign key'     // 外键
}
export interface IDataBaseTableConstraint {
    column: string;
    type: DataBaseTableConstraintEnum | string;
    name?: string;
    refTable?: string;
    refColumn?: string;
}
export interface IDataBaseTableIndex {
    name: string;
    column: string;
}
export enum KeyType {
    NONE = 'NONE',          // 无特殊键
    PRIMARY = 'PRIMARY',     // 主键
    UNIQUE = 'UNIQUE',       // 唯一键
    FOREIGN = 'FOREIGN'     // 外键
}
export interface IDataBaseTableColumn {
    table: string;
    name: string;
    type: string;
    displayType?: string;
    comment?: string;
    isNullable?: boolean;
    defaultValue?: string | number | boolean | null;
    autoIncrement?: boolean;
    length?: number;
    scale?: number;
    position?: number;
}
export interface FieldType {
    name: string;
    catalog: FieldTypeCategory;
}
export enum FieldTypeCategory {
    /** 整数类型 (TINYINT, SMALLINT, MEDIUMINT, INT, BIGINT) */
    INTEGER = 'Integer',
    /** 精确小数类型 (DECIMAL) */
    FIXED_POINT = 'Fixed-Point',
    /** 浮点数类型 (FLOAT, DOUBLE) */
    FLOATING_POINT = 'Floating-Point',
    /** 字符串类型 (CHAR, VARCHAR) */
    STRING = 'String',
    /** 二进制数据类型 (BINARY, VARBINARY) */
    BINARY = 'Binary',
    /** 日期时间类型 (DATE, TIME, DATETIME, TIMESTAMP, YEAR) */
    DATE_AND_TIME = 'Date & Time',
    /** 位类型 (BIT) */
    BIT_VALUE = 'Bit-Value',
    /** 枚举类型 (ENUM) */
    ENUMERATION = 'Enumeration',
    /** 集合类型 (SET) */
    SET = 'Set',
    /** JSON 文档类型 (JSON) */
    JSON = 'JSON',
    /** 长文本类型 (TINYTEXT, TEXT, MEDIUMTEXT, LONGTEXT) */
    TEXT = 'Text',
    /** 二进制大对象类型 (TINYBLOB, BLOB, MEDIUMBLOB, LONGBLOB) */
    BLOB = 'BLOB'
}
