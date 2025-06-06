export interface IDataBaseEX {
    /**
     * get database name
     */
    getName(): string;
    /**
     * get database version
     */
    getVersion(): string;
    /**
     * get database field types
     * @returns string[]
     */
    getSupportFieldTypes(): FieldType[];
    /**
     * get show databases sql
     * @returns string
     */
    getDatabasesSql(): string;
    /**
     * This method is used to get the database list after executing the show databases sql
     * 
     * @param res 
     */
    getDatabasesByResult(rows: any): IDataBase[];
    /**
     * get show tables sql
     * @param databaseName
     * @returns string
     * 
     */
    getTablesSql(databaseName: string): string;
    /**
     * This method is used to get the table list after executing the show tables sql
     * 
     * @param res
     */
    getTablesByResult(rows: any): IDataBaseTable[];
    getTableInfoSql(databaseName: string, tableName: string): string;
    getTableInfoByResult(rows: any): IDataBaseTable;
    /**
     * get show columns sql
     * @param databaseName
     * @param tableName
     * @returns string
     * 
     */
    getColumnsSql(database: string, tableName: string): string;
    /**
     * This method is used to get the column list after executing the show columns sql
     * 
     * @param res
     */
    getColumnsByResult(rows: any): IDataBaseTableColumn[];
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
    getConstraintSql(databaseName: string, tableName: string): string;
    getConstraintByResult(rows: any): IDataBaseTableConstraint[];
    getIndexSql(databaseName: string, tableName: string): string;
    getIndexByResult(rows: any): IDataBaseTableIndex[];

    getChatsets(): string[];
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